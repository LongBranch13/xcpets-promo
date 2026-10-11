/* XCPETS play demo UI (play money only; no network calls). Game rules: GameCore; art: PetCore; wallet + loot: DemoCore. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return Number(n).toLocaleString('en-US', { maximumFractionDigits: 8 }); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
  // loot and fake hashes use the browser's crypto RNG; every roll is saved in the same write as its burn
  function cryptoRand() { var a = new Uint32Array(1); window.crypto.getRandomValues(a); return a[0] / 4294967296; }
  var demo = new DemoCore(window.localStorage, cryptoRand);
  var C = DemoCore.COSTS, T = DemoCore.THRESHOLDS, N = GameCore.STAGE_NAMES;
  var SLOT_LABEL = { band: 'Band', armor: 'Armor', cape: 'Cape', weapon: 'Weapon', crown: 'Crown', face: 'Face', back: 'Back', feet: 'Feet' };
  var SLOT_ICON = { band: '🎗️', armor: '🛡️', cape: '🧣', weapon: '⚔️', crown: '👑', face: '👀', back: '🚩', feet: '🪙' };

  var animated = [];
  setInterval(function () { animated.forEach(function (a) { a.f = (a.f + 1) % a.frames.length; paint(a.ctx, a.frames[a.f]); }); }, 280);
  function paint(ctx, img) { ctx.putImageData(new ImageData(new Uint8ClampedArray(img.data), 32, 32), 0, 0); }
  function show(canvas, pet, stage, gearOverride, bonusGear) {
    var frames = PetCore.renderFrames(pet, { stage: stage, gearOverride: gearOverride || {} }), ctx = canvas.getContext('2d');
    if (bonusGear && window.BonusGear) BonusGear.decorate(PetCore, pet, stage, frames, bonusGear, gearOverride);
    paint(ctx, frames[0]);
    animated = animated.filter(function (a) { return a.canvas !== canvas && document.body.contains(a.canvas); });
    animated.push({ canvas: canvas, ctx: ctx, frames: frames, f: 0 });
  }
  function speciesLabel(id) { var s = PetCore.SPECIES.filter(function (x) { return x.id === id; })[0]; return s ? s.label : id; }
  function tierOf(p) { return PetCore.TIERS[p.art.tierIndex]; }
  function itemPill(it) { return '<span class="pill tier tier-' + it.tierId + '">' + SLOT_ICON[it.slot] + ' ' + esc(it.label) + (it.species ? ' <small>(' + esc(speciesLabel(it.species)) + ' only)</small>' : '') + '</span>'; }
  function toast(html) {
    var t = document.createElement('div'); t.className = 'toast'; t.innerHTML = html; $('toasts').appendChild(t);
    setTimeout(function () { t.remove(); }, 5000);
  }
  function lootToast(d) { if (d && d.token) toast('Loot! A free roll token <span class="muted">(spend it on any unlocked slot)</span>'); }
  function rollToast(r) {
    toast('Rolled: ' + PetCore.TIERS[r.item.tier].label + ' ' + esc(r.item.label) + ' <span class="muted">(' + SLOT_LABEL[r.item.slot].toLowerCase() +
      (r.equipped ? ', equipped' : ', added to your inventory') + ')</span>');
    if (r.key) toast('Bonus! A Slot Key dropped. Use it on a pet to unlock a bonus slot (face, back, feet).');
  }

  $('rules').textContent = 'Play-demo costs: hatch ' + fmt(C.hatch) + ', feed ' + fmt(C.feedPet) + ' min, evolve ' + fmt(C.evolve) + ', gear roll ' + fmt(C.roll) +
    '. Egg to Mythic: ' + fmt(T[5]) + '. A fresh wallet starts with ' + fmt(DemoCore.START) + ' play XCPETS; Refill adds ' + fmt(DemoCore.REFILL) + ' for free.';

  function render() {
    var st = demo.state();
    $('bal').innerHTML = fmt(st.balance) + ' <small>play XCPETS</small>';
    $('tokens').textContent = st.tokens; $('keys').textContent = st.keys;
    var box = $('pets'); box.innerHTML = '';
    $('noPets').style.display = st.pets.length ? 'none' : '';
    // paginated (PAGE cards; only visible cards render/animate), filter by rarity, sort
    var ft = $('fTier').value, list = st.pets.filter(function (p) { return ft === '' || p.art.tierIndex === Number(ft); }), so = $('fSort').value;
    list.sort(so === 'tier' ? function (a, b) { return b.art.tierIndex - a.art.tierIndex || b.id - a.id; } : so === 'stage' ? function (a, b) { return b.stage - a.stage || b.id - a.id; } : function (a, b) { return b.id - a.id; });
    var pages = Math.max(1, Math.ceil(list.length / PAGE)); page = Math.min(page, pages - 1);
    animated = animated.filter(function (a) { return document.body.contains(a.canvas) && !box.contains(a.canvas); });
    list.slice(page * PAGE, page * PAGE + PAGE).forEach(function (p) { box.appendChild(petCard(p, st.inventory, st)); });
    $('petCount').textContent = list.length + ' of ' + st.pets.length + ' pets';
    $('pgInfo').textContent = 'page ' + (page + 1) + ' / ' + pages; $('pgPrev').disabled = page === 0; $('pgNext').disabled = page >= pages - 1;
    document.querySelectorAll('button.bulk').forEach(function (b) { b.disabled = DemoCore.BULK[b.dataset.bulk].price > st.balance; });
    $('hatch').disabled = C.hatch > st.balance;
    $('inv').innerHTML = st.inventory.length ? st.inventory.map(function (it) {
      return '<div class="invitem" data-uid="' + it.uid + '">' + itemPill(it) + ' <span class="muted small">' + SLOT_LABEL[it.slot] + ' · ' + PetCore.TIERS[it.tier].label +
        (it.on ? ' · worn by #' + it.on : ' · free') + '</span></div>';
    }).join('') : '<p class="muted small">No gear yet. Pick an unlocked slot on a pet and tap Roll (' + fmt(C.roll) + ') or spend a free roll token.</p>';
    var sh = st.shared;
    $('sharedBar').style.width = Math.round(sh.progress * 100) + '%';
    $('sharedTxt').textContent = 'Stage ' + sh.stageName + ' · ' + fmt(sh.burned) + ' play XCPETS burned in total' +
      (sh.next == null ? ' · fully grown' : ' · ' + fmt(sh.next - sh.burned) + ' to the next stage');
    $('log').innerHTML = st.log.slice(-50).reverse().map(function (l, i) {
      return '<tr><td>' + (st.log.length - i) + '</td><td><code>' + esc(l.tag || '(none)') + '</code></td><td>' + fmt(l.amount) + '</td><td>' + esc(l.msg) + '</td></tr>';
    }).join('');
  }

  function nextLine(p) {
    if (p.ascended) return '<b>Fully grown:</b> Mythic. Nothing left to unlock.';
    if (p.stage < 4) return '<b>Next: ' + N[p.stage + 1] + '</b> - feed ' + fmt(Math.max(0, p.next - p.care)) + ' more';
    return '<b>Next: Mythic</b> - tap Evolve (' + fmt(C.evolve) + ' play XCPETS)';
  }
  function lootLine(p) {
    var L = DemoCore.LOOT[p.stage];
    if (!L) return '<div class="small muted">Rolls: hatch first.</div>';
    var names = ['Common', 'Uncommon', 'Rare', 'Legendary'], tot = L.weights.reduce(function (a, b) { return a + b; }, 0);
    return '<div class="small loot"><b>Roll odds (' + p.stageName + '):</b> ' + L.weights.map(function (w, i) { return names[i] + ' ' + Math.round(w * 100 / tot) + '%'; }).join(' / ') +
      ' <span class="muted">(' + fmt(C.roll) + ' per roll or 1 free token; 1% Slot Key chance per roll)</span></div>';
  }
  function feedDefault(p) { return p.stage < 4 ? Math.max(C.feedPet, p.next - p.care) : DemoCore.DROP.bigFeedMin; }
  function slotHtml(sl, inv, tokens, species) {
    var label = SLOT_ICON[sl.slot] + ' ' + SLOT_LABEL[sl.slot];
    if (!sl.unlocked) return '<div class="slot locked">' + label + ': <span class="muted">' + (sl.bonus ? 'bonus slot, needs a Slot Key' : 'unlocks at ' + N[sl.unlockStage]) + '</span></div>';
    var opts = inv.filter(function (it) { return it.slot === sl.slot && (!it.species || it.species === species) && (!sl.item || it.uid !== sl.item.uid); });
    var sel = opts.length ? '<select class="pick" data-slot="' + sl.slot + '" aria-label="Pick a ' + sl.slot + '">' + opts.map(function (it) {
      return '<option value="' + it.uid + '">' + esc(it.label) + ' (' + PetCore.TIERS[it.tier].label + (it.on ? ', on #' + it.on : '') + ')</option>';
    }).join('') + '</select><button class="q equip" data-slot="' + sl.slot + '">' + (sl.item ? 'Swap' : 'Equip') + '</button>' : '';
    return '<div class="slot">' + label + ': ' + (sl.item ? itemPill(sl.item) + ' <button class="q unequip" data-slot="' + sl.slot + '">Unequip</button>' : '<span class="muted">empty</span>') +
      (sel ? ' ' + sel : '') + ' <button class="q roll" data-slot="' + sl.slot + '">Roll (' + fmt(C.roll) + ')</button>' +
      (tokens ? '<button class="q roll tok" data-slot="' + sl.slot + '">Use token</button>' : '') + '</div>';
  }
  function slotsHtml(p, inv, st) {
    var nb = p.bonusSlots.filter(function (x) { return x.unlocked; }).length;
    return p.slots.map(function (sl) { return slotHtml(sl, inv, st.tokens, p.art.species); }).join('') +
      '<div class="small muted" style="margin-top:6px"><b>Bonus slots</b> (meme gear)' + (st.keys && nb < 3 ? ' <button class="q usekey">Use Slot Key (' + st.keys + ')</button>' : '') + '</div>' +
      p.bonusSlots.map(function (sl) { return slotHtml(sl, inv, st.tokens, p.art.species); }).join('');
  }
  function petCard(p, inv, st) {
    var fedOut = p.feedsToday >= p.feedLimit, dis = fedOut ? ' disabled title="Fed ' + p.feedLimit + '/' + p.feedLimit + ' today, back tomorrow"' : '';
    var t = tierOf(p), d = document.createElement('div'); d.className = 'pet'; d.id = 'pet-' + p.id;
    var evolveHelp = p.ascended ? '' : (p.canEvolve ? 'Evolve is unlocked: one ' + fmt(C.evolve) + ' burn makes it Mythic.' : 'Evolve unlocks at Elder (' + fmt(T[4]) + ' care).');
    d.innerHTML = '<div class="top"><canvas class="pixel" width="32" height="32"></canvas><div>' +
      '<h4>' + esc(p.art.defaultName) + ' <span class="muted small">#' + p.id + '</span></h4>' +
      '<div>' + esc(speciesLabel(p.art.species)) + ' <span class="pill tier tier-' + t.id + '">' + t.label + '</span></div>' +
      '<div class="small">Stage: <b class="stg">' + p.stageName + '</b> · care <b class="care">' + fmt(p.care) + '</b></div>' +
      '<div class="bar" aria-label="progress to next stage"><i style="width:' + Math.round(p.progress * 100) + '%"></i></div>' +
      '<div class="small next">' + nextLine(p) + '</div></div></div>' +
      lootLine(p) +
      '<div class="gear"><b>Gear slots</b> <span class="muted">(stages unlock slots; pick one and Roll, or equip from your inventory)</span>' + slotsHtml(p, inv, st) + '</div>' +
      (p.ascended ? '' : '<div class="small feeds' + (fedOut ? ' err' : '') + '">' + (fedOut ? '<b>Fed ' + p.feedLimit + '/' + p.feedLimit + ' today, back tomorrow</b> (resets at local midnight)' : 'Feeds today: ' + p.feedsToday + '/' + p.feedLimit) + '</div>' +
        (p.stage < 4 ? '<div class="row"><button class="btn feed big"' + dis + '>Feed ' + fmt(feedDefault(p)) + ' (to ' + N[p.stage + 1] + ')</button></div>' : '') +
      '<div class="row" style="margin-top:8px"><input class="amt feedAmt" type="number" min="' + C.feedPet + '" step="1" value="' + feedDefault(p) + '" aria-label="Feed amount">' +
      '<button class="q" data-a="' + C.feedPet + '">' + fmt(C.feedPet) + '</button><button class="q" data-a="690">690</button><button class="q" data-a="6900">6,900</button>' +
      '<button class="btn ghost feed custom"' + dis + '>Feed amount</button></div>' +
      '<div class="row" style="margin-top:8px"><button class="btn evolve"' + (p.canEvolve ? '' : ' disabled') + '>Evolve to Mythic (' + fmt(C.evolve) + ')</button>' +
      '<span class="small muted">' + evolveHelp + '</span></div>') +
      '<div class="row" style="margin-top:8px"><button class="q release">Release pet (no refund)</button></div>' +
      '<div class="msg" aria-live="polite"></div>';
    d.querySelector('.release').onclick = function () {
      if (window.confirm('Release ' + p.art.defaultName + ' #' + p.id + '? It is deleted from the demo with no refund; its gear goes back to your inventory.')) { demo.release(p.id); render(); }
    };
    show(d.querySelector('canvas'), p.art, p.stage, p.gearOverride, p.bonusGear);
    var amt = d.querySelector('.feedAmt'), msg = d.querySelector('.msg');
    d.querySelectorAll('button.q[data-a]').forEach(function (b) { b.onclick = function () { amt.value = b.getAttribute('data-a'); }; });
    var big = d.querySelector('.feed.big');
    if (big) big.onclick = function () { act(function () { return demo.feed(p.id, feedDefault(p)); }, msg); };
    var cu = d.querySelector('.feed.custom');
    if (cu) cu.onclick = function () { act(function () { return demo.feed(p.id, Number(amt.value)); }, msg); };
    var ev = d.querySelector('.evolve');
    if (ev) ev.onclick = function () { act(function () { return demo.evolve(p.id); }, msg); };
    d.querySelectorAll('button.equip').forEach(function (b) { b.onclick = function () {
      var sel = d.querySelector('select.pick[data-slot="' + b.dataset.slot + '"]');
      gearAct(function () { demo.equip(p.id, Number(sel.value)); }, msg);
    }; });
    d.querySelectorAll('button.roll').forEach(function (b) { b.onclick = function () {
      gearAct(function () { rollToast(demo.roll(p.id, b.dataset.slot, b.classList.contains('tok'))); }, msg);
    }; });
    var uk = d.querySelector('button.usekey');
    if (uk) uk.onclick = function () { gearAct(function () { var r = demo.useKey(p.id); toast('Unlocked the ' + r.slot + ' bonus slot on #' + p.id + '.'); }, msg); };
    d.querySelectorAll('button.unequip').forEach(function (b) { b.onclick = function () { gearAct(function () { demo.unequip(p.id, b.dataset.slot); }, msg); }; });
    return d;
  }
  function gearAct(fn, msgEl) { try { fn(); render(); } catch (e) { msgEl.className = 'msg err'; msgEl.textContent = e.message; if (!e.demo) throw e; } }
  function act(fn, msgEl) {
    try { var r = fn(); render(); var m = document.querySelector('#pet-' + r.pet.id + ' .msg'); if (m) { m.className = 'msg ok'; m.textContent = r.entry.msg + ' (play money)'; } lootToast(r.drop); return r; }
    catch (e) { msgEl.className = 'msg err'; msgEl.textContent = e.message; if (!e.demo) throw e; }
  }

  document.querySelectorAll('[data-h]').forEach(function (b) { b.onclick = function () { $('hatchAmt').value = b.getAttribute('data-h'); }; });
  function doHatch() {
    var r = act(function () { return demo.hatch(Number($('hatchAmt').value)); }, $('hatchMsg'));
    if (r) { $('hatchMsg').className = 'msg ok'; $('hatchMsg').textContent = 'Hatched pet #' + r.pet.id + ' (play money).'; reveal(r.pet); }
    return r;
  }
  $('hatch').onclick = doHatch;
  var PAGE = 12, page = 0, lastBatch = null;
  $('fTier').onchange = $('fSort').onchange = function () { page = 0; render(); };
  $('pgPrev').onclick = function () { page = Math.max(0, page - 1); render(); };
  $('pgNext').onclick = function () { page++; render(); };
  document.querySelectorAll('button.bulk').forEach(function (b) { b.onclick = function () {
    try { var r = demo.hatchBulk(b.dataset.bulk); page = 0; render(); bulkReveal(r, b.dataset.bulk); }
    catch (e) { $('hatchMsg').className = 'msg err'; $('hatchMsg').textContent = e.message; if (!e.demo) throw e; }
  }; });
  function bulkReveal(r, kind) {
    lastBatch = r.pets.map(function (p) { return p.id; });
    var byT = [0, 0, 0, 0], bySp = {};
    r.pets.forEach(function (p) { byT[p.art.tierIndex]++; bySp[p.art.species] = (bySp[p.art.species] || 0) + 1; });
    $('bulkTitle').textContent = DemoCore.BULK[kind].label + ': ' + r.pets.length + ' pets hatched';
    $('bulkSummary').innerHTML = PetCore.TIERS.map(function (t, i) { return '<span class="pill tier tier-' + t.id + '">' + t.label + ' ' + byT[i] + '</span>'; }).join(' ') +
      '<br>' + Object.keys(bySp).sort(function (a, b) { return bySp[b] - bySp[a]; }).map(function (k) { return esc(speciesLabel(k)) + ' ' + bySp[k]; }).join(' · ') +
      '<br><span class="muted">Paid ' + fmt(r.paid) + ' play XCPETS' + (r.tokens ? ' · ' + r.tokens + ' free roll token' + (r.tokens > 1 ? 's' : '') + ' dropped' : '') + '</span>';
    var g = $('bulkGrid'); g.innerHTML = '';
    r.pets.slice().sort(function (a, b) { return b.art.tierIndex - a.art.tierIndex || a.id - b.id; }).forEach(function (p) {
      var c = document.createElement('div'); c.className = 'egg t' + p.art.tierIndex;
      c.innerHTML = '<canvas width="32" height="32"></canvas><div>' + esc(speciesLabel(p.art.species)) + '</div>';
      g.appendChild(c); paint(c.querySelector('canvas').getContext('2d'), PetCore.render(p.art, { stage: 1, frame: 0, gearOverride: {} })); // still image: cheap for 144
    });
    $('bulkReleaseCommons').disabled = !byT[0];
    $('bulkReleaseCommons').textContent = 'Release all ' + byT[0] + ' Commons from this batch';
    $('bulkReveal').classList.add('on');
  }
  $('bulkClose').onclick = function () { $('bulkReveal').classList.remove('on'); };
  $('bulkReleaseCommons').onclick = function () {
    var st = demo.state(), ids = (lastBatch || []).filter(function (id) { var p = st.byId[id]; return p && p.art.tierIndex === 0; });
    if (!ids.length || !window.confirm('Release ' + ids.length + ' Common pets from this batch? They are deleted with no refund.')) return;
    demo.releaseMany(ids); render(); $('bulkReveal').classList.remove('on'); toast('Released ' + ids.length + ' Commons.');
  };
  $('hatchAgain').onclick = function () { if (!doHatch()) { $('revealText').textContent = $('hatchMsg').textContent; } };
  $('revealRelease').onclick = function () { var id = Number($('reveal').dataset.pet); if (id) { demo.release(id); render(); } $('reveal').classList.remove('on'); };
  $('sharedFeed').onclick = function () {
    var m = $('sharedMsg');
    try { var r = demo.feedShared(Number($('sharedAmt').value)); render(); m.className = 'msg ok'; m.textContent = r.entry.msg + ' (play money)'; }
    catch (e) { m.className = 'msg err'; m.textContent = e.message; if (!e.demo) throw e; }
  };
  $('refill').onclick = function () { demo.refill(); render(); };
  $('reset').onclick = function () { if (window.confirm('Reset the play demo? This deletes your play pets, loot and play wallet in this browser.')) { demo.reset(); render(); } };

  function reveal(p) {
    var c = $('revealCanvas'), t = tierOf(p); $('reveal').dataset.pet = p.id;
    $('revealTitle').textContent = 'Hatching…'; $('revealText').textContent = ''; $('reveal').classList.add('on');
    show(c, p.art, 0);
    setTimeout(function () {
      show(c, p.art, p.stage === 0 ? 1 : p.stage, p.gearOverride, p.bonusGear);
      $('revealTitle').textContent = 'It\'s ' + (/^[AEIOU]/.test(t.label) ? 'an ' : 'a ') + t.label + ' ' + speciesLabel(p.art.species) + '!';
      $('revealText').textContent = p.art.defaultName + ' · pet #' + p.id + ' · ' + p.stageName;
    }, 1300);
  }
  $('revealClose').onclick = function () { $('reveal').classList.remove('on'); };
  render();
})();
