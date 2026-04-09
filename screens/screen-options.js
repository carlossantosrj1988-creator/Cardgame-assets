function openSelectOptions() {
  const el = document.getElementById('select-options-overlay');
  if(el) el.style.display = 'flex';
  _updateMusicUI();
}
function closeSelectOptions() {
  const el = document.getElementById('select-options-overlay');
  if(el) el.style.display = 'none';
  selOptShowMain();
}
function openPatchNotes() {
  const el = document.getElementById('patch-overlay');
  if(el) el.style.display = 'flex';
}
function closePatchNotes() {
  const el = document.getElementById('patch-overlay');
  if(el) el.style.display = 'none';
}
function openOptions() {
  const el = document.getElementById('options-overlay');
  if(el) { el.style.display = 'flex'; }
  // Show/hide Training Lab buttons
  var tlabOpts = document.getElementById('tlab-options');
  if(tlabOpts) tlabOpts.style.display = window._trainingLabMode ? 'block' : 'none';
  // Show/hide Survivor buttons
  var survOpts = document.getElementById('surv-options');
  if(survOpts) survOpts.style.display = window._survivorMode ? 'block' : 'none';
  _updateMusicUI();
}
function survOptVictory() {
  closeOptions();
  endGame('p1');
}
function survOptDefeat() {
  closeOptions();
  endGame('p2');
}
function closeOptions() {
  const el = document.getElementById('options-overlay');
  if(el) el.style.display = 'none';
  optShowMain();
}
// ── CATÁLOGO DE STATUS ────────────────────────────────────────────
const STATUS_CATALOG = {
  debuffs: [
    { icon:'🔥', name:'Queimadura',        tags:['2 turnos','DoT'],       desc:'Causa 10 de dano por turno e reduz 1 DEF enquanto ativo.' },
    { icon:'🩸', name:'Sangramento',       tags:['2 turnos','Acumulável ×3'], desc:'Causa dano por turno. Pode acumular até 3 cargas — cada carga adiciona mais dano.' },
    { icon:'⬇️', name:'Exposto',           tags:['2 turnos'],             desc:'DEF reduzida a 0. Ataques causam dano máximo.' },
    { icon:'💢', name:'Enfraquecido',      tags:['2 turnos'],             desc:'ATQ reduzido a 0. Ataques causam dano mínimo.' },
    { icon:'❄️', name:'Congelado',         tags:['2 turnos','Controle'],  desc:'50% de chance de perder o turno. Ao falhar, o status é removido.' },
    { icon:'💫', name:'Atordoado',         tags:['2 turnos','Controle'],  desc:'50% de chance de perder o turno. Ao falhar, o status é removido.' },
    { icon:'🧊', name:'Resfriamento',      tags:['2 turnos'],             desc:'Causa 10 de dano por turno e reduz 1 ATQ enquanto ativo.' },
    { icon:'🧪', name:'Armadura Derretida',tags:['1 turno'],              desc:'Impede o alvo de usar cartas de defesa e Valete no próximo ataque recebido.' },
    { icon:'⚡', name:'Estática',          tags:['2 turnos'],             desc:'Reduz ATQ em 2. Descargas elétricas interferem nos ataques.' },
    { icon:'🐢', name:'Lento',             tags:['1 turno'],              desc:'Reduz DEF em 2. O personagem reage mais devagar aos golpes.' },
    { icon:'☢️', name:'Radiação',          tags:['2 turnos','Acumulável ×4'], desc:'Dano cumulativo por turno. Acumula até 4 cargas — mais perigoso a cada aplicação.' },
    { icon:'🎭', name:'Encantado',         tags:['1 turno','Controle'],   desc:'50% de chance de atacar um aliado aleatório em vez do inimigo.' },
    { icon:'🎯', name:'Marcado',           tags:['2 turnos'],             desc:'Seiken Tsuki causa dano ×2 no alvo marcado. Sanren Geri causa ×3 por golpe e consome a marca.' },
    { icon:'🥩', name:'Amaciado',          tags:['2 turnos'],             desc:'Ataques do tipo Cortante causam dano dobrado no alvo.' },
    { icon:'☠️', name:'Veneno',            tags:['Permanente','Acumulável'], desc:'Causa 1 de dano por stack a cada turno. Sem duração e sem limite de stacks — acumula indefinidamente. Removível por efeitos de limpeza de debuff.' },
    { icon:'🌩️', name:'Azar',             tags:['Mecânica'],             desc:'50% de chance de um efeito negativo acontecer. Quando ativa, o efeito ocorre em sua magnitude completa conforme descrito.' },
    { icon:'🩸💥', name:'Hemorragia',      tags:['Instantâneo'],          desc:'Efeito instantâneo sem duração. Ativa um tick de Sangramento em todos os inimigos — cada um recebe dano igual a 3 × seus stacks de Sangramento ativos. O Sangramento não é removido nem reduzido. Se nenhum inimigo tiver Sangramento, não faz nada.' },
  ],
  buffs: [
    { icon:'🛡️', name:'Escudo',           tags:['2 turnos','Absorção'],  desc:'Absorve dano antes do HP. O valor do escudo diminui a cada golpe recebido.' },
    { icon:'🪞', name:'Imagem Espelhada',  tags:['1 turno'],              desc:'Reflete o próximo ataque recebido de volta ao atacante.' },
    { icon:'⬆️', name:'Fortalecido',      tags:['2 turnos'],             desc:'ATQ aumentado em 50% (×1,5) enquanto o efeito durar.' },
    { icon:'🛡️', name:'Fortificado',      tags:['2 turnos'],             desc:'DEF aumentada em 50% (×1,5) enquanto o efeito durar.' },
    { icon:'🔬', name:'Análise Tecnológica', tags:['2 turnos','Vyr\'Thas'], desc:'Todas as cartas contam como especialidade (♦), dobrando valor no ataque e +50% na defesa.' },
    { icon:'❤️', name:'Bônus Copas',      tags:['2 turnos','Naipe'],     desc:'Vantagem de naipe Copas→Paus: ATQ e DEF dobrados por 2 turnos.' },
    { icon:'🌿', name:'Furtivo (Paus)',    tags:['2 turnos','Naipe'],     desc:'Vantagem de naipe Paus→Ouro: próximas ações normais viram ataques furtivos.' },
    { icon:'⚔️', name:'Gladiadora: Frenesi', tags:['Passiva','Lorien'], desc:'Ativado abaixo de 20% HP. +1 ATQ e +1 DEF enquanto no limiar.' },
    { icon:'🪙', name:'Presença de Nimb', tags:['1 turno','Dee'],        desc:'Todas as habilidades deste turno se tornam Ação Rápida (age duas vezes).' },
    { icon:'⚔️', name:'Agora é Sério',    tags:['Gorath'],             desc:'ATACARRRR acumula +4 de poder a cada uso. Expira após 2 turnos naturais.' },
    { icon:'😊', name:'Máscara Feliz',    tags:['2 turnos','Dee'],       desc:'Contra-ataca automaticamente com um aliado sempre que um aliado for atacado.' },
    { icon:'😢', name:'Máscara Triste',   tags:['2 turnos','Dee'],       desc:'Ataque conjunto com um aliado sempre que um inimigo for atacado.' },
    { icon:'🟢', name:'Roupa Verde',      tags:['Tyren'],                 desc:'Regenera 3 PVS no início de cada turno natural do Tyren.' },
    { icon:'🔵', name:'Roupa Azul',       tags:['Tyren'],                 desc:'Tyren entra na frente de ataques normais direcionados a aliados, absorvendo o dano.' },
    { icon:'🔴', name:'Roupa Vermelha',   tags:['Tyren'],                 desc:'Contra-ataca com Avanço Escudo sempre que receber um ataque não-rápido e não-furtivo.' },
    { icon:'😡', name:'Fúria',            tags:['Permanente'],           desc:'Concedido por Dee ao aliado com menor HP. Efeito especial dependente do personagem.' },
    { icon:'🍀', name:'Sorte',            tags:['Mecânica'],             desc:'50% de chance de um efeito positivo acontecer. Quando ativa, o efeito ocorre em sua magnitude completa conforme descrito.' },
  ],
  accum: [
    { icon:'⚡', name:'Cargas Sam',     tags:['Sam','Máx 5'],        desc:'Acumula ao passar turno. Feixe ganha +1 poder por carga. Com 5 cargas, atinge todos os inimigos.' },
    { icon:'🔥', name:'Concentração Marcial',   tags:['Kuro Isamu','Máx 10'],         desc:'+1 automático por turno, +2 ao passar. Kohouken consome tudo: +2 poder por carga usada.' },
    { icon:'🗡️', name:'Acúmulo de Poder', tags:['Tyren','Máx 2'],         desc:'Acumula ao passar turno. Nv1: Avanço Espada ignora armadura. Nv2: Avanço Espada atinge todos os inimigos.' },
    { icon:'🔧', name:'Cargas Arcabuz',   tags:['Grimbol','Máx 3'],     desc:'Acumula via passiva Engenharia Avançada. Cada carga aumenta o poder do Arcabuz.' },
    { icon:'🔫', name:'Arma Ativa',       tags:['Marco'],                desc:'Marco troca de arma ao passar turno (Pistola / Metralhadora / Shotgun). Cada arma altera o estilo de ataque.' },
  ],
};

