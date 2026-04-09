function renderSelectP1() {
  const grid = document.getElementById('grid-p1');
  if(!grid) return;
  grid.innerHTML = CHARS.map((ch,i)=>{
    const s=SUITS[ch.suit]||SUITS.neutral;
    const selected=selP1.includes(i);
    const disabled=selP1.length>=3&&!selected;
    const adv = SUIT_ADV[ch.suit]||SUIT_ADV.neutral;
    return `<div class="cc ${selected?'sel':''} ${disabled?'dis':''}"
      onclick="toggleSelP1(${i})"
      onmousedown="charDetailStart('${ch.id}')" onmouseup="charDetailCancel()" onmouseleave="charDetailCancel()"
      ontouchstart="charDetailStart('${ch.id}')" ontouchend="charDetailCancel()" ontouchcancel="charDetailCancel()"
      title="${ch.name} — ${adv.adv} | ${adv.dis}">
      <div class="cc-suit" style="color:${s.color}">${charAvatarHtml(ch.id, s, "select")}</div>
      <div class="cc-name"><span style="color:${s.color}">${s.sym}</span> ${ch.name}</div>
      <div class="cc-sub">${ch.sub||'—'}</div>
      <div class="cc-stats"><span>ATQ${ch.atq}</span><span>DEF${ch.def}</span><span>PVS${ch.pvs}</span></div>
      <div class="cc-adv">${adv.adv}</div>
      <div class="cc-dis">${adv.dis}</div>
    </div>`;
  }).join('');
  const cnt = document.getElementById('sel-count');
  if(cnt) cnt.textContent = selP1.length;
  const btn = document.getElementById('btn-next');
  if(btn) btn.disabled = selP1.length < 3;
}

function renderSelectP2() {
  const grid = document.getElementById('grid-p2');
  if(!grid) return;
  grid.innerHTML = CHARS.map((ch,i)=>{
    const s=SUITS[ch.suit]||SUITS.neutral;
    const adv=SUIT_ADV[ch.suit]||SUIT_ADV.neutral;
    const selected=selP2.includes(i);
    const disabled=!selected&&!selP2.includes(i);
    return `<div class="cc ${selected?'sel':''} ${disabled?'dis':''}"
      onmousedown="charDetailStart('${ch.id}')" onmouseup="charDetailCancel()" onmouseleave="charDetailCancel()"
      ontouchstart="charDetailStart('${ch.id}')" ontouchend="charDetailCancel()" ontouchcancel="charDetailCancel()">
      <div class="cc-suit" style="color:${s.color}">${charAvatarHtml(ch.id, s, "select")}</div>
      <div class="cc-name"><span style="color:${s.color}">${s.sym}</span> ${ch.name}</div>
      <div class="cc-sub">${ch.sub||'—'}</div>
      <div class="cc-stats"><span>ATQ${ch.atq}</span><span>DEF${ch.def}</span><span>PVS${ch.pvs}</span></div>
      <div class="cc-adv">${adv.adv}</div>
      <div class="cc-dis">${adv.dis}</div>
    </div>`;
  }).filter((_,i)=>selP2.includes(i)).join('');
}

function randomPick() {
  selP1 = [];
  const indices = CHARS.map((_,i)=>i).sort(()=>Math.random()-.5);
  selP1 = indices.slice(0,3);
  renderSelectP1();
}

function renderSelect() { renderSelectP1(); }

function toggleSelP1(i) {
  const pos=selP1.indexOf(i);
  if(pos>=0) { selP1.splice(pos,1); _logEvent('Desmarcou: ' + CHARS[i].name, 'SELECT'); }
  else if(selP1.length<3) { selP1.push(i); _logEvent('Selecionou: ' + CHARS[i].name + ' (' + selP1.length + '/3)', 'SELECT'); }
  renderSelectP1();
}

function toggleSel(pl,i) {
  if(pl==='p1') toggleSelP1(i);
}

function goToAiStep() {
  if(selP1.length<3) return;
  aiPick();
  showScreen('select2');
}

function aiPick() {
  selP2=[];
  const avail=AI_CHARS.map((_,i)=>i).sort(()=>Math.random()-.5);
  selP2=avail.slice(0,3);
  renderSelectP2();
}

function applyStartPassives() {
