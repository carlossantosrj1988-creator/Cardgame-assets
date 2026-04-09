function equipSetTab(tab) {
  _equipTab = tab;
  var tabs = ['equip', 'craft', 'artefatos'];
  tabs.forEach(function(t) {
    var btn = document.getElementById('equip-tab-' + t);
    var panel = document.getElementById('equip-panel-' + t);
    var active = t === tab;
    if (btn) {
      btn.style.background = active ? 'rgba(201,168,76,0.1)' : 'transparent';
      btn.style.borderBottom = active ? '2px solid var(--gold)' : '2px solid transparent';
      btn.style.color = active ? 'var(--gold)' : 'var(--text2)';
    }
    if (panel) {
      panel.style.display = active ? 'flex' : 'none';
      panel.style.flexDirection = 'column';
    }
  });
  if (tab === 'craft') _craftRenderList();
  if (tab === 'artefatos') _artefatoRenderTab();
  if (tab === 'equip') { var ep = document.getElementById('equip-char-panel'); if (ep && !ep.querySelector('.cp-wrap')) _equipRenderRoster(); }
}

// ── Badges de equip/artefato para os grids de seleção ──
function _equipBadges(charId) {
  var badges = '';
  var ed = _equipData[charId];
  if (ed && ed.slot1 && ed.slot1.itemId) {
    var lvl = _equipGetLevel(ed.slot1.xp || 0);
    badges += '<div style="position:absolute;bottom:3px;left:3px;background:#c9a84c;color:#1a1000;border-radius:3px;padding:1px 3px;font-family:Cinzel,serif;font-size:6px;font-weight:bold;line-height:1.3">E' + lvl + '</div>';
  }
  if (ed && ed.slot2 && ed.slot2.artefatoId) {
    badges += '<div style="position:absolute;bottom:3px;right:3px;background:#9060d0;color:#fff;border-radius:3px;padding:1px 3px;font-family:Cinzel,serif;font-size:6px;font-weight:bold;line-height:1.3">A</div>';
  }
  return badges;
}

function _equipRenderRoster() {
  var myRoster = window._myRoster || [];
  cpInit('equip-char-panel', 'equip', {
    owned: myRoster.length > 0 ? myRoster : LOJA_CHARS.map(function(c) { return c.id; }),
    blocked: [],
    origin: 'equip'
  });
}

function _equipSelectChar(idx) {
  openCharDetail(CHARS[idx].id);
}

// ══ EQUIP SLOT SYSTEM ══
var _equipData = {}; // { charId: { slot1: { itemId, xp }, slot2: { artefatoId } } }
var _playerArtefatos = []; // inventário de artefatos do jogador
var _equipCurrentChar = null; // charId do popup aberto
var _equipCoins = 0; // carregado do Firebase (jogadores/{uid}/coins)
var _equipLoaded = false;
var _equipXpBonds = {}; // { "charId_itemId": xp } — vínculo personagem+item

// ── Firebase: carregar inventário + equipData + coins + bonds ──
function _equipLoadAll(cb) {
  var user = window._fbUser;
  if (!user) { if (cb) cb(); return; }
  window._fbGet(window._fbRef(window._fbDb, 'jogadores/' + user.uid)).then(function(snap) {
    var d = snap.exists() ? snap.val() : {};
    _equipCoins = d.coins || 0;
    _playerItems = d.inventory || [];
    _playerArtefatos = d.artefatos || [];
    _equipData = d.equipData || {};
    _equipXpBonds = d.equipXpBonds || {};
    window._myRoster = d.roster || window._myRoster || [];
    _equipLoaded = true;
    // Sincroniza counter de itemId pra não gerar IDs repetidos
    _syncItemIdCounter();
    if (cb) cb();
  }).catch(function() { if (cb) cb(); });
}

function _syncItemIdCounter() {
  var maxId = 0;
  // Checa inventário
  _playerItems.forEach(function(item) {
    var n = parseInt((item.id || '').replace('item_', ''), 10);
    if (n > maxId) maxId = n;
  });
  // Checa itens equipados (equipData referencia por itemId)
  Object.keys(_equipData).forEach(function(cid) {
    var d = _equipData[cid];
    if (d && d.slot1 && d.slot1.itemId) {
      var n = parseInt(d.slot1.itemId.replace('item_', ''), 10);
      if (n > maxId) maxId = n;
    }
  });
  _itemIdCounter = maxId;
}

