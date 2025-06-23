function getNumeroSemana(data) {
    const primeiroDia = new Date(data.getFullYear(), 0, 1);
    const diferenca = (data - primeiroDia) + ((primeiroDia.getDay() + 6) % 7) * 86400000;
    return Math.floor(diferenca / (7 * 86400000)) + 1;
}

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

function mostrarDesafioSemanal() {
    const dataAtual = new Date();
    const semana = getNumeroSemana(dataAtual);
    const desafio = desafios[(semana - 1) % desafios.length];

    const usuario = JSON.parse(localStorage.getItem('usuarioLogado'));
    const chave = `desafio_enviado_${usuario.email}`;
    const semanaSalva = localStorage.getItem(chave);
    const desafioJaEnviado = semanaSalva == semana;

    const html = `
      <div class="box-desafio">
        <div class="pontos"><span class="estrela">★</span> ${desafio.pontos} pontos</div>
        <div class="conteudo-desafio">
          <strong>${desafio.titulo}</strong>
          <p>${desafio.descricao}</p>
        </div>
        <form id="form-desafio">
          <input type="checkbox" id="concluido" name="concluido" style="width: 20px; height: 20px;" ${desafioJaEnviado ? 'disabled' : ''}>
          <label for="concluido" style="font-size: 18px; margin-left: 5px; color: black;">Completei o desafio!</label><br>
          <button type="submit" id="botaoDesafio" class="btn-desafio" ${desafioJaEnviado ? 'disabled' : ''}>${desafioJaEnviado ? 'Desafio já enviado' : 'Enviar desafio'}</button>
        </form>

        <!-- Modal flutuante -->
        <div id="modal-mensagem" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); justify-content:center; align-items:center;">
          <div style="background:white; padding:20px; border-radius:10px; max-width:400px; text-align:center;">
            <p id="mensagem-modal" style="font-family:Poppins; color: black;"></p>
            <button onclick="fecharModal()" style="margin-top:10px;">Fechar</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('desafio-semanal').innerHTML = html;

    const form = document.getElementById('form-desafio');
    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const concluiu = document.getElementById('concluido').checked;

        const mensagem = concluiu
            ? "🎉 Parabéns! Você concluiu o desafio da semana!"
            : "😔 Que pena! Essa semana você não conseguiu concluir o desafio :( Mas não se preocupe! Agora é só aguardar o novo desafio da semana que vem!";

        document.getElementById('mensagem-modal').innerText = mensagem;
        document.getElementById('modal-mensagem').style.display = 'flex';

        localStorage.setItem(chave, semana);

        document.getElementById('concluido').disabled = true;
        form.querySelector('button').disabled = true;
        form.querySelector('button').innerText = 'Desafio já enviado';
    });
}


function fecharModal() {
    document.getElementById('modal-mensagem').style.display = 'none';
}

mostrarDesafioSemanal();
