function charDetailStart(charId) {
  charDetailCancel();
  _charDetailTimer = setTimeout(()=>{ openCharDetail(charId); }, 1500);
}
// Cancela se soltar antes de 1.5s
function charDetailCancel() {
  if(_charDetailTimer) { clearTimeout(_charDetailTimer); _charDetailTimer=null; }
}

function _refreshCharDetailStats(charId) {
  var base = CHARS.find(function(c) { return c.id === charId; });
  if (!base) return;
  var det = CHAR_DETAILS[charId] || { ini: 0 };
  var gameActive = document.getElementById('screen-game') && document.getElementById('screen-game').classList.contains('active');
  var liveChar = (gameActive && typeof G !== 'undefined' && G && G.p1 && G.p2)
    ? G.p1.chars.concat(G.p2.chars).find(function(c) { return c.id === charId; })
    : null;

  var pvslbl = document.getElementById('cdm-pvs-lbl');
  if (pvslbl) pvslbl.textContent = liveChar ? 'HP' : 'PVS';

  var _eqBonus = { ATQ: 0, DEF: 0, INC: 0, PVS: 0 };
  if (_equipLoaded) {
    var _ed = _equipData[charId];
    if (_ed && _ed.slot1 && _ed.slot1._item) {
      var _ei = _ed.slot1._item;
      var _el = _equipGetLevel(_ed.slot1.xp || 0);
      var _ev = _ei.prefixVal + (_el - 1);
      _eqBonus[_ei.prefix] = _ev;
    }
  }

  if (liveChar) {
    document.getElementById('cdm-pvs').textContent = liveChar.hp + '/' + liveChar.maxHp;
    document.getElementById('cdm-atq').textContent = liveChar.curAtq;
    document.getElementById('cdm-def').textContent = liveChar.curDef;
    document.getElementById('cdm-ini').textContent = det.ini;
  } else {
    document.getElementById('cdm-pvs').innerHTML = base.pvs + (_eqBonus.PVS ? ' <span style="color:#5ac880;font-size:11px">(+' + _eqBonus.PVS + ')</span>' : '');
    document.getElementById('cdm-atq').innerHTML = base.atq + (_eqBonus.ATQ ? ' <span style="color:#5ac880;font-size:11px">(+' + _eqBonus.ATQ + ')</span>' : '');
    document.getElementById('cdm-def').innerHTML = base.def + (_eqBonus.DEF ? ' <span style="color:#5ac880;font-size:11px">(+' + _eqBonus.DEF + ')</span>' : '');
    document.getElementById('cdm-ini').innerHTML = det.ini + (_eqBonus.INC ? ' <span style="color:#5ac880;font-size:11px">(+' + _eqBonus.INC + ')</span>' : '');
  }
}

