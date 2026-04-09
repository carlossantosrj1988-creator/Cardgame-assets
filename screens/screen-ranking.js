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
