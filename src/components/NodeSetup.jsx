import { useAccount } from 'wagmi';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Copy, Check, Server, ShieldCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect } from 'react';

const NodeSetup = () => {
    const { address, isConnected } = useAccount();
    const [copied, setCopied] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    // Node Status State
    const [nodeStatus, setNodeStatus] = useState('offline'); // 'offline', 'locked', 'online'
    const [lastHeartbeat, setLastHeartbeat] = useState(null);

    if (!isConnected) return null;

    const dockerCommand = `docker run -d --name ghozy-node \\
  -e ETH_ADDRESS=${address} \\
  -p 9000:9000 \\
  -p 8545:8545 \\
  ghozy/node:latest \\
  --http --http.corsdomain "*" \\
  --http.addr 0.0.0.0 --http.port 8545 \\
  --http.api eth,net,web3,debug \\
  --miner.etherbase ${address}`;

    // Real Node Monitoring Logic
    useEffect(() => {
        let heartbeatInterval;

        const checkNode = async () => {
            try {
                // 1. Verify Ownership: Call eth_coinbase
                const res = await fetch('http://localhost:8545', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: "2.0", method: "eth_coinbase", params: [], id: 1 })
                });

                const data = await res.json();
                const nodeOwner = data.result;

                // 2. Fetch Latest Block for Proof of Sync
                const blockRes = await fetch('http://localhost:8545', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ jsonrpc: "2.0", method: "eth_getBlockByNumber", params: ["latest", false], id: 2 })
                });
                const blockData = await blockRes.json();
                const latestBlock = blockData.result;

                if (nodeOwner && nodeOwner.toLowerCase() === address.toLowerCase()) {
                    setNodeStatus('online');
                    setLastHeartbeat(new Date());

                    // Report to Backend with Proof
                    await fetch('http://localhost:3001/heartbeat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            address,
                            latestBlockHash: latestBlock.hash,
                            blockHeight: parseInt(latestBlock.number, 16)
                        })
                    });
                } else {
                    setNodeStatus('locked'); // Mismatch
                }

            } catch (err) {
                setNodeStatus('offline');
            }
        };

        checkNode();
        heartbeatInterval = setInterval(checkNode, 60000);

        return () => clearInterval(heartbeatInterval);
    }, [address]);

    const handleCopy = () => {
        navigator.clipboard.writeText(dockerCommand);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{
                    width: '100%',
                    maxWidth: '420px',
                    zIndex: 10,
                    pointerEvents: 'auto'
                }}
            >
                <div style={{
                    background: 'rgba(10, 10, 10, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '16px',
                    overflow: 'hidden', // Ensure collapse clips content
                    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                    transition: 'all 0.3s ease'
                }}>
                    {/* Header - Always Visible */}
                    <div
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        style={{
                            padding: '1.25rem 1.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            cursor: 'pointer',
                            background: isCollapsed ? 'transparent' : 'rgba(255,255,255,0.02)',
                            borderBottom: isCollapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.05)'
                        }}
                    >
                        <div style={{
                            background: 'white',
                            borderRadius: '8px',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '32px'
                        }}>
                            <Server size={20} color="black" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <h2 style={{ fontSize: '1.1rem', fontWeight: '700', padding: 0, margin: 0, color: 'white' }}>Run a Node</h2>
                            {isCollapsed && (
                                <p style={{ fontSize: '0.8rem', color: nodeStatus === 'online' ? '#4ade80' : nodeStatus === 'locked' ? '#eab308' : '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{
                                        width: '6px',
                                        height: '6px',
                                        borderRadius: '50%',
                                        background: nodeStatus === 'online' ? '#4ade80' : nodeStatus === 'locked' ? '#eab308' : '#ef4444',
                                        display: 'inline-block'
                                    }}></span>
                                    {nodeStatus === 'online' ? 'Active' : nodeStatus === 'locked' ? 'Locked' : 'Offline'}
                                </p>
                            )}
                            {!isCollapsed && (
                                <p style={{ fontSize: '0.8rem', color: '#a1a1aa', margin: 0 }}>Earn GHOZY rewards</p>
                            )}
                        </div>
                        <button style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#a1a1aa',
                            cursor: 'pointer',
                            padding: '4px'
                        }}>
                            {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                        </button>
                    </div>

                    {/* Collapsible Content */}
                    <motion.div
                        initial={false}
                        animate={{ height: isCollapsed ? 0 : 'auto', opacity: isCollapsed ? 0 : 1 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        style={{ overflow: 'hidden' }}
                    >
                        <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', paddingTop: '1rem' }}>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontSize: '0.85rem', color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                                        <Terminal size={14} /> Docker Command
                                    </span>
                                </div>
                                <div style={{
                                    background: 'rgba(0,0,0,0.6)',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px',
                                    padding: '1rem',
                                    position: 'relative',
                                    fontFamily: 'monospace',
                                    fontSize: '0.8rem',
                                    color: '#e5e5e5',
                                    lineHeight: '1.5',
                                    overflowX: 'auto'
                                }}>
                                    <pre style={{ margin: 0 }}>{dockerCommand}</pre>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleCopy();
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            background: 'rgba(255,255,255,0.1)',
                                            border: 'none',
                                            borderRadius: '6px',
                                            padding: '4px',
                                            cursor: 'pointer',
                                            color: copied ? '#4ade80' : 'white',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#71717a', marginTop: '0.5rem', fontStyle: 'italic' }}>
                                    * Command updated to expose RPC port 8545 for monitoring.
                                </p>
                            </div>

                            <div style={{
                                background: nodeStatus === 'online' ? 'rgba(49, 175, 118, 0.1)' :
                                    nodeStatus === 'locked' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                border: `1px solid ${nodeStatus === 'online' ? 'rgba(49, 175, 118, 0.2)' :
                                    nodeStatus === 'locked' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                                borderRadius: '12px',
                                padding: '0.75rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <ShieldCheck size={20} color={nodeStatus === 'online' ? "#4ade80" : nodeStatus === 'locked' ? "#eab308" : "#ef4444"} />
                                <div>
                                    <div style={{ fontSize: '0.85rem', fontWeight: '600', color: nodeStatus === 'online' ? '#4ade80' : nodeStatus === 'locked' ? '#eab308' : '#ef4444' }}>
                                        {nodeStatus === 'online' ? 'Node Active' : nodeStatus === 'locked' ? 'Node Locked (Owner Mismatch)' : 'Node Offline'}
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                                        {nodeStatus === 'online'
                                            ? `RPC Verified. Last Sync: ${lastHeartbeat?.toLocaleTimeString()}`
                                            : nodeStatus === 'locked'
                                                ? 'The running node belongs to a different wallet.'
                                                : 'Waiting for heartbeat on localhost:8545...'
                                        }
                                    </div>
                                </div>
                            </div>
                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <a
                                    href="http://localhost:5173/docs/run-node"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{ fontSize: '0.8rem', color: '#a1a1aa', textDecoration: 'underline', cursor: 'pointer' }}
                                >
                                    Need help? Read the Docs
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NodeSetup;
