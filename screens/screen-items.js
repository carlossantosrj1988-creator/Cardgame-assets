function _weightedRoll(weights) {
  var total = 0;
  for (var i = 0; i < weights.length; i++) total += weights[i].w;
  var r = Math.random() * total;
  var cumul = 0;
  for (var i = 0; i < weights.length; i++) {
    cumul += weights[i].w;
    if (r < cumul) return weights[i].v;
  }
  return weights[weights.length - 1].v;
}

var _itemIdCounter = 0;
// ══ NOME DE EQUIPAMENTO (estilo PoE) ══

// Base por tier (sorteio aleatório)
var _itemBaseNames = {
  10: ['Amuleto', 'Anel', 'Talismã'],
  9:  ['Bracelete', 'Insígnia', 'Medalhão'],
  8:  ['Relíquia', 'Grimório', 'Coroa']
};

// Prefixo do nome por atributo e tier do VALOR rolado
var _itemPrefixNames = {
  ATQ: { 10: ['Afiado', 'Cortante', 'Feroz'], 9: ['Brutal', 'Sanguinário', 'Devastador'], 8: ['Letal', 'Implacável', 'Aniquilador'] },
  DEF: { 10: ['Reforçado', 'Blindado', 'Resistente'], 9: ['Fortificado', 'Inabalável', 'Impenetrável'], 8: ['Inquebrável', 'Titânico', 'Absoluto'] },
  INC: { 10: ['Ágil', 'Alerta', 'Perspicaz'], 9: ['Veloz', 'Astuto', 'Preciso'], 8: ['Relâmpago', 'Visionário', 'Supremo'] },
  PVS: { 10: ['Robusto', 'Vigoroso', 'Resistente'], 9: ['Colossal', 'Imortal', 'Imenso'], 8: ['Ancestral', 'Divino', 'Eterno'] }
};

// Detecta tier do valor rolado (pra pegar o nome certo)
function _valueTier(prefix, val) {
  if (prefix === 'PVS') {
    if (val >= 70) return 8;
    if (val >= 40) return 9;
    return 10;
  } else {
    if (val >= 7) return 8;
    if (val >= 4) return 9;
    return 10;
  }
}

// ══ SUFIXOS ══
var _SUFFIXES = {
  8: [
    { id: 's8_hemor',  nameM: 'do Sangue',         nameF: 'da Hemorragia',     desc: 'Ao causar dano, aplica Hemorragia no alvo.' },
    { id: 's8_cure',   nameM: 'do Vigor',           nameF: 'da Drenagem Vital', desc: 'Ataques de alvo único curam 3 de vida.' },
    { id: 's8_weak',   nameM: 'do Enfraquecimento', nameF: 'da Ruína',          desc: 'Ataques em todos aplicam Enfraquecido.' },
    { id: 's8_shield', nameM: 'do Escudo',          nameF: 'da Barreira',       desc: 'Defender com carta concede Escudo igual ao valor.' },
    { id: 's8_bleed',  nameM: 'do Sangramento',     nameF: 'da Lamina',         desc: 'Ataques de alvo único causam Sangramento.' }
  ]
};

function _rollSuffix(tier) {
  var pool = _SUFFIXES[tier];
  if (!pool) return null;
  var roll = Math.floor(Math.random() * (pool.length + 1));
  return roll < pool.length ? pool[roll] : null;
}

function _generateItemName(tier, prefix, val, suffixId) {
  var bases = _itemBaseNames[tier] || _itemBaseNames[10];
  var base = bases[Math.floor(Math.random() * bases.length)];
  var vTier = _valueTier(prefix, val);
  var names = (_itemPrefixNames[prefix] || _itemPrefixNames.ATQ)[vTier] || ['Misterioso'];
  var pName = names[Math.floor(Math.random() * names.length)];
  var name = base + ' ' + pName;
  if (suffixId) {
    var allSuf = [];
    Object.keys(_SUFFIXES).forEach(function(k) { allSuf = allSuf.concat(_SUFFIXES[k]); });
    var suf = allSuf.find(function(s) { return s.id === suffixId; });
    if (suf) name += ' ' + (Math.random() < 0.5 ? suf.nameM : suf.nameF);
  }
  return name;
}

