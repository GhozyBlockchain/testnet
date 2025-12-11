import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig, RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import GlobeViz from './components/GlobeViz';


const ghozyTestnet = {
  id: 5207,
  name: 'Ghozy Testnet',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://localhost:8545'] },
  },
  blockExplorers: {
    default: { name: 'Ghozyscan', url: 'http://localhost:5174' },
  },
  testnet: true,
};

// Setup Wagmi
const config = getDefaultConfig({
  appName: 'Ghozy Testnet',
  projectId: 'YOUR_PROJECT_ID',
  chains: [ghozyTestnet],
  ssr: true, // If using Next.js, but good for Vite too? No, remove if issues.
});

const queryClient = new QueryClient();

const customTheme = darkTheme({
  accentColor: '#ffffff',
  accentColorForeground: 'black',
  borderRadius: 'medium',
  fontStack: 'system',
  overlayBlur: 'small',
});

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import TestnetLanding from './components/TestnetLanding';
import RegistrationModal from './components/RegistrationModal';
import BottomNav from './components/BottomNav';
import DashboardView from './components/DashboardView';

import useMobile from './hooks/useMobile';

function App() {
  const isMobile = useMobile();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={customTheme}>
          <Router>
            <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#050505', overflow: 'hidden' }}>

              <GlobeViz />

              {/* UI Layer */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 10,
                pointerEvents: 'none' // Default pass-through
              }}>

                {/* Navbar / Header */}
                <div style={{
                  padding: isMobile ? '1rem' : '1.5rem 2rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pointerEvents: 'auto'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <img src="/logo.svg" alt="Ghozy" style={{ height: isMobile ? '32px' : '40px' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.1' }}>
                      <span style={{ fontSize: isMobile ? '1rem' : '1.25rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Ghozy</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#4ade80', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Alpha Testnet</span>
                    </div>
                  </div>
                  <ConnectButton
                    accountStatus={{
                      smallScreen: 'avatar',
                      largeScreen: 'full',
                    }}
                  />
                </div>

                {/* Main Content Area */}
                <div style={{ flex: 1, position: 'relative', width: '100%', minHeight: 0, overflow: 'hidden' }}>
                  <AuthContent />
                </div>

              </div>

            </div>
          </Router>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}


import RankingsView from './components/RankingsView';
import RewardsView from './components/RewardsView';
import MyNodeView from './components/MyNodeView';

// Sub-component for cleaner Auth logic
// Sub-component for cleaner Auth logic
function AuthContent() {
  const { isConnected } = useAccount();

  if (!isConnected) {
    return (
      <div style={{ width: '100%', height: '100%', pointerEvents: 'auto' }}>
        <TestnetLanding />
      </div>
    );
  }

  // Dashboard View for Connected Users
  return (
    <>
      <RegistrationModal />

      <div style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        zIndex: 5,
        pointerEvents: 'none' // Passthrough to globe
      }}>
        {/* Content Container */}
        <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
          <Routes>
            <Route path="/" element={<DashboardView />} />
            <Route path="/rankings" element={<RankingsView />} />
            <Route path="/rewards" element={<RewardsView />} />
            <Route path="/node" element={<MyNodeView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>

      <BottomNav />
    </>
  );
}

export default App;
