function openSurvivor() {
  var user = window._fbUser;
  if (!user) { alert('Faça login primeiro para jogar o Survivor.'); return; }
  _survSelected = [];
  _navOrigin = 'survivor';
  showScreen('survivor');

  // Carrega dados de equipamento se ainda não carregou
  if (!_equipLoaded) _equipLoadAll();

  var photo = document.getElementById('surv-photo');
  var nameEl = document.getElementById('surv-name');
  if (photo) photo.src = user.photoURL || '';
  if (nameEl) nameEl.textContent = user.displayName || 'Jogador';

  window._fbGet(window._fbRef(window._fbDb, 'jogadores/' + user.uid)).then(function(snap) {
    var d = snap.exists() ? snap.val() : {};
    var coins = document.getElementById('surv-coins');
    if (coins) coins.textContent = d.coins || 0;
    window._myRoster = d.roster || [];

    // Restaurar estado do Survivor salvo
    var sv = d.survivorState || null;
    if (sv) {
      _survState = { phase: sv.phase || 1, stage: sv.stage || 1, team: sv.team || [], hp: sv.hp || {}, bonusCarry: sv.bonusCarry || 0, maxPhase: sv.maxPhase || sv.phase || 1, completedStages: sv.completedStages || [], completedBosses: sv.completedBosses || [] };
    } else {
      _survState = null;
    }

    // Calcular personagens ainda bloqueados
    var now = Date.now();
    var blocked = d.survivorBlocked || {};
    _survDefeatedIds = Object.keys(blocked).filter(function(id) { return blocked[id] > now; });

    // Pre-selecionar time salvo (excluindo bloqueados)
    if (_survState && _survState.team && _survState.team.length > 0) {
      _survSelected = _survState.team.filter(function(id) { return !_survDefeatedIds.includes(id); });
    }

    // Jogo em andamento: vai direto pro mapa
    if (_survState && _survState.team && _survState.team.length === 3) {
      _survShowMap();
      return;
    }

    _survRenderGrid();
    _survUpdateSlots();
  }).catch(function() {
    _survState = null;
    _survDefeatedIds = [];
    _survRenderGrid();
    _survUpdateSlots();
  });
}

function _survRenderGrid() {
  var myRoster = window._myRoster || [];
  cpInit('surv-char-panel', 'select', {
    owned: myRoster.length > 0 ? myRoster : LOJA_CHARS.map(function(c) { return c.id; }),
    blocked: _survDefeatedIds || [],
    multiSelect: _survSelected,
    origin: 'survivor',
    onSelect: function(id) { _survToggle(id); }
  });
}

function _survToggle(id) {
  var idx = _survSelected.indexOf(id);
  if (idx !== -1) {
    _survSelected.splice(idx, 1);
  } else {
    if (_survSelected.length >= 3) return;
    _survSelected.push(id);
  }
  _cp.multiSelect = _survSelected;
  cpRender();
  _survUpdateSlots();
}
function _survUpdateSlots() {
  for (var i = 0; i < 3; i++) {
    var slot = document.getElementById('surv-slot-' + i);
    var id = _survSelected[i];
    if (id) {
      var c = LOJA_CHARS.find(function(x){ return x.id === id; });
      if (c) {
        slot.innerHTML = charAvatar(c, 52);
        slot.style.border = '2px solid #5ac880';
        slot.style.background = 'rgba(90,200,128,0.1)';
      }
    } else {
      slot.innerHTML = '?';
      slot.style.border = '2px dashed rgba(90,200,128,0.25)';
      slot.style.background = 'rgba(90,200,128,0.03)';
      slot.style.fontSize = '20px';
      slot.style.color = 'var(--text2)';
    }
  }
  var hint = document.getElementById('surv-hint');
  var btn = document.getElementById('surv-start-btn');
  var count = _survSelected.length;
  if (count === 3) {
    hint.textContent = '✅ Time completo — pronto para entrar!';
    hint.style.color = '#5ac880';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  } else {
    hint.textContent = 'Selecione ' + (3 - count) + ' personagem' + (3 - count !== 1 ? 's' : '') + ' ainda';
    hint.style.color = 'var(--text2)';
    btn.style.opacity = '0.4';
    btn.style.pointerEvents = 'none';
  }
}

function startSurvivor() {
  if (_survSelected.length !== 3) return;
  _logEvent('Survivor — Time: ' + _survSelected.join(', '), 'SURVIVOR');

  var prevPhase = _survState ? _survState.phase : 1;
  var prevHp = _survState ? _survState.hp : {};
  var isRestart = _survDefeatedIds.length > 0;

  var prevMaxPhase = _survState ? (_survState.maxPhase || _survState.phase || 1) : 1;
  var prevBonusCarry = _survState ? (_survState.bonusCarry || 0) : 0;
  var prevPhaseProgress = _survState ? (_survState.phase || 1) : 1;
  var prevStageProgress = _survState ? (_survState.stage || 1) : 1;
  var prevCompletedStages = _survState ? (_survState.completedStages || []) : [];
  var prevCompletedBosses = _survState ? (_survState.completedBosses || []) : [];

  _survState = {
    phase: prevPhaseProgress,
    stage: prevStageProgress,
    team: _survSelected.slice(),
    hp: {},
    maxPhase: prevMaxPhase,
    bonusCarry: prevBonusCarry,
    completedStages: prevCompletedStages,
    completedBosses: prevCompletedBosses
  };
  _survViewPhase = _survState.phase;

  _survState.team.forEach(function(id) {
    var ch = CHARS.find(function(c) { return c.id === id; });
    if (!ch) return;
    if (isRestart && prevHp[id] && prevHp[id].cur > 0) {
      _survState.hp[id] = { cur: prevHp[id].cur, max: ch.pvs };
    } else {
      _survState.hp[id] = { cur: ch.pvs, max: ch.pvs };
    }
  });

  _survDefeatedIds = [];

  // Salva estado inicial no Firebase
  var user = window._fbUser;
  if (user) {
    var stateRef = window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/survivorState');
    window._fbSet(stateRef, {
      phase: _survState.phase,
      stage: _survState.stage,
      team: _survState.team,
      hp: _survState.hp,
      maxPhase: _survState.maxPhase || 1,
      bonusCarry: _survState.bonusCarry || 0,
      completedStages: _survState.completedStages || [],
      completedBosses: _survState.completedBosses || []
    });
    // Limpa bloqueios expirados
    var blockedRef = window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/survivorBlocked');
    window._fbSet(blockedRef, {});
  }

  _survShowMap();
}

