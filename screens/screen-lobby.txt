function openHubAccount() {
  var overlay = document.getElementById('hub-account-overlay');
  if (!overlay) return;
  var user = window._fbUser;
  var loginDiv = document.getElementById('hub-acc-login');
  var contentDiv = document.getElementById('hub-acc-content');
  if (user) {
    loginDiv.style.display = 'none';
    contentDiv.style.display = 'flex';
    var photo = document.getElementById('hub-acc-photo');
    var name = document.getElementById('hub-acc-name');
    if (photo) photo.src = user.photoURL || '';
    if (name) name.textContent = user.displayName || 'Jogador';
    // Load stats from Firebase
    var uid = user.uid;
    if (window._fbDb && window._fbRef && window._fbGet) {
      window._fbGet(window._fbRef(window._fbDb, 'jogadores/' + uid)).then(function(snap) {
        var d = snap.exists() ? snap.val() : {};
        var coins = document.getElementById('hub-acc-coins');
        var rp = document.getElementById('hub-acc-rp');
        var wins = document.getElementById('hub-acc-wins');
        var losses = document.getElementById('hub-acc-losses');
        if (coins) coins.textContent = d.coins || 0;
        if (rp) rp.textContent = d.rp || 0;
        if (wins) wins.textContent = d.wins || 0;
        if (losses) losses.textContent = d.losses || 0;
      }).catch(function() {});
    }
  } else {
    loginDiv.style.display = 'block';
    contentDiv.style.display = 'none';
  }
  overlay.style.display = 'flex';
}
function closeHubAccount() {
  var el = document.getElementById('hub-account-overlay');
  if (el) el.style.display = 'none';
}

function closeLobby() {
  _detachRoomsListener();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-hub').classList.add('active');
}

// ── Abas Casual / Ranked ──
function lobbyTab(tab) {
  _lobbyTab = tab;
  // v1.92: lobby simplificado — só aba Ranked/Arena
  var rc = document.getElementById('lobby-content-ranked');
  if (rc) rc.style.display = 'flex';
}

// ── Lista de salas com listener realtime ──
function _detachRoomsListener() {
  if (_roomsListener) { _roomsListener(); _roomsListener = null; }
}

function refreshRooms(tab) {
  _detachRoomsListener();
  const listEl = document.getElementById('rooms-list-' + tab);
  if (!listEl) return;
  listEl.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text2);font-size:11px">Carregando...</div>';
  const roomsRef = window._fbRef(window._fbDb, 'salas');
  _roomsListener = window._fbOnValue(roomsRef, snap => {
    listEl.innerHTML = '';
    if (!snap.exists()) {
      listEl.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text2);font-size:11px">Nenhuma sala aberta.</div>';
      return;
    }
    const salas = snap.val();
    const abertas = Object.entries(salas).filter(([id, s]) =>
      s.mode === tab && s.status === 'waiting' && s.host
    );
    if (!abertas.length) {
      listEl.innerHTML = '<div style="text-align:center;padding:24px;color:var(--text2);font-size:11px">Nenhuma sala aberta.</div>';
      return;
    }
    abertas.forEach(([id, sala]) => {
      const isRanked = tab === 'ranked';
      const border = isRanked ? '#2a3a5a' : 'var(--border)';
      const nameColor = isRanked ? '#7aade8' : 'var(--gold)';
      const hostName = isRanked ? 'Anônimo' : (sala.host.nome || 'Jogador');
      const row = document.createElement('div');
      row.style.cssText = `background:var(--bg2);border:1px solid ${border};border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:10px;cursor:pointer`;
      row.innerHTML = `
        <div style="width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,0.06);border:1px solid ${border};display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">${isRanked ? '🔒' : '🎮'}</div>
        <div style="flex:1;min-width:0">
          <div style="font-family:'Cinzel',serif;font-size:11px;color:${nameColor};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${hostName}</div>
          <div style="font-size:9px;color:var(--text2);margin-top:2px">${isRanked ? '' : `RP: ${sala.host.rp || 0} · `}1 / 2 jogadores</div>
        </div>
        <button onclick="joinRoom('${id}')" style="background:${isRanked ? 'linear-gradient(135deg,#4c7bc9,#1a3060)' : 'linear-gradient(135deg,var(--gold),#7a5a10)'};color:${isRanked ? 'var(--text)' : '#1a1000'};border:none;border-radius:6px;padding:7px 12px;font-family:'Cinzel',serif;font-size:10px;letter-spacing:1px;cursor:pointer;flex-shrink:0">ENTRAR</button>
      `;
      listEl.appendChild(row);
    });
  });
}

// ── Criar sala ──
function createRoom(mode) {
  const user = window._fbUser;
  if (!user) { alert('Faça login!'); return; }
  window._fbGet(window._fbRef(window._fbDb, 'jogadores/' + user.uid)).then(snap => {
    const d = snap.exists() ? snap.val() : {};
    const salasRef = window._fbRef(window._fbDb, 'salas');
    const novaRef  = window._fbPush(salasRef);
    const salaId   = novaRef.key;
    const sala = {
      mode,
      status: 'waiting',
      criadaEm: Date.now(),
      host: {
        uid:  user.uid,
        nome: mode === 'ranked' ? 'Anônimo' : (user.displayName || 'Jogador'),
        foto: mode === 'ranked' ? '' : (user.photoURL || ''),
        rp:   d.rp || 0
      }
    };
    window._fbSet(novaRef, sala).then(() => {
      // Apaga sala automaticamente se host desconectar
      window._fbOnDisconnect(novaRef).remove();
      _currentRoomId = salaId;
      _isHost = true;
      openRoomScreen(salaId, sala, true);
    });
  });
}

// ── Entrar em sala ──
function joinRoom(salaId) {
  const user = window._fbUser;
  if (!user) { alert('Faça login!'); return; }
  window._fbGet(window._fbRef(window._fbDb, 'jogadores/' + user.uid)).then(snap => {
    const d = snap.exists() ? snap.val() : {};
    const salaRef   = window._fbRef(window._fbDb, 'salas/' + salaId);
    const guestRef  = window._fbRef(window._fbDb, 'salas/' + salaId + '/guest');
    window._fbGet(salaRef).then(snap2 => {
      if (!snap2.exists()) { alert('Sala não encontrada!'); return; }
      const sala = snap2.val();
      if (sala.status !== 'waiting') { alert('Sala já iniciada!'); return; }
      if (sala.guest) { alert('Sala cheia!'); return; }
      const guest = {
        uid:  user.uid,
        nome: sala.mode === 'ranked' ? 'Anônimo' : (user.displayName || 'Jogador'),
        foto: sala.mode === 'ranked' ? '' : (user.photoURL || ''),
        rp:   d.rp || 0
      };
      window._fbSet(guestRef, guest).then(() => {
        window._fbOnDisconnect(guestRef).remove();
        _currentRoomId = salaId;
        _isHost = false;
        openRoomScreen(salaId, sala, false);
      });
    });
  });
}

// ── Abre tela da sala e escuta mudanças ──
function openRoomScreen(salaId, salaInicial, isHost) {
  _detachRoomsListener();
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-room').classList.add('active');

  const isRanked = salaInicial.mode === 'ranked';
  document.getElementById('room-header-title').textContent = isRanked ? 'SALA RANKED' : 'SALA CASUAL';
  document.getElementById('room-mode-badge').textContent   = isRanked ? '🏆 RANKED' : '🎮 CASUAL';

  _renderRoomHost(salaInicial.host, isRanked);

  // Escuta a sala em realtime
  const salaRef = window._fbRef(window._fbDb, 'salas/' + salaId);
  _roomListener = window._fbOnValue(salaRef, snap => {
    if (!snap.exists()) {
      // Sala deletada — host saiu
      _leaveRoomCleanup();
      alert('O host encerrou a sala.');
      openLobby();
      return;
    }
    const sala = snap.val();
    _renderRoomHost(sala.host, isRanked);

    // Status mudou para draft — ambos vão pro draft
    if (sala.status === 'drafting') {
      _stopCountdown();
      _detachRoomListener();
      _enterDraft(salaId, sala);
      return;
    }

    if (sala.guest) {
      _renderRoomGuest(sala.guest, isRanked);
      // Inicia countdown nos DOIS lados se ainda não iniciou
      if (!_countdownTimer) _startCountdown(salaId);
    } else {
      _clearGuestArea();
      _stopCountdown();
    }
  });
}

function _renderRoomHost(host, isRanked) {
  document.getElementById('room-host-photo').src = isRanked ? '' : (host.foto || '');
  document.getElementById('room-host-name').textContent = host.nome || 'Jogador';
  document.getElementById('room-host-rp').textContent   = `🏆 ${host.rp || 0} RP`;
}

function _renderRoomGuest(guest, isRanked) {
  const area = document.getElementById('room-guest-area');
  area.innerHTML = `
    <img src="${isRanked ? '' : (guest.foto || '')}" style="width:36px;height:36px;border-radius:50%;border:2px solid var(--blue);object-fit:cover;background:var(--bg3)">
    <div>
      <div style="font-family:'Cinzel',serif;font-size:12px;color:var(--text)">${guest.nome || 'Jogador'}</div>
      <div style="font-size:10px;color:#7aade8;margin-top:2px">🏆 ${guest.rp || 0} RP</div>
    </div>
    <span style="margin-left:auto;font-size:16px">⚔</span>
  `;
}

function _clearGuestArea() {
  document.getElementById('room-guest-area').innerHTML = `
    <div style="width:36px;height:36px;border-radius:50%;border:2px dashed var(--border);display:flex;align-items:center;justify-content:center;font-size:18px">⏳</div>
    <div style="font-size:11px;color:var(--text2)">Aguardando oponente...</div>
  `;
}

// ── Countdown 10s — roda nos dois lados, só host escreve no Firebase ──
function _startCountdown(salaId) {
  _countdownVal = 10;
  document.getElementById('room-countdown-area').style.display = 'block';
  document.getElementById('room-countdown-num').textContent = _countdownVal;
  document.getElementById('room-status-msg').textContent = '';

  _countdownTimer = setInterval(() => {
    _countdownVal--;
    document.getElementById('room-countdown-num').textContent = _countdownVal;
    if (_countdownVal <= 0) {
      _stopCountdown();
      // Só o host muda o status — o guest detecta via listener
      if (_isHost) {
        window._fbSet(window._fbRef(window._fbDb, 'salas/' + salaId + '/status'), 'drafting');
      }
    }
  }, 1000);
}

// ── Entra no draft — chamado nos dois lados quando status === 'drafting' ──
function _enterDraft(salaId, sala) {
  // Determina quem é P1/P2 do ponto de vista do Firebase
  const myUid   = window._fbUser?.uid;
  const myRole  = sala.host.uid === myUid ? 'p1' : 'p2';

  // Abre tela de draft
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-draft').classList.add('active');

  // Fotos e nomes
  document.getElementById('draft-p1-photo').src = sala.host.foto || '';
  document.getElementById('draft-p1-name').textContent = sala.host.nome || 'Host';
  document.getElementById('draft-p2-photo').src = sala.guest?.foto || '';
  document.getElementById('draft-p2-name').textContent = sala.guest?.nome || 'Guest';

  // Carrega roster do jogador local do Firebase
  window._fbGet(window._fbRef(window._fbDb, 'jogadores/' + myUid)).then(snap => {
    const d = snap.exists() ? snap.val() : {};
    const myRoster = d.roster || [];
    _startDraftListener(salaId, sala, myRole, myRoster);
  });
}

// ══ DRAFT STATE ══
let _draftListener  = null;
let _draftTimer     = null;
let _draftSalaId    = null;
let _draftMyRole    = null;
let _draftMyRoster  = [];

function _startDraftListener(salaId, sala, myRole, myRoster) {
  _draftSalaId   = salaId;
  _draftMyRole   = myRole;
  _draftMyRoster = myRoster;

  // Inicializa estrutura do draft no Firebase (só o host, uma vez)
  const draftRef = window._fbRef(window._fbDb, 'salas/' + salaId + '/draft');
  window._fbGet(draftRef).then(snap => {
    if (!snap.exists() && _isHost) {
      // Sorteia quem começa — 50/50
      const first = Math.random() < 0.5 ? 'p1' : 'p2';
      window._fbSet(draftRef, {
        turn: 0,
        first,
        picks: { p1: [], p2: [] }
      });
    }
  });

  // Escuta mudanças no draft em realtime
  _draftListener = window._fbOnValue(draftRef, snap => {
    if (!snap.exists()) return;
    const draft = snap.val();
    _renderDraft(draft, salaId, myRole, myRoster);
  });
}

// Ordem de picks: 0→p1,1→p2,2→p1,3→p2,4→p1,5→p2 (invertido se first=p2)
function _draftTurnOwner(draft) {
  const order = ['p1','p2','p1','p2','p1','p2'];
  const turn  = draft.turn || 0;
  if (turn >= 6) return null;
  const raw = order[turn];
  // Se first=p2, inverte p1↔p2
  if (draft.first === 'p2') return raw === 'p1' ? 'p2' : 'p1';
  return raw;
}

