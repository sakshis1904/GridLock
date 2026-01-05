import React, { useState, useEffect } from 'react';

const Game = ({ socket, gameData, onExit }) => {
    const [board, setBoard] = useState(Array(6).fill(Array(7).fill(0)));
    const [turn, setTurn] = useState(1);
    const [winner, setWinner] = useState(null);
    const [isDraw, setIsDraw] = useState(false);
    const [myPlayerNum, setMyPlayerNum] = useState(null);

    const { gameId, p1, p2 } = gameData;

    useEffect(() => {
        // Determine my player number
        if (socket.id) {
            // This is tricky because socket.id might have changed or server didn't send it back in gameData
            // But we can infer from the game_start event in App.jsx usually.
            // Let's assume passed in props or we handle it here.
            // Actually, we need to know if we are P1 or P2.
            // We can ask server "who am I" or just rely on server sending "you are p1"
        }
    }, []);

    useEffect(() => {
        socket.on('update_board', (state) => {
            setBoard(state.board);
            setTurn(state.turn);
            setWinner(state.winner);
            setIsDraw(state.isDraw);
        });

        socket.on('game_over', (result) => {
            if (result.winner) {
                setWinner(result.winner); // String name
            } else if (result.isDraw) {
                setIsDraw(true);
            }
        });

        return () => {
            socket.off('update_board');
            socket.off('game_over');
        };
    }, [socket]);

    const handleColumnClick = (colIndex) => {
        if (winner || isDraw) return;
        socket.emit('make_move', { gameId, column: colIndex });
    };

    // Helper to get cell class
    const getCellClass = (val) => {
        if (val === 1) return 'cell player-1';
        if (val === 2) return 'cell player-2';
        return 'cell';
    };

    const statusText = () => {
        if (winner) {
            // winner is a string username from server 'game_over', or number from 'update_board'
            // Wait, matchmaker sends 'game_over' with { winner: username }
            // 'update_board' sends { winner: 1 or 2 }
            if (typeof winner === 'string') return `${winner} Wins! 🎉`;
            return `Player ${winner} Wins!`;
        }
        if (isDraw) return "It's a Draw! 🤝";

        // Turn indication
        // We need to know who is who to say "Your Turn" or "Opponent's Turn"
        // For now just say "Player X's Turn"
        const isP1Turn = turn === 1;
        const activeName = isP1Turn ? p1 : p2;
        return `${activeName}'s Turn`;
    };

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div className="card" style={{ marginBottom: '1rem', padding: '1rem 2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '300px', alignItems: 'center' }}>
                    <div style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{p1}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>VS</div>
                    <div style={{ color: 'var(--secondary-color)', fontWeight: 'bold' }}>{p2}</div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: '1rem' }}>
                <h2 style={{ textAlign: 'center', margin: 0 }}>{statusText()}</h2>
            </div>

            <div className="game-board">
                {/* 
                  Board is 6 rows x 7 cols.
                  We usually render row by row.
                  But to handle clicks per column more intuitively, we can just map the 2D array.
                */}
                {board.map((row, rIndex) => (
                    row.map((cell, cIndex) => (
                        <div
                            key={`${rIndex}-${cIndex}`}
                            className={getCellClass(cell)}
                            onClick={() => handleColumnClick(cIndex)}
                        />
                    ))
                ))}
            </div>

            {(winner || isDraw) && (
                <button className="btn" style={{ marginTop: '2rem' }} onClick={onExit}>
                    Back to Lobby
                </button>
            )}
        </div>
    );
};

export default Game;