// ══ SURVIVOR MAP ══
var _survState = null;
var _survViewPhase = 1; // tier que está visualizando no mapa (pode ser diferente do progresso)
var _survPhases = [
  { tier: 1, name: 'FLORESTA SOMBRIA', color: '#5ac880' },
  { tier: 2, name: 'CAVERNAS DE GELO', color: '#5a9ac8' },
  { tier: 3, name: 'TEMPLO ARCANO', color: '#9060d0' },
  { tier: 4, name: 'DESERTO DE FOGO', color: '#d08040' },
  { tier: 5, name: 'ABISMO CARMESIM', color: '#d04050' },
  { tier: 6, name: 'TRONO DOURADO', color: '#c9a84c' }
];

// ══ CENÁRIOS DO SURVIVOR (background por tier) ══
var SURVIVOR_BG = {
  1: 'cenario/tier1/tier1.jpg',
  2: 'cenario/tier2/tier2.jpg',
  3: 'cenario/tier3/tier3.jpg',
  4: 'cenario/tier4/tier4.jpg',
  5: 'cenario/tier5/tier5.jpg',
  6: 'cenario/tier6/tier6.jpg'
};

// Aplica cenário do Survivor no .field
function _applySurvivorBg(tier) {
  var field = document.querySelector('.field');
  if (!field) return;
  var url = SURVIVOR_BG[tier];
  if (!url) return;
  // Remove layers anteriores se existirem
  _removeSurvivorBgLayers();
  // Preload a imagem antes de criar layers
  var img = new Image();
  img.onload = function() {
    field.classList.add('survivor-bg-active');
    // Layer do cenário com parallax
    var bgLayer = document.createElement('div');
    bgLayer.className = 'survivor-bg-layer';
    bgLayer.style.backgroundImage = 'url(' + url + ')';
    // Vinheta sobre o cenário
    var vignette = document.createElement('div');
    vignette.className = 'survivor-bg-vignette';
    // Insere como primeiros filhos do field
    field.insertBefore(vignette, field.firstChild);
    field.insertBefore(bgLayer, field.firstChild);
  };
  img.onerror = function() {
    console.warn('[Survivor] Cenário não encontrado:', url);
  };
  img.src = url;
}

function _removeSurvivorBgLayers() {
  var field = document.querySelector('.field');
  if (!field) return;
  var old = field.querySelectorAll('.survivor-bg-layer, .survivor-bg-vignette');
  old.forEach(function(el) { el.remove(); });
}

// Restaura gradiente original do .field
var _fieldOriginalBg = 'linear-gradient(180deg, #04060e 0%, #070c1a 28%, #0c1428 52%, #111828 68%, #0d111f 82%, #080b14 100%)';
function _restoreBattleBg() {
  var field = document.querySelector('.field');
  if (!field) return;
  _removeSurvivorBgLayers();
  field.style.background = _fieldOriginalBg;
  field.classList.remove('survivor-bg-active');
}

function _survShowMap() {
  _survViewPhase = _survState.phase;
  showScreen('survivor-map');
  var p = _survPhases[_survState.phase - 1];
  // ── Aplica cenário do tier como background do mapa ──
  var mapScreen = document.getElementById('screen-survivor-map');
  var bgUrl = SURVIVOR_BG[_survState.phase];
  if (mapScreen && bgUrl) {
    var inner = mapScreen.querySelector('div');
    if (inner) inner.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%), url(' + bgUrl + ') center center / cover no-repeat';
  } else if (mapScreen) {
    var inner = mapScreen.querySelector('div');
    if (inner) inner.style.background = 'var(--bg)';
  }
  // Hide map content, show transition splash
  var mapContent = document.getElementById('surv-map-content');
  if (mapContent) mapContent.style.display = 'none';
  var trans = document.getElementById('surv-map-transition');
  trans.style.display = 'flex';
  trans.style.flexDirection = 'column';
  trans.style.alignItems = 'center';
  trans.style.justifyContent = 'center';
  trans.style.minHeight = '70vh';
  trans.innerHTML = '<div class="surv-map-title" style="color:' + p.color + ';font-size:clamp(26px,8vw,38px)">FASE TIER ' + p.tier + '</div>' +
    '<div class="surv-map-sub" style="font-size:12px;margin-top:6px">' + p.name + '</div>' +
    '<div style="width:80px;height:3px;background:' + p.color + ';border-radius:2px;margin-top:16px;opacity:0.6"></div>';
  window._survIsNewPhase = true;
  setTimeout(function() {
    trans.style.minHeight = 'auto';
    if (mapContent) mapContent.style.display = 'flex';
    _survRenderMap();
    _survScrollPresent();
  }, 2500);
}

function _survMapBack() {
  showScreen('survivor');
}

function _survNavPhase(dir) {
  var maxPhase = _survState ? (_survState.maxPhase || _survState.phase) : 1;
  _survViewPhase = (_survViewPhase || _survState.phase) + dir;
  if (_survViewPhase < 1) _survViewPhase = 1;
  if (_survViewPhase > maxPhase) _survViewPhase = maxPhase;
  window._survIsNewPhase = true;
  _survRenderMap();
  _survScrollPresent();
}

