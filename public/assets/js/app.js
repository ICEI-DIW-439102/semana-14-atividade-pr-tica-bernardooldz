const API = 'http://localhost:3000';

async function fetchItems() {
  const res = await fetch(`${API}/autores`);
  return await res.json();
}

function createCard(autor) {
  const col = document.createElement('div');
  col.className = 'col';
  col.innerHTML = `
    <div class="card h-100">
      <a href="detalhe.html?id=${autor.id}">
        <img src="${autor.imagem_principal}" class="card-img-top" alt="${autor.nome}"
          onerror="this.outerHTML='<div class=\\'card-img-placeholder\\'><i class=\\'fa-solid fa-user\\'></i></div>'">
      </a>
      <div class="card-body">
        <a href="detalhe.html?id=${autor.id}" class="card-title">${autor.nome}</a>
        <p class="card-genero">${autor.genero}</p>
        <p class="card-text">${autor.biografia}</p>
      </div>
      <div class="card-footer">
        <a href="detalhe.html?id=${autor.id}" class="btn-ver-perfil">
          <i class="fa-solid fa-arrow-right"></i> Ver Perfil
        </a>
      </div>
    </div>`;
  return col;
}

function renderCards(autores) {
  const container = document.getElementById('lista-autores');
  if (!container) return;
  container.innerHTML = '';
  if (autores.length === 0) {
    container.innerHTML = `<div class="col-12 text-center py-4 text-muted">Nenhum autor encontrado.</div>`;
    return;
  }
  autores.forEach(autor => container.appendChild(createCard(autor)));
}

let todosAutores = [];

async function init() {
  todosAutores = await fetchItems();
  renderCards(todosAutores);
}

async function carregarDestaques() {
  const indicators = document.getElementById('carousel-indicators');
  const inner = document.getElementById('carousel-inner');
  if (!indicators || !inner) return;
  const res = await fetch(`${API}/autores?destaque=true`);
  const destaques = await res.json();
  destaques.forEach((autor, i) => {
    indicators.innerHTML += `<button type="button" data-bs-target="#carouselDestaques" data-bs-slide-to="${i}" ${i === 0 ? 'class="active" aria-current="true"' : ''} aria-label="Slide ${i + 1}"></button>`;
    inner.innerHTML += `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <img src="${autor.imagem_principal}" class="d-block w-100" alt="${autor.nome}">
        <div class="carousel-caption">
          <span class="badge-genero">${autor.genero}</span>
          <h3>${autor.nome}</h3>
          <p>${autor.biografia}</p>
          <a href="detalhe.html?id=${autor.id}" class="btn-perfil" onclick="event.stopPropagation()">
            <i class="fa-solid fa-user"></i> Ver Perfil
          </a>
        </div>
      </div>`;
  });
}

function iniciarPesquisa() {
  const input = document.getElementById('input-pesquisa');
  const btn = document.getElementById('btn-pesquisa');
  if (!input || !btn) return;

  function executarPesquisa() {
    const termo = input.value.trim().toLowerCase();
    renderCards(!termo ? todosAutores : todosAutores.filter(a =>
      a.nome.toLowerCase().includes(termo) || a.biografia.toLowerCase().includes(termo)
    ));
  }

  btn.addEventListener('click', executarPesquisa);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') executarPesquisa(); });
}

async function carregarDetalhesAutor() {
  const container = document.getElementById('detalhe-autor');
  if (!container) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) { mostrarErroDetalhe(container); return; }
  const res = await fetch(`${API}/autores/${id}`);
  if (!res.ok) { mostrarErroDetalhe(container); return; }
  const autor = await res.json();
  document.title = `iBook — ${autor.nome}`;
  const seguidoresFormatado = autor.seguidores.toLocaleString('pt-BR');
  container.innerHTML = `
    <a href="index.html" class="btn-voltar"><i class="fa-solid fa-arrow-left"></i> Voltar para Autores</a>
    <div class="detalhe-header">
      <div class="row align-items-center g-4">
        <div class="col-12 col-md-auto text-center">
          <img src="${autor.imagem_principal}" alt="${autor.nome}" class="detalhe-foto"
            onerror="this.outerHTML='<div class=\\'detalhe-foto-placeholder\\'><i class=\\'fa-solid fa-user\\'></i></div>'">
        </div>
        <div class="col">
          <h1 class="detalhe-nome mb-1">${autor.nome}</h1>
          <span class="detalhe-genero">${autor.genero}</span>
          <p class="detalhe-bio">${autor.biografia}</p>
          <div class="detalhe-stats">
            <div class="stat-item"><div class="stat-label"><i class="fa-solid fa-flag me-1"></i>Nacionalidade</div><div class="stat-value">${autor.nacionalidade}</div></div>
            <div class="stat-item"><div class="stat-label"><i class="fa-solid fa-calendar me-1"></i>Início da Carreira</div><div class="stat-value">${autor.inicioCarreira}</div></div>
            <div class="stat-item"><div class="stat-label"><i class="fa-solid fa-book me-1"></i>Obras Cadastradas</div><div class="stat-value">${autor.obras.length} obras</div></div>
            <div class="stat-item"><div class="stat-label"><i class="fa-solid fa-users me-1"></i>Seguidores</div><div class="stat-value">${seguidoresFormatado}</div></div>
          </div>
        </div>
      </div>
    </div>`;
  carregarObrasAutor(autor);
}

