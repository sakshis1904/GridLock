import React, { useEffect, useState } from 'react';

const Leaderboard = () => {
    const [players, setPlayers] = useState([]);

    useEffect(() => {
        fetch('http://localhost:3001/api/leaderboard')
            .then(res => res.json())
            .then(data => setPlayers(data))
            .catch(err => console.error(err));
    }, []);

    return (
        <div style={{ marginTop: '2rem' }}>
            <h3 style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>🏆 Top Players</h3>
            <table>
                <thead>
                    <tr>
                        <th>Rank</th>
                        <th>Player</th>
                        <th>Wins</th>
                    </tr>
                </thead>
                <tbody>
                    {players.length === 0 ? (
                        <tr><td colSpan="3" style={{ textAlign: 'center' }}>No stats yet</td></tr>
                    ) : (
                        players.map((p, i) => (
                            <tr key={p._id}>
                                <td>#{i + 1}</td>
                                <td>{p.username}</td>
                                <td>{p.wins}</td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Leaderboard;