function _generateItem(tier) {
  var prefixes = ['ATQ', 'DEF', 'INC', 'PVS'];
  var prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  var weights = prefix === 'PVS' ? _itemWeights.pvs[tier] : _itemWeights.stat[tier];
  var val = _weightedRoll(weights);
  var sufObj = tier >= 8 ? _rollSuffix(tier) : null;
  var suffixId = sufObj ? sufObj.id : null;
  var suffixDesc = sufObj ? sufObj.desc : null;
  _itemIdCounter++;
  return {
    id: 'item_' + _itemIdCounter,
    tier: tier,
    prefix: prefix,
    prefixVal: val,
    suffix: suffixId,
    suffixDesc: suffixDesc,
    level: 1,
    name: _generateItemName(tier, prefix, val, suffixId)
  };
}

// Player inventory
var _playerItems = []; // carregado do Firebase (jogadores/{uid}/inventory)

// ══ DROP SYSTEM ══

// Pool de tiers por fase tier
var _dropPool = {
  1: [10], 2: [10],
  3: [10, 9], 4: [10, 9],
  5: [10, 9, 8], 6: [10, 9, 8]
};

// Base % por tier
var _dropBase = { 10: 15, 9: 14, 8: 13 };

// Calcula % de drop pra um tier numa fase tier + fase acumulada
function _dropChance(tier, faseTier, faseNum) {
  // Base cresce +1% por fase tier, cap na fase 6
  var base = _dropBase[tier] + (Math.min(faseTier, 6) - 1);
  // Increased: +1% por etapa acumulada (cada stage conta, incluindo boss)
  var increased = 1 + (faseNum / 100);
  return base * increased;
}

// Rola drop de Slot 1 após vitória no Survivor
// Retorna item gerado ou null
function _rollSurvivorDrop(faseTier, faseNum) {
  var pool = _dropPool[faseTier] || _dropPool[6]; // fallback pra fase 6+
  var dropped = [];

  pool.forEach(function(tier) {
    var chance = _dropChance(tier, faseTier, faseNum);
    var roll = Math.random() * 100;
    var hit = roll < chance;
    addLog('🎲 Drop T' + tier + ': ' + chance.toFixed(2) + '% — rolou ' + roll.toFixed(2) + (hit ? ' ✅ DROPOU' : ' ❌'), 'info');
    if (hit) {
      dropped.push(tier);
    }
  });

  if (dropped.length === 0) {
    addLog('🎲 Resultado: nenhum drop', 'info');
    return null;
  }

  // Se mais de 1 dropou, fica o menor tier (mais forte)
  var bestTier = Math.min.apply(null, dropped);
  var item = _generateItem(bestTier);
  addLog('⚜ Drop! ' + item.name + ' (T' + item.tier + ' ' + item.prefix + ' +' + item.prefixVal + ')', 'info');
  _playerItems.push(item);
  _equipSaveInventory();
  return item;
}

// ══ DROP SLOT 2 — ARTEFATOS (por boss) ══

var _BOSS_ARTEFATOS = {
  boss_t1: [
    {
      id: 'art_manto_laceracao',
      name: 'Manto da Laceração',
      desc: 'Ao passar a rodada, 50% de chance de aplicar Sangramento em todos os inimigos.',
      weight: 50
    },
    {
      id: 'art_dentes_sanguessuga',
      name: 'Dentes Devoradores de Sanguessuga',
      desc: 'Toda vez que Sangramento é ativado em qualquer personagem durante a batalha, recupera 1 de vida.',
      weight: 50
    }
  ],
  boss_t2: [
    {
      id: 'art_elmo_sopro_gelido',
      name: 'Elmo do Sopro Gélido',
      desc: 'Ao defender com carta, aplica Resfriamento no atacante.',
      weight: 50
    },
    {
      id: 'art_luvas_urso_polar',
      name: 'Luvas de Urso Polar',
      desc: 'Ao causar dano, um aliado aleatório (incluindo o próprio) ganha Fortificado (+50% DEF, 2t).',
      weight: 50
    }
  ],
  boss_t3: [
    {
      id: 'art_capacete_visao_cosmica',
      name: 'Capacete do Astronauta da Visão Cósmica',
      desc: 'No início da sua rodada, você pode descartar uma carta para comprar 2.',
      weight: 50
    },
    {
      id: 'art_olhos_cosmicos',
      name: 'Olhos Cósmicos de Vyr\'Thas',
      desc: 'Ao receber dano pela primeira vez na rodada, Sorte em reduzir o dano pela metade.',
      weight: 50
    }
  ]
};

// Lista flat de todos os artefatos (pra busca por ID)
var _ARTEFATOS = Object.keys(_BOSS_ARTEFATOS).reduce(function(arr, key) {
  return arr.concat(_BOSS_ARTEFATOS[key]);
}, []);

