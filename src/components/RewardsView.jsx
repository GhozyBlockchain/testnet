import { useState, useEffect } from 'react'
import { Activity, Clock, Zap, Gift } from 'lucide-react'
import { useAccount } from 'wagmi'
import useMobile from '../hooks/useMobile'

const RewardsView = () => {
    const { address } = useAccount();
    const isMobile = useMobile();
    const [stats, setStats] = useState({ points: 0, uptime: 0, node_name: '' });

    useEffect(() => {
        if (!address) return;
        const fetchStats = async () => {
            try {
                const res = await fetch(`http://localhost:3001/user/${address}`);
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        points: data.points || 0,
                        uptime: data.uptime_minutes || 0,
                        node_name: data.node_name || 'Unknown'
                    });
                }
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };
        fetchStats();
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, [address]);

    const [claiming, setClaiming] = useState(false);

    const handleClaim = async () => {
        if (stats.points < 100) return; // Minimum check
        setClaiming(true);
        try {
            const res = await fetch('http://localhost:3001/faucet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });
            const data = await res.json();

            if (res.ok) {
                alert(`Success! Tx: ${data.hash}`);
            } else {
                alert(`Claim Failed: ${data.error}`);
            }
        } catch (err) {
            alert('Claim Error: ' + err.message);
        } finally {
            setClaiming(false);
        }
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: isMobile ? '1rem 1rem 8rem 1rem' : '2rem 1rem 8rem 1rem',
            pointerEvents: 'auto'
        }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <div style={{
                    width: '80px', height: '80px', margin: '0 auto 1.5rem auto',
                    background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)',
                    borderRadius: '24px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 40px rgba(74, 222, 128, 0.3)'
                }}>
                    <Gift size={40} color="black" />
                </div>
                <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', marginBottom: '0.5rem' }}>
                    {stats.points} <span style={{ fontSize: '1.5rem', color: '#a1a1aa' }}>PTS</span>
                </h2>
                <p style={{ color: '#a1a1aa' }}>Total Pending Rewards</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Clock size={24} color="#a1a1aa" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>{stats.uptime}m</div>
                    <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Verified Uptime</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center' }}>
                    <Zap size={24} color="#a1a1aa" style={{ marginBottom: '1rem' }} />
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>1.0x</div>
                    <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Multiplier</div>
                </div>
            </div>

            {/* <button
                onClick={handleClaim}
                disabled={stats.points < 100 || claiming}
                style={{
                    width: '100%',
                    padding: '1.25rem',
                    background: stats.points >= 100 ? 'white' : 'rgba(255,255,255,0.05)',
                    color: stats.points >= 100 ? 'black' : '#52525b',
                    border: 'none',
                    borderRadius: '16px',
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    cursor: stats.points >= 100 ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s',
                    boxShadow: stats.points >= 100 ? '0 0 20px rgba(255,255,255,0.2)' : 'none',
                    opacity: claiming ? 0.7 : 1
                }}>
                {claiming ? 'Processing...' : stats.points < 100 ? `Need 100 PTS to Claim` : 'Claim 0.05 ETH'}
            </button> */}

            <button disabled style={{
                width: '100%',
                padding: '1.25rem',
                background: 'rgba(255,255,255,0.05)',
                color: '#52525b',
                border: 'none',
                borderRadius: '16px',
                fontSize: '1.1rem',
                fontWeight: 700,
                cursor: 'not-allowed',
            }}>
                Rewards Trading Coming Soon
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#52525b', marginTop: '1rem' }}>
                Points currently used for Leaderboard Ranking & Badges only.
            </p>
        </div>
    )
}

export default RewardsView
