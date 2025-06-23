const API_URL = "http://localhost:3000"; // Use seu IP depois

async function fetchNoticiaById(id) {
  try {
    const response = await fetch(`${API_URL}/noticias/${id}`);
    if (!response.ok) throw new Error();
    return await response.json();
  } catch {
    const dados = localStorage.getItem("noticias_cache");
    if (dados) {
      const noticias = JSON.parse(dados);
      return noticias.find(n => String(n.id) === String(id));
    }
    return null;
  }
}

const detalheContainer = document.getElementById('detalheNoticia');

if (detalheContainer) {
  const urlParams = new URLSearchParams(window.location.search);
  const noticiaId = urlParams.get('id');

  if (!noticiaId) {
    detalheContainer.innerHTML = "<h2>Notícia não encontrada. ID não informado.</h2>";
  } else {
    fetchNoticiaById(noticiaId)
      .then(noticia => {
        if (!noticia) {
          detalheContainer.innerHTML = "<h2>Notícia não encontrada.</h2>";
        } else {
          renderNewsDetails(detalheContainer, noticia);
          updateViews(noticiaId, noticia.visualizacoes);
        }
      })
      .catch(() => {
        detalheContainer.innerHTML = "<h2>Erro ao carregar notícia.</h2>";
      });
  }
}

function renderNewsDetails(container, noticia) {
  container.innerHTML = `
    <header class="article-header">
      <h1 class="article-title">${noticia.titulo}</h1>
      <div class="article-meta">
        <span><strong>Data:</strong> ${noticia.data}</span> |
        <span><strong>Fonte:</strong> ${noticia.fonte}</span> |
        ${noticia.autor ? `<span><strong>Autor:</strong> ${noticia.autor}</span> |` : ''}
        <span><strong>Visualizações:</strong> ${noticia.visualizacoes || 0}</span>
      </div>
    </header>
    <div class="article-image-container">
      <img src="${noticia.imagem}" alt="Imagem da notícia" class="article-image">
    </div>
    <div class="article-content">
      ${noticia.conteudo.split('\n').map(p => `<p>${p}</p>`).join('')}
    </div>
  `;
}

async function updateViews(id, currentViews) {
  try {
    await fetch(`${API_URL}/noticias/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visualizacoes: (currentViews || 0) + 1 })
    });
  } catch (error) {
    console.error("Erro ao atualizar visualizações:", error);
  }
}
