document.addEventListener('DOMContentLoaded', () => {
    let usuarioId = 1; // fallback padrão

    const usuarioLogado = localStorage.getItem('usuarioLogado');
    if (usuarioLogado) {
        try {
            const user = JSON.parse(usuarioLogado);
            if (user.id) usuarioId = user.id;
        } catch (e) {
            console.warn("Erro ao parsear usuário logado", e);
        }
    }


    document.getElementById('perfil-de-uso').addEventListener('change', (e) => {
        const perfilId = parseInt(e.target.value);
        atualizarCamposPorPerfil(perfilId);
    });

    async function preencherFormulario() {
        try {
            const res = await fetch(`http://localhost:3000/usuarios/${usuarioId}`);
            const usuario = await res.json();

            document.getElementById('perfil-de-uso').value = usuario.perfilDeUso;
            document.getElementById('cigarroXdia').value = usuario.cigarrosPorDia || '';
            document.getElementById('preco-maco').value = usuario.precoPorMaco || '';
            document.getElementById('cigarroXmaco').value = usuario.cigarrosPorMaco || '';
            document.getElementById('data-de-parada').value = usuario.dataDeParada || '';

            atualizarCamposPorPerfil(parseInt(usuario.perfilDeUso));

            // Preencher campos extras de acordo com o perfil, se existir
            if (usuario.perfilDeUso === 2) {
                document.getElementById('cigarrosPorEvento').value = usuario.cigarrosPorEvento || '';
                document.getElementById('eventosPorMes').value = usuario.eventosPorMes || '';
            } else if (usuario.perfilDeUso === 3) {
                document.getElementById('cigarrosEstimadosPorSituacao').value = usuario.cigarrosEstimadosPorSituacao || '';
                document.getElementById('situacoesPorMes').value = usuario.situacoesPorMes || '';
            }
        } catch (err) {
            console.error("Erro ao preencher formulário:", err);
        }
    }

    document.getElementById('informacoes-do-fumante').addEventListener('submit', async (e) => {
        e.preventDefault();

        const perfil = parseInt(document.getElementById('perfil-de-uso').value);
        const precoMacoRaw = document.getElementById('preco-maco').value;
        const precoMaco = parseFloat(precoMacoRaw.replace(',', '.'));
        const cigarroMaco = parseInt(document.getElementById('cigarroXmaco').value);
        const dataDeParada = document.getElementById('data-de-parada').value;

        const dadosAtualizados = {
            precoPorMaco: precoMaco,
            cigarrosPorMaco: cigarroMaco,
            dataDeParada: dataDeParada,
            perfilDeUso: perfil
        };

        if (perfil === 1) {

             dadosAtualizados.cigarrosPorEvento=null;
             dadosAtualizados.eventosPorMes=null;
             dadosAtualizados.cigarrosEstimadosPorSituacao=null;
             dadosAtualizados.situacoesPorMes=null;

            dadosAtualizados.cigarrosPorDia = parseInt(document.getElementById('cigarroXdia').value);
        } else if (perfil === 2) {

             dadosAtualizados.cigarrosPorDia=null;
             dadosAtualizados.cigarrosEstimadosPorSituacao=null;
             dadosAtualizados.situacoesPorMes=null;

            dadosAtualizados.cigarrosPorEvento = parseInt(document.getElementById('cigarrosPorEvento').value);
            dadosAtualizados.eventosPorMes = parseInt(document.getElementById('eventosPorMes').value);
        } else if (perfil === 3) {

             dadosAtualizados.cigarrosPorDia=null;
             dadosAtualizados.cigarrosPorEvento=null;
             dadosAtualizados.eventosPorMes=null;

            dadosAtualizados.cigarrosEstimadosPorSituacao = parseInt(document.getElementById('cigarrosEstimadosPorSituacao').value);
            dadosAtualizados.situacoesPorMes = parseInt(document.getElementById('situacoesPorMes').value);
        }

        try {
            await fetch(`http://localhost:3000/usuarios/${usuarioId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dadosAtualizados)
            });
            console.log("Dados enviados para PATCH:", dadosAtualizados);

            alert("Dados salvos com sucesso!");
            // Atualiza os dados depois do patch
            preencherFormulario();
            calcularProjecao();
        } catch (err) {
            console.error("Erro ao atualizar o JSON:", err);
            alert("Erro ao salvar os dados.");
        }
    });

    async function calcularProjecao() {
        try {
            const res = await fetch(`http://localhost:3000/usuarios/${usuarioId}`);
            const usuario = await res.json();

            const agora = new Date();
            const dataParada = new Date(usuario.dataDeParada);

            // Diferença em milissegundos
            const diff = agora - dataParada;

            // Garantir que diasSemFumar nunca seja negativo (caso dataDeParada futura)
            const diasSemFumar = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));

            let cigarrosEvitados = 0;

            if (usuario.perfilDeUso === 1) {



                // Perfil fumante diário
                const cigarrosPorDia = usuario.cigarrosPorDia || 0;
                cigarrosEvitados = diasSemFumar * cigarrosPorDia;


            } else if (usuario.perfilDeUso === 2) {



                // Perfil fumante social
                const eventosPorMes = usuario.eventosPorMes || 0;
                const cigarrosPorEvento = usuario.cigarrosPorEvento || 0;
                const meses = diasSemFumar / 30;
                cigarrosEvitados = Math.floor(meses * eventosPorMes * cigarrosPorEvento);
            } else if (usuario.perfilDeUso === 3) {



                // Perfil fumante por situação
                const situacoesPorMes = usuario.situacoesPorMes || 0;
                const cigarrosEstimados = usuario.cigarrosEstimadosPorSituacao || 0;
                const meses = diasSemFumar / 30;
                cigarrosEvitados = Math.floor(meses * situacoesPorMes * cigarrosEstimados);
            }

            // Garantir que não ocorra divisão por zero
            const cigarrosPorMaco = usuario.cigarrosPorMaco || 1;
            const precoPorMaco = usuario.precoPorMaco || 0;

            const precoPorCigarro = precoPorMaco / cigarrosPorMaco;
            const dinheiroEconomizado = (cigarrosEvitados * precoPorCigarro).toFixed(2);

            document.getElementById('economia').textContent = `R$ ${dinheiroEconomizado} `;
            document.getElementById('cigarros-evitados').textContent = cigarrosEvitados;

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

    function atualizarCamposPorPerfil(perfilId) {
        const camposExtras = document.getElementById('campos-extras');
        camposExtras.innerHTML = '';

        if (perfilId === 2) {
            camposExtras.innerHTML = `
                <li>Cigarros por evento <input type="number" id="cigarrosPorEvento" min="0" required></li>
                <li>Eventos por mês <input type="number" id="eventosPorMes" min="0" required></li>
            `;
        } else if (perfilId === 3) {
            camposExtras.innerHTML = `
                <li>Cigarros estimados por situação <input type="number" id="cigarrosEstimadosPorSituacao" min="0" required></li>
                <li>Situações por mês <input type="number" id="situacoesPorMes" min="0" required></li>
            `;
        }

        const campoCigarrosPorDia = document.getElementById('campo-cigarroXdia');

        if (perfilId === 2 || perfilId === 3) {
            campoCigarrosPorDia.style.display = 'none';
            document.getElementById('campos-extras').style.display = 'grid';
        } else {
            campoCigarrosPorDia.style.display = 'list-item';
            document.getElementById('campos-extras').style.display = 'none';
        }
    }

    preencherFormulario();
    calcularProjecao();

});
