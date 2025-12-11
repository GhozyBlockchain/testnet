import { useState, useEffect } from 'react'
import { Trophy } from 'lucide-react'
import { API_BASE_URL } from '../config'

const LeaderboardPanel = () => {
    const [users, setUsers] = useState([])

    useEffect(() => {
        fetch(`${API_BASE_URL}/leaderboard`)
            .then(res => res.json())
            .then(data => setUsers(data.slice(0, 10))) // Top 10 only
            .catch(err => console.error(err))
    }, [])

    return (
        <div className="glass-panel" style={{
            width: '320px',
            padding: '0',
            zIndex: 10,
            maxHeight: 'calc(100vh - 300px)', // Ensure space for NodeSetup above it
            display: 'flex',
            flexDirection: 'column',
            pointerEvents: 'auto'
        }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Trophy size={16} color="#FFD700" /> Top Nodes
                </h3>
            </div>

            <div style={{ overflowY: 'auto', flex: 1 }}>
                {users.map((user, i) => (
                    <div key={user.address} style={{
                        padding: '1rem 1.25rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.9rem'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <span style={{ color: 'var(--text-muted)', width: '1rem', fontWeight: 600 }}>{i + 1}</span>
                            <span style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                                {user.address.substr(0, 6)}...{user.address.substr(-4)}
                            </span>
                        </div>
                        <div style={{ fontWeight: 700, color: 'white' }}>{user.points}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default LeaderboardPanel
