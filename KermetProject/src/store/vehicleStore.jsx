import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { ShieldCheck, Navigation, Cpu, Battery, Wifi, Settings } from 'lucide-react';

const VehicleContext = createContext();

export const DOMAINS = [
    {
        id: 'chassis',
        name: 'Chassis',
        icon: Cpu,
        color: 'text-amber-400',
        glow: 'shadow-amber-500/50',
        ecus: [
            { id: 'brake_ctrl', name: 'Brake Controller', supplier: 'Bosch', hw: 'K-09-X1' },
            { id: 'steering_mod', name: 'Steering Module', supplier: 'ZF', hw: 'S-44-A2' },
            { id: 'suspension_ecu', name: 'Active Suspension', supplier: 'Continental', hw: 'EX-88-M' }
        ]
    },
    {
        id: 'powertrain',
        name: 'Powertrain',
        icon: Battery,
        color: 'text-red-400',
        glow: 'shadow-red-500/50',
        ecus: [
            { id: 'bms_main', name: 'Battery Management', supplier: 'LG Energy', hw: 'BMS-99-P' },
            { id: 'inv_front', name: 'Front Inverter', supplier: 'Denso', hw: 'INV-F-12' },
            { id: 'obc_charger', name: 'On-Board Charger', supplier: 'Delta', hw: 'CH-X-01' }
        ]
    },
    {
        id: 'connectivity',
        name: 'Connectivity',
        icon: Wifi,
        color: 'text-purple-400',
        glow: 'shadow-purple-500/50',
        ecus: [
            { id: 'tcu_5g', name: 'Telematics Unit', supplier: 'Qualcomm', hw: 'TCU-5G-Q' },
            { id: 'v2x_mod', name: 'V2X Module', supplier: 'Autotalks', hw: 'V2X-A1' }
        ]
    },
    {
        id: 'adas',
        name: 'ADAS',
        icon: ShieldCheck,
        color: 'text-blue-400',
        glow: 'shadow-blue-500/50',
        ecus: [
            { id: 'cam_front', name: 'Front Camera', supplier: 'Mobileye', hw: 'EYE-Q5' },
            { id: 'radar_long', name: 'Long-Range Radar', supplier: 'Bosch', hw: 'MRR-EVO' },
            { id: 'lidar_main', name: 'Main LiDAR', supplier: 'Luminar', hw: 'IRIS-G2' }
        ]
    },
    {
        id: 'cockpit',
        name: 'Cockpit HMI',
        icon: Navigation,
        color: 'text-emerald-400',
        glow: 'shadow-emerald-500/50',
        ecus: [
            { id: 'infotainment', name: 'Head Unit', supplier: 'Harman', hw: 'HU-IVI-4' },
            { id: 'cluster_digit', name: 'Digital Cluster', supplier: 'Visteon', hw: 'IC-OLED-2' },
            { id: 'hud_proj', name: 'Heads-up Display', supplier: 'Panasonic', hw: 'HUD-AR-1' }
        ]
    },
    {
        id: 'services',
        name: 'Cloud Services',
        icon: Settings,
        color: 'text-cyan-400',
        glow: 'shadow-cyan-500/50',
        ecus: [
            { id: 'fleet_mgmt', name: 'Fleet Agent', supplier: 'QNX', hw: 'RTOS-S1' },
            { id: 'sub_manager', name: 'Subscription Manager', supplier: 'AWS-IoT', hw: 'CLOUD-V1' }
        ]
    },
];

