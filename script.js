const tabuleiro = document.getElementById('tabuleiro');
const pecasIniciais = [
  '♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜',
  '♟', '♟', '♟', '♟', '♟', '♟', '♟', '♟',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '', '', '', '', '', '', '', '',
  '♙', '♙', '♙', '♙', '♙', '♙', '♙', '♙',
  '♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'
];

function criarTabuleiro() {
  for (let i = 0; i < 64; i++) {
    const casa = document.createElement('div');
    casa.dataset.posicao = i;
    casa.addEventListener('click', selecionarCasa);
    tabuleiro.appendChild(casa);
  }
  posicionarPecas();
}

function posicionarPecas() {
  const casas = tabuleiro.querySelectorAll('div');
  pecasIniciais.forEach((peca, index) => {
    const casa = casas[index];
    if (peca) {
      casa.dataset.peca = peca;
      casa.textContent = peca;
    }
  });
}

let casaSelecionada = null;

function selecionarCasa(event) {
  const casa = event.target;
  if (casaSelecionada) {
    if (casa === casaSelecionada) {
      casaSelecionada.classList.remove('selecionada');
      casaSelecionada = null;
    } else {
      moverPeca(casa);
    }
  } else if (casa.dataset.peca) {
    casaSelecionada = casa;
    casa.classList.add('selecionada');
  }
}

function moverPeca(casaDestino) {
  const peca = casaSelecionada.dataset.peca;
  casaDestino.dataset.peca = peca;
  casaDestino.textContent = peca;
  casaSelecionada.dataset.peca = '';
  casaSelecionada.textContent = '';
  casaSelecionada.classList.remove('selecionada');
  casaSelecionada = null;
}

criarTabuleiro();
