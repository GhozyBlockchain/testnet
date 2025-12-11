import { motion } from 'framer-motion';
import { Cpu, Globe, Trophy } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import useMobile from '../hooks/useMobile';

const FeatureItem = ({ icon: Icon, title, desc }) => (
    <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '1rem',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
        padding: '1.25rem',
        borderRadius: '12px',
        backdropFilter: 'blur(4px)'
    }}>
        <div style={{
            background: 'rgba(255,255,255,0.1)',
            padding: '8px',
            borderRadius: '8px',
            color: 'white'
        }}>
            <Icon size={20} />
        </div>
        <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>{title}</h4>
            <p style={{ fontSize: '0.85rem', color: '#a1a1aa', lineHeight: 1.4 }}>{desc}</p>
        </div>
    </div>
);

const TestnetLanding = () => {
    const isMobile = useMobile();

    return (
        <div style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: isMobile ? '0 1rem' : '0 2rem',
            position: 'relative',
            zIndex: 20
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                style={{ textAlign: 'center', marginBottom: isMobile ? '2rem' : '3rem' }}
            >
                <div style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    color: '#e5e5e5',
                    fontSize: '0.85rem',
                    fontWeight: 500,
                    marginBottom: '1.5rem',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}>
                    Alpha Phase Live
                </div>

                <h1 style={{
                    fontSize: isMobile ? '3rem' : '4.5rem',
                    fontWeight: 800,
                    lineHeight: 1.1,
                    color: 'white',
                    letterSpacing: '-0.02em',
                    marginBottom: '1.5rem',
                    textShadow: '0 0 40px rgba(0,0,0,0.5)'
                }}>
                    Join the Ghozy <br />
                    <span style={{
                        background: 'linear-gradient(to right, #ffffff, #9ca3af)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>Global Network</span>
                </h1>

                <p style={{
                    fontSize: isMobile ? '1rem' : '1.1rem',
                    color: '#d4d4d8',
                    maxWidth: '600px',
                    margin: '0 auto 2.5rem auto',
                    lineHeight: 1.6
                }}>
                    Participate in the incentivized testnet by running a node.
                    Verify blocks, secure the chain, and earn rewards for your contribution.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                    <div style={{ transform: isMobile ? 'scale(1)' : 'scale(1.1)' }}>
                        <ConnectButton label="Connect Wallet to Join" showBalance={false} />
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: isMobile ? '1rem' : '1.5rem',
                    width: '100%'
                }}
            >
                <FeatureItem
                    icon={Globe}
                    title="Global Infrastructure"
                    desc="Run a node from anywhere. Visualize your contribution on the live network map."
                />
                <FeatureItem
                    icon={Trophy}
                    title="Incentivized Rewards"
                    desc="Earn points for uptime and block verification. Climb the leaderboard."
                />
                <FeatureItem
                    icon={Cpu}
                    title="Lightweight & Fast"
                    desc="Optimized for minimal hardware. Set up in minutes with a single Docker command."
                />
            </motion.div>
        </div>
    );
};

export default TestnetLanding;
