const API_URL = "http://localhost:3000"; // Troque pelo seu IP se for acessar na rede

async function fetchNoticias() {
  try {
    const response = await fetch(`${API_URL}/noticias`);
    const dados = await response.json();
    return dados;
  } catch {
    const dados = localStorage.getItem("noticias_cache");
    return dados ? JSON.parse(dados) : [];
  }
}

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
