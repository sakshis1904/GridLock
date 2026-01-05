import React, { useState } from 'react';
import Leaderboard from './Leaderboard';

const Lobby = ({ socket, onJoin }) => {
    const [username, setUsername] = useState('');
    const [searching, setSearching] = useState(false);

    const handleJoin = () => {
        if (!username.trim()) return;
        setSearching(true);
        // If socket is connected?
        socket.emit('join_queue', { username });
    };

    return (
        <div className="card" style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '1rem' }}>Enter the Grid</h2>

            {!searching ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        maxLength={12}
                    />
                    <button className="btn" onClick={handleJoin} disabled={!username}>
                        Find Match
                    </button>
                </div>
            ) : (
                <div className="searching" style={{ padding: '2rem' }}>
                    <h3>Searching for opponent...</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>
                        If no one joins in 10s, you'll play against a Bot.
                    </p>
                </div>
            )}

            <Leaderboard />
        </div>
    );
};

export default Lobby;
