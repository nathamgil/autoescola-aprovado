/* Simulado da prova teórica — 10 perguntas de EXEMPLO (conteúdo geral do CTB), placas desenhadas em SVG.
   7 ou mais acertos = carimbo APROVADO. Melhor nota fica em localStorage (ap_simulado) e aparece na área do aluno. */
(function () {
  'use strict';
  var esc = AP.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };

  var V = '#C8201A', K = '#0E1A2B', AM = '#FFC20E';
  var PLACAS = {
    pare: '<svg viewBox="0 0 200 200" role="img" aria-label="Placa octogonal vermelha escrita PARE"><polygon points="62,6 138,6 194,62 194,138 138,194 62,194 6,138 6,62" fill="' + V + '"/><polygon points="66,16 134,16 184,66 184,134 134,184 66,184 16,134 16,66" fill="none" stroke="#fff" stroke-width="6"/><text x="100" y="121" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-weight="900" font-size="58" fill="#fff">PARE</text></svg>',
    preferencia: '<svg viewBox="0 0 200 200" role="img" aria-label="Placa triangular de ponta para baixo, branca com borda vermelha"><polygon points="14,30 186,30 100,182" fill="#fff" stroke="' + V + '" stroke-width="20" stroke-linejoin="round"/></svg>',
    vel60: '<svg viewBox="0 0 200 200" role="img" aria-label="Placa redonda branca com borda vermelha e o número 60 km/h"><circle cx="100" cy="100" r="86" fill="#fff" stroke="' + V + '" stroke-width="20"/><text x="100" y="118" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-weight="900" font-size="70" fill="' + K + '">60</text><text x="100" y="148" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-weight="800" font-size="20" fill="' + K + '">km/h</text></svg>',
    lombada: '<svg viewBox="0 0 200 200" role="img" aria-label="Placa amarela em losango com o desenho de uma lombada"><polygon points="100,6 194,100 100,194 6,100" fill="' + AM + '" stroke="' + K + '" stroke-width="8" stroke-linejoin="round"/><path d="M44 126h34q22-44 44 0h34" fill="none" stroke="' + K + '" stroke-width="12" stroke-linejoin="round"/></svg>',
    estacionar: '<svg viewBox="0 0 200 200" role="img" aria-label="Placa redonda branca com borda vermelha, letra E cortada por uma faixa vermelha"><circle cx="100" cy="100" r="86" fill="#fff" stroke="' + V + '" stroke-width="20"/><text x="100" y="132" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-weight="900" font-size="92" fill="' + K + '">E</text><path d="M42 42l116 116" stroke="' + V + '" stroke-width="18"/></svg>',
    amarelo: '<svg viewBox="0 0 200 200" role="img" aria-label="Semáforo com a luz amarela acesa"><rect x="62" y="8" width="76" height="184" rx="22" fill="' + K + '"/><circle cx="100" cy="46" r="24" fill="#4A1E1C"/><circle cx="100" cy="100" r="24" fill="' + AM + '"/><circle cx="100" cy="100" r="34" fill="none" stroke="' + AM + '" stroke-width="4" opacity=".5"/><circle cx="100" cy="154" r="24" fill="#173D25"/></svg>',
    seta: '<svg viewBox="0 0 200 200" role="img" aria-label="Carro visto de cima com a seta da direita piscando e uma flecha virando à direita"><rect x="40" y="70" width="70" height="116" rx="16" fill="#9ED8F2" stroke="' + K + '" stroke-width="6"/><rect x="50" y="88" width="50" height="26" rx="6" fill="#fff" stroke="' + K + '" stroke-width="4"/><circle cx="104" cy="78" r="10" fill="' + AM + '" stroke="' + K + '" stroke-width="3"/><path d="M75 60V44q0-16 16-16h66" fill="none" stroke="' + K + '" stroke-width="12" stroke-linecap="round"/><path d="M146 12l22 16-22 16" fill="none" stroke="' + K + '" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    distancia: '<svg viewBox="0 0 200 200" role="img" aria-label="Dois carros na mesma faixa com espaço entre eles"><rect x="0" y="128" width="200" height="60" fill="#5B6676"/><path d="M0 158h200" stroke="#fff" stroke-width="5" stroke-dasharray="18 14"/><rect x="10" y="94" width="56" height="34" rx="9" fill="#9ED8F2" stroke="' + K + '" stroke-width="5"/><rect x="134" y="94" width="56" height="34" rx="9" fill="#fff" stroke="' + K + '" stroke-width="5"/><path d="M74 72h52" stroke="' + K + '" stroke-width="5" stroke-dasharray="8 6"/><text x="100" y="60" text-anchor="middle" font-family="Archivo, Arial, sans-serif" font-weight="900" font-size="30" fill="' + K + '">? s</text></svg>',
    cinto: '<svg viewBox="0 0 200 200" role="img" aria-label="Pessoa sentada com cinto de segurança atravessado no peito"><circle cx="100" cy="46" r="26" fill="none" stroke="' + K + '" stroke-width="10"/><path d="M48 190v-56a52 52 0 0 1 104 0v56" fill="none" stroke="' + K + '" stroke-width="10"/><path d="M62 92l78 92" stroke="' + AM + '" stroke-width="20" stroke-linecap="round"/><path d="M62 92l78 92" stroke="' + K + '" stroke-width="3" stroke-linecap="round"/></svg>',
    rotatoria: '<svg viewBox="0 0 200 200" role="img" aria-label="Placa azul redonda com flechas brancas em círculo"><circle cx="100" cy="100" r="88" fill="#1E5BB8" stroke="#fff" stroke-width="6"/><path d="M100 46a54 54 0 1 1-50 34" fill="none" stroke="#fff" stroke-width="14"/><path d="M34 80l18-22 14 26z" fill="#fff"/></svg>'
  };

  var Q = [
    { placa: 'pare', p: 'O que esta placa obriga o condutor a fazer?', alts: ['Diminuir a velocidade e seguir sem parar', 'Parar o veículo por completo antes de seguir', 'Parar só se vier outro carro', 'Buzinar antes de cruzar'], c: 1,
      e: 'Parada obrigatória: o carro para totalmente, mesmo sem ninguém vindo. Como diz a arte da Aprovado: pare novamente e verifique se vem algum carro.' },
    { placa: 'preferencia', p: 'O que significa esta placa?', alts: ['Proibido seguir em frente', 'Via sem saída', 'Dê a preferência', 'Fim da via preferencial'], c: 2,
      e: 'Dê a preferência: reduza e só siga quando não vier ninguém pela outra via.' },
    { placa: 'vel60', p: 'Esta placa indica:', alts: ['Velocidade máxima permitida de 60 km/h', 'Velocidade mínima de 60 km/h', 'Faltam 60 metros para o cruzamento', 'Velocidade recomendada só para motos'], c: 0,
      e: 'Placa redonda de borda vermelha é de regulamentação: o número é a velocidade máxima daquele trecho.' },
    { placa: 'lombada', p: 'Uma placa amarela em losango com este desenho avisa que:', alts: ['A pista vai acabar', 'Há uma ponte estreita', 'Há animais na pista', 'Há uma lombada (saliência) à frente'], c: 3,
      e: 'Placas amarelas são de advertência. Lombada à frente: reduza antes de chegar nela.' },
    { placa: 'estacionar', p: 'O que esta placa proíbe?', alts: ['Estacionar', 'Parar para embarque', 'Entrar na rua', 'Fazer retorno'], c: 0,
      e: 'Proibido estacionar: dá para parar rapidinho para embarque e desembarque, mas não para deixar o carro.' },
    { placa: 'amarelo', p: 'Luz amarela acesa no semáforo significa:', alts: ['Acelerar para passar antes do vermelho', 'Seguir normalmente', 'Atenção: parar, a não ser que frear ali seja perigoso', 'Vale só para pedestres'], c: 2,
      e: 'Amarelo é atenção: o condutor deve parar, salvo se já estiver tão perto que a parada cause risco.' },
    { placa: 'seta', p: 'Antes de virar à direita, o correto é:', alts: ['Ligar a seta só no meio da curva', 'Ligar a seta com antecedência e se posicionar à direita', 'Buzinar para avisar', 'Não sinalizar se a rua estiver vazia'], c: 1,
      e: 'Sinalize à direita com antecedência, mesmo com a rua vazia. Na prova prática, esquecer a seta conta contra.' },
    { placa: 'distancia', p: 'Em pista seca, uma regra prática de direção defensiva para a distância do carro da frente é:', alts: ['Ficar bem perto para ninguém entrar na frente', 'Manter pelo menos 2 segundos de distância', 'Um metro em qualquer velocidade', 'Tanto faz, se o freio estiver bom'], c: 1,
      e: 'Escolha um ponto fixo e conte "mil e um, mil e dois" depois que o carro da frente passar por ele. Com chuva, aumente.' },
    { placa: 'cinto', p: 'O cinto de segurança é obrigatório para:', alts: ['Só o motorista', 'Motorista e passageiro da frente', 'Só na estrada', 'Todos os ocupantes, em qualquer via'], c: 3,
      e: 'Cinto para todo mundo no carro, banco da frente e de trás, na cidade e na estrada.' },
    { placa: 'rotatoria', p: 'Numa rotatória, sem sinalização dizendo o contrário, quem tem a preferência?', alts: ['Quem está entrando', 'Quem já está circulando na rotatória', 'O veículo maior', 'Quem buzinar primeiro'], c: 1,
      e: 'Quem já está girando na rotatória passa primeiro. Quem chega espera.' }
  ];

  var palco = $('#palco-sim'), trilha = $('#trilha');
  var n = 0, respostas = [];

  function desenhaTrilha() {
    trilha.innerHTML = Q.map(function (q, i) {
      var cls = i < respostas.length ? (respostas[i] === Q[i].c ? 'certa' : 'errada') : i === n ? 'atual' : '';
      return '<i class="' + cls + '"></i>';
    }).join('');
  }

  function pergunta() {
    var q = Q[n];
    desenhaTrilha();
    palco.innerHTML = '<div class="questao"><div class="placa">' + PLACAS[q.placa] + '</div><div>' +
      '<div class="num">Pergunta ' + (n + 1) + ' de ' + Q.length + '</div><h2>' + esc(q.p) + '</h2>' +
      '<div class="alts">' + q.alts.map(function (a, i) { return '<button type="button" data-i="' + i + '"><b>' + 'ABCD'[i] + '</b><span>' + esc(a) + '</span></button>'; }).join('') + '</div>' +
      '<div id="explica"></div></div></div>';
    Array.prototype.forEach.call(palco.querySelectorAll('.alts button'), function (b) { b.addEventListener('click', function () { responde(+b.getAttribute('data-i')); }); });
  }

  function responde(i) {
    var q = Q[n], ok = i === q.c;
    respostas.push(i);
    Array.prototype.forEach.call(palco.querySelectorAll('.alts button'), function (b) {
      var k = +b.getAttribute('data-i');
      b.disabled = true;
      if (k === q.c) b.classList.add('certa');
      else if (k === i) b.classList.add('errada');
    });
    desenhaTrilha();
    var ult = n === Q.length - 1;
    $('#explica').innerHTML = '<div class="explica"><strong>' + (ok ? 'Certo!' : 'Não foi dessa vez. A certa é a letra ' + 'ABCD'[q.c] + '.') + '</strong>' + esc(q.e) + '</div>' +
      '<div class="sim-acoes"><button class="bt bt-verde" type="button" id="prox">' + (ult ? 'Ver resultado' : 'Próxima pergunta') + '</button></div>';
    var prox = $('#prox');
    prox.addEventListener('click', function () { if (ult) resultado(); else { n++; pergunta(); palco.scrollIntoView({ block: 'start' }); } });
    prox.focus({ preventScroll: true });
  }

  function resultado() {
    var acertos = respostas.filter(function (r, i) { return r === Q[i].c; }).length;
    var aprovado = acertos >= 7;
    var melhor = AP.le('simulado', 0);
    if (acertos > melhor) AP.grava('simulado', acertos);
    n = Q.length; desenhaTrilha();
    var erradas = Q.map(function (q, i) { return respostas[i] === q.c ? '' : '<div><b>' + esc(q.p) + '</b><br>Certa: ' + esc(q.alts[q.c]) + '</div>'; }).join('');
    palco.innerHTML = '<div class="resultado-sim"><div class="placar">' + acertos + '/' + Q.length + '</div>' +
      (aprovado ? '<svg class="carimbo-res" viewBox="0 0 340 150" role="img" aria-label="Carimbo APROVADO"><use href="#carimbo-aprovado"/></svg><h2>Você passaria no simulado!</h2><p>Agora falta o volante. A Aprovado leva você até a prova prática.</p>'
        : '<h2>Quase lá!</h2><p>Com 7 acertos o carimbo APROVADO aparece. Revise as que errou e tente de novo.</p>') +
      '<div class="acoes"><a class="bt bt-verde" href="index.html#prematricula">Fazer pré-matrícula</a><button class="bt bt-contorno" type="button" id="denovo">Fazer de novo</button></div>' +
      (erradas ? '<div class="revisao">' + erradas + '</div>' : '') + '</div>';
    $('#denovo').addEventListener('click', function () { n = 0; respostas = []; pergunta(); });
    palco.scrollIntoView({ block: 'start' });
  }

  pergunta();
})();
