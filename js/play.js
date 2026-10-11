/* XCPETS play demo UI (play money only; no network calls). Game rules: GameCore; art: PetCore; wallet: DemoCore. */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return Number(n).toLocaleString('en-US', { maximumFractionDigits: 8 }); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return '&#' + c.charCodeAt(0) + ';'; }); }
  var demo = new DemoCore(window.localStorage);
  var C = GameCore.COSTS, T = GameCore.PET_THRESHOLDS;

  var animated = [];
  setInterval(function () { animated.forEach(function (a) { a.f = (a.f + 1) % a.frames.length; paint(a.ctx, a.frames[a.f]); }); }, 280);
  function paint(ctx, img) { ctx.putImageData(new ImageData(new Uint8ClampedArray(img.data), 32, 32), 0, 0); }
  function show(canvas, pet, stage) {
    var frames = PetCore.renderFrames(pet, { stage: stage }), ctx = canvas.getContext('2d');
    paint(ctx, frames[0]);
    animated = animated.filter(function (a) { return a.canvas !== canvas && document.body.contains(a.canvas); });
    animated.push({ canvas: canvas, ctx: ctx, frames: frames, f: 0 });
  }
  function speciesLabel(id) { var s = PetCore.SPECIES.filter(function (x) { return x.id === id; })[0]; return s ? s.label : id; }
  function tierOf(p) { return PetCore.TIERS[p.art.tierIndex]; }

  $('rules').textContent = 'Costs (same as the real game): hatch ' + fmt(C.hatch) + ', feed ' + fmt(C.feedPet) + ' min, evolve ' + fmt(C.evolve) +
    '. A fresh wallet starts with ' + fmt(DemoCore.START) + ' play XCPETS; Refill adds ' + fmt(DemoCore.REFILL) + ' for free.';

  function render() {
    var st = demo.state();
    $('bal').innerHTML = fmt(st.balance) + ' <small>play XCPETS</small>';
    var box = $('pets'); box.innerHTML = '';
    $('noPets').style.display = st.pets.length ? 'none' : '';
    st.pets.slice().reverse().forEach(function (p) { box.appendChild(petCard(p)); });
    $('log').innerHTML = st.log.slice().reverse().map(function (l, i) {
      return '<tr><td>' + (st.log.length - i) + '</td><td><code>' + esc(l.tag || '(none)') + '</code></td><td>' + fmt(l.amount) + '</td><td>' + esc(l.msg) + '</td></tr>';
    }).join('');
  }

  function petCard(p) {
    var t = tierOf(p), d = document.createElement('div'); d.className = 'pet'; d.id = 'pet-' + p.id;
    var nextTxt = p.next == null ? 'Fully grown (Mythic)' : (p.canEvolve && p.care >= T[5] ? 'Ready to evolve to Mythic' :
      fmt(Math.max(0, p.next - p.care)) + ' more care to ' + GameCore.STAGE_NAMES[p.stage === 4 ? 5 : p.stage + 1]);
    d.innerHTML = '<div class="top"><canvas class="pixel" width="32" height="32"></canvas><div>' +
      '<h4>' + esc(p.art.defaultName) + ' <span class="muted small">#' + p.id + '</span></h4>' +
      '<div>' + esc(speciesLabel(p.art.species)) + ' <span class="pill tier tier-' + t.id + '">' + t.label + '</span></div>' +
      '<div class="small">Stage: <b class="stg">' + p.stageName + '</b> · care <b class="care">' + fmt(p.care) + '</b></div>' +
      '<div class="bar" aria-label="progress to next stage"><i style="width:' + Math.round(p.progress * 100) + '%"></i></div>' +
      '<div class="small muted">' + nextTxt + '</div></div></div>' +
      '<div class="gear">Gear: ' + (p.gear.length ? p.gear.map(function (g) { return esc(g.label); }).join(', ') : 'none yet') +
      ' <span class="muted">(' + t.label + ' cap: ' + t.gearSlots + ' pieces)</span></div>' +
      '<div class="row"><input class="amt feedAmt" type="number" min="' + C.feedPet + '" step="100" value="10000" aria-label="Feed amount">' +
      '<button class="q" data-a="1000">1k</button><button class="q" data-a="10000">10k</button><button class="q" data-a="100000">100k</button><button class="q" data-a="1000000">1M</button>' +
      (p.next != null && p.stage < 4 ? '<button class="q" data-a="' + Math.max(C.feedPet, p.next - p.care) + '">to next stage</button>' : '') +
      (p.stage === 4 && p.care < T[5] ? '<button class="q" data-a="' + Math.max(C.feedPet, T[5] - p.care) + '">to 5M</button>' : '') + '</div>' +
      '<div class="row" style="margin-top:8px"><button class="btn feed">Feed</button>' +
      (p.ascended ? '' : '<button class="btn ghost evolve"' + (p.canEvolve ? '' : ' disabled') + ' title="Needs Elder and 5,000,000 care incl. the 50,000 evolve burn">Evolve to Mythic</button>') + '</div>' +
      '<div class="msg" aria-live="polite"></div>';
    show(d.querySelector('canvas'), p.art, p.stage);
    var amt = d.querySelector('.feedAmt'), msg = d.querySelector('.msg');
    d.querySelectorAll('button.q').forEach(function (b) { b.onclick = function () { amt.value = b.getAttribute('data-a'); }; });
    d.querySelector('.feed').onclick = function () { act(function () { return demo.feed(p.id, Number(amt.value)); }, msg); };
    var ev = d.querySelector('.evolve');
    if (ev) ev.onclick = function () { act(function () { return demo.evolve(p.id); }, msg); };
    return d;
  }

  function act(fn, msgEl) {
    try { var r = fn(); render(); var m = document.querySelector('#pet-' + r.pet.id + ' .msg'); if (m) { m.className = 'msg ok'; m.textContent = r.entry.msg + ' (play money)'; } return r; }
    catch (e) { msgEl.className = 'msg err'; msgEl.textContent = e.message; if (!e.demo) throw e; }
  }

  document.querySelectorAll('[data-h]').forEach(function (b) { b.onclick = function () { $('hatchAmt').value = b.getAttribute('data-h'); }; });
  $('hatch').onclick = function () {
    var r = act(function () { return demo.hatch(Number($('hatchAmt').value)); }, $('hatchMsg'));
    if (r) { $('hatchMsg').className = 'msg ok'; $('hatchMsg').textContent = 'Hatched pet #' + r.pet.id + ' (play money).'; reveal(r.pet); }
  };
  $('refill').onclick = function () { demo.refill(); render(); };
  $('reset').onclick = function () { if (window.confirm('Reset the play demo? This deletes your play pets and play wallet in this browser.')) { demo.reset(); render(); } };

  function reveal(p) {
    var c = $('revealCanvas'), t = tierOf(p);
    $('revealTitle').textContent = 'Hatching…'; $('revealText').textContent = ''; $('reveal').classList.add('on');
    show(c, p.art, 0);
    setTimeout(function () {
      show(c, p.art, p.stage === 0 ? 1 : p.stage);
      $('revealTitle').textContent = 'It\'s ' + (/^[AEIOU]/.test(t.label) ? 'an ' : 'a ') + t.label + ' ' + speciesLabel(p.art.species) + '!';
      $('revealText').textContent = p.art.defaultName + ' · pet #' + p.id + (p.stage === 0 ? ' · still an egg: feed it to ' + fmt(T[1]) + ' care to hatch (preview shown)' : ' · ' + p.stageName);
    }, 1300);
  }
  $('revealClose').onclick = function () { $('reveal').classList.remove('on'); };
  render();
})();