// ── Animação de apresentação do mapa: rola do topo (BOSS) até a etapa atual ──
function _survScrollPresent() {
  if (!window._survIsNewPhase) return;
  window._survIsNewPhase = false;
  var el = document.getElementById('surv-map-scroll');
  if (!el) return;
  // Começa no topo (BOSS visível = scrollTop 0 pois path está invertido do boss p/ etapa1)
  el.scrollTop = 0;
  var start = null;
  var duration = 2000; // 2s
  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }
  function step(ts) {
    if (!start) start = ts;
    var elapsed = ts - start;
    var progress = Math.min(elapsed / duration, 1);
    var target = el.scrollHeight - el.clientHeight;
    el.scrollTop = Math.round(easeInOut(progress) * target);
    if (progress < 1) requestAnimationFrame(step);
  }
  // Pequeno delay para garantir que o DOM está renderizado
  setTimeout(function() { requestAnimationFrame(step); }, 80);
}

function _survRenderMap() {
  if (!_survState) return;
  var viewPhase = _survViewPhase || _survState.phase;
  var p = _survPhases[Math.min(viewPhase, _survPhases.length) - 1];
  var isCurrentPhase = viewPhase === _survState.phase;
  var stage = isCurrentPhase ? _survState.stage : 11; // 11 = todas completadas
  var maxPhase = _survState.maxPhase || _survState.phase;

  // ── Atualiza cenário do tier no mapa ──
  var mapScreen = document.getElementById('screen-survivor-map');
  var bgUrl = SURVIVOR_BG[viewPhase];
  if (mapScreen) {
    var inner = mapScreen.querySelector('div');
    if (inner && bgUrl) {
      inner.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.7) 100%), url(' + bgUrl + ') center center / cover no-repeat';
    } else if (inner) {
      inner.style.background = 'var(--bg)';
    }
  }

  // Coins — Firebase if logged in, test coins if offline
  var coinsEl = document.getElementById('surv-map-coins');
  if (coinsEl) {
    var user = window._fbUser;
    if (user) {
      window._fbGet(window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/coins')).then(function(snap) {
        var fbCoins = snap.exists() ? snap.val() : 0;
        coinsEl.textContent = '🪙 ' + fbCoins;
      }).catch(function() {
        coinsEl.textContent = '🪙 ' + (_equipCoins || 0);
      });
    } else {
      coinsEl.textContent = '🪙 ' + (_equipCoins || 0);
    }
  }

  // Transition title com botões ◀ ▶
  var trans = document.getElementById('surv-map-transition');
  var navLeft = viewPhase > 1 ? '<span onclick="_survNavPhase(-1)" style="cursor:pointer;font-size:18px;color:var(--text2);padding:0 12px">◀</span>' : '<span style="width:42px;display:inline-block"></span>';
  var navRight = viewPhase < maxPhase ? '<span onclick="_survNavPhase(1)" style="cursor:pointer;font-size:18px;color:var(--text2);padding:0 12px">▶</span>' : '<span style="width:42px;display:inline-block"></span>';
  trans.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;gap:4px">' +
    navLeft +
    '<div style="text-align:center"><div class="surv-map-title" style="color:' + p.color + '">FASE TIER ' + p.tier + '</div>' +
    '<div class="surv-map-sub">' + p.name + '</div></div>' +
    navRight +
  '</div>';

  // Info bar
  var info = document.getElementById('surv-map-info');
  if (isCurrentPhase) {
    info.innerHTML = '<span>FASE ' + p.tier + ' · ETAPA ' + _survState.stage + '/10</span>';
  } else {
    info.innerHTML = '<span>FASE ' + p.tier + ' · FARM</span>';
  }

  // HP bars with avatars
  var hpEl = document.getElementById('surv-map-hp');
  hpEl.innerHTML = _survState.team.map(function(id) {
    var hp = _survState.hp[id];
    var ch = CHARS.find(function(c) { return c.id === id; });
    var lc = LOJA_CHARS.find(function(c) { return c.id === id; });
    if (!ch || !hp) return '';
    // maxHp com bônus de equipamento
    var eqMax = hp.max;
    if (_equipLoaded) {
      var _ed = _equipData[id];
      if (_ed && _ed.slot1 && _ed.slot1._item && _ed.slot1._item.prefix === 'PVS') {
        var _el = _equipGetLevel(_ed.slot1.xp || 0);
        eqMax = hp.max + _ed.slot1._item.prefixVal + (_el - 1);
      }
    }
    var pct = Math.round(hp.cur / eqMax * 100);
    var color = pct > 60 ? '#5ac880' : pct > 30 ? '#d0a040' : '#d04050';
    var name = ch.name.split(' ')[0].toUpperCase();
    var avatar = lc ? charAvatar(lc, 22) : '<div style="width:22px;height:22px;border-radius:5px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:10px;color:var(--text2)">?</div>';
    return '<div class="surv-hp-char" style="display:flex;align-items:center;gap:5px;padding:3px 6px">' +
      (lc ? charAvatar(lc, 16) : '<div style="width:16px;height:16px;border-radius:4px;background:var(--bg);display:flex;align-items:center;justify-content:center;font-size:8px;color:var(--text2);flex-shrink:0">?</div>') +
      '<div style="flex:1;min-width:0;overflow:hidden">' +
        '<div class="surv-hp-name" style="margin-bottom:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:7px">' + name + '</div>' +
        '<div class="surv-hp-wrap" style="max-width:120px"><div class="surv-hp-fill" style="width:' + pct + '%;background:' + color + '"></div></div>' +
      '</div>' +
    '</div>';
  }).join('');

  // Path nodes
  var pathEl = document.getElementById('surv-map-path');
  var nodesHtml = '';
  for (var i = 1; i <= 10; i++) {
    var isBoss = i === 10;
    var isRecovery = i === 5;
    var isCurrent = i === stage;
    var isCompleted = i < stage;
    var isLocked = i > stage;

    var cls = 'surv-node';
    if (isBoss) cls += ' boss';
    if (isRecovery && !isCompleted) cls += ' recovery';
    if (isCurrent) cls += ' current';
    else if (isCompleted) cls += ' completed';
    else if (isLocked) cls += ' locked';
    if (!isLocked) cls += ' clickable';

    var label = isBoss ? 'BOSS' : isRecovery ? 'RECUPERAÇÃO' : 'ETAPA ' + i;
    var display = isBoss ? '👑' : isCompleted ? '' : i;
    var clickAttr = !isLocked ? ' onclick="_survEnterBattle(' + i + ')"' : '';

    nodesHtml += '<div class="surv-node-wrap" style="padding:' + (isBoss ? '12' : '6') + 'px 0">' +
      '<div class="surv-node-conn" style="background:' + p.color + '"></div>' +
      '<div class="' + cls + '" style="border-color:' + p.color + ';color:' + p.color + '"' + clickAttr + '>' +
        display +
        '<span class="surv-node-label">' + (isCurrent ? '► ' + label : label) + '</span>' +
      '</div>' +
      '<div class="surv-node-conn" style="background:' + p.color + '"></div>' +
    '</div>';
  }

  pathEl.innerHTML = '<div class="surv-path-container" style="position:relative">' +
    '<div class="surv-path-line" style="background:' + p.color + '"></div>' +
    nodesHtml +
  '</div>';
}

