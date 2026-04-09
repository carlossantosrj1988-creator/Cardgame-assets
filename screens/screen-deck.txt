function openDeckBuilder() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-deck').classList.add('active');
}
function _cpBuyReturn() {
  // Retorna para a tela/popup de origem após compra na loja
  if (_navOrigin === 'survivor-select') {
    _navOrigin = 'survivor'; _survRenderGrid();
    return 'screen-survivor';
  }
  if (_navOrigin === 'arena-defense-buy') {
    _navOrigin = 'hub';
    setTimeout(function() { openArenaDefensePopup(); _adpRenderGrid(); }, 50);
    return 'screen-hub';
  }
  if (_navOrigin === 'arena-attack-buy') {
    _navOrigin = 'hub';
    setTimeout(function() { openArenaAttackPopup(); _aapRenderGrid(); }, 50);
    return 'screen-hub';
  }
  if (_navOrigin === 'equip-buy') {
    _navOrigin = 'hub'; _equipRenderRoster();
    return 'screen-equip';
  }
  return _navOrigin === 'survivor' ? 'screen-survivor-map' : _navOrigin === 'lobby' ? 'screen-lobby' : 'screen-hub';
}
function closeDeckBuilder() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  var target = _cpBuyReturn();
  document.getElementById(target).classList.add('active');
}
function openLoja() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-loja').classList.add('active');
}
function closeLoja() {
