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

        localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
    } catch (erro) {
        console.error('Erro ao verificar login dos usuários:', erro);
        window.location.href = '/codigo/public/modulos/02_login/login.html';
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

            window.location.href = '/codigo/public/modulos/02_login/login.html';
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
});
