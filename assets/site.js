/* Autoescola Aprovado — site (index.html). JS puro, sem biblioteca.
   Cena-assinatura: a rolagem marca a ficha do exame item por item, o semáforo vai do vermelho ao verde,
   desce o carimbo APROVADO e a ficha vira a CNH. prefers-reduced-motion = versão estática. */
(function () {
  'use strict';
  var C = AP.CASA, esc = AP.esc;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calmo = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function lim(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

  /* ---------- marca (topo e rodapé) ---------- */
  var MARCA = '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="2" y="2" width="44" height="44" rx="10" fill="#0A6B35"/><path d="M13 25l7 7 15-16" stroke="#FFC20E" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
    '<span><b>APRO<span>VADO</span></b><small>Autoescola · CAB</small></span>';
  $$('[data-marca]').forEach(function (el) { el.innerHTML = MARCA; });

  /* ---------- cena: ficha → carimbo → CNH ---------- */
  var cena = $('#exame');
  if (cena) {
    var itens = $$('.item', cena), cheques = itens.map(function (li) { return $('.caixa-ok svg', li); }),
      marcas = itens.map(function (li) { return $('.marca-txt', li); }),
      luzes = $$('#sem-mini i'), conta = $('#conta-itens'), carimbo = $('#carimbo'),
      ficha = $('#ficha'), cnh = $('#cnh'), dica = $('#dica');

    if (calmo) {
      cena.classList.add('estatica');
      conta.textContent = '5';
      luzes.forEach(function (l, i) { l.classList.toggle('aceso', i === 2); });
    } else {
      var ultimo = -1, pedido = false;
      var desenha = function () {
        pedido = false;
        var r = cena.getBoundingClientRect(), total = cena.offsetHeight - window.innerHeight;
        var p = lim(total > 0 ? -r.top / total : 0);
        if (Math.abs(p - ultimo) < 0.0005) return;
        ultimo = p;

        // 1) itens marcados um a um (0,05 → 0,58)
        var feitos = 0;
        itens.forEach(function (li, i) {
          var t = lim((p - (0.05 + i * 0.11)) / 0.09);
          cheques[i].style.clipPath = 'inset(0 ' + (100 - t * 100).toFixed(1) + '% 0 0)';
          marcas[i].style.transform = 'scaleX(' + (t > 0 && t < 1 ? 1 : 0) + ')';
          if (t >= 1) feitos++;
        });
        conta.textContent = feitos;

        // 2) semáforo da ficha: vermelho → amarelo → verde
        var fase = p < 0.25 ? 0 : p < 0.5 ? 1 : 2;
        luzes.forEach(function (l, i) { l.classList.toggle('aceso', i === fase); });

        // 3) o carimbo desce (0,60 → 0,68)
        var s = lim((p - 0.6) / 0.08), e = s * s;
        carimbo.style.opacity = lim(s * 4);
        carimbo.style.transform = 'rotate(-12deg) scale(' + (2.6 - 1.6 * e).toFixed(3) + ')';

        // 4) a ficha vira a CNH (0,74 → 0,88)
        var f = lim((p - 0.74) / 0.14);
        if (f <= 0.5) {
          ficha.style.transform = 'rotateY(' + (f * 180).toFixed(1) + 'deg)';
          ficha.style.opacity = 1;
          cnh.style.opacity = 0;
          cnh.classList.remove('visivel');
        } else {
          ficha.style.opacity = 0;
          cnh.classList.add('visivel');
          cnh.style.opacity = 1;
          cnh.style.transform = 'rotateY(' + (-90 * (1 - (f - 0.5) * 2)).toFixed(1) + 'deg)';
        }
        dica.style.opacity = 1 - lim((p - 0.02) / 0.06);
      };
      var pede = function () { if (!pedido) { pedido = true; requestAnimationFrame(desenha); } };
      window.addEventListener('scroll', pede, { passive: true });
      window.addEventListener('resize', function () { ultimo = -1; pede(); });
      desenha();
    }
  }

  /* ---------- categorias A / B / AB ---------- */
  var MOTO = '<g fill="none" stroke="#0E1A2B" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><circle cx="66" cy="100" r="30"/><circle cx="234" cy="100" r="30"/><path d="M66 100l52-38h66l50 38"/><path d="M234 100l-28-60h-16"/><path d="M200 40l18-10"/></g>' +
    '<path d="M112 62q14-22 52-20l26 14H112z" fill="#0A6B35" stroke="#0E1A2B" stroke-width="5" stroke-linejoin="round"/><rect x="84" y="50" width="40" height="10" rx="5" fill="#0E1A2B"/><circle cx="66" cy="100" r="8" fill="#FFC20E"/><circle cx="234" cy="100" r="8" fill="#FFC20E"/>';
  var CARRO = '<path d="M18 102l10-30q6-14 24-16l42-4 34-28q8-6 20-6h56q14 0 24 10l26 26 18 4q14 4 14 18v26z" fill="#9ED8F2" stroke="#0E1A2B" stroke-width="5" stroke-linejoin="round"/>' +
    '<path d="M26 80h258" stroke="#FFC20E" stroke-width="13"/><path d="M106 56l28-24q4-3 12-3h28v27z" fill="#fff" stroke="#0E1A2B" stroke-width="4"/><path d="M182 29h22q10 0 18 9l18 18h-58z" fill="#fff" stroke="#0E1A2B" stroke-width="4"/>' +
    '<circle cx="80" cy="104" r="23" fill="#0E1A2B"/><circle cx="80" cy="104" r="9" fill="#C9D3DD"/><circle cx="232" cy="104" r="23" fill="#0E1A2B"/><circle cx="232" cy="104" r="9" fill="#C9D3DD"/>';
  var DESENHO = {
    A: '<svg viewBox="0 0 300 140" role="img" aria-label="Desenho de uma moto">' + MOTO + '</svg>',
    B: '<svg viewBox="0 0 300 140" role="img" aria-label="Desenho de um carro azul-claro com faixa amarela">' + CARRO + '</svg>',
    AB: '<svg viewBox="0 0 300 140" role="img" aria-label="Desenho de uma moto e de um carro"><g transform="translate(0 52) scale(.46)">' + MOTO + '</g><g transform="translate(132 50) scale(.54)">' + CARRO + '</g></svg>'
  };
  function mostraCat(id) {
    var c = AP.categoria(id);
    $$('.cat-letras button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-cat') === id); });
    $('#cat-desenho').innerHTML = DESENHO[id];
    $('#cat-nome').textContent = c.nome;
    $('#cat-veic').textContent = c.veiculo;
    $('#cat-frase').textContent = c.frase;
    $('#cat-bt').textContent = 'Quero a categoria ' + id;
    $('#cat-bt').setAttribute('data-cat', id);
  }
  if ($('#categorias')) {
    $$('.cat-letras button').forEach(function (b) { b.addEventListener('click', function () { mostraCat(b.getAttribute('data-cat')); }); });
    $('#cat-bt').addEventListener('click', function () {
      var r = $('input[name=p-cat][value="' + this.getAttribute('data-cat') + '"]');
      if (r) r.checked = true;
    });
    var q = new URLSearchParams(location.search).get('cat');
    mostraCat(AP.CATEGORIAS.some(function (c) { return c.id === q; }) ? q : 'B');
    if (q) { var rq = $('input[name=p-cat][value="' + q + '"]'); if (rq) rq.checked = true; }
  }

  /* ---------- caminho até a CNH (semáforo) ---------- */
  var FASES = {
    vermelho: { cor: '#E5352B', titulo: 'Antes de dirigir', itens: [
      ['Matrícula', 'Você escolhe a categoria (A, B ou AB) e entrega os documentos.'],
      ['Exames médico e psicológico', 'Obrigatórios para a primeira habilitação.']] },
    amarelo: { cor: '#FFC20E', titulo: 'Atenção às regras', itens: [
      ['Curso teórico', 'Legislação de trânsito, sinalização e direção defensiva.'],
      ['Prova teórica', 'Feita no Detran. Dá para treinar antes no <a href="simulado.html">simulado</a>.']] },
    verde: { cor: '#12924A', titulo: 'Ao volante', itens: [
      ['Aulas práticas', 'Com instrutor, em carro ou moto, conforme a categoria.'],
      ['Prova prática', 'No Detran. No carro: baliza, partida em rampa e percurso na rua.']] }
  };
  function mostraFase(id) {
    var f = FASES[id];
    $$('.semaforo button').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-luz') === id); });
    var caixa = $('#fase');
    caixa.style.setProperty('--cor', f.cor);
    caixa.innerHTML = '<h3>' + f.titulo + '</h3><ul>' + f.itens.map(function (i) { return '<li><div><b>' + i[0] + '</b>' + i[1] + '</div></li>'; }).join('') + '</ul>';
  }
  if ($('#caminho')) {
    $$('.semaforo button').forEach(function (b) { b.addEventListener('click', function () { mostraFase(b.getAttribute('data-luz')); }); });
    mostraFase('vermelho');
  }

  /* ---------- avaliações: estrelas e temas ---------- */
  var est = $('#estrelas');
  if (est) {
    var ponta = 'M12 2l3 7 7.4.6-5.6 4.9 1.7 7.3L12 17.9 5.5 21.8l1.7-7.3L1.6 9.6 9 9z';
    var h = '';
    for (var i = 0; i < 5; i++) h += '<svg viewBox="0 0 24 24">' + (i === 4 ? '<defs><linearGradient id="g48"><stop offset="80%" stop-color="#FFC20E"/><stop offset="80%" stop-color="#D3DAE2"/></linearGradient></defs>' : '') + '<path d="' + ponta + '" fill="' + (i === 4 ? 'url(#g48)' : '#FFC20E') + '" stroke="#0E1A2B" stroke-width="1.2" stroke-linejoin="round"/></svg>';
    est.innerHTML = h;
  }
  var temas = $('#temas');
  if (temas) {
    var T = [['instrutores', 59], ['habilitação', 34], ['gratidão', 33], ['paciência', 28]];
    temas.innerHTML = T.map(function (t) {
      return '<div class="tema' + (t[0] === 'paciência' ? ' destaque' : '') + '"><span>' + t[0] + '</span><span class="barra"><i style="transform:scaleX(' + (calmo ? t[1] / 59 : 0) + ')" data-v="' + (t[1] / 59) + '"></i></span><span>' + t[1] + '</span></div>';
    }).join('');
    if (!calmo && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (ent) {
        ent.forEach(function (e) {
          if (!e.isIntersecting) return;
          $$('.barra i', temas).forEach(function (b, k) { b.style.transition = 'transform .8s ' + (k * 0.12) + 's cubic-bezier(.2,.8,.2,1)'; b.style.transform = 'scaleX(' + b.getAttribute('data-v') + ')'; });
          io.disconnect();
        });
      }, { threshold: 0.4 });
      io.observe(temas);
    } else {
      $$('.barra i', temas).forEach(function (b) { b.style.transform = 'scaleX(' + b.getAttribute('data-v') + ')'; });
    }
  }

  /* ---------- pré-matrícula → WhatsApp ---------- */
  var form = $('#form-pre');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var nome = $('#p-nome').value.trim(), msgBox = $('#pre-msg');
      if (!nome) { msgBox.innerHTML = '<p class="erro">Escreva seu nome para a autoescola saber com quem fala.</p>'; $('#p-nome').focus(); return; }
      var cat = ($('input[name=p-cat]:checked') || {}).value || 'B';
      var turno = ($('input[name=p-turno]:checked') || {}).value || 'Tanto faz';
      var obs = $('#p-obs').value.trim();
      var c = AP.categoria(cat);
      var txt = 'Olá, Autoescola Aprovado! Quero fazer minha pré-matrícula.\n' +
        'Nome: ' + nome + '\nCategoria: ' + cat + ' (' + c.veiculo.toLowerCase() + ')\nMelhor turno: ' + turno +
        (obs ? '\nDúvida: ' + obs : '') + '\n(enviado pelo site)';
      AP.addPrematricula({ nome: nome, tel: '', cat: cat, turno: turno, obs: obs });
      var link = AP.linkWa(txt);
      $('#carimbo-pre').hidden = false;
      msgBox.innerHTML = '<div class="req-ok">Pronto, ' + esc(nome) + '! Abrimos o WhatsApp com a mensagem. Se não abriu, <a href="' + esc(link) + '" target="_blank" rel="noopener">toque aqui para enviar</a>.</div>';
      window.open(link, '_blank', 'noopener');
    });
  }

  /* ---------- onde fica ---------- */
  if ($('#endereco')) {
    $('#endereco').innerHTML = esc(C.endereco) + '<br>' + esc(C.bairro) + '<br>' + esc(C.cidade);
    $('#hora').textContent = 'Abre às ' + C.abre + ' · confirme o horário pelo WhatsApp';
    $('#bt-wa').href = AP.linkWa('Olá, Autoescola Aprovado! Vim pelo site e quero informações sobre a habilitação.');
    $('#bt-wa').textContent = 'WhatsApp ' + C.telefoneTexto;
    $('#bt-mapa').href = AP.linkMapa();
  }
})();
