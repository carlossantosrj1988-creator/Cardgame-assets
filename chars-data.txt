// ============================================
// chars-data.js — Extraído de index_v2_87.html
// Bloco 1: CHARS (linhas 4870–4967)
// Bloco 2: CHAR_DETAILS, SPRITE_MAP, SPRITE_POSES (linhas 5446–5657)
// ============================================

const CHARS = [
  {id:'kuro',name:'Kuro Isamu',sub:'',suit:'neutral',atq:3,def:5,inc:1,pvs:100,skills:[
    {id:'sho',name:'Seiken Tsuki',power:3,type:'Corporal',target:'enemy',turno:'N',recarga:'N',acao:'N',
      desc:'Aplica Marcado (2t) no alvo. Se alvo já Marcado: poder ×2 e renova a Marca.'},
    {id:'tat',name:'Sanren Geri',power:'1/1/1',type:'Corporal',target:'enemy',turno:'N',recarga:'N',acao:'N',
      desc:'3 golpes. Se alvo Marcado: poder de cada golpe ×3 e consome a Marca.'},
    {id:'had',name:'Kohouken',power:5,type:'Energia',target:'enemy',turno:'N',recarga:'N',acao:'N',
      desc:'Poder base 5 + 2 por carga de Concentração Marcial. Consome todas as cargas ao disparar.'},
  ]},
  {id:'vanc',name:'Comandante Vance',sub:'',suit:'spades',atq:5,def:3,inc:1,pvs:110,skills:[
    {id:'soc',name:'Golpe Tático',power:5,type:'Corporal',target:'enemy',recharge:false,desc:''},
    {id:'foc',name:'Punho Incendiário',power:3,type:'Fogo',target:'enemy',recharge:true,desc:'Aplica Queimadura: 10 dano + -1 DEF por 2 turnos.'},
    {id:'ele',name:'Descarga Elétrica',power:5,type:'Elétrico',target:'all_enemy',recharge:true,desc:'Catastrófico + Ignora Armadura. Atinge todos os inimigos.'},
  ]},
  {id:'zeph',name:'Zephyr',sub:'o Bardo',suit:'clubs',atq:4,def:3,inc:3,pvs:110,skills:[
    {id:'fac',name:'Façada Sônica*',power:3,type:'Distância',target:'all_enemy',recharge:false,desc:'Atinge todos os inimigos.'},
    {id:'seu',name:'Sou Seu Amigo',power:0,type:'Encanto',target:'enemy',recharge:true,desc:'Encantado: 50% de entrar na frente do próprio aliado. Ação Rápida.'},
    {id:'pre',name:'Prestidigitação',power:0,type:'Melhoria',target:'all_ally',recharge:true,desc:'Imagem Espelhada em todos aliados: 50% esquiva 1 turno.'},
  ]},
  {id:'kane',name:'Kane',sub:'O Mercenário',suit:'clubs',atq:4,def:4,inc:2,pvs:110,skills:[
    {id:'esf',name:'Facada',power:1,type:'Cortante',target:'enemy',recharge:false,turno:'N',recarga:'N',acao:'N',
     desc:'Ignora Armadura.'},
    {id:'wpn',name:'Disparo — Pistola',power:4,type:'Distância',target:'enemy',recharge:false,turno:'N',recarga:'N',acao:'N',
     desc:'Crítico Alto: 50% de chance de dano dobrado.'},
    {id:'gran',name:'Lança Granada',power:2,type:'Fogo',target:'all_enemy',recharge:true,turno:'N',recarga:'L',acao:'N',
     desc:'Explosão em área. Atinge todos os inimigos. Aplica Queimadura.'},
  ]},
  {id:'gora',name:'Gorath',sub:'o Bárbaro',suit:'hearts',atq:4,def:5,inc:0,pvs:130,skills:[
    {id:'atc',name:'ATACARRRR',power:4,type:'Cortante',target:'enemy',recharge:false,desc:'Amaciado: dobra poder Cortante por 2 turnos. (MARCA)'},
    {id:'tas',name:'SKAAAAARRRRR!!!',power:4,type:'Invocação',target:'enemy',recharge:false,desc:'Ação Rápida. Skaar, o texugo atroz, ataca o inimigo.'},
    {id:'ago',name:'Agora é Sério',power:0,type:'Melhoria',target:'self',recharge:true,desc:'Cada ataque recebido aumenta ATACARRRR em 4 até próximo turno.'},
  ]},
  {id:'grim',name:'Grimbol',sub:'',suit:'diamonds',atq:2,def:3,inc:1,pvs:110,skills:[
    {id:'arc',name:'Arcabuz',power:5,type:'Distância',target:'enemy',turno:'L',recarga:'L',acao:'N',desc:''},
    {id:'bac',name:'Bomba Ácida',power:1,type:'Químico',target:'all_enemy',recharge:true,desc:'Derreter Armadura: impede uso de cartas de defesa e Valete.'},
    {id:'eli',name:'Elixir da Cura',power:3,type:'Cura',target:'all_ally',recharge:true,desc:'Cura todos os aliados com base no ataque total.'},
  ]},
  {id:'sam',name:'Sam',sub:'',suit:'diamonds',atq:3,def:5,inc:2,pvs:100,skills:[
    {id:'fpl',name:'Feixe de Plasma',power:1,type:'Energia',target:'enemy',recharge:true,desc:'Ignora Armadura. Poder = cargas acumuladas (máx 5). Com 5 cargas: atinge TODOS. Passar turno acumula carga.'},
    {id:'ffr',name:'Feixe Congelante',power:1,type:'Frio',target:'enemy',recharge:true,desc:'Congela: 50% de chance de perder rodada. Poder = cargas acumuladas (máx 5). Com 5 cargas: atinge TODOS.'},
    {id:'brd',name:'Bomba Radiação',power:1,type:'Energia',target:'all_enemy',recharge:true,desc:'Radiação: 4 dano/turno por 2 turnos. Acumula até 4x.'},
  ]},
  {id:'kael',name:'Kael Vorn',sub:'',suit:'spades',atq:4,def:2,inc:0,pvs:120,skills:[
    {id:'smt',name:'Soco Metálico',power:4,type:'Corporal',target:'enemy',recharge:false,desc:''},
    {id:'cpr',name:'Corte Preciso',power:'2/2',type:'Cortante',target:'enemy',recharge:false,desc:'Sangramento: 3 dano/turno por 2 turnos. Acumula até 3x.'},
    {id:'fur',name:'Ataque de Fúria',power:1,type:'Cortante',target:'all_enemy',recharge:true,desc:'Em Fúria (aliado nocauteado): contra-ataque sem custo de carta.'},
  ]},
  {id:'tyre',name:'Tyren',sub:'',suit:'hearts',atq:2,def:4,inc:0,pvs:130,skills:[
    {id:'aes',name:'Avanço Espada',power:3,type:'Cortante',target:'enemy',recharge:false,desc:'Acúmulo: 1ª passada = Ignora Armadura. 2ª = Atinge todos.'},
    {id:'aec',name:'Avanço Escudo',power:3,type:'Corporal',target:'enemy',recharge:false,desc:'Exposto: -50% DEF base do alvo por 2 turnos. (MARCA)'},
    {id:'rou',name:'Roupas Encantadas',power:0,type:'Melhoria',target:'self',recharge:true,desc:'Verde: regenera 3 PVS/rodada. Azul: protege aliados. Vermelha: contra-ataca. Ação Rápida.'},
  ]},
  {id:'lori',name:'Lorien',sub:'a Estrela',suit:'spades',atq:3,def:2,inc:1,pvs:110,skills:[
    {id:'lin',name:'Lança Infernal',power:4,type:'Perfurante',target:'enemy',recharge:false,desc:'Exposto: -50% DEF base do alvo por 2 turnos.'},
    {id:'fli',name:'Flecha Imperial',power:3,type:'Distância',target:'enemy',recharge:false,desc:'Enfraquecido: -50% ATQ base do alvo por 2 turnos.'},
    {id:'uni',name:'Investida Unicórnio',power:5,type:'Invocação',target:'all_enemy',recharge:true,desc:'Dobra dano com Exposto ou Enfraquecido. 2x se ambos.'},
  ]},
  {id:'nyxa',name:'Nyxar',sub:'Entidade do Caos',suit:'diamonds',atq:3,def:3,inc:1,pvs:110,skills:[
    {id:'dad',name:'Dados Penetrantes',power:'1/1',type:'Distância',target:'enemy',recharge:false,desc:'Ataque múltiplo.'},
    {id:'mas',name:'Máscara de Faces',power:0,type:'Melhoria',target:'self',recharge:true,desc:'Feliz: contra-ataque em aliados atacados. Triste: ataque conjunto em inimigos atacados.'},
    {id:'azs',name:'Azar ou Sorte',power:15,type:'Mágico',target:'all',recharge:true,desc:'Par = cura. Ímpar = dano. Afeta TODOS os personagens.'},
  ]},
  {id:'pt_aer',name:'Aeryn',sub:'Patrulheira Líder',suit:'neutral',atq:3,def:3,inc:1,pvs:120,skills:[
    {id:'eli2',name:'Eliminar*',power:6,type:'Cortante',target:'enemy',recharge:false,desc:'Explora Exposto: remove e causa dano dobrado.'},
    {id:'sab',name:'Saba',power:0,type:'Melhoria',target:'all_ally',recharge:false,desc:'Fortalecido: +50% ATQ para todos aliados por 2 turnos.'},
    {id:'tiz',name:'Espírito do Tigre',power:2,type:'Invocação',target:'all_enemy',recharge:true,desc:'Sangramento em todos os inimigos.'},
  ]},
  {id:'pt_cae',name:'Caeryn',sub:'Patrulheiro da Guarda',suit:'hearts',atq:4,def:5,inc:0,pvs:120,skills:[
    {id:'esp',name:'Espada do Poder*',power:'2/2',type:'Cortante',target:'enemy',recharge:false,desc:'Ataque múltiplo.'},
    {id:'lzv',name:'Corte Flamejante',power:3,type:'Fogo',target:'enemy',recharge:false,desc:'Aplica Queimadura.'},
    {id:'trz',name:'Espírito da Salamandra',power:'2/2',type:'Invocação',target:'all_enemy',recharge:true,desc:'Derreter Armadura em todos: impede uso de cartas de defesa e Valete.'},
  ]},
  {id:'pt_elo',name:'Elowen',sub:'Patrulheira do Suporte',suit:'diamonds',atq:3,def:3,inc:1,pvs:100,skills:[
    {id:'arc2',name:'Arco do Poder',power:1,type:'Perfurante',target:'enemy',recharge:false,desc:''},
    {id:'lzr',name:'Disparo Élfico',power:5,type:'Energia',target:'enemy',recharge:true,desc:''},
    {id:'ptz',name:'Espírito do Grifo',power:2,type:'Melhoria',target:'all_ally',recharge:true,desc:'Escudo para aliados: absorve dano igual ao ataque total.'},
  ]},
  {id:'pt_zar',name:'Zarae',sub:'Patrulheira da Caça',suit:'clubs',atq:4,def:4,inc:3,pvs:110,skills:[
    {id:'atg',name:'Atagas do Poder*',power:'1/1',type:'Cortante',target:'enemy',recharge:false,desc:'Ataque múltiplo.'},
    {id:'lza',name:'Corte Estático',power:3,type:'Elétrico',target:'enemy',recharge:true,desc:'Aplica Estática: +5 dano extra em ataques elétricos por 2 turnos.'},
    {id:'dsz',name:'Espírito do Guepardo',power:1,type:'Invocação',target:'all_enemy',recharge:true,desc:'Ação Rápida.'},
  ]},
  {id:'pt_var',name:'Varok',sub:'Patrulheiro do Combate',suit:'spades',atq:6,def:3,inc:1,pvs:100,skills:[
    {id:'mch',name:'Machado do Poder',power:6,type:'Cortante',target:'enemy',recharge:false,desc:''},
    {id:'lzp',name:'Soco Brutal',power:3,type:'Energia',target:'enemy',recharge:true,desc:'Enfraquecido: -50% ATQ por 2 turnos.'},
    {id:'msz',name:'Espírito do Gorila',power:1,type:'Terrestre',target:'all_enemy',recharge:true,desc:'Atordoamento: 50% de perder o turno por 1 turno.'},
  ]},
  {id:'pt_tha',name:'Thalion',sub:'Patrulheiro da Resiliência',suit:'hearts',atq:2,def:7,inc:1,pvs:120,skills:[
    {id:'lnp',name:'Lança do Poder',power:6,type:'Perfurante',target:'enemy',recharge:false,desc:''},
    {id:'lzaz',name:'Corte Gélido',power:3,type:'Frio',target:'enemy',recharge:true,desc:'Resfriamento: 10 dano + -1 Poder por 2 turnos.'},
    {id:'tcz',name:'Espírito do Urso Polar',power:2,type:'Invocação',target:'all_enemy',recharge:true,desc:'Aumenta poder em +3 por cada debuff ativo no alvo.'},
  ]},
  {id:'voss',name:'Van Carl Voss',sub:'',suit:'clubs',atq:4,def:2,inc:3,pvs:100,skills:[
    {id:'tei',name:'Chicote Paralisante*',power:'2/2/2',type:'Distância',target:'enemy',recharge:false,desc:'Lento: recarga inimiga vira L por 1 turno.'},
    {id:'sen',name:'Instinto Reflexivo',power:0,type:'Melhoria',target:'self',recharge:true,desc:'Esquiva próximo ataque único. Se esquivar, ganha rodada extra.'},
    {id:'web',name:'Tiro Decisivo',power:'3/3',type:'Corporal',target:'enemy',recharge:true,desc:'Dobra dano em inimigos com Lento.'},
  ]},
];