// Rola se boss vem equipado com artefato (chamado ao entrar na batalha do boss)
// 15% chance; se sim, sorteia artefato por peso do pool do boss
// Retorna artefato ou null
function _rollBossArtefato(bossId) {
  var pool = _BOSS_ARTEFATOS[bossId] || [];
  if (pool.length === 0) {
    addLog('🎲 Artefato Boss: nenhum artefato disponível para ' + (bossId || '?'), 'info');
    return null;
  }
  var chance = 15;
  var roll = Math.random() * 100;
  var hit = roll < chance;
  addLog('🎲 Artefato Boss: ' + chance.toFixed(2) + '% — rolou ' + roll.toFixed(2) + (hit ? ' ✅ DROPOU' : ' ❌'), 'info');
  if (!hit) return null;
  var totalWeight = pool.reduce(function(s, a) { return s + a.weight; }, 0);
  var wRoll = Math.random() * totalWeight;
  var acc = 0;
  for (var i = 0; i < pool.length; i++) {
    acc += pool[i].weight;
    if (wRoll < acc) return pool[i];
  }
  return pool[pool.length - 1];
}


function _craftRenderList() {
  var list = document.getElementById('craft-item-list');
  if (!list) return;
  if (_playerItems.length === 0) {
    list.innerHTML = '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--text2);opacity:0.4;letter-spacing:1px;text-align:center;padding:40px 0">SEM ITENS</div>';
    return;
  }
  list.innerHTML = _playerItems.map(function(item) {
    var valDisplay = item.prefix === 'PVS' ? '+' + item.prefixVal : '+' + item.prefixVal;
    return '<div class="craft-item-card" onclick="_craftOpenDetail(\'' + item.id + '\')">' +
      _equipFrameHtml(item.tier) +
      '<div style="flex:1;min-width:0">' +
        '<div style="font-family:\'Cinzel\',serif;font-size:11px;color:var(--gold)">' + (item.name || ('Tier ' + item.tier)) + '</div>' +
        '<div style="font-size:10px;color:var(--text2)">' + item.prefix + ' ' + valDisplay + ' · Nível ' + item.level + '</div>' +
      '</div>' +
    '</div>';
  }).join('');
}

var _craftCurrentItemId = null;

function _craftOpenDetail(itemId) {
  var item = _playerItems.find(function(i) { return i.id === itemId; });
  if (!item) return;
  _craftCurrentItemId = itemId;
  _craftRefreshDetail();
  document.getElementById('craft-detail-overlay').classList.add('open');
}

function _craftRefreshDetail() {
  var item = _playerItems.find(function(i) { return i.id === _craftCurrentItemId; });
  if (!item) return;
  var valDisplay = item.prefix === 'PVS' ? '+' + item.prefixVal : '+' + item.prefixVal;
  document.getElementById('craft-item-tier').textContent = (item.name || ('Tier ' + item.tier));
  document.getElementById('craft-item-level').textContent = 'Nível ' + item.level;
  document.getElementById('craft-item-prefix').textContent = item.prefix + ' ' + valDisplay;
  document.getElementById('craft-item-suffix').textContent = (item.suffix ? (item.suffixDesc || item.suffix) : 'Vazio');
  document.getElementById('craft-item-suffix').style.opacity = item.suffix ? '1' : '0.5';
  // Custos por tier
  var reroll = item.tier >= 9 ? 1 : 2;
  var swap = item.tier >= 9 ? 10 : 20;
  var block = item.tier === 9 ? 20 : item.tier === 8 ? 40 : 60;
  var suffix = item.tier >= 7 ? 25 : item.tier >= 5 ? 50 : item.tier >= 3 ? 75 : 100;
  document.getElementById('craft-cost-reroll').textContent = reroll;
  document.getElementById('craft-cost-swap').textContent = swap;
  document.getElementById('craft-cost-block').textContent = block;
  document.getElementById('craft-cost-suffix').textContent = suffix;
  var coinsEl = document.getElementById('craft-coins-display');
  if (coinsEl) coinsEl.textContent = _equipCoins + ' 🪙';
}

function closeCraftDetail(e) {
  if (e.target === e.currentTarget) document.getElementById('craft-detail-overlay').classList.remove('open');
}
function closeCraftDetailDirect() {
  document.getElementById('craft-detail-overlay').classList.remove('open');
}

function craftAction(type) {