function _renderDraft(draft, salaId, myRole, myRoster) {
  const turn       = draft.turn || 0;
  const picks      = draft.picks || { p1:[], p2:[] };
  const p1picks    = picks.p1 || [];
  const p2picks    = picks.p2 || [];
  const allPicked  = [...p1picks, ...p2picks];
  const turnOwner  = _draftTurnOwner(draft);
  const isMyTurn   = turnOwner === myRole;
  const isDone     = turn >= 6;

  // Label do turno
  const label = isDone ? 'DRAFT CONCLUÍDO' :
    isMyTurn ? 'SUA VEZ DE ESCOLHER' :
    'VEZ DO OPONENTE';
  document.getElementById('draft-turn-label').textContent = label;
  document.getElementById('draft-turn-label').style.color = isMyTurn ? 'var(--gold)' : 'var(--text2)';
  document.getElementById('draft-pick-count').textContent = turn + '/6';

  // Slots P1
  p1picks.forEach((id, i) => {
    const c   = LOJA_CHARS.find(x => x.id === id);
    const el  = document.getElementById('draft-p1-slot-' + i);
    if (el && c) { el.textContent = c.name; el.classList.add('filled'); }
  });
  // Slots P2
  p2picks.forEach((id, i) => {
    const c   = LOJA_CHARS.find(x => x.id === id);
    const el  = document.getElementById('draft-p2-slot-' + i);
    if (el && c) { el.textContent = c.name; el.classList.add('filled'); }
  });

  // Instrução + random btn
  document.getElementById('draft-instruction').textContent =
    isDone ? 'Preparando batalha...' :
    isMyTurn ? 'Escolha seu personagem:' : 'Aguarde o oponente...';
  document.getElementById('draft-random-btn').style.display = (isMyTurn && !isDone) ? 'block' : 'none';

  // Grid de personagens
  _renderDraftGrid(allPicked, myRoster, isMyTurn && !isDone, salaId, draft);

  // Timer
  _stopDraftTimer();
  if (!isDone) {
    _startDraftTimer(30, isMyTurn, salaId, draft, myRoster, allPicked);
  } else {
    // Draft completo — inicia batalha após delay
    setTimeout(() => _startPvpBattle(salaId, draft), 2000);
  }
}

function _renderDraftGrid(allPicked, myRoster, canPick, salaId, draft) {
  const grid = document.getElementById('draft-char-grid');
  grid.innerHTML = '';
  LOJA_CHARS.forEach(c => {
    const isPicked   = allPicked.includes(c.id);
    const isOwned    = myRoster.includes(c.id);
    const suitColor  = SUIT_COLORS[c.suit] || '#c9a84c';
    const suitSym    = SUIT_SYMBOLS[c.suit] || '◆';

    let cls = 'draft-char-card';
    if (isPicked)       cls += ' picked';
    else if (!isOwned)  cls += ' locked';
    else if (canPick)   cls += ' selectable';

    const lockIcon = !isOwned && !isPicked ? '<span class="lock-icon">🔒</span>' : '';
    const avatar   = c.sprite
      ? `<img src="sprites/${c.id}/idle.png" style="width:48px;height:48px;object-fit:cover;image-rendering:pixelated;border-radius:4px" onerror="this.style.display='none'">`
      : `<div style="width:48px;height:48px;border-radius:4px;background:rgba(255,255,255,0.04);border:1px solid ${suitColor}44;display:flex;align-items:center;justify-content:center"><span style="font-size:22px;color:${suitColor}">${suitSym}</span></div>`;

    const card = document.createElement('div');
    card.className = cls;
    card.innerHTML = `
      ${lockIcon}
      ${avatar}
      <div style="font-family:'Cinzel',serif;font-size:8px;color:${isPicked ? '#555' : suitColor};text-align:center;line-height:1.2">${c.name}</div>
      <div style="font-size:8px;color:var(--text2)">${suitSym} ${c.sub || c.suit}</div>
    `;
    if (canPick && isOwned && !isPicked) {
      card.onclick = () => _draftPick(c.id, salaId, draft);
    }
    grid.appendChild(card);
  });
}

// ── Timer do draft ──
function _startDraftTimer(seconds, isMyTurn, salaId, draft, myRoster, allPicked) {
  let val = seconds;
  document.getElementById('draft-timer-num').textContent = val;
  document.getElementById('draft-timer-bar').style.width = '100%';
  document.getElementById('draft-timer-bar').style.background = 'var(--gold)';

  _draftTimer = setInterval(() => {
    val--;
    document.getElementById('draft-timer-num').textContent = val;
    document.getElementById('draft-timer-bar').style.width = (val / seconds * 100) + '%';
    if (val <= 10) document.getElementById('draft-timer-bar').style.background = '#d45050';

    if (val <= 0) {
      _stopDraftTimer();
      // Auto-pick aleatório — só quem é da vez executa
      if (isMyTurn) {
        const available = LOJA_CHARS.filter(c => myRoster.includes(c.id) && !allPicked.includes(c.id));
        if (available.length) {
          const rand = available[Math.floor(Math.random() * available.length)];
          _draftPick(rand.id, salaId, draft);
        }
      }
    }
  }, 1000);
}

function _stopDraftTimer() {
  if (_draftTimer) { clearInterval(_draftTimer); _draftTimer = null; }
}

// ── Confirma um pick no Firebase ──
function _draftPick(charId, salaId, draft) {
  _stopDraftTimer();
  const owner  = _draftTurnOwner(draft);
  if (!owner) return;
  var draftChar = CHARS.find(function(c){ return c.id === charId; });
  _logEvent('Draft pick: ' + (draftChar ? draftChar.name : charId) + ' (owner: ' + owner + ')', 'DRAFT');
  const picks  = draft.picks || { p1:[], p2:[] };
  const p1     = [...(picks.p1 || [])];
  const p2     = [...(picks.p2 || [])];
  if (owner === 'p1') p1.push(charId);
  else p2.push(charId);

  window._fbSet(window._fbRef(window._fbDb, 'salas/' + salaId + '/draft'), {
    ...draft,
    turn: (draft.turn || 0) + 1,
    picks: { p1, p2 }
  });
}

// Botão random
function draftPickRandom() {
  const salaRef = window._fbRef(window._fbDb, 'salas/' + _draftSalaId + '/draft');
  window._fbGet(salaRef).then(snap => {
    if (!snap.exists()) return;
    const draft     = snap.val();
    const allPicked = [...(draft.picks?.p1 || []), ...(draft.picks?.p2 || [])];
    const available = LOJA_CHARS.filter(c => _draftMyRoster.includes(c.id) && !allPicked.includes(c.id));
    if (available.length) {
      const rand = available[Math.floor(Math.random() * available.length)];
      _draftPick(rand.id, _draftSalaId, draft);
    }
  });
}

// ── Finaliza draft e inicia batalha PvP local ──
function _startPvpBattle(salaId, draft) {
  _logEvent('_startPvpBattle — sala: ' + salaId, 'PVP');
  _stopDraftTimer();
  if (_draftListener) { _draftListener(); _draftListener = null; }

  const myUid  = window._fbUser?.uid;
  const sala   = draft._sala; // guardado abaixo
  const p1ids  = draft.picks?.p1 || [];
  const p2ids  = draft.picks?.p2 || [];

  // Lê a sala pra saber quem é host/guest
  window._fbGet(window._fbRef(window._fbDb, 'salas/' + salaId)).then(snap => {
    if (!snap.exists()) return;
    const salaData = snap.val();
    const isHost   = salaData.host.uid === myUid;

    // Meu time e time do oponente
    const myIds  = isHost ? p1ids : p2ids;
    const oppIds = isHost ? p2ids : p1ids;

    // Converte IDs em objetos de CHARS
    const myChars  = myIds.map(id => CHARS.find(c => c.id === id)).filter(Boolean);
    const oppChars = oppIds.map(id => CHARS.find(c => c.id === id)).filter(Boolean);

    if (myChars.length < 3 || oppChars.length < 3) {
      alert('Erro: times incompletos.'); return;
    }

    // Marca partida como playing no Firebase
    window._fbSet(window._fbRef(window._fbDb, 'salas/' + salaId + '/status'), 'playing');

    // Guarda contexto PvP ANTES de conectar — precisa estar pronto quando room_ready chegar
    window._pvpContext = {
      salaId,
      myUid,
      isHost,
      p1ids,
      p2ids,
      isRanked: salaData.mode === 'ranked'
    };

    // ── Fase 1: Conecta ao servidor Railway via WebSocket ──
    _detachRoomListener(); // Firebase não interfere mais a partir daqui

    // Guarda chars no contexto pra usar quando battle_started chegar
    window._pvpContext.myChars = myChars;
    window._pvpContext.oppChars = oppChars;

    // Mostra tela de loading PvP
    var loadOv = document.getElementById('pvp-loading-overlay');
    if (loadOv) { loadOv.style.display = 'flex'; }
    var loadText = document.getElementById('pvp-loading-text');
    if (loadText) loadText.textContent = 'Conectando ao servidor...';

    // Timeout de segurança — 20s sem resposta mostra botão de cancelar
    window._pvpLoadingTimeout = setTimeout(function() {
      var cancelBtn = document.getElementById('pvp-loading-cancel');
      if (cancelBtn) cancelBtn.style.display = 'block';
    }, 20000);

    // Conecta ao Railway — battle_started vai disparar a tela de batalha
    pvpConnect(salaId);
  });
}

function _hidePvpLoading() {
  var loadOv = document.getElementById('pvp-loading-overlay');
  if (loadOv) loadOv.style.display = 'none';
  if (window._pvpLoadingTimeout) { clearTimeout(window._pvpLoadingTimeout); window._pvpLoadingTimeout = null; }
}

function _cancelPvpLoading() {
  _fullPvpCleanup();
  openLobby();
}

function _stopCountdown() {
  if (_countdownTimer) { clearInterval(_countdownTimer); _countdownTimer = null; }
  const el = document.getElementById('room-countdown-area');
  if (el) el.style.display = 'none';
}

// ── Cancelar sala ──
function cancelRoom() {
  if (!_currentRoomId) { openLobby(); return; }
  _stopCountdown();
  _detachRoomListener();
  const salaRef = window._fbRef(window._fbDb, 'salas/' + _currentRoomId);
  if (_isHost) {
    // Host destrói a sala
    window._fbRemove(salaRef).then(() => {
      _leaveRoomCleanup();
      openLobby();
    });
  } else {
    // Guest só sai — remove apenas o campo guest
    const guestRef = window._fbRef(window._fbDb, 'salas/' + _currentRoomId + '/guest');
    window._fbRemove(guestRef).then(() => {
      _leaveRoomCleanup();
      openLobby();
    });
  }
}

function _detachRoomListener() {
  if (_roomListener) { _roomListener(); _roomListener = null; }
}

function _leaveRoomCleanup() {
  _currentRoomId = null;
  _isHost = false;
  _introRunning = false;
  _pendingInitiativeResult = null;
  _stopCountdown();
  _detachRoomListener();
}

// ── Ranking ──
function openRanking() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-ranking').classList.add('active');
  _loadRanking();
}

function closeRanking() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-lobby').classList.add('active');
}

function _loadRanking() {
  const listEl = document.getElementById('ranking-list');
  listEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text2);font-size:11px">Carregando...</div>';
  window._fbGet(window._fbRef(window._fbDb, 'jogadores')).then(snap => {
    if (!snap.exists()) { listEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text2);font-size:11px">Sem dados ainda.</div>'; return; }
    const jogadores = Object.entries(snap.val())
      .map(([uid, d]) => ({ uid, ...d }))
      .filter(d => d.rp !== undefined)
      .sort((a, b) => (b.rp || 0) - (a.rp || 0));

    const myUid = window._fbUser?.uid;
    listEl.innerHTML = '';
    jogadores.forEach((j, idx) => {
      const isMe = j.uid === myUid;
      const pos  = idx + 1;
      const medal = pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `#${pos}`;
      const row = document.createElement('div');
      row.style.cssText = `background:${isMe ? 'rgba(201,168,76,0.08)' : 'var(--bg2)'};border:1px solid ${isMe ? 'rgba(201,168,76,0.4)' : 'var(--border)'};border-radius:8px;padding:10px 12px;display:flex;align-items:center;gap:10px`;
      row.innerHTML = `
        <div style="font-family:'Cinzel',serif;font-size:14px;width:28px;text-align:center;flex-shrink:0">${medal}</div>
        <img src="${j.foto || ''}" style="width:32px;height:32px;border-radius:50%;border:1px solid var(--border);object-fit:cover;background:var(--bg3);flex-shrink:0">
        <div style="flex:1;min-width:0">
          <div style="font-family:'Cinzel',serif;font-size:11px;color:${isMe ? 'var(--gold)' : 'var(--text)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${j.nome || 'Jogador'}${isMe ? ' (você)' : ''}</div>
          <div style="font-size:9px;color:var(--text2);margin-top:2px">✅ ${j.vitorias || 0}V · ❌ ${j.derrotas || 0}D</div>
        </div>
        <div style="font-family:'Cinzel',serif;font-size:13px;color:#7aade8;flex-shrink:0">${j.rp || 0} RP</div>
      `;
      listEl.appendChild(row);
    });
    if (!jogadores.length) listEl.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text2);font-size:11px">Nenhum jogador ainda.</div>';
  });
}

// Stubs removidos — substituídos pela implementação real
function findMatch(mode) { createRoom(mode); }
function openCasualRooms() { lobbyTab('casual'); }
function openRankedRooms() { lobbyTab('ranked'); }

// ══════════════════════════════════════════════════
// PATF TCG — WebSocket PvP (Fase 1: Conexão básica)
// ══════════════════════════════════════════════════
const WS_SERVER = 'wss://patf-server-production.up.railway.app';
let _pvpSocket = null;