// ── Firebase: salvar inventário ──
function _equipSaveInventory() {
  var user = window._fbUser;
  if (!user) return;
  window._fbSet(window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/inventory'), _playerItems.length > 0 ? _playerItems : null);
}

// ── Firebase: salvar artefatos ──
function _equipSaveArtefatos() {
  var user = window._fbUser;
  if (!user) return;
  window._fbSet(window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/artefatos'), _playerArtefatos.length > 0 ? _playerArtefatos : null);
}

// ── Firebase: salvar equipData ──
function _equipSaveEquipData() {
  var user = window._fbUser;
  if (!user) return;
  var hasData = Object.keys(_equipData).length > 0;
  window._fbSet(window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/equipData'), hasData ? _equipData : null);
}

// ── Firebase: salvar coins ──
function _equipSaveCoins() {
  var user = window._fbUser;
  if (!user) return;
  window._fbSet(window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/coins'), Math.max(0, _equipCoins));
}

// ── Firebase: salvar bonds de XP ──
function _equipSaveBonds() {
  var user = window._fbUser;
  if (!user) return;
  var hasData = Object.keys(_equipXpBonds).length > 0;
  window._fbSet(window._fbRef(window._fbDb, 'jogadores/' + user.uid + '/equipXpBonds'), hasData ? _equipXpBonds : null);
}

// ── Bond helpers ──
function _bondKey(charId, itemId) { return charId + '_' + itemId; }

function _bondGetXp(charId, itemId) {
  return _equipXpBonds[_bondKey(charId, itemId)] || 0;
}

function _bondSetXp(charId, itemId, xp) {
  _equipXpBonds[_bondKey(charId, itemId)] = xp;
}

// ── XP por vitória: distribui XP pros itens equipados do time ──
// xpAmount = pontos a dar (1-3 por chars vivos, ou 1 fixo no farm)
function _equipGrantBattleXp(xpAmount) {
  if (!_equipLoaded || xpAmount <= 0) return;
  var changed = false;
  // Percorre todos os chars do time (p1) que têm item equipado
  var teamIds = [];
  if (G && G.p1 && G.p1.chars) {
    teamIds = G.p1.chars.map(function(c) { return c.id; });
  } else if (_survState && _survState.team) {
    teamIds = _survState.team;
  }
  teamIds.forEach(function(charId) {
    var ed = _equipData[charId];
    if (!ed || !ed.slot1 || !ed.slot1.itemId) return;
    var lvl = _equipGetLevel(ed.slot1.xp || 0);
    if (lvl >= 20) return; // já no máximo
    ed.slot1.xp = (ed.slot1.xp || 0) + xpAmount;
    _bondSetXp(charId, ed.slot1.itemId, ed.slot1.xp);
    changed = true;
  });
  if (changed) {
    _equipSaveEquipData();
    _equipSaveBonds();
  }
}

// XP table: level N needs (N-1)*100 XP. Cumulative for display.
function _equipXpForLevel(lvl) { return lvl <= 1 ? 0 : (lvl - 1) * 100; }
function _equipXpCumulative(lvl) {
  var total = 0;
  for (var i = 2; i <= lvl; i++) total += (i - 1) * 100;
  return total;
}
function _equipGetLevel(xp) {
  var lvl = 1;
  var cumul = 0;
  for (var i = 2; i <= 20; i++) {
    cumul += (i - 1) * 100;
    if (xp >= cumul) lvl = i; else break;
  }
  return lvl;
}
function _equipXpInLevel(xp) {
  var lvl = _equipGetLevel(xp);
  var cumul = _equipXpCumulative(lvl);
  return xp - cumul;
}
function _equipXpToNext(xp) {
  var lvl = _equipGetLevel(xp);
  if (lvl >= 20) return 0;
  return _equipXpForLevel(lvl + 1);
}

function _equipSlotClick(slotNum) {
  _equipCurrentChar = _charDetailOpenId || (_cp.mode === 'equip' ? _cp.selectedId : null);
  if (slotNum === 1) {
    _equipRenderSlotPopup();
    document.getElementById('equip-select-overlay').classList.add('open');
  } else {
    _artefatoRenderSelectPopup();
    document.getElementById('artefato-select-overlay').classList.add('open');
  }
}

function _equipRenderSlotPopup() {
  var body = document.getElementById('equip-select-body1');
  if (!body) return;
  var charId = _equipCurrentChar;
  var data = _equipData[charId] && _equipData[charId].slot1;

  if (data && data.itemId) {
    // Item equipado — mostrar detalhes
    var item = data._item || _playerItems.find(function(i) { return i.id === data.itemId; });
    if (!item) return;
    var xp = data.xp || 0;
    var lvl = _equipGetLevel(xp);
    var xpInLvl = _equipXpInLevel(xp);
    var xpNeeded = _equipXpToNext(xp);
    var pct = lvl >= 20 ? 100 : (xpNeeded > 0 ? Math.floor((xpInLvl / xpNeeded) * 100) : 0);
    var charName = (CHARS.find(function(c) { return c.id === charId; }) || {}).name || '';

    body.innerHTML =
      '<div style="background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:14px;margin-bottom:12px">' +
        '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px">' +
          '<div style="font-family:\'Cinzel\',serif;font-size:12px;letter-spacing:2px;color:var(--gold)">' + (item.name || ('TIER ' + item.tier)) + '</div>' +
          '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--text2)">Nível ' + lvl + '</div>' +
        '</div>' +
        '<div style="font-family:\'Cinzel\',serif;font-size:11px;color:var(--text);margin-bottom:4px"><span style="color:var(--gold)">Prefixo:</span> ' + item.prefix + ' +' + (item.prefixVal + lvl - 1) + '</div>' +
        '<div style="font-family:\'Cinzel\',serif;font-size:11px;color:var(--text);margin-bottom:8px"><span style="color:var(--purple)">Sufixo:</span> <span style="opacity:' + (item.suffix ? '1' : '0.5') + '">' + (item.suffixDesc || (item.suffix ? item.suffix : 'Vazio')) + '</span></div>' +
        '<div style="font-size:10px;color:var(--text2);margin-bottom:2px">Equipado em: <span style="color:var(--gold)">' + charName + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text2);margin-bottom:2px">' +
          '<span>XP: ' + xpInLvl + ' / ' + (lvl >= 20 ? 'MAX' : xpNeeded) + '</span>' +
          '<span>' + (lvl >= 20 ? 'NÍVEL MÁXIMO' : pct + '%') + '</span>' +
        '</div>' +
        '<div class="equip-xp-bar-wrap"><div class="equip-xp-bar-fill" style="width:' + pct + '%"></div></div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px">' +
        '<button class="equip-action-btn gold" onclick="_equipAddXp()">' +
          '⬆ UPAR XP (1 🪙 = 1 XP) — ' + _equipCoins + ' 🪙' +
        '</button>' +
        '<button class="equip-action-btn red" onclick="_equipUnequip()">' +
          '✕ DESEQUIPAR' +
        '</button>' +
      '</div>';
  } else {
    // Sem item — mostrar lista de itens disponíveis
    if (_playerItems.length === 0) {
      body.innerHTML = '<div class="equip-select-body">SEM ITENS</div>';
      return;
    }
    body.innerHTML = _playerItems.map(function(item) {
      return '<div class="equip-avail-item" onclick="_equipItem(\'' + item.id + '\')">' +
        _equipFrameHtml(item.tier) +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-family:\'Cinzel\',serif;font-size:11px;color:var(--gold)">' + (item.name || ('Tier ' + item.tier)) + '</div>' +
          '<div style="font-size:10px;color:var(--text2)">' + item.prefix + ' +' + item.prefixVal + '</div>' +
        '</div>' +
        '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--gold)">EQUIPAR</div>' +
      '</div>';
    }).join('');
  }
}

function _equipItem(itemId) {
  var charId = _equipCurrentChar;
  // Busca item no inventário
  var item = _playerItems.find(function(i) { return i.id === itemId; });
  if (!item) return;
  if (!_equipData[charId]) _equipData[charId] = {};
  // Se já tem item equipado, devolve pro inventário primeiro
  if (_equipData[charId].slot1 && _equipData[charId].slot1.itemId) {
    var oldItem = _equipData[charId].slot1._item;
    if (oldItem) _playerItems.push(oldItem);
    _bondSetXp(charId, _equipData[charId].slot1.itemId, _equipData[charId].slot1.xp || 0);
  }
  // Restaura XP do vínculo personagem+item (se já existir)
  var bondXp = _bondGetXp(charId, itemId);
  // Salva dados do item junto (pra lookup quando equipado)
  _equipData[charId].slot1 = { itemId: itemId, xp: bondXp, _item: JSON.parse(JSON.stringify(item)) };
  // Remove do inventário (cortar)
  _playerItems = _playerItems.filter(function(i) { return i.id !== itemId; });
  _equipSaveEquipData();
  _equipSaveInventory();
  _equipSaveBonds();
  _equipUpdateSlotDisplay(charId);
  _refreshCharDetailStats(charId);
  _equipRenderSlotPopup();
  if (typeof cpRender === 'function' && _cp.containerId) cpRender();
}

function _equipUnequip() {
  var charId = _equipCurrentChar;
  if (!_equipData[charId] || !_equipData[charId].slot1) return;
  var data = _equipData[charId].slot1;
  // Salva XP no vínculo antes de desequipar
  _bondSetXp(charId, data.itemId, data.xp || 0);
  _equipSaveBonds();
  // Devolve item pro inventário (colar)
  if (data._item) {
    _playerItems.push(data._item);
  }
  _equipData[charId].slot1 = null;
  _equipSaveEquipData();
  _equipSaveInventory();
  _equipUpdateSlotDisplay(charId);
  _refreshCharDetailStats(charId);
  _equipRenderSlotPopup();
  if (typeof cpRender === 'function' && _cp.containerId) cpRender();
}

function _equipAddXp() {
  var charId = _equipCurrentChar;
  if (!_equipData[charId] || !_equipData[charId].slot1) return;
  var data = _equipData[charId].slot1;
  var lvl = _equipGetLevel(data.xp);
  if (lvl >= 20) return;
  if (_equipCoins <= 0) return;
  _equipCoins--;
  data.xp++;
  // Atualiza bond junto
  _bondSetXp(charId, data.itemId, data.xp);
  _equipSaveCoins();
  _equipSaveEquipData();
  _equipSaveBonds();
  _equipRenderSlotPopup();
}

// Helper: gera HTML do frame com imagem do tier
function _equipFrameHtml(tier) {
  if (tier) {
    return '<div class="cdm-equip-frame" style="border-color:rgba(201,168,76,0.3);background:rgba(201,168,76,0.04);overflow:hidden;display:flex;align-items:center;justify-content:center">' +
      '<img src="sprites/equip/t' + tier + '.png" style="width:100%;height:100%;object-fit:cover;border-radius:6px" onerror="this.style.display=\'none\'">' +
    '</div>';
  }
  return '<div class="cdm-equip-frame" style="border-color:rgba(201,168,76,0.3);background:rgba(201,168,76,0.04)"></div>';
}

function _equipUpdateSlotDisplay(charId) {
  var nameEl = document.getElementById('cdm-equip1-name');
  var descEl = document.getElementById('cdm-equip1-desc');
  var frameEl = document.getElementById('cdm-equip-slot1');
  if (!nameEl || !descEl) return;
  var data = _equipData[charId] && _equipData[charId].slot1;
  if (data && data.itemId) {
    var item = data._item || _playerItems.find(function(i) { return i.id === data.itemId; });
    if (item) {
      var lvl = _equipGetLevel(data.xp || 0);
      nameEl.textContent = (item.name || ('Tier ' + item.tier)) + ' · ' + item.prefix + ' +' + (item.prefixVal + lvl - 1);
      nameEl.style.color = 'var(--gold)';
      descEl.textContent = 'Nível ' + lvl + (item.suffix ? ' · ' + (item.suffixDesc || item.suffix) : '');
      // Atualiza imagem do frame
      if (frameEl) {
        var frame = frameEl.querySelector('.cdm-equip-frame');
        if (frame) frame.outerHTML = _equipFrameHtml(item.tier);
      }
    }
  } else {
    nameEl.textContent = 'Vazio';
    nameEl.style.color = 'var(--text2)';
    descEl.textContent = 'Tier · Prefixo · Nível';
    if (frameEl) {
      var frame = frameEl.querySelector('.cdm-equip-frame');
      if (frame) frame.outerHTML = _equipFrameHtml(null);
    }
  }
}

function closeEquipSelect(e) {
  if (e.target === e.currentTarget) document.getElementById('equip-select-overlay').classList.remove('open');
}
function closeArtefatoSelect(e) {
  if (e.target === e.currentTarget) document.getElementById('artefato-select-overlay').classList.remove('open');
}
function closeEquipSelectDirect(slotNum) {
  if (slotNum === 1) document.getElementById('equip-select-overlay').classList.remove('open');
  else document.getElementById('artefato-select-overlay').classList.remove('open');
}

// ══ SLOT 2 — ARTEFATO ══

function _artefatoRenderSelectPopup() {
  var body = document.getElementById('equip-select-body2');
  if (!body) return;
  var charId = _equipCurrentChar;
  var data = _equipData[charId] && _equipData[charId].slot2;

  if (data && data.artefatoId) {
    // Artefato equipado — mostrar detalhes e opção de desequipar
    var artDef = _ARTEFATOS.find(function(a) { return a.id === data.artefatoId; });
    var artName = artDef ? artDef.name : data.artefatoId;
    var artDesc = artDef ? artDef.desc : '';
    var charName = (CHARS.find(function(c) { return c.id === charId; }) || {}).name || '';
    body.innerHTML =
      '<div style="background:var(--bg3);border:1px solid rgba(144,96,208,0.4);border-radius:10px;padding:14px;margin-bottom:12px">' +
        '<div style="font-family:\'Cinzel\',serif;font-size:12px;letter-spacing:2px;color:#9060d0;margin-bottom:6px">' + artName + '</div>' +
        '<div style="font-size:10px;color:var(--text);margin-bottom:8px">' + artDesc + '</div>' +
        '<div style="font-size:10px;color:var(--text2)">Equipado em: <span style="color:var(--gold)">' + charName + '</span></div>' +
      '</div>' +
      '<div style="display:flex;flex-direction:column;gap:8px">' +
        '<button class="equip-action-btn red" onclick="_artefatoUnequip()">✕ DESEQUIPAR</button>' +
      '</div>';
  } else {
    // Sem artefato — listar disponíveis
    var available = _playerArtefatos.filter(function(pa) {
      // Não mostrar artefatos já equipados em outro personagem
      var usedByOther = Object.keys(_equipData).some(function(cid) {
        return cid !== charId && _equipData[cid] && _equipData[cid].slot2 && _equipData[cid].slot2.artefatoId === pa.id;
      });
      return !usedByOther;
    });
    if (available.length === 0) {
      body.innerHTML = '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:var(--text2);opacity:0.4;letter-spacing:1px;text-align:center;padding:40px 0">SEM ARTEFATOS</div>';
      return;
    }
    body.innerHTML = available.map(function(pa) {
      var artDef = _ARTEFATOS.find(function(a) { return a.id === pa.id; });
      if (!artDef) return '';
      return '<div class="equip-avail-item" onclick="_artefatoEquip(\'' + pa.id + '\')">' +
        '<div style="font-size:22px;padding:4px 8px">🔮</div>' +
        '<div style="flex:1;min-width:0">' +
          '<div style="font-family:\'Cinzel\',serif;font-size:11px;color:#9060d0">' + artDef.name + '</div>' +
          '<div style="font-size:10px;color:var(--text2)">' + artDef.desc + '</div>' +
        '</div>' +
        '<div style="font-family:\'Cinzel\',serif;font-size:10px;color:#9060d0">EQUIPAR</div>' +
      '</div>';
    }).join('');
  }
}

function _artefatoEquip(artefatoId) {
  var charId = _equipCurrentChar;
  if (!_equipData[charId]) _equipData[charId] = {};
  _equipData[charId].slot2 = { artefatoId: artefatoId };
  _equipSaveEquipData();
  _equipUpdateSlot2Display(charId);
  _artefatoRenderSelectPopup();
  if (typeof cpRender === 'function' && _cp.containerId) cpRender();
}

function _artefatoUnequip() {
  var charId = _equipCurrentChar;
  if (!_equipData[charId] || !_equipData[charId].slot2) return;
  _equipData[charId].slot2 = null;
  _equipSaveEquipData();
  _equipUpdateSlot2Display(charId);
  _artefatoRenderSelectPopup();
  if (typeof cpRender === 'function' && _cp.containerId) cpRender();
}

function _equipUpdateSlot2Display(charId) {
  var nameEl = document.getElementById('cdm-equip2-name');
  var descEl = document.getElementById('cdm-equip2-desc');
  if (!nameEl || !descEl) return;
  var data = _equipData[charId] && _equipData[charId].slot2;
  if (data && data.artefatoId) {
    var artDef = _ARTEFATOS.find(function(a) { return a.id === data.artefatoId; });
    nameEl.textContent = artDef ? artDef.name : data.artefatoId;
    nameEl.style.color = '#9060d0';
    descEl.textContent = artDef ? artDef.desc : '';
  } else {
    nameEl.textContent = 'Vazio';
    nameEl.style.color = 'var(--text2)';
    descEl.textContent = 'Efeito único · Sem progressão';
  }
}

function _openEquipFrom(origin) {
  _equipOrigin = origin;
  showScreen('equip');
  if (!_equipLoaded) {
    _equipLoadAll(function() { _equipRenderRoster(); _craftRenderList(); });
  } else {
    _equipRenderRoster();
    _craftRenderList();
  }
}

function openEquip() {
  var active = document.querySelector('.screen.active');
  _equipOrigin = active ? active.id.replace('screen-','') : 'training-lab';
  showScreen('equip');
  if (!_equipLoaded) {
    _equipLoadAll(function() { _equipRenderRoster(); _craftRenderList(); });
  } else {
    _equipRenderRoster();
    _craftRenderList();
  }
}

function closeEquip() {
  showScreen(_equipOrigin);
  // Re-renderiza mapa do Survivor pra atualizar HP com bônus de equip
  if (_equipOrigin === 'survivor-map' && typeof _survRenderMap === 'function') {
    _survRenderMap();
  }
}

// ══ CRAFT SYSTEM ══

// ── Weight tables for item generation ──
var _itemWeights = {
  // ATQ/DEF/INC weights per tier
  stat: {
    10: [ {v:1,w:50}, {v:2,w:33}, {v:3,w:17} ],
    9:  [ {v:1,w:25}, {v:2,w:22}, {v:3,w:18}, {v:4,w:12}, {v:5,w:8}, {v:6,w:5} ],
    8:  [ {v:1,w:20}, {v:2,w:18}, {v:3,w:15}, {v:4,w:12}, {v:5,w:9}, {v:6,w:7}, {v:7,w:4}, {v:8,w:3}, {v:9,w:2} ]
  },
  // PVS weights per tier
  pvs: {
    10: (function() {
      var a = [];
      for (var i=10;i<=15;i++) a.push({v:i,w:10});
      for (var i=16;i<=22;i++) a.push({v:i,w:6});
      for (var i=23;i<=27;i++) a.push({v:i,w:3});
      for (var i=28;i<=30;i++) a.push({v:i,w:2});
      return a;
    })(),
    9: (function() {
      var a = [];
      for (var i=10;i<=20;i++) a.push({v:i,w:8});
      for (var i=21;i<=35;i++) a.push({v:i,w:5});
      for (var i=36;i<=50;i++) a.push({v:i,w:3});
      for (var i=51;i<=60;i++) a.push({v:i,w:2});
      return a;
    })(),
    8: (function() {
      var a = [];
      for (var i=10;i<=25;i++) a.push({v:i,w:7});
      for (var i=26;i<=45;i++) a.push({v:i,w:5});
      for (var i=46;i<=65;i++) a.push({v:i,w:3});
      for (var i=66;i<=80;i++) a.push({v:i,w:2});
      for (var i=81;i<=90;i++) a.push({v:i,w:1});
      return a;
    })()
  },
  // Block ranges (only tier's own range)
  blockStat: {
    10: [ {v:1,w:50}, {v:2,w:33}, {v:3,w:17} ],
    9:  [ {v:4,w:12}, {v:5,w:8}, {v:6,w:5} ],
    8:  [ {v:7,w:4}, {v:8,w:3}, {v:9,w:2} ]
  },
  blockPvs: {
    10: (function() { var a=[]; for(var i=10;i<=30;i++) a.push({v:i,w: i<=15?10:i<=22?6:i<=27?3:2}); return a; })(),
    9:  (function() { var a=[]; for(var i=40;i<=60;i++) a.push({v:i,w: i<=50?3:2}); return a; })(),
    8:  (function() { var a=[]; for(var i=70;i<=90;i++) a.push({v:i,w: i<=80?2:1}); return a; })()
  }
};

function _weightedRoll(weights) {
