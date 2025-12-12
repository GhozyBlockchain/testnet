import { useState, useEffect } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Loader, Key } from 'lucide-react';
import { API_BASE_URL } from '../config';

const RegistrationModal = ({ onRegisterSuccess }) => {
    const { address, isConnected } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [identity, setIdentity] = useState(null); // { node_id, node_name }

    useEffect(() => {
        if (!isConnected || !address) return;

        // Check if user is already registered
        const checkRegistration = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/user/${address}`);
                if (res.ok) {
                    const data = await res.json();
                    if (!data.node_id) {
                        setIsOpen(true);
                    } else {
                        if (onRegisterSuccess) onRegisterSuccess(data);
                    }
                } else {
                    console.error("Server returned error:", res.status);
                    // Optionally handle server error state here
                }
            } catch (err) {
                console.error("Registration check failed (Network):", err);
                // If backend is down, we might want to let them retry or just wait
                // For now, logging is enough, but maybe retry later?
            }
        }
        checkRegistration();
    }, [address, isConnected]);

    const handleRegister = async () => {
        setIsLoading(true);
        try {
            const message = "Register Node for Ghozy Testnet";
            const signature = await signMessageAsync({ message });

            const res = await fetch(`${API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, signature, message })
            });

            const data = await res.json();
            if (data.success) {
                setIdentity(data);
                // Keep modal open briefly to show success
                setTimeout(() => {
                    setIsOpen(false);
                    if (onRegisterSuccess) onRegisterSuccess(data);
                }, 2000);
            }
        } catch (err) {
            console.error("Registration failed", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 100,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(5px)',
                    pointerEvents: 'auto' // BLOCK CLICKS to underlying globe
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        style={{
                            background: '#0a0a0a',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '16px',
                            padding: '2rem',
                            width: '400px',
                            textAlign: 'center',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                        }}
                    >
                        {!identity ? (
                            <>
                                <div style={{
                                    width: '64px', height: '64px',
                                    background: 'rgba(74, 222, 128, 0.1)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.5rem auto'
                                }}>
                                    <Key size={32} color="#4ade80" />
                                </div>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem' }}>
                                    Setup Node Identity
                                </h2>
                                <p style={{ color: '#a1a1aa', marginBottom: '2rem', fontSize: '0.9rem' }}>
                                    To participate in the incentivized testnet, you need to generate a unique Node ID. This requires a signature.
                                </p>
                                <button
                                    onClick={handleRegister}
                                    disabled={isLoading}
                                    style={{
                                        width: '100%',
                                        padding: '1rem',
                                        background: 'white',
                                        color: 'black',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontWeight: 600,
                                        cursor: isLoading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem',
                                        opacity: isLoading ? 0.7 : 1
                                    }}
                                >
                                    {isLoading ? <Loader className="animate-spin" size={20} /> : null}
                                    {isLoading ? 'Signing...' : 'Sign to Register'}
                                </button>
                            </>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{
                                    width: '64px', height: '64px',
                                    background: 'rgba(74, 222, 128, 0.1)',
                                    borderRadius: '50%',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    margin: '0 auto 1.5rem auto'
                                }}>
                                    <ShieldCheck size={32} color="#4ade80" />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
                                    Identity Generated!
                                </h2>
                                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>NODE NAME</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#4ade80' }}>{identity.node_name}</div>
                                </div>
                                <p style={{ fontSize: '0.8rem', color: '#71717a' }}>Redirecting...</p>
                            </motion.div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default RegistrationModal;
