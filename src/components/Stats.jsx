import { Activity, Layers, Zap } from 'lucide-react'
import { useAccount } from 'wagmi'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useNetworkStats from '../hooks/useNetworkStats'
import PulseGraph from './PulseGraph'
import { API_BASE_URL } from '../config'

const StatCard = ({ icon: Icon, label, value, children, subtext }) => (
    <div className="glass-panel" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 10 }}>
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                <Icon size={20} color="white" />
            </div>
            <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{value}</div>
                {subtext && <div style={{ fontSize: '0.7rem', color: '#a1a1aa' }}>{subtext}</div>}
            </div>
        </div>
        {children && (
            <div style={{
                position: 'absolute', bottom: 0, left: 0, width: '100%', height: '50px',
                zIndex: 0, opacity: 0.5
            }}>
                {children}
            </div>
        )}
    </div>
)

const Stats = () => {
    const { address } = useAccount();
    const navigate = useNavigate();
    const [userStats, setUserStats] = useState({ points: 0, uptime: 0 });
    const networkStats = useNetworkStats();

    useEffect(() => {
        if (!address) return;

        const fetchStats = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/user/${address}`, {
                    headers: { 'ngrok-skip-browser-warning': 'true' }
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserStats({
                        points: data.points || 0,
                        uptime: data.uptime_minutes || 0
                    });
                }
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [address]);

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            width: '100%', // Flexible width
            pointerEvents: 'auto'
        }}>
            <StatCard icon={Activity} label="Your Rewards" value={`${userStats.points} PTS`} />

            <StatCard icon={Layers} label="Uptime" value={`${userStats.uptime} Mins`} />

            <StatCard
                icon={Zap}
                label="Network TPS"
                value={networkStats.tps}
                subtext={
                    <a
                        href={`http://localhost:5174/block/${networkStats.blockHeight}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#a1a1aa', textDecoration: 'none', transition: 'color 0.2s' }}
                        onMouseOver={(e) => e.target.style.color = '#4ade80'}
                        onMouseOut={(e) => e.target.style.color = '#a1a1aa'}
                    >
                        Block {networkStats.blockHeight}
                    </a>
                }
            >
                <PulseGraph history={networkStats.history} color="#4ade80" />
            </StatCard>

            <div style={{ marginTop: '0.5rem' }}>
                <button
                    onClick={() => navigate('/rewards')}
                    style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'transform 0.1s',
                        boxShadow: '0 4px 12px rgba(255,255,255,0.1)'
                    }}
                >
                    {/* Button renamed to avoid 'Claim/Faucet' confusion */}
                    View Rewards
                </button>
            </div>
        </div>
    )
}

export default Stats
