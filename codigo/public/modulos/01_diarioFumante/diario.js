document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "http://localhost:3000";
  const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
  const form = document.getElementById('form-diario');
  const botaoApagar = document.getElementById('btn-apagar');
  const listaEntradas = document.getElementById('lista-entradas');

  if (!usuarioLogado || !usuarioLogado.id) {
    alert("Você precisa estar logado para ver o diário.");
    window.location.href = "/codigo/public/modulos/02_login/login.html";
    return;
  }

  function formatarData(timestamp) {
    const data = new Date(timestamp);
    return data.toLocaleDateString('pt-BR');
  }
  /*montagem da pagina do Diário*/
  async function carregarEntradas() {
    try {
      const res = await fetch(`${API_URL}/diarioFumante?_sort=data&_order=desc`);
      const dados = await res.json();
      const entradasUsuario = dados.filter(item => item.usuarioId === usuarioLogado.id);

      listaEntradas.innerHTML = '';

      if (entradasUsuario.length === 0) {
        listaEntradas.innerHTML = '<p>Você ainda não escreveu no diário.</p>';
        return;
      }

      entradasUsuario.forEach((item) => {
        const div = document.createElement("div");
        div.style.marginBottom = "20px";
        div.innerHTML = `
          <h1 style="font-size: 1.8rem; font-family: Poppins;">${item.titulo}</h1>
          <p><strong>${item.humor}</strong> - <em>${formatarData(item.data)}</em></p>
          <p>${item.conteudo}</p>
          <hr/>
        `;
        listaEntradas.appendChild(div);
      });
    } catch (err) {
      console.error("Erro ao buscar os depoimentos:", err);
    }
  }  
  /* Pagina Inicial */
  async function carregarResumoDiario() {
    try {
      const resposta = await fetch(`${API_URL}/diarioFumante`);
      const dados = await resposta.json();
      const entradasUsuario = dados.filter(item => item.usuarioId === usuarioLogado.id);
      const ultimos = entradasUsuario.sort((a, b) => b.data - a.data).slice(0, 2);
      const container = document.querySelector(".conteudo");
      if (!container) return;

      container.innerHTML = `
        <h1 style="font-size: 1.7rem; margin-bottom: 1rem; font-weight: 600; color: var(--azul-escuro); border-bottom: 2px solid var(--verde-claro);
          padding-bottom: 0.5rem;" class="tituloDiario">Meu Diário 
          <a href="/codigo/public/modulos/01_diarioFumante/diario.html" style="text-decoration: none;">
            <i class="fa-solid fa-book" style="cursor: pointer; color: #a8c9a1; transition: color 0.3s;" onmouseover="this.style.color='#0b633a'" onmouseout="this.style.color='#a8c9a1'"></i>
          </a>
        </h1>
      `;

      ultimos.forEach(item => {
        const card = document.createElement("div");
        card.classList.add("card", "mb-3");
        const dataFormatada = formatarData(item.data);
        card.innerHTML = `
          <div class="card-header">${item.titulo}</div>
          <div class="card-body">
            <figure>
              <blockquote class="blockquote">
                <p>${item.conteudo}</p>
              </blockquote>
              <figcaption class="blockquote-footer">
                <cite title="Data">${dataFormatada}</cite>
              </figcaption>
            </figure>
          </div>
        `;
        container.appendChild(card);
      });
    } catch (erro) {
      console.error("Erro ao carregar o diário:", erro);
    }
  }

  if (form && listaEntradas) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const titulo = document.getElementById('titulo').value.trim();
      const conteudo = document.getElementById('conteudo').value.trim();
      const humor = document.getElementById('humor').value;
      const data = Date.now();

      if (!titulo || !conteudo || !humor) {
        alert("Preencha todos os campos!");
        return;
      }

      const novaEntrada = {
        titulo,
        conteudo,
        humor,
        data,
        usuario: usuarioLogado.nome,
        usuarioId: usuarioLogado.id
      };

      try {
        const res = await fetch(`${API_URL}/diarioFumante`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(novaEntrada)
        });

        if (res.ok) {
          form.reset();
          carregarEntradas();
        } else {
          alert("Erro ao salvar o depoimento.");
        }
      } catch (err) {
        alert("Erro de conexão com o servidor.");
        console.error(err);
      }
    });

    carregarEntradas();

    botaoApagar?.addEventListener("click", () => {
      form.reset();
    });

  } else {
    carregarResumoDiario();
  }
});