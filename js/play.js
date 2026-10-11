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
  function lootToast(d) { if (d && d.token) toast('🎟️ +1 free roll token'); }
  function rollToast(r) {
    toast('Rolled: ' + PetCore.TIERS[r.item.tier].label + ' ' + esc(r.item.label) + ' <span class="muted">(' + SLOT_LABEL[r.item.slot].toLowerCase() +
      (r.equipped ? ', equipped' : ', added to your inventory') + ')</span>');
    if (r.key) toast('🔑 +1 Slot Key');
  }


  function render() {
    var st = demo.state();
    $('bal').innerHTML = fmt(st.balance) + ' <small>play XCPETS</small>';
    $('tokens').textContent = st.tokens; $('keys').textContent = st.keys;
    var box = $('pets'); box.innerHTML = '';
    $('noPets').style.display = st.pets.length ? 'none' : '';
    // paginated (PAGE cards; only visible cards render/animate), filter by rarity, sort
    var ft = $('fTier').value, list = st.pets.filter(function (p) { return ft === '' || p.art.tierIndex === Number(ft); }), so = $('fSort').value;
    list.sort(so === 'tier' ? function (a, b) { return b.art.tierIndex - a.art.tierIndex || b.id - a.id; } : so === 'stage' ? function (a, b) { return b.stage - a.stage || b.id - a.id; } : function (a, b) { return b.id - a.id; });
    listIds = list.map(function (p) { return p.id; });
    var pages = Math.max(1, Math.ceil(list.length / PAGE)); page = Math.min(page, pages - 1);
    animated = animated.filter(function (a) { return document.body.contains(a.canvas) && !box.contains(a.canvas); });
    list.slice(page * PAGE, page * PAGE + PAGE).forEach(function (p) { box.appendChild(petCard(p)); });
    $('petCount').textContent = list.length + ' of ' + st.pets.length + ' pets';
    $('pgInfo').textContent = 'page ' + (page + 1) + ' / ' + pages; $('pgPrev').disabled = page === 0; $('pgNext').disabled = page >= pages - 1;
    document.querySelectorAll('button.bulk').forEach(function (b) { b.disabled = DemoCore.BULK[b.dataset.bulk].price > st.balance; });
    $('hatch').disabled = C.hatch > st.balance;
    $('inv').innerHTML = st.inventory.length ? st.inventory.map(function (it) {
      return '<div class="invitem" data-uid="' + it.uid + '">' + itemPill(it) + ' <span class="muted small">' + SLOT_LABEL[it.slot] + ' · ' + PetCore.TIERS[it.tier].label +
        (it.on ? ' · worn by #' + it.on : ' · free') + '</span></div>';
    }).join('') : '';
    var sh = st.shared;
    $('sharedBar').style.width = Math.round(sh.progress * 100) + '%';
    $('sharedTxt').textContent = 'Stage ' + sh.stageName + ' · ' + fmt(sh.burned) + ' play XCPETS burned in total' +
      (sh.next == null ? ' · fully grown' : ' · ' + fmt(sh.next - sh.burned) + ' to the next stage');
    renderBoard(st);
    $('log').innerHTML = st.log.slice(-50).reverse().map(function (l, i) {
      return '<tr><td>' + (st.log.length - i) + '</td><td><code>' + esc(l.tag || '(none)') + '</code></td><td>' + fmt(l.amount) + '</td><td>' + esc(l.msg) + '</td></tr>';
    }).join('');
  }

  function nextLine(p) {
    if (p.ascended) return 'Mythic';
    if (p.canEvolve) return 'Ready to evolve';
    return '→ ' + N[p.stage + 1] + ': ' + p.mealsNext + ' 🍖';
  }
  function lootLine(p) {
    if (!p.stage) return '<div class="small muted">Rolls: hatch first.</div>';
    if (!p.baseSlots) return '<div class="small muted">Common pets have no base gear slots (gear by rarity: Uncommon 2, Rare 4, Legendary 5). Bonus slots still open with a Slot Key.</div>';
    var names = ['Common', 'Uncommon', 'Rare', 'Legendary'], o = DemoCore.rarityOdds(p.art.tierIndex, 'band', p.art.species);
    return '<div class="small loot"><b>Roll odds (' + PetCore.TIERS[p.art.tierIndex].label + ' pet, ' + p.baseSlots + ' slots; band shown, items up to its rarity, own rarity 4x):</b> ' + o.map(function (w, i) { return w ? names[i] + ' ' + Math.round(w * 100) + '%' : ''; }).filter(Boolean).join(' / ') +
      ' <span class="muted">(' + fmt(C.roll) + ' per roll or 1 free token; 1% Slot Key chance per roll)</span></div>';
  }
  function slotHtml(sl, inv, tokens, species, tierIdx) {
    var label = SLOT_ICON[sl.slot] + ' ' + SLOT_LABEL[sl.slot];
    if (!sl.unlocked) return '';
    var opts = inv.filter(function (it) { return it.slot === sl.slot && (!it.species || it.species === species) && (!sl.item || it.uid !== sl.item.uid); });
    var sel = opts.length ? '<select class="pick" data-slot="' + sl.slot + '" aria-label="Pick a ' + sl.slot + '">' + opts.map(function (it) {
      return '<option value="' + it.uid + '">' + esc(it.label) + ' (' + PetCore.TIERS[it.tier].label + (it.on ? ', on #' + it.on : '') + ')</option>';
    }).join('') + '</select><button class="q equip" data-slot="' + sl.slot + '">' + (sl.item ? 'Swap' : 'Equip') + '</button>' : '';
    return '<div class="slot">' + label + ' ' + (sl.item ? itemPill(sl.item) + ' <button class="q unequip" data-slot="' + sl.slot + '">Unequip</button>' : '<span class="muted">empty</span>') +
      (sel ? ' ' + sel : '') + ' <button class="q roll" data-slot="' + sl.slot + '">Roll (' + fmt(C.roll) + ')</button>' +
      (tokens ? '<button class="q roll tok" data-slot="' + sl.slot + '">🎟️</button>' : '') + '</div>';
  }
  function slotsHtml(p, inv, st) {
    var nb = p.bonusSlots.filter(function (x) { return x.unlocked; }).length;
    return p.slots.map(function (sl) { return slotHtml(sl, inv, st.tokens, p.art.species, p.art.tierIndex); }).join('') +
      (st.keys && nb < 3 ? '<div class="small" style="margin-top:4px"><button class="q usekey">🔑 Use key (' + st.keys + ')</button></div>' : '') +
      p.bonusSlots.map(function (sl) { return slotHtml(sl, inv, st.tokens, p.art.species, p.art.tierIndex); }).join('');
  }
  function lab(list, id) { var x = (PetCore[list] || []).filter(function (q) { return q.id === id; })[0]; return x ? x.label : id; }
  function chip(txt, cls) { return '<span class="chip' + (cls ? ' ' + cls : '') + '">' + esc(txt) + '</span>'; }
  function traitChips(p) {
    var a = p.art;
    return chip('🎨 ' + lab('PALETTES', a.palette)) + chip('▦ ' + lab('PATTERNS', a.pattern)) + chip('👁 ' + lab('EYES', a.eyes)) + chip('🖼 ' + lab('BACKGROUNDS', a.background)) + (a.cheeks ? chip('☺ Blush') : '');
  }
  function gearChips(p) {
    return p.slots.concat(p.bonusSlots).filter(function (sl) { return sl.unlocked && sl.item; })
      .map(function (sl) { return '<span class="chip gearchip tier-' + sl.item.tierId + '">' + SLOT_ICON[sl.slot] + ' ' + esc(sl.item.label) + '</span>'; }).join('');
  }
  // My Pets gallery card: overview only (no actions). Click / Enter opens the detail view, where every action lives.
  function petCard(p) {
    var t = tierOf(p), d = document.createElement('div'); d.className = 'pet card'; d.id = 'pet-' + p.id;
    d.setAttribute('role', 'button'); d.tabIndex = 0; d.setAttribute('aria-label', 'Open ' + p.art.defaultName + ' #' + p.id);
    var fed = p.ascended ? '' : '<span class="chip' + (p.feedsToday >= p.feedLimit ? ' warn' : '') + '">Fed ' + p.feedsToday + '/' + p.feedLimit + '</span>';
    d.innerHTML = '<canvas class="pixel sprite" width="32" height="32"></canvas>' +
      '<div class="ov"><h4>' + esc(p.art.defaultName) + ' <span class="muted small">#' + p.id + '</span></h4>' +
      '<div class="chips">' + chip(speciesLabel(p.art.species)) + '<span class="pill tier tier-' + t.id + '">' + t.label + '</span>' + chip(p.stageName, 'stg') + fed + '</div>' +
      '<div class="bar" aria-label="progress to next stage"><i style="width:' + Math.round(p.progress * 100) + '%"></i></div>' +
      '<div class="hunger" aria-label="hunger meter" title="Hunger ' + Math.round(p.hunger * 100) + '%"><i style="width:' + Math.round(p.hunger * 100) + '%"></i></div>' +
      '<div class="chips traits">' + traitChips(p) + '</div>' +
      '<div class="chips gearchips">' + gearChips(p) + '</div></div>';
    show(d.querySelector('canvas'), p.art, p.stage, p.gearOverride, p.bonusGear);
    d.onclick = function () { openDetail(p.id); };
    d.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(p.id); } };
    return d;
  }
  // Detail view (modal): big animated sprite, attributes, roll odds and ALL actions (feed, evolve, gear, rolls, keys, release).
  var detailId = null, listIds = [];
  function stepDetail(dir) {
    var ids = listIds.length ? listIds : demo.state().pets.map(function (p) { return p.id; }), i = ids.indexOf(detailId);
    if (!ids.length) return; detailId = ids[(i + dir + ids.length) % ids.length]; renderDetail();
  }
  $('zoomPrev').onclick = function () { stepDetail(-1); }; $('zoomNext').onclick = function () { stepDetail(1); };
  function openDetail(id) { detailId = id; renderDetail(); $('zoomBox').classList.add('on'); $('zoomClose').focus(); }
  function closeZoom() { $('zoomBox').classList.remove('on'); detailId = null; }
  $('zoomClose').onclick = closeZoom;
  $('zoomBox').onclick = function (e) { if (e.target === $('zoomBox')) closeZoom(); };
  document.addEventListener('keydown', function (e) {
    if (!$('zoomBox').classList.contains('on')) return;
    if (e.key === 'Escape') closeZoom();
    else if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !/^(SELECT|INPUT)$/.test(document.activeElement.tagName)) stepDetail(e.key === 'ArrowLeft' ? -1 : 1);
  });
  function renderDetail(msgText, ok) {
    if (detailId == null) return;
    var st = demo.state(), p = st.byId[detailId];
    if (!p) { closeZoom(); return; }
    var t = tierOf(p), d = $('zoomInfo'), fedOut = p.feedsToday >= p.feedLimit, dis = fedOut ? ' disabled title="Fed ' + p.feedLimit + '/' + p.feedLimit + ' today, back tomorrow"' : '';
    $('zoomTitle').textContent = p.art.defaultName + ' #' + p.id;
    var pos = listIds.indexOf(p.id); $('zoomPos').textContent = pos >= 0 ? (pos + 1) + ' / ' + listIds.length : '';
    show($('zoomCanvas'), p.art, p.stage, p.gearOverride, p.bonusGear);
    d.innerHTML = '<div class="chips">' + chip(speciesLabel(p.art.species)) + '<span class="pill tier tier-' + t.id + '">' + t.label + '</span>' + chip(p.stageName, 'stg') + chip(fmt(p.care) + ' care') + '</div>' +
      '<div class="bar" aria-label="progress to next stage"><i style="width:' + Math.round(p.progress * 100) + '%"></i></div>' +
      '<div class="small next">' + nextLine(p) + ' · 🍖 ' + Math.round(p.hunger * 100) + '%</div>' +
      '<div class="hunger" aria-label="hunger meter"><i style="width:' + Math.round(p.hunger * 100) + '%"></i></div>' +
      '<div class="chips traits">' + traitChips(p) + '</div>' +
      (p.ascended ? '' : '<div class="row" style="margin-top:8px">' + (p.canEvolve ? '' : '<button class="btn feed big"' + dis + '>Feed (' + fmt(p.meal) + ')</button>') +
        '<button class="btn evolve"' + (p.canEvolve ? '' : ' disabled') + '>Evolve</button> <span class="small feeds' + (fedOut ? ' err' : '') + '">Fed ' + p.feedsToday + '/' + p.feedLimit + '</span></div>') +
      '<div class="gear">' + slotsHtml(p, st.inventory, st) + '</div>' + lootLine(p) +
      '<div class="row" style="margin-top:8px"><button class="q release">Release</button> <a class="small" href="how-it-works.html">How It Works</a></div>' +
      '<div class="msg" id="detailMsg" aria-live="polite"></div>';
    var msg = $('detailMsg');
    if (msgText) { msg.className = 'msg ' + (ok ? 'ok' : 'err'); msg.textContent = msgText; }
    d.querySelector('.release').onclick = function () {
      if (window.confirm('Release ' + p.art.defaultName + ' #' + p.id + '? It is deleted from the demo with no refund; its gear goes back to your inventory.')) { demo.release(p.id); closeZoom(); render(); }
    };
    var big = d.querySelector('.feed.big');
    if (big) big.onclick = function () { act(function () { return demo.feed(p.id); }, msg); };
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
    if (uk) uk.onclick = function () { gearAct(function () { var r = demo.useKey(p.id); toast('🔑 ' + r.slot + ' slot unlocked on #' + p.id); }, msg); };
    d.querySelectorAll('button.unequip').forEach(function (b) { b.onclick = function () { gearAct(function () { demo.unequip(p.id, b.dataset.slot); }, msg); }; });
  }
  function gearAct(fn, msgEl) { try { fn(); render(); renderDetail(); } catch (e) { msgEl.className = 'msg err'; msgEl.textContent = e.message; if (!e.demo) throw e; } }
  function act(fn, msgEl) {
    try { var r = fn(); render(); if (detailId != null && r.pet && r.pet.id === detailId) renderDetail(r.entry.msg, true); lootToast(r.drop); return r; }
    catch (e) { msgEl.className = 'msg err'; msgEl.textContent = e.message; if (!e.demo) throw e; }
  }

  document.querySelectorAll('[data-h]').forEach(function (b) { b.onclick = function () { $('hatchAmt').value = b.getAttribute('data-h'); }; });
  function doHatch() {
    var r = act(function () { return demo.hatch(Number($('hatchAmt').value)); }, $('hatchMsg'));
    if (r) { $('hatchMsg').className = 'msg ok'; $('hatchMsg').textContent = 'Hatched pet #' + r.pet.id + ' (play money).'; reveal(r.pet); }
    return r;
  }
  $('hatch').onclick = doHatch;
  var boardAll = false, GOOD = { 'Legendary drip': 1, 'Fire takes': 1, 'Roast mode': 1 };
  function glow(r) { return r.badges.indexOf('Legendary drip') >= 0 ? ' class="drip"' : ''; }
  function renderBoard(st) {
    var rows = demo.leaderboard(st), show = rows, cut = !boardAll && rows.length > 20;
    if (cut) show = rows.slice(0, 10).concat([null], rows.slice(-10));
    function row(r) {
      var s = r.status, info = s.kind === 'streak' ? s.streakDays + '-day streak (score ' + s.score + ')' : s.kind === 'neglected' ? s.missed + ' day' + (s.missed > 1 ? 's' : '') + ' missed' : 'no streak yet';
      return '<tr' + glow(r) + '><td>#' + r.rank + '</td><td><b>' + esc(r.name) + '</b> <span class="muted">#' + r.id + ' · ' + esc(speciesLabel(r.species)) + ' · ' + PetCore.TIERS[r.tier].label + ' · ' + r.stage + '</span>' +
        (r.flavor ? '<div class="small muted">' + esc(r.flavor) + '</div>' : '') + (r.roast ? '<div class="small">🔥 ' + esc(r.roast) + '</div>' : '') + '</td><td>' + info + '</td><td>' +
        r.badges.map(function (b) { return '<span class="badge ' + (GOOD[b] ? 'good' : 'bad') + '" title="' + esc(DemoCore.BADGES[b]) + '">' + b + '</span>'; }).join('') + '</td></tr>';
    }
    $('board').innerHTML = rows.length ? '<table class="board"><tr class="end"><td colspan="4">WAGMI</td></tr>' +
      show.map(function (r) { return r ? row(r) : '<tr class="gap"><td colspan="4">… ' + (rows.length - 20) + ' more …</td></tr>'; }).join('') +
      '<tr class="end"><td colspan="4">NGMI</td></tr></table>' : '';
    var b = $('boardAll'); b.style.display = rows.length > 20 ? '' : 'none'; b.textContent = boardAll ? 'Show top 10 and bottom 10' : 'Show all ' + rows.length;
  }
  $('boardAll').onclick = function () { boardAll = !boardAll; render(); };
  setInterval(function () { if (!document.hidden) document.querySelectorAll('.hunger').length && render(); }, 600000); // hunger drains; refresh every 10 min
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