function openCharDetail(charId) {
  const base = CHARS.find(c=>c.id===charId);
  if(!base) return;
  const det  = CHAR_DETAILS[charId] || {ini:0, passives:[]};
  const s    = SUITS[base.suit] || SUITS.neutral;
  const adv  = SUIT_ADV[base.suit] || SUIT_ADV.neutral;

  // Personagem instanciado na batalha (se houver)
  const liveChar = (typeof G !== 'undefined' && G.p1 && G.p2)
    ? [...(G.p1.chars||[]),...(G.p2.chars||[])].find(c=>c.id===charId)
    : null;

  // Registra o personagem aberto (para atualizações em tempo real via addSt)
  _charDetailOpenId = charId;

  const modal = document.getElementById('char-detail-modal');
  modal.style.borderColor = s.color;
  modal.style.boxShadow   = `0 0 30px ${s.color}40, 0 0 60px rgba(0,0,0,0.8)`;

  var _i = document.getElementById('cdm-suit-icon');
  var _s = getCharSprite(charId, 'idle');
  if (_s) { _i.innerHTML = '<img class="sprite-img sprite-detail" src="'+_s+'" alt=""><span style="position:absolute;bottom:-2px;right:-8px;font-size:20px;color:'+s.color+';filter:drop-shadow(0 0 6px '+s.color+') drop-shadow(0 1px 3px rgba(0,0,0,0.9))">'+s.sym+'</span>'; _i.style.color = ''; }
  else { _i.innerHTML = ''; _i.style.color = s.color; _i.textContent = s.sym; }
  document.getElementById('cdm-name').textContent = base.name;
  document.getElementById('cdm-sub').textContent  = base.sub || '';

  // Badges de vantagem ao lado do nome
  const badgesEl = document.getElementById('cdm-suit-badges');
  if(base.suit === 'neutral') {
    badgesEl.innerHTML = '';
  } else {
    // Naipe que este personagem vence
    const winsAgainst = SUITS[base.suit]?.beats;
    const winsS = winsAgainst ? SUITS[winsAgainst] : null;
    // Naipe que vence este personagem (inverso: quem tem beats === base.suit)
    const losesTo = Object.keys(SUITS).find(k => SUITS[k].beats === base.suit);
    const losesS = losesTo ? SUITS[losesTo] : null;
    badgesEl.innerHTML =
      (winsS  ? `<span class="cdm-suit-badge wins"  title="${adv.adv}">⚔ ${winsS.sym}</span>` : '') +
      (losesS ? `<span class="cdm-suit-badge loses" title="${adv.dis}">⚠ ${losesS.sym}</span>` : '');
  }

  // Stats ao vivo
  _refreshCharDetailStats(charId);

  // Passivas (estáticas — descrição do personagem)
  const passDiv = document.getElementById('cdm-passives');
  passDiv.innerHTML = det.passives.length
    ? det.passives.map(p=>`
        <div class="cdm-passive" style="border-color:${s.color}">
          <div class="cdm-passive-name">⬡ ${p.name}</div>
          <div class="cdm-passive-desc">${p.desc}</div>
        </div>`).join('')
    : '<div style="font-size:10px;color:var(--text2);padding:4px 0">Nenhuma passiva.</div>';

  // Habilidades
  const skillDiv = document.getElementById('cdm-skills');
  skillDiv.innerHTML = base.skills.map(sk=>{
    const recarga  = sk.recarga==='L'||sk.recharge ? 'Recarga L' : null;
    const isRapida = sk.acao==='Rápida';
    const powerStr = sk.power!==undefined&&sk.power!==0&&sk.power!==''
      ? `Poder: ${sk.power}` : 'Poder: —';
    const turnoStr = sk.turno==='L' ? 'Turno L' : null;
    const cdVal = liveChar && liveChar.cooldowns ? (liveChar.cooldowns[sk.id]||0) : 0;
    const cdBadge = cdVal > 0 ? `<span class="cdm-tag recarga">⏳ CD: ${cdVal}t</span>` : '';
    return `
      <div class="cdm-skill">
        <div class="cdm-skill-header">
          <div class="cdm-skill-name">${sk.name}</div>
        </div>
        <div class="cdm-skill-tags">
          <span class="cdm-tag power">${powerStr}</span>
          <span class="cdm-tag">${sk.type||'—'}</span>
          <span class="cdm-tag">${sk.target==='all_enemy'?'Todos Inimigos':sk.target==='all_ally'?'Todos Aliados':sk.target==='all'?'Todos':'Inimigo'}</span>
          ${recarga?`<span class="cdm-tag recarga">${recarga}</span>`:''}
          ${turnoStr?`<span class="cdm-tag recarga">${turnoStr}</span>`:''}
          ${isRapida?`<span class="cdm-tag rapida">⚡ Rápida</span>`:''}
          ${cdBadge}
        </div>
        ${sk.desc?`<div class="cdm-skill-desc">${sk.desc}</div>`:''}
      </div>`;
  }).join('');

  // Naipe — seção expandida com ícones coloridos
  const suitName = base.suit==='hearts'?'Copas':base.suit==='clubs'?'Paus':base.suit==='diamonds'?'Ouro':base.suit==='spades'?'Espadas':'Neutro';
  const winsAgainstKey = SUITS[base.suit]?.beats;
  const losesToKey = Object.keys(SUITS).find(k => SUITS[k].beats === base.suit);
  const winsS2  = winsAgainstKey ? SUITS[winsAgainstKey] : null;
  const losesS2 = losesToKey ? SUITS[losesToKey] : null;
  const winsName  = winsAgainstKey === 'hearts'?'Copas':winsAgainstKey==='clubs'?'Paus':winsAgainstKey==='diamonds'?'Ouro':winsAgainstKey==='spades'?'Espadas':'—';
  const losesName = losesToKey === 'hearts'?'Copas':losesToKey==='clubs'?'Paus':losesToKey==='diamonds'?'Ouro':losesToKey==='spades'?'Espadas':'—';
  document.getElementById('cdm-suit-adv').innerHTML = base.suit === 'neutral'
    ? `<span style="color:var(--text2)">◆ Sem vantagens ou desvantagens de naipe.</span>`
    : `<div style="display:flex;flex-direction:column;gap:5px">
        <div style="display:flex;align-items:center;gap:6px">
          <span style="font-size:16px;color:${s.color};filter:drop-shadow(0 0 4px ${s.color})">${s.sym}</span>
          <span style="color:var(--text);font-weight:700">${suitName}</span>
        </div>
        ${winsS2 ? `<div style="display:flex;align-items:center;gap:6px">
          <span style="color:#60e880;font-size:11px;width:14px">⚔</span>
          <span style="font-size:15px;color:${winsS2.color};filter:drop-shadow(0 0 3px ${winsS2.color})">${winsS2.sym}</span>
          <span style="color:#60e880">${adv.adv.replace(/[⚔⚠]\s*/,'').replace(/♥|♣|♦|♠/g,'').trim()} <span style="color:${winsS2.color}">${winsS2.sym} ${winsName}</span></span>
        </div>` : ''}
        ${losesS2 ? `<div style="display:flex;align-items:center;gap:6px">
          <span style="color:#ff7070;font-size:11px;width:14px">⚠</span>
          <span style="font-size:15px;color:${losesS2.color};filter:drop-shadow(0 0 3px ${losesS2.color})">${losesS2.sym}</span>
          <span style="color:#ff7070">${adv.dis.replace(/[⚔⚠]\s*/,'').replace(/♥|♣|♦|♠/g,'').trim()} <span style="color:${losesS2.color}">${losesS2.sym} ${losesName}</span></span>
        </div>` : ''}
      </div>`;

  // Status ao vivo — usa renderStatusPopup (lê estado puro, não DOM)
  if(liveChar) {
    renderStatusPopup(liveChar);
  } else {
    document.getElementById('cdm-status-section-title').style.display = 'none';
    document.getElementById('cdm-live-statuses').innerHTML = '';
  }

  document.getElementById('char-detail-overlay').classList.add('open');
  _charDetailOpen = true;
  document.getElementById('screen-game')?.classList.add('popup-blocked');
  if (typeof _equipUpdateSlotDisplay === 'function') _equipUpdateSlotDisplay(charId);
  if (typeof _equipUpdateSlot2Display === 'function') _equipUpdateSlot2Display(charId);
}

