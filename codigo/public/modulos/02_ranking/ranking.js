const API_URL = "http://localhost:3000/rankingProfissionais";
    let profissionalSelecionado = null;
    let notaSelecionada = 0;

    async function buscarProfissionais() {
      const res = await fetch(API_URL);
      const data = await res.json();
      return data.sort((a, b) => {
        if (b.notaMedia !== a.notaMedia) {
          return b.notaMedia - a.notaMedia;
        } else {
          return b.numeroAvaliacoes - a.numeroAvaliacoes;
        }
      });
    }

    async function enviarAvaliacao(id, novaNota) {
      const res = await fetch(`${API_URL}/${id}`);
      const profissional = await res.json();
      console.log("Antes do PATCH:", profissional);
      const totalNotas = Number(profissional.notaMedia) * Number(profissional.numeroAvaliacoes);
      const novoTotal = Number(profissional.numeroAvaliacoes) + 1;
      const novaMedia = ((totalNotas + novaNota) / novoTotal).toFixed(1);

      const patchRes = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notaMedia: parseFloat(novaMedia),
          numeroAvaliacoes: novoTotal
        })
      });

      console.log("Resposta do PATCH:", patchRes.status);
      carregarRanking();
    }

    async function carregarRanking() {
      const profissionais = await buscarProfissionais();
      const container = document.getElementById("rankingContainer");
      container.innerHTML = "";

      profissionais.forEach((prof, index) => {
        const card = document.createElement("div");
        card.className = "card mb-3 col-md-12";
        card.innerHTML = `
          <div class="row g-0">
            <div class="col-md-3 d-flex justify-content-center align-items-center">
              <img src="${prof.imagemPerfil}" class="img-fluid rounded-start m-2" alt="${prof.nome}" style="max-width: 120px;">
            </div>
            <div class="col-md-9">
              <div class="card-body">
                <h5 class="card-title">${index + 1}º - ${prof.nome} <span class="badge bg-success">${prof.especialidade}</span></h5>
                <p class="card-text">${prof.descricao}</p>
                <p class="card-text">
                  <small class="text-muted">Cidade: ${prof.cidade} - ${prof.estado}</small><br>
                  <small class="text-muted">Nota: ${prof.notaMedia} ⭐ (${prof.numeroAvaliacoes} avaliações)</small>
                </p>
                <button class="btn btn-sm btn-primary me-2" style="background-color: #a8c9a1; border-color: #5f7a59;" onclick="abrirModal(${prof.id}, '${prof.nome}')">Avaliar</button>
                <button class="btn btn-sm btn-outline-secondary" onclick="abrirContatoModal('${prof.nome}', '${prof.email}', '${prof.whatsapp}')">Entrar em contato</button>
              </div>
            </div>
          </div>
        `;
        container.appendChild(card);
      });
    }

    function abrirModal(id, nome) {
      profissionalSelecionado = id;
      notaSelecionada = 0;
      document.getElementById("profissionalNome").innerText = nome;
      document.getElementById("enviarNota").disabled = true;

      const estrelasContainer = document.getElementById("estrelas");
      estrelasContainer.innerHTML = "";

      for (let i = 1; i <= 5; i++) {
        const estrela = document.createElement("i");
        estrela.className = "fa-regular fa-star fa-2x me-1";
        estrela.dataset.valor = i;
        estrela.addEventListener("mouseover", () => highlightStars(i));
        estrela.addEventListener("click", () => {
          notaSelecionada = i;
          highlightStars(i);
          document.getElementById("enviarNota").disabled = false;
        });

        estrelasContainer.appendChild(estrela);
      }

      const modal = new bootstrap.Modal(document.getElementById('avaliacaoModal'));
      modal.show();
    }

    function highlightStars(limite) {
      document.querySelectorAll("#estrelas i").forEach((estrela) => {
        const valor = parseInt(estrela.dataset.valor);
        estrela.className = valor <= limite ? "fa-solid fa-star fa-2x me-1 text-warning" : "fa-regular fa-star fa-2x me-1";
      });
    }

    document.addEventListener("DOMContentLoaded", () => {
      carregarRanking();
      document.getElementById("enviarNota").addEventListener("click", async () => {
        if (profissionalSelecionado && notaSelecionada > 0) {
          await enviarAvaliacao(profissionalSelecionado, notaSelecionada);
          bootstrap.Modal.getInstance(document.getElementById('avaliacaoModal')).hide();
        }
      });
    });
    function abrirContatoModal(nome, email, whatsapp) {
      document.getElementById("contatoProfissionalNome").innerText = nome;
      document.getElementById("contatoEmail").innerText = email;
      document.getElementById("contatoWhatsapp").innerText = whatsapp;

      const modalContato = new bootstrap.Modal(document.getElementById('contatoModal'));
      modalContato.show();
    }