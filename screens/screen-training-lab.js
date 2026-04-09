function openTrainingLab() {
  _tlabP1 = [];
  _tlabP2 = [];
  _tlabSide = 'p1';
  showScreen('training-lab');
  _tlabRenderGrid();
  _tlabUpdateSlots();
  _tlabSetSide('p1');
}

function _tlabSetSide(side) {
  _tlabSide = side;
  var bp1 = document.getElementById('tlab-btn-p1');
  var bp2 = document.getElementById('tlab-btn-p2');
  if(bp1) { bp1.style.background = side==='p1' ? 'rgba(201,168,76,0.2)' : 'rgba(201,168,76,0.05)'; bp1.textContent = side==='p1' ? 'P1 ✓' : 'P1'; }
  if(bp2) { bp2.style.background = side==='p2' ? 'rgba(76,123,201,0.2)' : 'rgba(76,123,201,0.05)'; bp2.textContent = side==='p2' ? 'P2 ✓' : 'P2'; }
  _tlabRenderGrid();
}

function _tlabRenderGrid() {
  var grid = document.getElementById('tlab-grid');
  if(!grid) return;
  var selected = _tlabSide==='p1' ? _tlabP1 : _tlabP2;
  var html = '';
  for(var i=0; i<LOJA_CHARS.length; i++) {
    var c = LOJA_CHARS[i];
    var isSel = selected.includes(c.id);
    var sc = SUIT_COLORS[c.suit] || '#c9a84c';
    var ss = SUIT_SYMBOLS[c.suit] || '◆';
    var bc = isSel ? (_tlabSide==='p1' ? 'var(--gold)' : '#4c7bc9') : 'rgba(255,255,255,0.1)';
    var bg = isSel ? (_tlabSide==='p1' ? 'rgba(201,168,76,0.15)' : 'rgba(76,123,201,0.15)') : 'rgba(255,255,255,0.03)';
    var av = c.sprite
      ? '<div style="width:44px;height:44px;border-radius:6px;overflow:hidden;border:1px solid '+sc+'66;background:#0a0c10;margin:0 auto"><img src="sprites/'+c.id+'/idle.png" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated"></div>'
      : '<div style="width:44px;height:44px;border-radius:6px;background:rgba(255,255,255,0.04);border:1px solid '+sc+'44;display:flex;align-items:center;justify-content:center;margin:0 auto"><span style="font-size:20px;color:'+sc+'">'+ss+'</span></div>';
    html += '<div data-tlab-id="'+c.id+'" style="border:2px solid '+bc+';background:'+bg+';border-radius:8px;padding:6px;text-align:center;cursor:pointer">'
      + av + '<div style="font-size:8px;color:var(--text);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+c.name+'</div></div>';
  }
  grid.innerHTML = html;
  grid.onclick = function(e) {
    var el = e.target.closest('[data-tlab-id]');
    if(el) _tlabToggle(el.dataset.tlabId);
  };
}

function _tlabToggle(id) {
  var arr = _tlabSide==='p1' ? _tlabP1 : _tlabP2;
  var idx = arr.indexOf(id);
  if(idx >= 0) { arr.splice(idx, 1); }
  else if(arr.length < 3) { arr.push(id); }
  _tlabRenderGrid();
  _tlabUpdateSlots();
}

