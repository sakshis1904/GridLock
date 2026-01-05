const GameLogic = require('./gameLogic');
const Bot = require('./bot');
const Player = require('./models/Player'); // We'll stub this out for now if not ready

class Matchmaker {
    constructor(io) {
        this.io = io;
        this.queue = []; // Array of { socket, username, joinTime, timeoutId }
        this.activeGames = new Map(); // gameId -> { gameLogic, p1, p2, timers... }
    }

    addPlayer(socket, username) {
        // Check if already in a game
        for (let game of this.activeGames.values()) {
            if (game.p1.socket.id === socket.id || (game.p2 && game.p2.socket.id === socket.id)) {
                return; // Already playing
            }
        }

        // Check if already in queue
        if (this.queue.find(p => p.socket.id === socket.id)) {
            return;
        }

        console.log(`Adding ${username} to queue`);
        const playerObj = {
            socket,
            username,
            joinTime: Date.now()
        };

        // Try to match immediately
        if (this.queue.length > 0) {
            const opponent = this.queue.shift();
            clearTimeout(opponent.timeoutId);
            this.startGame(opponent, playerObj);
        } else {
            // Wait for opponent
            playerObj.timeoutId = setTimeout(() => {
                this.startBotGame(playerObj);
            }, 10000); // 10 seconds
            this.queue.push(playerObj);
        }
    }

    removePlayer(socket) {
        // Remove from queue
        const qIndex = this.queue.findIndex(p => p.socket.id === socket.id);
        if (qIndex !== -1) {
            clearTimeout(this.queue[qIndex].timeoutId);
            this.queue.splice(qIndex, 1);
        }

        // Handle active game disconnect
        for (let [gameId, game] of this.activeGames) {
            if (game.p1.socket.id === socket.id || (game.p2 && game.p2.socket.id === socket.id)) {
                const winner = game.p1.socket.id === socket.id ? game.p2 : game.p1;
                if (winner) {
                    this.io.to(winner.socket.id).emit('game_over', {
                        winner: winner.username,
                        reason: 'opponent_disconnected'
                    });
                    // Update stats (TODO)
                }
                this.activeGames.delete(gameId);
                break;
            }
        }
    }

    startGame(p1, p2) {
        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const gameLogic = new GameLogic();

        this.activeGames.set(gameId, {
            gameLogic,
            p1: { ...p1, playerNum: 1 },
            p2: { ...p2, playerNum: 2 },
            gameId
        });

        p1.socket.join(gameId);
        p2.socket.join(gameId);

        this.io.to(gameId).emit('game_start', {
            gameId,
            p1: p1.username,
            p2: p2.username,
            turn: 1 // p1 starts
        });

        console.log(`Started game ${gameId} between ${p1.username} and ${p2.username}`);
    }

    startBotGame(p1) {
        // Remove from queue if still there
        const qIndex = this.queue.findIndex(p => p.socket.id === p1.socket.id);
        if (qIndex !== -1) {
            this.queue.splice(qIndex, 1);
        }

        const gameId = `bot_game_${Date.now()}`;
        const gameLogic = new GameLogic();
        const bot = new Bot();

        this.activeGames.set(gameId, {
            gameLogic,
            p1: { ...p1, playerNum: 1 },
            p2: { username: 'Bot 🤖', isBot: true, botInstance: bot, playerNum: 2 },
            gameId
        });

        p1.socket.join(gameId);

        this.io.to(p1.socket.id).emit('game_start', {
            gameId,
            p1: p1.username,
            p2: 'Bot 🤖',
            turn: 1
        });

        console.log(`Started bot game for ${p1.username}`);
    }

    handleMove(socket, col) {
        // Find game
        let game = null;
        let playerNum = 0;

        for (let g of this.activeGames.values()) {
            if (g.p1.socket.id === socket.id) {
                game = g;
                playerNum = 1;
                break;
            }
            if (g.p2 && !g.p2.isBot && g.p2.socket.id === socket.id) {
                game = g;
                playerNum = 2;
                break;
            }
        }

        if (!game) return;

        const success = game.gameLogic.makeMove(playerNum, col);
        if (success) {
            this.io.to(game.gameId).emit('update_board', game.gameLogic.getState());

            if (game.gameLogic.winner || game.gameLogic.isDraw) {
                this.endGame(game);
            } else if (game.p2.isBot && game.gameLogic.turn === 2) {
                // Bot's turn
                setTimeout(() => {
                    const botMove = game.p2.botInstance.decideMove(game.gameLogic);
                    game.gameLogic.makeMove(2, botMove);
                    this.io.to(game.gameId).emit('update_board', game.gameLogic.getState());
                    if (game.gameLogic.winner || game.gameLogic.isDraw) {
                        this.endGame(game);
                    }
                }, 1000 + Math.random() * 1000); // Simulate thinking
            }
        }
    }

    endGame(game) {
        let result = {
            winner: null,
            isDraw: game.gameLogic.isDraw
        };

        if (game.gameLogic.winner) {
            result.winner = game.gameLogic.winner === 1 ? game.p1.username : game.p2.username;
            // TODO: Update MongoDB stats here
            this.saveGameKeys(game.gameLogic.winner === 1 ? game.p1.username : game.p2.username);
        }

        this.io.to(game.gameId).emit('game_over', result);
        this.activeGames.delete(game.gameId);
    }

    async saveGameKeys(winnerUsername) {
        // Placeholder for DB save
        if (winnerUsername === 'Bot 🤖') return;

        try {
            await Player.updateOne(
                { username: winnerUsername },
                { $inc: { wins: 1 } },
                { upsert: true }
            );
        } catch (e) {
            console.error("Error saving stats", e);
        }
    }
}

module.exports = Matchmaker;
