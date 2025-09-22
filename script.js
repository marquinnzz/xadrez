const board = document.getElementById('board');

// Unicode peças de xadrez
const pieces = {
  white: ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
  black: ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  whitePawn: '♙',
  blackPawn: '♟︎'
};

// Criar tabuleiro
for (let row = 0; row < 8; row++) {
  for (let col = 0; col < 8; col++) {
    const square = document.createElement('div');
    square.classList.add('square');
    square.classList.add((row + col) % 2 === 0 ? 'white-square' : 'black-square');
    square.dataset.row = row;
    square.dataset.col = col;
    board.appendChild(square);

    // Adicionar peças
    if (row === 0) {
      square.textContent = pieces.black[col];
    } else if (row === 1) {
      square.textContent = pieces.blackPawn;
    } else if (row === 6) {
      square.textContent = pieces.whitePawn;
    } else if (row === 7) {
      square.textContent = pieces.white[col];
    }

    // Permitir soltar peças
    square.addEventListener('dragover', e => e.preventDefault());
    square.addEventListener('drop', e => {
      e.preventDefault();
      const pieceId = e.dataTransfer.getData('text/plain');
      const piece = document.getElementById(pieceId);
      square.textContent = piece.textContent;
    });
  }
}

// Tornar peças externas arrastáveis
const draggablePieces = document.querySelectorAll('#pieces .piece');

draggablePieces.forEach(piece => {
  piece.id = `piece-${Math.random().toString(36).substr(2, 9)}`;
  piece.addEventListener('dragstart', e => {
    e.dataTransfer.setData('text/plain', piece.id);
  });
});