// ── Survivor: time anterior da IA (para evitar repetição) ──
var _survLastIaTeam = [];
var _survDefeatedIds = []; // IDs de personagens mortos na derrota atual

function _survEnterBattle(stage) {
  if (!_survState) return;
  var viewPhase = _survViewPhase || _survState.phase;
  var p = _survPhases[Math.min(viewPhase, _survPhases.length) - 1];
  _logEvent('Survivor — Fase ' + p.tier + ' Etapa ' + stage, 'SURVIVOR');

  // Guarda fase/etapa da batalha atual (pode ser farm)
  window._survBattlePhase = viewPhase;
  window._survBattleStage = stage;

  // Etapa 10: Boss da fase
  if (stage === 10) {
    var boss = BOSS_CHARS.find(function(b) { return b.phase === viewPhase; });
    if (boss) {
      window._survBossActive = true;
      window._survMiniBossActive = false;
      // Rola se boss vem equipado com artefato
      window._survBossArtefato = _rollBossArtefato(boss.id);
      if (window._survBossArtefato) {
        _logEvent('🔮 Boss equipado com artefato: ' + window._survBossArtefato.name, 'SURVIVOR');
      }
      _survShowBattleTransition(stage, [boss.id], p);
      return;
    }
  }

  // Etapa 5: Mini Boss da fase
  if (stage === 5) {
    var miniBoss = _findMiniBoss(viewPhase);
    if (miniBoss) {
      window._survMiniBossActive = true;
      window._survBossActive = false;
      window._survBossArtefato = null;
      _logEvent('💀 Mini Boss — ' + miniBoss.name, 'SURVIVOR');
      // Companheiros do mini boss variam por tier
      var _mbCompanions = { 1: ['elfo_a', 'elfo_b'], 2: ['troll_t2_a', 'troll_t2_b'] };
      var _mbComp = _mbCompanions[viewPhase] || _mbCompanions[1];
      var mbTeam = [miniBoss.id].concat(_mbComp);
      _survShowBattleTransition(stage, mbTeam, p);
      return;
    }
  }

  window._survBossActive = false;
  window._survBossArtefato = null;

  // Sortear time da IA — monstros do tier da fase atual
  var iaTeam = _rollMonsterTeam(viewPhase);
  _survLastIaTeam = iaTeam.slice();

  _survShowBattleTransition(stage, iaTeam, p);
}

function _survShowBattleTransition(stage, iaTeam, phase) {
  showScreen('survivor-battle');

  // ── Aplica cenário do tier no fundo da tela de transição ──
  var btScreen = document.getElementById('screen-survivor-battle');
  var bgUrl = SURVIVOR_BG[phase.tier];
  if (btScreen) {
    var inner = btScreen.querySelector('div');
    if (inner && bgUrl) {
      inner.style.background = 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.7) 100%), url(' + bgUrl + ') center center / cover no-repeat';
    } else if (inner) {
      inner.style.background = 'var(--bg)';
    }
  }

  var labelEl = document.getElementById('surv-bt-label');
  var titleEl = document.getElementById('surv-bt-phase-title');
  if (labelEl) labelEl.textContent = 'FASE TIER ' + phase.tier + ' · ETAPA ' + stage + '/10';
  if (titleEl) { titleEl.textContent = phase.name; titleEl.style.color = phase.color; }

  // Renderizar time da IA
  var iaEl = document.getElementById('surv-bt-ia-team');
  if (iaEl) {
    iaEl.innerHTML = iaTeam.map(function(id) {
      var lc = LOJA_CHARS.find(function(c) { return c.id === id; });
      // Boss: busca no BOSS_CHARS
      var bc = !lc ? BOSS_CHARS.find(function(c) { return c.id === id; }) : null;
      // Monstro: busca no MONSTER_CHARS
      var mc = (!lc && !bc) ? _findMonsterChar(id) : null;
      // Mini Boss
      var mbc = (!lc && !bc && !mc) ? (function(){ for(var t in MINI_BOSS_CHARS){ var f=MINI_BOSS_CHARS[t].find(function(m){return m.id===id;}); if(f) return f; } return null; })() : null;
      var charData = lc || bc || mc || mbc;
      if (!charData) return '';
      var isBoss = !!bc;
      var isMonster = !!mc;
      var isMiniBoss = !!mbc;
      var avatarHtml = lc ? charAvatar(lc, 56) :
        isBoss ? '<div style="width:56px;height:56px;border-radius:10px;background:linear-gradient(135deg,rgba(208,64,80,0.2),rgba(201,168,76,0.2));border:2px solid #d04050;display:flex;align-items:center;justify-content:center;font-size:24px">👑</div>' :
        isMiniBoss ? '<div style="width:56px;height:56px;border-radius:10px;background:linear-gradient(135deg,rgba(144,96,208,0.2),rgba(80,40,120,0.3));border:2px solid #9060d0;display:flex;align-items:center;justify-content:center;font-size:24px">💀</div>' :
        '<div style="width:56px;height:56px;border-radius:10px;background:linear-gradient(135deg,rgba(80,160,80,0.2),rgba(40,80,40,0.3));border:2px solid #508050;display:flex;align-items:center;justify-content:center;font-size:24px">👾</div>';
      return '<div style="display:flex;flex-direction:column;align-items:center;gap:6px">' +
        avatarHtml +
        '<div style="font-family:\'Cinzel\',serif;font-size:' + (isBoss ? '10px' : '8px') + ';color:' + (isBoss ? '#d04050' : isMiniBoss ? '#9060d0' : isMonster ? '#80c080' : 'var(--text)') + ';text-align:center;max-width:80px;line-height:1.3">' +
          charData.name +
        '</div>' +
      '</div>';
    }).join('');
  }

  // Countdown 3, 2, 1 → inicia batalha real
  var countEl = document.getElementById('surv-bt-countdown');
  var count = 3;
  if (countEl) countEl.textContent = count;
  var interval = setInterval(function() {
    count--;
    if (countEl) countEl.textContent = Math.max(count, 0);
    if (count <= 0) {
      clearInterval(interval);
      _survStartBattle(iaTeam);
    }
  }, 1000);
}

