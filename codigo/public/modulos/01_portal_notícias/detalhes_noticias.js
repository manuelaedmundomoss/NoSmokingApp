const API_URL = "http://localhost:3000"; 

function getUsuarioLogado() {
  const usuario = localStorage.getItem("usuarioLogado");
  return usuario ? JSON.parse(usuario) : null;
}

function isAdmin() {
  const usuario = getUsuarioLogado();
  return usuario && (usuario.categoria === "saude" || usuario.categoria === "profissional");
}

function lerNoticiasLocal() {
  const dados = localStorage.getItem("noticias_cache");
  return dados ? JSON.parse(dados) : [];
}

async function fetchNoticiaById(id) {
  try {
    const response = await fetch(`${API_URL}/noticias/${id}`);
    if (!response.ok) throw new Error();
    return await response.json();
  } catch {
    const local = lerNoticiasLocal();
    return local.find(n => String(n.id) === String(id));
  }
}

const detalheContainer = document.getElementById('detalheNoticia');

if (detalheContainer) {
  const urlParams = new URLSearchParams(window.location.search);
  const noticiaId = urlParams.get('id');

  if (!noticiaId) {
    detalheContainer.innerHTML = "<h2>Notícia não encontrada.</h2>";
  } else {
    fetchNoticiaById(noticiaId)
      .then(noticia => {
        renderNewsDetails(detalheContainer, noticia);
        updateViews(noticiaId, noticia.visualizacoes);
      })
      .catch(() => {
        detalheContainer.innerHTML = "<h2>Erro ao carregar notícia.</h2>";
      });
  }
}

function renderNewsDetails(container, noticia) {
  const botoesAdmin = isAdmin() ? `
    <div style="margin-top:10px;">
      <button class="btn btn-delete" onclick="excluirNoticia('${noticia.id}')">Excluir Notícia</button>
    </div>` : '';

  container.innerHTML = `
    <header class="article-header">
      <h1 class="article-title">${noticia.titulo}</h1>
      <div class="article-meta">
        <span class="meta-item"><strong>Data:</strong> ${noticia.data}</span>
        <span class="meta-item"><strong>Fonte:</strong> ${noticia.fonte}</span>
        ${noticia.autor ? `<span class="meta-item"><strong>Autor:</strong> ${noticia.autor}</span>` : ''}
        <span class="meta-item"><strong>Visualizações:</strong> ${noticia.visualizacoes || 0}</span>
      </div>
      ${botoesAdmin}
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

async function excluirNoticia(id) {
  if (!isAdmin()) {
    alert("Você não tem permissão para excluir notícias.");
    return;
  }

  if (confirm("Tem certeza que deseja excluir esta notícia?")) {
    try {
      const response = await fetch(`${API_URL}/noticias/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error("Erro ao excluir notícia");
      alert("Notícia excluída com sucesso!");
      window.location.href = "/codigo/public/modulos/01_portal_notícias/portal_noticias.html";
    } catch (error) {
      alert("Erro ao excluir: " + error.message);
    }
  }
}
