const API_URL = 'http://localhost:3000';

// Elementos DOM 
const formCadastro = document.querySelector('.criar-conta .form');
const btnCadastro = document.getElementById('bt-criar');
const formLogin = document.querySelector('.entrar-conta .form');
const btnLogin = document.getElementById('bt-entrar');
const popupSenha = document.getElementById('popupSenha');
const btnEsqueceu = document.getElementById('esqueceu');
const fecharPopupBtn = document.getElementById('fecharPopupSenha');
const cancelarBtn = document.getElementById('cancelarSenha');
const formRedefinir = document.getElementById('formRedefinir');

// Função para alternar entre formulários
function mostrarLogin() {
  const criarConta = document.querySelector('.criar-conta');
  const entrarConta = document.querySelector('.entrar-conta');

  if (criarConta) criarConta.style.display = 'none';
  if (entrarConta) entrarConta.style.display = 'block';
}

async function fazerCadastro(event) {
  event.preventDefault();

  const nome = document.getElementById('cadastroNome').value;
  const email = document.getElementById('cadastroEmail').value;
  const senha = document.getElementById('cadastroSenha').value;
  const categoria = document.getElementById('categoria').value;

  // Verifica campos vazios
   if (!nome || !email || !senha || !categoria) {
    alert('Por favor, preencha todos os campos!'); // ok
    return;
  }

  try {
     const checarExistente = await fetch(`${API_URL}/usuarios`);

    const usuarios = await checarExistente.json();

    const jaExiste = usuarios.some(user =>
      user.email.toLowerCase() === email.toLowerCase() ||
      user.nome.toLowerCase() === nome.toLowerCase()
    );

    if (jaExiste) {
      alert('Já existe uma conta com esse nome ou e-mail.'); // ok
      return;
    }

    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nome,
        email,
        senha,
        categoria,
        logado: false
      })
    });

    if (!response.ok) throw new Error('Erro ao cadastrar');

    alert('Cadastro realizado com sucesso! Faça login para continuar.'); // ok
    mostrarLogin();

  } catch (error) {
    console.error('Erro ao cadastrar:', error);
    alert('Erro ao realizar cadastro. Tente novamente.'); //ok
  }
}

// Fazer login 
async function fazerLogin(event) {
  event.preventDefault(); 

  const email = formLogin?.querySelector('input[type="email"]')?.value;
  const senha = formLogin?.querySelector('input[type="password"]')?.value;

  if (!email || !senha) {
    alert('Por favor, preencha todos os campos!'); // ok
    return;
  }

  try {
    const responseEmail = await fetch(`${API_URL}/usuarios?email=${email}`);
    if (!responseEmail.ok) throw new Error('Erro na requisição');

    const usuariosComEmail = await responseEmail.json();
    if (usuariosComEmail.length === 0) {
      alert('E-mail não cadastrado. Verifique ou crie uma conta.'); // ok
      return;
    }

    const responseLogin = await fetch(`${API_URL}/usuarios?email=${email}&senha=${senha}`);
    if (!responseLogin.ok) throw new Error('Erro na verificação de senha');

    const usuarios = await responseLogin.json();
    if (usuarios.length === 0) {
      alert('Senha incorreta. Tente novamente.'); // ok
      return;
    }

    const usuario = usuarios[0];
    const updateResponse = await fetch(`${API_URL}/usuarios/${usuario.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ logado: true })
    });

    if (!updateResponse.ok) throw new Error('Erro ao atualizar status de login');

    usuario.logado = true;
    localStorage.setItem('usuarioLogado', JSON.stringify(usuario));

    // adicionar o profissional no ranking
    if (usuario.categoria === "profissional") {
      try {
        const rankingResponse = await fetch(`${API_URL}/rankingProfissionais`);
        const ranking = await rankingResponse.json();

        const jaExiste = ranking.find(p => p.email === usuario.email);

        if (!jaExiste) {
          const novoProfissional = {
            id: Date.now().toString(), // ID único simples
            nome: usuario.nome,
            especialidade: usuario.especialidade || "Profissional da saúde",
            notaMedia: 0,
            numeroAvaliacoes: 0,
            cidade: usuario.cidade || "Cidade não informada",
            estado: usuario.estado || "Estado não informado",
            imagemPerfil: usuario.imagemPerfil || "perfil_padrao.jpg",
            descricao: usuario.descricao || "Descrição ainda não preenchida.",
            certificadoVerificado: false,
            email: usuario.email,
            whatsapp: usuario.whatsapp || "(00) 00000-0000"
          };

          await fetch(`${API_URL}/rankingProfissionais`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoProfissional)
          });
        }
      } catch (erroRanking) {
        console.warn('Erro ao verificar ou adicionar profissional ao ranking:', erroRanking);
      }
    }

    setTimeout(() => {
      window.location.href = '/codigo/public/modulos/00_index/index.html';
    }, 100);

  } catch (error) {
    console.error('Erro no login:', error);
    alert('Erro ao fazer login. Tente novamente.');
  }
}

// Redireciona por categoria
function redirecionarPorCategoria() {
  window.location.href = '/codigo/public/modulos/00_index/index.html';
}

// Redefinir senha
async function redefinirSenha(event) {
  if (event) event.preventDefault();

  const email = document.getElementById('emailRedefinir')?.value;
  const novaSenha = document.getElementById('novaSenhaInput')?.value;
  const confirmarSenha = document.getElementById('confirmarSenhaInput')?.value; 

  if (!email || !novaSenha || !confirmarSenha) {
    alert('Preencha todos os campos!');
    return;
  }

  if (novaSenha !== confirmarSenha) {
    alert('As senhas não coincidem!');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/usuarios?email=${email}`);
    if (!response.ok) throw new Error('Erro ao buscar usuário');

    const usuarios = await response.json();
    if (usuarios.length === 0) {
      alert('E-mail não encontrado!');
      return;
    }

    const updateResponse = await fetch(`${API_URL}/usuarios/${usuarios[0].id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senha: novaSenha })
    });

    if (!updateResponse.ok) throw new Error('Erro ao atualizar senha');

    alert('Senha alterada com sucesso!');
    if (popupSenha) popupSenha.close();
    if (formRedefinir) formRedefinir.reset();

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    alert('Erro ao alterar senha. Tente novamente.');
  }
}

// Event listeners seguros
if (btnLogin) {
  btnLogin.addEventListener('click', fazerLogin);
}

if (btnEsqueceu) {
  btnEsqueceu.addEventListener('click', (e) => {
    e.preventDefault();
    if (popupSenha) popupSenha.showModal();
  });
}

if (fecharPopupBtn) {
  fecharPopupBtn.addEventListener('click', () => {
    if (popupSenha) popupSenha.close();
  });
}

if (cancelarBtn) {
  cancelarBtn.addEventListener('click', () => {
    if (popupSenha) popupSenha.close();
  });
}

if (popupSenha) {
  popupSenha.addEventListener('click', (e) => {
    if (e.target === popupSenha) popupSenha.close();
  });
}
if (formCadastro) {
  formCadastro.addEventListener('submit', fazerCadastro);
}
if (formRedefinir) {
  // Remove listener antigo se existir
  formRedefinir.removeEventListener('submit', redefinirSenha);
  formRedefinir.addEventListener('submit', redefinirSenha);
}