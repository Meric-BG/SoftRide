"use client";

import React, { Suspense, useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, Sky, Stars, Text, Html, Box, Sphere, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { adminApi } from '../../lib/api';
import { Navigation, Battery, Zap } from 'lucide-react';

// --- Helper Components ---
const ScannerItem = ({ label, value, color = 'white' }: any) => (
    <div>
        <div style={{ fontSize: '9px', color: '#10B981', fontWeight: 800, marginBottom: '4px', opacity: 0.7 }}>{label}</div>
        <div style={{ fontSize: '14px', fontWeight: 700, color, letterSpacing: '1px' }}>{value}</div>
    </div>
);

const StatItem = ({ icon, value, color = 'white' }: any) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color, fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', background: 'rgba(0,0,0,0.4)', padding: '6px 12px', borderRadius: '4px' }}>
        {icon} {value}
    </div>
);

const Tree = ({ position }: any) => (
    <group position={position}>
        <mesh position={[0, 1.5, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 3]} />
            <meshStandardMaterial color="#5d4037" />
        </mesh>
        <mesh position={[0, 4, 0]} castShadow>
            <sphereGeometry args={[2, 16, 16]} />
            <meshStandardMaterial color="#2e7d32" />
        </mesh>
    </group>
);

const Pedestrian = ({ position, pathWidth = 40 }: any) => {
    const groupRef = useRef<THREE.Group>(null);
    const [speed] = useState(() => 0.08 + Math.random() * 0.12);
    const [offset] = useState(() => Math.random() * Math.PI * 2);
    const bodyColor = useMemo(() => {
        const pColors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#6366f1", "#ec4899", "#14b8a6", "#f97316"];
        return pColors[Math.floor(Math.random() * pColors.length)];
    }, []);

    useFrame((state) => {
        if (!groupRef.current) return;
        const time = state.clock.getElapsedTime();

        // Walking movement back and forth
        groupRef.current.position.z = position[2] + Math.sin(time * speed + offset) * pathWidth;

        // Face the direction of movement
        const currentMotion = Math.cos(time * speed + offset);
        groupRef.current.rotation.y = currentMotion > 0 ? 0 : Math.PI;

        const legSwing = Math.sin(time * 10);
        const leftLeg = groupRef.current.getObjectByName("leftLeg");
        const rightLeg = groupRef.current.getObjectByName("rightLeg");
        if (leftLeg) leftLeg.rotation.x = legSwing * 1.2;
        if (rightLeg) rightLeg.rotation.x = -legSwing * 1.2;
    });

    return (
        <group ref={groupRef} position={position} scale={[1.8, 1.8, 1.8]}>
            {/* Body */}
            <mesh position={[0, 1.2, 0]} castShadow>
                <boxGeometry args={[0.6, 1.2, 0.4]} />
                <meshStandardMaterial color={bodyColor} />
            </mesh>
            {/* Head */}
            <mesh position={[0, 2.15, 0]} castShadow>
                <boxGeometry args={[0.5, 0.5, 0.5]} />
                <meshStandardMaterial color="#d2b48c" />
            </mesh>
            {/* Legs */}
            <mesh name="leftLeg" position={[-0.15, 0.6, 0]} castShadow>
                <boxGeometry args={[0.22, 1.2, 0.22]} />
                <meshStandardMaterial color="#333" />
            </mesh>
            <mesh name="rightLeg" position={[0.15, 0.6, 0]} castShadow>
                <boxGeometry args={[0.22, 1.2, 0.22]} />
                <meshStandardMaterial color="#333" />
            </mesh>
        </group>
    );
};

const RealisticBuilding = ({ position, args, color }: any) => {
    return (
        <group position={position}>
            <Box args={args} castShadow receiveShadow>
                <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </Box>
            {/* Windows Pattern */}
            <Box args={[args[0] + 0.2, args[1] * 0.8, args[2] * 0.1]} position={[0, 0, args[2] / 2]}>
                <meshStandardMaterial color="#111" emissive="#111" opacity={0.5} transparent />
            </Box>
        </group>
    );
};