function processPvpNextTurn(msg) {
  // v1.90: sincroniza state do servidor antes de processar o turno
  applyServerState(msg.state);

  var charId = msg.charId;
  var owner  = msg.owner;

  var localOwner = _isHost ? owner : (owner === 'p1' ? 'p2' : 'p1');
  var idx = G.order.findIndex(function(e) {
    return e.ch.id === charId && e.o === localOwner;
  });

  if (idx !== -1) {
    G.orderIdx = idx;
  }

  var allCharsNT = [...G.p1.chars, ...G.p2.chars];
  var ntCh = allCharsNT.find(function(c) { return c.id === charId; });

  if (ntCh && msg.curDef !== null && msg.curDef !== undefined) ntCh.curDef = msg.curDef;
  if (ntCh && msg.curAtq !== null && msg.curAtq !== undefined) ntCh.curAtq = msg.curAtq;
  if (ntCh && msg.quickAction !== undefined) ntCh._nimb = msg.quickAction;

  if (msg.passiveEvents && msg.passiveEvents.length > 0) {
    msg.passiveEvents.forEach(function(ev) {
      var evCh = allCharsNT.find(function(c) { return c.id === ev.charId; });
      if (!evCh) return;
      if (ev.type === 'sorte_grande') {
        addLog('🍀 ' + evCh.name + ': Sorte Grande! Carta extra comprada.', 'info');
        floatPassiveDraw(evCh, 1, '🍀');
      }
      if (ev.type === 'nimb') {
        addLog('🪙 ' + evCh.name + ': Presença de Nimb! Próxima ação é Rápida.', 'info');
        addSt(evCh, {id:'nimb_ativo', icon:'🪙', label:'Presença de Nimb: próxima ação é Rápida', turns:1});
      }
      if (ev.type === 'sou_invencivel') {
        addLog('🛡 ' + evCh.name + ': Sou Invencível! +' + ev.defBonus + ' DEF.', 'info');
        floatStatus(evCh, '+' + ev.defBonus + ' DEF', '#4fc3f7');
      }
      if (ev.type === 'espirito_combate') {
        addLog('⚔ ' + evCh.name + ': Espírito de Combate! +' + ev.atqBonus + ' ATQ.', 'info');
        floatStatus(evCh, '+' + ev.atqBonus + ' ATQ', '#ef9a9a');
      }
      // Vance/Chamado da Tropa
      if (ev.type === 'chamado_contador') {
        var contadorTurno = ev.turno || 0;
        var progresso = contadorTurno % 3 || 3;
        if (progresso < 3) {
          addLog('⭐ Comandante Vance — turno ' + contadorTurno + ' (' + progresso + '/3 para Chamado).', 'info');
          floatAccum(evCh, '⭐ ' + progresso + '/3');
        } else {
          addLog('⭐ Comandante Vance — turno ' + contadorTurno + ' → CHAMADO DA TROPA!', 'info');
          floatStatus(evCh, '⭐ CHAMADO!', 'var(--gold)');
        }
      }
      if (ev.type === 'chamado_tropa') {
        var allCharsCT = [...G.p1.chars, ...G.p2.chars];
        var labels = { jennet: '🩸 Jennet!', hoover: '💥 Hoover!', guinzu: '🧸 Guinzu!' };
        var colors = { jennet: '#cc2020', hoover: '#ff8020', guinzu: '#80c0ff' };
        floatStatus(evCh, labels[ev.chamadoTipo] || '⭐ CHAMADO!', colors[ev.chamadoTipo] || 'var(--gold)');
        addLog('⭐ Chamado da Tropa — ' + (ev.chamadoTipo || '').toUpperCase() + '!', 'dmg');
        ev.resultados.forEach(function(r) {
          var rCh = allCharsCT.find(function(c) { return c.id === r.charId; });
          if (!rCh) return;
          if (r.dano > 0) {
            rCh.hp = r.hp;
            rCh.alive = r.alive;
            floatDmg(rCh, r.dano);
            addLog('  → ' + rCh.name + ': ' + r.dano + ' dano | HP: ' + r.hp, 'dmg');
          } else {
            floatStatus(rCh, '🧸 Espelhada!', '#80c0ff');
            addLog('  → ' + rCh.name + ': Imagem Espelhada aplicada.', 'info');
          }
        });
        render();
        checkWin();
      }
      // Kuro/Concentração Marcial: sincroniza _satsui e exibe float
      if (ev.type === 'kuro_satsui') {
        evCh._satsui = ev.satsui;
        addLog('🔥 ' + evCh.name + ': Concentração Marcial ' + ev.satsui + '/10.', 'info');
        floatAccum(evCh, '🔥' + ev.satsui + '/10');
      }
    });
  }

  var a = actor();
  if (!a) return;

  var isMyTurn = (a.o === 'p1');

  if (msg.isQuickAction) {
    addLog('⚡ [Ação Rápida] ' + a.ch.name + ' age novamente!', 'info');
    floatStatus(a.ch, '⚡ AÇÃO RÁPIDA!', 'var(--gold)');
    if (isMyTurn) { _pvpSkipCount = _pvpSkipCount || 0; _startActionTimer(); } else { _clearPvpTimers(); }
    render();
    return;
  }

  if (msg.isExtraTurn) {
    addLog('⭐ [Turno Extra] ' + a.ch.name + ' age novamente!', 'info');
    floatStatus(a.ch, '⭐ TURNO EXTRA!', 'var(--gold)');
    if (isMyTurn) { _pvpSkipCount = _pvpSkipCount || 0; _startActionTimer(); } else { _clearPvpTimers(); }
    render();
    return;
  }

  if (isMyTurn) {
    addLog('⚔ [Railway] Sua vez — ' + a.ch.name, 'sys');
    _pvpSkipCount = _pvpSkipCount || 0;
    _startActionTimer();
  } else {
    _clearPvpTimers();
    addLog('⏳ [Railway] Vez do oponente — ' + a.ch.name, 'sys');
  }

  // Float do nome do personagem ativo
  floatActorName(a.ch);

  // Só mostra banner de turno quando o turno realmente mudou
  var _prevTurn = G.turn;
  if (msg.turn !== undefined && msg.turn !== G.turn) {
    G.turn = msg.turn;
  }
  var _turnChanged = (G.turn !== _prevTurn);

  if (_turnChanged) {
    // Decrementa cooldowns — espelha tickCooldowns() do offline
    [...G.p1.chars, ...G.p2.chars].forEach(function(ch) {
      for (var sk in ch.cooldowns) {
        if (ch.cooldowns[sk] > 0) ch.cooldowns[sk]--;
      }
      // Turno avançou — firstTurn vira false (desbloqueia skills turno:L)
      ch.firstTurn = false;
    });
    showTurnBanner(G.turn).then(function() {
      if (G.over) return;
      render();
      setTimeout(function() {
        if (G.over) return;
        applyTurnStart(a);
        render();
      }, 80);
    });
  } else {
    render();
    setTimeout(function() {
      if (G.over) return;
      applyTurnStart(a);
      render();
    }, 80);
  }
}

function _applyInitiativeResult(msg) {
  var order = msg.order.map(function(item) {
    var pl = item.owner;
    if (!_isHost) pl = pl === 'p1' ? 'p2' : 'p1';
    var ch = G[pl].chars.find(function(c) { return c.id === item.charId; });
    return {
      ch: ch,
      o: pl,
      ic: { nv: item.cardNv, suit: item.cardSuit },
      tot: item.tot
    };
  }).filter(function(item) { return item.ch; });

  G.order = order;
  G.orderIdx = 0;
  G.phase = 'player_action';(function(ch) {
    var item = msg.order.find(function(i) { return i.charId === ch.id && i.owner === 'p2'; });
    if (item) {
      var idx = G.p2.hand.findIndex(function(c) { return c.nv === item.cardNv && c.suit === item.cardSuit; });
      if (idx !== -1) { var removed = G.p2.hand.splice(idx, 1)[0]; G.p2.discard.push(removed); }
    }
  });

  closePanel();
  runCinematicInitiative();
}


// ── v1.94: Arena — popup time de defesa ──
var _adpSelected = []; // ids selecionados

function openArenaDefensePopup() {
  var user = window._fbUser;
  if (!user) { alert('Faça login primeiro.'); return; }
  _adpSelected = [];
  var popup = document.getElementById('arena-defense-popup');
  popup.style.display = 'flex';
  _adpRenderGrid();
  _adpUpdateSlots();
  // Carrega defesa salva se existir
  var ref = window._fbRef(window._fbDb, 'arena_defenses/' + user.uid + '/chars');
  window._fbGet(ref).then(function(snap) {
    if (snap.exists()) {
      _adpSelected = snap.val() || [];
      _adpRenderGrid();
      _adpUpdateSlots();
    }
  });
}

function closeArenaDefensePopup() {
  document.getElementById('arena-defense-popup').style.display = 'none';
  document.getElementById('adp-tooltip').style.display = 'none';
}

function _adpRenderGrid() {
  var myRoster = window._myRoster || [];
  cpInit('adp-char-panel', 'select', {
    owned: myRoster.length > 0 ? myRoster : LOJA_CHARS.map(function(c) { return c.id; }),
    blocked: [],
    multiSelect: _adpSelected,
    origin: 'arena-defense',
    onSelect: function(id) { _adpToggle(id); }
  });
}

function _adpToggle(id) {
  document.getElementById('adp-tooltip').style.display = 'none';
  var idx = _adpSelected.indexOf(id);
  if (idx !== -1) {
    _adpSelected.splice(idx, 1);
  } else {
    if (_adpSelected.length >= 3) return;
    _adpSelected.push(id);
  }
  _cp.multiSelect = _adpSelected;
  cpRender();
  _adpUpdateSlots();
}

function _adpUpdateSlots() {
  for (var i = 0; i < 3; i++) {
    var slot = document.getElementById('adp-slot-' + i);
    var id = _adpSelected[i];
    if (id) {
      var c = LOJA_CHARS.find(function(x){return x.id===id;});
      slot.innerHTML = charAvatar(c, 48);
      slot.style.border = '2px solid #4c7bc9';
      slot.style.background = 'rgba(76,123,201,0.1)';
    } else {
      slot.innerHTML = '?';
      slot.style.border = '2px dashed rgba(255,255,255,0.15)';
      slot.style.background = 'rgba(255,255,255,0.03)';
      slot.style.fontSize = '20px';
      slot.style.color = 'var(--text2)';
    }
  }
  var hint = document.getElementById('adp-hint');
  var btn = document.getElementById('adp-confirm-btn');
  var count = _adpSelected.length;
  if (count === 3) {
    hint.textContent = '✅ Time completo — confirme abaixo';
    hint.style.color = '#4caa6a';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  } else {
    hint.textContent = 'Selecione ' + (3 - count) + ' personagem' + (3-count!==1?'s':'') + ' ainda';
    hint.style.color = 'var(--text2)';
    btn.style.opacity = '0.4';
    btn.style.pointerEvents = 'none';
  }
}

function _adpShowTooltip(c, touch) {
  var tt = document.getElementById('adp-tooltip');
  document.getElementById('adp-tt-name').textContent = c.name + (c.sub ? ' — ' + c.sub : '');
  document.getElementById('adp-tt-desc').textContent = c.desc || '';
  tt.style.display = 'block';
  var x = Math.min(touch.clientX, window.innerWidth - 240);
  var y = Math.max(touch.clientY - 120, 10);
  tt.style.left = x + 'px';
  tt.style.top = y + 'px';
  setTimeout(function(){ tt.style.display = 'none'; }, 2500);
}

function confirmArenaDefense() {
  var user = window._fbUser;
  if (!user || _adpSelected.length !== 3) return;
  var btn = document.getElementById('adp-confirm-btn');
  btn.textContent = 'Salvando...';
  btn.style.opacity = '0.6';
  var ref = window._fbRef(window._fbDb, 'arena_defenses/' + user.uid);
  window._fbSet(ref, {
    chars: _adpSelected,
    ownerName: user.displayName || 'Jogador',
    ownerPhoto: user.photoURL || '',
    ownerUid: user.uid,
    rp: 0,
    updatedAt: Date.now()
  }).then(function() {
    // Atualiza slots no lobby
    _arenaUpdateDefenseSlots(_adpSelected);
    // Ativa botão buscar partida
    var battleBtn = document.getElementById('arena-battle-btn');
    if (battleBtn) { battleBtn.style.opacity='1'; battleBtn.style.pointerEvents='auto'; }
    var hint = document.getElementById('arena-battle-hint');
    if (hint) hint.textContent = 'Time de defesa definido! Pronto para buscar partida.';
    closeArenaDefensePopup();
  }).catch(function(e) {
    console.error('[Arena] Erro ao salvar time de defesa:', e);
    btn.textContent = '✓ CONFIRMAR TIME DE DEFESA';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
    alert('Erro ao salvar: ' + (e.message || e.code || 'verifique as regras do Firebase'));
  });
}

function _arenaUpdateDefenseSlots(ids) {
  var slots = document.querySelectorAll('.arena-def-slot');
  slots.forEach(function(slot, i) {
    var id = ids[i];
    if (id) {
      var c = LOJA_CHARS.find(function(x){return x.id===id;});
      slot.innerHTML = charAvatar(c, 56);
      slot.style.border = '2px solid #4c7bc9';
      slot.style.background = 'rgba(76,123,201,0.08)';
    } else {
      slot.innerHTML = '?';
      slot.style.border = '2px dashed rgba(255,255,255,0.15)';
      slot.style.background = 'rgba(255,255,255,0.03)';
    }
  });
}


