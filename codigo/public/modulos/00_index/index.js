// SCRIPT COM:
//Verificação de login
//Sair da conta
//Contador
//Projeção do futuro
//Desafios semanais

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
            window.location.href = '/codigo/public/modulos/02_login/login.html';
            return;
        }

        // Armazena localmente se quiser reaproveitar
        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    } catch (erro) {
        console.error('Erro ao verificar login dos usuários:', erro);
        window.location.href = '/codigo/public/modulos/02_login/login.html';
        return;
    }

    const usuarioId = usuarioLogado.id;

    // ---------------------
    // SAIR DA CONTA
    const sairConta = document.getElementById('sair-conta');
    if (sairConta) {
        sairConta.addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await fetch(`${API_URL}/${usuarioId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ logado: false })
                });

                localStorage.removeItem('usuarioLogado');
                window.location.href = '/codigo/public/modulos/02_login/login.html';
            } catch (error) {
                console.error('Erro ao sair da conta:', error);
                alert('Erro ao sair da conta.');
            }
        });
    }

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

    // ---------------------
    // CONTADOR DE TEMPO SEM FUMAR
    const plantinha = document.getElementById('plantinha');

    const dias = document.getElementById('dias');
    const horas = document.getElementById('horas');
    const minutos = document.getElementById('minutos');
    const segundos = document.getElementById('segundos');
    const botaoIniciar = document.getElementById('botaoIniciar');
    const botaoResetar = document.getElementById('botaoResetar');
    const popup = document.getElementById('popup');
    const botaoConfirma = document.getElementById('Confirma');
    const botaoFechar = document.getElementById('FecharPopup');

    let intervaloId;

    function atualizarContador(tempoSemFumar) {
        clearInterval(intervaloId);

        intervaloId = setInterval(() => {
            const agora = new Date();
            const diff = agora - new Date(tempoSemFumar);

            const d = Math.floor(diff / (1000 * 60 * 60 * 24));
            const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
            const m = Math.floor((diff / (1000 * 60)) % 60);
            const s = Math.floor((diff / 1000) % 60);

            dias.textContent = d.toString().padStart(2, '0');
            horas.textContent = h.toString().padStart(2, '0');
            minutos.textContent = m.toString().padStart(2, '0');
            segundos.textContent = s.toString().padStart(2, '0');
            atualizarImagemPlanta(d);
        }, 1000);
    }

    async function iniciarContador() {
        if (usuarioLogado && usuarioLogado.tempoSemFumar) {
            atualizarContador(usuarioLogado.tempoSemFumar);
        }
    }

    botaoIniciar.addEventListener('click', () => {
        popup.showModal();
    });

    botaoFechar.addEventListener('click', () => {
        popup.close();
    });

    botaoConfirma.addEventListener('click', async () => {
        const data = document.getElementById('data').value;
        const horario = document.getElementById('horario').value;

        if (!data || !horario) {
            alert("Preencha data e horário.");
            return;
        }

        const dataCompleta = new Date(`${data}T${horario}:00`);
        const agora = new Date();

        if (dataCompleta > agora) {
            alert("A data e horário não podem ser no futuro.");
            return;
        }

        try {
            await fetch(`${API_URL}/${usuarioId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempoSemFumar: dataCompleta.toISOString() })
            });

            usuarioLogado.tempoSemFumar = dataCompleta.toISOString();
            atualizarContador(dataCompleta);
            popup.close();
        } catch (error) {
            console.error("Erro ao salvar tempoSemFumar:", error);
        }
    });

    botaoResetar.addEventListener('click', async () => {
        try {
            await fetch(`${API_URL}/${usuarioId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tempoSemFumar: null })
            });

            clearInterval(intervaloId);
            dias.textContent = horas.textContent = minutos.textContent = segundos.textContent = "00";
        } catch (error) {
            console.error("Erro ao resetar contador:", error);
        }
    });

    function atualizarImagemPlanta(diasSemFumar) {
        let imagem = '/codigo/public/assets/images/planta1.png';

        if (diasSemFumar >= 360) {
            imagem = '/codigo/public/assets/images/planta7.png';
        } else if (diasSemFumar >= 210) {
            imagem = '/codigo/public/assets/images/planta6.png';
        } else if (diasSemFumar >= 150) {
            imagem = '/codigo/public/assets/images/planta5.png';
        } else if (diasSemFumar >= 90) {
            imagem = '/codigo/public/assets/images/planta4.png';
        } else if (diasSemFumar >= 30) {
            imagem = '/codigo/public/assets/images/planta3.png';
        } else if (diasSemFumar >= 14) {
            imagem = '/codigo/public/assets/images/planta2.png';
        } else if (diasSemFumar >= 7) {
            imagem = '/codigo/public/assets/images/planta1.png';
        } else {
            imagem = '/codigo/public/assets/images/planta1.png';
        }

        plantinha.src = imagem;
    }

    iniciarContador();

    // ---------------------
    // PROJEÇÃO DO FUTURO
    calcularProjecao(usuarioLogado);

    async function calcularProjecao(usuario) {
    try {
        const agora = new Date();
        let diasSemFumar = 0;

        // Só tenta calcular se houver valor em tempoSemFumar
        if (usuario.tempoSemFumar) {
            const dataParada = new Date(usuario.tempoSemFumar);
            if (!isNaN(dataParada.getTime())) {
                const diff = agora - dataParada;
                diasSemFumar = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
            } else {
                console.warn('Data inválida no JSON, considerando 0 dias sem fumar.');
            }
        } else {
            console.warn('tempoSemFumar ausente, considerando 0 dias sem fumar.');
        }

        let cigarrosEvitados = 0;

        if (usuario.perfilDeUso === 1) {
            const cigarrosPorDia = usuario.cigarrosPorDia || 0;
            cigarrosEvitados = diasSemFumar * cigarrosPorDia;
        } else if (usuario.perfilDeUso === 2) {
            const eventosPorMes = usuario.eventosPorMes || 0;
            const cigarrosPorEvento = usuario.cigarrosPorEvento || 0;
            const meses = diasSemFumar / 30;
            cigarrosEvitados = Math.floor(meses * eventosPorMes * cigarrosPorEvento);
        } else if (usuario.perfilDeUso === 3) {
            const situacoesPorMes = usuario.situacoesPorMes || 0;
            const cigarrosEstimados = usuario.cigarrosEstimadosPorSituacao || 0;
            const meses = diasSemFumar / 30;
            cigarrosEvitados = Math.floor(meses * situacoesPorMes * cigarrosEstimados);
        }

        const cigarrosPorMaco = usuario.cigarrosPorMaco || 1;
        const precoPorMaco = usuario.precoPorMaco || 0;

        const precoPorCigarro = precoPorMaco / cigarrosPorMaco;
        const dinheiroEconomizado = (cigarrosEvitados * precoPorCigarro).toFixed(2);

        document.getElementById('economia').textContent = `R$ ${dinheiroEconomizado}`;
        document.getElementById('cigarros-evitados').textContent = `${cigarrosEvitados}`;

        mostrarProjecaoDeSaude(diasSemFumar);
    } catch (erro) {
        console.error('Erro ao calcular projeção:', erro);
    }
}


    async function mostrarProjecaoDeSaude(diasSemFumar) {
        try {
            const res = await fetch('http://localhost:3000/projecaoDeSaude');
            const projecoes = await res.json();

            const aplicaveis = projecoes.filter(p => diasSemFumar >= p.tempoEmDias);
            const listaSaude = document.getElementById('lista-saude');
            listaSaude.innerHTML = '';

            if (aplicaveis.length === 0) {
                const item = document.createElement('li');
                item.textContent = "Ainda não houve mudanças significativas na sua saúde documentadas, mas continue firme! Cada dia conta!";
                listaSaude.appendChild(item);
                return;
            }

            aplicaveis.forEach(p => {
                const item = document.createElement('li');
                item.innerHTML = `${p.descricao} ${p.link ? `<a href="${p.link}" target="_blank">[ver estudo]</a>` : ''}`;
                listaSaude.appendChild(item);
            });
        } catch (err) {
            console.error('Erro ao buscar projeções de saúde:', err);
        }
    }

    // ---------------------
    // DESAFIOS SEMANAIS
    // Função para obter o número da semana atual do ano
    function getNumeroSemana(data) {
        const primeiroDia = new Date(data.getFullYear(), 0, 1);
        const diferenca = (data - primeiroDia) + ((primeiroDia.getDay() + 6) % 7) * 86400000;
        return Math.floor(diferenca / (7 * 86400000)) + 1;
    }

    // Dados dos desafios
    const desafios = [
        { "id": 1, "titulo": "Motivos para parar", "descricao": "Escreva uma lista com 10 motivos para parar de fumar e cole em um lugar visível.", "pontos": 10 },
        { "id": 2, "titulo": "Substituição consciente", "descricao": "Escolha um alimento saudável para substituir o cigarro quando sentir vontade. Use durante a semana.", "pontos": 10 },
        { "id": 3, "titulo": "Diário da vontade", "descricao": "Anote toda vez que sentir vontade de fumar. Registre horário, local e emoção. Reflita sobre os gatilhos.", "pontos": 12 },
        { "id": 4, "titulo": "Sem cigarro após o café", "descricao": "Durante essa semana, evite fumar após tomar café ou outras bebidas que costumam te dar vontade.", "pontos": 13 },
        { "id": 5, "titulo": "Caminhada antistress", "descricao": "Faça ao menos 3 caminhadas de 30 minutos nesta semana para reduzir a ansiedade.", "pontos": 14 },
        { "id": 6, "titulo": "Respiração consciente", "descricao": "Pratique respiração profunda ou meditação por 10 minutos, 5 dias da semana.", "pontos": 15 },
        { "id": 7, "titulo": "Livre de cinzeiros", "descricao": "Retire todos os cinzeiros, isqueiros e embalagens de cigarro visíveis da sua casa.", "pontos": 10 },
        { "id": 8, "titulo": "Conversa com ex-fumante", "descricao": "Converse com alguém que parou de fumar e pergunte como foi a experiência e as dificuldades.", "pontos": 12 },
        { "id": 9, "titulo": "Meta de redução", "descricao": "Se ainda está fumando, reduza em 30% a quantidade de cigarros por dia. Registre o progresso.", "pontos": 14 },
        { "id": 10, "titulo": "Alerta de gatilho", "descricao": "Identifique 3 situações que disparam sua vontade de fumar e escreva 1 estratégia para cada.", "pontos": 12 },
        { "id": 11, "titulo": "Hidratação consciente", "descricao": "Beba pelo menos 8 copos de água por dia e evite bebidas que aumentam a vontade de fumar.", "pontos": 11 },
        { "id": 12, "titulo": "Dia sem cigarro", "descricao": "Escolha um dia da semana para não fumar nenhum cigarro. Prepare-se para esse desafio.", "pontos": 13 },
        { "id": 13, "titulo": "Atividade manual", "descricao": "Dedique 1h por dia a uma atividade que ocupe suas mãos (desenhar, bordar, montar algo, etc).", "pontos": 13 },
        { "id": 14, "titulo": "Crie um mantra", "descricao": "Crie uma frase curta que te motive a parar de fumar. Repita para si sempre que sentir vontade.", "pontos": 10 },
        { "id": 15, "titulo": "Post-it motivador", "descricao": "Cole lembretes motivacionais pela casa (espelho, geladeira, celular). Reforce sua decisão.", "pontos": 11 },
        { "id": 16, "titulo": "Evite ambientes", "descricao": "Evite por uma semana lugares ou grupos onde o fumo é comum. Observe como se sente.", "pontos": 12 },
        { "id": 17, "titulo": "Playlist de superação", "descricao": "Monte uma playlist com músicas que te motivam a superar desafios e ouça quando sentir vontade.", "pontos": 10 },
        { "id": 18, "titulo": "Compromisso público", "descricao": "Conte para 3 pessoas próximas que está tentando parar. Peça apoio e evite julgamentos.", "pontos": 12 },
        { "id": 19, "titulo": "Meta sem cigarro pós-refeição", "descricao": "Durante a semana, não fume após as refeições. Troque esse hábito por um chá, fruta ou caminhada.", "pontos": 14 },
        { "id": 20, "titulo": "Visualize seu futuro", "descricao": "Escreva como imagina sua vida 1 ano após parar de fumar. Quais melhorias você espera?", "pontos": 15 }
    ];

    // Gerar desafio da semana
    function mostrarDesafioSemanal() {
        const semana = getNumeroSemana(new Date());
        const desafio = desafios[(semana - 1) % desafios.length];

        const html = `  
  <div class="box-desafio">
      <h2 style= "color: #000000; font-family: Poppins;">Desafio semanal</h2>
    <div class="pontos"><span class="estrela">★</span> ${desafio.pontos} pontos</div>
    <div class="conteudo-desafio">
      <strong>${desafio.titulo}</strong>
      <p>${desafio.descricao}</p>
    </div>
  </div>`;

        document.getElementById("desafio-semanal").innerHTML = html;
    }

    // Chamada da função ao carregar
    window.addEventListener('DOMContentLoaded', mostrarDesafioSemanal);

    // ---------------------
});
