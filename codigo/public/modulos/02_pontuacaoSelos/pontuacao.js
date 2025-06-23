document.addEventListener("DOMContentLoaded", () => {
    const btn = document.querySelector(".btn-desafio");
    const pontosElemento = document.getElementById("pontuacaoUsuario");

    fetch("http://localhost:3000/usuarios")
        .then(res => res.json())
        .then(usuarios => {
            let usuarioLogado = usuarios.find(u => u.logado === true);

            if (!usuarioLogado) {
                console.error("Nenhum usuário está logado!");
                return;
            }

            const userId = usuarioLogado.id;

            // Função para garantir que o campo 'pontos' exista
            const inicializarPontosSeNecessario = () => {
                if (usuarioLogado.pontos === undefined) {
                    return fetch(`http://localhost:3000/usuarios/${userId}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ pontos: 0 })
                    })
                    .then(resp => resp.json())
                    .then(usuarioAtualizado => {
                        usuarioLogado = usuarioAtualizado;
                        pontosElemento.textContent = 0;
                    });
                } else {
                    pontosElemento.textContent = usuarioLogado.pontos;
                    return Promise.resolve();
                }
            };

            inicializarPontosSeNecessario().then(() => {
                const desafioTitulo = document.querySelector(".conteudo-desafio strong").textContent;

                fetch("http://localhost:3000/desafios")
                    .then(res => res.json())
                    .then(desafios => {
                        const desafioSemanal = desafios.find(d => d.titulo === desafioTitulo);

                        if (!desafioSemanal) {
                            console.error("Desafio não encontrado!");
                            return;
                        }

                        const pontosDesafio = desafioSemanal.pontos;

                        btn.addEventListener("click", () => {
                            const novaPontuacao = (usuarioLogado.pontos ?? 0) + pontosDesafio;

                            fetch(`http://localhost:3000/usuarios/${userId}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ pontos: novaPontuacao })
                            })
                            .then(resp => resp.json())
                            .then(dadosAtualizados => {
                                usuarioLogado.pontos = dadosAtualizados.pontos;
                                pontosElemento.textContent = dadosAtualizados.pontos;
                                console.log("Pontuação atualizada:", dadosAtualizados.pontos);
                            })
                            .catch(error => console.error("Erro ao atualizar pontuação:", error));
                        });
                    })
                    .catch(error => console.error("Erro ao buscar desafio:", error));
            });
        })
        .catch(error => console.error("Erro ao buscar usuários:", error));
});
