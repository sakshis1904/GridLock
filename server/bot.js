class Bot {
    constructor() {
        this.rows = 6;
        this.cols = 7;
    }

    decideMove(gameLogic) {
        // Simple AI: 
        // 1. Check if can win immediately
        // 2. Check if opponent can win immediately and block
        // 3. Pick random valid column

        const board = gameLogic.board;
        const myPlayer = 2;
        const opponent = 1;

        // 1. Can win?
        for (let c = 0; c < this.cols; c++) {
            if (gameLogic.isValidMove(c)) {
                // Simulate move
                let r = this.getLowestEmptyRow(board, c);
                board[r][c] = myPlayer;
                if (gameLogic.checkWin(r, c, myPlayer)) {
                    board[r][c] = 0; // undo
                    return c;
                }
                board[r][c] = 0; // undo
            }
        }

        // 2. Must block?
        for (let c = 0; c < this.cols; c++) {
            if (gameLogic.isValidMove(c)) {
                // Simulate move
                let r = this.getLowestEmptyRow(board, c);
                board[r][c] = opponent;
                if (gameLogic.checkWin(r, c, opponent)) {
                    board[r][c] = 0; // undo
                    return c;
                }
                board[r][c] = 0; // undo
            }
        }

        // 3. Random
        const validMoves = [];
        for (let c = 0; c < this.cols; c++) {
            if (gameLogic.isValidMove(c)) {
                validMoves.push(c);
            }
        }

        // Prefer center columns
        if (validMoves.includes(3)) return 3;

        return validMoves[Math.floor(Math.random() * validMoves.length)];
    }

    getLowestEmptyRow(board, col) {
        for (let r = this.rows - 1; r >= 0; r--) {
            if (board[r][col] === 0) {
                return r;
            }
        }
        return -1;
    }
}

module.exports = Bot;
