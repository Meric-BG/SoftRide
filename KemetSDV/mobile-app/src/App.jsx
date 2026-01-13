import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Download, Activity, Zap, Shield, Music, MessageSquare, Menu, MapPin, Battery, Lock, Unlock, Wind } from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider, useToast } from './components/Toast';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Support from './pages/support/Support';

const API_URL = 'http://localhost:3001/api';
// MVP: Hardcoded VIN for demo until full auth context is ready
const DEMO_VIN = 'VIN123';

// --- Shared Components ---

function BottomNav() {
    const location = useLocation();
    if (['/login', '/register'].includes(location.pathname)) return null;

    const links = [
        { to: "/", icon: Home, label: "Vehicle" },
        { to: "/store", icon: ShoppingBag, label: "Store" },
        { to: "/updates", icon: Download, label: "FOTA" },
        { to: "/support", icon: MessageSquare, label: "AI Core" },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-kemet-charcoal/90 backdrop-blur-md border-t border-kemet-border pb-safe z-50">
            <div className="flex justify-around items-center h-20">
                {links.map(({ to, icon: Icon, label }) => {
                    const isActive = location.pathname === to;
                    return (
                        <Link key={to} to={to} className="flex flex-col items-center group w-16">
                            <div className={`p-1 transition-all duration-300 ${isActive ? 'text-kemet-green' : 'text-kemet-subtext'}`}>
                                <Icon size={24} strokeWidth={isActive ? 2 : 1.5} />
                            </div>
                            <span className={`text-[9px] font-bold tracking-widest uppercase mt-1 ${isActive ? 'text-white' : 'text-kemet-subtext'}`}>{label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    );
}

function PageHeader({ title }) {
    return (
        <header className="p-6 pt-12 pb-4 sticky top-0 z-40 bg-kemet-black/80 backdrop-blur-md border-b border-white/5">
            <h1 className="text-xl font-display font-medium text-white tracking-wide uppercase">{title}</h1>
        </header>
    )
}

// --- App Component ---

function AnimatedRoutes() {
    const location = useLocation();
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/store" element={<Store />} />
                <Route path="/updates" element={<Updates />} />
                <Route path="/support" element={<Support />} />
            </Routes>
        </AnimatePresence>
    );
}

function App() {
    return (
        <Router>
            <ToastProvider>
                <div className="font-sans text-white bg-kemet-black min-h-screen antialiased selection:bg-kemet-green/30">
                    <AnimatedRoutes />
                    <BottomNav />
                </div>
            </ToastProvider>
        </Router>
    );
}

// --- Pages ---

const Dashboard = () => {
    const { addToast } = useToast();
    const [controls, setControls] = useState({
        guard: true,
        charge: false,
        trunk: false,
        vent: false
    });

    const toggleControl = async (action, key, currentValue) => {
        const newValue = !currentValue;
        // Optimistic UI Update
        setControls(prev => ({ ...prev, [key]: newValue }));

        try {
            const res = await fetch(`${API_URL}/vehicles/${DEMO_VIN}/controls`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action, value: newValue })
            });
            const data = await res.json();

            if (data.success) {
                addToast(`${key.toUpperCase()} ${newValue ? 'ACTIVATED' : 'DEACTIVATED'}`, 'success');
            } else {
                // Revert if failed
                setControls(prev => ({ ...prev, [key]: currentValue }));
                addToast('Command Failed', 'error');
            }
        } catch (err) {
            setControls(prev => ({ ...prev, [key]: currentValue }));
            addToast('Network Error', 'error');
        }
    };

    return (
        <div className="pb-24">
            <div className="flex justify-between items-center p-6 pt-12">
                <Menu className="text-white" />
                <div className="text-xs font-bold uppercase tracking-widest text-kemet-green">Connected</div>
                <div className="w-8 h-8 rounded-full bg-kemet-charcoal border border-kemet-border flex items-center justify-center">
                    <span className="font-bold text-xs">LB</span>
                </div>
            </div>

            {/* Vehicle Visualization (Hero) */}
            <div className="relative h-[40vh] flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-b from-kemet-green/5 to-transparent pointer-events-none" />
                {/* Placeholder for Car Asset */}
                <div className="relative z-10 text-center">
                    <h2 className="text-4xl font-display tracking-tighter mb-2">GEZO</h2>
                    <p className="text-kemet-subtext text-xs uppercase tracking-[0.2em]">Kemet Electric</p>
                </div>
            </div>

            {/* Status Cards */}
            <div className="px-6 -mt-8 relative z-20 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="k-card p-5 flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <Battery className={controls.charge ? "text-green-400 animate-pulse" : "text-kemet-green"} size={20} />
                            <span className="text-xs font-bold text-kemet-subtext">82%</span>
                        </div>
                        <div>
                            <p className="text-2xl font-display">342</p>
                            <p className="text-[10px] text-kemet-subtext uppercase font-bold tracking-wider">Range (km)</p>
                        </div>
                    </div>
                    <div className="k-card p-5 flex flex-col justify-between h-32">
                        <div className="flex justify-between items-start">
                            <MapPin className="text-white" size={20} />
                            <span className="text-xs font-bold text-kemet-subtext">Parked</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium truncate">Kigali Innovation City</p>
                            <p className="text-[10px] text-kemet-subtext uppercase font-bold tracking-wider mt-1">Location</p>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="k-card p-4">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-kemet-subtext">Quick Controls</h3>
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        <ControlBtn
                            icon={Shield} label="Guard" active={controls.guard}
                            onClick={() => toggleControl('SET_GUARD', 'guard', controls.guard)}
                        />
                        <ControlBtn
                            icon={Zap} label="Charge" active={controls.charge}
                            onClick={() => toggleControl('SET_CHARGE', 'charge', controls.charge)}
                        />
                        <ControlBtn
                            icon={Wind} label="Vent" active={controls.vent}
                            onClick={() => toggleControl('SET_VENT', 'vent', controls.vent)}
                        />
                        <ControlBtn
                            icon={controls.trunk ? Unlock : Lock} label="Trunk" active={controls.trunk}
                            onClick={() => toggleControl('SET_TRUNK', 'trunk', controls.trunk)}
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

function ControlBtn({ icon: Icon, label, active, onClick }) {
    return (
        <button onClick={onClick} className={`flex flex-col items-center gap-2 group active:scale-95 transition-transform`}>
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${active ? 'bg-kemet-green text-white shadow-glow' : 'bg-white/5 text-kemet-subtext group-hover:bg-white/10'}`}>
                <Icon size={20} />
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider ${active ? 'text-white' : 'text-kemet-subtext'}`}>{label}</span>
        </button>
    )
}

const Store = () => {
    const features = [
        { id: 1, name: "Acceleration Boost", price: "999 €", desc: "Unlock 50kW output", icon: Zap },
        { id: 2, name: "Premium Connectivity", price: "5 €/mo", desc: "Satellite Maps & Music", icon: Activity },
    ];

    return (
        <div className="pb-24">
            <PageHeader title="Upgrades" />
            <div className="px-6 space-y-4">
                {features.map((f) => (
                    <div key={f.id} className="k-card p-5 flex items-center justify-between group active:scale-[0.98] transition-transform">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 rounded-full bg-white/5 text-white">
                                <f.icon size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm tracking-wide">{f.name}</h3>
                                <p className="text-kemet-subtext text-xs mt-0.5">{f.desc}</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-kemet-green">{f.price}</span>
                    </div>
                ))}
            </div>
        </div>
    )
}

const Updates = () => {
    const { addToast } = useToast();
    const [status, setStatus] = useState('idle'); // idle, checking, available, updating

    const checkForUpdates = async () => {
        setStatus('checking');
        try {
            const res = await fetch(`${API_URL}/fota/check?vin=${DEMO_VIN}`);
            const data = await res.json();
            if (data.available) {
                setStatus('available');
                addToast('New Firmware Found v2.1.0', 'info');
            } else {
                setStatus('idle');
                addToast('System is up to date', 'success');
            }
        } catch (error) {
            setStatus('idle');
            addToast('Error checking updates', 'error');
        }
    };

    const installUpdate = async () => {
        setStatus('updating');
        addToast('Download Started...', 'info');
        try {
            await fetch(`${API_URL}/fota/install`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ vin: DEMO_VIN })
            });
            // Mock waiting
            setTimeout(() => {
                setStatus('idle');
                addToast('Update Installed Successfully', 'success');
            }, 5001);
        } catch (error) {
            setStatus('available');
            addToast('Install Failed', 'error');
        }
    };

    return (
        <div className="pb-24">
            <PageHeader title="Software" />
            <div className="px-6">
                <div className="k-card p-8 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-kemet-green"></div>
                    <div className={`mb-6 inline-block p-4 rounded-full border border-white/10 bg-white/5 ${status === 'updating' ? 'animate-pulse' : ''}`}>
                        <Download size={32} className={`text-kemet-green ${status === 'checking' ? 'animate-spin' : ''}`} />
                    </div>
                    {status === 'available' ? (
                        <>
                            <h2 className="text-lg font-bold text-white tracking-wide mb-2">Update Available</h2>
                            <p className="text-kemet-subtext text-xs mb-8">KemetOS 2.1.0 (450MB) - Performance</p>
                            <button onClick={installUpdate} className="k-btn-primary text-xs uppercase tracking-widest">
                                Download & Install
                            </button>
                        </>
                    ) : (
                        <>
                            <h2 className="text-lg font-bold text-white tracking-wide mb-2">System v2.0</h2>
                            <p className="text-kemet-subtext text-xs mb-8">
                                {status === 'updating' ? 'Installing update...' : 'Your vehicle is up to date.'}
                            </p>
                            <button onClick={checkForUpdates} disabled={status === 'updating'} className="k-btn-secondary text-xs uppercase tracking-widest disabled:opacity-50">
                                {status === 'checking' ? 'Checking...' : 'Check for Updates'}
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

export default App;
