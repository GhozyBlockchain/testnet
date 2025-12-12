import { useState, useEffect } from 'react'
import { Server, Terminal, Copy, Check, ExternalLink, Pencil, Loader, ChevronDown, ChevronUp } from 'lucide-react'
import { useAccount, useSignMessage } from 'wagmi'
import { motion } from 'framer-motion'
import useMobile from '../hooks/useMobile'
import { API_BASE_URL } from '../config'

const MyNodeView = () => {
    const { address } = useAccount();
    const { signMessageAsync } = useSignMessage();
    const isMobile = useMobile();
    const [copied, setCopied] = useState(false);
    const [nodeStatus, setNodeStatus] = useState('offline'); // 'offline', 'locked', 'online'
    const [identity, setIdentity] = useState(null);

    // Rename State
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isConfigCollapsed, setIsConfigCollapsed] = useState(false);

    const dockerCommand = `# 1. Clone the repository
git clone https://github.com/GhozyBlockchain/node.git
cd node

# 2. Configure Environment
cp .env.example .env
# Open .env and set your L1_RPC_URL and ETH_ADDRESS

# 3. Start the Node
make start`;

    // Real Node Monitoring Logic
    useEffect(() => {
        const checkNode = async () => {
            try {
                // Verify Ownership: Call eth_coinbase
                const res = await fetch('http://localhost:8545', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: "2.0", method: "eth_coinbase", params: [], id: 1 })
                });

                const data = await res.json();
                const nodeOwner = data.result;

                if (nodeOwner && nodeOwner.toLowerCase() === address.toLowerCase()) {
                    setNodeStatus('online');
                    // Report Heartbeat
                    const API_URL = API_BASE_URL;
                    await fetch(`${API_URL}/heartbeat`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ address })
                    });
                } else {
                    setNodeStatus('locked'); // Mismatch
                }
            } catch (err) { setNodeStatus('offline'); }
        };
        const interval = setInterval(checkNode, 5000); // Faster polling for focused view
        checkNode();
        return () => clearInterval(interval);
    }, [address]);

    // Fetch Identity
    const fetchIdentity = () => {
        if (!address) return;
        const API_URL = API_BASE_URL; // Alias for consistency or direct usage
        fetch(`${API_URL}/user/${address}`)
            .then(res => res.json())
            .then(data => {
                setIdentity(data);
                if (!isEditing) setNewName(data.node_name);
            });
    }

    useEffect(() => {
        fetchIdentity();
    }, [address]);

    const handleCopy = () => {
        navigator.clipboard.writeText(dockerCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRename = async () => {
        if (!newName || newName.length < 3) return;
        setIsSaving(true);
        try {
            const message = `Update Node Name to: ${newName}`;
            const signature = await signMessageAsync({ message });

            const API_URL = API_BASE_URL;
            const res = await fetch(`${API_URL}/update-name`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, signature, message, newName })
            });

            if (res.ok) {
                const data = await res.json();
                setIdentity(prev => ({ ...prev, node_name: data.node_name }));
                setIsEditing(false);
            } else {
                alert('Rename failed');
            }
        } catch (err) {
            console.error("Rename error", err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div
            onWheel={(e) => e.stopPropagation()}
            style={{
                width: '100%',
                maxWidth: '800px',
                margin: '0 auto',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                padding: isMobile ? '1rem 1rem 8rem 1rem' : '2rem 1rem 8rem 1rem',
                pointerEvents: 'auto',
                overflowY: 'auto'
            }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem' }}>
                <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'white' }}>My Node</h2>
                    <p style={{ color: '#a1a1aa' }}>Manage and monitor your infrastructure</p>
                </div>
                {/* Status Badge */}
                <div style={{
                    padding: '0.5rem 1rem',
                    background: nodeStatus === 'online' ? 'rgba(74, 222, 128, 0.1)' :
                        nodeStatus === 'locked' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${nodeStatus === 'online' ? '#4ade80' :
                        nodeStatus === 'locked' ? '#eab308' : '#ef4444'}`,
                    borderRadius: '100px',
                    color: nodeStatus === 'online' ? '#4ade80' : nodeStatus === 'locked' ? '#eab308' : '#ef4444',
                    fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'currentColor' }} />
                    {nodeStatus === 'online' ? 'ONLINE' : nodeStatus === 'locked' ? 'LOCKED' : 'OFFLINE'}
                </div>
            </div>

            {/* Info Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between' }}>
                        NODE IDENTITY
                        {!isEditing && identity?.node_name && (
                            <button onClick={() => { setIsEditing(true); setNewName(identity.node_name); }} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                                <Pencil size={14} />
                            </button>
                        )}
                    </div>

                    {isEditing ? (
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontSize: '1rem',
                                    width: '100%'
                                }}
                            />
                            <button
                                onClick={handleRename}
                                disabled={isSaving}
                                style={{
                                    background: '#4ade80', color: 'black', border: 'none', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontWeight: 600
                                }}
                            >
                                {isSaving ? <Loader className="animate-spin" size={14} /> : 'Save'}
                            </button>
                            <button onClick={() => setIsEditing(false)} style={{ background: 'transparent', border: '1px solid #52525b', color: '#a1a1aa', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}>X</button>
                        </div>
                    ) : (
                        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{identity?.node_name || '...'}</div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: '#52525b', fontFamily: 'monospace', marginTop: '4px' }}>{identity?.node_id || 'Generating...'}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem' }}>
                    <div style={{ color: '#a1a1aa', fontSize: '0.85rem', marginBottom: '0.5rem' }}>TOTAL UPTIME</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>{identity?.uptime_minutes || 0} min</div>
                    <div style={{ fontSize: '0.8rem', color: '#52525b', marginTop: '4px' }}>Since Registration</div>
                </div>
            </div>

            {/* Config Panel */}
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div
                    onClick={() => setIsConfigCollapsed(!isConfigCollapsed)}
                    style={{
                        padding: '1.5rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        cursor: 'pointer',
                        background: isConfigCollapsed ? 'transparent' : 'rgba(255,255,255,0.02)',
                        borderBottom: isConfigCollapsed ? 'none' : '1px solid rgba(255,255,255,0.05)'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', fontWeight: 600 }}>
                        <Terminal size={20} /> Docker Configuration
                    </div>
                    {isConfigCollapsed ? <ChevronDown size={20} color="#a1a1aa" /> : <ChevronUp size={20} color="#a1a1aa" />}
                </div>

                <motion.div
                    initial={false}
                    animate={{ height: isConfigCollapsed ? 0 : 'auto', opacity: isConfigCollapsed ? 0 : 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ overflow: 'hidden' }}
                >
                    <div style={{ padding: '1.5rem' }}>
                        <div style={{
                            background: 'rgba(0,0,0,0.5)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            position: 'relative',
                            fontFamily: 'monospace',
                            fontSize: '0.9rem',
                            color: '#e5e5e5',
                            lineHeight: '1.6',
                            overflowX: 'auto',
                            overflowY: 'auto', // Internal scroll
                            maxHeight: '300px', // Prevent huge height
                            marginBottom: '1.5rem'
                        }}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{dockerCommand}</pre>
                            <button
                                onClick={handleCopy}
                                style={{
                                    position: 'absolute',
                                    top: '12px', right: '12px',
                                    background: 'rgba(255,255,255,0.1)',
                                    border: 'none', borderRadius: '6px',
                                    padding: '6px',
                                    cursor: 'pointer',
                                    color: copied ? '#4ade80' : 'white'
                                }}
                            >
                                {copied ? <Check size={18} /> : <Copy size={18} />}
                            </button>
                        </div>

                        <a
                            href="http://localhost:3000/docs/run-node"
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                                padding: '1rem',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: 500,
                                transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.05)'}
                        >
                            <ExternalLink size={18} />
                            View Full Documentation
                        </a>
                    </div>
                </motion.div>
            </div>
            {/* Disclaimer for Locked Status */}
            {nodeStatus === 'locked' && (
                <div style={{
                    marginTop: '2rem',
                    padding: '1rem',
                    borderRadius: '12px',
                    background: 'rgba(234, 179, 8, 0.1)',
                    border: '1px solid rgba(234, 179, 8, 0.2)',
                    color: '#fef08a',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                }}>
                    <strong>Note:</strong> Your running node is configured for a different wallet.
                    Please restart your node with the command above to earn rewards on this account.
                </div>
            )}
        </div>
    )
}

export default MyNodeView
