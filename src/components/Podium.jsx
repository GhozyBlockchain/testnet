import { Trophy, User, Crown } from 'lucide-react';
import useMobile from '../hooks/useMobile';

const PodiumItem = ({ user, rank, delay }) => {
    const isMobile = useMobile();
    if (!user) return null;

    let height = '140px';
    let color = '#a1a1aa'; // Default
    let bg = 'rgba(255,255,255,0.05)';
    let glow = 'none';
    let iconColor = '#a1a1aa';
    let borderColor = 'rgba(255,255,255,0.1)';

    if (rank === 1) {
        height = isMobile ? '160px' : '220px';
        color = '#FFD700'; // Gold
        bg = 'linear-gradient(180deg, rgba(255, 215, 0, 0.15) 0%, rgba(255, 215, 0, 0.05) 100%)';
        glow = '0 0 40px rgba(255, 215, 0, 0.2)';
        iconColor = '#FFD700';
        borderColor = 'rgba(255, 215, 0, 0.3)';
    } else if (rank === 2) {
        height = isMobile ? '130px' : '170px';
        color = '#C0C0C0'; // Silver
        bg = 'linear-gradient(180deg, rgba(192, 192, 192, 0.15) 0%, rgba(192, 192, 192, 0.05) 100%)';
        glow = '0 0 30px rgba(192, 192, 192, 0.15)';
        iconColor = '#C0C0C0';
        borderColor = 'rgba(192, 192, 192, 0.3)';
    } else if (rank === 3) {
        height = isMobile ? '110px' : '140px';
        color = '#CD7F32'; // Bronze
        bg = 'linear-gradient(180deg, rgba(205, 127, 50, 0.15) 0%, rgba(205, 127, 50, 0.05) 100%)';
        glow = '0 0 30px rgba(205, 127, 50, 0.15)';
        iconColor = '#CD7F32';
        borderColor = 'rgba(205, 127, 50, 0.3)';
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-end',
            width: '100%',
        }}>
            {/* Avatar / Name */}
            <div style={{ marginBottom: '1rem', textAlign: 'center', opacity: 0, animation: `fadeInUp 0.5s ease-out ${delay}s forwards` }}>
                <div style={{
                    width: isMobile ? '40px' : '50px',
                    height: isMobile ? '40px' : '50px',
                    borderRadius: '50%',
                    background: color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 0.5rem auto',
                    color: 'black',
                    fontWeight: 700,
                    boxShadow: glow
                }}>
                    {rank === 1 ? <Crown size={isMobile ? 20 : 26} /> : <User size={isMobile ? 20 : 26} />}
                </div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: isMobile ? '0.8rem' : '1rem', marginBottom: '0.25rem' }}>
                    {user.node_name || 'Node'}
                </div>
                <div style={{ color: color, fontWeight: 800, fontSize: isMobile ? '0.9rem' : '1.1rem' }}>
                    {user.points} PTS
                </div>
            </div>

            {/* Pillar */}
            <div style={{
                width: '100%',
                maxWidth: '120px',
                height: 0, // Animate to height
                animation: `growUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) ${delay}s forwards`,
                background: bg,
                borderTop: `2px solid ${color}`,
                borderLeft: `1px solid ${borderColor}`,
                borderRight: `1px solid ${borderColor}`,
                borderRadius: '8px 8px 0 0',
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: glow,
                '--target-height': height
            }}>
                <div style={{ fontSize: isMobile ? '2rem' : '3rem', fontWeight: 900, color: 'rgba(255,255,255,0.1)' }}>
                    {rank}
                </div>
            </div>
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes growUp {
                    from { height: 0; }
                    to { height: var(--target-height); }
                }
            `}</style>
        </div>
    );
};

const Podium = ({ users }) => {
    // Expect sorted users array.
    // Rank 2 (Left), Rank 1 (Center), Rank 3 (Right)
    const rank1 = users[0];
    const rank2 = users[1];
    const rank3 = users[2];

    const isMobile = useMobile();

    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            gap: isMobile ? '0.5rem' : '2rem',
            padding: isMobile ? '1rem 0 2rem 0' : '2rem 0 4rem 0',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <div style={{ flex: 1, zIndex: 1 }}>
                <PodiumItem user={rank2} rank={2} delay={0.2} />
            </div>
            <div style={{ flex: 1.2, zIndex: 2 }}>
                <PodiumItem user={rank1} rank={1} delay={0} />
            </div>
            <div style={{ flex: 1, zIndex: 1 }}>
                <PodiumItem user={rank3} rank={3} delay={0.4} />
            </div>
        </div>
    );
};

export default Podium;