// ── v1.95: Arena — seleção time de ataque ──
var _aapSelected = [];

function openArenaAttackPopup() {
  var user = window._fbUser;
  if (!user) { alert('Faça login primeiro.'); return; }
  _aapSelected = [];
  var popup = document.getElementById('arena-attack-popup');
  popup.style.display = 'flex';
  _aapRenderGrid();
  _aapUpdateSlots();
  // Carrega time de ataque salvo se existir
  var ref = window._fbRef(window._fbDb, 'arena_attacks/' + user.uid + '/chars');
  window._fbGet(ref).then(function(snap) {
    if (snap.exists()) {
      _aapSelected = snap.val() || [];
      _aapRenderGrid();
      _aapUpdateSlots();
    }
  });
}

function arenaSearchBattle() {
  var user = window._fbUser;
  if (!user) { alert('Faça login primeiro.'); return; }

  var hint = document.getElementById('arena-battle-hint');
  var btn = document.getElementById('arena-battle-btn');
  if (hint) { hint.textContent = '🔎 Verificando seus times...'; hint.style.color = 'var(--gold)'; }
  if (btn) { btn.style.opacity = '0.5'; btn.style.pointerEvents = 'none'; }

  var defRef = window._fbRef(window._fbDb, 'arena_defenses/' + user.uid + '/chars');
  var atkRef = window._fbRef(window._fbDb, 'arena_attacks/' + user.uid + '/chars');

  Promise.all([window._fbGet(defRef), window._fbGet(atkRef)]).then(function(results) {
    var defSnap = results[0];
    var atkSnap = results[1];

    console.log('[Arena] defSnap exists:', defSnap.exists(), 'val:', defSnap.val());
    console.log('[Arena] atkSnap exists:', atkSnap.exists(), 'val:', atkSnap.val());

    if (!defSnap.exists() || !defSnap.val() || defSnap.val().length !== 3) {
      if (hint) { hint.textContent = '🔒 Defina seu time de defesa primeiro!'; hint.style.color = '#d45050'; }
      if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
      return;
    }
    if (!atkSnap.exists() || !atkSnap.val() || atkSnap.val().length !== 3) {
      if (hint) { hint.textContent = '🔒 Defina seu time de ataque primeiro!'; hint.style.color = '#d45050'; }
      if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
      return;
    }

    var atkIds = atkSnap.val();
    console.log('[Arena] atkIds:', atkIds);
    if (hint) { hint.textContent = '🔎 Buscando oponente...'; hint.style.color = 'var(--gold)'; }
    arenaFindOpponent(atkIds);
  }).catch(function(e) {
    console.error('[Arena] Erro ao verificar times:', e);
    if (hint) { hint.textContent = 'Erro: ' + (e.message || e.code || 'verifique o console'); hint.style.color = '#d45050'; }
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
  });
}

function closeArenaAttackPopup() {
  document.getElementById('arena-attack-popup').style.display = 'none';
}

function _aapRenderGrid() {
  var myRoster = window._myRoster || [];
  cpInit('aap-char-panel', 'select', {
    owned: myRoster.length > 0 ? myRoster : LOJA_CHARS.map(function(c) { return c.id; }),
    blocked: [],
    multiSelect: _aapSelected,
    origin: 'arena-attack',
    onSelect: function(id) { _aapToggle(id); }
  });
}

function _aapToggle(id) {
  document.getElementById('adp-tooltip').style.display = 'none';
  var idx = _aapSelected.indexOf(id);
  if (idx !== -1) {
    _aapSelected.splice(idx, 1);
  } else {
    if (_aapSelected.length >= 3) return;
    _aapSelected.push(id);
  }
  _cp.multiSelect = _aapSelected;
  cpRender();
  _aapUpdateSlots();
}
function _aapUpdateSlots() {
  for (var i = 0; i < 3; i++) {
    var slot = document.getElementById('aap-slot-' + i);
    var id = _aapSelected[i];
    if (id) {
      var c = LOJA_CHARS.find(function(x){return x.id===id;});
      slot.innerHTML = charAvatar(c, 48);
      slot.style.border = '2px solid var(--gold)';
      slot.style.background = 'rgba(201,168,76,0.1)';
    } else {
      slot.innerHTML = '?';
      slot.style.border = '2px dashed rgba(255,255,255,0.15)';
      slot.style.background = 'rgba(255,255,255,0.03)';
      slot.style.fontSize = '20px';
      slot.style.color = 'var(--text2)';
    }
  }
  var hint = document.getElementById('aap-hint');
  var btn = document.getElementById('aap-confirm-btn');
  var count = _aapSelected.length;
  if (count === 3) {
    hint.textContent = '✅ Time completo — pronto para buscar!';
    hint.style.color = '#4caa6a';
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  } else {
    hint.textContent = 'Selecione ' + (3 - count) + ' personagem' + (3-count!==1?'s':'') + ' ainda';
    hint.style.color = 'var(--text2)';
    btn.style.opacity = '0.4';
    btn.style.pointerEvents = 'none';
  }
}

function confirmArenaAttack() {
  var user = window._fbUser;
  if (!user || _aapSelected.length !== 3) return;
  var btn = document.getElementById('aap-confirm-btn');
  btn.textContent = 'Salvando...';
  btn.style.opacity = '0.6';
  var ref = window._fbRef(window._fbDb, 'arena_attacks/' + user.uid);
  window._fbSet(ref, {
    chars: _aapSelected,
    ownerUid: user.uid,
    updatedAt: Date.now()
  }).then(function() {
    _arenaUpdateAttackSlots(_aapSelected);
    _arenaCheckBothTeams();
    closeArenaAttackPopup();
    btn.textContent = '⚔ INICIAR BUSCA';
    btn.style.opacity = '1';
  }).catch(function() {
    btn.textContent = '⚔ INICIAR BUSCA';
    btn.style.opacity = '1';
    alert('Erro ao salvar. Tente novamente.');
  });
}


// ── v1.96: Arena — buscar oponente ──
function arenaFindOpponent(atkIds) {
  var user = window._fbUser;
  if (!user) return;

  var hint = document.getElementById('arena-battle-hint');
  var btn = document.getElementById('arena-battle-btn');

  // Busca meu RP atual
  var myRef = window._fbRef(window._fbDb, 'jogadores/' + user.uid);
  window._fbGet(myRef).then(function(mySnap) {
    var myData = mySnap.exists() ? mySnap.val() : {};
    var myRp = myData.rp || 0;

    // Busca todos os times de defesa
    var defRef = window._fbRef(window._fbDb, 'arena_defenses');
    return window._fbGet(defRef).then(function(snap) {
      if (!snap.exists()) {
        _arenaNoOpponent(hint, btn);
        return;
      }
      var all = [];
      snap.forEach(function(child) {
        var d = child.val();
        // Não pode atacar a si mesmo
        if (child.key === user.uid) return;
        if (!d.chars || d.chars.length !== 3) return;
        all.push({ uid: child.key, chars: d.chars, ownerName: d.ownerName || 'Jogador', ownerPhoto: d.ownerPhoto || '', rp: d.rp || 0 });
      });

      if (all.length === 0) {
        _arenaNoOpponent(hint, btn);
        return;
      }

      // Ordena pelo RP mais próximo do jogador, randomiza empates
      all.sort(function(a, b) {
        var diff = Math.abs(a.rp - myRp) - Math.abs(b.rp - myRp);
        return diff !== 0 ? diff : Math.random() - 0.5;
      });

      // Pega o mais próximo
      var opponent = all[0];
      _arenaStartBattle(atkIds, opponent, user.uid);
    });
  }).catch(function(e) {
    console.error(e);
    _arenaNoOpponent(hint, btn);
  });
}

function _arenaNoOpponent(hint, btn) {
  if (hint) { hint.textContent = 'Nenhum oponente disponível ainda. Tente mais tarde.'; hint.style.color = '#d45050'; }
  if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
}


// ── v1.97: Arena — iniciar batalha ──
function _arenaStartBattle(atkIds, opponent, myUid) {
  var hint = document.getElementById('arena-battle-hint');
  var btn = document.getElementById('arena-battle-btn');

  // Monta chars do atacante (P1) e defensor (P2)
  var p1c = atkIds.map(function(id) {
    return CHARS.find(function(c){ return c.id === id; });
  }).filter(Boolean);

  var p2c = opponent.chars.map(function(id) {
    // ids salvos no Firebase são do jogador ('kuro', 'vanc'...)
    // busca a versão IA correspondente no AI_CHARS
    return AI_CHARS.find(function(c){ return c.id === id + '_ai'; })
        || AI_CHARS.find(function(c){ return c.id === id; });
  }).filter(Boolean);

  if (p1c.length !== 3 || p2c.length !== 3) {
    if (hint) { hint.textContent = 'Erro ao montar times. Tente novamente.'; hint.style.color = '#d45050'; }
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
    return;
  }

  // Seta contexto Arena — usado no endGame para salvar pontos
  window._arenaContext = {
    myUid: myUid,
    myName: window._fbUser ? window._fbUser.displayName || 'Jogador' : 'Jogador',
    myPhoto: window._fbUser ? window._fbUser.photoURL || '' : '',
    defensorUid: opponent.uid,
    defensorName: opponent.ownerName,
    defensorPhoto: opponent.ownerPhoto || ''
  };

  if (hint) hint.textContent = '⚔ Batalha contra ' + opponent.ownerName + '!';

  // Fecha lobby e inicia batalha igual ao modo offline
  document.querySelectorAll('.screen').forEach(function(s){ s.classList.remove('active'); });
  [...p1c, ...p2c].forEach(function(ch){ preloadSprites(ch.id); });
  playBattleMusic();

  var trans = document.getElementById('trans-overlay');
  trans.classList.add('fade-in');
  setTimeout(function() {
    initGame(p1c, p2c);
    showScreen('game');
    document.getElementById('btn-restart').classList.add('visible');
    addLog('═══ ARENA: ' + opponent.ownerName + ' ═══', 'sys');
    addLog('⚔ Seu time: ' + p1c.map(function(c){return c.name;}).join(', '), 'info');
    addLog('🛡 Defesa de ' + opponent.ownerName + ': ' + p2c.map(function(c){return c.name;}).join(', '), 'info');
    applyStartPassives();
    trans.classList.remove('fade-in');
    trans.classList.add('fade-out');
    setTimeout(function(){ trans.classList.remove('fade-out'); }, 700);
    showInitiativeChoiceScreen();
    // Restaura botão do lobby
    if (btn) { btn.style.opacity = '1'; btn.style.pointerEvents = 'auto'; }
  }, 700);
}


function _arenaUpdateAttackSlots(ids) {
  var slots = document.querySelectorAll('.arena-atk-slot');
  slots.forEach(function(slot, i) {
    var id = ids[i];
    if (id) {
      var c = LOJA_CHARS.find(function(x){return x.id===id;});
      slot.innerHTML = charAvatar(c, 56);
      slot.style.border = '2px solid var(--gold)';
      slot.style.background = 'rgba(201,168,76,0.08)';
    } else {
      slot.innerHTML = '?';
      slot.style.border = '2px dashed rgba(255,255,255,0.15)';
      slot.style.background = 'rgba(255,255,255,0.03)';
    }
  });
}

function _arenaCheckBothTeams() {
  var user = window._fbUser;
  if (!user) return;
  var defRef = window._fbRef(window._fbDb, 'arena_defenses/' + user.uid + '/chars');
  var atkRef = window._fbRef(window._fbDb, 'arena_attacks/' + user.uid + '/chars');
  Promise.all([window._fbGet(defRef), window._fbGet(atkRef)]).then(function(results) {
    var hasDef = results[0].exists() && results[0].val() && results[0].val().length === 3;
    var hasAtk = results[1].exists() && results[1].val() && results[1].val().length === 3;
    var btn = document.getElementById('arena-battle-btn');
    var hint = document.getElementById('arena-battle-hint');
    if (hasDef && hasAtk) {
      if (btn) { btn.style.opacity='1'; btn.style.pointerEvents='auto'; }
      if (hint) { hint.textContent = 'Times prontos! Clique para buscar partida.'; hint.style.color = '#4caa6a'; }
    } else {
      if (btn) { btn.style.opacity='0.5'; btn.style.pointerEvents='none'; }
      var msg = !hasDef ? 'Defina seu time de defesa.' : 'Defina seu time de ataque.';
      if (!hasDef && !hasAtk) msg = 'Defina os dois times para buscar partida.';
      if (hint) { hint.textContent = msg; hint.style.color = 'var(--text2)'; }
    }
  });
}

// ── v1.92: Arena assíncrono ──


function arenaLoadLobby() {
  // Carrega dados do jogador no lobby arena
  var user = window._fbUser;
  var rp = document.getElementById('arena-rank-pts');
  var wins = document.getElementById('arena-wins');
  var losses = document.getElementById('arena-losses');
  var defWins = document.getElementById('arena-def-wins');
  var defLosses = document.getElementById('arena-def-losses');
  if (rp) rp.textContent = (user ? '1000' : '—') + ' pts';
  if (wins) wins.textContent = '0';
  if (losses) losses.textContent = '0';
  if (defWins) defWins.textContent = '0';
  if (defLosses) defLosses.textContent = '0';
}

