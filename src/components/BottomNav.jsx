import { useNavigate, useLocation } from 'react-router-dom';
import { Trophy, Activity, Server, BookOpen, LayoutDashboard } from 'lucide-react';
import useMobile from '../hooks/useMobile';

const BottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMobile();

    const NavItem = ({ path, icon: Icon, label, link }) => {
        const isActive = location.pathname === path;

        const handleClick = () => {
            if (link) {
                window.open(link, '_blank');
            } else {
                navigate(path);
            }
        };

        return (
            <button
                onClick={handleClick}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: isMobile ? '4px' : '6px',
                    background: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                    border: 'none',
                    borderRadius: '12px',
                    color: isActive ? 'white' : '#71717a',
                    cursor: 'pointer',
                    padding: isMobile ? '0.5rem 0.25rem' : '0.5rem 0.75rem',
                    minWidth: isMobile ? '50px' : '70px',
                    flex: isMobile ? 1 : 'none', // Expand on mobile
                    transition: 'all 0.2s'
                }}
            >
                <Icon size={isMobile ? 20 : 22} color={isActive ? '#4ade80' : 'currentColor'} />
                <span style={{ fontSize: isMobile ? '0.65rem' : '0.7rem', fontWeight: isActive ? 600 : 500 }}>{label}</span>
            </button>
        )
    };

    return (
        <div style={{
            position: 'absolute',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            background: '#0a0a0a',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '24px',
            padding: '4px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            zIndex: 50,
            pointerEvents: 'auto',
            width: isMobile ? '90%' : 'auto', // Responsive width
            maxWidth: isMobile ? '360px' : 'auto',
            justifyContent: isMobile ? 'space-between' : 'center'
        }}>
            <NavItem path="/" icon={LayoutDashboard} label="Home" />
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />
            <NavItem path="/rankings" icon={Trophy} label="Rankings" />
            <NavItem path="/rewards" icon={Activity} label="Rewards" />
            <NavItem path="/node" icon={Server} label="My Node" />
            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 2px' }} />
            <NavItem id="docs" icon={BookOpen} label="Docs" link="http://localhost:3000/docs/run-node" />
        </div>
    );
};

export default BottomNav;