function _survStartBattle(iaTeam) {
  if (!_survState) return;
  var p1c = _survState.team.map(function(id) { return CHARS.find(function(c) { return c.id === id; }); }).filter(Boolean);
  // Busca em BOSS_CHARS e MONSTER_CHARS além de CHARS
  var p2c = iaTeam.map(function(id) {
    return _findAnyChar(id);
  }).filter(Boolean);
  if (p1c.length === 0 || p2c.length === 0) return;

  window._trainingLabMode = false;
  window._survivorMode = true;

  p1c.concat(p2c).forEach(function(ch) { preloadSprites(ch.id); });
  playBattleMusic();

  var trans = document.getElementById('trans-overlay');
  trans.classList.add('fade-in');
  setTimeout(function() {
    initGame(p1c, p2c);
    // ── Survivor: aplica HP persistido ──
    if (_survState && _survState.hp) {
      G.p1.chars.forEach(function(ch) {
        var saved = _survState.hp[ch.id];
        if (saved) {
          // maxHp do makeChar já inclui bônus de equipamento
          var eqMaxHp = ch.maxHp; // com bônus do equip
          // HP atual = salvo, sem ganhar vida extra do equip (anti-exploit)
          ch.hp = Math.min(saved.cur, eqMaxHp);
          ch.maxHp = eqMaxHp;
          if (ch.hp <= 0) {
            ch.hp = 0;
            ch.alive = false;
          }
        }
      });
    }
    // ── Survivor: ajusta mão — mortos não compram cartas ──
    var survDead = G.p1.chars.filter(function(c) { return !c.alive; }).length;
    if (survDead > 0) {
      // Remove cartas da mão pra simular que mortos não compraram
      // 3 vivos = 10 cartas, 2 vivos = 9, 1 vivo = 8
      var targetCards = 10 - survDead;
      while (G.p1.hand.length > targetCards) {
        G.p1.discard.push(G.p1.hand.pop());
      }
    }
    // ── Survivor: buff de dificuldade da IA (boss não recebe) ──
    var survHasBoss = G.p2.chars.some(function(c) { return c.isBoss; });
    var survBuffPontos = survHasBoss ? 0 : (_survState.bonusCarry || 0) + (window._survBattleStage || _survState.stage);
    var survBuffLog = [];
    if (survBuffPontos > 0) {
      var survStats = ['atq', 'def', 'inc', 'pvs'];
      var survStatNames = { atq: 'ATQ', def: 'DEF', inc: 'INC', pvs: 'PVS' };
      var survBuffTotals = {}; // { charId: { name, atq:0, def:0, inc:0, pvs:0 } }
      for (var bp = 0; bp < survBuffPontos; bp++) {
        var bch = G.p2.chars[Math.floor(Math.random() * G.p2.chars.length)];
        var bst = survStats[Math.floor(Math.random() * survStats.length)];
        if (bst === 'atq') { bch.atq += 1; bch.curAtq += 1; }
        else if (bst === 'def') { bch.def += 1; bch.curDef += 1; }
        else if (bst === 'inc') bch.inc += 1;
        else if (bst === 'pvs') { bch.pvs += 1; bch.hp += 1; bch.maxHp += 1; }
        if (!survBuffTotals[bch.id]) survBuffTotals[bch.id] = { name: bch.name.split(' ')[0], atq:0, def:0, inc:0, pvs:0 };
        survBuffTotals[bch.id][bst]++;
      }
      Object.keys(survBuffTotals).forEach(function(id) {
        var t = survBuffTotals[id];
        var parts = survStats.filter(function(s) { return t[s] > 0; }).map(function(s) { return '+' + t[s] + ' ' + survStatNames[s]; });
        survBuffLog.push(t.name + ' ganhou ' + parts.join(', '));
      });
    }
    showScreen('game');
    // ── Survivor: aplica cenário do tier ──
    if (_survState) _applySurvivorBg(window._survBattlePhase || _survState.phase);
    document.getElementById('btn-restart').classList.remove('visible');
    addLog('═══ SURVIVOR ═══', 'sys');
    addLog('⚔ Jogador: ' + p1c.map(function(c) { return c.name; }).join(', '), 'info');
    addLog('🤖 IA: ' + p2c.map(function(c) { return c.name; }).join(', '), 'info');
    if (survBuffLog.length > 0) {
      addLog('📈 Dificuldade IA (+' + survBuffPontos + '): ' + survBuffLog.join(', '), 'info');
    }
    applyStartPassives();
    trans.classList.remove('fade-in');
    trans.classList.add('fade-out');
    setTimeout(function() { trans.classList.remove('fade-out'); }, 700);
    showInitiativeChoiceScreen();
  }, 700);
}