// ── v1.91: applyServerState — sincroniza state do servidor no cliente ──
// Só sobrescreve campos que o servidor controla via serializeChar.
// Campos ausentes no snapshot são preservados no cliente.
var _USE_SERVER_STATE = true; // false = modo antigo (ignora msg.state)
function applyServerState(snap) {
  if (!_USE_SERVER_STATE || !snap) return;
  ['p1','p2'].forEach(function(side) {
    if (!snap[side] || !snap[side].chars) return;
    snap[side].chars.forEach(function(sc) {
      var local = G[side].chars.find(function(c) { return c.id === sc.id; });
      if (!local) return;
      // Campos básicos — sempre sincroniza
      local.hp        = sc.hp;
      local.alive     = sc.alive;
      local.curAtq    = sc.curAtq;
      local.curDef    = sc.curDef;
      local.atq       = sc.atq;
      local.def       = sc.def;
      local.statuses  = sc.statuses  || local.statuses;
      local.cooldowns = sc.cooldowns || local.cooldowns;
      // Campos especiais — só sobrescreve se o servidor mandou
      if (sc._outfit        !== undefined) local._outfit        = sc._outfit;
      if (sc._charge        !== undefined) local._charge        = sc._charge;
      if (sc._satsui        !== undefined) local._satsui        = sc._satsui;
      if (sc._linkAccum     !== undefined) local._linkAccum     = sc._linkAccum;
      if (sc._furia         !== undefined) local._furia         = sc._furia;
      if (sc._extraTurn     !== undefined) local._extraTurn     = sc._extraTurn;
      if (sc._chamadoTurno  !== undefined) local._chamadoTurno  = sc._chamadoTurno;
      if (sc._agoraSerioPow !== undefined) local._agoraSerioPow = sc._agoraSerioPow;
      if (sc.quickAction    !== undefined) local.quickAction    = sc.quickAction;
      // NÃO sobrescrever — cliente controla estes campos:
      // suit, _ryuSuit, _ryuSuitTimer  → naipe Kuro (via kuro_suit)
      // _weapon                        → arma Kane (via skip_passive)
      // _caerynDef, _varokAtq, _zaraePow, _inspirado → passivas de buff
      // _agoraSerio                    → flag Gorath
      // _spiderExtraTurn               → flag temporária Voss
      // firstTurn                      → controlado pelo advanceTurn
    });
  });
}

