function renderColecao(owned) {
  const grid = document.getElementById('colecao-grid');
  const total = document.getElementById('colecao-total');
  grid.innerHTML = '';
  total.textContent = owned.length + ' / ' + LOJA_CHARS.length;
  LOJA_CHARS.forEach(c => {
    const isOwned = owned.includes(c.id);
    const suitColor = SUIT_COLORS[c.suit] || '#c9a84c';
    const card = document.createElement('div');
    card.style.cssText = `background:var(--bg2);border:1px solid ${isOwned ? suitColor+'66' : 'var(--border)'};border-radius:8px;padding:8px 6px;display:flex;flex-direction:column;align-items:center;gap:4px;opacity:${isOwned ? '1' : '0.4'};cursor:pointer`;
    card.onclick = () => openCharPopup(c, isOwned);
    card.innerHTML = `
      ${charAvatar(c, 48)}
      <div style="font-family:'Cinzel',serif;font-size:8px;color:${isOwned ? 'var(--text)' : 'var(--text2)'};text-align:center;line-height:1.3;margin-top:2px">${c.name}</div>
      ${c.sub ? `<div style="font-size:7px;color:var(--text2);text-align:center">${c.sub}</div>` : ''}
      ${isOwned ? `<div style="font-size:8px;color:#4caa6a">✓</div>` : `<div style="font-size:8px;color:var(--text2)">🔒</div>`}
    `;
    grid.appendChild(card);
  });
}

function openCharPopup(c, isOwned) {
  const suitColor  = SUIT_COLORS[c.suit]  || '#c9a84c';
  const suitSymbol = SUIT_SYMBOLS[c.suit] || '◆';
  const suitName   = {neutral:'Neutro', spades:'Espadas', clubs:'Paus', hearts:'Copas', diamonds:'Ouros'}[c.suit] || c.suit;

  // Busca skills do CHARS global
  const charData = (typeof CHARS !== 'undefined') ? CHARS.find(x => x.id === c.id) : null;
  const skills = charData ? charData.skills : [];

  // Monta HTML das skills
  const skillsHtml = skills.length ? skills.map(sk => {
    const typeColor = sk.type === 'Corporal' ? '#d45050' : sk.type === 'Melhoria' ? '#4caa6a' : sk.type === 'Passiva' ? '#7a7acc' : '#c9a84c';
    const tags = [];
    if (sk.turno  === 'S') tags.push('Turno');
    if (sk.recarga=== 'S') tags.push('Recarga');
    if (sk.acao   === 'S') tags.push('Ação Rápida');
    if (sk.recarga=== true || sk.recarga === 'true') tags.push('Recarga');
    return `<div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:6px;padding:8px 10px;margin-bottom:6px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span style="font-family:'Cinzel',serif;font-size:10px;color:var(--text)">${sk.name}</span>
        <span style="font-size:9px;color:${typeColor};margin-left:auto">${sk.type || ''}</span>
        ${sk.power !== undefined ? `<span style="font-size:9px;color:#c9a84c">Poder: ${sk.power}</span>` : ''}
      </div>
      <div style="font-size:9px;color:var(--text2);line-height:1.5">${sk.desc || ''}</div>
      ${tags.length ? `<div style="display:flex;gap:4px;margin-top:4px">${tags.map(t=>`<span style="font-size:8px;background:rgba(255,255,255,0.06);border-radius:3px;padding:1px 5px;color:var(--text2)">${t}</span>`).join('')}</div>` : ''}
    </div>`;
  }).join('') : '<div style="font-size:10px;color:var(--text2)">Skills não disponíveis.</div>';

  let overlay = document.getElementById('char-popup-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'char-popup-overlay';
    overlay.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.85);z-index:500;display:flex;align-items:flex-end;justify-content:center;backdrop-filter:blur(4px)';
    overlay.onclick = e => { if(e.target===overlay) overlay.style.display='none'; };
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = `
    <div style="background:var(--bg2);border:1px solid ${suitColor}55;border-radius:16px 16px 0 0;width:min(420px,100vw);max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 -4px 40px rgba(0,0,0,0.7)">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0a0c10,#161b26);padding:16px;display:flex;gap:12px;align-items:center;border-bottom:1px solid ${suitColor}33;flex-shrink:0">
        ${charAvatar(c, 56)}
        <div style="flex:1">
          <div style="font-family:'Cinzel',serif;font-size:14px;color:${suitColor}">${c.name}</div>
          ${c.sub ? `<div style="font-size:10px;color:var(--text2);margin-top:2px">${c.sub}</div>` : ''}
          <div style="display:flex;gap:10px;margin-top:6px">
            <span style="font-size:10px;color:#d45050">⚔ ${c.atq}</span>
            <span style="font-size:10px;color:#4c7bc9">🛡 ${c.def}</span>
            <span style="font-size:10px;color:#4caa6a">❤ ${c.pvs}</span>
            <span style="font-size:10px;color:${suitColor};margin-left:auto">${suitSymbol} ${suitName}</span>
          </div>
        </div>
        <button onclick="document.getElementById('char-popup-overlay').style.display='none'" style="background:transparent;border:none;color:var(--text2);font-size:20px;cursor:pointer;padding:0;flex-shrink:0">✕</button>
      </div>
      <!-- Skills -->
      <div style="overflow-y:auto;padding:12px 14px">
        <div style="font-family:'Cinzel',serif;font-size:9px;color:var(--text2);letter-spacing:2px;margin-bottom:8px">HABILIDADES</div>
        ${skillsHtml}
        <div style="margin-top:4px;padding-top:10px;border-top:1px solid var(--border);font-size:10px;color:${isOwned ? '#4caa6a' : 'var(--text2)'}">
          ${isOwned ? '✓ Personagem no seu roster' : '🔒 Não possui — disponível na loja por 100 🪙'}
        </div>
      </div>
    </div>
  `;
  overlay.style.display = 'flex';
}
</script>

<!-- ══ COLEÇÃO ══ -->
<div id="screen-colecao" class="screen">
  <div style="display:flex;flex-direction:column;height:100%;background:var(--bg)">

    <div style="background:var(--bg2);border-bottom:1px solid var(--border);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
      <button onclick="closeColecao()" style="background:transparent;border:none;color:var(--text2);font-size:20px;cursor:pointer;padding:0 4px">‹</button>
      <div style="font-family:'Cinzel',serif;font-size:13px;letter-spacing:3px;color:var(--gold)">COLEÇÃO</div>
      <div style="background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);border-radius:6px;padding:4px 10px">
        <span id="colecao-total" style="font-family:'Cinzel',serif;font-size:11px;color:var(--gold)">0 / 18</span>
      </div>
    </div>

    <div style="padding:8px 14px;background:var(--bg2);border-bottom:1px solid var(--border);font-size:10px;color:var(--text2);flex-shrink:0">
      Personagens desbloqueados aparecem em destaque. Bloqueados ficam opacos.
    </div>

    <div id="colecao-grid" style="flex:1;overflow-y:auto;padding:12px;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;align-content:start"></div>

  </div>
</div>

<script>
function closeColecao() {
