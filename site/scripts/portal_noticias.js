const API_URL = "http://localhost:3000"; 

/*=================== USUÁRIO ===================*/
function getUsuarioLogado() {
  const usuario = localStorage.getItem("usuarioLogado");
  return usuario ? JSON.parse(usuario) : null;
}

function isAdmin() {
  const usuario = getUsuarioLogado();
  return usuario && (usuario.categoria === "saude" || usuario.categoria === "profissional");
}

/*=================== CACHE ===================*/
function salvarNoticiasLocal(noticias) {
  localStorage.setItem("noticias_cache", JSON.stringify(noticias));
}

function lerNoticiasLocal() {
  const dados = localStorage.getItem("noticias_cache");
  return dados ? JSON.parse(dados) : [];
}

/*=================== FETCH ===================*/
async function fetchNoticias() {
  try {
    const response = await fetch(`${API_URL}/noticias`);
    const dados = await response.json();
    salvarNoticiasLocal(dados);
    return dados;
  } catch {
    return lerNoticiasLocal();
  }
}

async function fetchFiltros() {
  const response = await fetch(`${API_URL}/filtros`);
  return await response.json();
}

/*=================== PORTAL DE NOTÍCIAS ===================*/
const listaNoticias = document.getElementById('listaNoticias');
if (listaNoticias) {
  const filtros = {
    ano: document.getElementById('filtroAno'),
    assunto: document.getElementById('filtroAssunto'),
    pais: document.getElementById('filtroPais'),
    fonte: document.getElementById('filtroFonte')
  };

  const ordenarSelect = document.getElementById('ordenarPor');
  const btnLimpar = document.getElementById('limparFiltros');
  const btnVoltarTopo = document.getElementById('voltarTopo');

  async function carregarFiltros() {
    try {
      const dadosFiltros = await fetchFiltros();
      Object.keys(filtros).forEach(filtro => {
        dadosFiltros[filtro].forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.id;
          opt.textContent = item.nome;
          filtros[filtro].appendChild(opt);
        });
      });
    } catch (error) {
      console.error("Erro ao carregar filtros:", error);
    }
  }

  async function renderNoticias() {
    try {
      let noticias = await fetchNoticias();
      let filtradas = [...noticias];

      Object.entries(filtros).forEach(([key, select]) => {
        const val = select.value;
        if (val) filtradas = filtradas.filter(n => n[`${key}Id`] == val);
      });

      const ordenacao = ordenarSelect.value;
      if (ordenacao === "maisRecente") {
        filtradas.sort((a, b) => new Date(b.data) - new Date(a.data));
      } else if (ordenacao === "maisAntigo") {
        filtradas.sort((a, b) => new Date(a.data) - new Date(b.data));
      } else if (ordenacao === "maisPopulares") {
        filtradas.sort((a, b) => b.popularidade - a.popularidade);
      }

      listaNoticias.innerHTML = "";
      if (filtradas.length === 0) {
        listaNoticias.innerHTML = "<p>Nenhuma notícia encontrada com os filtros selecionados.</p>";
        return;
      }

      filtradas.forEach(n => {
        const card = document.createElement('div');
        card.className = 'card';
        card.onclick = () => {
          window.location.href = `detalhes_noticias.html?id=${n.id}`;
        };
        card.innerHTML = `
          <img src="${n.imagem}" alt="Imagem da notícia">
          <div>
            <h3>${n.titulo}</h3>
            <p><strong>${n.data}</strong> - ${n.fonte} - ${n.autor}</p>
            <p>${n.descricao}</p>
          </div>
        `;
        listaNoticias.appendChild(card);
      });
    } catch (error) {
      console.error("Erro ao renderizar notícias:", error);
      listaNoticias.innerHTML = "<p>Erro ao carregar notícias. Tente novamente mais tarde.</p>";
    }
  }

  Object.values(filtros).forEach(select => select.addEventListener('change', renderNoticias));
  ordenarSelect.addEventListener('change', renderNoticias);

  if (btnLimpar) {
    btnLimpar.addEventListener('click', () => {
      Object.values(filtros).forEach(select => (select.value = ""));
      ordenarSelect.value = "maisRecente";
      renderNoticias();
    });
  }

  if (btnVoltarTopo) {
    btnVoltarTopo.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => {
      btnVoltarTopo.style.display = window.scrollY > 200 ? 'block' : 'none';
    });
  }

  carregarFiltros();
  renderNoticias();
}

/*=================== BOTÃO ADICIONAR NOTÍCIA ===================*/
const modal = document.getElementById("modalNoticia");
const closeModalBtn = document.querySelector(".close");

const btnAdicionar = document.getElementById("btnAdicionar");
if (btnAdicionar) {
  if (!isAdmin()) {
    btnAdicionar.style.display = "none";
  } else {
    btnAdicionar.addEventListener("click", () => {
      document.getElementById("modalTitle").textContent = 'Adicionar Nova Notícia';
      document.getElementById("noticiaForm").reset();
      document.getElementById("noticiaId").value = '';
      modal.style.display = 'block';
      modal.scrollTop = 0;
      document.body.style.overflow = 'hidden';
    });
  }
}

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  });
}

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
});

