// Definindo constantes para os jogadores
const PLAYER_X = 'X';
const PLAYER_O = 'O';

// Definindo o estado inicial do tabuleiro
let board = [
    ['', '', ''],
    ['', '', ''],
    ['', '', '']
];

// Função para verificar se há um vencedor
function checkWinner() {
    // Verificar linhas horizontais
    for (let i = 0; i < 3; i++) {
        if (board[i][0] !== '' && board[i][0] === board[i][1] && board[i][0] === board[i][2]) {
            return board[i][0]; // Retorna o jogador que ganhou
        }
    }

    // Verificar linhas verticais
    for (let i = 0; i < 3; i++) {
        if (board[0][i] !== '' && board[0][i] === board[1][i] && board[0][i] === board[2][i]) {
            return board[0][i]; // Retorna o jogador que ganhou
        }
    }

    // Verificar diagonais
    if (board[0][0] !== '' && board[0][0] === board[1][1] && board[0][0] === board[2][2]) {
        return board[0][0]; // Retorna o jogador que ganhou
    }
    if (board[0][2] !== '' && board[0][2] === board[1][1] && board[0][2] === board[2][0]) {
        return board[0][2]; // Retorna o jogador que ganhou
    }

    // Verificar se há empate
    let isDraw = true;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i][j] === '') {
                isDraw = false; // Ainda há espaços vazios no tabuleiro
                break;
            }
        }
    }
    if (isDraw) {
        return 'draw'; // Retorna 'empate'
    }

    // Se não houver vencedor nem empate, retorna null
    return null;
}

// Função para marcar uma posição no tabuleiro
function markPosition(player, row, col) {
    if (board[row][col] === '') {
        board[row][col] = player;
        return true; // Posição marcada com sucesso
    } else {
        return false; // Posição já está ocupada
    }
}

// Função para reiniciar o jogo
function resetGame() {
    board = [
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
    ];
}
// Função para marcar uma posição no tabuleiro com animação
function markPositionWithAnimation(player, row, col) {
    if (board[row][col] === '') {
        board[row][col] = player;
        
        // Posição inicial da peça
        const initialPosition = { x: col * cellWidth, y: row * cellHeight };

        // Posição final da peça
        const finalPosition = { x: (col + 0.5) * cellWidth, y: (row + 0.5) * cellHeight };

        // Criar uma nova animação Tween.js para mover a peça
        new TWEEN.Tween(initialPosition)
            .to(finalPosition, 500) // Duração da animação (em milissegundos)
            .easing(TWEEN.Easing.Quadratic.Out) // Tipo de easing
            .onUpdate(function() {
                // Atualizar a posição da peça conforme a animação progride
                piece.position.set(this.x, 0.5, this.y);
            })
            .start(); // Iniciar a animação

        return true; // Posição marcada com sucesso
    } else {
        return false; // Posição já está ocupada
    }
}