// --- Bloco 2: CHAR_DETAILS, SPRITE_MAP, SPRITE_POSES ---

const CHAR_DETAILS = {
  kuro: { ini:1, passives:[
    {name:'Dedicação Total',     desc:'No início do turno escolhe o naipe mais vantajoso contra os inimigos por 2 turnos. Pondera risco×recompensa antes de adotar um naipe perigoso.'},
    {name:'Concentração Marcial',      desc:'Ganha +1 carga por turno automaticamente e +2 ao passar. Máx 10. Kohouken usa e consome todas as cargas (+2 poder por carga).'},
  ]},
  vanc: { ini:1, passives:[
    {name:'Chamado da Tropa',  desc:'A cada 3 turnos, a Tropa pode conceder ajudas (cura, dano, buff). Tropa de Infiltração: Sangramento. Tropa de Infantaria: Dano. Tropa de Resgate: Imagem Espelhada.'},
  ]},
  zeph: { ini:3, passives:[
    {name:'Sorte Grande',        desc:'No início do seu turno, rola uma moeda (50%). Se vencer, compra uma carta extra.'},
    {name:'Inspirar Coragem',    desc:'Todos os aliados recebem +1 ATQ e +1 DEF enquanto Zephyr estiver vivo.'},
  ]},
  kane: { ini:2, passives:[
    {name:'Resgate dos Prisioneiros', desc:'Começa com Pistola. Ao passar rodada: compra 1 carta (global) e rola — 25% Pistola, 25% Metralhadora, 25% Shotgun, 25% +1 carta extra.'},
  ]},
  gora: { ini:0, passives:[
    {name:'Defender os Fracos',  desc:'Gorath defende aliados de ataques de alvo único que não sejam Rápidos ou Furtivos.'},
    {name:'Sou Invencível',      desc:'Ganha 1 de DEF a cada 10% de vida perdida.'},
  ]},
  grim: { ini:1, passives:[
    {name:'Grande Gênio',        desc:'Ao passar a rodada, compra uma carta adicional.'},
    {name:'Engenharia Avançada', desc:'Ao passar a rodada, coloca 1 carga no Arcabuz (máx 3). Cada carga aumenta o Poder.'},
  ]},
  sam: { ini:2, passives:[
    {name:'Gravity Suit',        desc:'Armadura avançada que aumenta a resistência a danos.'},
    {name:'Super Velocidade',    desc:'Ao passar rodada, acumula 1 carga (máx 5) e causa dano igual ao nº de cargas, ignorando DEF.'},
    {name:'Carregar',            desc:'Cada turno passado aumenta o Poder do Feixe em 1 (máx 5). Com 5 cargas, o Feixe atinge TODOS.'},
  ]},
  kael: { ini:0, passives:[
    {name:'Instinto Furioso',    desc:'Quando um aliado é nocauteado, Kael Vorn entra em Fúria e recupera 20% de vida.'},
    {name:'Espírito de Combate', desc:'Ganha +1 ATQ a cada 10% de vida perdida.'},
  ]},
  tyre: { ini:0, passives:[
    {name:'Acúmulo de Poder',    desc:'Ao passar a rodada: 1ª vez → Avanço Espada ganha Ignorar Armadura. 2ª vez → Avanço Espada atinge TODOS. Máx 2 cargas.'},
  ]},
  lori:   { ini:1, passives:[
    {name:'Grande Estrela',      desc:'Ao nocautear inimigo: compra 1 carta extra e ganha 1 rodada extra.'},
    {name:'Gladiadora',          desc:'Ao nocautear um inimigo, ganha +1 ATQ e +1 DEF. Abaixo de 20% de vida: +1 ATQ e +1 DEF.'},
  ]},
  nyxa: { ini:1, passives:[
    {name:'Presença de Nimb',    desc:'No início do turno, rola uma moeda (50%). Se vencer, sua primeira ação torna-se Ação Rápida.'},
  ]},
  pt_aer: { ini:1, passives:[
    {id:'pt_comb_aer', name:'Patrulheiro de Combate', desc:'Com 1 Patrulheiro aliado: 50% de atacar junto. Com 2+: 50% de atacar inimigos que atacam aliados.'},
    {id:'pt_lider',    name:'Patrulheiro Líder',       desc:'Cobre aliados com 20% ou menos de vida, entrando na frente de ataques de Alvo Único.'},
  ]},
  pt_cae: { ini:0, passives:[
    {id:'pt_comb_cae', name:'Patrulheiro de Combate', desc:'Aliados ganham +1 DEF para cada Patrulheiro aliado na equipe.'},
    {id:'pt_emboscada',name:'Emboscada Florestal',     desc:'Ativado 1x no início. Com 3 Patrulheiros na equipe: 20 de dano em todos os inimigos, ignora DEF.'},
  ]},
  pt_elo: { ini:1, passives:[
    {id:'pt_comb_elo', name:'Patrulheiro de Combate', desc:'Ao passar o turno, compra 1 carta adicional para cada Patrulheiro aliado na equipe.'},
  ]},
  pt_zar: { ini:3, passives:[
    {id:'pt_comb_zar', name:'Patrulheiro de Combate', desc:'A equipe ganha +1 Poder para cada Patrulheiro aliado.'},
  ]},
  pt_var: { ini:1, passives:[
    {id:'pt_comb_var', name:'Patrulheiro de Combate', desc:'A equipe ganha +1 ATQ para cada Patrulheiro aliado.'},
  ]},
  pt_tha: { ini:1, passives:[
    {id:'pt_comb_tha', name:'Patrulheiro de Combate', desc:'A equipe ganha +10 de vida para cada Patrulheiro aliado.'},
  ]},
  voss: { ini:3, passives:[
    {name:'Protetor Instintivo', desc:'50% de proteger aliados de ataques de Alvo Único. 25% de proteger de ataques em área.'},
  ]},
};

