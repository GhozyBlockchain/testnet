import { useState } from 'react'
import { Droplets, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { useAccount } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'

const FaucetCard = () => {
    const { address, isConnected } = useAccount()
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState(null)
    const [message, setMessage] = useState('')

    const requestFunds = async () => {
        if (!address) return
        setLoading(true)
        setStatus(null)
        try {
            const res = await fetch('http://localhost:3001/faucet', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            })
            const data = await res.json()
            if (res.ok) {
                setStatus('success')
                setMessage('Funds sent successfully!')
            } else {
                setStatus('error')
                setMessage(data.error || 'Failed')
            }
        } catch (err) {
            setStatus('error')
            setMessage('Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Droplets size={18} /> Quick Faucet
            </h3>

            {!isConnected ? (
                <div style={{ transform: 'scale(0.95)', transformOrigin: 'top left' }}>
                    <ConnectButton />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        className="btn btn-primary"
                        onClick={requestFunds}
                        disabled={loading}
                        style={{ width: '100%', padding: '0.75rem' }}
                    >
                        {loading && <Loader2 size={16} className="spin" style={{ marginRight: '0.5rem' }} />}
                        Request 0.05 ETH
                    </button>
                    {status && (
                        <div style={{
                            fontSize: '0.85rem',
                            color: status === 'success' ? '#4ade80' : '#f87171',
                            display: 'flex', alignItems: 'center', gap: '0.5rem'
                        }}>
                            {status === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                            {message}
                        </div>
                    )}
                </div>
            )}
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    )
}

export default FaucetCard
