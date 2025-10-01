// Símbolos Unicode para as peças (Brancas e Pretas)
const PIECES = {
    wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
};

// Posição inicial do xadrez (Regra Oficial)
let boardState = [
    ['bR', 'bN', 'bB', 'bQ', 'bK', 'bB', 'bN', 'bR'],
    ['bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP', 'bP'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP', 'wP'],
    ['wR', 'wN', 'wB', 'wQ', 'wK', 'wB', 'wN', 'wR']
];

let currentPlayer = 'w'; // 'w' para Brancas, 'b' para Pretas (Regra Oficial: Brancas começam)
let selectedSquare = null; // Armazena a posição [row, col] da casa selecionada
const boardElement = document.getElementById('board');
const statusMessage = document.getElementById('status-message');

// --- Funções Auxiliares de Tabuleiro ---

function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.classList.add('square');
            
            // Define a cor da casa (Regra Oficial: casas alternadas)
            square.classList.add((r + c) % 2 === 0 ? 'light' : 'dark');
            
            square.dataset.row = r;
            square.dataset.col = c;
            
            const pieceKey = boardState[r][c];
            if (pieceKey) {
                square.textContent = PIECES[pieceKey];
            }
            
            square.addEventListener('click', handleSquareClick);
            boardElement.appendChild(square);
        }
    }
    // Repassa os estilos de seleção e guias após a renderização
    updateVisuals();
}

function updateVisuals() {
    // 1. Limpa todas as seleções e guias
    document.querySelectorAll('.square').forEach(sq => {
        sq.classList.remove('selected', 'highlight-capture');
        sq.innerHTML = sq.textContent; // Remove bolinhas verdes
    });

    if (!selectedSquare) return;

    // 2. Marca a casa selecionada
    const { row: selR, col: selC } = selectedSquare;
    const selectedElement = document.querySelector(`[data-row="${selR}"][data-col="${selC}"]`);
    if (selectedElement) {
        selectedElement.classList.add('selected');
    }

    // 3. Adiciona GUIA VISUAL (bolinhas verdes) para movimentos legais
    const legalMoves = getLegalMoves(selR, selC);

    legalMoves.forEach(([endR, endC]) => {
        const targetSquare = document.querySelector(`[data-row="${endR}"][data-col="${endC}"]`);
        if (targetSquare) {
            const targetPiece = boardState[endR][endC];
            
            if (targetPiece) {
                // Se for captura, aplica estilo de captura
                targetSquare.classList.add('highlight-capture');
            } else {
                // Se for casa vazia, adiciona a bolinha verde
                const dot = document.createElement('div');
                dot.classList.add('highlight-move');
                targetSquare.appendChild(dot);
            }
        }
    });
}

function switchTurn() {
    currentPlayer = currentPlayer === 'w' ? 'b' : 'w';
    statusMessage.textContent = `Vez das ${currentPlayer === 'w' ? 'Brancas' : 'Pretas'}.`;
}

// --- Lógica de Movimento e Regras Oficiais ---

// Retorna uma lista de [row, col] para todas as jogadas *legais*
function getLegalMoves(startR, startC) {
    const piece = boardState[startR][startC];
    if (!piece || piece[0] !== currentPlayer) return [];

    let possibleMoves = [];

    // Esta função precisaria de toda a lógica de movimento (Rei, Dama, etc.)
    // Para simplificar, vamos implementar APENAS o Rei e a Torre como exemplo.
    const type = piece[1]; // K, Q, R, B, N, P

    switch (type) {
        case 'K': // Rei (Regra: 1 casa em qualquer direção)
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const endR = startR + dr;
                    const endC = startC + dc;
                    if (isWithinBounds(endR, endC) && isTargetValid(endR, endC)) {
                        possibleMoves.push([endR, endC]);
                    }
                }
            }
            break;
        case 'R': // Torre (Regra: Horizontal e Vertical)
            // Lógica para Torre (movimento em linha reta até encontrar bloqueio ou peça adversária)
            [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const endR = startR + dr * i;
                    const endC = startC + dc * i;
                    if (!isWithinBounds(endR, endC)) break;
                    if (isTargetValid(endR, endC)) {
                        possibleMoves.push([endR, endC]);
                    }
                    if (boardState[endR][endC] !== '') break; // Para se a casa não estiver vazia
                }
            });
            break;
        // ... (Implementação de Q, B, N, P iria aqui)
    }

    // Filtra movimentos que colocariam o próprio Rei em xeque (Regra Oficial)
    return possibleMoves.filter(([endR, endC]) => {
        // Lógica de verificação de Xeque... (complexa, omitida no básico, mas é a regra mais importante)
        return true; // Retorna todos por simplicidade
    });
}

function isWithinBounds(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// Verifica se a casa de destino é válida (vazia ou peça adversária)
function isTargetValid(endR, endC) {
    const targetPiece = boardState[endR][endC];
    if (!targetPiece) return true; // Casa vazia é válida
    return targetPiece[0] !== currentPlayer; // Peça adversária é válida (captura)
}


// --- Função de Clique Principal ---

function handleSquareClick(event) {
    const r = parseInt(event.target.dataset.row);
    const c = parseInt(event.target.dataset.col);
    const piece = boardState[r][c];
    
    // 1. SELEÇÃO: Clicar na peça do jogador atual
    if (piece && piece[0] === currentPlayer) {
        selectedSquare = { row: r, col: c };
        updateVisuals();
        return;
    }

    // 2. MOVIMENTO: Tentar mover para a casa clicada
    if (selectedSquare) {
        const startR = selectedSquare.row;
        const startC = selectedSquare.col;

        const legalMoves = getLegalMoves(startR, startC);
        
        // Verifica se a jogada é legal (está nas bolinhas verdes)
        const isLegal = legalMoves.some(([endR, endC]) => endR === r && endC === c);

        if (isLegal) {
            // Regra Oficial: Executa o movimento (inclui captura)
            boardState[r][c] = boardState[startR][startC]; // Move a peça para o destino
            boardState[startR][startC] = ''; // Esvazia a casa de origem

            // Se o movimento for válido (e não resultar em xeque no próprio rei),
            // a jogada é completada.
            
            selectedSquare = null;
            switchTurn();
        } else {
            statusMessage.textContent = 'Movimento ILEGAL. Escolha uma bolinha verde.';
            selectedSquare = null; // Deseleciona
        }
        
        renderBoard(); // Renderiza o novo estado do tabuleiro
    }
}

// Inicia o jogo
renderBoard();