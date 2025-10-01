// Símbolos Unicode para as peças (Brancas e Pretas)
const PIECES = {
    wK: '♔', wQ: '♕', wR: '♖', wB: '♗', wN: '♘', wP: '♙',
    bK: '♚', bQ: '♛', bR: '♜', bB: '♝', bN: '♞', bP: '♟'
};

// Posição inicial do xadrez (Regra Oficial: todas as peças no tabuleiro)
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

let currentPlayer = 'w'; // 'w' para Brancas, 'b' para Pretas (Brancas começam)
let selectedSquare = null; 
const boardElement = document.getElementById('board');
const statusMessage = document.getElementById('status-message');

// --- Funções Auxiliares de Tabuleiro e Visualização ---

function renderBoard() {
    boardElement.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const square = document.createElement('div');
            square.classList.add('square');
            
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
    updateVisuals();
}

function updateVisuals() {
    // 1. Limpa todas as seleções e guias (bolinhas verdes)
    document.querySelectorAll('.square').forEach(sq => {
        sq.classList.remove('selected', 'highlight-capture');
        // Mantém apenas o texto da peça, removendo as bolinhas
        sq.innerHTML = sq.textContent; 
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
                // Captura: borda verde
                targetSquare.classList.add('highlight-capture');
            } else {
                // Movimento para casa vazia: bolinha verde
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

function isWithinBounds(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
}

// Verifica se a casa de destino é válida (vazia ou peça adversária)
function isTargetValid(endR, endC) {
    const targetPiece = boardState[endR][endC];
    if (!targetPiece) return true; // Casa vazia é válida
    return targetPiece[0] !== currentPlayer; // Peça adversária é válida (captura)
}

// Verifica se o caminho está livre para Dama, Torre e Bispo
function isPathClear(startR, startC, endR, endC, stepR, stepC) {
    let r = startR + stepR;
    let c = startC + stepC;
    while (r !== endR || c !== endC) {
        if (boardState[r][c] !== '') {
            return false; // Caminho bloqueado
        }
        r += stepR;
        c += stepC;
    }
    return true;
}

// --- Lógica de Movimento de Todas as Peças (Regras Oficiais) ---

function getLegalMoves(startR, startC) {
    const piece = boardState[startR][startC];
    if (!piece || piece[0] !== currentPlayer) return [];

    let possibleMoves = [];
    const type = piece[1]; 
    const isWhite = piece[0] === 'w';

    switch (type) {
        // REI (K): 1 casa em qualquer direção (Horizontal, Vertical, Diagonal)
        case 'K':
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const endR = startR + dr;
                    const endC = startC + dc;
                    if (isWithinBounds(endR, endC) && isTargetValid(endR, endC)) {
                         // *A regra de Xeque/Xeque-mate deve ser aplicada aqui*
                        possibleMoves.push([endR, endC]);
                    }
                }
            }
            // *O movimento de Roque seria adicionado aqui*
            break;

        // CAVALO (N): Movimento em "L" (2x1 ou 1x2)
        case 'N':
            [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]].forEach(([dr, dc]) => {
                const endR = startR + dr;
                const endC = startC + dc;
                if (isWithinBounds(endR, endC) && isTargetValid(endR, endC)) {
                    possibleMoves.push([endR, endC]);
                }
            });
            break;
            
        // TORRE (R): Horizontal e Vertical
        case 'R':
            // Horizontal e Vertical (0, 1), (0, -1), (1, 0), (-1, 0)
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

        // BISPO (B): Diagonal
        case 'B':
            // Diagonal (1, 1), (1, -1), (-1, 1), (-1, -1)
            [[1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
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

        // DAMA (Q): Combina Torre e Bispo
        case 'Q':
            // 8 direções (Torre + Bispo)
            [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [1, -1], [-1, 1], [-1, -1]].forEach(([dr, dc]) => {
                for (let i = 1; i < 8; i++) {
                    const endR = startR + dr * i;
                    const endC = startC + dc * i;
                    if (!isWithinBounds(endR, endC)) break;
                    
                    if (isTargetValid(endR, endC)) {
                        possibleMoves.push([endR, endC]);
                    }
                    if (boardState[endR][endC] !== '') break;
                }
            });
            break;

        // PEÃO (P): Movimento para frente, captura diagonal
        case 'P':
            const direction = isWhite ? -1 : 1; // Brancas sobem (r-1), Pretas descem (r+1)
            
            // 1. Movimento de 1 casa para frente (somente se vazia)
            const oneStepR = startR + direction;
            if (isWithinBounds(oneStepR, startC) && boardState[oneStepR][startC] === '') {
                possibleMoves.push([oneStepR, startC]);
                
                // 2. Movimento de 2 casas para frente (somente no primeiro lance)
                const isFirstMove = isWhite ? startR === 6 : startR === 1;
                const twoStepR = startR + 2 * direction;
                
                if (isFirstMove && boardState[twoStepR][startC] === '') {
                    possibleMoves.push([twoStepR, startC]);
                }
            }

            // 3. Captura diagonal (se houver peça adversária)
            [-1, 1].forEach(dC => {
                const endR = startR + direction;
                const endC = startC + dC;
                if (isWithinBounds(endR, endC)) {
                    const target = boardState[endR][endC];
                    if (target && target[0] !== currentPlayer) {
                        possibleMoves.push([endR, endC]);
                    }
                }
            });
            // *O movimento En Passant seria adicionado aqui*
            // *O movimento de Promoção seria adicionado aqui*
            break;
    }

    // Filtrar movimentos que colocariam o próprio Rei em xeque (Regra Oficial: Omissão para simplicidade)
    return possibleMoves;
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
        
        // Verifica se a jogada é legal
        const isLegal = legalMoves.some(([endR, endC]) => endR === r && endC === c);

        if (isLegal) {
            // Executa o movimento (Regra Oficial)
            boardState[r][c] = boardState[startR][startC]; // Move
            boardState[startR][startC] = ''; // Esvazia origem
            
            // *A lógica de Promoção de Peão (se aplicável) seria feita aqui*

            selectedSquare = null;
            switchTurn();
        } else {
            // Se tentou mover para uma casa ilegal, deseleciona
            statusMessage.textContent = 'Movimento ILEGAL. Escolha uma bolinha verde.';
            selectedSquare = null; 
        }
        
        renderBoard(); // Renderiza o novo estado do tabuleiro
    }
}

// Inicia o jogo
renderBoard();

/* NOTA SOBRE REGRAS AVANÇADAS:
Este código implementa os movimentos básicos e de captura de todas as peças.
Para um jogo 100% oficial, seria necessário adicionar:
1. Verificação de Xeque e Xeque-Mate (a mais importante).
2. O movimento especial Roque (King/Torre).
3. O movimento especial En Passant (Peão).
4. Lógica de Promoção de Peão.
*/