function _buildCatalogSection(list, cssClass) {
  return list.map(e => `
    <div class="cat-entry ${cssClass}">
      <div class="cat-icon">${e.icon}</div>
      <div class="cat-body">
        <div class="cat-name">${e.name}</div>
        <div class="cat-desc">${e.desc}</div>
        <div class="cat-tags">${e.tags.map(t=>`<span class="cat-tag">${t}</span>`).join('')}</div>
      </div>
    </div>`).join('');
}

function optShowCatalog() {
  const dEl = document.getElementById('catalog-debuff');
  if(!dEl.children.length) {
    dEl.innerHTML = _buildCatalogSection(STATUS_CATALOG.debuffs, 'cat-debuff');
    document.getElementById('catalog-buff').innerHTML  = _buildCatalogSection(STATUS_CATALOG.buffs,  'cat-buff');
    document.getElementById('catalog-accum').innerHTML = _buildCatalogSection(STATUS_CATALOG.accum,  'cat-accum');
  }
  document.getElementById('opt-view-main').style.display    = 'none';
  document.getElementById('opt-view-catalog').style.display = 'flex';
}
function optShowMain() {
  document.getElementById('opt-view-catalog').style.display = 'none';
  document.getElementById('opt-view-main').style.display    = '';
}
function openCatalog() { optShowCatalog(); }
function closeCatalog() { optShowMain(); }