function mostrarErroDetalhe(container) {
  container.innerHTML = `<div class="text-center py-5">
    <i class="fa-solid fa-circle-exclamation fa-3x text-laranja mb-3"></i>
    <h3>Autor não encontrado</h3>
    <p class="text-muted">O id informado na URL não corresponde a nenhum autor cadastrado.</p>
    <a href="index.html" class="btn-voltar mt-3"><i class="fa-solid fa-arrow-left"></i> Voltar</a>
  </div>`;
}

function carregarObrasAutor(autor) {
  const container = document.getElementById('lista-obras');
  if (!container) return;
  container.innerHTML = '';
  autor.obras.forEach(obra => {
    const col = document.createElement('div');
    col.className = 'col';
    col.innerHTML = `
      <div class="card-obra-item">
        <img src="${obra.imagem}" alt="${obra.titulo}"
          onerror="this.outerHTML='<div class=\\'img-placeholder\\'><i class=\\'fa-solid fa-book\\'></i></div>'">
        <div class="card-body">
          <h3 class="obra-titulo">${obra.titulo}</h3>
          <p class="obra-ano"><i class="fa-solid fa-calendar-days me-1"></i>${obra.ano}</p>
          <p class="obra-desc">${obra.descricao}</p>
        </div>
      </div>`;
    container.appendChild(col);
  });
}

async function salvarNovoAutor(e) {
  e.preventDefault();
  const msg = document.getElementById('msg-feedback');
  const payload = {
    nome: document.getElementById('form-nome').value,
    genero: document.getElementById('form-genero').value,
    biografia: document.getElementById('form-biografia').value,
    nacionalidade: document.getElementById('form-nacionalidade').value,
    inicioCarreira: parseInt(document.getElementById('form-inicio').value) || 0,
    seguidores: parseInt(document.getElementById('form-seguidores').value) || 0,
    imagem_principal: document.getElementById('form-imagem').value,
    destaque: document.getElementById('form-destaque').checked,
    obras: []
  };
  try {
    const res = await fetch(`${API}/autores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error();
    msg.style.display = 'block';
    msg.className = 'alert alert-success';
    msg.textContent = 'Autor cadastrado com sucesso!';
    e.target.reset();
    setTimeout(() => { window.location.href = 'index.html'; }, 1500);
  } catch {
    msg.style.display = 'block';
    msg.className = 'alert alert-danger';
    msg.textContent = 'Erro ao cadastrar autor. Verifique se o servidor está rodando.';
  }
}

async function carregarGrafico() {
  const res = await fetch(`${API}/autores`);
  const autores = await res.json();

  const AZUL = '#2C3B4D';
  const LARANJA = '#FFB162';
  const MARROM = '#A35139';

  // Gráfico 1: autores por gênero literário
  const generoMap = {};
  autores.forEach(a => { generoMap[a.genero] = (generoMap[a.genero] || 0) + 1; });
  const generoLabels = Object.keys(generoMap);
  const generoDados = Object.values(generoMap);

  const ctx1 = document.getElementById('grafico-generos')?.getContext('2d');
  if (ctx1) {
    new Chart(ctx1, {
      type: 'bar',
      data: {
        labels: generoLabels,
        datasets: [{
          label: 'Autores',
          data: generoDados,
          backgroundColor: LARANJA,
          borderColor: AZUL,
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            ticks: { font: { family: 'Poppins', size: 11 }, color: AZUL },
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { stepSize: 1, font: { family: 'Poppins', size: 11 }, color: AZUL },
            grid: { color: 'rgba(44, 59, 77, 0.1)' }
          }
        }
      }
    });
  }

  // Gráfico 2: top 5 por seguidores (horizontal)
  const top5 = [...autores].sort((a, b) => b.seguidores - a.seguidores).slice(0, 5);
  const ctx2 = document.getElementById('grafico-seguidores')?.getContext('2d');
  if (ctx2) {
    new Chart(ctx2, {
      type: 'bar',
      data: {
        labels: top5.map(a => a.nome),
        datasets: [{
          label: 'Seguidores',
          data: top5.map(a => a.seguidores),
          backgroundColor: AZUL,
          borderColor: '#1B2632',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ' ' + ctx.raw.toLocaleString('pt-BR') + ' seguidores'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              font: { family: 'Poppins', size: 11 },
              color: AZUL,
              callback: v => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v
            },
            grid: { color: 'rgba(44, 59, 77, 0.1)' }
          },
          y: {
            ticks: { font: { family: 'Poppins', size: 11 }, color: AZUL },
            grid: { display: false }
          }
        }
      }
    });
  }
}

function iniciarNavScroll() {
  const navLinks = document.querySelectorAll('.navbar .nav-link[href^="#"]');
  const secoes = ['destaques', 'autores', 'sobre'];
  function atualizarAtivo() {
    let atual = secoes[0];
    for (const id of secoes) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top <= 80) atual = id;
    }
    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${atual}`));
  }
  document.addEventListener('scroll', atualizarAtivo, { passive: true });
  atualizarAtivo();
}

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  if (path.includes('detalhe.html')) {
    carregarDetalhesAutor();
  } else if (path.includes('cadastro_autor.html')) {
    document.getElementById('form-autor')?.addEventListener('submit', salvarNovoAutor);
  } else if (path.includes('visualizacao.html')) {
    carregarGrafico();
  } else {
    carregarDestaques();
    init();
    iniciarPesquisa();
    iniciarNavScroll();
  }
});
