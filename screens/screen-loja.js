function openLoja() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-loja').classList.add('active');
}
function closeLoja() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  var target = _cpBuyReturn();
  document.getElementById(target).classList.add('active');
}
</script>

<!-- ══ LOJA ══ -->
<div id="screen-loja" class="screen">
  <div style="display:flex;flex-direction:column;height:100%;background:var(--bg)">

    <!-- HEADER -->
    <div style="background:var(--bg2);border-bottom:1px solid var(--border);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0">
      <button onclick="closeLoja()" style="background:transparent;border:none;color:var(--text2);font-size:20px;cursor:pointer;padding:0 4px">‹</button>
      <div style="font-family:'Cinzel',serif;font-size:13px;letter-spacing:3px;color:var(--gold)">LOJA</div>
      <div style="background:rgba(201,168,76,0.1);border:1px solid rgba(201,168,76,0.3);border-radius:6px;padding:4px 10px;display:flex;align-items:center;gap:4px">
        <span style="font-size:13px">🪙</span>
        <span id="loja-coins" style="font-family:'Cinzel',serif;font-size:12px;color:var(--gold)">0</span>
      </div>
    </div>

    <!-- ABAS -->
    <div style="display:flex;border-bottom:1px solid var(--border);flex-shrink:0">
      <button id="tab-personagens" onclick="lojaTab('personagens')" style="flex:1;padding:10px;background:transparent;border:none;border-bottom:2px solid var(--gold);font-family:'Cinzel',serif;font-size:10px;letter-spacing:1px;color:var(--gold);cursor:pointer">PERSONAGENS</button>
      <button id="tab-cartas" onclick="lojaTab('cartas')" style="flex:1;padding:10px;background:transparent;border:none;border-bottom:2px solid transparent;font-family:'Cinzel',serif;font-size:10px;letter-spacing:1px;color:var(--text2);cursor:pointer">CARTAS</button>
    </div>

    <!-- PERSONAGENS -->
    <div id="loja-personagens" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px">

      <div style="font-size:10px;color:var(--text2);padding:2px 0 6px;text-align:center;letter-spacing:1px">PERSONAGENS INICIAIS — 100 🪙 cada</div>

      <div id="loja-chars-list"></div>

    </div>

    <!-- CARTAS -->
    <div id="loja-cartas" style="flex:1;overflow-y:auto;padding:12px;display:none;flex-direction:column;gap:8px">
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:16px;text-align:center">
        <div style="font-size:24px;margin-bottom:8px">🃏</div>
        <div style="font-family:'Cinzel',serif;font-size:11px;color:var(--text2);letter-spacing:1px">CARTAS DE TEMPORADA</div>
        <div style="font-size:10px;color:var(--text2);margin-top:6px;line-height:1.6">Novas cartas especiais serão disponibilizadas a cada temporada mensal.</div>
      </div>
    </div>

  </div>
</div>