// --- Ultra-Stylized & Mega-Large Vehicle ---
const RoundedCar = ({ color }: any) => {
    return (
        <group scale={[4, 4, 4]}>
            {/* Main Body - Sculpted with slight slope at front */}
            {/* Positioned higher to clear wheels */}
            <mesh castShadow position={[0, 0.7, 0]}>
                <boxGeometry args={[2.3, 0.8, 5.0]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.1} />
            </mesh>
            {/* Aerodynamic Cabin */}
            <mesh castShadow position={[0, 1.5, -0.4]}>
                <boxGeometry args={[2.1, 1.0, 3.2]} />
                <meshStandardMaterial color={color} metalness={0.8} roughness={0.1} />
            </mesh>
            {/* Windshield - Sloped and Tinted */}
            <mesh position={[0, 1.7, 1.0]} rotation={[-0.7, 0, 0]}>
                <planeGeometry args={[1.9, 1.8]} />
                <meshStandardMaterial color="#111" metalness={1} transparent opacity={0.9} side={THREE.DoubleSide} />
            </mesh>
            {/* Premium LED Headlights (Glow) */}
            <mesh position={[0.9, 0.7, 2.5]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
            </mesh>
            <mesh position={[-0.9, 0.7, 2.5]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={2} />
            </mesh>
            {/* Sharp LED Taillights (Glow) */}
            <mesh position={[1.0, 0.8, -2.5]}>
                <boxGeometry args={[0.6, 0.2, 0.1]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
            </mesh>
            <mesh position={[-1.0, 0.8, -2.5]}>
                <boxGeometry args={[0.6, 0.2, 0.1]} />
                <meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={3} />
            </mesh>
            {/* Large Alloy Wheels - Radius is 0.65, so position y should be 0.65 to touch ground */}
            {[[-1.2, 0.65, 1.7], [1.2, 0.65, 1.7], [-1.2, 0.65, -1.7], [1.2, 0.65, -1.7]].map((p, i) => (
                <group key={i} position={p as any}>
                    <mesh rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.65, 0.65, 0.5, 24]} />
                        <meshStandardMaterial color="#000" roughness={0.5} />
                    </mesh>
                    <mesh position={[0.1, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.4, 0.4, 0.4, 12]} />
                        <meshStandardMaterial color="#888" metalness={1} roughness={0.2} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

const InteractiveVehicle = ({ vehicle, showUpdateNotify, notifyType, isSelected, onClick, onClose }: any) => {
    const groupRef = useRef<THREE.Group>(null);

    const vehicleColor = useMemo(() => {
        const colors = [
            "#FF3B30", "#FF9500", "#FFCC00", "#4CD964", "#5AC8FA", "#007AFF", "#5856D6", "#FF2D55",
            "#1a1a1a", "#ffffff", "#4a4a4a", "#c0c0c0", "#7f0000", "#000033", "#1e3a8a", "#064e3b",
            "#fbcfe8", "#fb7185", "#c084fc", "#818cf8", "#2dd4bf", "#4ade80", "#a3e635", "#facc15"
        ];
        let hash = 0;
        for (let i = 0; i < vehicle.vin.length; i++) hash = vehicle.vin.charCodeAt(i) + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }, [vehicle.vin]);

    const speed = useMemo(() => 0.6 + Math.random() * 0.4, []); // Even faster speed
    const laneOffset = useMemo(() => (Math.random() > 0.5 ? 12 : -12), []);

    useFrame(() => {
        if (!groupRef.current || isSelected) return;
        groupRef.current.position.z += speed;
        if (groupRef.current.position.z > 500) groupRef.current.position.z = -500;
    });

    useEffect(() => {
        if (groupRef.current) {
            groupRef.current.position.z = (Math.random() - 0.5) * 1000;
            groupRef.current.position.x = laneOffset;
            groupRef.current.position.y = 0; // Ensure group is on ground
        }
    }, [laneOffset]);

    return (
        <group
            ref={groupRef}
            onClick={(e) => {
                e.stopPropagation();
                onClick(vehicle);
            }}
        >
            <RoundedCar color={vehicleColor} />

            {showUpdateNotify && (
                <Html position={[0, 18, 0]} center>
                    <div style={{
                        padding: '10px 20px',
                        background: notifyType === 'FEATURE' ? '#fbbf24' : '#3b82f6',
                        borderRadius: '12px',
                        color: 'white',
                        fontWeight: 900,
                        fontSize: '18px',
                        boxShadow: `0 10px 30px rgba(0,0,0,0.5)`,
                        animation: 'bubbleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        border: '3px solid white'
                    }}>
                        <span style={{ fontSize: '24px' }}>{notifyType === 'FEATURE' ? '★' : '!!!'}</span>
                        <span>{notifyType === 'FEATURE' ? 'KEMET FEATURE!' : 'SYNCING...'}</span>
                        <div style={{
                            position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)',
                            width: '0', height: '0', borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
                            borderTop: `15px solid ${notifyType === 'FEATURE' ? '#fbbf24' : '#3b82f6'}`
                        }} />
                    </div>
                </Html>
            )}

            {isSelected && (
                <Html position={[0, 20, 0]} center>
                    <div style={{
                        width: '380px', background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(25px)',
                        border: '2px solid rgba(16, 185, 129, 0.4)', padding: '30px', color: 'white',
                        fontFamily: 'Orbitron, sans-serif', clipPath: 'polygon(0% 0%, 95% 0%, 100% 5%, 100% 100%, 5% 100%, 0% 95%)'
                    }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); onClose(); }}
                            style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', width: '30px', height: '30px', borderRadius: '4px', cursor: 'pointer' }}
                        >✕</button>
                        <div style={{ fontSize: '24px', fontWeight: 950, marginBottom: '20px' }}>{vehicle.brand_name?.toUpperCase() || 'KEMET'}</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            <ScannerItem label="DATA UNIT" value={vehicle.vin.substring(0, 10)} />
                            <ScannerItem label="CHARGE" value={`${vehicle.battery_level}%`} color={vehicle.battery_level < 20 ? '#EF4444' : '#10B981'} />
                            <ScannerItem label="STATUS" value={vehicle.is_locked ? 'HALTED / LOCKED' : 'REMOTE / OPEN'} />
                            <ScannerItem label="OS" value={vehicle.os_version} />
                        </div>
                    </div>
                </Html>
            )}

            <Text position={[0, 8, 0]} fontSize={1.2} color="white">{vehicle.vin.substring(0, 4)}</Text>
        </group>
    );
};

// --- Sunny Neighborhood Elements ---
const SimpleHouse = ({ position, color = "#fff" }: any) => (
    <group position={position}>
        <Box args={[14, 8, 14]} position={[0, 4, 0]} castShadow receiveShadow>
            <meshStandardMaterial color={color} />
        </Box>
        <Box args={[16, 2, 16]} position={[0, 9, 0]} castShadow>
            <meshStandardMaterial color="#5d4037" />
        </Box>
        <Box args={[4, 5, 0.2]} position={[0, 2.5, 7.1]}><meshStandardMaterial color="#333" /></Box>
    </group>
);

const DynamicCity = () => {
    return (
        <group>
            {/* Vibrant Green Grass */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[1000, 1000]} />
                <meshStandardMaterial color="#4caf50" roughness={1} />
            </mesh>

            {/* Narrower Road Network (Crossroads) */}
            <group position={[0, 0.05, 0]}>
                <Box args={[40, 0.1, 1000]} position={[0, 0, 0]} receiveShadow>
                    <meshStandardMaterial color="#333" />
                </Box>
                <Box args={[1000, 0.1, 40]} position={[0, 0, 0]} receiveShadow>
                    <meshStandardMaterial color="#333" />
                </Box>
                {/* Markings */}
                <Box args={[0.5, 0.12, 1000]} position={[0, 0, 0]}><meshBasicMaterial color="#fff" opacity={0.5} transparent /></Box>
                <Box args={[1000, 0.12, 0.5]} position={[0, 0, 0]}><meshBasicMaterial color="#fff" opacity={0.5} transparent /></Box>
            </group>

            {/* Neighborhood Life */}
            <SimpleHouse position={[50, 0, 50]} color="#fdfcf0" />
            <SimpleHouse position={[-50, 0, 50]} color="#eef2f3" />
            <SimpleHouse position={[50, 0, -50]} color="#fcfaf2" />
            <SimpleHouse position={[-50, 0, -50]} color="#fff" />

            <SimpleHouse position={[120, 0, 40]} color="#ffebee" />
            <SimpleHouse position={[-120, 0, -40]} color="#e3f2fd" />

            {/* Trees Scattered */}
            {[
                [30, 0, 30], [-30, 0, 30], [30, 0, -30], [-30, 0, -30],
                [80, 0, 0], [-80, 0, 0], [0, 0, 80], [0, 0, -80],
                [150, 0, 150], [-150, 0, -150], [150, 0, -150], [-150, 0, 150]
            ].map((pos, i) => (
                <Tree key={i} position={pos as any} />
            ))}

            {/* Large Crowd of Pedestrians */}
            {[
                [-25, 0, 50], [-25, 0, -50], [25, 0, 100], [25, 0, -100],
                [-60, 0, 20], [60, 0, -20], [-100, 0, 80], [100, 0, -80],
                [-25, 0, 150], [25, 0, 150], [-70, 0, 200], [70, 0, 200],
                [-25, 0, -200], [25, 0, -200], [-120, 0, 50], [120, 0, -50],
                [-30, 0, 300], [30, 0, 300], [-30, 0, -300], [30, 0, -300]
            ].map((pos, i) => (
                <Pedestrian key={i} position={pos as any} />
            ))}

            {/* Center Monument with Emissive Light */}
            <group position={[0, 0, 0]}>
                <Box args={[10, 2, 10]} position={[0, 1, 0]} castShadow receiveShadow><meshStandardMaterial color="#555" /></Box>
                <Sphere args={[2, 16, 16]} position={[0, 6, 0]} castShadow>
                    <meshStandardMaterial color="#10B981" emissive="#10B981" emissiveIntensity={5} />
                </Sphere>
            </group>
        </group>
    );
};

const PlayerControls = ({ playerPos }: any) => {
    const { camera } = useThree();
    const moveKeys = useRef({ w: false, s: false, a: false, d: false, up: false, down: false, left: false, right: false });
    const rotation = useRef({ yaw: 0, pitch: -0.5 }); // Initial pitch looking down slightly

    useEffect(() => {
        const handleDown = (e: any) => {
            const key = e.key.toLowerCase();
            if (key === 'w') moveKeys.current.w = true;
            if (key === 's') moveKeys.current.s = true;
            if (key === 'a') moveKeys.current.a = true;
            if (key === 'd') moveKeys.current.d = true;
            if (e.key === 'ArrowUp') moveKeys.current.up = true;
            if (e.key === 'ArrowDown') moveKeys.current.down = true;
            if (e.key === 'ArrowLeft') moveKeys.current.left = true;
            if (e.key === 'ArrowRight') moveKeys.current.right = true;
        };
        const handleUp = (e: any) => {
            const key = e.key.toLowerCase();
            if (key === 'w') moveKeys.current.w = false;
            if (key === 's') moveKeys.current.s = false;
            if (key === 'a') moveKeys.current.a = false;
            if (key === 'd') moveKeys.current.d = false;
            if (e.key === 'ArrowUp') moveKeys.current.up = false;
            if (e.key === 'ArrowDown') moveKeys.current.down = false;
            if (e.key === 'ArrowLeft') moveKeys.current.left = false;
            if (e.key === 'ArrowRight') moveKeys.current.right = false;
        };
        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);
        return () => { window.removeEventListener('keydown', handleDown); window.removeEventListener('keyup', handleUp); };
    }, []);

    useFrame((state, delta) => {
        const moveSpeed = 60 * delta;
        const rotSpeed = 2 * delta;

        // --- Rotation (Arrows) ---
        if (moveKeys.current.left) rotation.current.yaw += rotSpeed;
        if (moveKeys.current.right) rotation.current.yaw -= rotSpeed;
        if (moveKeys.current.up) rotation.current.pitch = Math.min(Math.max(rotation.current.pitch - rotSpeed, -Math.PI / 2.5), 0.2);
        if (moveKeys.current.down) rotation.current.pitch = Math.min(Math.max(rotation.current.pitch + rotSpeed, -Math.PI / 2.5), 0.2);

        // --- Movement (WASD) ---
        // Calculate forward and right vectors based on current yaw
        const forward = new THREE.Vector3(Math.sin(rotation.current.yaw), 0, Math.cos(rotation.current.yaw)).normalize();
        const right = new THREE.Vector3().crossVectors(new THREE.Vector3(0, 1, 0), forward).normalize();

        if (moveKeys.current.w) {
            playerPos.current.x -= forward.x * moveSpeed;
            playerPos.current.z -= forward.z * moveSpeed;
        }
        if (moveKeys.current.s) {
            playerPos.current.x += forward.x * moveSpeed;
            playerPos.current.z += forward.z * moveSpeed;
        }
        if (moveKeys.current.a) {
            playerPos.current.x += right.x * moveSpeed;
            playerPos.current.z += right.z * moveSpeed;
        }
        if (moveKeys.current.d) {
            playerPos.current.x -= right.x * moveSpeed;
            playerPos.current.z -= right.z * moveSpeed;
        }

        // --- Update Camera ---
        const distance = 80; // Follow distance
        const height = 50;   // Follow height

        // Target camera position
        const targetCamX = playerPos.current.x + Math.sin(rotation.current.yaw) * distance;
        const targetCamZ = playerPos.current.z + Math.cos(rotation.current.yaw) * distance;
        const targetCamY = playerPos.current.y + height + Math.sin(rotation.current.pitch) * distance;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamX, 0.1);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamZ, 0.1);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamY, 0.1);

        camera.lookAt(playerPos.current.x, playerPos.current.y + 5, playerPos.current.z);
    });

    return null;
};