// ===================== SPRITE SYSTEM =====================
const SPRITE_MAP = { sam: 'sam', nyxa: 'nyxa', lori: 'lori', grim: 'grim', kuro: 'kuro', vanc: 'vanc', gora: 'gora', kane: 'kane', zeph: 'zeph', kael: 'kael', tyre: 'tyre', pt_aer: 'pt_aer', pt_cae: 'pt_cae', pt_elo: 'pt_elo', pt_zar: 'pt_zar', pt_var: 'pt_var',
  // Monstros — Tier 1 (Floresta Sombria)
  cria_t1_a: 'monstros/cria_t1_a', cria_t1_b: 'monstros/cria_t1_b', cria_t1_c: 'monstros/cria_t1_c',
  vespa_a: 'monstros/vespa_a', vespa_b: 'monstros/vespa_b', vespa_c: 'monstros/vespa_c',
  elfo_a: 'monstros/elfo_a', elfo_b: 'monstros/elfo_b', elfo_c: 'monstros/elfo_c',
  // Mini Boss — Tier 1
  xama_t1: 'monstros/xama_t1',
  // Boss — Tier 1
  boss_t1: 'monstros/boss_t1',
  // Monstros — Tier 2 (Cavernas de Gelo)
  urso_t2_a: 'monstros/urso_t2_a', urso_t2_b: 'monstros/urso_t2_b', urso_t2_c: 'monstros/urso_t2_c',
  nefilin_t2_a: 'monstros/nefilin_t2_a', nefilin_t2_b: 'monstros/nefilin_t2_b', nefilin_t2_c: 'monstros/nefilin_t2_c',
  troll_t2_a: 'monstros/troll_t2_a', troll_t2_b: 'monstros/troll_t2_b', troll_t2_c: 'monstros/troll_t2_c',
  // Mini Boss — Tier 2
  parede_t2: 'monstros/parede_t2',
};