<script>
const LOJA_CHARS = [
  {id:'kuro', name:'Kuro Isamu',      sub:'',                          suit:'neutral', atq:3, def:5, pvs:100, price:100, sprite:true,
   desc:'Um guerreiro disciplinado que acumula concentração a cada turno. Seu estilo metódico transforma paciência em golpes devastadores.'},
  {id:'vanc', name:'Comandante Vance',sub:'',                          suit:'spades',  atq:5, def:3, pvs:110, price:100, sprite:true,
   desc:'Líder de combate implacável. Ordena suas tropas com pulso de ferro e lidera pelo exemplo — sempre na linha de frente.'},
  {id:'zeph', name:'Zephyr',          sub:'o Bardo',                   suit:'clubs',   atq:4, def:3, pvs:110, price:100, sprite:true,
   desc:'Um bardo que transforma música em batalha. Sua presença inspira aliados, elevando o ataque e a defesa de todo o time.'},
  {id:'kane', name:'Kane',            sub:'O Mercenário',              suit:'clubs',   atq:4, def:4, pvs:110, price:100, sprite:true,
   desc:'Mercenário frio e calculista. Não luta por ideais — luta por sobrevivência. Versátil e difícil de prever em combate.'},
  {id:'gora', name:'Gorath',          sub:'o Bárbaro',                 suit:'hearts',  atq:4, def:5, pvs:130, price:100, sprite:true,
   desc:'Bárbaro colossal movido pela raiva. Quanto mais apanha, mais forte fica — e ainda protege os aliados mais fracos.'},
  {id:'grim', name:'Grimbol',         sub:'',                          suit:'diamonds',atq:2, def:3, pvs:110, price:100, sprite:true,
   desc:'Tático astuto que prefere armadilhas a confronto direto. Aplica status negativos e enfraquece o inimigo antes de atacar.'},
  {id:'sam',  name:'Sam',             sub:'',                          suit:'diamonds',atq:3, def:5, pvs:100, price:100, sprite:true,
   desc:'Engenheira de combate que acumula cargas para liberar uma rajada elétrica. Calma sob pressão, letal no momento certo.'},
  {id:'kael', name:'Kael Vorn',       sub:'',                          suit:'spades',  atq:4, def:2, pvs:120, price:100, sprite:true,
   desc:'Assassino ágil especializado em golpes furtivos. Ataca primeiro, pergunta depois — e nunca dá a segunda chance.'},
  {id:'tyre', name:'Tyren',           sub:'',                          suit:'hearts',  atq:2, def:4, pvs:130, price:100, sprite:true,
   desc:'Tanque resiliente com enorme reserva de vida. Absorve dano que destruiria qualquer outro e continua de pé.'},
  {id:'lori', name:'Lorien',          sub:'a Estrela',                 suit:'spades',  atq:3, def:2, pvs:110, price:100, sprite:true,
   desc:'Cavaleira celestial que desce dos céus com lança em riste. Sua carga é devastadora e sua presença ilumina o campo.'},
  {id:'nyxa', name:'Nyxar',           sub:'Entidade do Caos',          suit:'diamonds',atq:3, def:3, pvs:110, price:100, sprite:true,
   desc:'Ser de outra dimensão que dobra a realidade. Seus ataques ignoram padrões e causam efeitos imprevisíveis nos inimigos.'},
  {id:'pt_aer',name:'Aeryn',          sub:'Patrulheira Líder',         suit:'neutral', atq:3, def:3, pvs:120, price:100, sprite:true,
   desc:'Líder da patrulha élfica, equilibrada em ataque e defesa. Coordena o time com precisão e mantém a formação sob pressão.'},
  {id:'pt_cae',name:'Caeryn',         sub:'Patrulheiro da Guarda',     suit:'hearts',  atq:4, def:5, pvs:120, price:100, sprite:true,
   desc:'Guardião stoico da patrulha. Sua defesa é uma muralha — e quando parte para o ataque, o inimigo raramente se recupera.'},
  {id:'pt_elo',name:'Elowen',         sub:'Patrulheira do Suporte',    suit:'diamonds',atq:3, def:3, pvs:100, price:100, sprite:true,
   desc:'Curandeira e suporte da patrulha. Mantém aliados de pé com curas e bênçãos, virando batalhas que pareciam perdidas.'},
  {id:'pt_zar',name:'Zarae',          sub:'Patrulheira da Caça',       suit:'clubs',   atq:4, def:4, pvs:110, price:100, sprite:true,
   desc:'Caçadora élfica de alto alcance. Marca presas e as persegue sem piedade — ninguém escapa de sua mira.'},
  {id:'pt_var',name:'Varok',          sub:'Patrulheiro do Combate',    suit:'spades',  atq:6, def:3, pvs:100, price:100, sprite:true,
   desc:'O mais agressivo da patrulha. ATQ máximo entre os iniciais, mas frágil — mata antes de morrer é sua filosofia.'},
  {id:'pt_tha',name:'Thalion',        sub:'Patrulheiro da Resiliência',suit:'hearts',  atq:2, def:7, pvs:120, price:100, sprite:false,
   desc:'Defensor inabalável com a maior DEF do grupo. Absorve ataques que nenhum outro suportaria e transforma sofrimento em força.'},
  {id:'voss', name:'Van Carl Voss',   sub:'',                          suit:'clubs',   atq:4, def:2, pvs:100, price:100, sprite:false,
   desc:'Duelista excêntrico movido pela glória do combate. Rápido, imprevisível e orgulhoso — luta como se o mundo estivesse assistindo.'},
];

const SUIT_SYMBOLS = { neutral:'◆', spades:'♠', clubs:'♣', hearts:'♥', diamonds:'♦' };
const SUIT_COLORS  = { neutral:'#c9a84c', spades:'#4c7bc9', clubs:'#4caa6a', hearts:'#d45050', diamonds:'#c9a84c' };

