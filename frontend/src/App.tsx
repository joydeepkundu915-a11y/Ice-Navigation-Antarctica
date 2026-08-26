import React, { useState, useEffect, useRef } from 'react';
import { BridgeHeader } from './components/BridgeHeader';
import { AntarcticMap } from './components/AntarcticMap';
import { TacticalRadarHUD } from './components/TacticalRadarHUD';
import { PolarisRiskPanel } from './components/PolarisRiskPanel';
import { RoutePlannerModal } from './components/RoutePlannerModal';
import { IcebergTrajectoryViewer } from './components/IcebergTrajectoryViewer';
import { SARVisionWorkbench } from './components/SARVisionWorkbench';
import { AICopilotDrawer } from './components/AICopilotDrawer';
import { EmergencySafeHavenModal } from './components/EmergencySafeHavenModal';
import { SimulationControls } from './components/SimulationControls';
import { ShipLoginModal, FLEET_DATABASE } from './components/ShipLoginModal';
import { ConningHelmControls } from './components/ConningHelmControls';
import { AlarmManagementDrawer } from './components/AlarmManagementDrawer';
import { PolarCodeLogbookModal } from './components/PolarCodeLogbookModal';
import { DepthSounderHUD } from './components/DepthSounderHUD';
import { 
  Station, 
  Iceberg, 
  RoutePlan, 
  VesselState, 
  CPAAlert, 
  ShipUser, 
  VesselFleetProfile, 
  DisplayPalette, 
  HelmState, 
  BridgeAlarm 
} from './types';
import { polarApi } from './services/api';
import { bridgeAudio } from './services/audioAlerts';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [palette, setPalette] = useState<DisplayPalette>('dusk');
  const [stations, setStations] = useState<Station[]>([]);
  const [icebergs, setIcebergs] = useState<Iceberg[]>([]);
  const [iceGrid, setIceGrid] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState<RoutePlan | null>(null);
  const [selectedIceberg, setSelectedIceberg] = useState<Iceberg | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Authentication & Fleet State
  const [currentUser, setCurrentUser] = useState<ShipUser | null>({
    id: 'usr_polar_master_1',
    call_sign: 'ZDLS1',
    vessel_imo: '9798686',
    vessel_name: 'R/V SIR DAVID ATTENBOROUGH',
    polar_class: 'PC4',
    role: 'MASTER_CAPTAIN',
    full_name: 'Capt. Will Davies',
    license_number: 'STCW-POLAR-9812',
    certificate_valid_until: '2028-12-31',
    login_time: new Date().toISOString()
  });

  const [fleetProfile, setFleetProfile] = useState<VesselFleetProfile>(FLEET_DATABASE[1]);
  const [isLoginOpen, setIsLoginOpen] = useState<boolean>(false);

  // Modals & Drawers
  const [isSafeHavenOpen, setIsSafeHavenOpen] = useState<boolean>(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [isLogbookOpen, setIsLogbookOpen] = useState<boolean>(false);
  const [isAlarmsOpen, setIsAlarmsOpen] = useState<boolean>(false);
  const [isDepthSounderOpen, setIsDepthSounderOpen] = useState<boolean>(false);
  const [isHelmOpen, setIsHelmOpen] = useState<boolean>(false);

  // Sound State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Alarms
  const [alarms, setAlarms] = useState<BridgeAlarm[]>([
    {
      id: 'alm-1',
      timestamp: '00:14 UTC',
      title: 'ICEBERG DRIFT PROXIMITY',
      description: 'Tabular Mega-Iceberg A-23a drifting ENE at 0.95 kts. Distance 48.2 NM.',
      category: 'COLLISION',
      severity: 'CAUTION',
      acknowledged: true,
      source: 'ARPA RADAR'
    }
  ]);

  // Helm State
  const [helm, setHelm] = useState<HelmState>({
    mode: 'AUTO_WAYPOINT',
    target_heading_deg: 175.0,
    target_speed_kts: 12.0,
    rudder_deg: 0,
    throttle_pct: 65,
    bow_thruster_pct: 0,
    propeller_rpm: 124,
    hull_strain_mpa: 84.5,
    ice_crush_force_kn: 340
  });

  // Simulated Vessel State
  const [vessel, setVessel] = useState<VesselState>({
    lat: -63.5,
    lon: -64.5,
    speed_kts: 12.0,
    heading_deg: 175.0,
    polar_class: 'PC4',
    name: 'R/V SIR DAVID ATTENBOROUGH',
    imo: '9798686',
    status: 'TRANSITING DRAKE PASSAGE SOUTHBOUND',
    engine_load_pct: 65,
    ice_resistance_kn: 340,
    fuel_flow_m3_h: 1.2,
    current_waypoint_index: 2,
    wake_history: [
      { lat: -56.5, lon: -67.2, speed: 13.5, resistance: 50, time: '20:00' },
      { lat: -58.5, lon: -66.8, speed: 13.0, resistance: 80, time: '21:30' },
      { lat: -61.0, lon: -65.5, speed: 12.5, resistance: 180, time: '23:00' },
      { lat: -63.5, lon: -64.5, speed: 12.0, resistance: 340, time: '00:15' }
    ]
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [cpaAlert, setCpaAlert] = useState<CPAAlert | null>(null);
  const [stormActive, setStormActive] = useState<boolean>(false);
  const [ridgeActive, setRidgeActive] = useState<boolean>(false);

  // Initialize Sound
  useEffect(() => {
    bridgeAudio.enableSound(soundEnabled);
  }, [soundEnabled]);

  // Initial Data Fetching
  useEffect(() => {
    const initData = async () => {
      const stData = await polarApi.getStations();
      if (stData && stData.length > 0) {
        setStations(stData);
      }

      const bergData = await polarApi.getIcebergs();
      if (bergData && bergData.length > 0) {
        setIcebergs(bergData);
        setSelectedIceberg(bergData[0]);
      }

      const gridData = await polarApi.getIceFieldSample();
      if (gridData?.grid_points?.length > 0) {
        setIceGrid(gridData.grid_points);
      }

      const routeData = await polarApi.calculateParetoRoutes('ushuaia', 'rothera', vessel.polar_class || 'PC4');
      if (routeData?.safest_route) {
        setActiveRoute(routeData.safest_route);
      }
    };

    initData();
  }, []);

  // Vessel Hydrodynamic Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setVessel((prev) => {
        let currentHdg = prev.heading_deg;
        let currentSpd = prev.speed_kts;
        let currentWptIdx = prev.current_waypoint_index || 0;

        // Mode 1: Auto Waypoint Tracking
        if (helm.mode === 'AUTO_WAYPOINT' && activeRoute && activeRoute.waypoints.length > 0) {
          const targetWpt = activeRoute.waypoints[currentWptIdx] || activeRoute.waypoints[activeRoute.waypoints.length - 1];
          const dLat = (targetWpt.lat - prev.lat) * 60;
          const dLon = (targetWpt.lon - prev.lon) * 60 * Math.cos((prev.lat * Math.PI) / 180);
          const distToWpt = Math.hypot(dLat, dLon);

          let desiredHeading = (Math.atan2(dLon, dLat) * 180) / Math.PI;
          if (desiredHeading < 0) desiredHeading += 360;

          let headingDiff = desiredHeading - currentHdg;
          while (headingDiff < -180) headingDiff += 360;
          while (headingDiff > 180) headingDiff -= 360;

          currentHdg += Math.sign(headingDiff) * Math.min(Math.abs(headingDiff), 1.8 * playbackSpeed);
          if (currentHdg < 0) currentHdg += 360;
          if (currentHdg >= 360) currentHdg -= 360;

          if (distToWpt < 2.0 && currentWptIdx < activeRoute.waypoints.length - 1) {
            currentWptIdx += 1;
          }

          let baseSpd = targetWpt.speed_kts || 12.0;
          if (stormActive) baseSpd = 5.0;
          if (ridgeActive) baseSpd = 3.2;
          currentSpd = Number(baseSpd.toFixed(1));
        } 
        // Mode 2: Manual Helm Conning
        else {
          const turnRate = (helm.rudder_deg / 35.0) * 2.5 * playbackSpeed;
          currentHdg += turnRate;
          if (currentHdg < 0) currentHdg += 360;
          if (currentHdg >= 360) currentHdg -= 360;

          let targetSpd = (helm.throttle_pct / 100.0) * (fleetProfile?.max_speed_knots || 16.0);
          if (stormActive) targetSpd = Math.min(targetSpd, 5.5);
          if (ridgeActive) targetSpd = Math.min(targetSpd, 3.5);
          currentSpd = Number(targetSpd.toFixed(1));
        }

        const distNm = (Math.abs(currentSpd) / 3600.0) * 1.5 * playbackSpeed;
        const dLatDeg = (distNm / 60.0) * Math.cos((currentHdg * Math.PI) / 180);
        const dLonDeg = (distNm / (60.0 * Math.cos((prev.lat * Math.PI) / 180))) * Math.sin((currentHdg * Math.PI) / 180);

        let newLat = prev.lat + dLatDeg;
        let newLon = prev.lon + dLonDeg;

        if (newLat < -70.0) {
          newLat = -55.0;
          newLon = -67.0;
          currentWptIdx = 0;
        }

        let iceRes = 120;
        if (newLat < -62) iceRes = 350 + Math.abs(newLat + 62) * 90;
        if (stormActive) iceRes += 280;
        if (ridgeActive) iceRes += 650;

        const newWake = [...(prev.wake_history || [])];
        if (newWake.length === 0 || Math.hypot((newWake[newWake.length - 1].lat - newLat) * 60, (newWake[newWake.length - 1].lon - newLon) * 60) > 2.0) {
          newWake.push({
            lat: Number(newLat.toFixed(4)),
            lon: Number(newLon.toFixed(4)),
            speed: currentSpd,
            resistance: iceRes,
            time: new Date().toISOString().slice(11, 16)
          });
          if (newWake.length > 50) newWake.shift();
        }

        return {
          ...prev,
          lat: Number(newLat.toFixed(4)),
          lon: Number(newLon.toFixed(4)),
          speed_kts: currentSpd,
          heading_deg: Number(currentHdg.toFixed(1)),
          ice_resistance_kn: Number(iceRes.toFixed(0)),
          current_waypoint_index: currentWptIdx,
          wake_history: newWake
        };
      });

      setHelm(h => ({
        ...h,
        propeller_rpm: Math.abs(vessel.speed_kts) * 10.5,
        hull_strain_mpa: Math.min(180, 50 + (vessel.ice_resistance_kn / 10.0))
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, helm.mode, helm.rudder_deg, helm.throttle_pct, activeRoute, stormActive, ridgeActive, fleetProfile]);

  // Compute CPA Collision Warning to A-23a & Trigger Alarms
  useEffect(() => {
    if (icebergs.length > 0) {
      const a23a = icebergs.find((b) => b.id === 'A-23a') || icebergs[0];
      const dLat = (a23a.lat - vessel.lat) * 60;
      const dLon = (a23a.lon - vessel.lon) * 60 * Math.cos((vessel.lat * Math.PI) / 180);
      const dist = Math.hypot(dLat, dLon);

      const isCritical = dist < 12.0;

      setCpaAlert({
        iceberg_id: a23a.id,
        iceberg_name: a23a.name,
        current_distance_nm: Number(dist.toFixed(1)),
        bearing_deg: 85.0,
        cpa_nm: Number((dist * 0.88).toFixed(1)),
        tcpa_minutes: Number(((dist / Math.max(5, vessel.speed_kts)) * 60).toFixed(0)),
        relative_speed_kts: 13.5,
        collision_risk: isCritical ? 'CRITICAL_COLLISION_ALERT' : dist < 25 ? 'PROXIMITY_WARNING' : 'CLEAR_PASSAGE'
      });

      if (isCritical) {
        setAlarms(prev => {
          if (!prev.some(a => a.id === 'cpa-crit-a23a')) {
            bridgeAudio.playCriticalAlarm();
            return [
              {
                id: 'cpa-crit-a23a',
                timestamp: new Date().toISOString().slice(11, 16) + ' UTC',
                title: 'CRITICAL ICEBERG COLLISION ALERT (A-23a)',
                description: 'Range: ' + dist.toFixed(1) + ' NM. Immediate course alteration recommended!',
                category: 'COLLISION',
                severity: 'CRITICAL',
                acknowledged: false,
                source: 'ARPA PPI'
              },
              ...prev
            ];
          }
          return prev;
        });
      }
    }
  }, [vessel.lat, vessel.lon, icebergs]);

  const handleLoginSuccess = (user: ShipUser, profile: VesselFleetProfile) => {
    setCurrentUser(user);
    setFleetProfile(profile);
    setVessel(prev => ({
      ...prev,
      name: profile.name,
      polar_class: profile.ice_class,
      imo: profile.imo
    }));
    setIsLoginOpen(false);

    setAlarms(prev => [
      {
        id: 'auth-' + Date.now(),
        timestamp: new Date().toISOString().slice(11, 16) + ' UTC',
        title: 'BRIDGE COMMAND HANDOVER COMPLETE',
        description: 'Conning Officer ' + user.full_name + ' (' + user.role + ') logged in aboard ' + profile.name + '. Polar Class: ' + profile.ice_class + '.',
        category: 'EQUIPMENT',
        severity: 'CAUTION',
        acknowledged: true,
        source: 'BRIDGE AUTH'
      },
      ...prev
    ]);
  };

  const handleTriggerStorm = () => {
    setStormActive(true);
    setVessel(prev => ({ ...prev, status: 'CONNING THROUGH KATABATIC BLIZZARD (48 kts)' }));
    bridgeAudio.playCriticalAlarm();

    setAlarms(prev => [
      {
        id: 'storm-' + Date.now(),
        timestamp: new Date().toISOString().slice(11, 16) + ' UTC',
        title: 'KATABATIC GALE METOCEAN WARNING',
        description: 'Force 10 Antarctic Katabatic wind (48 kts). High spray icing hazard. Speed restricted.',
        category: 'METOCEAN',
        severity: 'WARNING',
        acknowledged: false,
        source: 'MET-STATION'
      },
      ...prev
    ]);

    setTimeout(() => {
      setStormActive(false);
      setVessel(prev => ({ ...prev, status: 'NORMAL VOYAGE PROGRESS' }));
    }, 15000);
  };

  const handleTriggerIceRidge = () => {
    setRidgeActive(true);
    setVessel(prev => ({ ...prev, status: 'RAMMING MULTI-YEAR CONSOLIDATED RIDGE' }));
    bridgeAudio.playWarningChime();

    setAlarms(prev => [
      {
        id: 'ridge-' + Date.now(),
        timestamp: new Date().toISOString().slice(11, 16) + ' UTC',
        title: 'PRESSURE RIDGE ENCOUNTERED',
        description: 'Consolidated multi-year pressure ridge (sail height 3.2m). Increase bow thruster power.',
        category: 'BESETMENT',
        severity: 'WARNING',
        acknowledged: false,
        source: 'SAR VISION'
      },
      ...prev
    ]);

    setTimeout(() => {
      setRidgeActive(false);
      setVessel(prev => ({ ...prev, status: 'NORMAL VOYAGE PROGRESS' }));
    }, 15000);
  };

  const handleResetSimulation = () => {
    setVessel({
      lat: -55.2,
      lon: -67.5,
      speed_kts: 12.0,
      heading_deg: 175.0,
      polar_class: fleetProfile?.ice_class || 'PC4',
      name: fleetProfile?.name || 'R/V SIR DAVID ATTENBOROUGH',
      imo: fleetProfile?.imo || '9798686',
      status: 'DEPARTED USHUAIA FOR ROTHERA',
      engine_load_pct: 65,
      ice_resistance_kn: 120,
      fuel_flow_m3_h: 1.2,
      current_waypoint_index: 0,
      wake_history: []
    });
  };

  const handleAcknowledgeAlarm = (id: string) => {
    setAlarms(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  };

  const handleAcknowledgeAll = () => {
    setAlarms(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const paletteBgClass = 
    palette === 'day' ? 'bg-slate-100 text-slate-900' :
    palette === 'night' ? 'bg-black text-red-300' :
    palette === 'thermal' ? 'bg-stone-950 text-amber-200' :
    'bg-polar-900 text-slate-100';

  return (
    <div className={'w-screen h-screen flex flex-col ' + paletteBgClass + ' overflow-hidden font-sans select-none transition-colors duration-300'}>
      {/* Top Tactical Bridge Header */}
      <BridgeHeader
        vessel={vessel}
        cpaAlert={cpaAlert}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        palette={palette}
        onSetPalette={setPalette}
        alarms={alarms}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenSafeHaven={() => setIsSafeHavenOpen(true)}
        onOpenRoutePlanner={() => setIsRoutePlannerOpen(true)}
        onOpenLogbook={() => setIsLogbookOpen(true)}
        onOpenAlarms={() => setIsAlarmsOpen(true)}
        onOpenDepthSounder={() => setIsDepthSounderOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Storm Scenario Banner */}
      {stormActive && (
        <div className="bg-red-950/90 border-b border-red-600 px-4 py-1.5 flex items-center justify-between text-xs font-mono text-red-200 animate-pulse z-40">
          <span>?? SEVERE METOCEAN EVENT: Katabatic Blizzard (Force 10 Gale) - Speed capped to 5.5 kts</span>
          <span className="font-bold">HULL RIO MARGIN MONITORED</span>
        </div>
      )}

      {/* Ridge Scenario Banner */}
      {ridgeActive && (
        <div className="bg-purple-950/90 border-b border-purple-600 px-4 py-1.5 flex items-center justify-between text-xs font-mono text-purple-200 animate-pulse z-40">
          <span>? ICE PRESSURE WARNING: Heavy Multi-Year Ridge - Increased Ice Resistance (+650 kN)</span>
          <span className="font-bold">RAMMING PROTOCOL ACTIVE</span>
        </div>
      )}

      {/* Main ECDIS View Area */}
      <main className="flex-1 relative overflow-hidden">
        {activeTab === 'map' && (
          <AntarcticMap
            vessel={vessel}
            stations={stations}
            icebergs={icebergs}
            iceGrid={iceGrid}
            activeRoute={activeRoute}
            palette={palette}
            onSelectIceberg={(berg) => {
              setSelectedIceberg(berg);
              setActiveTab('icebergs');
            }}
            onSelectStation={(st) => {
              setSelectedStation(st);
              setIsSafeHavenOpen(true);
            }}
          />
        )}

        {activeTab === 'radar' && (
          <TacticalRadarHUD
            vessel={vessel}
            icebergs={icebergs}
            onSelectIceberg={(berg) => {
              setSelectedIceberg(berg);
              setActiveTab('icebergs');
            }}
          />
        )}

        {activeTab === 'polaris' && <PolarisRiskPanel />}

        {activeTab === 'icebergs' && (
          <IcebergTrajectoryViewer
            icebergs={icebergs}
            selectedIceberg={selectedIceberg}
            onSelectIceberg={setSelectedIceberg}
          />
        )}

        {activeTab === 'sar' && <SARVisionWorkbench />}

        {activeTab === 'copilot' && <AICopilotDrawer vessel={vessel} />}

        {/* Floating Conning Controls Drawer */}
        {isHelmOpen && (
          <div className="absolute bottom-4 left-4 z-40 max-w-2xl w-full">
            <ConningHelmControls
              vessel={vessel}
              helm={helm}
              activeRoute={activeRoute}
              onUpdateHelm={(nh) => setHelm(prev => ({ ...prev, ...nh }))}
              onEmergencyStop={() => {
                setHelm(prev => ({ ...prev, throttle_pct: -50, rudder_deg: 0 }));
                setVessel(prev => ({ ...prev, speed_kts: 0, status: 'CRASH STOP INITIATED' }));
              }}
            />
          </div>
        )}

        {/* Floating Depth Sounder Drawer */}
        {isDepthSounderOpen && (
          <div className="absolute top-4 left-4 z-40 max-w-lg w-full">
            <DepthSounderHUD
              vessel={vessel}
              onClose={() => setIsDepthSounderOpen(false)}
            />
          </div>
        )}
      </main>

      {/* Bottom Voyage Simulation Toolbar */}
      <SimulationControls
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        playbackSpeed={playbackSpeed}
        onSetPlaybackSpeed={setPlaybackSpeed}
        vessel={vessel}
        onTriggerStorm={handleTriggerStorm}
        onTriggerIceRidge={handleTriggerIceRidge}
        onResetSimulation={handleResetSimulation}
        isHelmOpen={isHelmOpen}
        onToggleHelm={() => setIsHelmOpen(!isHelmOpen)}
      />

      {/* Ship Login / Fleet Portal Modal */}
      <ShipLoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      {/* Polar Code Voyage Risk Logbook Modal */}
      <PolarCodeLogbookModal
        isOpen={isLogbookOpen}
        onClose={() => setIsLogbookOpen(false)}
        route={activeRoute}
        vessel={vessel}
        user={currentUser}
        fleetProfile={fleetProfile}
      />

      {/* Alarm Management System (IAMS) Drawer */}
      <AlarmManagementDrawer
        isOpen={isAlarmsOpen}
        onClose={() => setIsAlarmsOpen(false)}
        alarms={alarms}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onAcknowledgeAlarm={handleAcknowledgeAlarm}
        onAcknowledgeAll={handleAcknowledgeAll}
      />

      {/* Route Planner Modal */}
      <RoutePlannerModal
        isOpen={isRoutePlannerOpen}
        onClose={() => setIsRoutePlannerOpen(false)}
        onApplyRoute={(r) => {
          setActiveRoute(r);
          setActiveTab('map');
        }}
        currentRoute={activeRoute}
      />

      {/* Safe Haven Locator Modal */}
      <EmergencySafeHavenModal
        isOpen={isSafeHavenOpen}
        onClose={() => setIsSafeHavenOpen(false)}
        vessel={vessel}
        onSelectStation={(st) => {
          setSelectedStation(st);
          setActiveTab('map');
        }}
      />
    </div>
  );
};
