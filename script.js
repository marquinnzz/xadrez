// Unicode das peças: brancas: K,Q,R,B,N,P; pretas: k,q,r,b,n,p
const piecesUnicode = {
  'P': '♙',
  'R': '♖',
  'N': '♘',
  'B': '♗',
  'Q': '♕',
  'K': '♔',
  'p': '♟',
  'r': '♜',
  'n': '♞',
  'b': '♝',
  'q': '♛',
  'k': '♚',
};

let board = [];
let selected = null;
let turn = 'w'; // 'w' branco, 'b' preto
let mode = 'multiplayer'; // multiplayer ou ai
let gameOver = false;
let statusEl = null;

// Estado para roque
let castlingRights = {
  wK: true, // branco roque curto
  wQ: true, // branco roque longo
  bK: true,
  bQ: true
};

// Movimento possível
// Vamos usar notação de coordenadas (linha,coluna) 0-7

// Inicia tabuleiro padrão em matriz 8x8
function initBoard() {
  board = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
  ];
}

// Renderiza o tabuleiro
function renderBoard() {
  const container = document.getElementById('chessboard');
  container.innerHTML = '';
  for(let row=0; row<8; row++) {
    for(let col=0; col<8; col++) {
      let square = document.createElement('div');
      square.classList.add('square');
      if((row + col) % 2 === 0) {
        square.classList.add('light');
      } else {
        square.classList.add('dark');
      }
      square.id = `sq-${row}-${col}`;
      let piece = board[row][col];
      if(piece) {
        square.textContent = piecesUnicode[piece];
        square.style.color = (piece === piece.toUpperCase()) ? 'white' : 'black';
        if(piece === piece.toUpperCase()) {
          square.style.color = 'white';
        } else {
          square.style.color = 'black';
        }
      }
      square.addEventListener('click', () => onSquareClick(row, col));
      container.appendChild(square);
    }
  }
  updateStatus();
}

function updateStatus() {
  if (gameOver) {
    statusEl.textContent = `Jogo terminado! Vencedor: ${turn === 'w' ? 'Preto' : 'Branco'}`;
  } else {
    statusEl.textContent = `Vez: ${turn === 'w' ? 'Branco' : 'Preto'}`;
  }
}

function onSquareClick(row, col) {
  if(gameOver) return;

  if(selected) {
    // Tentativa de mover peça selecionada para a casa clicada
    if(canMove(selected.row, selected.col, row, col)) {
      movePiece(selected.row, selected.col, row, col);
      selected = null;
      renderBoard();
      if (!gameOver) {
        if(mode === 'ai' && turn === 'b') {
          setTimeout(aiMove, 500);
        }
      }
    } else {
      // Seleciona outra peça se for da vez
      if(isOwnPiece(row, col)) {
        selected = {row, col};
      } else {
        selected = null;
      }
      renderBoard();
      if(selected) highlightSquare(selected.row, selected.col);
    }
  } else {
    if(isOwnPiece(row, col)) {
      selected = {row, col};
      renderBoard();
      highlightSquare(row, col);
    }
  }
}

function highlightSquare(row, col) {
  const sq = document.getElementById(`sq-${row}-${col}`);
  if(sq) sq.classList.add('selected');
}

// Verifica se a peça na posição pertence ao jogador da vez
function isOwnPiece(row, col) {
  const p = board[row][col];
  if(!p) return false;
  return (turn === 'w' && p === p.toUpperCase()) || (turn === 'b' && p === p.toLowerCase());
}

// Função para validar movimento básico (regras simples + roque)
function canMove(r1, c1, r2, c2) {
  const piece = board[r1][c1];
  if(!piece) return false;
  if(r1 === r2 && c1 === c2) return false;
  // Não pode capturar peça do mesmo time
  if(board[r2][c2] && ((piece === piece.toUpperCase() && board[r2][c2] === board[r2][c2].toUpperCase()) ||
    (piece === piece.toLowerCase() && board[r2][c2] === board[r2][c2].toLowerCase()))) {
    return false;
  }

  const dir = (piece === piece.toUpperCase()) ? 'w' : 'b';
  const dr = r2 - r1;
  const dc = c2 - c1;

  // Validação por tipo
  switch(piece.toLowerCase()) {
    case 'p':
      // Peão
      if(dir === 'w') {
        // Move para frente
        if(dc === 0 && dr === -1 && !board[r2][c2]) return true; // andar 1 casa
        if(dc === 0 && dr === -2 && r1 === 6 && !board[r2][c2] && !board[r1-1][c1]) return true; // andar 2 casas no primeiro movimento
        if(Math.abs(dc) === 1 && dr === -1 && board[r2][c2] && board[r2][c2] === board[r2][c2].toLowerCase()) return true; // captura
      } else {
        if(dc === 0 && dr === 1 && !board[r2][c2]) return true;
        if(dc === 0 && dr === 2 && r1 === 1 && !board[r2][c2] && !board[r1+1][c1]) return true;
        if(Math.abs(dc) === 1 && dr === 1 && board[r2][c2] && board[r2][c2] === board[r2][c2].toUpperCase()) return true;
      }
      return false;

    case 'r':
      if(dr === 0) {
        if(clearLine(r1, c1, r2, c2)) return true;
      } else if(dc === 0) {
        if(clearLine(r1, c1, r2, c2)) return true;
      }
      return false;

    case 'n':
      if((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2)) return true;
      return false;

    case 'b':
      if(Math.abs(dr) === Math.abs(dc)) {
        if(clearLine(r1, c1, r2, c2)) return true;
      }
      return false;

    case 'q':
      if(dr === 0 || dc === 0) {
        if(clearLine(r1, c1, r2, c2)) return true;
      } else if(Math.abs(dr) === Math.abs(dc)) {
        if(clearLine(r1, c1, r2, c2)) return true;
      }
      return false;

    case 'k':
      // Movimento normal do rei
      if(Math.abs(dr) <= 1 && Math.abs(dc) <= 1) return true;
      // Roque
      if(dr === 0 && Math.abs(dc) === 2) {
        return canCastle(r1, c1, r2, c2);
      }
      return false;
  }

  return false;
}

