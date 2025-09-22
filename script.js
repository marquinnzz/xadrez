const board = document.getElementById('board');

const pieces = {
  white: ['♖', '♘', '♗', '♕', '♔', '♗', '♘', '♖'],
  black: ['♜', '♞', '♝', '♛', '♚', '♝', '♞', '♜'],
  whitePawn: '♙',
  blackPawn: '♟︎'
};

let selectedSquare = null;

function createBoard() {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const square = document.createElement('div');
      square.classList.add('square');
      square.classList.add((row + col) % 2 === 0 ? 'white-square' : 'black-square');
      square.dataset.row = row;
      square.dataset.col = col;
      board.appendChild(square);

      // Adicionar peças
      if (row === 0) square.textContent = pieces.black[col];
      else if (row === 1) square.textContent = pieces.blackPawn;
      else if (row === 6) square.textContent = pieces.whitePawn;
      else if (row === 7) square.textContent = pieces.white[col];

      square.addEventListener('click', handleClick);
    }
  }
}

function handleClick(e) {
  const square = e.currentTarget;
  const piece = square.textContent;
  const row = parseInt(square.dataset.row);
  const col = parseInt(square.dataset.col);

  // Se já há uma peça selecionada e clicamos em uma casa válida
  if (selectedSquare && square.classList.contains('highlight')) {
    movePiece(selectedSquare, square);
    clearHighlights();
    selectedSquare = null;
    return;
  }

  clearHighlights();

  // Verifica se é peça branca
  if (piece && isWhitePiece(piece)) {
    selectedSquare = square;
    const moves = getPossibleMoves(piece, row, col);
    highlightMoves(moves);
  } else {
    selectedSquare = null;
  }
}

function isWhitePiece(piece) {
  return ['♖', '♘', '♗', '♕', '♔', '♙'].includes(piece);
}

function getPossibleMoves(piece, row, col) {
  const moves = [];

  switch (piece) {
    case '♙': // Peão branco
      if (row > 0) {
        const forward = getSquare(row - 1, col);
        if (forward && !forward.textContent) moves.push(forward);
        if (row === 6) {
          const doubleForward = getSquare(row - 2, col);
          if (forward && !forward.textContent && doubleForward && !doubleForward.textContent)
            moves.push(doubleForward);
        }
      }
      break;

    case '♖': // Torre
      moves.push(...getLinearMoves(row, col, [[1, 0], [-1, 0], [0, 1], [0, -1]]));
      break;

    case '♘': // Cavalo
      [
        [2, 1], [1, 2], [-1, 2], [-2, 1],
        [-2, -1], [-1, -2], [1, -2], [2, -1]
      ].forEach(([dr, dc]) => {
        const sq = getSquare(row + dr, col + dc);
        if (sq && !isWhitePiece(sq.textContent)) moves.push(sq);
      });
      break;

    case '♗': // Bispo
      moves.push(...getLinearMoves(row, col, [[1, 1], [1, -1], [-1, 1], [-1, -1]]));
      break;

    case '♕': // Rainha
      moves.push(...getLinearMoves(row, col, [
        [1, 0], [-1, 0], [0, 1], [0, -1],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ]));
      break;

    case '♔': // Rei
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const sq = getSquare(row + dr, col + dc);
          if (sq && !isWhitePiece(sq.textContent)) moves.push(sq);
        }
      }
      break;
  }

  return moves;
}

function getLinearMoves(row, col, directions) {
  const moves = [];
  for (const [dr, dc] of directions) {
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < 8 && c >= 0 && c < 8) {
      const sq = getSquare(r, c);
      if (!sq) break;
      if (!sq.textContent) {
        moves.push(sq);
      } else {
        if (!isWhitePiece(sq.textContent)) moves.push(sq);
        break;
      }
      r += dr;
      c += dc;
    }
  }
  return moves;
}

function getSquare(row, col) {
  return document.querySelector(`.square[data-row="${row}"][data-col="${col}"]`);
}

function highlightMoves(squares) {
  squares.forEach(sq => sq.classList.add('highlight'));
}

function clearHighlights() {
  document.querySelectorAll('.square.highlight').forEach(sq => sq.classList.remove('highlight'));
}

function movePiece(from, to) {
  to.textContent = from.textContent;
  from.textContent = '';
}

createBoard();