function lojaTab(tab) {
  document.getElementById('loja-personagens').style.display = tab === 'personagens' ? 'flex' : 'none';
  document.getElementById('loja-cartas').style.display      = tab === 'cartas'      ? 'flex' : 'none';
  document.getElementById('tab-personagens').style.borderBottomColor = tab === 'personagens' ? 'var(--gold)' : 'transparent';
  document.getElementById('tab-personagens').style.color = tab === 'personagens' ? 'var(--gold)' : 'var(--text2)';
  document.getElementById('tab-cartas').style.borderBottomColor = tab === 'cartas' ? 'var(--gold)' : 'transparent';
  document.getElementById('tab-cartas').style.color = tab === 'cartas' ? 'var(--gold)' : 'var(--text2)';
}

function charAvatar(c, size=44) {
  const suitColor = SUIT_COLORS[c.suit] || '#c9a84c';
  const suitSymbol = SUIT_SYMBOLS[c.suit] || '◆';
  if (c.sprite) {
    return `<div style="width:${size}px;height:${size}px;border-radius:6px;overflow:hidden;border:1px solid ${suitColor}66;flex-shrink:0;background:#0a0c10">
      <img src="sprites/${c.id}/idle.png" style="width:100%;height:100%;object-fit:cover;image-rendering:pixelated" onerror="this.parentElement.innerHTML='<span style=\'font-size:${Math.floor(size*0.5)}px;color:${suitColor}\'>${suitSymbol}</span>';this.parentElement.style.display='flex';this.parentElement.style.alignItems='center';this.parentElement.style.justifyContent='center'">
    </div>`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:6px;background:rgba(255,255,255,0.04);border:1px solid ${suitColor}44;display:flex;align-items:center;justify-content:center;flex-shrink:0">
    <span style="font-size:${Math.floor(size*0.45)}px;color:${suitColor}">${suitSymbol}</span>
  </div>`;
}

// ══════════════════════════════════════════════════════════════════
// CHAR PANEL — Componente universal de personagens
// ══════════════════════════════════════════════════════════════════

var _cp = {
  mode: 'select',       // 'select' | 'equip'
  containerId: null,    // ID do container HTML onde será renderizado
  chars: [],            // lista de LOJA_CHARS filtrada (possuídos + não possuídos)
  owned: [],            // IDs possuídos pelo jogador
  page: 0,              // página atual da lista (6 por página)
  pageSize: 6,
  selectedId: null,     // herói exibido no centro
  tabIndex: 0,          // 0=Status 1=Equipamentos 2=Artefatos
  tabNames: ['STATUS', 'EQUIP', 'ARTEFATOS'],
  onSelect: null,       // callback(id) quando jogador confirma seleção
  blocked: [],          // IDs bloqueados (ex: derrotados no Survivor)
  multiSelect: [],      // IDs já selecionados (ex: survivor slots)
  origin: null,         // tela de origem para voltar após compra
};

// ── Inicializa e renderiza o componente num container ──
function cpInit(containerId, mode, opts) {
  opts = opts || {};
  _cp.containerId = containerId;
  _cp.mode = mode || 'select';
  _cp.page = 0;
  _cp.tabIndex = (mode === 'equip') ? 1 : 0;
  _cp.selectedId = null;
  _cp.onSelect = opts.onSelect || null;
  _cp.blocked = opts.blocked || [];
  _cp.multiSelect = opts.multiSelect || [];
  _cp.origin = opts.origin || null;
  _cp.owned = opts.owned || (window._myRoster ? window._myRoster : []);

  // Monta lista: todos os LOJA_CHARS, possuídos primeiro
  var owned = _cp.owned;
  var ownedChars = LOJA_CHARS.filter(function(c) { return owned.includes(c.id); });
  var notOwned   = LOJA_CHARS.filter(function(c) { return !owned.includes(c.id); });
  _cp.chars = ownedChars.concat(notOwned);

  // Seleciona automaticamente o primeiro disponível
  var first = _cp.chars.find(function(c) { return owned.includes(c.id); });
  _cp.selectedId = first ? first.id : (_cp.chars[0] ? _cp.chars[0].id : null);

  cpRender();
}

// ── Renderiza o painel completo ──
function cpRender() {
  var container = document.getElementById(_cp.containerId);
  if (!container) return;

  container.innerHTML =
    '<div class="cp-wrap">' +
      cpLeftHtml() +
      cpCenterHtml() +
      cpRightHtml() +
    '</div>';
}

// ── HTML da coluna esquerda ──
function cpLeftHtml() {
  var page = _cp.page;
  var size = _cp.pageSize;
  var chars = _cp.chars;
  var total = chars.length;
  var totalPages = Math.ceil(total / size);
  var slice = chars.slice(page * size, page * size + size);

  var iconsHtml = '';
  slice.forEach(function(c) {
    var isOwned   = _cp.owned.includes(c.id);
    var isBlocked = _cp.blocked.includes(c.id);
    var isSel     = _cp.selectedId === c.id;
    var isMulti   = _cp.multiSelect.includes(c.id);

    var cls = 'cp-icon';
    if (isSel)     cls += ' cp-icon-sel';
    if (!isOwned)  cls += ' cp-icon-locked';

    var s = SUITS[c.suit] || { color: '#c9a84c', sym: '◆' };
    var avatarSize = 44;
    var avatarHtml = charAvatar(c, avatarSize);

    var badgeHtml = '';
    if (isMulti) {
      var pos = _cp.multiSelect.indexOf(c.id) + 1;
      badgeHtml = '<div style="position:absolute;top:2px;right:2px;background:#5ac880;color:#0a1a10;border-radius:50%;width:13px;height:13px;font-size:8px;display:flex;align-items:center;justify-content:center;font-family:Cinzel,serif;font-weight:bold">' + pos + '</div>';
    }
    if (isBlocked) {
      badgeHtml = '<div style="position:absolute;top:2px;right:2px;font-size:10px">☠️</div>';
    }

    iconsHtml +=
      '<div class="' + cls + '" onclick="cpSelectChar(\'' + c.id + '\')" style="opacity:' + (isBlocked ? '0.3' : '1') + ';pointer-events:' + (isBlocked ? 'none' : 'auto') + '">' +
        badgeHtml +
        avatarHtml +
      '</div>';
  });

  // Preenche slots vazios se a página não tiver 6
  for (var i = slice.length; i < size; i++) {
    iconsHtml += '<div class="cp-icon" style="opacity:0.1;pointer-events:none"></div>';
  }

  var prevDis = page === 0 ? ' disabled' : '';
  var nextDis = page >= totalPages - 1 ? ' disabled' : '';

  return '<div class="cp-left">' +
    '<div class="cp-icon-grid">' + iconsHtml + '</div>' +
    '<div class="cp-pagination">' +
      '<button class="cp-page-btn"' + prevDis + ' onclick="cpPage(-1)">‹</button>' +
      '<div class="cp-page-info">' + (page + 1) + '/' + totalPages + '</div>' +
      '<button class="cp-page-btn"' + nextDis + ' onclick="cpPage(1)">›</button>' +
    '</div>' +
  '</div>';
}

// ── HTML da coluna centro ──
function cpCenterHtml() {
  var c = LOJA_CHARS.find(function(x) { return x.id === _cp.selectedId; });
  if (!c) return '<div class="cp-center"><div class="cp-empty"><div class="cp-empty-icon">👤</div><div class="cp-empty-txt">Selecione um personagem</div></div></div>';

  var isOwned = _cp.owned.includes(c.id);
  var s = SUITS[c.suit] || { color: '#c9a84c', sym: '◆' };
  var suitColor = s.color;
  var suitSym   = s.sym;

  // Sprite grande
  var spriteSize = 130;
  var spriteHtml = charAvatar(c, spriteSize);
  var lockedClass = !isOwned ? ' cp-locked-hero' : '';

  // Botão de ação no centro
  var actionBtn = '';
  if (!isOwned) {
    actionBtn =
      '<div class="cp-price-display">🪙 ' + (c.price || 100) + '</div>' +
      '<button class="cp-btn-buy" onclick="cpGoBuy(\'' + c.id + '\')">🛒 COMPRAR</button>';
  } else if (_cp.mode === 'select') {
    var alreadySel = _cp.multiSelect.includes(c.id);
    if (alreadySel) {
      actionBtn = '<button class="cp-btn-select" onclick="cpConfirmSelect(\'' + c.id + '\')" style="background:rgba(180,60,60,0.15);border-color:rgba(180,60,60,0.5);color:#d46060">✕ REMOVER</button>';
    } else {
      actionBtn = '<button class="cp-btn-select" onclick="cpConfirmSelect(\'' + c.id + '\')">✓ SELECIONAR</button>';
    }
  }

  return '<div class="cp-center">' +
    '<div class="cp-center-bg"></div>' +
    '<div class="cp-sprite-wrap' + lockedClass + '">' + spriteHtml + '</div>' +
    '<div class="cp-hero-info">' +
      '<div class="cp-hero-namerow">' +
        '<span class="cp-hero-suit" style="color:' + suitColor + '">' + suitSym + '</span>' +
        '<span class="cp-hero-name">' + c.name + '</span>' +
      '</div>' +
      (c.sub ? '<div class="cp-hero-sub">' + c.sub + '</div>' : '') +
      actionBtn +
    '</div>' +
  '</div>';
}

// ── HTML da coluna direita ──
function cpRightHtml() {
  var tabs = _cp.tabNames;
  var ti   = _cp.tabIndex;
  var prevDis = ti === 0 ? ' disabled' : '';
  var nextDis = ti >= tabs.length - 1 ? ' disabled' : '';

  var content = '';
  if (ti === 0) content = cpTabStatus();
  if (ti === 1) content = cpTabEquip();
  if (ti === 2) content = cpTabArtef();

  return '<div class="cp-right">' +
    '<div class="cp-tabs-header">' +
      '<button class="cp-tab-arrow"' + prevDis + ' onclick="cpTab(-1)">‹</button>' +
      '<div class="cp-tab-label">' + tabs[ti] + '</div>' +
      '<button class="cp-tab-arrow"' + nextDis + ' onclick="cpTab(1)">›</button>' +
    '</div>' +
    '<div class="cp-tab-content">' + content + '</div>' +
  '</div>';
}

// ── ABA STATUS ──
function cpTabStatus() {
  var id = _cp.selectedId;
  var c  = LOJA_CHARS.find(function(x) { return x.id === id; });
  if (!c) return '<div class="cp-empty"><div class="cp-empty-icon">📊</div><div class="cp-empty-txt">Nenhum herói selecionado</div></div>';

  // Bônus de equipamento
  var bonus = { atq: 0, def: 0, pvs: 0, inc: 0 };
  if (_equipData && _equipData[id]) {
    var ed = _equipData[id];
    if (ed.slot1 && ed.slot1.itemId) {
      var item = (_playerItems || []).find(function(it) { return it.id === ed.slot1.itemId; });
      if (!item && ed.slot1._item) item = ed.slot1._item;
      if (item && item.prefix) {
        var lvl = _equipGetLevel ? _equipGetLevel(ed.slot1.xp || 0) : 1;
        var val = (item.prefixVal || 0) + lvl - 1;
        var key = item.prefix.toLowerCase();
        if (bonus[key] !== undefined) bonus[key] += val;
      }
    }
  }

  var hasBonus = bonus.atq || bonus.def || bonus.pvs || bonus.inc;

  // Stats base
  var baseChar = CHARS.find(function(x) { return x.id === id; }) || c;
  var stats = [
    { label: 'ATQ', base: baseChar.atq || c.atq, bonus: bonus.atq },
    { label: 'DEF', base: baseChar.def || c.def, bonus: bonus.def },
    { label: 'PVS', base: baseChar.pvs || c.pvs, bonus: bonus.pvs },
    { label: 'INC', base: baseChar.inc || 0,      bonus: bonus.inc },
  ];

  var statsHtml = stats.map(function(s) {
    var bonusTxt = s.bonus ? ' <span class="cp-stat-bonus-val">+' + s.bonus + '</span>' : '';
    var cls = s.bonus ? 'cp-stat-row cp-stat-bonus' : 'cp-stat-row';
    return '<div class="' + cls + '">' +
      '<span class="cp-stat-label">' + s.label + '</span>' +
      '<span class="cp-stat-val">' + s.base + bonusTxt + '</span>' +
    '</div>';
  }).join('');

  // Passivas
  var details = CHAR_DETAILS[id];
  var passivesHtml = '';
  if (details && details.passives && details.passives.length) {
    passivesHtml = '<div class="cp-section-title">PASSIVAS</div>';
    passivesHtml += details.passives.map(function(p) {
      return '<div class="cp-passive-item">' +
        '<div class="cp-passive-name">' + p.name + '</div>' +
        '<div class="cp-passive-desc">' + p.desc + '</div>' +
      '</div>';
    }).join('');
  }

  // Habilidades
  var skillsHtml = '';
  var charData = CHARS.find(function(x) { return x.id === id; });
  if (charData && charData.skills && charData.skills.length) {
    skillsHtml = '<div class="cp-section-title">HABILIDADES</div>';
    skillsHtml += charData.skills.map(function(sk) {
      return '<div class="cp-skill-item">' +
        '<div class="cp-skill-name">' + sk.name + (sk.power ? ' <span style="color:var(--text2);font-size:6px">POD:' + sk.power + '</span>' : '') + '</div>' +
        (sk.desc ? '<div class="cp-skill-desc">' + sk.desc + '</div>' : '') +
      '</div>';
    }).join('');
  }

  return statsHtml + passivesHtml + skillsHtml;
}

// ── ABA EQUIPAMENTOS ──
function cpTabEquip() {
  var id = _cp.selectedId;
  if (!id) return '<div class="cp-empty"><div class="cp-empty-icon">🛡</div><div class="cp-empty-txt">Nenhum herói selecionado</div></div>';

  // Bloqueia equipar em personagem não possuído
  var isOwned = _cp.owned.includes(id);
  if (!isOwned) {
    return '<div class="cp-empty"><div class="cp-empty-icon">🔒</div><div class="cp-empty-txt" style="color:var(--text2)">Personagem não disponível</div></div>';
  }

  var ed = (_equipData && _equipData[id]) ? _equipData[id] : {};
  var item = null;
  if (ed.slot1 && ed.slot1.itemId) {
    item = (_playerItems || []).find(function(it) { return it.id === ed.slot1.itemId; });
    if (!item && ed.slot1._item) item = ed.slot1._item;
  }

  if (!item) {
    var btns = _cp.mode === 'equip' ?
      '<div class="cp-action-btns"><button class="cp-btn-action cp-btn-equipar" onclick="_equipSlotClick(1)">+ EQUIPAR ITEM</button></div>' : '';
    return '<div class="cp-equip-slot">' +
      '<div class="cp-equip-empty">' +
        '<div class="cp-equip-empty-icon">🛡</div>' +
        '<div class="cp-equip-empty-txt">Sem item equipado</div>' +
      '</div>' + btns +
    '</div>';
  }

  // Item equipado
  var lvl = _equipGetLevel ? _equipGetLevel(ed.slot1.xp || 0) : 1;
  var prefixVal = (item.prefixVal || 0) + lvl - 1;
  var prefixTxt = item.prefix ? item.prefix + ' +' + prefixVal : '';
  var suffixTxt = item.suffix ? (item.suffixDesc || item.suffix) : null;

  var btns = _cp.mode === 'equip' ?
    '<div class="cp-action-btns">' +
      '<button class="cp-btn-action cp-btn-trocar" onclick="_equipSlotClick(1)">↺ TROCAR</button>' +
      '<button class="cp-btn-action cp-btn-desequipar" onclick="_equipUnequip()">✕ DESEQUIPAR</button>' +
    '</div>' : '';

  return '<div class="cp-equip-slot" style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:12px">' +
    '<div class="cp-equip-slot-header" style="margin-bottom:8px">' +
      '<div class="cp-equip-icon">⚔</div>' +
      '<div style="flex:1">' +
        '<div class="cp-equip-name" style="font-family:\'Cinzel\',serif;font-size:12px;color:var(--gold);letter-spacing:1px">' + (item.name || 'Item') + '</div>' +
        '<div style="display:flex;gap:8px;margin-top:2px">' +
          '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold);opacity:0.7">TIER ' + (item.tier || '?') + '</div>' +
          '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--text2)">Nível ' + lvl + '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div style="font-family:\'Cinzel\',serif;font-size:11px;color:var(--text);margin-bottom:4px">' +
      '<span style="color:var(--gold)">Prefixo:</span> ' + (prefixTxt || '—') +
    '</div>' +
    '<div style="font-family:\'Cinzel\',serif;font-size:11px;color:var(--text);margin-bottom:10px">' +
      '<span style="color:var(--purple)">Sufixo:</span> ' +
      (suffixTxt
        ? '<span style="color:var(--text2)">' + suffixTxt + '</span>'
        : '<span style="color:var(--text2);opacity:0.5">Vazio</span>') +
    '</div>' +
    btns +
  '</div>';
}

// ── ABA ARTEFATOS ──
function cpTabArtef() {
  var id = _cp.selectedId;
  if (!id) return '<div class="cp-empty"><div class="cp-empty-icon">✨</div><div class="cp-empty-txt">Nenhum herói selecionado</div></div>';

  // Bloqueia artefato em personagem não possuído
  var isOwned = _cp.owned.includes(id);
  if (!isOwned) {
    return '<div class="cp-empty"><div class="cp-empty-icon">🔒</div><div class="cp-empty-txt" style="color:var(--text2)">Personagem não disponível</div></div>';
  }

  var ed = (_equipData && _equipData[id]) ? _equipData[id] : {};
  var artefatoId = ed.slot2 ? ed.slot2.artefatoId : null;
  var artef = null;
  if (artefatoId && typeof _ARTEFATOS !== 'undefined') {
    artef = _ARTEFATOS.find(function(a) { return a.id === artefatoId; });
  }

  if (!artef) {
    var btns = _cp.mode === 'equip' ?
      '<div class="cp-action-btns"><button class="cp-btn-action cp-btn-equipar" onclick="_equipSlotClick(2)">+ EQUIPAR ARTEFATO</button></div>' : '';
    return '<div class="cp-artef-slot">' +
      '<div class="cp-equip-empty">' +
        '<div class="cp-equip-empty-icon">✨</div>' +
        '<div class="cp-equip-empty-txt">Sem artefato equipado</div>' +
      '</div>' + btns +
    '</div>';
  }

  var btns = _cp.mode === 'equip' ?
    '<div class="cp-action-btns">' +
      '<button class="cp-btn-action cp-btn-trocar" onclick="_equipSlotClick(2)">↺ TROCAR</button>' +
      '<button class="cp-btn-action cp-btn-desequipar" onclick="_artefatoUnequip()">✕ DESEQUIPAR</button>' +
    '</div>' : '';

  return '<div class="cp-artef-slot">' +
    '<div class="cp-equip-slot-header">' +
      '<div class="cp-artef-icon">✨</div>' +
      '<div style="flex:1">' +
        '<div class="cp-artef-name">' + (artef.name || 'Artefato') + '</div>' +
      '</div>' +
    '</div>' +
    (artef.desc ? '<div class="cp-artef-desc">' + artef.desc + '</div>' : '') +
    btns +
  '</div>';
}

// ── Seleciona herói na lista esquerda ──
function cpSelectChar(id) {
  _cp.selectedId = id;
  if (_cp.mode === 'equip') { _equipCurrentChar = id; }
  // Re-renderiza centro e direita sem recriar lista
  var container = document.getElementById(_cp.containerId);
  if (!container) return;
  var wrap = container.querySelector('.cp-wrap');
  if (!wrap) return;
  var oldCenter = wrap.querySelector('.cp-center');
  var oldRight  = wrap.querySelector('.cp-right');
  var oldLeft   = wrap.querySelector('.cp-left');
  if (oldCenter) oldCenter.outerHTML = cpCenterHtml();
  if (oldRight)  wrap.querySelector('.cp-right').outerHTML = cpRightHtml();
  if (oldLeft)   wrap.querySelector('.cp-left').outerHTML  = cpLeftHtml();
}

// ── Paginação ──
function cpPage(dir) {
  var total = _cp.chars.length;
  var totalPages = Math.ceil(total / _cp.pageSize);
  _cp.page = Math.max(0, Math.min(_cp.page + dir, totalPages - 1));
  var container = document.getElementById(_cp.containerId);
  if (!container) return;
  var wrap = container.querySelector('.cp-wrap');
  if (!wrap) return;
  wrap.querySelector('.cp-left').outerHTML = cpLeftHtml();
}

// ── Troca de aba direita ──
function cpTab(dir) {
  _cp.tabIndex = Math.max(0, Math.min(_cp.tabIndex + dir, _cp.tabNames.length - 1));
  var container = document.getElementById(_cp.containerId);
  if (!container) return;
  var wrap = container.querySelector('.cp-wrap');
  if (!wrap) return;
  wrap.querySelector('.cp-right').outerHTML = cpRightHtml();
}

// ── Confirmar seleção ──
function cpConfirmSelect(id) {
  if (!id) return;
  if (_cp.onSelect) _cp.onSelect(id);
}

// ── Ir para compra ──
function cpGoBuy(id) {
  _cp.origin = _cp.origin || _navOrigin;
  if (_cp.origin === 'survivor')      _navOrigin = 'survivor-select';
  else if (_cp.origin === 'arena-defense') _navOrigin = 'arena-defense-buy';
  else if (_cp.origin === 'arena-attack')  _navOrigin = 'arena-attack-buy';
  else if (_cp.origin === 'equip')         _navOrigin = 'equip-buy';
  openLoja();
}

function renderLojaChars(owned) {
  const list = document.getElementById('loja-chars-list');
  list.innerHTML = '';
  LOJA_CHARS.forEach(c => {
    const isOwned = owned && owned.includes(c.id);
    const suitColor = SUIT_COLORS[c.suit] || '#c9a84c';
    const row = document.createElement('div');
    row.style.cssText = 'background:var(--bg2);border:1px solid var(--border);border-radius:10px;padding:10px 12px;display:flex;align-items:center;gap:10px;justify-content:space-between';
    row.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
        ${charAvatar(c, 44)}
        <div style="min-width:0">
          <div style="font-family:'Cinzel',serif;font-size:11px;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</div>
          ${c.sub ? `<div style="font-size:9px;color:var(--text2);margin-top:1px">${c.sub}</div>` : ''}
          <div style="display:flex;gap:8px;margin-top:3px">
            <span style="font-size:9px;color:#d45050">ATQ ${c.atq}</span>
            <span style="font-size:9px;color:#4c7bc9">DEF ${c.def}</span>
            <span style="font-size:9px;color:#4caa6a">HP ${c.pvs}</span>
          </div>
        </div>
      </div>
      ${isOwned
        ? `<div style="font-family:'Cinzel',serif;font-size:9px;color:#4caa6a;border:1px solid #2a5a2a;border-radius:5px;padding:4px 8px;flex-shrink:0">✓ POSSUI</div>`
        : `<button onclick="buyChar('${c.id}')" style="background:linear-gradient(135deg,var(--gold),#7a5a10);color:#1a1000;border:none;border-radius:6px;padding:6px 10px;font-family:'Cinzel',serif;font-size:10px;cursor:pointer;flex-shrink:0;display:flex;align-items:center;gap:4px">🪙 ${c.price}</button>`
      }
    `;
    list.appendChild(row);
  });
}

