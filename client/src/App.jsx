import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import Lobby from './components/Lobby';
import Game from './components/Game';

// Connect to backend
const socket = io('/', {
    transports: ['websocket'],
    autoConnect: true
});

function App() {
    const [gameState, setGameState] = useState('lobby'); // lobby, game
    const [gameData, setGameData] = useState(null);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Connected to server');
        });

        socket.on('game_start', (data) => {
            console.log('Game started', data);
            setGameData(data);
            setGameState('game');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected');
            setGameState('lobby');
        });

        return () => {
            socket.off('connect');
            socket.off('game_start');
            socket.off('disconnect');
        };
    }, []);

    const handleExitGame = () => {
        setGameState('lobby');
        setGameData(null);
        // Optional: emit leave
    };

    return (
        <div className="container">
            <h1 className="title">GRIDLOCK</h1>

            {gameState === 'lobby' && (
                <Lobby socket={socket} />
            )}

            {gameState === 'game' && gameData && (
                <Game socket={socket} gameData={gameData} onExit={handleExitGame} />
            )}

            <footer style={{ textAlign: 'center', marginTop: '3rem', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
                Connect 4 Multiplayer • MERN Stack
            </footer>
        </div>
    );
}

export default App;
