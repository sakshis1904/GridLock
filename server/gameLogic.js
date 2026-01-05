class GameLogic {
    constructor() {
        this.rows = 6;
        this.cols = 7;
        // 0 = empty, 1 = player1, 2 = player2
        this.board = Array(this.rows).fill(null).map(() => Array(this.cols).fill(0));
        this.winner = null;
        this.isDraw = false;
        this.turn = 1; // 1 or 2
        this.moves = 0;
    }

    isValidMove(col) {
        if (col < 0 || col >= this.cols) return false;
        if (this.board[0][col] !== 0) return false;
        if (this.winner !== null) return false;
        return true;
    }

    makeMove(player, col) {
        if (player !== this.turn) return false;
        if (!this.isValidMove(col)) return false;

        // Find the lowest empty spot in the column
        for (let r = this.rows - 1; r >= 0; r--) {
            if (this.board[r][col] === 0) {
                this.board[r][col] = player;
                this.moves++;
                if (this.checkWin(r, col, player)) {
                    this.winner = player;
                } else if (this.moves === this.rows * this.cols) {
                    this.isDraw = true;
                } else {
                    this.turn = this.turn === 1 ? 2 : 1;
                }
                return true;
            }
        }
        return false;
    }

    checkWin(row, col, player) {
        // Directions: [dRow, dCol]
        const directions = [
            [0, 1],  // Horizontal
            [1, 0],  // Vertical
            [1, 1],  // Diagonal /
            [1, -1]  // Diagonal \
        ];

        for (let [dr, dc] of directions) {
            let count = 1;
            // Check positive direction
            for (let i = 1; i < 4; i++) {
                const r = row + dr * i;
                const c = col + dc * i;
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols || this.board[r][c] !== player) break;
                count++;
            }
            // Check negative direction
            for (let i = 1; i < 4; i++) {
                const r = row - dr * i;
                const c = col - dc * i;
                if (r < 0 || r >= this.rows || c < 0 || c >= this.cols || this.board[r][c] !== player) break;
                count++;
            }
            if (count >= 4) return true;
        }
        return false;
    }

    getState() {
        return {
            board: this.board,
            turn: this.turn,
            winner: this.winner,
            isDraw: this.isDraw
        };
    }
}

module.exports = GameLogic;
