document.addEventListener('DOMContentLoaded', () => {
  const API_URL = "http://localhost:3000/depoimentos";

  let nomeUsuario = "Conta";
  try {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (usuarioLogado && usuarioLogado.nome) {
      nomeUsuario = usuarioLogado.nome;
    }
  } catch (err) {
    console.warn("Erro ao obter nome do usuário logado:", err);
  }

  document.querySelector('option[value="conta"]').textContent = nomeUsuario;



  async function carregarDepoimentos() {
    const resposta = await fetch(API_URL);
    const depoimentos = await resposta.json();

    const container = document.getElementById("lista-depoimentos");
    container.innerHTML = "";

    depoimentos.reverse().forEach(dep => {
      const autor = dep.nome ? dep.nome : "Anônimo";
      const data = new Date(dep.data).toLocaleString('pt-BR');

      const div = document.createElement("div");
      div.className = "depoimento";
      div.innerHTML = `
        <p class="autor">${autor}</p>
        <p>${dep.mensagem}</p>
        <p class="data">${data}</p>
      `;
      container.appendChild(div);
    });
  }

  document.getElementById("form-depoimento").addEventListener("submit", async (e) => {
    e.preventDefault();

    let nome = '';
    let usuarioId = null;

    // Tenta pegar usuário logado
    try {
      const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));
      if (usuarioLogado) {
        nome = usuarioLogado.nome || '';
        usuarioId = usuarioLogado.id || null;
      }
    } catch (err) {
      console.warn('Erro ao ler usuário logado:', err);
    }

    // Verifica a opção escolhida (anônimo ou nome da conta)
    const identidade = document.getElementById("identidade").value;
    if (identidade === "anonimo") {
      nome = "Anônimo";
    }

    const mensagem = document.getElementById("mensagem").value.trim();
    if (!mensagem) return;

    const dataAtual = new Date().toISOString();

    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        mensagem,
        data: dataAtual,
        usuarioId: usuarioId
      })
    });

    document.getElementById("form-depoimento").reset();
    carregarDepoimentos();
  });

  carregarDepoimentos();
});