function _survOnBattleResult(victory) {
  if (!_survState) { showScreen('survivor-map'); playTelaMusic(); return; }
  var user = window._fbUser;

  if (victory) {
    // Salva HP atual dos personagens do jogador
    // (HP já foi gravado no _survState.hp dentro do endGame)
    var battlePhase = window._survBattlePhase || _survState.phase;
    var battleStage = window._survBattleStage || _survState.stage;
    var isFarm = battlePhase !== _survState.phase || battleStage !== _survState.stage;
    var currentStage = _survState.stage;
    var currentPhase = _survState.phase;
    // Só avança progresso se não é farm
    if (!isFarm) {
      if (currentStage < 10) {
        _survState.stage++;
      } else if (_survState.phase < _survPhases.length) {
        _survState.phase++;
        _survState.stage = 1;
      } else {
        _survState.stage = 1; // Modo Plus TODO
      }
    }
    var changedPhase = _survState.phase !== currentPhase;
    // Acumula pontos de dificuldade ao trocar de fase
    if (changedPhase) {
      var pontosFinais = (_survState.bonusCarry || 0) + currentStage;
      _survState.bonusCarry = pontosFinais;
      // Desbloqueia novo tier se avançou além do máximo
      if (_survState.phase > (_survState.maxPhase || 1)) {
        _survState.maxPhase = _survState.phase;
      }
    }
    _survViewPhase = changedPhase ? _survState.phase : battlePhase;

    // ── Coins do Survivor ──
    var survCoinsEarned = 0;
    var isBoss = window._survBossActive && battleStage === 10;
    if (isBoss) {
      // Boss já derrotado = próxima fase desbloqueada (maxPhase > fase do boss)
      var bossAlreadyDone = (_survState.maxPhase || 1) > battlePhase;
      survCoinsEarned = bossAlreadyDone ? 1 : 10;
    } else if (!isFarm) {
      var stageKey = currentPhase + '-' + currentStage;
      var alreadyDone = (_survState.completedStages || []).indexOf(stageKey) !== -1;
      if (!alreadyDone) {
        var survAliveCount = G && G.p1 ? G.p1.chars.filter(function(c) { return c.alive; }).length : 1;
        survCoinsEarned = survAliveCount;
        _survState.completedStages = (_survState.completedStages || []).concat([stageKey]);
      }
    }
    if (survCoinsEarned > 0) {
      _equipCoins = (_equipCoins || 0) + survCoinsEarned;
      _equipSaveCoins();
      window._survLastCoins = survCoinsEarned;
      if (isBoss) {
        addLog('🪙 Boss: +' + survCoinsEarned + ' coins' + (survCoinsEarned === 1 ? ' (farm)' : ' (primeira vez)') + ' — Total: ' + _equipCoins, 'info');
      } else {
        addLog('🪙 Etapa: +' + survCoinsEarned + ' coins (' + survCoinsEarned + ' herói' + (survCoinsEarned > 1 ? 's' : '') + ' vivo' + (survCoinsEarned > 1 ? 's' : '') + ') — Total: ' + _equipCoins, 'info');
      }
    } else {
      window._survLastCoins = 0;
      if (isFarm) {
        addLog('🪙 Farm: 0 coins (etapa já completada)', 'info');
      } else {
        addLog('🪙 0 coins', 'info');
      }
    }

    // ── XP de item por vitória ──
    if (_equipLoaded) {
      if (isFarm) {
        _equipGrantBattleXp(1); // farm: 1pt fixo
      } else {
        var survAlives = G && G.p1 ? G.p1.chars.filter(function(c) { return c.alive; }).length : 0;
        _equipGrantBattleXp(Math.max(1, survAlives)); // etapa nova: 1-3 por chars vivos
      }
    }

    // Drop já foi rolado no endGame e está em window._survLastDrop / window._survLastArtefato

    // Salva no Firebase
    if (user) {
      var ref = window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/survivorState');
      window._fbSet(ref, {
        phase: _survState.phase,
        stage: _survState.stage,
        team: _survState.team,
        hp: _survState.hp,
        bonusCarry: _survState.bonusCarry || 0,
        maxPhase: _survState.maxPhase || 1,
        completedStages: _survState.completedStages || [],
        completedBosses: _survState.completedBosses || []
      });
    }
    // Mostra transição com HP antes do mapa
    _survShowTransition(true, changedPhase, currentStage);

  } else {
    // Salva HP atual
    // (HP já foi gravado no _survState.hp dentro do endGame)
    var defeated = _survState.team.filter(function(id) {
      return _survState.hp[id] && _survState.hp[id].cur <= 0;
    });
    _survDefeatedIds = defeated;
    _survSelected = [];

    if (user) {
      var expireAt = Date.now() + 2 * 60 * 1000; // 2 minutos
      var blockedObj = {};
      defeated.forEach(function(id) { blockedObj[id] = expireAt; });

      // Salva estado e bloqueios no Firebase (mantém progresso)
      var stateRef = window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/survivorState');
      window._fbSet(stateRef, {
        phase: _survState.phase,
        stage: _survState.stage,
        team: [],
        hp: {},
        maxPhase: _survState.maxPhase || 1,
        bonusCarry: _survState.bonusCarry || 0
      });
      var blockedRef = window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/survivorBlocked');
      window._fbSet(blockedRef, blockedObj);
    }

    // Mostra transição com HP antes da reseleção
    _survShowTransition(false, false);
    return;
  }
}

