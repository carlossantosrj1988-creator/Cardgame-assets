function closeColecao() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  var target = _cpBuyReturn();
  document.getElementById(target).classList.add('active');
}
</script>

<!-- ══ ONBOARDING ══ -->
<div id="screen-onboarding" class="screen">
  <div style="display:flex;flex-direction:column;height:100%;background:var(--bg)">

    <!-- HEADER -->
    <div style="background:linear-gradient(135deg,#0f1218,#1a1a3a);border-bottom:1px solid var(--border);padding:16px 14px;text-align:center;flex-shrink:0">
      <div style="font-family:'Cinzel',serif;font-size:18px;letter-spacing:4px;color:var(--gold)">BEM-VINDO</div>
      <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:2px;color:var(--text2);margin-top:4px">PAST AND THE FUTURE TCG</div>
    </div>

    <!-- STEP 1: escolher personagem -->
    <div id="ob-step1" style="flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:10px">
      <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.25);border-radius:10px;padding:12px 14px">
        <div style="font-family:'Cinzel',serif;font-size:12px;color:var(--gold);margin-bottom:4px">ESCOLHA SEU PRIMEIRO PERSONAGEM</div>
        <div style="font-size:10px;color:var(--text2);line-height:1.6">Toque para ver as habilidades. Quando decidir, clique em <strong style="color:var(--gold)">CONFIRMAR</strong>. Você também ganha <strong style="color:var(--gold)">1.200 🪙</strong> e 5 personagens aleatórios.</div>
      </div>
      <div id="ob-chars-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"></div>
      <!-- Botão confirmar (aparece após seleção) -->
      <div id="ob-confirm-bar" style="display:none;position:sticky;bottom:0;padding:10px 0;background:var(--bg)">
        <button onclick="confirmObChoice(window._obSelected)" style="width:100%;background:linear-gradient(135deg,var(--gold),#7a5a10);color:#1a1000;border:none;padding:13px;border-radius:8px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:2px;cursor:pointer">✓ CONFIRMAR ESCOLHA</button>
      </div>
    </div>

    <!-- STEP 2: resultado do sorteio -->
    <div id="ob-step2" style="flex:1;overflow-y:auto;padding:14px;display:none;flex-direction:column;gap:10px">
      <div style="background:rgba(201,168,76,0.08);border:1px solid rgba(201,168,76,0.25);border-radius:10px;padding:12px 14px;text-align:center">
        <div style="font-size:24px;margin-bottom:6px">🎉</div>
        <div style="font-family:'Cinzel',serif;font-size:13px;color:var(--gold);margin-bottom:4px">SEU ROSTER INICIAL</div>
        <div style="font-size:10px;color:var(--text2)">Você escolheu + 5 personagens sorteados. Boa sorte!</div>
      </div>
      <div id="ob-result-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px"></div>
      <div style="background:rgba(76,170,106,0.08);border:1px solid rgba(76,170,106,0.25);border-radius:8px;padding:10px 14px;display:flex;align-items:center;gap:8px">
        <span style="font-size:18px">🪙</span>
        <div>
          <div style="font-family:'Cinzel',serif;font-size:11px;color:#4caa6a">1.200 COINS RECEBIDOS</div>
          <div style="font-size:9px;color:var(--text2);margin-top:2px">Use na loja para desbloquear mais personagens</div>
        </div>
      </div>
      <button onclick="finishOnboarding()" style="width:100%;background:linear-gradient(135deg,var(--gold),#7a5a10);color:#1a1000;border:none;padding:13px;border-radius:8px;font-family:'Cinzel',serif;font-size:12px;letter-spacing:2px;cursor:pointer;margin-top:4px">ENTRAR NO LOBBY →</button>
    </div>

  </div>
</div>
</div> <!-- /game-canvas -->

<script>
function startOnboarding() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-onboarding').classList.add('active');
  document.getElementById('ob-step1').style.display = 'flex';
  document.getElementById('ob-step2').style.display = 'none';
  document.getElementById('ob-confirm-bar').style.display = 'none';
  window._obSelected = null;
  renderObChars();
}