// Verifica se caminho entre origem e destino está livre (sem peças no meio)
function clearLine(r1, c1, r2, c2) {
  let dr = r2 - r1;
  let dc = c2 - c1;
  let stepR = dr === 0 ? 0 : dr / Math.abs(dr);
  let stepC = dc === 0 ? 0 : dc / Math.abs(dc);

  let r = r1 + stepR;
  let c = c1 + stepC;

  while(r !== r2 || c !== c2) {
    if(board[r][c]) return false;
    r += stepR;
    c += stepC;
  }
  return true;
}

// Verifica possibilidade de roque
function canCastle(r1, c1, r2, c2) {
  if(turn === 'w' && r1 !== 7) return false;
  if(turn === 'b' && r1 !== 0) return false;

  if(c2 === 6) { // Roque curto
    if(turn === 'w' && !castlingRights.wK) return false;
    if(turn === 'b' && !castlingRights.bK) return false;
    // Casas entre rei e torre devem estar vazias
    if(board[r1][5] || board[r1][6]) return false;
    // Verificação simplificada: não verifica check nas casas intermediárias
    // Para simplificar, consideramos que roque é permitido
    return true;
  } else if(c2 === 2) { // Roque longo
    if(turn === 'w' && !castlingRights.wQ) return false;
    if(turn === 'b' && !castlingRights.bQ) return false;
    if(board[r1][1] || board[r1][2] || board[r1][3]) return false;
    return true;
  }
  return false;
}

// Move peça, atualiza tabuleiro e turno
function movePiece(r1, c1, r2, c2) {
  const piece = board[r1][c1];

  // Roque
  if(piece.toLowerCase() === 'k' && Math.abs(c2 - c1) === 2) {
    // Move rei
    board[r2][c2] = piece;
    board[r1][c1] = '';

    if(c2 === 6) {
      // Roque curto: mover torre
      board[r2][5] = board[r2][7];
      board[r2][7] = '';
    } else if(c2 === 2) {
      // Roque longo
      board[r2][3] = board[r2][0];
      board[r2][0] = '';
    }

    // Atualiza direitos de roque
    if(turn === 'w') {
      castlingRights.wK = false;
      castlingRights.wQ = false;
    } else {
      castlingRights.bK = false;
      castlingRights.bQ = false;
    }
  } else {
    // Atualiza direitos de roque se torre ou rei se mover
    if(piece.toLowerCase() === 'k') {
      if(turn === 'w') {
        castlingRights.wK = false;
        castlingRights.wQ = false;
      } else {
        castlingRights.bK = false;
        castlingRights.bQ = false;
      }
    }
    if(piece.toLowerCase() === 'r') {
      if(turn === 'w') {
        if(r1 === 7 && c1 === 0) castlingRights.wQ = false;
        if(r1 === 7 && c1 === 7) castlingRights.wK = false;
      } else {
        if(r1 === 0 && c1 === 0) castlingRights.bQ = false;
        if(r1 === 0 && c1 === 7) castlingRights.bK = false;
      }
    }

    board[r2][c2] = piece;
    board[r1][c1] = '';
  }

  // Verifica se capturou rei (fim de jogo simplificado)
  if(board.flat().indexOf(turn === 'w' ? 'k' : 'K') === -1) {
    gameOver = true;
  }

  turn = (turn === 'w') ? 'b' : 'w';
}

// Função IA básica: seleciona peça preta e tenta um movimento legal aleatório
function aiMove() {
  if(gameOver) return;

  let moves = [];

  for(let r=0; r<8; r++) {
    for(let c=0; c<8; c++) {
      if(board[r][c] && board[r][c] === board[r][c].toLowerCase()) {
        // Peça preta
        for(let rr=0; rr<8; rr++) {
          for(let cc=0; cc<8; cc++) {
            if(canMove(r,c,rr,cc)) {
              moves.push({from: [r,c], to: [rr,cc]});
            }
          }
        }
      }
    }
  }

  if(moves.length === 0) {
    gameOver = true;
    updateStatus();
    return;
  }

  // Escolhe movimento aleatório
  let move = moves[Math.floor(Math.random() * moves.length)];
  movePiece(move.from[0], move.from[1], move.to[0], move.to[1]);
  renderBoard();
}