function pvpConnect(salaId) {
  if (_pvpSocket) { _pvpSocket.close(); _pvpSocket = null; }
  addLog('🔌 [Railway] Conectando ao servidor...', 'sys');
  _pvpSocket = new WebSocket(WS_SERVER);

  _pvpSocket.onopen = function() {
    addLog('✅ [Railway] Conectado! Entrando na sala...', 'sys');
    _pvpSocket.send(JSON.stringify({
      type: 'join_room',
      roomId: salaId,
      uid: window._fbUser?.uid || 'anon'
    }));
    _startPvpPing(); // mantém conexão viva
  };




  _pvpSocket.onmessage = function(event) {
    var msg = JSON.parse(event.data);
    if (msg.type !== 'pong') _logEvent('← RECV ' + msg.type + (msg.charId ? ' char:' + msg.charId : '') + (msg.owner ? ' owner:' + msg.owner : '') + (msg.dano !== undefined ? ' dano:' + msg.dano : '') + (msg.turn !== undefined ? ' turn:' + msg.turn : ''), 'WS');

    // ── Fase 4: Processa mensagens do servidor ──

    if (msg.type === 'joined') {
      addLog('🏠 [Railway] Sala ' + salaId + ' — jogador ' + (msg.playerIndex + 1) + '/2', 'sys');
      var lt = document.getElementById('pvp-loading-text');
      if (lt) lt.textContent = 'Aguardando oponente...';
    }

    else if (msg.type === 'room_ready') {
      addLog('⚔️ [Railway] Sala pronta! 2 jogadores conectados.', 'sys');
      var lt2 = document.getElementById('pvp-loading-text');
      if (lt2) lt2.textContent = 'Preparando batalha...';
      // Host manda start_battle agora que os dois estão na sala
      var ctx = window._pvpContext;
      if (ctx && ctx.isHost) {
        pvpSend('start_battle', {
          p1Ids: ctx.p1ids,
          p2Ids: ctx.p2ids
        });
        addLog('📋 [Railway] Enviando personagens pro servidor...', 'sys');
      }
    }

    // Batalha iniciada — servidor confirmou os personagens → agora inicia o jogo
    else if (msg.type === 'battle_started') {
      addLog('═══ SERVIDOR PvP PRONTO ═══', 'sys');
      addLog('🎮 [Railway] P1: ' + msg.p1Chars.map(function(c){ return c.name; }).join(', '), 'info');
      addLog('🎮 [Railway] P2: ' + msg.p2Chars.map(function(c){ return c.name; }).join(', '), 'info');

      // Servidor 100% pronto — agora inicia tela de batalha
      var ctx = window._pvpContext;
      if (ctx && ctx.myChars && ctx.oppChars) {
        _hidePvpLoading();
        _introRunning = true;
        playBattleMusic();
        var rb = document.getElementById('init-reopen-btn');
        if (rb) rb.style.display = 'none';
        initGame(ctx.myChars, ctx.oppChars);
        showScreen('game');
        document.getElementById('btn-restart').classList.add('visible');
        addLog('═══ BATALHA PvP INICIADA ═══', 'sys');
        addLog('Seu time: ' + ctx.myChars.map(function(c){ return c.name; }).join(', '), 'info');
        addLog('Oponente: ' + ctx.oppChars.map(function(c){ return c.name; }).join(', '), 'info');
        applyStartPassives();
        showInitiativeChoiceScreen();
      }
    }

    else if (msg.type === 'emboscada_florestal') {
      var allCharsEmb = [...G.p1.chars, ...G.p2.chars];
      msg.resultados.forEach(function(r) {
        var ch = allCharsEmb.find(function(c) { return c.id === r.charId; });
        if (ch) {
          ch.hp = r.hp;
          ch.alive = r.alive;
          floatDmg(ch, 20);
          addLog('🌿 Emboscada Florestal! ' + ch.name + ' sofre 20 de dano!', 'dmg');
          if (!ch.alive) addLog('💀 ' + ch.name + ' foi nocauteado pela Emboscada!', 'sys');
          updateCharUI(ch);
        }
      });
    }

    // Resultado de ataque — servidor calculou e devolveu
    else if (msg.type === 'defense_request') {
      // Servidor pedindo defesa — abre painel pro defensor
      var atkCharId = msg.atacante;
      var defCharId = msg.alvo;
      var allChars2 = [...G.p1.chars, ...G.p2.chars];
      var atkCh = allChars2.find(function(c) { return c.id === atkCharId; });
      var defCh = allChars2.find(function(c) { return c.id === defCharId; });

      if (defCh && atkCh) {
        // Monta objetos fake para showDefensePanel
        var fakeSk = { id: msg.skillId, name: msg.skillName || '?', poder: msg.poder || 0, power: msg.poder || 0 };
        var fakeCard = { val: String(msg.atkCardNv), nv: msg.atkCardNv || 0, suit: msg.atkCardSuit || 'neutral' };
        G.pendingAttack = { attacker: atkCh, sk: fakeSk, atkCard: fakeCard, target: defCh, atkOwner: msg.attackerOwner };

        if (msg.isArea) {
          // Área PvP — toca animação primeiro, depois abre painel
          var _areaTotal = msg.areaTotal || 1;
          var _areaCurrent = msg.areaCurrent || 1;
          addLog('🛡 [Railway] ' + atkCh.name + ' ataca em área! ' + defCh.name + ' defende (' + _areaCurrent + '/' + _areaTotal + ')', 'sys');
          fakeSk._areaCurrent = _areaCurrent;
          fakeSk._areaTotal = _areaTotal;
          if (_areaCurrent === 1) {
            // Primeiro alvo: toca animação em TODOS os inimigos vivos de uma vez
            var _localOwner = _isHost ? 'p1' : 'p2';
            var _enemyOwner = _localOwner === 'p1' ? 'p2' : 'p1';
            var _allEnemies = G[_enemyOwner].chars.filter(function(c) { return c.alive; });
            if (_pvpAnimFull) {
              playSkillAnimation(atkCh, fakeSk, _allEnemies, null).then(function() {
                showDefensePanelPvP(atkCh, fakeSk, fakeCard, defCh);
              });
            } else {
              showDefensePanelPvP(atkCh, fakeSk, fakeCard, defCh);
            }
          } else {
            // Alvos seguintes: animação já tocou, abre painel direto
            showDefensePanelPvP(atkCh, fakeSk, fakeCard, defCh);
          }
        } else {
          addLog('🛡 [Railway] ' + atkCh.name + ' ataca ' + defCh.name + '! Defender?', 'sys');
          _logEvent('DEFESA: ' + atkCh.name + ' (ATK:' + atkCh.curAtq + ') usa ' + (msg.skillName || '?') + ' (POW:' + (msg.poder || '?') + ') + carta:' + (msg.atkCardNv || 0) + ' vs ' + defCh.name + ' (DEF:' + defCh.curDef + ', HP:' + defCh.hp + '/' + defCh.maxHp + ')', 'CALC');
          // ── Fase 8i: Interceptação ──
          if (msg.interceptedBy) {
            var interceptor = allChars2.find(function(c) { return c.id === msg.interceptedBy; });
            if (interceptor) {
              defCh = interceptor;
              G.pendingAttack.target = interceptor;
              if (msg.interceptType === 'lider') {
                addLog('🤍 Patrulheiro Líder! Aeryn cobre aliado em baixa vida!', 'info');
                floatStatus(interceptor, '🤍 LIDERA!', '#e0e0ff');
              } else if (msg.interceptType === 'azul') {
                addLog('🔵 Roupa Azul! Tyren entra na frente e toma o dano!', 'info');
                floatStatus(interceptor, '🔵 NA FRENTE!', 'var(--blue)');
              }
              if (_pvpAnimFull) animIntercept(interceptor);
            }
          }
          // Toca animação de ataque antes de abrir o painel
          if (_pvpAnimFull) {
            playSkillAnimation(atkCh, fakeSk, [defCh], null).then(function() {
              showDefensePanelPvP(atkCh, fakeSk, fakeCard, defCh);
            });
          } else {
            showDefensePanelPvP(atkCh, fakeSk, fakeCard, defCh);
          }
        }
      }
    }

    else if (msg.type === 'action_result') {
      var alvoId = msg.alvo;
      var novoHp = msg.hpAlvo;
      var dano   = msg.dano;
      var morreu = msg.morreu;

      // Busca o personagem alvo nos dois times
      var allChars = [...G.p1.chars, ...G.p2.chars];
      var alvoChar = allChars.find(function(c) { return c.id === alvoId; });
      var atkChar  = allChars.find(function(c) { return c.id === msg.atacante; });

      // ── Animação da skill (flash + movimento + hit) ──
      // Processa dano no momento do impacto, render só após animação
      var pvpSk = (atkChar && msg.skill && !msg.isAlly && alvoChar)
        ? atkChar.skills.find(function(s) { return s.id === msg.skill; })
        : null;

      function _processActionResult() {
        if (!alvoChar) return;
        alvoChar.hp = novoHp;
        if (morreu) { alvoChar.alive = false; }
        // Sync statuses do servidor no objeto local
        if (msg.statusApplied && msg.statusApplied.length > 0) {
          _logEvent('STATUS em ' + alvoChar.name + ': ' + msg.statusApplied.join(', '), 'STATUS');
          msg.statusApplied.forEach(function(stId) {
            if (!alvoChar.statuses) alvoChar.statuses = [];
            var already = alvoChar.statuses.find(function(s) { return s.id === stId; });
            if (!already) {
              if (stId === 'shield') {
                // Escudo: recalcula val com base no ATQ do atacante
                var atkAtq = atkChar ? atkChar.atq : 0;
                var shieldPow = msg.skill ? (G.p1.chars.concat(G.p2.chars).find(function(c){return c.id===msg.atacante;})||{}).skills||[] : [];
                var shieldSkill = shieldPow.find ? shieldPow.find(function(s){return s.id===msg.skill;}) : null;
                var shieldVal = atkAtq + Number((shieldSkill && shieldSkill.power) || 0);
                alvoChar.statuses.push({id:'shield', icon:'🛡️', label:'Escudo('+shieldVal+')', turns:2, val:shieldVal});
              } else if (stId === 'marcado') {
                // Marcado: aplica ou renova
                var jaTemMarcado = alvoChar.statuses.find(function(s) { return s.id === 'marcado'; });
                if (jaTemMarcado) {
                  jaTemMarcado.turns = 2;
                  addLog('🎯 [Railway] Seiken Tsuki: Marca RENOVADA em ' + alvoChar.name + ' (2t).', 'info');
                } else {
                  alvoChar.statuses.push({id:'marcado', icon:'🎯', label:'Marcado (2t)', turns:2});
                  addLog('🎯 [Railway] Seiken Tsuki: Marca aplicada em ' + alvoChar.name + ' (2t).', 'info');
                  floatStatus(alvoChar, '🎯 Marcado!', '#ff8800');
                }
              } else if (stId === 'marcado_consumido') {
                // Sanren Geri consumiu a Marca
                alvoChar.statuses = alvoChar.statuses.filter(function(s) { return s.id !== 'marcado'; });
                addLog('🌀 [Railway] Sanren Geri: Marca CONSUMIDA em ' + alvoChar.name + '!', 'info');
                floatStatus(alvoChar, '🌀 Marca!', '#cc44ff');
              } else if (stId === 'encantado') {
                alvoChar.statuses.push({id:'encantado', icon:'🎭', label:'Encantado: 50% ataca aliado', turns:1});
                addLog('🎭 [Railway] ' + alvoChar.name + ' está Encantado!', 'dmg');
                floatStatus(alvoChar, '🎭 Encantado!', '#b060e0');
              } else {
                alvoChar.statuses.push({id: stId, turns: 2});
              }
            }
          });
        }
        // Roupas Encantadas: atualiza outfit visualmente apenas no lado oposto
        // (o dono já processou local via selfSkillEffect)
        if (msg.skill === 'rou' && atkChar) {
          var _rouIsMine = G.p1.chars.some(function(c){ return c.id === atkChar.id; });
          if (!_rouIsMine) {
            var _rouNext = msg.outfitNext || (atkChar._outfit === 'verde' ? 'azul' : atkChar._outfit === 'azul' ? 'vermelha' : 'verde');
            atkChar._outfit = _rouNext;
            atkChar.statuses = atkChar.statuses.filter(function(s) { return s.id !== 'outfit_verde' && s.id !== 'outfit_azul' && s.id !== 'outfit_vermelha'; });
            atkChar.statuses.push({
              id: 'outfit_'+_rouNext,
              icon: _rouNext==='verde'?'🟢':_rouNext==='azul'?'🔵':'🔴',
              label: _rouNext==='verde'?'Roupa Verde':_rouNext==='azul'?'Roupa Azul':'Roupa Vermelha',
              turns: 999
            });
            addLog(atkChar.name + ': ' + (_rouNext==='verde'?'🟢 Roupa Verde':_rouNext==='azul'?'🔵 Roupa Azul':'🔴 Roupa Vermelha') + '!', 'info');
            render();
          }
        }
        // ALL_ALLY: cura/buff em aliado
        if (msg.isAlly) {
          if (atkChar && msg.skill) {
            var pvpSkAlly = atkChar.skills.find(function(s) { return s.id === msg.skill; });
            if (pvpSkAlly) { _showSkillFlash(pvpSkAlly, atkChar); }
          }
          if (msg.statusApplied && msg.statusApplied.length > 0) {
            var _allySkName = pvpSkAlly ? pvpSkAlly.name : msg.skill;
            addLog('✨ [Railway] ' + (atkChar ? atkChar.name : msg.atacante) + ' → ' + alvoChar.name + ': buff aplicado!', 'heal');
            _logEvent('BUFF: ' + (atkChar ? atkChar.name : msg.atacante) + ' usa ' + _allySkName + ' → ' + alvoChar.name + ' | Status: ' + msg.statusApplied.join(', '), 'CALC');
            floatStatus(alvoChar, '✨ BUFF!', '#ffe566');
            msg.statusApplied.forEach(function(stId) {
              if (stId === 'mirror') {
                if (!alvoChar.statuses.find(function(s) { return s.id === 'mirror'; }))
                  alvoChar.statuses.push({id:'mirror', icon:'🪞', label:'Im. Espelhada', turns:1});
              } else if (stId === 'shield') {
                var shSkill = atkChar ? atkChar.skills.find(function(s) { return s.id === msg.skill; }) : null;
                var shVal = (atkChar ? atkChar.curAtq : 0) + Number((shSkill && shSkill.power) || 0);
                if (!alvoChar.statuses.find(function(s) { return s.id === 'shield'; }))
                  alvoChar.statuses.push({id:'shield', icon:'🛡️', label:'Escudo('+shVal+')', turns:2, val:shVal});
              } else if (stId === 'fortalecido') {
                alvoChar.curAtq = Math.floor(alvoChar.curAtq * 1.5);
                if (!alvoChar.statuses.find(function(s) { return s.id === 'fort_atq'; }))
                  alvoChar.statuses.push({id:'fort_atq', icon:'⬆️', label:'Fortalecido', turns:2});
              }
            });
            render();
          } else {
            addLog('💚 [Railway] ' + (atkChar ? atkChar.name : msg.atacante) + ' → ' + alvoChar.name + ': curado! HP: ' + novoHp, 'heal');
            _logEvent('CURA: ' + (atkChar ? atkChar.name : msg.atacante) + ' → ' + alvoChar.name + ' | HP: ' + novoHp + '/' + alvoChar.maxHp, 'CALC');
            floatStatus(alvoChar, '+ CURA', '#80ff80');
          }
        // Valete: esquiva completa
        } else if (msg.esquivou) {
          addLog('🃏 [Railway] ' + alvoChar.name + ' usou Valete e esquivou completamente!', 'info');
          floatStatus(alvoChar, 'J ESQUIVA!', '#80ff80');
          if (_pvpAnimFull) showAdvTag(alvoChar, '🃏 Esquiva!', '#80ff80');
        } else {
          // ── Fase 8d: Exibe cargas no log ──
          if ((msg.skill === 'fpl' || msg.skill === 'ffr') && atkChar) {
            var _cargasRestantes = atkChar._charge !== undefined ? atkChar._charge : 0;
            addLog('⚡ [Carga] ' + atkChar.name + ' disparou com ' + (dano > 0 ? dano : '0') + ' de dano. Cargas zeradas.', 'info');
          }
          // Log completo no formato offline
          if (atkChar && alvoChar) {
            var _skLog = atkChar.skills.find(function(s){ return s.id === msg.skill; });
            var _skName = _skLog ? _skLog.name : (msg.skill || '?');
            var _powLog = msg.poderUsado !== undefined ? msg.poderUsado : (_skLog ? _skLog.power : '?');
            var _atkCardLog = msg.atkCardNv !== undefined ? msg.atkCardNv : (G.pendingAttack ? (G.pendingAttack.atkCard ? G.pendingAttack.atkCard.nv : '?') : '?');
            var _atkAtqLog = msg.atkAtq !== undefined ? msg.atkAtq : atkChar.curAtq;
            var _defLog = msg.defTotal !== undefined ? msg.defTotal : alvoChar.curDef;
            var _total = (_atkAtqLog !== '?' && _powLog !== '?' && _atkCardLog !== '?') ? (_atkAtqLog + _powLog + _atkCardLog) : '?';
            var _criticoStr = msg.critico ? ' CRITICO!' : '';
            var _areaStr = msg.isArea ? ' [AREA]' : '';
            addLog('⚔' + _areaStr + _criticoStr + ' ' + atkChar.name + ' usa ' + _skName + ': ATQ' + _atkAtqLog + '+POW' + _powLog + '+CARTA' + _atkCardLog + '=' + _total + ' - DEF' + _defLog + ' = ' + dano + ' dano | HP: ' + novoHp + '/' + alvoChar.maxHp, 'dmg');
            if (msg.statusApplied && msg.statusApplied.length > 0) {
              var _stEmoji = { burn:'🔥', bleed:'🩸', rad:'☢️', static:'⚡', chill:'❄️', frozen:'🧊', stun:'💫', exposed:'🎯', weak:'💔', slow:'🐢', marcado:'🎴', shield:'🛡️', masc_feliz:'😊', masc_triste:'😢', outfit_azul:'💙', outfit_vermelha:'❤️', amaciado:'🔓', melt:'💧' };
              msg.statusApplied.forEach(function(stId) {
                var _ico = _stEmoji[stId] || '✨';
                addLog(_ico + ' ' + alvoChar.name + ' recebeu: ' + stId, 'info');
              });
            }
          } else {
            addLog('⚔ [Railway]' + (msg.isArea ? ' [AREA]' : '') + (msg.critico ? ' CRITICO!' : '') + ' ' + msg.atacante + ' → ' + alvoId + ': ' + dano + ' dano! HP: ' + novoHp, 'dmg');
          }
          floatDmg(alvoChar, dano);
        }
        render();
        // ── Fase 8f Etapa 4: killEvents ──
        if (msg.killEvents && msg.killEvents.length > 0) {
          var allC = [...G.p1.chars, ...G.p2.chars];
          msg.killEvents.forEach(function(ev) {
            if (ev.type === 'kael_furia') {
              var kael = allC.find(function(c) { return c.id === 'kael'; });
              if (kael) {
                kael._furia = true;
                kael.hp = ev.kaelHp;
                floatStatus(kael, '😡 FÚRIA!', '#ff4040');
                addLog('😡 [Passiva] Kael entra em Fúria! (+20% HP)', 'info');
              }
            }
            if (ev.type === 'lori_kill') {
              var lori = allC.find(function(c) { return c.id === 'lori'; });
              if (lori) {
                lori.curAtq = ev.loriAtq; lori.atq = ev.loriAtq;
                lori.curDef = ev.loriDef; lori.def = ev.loriDef;
                lori._extraTurn = true;
                floatStatus(lori, '⭐ GLADIADORA!', 'var(--gold)');
                addLog('⭐ [Passiva] Lorien: nocaute → +1 ATQ/DEF + turno extra!', 'info');
              }
            }
            if (ev.type === 'caeryn_morte') {
              allC.filter(function(c) { return c.alive && c._caerynDef; }).forEach(function(c) {
                c.curDef = Math.max(c.def, c.curDef - c._caerynDef);
                c.def    = Math.max(0, c.def - c._caerynDef);
                floatStatus(c, '💔 -DEF Caeryn', '#c06060');
                addLog('💔 ' + c.name + ' perde bônus DEF (Caeryn eliminada).', 'info');
                c._caerynDef = 0;
              });
            }
            if (ev.type === 'varok_morte') {
              allC.filter(function(c) { return c.alive && c._varokAtq; }).forEach(function(c) {
                c.curAtq = Math.max(c.atq, c.curAtq - c._varokAtq);
                c.atq    = Math.max(0, c.atq - c._varokAtq);
                floatStatus(c, '💔 -ATQ Varok', '#c06060');
                addLog('💔 ' + c.name + ' perde bônus ATQ (Varok eliminado).', 'info');
                c._varokAtq = 0;
              });
            }
            if (ev.type === 'zarae_morte') {
              allC.filter(function(c) { return c.alive && c._zaraePow; }).forEach(function(c) {
                floatStatus(c, '💔 -POW Zarae', '#c06060');
                addLog('💔 ' + c.name + ' perde bônus POW (Zarae eliminada).', 'info');
                c._zaraePow = 0;
              });
            }
            if (ev.type === 'zephyr_morte') {
              allC.filter(function(c) { return c.alive && c._inspirado; }).forEach(function(c) {
                c.curAtq -= 1; c.curDef -= 1; c._inspirado = false;
                floatStatus(c, '💔 -Inspiração', '#c06060');
                addLog('💔 ' + c.name + ' perde Inspiração (Zephyr eliminado).', 'info');
              });
            }
          });
          render();
        }
        // ── Fase 8j Sub-B: Kael/Ataque de Fúria — exibe contra-ataque ──
        if (msg.counterEvent && msg.counterEvent.type === 'kael_furia_contra') {
          var ceAtk = allChars.find(function(c) { return c.id === msg.counterEvent.targetId; });
          if (ceAtk) {
            ceAtk.hp = msg.counterEvent.targetHp;
            if (msg.counterEvent.targetMorreu) ceAtk.alive = false;
            floatDmg(ceAtk, msg.counterEvent.dano);
            floatStatus(atkChar, '😡 CONTRA-ATAQUE!', '#ff4040');
            addLog('😡 [Passiva] Kael contra-ataca ' + ceAtk.name + '! ' + msg.counterEvent.dano + ' dano!', 'dmg');
            render();
          }
        }
        // ── Fase 8j Sub-A: Aeryn/Patrulheiro de Combate — exibe react events ──
        if (msg.reactEvents && msg.reactEvents.length > 0) {
          var aerynCh = allChars.find(function(c) { return c.id === 'pt_aer'; });
          var nyxaCh = allChars.find(function(c) { return c.id === 'nyxa'; });
          msg.reactEvents.forEach(function(ev) {
            if (ev.type === 'aeryn_junto' || ev.type === 'aeryn_contra') {
              var aeTarget = allChars.find(function(c) { return c.id === ev.targetId; });
              if (aeTarget) {
                aeTarget.hp = ev.targetHp;
                if (ev.targetMorreu) aeTarget.alive = false;
                floatDmg(aeTarget, ev.dano);
              }
              if (aerynCh) {
                var label = ev.type === 'aeryn_junto' ? '🤍 JUNTO!' : '🤍 CONTRA!';
                floatStatus(aerynCh, label, '#e0e0ff');
                addLog('🤍 [Passiva] Aeryn ' + (ev.type === 'aeryn_junto' ? 'ataca junto' : 'contra-ataca') + '! ' + ev.dano + ' dano em ' + ev.targetId + '!', 'dmg');
              }
              render();
            }
            // ── Fase 8j Sub-D: Nyxa/Máscara de Faces — exibe react events ──
            if (ev.type === 'nyxa_feliz' || ev.type === 'nyxa_triste') {
              var nyxaTarget = allChars.find(function(c) { return c.id === ev.targetId; });
              if (nyxaTarget) {
                nyxaTarget.hp = ev.targetHp;
                if (ev.targetMorreu) nyxaTarget.alive = false;
                floatDmg(nyxaTarget, ev.dano);
              }
              if (nyxaCh) {
                var nyxaLabel = ev.type === 'nyxa_feliz' ? '😊 CONTRA!' : '😢 JUNTO!';
                var nyxaColor = ev.type === 'nyxa_feliz' ? 'var(--gold)' : '#8080ff';
                floatStatus(nyxaCh, nyxaLabel, nyxaColor);
                addLog((ev.type === 'nyxa_feliz' ? '😊' : '😢') + ' [Passiva] Nyxa ' + (ev.type === 'nyxa_feliz' ? 'contra-ataca' : 'ataca junto') + '! ' + ev.dano + ' dano em ' + ev.targetId + '!', 'dmg');
              }
              render();
            }
          });
        }
        // ── Naipe Advantage PvP ──
        if (msg.suitAdv) {
          var sa = msg.suitAdv;
          var allCharsSA = [...G.p1.chars, ...G.p2.chars];
          if (sa.type === 'spades_hearts') {
            var atkSA = allCharsSA.find(function(c) { return c.id === msg.atacante; });
            var defSA = allCharsSA.find(function(c) { return c.id === msg.alvo; });
            if (_pvpAnimFull) {
              if (atkSA) { slotFlashSuit(atkSA, 'spades'); showAdvTag(atkSA, '⚡ ♠→♥ ×2!', 'var(--spades)'); }
              if (defSA) { slotFlashSuit(defSA, 'spades'); showAdvTag(defSA, '⚡ Vantagem Espadas!', 'var(--spades)'); }
            }
            addLog('⚡ [NAIPE] Espadas→Copas: dano dobrado!', 'info');
            if (_pvpAnimFull) setTimeout(function() { showSuitAdvFlash('♠', 'VANTAGEM ESPADAS', (atkSA ? atkSA.name : '') + ' → ' + (defSA ? defSA.name : '') + ' ×2 DANO', '#6080ff'); }, 800);
          }
          if (sa.type === 'hearts_clubs') {
            var heartsSA = allCharsSA.find(function(c) { return c.id === sa.heartsCharId; });
            var clubsSA  = allCharsSA.find(function(c) { return c.id === sa.clubsCharId; });
            if (heartsSA) {
              var existingHA = heartsSA.statuses.find(function(s) { return s.id === 'hearts_adv'; });
              if (existingHA) {
                existingHA.turns = 2;
                heartsSA.curAtq = heartsSA.atq * 2;
                heartsSA.curDef = heartsSA.def * 2;
                if (_pvpAnimFull) showAdvTag(heartsSA, '❤️ Renovado!', 'var(--hearts)');
                floatStatus(heartsSA, '❤️ ×2 Renovado!', 'var(--hearts)');
                addLog('❤️ ' + heartsSA.name + ' manteve a vantagem de Copas! Duração renovada.', 'info');
              } else {
                heartsSA.curAtq = heartsSA.atq * 2;
                heartsSA.curDef = heartsSA.def * 2;
                if (!heartsSA.statuses) heartsSA.statuses = [];
                heartsSA.statuses.push({id:'hearts_adv', icon:'❤️', label:'Bônus Copas: ATQ/DEF×2 (2t)', turns:2});
                if (_pvpAnimFull) {
                  showAdvTag(heartsSA, '❤️ ♥ ATQ×2!', 'var(--hearts)');
                  if (clubsSA) showAdvTag(clubsSA, '❤️ Vantagem Copas!', 'var(--hearts)');
                  if (heartsSA) slotFlashSuit(heartsSA, 'hearts');
                  if (clubsSA)  slotFlashSuit(clubsSA,  'clubs');
                }
                floatStatus(heartsSA, '❤️ ATQ×2!', 'var(--hearts)');
                addLog('❤️ [NAIPE] Copas: ATQ e DEF de ' + heartsSA.name + ' dobrados por 2 turnos!', 'info');
                if (_pvpAnimFull) setTimeout(function() { showSuitAdvFlash('♥', 'VANTAGEM COPAS', heartsSA.name + ' ATQ/DEF ×2 por 2 turnos!', '#e04060'); }, 800);
              }
              render();
            }
          }
          if (sa.type === 'clubs_counter') {
            var clubsCC  = allCharsSA.find(function(c) { return c.id === sa.clubsCharId; });
            var targetCC = allCharsSA.find(function(c) { return c.id === sa.targetId; });
            if (targetCC) {
              targetCC.hp = sa.targetHp;
              if (sa.targetMorreu) targetCC.alive = false;
              floatDmg(targetCC, sa.dano);
              if (clubsCC) {
                floatStatus(clubsCC, '♣ CONTRA!', 'var(--clubs)');
                if (_pvpAnimFull) showAdvTag(clubsCC, '♣ Contra-ataque!', 'var(--clubs)');
              }
              addLog('♣ [NAIPE] ' + (clubsCC ? clubsCC.name : sa.clubsCharId) + ' contra-ataca ' + (targetCC ? targetCC.name : sa.targetId) + '! ' + sa.dano + ' dano!', 'dmg');
              render();
              if (sa.targetMorreu) checkWin();
            }
          }
          if (sa.type === 'diamonds_extra') {
            var extraChSA = allCharsSA.find(function(c) { return c.id === sa.charId; });
            if (extraChSA) {
              floatStatus(extraChSA, '♦ +Rodada Extra!', 'var(--diamonds)');
              if (_pvpAnimFull) {
                showAdvTag(extraChSA, '♦ +Rodada Extra!', 'var(--diamonds)');
                slotFlashSuit(extraChSA, 'diamonds');
              }
              addLog('♦ [NAIPE] ' + extraChSA.name + ' ganha rodada extra!', 'info');
              if (_pvpAnimFull) setTimeout(function() { showSuitAdvFlash('♦', 'VANTAGEM OURO', extraChSA.name + ' GANHA RODADA EXTRA!', '#e0a020'); }, 800);
            }
          }
        }
        if (morreu) { checkWin(); }
        // v1.90: sincroniza state do servidor
        applyServerState(msg.state);
      } // fim _processActionResult

      // Chama animação primeiro, processa resultado no impacto
      // Defensor já viu a animação no defense_request — só atacante precisa ver
      var _localOwnerAnim = _isHost ? 'p1' : 'p2';
      var _atkIsLocalAnim = atkChar && (atkChar.owner === _localOwnerAnim);
      if (_pvpAnimFull && pvpSk && atkChar && alvoChar && _atkIsLocalAnim) {
        // Atacante local: toca animação e processa resultado
        playSkillAnimation(atkChar, pvpSk, [alvoChar], function() {
          _processActionResult();
        });
      } else if (_pvpAnimFull && pvpSk && atkChar && alvoChar && !_atkIsLocalAnim && !msg.esquivou) {
        // Defensor: só toca animação se não foi esquiva (esquiva já animou no defense_request)
        playSkillAnimation(atkChar, pvpSk, [alvoChar], function() {
          _processActionResult();
        });
      } else {
        _processActionResult();
      }
    }

    else if (msg.type === 'counter_request') {
      // ── Fase 8j Sub-C: Tyre/Roupa Vermelha — recebe pedido de contra-ataque ──
      if (msg.reason === 'roupa_vermelha') {
        var allCharsC = [...G.p1.chars, ...G.p2.chars];
        var tyreCh = allCharsC.find(function(c) { return c.id === 'tyre'; });
        if (tyreCh) {
          showVermelhaPainelPvP(tyreCh);
        }
      }
    }

    else if (msg.type === 'counter_result') {
      // ── Fase 8j Sub-C: Tyre/Roupa Vermelha — exibe resultado do contra-ataque ──
      var allCharsR = [...G.p1.chars, ...G.p2.chars];
      var tyreCR = allCharsR.find(function(c) { return c.id === 'tyre'; });
      var targetCR = allCharsR.find(function(c) { return c.id === msg.targetId; });
      if (targetCR) {
        targetCR.hp = msg.targetHp;
        if (msg.targetMorreu) targetCR.alive = false;
        floatDmg(targetCR, msg.dano);
        if (tyreCR) {
          floatStatus(tyreCR, '🔴 CONTRA!', '#ff5050');
          addLog('🔴 [Passiva] Tyre contra-ataca ' + msg.targetId + '! ' + msg.dano + ' dano!', 'dmg');
        }
        applyServerState(msg.state); // v1.90
        render();
        if (msg.targetMorreu) { checkWin(); }
      }
    }

    // ── Fase 8k: Nyxa/Azar ou Sorte — resultado global ──
    else if (msg.type === 'azs_result') {
      var allCharsLocal = G.p1.chars.concat(G.p2.chars);
      msg.resultados.forEach(function(ev) {
        var ch = allCharsLocal.find(function(c) { return c.id === ev.charId; });
        if (!ch) return;
        ch.hp = ev.hp;
        ch.alive = !ev.morreu;
        if (ev.dano > 0) {
          floatDmg(ch, ev.dano);
          addLog('🎲 ' + ch.name + ': FALHA → ' + ev.dano + ' dano', 'dmg');
          if (ev.morreu) addLog('💀 ' + ch.name + ' foi nocauteado!', 'dmg');
        } else {
          floatHeal(ch, ev.cura);
          addLog('🎲 ' + ch.name + ': SUCESSO → +' + ev.cura + ' cura', 'heal');
        }
      });
      applyServerState(msg.state); // v1.90
      render();
      checkWin();
    }

    else if (msg.type === 'turn_effects') {
      var allChars = [...G.p1.chars, ...G.p2.chars];
      var ch = allChars.find(function(c) { return c.id === msg.charId; });
      if (ch) {
        ch.hp = msg.hp;
        if (!msg.alive) { ch.alive = false; }
        msg.effects.forEach(function(ef) {
          if (ef.type === 'death') return;
          var txt = ef.icon + ' ' + ef.dmg + ' dano';
          addLog('🩸 [DoT] ' + ch.name + ': ' + txt, 'dmg');
          floatDmg(ch, ef.dmg);
        });
        render();
        // ── Fase 8f Etapa 4: killEvents por DoT ──
        if (msg.killEvents && msg.killEvents.length > 0) {
          var allC2 = [...G.p1.chars, ...G.p2.chars];
          msg.killEvents.forEach(function(ev) {
            if (ev.type === 'kael_furia') {
              var kael = allC2.find(function(c) { return c.id === 'kael'; });
              if (kael) {
                kael._furia = true;
                kael.hp = ev.kaelHp;
                floatStatus(kael, '😡 FÚRIA!', '#ff4040');
                addLog('😡 [Passiva] Kael entra em Fúria por morte de aliado (DoT)!', 'info');
              }
            }
            if (ev.type === 'caeryn_morte') {
              allC2.filter(function(c) { return c.alive && c._caerynDef; }).forEach(function(c) {
                c.curDef = Math.max(c.def, c.curDef - c._caerynDef);
                c.def    = Math.max(0, c.def - c._caerynDef);
                floatStatus(c, '💔 -DEF Caeryn', '#c06060');
                c._caerynDef = 0;
              });
            }
            if (ev.type === 'varok_morte') {
              allC2.filter(function(c) { return c.alive && c._varokAtq; }).forEach(function(c) {
                c.curAtq = Math.max(c.atq, c.curAtq - c._varokAtq);
                c.atq    = Math.max(0, c.atq - c._varokAtq);
                floatStatus(c, '💔 -ATQ Varok', '#c06060');
                c._varokAtq = 0;
              });
            }
            if (ev.type === 'zarae_morte') {
              allC2.filter(function(c) { return c.alive && c._zaraePow; }).forEach(function(c) {
                floatStatus(c, '💔 -POW Zarae', '#c06060');
                c._zaraePow = 0;
              });
            }
            if (ev.type === 'zephyr_morte') {
              allC2.filter(function(c) { return c.alive && c._inspirado; }).forEach(function(c) {
                c.curAtq -= 1; c.curDef -= 1; c._inspirado = false;
                floatStatus(c, '💔 -Inspiração', '#c06060');
              });
            }
          });
          render();
        }
        applyServerState(msg.state); // v1.90
        if (!msg.alive) { checkWin(); }
      }
    }

    else if (msg.type === 'skip_anim') {
      // Animação de passar rodada — oponente vê o personagem que passou
      var allCharsSkip = [...G.p1.chars, ...G.p2.chars];
      var chSkip = allCharsSkip.find(function(c) { return c.id === msg.charId; });
      if (chSkip) {
        addLog(chSkip.name + ' passa a rodada.', 'info');
        // Kuro/Concentração Marcial: sincroniza +2 cargas do skip
        if (chSkip.id === 'kuro' && msg.satsui !== undefined) {
          chSkip._satsui = msg.satsui;
          addLog('🔥 ' + chSkip.name + ': Concentração Marcial ' + msg.satsui + '/10 (+2).', 'info');
          floatAccum(chSkip, '🔥' + msg.satsui + '/10');
        }
        if (_vfxEnabled && _pvpAnimFull) { _animPassTurn(chSkip); }
        render();
      }
    }

    else if (msg.type === 'turn_skipped') {
      var allChars = [...G.p1.chars, ...G.p2.chars];
      var ch = allChars.find(function(c) { return c.id === msg.charId; });
      var icon = msg.reason === 'frozen' ? '🧊' : '💫';
      var label = msg.reason === 'frozen' ? 'Congelado' : 'Atordoado';
      if (ch) {
        addLog(icon + ' [Servidor] ' + ch.name + ' perdeu o turno! (' + label + ')', 'sys');
        floatStatus(ch, icon + ' ' + label + '!', msg.reason === 'frozen' ? '#7aade8' : '#c9a84c');
        applyServerState(msg.state); // v1.90
        render();
      }
    }

    else if (msg.type === 'initiative_waiting') {
      addLog('⏳ [Railway] Iniciativa registrada! Aguardando oponente...', 'sys');
    }

    else if (msg.type === 'initiative_result') {
      addLog('⚔️ [Railway] Ordem de iniciativa definida pelo servidor!', 'sys');
      if (_introRunning) {
        _pendingInitiativeResult = msg;
      } else {
        _applyInitiativeResult(msg);
      }
    }

    // Kuro/Dedicação Total: sincroniza naipe no cliente oposto
    else if (msg.type === 'kuro_suit') {
      var allCharsKR = [...G.p1.chars, ...G.p2.chars];
      var kuroCh = allCharsKR.find(function(c) { return c.id === 'kuro'; });
      if (kuroCh) {
        kuroCh.suit = msg.suit;
        kuroCh._ryuSuit = msg.suit;
        kuroCh._ryuSuitTimer = 2;
        var symKR = {spades:'♠',hearts:'♥',clubs:'♣',diamonds:'♦',neutral:'○'};
        addLog('🥋 Kuro Isamu adota ' + (symKR[msg.suit]||'') + ' ' + msg.suit.toUpperCase() + ' por 2 turnos!', 'info');
        floatStatus(kuroCh, '🥋 ' + (symKR[msg.suit]||'') + ' ' + msg.suit.toUpperCase(), '#ffcc00');
        render();
      }
    }

    else if (msg.type === 'kuro_satsui') {
      var allCharsKS = [...G.p1.chars, ...G.p2.chars];
      var ksCh = allCharsKS.find(function(c) { return c.id === 'kuro'; });
      if (ksCh) {
        ksCh._satsui = msg.satsui;
        addLog('🔥 ' + ksCh.name + ': Concentração Marcial ' + msg.satsui + '/10.', 'info');
        floatAccum(ksCh, '🔥' + msg.satsui + '/10');
        render();
      }
    }

    else if (msg.type === 'skip_passive') {
      var allCharsSP = [...G.p1.chars, ...G.p2.chars];
      var spCh = allCharsSP.find(function(c) { return c.id === msg.charId; });
      if (!spCh) return;
      // Grimbol: carta extra
      if (msg.charId === 'grim') {
        addLog('🔧 Grimbol: Grande Gênio! Carta extra comprada.', 'info');
        floatPassiveDraw(spCh, 1, '🔧');
      }
      // Kane: exibe arma e carta extra se rolou
      if (msg.charId === 'kane') {
        var weaponLabel = { pistola: '🔫 Pistola', metralhadora: '💥 Metralhadora', shotgun: '💥 Shotgun', extra: '🃏 +1 carta' };
        var wl = weaponLabel[msg.weapon] || '';
        if (wl) { floatAccum(spCh, wl); addLog('🔫 Kane: Resgate! ' + wl, 'info'); }
        if (msg.weapon === 'extra') floatPassiveDraw(spCh, 1, '🃏');
        if (msg.weapon !== 'extra') {
          spCh._weapon = msg.weapon;
          marcoUpdateWeaponSlot(spCh);
        }
      }
      // Elowen: +1 carta por patrulheiro aliado vivo
      if (msg.charId === 'pt_elo' && msg.count) {
        addLog('🌸 Elowen: +' + msg.count + ' carta(s) — Patrulheiro de Combate!', 'info');
        floatPassiveDraw(spCh, msg.count, '🌸');
      }
      // Kuro/Concentração Marcial: +1 ao encerrar rodada
      if (msg.type === 'kuro_satsui' && msg.satsui !== undefined) {
        spCh._satsui = msg.satsui;
        addLog('🔥 ' + spCh.name + ': Concentração Marcial ' + msg.satsui + '/10.', 'info');
        floatAccum(spCh, '🔥' + msg.satsui + '/10');
      }
    }

    else if (msg.type === 'next_turn') {
      if (_cinematicRunning) {
        _pendingNextTurn = msg;
      } else {
        processPvpNextTurn(msg);
      }
    }

    // ── Timers sincronizados: turno expirou no servidor ──
    else if (msg.type === 'turn_timeout') {
      _clearPvpTimers();
      closePanel();
      var localOwnerTt = _isHost ? 'p1' : 'p2';
      var quem = msg.owner === localOwnerTt ? 'Seu turno expirou' : 'Turno do adversário expirou';
      addLog('⏱️ ' + quem + ' — vez passada automaticamente');
    }

    // ── Fase 9: Fim de batalha sincronizado ──
    else if (msg.type === 'game_over') {
      _clearPvpTimers();
      closePanel();
      // Determina se ganhou ou perdeu: host = p1, guest = p2
      var localOwnerGo = _isHost ? 'p1' : 'p2';
      var isWin = (msg.winner === localOwnerGo);
      var reasonMsg = '';
      if (msg.reason === 'timeout')    reasonMsg = ' (tempo esgotado)';
      if (msg.reason === 'disconnect') reasonMsg = ' (oponente desconectou)';
      if (msg.reason === 'dot')        reasonMsg = ' (dano contínuo)';
      addLog((isWin ? '🏆 VITÓRIA' : '💀 DERROTA') + reasonMsg + ' — fim de batalha!', 'sys');
      // Usa endGame local para salvar Firebase e exibir tela gameover
      var winnerLocal = isWin ? 'p1' : 'p2';
      endGame(winnerLocal);
      _fullPvpCleanup();
    }

    // ── Fase 10: Reconexão durante batalha ──
    else if (msg.type === 'reconnect_state') {
      addLog('🔄 Reconectado — restaurando batalha...', 'sys');
      // Restaura HPs, statuses, stats e cooldowns de p1
      msg.p1Chars.forEach(function(sc) {
        var ch = G.p1.chars.find(function(c) { return c.id === sc.id; });
        if (!ch) return;
        ch.hp = sc.hp;
        ch.maxHp = sc.maxHp;
        ch.alive = sc.alive;
        ch.statuses = sc.statuses || [];
        ch.curAtq = sc.curAtq;
        ch.curDef = sc.curDef;
        ch.cooldowns = sc.cooldowns || {};
      });
      // Restaura HPs, statuses, stats e cooldowns de p2
      msg.p2Chars.forEach(function(sc) {
        var ch = G.p2.chars.find(function(c) { return c.id === sc.id; });
        if (!ch) return;
        ch.hp = sc.hp;
        ch.maxHp = sc.maxHp;
        ch.alive = sc.alive;
        ch.statuses = sc.statuses || [];
        ch.curAtq = sc.curAtq;
        ch.curDef = sc.curDef;
        ch.cooldowns = sc.cooldowns || {};
      });
      // Restaura ordem e turno
      if (msg.order) G.order = msg.order;
      if (msg.orderIdx !== undefined) G.orderIdx = msg.orderIdx;
      if (msg.turn !== undefined) G.turn = msg.turn;
      render();
      addLog('✅ Batalha restaurada — turno ' + (G.turn || 1), 'sys');
    }

    else if (msg.type === 'error') {
      addLog('❌ [Railway] Erro: ' + msg.message, 'sys');
    }
  };

  _pvpSocket.onclose = function() {
    addLog('🔴 [Railway] Desconectado do servidor.', 'sys');
    _pvpSocket = null;
  };

  _pvpSocket.onerror = function(err) {
    addLog('❌ [Railway] Erro na conexão!', 'sys');
  };
}

