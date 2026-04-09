const AI_CHARS = [
  {id:'kuro_ai',name:'Kuro Isamu',sub:'',suit:'neutral',atq:3,def:5,inc:1,pvs:100,isAI:true,skills:[
    {id:'sho',name:'Seiken Tsuki',power:3,type:'Corporal',target:'enemy',turno:'N',recarga:'N',acao:'N',
      desc:'Aplica Marcado (2t) no alvo. Se alvo já Marcado: poder ×2 e renova a Marca.'},
    {id:'tat',name:'Sanren Geri',power:'1/1/1',type:'Corporal',target:'enemy',turno:'N',recarga:'N',acao:'N',
      desc:'3 golpes. Se alvo Marcado: poder de cada golpe ×3 e consome a Marca.'},
    {id:'had',name:'Kohouken',power:5,type:'Energia',target:'enemy',turno:'N',recarga:'N',acao:'N',
      desc:'Poder base 5 + 2 por carga de Concentração Marcial. Consome todas as cargas ao disparar.'},
  ]},
  {id:'vanc_ai',name:'Comandante Vance',sub:'',suit:'spades',atq:5,def:3,inc:1,pvs:110,isAI:true,skills:[
    {id:'soc',name:'Golpe Tático',power:5,type:'Corporal',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:''},
    {id:'foc',name:'Punho Incendiário',power:3,type:'Fogo',target:'enemy',turno:'N',recarga:'L',acao:'N',desc:'Aplica Queimadura: 10 dano + -1 DEF por 2 turnos.'},
    {id:'ele',name:'Descarga Elétrica',power:5,type:'Elétrico',target:'all_enemy',turno:'N',recarga:'L',acao:'N',desc:'Catastrófico + Ignora Armadura. Atinge todos os inimigos.'},
  ]},
  {id:'zeph_ai',name:'Zephyr',sub:'o Bardo',suit:'clubs',atq:4,def:3,inc:3,pvs:110,isAI:true,skills:[
    {id:'fac',name:'Façada Sônica*',power:3,type:'Distância',target:'all_enemy',turno:'N',recarga:'N',acao:'N',desc:'Atinge todos os inimigos.'},
    {id:'seu',name:'Sou Seu Amigo',power:0,type:'Encanto',target:'enemy',turno:'N',recarga:'L',acao:'R',desc:'Encantado: 50% de entrar na frente do próprio aliado. Ação Rápida.'},
    {id:'pre',name:'Prestidigitação',power:0,type:'Melhoria',target:'all_ally',turno:'N',recarga:'L',acao:'N',desc:'Imagem Espelhada em todos aliados: 50% esquiva 1 turno.'},
  ]},
  {id:'kane_ai',name:'Kane',sub:'O Mercenário',suit:'clubs',atq:4,def:4,inc:2,pvs:110,isAI:true,skills:[
    {id:'esf',name:'Facada',power:1,type:'Cortante',target:'enemy',turno:'N',recarga:'N',acao:'N',
      desc:'Ignora Armadura.'},
    {id:'wpn',name:'Disparo — Pistola',power:4,type:'Distância',target:'enemy',turno:'N',recarga:'N',acao:'N',
      desc:'Crítico Alto: 50% de chance de dano dobrado.'},
    {id:'gran',name:'Lança Granada',power:2,type:'Fogo',target:'all_enemy',turno:'N',recarga:'L',acao:'N',
      desc:'Explosão em área. Atinge todos os inimigos. Aplica Queimadura.'},
  ]},
  {id:'gora_ai',name:'Gorath',sub:'o Bárbaro',suit:'hearts',atq:4,def:5,inc:0,pvs:130,isAI:true,skills:[
    {id:'atc',name:'ATACARRRR',power:4,type:'Cortante',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Amaciado: dobra poder Cortante por 2 turnos. (MARCA)'},
    {id:'tas',name:'SKAAAAARRRRR!!!',power:4,type:'Invocação',target:'enemy',turno:'N',recarga:'N',acao:'R',desc:'Ação Rápida. Skaar, o texugo atroz, ataca o inimigo.'},
    {id:'ago',name:'Agora é Sério',power:0,type:'Melhoria',target:'self',turno:'N',recarga:'L',acao:'N',desc:'Cada ataque recebido aumenta ATACARRRR em 4 até próximo turno.'},
  ]},
  {id:'grim_ai',name:'Grimbol',sub:'',suit:'diamonds',atq:2,def:3,inc:1,pvs:110,isAI:true,skills:[
    {id:'arc',name:'Arcabuz',power:5,type:'Distância',target:'enemy',turno:'L',recarga:'L',acao:'N',desc:''},
    {id:'bac',name:'Bomba Ácida',power:1,type:'Químico',target:'all_enemy',turno:'N',recarga:'L',acao:'N',desc:'Derreter Armadura: impede uso de cartas de defesa e Valete.'},
    {id:'eli',name:'Elixir da Cura',power:3,type:'Cura',target:'all_ally',turno:'N',recarga:'L',acao:'N',desc:'Cura todos os aliados com base no ataque total.'},
  ]},
  {id:'sam_ai',name:'Sam',sub:'',suit:'diamonds',atq:3,def:5,inc:2,pvs:100,isAI:true,skills:[
    {id:'fpl',name:'Feixe de Plasma',power:1,type:'Energia',target:'enemy',turno:'N',recarga:'L',acao:'N',desc:'Ignora Armadura. Poder = cargas acumuladas (máx 5). Com 5 cargas: atinge TODOS. Passar turno acumula carga.'},
    {id:'ffr',name:'Feixe Congelante',power:1,type:'Frio',target:'enemy',turno:'N',recarga:'L',acao:'N',desc:'Congela: 50% de chance de perder rodada. Poder = cargas acumuladas (máx 5). Com 5 cargas: atinge TODOS.'},
    {id:'brd',name:'Bomba Radiação',power:1,type:'Energia',target:'all_enemy',turno:'N',recarga:'L',acao:'N',desc:'Radiação: 4 dano/turno por 2 turnos. Acumula até 4x.'},
  ]},
  {id:'kael_ai',name:'Kael Vorn',sub:'',suit:'spades',atq:4,def:2,inc:0,pvs:120,isAI:true,skills:[
    {id:'smt',name:'Soco Metálico',power:4,type:'Corporal',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:''},
    {id:'cpr',name:'Corte Preciso',power:'2/2',type:'Cortante',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Sangramento: 3 dano/turno por 2 turnos. Acumula até 3x.'},
    {id:'fur',name:'Ataque de Fúria',power:1,type:'Cortante',target:'all_enemy',turno:'N',recarga:'L',acao:'N',desc:'Em Fúria (aliado nocauteado): contra-ataque sem custo de carta.'},
  ]},
  {id:'tyre_ai',name:'Tyren',sub:'',suit:'hearts',atq:2,def:4,inc:0,pvs:130,isAI:true,skills:[
    {id:'aes',name:'Avanço Espada',power:3,type:'Cortante',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Acúmulo: 1ª passada = Ignora Armadura. 2ª = Atinge todos.'},
    {id:'aec',name:'Avanço Escudo',power:3,type:'Corporal',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Exposto: -50% DEF base do alvo por 2 turnos. (MARCA)'},
    {id:'rou',name:'Roupas Encantadas',power:0,type:'Melhoria',target:'self',turno:'N',recarga:'L',acao:'R',desc:'Verde: regenera 3 PVS/rodada. Azul: protege aliados. Vermelha: contra-ataca. Ação Rápida.'},
  ]},
  {id:'lori_ai',name:'Lorien',sub:'a Estrela',suit:'spades',atq:3,def:2,inc:1,pvs:110,isAI:true,skills:[
    {id:'lin',name:'Lança Infernal',power:4,type:'Perfurante',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Exposto: -50% DEF base do alvo por 2 turnos.'},
    {id:'fli',name:'Flecha Imperial',power:3,type:'Distância',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Enfraquecido: -50% ATQ base do alvo por 2 turnos.'},
    {id:'uni',name:'Investida Unicórnio',power:5,type:'Invocação',target:'all_enemy',turno:'N',recarga:'L',acao:'N',desc:'Dobra dano com Exposto ou Enfraquecido. 2x se ambos.'},
  ]},
  {id:'nyxa_ai',name:'Nyxar',sub:'Entidade do Caos',suit:'diamonds',atq:3,def:3,inc:1,pvs:110,isAI:true,skills:[
    {id:'dad',name:'Dados Penetrantes',power:'1/1',type:'Distância',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Ataque múltiplo.'},
    {id:'mas',name:'Máscara de Faces',power:0,type:'Melhoria',target:'self',turno:'N',recarga:'L',acao:'N',desc:'Feliz: contra-ataque em aliados atacados. Triste: ataque conjunto em inimigos atacados.'},
    {id:'azs',name:'Azar ou Sorte',power:15,type:'Mágico',target:'all',turno:'N',recarga:'L',acao:'N',desc:'Par = cura. Ímpar = dano. Afeta TODOS os personagens.'},
  ]},
  {id:'pt_aer_ai',name:'Aeryn',sub:'Patrulheira Líder',suit:'neutral',atq:3,def:3,inc:1,pvs:120,isAI:true,skills:[
    {id:'eli2',name:'Eliminar*',power:6,type:'Cortante',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Explora Exposto: remove e causa dano dobrado.'},
    {id:'sab',name:'Saba',power:0,type:'Melhoria',target:'all_ally',turno:'N',recarga:'N',acao:'N',desc:'Fortalecido: +50% ATQ para todos aliados por 2 turnos.'},
    {id:'tiz',name:'Espírito do Tigre',power:2,type:'Invocação',target:'all_enemy',turno:'N',recarga:'L',acao:'N',desc:'Sangramento em todos os inimigos.'},
  ]},
  {id:'pt_cae_ai',name:'Caeryn',sub:'Patrulheiro da Guarda',suit:'hearts',atq:4,def:5,inc:0,pvs:120,isAI:true,skills:[
    {id:'esp',name:'Espada do Poder*',power:'2/2',type:'Cortante',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Ataque múltiplo.'},
    {id:'lzv',name:'Corte Flamejante',power:3,type:'Fogo',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Aplica Queimadura.'},
    {id:'trz',name:'Espírito da Salamandra',power:'2/2',type:'Invocação',target:'all_enemy',turno:'N',recarga:'L',acao:'N',desc:'Derreter Armadura em todos: impede uso de cartas de defesa e Valete.'},
  ]},
  {id:'pt_elo_ai',name:'Elowen',sub:'Patrulheira do Suporte',suit:'diamonds',atq:3,def:3,inc:1,pvs:100,isAI:true,skills:[
    {id:'arc2',name:'Arco do Poder',power:1,type:'Perfurante',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:''},
    {id:'lzr',name:'Disparo Élfico',power:5,type:'Energia',target:'enemy',turno:'N',recarga:'L',acao:'N',desc:''},
    {id:'ptz',name:'Espírito do Grifo',power:2,type:'Melhoria',target:'all_ally',turno:'N',recarga:'L',acao:'N',desc:'Escudo para aliados: absorve dano igual ao ataque total.'},
  ]},
  {id:'pt_zar_ai',name:'Zarae',sub:'Patrulheira da Caça',suit:'clubs',atq:4,def:4,inc:3,pvs:110,isAI:true,skills:[
    {id:'atg',name:'Atagas do Poder*',power:'1/1',type:'Cortante',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Ataque múltiplo.'},
    {id:'lza',name:'Corte Estático',power:3,type:'Elétrico',target:'enemy',turno:'N',recarga:'L',acao:'N',desc:'Aplica Estática: +5 dano extra em ataques elétricos por 2 turnos.'},
    {id:'dsz',name:'Espírito do Guepardo',power:1,type:'Invocação',target:'all_enemy',turno:'N',recarga:'L',acao:'R',desc:'Ação Rápida.'},
  ]},
  {id:'pt_var_ai',name:'Varok',sub:'Patrulheiro do Combate',suit:'spades',atq:6,def:3,inc:1,pvs:100,isAI:true,skills:[
    {id:'mch',name:'Machado do Poder',power:6,type:'Cortante',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:''},
    {id:'lzp',name:'Soco Brutal',power:3,type:'Energia',target:'enemy',turno:'N',recarga:'L',acao:'N',desc:'Enfraquecido: -50% ATQ por 2 turnos.'},
    {id:'msz',name:'Espírito do Gorila',power:1,type:'Terrestre',target:'all_enemy',turno:'N',recarga:'L',acao:'N',desc:'Atordoamento: 50% de perder o turno por 1 turno.'},
  ]},
  {id:'pt_tha_ai',name:'Thalion',sub:'Patrulheiro da Resiliência',suit:'hearts',atq:2,def:7,inc:1,pvs:120,isAI:true,skills:[
    {id:'lnp',name:'Lança do Poder',power:6,type:'Perfurante',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:''},
    {id:'lzaz',name:'Corte Gélido',power:3,type:'Frio',target:'enemy',turno:'N',recarga:'L',acao:'N',desc:'Resfriamento: 10 dano + -1 Poder por 2 turnos.'},
    {id:'tcz',name:'Espírito do Urso Polar',power:2,type:'Invocação',target:'all_enemy',turno:'N',recarga:'L',acao:'N',desc:'Aumenta poder em +3 por cada debuff ativo no alvo.'},
  ]},
  {id:'voss_ai',name:'Van Carl Voss',sub:'',suit:'clubs',atq:4,def:2,inc:3,pvs:100,isAI:true,skills:[
    {id:'tei',name:'Chicote Paralisante*',power:'2/2/2',type:'Distância',target:'enemy',turno:'N',recarga:'N',acao:'N',desc:'Lento: recarga inimiga vira L por 1 turno.'},
    {id:'sen',name:'Instinto Reflexivo',power:0,type:'Melhoria',target:'self',turno:'N',recarga:'L',acao:'N',desc:'Esquiva próximo ataque único. Se esquivar, ganha rodada extra.'},
    {id:'web',name:'Tiro Decisivo',power:'3/3',type:'Corporal',target:'enemy',turno:'N',recarga:'L',acao:'N',desc:'Dobra dano em inimigos com Lento.'},
  ]},
];

const BOSS_CHARS = [
  // Fase Tier 1 — Floresta Sombria
  {
    id: 'boss_t1', name: 'Rainha Sanguessuga', sub: 'Boss — Floresta Sombria',
    suit: 'neutral', atq: 6, def: 10, inc: -2, pvs: 200, isBoss: true, phase: 1,
    skills: [
      {id: 'b1_drn', name: 'Drenar Sangue', power: 4, type: 'Distância', target: 'enemy', turno: 'N', recarga: 'N', acao: 'N',
        desc: 'Causa sangramento no alvo.'},
      {id: 'b1_enx', name: 'Enxame Sangrento', power: 3, type: 'Corpo a Corpo', target: 'all_enemy', turno: 'L', recharge: true, acao: 'N',
        desc: 'Causa sangramento em todos os inimigos.'}
    ],
    onDeath: 'spawn_crias'
  },
  // Fase Tier 2 — Caverna de Gelo
  {
    id: 'boss_t2', name: 'Yeti Glacial', sub: 'Boss — Caverna de Gelo',
    suit: 'hearts', atq: 10, def: 13, inc: 3, pvs: 380, isBoss: true, phase: 2,
    skills: [
      {id: 'b2_pan', name: 'Pancada Glacial', power: 6, type: 'Corpo a Corpo', target: 'enemy', turno: 'N', recarga: 'N', acao: 'N',
        desc: 'Causa dano no alvo. 50% de chance de congelamento.'},
      {id: 'b2_arr', name: 'Arrastão de Frio', power: 6, type: 'Corpo a Corpo', target: 'all_enemy', turno: 'N', recarga: 'N', acao: 'N',
        desc: 'Causa dano em todos os inimigos e aplica resfriamento.'}
    ]
  },
  // Fase Tier 3 — Templo Arcano
  {
    id: 'boss_t3', name: "Vyr'Thas", sub: 'Anomalia Cósmica — Templo Arcano',
    suit: 'diamonds', atq: 7, def: 8, inc: 7, pvs: 300, isBoss: true, phase: 3,
    skills: [
      {id: 'b3_ana', name: 'Análise Tecnológica', power: 0, type: 'Melhoria', target: 'self', turno: 'N', recarga: 'N', acao: 'Rápida',
        desc: 'Todas as cartas contam como especialidade (♦) por 2 turnos.'},
      {id: 'b3_bom', name: 'Bomba Mágica Radioativa', power: 1, type: 'Mágico', target: 'all_enemy', turno: 'N', recarga: 'N', acao: 'N',
        desc: 'Aplica Queimadura e Radiação em todos os inimigos.'},
      {id: 'b3_cam', name: 'Campo de Proteção', power: 1, type: 'Melhoria', target: 'self', turno: 'N', recarga: 'N', acao: 'N',
        desc: 'Ganha Escudo e Imagem Espelhada.'},
      {id: 'b3_tel', name: 'Ataque Telecinético', power: 10, type: 'Energia', target: 'enemy', turno: 'N', recarga: 'N', acao: 'N',
        desc: 'Catastrófico. Ignora toda defesa.'}
    ]
  }
];

const BOSS_SPAWNS = {
  // Crias da Rainha Sanguessuga — spawnam ao morrer
  boss_t1: {
    count: 3,
    template: {
      id: 'cria_t1', name: 'Cria de Sanguessuga', sub: '',
      atq: 6, def: 5, inc: -2, pvs: 50, isBossSpawn: true,
      skills: [
        {id: 'b1_drn', name: 'Drenar Sangue', power: 4, type: 'Distância', target: 'enemy', turno: 'N', recarga: 'N', acao: 'N',
          desc: 'Causa sangramento no alvo.'}
      ]
    }
  }
};

const MONSTER_CHARS = {
  // ── Tier 1 — Floresta Sombria ──
  tier1: [
    // ── Cria de Sanguessuga (3 variantes) ──
    {
      id: 'cria_t1_a', name: 'Cria de Sanguessuga α', sub: 'Monstro — Floresta Sombria',
      suit: 'neutral', atq: 6, def: 5, inc: -2, pvs: 50, isMonster: true, weight: 1,
      skills: [
        { id: 'b1_drn', name: 'Drenar Sangue', power: 4, type: 'Distância', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Causa sangramento no alvo.' }
      ]
    },
    {
      id: 'cria_t1_b', name: 'Cria de Sanguessuga β', sub: 'Monstro — Floresta Sombria',
      suit: 'neutral', atq: 6, def: 5, inc: -2, pvs: 50, isMonster: true, weight: 1,
      skills: [
        { id: 'b1_drn', name: 'Drenar Sangue', power: 4, type: 'Distância', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Causa sangramento no alvo.' }
      ]
    },
    {
      id: 'cria_t1_c', name: 'Cria de Sanguessuga γ', sub: 'Monstro — Floresta Sombria',
      suit: 'neutral', atq: 6, def: 5, inc: -2, pvs: 50, isMonster: true, weight: 1,
      skills: [
        { id: 'b1_drn', name: 'Drenar Sangue', power: 4, type: 'Distância', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Causa sangramento no alvo.' }
      ]
    },
    // ── Enxame de Vespas (3 variantes) ──
    {
      id: 'vespa_a', name: 'Enxame de Vespas α', sub: 'Monstro — Floresta Sombria',
      suit: 'clubs', atq: 1, def: 3, inc: 6, pvs: 40, isMonster: true, weight: 1,
      skills: [
        { id: 'vespa_fer', name: 'Ferroada Venenosa', power: 2, type: 'Distância', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Causa envenenamento no alvo.' }
      ],
      passive: 'veneno_reacao' // ao sofrer dano, aplica 1 stack de veneno no atacante
    },
    {
      id: 'vespa_b', name: 'Enxame de Vespas β', sub: 'Monstro — Floresta Sombria',
      suit: 'clubs', atq: 1, def: 3, inc: 6, pvs: 40, isMonster: true, weight: 1,
      skills: [
        { id: 'vespa_fer', name: 'Ferroada Venenosa', power: 2, type: 'Distância', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Causa envenenamento no alvo.' }
      ],
      passive: 'veneno_reacao'
    },
    {
      id: 'vespa_c', name: 'Enxame de Vespas γ', sub: 'Monstro — Floresta Sombria',
      suit: 'clubs', atq: 1, def: 3, inc: 6, pvs: 40, isMonster: true, weight: 1,
      skills: [
        { id: 'vespa_fer', name: 'Ferroada Venenosa', power: 2, type: 'Distância', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Causa envenenamento no alvo.' }
      ],
      passive: 'veneno_reacao'
    },
    // ── Elfo do Culto Sangrento (3 variantes) ──
    {
      id: 'elfo_a', name: 'Elfo do Culto Sangrento α', sub: 'Monstro — Floresta Sombria',
      suit: 'spades', atq: 3, def: 2, inc: 1, pvs: 80, isMonster: true, weight: 1,
      skills: [
        { id: 'elfo_pun', name: 'Puntura', power: 3, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Ativa Hemorragia: dispara um tick de Sangramento em todos os inimigos. Não remove o Sangramento.' }
      ],
      passive: 'exposicao_sangue' // início da rodada: 40% de tirar 8 de si e causar 8 no alvo sem defesa
    },
    {
      id: 'elfo_b', name: 'Elfo do Culto Sangrento β', sub: 'Monstro — Floresta Sombria',
      suit: 'spades', atq: 3, def: 2, inc: 1, pvs: 80, isMonster: true, weight: 1,
      skills: [
        { id: 'elfo_pun', name: 'Puntura', power: 3, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Ativa Hemorragia: dispara um tick de Sangramento em todos os inimigos. Não remove o Sangramento.' }
      ],
      passive: 'exposicao_sangue'
    },
    {
      id: 'elfo_c', name: 'Elfo do Culto Sangrento γ', sub: 'Monstro — Floresta Sombria',
      suit: 'spades', atq: 3, def: 2, inc: 1, pvs: 80, isMonster: true, weight: 1,
      skills: [
        { id: 'elfo_pun', name: 'Puntura', power: 3, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Ativa Hemorragia: dispara um tick de Sangramento em todos os inimigos. Não remove o Sangramento.' }
      ],
      passive: 'exposicao_sangue'
    }
  ],

  // ── Tier 2 — Cavernas de Gelo ──
  tier2: [
    // ── Urso Polar das Cavernas (3 variantes) ──
    {
      id: 'urso_t2_a', name: 'Urso Polar das Cavernas α', sub: 'Monstro — Cavernas de Gelo',
      suit: 'hearts', atq: 4, def: 5, inc: 1, pvs: 100, isMonster: true, weight: 1,
      skills: [
        { id: 'urso_pat', name: 'Patada do Urso', power: '3/3', type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Ataque múltiplo. Aplica sangramento no alvo.' },
        { id: 'urso_mor', name: 'Mordida do Urso', power: 5, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Crítico Alto. Aplica hemorragia.' }
      ],
      passive: 'furia_polar'
    },
    {
      id: 'urso_t2_b', name: 'Urso Polar das Cavernas β', sub: 'Monstro — Cavernas de Gelo',
      suit: 'hearts', atq: 4, def: 5, inc: 1, pvs: 100, isMonster: true, weight: 1,
      skills: [
        { id: 'urso_pat', name: 'Patada do Urso', power: '3/3', type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Ataque múltiplo. Aplica sangramento no alvo.' },
        { id: 'urso_mor', name: 'Mordida do Urso', power: 5, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Crítico Alto. Aplica hemorragia.' }
      ],
      passive: 'furia_polar'
    },
    {
      id: 'urso_t2_c', name: 'Urso Polar das Cavernas γ', sub: 'Monstro — Cavernas de Gelo',
      suit: 'hearts', atq: 4, def: 5, inc: 1, pvs: 100, isMonster: true, weight: 1,
      skills: [
        { id: 'urso_pat', name: 'Patada do Urso', power: '3/3', type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Ataque múltiplo. Aplica sangramento no alvo.' },
        { id: 'urso_mor', name: 'Mordida do Urso', power: 5, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Crítico Alto. Aplica hemorragia.' }
      ],
      passive: 'furia_polar'
    }
  ],

  // ── Tier 2 — Cavernas de Gelo ──
  tier2: [
    // ── Urso Polar das Cavernas (3 variantes) ──
    {
      id: 'urso_t2_a', name: 'Urso Polar das Cavernas α', sub: 'Monstro — Cavernas de Gelo',
      suit: 'hearts', atq: 4, def: 5, inc: 1, pvs: 100, isMonster: true, weight: 1,
      skills: [
        { id: 'urso_pat', name: 'Patada do Urso', power: '3/3', type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Ataque múltiplo. Aplica sangramento no alvo.' },
        { id: 'urso_mor', name: 'Mordida do Urso', power: 5, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Crítico Alto. Aplica hemorragia.' }
      ],
      passive: 'furia_polar'
    },
    {
      id: 'urso_t2_b', name: 'Urso Polar das Cavernas β', sub: 'Monstro — Cavernas de Gelo',
      suit: 'hearts', atq: 4, def: 5, inc: 1, pvs: 100, isMonster: true, weight: 1,
      skills: [
        { id: 'urso_pat', name: 'Patada do Urso', power: '3/3', type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Ataque múltiplo. Aplica sangramento no alvo.' },
        { id: 'urso_mor', name: 'Mordida do Urso', power: 5, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Crítico Alto. Aplica hemorragia.' }
      ],
      passive: 'furia_polar'
    },
    {
      id: 'urso_t2_c', name: 'Urso Polar das Cavernas γ', sub: 'Monstro — Cavernas de Gelo',
      suit: 'hearts', atq: 4, def: 5, inc: 1, pvs: 100, isMonster: true, weight: 1,
      skills: [
        { id: 'urso_pat', name: 'Patada do Urso', power: '3/3', type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Ataque múltiplo. Aplica sangramento no alvo.' },
        { id: 'urso_mor', name: 'Mordida do Urso', power: 5, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Crítico Alto. Aplica hemorragia.' }
      ],
      passive: 'furia_polar'
    },
    // ── Nefilin Morto-Vivo Congelado (3 variantes) ──
    {
      id: 'nefilin_t2_a', name: 'Nefilin Morto-Vivo α', sub: 'Monstro — Cavernas de Gelo',
      suit: 'hearts', atq: 6, def: 0, inc: -5, pvs: 150, isMonster: true, weight: 1,
      skills: [
        { id: 'nef_esmag', name: 'Esmagamento Incapacitante', power: 7, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Causa atordoamento e resfriamento no alvo.' }
      ],
      passive: 'nefilin_suit'
    },
    {
      id: 'nefilin_t2_b', name: 'Nefilin Morto-Vivo β', sub: 'Monstro — Cavernas de Gelo',
      suit: 'hearts', atq: 6, def: 0, inc: -5, pvs: 150, isMonster: true, weight: 1,
      skills: [
        { id: 'nef_esmag', name: 'Esmagamento Incapacitante', power: 7, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Causa atordoamento e resfriamento no alvo.' }
      ],
      passive: 'nefilin_suit'
    },
    {
      id: 'nefilin_t2_c', name: 'Nefilin Morto-Vivo γ', sub: 'Monstro — Cavernas de Gelo',
      suit: 'hearts', atq: 6, def: 0, inc: -5, pvs: 150, isMonster: true, weight: 1,
      skills: [
        { id: 'nef_esmag', name: 'Esmagamento Incapacitante', power: 7, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Causa atordoamento e resfriamento no alvo.' }
      ],
      passive: 'nefilin_suit'
    },
    // ── Troll das Terras Nevadas (3 variantes) ──
    {
      id: 'troll_t2_a', name: 'Troll das Terras Nevadas α', sub: 'Monstro — Cavernas de Gelo',
      suit: 'spades', atq: 7, def: 7, inc: 0, pvs: 74, isMonster: true, weight: 1,
      skills: [
        { id: 'troll_esp', name: 'Espancamento Congelante', power: 7, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Aplica congelamento no alvo (50% de chance).' }
      ],
      passive: 'troll_regen'
    },
    {
      id: 'troll_t2_b', name: 'Troll das Terras Nevadas β', sub: 'Monstro — Cavernas de Gelo',
      suit: 'spades', atq: 7, def: 7, inc: 0, pvs: 74, isMonster: true, weight: 1,
      skills: [
        { id: 'troll_esp', name: 'Espancamento Congelante', power: 7, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Aplica congelamento no alvo (50% de chance).' }
      ],
      passive: 'troll_regen'
    },
    {
      id: 'troll_t2_c', name: 'Troll das Terras Nevadas γ', sub: 'Monstro — Cavernas de Gelo',
      suit: 'spades', atq: 7, def: 7, inc: 0, pvs: 74, isMonster: true, weight: 1,
      skills: [
        { id: 'troll_esp', name: 'Espancamento Congelante', power: 7, type: 'Corpo a Corpo', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N', desc: 'Aplica congelamento no alvo (50% de chance).' }
      ],
      passive: 'troll_regen'
    }
  ]
};

function _rollMonsterTeam(tier) {
  var pool = (MONSTER_CHARS['tier' + tier] || MONSTER_CHARS.tier1).slice();
  if (pool.length === 0) return [];

  // Conta quantas vezes cada base já foi usada neste sorteio
  var usedCount = {};
  var selected = [];

  for (var i = 0; i < 3; i++) {
    // Embaralha pool a cada pick
    pool.sort(function() { return Math.random() - 0.5; });
    for (var j = 0; j < pool.length; j++) {
      var base = pool[j].id.replace(/_[abc]$/, '');
      var count = usedCount[base] || 0;
      if (count < 3) { // máx 3 variantes do mesmo tipo
        usedCount[base] = count + 1;
        // Usa a variante correta (a=0, b=1, c=2)
        var variantSuffix = ['_a', '_b', '_c'][count];
        var variantId = base + variantSuffix;
        selected.push(variantId);
        break;
      }
    }
  }
  return selected;
}

const MINI_BOSS_CHARS = {
  tier1: [
    {
      id: 'xama_t1', name: 'Xamã do Culto Sangrento', sub: 'Mini Boss — Floresta Sombria',
      suit: 'diamonds', atq: 1, def: 1, inc: 5, pvs: 120, isMiniBoss: true, phase: 1,
      skills: [
        { id: 'xama_tra', name: 'Transfusão do Flagelo', power: 0, type: 'Mágico', target: 'enemy',
          turno: 'N', recarga: 'N', acao: 'N',
          desc: 'Aplica sangramento no alvo. Para cada Elfo do Culto aliado vivo, remove 20% do HP do elfo e adiciona +1 stack de sangramento no mesmo alvo.' },
        { id: 'xama_rev', name: 'Reviver Morto', power: 0, type: 'Melhoria', target: 'self',
          turno: 'N', recarga: 'N', acao: 'N',
          desc: 'Ganha buff: se não há aliados vivos, Pacto de Sangue ganha +40% de chance. Dura 2 rodadas.' }
      ],
      passive: 'pacto_sangue'
    }
  ],
  tier2: [
    {
      id: 'parede_t2', name: 'Parede de Carne Congelada', sub: 'Mini Boss — Caverna de Gelo',
      suit: 'neutral', atq: 0, def: 0, inc: 0, pvs: 238, isMiniBoss: true, phase: 2,
      skills: [
        { id: 'parede_limpa', name: 'Purificação Gelada', power: 0, type: 'Melhoria', target: 'ally',
          turno: 'N', recarga: 'N', acao: 'N',
          desc: 'Remove todos os debuffs de si mesmo ou de um aliado.' }
      ],
      passive: 'parede_restricao'
    }
  ]
};

function _findMiniBoss(tier) {
  var pool = MINI_BOSS_CHARS['tier' + tier] || MINI_BOSS_CHARS.tier1;
  return pool[Math.floor(Math.random() * pool.length)] || null;
}

function _capaceteIaDiscard(ch, owner) {
  var hand = G[owner].hand;
  if (!hand || hand.length === 0) return false;
  // Prioridade 1: Ás
  var idx = hand.findIndex(function(c) { return !isSpecial(c) && c.val === 'A'; });
  // Prioridade 2: Rei
  if (idx < 0) idx = hand.findIndex(function(c) { return !isSpecial(c) && c.val === 'K'; });
  // Prioridade 3: Dama — apenas se não tiver efeito de remoção de status ativo
  if (idx < 0) {
    var hasRemoval = ch.statuses.some(function(s) { return s.id === 'mirror' || s.id === 'shield'; });
    if (!hasRemoval) idx = hand.findIndex(function(c) { return !isSpecial(c) && c.val === 'Q'; });
  }
  // Prioridade 4: cartas ≤ 3
  if (idx < 0) idx = hand.findIndex(function(c) { return !isSpecial(c) && c.nv <= 3; });

  if (idx < 0) return false; // nenhuma carta prioritária — não ativa

  var discarded = hand[idx];
  addLog('🌌 [IA] Capacete da Visão Cósmica: ' + ch.name + ' descarta [' + discarded.val + '] e compra 2!', 'sys');
  floatStatus(ch, '🌌 Visão Cósmica!', '#9060d0');
  discard(owner, idx);
  draw(owner, 2, '🌌 Visão Cósmica');
  render();
  return true;
}

function aiPickValueCard(hand) {
  // Pick the strongest value card (not special) for attacks
  const valueIdxs = hand.map((_,i)=>i).filter(i=>!isEffectCard(hand[i]));
  if(!valueIdxs.length) return null;
  // Prefer highest nv for damage
  return valueIdxs.reduce((best,i) => hand[i].nv > hand[best].nv ? i : best, valueIdxs[0]);
}

function aiPickWeakestCard(hand) {
  // Pick weakest value card for non-critical defense
  const valueIdxs = hand.map((_,i)=>i).filter(i=>!isEffectCard(hand[i]));
  if(!valueIdxs.length) return null;
  return valueIdxs.reduce((best,i) => hand[i].nv < hand[best].nv ? i : best, valueIdxs[0]);
}

function aiShouldDefend(hand, estDmg, ch) {
  // Returns {useCard: bool, useJack: bool, cardIdx: int|null}
  const hpPct = ch.hp / ch.maxHp;
  const jackIdx = hand.findIndex(c=>c.val==='J');
  const valueIdx = aiPickWeakestCard(hand);

  // Yeti Glacial: sempre usa Valete se tiver (ativa Ódio Congelante)
  if (ch.id === 'boss_t2' && jackIdx >= 0) {
    return {useCard:true, useJack:true, cardIdx:jackIdx};
  }

  // Yeti com Elmo do Sopro Gélido: usa carta fraca (≤4) pra ativar Resfriamento
  if (ch.id === 'boss_t2' && window._survBossArtefato && window._survBossArtefato.id === 'art_elmo_sopro_gelido') {
    var weakIdx = null;
    hand.forEach(function(c, i) {
      if (!isSpecial(c) && c.nv <= 4) {
        if (weakIdx === null || c.nv < hand[weakIdx].nv) weakIdx = i;
      }
    });
    if (weakIdx !== null) {
      return {useCard:true, useJack:false, cardIdx:weakIdx};
    }
  }

  // Use Jack (full dodge) if attack would be lethal or HP < 25%
  if(jackIdx>=0 && (estDmg >= ch.hp || hpPct < 0.25)) {
    return {useCard:true, useJack:true, cardIdx:jackIdx};
  }
  // Use value card if damage > 40% of remaining HP
  if(valueIdx!==null && estDmg > ch.hp * 0.4) {
    return {useCard:true, useJack:false, cardIdx:valueIdx};
  }
  // No card — save hand
  return {useCard:false, useJack:false, cardIdx:null};
}

function aiTrySpecialFirst(ch, p) {
  // Returns true if AI used a special card and ended turn early
  const hand = p.hand;
  if(!hand.length) return false;

  const hpPct = ch.hp / ch.maxHp;
  // Verifica se há pelo menos 1 carta de valor na mão (não especial)
  const hasValueCard = hand.some(c=>!isSpecial(c));

  // ★ Coringa — use if HP < 40% and no extra turn granted yet
  // Só usa se tiver carta de valor para atacar depois
  const jokerIdx = hand.findIndex(c=>c.val==='★');
  if(jokerIdx>=0 && hpPct < 0.4 && !ch.extraTurnUsed && hasValueCard) {
    discard('p2', jokerIdx);
    if(grantExtraTurn(ch, 'Coringa IA')) {
      addLog('🃏 IA: '+ch.name+' usa Coringa para ganhar rodada extra!','info');
      floatStatus(ch, '★ Rodada Extra!', 'var(--gold)');
      render(); return false; // don't end turn — will attack now
    }
  }

  // 🃏 Ás — draw if hand <= 2 cards (keep hand healthy)
  // Só usa se tiver carta de valor para atacar depois
  const aceIdx = hand.findIndex(c=>c.val==='A');
  if(aceIdx>=0 && hand.length<=2 && hasValueCard) {
    discard('p2', aceIdx);
    draw('p2', 1, '🃏 Ás');
    addLog('🃏 IA: '+ch.name+' usa Ás — compra uma carta!','info');
    floatStatus(ch, '🃏 +1 carta', 'var(--gold)');
    render(); return false; // quick action, continue turn
  }

  // 👑 Rei — use before attacking if skill power > 3
  // (handled inline before attack, not here)

  // Q Dama — use if any ally has debuffs
  // Só usa se tiver carta de valor para atacar depois
  const queenIdx = hand.findIndex(c=>c.val==='Q');
  if(queenIdx>=0 && hasValueCard) {
    const debufs = ['burn','bleed','rad','static','frozen','stun','weak','exposed','chill','encantado'];
    const sickAlly = p.chars.find(ally=>ally.alive && ally.statuses.some(s=>debufs.includes(s.id)));
    if(sickAlly) {
      discard('p2', queenIdx);
      const removed = sickAlly.statuses.filter(s=>debufs.includes(s.id)).length;
      sickAlly.statuses = sickAlly.statuses.filter(s=>!debufs.includes(s.id));
      sickAlly.curAtq = sickAlly.atq; sickAlly.curDef = sickAlly.def;
      addLog('👸 IA: Dama usada — '+removed+' efeito(s) removido(s) de '+sickAlly.name+'!','heal');
      floatStatus(sickAlly, '👸 Purificada!', 'var(--hearts)');
      render(); return false; // quick, continue
    }
  }

  return false;
}

function ryuCalcSuitScore(candidate, enemies) {
  if(candidate==='neutral') return 0;
  let score=0;
  for(const e of enemies) {
    if(!e.alive) continue;
    const es=e.suit||'neutral';
    if(es==='neutral') continue;
    if(SUIT_BEATS_RYU[candidate]===es) score+=2;
    if(SUIT_BEATS_RYU[es]===candidate) score-=1;
  }
  return score;
}

function ryuIADedicacaoTotal(ch, enemies) {
  const candidates=['spades','hearts','clubs','diamonds','neutral'];
  let best='neutral', bestScore=0;
  for(const c of candidates) {
    const s=ryuCalcSuitScore(c,enemies);
    if(s>bestScore){best=c;bestScore=s;}
  }
  let chosen=best;
  if(best!=='neutral') {
    let penalty=0;
    for(const e of enemies){
      if(!e.alive) continue;
      const es=e.suit||'neutral';
      if(es!=='neutral'&&SUIT_BEATS_RYU[es]===best) penalty++;
    }
    if(penalty>0){
      const chance=Math.min(1,bestScore/(bestScore+penalty));
      if(Math.random()>chance) chosen='neutral';
    }
  }
  ch._ryuSuit=chosen; ch.suit=chosen; ch._ryuSuitTimer=2;
  const suitSym={spades:'♠',hearts:'♥',clubs:'♣',diamonds:'♦',neutral:'○'};
  const suitDesc={spades:'♠→♥ Dano dobrado',hearts:'♥→♣ Stats ×2',clubs:'♣→♦ Furtivo',diamonds:'♦→♠ Turno extra',neutral:'Neutro (safe)'};
  addLog(`🥋 [IA Kuro] Dedicação Total: ${suitSym[chosen]} ${chosen.toUpperCase()} (${suitDesc[chosen]}) por 2t.`,'info');
  floatStatus(ch,`🥋 ${suitSym[chosen]} ${chosen.toUpperCase()}`,'#ffcc00');
  // Envia naipe ao servidor PvP
  if (_pvpSocket && _pvpSocket.readyState === WebSocket.OPEN) {
    pvpSend('kuro_suit', { suit: chosen });
  }
}

function ryuAbrirDedicacaoTotal(ch) {
  // Se já tem timer ativo, não abre
  if((ch._ryuSuitTimer||0) > 0) return;
  const suits=[
    {id:'spades',  sym:'♠', label:'Espadas', desc:'♠→♥ Dano dobrado',  cor:'#ffffff'},
    {id:'hearts',  sym:'♥', label:'Copas',   desc:'♥→♣ Stats ×2',      cor:'#ff4444'},
    {id:'clubs',   sym:'♣', label:'Paus',    desc:'♣→♦ Furtivo',       cor:'#66ff66'},
    {id:'diamonds',sym:'♦', label:'Ouros',   desc:'♦→♠ Turno extra',   cor:'#ffdd44'},
    {id:'neutral', sym:'○', label:'Neutro',  desc:'Sem vantagem/desvantagem', cor:'#aaaaaa'},
  ];
  const panelBody = document.getElementById('panel-body');
  const panelTitle = document.getElementById('panel-title');
  panelTitle.textContent = '🥋 Dedicação Total — Escolha um Naipe (2 turnos)';
  panelBody.innerHTML = suits.map(s=>`
    <button onclick="ryuEscolherNaipe('${s.id}')" style="
      background:#1a1a2e;border:2px solid ${s.cor};color:${s.cor};
      padding:10px 14px;margin:4px;border-radius:8px;cursor:pointer;
      font-size:14px;min-width:120px;text-align:left;">
      <b>${s.sym} ${s.label}</b><br>
      <span style="font-size:10px;color:#aaa">${s.desc}</span>
    </button>`).join('');
  openPanel();
}

function marcoIAWeaponRoll(ch, p) {
  // draw global (+1 carta por passar turno) é feito pelo caller — aqui só a rolagem
  const r = Math.random();
  const prev = ch._weapon || 'pistola';
  if(r < 0.25) {
    ch._weapon = 'pistola';
    addLog('🔫 [IA Marco] Pistola — mantida.','info');
    floatAccum(ch,'🔫 Pistola');
  } else if(r < 0.5) {
    ch._weapon = 'metralhadora';
    addLog('💥 [IA Marco] Metralhadora equipada!','info');
    floatAccum(ch,'💥 Metralhadora');
  } else if(r < 0.75) {
    ch._weapon = 'shotgun';
    addLog('💥 [IA Marco] Shotgun equipada!','info');
    floatAccum(ch,'💥 Shotgun');
  } else {
    ch._weapon = prev; // mantém arma
    draw('p2', 1, '🎬 Resgate');        // +1 carta EXTRA (além do draw global do pass)
    addLog('🃏 [IA Marco] Prisioneiro resgatado — carta extra! (arma: '+prev+')','info');
    floatAccum(ch,'🃏 +1 '+prev);
  }
  marcoUpdateWeaponSlot(ch);
  floatStatus(ch, ch.skills[1].name.replace('Disparo — ','🔫 '), '#c0a040');
}

function enemyAI(a) {
  const ch=a.ch;
  const enemies=G.p1.chars.filter(c=>c.alive);
  if(!enemies.length){nextActor();return;}
  const p=G.p2;

  // ══ REGRAS DA IA — verificação de estado do turno ══

  // Regra 1: já usou Ação Rápida nessa rodada
  if(ch.quickAction) {
    judgeCheck('passive_start', { who: ch.name, passive: 'IA Regra: Ação Rápida já usada', charObj: ch, extra: false, noExtra: false });
    ch._iaBlockQuick = true;
    ch._iaBlockExtraTurn = true;
    judgeCheck('passive_result', { who: ch.name, passive: 'IA Regra: Ação Rápida já usada', result: 'Skills rápidas viram normais. Rodada Extra bloqueada.' });
  }

  // Regra 2: já ganhou Rodada Extra nessa rodada
  if(ch.extraTurnUsed) {
    judgeCheck('passive_start', { who: ch.name, passive: 'IA Regra: Rodada Extra já usada', charObj: ch, extra: false, noExtra: false });
    ch._iaBlockExtraTurn = true;
    ch._iaBlockQuick = true;
    judgeCheck('passive_result', { who: ch.name, passive: 'IA Regra: Rodada Extra já usada', result: 'Nova Rodada Extra bloqueada. Ações Rápidas viram normais.' });
  }

  // ══ RECUPERAÇÃO AUTOMÁTICA — ação pendente não resolvida detectada ══
  if(ch._iaActionPending) {
    judgeCheck('passive_start', { who: ch.name, passive: 'IA Recuperação: ação pendente detectada', charObj: ch, extra: false, noExtra: false });
    ch._iaActionPending = false;
    judgeCheck('passive_result', { who: ch.name, passive: 'IA Recuperação: ação pendente detectada', result: 'Forçando continuação do jogo.' });
    nextActor(); render(); return;
  }

  // === STEP 1: Try proactive special card use ===
  // Pula no _forceSk (2ª ação após Ação Rápida)
  if(!a._forceSk) aiTrySpecialFirst(ch, p);

  // === STEP 2: Pick skill — respect cooldowns, recharge, turno tags ===
  const dskills=ch.skills.filter(s=>{
    const t=s.target;
    if(!(t==='enemy'||t==='all_enemy'||t==='all_ally'||t==='self')) return false;
    // Permite skills Encanto com power 0 (ex: Sou Seu Amigo)
    if(getPow(s)<=0 && t!=='all_ally' && t!=='self' && s.type!=='Encanto') return false;
    if(ch.cooldowns[s.id]>0) return false;
    if(s.turno==='L' && ch.firstTurn) return false;
    return true;
  });

  // _forceSk: skill forçada pela 2ª ação pós-Ação Rápida → usa executeAction
  if(a._forceSk) {
    const _fsk = a._forceSk;
    const _fcard = aiPickValueCard(p.hand);
    if(_fcard === null) { addLog(ch.name+' — sem carta para 2ª ação.','info'); nextActor(); render(); return; }
    const _fc = p.hand[_fcard]; discard('p2', _fcard);
    var _fTarget = (_fsk.target==='enemy') ? enemies[Math.floor(Math.random()*enemies.length)] : null;
    executeAction(ch, _fsk, _fc, _fTarget, 'p2');
    return;
  }

  // ── Mini Boss IA ──
  if (ch.isMiniBoss) {
    var _mbAllies = G.p2.chars.filter(function(c) { return c.alive && c.id !== ch.id; });
    var _mbMortos = G.p2.chars.filter(function(c) { return !c.alive && c.id !== ch.id; });

    // ── Xamã: se 2+ aliados mortos, só usa Reviver Morto ──
    if (ch.id === 'xama_t1') {
      var _xamaSk = null;
      var _xamaTarget = enemies.reduce(function(a, b) { return a.hp < b.hp ? a : b; });

      if (_mbMortos.length >= 2) {
        // Só usa Reviver Morto até passiva funcionar
        _xamaSk = ch.skills.find(function(s) { return s.id === 'xama_rev'; });
        if (_xamaSk && p.hand.length > 0) {
          var _xci = aiPickWeakestCard(p.hand);
          if (_xci !== null) {
            var _xc = p.hand[_xci]; discard('p2', _xci);
            executeAction(ch, _xamaSk, _xc, ch, 'p2');
            return;
          }
        }
      } else {
        // Usa Transfusão se tiver alvo e elfos aliados, senão IA genérica
        var _traSkill = ch.skills.find(function(s) { return s.id === 'xama_tra'; });
        if (_traSkill && p.hand.length > 0) {
          var _tci = aiPickValueCard(p.hand);
          if (_tci !== null) {
            var _tc = p.hand[_tci]; discard('p2', _tci);
            executeAction(ch, _traSkill, _tc, _xamaTarget, 'p2');
            return;
          }
        }
      }
      addLog(ch.name + ' passa a rodada.', 'info');
      draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
    }

    // ── Parede de Carne Congelada: Purificação Gelada ou passa ──
    if (ch.id === 'parede_t2') {
      var _paredeAllTeam = p.chars.filter(function(c) { return c.alive; });
      // Só usa Dama — nunca Valete, nunca carta de defesa
      var _paredeQueenIdx = null;
      p.hand.forEach(function(c, i) {
        if (c.val === 'Q') _paredeQueenIdx = i;
      });
      if (_paredeQueenIdx !== null) {
        // Alvo: aliado com mais debuffs, ou si mesmo
        var _paredeCleanTarget = ch;
        var _maxDebuffs = ch.statuses.filter(function(s) { return ['burn','bleed','rad','static','frozen','stun','weak','exposed','chill','encantado','amaciado','melt','slow'].includes(s.id); }).length;
        _paredeAllTeam.forEach(function(ally) {
          var _dCount = ally.statuses.filter(function(s) { return ['burn','bleed','rad','static','frozen','stun','weak','exposed','chill','encantado','amaciado','melt','slow'].includes(s.id); }).length;
          if (_dCount > _maxDebuffs) { _maxDebuffs = _dCount; _paredeCleanTarget = ally; }
        });
        var _parSk = ch.skills.find(function(s) { return s.id === 'parede_limpa'; });
        if (_parSk) {
          var _parCard = p.hand[_paredeQueenIdx]; discard('p2', _paredeQueenIdx);
          executeAction(ch, _parSk, _parCard, _paredeCleanTarget, 'p2');
          return;
        }
      }
      // Sem Dama: passa turno e compra 1
      addLog(ch.name + ' aguarda imóvel.', 'info');
      draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
    }

    // IA genérica para outros mini bosses futuros
    var mbSk = ch.skills.find(function(s) { return s.target === 'enemy'; }) || ch.skills[0];
    var mbTarget = enemies.reduce(function(a, b) { return a.hp < b.hp ? a : b; });
    if (mbSk && p.hand.length > 0) {
      var mbci = aiPickValueCard(p.hand);
      if (mbci !== null) {
        var mbc = p.hand[mbci]; discard('p2', mbci);
        executeAction(ch, mbSk, mbc, mbTarget, 'p2');
        return;
      }
    }
    addLog(ch.name + ' passa a rodada.', 'info');
    draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
  }

  // ── Monstro IA ──
  if (ch.isMonster) {
    var monTarget = enemies.reduce(function(a, b) { return a.hp < b.hp ? a : b; });
    var monSk = ch.skills.find(function(s) { return s.target === 'enemy'; }) || ch.skills[0];

    // Elfo: prioriza alvo de naipe ♥
    if (ch.passive === 'exposicao_sangue') {
      var heartsTarget = enemies.find(function(e) { return e.suit === 'hearts' && e.alive; });
      if (heartsTarget) monTarget = heartsTarget;
    }

    // ── Urso Polar: combo Patada→Mordida de 2 rodadas no mesmo alvo ──
    if (ch.passive === 'furia_polar') {
      var ursoPatada  = ch.skills.find(function(s) { return s.id === 'urso_pat'; });
      var ursoMordida = ch.skills.find(function(s) { return s.id === 'urso_mor'; });

      // Rodada 1 do combo: escolhe alvo aleatório e usa Patada
      if (!ch._ursoComboStep || ch._ursoComboStep === 1) {
        // Escolhe alvo aleatório entre os vivos
        var _ursoTargets = enemies.filter(function(e) { return e.alive; });
        var _ursoAlvo = _ursoTargets[Math.floor(Math.random() * _ursoTargets.length)];
        ch._ursoComboTarget = _ursoAlvo.id;
        ch._ursoComboStep = 2; // próxima rodada usa Mordida
        if (ursoPatada && p.hand.length > 0) {
          var _upci = aiPickValueCard(p.hand);
          if (_upci !== null) {
            var _upc = p.hand[_upci]; discard('p2', _upci);
            addLog('🐻 Urso IA: Patada em ' + _ursoAlvo.name + ' — combo iniciado!', 'sys');
            executeAction(ch, ursoPatada, _upc, _ursoAlvo, 'p2');
            return;
          }
        }
      }
      // Rodada 2 do combo: usa Mordida no mesmo alvo
      else if (ch._ursoComboStep === 2) {
        var _ursoAlvoMordida = enemies.find(function(e) { return e.id === ch._ursoComboTarget && e.alive; });
        // Se o alvo morreu, escolhe outro aleatório
        if (!_ursoAlvoMordida) {
          var _ursoVivos = enemies.filter(function(e) { return e.alive; });
          _ursoAlvoMordida = _ursoVivos[Math.floor(Math.random() * _ursoVivos.length)];
        }
        ch._ursoComboStep = 1; // próxima rodada reinicia o combo
        ch._ursoComboTarget = null;
        if (ursoMordida && p.hand.length > 0) {
          var _umci = aiPickValueCard(p.hand);
          if (_umci !== null) {
            var _umc = p.hand[_umci]; discard('p2', _umci);
            addLog('🐻 Urso IA: Mordida em ' + _ursoAlvoMordida.name + ' — combo finalizado!', 'sys');
            executeAction(ch, ursoMordida, _umc, _ursoAlvoMordida, 'p2');
            return;
          }
        }
      }
      addLog(ch.name + ' passa a rodada.', 'info');
      draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
    }

    // ── Nefilin Morto-Vivo: ataca uma rodada, passa outra — usa carta mais forte + Rei como buff ──
    if (ch.passive === 'nefilin_suit') {
      if (!ch._nefilinComboStep) ch._nefilinComboStep = 'attack';

      if (ch._nefilinComboStep === 'pass') {
        // Rodada de passar — gera recursos
        ch._nefilinComboStep = 'attack';
        addLog('💀 Nefilin IA: lento demais — passa a rodada.', 'sys');
        draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
      }

      // Rodada de atacar
      ch._nefilinComboStep = 'pass';
      var nefSk = ch.skills.find(function(s) { return s.id === 'nef_esmag'; });
      var nefTarget = enemies.reduce(function(a, b) { return a.hp < b.hp ? a : b; });

      if (nefSk && p.hand.length > 0) {
        // Tenta usar Rei como buff antes de atacar
        var nefKingIdx = p.hand.findIndex(function(c) { return c.val === 'K'; });
        var nefHasValueBesidesKing = p.hand.some(function(c, i) { return i !== nefKingIdx && !isSpecial(c); });
        if (nefKingIdx >= 0 && nefHasValueBesidesKing) {
          discard('p2', nefKingIdx);
          ch._kingBonus = 13;
          addLog('👑 Nefilin IA: usa Rei — próximo Esmagamento +13 poder!', 'info');
          floatStatus(ch, '👑 +POD!', 'var(--gold)');
        }
        // Usa carta de maior valor
        var nefci = aiPickValueCard(p.hand);
        if (nefci !== null) {
          var nefc = p.hand[nefci]; discard('p2', nefci);
          addLog('💀 Nefilin IA: Esmagamento Incapacitante em ' + nefTarget.name + '!', 'sys');
          executeAction(ch, nefSk, nefc, nefTarget, 'p2');
          return;
        }
      }
      addLog(ch.name + ' passa a rodada.', 'info');
      draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
    }
    // ── Troll das Terras Nevadas: ataca alvo aleatório com Espancamento Congelante ──
    if (ch.passive === 'troll_regen') {
      var trollSk = ch.skills.find(function(s) { return s.id === 'troll_esp'; });
      var _trollVivos = enemies.filter(function(e) { return e.alive; });
      var trollTarget = _trollVivos[Math.floor(Math.random() * _trollVivos.length)];
      if (trollSk && trollTarget && p.hand.length > 0) {
        var trollci = aiPickValueCard(p.hand);
        if (trollci !== null) {
          var trollc = p.hand[trollci]; discard('p2', trollci);
          addLog('🧌 Troll IA: Espancamento Congelante em ' + trollTarget.name + '!', 'sys');
          executeAction(ch, trollSk, trollc, trollTarget, 'p2');
          return;
        }
      }
      addLog(ch.name + ' passa a rodada.', 'info');
      draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
    }

    if (monSk && p.hand.length > 0) {
      var monci = aiPickValueCard(p.hand);
      if (monci !== null) {
        var monc = p.hand[monci]; discard('p2', monci);
        executeAction(ch, monSk, monc, monTarget, 'p2');
        return;
      }
    }
    addLog(ch.name + ' passa a rodada.', 'info');
    draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
  }

  // ── Boss / Cria IA ──
  if (ch.isBoss || ch.isBossSpawn) {
    // Alvo com menos HP (desempate aleatório pra crias não focarem sempre o mesmo)
    var bossMinHp = enemies.reduce(function(a, b) { return a.hp < b.hp ? a : b; }).hp;
    var bossLowest = enemies.filter(function(c) { return c.hp === bossMinHp; });
    var bossTarget = bossLowest[Math.floor(Math.random() * bossLowest.length)];

    // ══ YETI GLACIAL (boss_t2) — IA específica ══
    if (ch.id === 'boss_t2') {
      var yetiBossArea = dskills.find(function(s) { return s.target === 'all_enemy'; });
      var yetiBossSingle = dskills.find(function(s) { return s.target === 'enemy'; });
      var clubsAlive = enemies.filter(function(c) { return c.suit === 'clubs' && c.alive; });
      var yetiSk = null;

      if (clubsAlive.length >= 2) {
        // 2+ ♣ vivos → Arrastão de Frio (área)
        yetiSk = yetiBossArea || yetiBossSingle;
        addLog('❄️ Yeti IA: 2+ ♣ vivos — usa Arrastão de Frio!', 'sys');
      } else if (clubsAlive.length === 1) {
        // 1 ♣ vivo → Pancada Glacial no ♣
        yetiSk = yetiBossSingle || yetiBossArea;
        bossTarget = clubsAlive[0];
        addLog('❄️ Yeti IA: 1 ♣ vivo — foca Pancada Glacial em ' + bossTarget.name + '!', 'sys');
      } else {
        // 0 ♣ → alterna skills a cada rodada
        if (ch._yetiAlternate === undefined) ch._yetiAlternate = false;
        if (ch._yetiAlternate) {
          yetiSk = yetiBossSingle || yetiBossArea;
        } else {
          yetiSk = yetiBossArea || yetiBossSingle;
        }
        ch._yetiAlternate = !ch._yetiAlternate;
        addLog('❄️ Yeti IA: 0 ♣ — alterna para ' + (yetiSk ? yetiSk.name : '?') + '!', 'sys');
      }

      if (yetiSk && p.hand.length > 0) {
        var yci = aiPickValueCard(p.hand);
        if (yci !== null) {
          var yc = p.hand[yci]; discard('p2', yci);
          var yTarget = yetiSk.target === 'enemy' ? bossTarget : null;
          executeAction(ch, yetiSk, yc, yTarget, 'p2');
          return;
        }
      }
      addLog(ch.name + ' passa a rodada.', 'info');
      draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
    }

    // ══ VYR'THAS — ANOMALIA CÓSMICA (boss_t3) — IA específica ══
    if (ch.id === 'boss_t3') {
      var b3Ana = ch.skills.find(function(s) { return s.id === 'b3_ana'; });
      var b3Bom = ch.skills.find(function(s) { return s.id === 'b3_bom'; });
      var b3Cam = ch.skills.find(function(s) { return s.id === 'b3_cam'; });
      var b3Tel = ch.skills.find(function(s) { return s.id === 'b3_tel'; });
      var b3HpPct = ch.hp / ch.maxHp;
      if (ch._b3BombCount === undefined) ch._b3BombCount = 0;
      var b3Sk = null;

      // Prioridade 1: Análise Tecnológica (ação rápida) — se ≤1 carta ♦ e não tem buff ativo
      var b3DiamondCards = p.hand.filter(function(c) { return c.suit === 'diamonds' && !isSpecial(c); }).length;
      var b3HasAnalise = ch.statuses.find(function(s) { return s.id === 'analise_tech'; });
      if (b3Ana && b3DiamondCards <= 1 && !b3HasAnalise && p.hand.length > 0) {
        // Usa carta qualquer (efeito puro, power 0)
        var b3ci = aiPickValueCard(p.hand);
        if (b3ci !== null) {
          var b3c = p.hand[b3ci]; discard('p2', b3ci);
          addLog('🔬 Vyr\'Thas IA: Análise Tecnológica — todas cartas viram ♦!', 'sys');
          addSt(ch, {id:'analise_tech', icon:'🔬', label:'Análise Tecnológica', turns:2});
          floatStatus(ch, '🔬 Análise!', '#9060d0');
          // Ação Rápida: continua pra escolher próxima ação
        }
      }

      // Prioridade 2: Campo de Proteção — só abaixo de 30% HP
      if (b3HpPct < 0.30 && b3Cam) {
        // Usa carta ≤5 se tiver
        var b3WeakIdx = null;
        p.hand.forEach(function(c, i) {
          if (!isSpecial(c) && c.nv <= 5) {
            if (b3WeakIdx === null || c.nv < p.hand[b3WeakIdx].nv) b3WeakIdx = i;
          }
        });
        if (b3WeakIdx !== null) {
          var b3cw = p.hand[b3WeakIdx]; discard('p2', b3WeakIdx);
          addLog('🛡 Vyr\'Thas IA: Campo de Proteção — Escudo + Espelhada!', 'sys');
          // Aplica Escudo (valor = ataque total do boss)
          var b3ShieldVal = ch.curAtq + 1 + b3cw.nv;
          addSt(ch, {id:'shield', icon:'🛡️', label:'Escudo (' + b3ShieldVal + ')', turns:2, val:b3ShieldVal});
          addSt(ch, {id:'mirror', icon:'🪞', label:'Imagem Espelhada', turns:1});
          floatStatus(ch, '🛡️ Escudo +' + b3ShieldVal + '!', '#80c0ff');
          floatStatus(ch, '🪞 Espelhada!', '#a0c0ff');
          addLog('🛡 Campo de Proteção: Escudo ' + b3ShieldVal + ' + Imagem Espelhada!', 'heal');
          render();
          nextActor(); render();
          return;
        }
      }

      // Prioridade 3: Bomba Mágica Radioativa — a cada 2 rodadas se 2+ inimigos
      if (enemies.length >= 2) {
        ch._b3BombCount++;
        if (ch._b3BombCount >= 2 && b3Bom) {
          ch._b3BombCount = 0;
          b3Sk = b3Bom;
          addLog('☢️ Vyr\'Thas IA: Bomba Mágica Radioativa!', 'sys');
        }
      }

      // Prioridade 4: Ataque Telecinético (default single)
      if (!b3Sk && b3Tel) {
        b3Sk = b3Tel;
        addLog('🔮 Vyr\'Thas IA: Ataque Telecinético em ' + bossTarget.name + '!', 'sys');
      }

      // Fallback: qualquer skill disponível
      if (!b3Sk) b3Sk = b3Bom || b3Tel;

      if (b3Sk && p.hand.length > 0) {
        var b3ai = aiPickValueCard(p.hand);
        if (b3ai !== null) {
          var b3ac = p.hand[b3ai]; discard('p2', b3ai);
          var b3Target = b3Sk.target === 'enemy' ? bossTarget : null;
          executeAction(ch, b3Sk, b3ac, b3Target, 'p2');
          return;
        }
      }
      addLog(ch.name + ' passa a rodada.', 'info');
      draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
    }
    if (ch.id === 'boss_t1' && window._survBossArtefato && window._survBossArtefato.id === 'art_manto_laceracao') {
      if (ch._mantoPassCount === undefined) ch._mantoPassCount = 0;
      // Checa se só tem cartas baixas (2-4) na mão
      var hasHighCard = p.hand.some(function(c) { return !isSpecial(c) && c.nv > 4; });
      var shouldPass = false;

      if (!hasHighCard && p.hand.length > 0) {
        // Só cartas baixas: sempre passa (guarda pra defesa)
        shouldPass = true;
        addLog('🩸 Rainha IA (Manto): só cartas baixas — passa pra ativar Manto!', 'sys');
      } else {
        // A cada 2 rodadas, passa pra ativar Manto
        ch._mantoPassCount++;
        if (ch._mantoPassCount >= 2) {
          shouldPass = true;
          ch._mantoPassCount = 0;
          addLog('🩸 Rainha IA (Manto): passou a rodada pra ativar Manto!', 'sys');
        }
      }

      if (shouldPass) {
        addLog(ch.name + ' passa a rodada.', 'info');
        draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
      }
      // Se não passou, segue pra IA genérica de boss abaixo
    }

    // Boss: rotação de skills baseada no HP
    var bossSk = null;
    if (ch.isBoss) {
      var bossArea = dskills.find(function(s) { return s.target === 'all_enemy'; });
      var bossSingle = dskills.find(function(s) { return s.target === 'enemy'; });
      var hpPct = ch.hp / ch.maxHp;
      if (ch._bossAreaCount === undefined) ch._bossAreaCount = 0;
      if (ch._bossLastSkill === undefined) ch._bossLastSkill = null;

      if (hpPct >= 0.5) {
        // ≥50% HP: alterna 1:1 (single → area → single → area)
        if (ch._bossLastSkill === 'area') {
          bossSk = bossSingle || bossArea;
        } else {
          bossSk = bossArea || bossSingle;
        }
      } else {
        // <50% HP: 2 área pra cada 1 single
        if (ch._bossAreaCount >= 2) {
          bossSk = bossSingle || bossArea;
        } else {
          bossSk = bossArea || bossSingle;
        }
      }
      if (bossSk && bossSk.target === 'all_enemy') {
        ch._bossLastSkill = 'area';
        ch._bossAreaCount = (ch._bossAreaCount || 0) + 1;
      } else {
        ch._bossLastSkill = 'single';
        ch._bossAreaCount = 0;
      }
    } else {
      // Cria: só tem Drenar Sangue
      bossSk = dskills.find(function(s) { return s.target === 'enemy'; });
    }
    if (bossSk && p.hand.length > 0) {
      var bci = aiPickValueCard(p.hand);
      if (bci !== null) {
        var bc = p.hand[bci]; discard('p2', bci);
        var bTarget = bossSk.target === 'enemy' ? bossTarget : null;
        executeAction(ch, bossSk, bc, bTarget, 'p2');
        return;
      }
    }
    // Sem skill ou carta: passa
    addLog(ch.name + ' passa a rodada.', 'info');
    draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
  }

  let atkSkills = dskills.filter(s=>s.target==='enemy'||s.target==='all_enemy');
  // Sam: lógica de cargas inteligente
  if(ch.id==='sam_ai') {
    const charges = ch._charge||0;
    if(charges >= 5) {
      // Carga máxima: usa Feixe obrigatoriamente (vai virar all_enemy)
      const beams = atkSkills.filter(s=>s.id==='fpl'||s.id==='ffr');
      if(beams.length) atkSkills = beams; // só Feixe, ignora Bomba
    } else if(charges < 2) {
      // Sem cargas: remove Feixes — vai usar Bomba ou passar (acumular)
      atkSkills = atkSkills.filter(s=>s.id!=='fpl'&&s.id!=='ffr');
    } else {
      // 2–4 cargas: 50% de chance de ainda preferir carregar mais
      if(Math.random() < 0.5) atkSkills = atkSkills.filter(s=>s.id!=='fpl'&&s.id!=='ffr');
    }
  }
  const useSkills = atkSkills.length ? atkSkills : dskills.filter(s => {
    // Se Sam ficou sem atkSkills (quer carregar), não cair nos Feixes pelo fallback
    if(ch.id==='sam_ai' && (ch._charge||0) < 5 && (s.id==='fpl'||s.id==='ffr')) return false;
    return true;
  });

  // Kane IA: 30% de chance de passar intencionalmente se tem pistola (busca arma melhor)
  if(ch.id==='kane_ai' && (ch._weapon||'pistola')==='pistola' && useSkills.length && p.hand.length && Math.random()<0.3) {
    addLog('[IA Kane] Passa intencionalmente — buscando arma melhor via Resgate dos Prisioneiros.','info');
    
    draw('p2', 1, '+1 carta');               // draw global do passar turno
    marcoIAWeaponRoll(ch, p); // rolagem de arma (pode comprar +1 extra)
    nextActor(); render(); return;
  }

  if(!useSkills.length||!p.hand.length){
    addLog(ch.name+' passa a rodada.','info');
     // passar turno desbloqueia turno:L apenas no turno natural
    if(ch.id==='grim_ai'){
      judgeCheck('passive_start', { who: ch.name, passive: 'Grande Gênio (skip IA)', charObj: ch, extra: false, noExtra: false });
      draw('p2', 1, '🔧 Grande Gênio');addLog('🔧 Grimbol: carta extra!','info');floatPassiveDraw(ch,1,'🔧');
    }
    // Kane IA: Resgate dos Prisioneiros
    if(ch.id==='kane_ai') { marcoIAWeaponRoll(ch, p); }
    // Kuro Isamu IA: Concentração Marcial +2 ao passar (além do +1 automático do tickRoundPassives)
    if(ch.id==='kuro_ai') {
      judgeCheck('passive_start', { who: ch.name, passive: 'Concentração Marcial (skip +2 IA)', charObj: ch, extra: false, noExtra: false });
      const _satsuiIASkip = ch._satsui||0;
      ch._satsui=Math.min(10,_satsuiIASkip+2);
      addLog('🔍 JUIZ (Passiva skip IA): '+ch.name+' Concentração Marcial: '+_satsuiIASkip+' → '+ch._satsui+'/10 (+2 skip)', 'sys');
      addLog(`🔥 [IA Kuro] Concentração Marcial: ${ch._satsui}/10 (+2 ao passar).`,'info');
      floatAccum(ch,`🔥${ch._satsui}/10`);
      refreshIcons(ch);
    }
    // Sam IA: Super Velocidade + Carregar ao passar turno
    if(ch.id==='sam_ai') {
      judgeCheck('passive_start', { who: ch.name, passive: 'Super Velocidade (skip IA)', charObj: ch, extra: false, noExtra: false });
      ch._charge = Math.min(5, (ch._charge||0) + 1);
      const sdmg = (ch._charge||0) + 2;
      const svTargets = G.p1.chars.filter(e=>e.alive);
      addLog('🔍 JUIZ (Passiva skip IA): '+ch.name+' Super Velocidade Lv'+ch._charge+' — dano esperado: '+sdmg+' em '+svTargets.length+' alvo(s)', 'sys');
      animSamusZap(ch);
      floatSeq(svTargets, svTarget => {
        dmgChar(svTarget, sdmg);
        floatDmg(svTarget, sdmg);
        floatStatus(svTarget, '⚡ Vel.!', '#00dfff');
      });
      if(svTargets.length) addLog('⚡ [IA] Super Velocidade Lv'+ch._charge+': '+sdmg+' dano verdadeiro em TODOS! (ignora DEF)','dmg');
      addLog('🔋 [IA] Sam: '+ch._charge+'/5 cargas.','info');
      floatStatus(ch, '⚡'+ch._charge+'/5', ch._charge>=5?'#00ffff':'#80d0ff');
      refreshIcons(ch);
      render();
    }
    draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
  }

  // Kuro Isamu IA: Dedicação Total — escolhe naipe no início do turno
  if(ch.id==='kuro_ai') {
    if((ch._ryuSuitTimer||0) > 0) {
      ch._ryuSuitTimer--;
    } else {
      ryuIADedicacaoTotal(ch, enemies);
    }
  }

  // Kuro Isamu IA: prioridade de skills — Sanren Geri > Seiken Tsuki×2 > Kohouken(≥5) > Seiken Tsuki > Kohouken
  if(ch.id==='kuro_ai') {
    const avail = dskills.filter(s=>(ch.cooldowns[s.id]||0)===0);
    const sho=avail.find(s=>s.id==='sho');
    const tat=avail.find(s=>s.id==='tat');
    const had=avail.find(s=>s.id==='had');
    const target=enemies[0];
    const marcado=target&&target.statuses.find(s=>s.id==='marcado');
    const cargas=ch._satsui||0;

    let ryuSk=null;
    if(marcado&&tat)       { ryuSk=tat; addLog('[IA Kuro] Sanren Geri — explora Marca!','info'); }
    else if(marcado&&sho)  { ryuSk=sho; addLog('[IA Kuro] Seiken Tsuki — ×2 + renova','info'); }
    else if(cargas>=5&&had){ ryuSk=had; addLog(`[IA Kuro] Kohouken — ${cargas} cargas!`,'info'); }
    else if(sho)           { ryuSk=sho; addLog('[IA Kuro] Seiken Tsuki — aplica Marca','info'); }
    else if(had)           { ryuSk=had; addLog(`[IA Kuro] Kohouken — ${cargas} cargas`,'info'); }

    if(!ryuSk || !p.hand.length) {
      // Passa — acumula Concentração Marcial +2
      judgeCheck('passive_start', { who: ch.name, passive: 'Concentração Marcial (skip intencional IA)', charObj: ch, extra: false, noExtra: false });
      const _satsuiRyuAntes = ch._satsui||0;
      ch._satsui=Math.min(10,_satsuiRyuAntes+2);
      addLog('🔍 JUIZ (Passiva skip IA): '+ch.name+' Concentração Marcial: '+_satsuiRyuAntes+' → '+ch._satsui+'/10 (+2 skip intencional)', 'sys');
      addLog(`🔥 [IA Kuro] Passa — Concentração Marcial: ${ch._satsui}/10.`,'info');
      floatAccum(ch,`🔥${ch._satsui}/10`);
      if(ch.id==='grim_ai'){draw('p2', 1, '🔧 Grande Gênio');}
       draw('p2', 1, '+1 carta'); nextActor(); render(); return;
    }

    // Injeta bônus do Seiken Tsuki (×2 se marcado)
    if(ryuSk.id==='sho' && marcado) {
      ryuSk={...ryuSk, power:ryuSk.power*2, _ryuShoExplode:true};
      addLog('🎯 [IA Kuro] Seiken Tsuki ×2 + renova Marca!','info');
    }
    // Injeta bônus do Kohouken (Concentração Marcial)
    if(ryuSk.id==='had') {
      const bonus=cargas*2;
      ryuSk={...ryuSk, power:5+bonus, _ryuHadCargas:cargas};
      addLog(`🔥 [IA Kuro] Kohouken POW ${5+bonus} (${cargas} cargas × 2 = +${bonus}).`,'info');
    }

    const ci=p.hand.findIndex(c=>!isSpecial(c));
    if(ci===-1){  draw('p2', 1, '+1 carta'); nextActor(); render(); return; }
    const card=p.hand.splice(ci,1)[0];
    p.discard.push(card);
    addLog(`[IA Kuro] Carta: ${card.val}${SUITS[card.suit]?SUITS[card.suit].sym:''}`,'info');

    playSkillAnimation(ch, ryuSk, [target], null).then(() => {
      if(typeof ryuSk.power==='string') {
        resolveMultiHit(ch, ryuSk, card, [], target, null, 'p2');
      } else {
        resolveAttack(ch, ryuSk, card, target, null, 'p2');
      }
      draw('p2', 1, '+1 carta'); nextActor(); render();
    });
    return;
  }

  // Weighted random — prefer higher power skills
  let sk=(()=>{
    // Gorath IA: lógica especial de prioridade
    if(ch.id==='gora_ai') {
      const ago = dskills.find(s=>s.id==='ago');
      const tas = dskills.find(s=>s.id==='tas');
      const atc = dskills.find(s=>s.id==='atc');
      const handSize = p.hand.length;
      // Agora é Sério: ativa com 60% de chance se não ativo
      if(ago && !ch._agoraSerio && Math.random() < 0.6) return ago;
      // Combo SKAAAAARRRRR!!! + ATACARRRR: ≥5 cartas sempre comba, <5 cartas 30%
      if(tas && atc) {
        const doCombo = handSize >= 5 ? true : Math.random() < 0.3;
        if(doCombo) { ch._kataCombo = true; return tas; } // ATACARRRR será usado após como Ação Rápida
      }
      if(tas && Math.random() < 0.6) return tas;
      if(atc) return atc;
      if(ago) return ago;
    }
    // Nyxar IA: Nimb → Máscara → Azar ou Sorte → Dados
    if(ch.id==='nyxa_ai') {
      const dad = dskills.find(s=>s.id==='dad');
      const mas = dskills.find(s=>s.id==='mas');
      const azs = dskills.find(s=>s.id==='azs');
      const hasMasc = ch.statuses.find(s=>s.id==='masc_feliz'||s.id==='masc_triste');
      // Aplica Nimb na skill escolhida (torna Rápida)
      const nimbActive = ch._nimb || false;
      let sk = null;
      if(mas && !hasMasc && Math.random()<0.4) sk=mas;
      else if(azs && Math.random()<0.35) sk=azs;
      else if(dad) sk=dad;
      if(sk) {
        if(nimbActive){ sk={...sk,acao:'Rápida',_nimbRapida:true}; ch._nimb=false; addLog(`🪙 Nimb IA: ${sk.name} age como Ação Rápida!`,'info'); }
        return sk;
      }
    }
    // Tyren IA: 2 perfis sorteados no início da partida
    if(ch.id==='tyre_ai') {
      const aes = dskills.find(s=>s.id==='aes');
      const aec = dskills.find(s=>s.id==='aec');
      const rou = dskills.find(s=>s.id==='rou');
      const hpPct = ch.hp / ch.maxHp;
      // Sortear perfil apenas 1x por partida
      if(ch._linkProfile === undefined) ch._linkProfile = Math.random()<0.5 ? 'tank' : 'offtank';
      const profile = ch._linkProfile;
      if(profile === 'tank') {
        // Tank: prioriza Roupas Encantadas + acúmulo, ataca só com acúmulo pronto
        if(rou && !ch._outfit) return rou;
        if(rou && Math.random()<0.3) return rou; // troca roupa eventualmente
        if(aes && (ch._linkAccum||0) >= 2) return aes; // ataca quando acúmulo pronto
        // Passa para acumular
        draw('p2', 1, '+1 carta'); addLog('🗡️ [IA Tyren Tank] Passa — acumulando Avanço Espada.','info'); nextActor(); render(); return;
      } else {
        // Off-Tank: Roupa Vermelha se HP>60%, Verde se ≤59%, foca em Avanço Escudo
        if(rou) {
          const targetOutfit = hpPct > 0.6 ? 'vermelha' : 'verde';
          const currentOutfit = ch._outfit;
          if(currentOutfit !== targetOutfit) return rou;
        }
        if(aec) return aec;
        if(aes) return aes;
      }
    }
    // Zarae IA: combo Espírito do Guepardo (AR) + Atagas baseado em cartas na mão
    if(ch.id==='pt_zar_ai') {
      const atg = dskills.find(s=>s.id==='atg');
      const lza = dskills.find(s=>s.id==='lza');
      const dsz = dskills.find(s=>s.id==='dsz');
      const handSize = p.hand.length;
      const doCombo = dsz && atg && (handSize >= 5 ? true : Math.random()<0.3);
      if(doCombo) { ch._ramCombo = true; return dsz; }
      if(lza && Math.random()<0.4) return lza;
      if(atg) return atg;
    }
    // Elowen IA: buffer de recurso — passa/buff por padrão, ataca só com mão cheia + inimigo quase morto
    if(ch.id==='pt_elo_ai') {
      const arc2 = dskills.find(s=>s.id==='arc2');
      const lzr  = dskills.find(s=>s.id==='lzr');
      const ptz  = dskills.find(s=>s.id==='ptz');
      const handSize = p.hand.length;
      const enemies_dying = enemies.some(e=>e.hp/e.maxHp<=0.1);
      // Espírito do Grifo: buff/escudo — sempre prioritário
      if(ptz) return ptz;
      // Ataca apenas se mão cheia E inimigo quase morto
      if(handSize >= 10 && enemies_dying) {
        if(lzr) return lzr;
        if(arc2) return arc2;
      }
      // Padrão: passa para comprar carta
      draw('p2', 1, '+1 carta'); addLog('🌸 [IA Rosa] Passa — acumulando recursos.','info'); nextActor(); render(); return;
    }
    // Grimbol IA: Grande Gênio — passa turno para acumular cartas, Elixir prioriza HP aliados
    if(ch.id==='grim_ai') {
      const arc = dskills.find(s=>s.id==='arc');
      const bac = dskills.find(s=>s.id==='bac');
      const eli = dskills.find(s=>s.id==='eli');
      const handSize = p.hand.length;
      const allies = (ch.owner==='p1'?G.p1:G.p2).chars.filter(a=>a.alive);
      const allyBelow50 = allies.some(a=>a.hp/a.maxHp<=0.5);
      const allyBelow90 = allies.some(a=>a.hp/a.maxHp<=0.9);
      // Elixir da Cura: prioridade alta se aliado ≤50% HP
      if(eli && allyBelow50 && Math.random()<0.8) return eli;
      if(eli && allyBelow90 && Math.random()<0.3) return eli;
      // Grande Gênio: passa turno (compra carta extra) em vez de atacar
      const lowCards = handSize < 4;
      const veryLowCards = handSize < 2; // valor numérico <6
      const manyCards = handSize >= 7;
      if(veryLowCards && Math.random()<0.9) { draw('p2', 1, '🔧 Grande Gênio'); nextActor(); render(); return; }
      if(lowCards && Math.random()<0.8) { draw('p2', 1, '🔧 Grande Gênio'); nextActor(); render(); return; }
      if(manyCards && Math.random()<0.2) { draw('p2', 1, '🔧 Grande Gênio'); nextActor(); render(); return; }
      // Atacar: Bomba Ácida > Arcabuz
      if(bac && Math.random()<0.5) return bac;
      if(arc) return arc;
      if(bac) return bac;
    }
    // Zephyr IA: usa Sou Seu Amigo com frequência (Ação Rápida), Prestidigitação no início, Façada como ataque
    if(ch.id==='zeph_ai') {
      const fac = dskills.find(s=>s.id==='fac');
      const seu = dskills.find(s=>s.id==='seu');
      const pre = dskills.find(s=>s.id==='pre');
      const allies = (ch.owner==='p1'?G.p1:G.p2).chars.filter(a=>a.alive&&a!==ch);
      const allyLowHp = allies.some(a=>a.hp/a.maxHp<0.5);
      // Prestidigitação: usa no começo ou quando aliados baixos
      if(pre && (allyLowHp || Math.random()<0.15)) return pre;
      // Sou Seu Amigo: usa com 60% de chance se disponível (Ação Rápida — encadeia)
      if(seu && Math.random()<0.6) return seu;
      if(fac) return fac;
    }
    if(ch.id==='lori_ai') {
      const uni = dskills.find(s=>s.id==='uni');
      const lin = dskills.find(s=>s.id==='lin');
      const fli = dskills.find(s=>s.id==='fli');
      const target = enemies[0];
      const temExposto = target && target.statuses.find(s=>s.id==='exposed');
      const temEnfraqu = target && target.statuses.find(s=>s.id==='weak');
      // Se ambos os debuffs estão no alvo → Investida (dano 4x)
      if(uni && temExposto && temEnfraqu) { addLog('🦄 [IA Lorien] INVESTIDA! Ambos debuffs ativos → dano ×4!','info'); return uni; }
      // Se um debuff ativo → pode investir com 50% de chance ou aplicar o outro
      if(uni && (temExposto || temEnfraqu) && Math.random() < 0.5) { addLog('🦄 [IA Lorien] Investe com 1 debuff!','info'); return uni; }
      // Prefere aplicar Enfraquecido se ainda não tem
      if(fli && !temEnfraqu) return fli;
      // Prefere aplicar Exposto se ainda não tem
      if(lin && !temExposto) return lin;
      // Fallback: Investida ou qualquer skill
      if(uni) return uni;
      if(lin) return lin;
      if(fli) return fli;
    }
    // Kane IA: lógica de prioridade com 20% base + situações necessárias
    if(ch.id==='kane_ai') {
      const wpn  = dskills.find(s=>s.id==='wpn');
      const esf  = dskills.find(s=>s.id==='esf');
      const gran = dskills.find(s=>s.id==='gran');
      const numEnemies = enemies.length;
      const highDefEnemy = enemies.some(e=>e.curDef>=6);

      // GRANADA: 20% base OU múltiplos inimigos (≥2) — área compensa
      if(gran){
        const granChance = numEnemies>=2 ? 0.6 : 0.2;
        if(Math.random()<granChance){ addLog('💣 [IA Marco] Granada! ('+numEnemies+' alvos)','info'); return gran; }
      }
      // FACADA: 20% base OU inimigo com DEF alta (≥6) — Ignora Armadura vale
      if(esf){
        const esfChance = highDefEnemy ? 0.5 : 0.2;
        if(Math.random()<esfChance){ addLog('🔪 [IA Kane] Facada! (DEF alta: '+highDefEnemy+')','info'); return esf; }
      }
      // Arma principal
      if(wpn)  return wpn;
      if(gran) return gran;
      if(esf)  return esf;
    }
    // Comandante Vance IA: prioriza Descarga Elétrica > Punho Incendiário > Golpe Tático
    if(ch.id==='vanc_ai') {
      const ele = dskills.find(s=>s.id==='ele');
      const foc = dskills.find(s=>s.id==='foc');
      const soc = dskills.find(s=>s.id==='soc');
      if(ele && Math.random()<0.4) return ele;
      if(foc && Math.random()<0.5) return foc;
      if(soc) return soc;
      if(foc) return foc;
      if(ele) return ele;
    }
    // Van Carl Voss IA
    if(ch.id==='voss_ai') {
      const tei = dskills.find(s=>s.id==='tei');
      const web = dskills.find(s=>s.id==='web');
      const sen = dskills.find(s=>s.id==='sen');
      const tgt = enemies[0];
      const temLento = tgt && tgt.statuses.find(s=>s.id==='slow');
      // Instinto Reflexivo: sempre usa quando disponível (Ação Rápida gratuita)
      if(sen) return sen;
      if(web && temLento) return web;
      if(tei) return tei;
      if(web) return web;
    }
    if(ch.id==='pt_aer_ai') {
      const eli2 = dskills.find(s=>s.id==='eli2');
      const sab  = dskills.find(s=>s.id==='sab');
      const tiz  = dskills.find(s=>s.id==='tiz');
      const tgt  = enemies[0];
      const temExposto = tgt && tgt.statuses.find(s=>s.id==='exposed');
      // Espírito do Tigre: prioridade máxima — Sangramento em todos
      if(tiz) return tiz;
      if(eli2 && temExposto) return eli2;
      if(sab && Math.random()<0.3) return sab;
      if(eli2) return eli2;
    }
    // pt_cae IA: prioriza Espírito da Salamandra — Derreter Armadura em todos
    if(ch.id==='pt_cae_ai') {
      const trz  = dskills.find(s=>s.id==='trz');
      const lzv  = dskills.find(s=>s.id==='lzv');
      const esp  = dskills.find(s=>s.id==='esp');
      if(trz) return trz;
      if(lzv) return lzv;
      if(esp) return esp;
    }
    // pt_var IA: prioriza Espírito do Gorila — Atordoamento em todos
    if(ch.id==='pt_var_ai') {
      const msz  = dskills.find(s=>s.id==='msz');
      const lzp  = dskills.find(s=>s.id==='lzp');
      const mch  = dskills.find(s=>s.id==='mch');
      if(msz) return msz;
      if(lzp) return lzp;
      if(mch) return mch;
    }
    // pt_tha IA: prioriza Espírito do Urso Polar — +3 poder por debuff
    if(ch.id==='pt_tha_ai') {
      const tcz  = dskills.find(s=>s.id==='tcz');
      const lzaz = dskills.find(s=>s.id==='lzaz');
      const lnp  = dskills.find(s=>s.id==='lnp');
      // Urso Polar é mais forte se inimigo tem debuffs
      const tgt = enemies[0];
      const debuffs = tgt ? tgt.statuses.filter(s=>['burn','bleed','rad','static','chill','frozen','stun','exposed','weak','amaciado','melt','slow'].includes(s.id)).length : 0;
      if(tcz) return tcz;
      if(lzaz) return lzaz;
      if(lnp) return lnp;
    }
    const pool=useSkills;
    const weights=pool.map(s=>Math.max(1,getPow(s)));
    const total=weights.reduce((a,b)=>a+b,0);
    let r=Math.random()*total;
    for(let i=0;i<pool.length;i++){r-=weights[i];if(r<=0)return pool[i];}
    return pool[pool.length-1];
  })();

  // === STEP 3: 👑 Rei before high-power skill ===
  if(isAttackSkill(sk) && getPow(sk) >= 3) {
    const kingIdx = p.hand.findIndex(c=>c.val==='K');
    // Só usa Rei se ainda existir pelo menos 1 carta de valor na mão ALÉM do Rei
    const hasValueCardBesidesKing = p.hand.some((c,i)=>i!==kingIdx && !isSpecial(c));
    if(kingIdx>=0 && hasValueCardBesidesKing && Math.random()<0.6) {
      discard('p2', kingIdx);
      ch._kingBonus = 13; // King nv
      addLog('👑 IA: '+ch.name+' usa Rei — próxima habilidade +13 poder!','info');
      floatStatus(ch, '👑 +POD!', 'var(--gold)');
    }
  }

  // Lento: se personagem tem Lento e skill tem recarga N → cooldown vira L (2 turnos)
  if(ch.statuses.find(s=>s.id==='slow') && sk && sk.recarga==='N') {
    judgeCheck('passive_start', { who: ch.name, passive: 'Lento (recarga N→L IA)', charObj: ch, extra: false, noExtra: false });
    ch.cooldowns[sk.id] = 2;
    addLog('🐢 Lento: '+sk.name+' de '+ch.name+' ganhou recarga L!','info');
    judgeCheck('passive_result', { who: ch.name, passive: 'Lento (recarga N→L IA)', result: sk.name+' cooldown: N → L (2t)' });
  }

  // firstTurn só é consumido por ações normais — Ação Rápida não desbloqueia turno:L
  // (movido para DEPOIS do STEP 3.5 para o filtro do sk2pool funcionar corretamente)

  // === STEP 3.5: Se Ação Rápida — executeAction + encadeia 2ª ação ===
  var _step35Handled = false;
  if(sk.acao==='Rápida') {
    _step35Handled = true;
    if(sk.recarga==='L') { ch.cooldowns[sk.id]=2; }
    else if(sk._nimbRapida) { /* Nimb transformou — sem cooldown extra */ }
    else { ch.cooldowns[sk.id]=1; }
    addLog('⚡ '+ch.name+' usa '+sk.name+' (Ação Rápida)!','info');
    floatStatus(ch,'⚡ Rápida!','var(--gold)');

    // Gorath Agora é Sério: potencializa SKAAAAARRRRR
    var rapSk = sk;
    if(ch.id==='gora_ai' && sk.id==='tas' && ch._agoraSerio && (ch._agoraSerioPow||0)>0) {
      rapSk = Object.assign({}, sk, { power: sk.power + ch._agoraSerioPow });
      addLog('⚔️ SKAAAAARRRRR!!! potencializado pelo Agora é Sério! Poder: '+rapSk.power,'info');
    }

    // Escolhe alvo pra 1ª ação
    var rapTarget = (rapSk.target==='enemy') ? enemies[Math.floor(Math.random()*enemies.length)] : null;
    // Escolhe carta pra 1ª ação (se for ataque)
    var rapCardIdx = (rapSk.target==='enemy' || rapSk.target==='all_enemy') ? aiPickValueCard(p.hand) : null;
    var rapCard = (rapCardIdx !== null) ? p.hand[rapCardIdx] : null;
    if(rapCard) discard('p2', rapCardIdx);

    // executeAction resolve a 1ª ação — quando terminar, encadeia 2ª
    executeAction(ch, rapSk, rapCard, rapTarget, 'p2', {
      isQuick: true,
      onComplete: function() {
        // Frozen/Stun após Ação Rápida
        var frozenAQ = checkFrozenStun(ch, null, 'quick');
        if(frozenAQ === 'lost_after') { nextActor(); render(); return; }
        // Seleciona 2ª skill
        var sk2 = ch.skills.filter(function(s) {
          if(s.acao==='Rápida') return false;
          if((ch.cooldowns[s.id]||0)>0) return false;
          if(s.turno==='L' && ch.firstTurn) return false;
          return true;
        });
        if(sk2.length > 0) {
          var nextSk = sk2.sort(function(a2,b2){return getPow(b2)-getPow(a2);})[0];
          // Verifica carta ANTES de anunciar
          var card2Idx = aiPickValueCard(p.hand);
          var card2 = (card2Idx !== null) ? p.hand[card2Idx] : null;
          if(!card2 && (nextSk.target==='enemy' || nextSk.target==='all_enemy')) {
            addLog('⚡ '+ch.name+' — sem carta para 2ª ação.','info');
            nextActor(); render();
            return;
          }
          if(card2) discard('p2', card2Idx);
          addLog('⚡ '+ch.name+' usa '+nextSk.name+' como 2ª ação!','info');
          if(nextSk.recarga==='L') { ch.cooldowns[nextSk.id]=2; addLog('⏳ '+nextSk.name+' entra em recarga.','info'); }
          var target2 = (nextSk.target==='enemy') ? G.p1.chars.filter(function(c){return c.alive;})[Math.floor(Math.random()*G.p1.chars.filter(function(c){return c.alive;}).length)] : null;
          // executeAction pra 2ª ação — sem onComplete, volta pro fluxo normal
          setTimeout(function() {
            executeAction(ch, nextSk, card2, target2, 'p2');
          }, 800);
        } else {
          addLog('⚡ '+ch.name+' — sem 2ª ação disponível.','info');
          nextActor(); render();
        }
      }
    });
    return;
  } else {
    // Ação normal: aplicar cooldown e consumir firstTurn
    if(sk.recarga==='L') {
      ch.cooldowns[sk.id]=2;
      addLog('⏳ '+sk.name+' da IA entra em recarga (2 rodadas).','info');
    }
    
  }

  // === STEP 4: Self-target skills — apply effect directly, no card needed ===
  if(sk.target==='self') {
    addLog(ch.name+' usa '+sk.name+'.','info');
    
    if(sk.recarga==='L') { ch.cooldowns[sk.id]=2; addLog('⏳ '+sk.name+' entra em recarga.','info'); }
    // Gorath: Agora é Sério
    if(ch.id==='gora_ai' && sk.id==='ago') {
      ch._agoraSerio = true;
      ch._agoraSerioPow = 0;
      ch._agoraSerioCooldown = 2;
      addSt(ch,{id:'agora_serio',icon:'⚔️',label:'Agora é Sério: +4 ATACARRRR/golpe',turns:999});
      addLog('⚔️ [IA] AGORA É SÉRIO! +4 em ATACARRRR a cada golpe recebido!','info');
      floatStatus(ch,'⚔️ SÉRIO!','#ff4040');
    }
    // Dee IA: Máscara de Faces — escolhe Feliz ou Triste aleatoriamente
    if(ch.id==='nyxa_ai' && sk.id==='mas') {
      ch.statuses = ch.statuses.filter(s=>s.id!=='masc_feliz'&&s.id!=='masc_triste');
      const feliz = Math.random()<0.5;
      if(feliz) {
        addSt(ch,{id:'masc_feliz',icon:'😊',label:'Máscara Feliz: contra-ataca aliados atacados',turns:2});
        addLog('😊 [IA] Nyxar: Máscara Feliz!','info');
        floatStatus(ch,'😊 Feliz!','var(--gold)');
      } else {
        addSt(ch,{id:'masc_triste',icon:'😢',label:'Máscara Triste: ataque conjunto em inimigos atacados',turns:2});
        addLog('😢 [IA] Nyxar: Máscara Triste!','info');
        floatStatus(ch,'😢 Triste!','#8080ff');
      }
    }
    // Tyren IA: Roupas Encantadas — chama selfSkillEffect para ciclar outfit corretamente
    if(ch.id==='tyre_ai' && sk.id==='rou') {
      selfSkillEffect(ch, sk, {suit:'neutral',val:'—',nv:0});
    }
    render();
    _nextAfterDelay(1200); render(); return;
  }

  // Dee IA: Azar ou Sorte — resolve globalmente antes do fluxo normal
  if(ch.id==='nyxa_ai' && sk.id==='azs') {
    const cardIdx2 = aiPickValueCard(p.hand);
    if(cardIdx2 !== null) {
      const azCard = p.hand[cardIdx2]; discard('p2', cardIdx2);
      const _azNv = (!isSpecial(azCard) && azCard.suit===ch.suit && azCard.suit!=='joker' && ch.suit!=='neutral') ? azCard.nv*2 : azCard.nv;
      const pow=getPow(sk), base=ch.curAtq+pow+_azNv;
      addLog(`🎲 [IA] ${ch.name} usa Azar ou Sorte! Base: ${base}`,'info');
      floatStatus(ch,'🎲 Azar ou Sorte!','var(--gold)');
      const all=[...G.p1.chars,...G.p2.chars].filter(c=>c.alive);
      floatSeq(all, t => {
        if(Math.random()<0.5){
          const final=Math.max(0,base-t.curDef);
          addLog(`🎲 ${t.name}: FALHA → ${final} dano`,'dmg');
          floatStatus(t,'💀 Dano!','#ff4040');
          dmgChar(t,final);
        } else {
          const prev=t.hp;
          t.hp=Math.min(t.maxHp,t.hp+base);
          addLog(`🎲 ${t.name}: SUCESSO → +${t.hp-prev} cura`,'heal');
          floatHeal(t,t.hp-prev);
        }
      }).then(() => {
        if(!G.over) { _nextAfterDelay(1200); render(); }
      });
    } else {
      if(!G.over) { _nextAfterDelay(1200); render(); }
    }
    return;
  }

  // Gorath IA: injeta bônus de Agora é Sério em ATACARRRR antes de resolver
  if(ch.id==='gora_ai' && sk.id==='atc' && ch._agoraSerio && (ch._agoraSerioPow||0)>0) {
    const bonus = ch._agoraSerioPow;
    sk = {...sk, power: sk.power + bonus};
    addLog('⚔️ [IA] ATACARRRR potencializado! +'+bonus+' (Agora é Sério). Poder total: '+sk.power,'info');
    floatStatus(ch,'⚔️ +'+bonus+'!','#ff4040');
  }

  // === STEP 5: Pick ONLY value cards (never J/Q/K/A/★ in attacks) ===
  const ciRaw = isAttackSkill(sk) ? aiPickValueCard(p.hand) : (() => {
    const vi = p.hand.map((_,i)=>i).filter(i=>!isEffectCard(p.hand[i]));
    return vi.length ? vi[Math.floor(Math.random()*vi.length)] : null;
  })();
  // If no value card available, AI passes — NEVER uses special cards as attack fodder
  if(ciRaw === null) {
    addLog(ch.name+' não tem cartas de valor — passa a rodada.','info');
    
    // Kane IA: Resgate dos Prisioneiros
    if(ch.id==='kane_ai') { marcoIAWeaponRoll(ch, p); }
    // Sam IA: Super Velocidade + Carregar ao passar turno
    if(ch.id==='sam_ai') {
      ch._charge = Math.min(5, (ch._charge||0) + 1);
      const sdmg = (ch._charge||0) + 2;
      const svTargets = G.p1.chars.filter(e=>e.alive);
      floatSeq(svTargets, svTarget => {
        dmgChar(svTarget, sdmg);
        floatDmg(svTarget, sdmg);
        floatStatus(svTarget, '⚡ Vel.!', '#00dfff');
      });
      if(svTargets.length) addLog('⚡ [IA] Super Velocidade Lv'+ch._charge+': '+sdmg+' dano verdadeiro em TODOS!','dmg');
      addLog('🔋 [IA] Sam: '+ch._charge+'/5 cargas.','info');
      floatStatus(ch, '⚡'+ch._charge+'/5', ch._charge>=5?'#00ffff':'#80d0ff');
      render();
    }
    draw('p2', 1, '+1 carta'); _nextAfterDelay(1200); render(); return;
  }
  const ci = ciRaw;
  const card=p.hand[ci]; discard('p2',ci);

  // Sam AI: inject charges into Feixe BEFORE the area/single branch
  if(ch.id==='sam_ai' && (sk.id==='fpl'||sk.id==='ffr')) {
    const charges = ch._charge||0;
    const ignoreArmor = sk.id==='fpl';
    sk = {...sk, power:charges, _samusCharge:charges, _ignoreArmor:ignoreArmor};
    if(charges>=5) {
      sk = {...sk, target:'all_enemy'};
      addLog('⚡ [IA] Sam CARGA MÁXIMA! Feixe atinge TODOS!','info');
      floatStatus(ch,'⚡ MÁXIMO!','#00ffff');
    } else {
      addLog('⚡ [IA] Sam dispara Feixe com '+charges+' cargas (poder '+charges+')!','info');
    }
  }

  // === STEP 5b: all_ally skills — cura/buff em aliados (Elixir, Prestidigitação, etc.) ===
  if(sk.target==='all_ally') {
    addLog(ch.name+' usa '+sk.name+' em todos os aliados!','info');
    const aiAllies = G.p2.chars.filter(c=>c.alive);
    const pow=getPow(sk);
    const _cardNvAI = (!isSpecial(card) && card.suit===ch.suit && card.suit!=='joker' && ch.suit!=='neutral') ? card.nv*2 : card.nv;
    const total = ch.curAtq + pow + _cardNvAI;
    const d = sk.desc.toLowerCase();
    floatSeq(aiAllies, t => {
      if(d.includes('cura')){t.hp=Math.min(t.maxHp,t.hp+total);floatHeal(t,total);addLog('💚 [IA] '+t.name+' curado: +'+total+' PVS','heal');}
      else if(d.includes('escudo')){addSt(t,{id:'shield',icon:'🛡️',label:'Escudo('+total+')',turns:2,val:total});floatArmor(t,total);addLog('🛡️ [IA] '+t.name+' recebe Escudo '+total,'heal');}
      else if(d.includes('imagem espelhada')){addSt(t,{id:'mirror',icon:'🪞',label:'Im. Espelhada',turns:2});floatStatus(t,'🪞 Espelho!','#a0c0ff');addLog('🪞 [IA] '+t.name+' Imagem Espelhada!','heal');}
      else if(d.includes('fortalecido')){t.curAtq=Math.floor(t.curAtq*1.5);addSt(t,{id:'fort_atq',icon:'⬆️',label:'Fortalecido',turns:2});floatStatus(t,'⬆️ ATQ+','#60e060');addLog('⬆️ [IA] '+t.name+' Fortalecido!','heal');}
    }).then(()=>{ if(!G.over){_nextAfterDelay(1200);render();} });
    render(); return;
  }

  // === STEP 5c: enemy/Encanto — Sou Seu Amigo e similares (só se NÃO tratado pelo STEP 3.5) ===
  if(!_step35Handled && sk.target==='enemy' && sk.type==='Encanto') {
    addLog(ch.name+' usa '+sk.name+'!','info');
    const encTarget = enemies[Math.floor(Math.random()*enemies.length)];
    if(encTarget) {
      addSt(encTarget,{id:'encantado',icon:'🎭',label:'Encantado (2t)',turns:2});
      addLog('[IA] '+ch.name+' encantou '+encTarget.name+'!','info');
      floatStatus(encTarget,'🎭 Encantado!','#b060e0');
      render();
    }
    if(sk.acao==='Rápida'||RAPIDA.includes(sk.name)) {
      const frozenAfterQ = checkFrozenStun(ch, null, 'quick');
      if(frozenAfterQ === 'lost_after') { nextActor(); render(); return; }
      if (!_pvpSocket || _pvpSocket.readyState !== WebSocket.OPEN) setTimeout(()=>{ if(!G.over && ch.alive) { enemyAI({ch, o:'p2', extra:true}); } }, 1200);
    } else {
      _nextAfterDelay(1200); render();
    }
    return;
  }

  if(sk.target==='all_enemy'){
    // ── IA área → executeAction (resolução unificada) ──
    executeAction(ch, sk, card, null, 'p2');
    return;
  } else {
    // ── IA single target → executeAction (resolução unificada) ──
    let t=enemies[Math.floor(Math.random()*enemies.length)];
    executeAction(ch, sk, card, t, 'p2');
    return;
  }

  // After AI action: if clubs player has pending counter, open panel
  if(G._pendingClubsAtk) {
    const fu = G._pendingClubsAtk;
    G._pendingClubsAtk = null;
    G._clubsAfterQuick = null;
    setTimeout(()=>{
      if(fu.target && (fu.target.alive || fu.isAllEnemy)) { showClubsFollowUp(fu); render(); }
      else { nextActor(); render(); }
    }, 400);
    return;
  }
  if(!G.over){ _nextAfterDelay(); }

  // Zarae combo: após Espírito do Guepardo (Ação Rápida), dispara Atagas imediatamente
  if(!G.over && ch.id==='pt_zar_ai' && sk.id==='dsz' && ch._ramCombo) {
    ch._ramCombo = false;
    const atg = ch.skills.find(s=>s.id==='atg');
    const atgAvail = (ch.cooldowns['atg']||0) === 0;
    if(atg && atgAvail && p.hand.length > 0) {
      setTimeout(()=>{
        if(!G.over && ch.alive) {
          addLog('⚡ [IA Zarae] COMBO! Atagas logo após Espírito do Guepardo!','info');
          floatStatus(ch,'⚡ COMBO!','#f0e060');
          runAITurn({ch, o:'p2', extra:true});
        }
      }, 1400);
    }
  }

  // Gorath combo: após SKAAAAARRRRR!!! (Ação Rápida), dispara ATACARRRR imediatamente
  if(!G.over && ch.id==='gora_ai' && sk.id==='tas' && ch._kataCombo) {
    ch._kataCombo = false;
    const atc = ch.skills.find(s=>s.id==='atc');
    const atcAvail = (ch.cooldowns['atc']||0) === 0;
    if(atc && atcAvail && p.hand.length > 0) {
      setTimeout(()=>{
        if(!G.over && ch.alive) {
          addLog('⚔️ [IA Gorath] COMBO! ATACARRRR logo após SKAAAAARRRRR!!!','info');
          floatStatus(ch,'⚔️ COMBO!','#ff4040');
          runAITurn({ch, o:'p2', extra:true});
        }
      }, 1400);
    }
  }
}