function selOptShowCatalog() {
  const dEl = document.getElementById('sel-catalog-debuff');
  if(!dEl.children.length) {
    dEl.innerHTML = _buildCatalogSection(STATUS_CATALOG.debuffs, 'cat-debuff');
    document.getElementById('sel-catalog-buff').innerHTML  = _buildCatalogSection(STATUS_CATALOG.buffs,  'cat-buff');
    document.getElementById('sel-catalog-accum').innerHTML = _buildCatalogSection(STATUS_CATALOG.accum,  'cat-accum');
  }
  document.getElementById('sel-opt-view-main').style.display    = 'none';
  document.getElementById('sel-opt-view-catalog').style.display = 'flex';
}
function selOptShowMain() {
  document.getElementById('sel-opt-view-catalog').style.display = 'none';
  document.getElementById('sel-opt-view-main').style.display    = '';
}
function selCatalogShowTab(tab, btn) {
  document.querySelectorAll('#sel-opt-view-catalog .catalog-section').forEach(s => s.classList.remove('visible'));
  document.querySelectorAll('#sel-opt-view-catalog .catalog-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('sel-catalog-'+tab).classList.add('visible');
  btn.classList.add('active');
}
function catalogShowTab(tab, btn) {
  document.querySelectorAll('.catalog-section').forEach(s => s.classList.remove('visible'));
  document.querySelectorAll('.catalog-tab').forEach(b => b.classList.remove('active'));
  document.getElementById('catalog-'+tab).classList.add('visible');
  btn.classList.add('active');
}

function openRules() {
  const opt = document.getElementById('options-overlay');
  if(opt) opt.style.display = 'none';
  const el = document.getElementById('rules-overlay');
  if(el) el.style.display = 'flex';
}
function closeRules() {
  const el = document.getElementById('rules-overlay');
  if(el) el.style.display = 'none';
}
function openLogFull() {
  if(isCharDetailOpen()) return;
  const overlay = document.getElementById('logfull-overlay');
  const body    = document.getElementById('logfull-body');
  if(!overlay || !body) return;
  // Se tem log visual da batalha, usa ele. Senão, mostra o _gameLog global.
  const src = document.getElementById('log');
  if (src && src.children.length > 0) {
    body.innerHTML = src.innerHTML;
  } else {
    body.innerHTML = _gameLog.map(function(line) {
      var cls = 'log-line';
      if (line.indexOf('[WS]') !== -1) cls += ' sys';
      else if (line.indexOf('[ACTION]') !== -1) cls += ' info';
      else if (line.indexOf('[BATTLE]') !== -1) cls += ' dmg';
      else if (line.indexOf('[NAV]') !== -1) cls += ' sys';
      return '<div class="' + cls + '">' + line + '</div>';
    }).join('');
  }
  overlay.style.display = 'flex';
  setTimeout(() => { body.scrollTop = body.scrollHeight; }, 50);
}
function closeLogFull() {
  const el = document.getElementById('logfull-overlay');
  if(el) el.style.display = 'none';
  const defPanel = document.getElementById('def-panel');
  const defPanelOpen = defPanel && defPanel.classList.contains('open');
  if(G && G.pendingAttack && !defPanelOpen) {
    addLog('🔍 JUIZ (Defesa): painel sumiu com defesa pendente — reabrindo...', 'sys');
    console.warn('[JUIZ] Painel de defesa sumiu com G.pendingAttack ativo. Reabrindo.');
    var pa = G.pendingAttack;
    if(G._defMode === 'single') showDefensePanel(pa.attacker, pa.sk, pa.atkCard, pa.target);
    else if(G._defMode === 'pvp') showDefensePanelPvP(pa.attacker, pa.sk, pa.atkCard, pa.target);
  }
}

// INIT
renderSelectP1();

// Pré-selecionar Modo Treino: Sam (P1) vs Gorath (P2)
(function() {
  const samusIdx = CHARS.findIndex(c=>c.id==='sam');
  const kataIdx = CHARS.findIndex(c=>c.id==='gora');
  if(samusIdx>=0) trSelP1 = samusIdx;
  if(kataIdx>=0) trSelP2 = kataIdx;
})();

// ══════════════════════════════════════════════════════════════════
// POPUP DE DETALHES DO PERSONAGEM
// ══════════════════════════════════════════════════════════════════
let _charDetailTimer  = null;
let _charDetailOpen   = false;
let _charDetailOpenId = null;  // id do personagem cujo popup está aberto

// Inicia timer de 2s ao pressionar (touch ou mousedown)
function charDetailStart(charId) {
