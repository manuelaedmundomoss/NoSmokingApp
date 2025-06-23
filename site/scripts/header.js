document.addEventListener('DOMContentLoaded', async () => {
    const API_URL = 'http://localhost:3000/usuarios';

    // ---------------------
    // VERIFICAÇÃO DE LOGIN
    let usuarioLogado = null;

    try {
        const res = await fetch(API_URL);
        const usuarios = await res.json();
        usuarioLogado = usuarios.find(usuario => usuario.logado === true);

        if (!usuarioLogado) {
            window.location.href = '/site/paginas/login.html';
            return;
        }

        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    } catch (erro) {
        console.error('Erro ao verificar login dos usuários:', erro);
        window.location.href = '/site/paginas/login.html';
        return;
    }

    const usuarioId = usuarioLogado.id;

    // ---------------------
    // FUNÇÃO PARA SAIR DA CONTA
    async function sairDaConta(event) {
        event.preventDefault();
        console.log('Saindo da conta...');

        try {
            await fetch(`${API_URL}/${usuarioId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ logado: false })
            });

            localStorage.removeItem('usuarioLogado');

            // Fecha o offcanvas se estiver aberto (versão bootstrap)
            const offcanvasElement = document.getElementById('menuMobileOffcanvas');
            if (offcanvasElement && offcanvasElement.classList.contains('show')) {
                try {
                    const offcanvas = bootstrap.Offcanvas.getInstance(offcanvasElement)
                        || new bootstrap.Offcanvas(offcanvasElement);
                    offcanvas.hide();
                } catch (e) {
                    console.warn('Bootstrap Offcanvas não pôde ser fechado. Prosseguindo...');
                }
            }

            window.location.href = '/site/paginas/login.html';
        } catch (error) {
            console.error('Erro ao sair da conta:', error);
            alert('Erro ao sair da conta.');
        }
    }

    // ---------------------
    // ADICIONA EVENTO AOS BOTÕES
    const botoesLogout = [
        { id: 'sair-conta', nome: 'desktop' },
        { id: 'sair-conta-mobile', nome: 'mobile' }
    ];

    botoesLogout.forEach(({ id, nome }) => {
        const btn = document.getElementById(id);
        if (btn) {
            console.log(`Botão de logout (${nome}) encontrado.`);
            btn.addEventListener('click', sairDaConta);
        } else {
            console.warn(`Botão de logout (${nome}) NÃO encontrado.`);
        }
    });

    // ---------------------
    // MENU DO PERFIL
    const perfilIcon = document.getElementById('perfil');
    const menuPerfil = document.getElementById('menuPerfil');
    const fecharPerfil = document.getElementById('fechar-perfil');

    if (perfilIcon && menuPerfil && fecharPerfil) {
        perfilIcon.addEventListener('click', () => {
            menuPerfil.style.display = 'block';
        });

        fecharPerfil.addEventListener('click', (e) => {
            e.preventDefault();
            menuPerfil.style.display = 'none';
        });
    }
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
                const btn = document.getElementById("botaoDesafio");

                fetch("http://localhost:3000/desafios")
                    .then(res => res.json())
                    .then(desafios => {
                        const desafioSemanal = desafios.find(d => d.titulo === desafioTitulo);

                        if (!desafioSemanal) {
                            console.error("Desafio não encontrado!");
                            return;
                        }

                        const pontosDesafio = desafioSemanal.pontos;

                        if (btn && !btn.disabled) {
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
                        }

                    })
                    .catch(error => console.error("Erro ao buscar desafio:", error));
            });
        })
        .catch(error => console.error("Erro ao buscar usuários:", error));
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
