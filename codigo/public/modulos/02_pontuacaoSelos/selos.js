document.addEventListener("DOMContentLoaded", () => {
  const areaSelos = document.getElementById("areaSelos");
  const pontosElemento = document.getElementById("pontuacaoUsuario");

  fetch("http://localhost:3000/usuarios")
    .then(res => res.json())
    .then(usuarios => {
      const usuario = usuarios.find(u => u.logado === true);
      if (!usuario) return;

      const pontos = usuario.pontos ?? 0;
      const userId = usuario.id;
      const selosDoBanco = usuario.selos || [];
      const selosVisuais = verificarSelos(pontos);
      const novosSelos = selosVisuais.filter(selo => !selosDoBanco.includes(selo));

      // Atualiza os pontos no cabeçalho
      if (pontosElemento) pontosElemento.textContent = pontos;

      // Renderiza selos no cabeçalho (se existir a área)
      renderizarSelos([...selosDoBanco, ...novosSelos]);

      // Atualiza no banco se novos selos foram conquistados
      if (novosSelos.length > 0) {
        fetch(`http://localhost:3000/usuarios/${userId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ selos: [...selosDoBanco, ...novosSelos] })
        })
          .then(res => res.json())
          .then(novo => console.log("Selos atualizados no banco:", novo.selos));
      }

      // Atualiza o painel de conquistas (se estiver na página de perfil)
      const painelPontos = document.getElementById("pontosPerfil");
      if (painelPontos) painelPontos.textContent = pontos;

      const painelSelos = document.getElementById("selosPerfil");
      if (painelSelos) {
        const emojiPorSelo = {
          bronze: "🥉",
          prata: "🥈",
          ouro: "🥇",
          diamante: "💎"
        };

        painelSelos.innerHTML = "";
        selosDoBanco.concat(novosSelos).forEach(selo => {
          const span = document.createElement("span");
          span.textContent = emojiPorSelo[selo] || "🎖️";
          span.title = selo.charAt(0).toUpperCase() + selo.slice(1);
          painelSelos.appendChild(span);
        });
      }
    });

  function verificarSelos(pontos) {
    const selos = [];
    if (pontos >= 50) selos.push("bronze");
    if (pontos >= 100) selos.push("prata");
    if (pontos >= 150) selos.push("ouro");
    if (pontos >= 250) selos.push("diamante");
    return selos;
  }

  function renderizarSelos(selos) {
    if (!areaSelos) return;

    const emojiPorSelo = {
      bronze: "🥉",
      prata: "🥈",
      ouro: "🥇",
      diamante: "💎"
    };

    areaSelos.innerHTML = "";
    selos.forEach(nome => {
      const li = document.createElement("li");
      li.textContent = emojiPorSelo[nome] || "🎖️";
      li.title = `Selo ${nome}`;
      li.style.fontSize = "20px";
      li.style.lineHeight = "1";
      li.style.marginRight = "6px";
      areaSelos.appendChild(li);
    });
  }
});
