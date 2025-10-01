// Constantes para as peças (usando símbolos Unicode)
const PIECES = {
    WhiteKing: '♔',
    BlackQueen: '♛' // Usaremos apenas o Rei Branco e a Dama Preta para o exemplo de Xeque
};

// Posição inicial (simples para o teste de xeque)
// O Rei Branco (A1) e a Dama Preta (D4)
let boardState = [
    [PIECES.WhiteKing, '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', PIECES.BlackQueen, '', '', '', ''], // Posição D4
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '']
];

let selectedPiece = null; // Guarda a posição [row, col] da peça selecionada
const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');

// Função para renderizar o tabuleiro no HTML
function renderBoard() {
    boardElement.innerHTML = ''; // Limpa o tabuleiro
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const square = document.createElement('div');
            square.classList.add('square');
            
            // Define a cor da casa (regra oficial: casas alternadas)
            const color = (row + col) % 2 === 0 ? 'light' : 'dark';
            square.classList.add(color);
            
            square.dataset.row = row;
            square.dataset.col = col;
            square.textContent = boardState[row][col];
            
            square.addEventListener('click', handleSquareClick);
            
            // Verifica e marca o Rei em Xeque
            if (boardState[row][col] === PIECES.WhiteKing && isKingInCheck(row, col)) {
                square.classList.add('in-check');
            }

            boardElement.appendChild(square);
        }
    }
}

// --- Lógica de Movimento ---

// Movimento OFICIAL do Rei: uma casa em qualquer direção
function isValidKingMove(startRow, startCol, endRow, endCol) {
    const dRow = Math.abs(endRow - startRow);
    const dCol = Math.abs(endCol - startCol);
    
    // O Rei só pode mover-se uma casa (1, 0), (0, 1) ou (1, 1)
    return dRow <= 1 && dCol <= 1 && (dRow !== 0 || dCol !== 0);
}

// Movimento OFICIAL da Dama: qualquer distância na horizontal, vertical ou diagonal
function isValidQueenMove(startRow, startCol, endRow, endCol) {
    const dRow = Math.abs(endRow - startRow);
    const dCol = Math.abs(endCol - startCol);
    
    // Horizontal ou Vertical
    if (dRow === 0 || dCol === 0) {
        return isPathClear(startRow, startCol, endRow, endCol, 'straight');
    }
    // Diagonal
    if (dRow === dCol) {
        return isPathClear(startRow, startCol, endRow, endCol, 'diagonal');
    }
    return false;
}

// Verifica se o caminho está livre (uma regra OFICIAL: peças não podem pular outras, exceto o Cavalo)
function isPathClear(startRow, startCol, endRow, endCol, type) {
    let r = startRow;
    let c = startCol;

    const stepR = (endRow - startRow) > 0 ? 1 : (endRow - startRow) < 0 ? -1 : 0;
    const stepC = (endCol - startCol) > 0 ? 1 : (endCol - startCol) < 0 ? -1 : 0;

    // Loop para verificar as casas entre o início e o fim
    r += stepR;
    c += stepC;
    while (r !== endRow || c !== endCol) {
        if (boardState[r][c] !== '') {
            return false; // Caminho bloqueado
        }
        r += stepR;
        c += stepC;
    }
    return true; // Caminho livre
}

// --- Lógica de Xeque (Regra Oficial: O Rei deve sair do Xeque) ---

// Encontra a posição atual do Rei Branco
function findKing() {
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            if (boardState[row][col] === PIECES.WhiteKing) {
                return { row, col };
            }
        }
    }
    return null;
}

// Verifica se o Rei na posição (kingRow, kingCol) está sob ataque
function isKingInCheck(kingRow, kingCol) {
    // Para este exemplo, apenas checamos o ataque da Dama Preta (♛)
    
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (boardState[r][c] === PIECES.BlackQueen) {
                // Verifica se a Dama Preta pode atacar o Rei Branco
                if (isValidQueenMove(r, c, kingRow, kingCol)) {
                    return true; // Rei está em xeque!
                }
            }
        }
    }
    return false;
}

// Função principal de clique na casa
function handleSquareClick(event) {
    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);
    const piece = boardState[row][col];

    // 1. SELEÇÃO de peça (se for o Rei Branco)
    if (piece === PIECES.WhiteKing) {
        // Remove a seleção anterior
        if (selectedPiece) {
            const prevSelected = document.querySelector(`.square[data-row="${selectedPiece.row}"][data-col="${selectedPiece.col}"]`);
            prevSelected.classList.remove('selected');
        }

        // Seleciona a nova peça
        selectedPiece = { row, col, piece };
        event.target.classList.add('selected');
        messageElement.textContent = 'Rei Branco selecionado. Faça um movimento legal.';
        return;
    }

    // 2. MOVIMENTO ou CAPTURA
    if (selectedPiece && selectedPiece.piece === PIECES.WhiteKing) {
        const startR = selectedPiece.row;
        const startC = selectedPiece.col;
        
        if (isValidKingMove(startR, startC, row, col)) {
            // Regra oficial: O Rei não pode mover-se para uma casa atacada.
            
            // Simula o movimento
            const originalPiece = boardState[row][col];
            boardState[row][col] = PIECES.WhiteKing;
            boardState[startR][startC] = '';

            // Verifica se o movimento SIMULADO coloca o Rei em Xeque
            if (isKingInCheck(row, col)) {
                // Se sim, o movimento é ILEGAL
                boardState[startR][startC] = PIECES.WhiteKing; // Desfaz o movimento
                boardState[row][col] = originalPiece;
                messageElement.textContent = 'Movimento ILEGAL! Você não pode mover o Rei para uma casa em xeque.';
            } else {
                // Se não, o movimento é LEGAL
                selectedPiece = null; // Limpa a seleção
                messageElement.textContent = isKingInCheck(row, col) ? 'Rei em Xeque!' : 'Movimento legal realizado.';
                
                // Remove a borda de seleção da casa anterior
                const prevSelected = document.querySelector(`.square[data-row="${startR}"][data-col="${startC}"]`);
                if (prevSelected) prevSelected.classList.remove('selected');
            }
        } else {
            messageElement.textContent = 'Movimento ILEGAL do Rei! O Rei move apenas uma casa em qualquer direção.';
        }
    }

    renderBoard();
}

// Inicializa o jogo
renderBoard();