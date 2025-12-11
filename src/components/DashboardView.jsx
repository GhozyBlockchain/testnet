import Stats from './Stats';
import NodeSetup from './NodeSetup';
import LeaderboardPanel from './LeaderboardPanel';

import useMobile from '../hooks/useMobile';

const DashboardView = () => {
    const isMobile = useMobile();

    return (
        <div style={{
            width: '100%',
            height: '100%',
            padding: isMobile ? '1rem 1rem 8rem 1rem' : '0 2rem 2rem 2rem',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            pointerEvents: 'none',
            overflowY: isMobile ? 'auto' : 'hidden' // Allow scroll on mobile parent if needed, though usually children scroll
        }}>

            {/* Left Column - Node Setup & Leaderboard */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                pointerEvents: 'auto',
                justifyContent: isMobile ? 'flex-start' : 'flex-end',
                paddingBottom: isMobile ? '2rem' : '8rem', // On mobile, main padding handles bottom gap
                width: isMobile ? '100%' : 'auto',
                flex: isMobile ? 'none' : '0 0 400px' // Fixed width on desktop
            }}>
                <NodeSetup />
                <LeaderboardPanel />
            </div>

            {!isMobile && <div style={{ flex: 1 }} />}

            {/* Right Column - Stats/Rewards */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                pointerEvents: 'auto',
                width: isMobile ? '100%' : '400px', // Consistent width
                marginTop: isMobile ? '2rem' : '0'
            }}>
                <Stats />
            </div>
        </div>
    );
};

export default DashboardView;