function pvpDisconnect() {
  if (_pvpSocket) { _pvpSocket.close(); _pvpSocket = null; }
  if (_pvpPingInterval) { clearInterval(_pvpPingInterval); _pvpPingInterval = null; }
}

// ══ LIMPEZA TOTAL DO ESTADO PvP ══
function _fullPvpCleanup() {
  _logEvent('_fullPvpCleanup — limpando estado PvP completo', 'SYS');
  // Socket
  pvpDisconnect();
  // Timers PvP
  _clearPvpTimers();
  // Loading overlay
  _hidePvpLoading();
  // Estado PvP
  window._pvpContext = null;
  window._trainingLabMode = false;
  window._survivorMode = false;
  _restoreBattleBg();
  _isHost = false;
  _pvpSkipCount = 0;
  _introRunning = false;
  _pendingInitiativeResult = null;
  _pendingNextTurn = null;
  _cinematicRunning = false;
  _currentRoomId = null;
  // Draft
  if (_draftListener) { _draftListener(); _draftListener = null; }
  if (_draftTimer) { clearInterval(_draftTimer); _draftTimer = null; }
  _draftSalaId = null;
  // Timer de iniciativa
  if (_pvpInitTimer) { clearInterval(_pvpInitTimer); _pvpInitTimer = null; }
  // Timer display
  var _timerEl = document.getElementById('pvp-timer-display');
  if (_timerEl) _timerEl.remove();
  // Loading timeout
  if (window._pvpLoadingTimeout) { clearTimeout(window._pvpLoadingTimeout); window._pvpLoadingTimeout = null; }
  // Cancela loading overlay
  var cancelBtn = document.getElementById('pvp-loading-cancel');
  if (cancelBtn) cancelBtn.style.display = 'none';
  // G reset — limpa objeto de batalha
  if (typeof G !== 'undefined' && G) {
    G.over = true;
  }
  // UI cleanup
  var defPanel = document.getElementById('def-panel');
  if (defPanel) defPanel.classList.remove('open');
  var bottomPanel = document.getElementById('bottom-panel');
  if (bottomPanel) bottomPanel.classList.remove('open');
  var targetBanner = document.getElementById('target-banner');
  if (targetBanner) targetBanner.classList.remove('on');
  var targetCancelBtn = document.getElementById('target-cancel-btn');
  if (targetCancelBtn) targetCancelBtn.style.display = 'none';
  var initBtn = document.getElementById('init-reopen-btn');
  if (initBtn) initBtn.style.display = 'none';
  var initQueue = document.getElementById('init-queue');
  if (initQueue) { initQueue.classList.remove('visible'); initQueue.innerHTML = ''; }
  // Cinematic cleanup
  _goCinClear();
  var goCinEl = document.getElementById('go-cinematic');
  if (goCinEl) goCinEl.style.display = 'none';
}

