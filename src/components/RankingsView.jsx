import { useState, useEffect } from 'react'
import { Trophy, ChevronLeft, ChevronRight, User } from 'lucide-react'
import { useAccount } from 'wagmi'
import useMobile from '../hooks/useMobile'
import Podium from './Podium'

const RankingsView = () => {
    const { address } = useAccount();
    const isMobile = useMobile();
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    useEffect(() => {
        fetch('http://localhost:3001/leaderboard')
            .then(res => res.json())
            .then(data => setUsers(data))
            .catch(err => console.error(err))
    }, []);

    // Filter "Me"
    const myRankIndex = users.findIndex(u => u.address.toLowerCase() === address?.toLowerCase());
    const myData = myRankIndex !== -1 ? { ...users[myRankIndex], rank: myRankIndex + 1 } : null;

    // Separate Top 3 for Podium
    const top3 = users.slice(0, 3);
    const restOfUsers = users.slice(3); // Rank 4+

    // Pagination Logic (Applied to restOfUsers if using Podium, OR full list?)
    // Decision: Show Podium for 1-3. List starts at 4.
    // If we want consistent pagination, page 1 is Podium + 17 items.
    // BUT Podium takes space.
    // Let's keep data consistent.
    // OPTION A: Table contains ALL users (1-100). Podium duplicates 1-3 visually at top.
    // OPTION B: Table starts at Rank 4.
    // "Podium Leaderboard: Upgrade the Rankings page to show the Top 3 Node Runners on a 3D-style podium...". Usually this implies removing them from the list or highlighting them.
    // Duplication is safer for "Search/Scan". Removing them makes the table start at 4 which is fine.
    // I will show Podium at top, and Full Table below it. It's clearer.

    // Pagination Logic (Full List)
    const totalPages = Math.ceil(users.length / itemsPerPage);
    const paginatedUsers = users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    // Badge Logic
    const getBadges = (user) => {
        const badges = [];
        // 🛡️ Guardian: Uptime > 1000m
        if (user.uptime_minutes >= 1000) badges.push({ icon: '🛡️', label: 'Guardian' });
        // 🚀 Early Adopter: Uptime > 100m (Simplified)
        else if (user.uptime_minutes >= 100) badges.push({ icon: '🚀', label: 'Early Adopter' });
        // ⚡ Power Node: Points > 5000
        if (user.points >= 5000) badges.push({ icon: '⚡', label: 'Power Node' });

        // 👑 Top 3 (Additional Badge)
        // We can check rank index, but user object doesn't have it unless mapped.
        // Actually, let's keep it simple based on stats.

        return badges;
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '1000px',
            margin: '0 auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: isMobile ? '1rem 1rem 8rem 1rem' : '2rem 1rem 8rem 1rem', // Reduced padding on mobile
            pointerEvents: 'auto'
        }}>
            {/* Header */}
            <div style={{ marginBottom: isMobile ? '1rem' : '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>Global Leaderboard</h2>
                <p style={{ color: '#a1a1aa' }}>Top performing nodes on the Ghozy Network</p>
            </div>

            {/* Podium (Only on Page 1) */}
            {currentPage === 1 && users.length >= 3 && (
                <Podium users={top3} />
            )}

            {/* My Rank Pin */}
            {myData && (
                <div style={{
                    background: 'rgba(74, 222, 128, 0.1)',
                    border: '1px solid rgba(74, 222, 128, 0.3)',
                    borderRadius: '12px',
                    padding: isMobile ? '1rem' : '1rem 2rem',
                    marginBottom: '2rem',
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '1rem' : '0',
                    alignItems: isMobile ? 'flex-start' : 'center',
                    justifyContent: 'space-between',
                    backdropFilter: 'blur(10px)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                        <div style={{
                            width: '40px', height: '40px',
                            background: '#4ade80', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: 'black',
                            flexShrink: 0
                        }}>
                            #{myData.rank}
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.8rem', color: '#4ade80', fontWeight: 600, textTransform: 'uppercase' }}>Your Current Rank</div>
                            <div style={{ fontSize: '1.1rem', color: 'white', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={16} style={{ flexShrink: 0 }} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {myData.node_name || "Unregistered Node"}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div style={{ textAlign: isMobile ? 'left' : 'right', paddingLeft: isMobile ? ' calc(40px + 1rem)' : '0' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>{myData.points}</div>
                        <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Total Points</div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '50px 1fr 80px' : '60px 1fr 120px', // Tighter cols on mobile
                    padding: isMobile ? '1rem 0.5rem' : '1rem 1.5rem',
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    color: '#a1a1aa',
                    fontSize: isMobile ? '0.7rem' : '0.8rem',
                    fontWeight: 600,
                    textTransform: 'uppercase'
                }}>
                    <div style={{ textAlign: 'center' }}>Rank</div>
                    <div>Node Identity</div>
                    <div style={{ textAlign: 'right' }}>Points</div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {paginatedUsers.map((user, i) => {
                        const rank = (currentPage - 1) * itemsPerPage + i + 1;
                        const isMe = user.address.toLowerCase() === address?.toLowerCase();

                        return (
                            <div key={user.address} style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '50px 1fr 80px' : '60px 1fr 120px',
                                padding: isMobile ? '1rem 0.5rem' : '1rem 1.5rem',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                                background: isMe ? 'rgba(74, 222, 128, 0.05)' : 'transparent',
                                alignItems: 'center',
                                transition: 'background 0.2s',
                                fontSize: isMobile ? '0.9rem' : '1rem'
                            }}>
                                <div style={{ color: isMe ? '#4ade80' : 'white', fontWeight: 700, textAlign: 'center' }}>
                                    {rank === 1 ? <Trophy size={18} color="#FFD700" /> : rank === 2 ? <Trophy size={18} color="#C0C0C0" /> : rank === 3 ? <Trophy size={18} color="#CD7F32" /> : rank}
                                </div>
                                <div style={{ overflow: 'hidden', paddingRight: '0.5rem' }}>
                                    <div style={{ color: 'white', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {user.node_name || 'Anonymous Node'}
                                        {getBadges(user).map((b, idx) => (
                                            <span key={idx} title={b.label} style={{ fontSize: '0.8rem', cursor: 'help' }}>{b.icon}</span>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#71717a', fontFamily: 'monospace' }}>
                                        {isMobile ? `${user.address.slice(0, 4)}...${user.address.slice(-4)}` : user.address}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', fontWeight: 700, color: isMe ? '#4ade80' : 'white' }}>
                                    {user.points}
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Pagination Controls */}
                <div style={{
                    padding: '1rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none', borderRadius: '8px',
                            padding: '0.5rem',
                            color: currentPage === 1 ? '#52525b' : 'white',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>
                        Page <span style={{ color: 'white', fontWeight: 600 }}>{currentPage}</span> of {totalPages || 1}
                    </span>
                    <button
                        disabled={currentPage === totalPages || totalPages === 0}
                        onClick={() => setCurrentPage(p => p + 1)}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: 'none', borderRadius: '8px',
                            padding: '0.5rem',
                            color: (currentPage === totalPages || totalPages === 0) ? '#52525b' : 'white',
                            cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer'
                        }}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default RankingsView