// ── Survivor: tela de transição com HP + save antes do mapa ──
function _survShowTransition(victory, changedPhase, completedStage) {
  showScreen('survivor-map');
  playTelaMusic();
  var mapContent = document.getElementById('surv-map-content');
  var trans = document.getElementById('surv-map-transition');
  if (mapContent) mapContent.style.display = 'none';

  var p = _survPhases[_survState.phase - 1];
  trans.style.display = 'flex';
  trans.style.flexDirection = 'column';
  trans.style.alignItems = 'center';
  trans.style.justifyContent = 'center';
  trans.style.minHeight = '70vh';

  // Monta resumo dos chars com barras de HP
  var hpHtml = _survState.team.map(function(id) {
    var hp = _survState.hp[id];
    if (!hp) return '';
    var ch = CHARS.find(function(c) { return c.id === id; });
    var name = ch ? ch.name.split(' ')[0].toUpperCase() : id;
    var alive = hp.cur > 0;
    var pct = Math.round(hp.cur / hp.max * 100);
    var color = !alive ? '#d04050' : pct > 60 ? '#5ac880' : pct > 30 ? '#d0a040' : '#d04050';
    return '<div style="display:flex;align-items:center;gap:8px;' + (!alive ? 'filter:grayscale(1);opacity:0.4;' : '') + '">' +
      '<span style="font-family:Cinzel,serif;font-size:10px;color:' + color + ';min-width:70px">' + name + '</span>' +
      '<div style="flex:1;height:6px;background:var(--bg);border-radius:3px;overflow:hidden;min-width:80px">' +
        '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px"></div>' +
      '</div>' +
      '<span style="font-size:9px;color:' + color + '">' + (alive ? hp.cur + '/' + hp.max : '☠️') + '</span>' +
    '</div>';
  }).join('');

  // Monta HTML de drop (se houver)
  var dropHtml = '';
  var coinsEarned = window._survLastCoins || 0;
  if (victory && coinsEarned > 0) {
    dropHtml += '<div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.25);border-radius:10px;padding:10px 14px;text-align:center;margin-bottom:10px;width:min(280px,80vw)">' +
      '<div style="font-family:Cinzel,serif;font-size:13px;color:var(--gold)">+' + coinsEarned + ' 🪙</div>' +
    '</div>';
    window._survLastCoins = 0;
  }
  var droppedItem = window._survLastDrop;
  var droppedArtefato = window._survLastArtefato;
  if (victory && droppedItem) {
    var valDisplay = droppedItem.prefix === 'PVS' ? '+' + droppedItem.prefixVal : '+' + droppedItem.prefixVal;
    dropHtml += '<div style="background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);border-radius:10px;padding:12px;text-align:center;margin-bottom:12px;width:min(280px,80vw)">' +
      '<div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:2px;color:var(--gold);margin-bottom:6px">⚜ ITEM DROPADO!</div>' +
      '<div style="font-family:Cinzel,serif;font-size:12px;color:var(--gold)">' + (droppedItem.name || ('Tier ' + droppedItem.tier)) + '</div>' +
      '<div style="font-size:10px;color:var(--text)">' + droppedItem.prefix + ' ' + valDisplay + '</div>' +
    '</div>';
  }
  if (victory && droppedArtefato) {
    dropHtml += '<div style="background:rgba(144,96,208,0.1);border:1px solid rgba(144,96,208,0.3);border-radius:10px;padding:12px;text-align:center;margin-bottom:12px;width:min(280px,80vw)">' +
      '<div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:2px;color:#9060d0;margin-bottom:6px">🔮 ARTEFATO DROPADO!</div>' +
      '<div style="font-family:Cinzel,serif;font-size:12px;color:#9060d0">' + droppedArtefato.name + '</div>' +
      '<div style="font-size:10px;color:var(--text)">' + (droppedArtefato.desc || '') + '</div>' +
    '</div>';
  }
  // Limpa drops
  if (victory && droppedArtefato && _equipLoaded) {
    var _artCopias = _playerArtefatos.filter(function(pa) { return pa.id === droppedArtefato.id; }).length;
    if (_artCopias < 2) {
      _playerArtefatos.push({ id: droppedArtefato.id });
      _equipSaveArtefatos();
      addLog('🔮 Artefato adicionado ao inventário: ' + droppedArtefato.name + ' (' + (_artCopias + 1) + '/2)', 'info');
    } else {
      addLog('🔮 Limite atingido: você já possui 2 cópias de ' + droppedArtefato.name + '. Artefato perdido.', 'info');
    }
  }
  window._survLastDrop = null;
  window._survLastArtefato = null;

  trans.innerHTML =
    '<div style="font-family:Cinzel,serif;font-size:11px;letter-spacing:3px;color:' + (victory ? '#5ac880' : '#d04050') + ';margin-bottom:16px">' + (victory ? '⚔ VITÓRIA' : '💀 DERROTA') + '</div>' +
    '<div style="width:min(280px,80vw);display:flex;flex-direction:column;gap:8px;margin-bottom:20px">' + hpHtml + '</div>' +
    dropHtml +
    '<div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:2px;color:var(--text2);animation:survPulse 1.5s ease-in-out infinite">SALVANDO...</div>';

  // Após 1.5s: recuperação na etapa 5, ou mostra mapa
  setTimeout(function() {
    if (victory && completedStage === 5) {
      // ── Recuperação: mostra sprites e permite escolher 1 personagem ──
      _survShowRecovery(trans, mapContent, p, changedPhase);
    } else if (victory) {
      _survTransitionToMap(trans, mapContent, p, changedPhase);
    } else {
      _survGoToReselect();
    }
  }, 1500);
}