// Ping periódico pra manter conexão viva
var _pvpPingInterval = null;

// ── Timers PvP ──────────────────────────────────────────
var _pvpActionTimer  = null; // timer do atacante (90s)
var _pvpDefTimer     = null; // timer do defensor (30s)
var _pvpSkipCount    = 0;    // contador de rodadas puladas (gameloss em 3)

function _clearPvpTimers() {
  if (_pvpActionTimer) { clearInterval(_pvpActionTimer); _pvpActionTimer = null; }
  if (_pvpDefTimer)    { clearInterval(_pvpDefTimer);    _pvpDefTimer    = null; }
}

// Timer do atacante — 90s, se não agir pula a rodada
function _startActionTimer() {
  if (!_pvpSocket || !_pvpSocket.readyState === WebSocket.OPEN) return;
  _clearPvpTimers();
  var secs = 90;
  _updateTimerDisplay(secs, 'action');
  _pvpActionTimer = setInterval(function() {
    secs--;
    _updateTimerDisplay(secs, 'action');
    if (secs <= 0) {
      _clearPvpTimers();
      _pvpSkipCount++;
      addLog('⏰ Tempo esgotado! Rodada pulada. (' + _pvpSkipCount + '/3)', 'dmg');
      // Compra uma carta como compensação
      draw('p1', 1, '+1 carta');
      render();
      pvpSend('skip_turn', { skipCount: _pvpSkipCount });
      if (_pvpSkipCount >= 3) {
        addLog('💀 3 rodadas puladas — GAMELOSS!', 'dmg');
        pvpSend('gameloss', {});
      }
    }
  }, 1000);
}

// Timer do defensor — 30s, defende sem carta automaticamente
function _startDefTimer(autoFn) {
  if (!_pvpSocket || !_pvpSocket.readyState === WebSocket.OPEN) return;
  _clearPvpTimers();
  var secs = 30;
  _updateTimerDisplay(secs, 'def');
  _pvpDefTimer = setInterval(function() {
    secs--;
    _updateTimerDisplay(secs, 'def');
    if (secs <= 0) {
      _clearPvpTimers();
      addLog('⏰ Tempo de defesa esgotado! Defendendo sem carta.', 'info');
      autoFn();
    }
  }, 1000);
}

function _updateTimerDisplay(secs, tipo) {
  var el = document.getElementById('pvp-timer-display');
  if (!el) {
    el = document.createElement('div');
    el.id = 'pvp-timer-display';
    el.style.cssText = 'position:absolute;top:60px;right:12px;z-index:999;background:rgba(0,0,0,0.8);color:var(--gold);font-family:Cinzel,serif;font-size:13px;padding:6px 12px;border-radius:8px;border:1px solid var(--gold)';
    document.body.appendChild(el);
  }
  var icon = tipo === 'action' ? '⚔️' : '🛡';
  var color = secs <= 10 ? '#ff4444' : secs <= 30 ? '#ffaa00' : 'var(--gold)';
  el.style.color = color;
  el.textContent = icon + ' ' + secs + 's';
  if (secs <= 0) { el.remove(); }
}
function _startPvpPing() {
  if (_pvpPingInterval) clearInterval(_pvpPingInterval);
  _pvpPingInterval = setInterval(function() {
    if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
      pvpSend('ping', {});
    } else {
      clearInterval(_pvpPingInterval);
      _pvpPingInterval = null;
    }
  }, 15000); // ping a cada 15 segundos
}

function pvpSend(type, data) {
