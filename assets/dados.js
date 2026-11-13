/* =====================================================================
   Autoescola Aprovado · CAB · Salvador/BA — dados da autoescola + "banco" do modo demo.
   ÚNICO lugar com informação da autoescola. Site, simulado, área do aluno e painel leem daqui.
   Modo demo: tudo fica no navegador (localStorage, prefixo ap_).
   Regra: nada de preço, equipe, ano, horário completo ou nº de seguidores inventado.
   ===================================================================== */
(function () {
  'use strict';

  var CASA = {
    nome: 'Autoescola Aprovado',
    curto: 'Aprovado',
    // Google Maps / adesivo do carro
    endereco: 'CAB Empresarial · Av. Ulysses Guimarães, 3302 · Sala 307',
    bairro: 'Centro Administrativo da Bahia',
    cidade: 'Salvador · BA · 41213-000',
    mapa: 'Auto Escola Aprovado, CAB Empresarial, Av. Ulysses Guimarães 3302, Salvador BA',
    // Número público: Google, Facebook e adesivo do carro. README pede confirmação com a autoescola.
    whatsapp: '5571987871601',
    telefoneTexto: '(71) 98787-1601',
    abre: '9h',                       // Google: "Abre 09:00". Fechamento e dias: A CONFIRMAR.
    instagram: 'autoescolaaprovado_',
    notaGoogle: '4,8',
    avaliacoesGoogle: 329
  };

  // Categorias citadas pela própria autoescola ("categorias A, B ou AB"; adesivo "MOTO E CARRO").
  var CATEGORIAS = [
    { id: 'A',  nome: 'Categoria A',  veiculo: 'Moto',          frase: 'Para pilotar moto, motoneta e triciclo.' },
    { id: 'B',  nome: 'Categoria B',  veiculo: 'Carro',         frase: 'Para dirigir carro de passeio.' },
    { id: 'AB', nome: 'Categoria AB', veiculo: 'Moto e carro',  frase: 'As duas de uma vez: moto e carro na mesma habilitação.' }
  ];

  // Etapas da primeira habilitação (processo geral do Detran, não detalhe da autoescola).
  var ETAPAS = [
    { id: 'matricula', nome: 'Matrícula' },
    { id: 'exames',    nome: 'Exames médico e psicológico' },
    { id: 'teorico',   nome: 'Curso teórico' },
    { id: 'provateo',  nome: 'Prova teórica' },
    { id: 'praticas',  nome: 'Aulas práticas' },
    { id: 'provapra',  nome: 'Prova prática' }
  ];

  // Instrutores FICTÍCIOS do modo demo (a equipe real é A CONFIRMAR).
  var INSTRUTORES = ['Instrutora Bia (exemplo)', 'Instrutor Téo (exemplo)'];

  var DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  /* ---------------- datas ---------------- */
  function iso(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function deIso(s) { var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12); }
  function hoje() { return iso(new Date()); }
  function soma(s, n) { var d = deIso(s); d.setDate(d.getDate() + n); return iso(d); }
  function dataCurta(s) { var d = deIso(s); return DIAS[d.getDay()].toLowerCase() + ' ' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0'); }
  function diaUtil(s) { var d = deIso(s); while (d.getDay() === 0) d.setDate(d.getDate() + 1); return iso(d); }

  /* ---------------- armazenamento ---------------- */
  var PFX = 'ap_';
  function le(k, pad) { try { var v = localStorage.getItem(PFX + k); return v ? JSON.parse(v) : pad; } catch (e) { return pad; } }
  function grava(k, v) { try { localStorage.setItem(PFX + k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function novoId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

  /* ---------------- dados de exemplo (todos fictícios) ---------------- */
  function semear(forcar) {
    var VERSAO = 'semeado_v1';
    if (!forcar) { try { if (localStorage.getItem(PFX + VERSAO)) return; } catch (e) { return; } }
    var h = hoje(), t = new Date().toISOString(), I = INSTRUTORES;
    grava('alunos', [
      { id: 'demo', nome: 'Aluna Demo (exemplo)', tel: '71900000010', cat: 'AB', etapa: 'praticas', praticasFeitas: 1, desde: soma(h, -45), ativo: true },
      { id: 'a2', nome: 'Caio R. (exemplo)', tel: '71900000011', cat: 'B', etapa: 'teorico', praticasFeitas: 0, desde: soma(h, -12), ativo: true },
      { id: 'a3', nome: 'Lia M. (exemplo)', tel: '71900000012', cat: 'A', etapa: 'provapra', praticasFeitas: 2, desde: soma(h, -70), ativo: true },
      { id: 'a4', nome: 'Davi S. (exemplo)', tel: '71900000013', cat: 'B', etapa: 'exames', praticasFeitas: 0, desde: soma(h, -5), ativo: true },
      { id: 'a5', nome: 'Rute P. (exemplo)', tel: '71900000014', cat: 'AB', etapa: 'concluido', praticasFeitas: 4, desde: soma(h, -110), ativo: false }
    ]);
    grava('aulas', [
      { id: novoId(), aluno: 'demo', instrutor: I[0], data: diaUtil(soma(h, 1)), hora: '09:00', tipo: 'Prática · carro', status: 'marcada' },
      { id: novoId(), aluno: 'demo', instrutor: I[1], data: diaUtil(soma(h, 3)), hora: '10:00', tipo: 'Prática · moto', status: 'marcada' },
      { id: novoId(), aluno: 'demo', instrutor: I[0], data: soma(h, -4), hora: '09:00', tipo: 'Prática · carro', status: 'feita' },
      { id: novoId(), aluno: 'a3', instrutor: I[1], data: diaUtil(soma(h, 1)), hora: '11:00', tipo: 'Prática · moto', status: 'marcada' },
      { id: novoId(), aluno: 'a2', instrutor: I[0], data: diaUtil(soma(h, 2)), hora: '14:00', tipo: 'Teórica', status: 'marcada' },
      { id: novoId(), aluno: 'a3', instrutor: I[0], data: diaUtil(soma(h, 4)), hora: '15:00', tipo: 'Prática · carro', status: 'marcada' }
    ]);
    grava('prematriculas', [
      { id: novoId(), nome: 'Joana (exemplo)', tel: '71900000020', cat: 'B', turno: 'Manhã', obs: 'Tem medo de rampa.', status: 'nova', criado: t },
      { id: novoId(), nome: 'Ítalo (exemplo)', tel: '71900000021', cat: 'AB', turno: 'Tarde', obs: '', status: 'contato', criado: soma(h, -1) + 'T10:00:00.000Z' },
      { id: novoId(), nome: 'Bruna (exemplo)', tel: '71900000022', cat: 'A', turno: 'Manhã', obs: 'Trabalha no CAB.', status: 'matriculado', criado: soma(h, -6) + 'T10:00:00.000Z' }
    ]);
    grava('avisos', [
      { id: novoId(), data: h, texto: 'Leve documento com foto em todas as aulas práticas. (exemplo)' },
      { id: novoId(), data: soma(h, -2), texto: 'Remarcação de aula: avise pelo WhatsApp com antecedência. (exemplo)' }
    ]);
    try { localStorage.setItem(PFX + VERSAO, '1'); } catch (e) { /* */ }
  }

  /* ---------------- consultas ---------------- */
  function alunos() { return le('alunos', []); }
  function aulas() { return le('aulas', []).slice().sort(function (a, b) { return (a.data + a.hora).localeCompare(b.data + b.hora); }); }
  function prematriculas() { return le('prematriculas', []); }
  function avisos() { return le('avisos', []).slice().sort(function (a, b) { return b.data.localeCompare(a.data); }); }
  function addPrematricula(x) { var l = prematriculas(); x.id = novoId(); x.status = 'nova'; x.criado = new Date().toISOString(); l.push(x); grava('prematriculas', l); return x; }
  function aluno(id) { return alunos().filter(function (a) { return a.id === id; })[0]; }
  function etapaIdx(id) { if (id === 'concluido') return ETAPAS.length; for (var i = 0; i < ETAPAS.length; i++) if (ETAPAS[i].id === id) return i; return 0; }
  function categoria(id) { return CATEGORIAS.filter(function (c) { return c.id === id; })[0] || { id: id, nome: id, veiculo: '' }; }
  function linkWa(txt, numero) { return 'https://wa.me/' + (numero || CASA.whatsapp) + '?text=' + encodeURIComponent(txt); }
  function linkMapa() { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(CASA.mapa); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

  semear(false);

  window.AP = {
    CASA: CASA, CATEGORIAS: CATEGORIAS, ETAPAS: ETAPAS, INSTRUTORES: INSTRUTORES, DIAS: DIAS,
    iso: iso, deIso: deIso, hoje: hoje, soma: soma, dataCurta: dataCurta,
    le: le, grava: grava, novoId: novoId, semear: semear,
    alunos: alunos, aulas: aulas, prematriculas: prematriculas, avisos: avisos, addPrematricula: addPrematricula,
    aluno: aluno, etapaIdx: etapaIdx, categoria: categoria, linkWa: linkWa, linkMapa: linkMapa, esc: esc
  };
})();