function buyChar(id) {
  const user = window._fbUser;
  if (!user) return;
  const coins = parseInt(document.getElementById('loja-coins').textContent) || 0;
  const char = LOJA_CHARS.find(c => c.id === id);
  if (!char) return;
  if (coins < char.price) { alert('Coins insuficientes!'); return; }
  if (!confirm(`Comprar ${char.name} por ${char.price} 🪙?`)) return;

  const userRef = window._fbRef(window._fbDb, 'jogadores/' + user.uid);
  window._fbGet(userRef).then(snap => {
    const d = snap.val() || {};
    const newCoins = (d.coins || 0) - char.price;
    const roster = d.roster || [];
    if (roster.includes(id)) { alert('Você já possui este personagem!'); return; }
    roster.push(id);
    return window._fbSet(userRef, { ...d, coins: newCoins, roster });
  }).then(() => {
    document.getElementById('loja-coins').textContent = parseInt(document.getElementById('loja-coins').textContent) - char.price;
    document.getElementById('lobby-coins').textContent = parseInt(document.getElementById('lobby-coins').textContent) - char.price;
    openLojaScreen();
  }).catch(e => { console.error(e); alert('Erro ao comprar. Tente novamente.'); });
}

function openLojaScreen() {
  const user = window._fbUser;
  if (!user) return;
  window._fbGet(window._fbRef(window._fbDb, 'jogadores/' + user.uid)).then(snap => {
    const d = snap.exists() ? snap.val() : {};
    document.getElementById('loja-coins').textContent = d.coins || 0;
    renderLojaChars(d.roster || []);
  });
}

// openLoja — called from lobby deck button
window.openLoja = function() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-loja').classList.add('active');
  lojaTab('personagens');
  // Load coins and render chars
  const user = window._fbUser;
  if (!user) { renderLojaChars([]); return; }
  window._fbGet(window._fbRef(window._fbDb, 'jogadores/' + user.uid)).then(snap => {
    const d = snap.exists() ? snap.val() : {};
    document.getElementById('loja-coins').textContent = d.coins || 0;
    renderLojaChars(d.roster || []);
  }).catch(() => renderLojaChars([]));
};

// openColecao
window.openColecao = function() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-colecao').classList.add('active');
  const user = window._fbUser;
  if (!user) { renderColecao([]); return; }
  window._fbGet(window._fbRef(window._fbDb, 'jogadores/' + user.uid)).then(snap => {
    const d = snap.exists() ? snap.val() : {};
    renderColecao(d.roster || []);
  }).catch(() => renderColecao([]));
};

function renderColecao(owned) {