function init() {
  statusEl = document.getElementById('status');
  initBoard();
  renderBoard();

  // Trocar modo
  const radios = document.querySelectorAll('input[name="mode"]');
  radios.forEach(radio => {
    radio.addEventListener('change', e => {
      mode = e.target.value;
      resetGame();
    });
  });
}

function resetGame() {
  gameOver = false;
  selected = null;
  turn = 'w';
  castlingRights = {wK:true, wQ:true, bK:true, bQ:true};
  initBoard();
  renderBoard();
}

window.onload = init;
// Adicione no topo do script.js
let moveHistory = [];
let possibleMoves = [];

// Função que converte coordenadas [row,col] para notação xadrez (e.g. 7,4 -> e1)
function coordsToChessNotation(row, col) {
  const files = ['a','b','c','d','e','f','g','h'];
  return files[col] + (8 - row);
}

// Atualiza o histórico na tela
function updateMoveHistory() {
  const histDiv = document.getElementById('move-history');
  histDiv.innerHTML = '';
  for(let i = 0; i < moveHistory.length; i++) {
    const move = moveHistory[i];
    const moveNumber = Math.floor(i / 2) + 1;
    if(i % 2 === 0) {
      // Branco
      histDiv.innerHTML += `<div><strong>${moveNumber}. Branco:</strong> ${move}</div>`;
    } else {
      // Preto
      histDiv.innerHTML += `<div><strong>${moveNumber}. Preto:</strong> ${move}</div>`;
    }
  }
  histDiv.scrollTop = histDiv.scrollHeight; // Auto scroll para baixo
}

// Atualiza renderBoard para mostrar possíveis movimentos
function renderBoard() {
  const container = document.getElementById('chessboard');
  container.innerHTML = '';
  for(let row=0; row<8; row++) {
    for(let col=0; col<8; col++) {
      let square = document.createElement('div');
      square.classList.add('square');
      if((row + col) % 2 === 0) {
        square.classList.add('light');
      } else {
        square.classList.add('dark');
      }
      square.id = `sq-${row}-${col}`;
      let piece = board[row][col];
      if(piece) {
        square.textContent = piecesUnicode[piece];
        if(piece === piece.toUpperCase()) {
          square.style.color = 'white';
        } else {
          square.style.color = 'black';
        }
      }

      // Se essa casa está entre os possíveis movimentos, destaque
      if(possibleMoves.some(m => m[0] === row && m[1] === col)) {
        square.classList.add('possible-move');
      }

      square.addEventListener('click', () => onSquareClick(row, col));
      container.appendChild(square);
    }
  }

  updateStatus();
  updateMoveHistory();
}

// Atualiza a lista de possíveis movimentos ao selecionar uma peça
function updatePossibleMoves(row, col) {
  possibleMoves = [];
  for(let r=0; r<8; r++) {
    for(let c=0; c<8; c++) {
      if(canMove(row, col, r, c)) {
        possibleMoves.push([r, c]);
      }
    }
  }
}

// Atualiza onSquareClick para lidar com seleção e movimento com possíveis jogadas
function onSquareClick(row, col) {
  if(gameOver) return;

  if(selected) {
    // Se clicou em casa possível, move
    if(possibleMoves.some(m => m[0] === row && m[1] === col)) {
      // Salva jogada no histórico
      const fromNotation = coordsToChessNotation(selected.row, selected.col);
      const toNotation = coordsToChessNotation(row, col);
      const player = turn === 'w' ? 'Branco' : 'Preto';
      const moveStr = `${fromNotation} -> ${toNotation}`;

      movePiece(selected.row, selected.col, row, col);
      moveHistory.push(moveStr);

      selected = null;
      possibleMoves = [];
      renderBoard();

      if (!gameOver) {
        if(mode === 'ai' && turn === 'b') {
          setTimeout(() => {
            aiMove();
            renderBoard();
          }, 500);
        }
      }
    } else {
      // Seleciona outra peça se for da vez e da mesma cor
      if(isOwnPiece(row, col)) {
        selected = {row, col};
        updatePossibleMoves(row, col);
      } else {
        selected = null;
        possibleMoves = [];
      }
      renderBoard();
      if(selected) highlightSquare(selected.row, selected.col);
    }
  } else {
    if(isOwnPiece(row, col)) {
      selected = {row, col};
      updatePossibleMoves(row, col);
      renderBoard();
      highlightSquare(row, col);
    }
  }
}

// Reseta jogo deve limpar histórico e possíveis jogadas também
function resetGame() {
  gameOver = false;
  selected = null;
  turn = 'w';
  castlingRights = {wK:true, wQ:true, bK:true, bQ:true};
  moveHistory = [];
  possibleMoves = [];
  initBoard();
  renderBoard();
}