/*=================== FORMULÁRIO ===================*/
const form = document.getElementById("noticiaForm");

if (form) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    if (!isAdmin()) {
      alert("Você não tem permissão para adicionar notícias.");
      return;
    }

    const nomeFonte = document.getElementById("fonte").value.trim();
    let fonteIdCalculado = null;

    try {
      const response = await fetch(`${API_URL}/filtros`);
      const filtros = await response.json();
      const fonteEncontrada = filtros.fonte.find(f => f.nome.toLowerCase() === nomeFonte.toLowerCase());
      if (fonteEncontrada) {
        fonteIdCalculado = fonteEncontrada.id;
      } else {
        alert("Fonte não encontrada. Por favor, digite exatamente como está cadastrada.");
        return;
      }
    } catch (error) {
      alert("Erro ao buscar lista de fontes: " + error.message);
      return;
    }

    const novaNoticia = {
      titulo: document.getElementById("titulo").value,
      descricao: document.getElementById("descricao").value,
      conteudo: document.getElementById("conteudo").value,
      imagem: document.getElementById("imagem").value,
      data: document.getElementById("data").value,
      fonte: nomeFonte,
      autor: document.getElementById("autor").value,
      anoId: Number(document.getElementById("anoId").value),
      assuntoId: Number(document.getElementById("assuntoId").value),
      paisId: Number(document.getElementById("paisId").value),
      fonteId: fonteIdCalculado,
      popularidade: 0,
      visualizacoes: 0
    };

    try {
      const response = await fetch(`${API_URL}/noticias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(novaNoticia)
      });

      if (!response.ok) throw new Error("Erro ao salvar notícia");

      alert("Notícia adicionada com sucesso!");
      modal.style.display = "none";
      document.body.style.overflow = "";

      if (typeof renderNoticias === "function") renderNoticias();

    } catch (error) {
      alert("Erro ao adicionar notícia: " + error.message);
    }
  });
}

/*=================== CARROSSEL INDEX ===================*/
const carouselDiv = document.getElementById('carouselNoticias');

if (carouselDiv) {
  async function carregarCarrosselIndex() {
    try {
      const noticias = await fetchNoticias();
      const ultimasNoticias = noticias
        .sort((a, b) => new Date(b.data) - new Date(a.data))
        .slice(0, 4);

      if (ultimasNoticias.length === 0) {
        carouselDiv.innerHTML = "<p>Sem notícias disponíveis.</p>";
        return;
      }

      const estrutura = document.createElement('div');
      estrutura.className = 'carousel slide';
      estrutura.id = 'carouselNoticiasInner';
      estrutura.setAttribute('data-bs-ride', 'carousel');

      const carouselInner = document.createElement('div');
      carouselInner.className = 'carousel-inner';

      ultimasNoticias.forEach((noticia, index) => {
        const item = document.createElement('div');
        item.className = index === 0 ? 'carousel-item active' : 'carousel-item';

        item.innerHTML = `
          <div class="card shadow mx-auto" style="max-width: 600px;">
            <img src="${noticia.imagem}" class="card-img-top" alt="${noticia.titulo}">
            <div class="card-body">
              <h5 class="card-title">
                <a href="/codigo/public/modulos/01_portal_notícias/detalhes_noticias.html?id=${noticia.id}" 
                   style="text-decoration: none; color: inherit;">
                  ${noticia.titulo}
                </a>
              </h5>
              <p class="card-text">${noticia.descricao}</p>
            </div>
          </div>
        `;

        carouselInner.appendChild(item);
      });

      estrutura.appendChild(carouselInner);

      const btnPrev = document.createElement('button');
      btnPrev.className = 'carousel-control-prev';
      btnPrev.type = 'button';
      btnPrev.setAttribute('data-bs-target', '#carouselNoticiasInner');
      btnPrev.setAttribute('data-bs-slide', 'prev');
      btnPrev.innerHTML = `
        <span class="carousel-control-prev-icon"></span>
        <span class="visually-hidden">Anterior</span>
      `;

      const btnNext = document.createElement('button');
      btnNext.className = 'carousel-control-next';
      btnNext.type = 'button';
      btnNext.setAttribute('data-bs-target', '#carouselNoticiasInner');
      btnNext.setAttribute('data-bs-slide', 'next');
      btnNext.innerHTML = `
        <span class="carousel-control-next-icon"></span>
        <span class="visually-hidden">Próximo</span>
      `;

      estrutura.appendChild(btnPrev);
      estrutura.appendChild(btnNext);

      carouselDiv.appendChild(estrutura);
    } catch (error) {
      console.error('Erro ao carregar carrossel de notícias:', error);
      carouselDiv.innerHTML = '<p>Erro ao carregar notícias.</p>';
    }
  }

  carregarCarrosselIndex();
}