// Configuracao de poses por personagem
const SPRITE_POSES = {
  sam: {
    idle: 'idle',
    atk1: 'atk1',
    atk2: 'atk2',
    recarga: 'recarga',
    hit:  'hit',
    passiva: 'passiva'
  },
  nyxa: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  lori: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  grim: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  kuro: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  vanc: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  gora: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  kane: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  zeph: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  kael: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  tyre: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  pt_aer: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  pt_cae: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  pt_zar: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  pt_var: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  pt_elo: {
    idle:    'idle',
    atk1:    'atk1',
    atk2:    'atk2',
    hit:     'hit',
    recarga: 'recarga'
  },
  // Monstros — Tier 1
  cria_t1_a: { idle: 'idle' }, cria_t1_b: { idle: 'idle' }, cria_t1_c: { idle: 'idle' },
  vespa_a:   { idle: 'idle' }, vespa_b:   { idle: 'idle' }, vespa_c:   { idle: 'idle' },
  elfo_a:    { idle: 'idle' }, elfo_b:    { idle: 'idle' }, elfo_c:    { idle: 'idle' },
  xama_t1:   { idle: 'idle' },
  boss_t1:   { idle: 'idle' },
  parede_t2: { idle: 'idle' },
  // Monstros — Tier 2
  urso_t2_a:    { idle: 'idle' }, urso_t2_b:    { idle: 'idle' }, urso_t2_c:    { idle: 'idle' },
  nefilin_t2_a: { idle: 'idle' }, nefilin_t2_b: { idle: 'idle' }, nefilin_t2_c: { idle: 'idle' },
  troll_t2_a:   { idle: 'idle' }, troll_t2_b:   { idle: 'idle' }, troll_t2_c:   { idle: 'idle' },
};
