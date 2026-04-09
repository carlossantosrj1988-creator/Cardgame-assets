function showTrainingSelect() {
  showScreen('training-select');
  renderTrainingGrids();
}

function renderTrainingGrids() {
  const g1 = document.getElementById('tr-grid-p1');
  const g2 = document.getElementById('tr-grid-p2');
  if(!g1||!g2) return;
  g1.innerHTML = CHARS.map((ch,i) => {
    const s = SUITS[ch.suit]||SUITS.neutral;
    const sel = trSelP1===i;
    return `<div class="cc ${sel?'sel':''}" onclick="trPickP1(${i})"
      onmousedown="charDetailStart('${ch.id}')" onmouseup="charDetailCancel()" onmouseleave="charDetailCancel()"
      ontouchstart="charDetailStart('${ch.id}')" ontouchend="charDetailCancel()" ontouchcancel="charDetailCancel()">
      <div class="cc-suit" style="color:${s.color}">${charAvatarHtml(ch.id, s, "select")}</div>
      <div class="cc-name"><span style="color:${s.color}">${s.sym}</span> ${ch.name}</div>
      <div class="cc-sub">${ch.sub||'—'}</div>
      <div class="cc-stats"><span>ATQ${ch.atq}</span><span>DEF${ch.def}</span><span>PVS${ch.pvs}</span></div>
    </div>`;
  }).join('');
  g2.innerHTML = CHARS.map((ch,i) => {
    const s = SUITS[ch.suit]||SUITS.neutral;
    const sel = trSelP2===i;
    return `<div class="cc ${sel?'sel':''}" onclick="trPickP2(${i})"
      onmousedown="charDetailStart('${ch.id}')" onmouseup="charDetailCancel()" onmouseleave="charDetailCancel()"
      ontouchstart="charDetailStart('${ch.id}')" ontouchend="charDetailCancel()" ontouchcancel="charDetailCancel()">
      <div class="cc-suit" style="color:${s.color}">${charAvatarHtml(ch.id, s, "select")}</div>
      <div class="cc-name"><span style="color:${s.color}">${s.sym}</span> ${ch.name}</div>
      <div class="cc-sub">${ch.sub||'—'}</div>
      <div class="cc-stats"><span>ATQ${ch.atq}</span><span>DEF${ch.def}</span><span>PVS${ch.pvs}</span></div>
    </div>`;
  }).join('');
  const btn = document.getElementById('tr-btn-start');
  if(btn) btn.disabled = trSelP1===null||trSelP2===null;
}

function trPickP1(i) {
  trSelP1=i;
  const n=document.getElementById('tr-sel-p1-name');
  if(n) n.textContent=CHARS[i].name;
  renderTrainingGrids();
}
function trPickP2(i) {
  trSelP2=i;
  const n=document.getElementById('tr-sel-p2-name');
  if(n) n.textContent=CHARS[i].name;
  renderTrainingGrids();
}

function startTraining() {
  if(trSelP1===null||trSelP2===null) return;
  const p1c = [CHARS[trSelP1]];
  const p2c = [AI_CHARS[trSelP2]];
  G = {
    turn:1, phase:'initiative',
    trainingMode: true,
    p1:{ chars:p1c.map(c=>makeChar(c,'p1')), deck:buildDeck(), hand:[], discard:[] },
    p2:{ chars:p2c.map(c=>makeChar(c,'p2')), deck:buildDeck(), hand:[], discard:[] },
    order:[], orderIdx:0,
    pendingSkill:null, pendingCardIdx:null, pendingAtkCard:null, pendingAttack:null,
    pendingDefCardIdx:null, _clubsFollowUp:null,
    over:false, _areaDefQueue:[], _areaDefContext:null,
    _pendingClubsAtk:null, _clubsAfterQuick:null, _pendingVermelha:null,
    _reactDelay:0, _defMode:'single',
    trEvents:[] // training event log
  };
  // Set HP to 50%
  for(const team of [G.p1, G.p2]) {
    for(const ch of team.chars) {
      ch.hp = Math.round(ch.maxHp * 0.5);
      ch._trBaseHp = ch.hp; // anchor for reset
    }
    // Draw starting hand
    for(let i=0;i<5;i++) draw(team===G.p1?'p1':'p2');
  }
  showScreen('game');
  document.getElementById('btn-restart').classList.add('visible');
  const _log=document.getElementById('log'); if(_log) _log.innerHTML='';
  addLog('🧪 MODO TREINO 1×1 — Personagens imortais, HP resetado após cada ação','sys');
  const _trBadge=document.getElementById('tr-badge'); if(_trBadge) _trBadge.style.display='inline-block';
  addLog('📊 '+G.p1.chars[0].name+' vs '+G.p2.chars[0].name,'sys');
  applyStartPassives();
  showInitiativeChoiceScreen();
}

// ── Training: intercept dmgChar & healChar to compute but reset ──

// ── Training mode helpers ──
let _trResetTimer = null;

function scheduleTrainingFullReset() {
  // Reset ALL chars to base HP 2s after the skill fully resolves
  clearTimeout(_trResetTimer);
  _trResetTimer = setTimeout(()=>{
    if(!G||!G.trainingMode) return;
    let changed = false;
    for(const team of [G.p1, G.p2]) {
      for(const ch of team.chars) {
        const base = ch._trBaseHp || Math.round(ch.maxHp*0.5);
        if(ch.hp !== base) {
          addLog(`🔄 [TREINO] ${ch.name}: HP ${ch.hp} → ${base}`,'info');
          floatStatus(ch,'🔄 RESET','#80ffb0');
          ch.hp = base;
          changed = true;
        }
      }
    }
    if(changed) render();
  }, 1500);
}

// Patch dmgChar and healChar at runtime when training starts
// We do this by checking G.trainingMode inside the functions directly



// ===================== OPTIONS & LOG POPUP =====================
function openSelectOptions() {
