/* XCPETS PLAY DEMO core. PLAY MONEY ONLY: nothing here touches a chain, a wallet or real XCPETS.
 * The demo keeps a list of fake destroy rows (same shape as Counterparty API v2 rows, with pet: tags) and replays them
 * through the REAL GameCore.buildState (with the demo's cost/threshold config), so hatching, care, stages and the Mythic
 * evolve rule are the real game's code. Pet art comes from the REAL PetCore.generate(fake block hash, fake tx hash).
 * Demo-only extra: gear is LOOT. Stages unlock slots; items drop rarely and are equipped by the player. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.DemoCore = factory(root.GameCore, root.PetCore, root.BonusGear);
})(this, function (GameCore, PetCore, BonusGear) {
  'use strict';
  var KEY = 'xcpets-play-demo-v3'; // v3 = the 69,000 curve; v2 saves (old 1,000,000 amounts) are ignored and the old key is removed
  var START = 69000;     // play XCPETS in a fresh wallet = exactly one pet Egg to Mythic under the demo curve
  var REFILL = 345000;   // free top-up per Refill click
  var PLAYER = 'play-wallet';
  // PLAY DEMO rules only (the real game keeps GameCore.COSTS / PET_THRESHOLDS / COMMUNITY_THRESHOLDS).
  // Everything is the earlier 1M curve x 0.069. Hatch 69 (straight to Hatchling, cheap rerolls), Juvenile +10,350 (10,419),
  // Adult +13,800 (24,219), Elder +17,250 (41,469), and Mythic is the 27,531 evolve burn at Elder (game-core adds the evolve
  // burn to care before checking: 41,469 + 27,531 = 69,000). Egg to Mythic = 69,000.
  // play/name are unused by the demo UI; scaled too and rounded to whole units (34.5 -> 35, 172.5 -> 173).
  var DEMO_COSTS = { hatch: 69, feed: 7, feedPet: 7, play: 35, name: 173, evolve: 27531, roll: 345 };
  var DEMO_THRESHOLDS = [0, 69, 10419, 24219, 41469, 69000];
  // Shared pet: 3x a personal pet, evenly 41,400 per stage, ascends on its own at 207,000 (no evolve burn).
  // Like the real game, EVERY valid play burn counts toward it.
  var DEMO_SHARED = [0, 41400, 82800, 124200, 165600, 207000];
  var RULES = { costs: DEMO_COSTS, petThresholds: DEMO_THRESHOLDS, communityThresholds: DEMO_SHARED };
  // Loot: slots unlock by stage (slot k at stage k+1); drops: 25% per stage-up action, 2% per feed of >= 690, max 1 per action.
  var SLOTS = ['band', 'armor', 'cape', 'weapon', 'crown'];
  var LISTS = { band: 'BANDS', armor: 'ARMORS', cape: 'CAPES', weapon: 'WEAPONS', crown: 'CROWNS' };
  // SLOT ROLL: the player picks an unlocked slot and pays DEMO_COSTS.roll (or spends a free roll token) to roll one item for it.
  // Free roll tokens: 25% per stage-up action, 2% per feed of >= 690 (max 1 per action). Each roll: 1% chance of a Slot Key.
  // A Slot Key permanently unlocks the pet's next bonus slot: face, then back, then feet (demo-only meme gear, see bonus-gear.js).
  var DROP = { stageUp: 0.25, bigFeed: 0.02, bigFeedMin: 690, key: 0.01 };
  var BONUS = ['face', 'back', 'feet'];
  // Bulk egg buys: each egg is its own pet:hatch burn row of the normal 69 (so it hatches straight to Hatchling under the real
  // rules); the pack discount is a play-money rebate on the wallet. Dozen = 12 for the price of 10; Case = a gross (144).
  var BULK = { dozen: { n: 12, price: 690, label: 'Dozen eggs' }, case: { n: 144, price: 6900, label: 'Case of eggs' } };
  // Extra (overlay) gear from bonus-gear.js: the bonus-slot items plus shared/signature items for the base slots.
  // Signature items (species set) roll and equip only on their own species.
  var EXTRA = (BonusGear && BonusGear.ITEMS) || [];
  var BONUS_ITEMS = EXTRA.filter(function (x) { return BONUS.indexOf(x.slot) >= 0; });
  function extraFor(slot, species) { return EXTRA.filter(function (x) { return x.slot === slot && (!x.species || x.species === species); }); }
  // Rarity odds per stage of the ROLLING pet, weights [Common, Uncommon, Rare, Legendary] (missing = 0).
  // Equipping only needs the slot unlocked on the wearer.
  var LOOT = [null,
    { slots: 1, weights: [100] },             // Hatchling: band, Common only
    { slots: 2, weights: [80, 20] },          // Juvenile: band, armor
    { slots: 3, weights: [70, 22, 8] },       // Adult: + cape, up to Rare
    { slots: 4, weights: [68, 22, 8, 2] },    // Elder: + weapon, up to Legendary
    { slots: 5, weights: [60, 25, 11, 4] }];  // Mythic: all 5 incl. crown, better odds

  function hex64(rand, zeros) {
    var s = '';
    for (var i = 0; i < 64; i++) s += Math.floor(rand() * 16).toString(16);
    return zeros ? new Array(zeros + 1).join('0') + s.slice(zeros) : s;
  }
  function fresh() { return { v: 3, balance: START, refills: 0, rows: [], blockHashes: {}, height: 900000, inv: [], equip: {}, nextUid: 1, drops: [], released: [], tokens: 0, keys: 0, bonus: {} }; }

  var artCache = {}; // hatchTx -> generated traits (pure function of the seed, so safe to share)
  // Feeding limit: each personal pet can be fed FEEDS_PER_DAY times per local calendar day (resets at local midnight).
  // Only pet:feed:ID burns count (Feed button + Feed amount); evolve, hatch, gear rolls and shared-pet feeds don't.
  var FEEDS_PER_DAY = 3;
  function dayKey(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); } // local date
  function Demo(storage, rand, now) {
    this.storage = storage || null;
    this.rand = rand || Math.random;
    this.now = now || function () { return new Date(); };
    this.s = this.load();
  }
  Demo.prototype.load = function () {
    try {
      var raw = this.storage && this.storage.getItem(KEY);
      if (raw) { var s = JSON.parse(raw); if (s && s.v === 3) return s; }
      // v2 saves used the old 1,000,000 curve: drop them (balances/care would be ~14x off) and start a fresh 69,000 wallet
      if (this.storage && this.storage.removeItem && this.storage.getItem('xcpets-play-demo-v2') != null) this.storage.removeItem('xcpets-play-demo-v2');
    } catch (e) { /* corrupt: start fresh */ }
    return fresh();
  };
  Demo.prototype.save = function () { if (this.storage) this.storage.setItem(KEY, JSON.stringify(this.s)); };
  Demo.prototype.reset = function () { this.s = fresh(); this.save(); };
  Demo.prototype.refill = function () { this.s.balance = round8(this.s.balance + REFILL); this.s.refills++; this.save(); return this.s.balance; };
  Demo.prototype.balance = function () { return this.s.balance; };

  function round8(n) { return Math.round(n * 1e8) / 1e8; }
  function err(msg) { var e = new Error(msg); e.demo = true; throw e; }

  function pickTier(rand, w) {
    var tot = 0, i, r; for (i = 0; i < w.length; i++) tot += w[i];
    r = rand() * tot; for (i = 0; i < w.length; i++) { if (r < w[i]) return i; r -= w[i]; }
    return w.length - 1;
  }
  /** Roll one item for a chosen slot at a pet stage: rarity from the stage odds, then a uniform variant of that rarity.
   *  Base slots use pet-core's variant tables (every rarity exists). Bonus slots have few items: if the rolled rarity has
   *  none in that slot, the nearest LOWER rarity is used, else the slot's lowest-rarity item. */
  Demo.prototype.rollItem = function (stage, slot, species) {
    var L = LOOT[Math.max(1, Math.min(5, stage || 1))], tier = pickTier(this.rand, L.weights), pool, all, t;
    var extra = extraFor(slot, species);
    if (BONUS.indexOf(slot) >= 0) {
      all = extra; t = tier; pool = [];
      while (t >= 0 && !pool.length) { pool = all.filter(function (x) { return x.tier === t; }); if (!pool.length) t--; } // eslint-disable-line no-loop-func
      if (!pool.length) { t = Math.min.apply(null, all.map(function (x) { return x.tier; })); pool = all.filter(function (x) { return x.tier === t; }); }
      tier = t;
    } else {
      if (SLOTS.indexOf(slot) < 0) err('Unknown slot.');
      // base slot: pet-core variants of that rarity + extra (shared/own-species signature) items of that rarity, all equally likely
      pool = PetCore[LISTS[slot]].filter(function (x) { return x.t === tier; }).map(function (x) { return { id: x.id, label: x.label }; })
        .concat(extra.filter(function (x) { return x.tier === tier; }));
    }
    var it = pool[Math.floor(this.rand() * pool.length)];
    return { uid: this.s.nextUid++, slot: slot, id: it.id, label: it.label, tier: tier, tierId: PetCore.TIERS[tier].id,
      bonus: BONUS.indexOf(slot) >= 0, overlay: !!(BonusGear && BonusGear.DEFS && BonusGear.DEFS[it.id]), species: it.species || null };
  };
  /** Per-roll odds of every item a pet of `species` can get in `slot` at `stage` (for docs/tests). */
  Demo.rollOdds = function (stage, slot, species) {
    var w = LOOT[stage].weights, tot = w.reduce(function (x, y) { return x + y; }, 0), out = {}, extra = extraFor(slot, species);
    w.forEach(function (wt, tier) {
      if (!wt) return;
      var pool;
      if (BONUS.indexOf(slot) >= 0) {
        var t = tier; pool = [];
        while (t >= 0 && !pool.length) { pool = extra.filter(function (x) { return x.tier === t; }); if (!pool.length) t--; } // eslint-disable-line no-loop-func
        if (!pool.length) { t = Math.min.apply(null, extra.map(function (x) { return x.tier; })); pool = extra.filter(function (x) { return x.tier === t; }); }
      } else pool = PetCore[LISTS[slot]].filter(function (x) { return x.t === tier; }).concat(extra.filter(function (x) { return x.tier === tier; }));
      pool.forEach(function (x) { out[x.id] = (out[x.id] || 0) + wt / tot / pool.length; });
    });
    return out;
  };
  function speciesName(id) { var x = PetCore.SPECIES.filter(function (q) { return q.id === id; })[0]; return x ? x.label : id; }
  function slotOpen(s, p, slot) {
    var k = SLOTS.indexOf(slot);
    if (k >= 0) return k < p.stage;
    k = BONUS.indexOf(slot);
    return k >= 0 && k < ((s.bonus || {})[p.id] || 0);
  }
  function slotErr(p, slot) {
    var k = SLOTS.indexOf(slot);
    return k >= 0 ? 'The ' + slot + ' slot unlocks at ' + GameCore.STAGE_NAMES[k + 1] + '.' : 'The ' + slot + ' bonus slot needs a Slot Key.';
  }
  /** SLOT ROLL: pay DEMO_COSTS.roll play XCPETS (a fake burn that, like any plain burn, feeds the shared pet) or spend a free
   *  roll token, and roll an item for an unlocked slot of pet id. The item goes to the inventory and is auto-equipped when the
   *  slot is empty. 1% chance of a bonus Slot Key. Burn, roll and key are saved in ONE write. */
  Demo.prototype.roll = function (id, slot, useToken) {
    var p = this.pet(id);
    if (!p) err('No such pet.');
    if (!slotOpen(this.s, p, slot)) err(slotErr(p, slot));
    var tx = null;
    if (useToken) {
      if (!(this.s.tokens > 0)) err('No free roll tokens.');
      this.s.tokens--;
    } else {
      if (DEMO_COSTS.roll > this.s.balance) err('Not enough play XCPETS. Hit Refill (free).');
      tx = this.addRow(DEMO_COSTS.roll, 'demo:roll:' + id + ':' + slot);
    }
    var it = this.grant(this.rollItem(p.stage, slot, p.art.species)), key = this.rand() < DROP.key;
    if (key) this.s.keys = (this.s.keys || 0) + 1;
    var eq = (this.s.equip[id] = this.s.equip[id] || {}), auto = eq[slot] == null;
    if (auto) eq[slot] = it.uid;
    this.s.drops.push({ uid: it.uid, tx: tx, roll: true, key: key });
    this.save();
    return { pet: this.pet(id), item: it, key: key, equipped: auto, token: !!useToken };
  };
  /** Use a Slot Key on pet id: permanently unlocks its next bonus slot (face, back, feet). */
  Demo.prototype.useKey = function (id) {
    var p = this.pet(id);
    if (!p) err('No such pet.');
    if (!(this.s.keys > 0)) err('No Slot Keys.');
    var b = (this.s.bonus = this.s.bonus || {}), n = b[id] || 0;
    if (n >= BONUS.length) err('All bonus slots are already unlocked.');
    b[id] = n + 1; this.s.keys--;
    this.save();
    return { pet: this.pet(id), slot: BONUS[n] };
  };
  Demo.prototype.grant = function (item) { this.s.inv.push(item); return item; };

  Demo.prototype.addRow = function (amount, tag) {
    var h = ++this.s.height, tx = hex64(this.rand);
    this.s.blockHashes[h] = hex64(this.rand, 18);
    this.s.rows.push({ tx_hash: tx, tx_index: this.s.rows.length + 1, block_index: h, source: PLAYER, asset: 'XCPETS', status: 'valid',
      quantity: Math.round(amount * GameCore.UNIT), tag: tag || '' });
    this.s.balance = round8(this.s.balance - amount);
    return tx;
  };
  /** One fake burn plus its loot roll, saved together in ONE write (a reload can't re-roll a drop). */
  Demo.prototype.burn = function (amount, tag, petId) {
    amount = Number(amount);
    if (!(amount > 0) || !isFinite(amount)) err('Enter an amount above 0.');
    if (round8(amount) !== amount) err('At most 8 decimals.');
    if (amount > this.s.balance) err('Not enough play XCPETS. Hit Refill (free).');
    var before = petId != null ? (this.pet(petId) || { stage: 0 }).stage : 0;
    var tx = this.addRow(amount, tag);
    var st = this.state(), entry = null, i;
    for (i = 0; i < st.log.length; i++) if (st.log[i].tx_hash === tx) entry = st.log[i];
    var pid = entry && entry.petId, pp = pid ? st.byId[pid] : null, after = pp ? pp.stage : 0, drop = null;
    if (entry && entry.kind === 'hatch' && pid) (this.s.lastFed = this.s.lastFed || {})[pid] = +this.now();
    if (pid && !pp) pid = null;
    var chance = (pid && after > before) ? DROP.stageUp : ((pid && /^pet:feed:/.test(tag) && amount >= DROP.bigFeedMin) ? DROP.bigFeed : 0);
    if (chance && this.rand() < chance) { this.s.tokens = (this.s.tokens || 0) + 1; drop = { token: true }; this.s.drops.push({ token: true, tx: tx }); }
    this.save();
    if (drop) st = this.state();
    return { entry: entry, state: st, drop: drop };
  };
  Demo.prototype.pet = function (id) { var st = this.state(); for (var i = 0; i < st.pets.length; i++) if (st.pets[i].id === id) return st.pets[i]; return null; };
  /** Release (delete) a pet from the demo: no refund. Its equipped items go back to the inventory. Pet ids stay stable. */
  Demo.prototype.release = function (id) {
    if (!this.pet(id)) err('No such pet.');
    (this.s.released = this.s.released || []).push(id);
    delete this.s.equip[id];
    this.save();
  };

  // The demo refuses burns the real game would reject, so play money is never wasted (the real game would keep the burn).
  Demo.prototype.hatch = function (amount) {
    amount = amount == null ? DEMO_COSTS.hatch : Number(amount);
    if (amount < DEMO_COSTS.hatch) err('Hatching costs at least ' + DEMO_COSTS.hatch.toLocaleString('en-US') + ' play XCPETS.');
    var r = this.burn(amount, 'pet:hatch', null);
    return { pet: r.state.byId[r.entry.petId], entry: r.entry, drop: r.drop };
  };
  Demo.prototype.feedsToday = function (id) {
    var f = (this.s.feedDays || {})[id];
    return f && f.day === dayKey(this.now()) ? f.n : 0;
  };
  Demo.prototype.feed = function (id, amount) {
    if (!this.pet(id)) err('No such pet.');
    var today = dayKey(this.now()), used = this.feedsToday(id);
    if (used >= FEEDS_PER_DAY) err('Fed ' + FEEDS_PER_DAY + '/' + FEEDS_PER_DAY + ' today, back tomorrow.');
    if (Number(amount) < DEMO_COSTS.feedPet) err('Feeding needs at least ' + DEMO_COSTS.feedPet + ' play XCPETS.');
    (this.s.feedDays = this.s.feedDays || {})[id] = { day: today, n: used + 1 }; // saved by burn() in the same write
    var log = ((this.s.feedLog = this.s.feedLog || {})[id] = this.s.feedLog[id] || {}), prevLog = log[today], prevLast = (this.s.lastFed = this.s.lastFed || {})[id];
    log[today] = used + 1; this.s.lastFed[id] = +this.now();
    var r;
    try { r = this.burn(amount, 'pet:feed:' + id, id); } catch (e) { this.s.feedDays[id] = { day: today, n: used }; if (prevLog) log[today] = prevLog; else delete log[today]; this.s.lastFed[id] = prevLast; throw e; }
    r.state.byId[id].feedsToday = used + 1;
    return { pet: r.state.byId[id], entry: r.entry, drop: r.drop };
  };
  Demo.prototype.evolve = function (id, amount) {
    var p = this.pet(id), cost = DEMO_COSTS.evolve, need = DEMO_THRESHOLDS[5];
    amount = amount == null ? cost : Number(amount);
    if (!p) err('No such pet.');
    if (p.ascended) err('Already Mythic.');
    if (amount < cost) err('Evolving costs at least ' + cost.toLocaleString('en-US') + ' play XCPETS.');
    if (p.care + amount < need) err('Needs ' + (need - cost).toLocaleString('en-US') + ' care before the ' + cost.toLocaleString('en-US') + ' evolve burn. Feed it more first.');
    var r = this.burn(amount, 'pet:evolve:' + id, id);
    return { pet: r.state.byId[id], entry: r.entry, drop: r.drop };
  };
  /** Bulk hatch: n independent eggs (fresh fake block hash + burn id each), ONE save. Each egg is a stage-up (Egg -> Hatchling),
   *  so each rolls its own 25% free-token chance. Returns the new pets (in order) and the batch id. */
  Demo.prototype.hatchBulk = function (kind) {
    var b = BULK[kind];
    if (!b) err('Unknown pack.');
    if (b.price > this.s.balance) err('Not enough play XCPETS for a ' + b.label.toLowerCase() + ' (' + b.price.toLocaleString('en-US') + '). Hit Refill (free).');
    var txs = [], i, tokens = 0;
    for (i = 0; i < b.n; i++) txs.push(this.addRow(DEMO_COSTS.hatch, 'pet:hatch'));
    this.s.balance = round8(this.s.balance + b.n * DEMO_COSTS.hatch - b.price); // pack discount = rebate
    for (i = 0; i < b.n; i++) if (this.rand() < DROP.stageUp) { tokens++; this.s.drops.push({ token: true, tx: txs[i] }); }
    this.s.tokens = (this.s.tokens || 0) + tokens;
    var st = this.state(), byTx = {};
    st.pets.forEach(function (p) { byTx[p.hatchTx] = p; });
    var pets = txs.map(function (t) { return byTx[t]; }).filter(Boolean), lf = (this.s.lastFed = this.s.lastFed || {}), nowMs = +this.now();
    pets.forEach(function (p) { lf[p.id] = nowMs; });
    (this.s.batches = this.s.batches || []).push({ kind: kind, ids: pets.map(function (p) { return p.id; }) });
    this.save();
    return { pets: pets, tokens: tokens, batch: this.s.batches.length - 1, paid: b.price };
  };
  /** Release several pets in one save (no refund; their gear returns to the inventory). */
  Demo.prototype.releaseMany = function (ids) {
    var rel = (this.s.released = this.s.released || []), live = {}, self = this;
    this.state().pets.forEach(function (p) { live[p.id] = 1; });
    ids.forEach(function (id) { if (live[id] && rel.indexOf(id) < 0) { rel.push(id); delete self.s.equip[id]; } });
    this.save();
  };

  // ---------------------------------------------------------------- WAGMI to NGMI power ranking (cosmetic only)
  var DAY = 86400000;
  var SHITPOSTS = ['found a suspicious hat', 'argued with a pigeon', 'declared itself a final boss', 'started a thread about its feeding schedule',
    'tried to trade its own tail on the DEX', 'subtweeted the shared pet', 'mistook a chart for a snack', 'held an AMA nobody asked for'];
  var ROASTS = ['{n} has been fed less often than a dead memecoin', '{n} called the top and then fell asleep', '{n}\'s streak is a rug pull',
    '{n} is down bad and eating air', '{n} thinks "gm" counts as a meal'];
  function midnight(t) { var d = new Date(t); d.setHours(0, 0, 0, 0); return d; }
  function dayDiff(a, b) { return Math.round((midnight(a) - midnight(b)) / DAY); } // calendar days (DST-safe rounding)
  function hash(str) { var h = 2166136261; for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  /** Status of one pet: streak (consecutive fed days ending today, or yesterday if not fed yet today; a full 3/3 day counts 1.5),
   *  days since the last meal (a hatch counts as the first meal), hunger 1 -> 0 over 24 h since the last meal. */
  Demo.prototype.petStatus = function (p) {
    var now = +this.now(), log = (this.s.feedLog || {})[p.id] || {}, last = (this.s.lastFed || {})[p.id], d, k, days = 0, score = 0;
    if (last == null) last = now;
    for (d = log[dayKey(new Date(now))] ? 0 : 1; d < 3660; d++) {
      var t = new Date(now); t.setDate(t.getDate() - d); k = dayKey(t);
      if (!log[k]) break;
      days++; score += log[k] >= FEEDS_PER_DAY ? 1.5 : 1;
    }
    var since = dayDiff(now, last), kind = days > 0 ? 'streak' : (since >= 2 ? 'neglected' : 'neutral');
    return { streakDays: days, score: score, daysSince: since, lastFed: last, kind: kind, hunger: Math.max(0, Math.min(1, 1 - (now - last) / DAY)) };
  };
  Demo.BADGES = {
    'Legendary drip': 'Legendary pet, or 3+ Rare/Legendary gear items equipped',
    'Fire takes': 'streak of 7+ days', 'Roast mode': 'streak of 3+ days (roasts another pet in this browser by name)',
    'Shitpost encounters': '2 days since the last meal', 'Flop era': '3-6 days since the last meal', 'Cursed tweet thread': '7+ days since the last meal'
  };
  /** One ranking, WAGMI (top) to NGMI (bottom): streaks by score (desc), then neutral pets, then neglected pets by days since
   *  the last meal (asc), so the most neglected pet is dead last. */
  Demo.prototype.leaderboard = function (st) {
    st = st || this.state();
    var self = this, today = dayKey(this.now());
    var rows = st.pets.map(function (p) {
      var x = self.petStatus(p), badges = [], flavor = null, eq = p.slots.concat(p.bonusSlots).filter(function (sl) { return sl.unlocked && sl.item && sl.item.tier >= 2; }).length;
      if (p.art.tierIndex === 3 || eq >= 3) badges.push('Legendary drip');
      if (x.streakDays >= 7) badges.push('Fire takes');
      if (x.streakDays >= 3) badges.push('Roast mode');
      if (x.kind === 'neglected') badges.push(x.daysSince >= 7 ? 'Cursed tweet thread' : x.daysSince >= 3 ? 'Flop era' : 'Shitpost encounters');
      if (badges.indexOf('Shitpost encounters') >= 0) flavor = p.art.defaultName + ' ' + SHITPOSTS[hash(p.id + ':' + today) % SHITPOSTS.length] + '.';
      return { id: p.id, name: p.art.defaultName, species: p.art.species, tier: p.art.tierIndex, stage: p.stageName, status: x, badges: badges, flavor: flavor };
    });
    var grp = { streak: 0, neutral: 1, neglected: 2 };
    rows.sort(function (a, b) {
      var g = grp[a.status.kind] - grp[b.status.kind];
      if (g) return g;
      if (a.status.kind === 'streak') return b.status.score - a.status.score || b.status.streakDays - a.status.streakDays || a.id - b.id;
      if (a.status.kind === 'neglected') return a.status.daysSince - b.status.daysSince || a.id - b.id;
      return a.id - b.id;
    });
    // Roast mode: roast another pet by name (the lowest-ranked other pet; rotates templates by day)
    rows.forEach(function (r) {
      if (r.badges.indexOf('Roast mode') < 0) return;
      for (var i = rows.length - 1; i >= 0; i--) if (rows[i].id !== r.id) { r.roast = r.name + ': "' + ROASTS[hash(r.id + ':' + today) % ROASTS.length].replace('{n}', rows[i].name) + '"'; break; }
    });
    rows.forEach(function (r, i) { r.rank = i + 1; });
    return rows;
  };
  Demo.SHITPOSTS = SHITPOSTS; Demo.ROASTS = ROASTS;

  /** Plain feed of the shared pet (tag pet:feed, real-game feed minimum). No loot. */
  Demo.prototype.feedShared = function (amount) {
    if (Number(amount) < DEMO_COSTS.feed) err('Feeding needs at least ' + DEMO_COSTS.feed + ' play XCPETS.');
    var r = this.burn(amount, 'pet:feed', null);
    return { shared: r.state.shared, entry: r.entry };
  };

  // ---------------------------------------------------------------- equipping
  function item(s, uid) { for (var i = 0; i < s.inv.length; i++) if (s.inv[i].uid === uid) return s.inv[i]; return null; }
  function holder(s, uid) { for (var pid in s.equip) if ((s.released || []).indexOf(+pid) < 0) for (var sl in s.equip[pid]) if (s.equip[pid][sl] === uid) return { pet: +pid, slot: sl }; return null; }
  /** Put inventory item uid into its slot on pet id. The slot must be unlocked by the pet's stage. An item lives on one pet
   *  at a time: if it is on another pet it moves here; whatever was in this slot goes back to the inventory (swap). */
  Demo.prototype.equip = function (id, uid) {
    var p = this.pet(id), it = item(this.s, uid);
    if (!p) err('No such pet.');
    if (!it) err('You don\'t own that item.');
    if (it.species && it.species !== p.art.species) err('Only a ' + speciesName(it.species) + ' can wear the ' + it.label + '.');
    if (!slotOpen(this.s, p, it.slot)) err(slotErr(p, it.slot));
    var h = holder(this.s, uid);
    if (h) delete this.s.equip[h.pet][h.slot];
    (this.s.equip[id] = this.s.equip[id] || {})[it.slot] = uid;
    this.save();
    return this.pet(id);
  };
  Demo.prototype.unequip = function (id, slot) {
    if (!this.s.equip[id] || this.s.equip[id][slot] == null) err('Nothing equipped there.');
    delete this.s.equip[id][slot];
    this.save();
    return this.pet(id);
  };
  Demo.prototype.inventory = function () {
    var s = this.s;
    return s.inv.map(function (it) { var h = holder(s, it.uid); return Object.assign({}, it, { on: h ? h.pet : null }); });
  };

  /** Full game state from the real indexer logic, plus art, progress, slots and equipped loot for each pet. */
  Demo.prototype.state = function () {
    var self0 = this, today = dayKey(this.now()), st = GameCore.buildState(this.s.rows, RULES), T = DEMO_THRESHOLDS, bh = this.s.blockHashes, s = this.s, rel = s.released || [];
    st.pets = st.pets.filter(function (p) { return rel.indexOf(p.id) < 0; });
    st.byId = {};
    st.pets.forEach(function (p) {
      var ck = p.hatchTx; p.art = artCache[ck] || (artCache[ck] = PetCore.generate({ blockHash: bh[p.hatchBlock], petId: p.hatchTx }));
      p.next = p.stage < 4 ? T[p.stage + 1] : (p.ascended ? null : T[5] - DEMO_COSTS.evolve); // at Elder: care to feed before evolving
      p.prev = T[p.stage] || 0;
      p.progress = (p.next == null || p.next <= p.prev) ? 1 : Math.max(0, Math.min(1, (p.care - p.prev) / (p.next - p.prev)));
      p.canEvolve = !p.ascended && p.stage === 4;
      st.byId[p.id] = p;
      var fd = (s.feedDays || {})[p.id]; p.feedsToday = fd && fd.day === today ? fd.n : 0; p.feedLimit = FEEDS_PER_DAY;
      var lfm = (s.lastFed || {})[p.id]; if (lfm == null) { (s.lastFed = s.lastFed || {})[p.id] = +self0.now(); } // older saves: start the clock now
      p.hunger = Math.max(0, Math.min(1, 1 - (+self0.now() - s.lastFed[p.id]) / 86400000));
      var eq = s.equip[p.id] || {};
      p.slots = SLOTS.map(function (slot, k) { var it = eq[slot] != null ? item(s, eq[slot]) : null; return { slot: slot, unlocked: k < p.stage, unlockStage: k + 1, item: it }; });
      var nb = (s.bonus || {})[p.id] || 0;
      p.bonusSlots = BONUS.map(function (slot, k) { var it = eq[slot] != null ? item(s, eq[slot]) : null; return { slot: slot, unlocked: k < nb, bonus: true, item: it }; });
      // pet-core variants go to gearOverride; overlay items (bonus + shared/signature extras) to extraGear for bonus-gear.js
      p.gearOverride = {}; p.extraGear = {};
      p.slots.concat(p.bonusSlots).forEach(function (sl) { if (sl.unlocked && sl.item) (sl.item.overlay || sl.bonus ? p.extraGear : p.gearOverride)[sl.slot] = sl.item.id; });
      p.bonusGear = p.extraGear;
    });
    var c = st.community, cp = DEMO_SHARED[c.stage] || 0;
    st.shared = { burned: c.burned, stage: c.stage, stageName: c.stageName, next: c.next,
      progress: c.next == null ? 1 : Math.max(0, Math.min(1, (c.burned - cp) / (c.next - cp))) };
    st.log.forEach(function (l) { var m = /^demo:roll:(\d+):(\w+)$/.exec(l.tag || ''); if (m) { l.msg = 'slot roll for pet #' + m[1] + ' (' + m[2] + '); also feeds the shared pet'; l.petId = +m[1]; } });
    st.tokens = s.tokens || 0; st.keys = s.keys || 0;
    st.balance = s.balance; st.refills = s.refills; st.inventory = this.inventory();
    return st;
  };

  Demo.COSTS = DEMO_COSTS; Demo.THRESHOLDS = DEMO_THRESHOLDS; Demo.SHARED = DEMO_SHARED; Demo.SLOTS = SLOTS; Demo.DROP = DROP; Demo.LOOT = LOOT; Demo.BONUS = BONUS; Demo.BONUS_ITEMS = BONUS_ITEMS; Demo.EXTRA = EXTRA; Demo.BULK = BULK; Demo.FEEDS_PER_DAY = FEEDS_PER_DAY;
  Demo.KEY = KEY; Demo.START = START; Demo.REFILL = REFILL; Demo.PLAYER = PLAYER;
  return Demo;
});