export default function Interactive3DMap() {
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
    const [showNotify, setShowNotify] = useState(false);
    const [notifyType, setNotifyType] = useState<string | null>(null);
    const [lastEvent, setLastEvent] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const playerPos = useRef(new THREE.Vector3(0, 0, 0));

    useEffect(() => {
        let mounted = true;
        const fetchFleet = async () => {
            try {
                const data = await adminApi.listVehicles();
                if (mounted) setVehicles(data || []);
            } catch (err) {
                console.error('Map fetch fleet error:', err);
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchFleet();

        const token = localStorage.getItem('admin_token');
        if (token) {
            const baseUrl = adminApi.getBaseUrl();
            const sse = new EventSource(`${baseUrl}/events/stream?token=${token}`);
            const handleUpdate = (msg: string, type: string) => {
                setShowNotify(true);
                setNotifyType(type);
                setLastEvent(msg);
                fetchFleet();
                setTimeout(() => {
                    setShowNotify(false);
                    setNotifyType(null);
                }, 8000);
            };

            sse.addEventListener('TECH_UPDATE', () => handleUpdate('SYSTEM NOTIFICATION RECEIVED', 'TECH'));
            sse.addEventListener('FEATURE_ADDED', () => handleUpdate('NEW CAPABILITY ACTIVATED', 'FEATURE'));
            sse.addEventListener('UPDATE_PUBLISHED', () => handleUpdate('FLEET DATA SYNCHRONIZED', 'UPDATE'));
            return () => sse.close();
        }
    }, []);

    if (loading) return (
        <div style={{ height: '100vh', background: '#000', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
                <Navigation style={{ animation: 'spin 2s linear infinite' }} size={48} />
                <h1 style={{ marginTop: '20px', letterSpacing: '5px', fontFamily: 'Orbitron' }}>INITIALIZING SECTOR...</h1>
            </div>
        </div>
    );

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: '#000' }}>
            <style dangerouslySetInnerHTML={{
                __html: `
                main { padding: 0 !important; margin: 0 !important; max-width: none !important; width: 100vw !important; height: 100vh !important; }
                aside { display: none !important; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
                @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
                @keyframes bubbleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            `}} />

            {/* UI HUD Overlay */}
            <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 1000, pointerEvents: 'none' }}>
                <h1 style={{ fontSize: '42px', fontWeight: 950, color: 'white', fontStyle: 'italic', textShadow: '0 5px 15px rgba(0,0,0,0.8)', fontFamily: 'Orbitron' }}>
                    KEMET <span style={{ color: '#10B981' }}>OVERWORLD</span>
                </h1>
                <div style={{ display: 'flex', gap: '20px', marginTop: '10px' }}>
                    <StatItem icon={<Battery size={16} />} value={`${vehicles.length} UNITS`} />
                    <StatItem icon={<Navigation size={16} />} value="ONLINE" color="#10B981" />
                </div>
            </div>

            {/* Notification Banner */}
            {showNotify && (
                <div style={{
                    position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
                    zIndex: 2000, background: 'rgba(16, 185, 129, 0.95)', color: 'black',
                    padding: '12px 40px', borderRadius: '4px', fontWeight: 900,
                    boxShadow: '0 0 40px rgba(16, 185, 129, 0.6)', display: 'flex', alignItems: 'center', gap: '15px', animation: 'slideDown 0.5s ease-out'
                }}>
                    <Zap size={20} fill="black" />
                    <span>{lastEvent}</span>
                </div>
            )}

            <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ReinhardToneMapping }}>
                <Sky sunPosition={[100, 40, 100]} turbidity={0} rayleigh={0.05} />
                <Stars count={0} />
                <PerspectiveCamera makeDefault position={[120, 100, 120]} fov={45} />
                <PlayerControls playerPos={playerPos} />

                <ambientLight intensity={1.2} />
                <directionalLight
                    position={[100, 150, 100]}
                    intensity={4}
                    color="#fff5e6"
                    castShadow
                    shadow-mapSize={[4096, 4096]}
                />
                <fog attach="fog" args={['#87ceeb', 200, 1200]} />

                <DynamicCity />

                <Suspense fallback={null}>
                    {vehicles.map((v) => (
                        <InteractiveVehicle
                            key={v.vin}
                            vehicle={v}
                            showUpdateNotify={showNotify}
                            notifyType={notifyType}
                            isSelected={selectedVehicle?.vin === v.vin}
                            onClick={setSelectedVehicle}
                            onClose={() => setSelectedVehicle(null)}
                        />
                    ))}
                </Suspense>

                <ContactShadows opacity={0.6} scale={500} blur={2} far={10} />
            </Canvas>
        </div>
    );
}