function renderObChars() {
  const grid = document.getElementById('ob-chars-grid');
  grid.innerHTML = '';
  LOJA_CHARS.forEach(c => {
    const suitColor = SUIT_COLORS[c.suit] || '#c9a84c';
    const card = document.createElement('div');
    card.style.cssText = 'background:var(--bg2);border:2px solid var(--border);border-radius:8px;padding:8px 6px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:all 0.15s';
    card.dataset.id = c.id;
    // Toque longo ou segundo toque seleciona, primeiro toque abre popup
    let tapCount = 0;
    card.onclick = () => {
      tapCount++;
      if (tapCount === 1) {
        // Primeiro toque: abre popup de skills
        openCharPopup(c, false);
        // Mas também marca como selecionado
        selectObChar(c.id);
      }
    };
    card.innerHTML = `
      ${charAvatar(c, 48)}
      <div style="font-family:'Cinzel',serif;font-size:8px;color:var(--text);text-align:center;line-height:1.3;margin-top:2px">${c.name}</div>
      ${c.sub ? `<div style="font-size:7px;color:var(--text2);text-align:center">${c.sub}</div>` : ''}
      <div style="font-size:9px;color:${suitColor}">${SUIT_SYMBOLS[c.suit]||'◆'}</div>
    `;
    grid.appendChild(card);
  });
}

function selectObChar(id) {
  window._obSelected = id;
  // Highlight selected
  document.querySelectorAll('#ob-chars-grid > div').forEach(el => {
    const c = LOJA_CHARS.find(x => x.id === el.dataset.id);
    const suitColor = SUIT_COLORS[c?.suit] || '#c9a84c';
    el.style.borderColor = el.dataset.id === id ? suitColor : 'var(--border)';
    el.style.background  = el.dataset.id === id ? 'rgba(201,168,76,0.1)' : 'var(--bg2)';
  });
  // Show confirm button
  document.getElementById('ob-confirm-bar').style.display = 'block';
}

function confirmObChoice(chosenId) {
  // Pick 5 random from remaining
  const remaining = LOJA_CHARS.filter(c => c.id !== chosenId);
  const shuffled = remaining.sort(() => Math.random() - 0.5);
  const random5 = shuffled.slice(0, 5).map(c => c.id);
  const roster = [chosenId, ...random5];

  // Save to Firebase
  const user = window._fbUser;
  if (!user) return;
  const userRef = window._fbRef(window._fbDb, 'jogadores/' + user.uid);
  window._fbGet(userRef).then(snap => {
    const d = snap.val() || {};
    return window._fbSet(userRef, {
      ...d,
      coins: 0,
      rp: 0,
      roster: roster,
      onboarded: true,
      criadoEm: d.criadoEm || Date.now()
    });
  }).then(() => {
    showObResult(roster);
  }).catch(e => { console.error(e); alert('Erro ao salvar. Tente novamente.'); });
}

function showObResult(roster) {
  document.getElementById('ob-step1').style.display = 'none';
  const step2 = document.getElementById('ob-step2');
  step2.style.display = 'flex';

  const grid = document.getElementById('ob-result-grid');
  grid.innerHTML = '';
  roster.forEach((id, idx) => {
    const c = LOJA_CHARS.find(x => x.id === id);
    if (!c) return;
    const suitColor = SUIT_COLORS[c.suit] || '#c9a84c';
    const isChosen = idx === 0;
    const card = document.createElement('div');
    card.style.cssText = `background:var(--bg2);border:2px solid ${isChosen ? suitColor : suitColor+'44'};border-radius:8px;padding:8px 6px;display:flex;flex-direction:column;align-items:center;gap:4px`;
    card.innerHTML = `
      ${charAvatar(c, 48)}
      <div style="font-family:'Cinzel',serif;font-size:8px;color:var(--text);text-align:center;line-height:1.3;margin-top:2px">${c.name}</div>
      ${isChosen ? `<div style="font-size:8px;color:var(--gold)">✓ Escolhido</div>` : `<div style="font-size:8px;color:var(--text2)">Sorteado</div>`}
    `;
    grid.appendChild(card);
  });
}

function finishOnboarding() {
