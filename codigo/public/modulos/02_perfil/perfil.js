document.addEventListener('DOMContentLoaded', async () => {
    const editarBtn = document.getElementById('editar-perfil');
    const cancelarBtn = document.getElementById('cancelar');
    const form = document.getElementById('perfil-form');

    const nomeSpan = document.getElementById('perfil-nome');
    const emailSpan = document.getElementById('perfil-email');
    const telSpan = document.getElementById('perfil-tel');
    const categoriaSpan = document.getElementById('perfil-categoria');


    const inputNome = document.getElementById('nome');
    const inputEmail = document.getElementById('email');
    const inputTel = document.getElementById('phone');

    //para os profissionais da saude
    const blocoExtra = document.getElementById('profissional-extra');
    const inputEspecialidade = document.getElementById('especialidade');
    const inputCidade = document.getElementById('cidade');
    const inputEstado = document.getElementById('estado');
    const inputDescricao = document.getElementById('descricao');
    const inputWhatsapp = document.getElementById('whatsapp');

    const logoutBtn = document.getElementById('botao-logout');

    const API_URL_USUARIOS = "http://localhost:3000/usuarios";
    const API_URL_RANKING = "http://localhost:3000/rankingProfissionais";
    let usuarioAtual = null;

    const usuarioLogado = JSON.parse(localStorage.getItem('usuarioLogado'));

    if (logoutBtn && usuarioLogado) {
        logoutBtn.addEventListener('click', async () => {
            try {
                
                await fetch(`${API_URL_USUARIOS}/${usuarioLogado.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ logado: false })
                });

                localStorage.removeItem('usuarioLogado');
                window.location.href = "/codigo/public/modulos/02_login/login.html";
            } catch (erro) {
                console.error("Erro ao sair da conta:", erro);
                alert("Erro ao sair da conta.");
            }
        });
    }

    // Preencher campos com os dados do usuário
    function preencherCampos(usuario) {
        categoriaSpan.textContent = usuario.categoria || "Não informado";
        nomeSpan.textContent = usuario.nome || "";
        emailSpan.textContent = usuario.email || "";
        telSpan.textContent = usuario.telefone || "(não informado)";

        inputNome.value = usuario.nome || "";
        inputEmail.value = usuario.email || "";
        inputTel.value = usuario.telefone || "";

        preencherCamposProfissionais(usuario);
    }
    // Preencher campos extras dos profissionais
    function preencherCamposProfissionais(usuario) {
        if (usuario.categoria === "profissional" && blocoExtra) {
            blocoExtra.style.display = 'block';

            inputEspecialidade.value = usuario.especialidade || "";
            inputCidade.value = usuario.cidade || "";
            inputEstado.value = usuario.estado || "";
            inputDescricao.value = usuario.descricao || "";
            inputWhatsapp.value = usuario.whatsapp || "";

        } else if (blocoExtra) {
            blocoExtra.style.display = 'none';
        }
    }

    // Buscar o usuário logado do backend ou localStorage
    async function carregarUsuarioLogado() {
        try {
            const resposta = await fetch(`${API_URL_USUARIOS}?logado=true`);
            const usuarios = await resposta.json();

            if (usuarios.length === 0) {
                // Tenta pelo localStorage
                const usuarioSalvo = localStorage.getItem('usuarioLogado');
                if (usuarioSalvo) {
                    usuarioAtual = JSON.parse(usuarioSalvo);
                    preencherCampos(usuarioAtual);
                    return;
                }

                alert("Nenhum usuário logado encontrado.");
                window.location.href = "/codigo/public/modulos/02_login/login.html";
                return;
            }

            usuarioAtual = usuarios[0];
            preencherCampos(usuarioAtual);
        } catch (erro) {
            console.error("Erro ao carregar usuário logado:", erro);
            alert("Erro ao buscar dados do perfil.");
        }
    }

    // Mostrar formulário
    if (editarBtn) {
        editarBtn.addEventListener('click', () => {
            form.style.display = 'flex';
            editarBtn.style.display = 'none';
        });
    }

    // Cancelar edição
    if (cancelarBtn) {
        cancelarBtn.addEventListener('click', () => {
            form.style.display = 'none';
            editarBtn.style.display = 'inline-block';
            preencherCampos(usuarioAtual); // restaura valores originais
        });
    }

    // Salvar perfil
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const novosDados = {
                nome: inputNome.value.trim(),
                email: inputEmail.value.trim(),
                telefone: inputTel.value.trim()
            };

            if (usuarioAtual.categoria === "profissional") {
                Object.assign(novosDados, {
                    especialidade: inputEspecialidade.value.trim(),
                    cidade: inputCidade.value.trim(),
                    estado: inputEstado.value.trim(),
                    descricao: inputDescricao.value.trim(),
                    whatsapp: inputWhatsapp.value.trim(),

                });
            }

            try {
                const resposta = await fetch(`${API_URL_USUARIOS}/${usuarioAtual.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(novosDados)
                });

                if (!resposta.ok) throw new Error("Erro ao atualizar usuário");

                usuarioAtual = { ...usuarioAtual, ...novosDados };
                localStorage.setItem('usuarioLogado', JSON.stringify(usuarioAtual));
                preencherCampos(usuarioAtual);

                // Atualiza ou cria no rankingProfissionais
                if (usuarioAtual.categoria === "profissional") {
                    try {
                        const resRanking = await fetch(`${API_URL_RANKING}`);
                        const ranking = await resRanking.json();

                        const existente = ranking.find(p => p.email === novosDados.email);

                        const dadosRanking = {
                            id: existente?.id || Date.now().toString(),
                            nome: novosDados.nome,
                            especialidade: novosDados.especialidade,
                            cidade: novosDados.cidade,
                            estado: novosDados.estado,
                            descricao: novosDados.descricao,
                            whatsapp: novosDados.whatsapp,
                            email: novosDados.email,
                            certificadoVerificado: existente?.certificadoVerificado || false,
                            notaMedia: existente?.notaMedia || 0,
                            numeroAvaliacoes: existente?.numeroAvaliacoes || 0
                        };

                        const url = existente
                            ? `${API_URL_RANKING}/${existente.id}`
                            : `${API_URL_RANKING}`;

                        const metodo = existente ? "PUT" : "POST";

                        await fetch(url, {
                            method: metodo,
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify(dadosRanking)
                        });
                    } catch (erro) {
                        console.error("Erro ao salvar dados no ranking:", erro);
                        alert("Erro ao salvar informações profissionais.");
                    }
                }


                form.style.display = 'none';
                editarBtn.style.display = 'inline-block';

                alert("Perfil atualizado com sucesso!");

            } catch (erro) {
                console.error("Erro ao salvar alterações:", erro);
                alert("Falha ao salvar alterações.");
            }
        });
    }

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (!usuarioAtual) return;

            try {
                await fetch(`${API_URL_USUARIOS}/${usuarioAtual.id}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({ logado: false })
                });

                localStorage.clear();
                window.location.href = "/codigo/public/modulos/02_login/login.html";
            } catch (erro) {
                console.error("Erro ao sair:", erro);
                alert("Erro ao sair da conta.");
            }
        });
    }

    await carregarUsuarioLogado();
});
