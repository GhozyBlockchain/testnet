import { useState, useEffect, useRef } from 'react';
import { createPublicClient, http } from 'viem';

const ghozyTestnet = {
    id: 5207,
    name: 'Ghozy Testnet',
    network: 'ghozy',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['http://localhost:8545'] } },
}

const client = createPublicClient({
    chain: ghozyTestnet,
    transport: http()
});

const useNetworkStats = () => {
    const [stats, setStats] = useState({
        tps: 0,
        blockHeight: 0,
        avgBlockTime: 0,
        history: [] // generic history for graphing
    });
    const historyRef = useRef([]); // To keep track without re-renders affecting calculation logic if needed

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const currentBlock = await client.getBlockNumber();

                // Fetch last 10 blocks for TPS
                const blocks = [];
                const range = 10n;
                const start = currentBlock > range ? currentBlock - range : 0n;

                for (let i = currentBlock; i > start; i--) {
                    blocks.push(await client.getBlock({ blockNumber: i }));
                }

                if (blocks.length > 1) {
                    const totalTxs = blocks.reduce((sum, b) => sum + b.transactions.length, 0);
                    const timeSpan = Number(blocks[0].timestamp - blocks[blocks.length - 1].timestamp);
                    const tps = timeSpan > 0 ? (totalTxs / timeSpan).toFixed(2) : 0;
                    const avgTime = timeSpan > 0 ? (timeSpan / (blocks.length - 1)).toFixed(2) : 0;

                    const newStatPoint = {
                        time: Date.now(),
                        tps: parseFloat(tps),
                        txs: totalTxs
                    };

                    // Update History (Keep last 20 points)
                    let newHistory = [...historyRef.current, newStatPoint];
                    if (newHistory.length > 30) newHistory = newHistory.slice(newHistory.length - 30);
                    historyRef.current = newHistory;

                    setStats({
                        tps: tps,
                        blockHeight: Number(currentBlock),
                        avgBlockTime: avgTime,
                        history: newHistory
                    });
                }
            } catch (err) {
                console.error("Stats Error", err);
            }
        };

        fetchStats();
        const interval = setInterval(fetchStats, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

    return stats;
};

export default useNetworkStats;
