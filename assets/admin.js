/* Painel da Autoescola Aprovado — modo demo (localStorage ap_). Login é só porta de vitrine (recepcao / aprovado). */
(function () {
  'use strict';
  var esc = AP.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var corpo = $('#corpo');
  var est = { aba: new URLSearchParams(location.search).get('aba') || 'pre', fPre: 'abertas', fAl: 'ativos', fInst: 'todos', editAl: null, novaAula: false };

  function entrar() { $('#tela-login').hidden = true; $('#tela-painel').hidden = false; aba(est.aba); }
  try { if (sessionStorage.getItem('ap_logado')) entrar(); } catch (e) { /* */ }
  $('#form-login').addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('#l-user').value.trim().toLowerCase() === 'recepcao' && $('#l-senha').value === 'aprovado') { try { sessionStorage.setItem('ap_logado', '1'); } catch (er) { /* */ } entrar(); }
    else $('#login-erro').innerHTML = '<p class="erro">Usuário ou senha não conferem. Use os dados de demonstração acima.</p>';
  });
  $('#sair').addEventListener('click', function () { try { sessionStorage.removeItem('ap_logado'); } catch (e) { /* */ } location.reload(); });
  $$('.adm-abas button').forEach(function (b) { b.addEventListener('click', function () { aba(b.getAttribute('data-aba')); }); });
  function aba(id) {
    est.aba = id;
    $$('.adm-abas button').forEach(function (b) { b.setAttribute('aria-selected', b.getAttribute('data-aba') === id); });
    ({ pre: pre, alunos: alunos, agenda: agenda, avisos: avisos, ajustes: ajustes }[id] || pre)();
    window.scrollTo(0, 0);
  }
  function wa(tel) { tel = String(tel || '').replace(/\D/g, ''); return tel.length <= 11 ? '55' + tel : tel; }
  function semEx(n) { return String(n).replace(/ \(exemplo\)$/, ''); }
  function filtros(lista, atual) { return '<div class="filtros">' + lista.map(function (f) { return '<button type="button" data-f="' + f[0] + '" aria-pressed="' + (atual === f[0]) + '">' + f[1] + '</button>'; }).join('') + '</div>'; }

  /* ---------- pré-matrículas: nova → contato → matriculado ---------- */
  var STP = { nova: 'Nova', contato: 'Em contato', matriculado: 'Matriculado', desistiu: 'Desistiu' };
  function pre() {
    var todas = AP.prematriculas();
    var conta = function (s) { return todas.filter(function (x) { return x.status === s; }).length; };
    var lista = todas.filter(function (x) {
      if (est.fPre === 'abertas') return x.status === 'nova' || x.status === 'contato';
      if (est.fPre === 'fechadas') return x.status === 'matriculado' || x.status === 'desistiu';
      return true;
    }).sort(function (a, b) { return b.criado.localeCompare(a.criado); });
    var fech = conta('matriculado') + conta('desistiu');
    corpo.innerHTML = '<h2>Pré-matrículas</h2>' +
      '<div class="resumo"><div><b>' + conta('nova') + '</b>novas para responder</div><div><b>' + conta('contato') + '</b>em contato</div><div><b>' + conta('matriculado') + '</b>matriculados</div><div><b>' + (fech ? Math.round(conta('matriculado') / fech * 100) : 0) + '%</b>viraram matrícula</div></div>' +
      filtros([['abertas', 'Em aberto'], ['fechadas', 'Concluídas'], ['todas', 'Todas']], est.fPre) +
      '<div class="caixa">' + (lista.length ? lista.map(function (x) {
        var c = AP.categoria(x.cat);
        var msg = 'Olá, ' + semEx(x.nome) + '! Aqui é da Autoescola Aprovado. Recebemos sua pré-matrícula para a ' + c.nome + '. Podemos conversar sobre os planos?';
        return '<div class="linha-adm"><div><div class="t">' + esc(x.nome) + ' · ' + c.nome + ' <span class="st st-' + x.status + '">' + STP[x.status] + '</span></div>' +
          '<div class="s">' + esc(c.veiculo) + ' · turno ' + esc(x.turno) + ' · chegou ' + AP.dataCurta(x.criado.slice(0, 10)) + (x.obs ? '<br>“' + esc(x.obs) + '”' : '') + (!x.tel ? '<br><i>Veio pelo site: a conversa chega no WhatsApp da autoescola.</i>' : '') + '</div></div>' +
          '<div class="acoes-adm">' + ['contato', 'matriculado', 'desistiu'].filter(function (s) { return s !== x.status; }).map(function (s) { return '<button class="mini-bt' + (s === 'matriculado' ? ' forte' : s === 'desistiu' ? ' perigo' : '') + '" data-st="' + s + '" data-id="' + x.id + '">' + STP[s] + '</button>'; }).join('') +
          (x.tel ? '<a class="mini-bt" target="_blank" rel="noopener" href="https://wa.me/' + wa(x.tel) + '?text=' + encodeURIComponent(msg) + '">WhatsApp</a>' : '') + '</div></div>';
      }).join('') : '<p>Nada por aqui.</p>') + '</div>';
    $$('[data-f]').forEach(function (b) { b.addEventListener('click', function () { est.fPre = b.getAttribute('data-f'); pre(); }); });
    $$('[data-st]').forEach(function (b) {
      b.addEventListener('click', function () {
        var st = b.getAttribute('data-st'), id = b.getAttribute('data-id'), l = AP.prematriculas(), x;
        l.forEach(function (i) { if (i.id === id) { i.status = st; x = i; } });
        AP.grava('prematriculas', l);
        if (st === 'matriculado' && x && confirm('Cadastrar ' + x.nome + ' como aluno agora?')) {
          var al = AP.alunos(); al.push({ id: AP.novoId(), nome: x.nome, tel: x.tel || '', cat: x.cat, etapa: 'matricula', praticasFeitas: 0, desde: AP.hoje(), ativo: true }); AP.grava('alunos', al);
        }
        pre();
      });
    });
  }

  /* ---------- alunos e etapa ---------- */
  function etapasMini(a) {
    var idx = AP.etapaIdx(a.etapa);
    return '<div class="etapas-mini" aria-hidden="true">' + AP.ETAPAS.map(function (e, i) { return '<i class="' + (i < idx ? 'feita' : i === idx ? 'agora' : '') + '"></i>'; }).join('') + '</div>';
  }
  function nomeEtapa(id) { return id === 'concluido' ? 'CNH conquistada' : AP.ETAPAS[AP.etapaIdx(id)].nome; }
  function alunos() {
    var todos = AP.alunos(), ed = est.editAl;
    var lista = todos.filter(function (a) {
      if (est.fAl === 'ativos') return a.ativo;
      if (['A', 'B', 'AB'].indexOf(est.fAl) >= 0) return a.ativo && a.cat === est.fAl;
      return true;
    });
    var al = ed === 'novo' ? { id: '', nome: '', tel: '', cat: 'B', etapa: 'matricula', praticasFeitas: 0, desde: AP.hoje(), ativo: true } : todos.filter(function (a) { return a.id === ed; })[0];
    var ativos = todos.filter(function (a) { return a.ativo; });
    corpo.innerHTML = '<h2>Alunos</h2>' +
      '<div class="resumo"><div><b>' + ativos.length + '</b>ativos</div><div><b>' + ativos.filter(function (a) { return a.etapa === 'praticas'; }).length + '</b>em aulas práticas</div><div><b>' + ativos.filter(function (a) { return a.etapa === 'provapra'; }).length + '</b>indo para a prova prática</div><div><b>' + todos.filter(function (a) { return a.etapa === 'concluido'; }).length + '</b>já habilitados</div></div>' +
      (al ? formAluno(al) : '<p><button class="bt bt-verde" id="novo-al" type="button">Cadastrar aluno</button></p>') +
      filtros([['ativos', 'Ativos'], ['A', 'Cat. A'], ['B', 'Cat. B'], ['AB', 'Cat. AB'], ['todos', 'Todos']], est.fAl) +
      '<div class="caixa">' + (lista.length ? lista.map(function (a) {
        return '<div class="linha-adm"><div><div class="t">' + esc(a.nome) + ' · ' + a.cat + (a.ativo ? '' : ' <span class="st st-inativo">inativo</span>') + (a.id === 'demo' ? ' <span class="st st-contato">login da área do aluno</span>' : '') + '</div>' +
          '<div class="s">Etapa: <b>' + nomeEtapa(a.etapa) + '</b> · ' + (a.praticasFeitas || 0) + ' aula(s) prática(s) · desde ' + AP.dataCurta(a.desde) + '</div>' + etapasMini(a) + '</div>' +
          '<div class="acoes-adm">' + (a.etapa !== 'concluido' ? '<button class="mini-bt forte" data-avanca="' + a.id + '">Avançar etapa</button>' : '') + '<button class="mini-bt" data-ed="' + a.id + '">Editar</button>' +
          (a.tel ? '<a class="mini-bt" target="_blank" rel="noopener" href="https://wa.me/' + wa(a.tel) + '">WhatsApp</a>' : '') + '</div></div>';
      }).join('') : '<p>Nenhum aluno neste filtro.</p>') + '</div>';
    var n = $('#novo-al'); if (n) n.addEventListener('click', function () { est.editAl = 'novo'; alunos(); });
    $$('[data-f]').forEach(function (b) { b.addEventListener('click', function () { est.fAl = b.getAttribute('data-f'); alunos(); }); });
    $$('[data-ed]').forEach(function (b) { b.addEventListener('click', function () { est.editAl = b.getAttribute('data-ed'); alunos(); }); });
    $$('[data-avanca]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = AP.alunos();
        l.forEach(function (a) {
          if (a.id !== b.getAttribute('data-avanca')) return;
          var i = AP.etapaIdx(a.etapa);
          a.etapa = i + 1 >= AP.ETAPAS.length ? 'concluido' : AP.ETAPAS[i + 1].id;
        });
        AP.grava('alunos', l); alunos();
      });
    });
    var f = $('#f-al');
    if (f) {
      $('#cancela-al').addEventListener('click', function () { est.editAl = null; alunos(); });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var nome = $('#a-nome').value.trim(); if (!nome) { $('#a-nome').focus(); return; }
        var novo = Object.assign({}, al, { nome: nome, tel: $('#a-tel').value.replace(/\D/g, ''), cat: $('#a-cat').value, etapa: $('#a-etapa').value, praticasFeitas: Math.max(0, parseInt($('#a-prat').value, 10) || 0), ativo: $('#a-ativo').checked });
        var l = AP.alunos();
        if (!novo.id) { novo.id = AP.novoId(); l.push(novo); } else l = l.map(function (a) { return a.id === novo.id ? novo : a; });
        AP.grava('alunos', l); est.editAl = null; alunos();
      });
    }
  }
  function formAluno(a) {
    return '<div class="caixa"><h3>' + (a.id ? 'Editar aluno' : 'Novo aluno') + '</h3><form class="form-adm" id="f-al">' +
      '<div class="campo"><label for="a-nome">Nome</label><input type="text" id="a-nome" value="' + esc(a.nome) + '"></div>' +
      '<div class="campo"><label for="a-tel">WhatsApp</label><input type="tel" id="a-tel" inputmode="numeric" value="' + esc(a.tel) + '"></div>' +
      '<div class="campo"><label for="a-cat">Categoria</label><select id="a-cat">' + AP.CATEGORIAS.map(function (c) { return '<option value="' + c.id + '"' + (c.id === a.cat ? ' selected' : '') + '>' + c.nome + ' · ' + c.veiculo + '</option>'; }).join('') + '</select></div>' +
      '<div class="campo"><label for="a-etapa">Etapa</label><select id="a-etapa">' + AP.ETAPAS.concat([{ id: 'concluido', nome: 'CNH conquistada' }]).map(function (e) { return '<option value="' + e.id + '"' + (e.id === a.etapa ? ' selected' : '') + '>' + e.nome + '</option>'; }).join('') + '</select></div>' +
      '<div class="campo"><label for="a-prat">Aulas práticas feitas</label><input type="tel" id="a-prat" inputmode="numeric" value="' + (a.praticasFeitas || 0) + '"></div>' +
      '<div class="campo"><label style="margin-top:34px;display:flex;gap:8px;align-items:center"><input type="checkbox" id="a-ativo"' + (a.ativo ? ' checked' : '') + ' style="width:22px;height:22px"> Aluno ativo</label></div>' +
      '<div class="todo" style="display:flex;gap:10px;flex-wrap:wrap"><button class="bt bt-verde" type="submit">Salvar</button><button class="mini-bt" type="button" id="cancela-al">Cancelar</button></div></form></div>';
  }

  /* ---------- agenda por instrutor ---------- */
  function agenda() {
    var h = AP.hoje(), al = AP.alunos();
    var nomeAl = function (id) { var a = al.filter(function (x) { return x.id === id; })[0]; return a ? a.nome : '(aluno removido)'; };
    var lista = AP.aulas().filter(function (a) { return a.data >= AP.soma(h, -1) && (est.fInst === 'todos' || a.instrutor === est.fInst); });
    var dias = {};
    lista.forEach(function (a) { (dias[a.data] = dias[a.data] || []).push(a); });
    corpo.innerHTML = '<h2>Agenda de aulas</h2>' +
      '<p>Aulas marcadas por instrutor. Instrutores e horários são de exemplo.</p>' +
      (est.novaAula ? formAula(al) : '<p><button class="bt bt-verde" id="nova-aula" type="button">Marcar aula</button></p>') +
      filtros([['todos', 'Todos']].concat(AP.INSTRUTORES.map(function (i) { return [i, semEx(i)]; })), est.fInst) +
      '<div class="caixa">' + (lista.length ? Object.keys(dias).sort().map(function (d) {
        return '<div class="dia-agenda">' + (d === h ? 'Hoje · ' : '') + AP.dataCurta(d) + '</div>' + dias[d].map(function (a) {
          return '<div class="linha-adm"><div><div class="t">' + a.hora + ' · ' + esc(nomeAl(a.aluno)) + (a.status === 'feita' ? ' <span class="st st-matriculado">feita</span>' : a.status === 'faltou' ? ' <span class="st st-desistiu">faltou</span>' : '') + '</div>' +
            '<div class="s">' + esc(a.tipo) + ' · ' + esc(a.instrutor) + '</div></div>' +
            '<div class="acoes-adm">' + (a.status === 'marcada' ? '<button class="mini-bt forte" data-aula="' + a.id + '" data-st="feita">Feita</button><button class="mini-bt" data-aula="' + a.id + '" data-st="faltou">Faltou</button>' : '') +
            '<button class="mini-bt perigo" data-apaga="' + a.id + '">Desmarcar</button></div></div>';
        }).join('');
      }).join('') : '<p>Nenhuma aula neste filtro.</p>') + '</div>';
    var na = $('#nova-aula'); if (na) na.addEventListener('click', function () { est.novaAula = true; agenda(); });
    $$('[data-f]').forEach(function (b) { b.addEventListener('click', function () { est.fInst = b.getAttribute('data-f'); agenda(); }); });
    $$('[data-aula]').forEach(function (b) {
      b.addEventListener('click', function () {
        var l = AP.le('aulas', []), st = b.getAttribute('data-st'), alunosL = AP.alunos();
        l.forEach(function (a) {
          if (a.id !== b.getAttribute('data-aula')) return;
          a.status = st;
          if (st === 'feita' && /Prática/.test(a.tipo)) alunosL.forEach(function (x) { if (x.id === a.aluno) x.praticasFeitas = (x.praticasFeitas || 0) + 1; });
        });
        AP.grava('aulas', l); AP.grava('alunos', alunosL); agenda();
      });
    });
    $$('[data-apaga]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!confirm('Desmarcar esta aula?')) return;
        AP.grava('aulas', AP.le('aulas', []).filter(function (a) { return a.id !== b.getAttribute('data-apaga'); })); agenda();
      });
    });
    var f = $('#f-aula');
    if (f) {
      $('#cancela-aula').addEventListener('click', function () { est.novaAula = false; agenda(); });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var data = $('#u-data').value, hora = $('#u-hora').value;
        if (!data || !hora) { $('#aula-erro').innerHTML = '<p class="erro">Escolha dia e hora.</p>'; return; }
        var l = AP.le('aulas', []);
        var choque = l.some(function (a) { return a.status === 'marcada' && a.data === data && a.hora === hora && a.instrutor === $('#u-inst').value; });
        if (choque && !confirm('Esse instrutor já tem aula nesse horário. Marcar mesmo assim?')) return;
        l.push({ id: AP.novoId(), aluno: $('#u-aluno').value, instrutor: $('#u-inst').value, data: data, hora: hora, tipo: $('#u-tipo').value, status: 'marcada' });
        AP.grava('aulas', l); est.novaAula = false; agenda();
      });
    }
  }
  function formAula(al) {
    return '<div class="caixa"><h3>Marcar aula</h3><form class="form-adm" id="f-aula">' +
      '<div class="campo"><label for="u-aluno">Aluno</label><select id="u-aluno">' + al.filter(function (a) { return a.ativo; }).map(function (a) { return '<option value="' + a.id + '">' + esc(a.nome) + ' · ' + a.cat + '</option>'; }).join('') + '</select></div>' +
      '<div class="campo"><label for="u-inst">Instrutor</label><select id="u-inst">' + AP.INSTRUTORES.map(function (i) { return '<option>' + esc(i) + '</option>'; }).join('') + '</select></div>' +
      '<div class="campo"><label for="u-data">Dia</label><input type="date" id="u-data" value="' + AP.soma(AP.hoje(), 1) + '"></div>' +
      '<div class="campo"><label for="u-hora">Hora</label><input type="time" id="u-hora" value="09:00"></div>' +
      '<div class="campo todo"><label for="u-tipo">Tipo</label><select id="u-tipo"><option>Prática · carro</option><option>Prática · moto</option><option>Teórica</option></select></div>' +
      '<div class="todo" style="display:flex;gap:10px;flex-wrap:wrap"><button class="bt bt-verde" type="submit">Marcar</button><button class="mini-bt" type="button" id="cancela-aula">Cancelar</button></div><div class="todo" id="aula-erro" aria-live="polite"></div></form></div>';
  }

  /* ---------- avisos (aparecem na área do aluno) ---------- */
  function avisos() {
    var l = AP.avisos();
    corpo.innerHTML = '<h2>Avisos</h2><p>O que for publicado aqui aparece na área do aluno.</p>' +
      '<div class="caixa"><form class="form-adm" id="f-av"><div class="campo todo"><label for="v-txt">Novo aviso</label><textarea id="v-txt" placeholder="Ex.: Feriado na sexta, não teremos aulas."></textarea></div><div class="todo"><button class="bt bt-verde" type="submit">Publicar aviso</button></div></form></div>' +
      '<div class="caixa">' + (l.length ? l.map(function (a) { return '<div class="linha-adm"><div><div class="t">' + AP.dataCurta(a.data) + '</div><div class="s">' + esc(a.texto) + '</div></div><div class="acoes-adm"><button class="mini-bt perigo" data-del="' + a.id + '">Apagar</button></div></div>'; }).join('') : '<p>Sem avisos.</p>') + '</div>';
    $('#f-av').addEventListener('submit', function (e) {
      e.preventDefault();
      var t = $('#v-txt').value.trim(); if (!t) { $('#v-txt').focus(); return; }
      var x = AP.le('avisos', []); x.push({ id: AP.novoId(), data: AP.hoje(), texto: t }); AP.grava('avisos', x); avisos();
    });
    $$('[data-del]').forEach(function (b) { b.addEventListener('click', function () { if (confirm('Apagar este aviso?')) { AP.grava('avisos', AP.le('avisos', []).filter(function (a) { return a.id !== b.getAttribute('data-del'); })); avisos(); } }); });
  }

  /* ---------- ajustes ---------- */
  function ajustes() {
    var C = AP.CASA;
    corpo.innerHTML = '<h2>Ajustes</h2><div class="caixa" style="padding:16px">' +
      '<p><b>WhatsApp que recebe as pré-matrículas:</b> ' + esc(C.telefoneTexto) + '</p>' +
      '<p><b>Endereço:</b> ' + esc(C.endereco) + ', ' + esc(C.bairro) + '</p>' +
      '<p><b>Abre às:</b> ' + esc(C.abre) + ' (horário completo a confirmar)</p>' +
      '<p>Estes dados ficam em <code>assets/dados.js</code>. No modo demo, tudo do painel fica salvo só neste navegador.</p>' +
      '<button class="mini-bt perigo" id="reset" type="button">Restaurar dados de exemplo</button></div>';
    $('#reset').addEventListener('click', function () { if (confirm('Apagar tudo e voltar aos dados de exemplo?')) { AP.semear(true); aba('pre'); } });
  }
})();