function closeCharDetailDirect() {
  document.getElementById('char-detail-overlay').classList.remove('open');
  document.getElementById('screen-game')?.classList.remove('popup-blocked');
  _charDetailOpen   = false;
  _charDetailOpenId = null;
}
function closeCharDetail(e) {
  // Fecha só se clicou no overlay (fora do modal)
  if(e.target.id==='char-detail-overlay') closeCharDetailDirect();
}

// Bloquear processamento de cliques nas cartas enquanto popup aberto
function isCharDetailOpen() { return _charDetailOpen; }
/* ================= LOADING SCREEN v58 ================= */

// Sprites disponíveis para rotacionar no centro (apenas chars com sprite)
const LD_SPRITES = [
  { id: 'sam', path: 'sprites/sam/idle.png' },
  { id: 'nyxa',   path: 'sprites/nyxa/idle.png' },
  { id: 'lori',  path: 'sprites/lori/idle.png' },
  { id: 'grim',   path: 'sprites/grim/idle.png' },
  { id: 'kuro',   path: 'sprites/kuro/idle.png' },
  { id: 'vanc',   path: 'sprites/vanc/idle.png' },
  { id: 'gora',   path: 'sprites/gora/idle.png' },
  { id: 'kane',   path: 'sprites/kane/idle.png' },
  { id: 'zeph',   path: 'sprites/zeph/idle.png' },
  { id: 'kael',   path: 'sprites/kael/idle.png' },
  { id: 'tyre',   path: 'sprites/tyre/idle.png' },
  { id: 'pt_aer', path: 'sprites/pt_aer/idle.png' },
  { id: 'pt_cae', path: 'sprites/pt_cae/idle.png' },
  { id: 'pt_elo', path: 'sprites/pt_elo/idle.png' },
  { id: 'pt_zar', path: 'sprites/pt_zar/idle.png' },
  { id: 'pt_var', path: 'sprites/pt_var/idle.png' },
];

function initLoadingAnimations() {
