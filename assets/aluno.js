/* Área do aluno — modo demo. Login é só porta de vitrine (aluno / aprovado). Aluno de exemplo: id "demo". */
(function () {
  'use strict';
  var esc = AP.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  function entrar() { $('#tela-login').hidden = true; $('#tela-aluno').hidden = false; monta(); }
  try { if (sessionStorage.getItem('ap_aluno')) entrar(); } catch (e) { /* */ }
  $('#form-login').addEventListener('submit', function (e) {
    e.preventDefault();
    if ($('#l-user').value.trim().toLowerCase() === 'aluno' && $('#l-senha').value === 'aprovado') {
      try { sessionStorage.setItem('ap_aluno', '1'); } catch (er) { /* */ }
      entrar();
    } else $('#login-erro').innerHTML = '<p class="erro">Usuário ou senha não conferem. Use os dados de demonstração acima.</p>';
  });
  $('#sair').addEventListener('click', function () { try { sessionStorage.removeItem('ap_aluno'); } catch (e) { /* */ } location.reload(); });

  function monta() {
    var al = AP.aluno('demo');
    if (!al) { AP.semear(true); al = AP.aluno('demo'); }
    var nome = al.nome.replace(/ \(exemplo\)$/, '');
    var cat = AP.categoria(al.cat);
    $('#ola').textContent = 'Olá, ' + nome.split(' ')[0] + '!';
    $('#resumo-aluno').textContent = cat.nome + ' (' + cat.veiculo.toLowerCase() + ') · aluna desde ' + AP.dataCurta(al.desde) + ' · dados de exemplo';

    // próximas aulas
    var h = AP.hoje();
    var minhas = AP.aulas().filter(function (a) { return a.aluno === 'demo' && a.status === 'marcada' && a.data >= h; });
    $('#aulas').innerHTML = minhas.length ? minhas.map(function (a) {
      var d = AP.deIso(a.data);
      var msg = 'Olá, Autoescola Aprovado! Sou ' + nome + ' e preciso remarcar minha aula de ' + AP.dataCurta(a.data) + ' às ' + a.hora + ' (' + a.tipo + '). Quais horários vocês têm?';
      return '<div class="aula"><div class="quando">' + AP.DIAS[d.getDay()] + '<b>' + String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '</b>' + a.hora + '</div>' +
        '<div><div style="font-weight:800;font-size:19px">' + esc(a.tipo) + '</div><div>' + esc(a.instrutor) + '</div>' +
        '<div class="acoes-adm"><a class="mini-bt" target="_blank" rel="noopener" href="' + esc(AP.linkWa(msg)) + '">Remarcar pelo WhatsApp</a></div></div></div>';
    }).join('') : '<p>Nenhuma aula marcada. Fale com a recepção para agendar.</p>';

    // etapas
    var idx = AP.etapaIdx(al.etapa);
    $('#etapas').innerHTML = AP.ETAPAS.map(function (et, i) {
      var cls = i < idx ? 'feita' : i === idx ? 'agora' : '';
      var extra = et.id === 'praticas' ? ' <small>(' + (al.praticasFeitas || 0) + ' feita' + ((al.praticasFeitas || 0) === 1 ? '' : 's') + ' · mínimo 2)</small>' : '';
      return '<li class="' + cls + '"><span class="bola">' + (i < idx ? '✔' : '') + '</span><span>' + et.nome + extra + (i === idx ? ' <small>· agora</small>' : '') + '</span></li>';
    }).join('');
    var sim = AP.le('simulado', 0);
    $('#sim-nota').innerHTML = sim ? 'Seu melhor simulado: <b>' + sim + '/10</b>. <a href="simulado.html">Treinar de novo</a>' : '<a href="simulado.html">Faça o simulado da prova teórica</a> para treinar.';

    // avisos
    var av = AP.avisos();
    $('#avisos').innerHTML = av.length ? av.map(function (a) { return '<div class="aviso"><b>' + AP.dataCurta(a.data) + '</b> · ' + esc(a.texto) + '</div>'; }).join('') : '<p>Sem avisos agora.</p>';
    $('#bt-recepcao').href = AP.linkWa('Olá, Autoescola Aprovado! Sou ' + nome + ', aluna, e tenho uma dúvida.');
  }
})();
