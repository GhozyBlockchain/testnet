import { useRef, useEffect } from 'react';

const PulseGraph = ({ history = [], color = '#4ade80' }) => {
    // History is array of { tps, time }
    // We want to draw a simple line graph.
    // SVG ViewBox: 0 0 100 40

    if (!history || history.length < 2) {
        return <div style={{ height: '40px', width: '100%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }} />;
    }

    const width = 100;
    const height = 40;

    // Normalize Data
    const maxTPS = Math.max(...history.map(d => d.tps), 1); // Min 1 to avoid div/0
    // Actually, let's fix the scale to be visually pleasing even for low TPS.
    // Max scale = dynamic max * 1.2
    const scaleMax = maxTPS * 1.5;

    const points = history.map((d, i) => {
        const x = (i / (history.length - 1)) * width;
        const y = height - ((d.tps / scaleMax) * height);
        return `${x},${y}`;
    }).join(' ');

    const lastPoint = points.split(' ').pop();

    return (
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            {/* Gradient Defs */}
            <defs>
                <linearGradient id="pulseGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.4" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>

            {/* Fill Area */}
            <path
                d={`M0,${height} ${points} L${width},${height} Z`}
                fill="url(#pulseGradient)"
                stroke="none"
            />

            {/* Line */}
            <polyline
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                points={points}
                strokeLinecap="round"
                strokeLinejoin="round"
            />

            {/* Current Dot */}
            <circle
                cx={width}
                cy={history[history.length - 1] ? height - ((history[history.length - 1].tps / scaleMax) * height) : height}
                r="1.5"
                fill={color}
            >
                <animate attributeName="r" values="1.5;3;1.5" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite" />
            </circle>
        </svg>
    );
};

export default PulseGraph;