export function VehicleProvider({ children }) {
    const [statuses, setStatuses] = useState(DOMAINS.reduce((acc, d) => ({ ...acc, [d.id]: 'active' }), {}));
    const [firmwares, setFirmwares] = useState(DOMAINS.reduce((acc, d) => ({ ...acc, [d.id]: 'v2.4.1' }), {}));

    // Initialize sub-ECU firmwares
    const [ecuFirmwares, setEcuFirmwares] = useState(() => {
        const initial = {};
        DOMAINS.forEach(d => {
            d.ecus.forEach(ecu => {
                initial[ecu.id] = 'v1.0.2';
            });
        });
        return initial;
    });

    const [vehicleState, setVehicleState] = useState({ battery: 85, gear: 'P', connected: true });

    // NEW: ECU Health (DTCs and Memory)
    const [ecuHealth, setEcuHealth] = useState(() => {
        const initial = {};
        DOMAINS.forEach(d => {
            d.ecus.forEach(ecu => {
                initial[ecu.id] = {
                    dtc: 'OK',
                    memory: Math.floor(Math.random() * 40) + 40, // 40-80% full
                    temp: Math.floor(Math.random() * 20) + 35    // 35-55°C
                };
            });
        });
        return initial;
    });

    const [isCampaignRunning, setIsCampaignRunning] = useState(false);
    const [simulateFailure, setSimulateFailure] = useState(false);
    const [logs, setLogs] = useState([
        { id: 'init', msg: 'Zonal architecture initialized.', time: new Date().toLocaleTimeString(), type: 'info' },
        { id: 'check', msg: 'System health check: 100% operational.', time: new Date().toLocaleTimeString(), type: 'info' }
    ]);

    // Use refs to access latest state in async functions without closures issues
    const stateRef = useRef({ vehicleState, simulateFailure });
    stateRef.current = { vehicleState, simulateFailure };

    const addLog = useCallback((msg, type = 'info') => {
        setLogs(prev => [{ id: Date.now(), msg, time: new Date().toLocaleTimeString(), type }, ...prev.slice(0, 15)]);
    }, []);

    const runUpdateBatch = async (ids) => {
        addLog(`Phase: Updating ${ids.join(' & ').toUpperCase()}...`);
        setStatuses(prev => {
            const next = { ...prev };
            ids.forEach(id => next[id] = 'updating');
            return next;
        });

        for (let i = 1; i <= 3; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            if (!stateRef.current.vehicleState.connected) {
                addLog(`RESILIENCE: Network lost. Pausing ${ids.join('/')} update...`, "error");
                while (!stateRef.current.vehicleState.connected) {
                    await new Promise(r => setTimeout(r, 1000));
                }
                addLog(`RESILIENCE: Connection restored. Resuming transfer...`, "success");
            }
        }

        if (stateRef.current.simulateFailure && ids.includes('adas')) {
            throw new Error("Integrity Check Failed on ADAS Domain");
        }

        setStatuses(prev => {
            const next = { ...prev };
            ids.forEach(id => { next[id] = 'active'; });
            return next;
        });
        setFirmwares(prev => {
            const next = { ...prev };
            ids.forEach(id => next[id] = 'v2.5.0');
            return next;
        });

        // Update internal ECUs as well
        setEcuFirmwares(prev => {
            const next = { ...prev };
            ids.forEach(domId => {
                const domain = DOMAINS.find(d => d.id === domId);
                domain.ecus.forEach(ecu => {
                    next[ecu.id] = 'v1.1.0';
                });
            });
            return next;
        });

        addLog(`Batch Completed: ${ids.join(', ')} and all internal ECUs verified.`);
    };

    const rollbackAll = async () => {
        addLog("ROLLBACK: Reverting all domains & ECUs to stable versions...");
        await new Promise(resolve => setTimeout(resolve, 2000));

        setStatuses(DOMAINS.reduce((acc, d) => ({ ...acc, [d.id]: 'active' }), {}));
        setFirmwares(DOMAINS.reduce((acc, d) => ({ ...acc, [d.id]: 'v2.4.1' }), {}));
        setEcuFirmwares(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(key => next[key] = 'v1.0.2');
            return next;
        });

        addLog("ROLLBACK COMPLETE: Vehicle state restored.", "success");
    };

    const startCampaign = async () => {
        if (vehicleState.battery < 30) {
            addLog("CRITICAL: Battery too low for FOTA (< 30%). Campaign aborted.", "error");
            return;
        }
        if (vehicleState.gear !== 'P') {
            addLog("WARNING: Vehicle must be in PARK. Campaign blocked.", "error");
            return;
        }

        setIsCampaignRunning(true);
        addLog("FOTA Campaign Started: Orchestrating Multi-ECU Update...");

        try {
            await runUpdateBatch(['chassis', 'powertrain']);
            await runUpdateBatch(['connectivity', 'adas']);
            await runUpdateBatch(['cockpit', 'services']);
            addLog("SUCCESS: Full vehicle software suite updated to v2.5.0", "success");
        } catch (err) {
            addLog(`FATAL ERROR: ${err.message}. Initiating Global Rollback...`, "error");
            await rollbackAll();
        } finally {
            setIsCampaignRunning(false);
        }
    };

    const handleUpdate = (id) => {
        if (statuses[id] === 'updating' || isCampaignRunning) return;
        setStatuses(prev => ({ ...prev, [id]: 'updating' }));
        addLog(`Manual OTA request for ${id.toUpperCase()}...`);
        setTimeout(() => {
            setFirmwares(prev => ({ ...prev, [id]: `v2.4.${Math.floor(Math.random() * 10) + 2}` }));
            setStatuses(prev => ({ ...prev, [id]: 'active' }));
            addLog(`Update successful: ${id.toUpperCase()} is now current.`);
        }, 3000);
    };

    const value = {
        statuses,
        firmwares,
        ecuFirmwares,
        ecuHealth,
        vehicleState,
        setVehicleState,
        isCampaignRunning,
        simulateFailure,
        setSimulateFailure,
        logs,
        addLog,
        startCampaign,
        handleUpdate
    };

    return <VehicleContext.Provider value={value}>{children}</VehicleContext.Provider>;
}

export const useVehicle = () => useContext(VehicleContext);