function _tlabUpdateSlots() {
  for(var i=0; i<3; i++) {
    var s1 = document.getElementById('tlab-p1-'+i);
    var s2 = document.getElementById('tlab-p2-'+i);
    if(s1) {
      if(_tlabP1[i]) {
        var c1 = LOJA_CHARS.find(function(c){return c.id===_tlabP1[i];});
        var sc1 = c1 ? (SUIT_COLORS[c1.suit]||'#c9a84c') : '#c9a84c';
        var ss1 = c1 ? (SUIT_SYMBOLS[c1.suit]||'◆') : '◆';
        s1.innerHTML = c1 && c1.sprite
          ? '<img src="sprites/'+c1.id+'/idle.png" style="width:48px;height:48px;object-fit:cover;image-rendering:pixelated">'
          : '<span style="font-size:22px;color:'+sc1+'">'+ss1+'</span>';
        s1.style.border = '2px solid var(--gold)';
      } else { s1.innerHTML = '?'; s1.style.border = '2px dashed rgba(201,168,76,0.3)'; }
    }
    if(s2) {
      if(_tlabP2[i]) {
        var c2 = LOJA_CHARS.find(function(c){return c.id===_tlabP2[i];});
        var sc2 = c2 ? (SUIT_COLORS[c2.suit]||'#c9a84c') : '#c9a84c';
        var ss2 = c2 ? (SUIT_SYMBOLS[c2.suit]||'◆') : '◆';
        s2.innerHTML = c2 && c2.sprite
          ? '<img src="sprites/'+c2.id+'/idle.png" style="width:48px;height:48px;object-fit:cover;image-rendering:pixelated">'
          : '<span style="font-size:22px;color:'+sc2+'">'+ss2+'</span>';
        s2.style.border = '2px solid #4c7bc9';
      } else { s2.innerHTML = '?'; s2.style.border = '2px dashed rgba(76,123,201,0.3)'; }
    }
  }
  var btn = document.getElementById('tlab-start-btn');
  if(btn) {
    if(_tlabP1.length===3 && _tlabP2.length===3) { btn.style.opacity='1'; btn.style.pointerEvents='auto'; }
    else { btn.style.opacity='0.4'; btn.style.pointerEvents='none'; }
  }
}

function startTrainingLab() {
  if(_tlabP1.length!==3 || _tlabP2.length!==3) return;
  var p1c = _tlabP1.map(function(id){ return CHARS.find(function(c){return c.id===id;}); }).filter(Boolean);
  var p2c = _tlabP2.map(function(id){ return CHARS.find(function(c){return c.id===id;}); }).filter(Boolean);
  if(p1c.length!==3 || p2c.length!==3) return;
  window._trainingLabMode = true;
  document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
  p1c.concat(p2c).forEach(function(ch){ preloadSprites(ch.id); });
  playBattleMusic();
  var trans = document.getElementById('trans-overlay');
  trans.classList.add('fade-in');
  setTimeout(function() {
    initGame(p1c, p2c);
    showScreen('game');
    document.getElementById('btn-restart').classList.add('visible');
    addLog('═══ TREINO LAB ═══', 'sys');
    addLog('⚔ P1: '+p1c.map(function(c){return c.name;}).join(', '), 'info');
    addLog('🛡 P2: '+p2c.map(function(c){return c.name;}).join(', '), 'info');
    applyStartPassives();
    trans.classList.remove('fade-in');
    trans.classList.add('fade-out');
    setTimeout(function(){ trans.classList.remove('fade-out'); }, 700);
    showInitiativeChoiceScreen();
  }, 700);
}

function tlabReviveAll() {
  if(!window._trainingLabMode || !G) return;
  ['p1','p2'].forEach(function(o) {
    G[o].chars.forEach(function(ch) {
      ch.alive = true;
      ch.hp = ch.maxHp;
      ch.statuses = [];
      ch.cooldowns = {};
      for(var k in ch) { if(k.startsWith('_')) delete ch[k]; }
      ch.firstTurn = false;
      ch.quickAction = false;
      ch.extraTurnUsed = false;
      ch.curAtq = ch.atq;
      ch.curDef = ch.def;
    });
  });
  G.over = false;
  addLog('💚 TREINO LAB: Todos revividos! HP e status resetados.','sys');
  render();
  closeOptions();
}

function tlabToggleImmortal() {
  _tlabImmortal = !_tlabImmortal;
  var icon = document.getElementById('tlab-immortal-icon');
  var label = document.getElementById('tlab-immortal-label');
  if(icon) icon.textContent = _tlabImmortal ? '✨' : '💀';
  if(label) label.textContent = _tlabImmortal ? 'Imortal: ON' : 'Imortal: OFF';
  addLog(_tlabImmortal ? '✨ IMORTAL ATIVADO — ninguém morre!' : '💀 IMORTAL DESATIVADO — modo normal.','sys');
}

function openSurvivor() {