// ── Survivor: tela de recuperação da etapa 5 ──
function _survShowRecovery(trans, mapContent, phase, changedPhase) {
  var cardsHtml = _survState.team.map(function(id) {
    var hp = _survState.hp[id];
    if (!hp) return '';
    var ch = CHARS.find(function(c) { return c.id === id; });
    if (!ch) return '';
    var name = ch.name.split(' ')[0].toUpperCase();
    var alive = hp.cur > 0;
    var pct = Math.round(hp.cur / hp.max * 100);
    var color = !alive ? '#d04050' : pct > 60 ? '#5ac880' : pct > 30 ? '#d0a040' : '#d04050';
    var spriteSrc = getCharSprite(ch.id, 'idle');
    var spriteImg = spriteSrc
      ? '<img src="' + spriteSrc + '" style="width:64px;height:64px;object-fit:contain" onerror="this.style.display=\'none\'">'
      : '<div style="width:64px;height:64px;display:flex;align-items:center;justify-content:center;font-size:28px;color:var(--text2)">?</div>';
    var fullHp = hp.cur === hp.max && alive;
    var cardStyle = 'display:flex;flex-direction:column;align-items:center;gap:6px;padding:12px 10px;' +
      'background:var(--bg2);border:2px solid ' + (alive ? 'var(--border)' : '#6a2020') + ';border-radius:12px;' +
      'cursor:' + (fullHp ? 'default' : 'pointer') + ';' +
      'opacity:' + (fullHp ? '0.4' : '1') + ';' +
      'pointer-events:' + (fullHp ? 'none' : 'auto') + ';' +
      (!alive ? 'filter:grayscale(0.7);' : '') +
      'transition:all 0.2s;min-width:90px;';
    return '<div style="' + cardStyle + '" onclick="_survRecoveryPick(\'' + id + '\')">' +
      spriteImg +
      '<div style="font-family:Cinzel,serif;font-size:9px;color:' + color + ';letter-spacing:1px">' + name + '</div>' +
      '<div style="width:100%;height:5px;background:var(--bg);border-radius:3px;overflow:hidden">' +
        '<div style="height:100%;width:' + pct + '%;background:' + color + ';border-radius:3px"></div>' +
      '</div>' +
      '<div style="font-size:8px;color:' + color + '">' + (alive ? hp.cur + '/' + hp.max : '☠️ MORTO') + '</div>' +
    '</div>';
  }).join('');

  trans.innerHTML =
    '<div style="font-family:Cinzel,serif;font-size:13px;letter-spacing:3px;color:#5ac880;margin-bottom:6px">💚 RECUPERAÇÃO</div>' +
    '<div style="font-family:Cinzel,serif;font-size:9px;letter-spacing:1px;color:var(--text2);margin-bottom:20px;text-align:center">Escolha um personagem para recuperar<br>vida completa ou reviver.</div>' +
    '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">' + cardsHtml + '</div>' +
    '<div onclick="_survRecoverySkip()" style="margin-top:20px;font-family:Cinzel,serif;font-size:10px;letter-spacing:2px;color:var(--text2);cursor:pointer;padding:8px 16px;border:1px solid var(--border);border-radius:8px;background:var(--bg2)">PULAR ›</div>';

  // Guarda dados pra usar no pick
  window._survRecoveryCtx = { trans: trans, mapContent: mapContent, phase: phase, changedPhase: changedPhase };
}

function _survRecoverySkip() {
  var ctx = window._survRecoveryCtx;
  delete window._survRecoveryCtx;
  if (ctx) {
    _survTransitionToMap(ctx.trans, ctx.mapContent, ctx.phase, ctx.changedPhase);
  }
}

function _survRecoveryPick(charId) {
  if (!_survState || !_survState.hp[charId]) return;
  var hp = _survState.hp[charId];
  var ch = CHARS.find(function(c) { return c.id === charId; });
  if (!ch) return;

  // Recupera vida completa ou revive
  _survState.hp[charId] = { cur: hp.max, max: hp.max };

  // Salva no Firebase
  var user = window._fbUser;
  if (user) {
    var stateRef = window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/survivorState');
    window._fbSet(stateRef, {
      phase: _survState.phase,
      stage: _survState.stage,
      team: _survState.team,
      hp: _survState.hp
    });
  }

  // Segue pro mapa
  var ctx = window._survRecoveryCtx;
  delete window._survRecoveryCtx;
  if (ctx) {
    _survTransitionToMap(ctx.trans, ctx.mapContent, ctx.phase, ctx.changedPhase);
  }
}

// ── Survivor: transição final pro mapa ──
function _survTransitionToMap(trans, mapContent, phase, changedPhase) {
  if (changedPhase) {
    _survShowMap();
  } else {
    trans.style.minHeight = 'auto';
    trans.innerHTML = '<div class="surv-map-title" style="color:' + phase.color + '">FASE TIER ' + phase.tier + '</div>' +
      '<div class="surv-map-sub">' + phase.name + '</div>';
    if (mapContent) mapContent.style.display = 'flex';
    _survRenderMap();
  }
}

function _survForfeit() {
  if (!confirm('Desistir do Survivor?\nSeu time será bloqueado por 2 minutos.')) return;
  var user = window._fbUser;
  var team = _survState ? _survState.team.slice() : [];
  if (user && team.length > 0) {
    // Bloqueia todo o time por 2 minutos
    var expireAt = Date.now() + 2 * 60 * 1000;
    var blockedObj = {};
    team.forEach(function(id) { blockedObj[id] = expireAt; });
    window._fbSet(window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/survivorBlocked'), blockedObj);
    // Mantém progresso, limpa só time e hp
    var stateRef = window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/survivorState');
    window._fbSet(stateRef, {
      phase: _survState.phase,
      stage: _survState.stage,
      maxPhase: _survState.maxPhase || 1,
      bonusCarry: _survState.bonusCarry || 0,
      team: [],
      hp: {}
    });
  }
  // Mantém progresso em memória, limpa time
  if (_survState) {
    _survState.team = [];
    _survState.hp = {};
  }
  _survSelected = [];
  _survDefeatedIds = team;
  openSurvivor();
}

function _survGoToReselect() {
  // Volta pra tela de selecao preservando tier e HP dos vivos
  showScreen('survivor');
  var photo = document.getElementById('surv-photo');
  var nameEl = document.getElementById('surv-name');
  var user = window._fbUser;
  if (user) {
    if (photo) photo.src = user.photoURL || '';
    if (nameEl) nameEl.textContent = user.displayName || 'Jogador';
  }
  _survRenderGrid();
  _survUpdateSlots();
  // Aviso de game over
  var hint = document.getElementById('surv-hint');
  if (hint) {
    hint.textContent = '❌ Game Over! Personagens ☠️ estão bloqueados. Monte novo time.';
    hint.style.color = '#d46060';
  }
}


function openHubAccount() {
