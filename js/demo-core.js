/* XCPETS PLAY DEMO core (phase 1). PLAY MONEY ONLY: nothing here touches a chain, a wallet or real XCPETS.
 * The demo keeps a list of fake destroy rows (same shape as Counterparty API v2 rows, with pet: tags) and replays them
 * through the REAL GameCore.buildState, so hatching, care, stages and the Mythic evolve rule are the real game's code.
 * Pet art comes from the REAL PetCore.generate(fake block hash, fake tx hash), exactly like the live indexer's pets. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.DemoCore = factory(root.GameCore, root.PetCore);
})(this, function (GameCore, PetCore) {
  'use strict';
  var KEY = 'xcpets-play-demo-v1';
  var START = 1000000;   // play XCPETS in a fresh wallet: 1 hatch + feeding to Adult with change to spare
  var REFILL = 5000000;  // free top-up per Refill click: one refill raises a pet to Mythic
  var PLAYER = 'play-wallet';
  var GEAR_LISTS = { band: 'BANDS', armor: 'ARMORS', cape: 'CAPES', weapon: 'WEAPONS', crown: 'CROWNS' };

  function hex64(rand, zeros) {
    var s = '';
    for (var i = 0; i < 64; i++) s += Math.floor(rand() * 16).toString(16);
    return zeros ? new Array(zeros + 1).join('0') + s.slice(zeros) : s;
  }
  function fresh() { return { v: 1, balance: START, refills: 0, rows: [], blockHashes: {}, height: 900000 }; }

  function Demo(storage, rand) {
    this.storage = storage || null;
    this.rand = rand || Math.random;
    this.s = this.load();
  }
  Demo.prototype.load = function () {
    try { var raw = this.storage && this.storage.getItem(KEY); if (raw) { var s = JSON.parse(raw); if (s && s.v === 1) return s; } } catch (e) { /* corrupt: start fresh */ }
    return fresh();
  };
  Demo.prototype.save = function () { if (this.storage) this.storage.setItem(KEY, JSON.stringify(this.s)); };
  Demo.prototype.reset = function () { this.s = fresh(); this.save(); };
  Demo.prototype.refill = function () { this.s.balance = round8(this.s.balance + REFILL); this.s.refills++; this.save(); return this.s.balance; };
  Demo.prototype.balance = function () { return this.s.balance; };

  function round8(n) { return Math.round(n * 1e8) / 1e8; }
  function err(msg) { var e = new Error(msg); e.demo = true; throw e; }

  /** One fake burn: a destroy row in its own fake block, replayed by the real game rules. */
  Demo.prototype.burn = function (amount, tag) {
    amount = Number(amount);
    if (!(amount > 0) || !isFinite(amount)) err('Enter an amount above 0.');
    if (round8(amount) !== amount) err('At most 8 decimals.');
    if (amount > this.s.balance) err('Not enough play XCPETS. Hit Refill (free).');
    var h = ++this.s.height, tx = hex64(this.rand);
    this.s.blockHashes[h] = hex64(this.rand, 18);
    this.s.rows.push({ tx_hash: tx, tx_index: this.s.rows.length + 1, block_index: h, source: PLAYER, asset: 'XCPETS', status: 'valid',
      quantity: Math.round(amount * GameCore.UNIT), tag: tag || '' });
    this.s.balance = round8(this.s.balance - amount);
    this.save();
    var st = this.state(), entry = null;
    for (var i = 0; i < st.log.length; i++) if (st.log[i].tx_hash === tx) entry = st.log[i];
    return { entry: entry, state: st };
  };
  Demo.prototype.pet = function (id) { var st = this.state(); return st.pets[id - 1] || null; };

  // The demo refuses burns the real game would reject, so play money is never wasted (the real game would keep the burn).
  Demo.prototype.hatch = function (amount) {
    amount = amount == null ? GameCore.COSTS.hatch : Number(amount);
    if (amount < GameCore.COSTS.hatch) err('Hatching costs at least ' + GameCore.COSTS.hatch.toLocaleString('en-US') + ' play XCPETS.');
    var r = this.burn(amount, 'pet:hatch');
    return { pet: r.state.pets[r.entry.petId - 1], entry: r.entry };
  };
  Demo.prototype.feed = function (id, amount) {
    if (!this.pet(id)) err('No such pet.');
    if (Number(amount) < GameCore.COSTS.feedPet) err('Feeding needs at least ' + GameCore.COSTS.feedPet + ' play XCPETS.');
    var r = this.burn(amount, 'pet:feed:' + id);
    return { pet: r.state.pets[id - 1], entry: r.entry };
  };
  Demo.prototype.evolve = function (id, amount) {
    var p = this.pet(id), cost = GameCore.COSTS.evolve, need = GameCore.PET_THRESHOLDS[5];
    amount = amount == null ? cost : Number(amount);
    if (!p) err('No such pet.');
    if (p.ascended) err('Already Mythic.');
    if (amount < cost) err('Evolving costs at least ' + cost.toLocaleString('en-US') + ' play XCPETS.');
    if (p.care + amount < need) err('Needs ' + need.toLocaleString('en-US') + ' care (including this burn) to ascend. Feed it more first.');
    var r = this.burn(amount, 'pet:evolve:' + id);
    return { pet: r.state.pets[id - 1], entry: r.entry };
  };

  /** Full game state from the real indexer logic, plus art and progress for each pet. */
  Demo.prototype.state = function () {
    var st = GameCore.buildState(this.s.rows, {}), T = GameCore.PET_THRESHOLDS, bh = this.s.blockHashes;
    st.pets.forEach(function (p) {
      p.art = PetCore.generate({ blockHash: bh[p.hatchBlock], petId: p.hatchTx });
      p.next = p.stage < 4 ? T[p.stage + 1] : (p.ascended ? null : T[5]);
      p.prev = T[p.stage] || 0;
      p.progress = p.next == null ? 1 : Math.max(0, Math.min(1, (p.care - p.prev) / (p.next - p.prev)));
      p.canEvolve = !p.ascended && p.stage === 4;
      p.gear = PetCore.gearFor(p.art, p.stage).map(function (slot) {
        var list = PetCore[GEAR_LISTS[slot]] || [], id = p.art[slot], it = null;
        for (var i = 0; i < list.length; i++) if (list[i].id === id) it = list[i];
        return { slot: slot, id: id, label: it ? it.label : id };
      });
    });
    st.balance = this.s.balance; st.refills = this.s.refills;
    return st;
  };

  Demo.KEY = KEY; Demo.START = START; Demo.REFILL = REFILL; Demo.PLAYER = PLAYER;
  return Demo;
});
