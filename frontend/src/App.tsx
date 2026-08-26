import React, { useState, useEffect, useRef } from 'react';
import { UserLoginPage } from './components/UserLoginPage';
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
import { EmergencySOSModal } from './components/EmergencySOSModal';
import { AISCollisionAvoidanceHUD } from './components/AISCollisionAvoidanceHUD';
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
  BridgeAlarm,
  AISVessel,
  DistressSOSState,
  AutoSailState
} from './types';
import { polarApi } from './services/api';
import { bridgeAudio } from './services/audioAlerts';

export const App: React.FC = () => {
  // Login Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
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

  const [activeTab, setActiveTab] = useState<string>('map');
  const [palette, setPalette] = useState<DisplayPalette>('dusk');
  const [stations, setStations] = useState<Station[]>([]);
  const [icebergs, setIcebergs] = useState<Iceberg[]>([]);
  const [iceGrid, setIceGrid] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState<RoutePlan | null>(null);
  const [selectedIceberg, setSelectedIceberg] = useState<Iceberg | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Modals & Drawers
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSafeHavenOpen, setIsSafeHavenOpen] = useState<boolean>(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);
  const [isLogbookOpen, setIsLogbookOpen] = useState<boolean>(false);
  const [isAlarmsOpen, setIsAlarmsOpen] = useState<boolean>(false);
  const [isDepthSounderOpen, setIsDepthSounderOpen] = useState<boolean>(false);
  const [isHelmOpen, setIsHelmOpen] = useState<boolean>(false);
  const [isSOSOpen, setIsSOSOpen] = useState<boolean>(false);
  const [isAISOpen, setIsAISOpen] = useState<boolean>(false);

  // Sound State
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // GMDSS SOS Distress State
  const [sosState, setSosState] = useState<DistressSOSState>({
    active: false,
    distress_type: 'BESETMENT_SEVERE',
    souls_on_board: 54,
    epirb_active: false,
    broadcast_time: '',
    sar_station_notified: 'Rothera Research Station SAR',
    sar_distance_nm: 142.5,
    estimated_sar_eta_hrs: 3.5
  });

  // Auto-Sail Autonomous State
  const [autoSail, setAutoSail] = useState<AutoSailState>({
    enabled: true,
    mode: 'AUTONOMOUS_ICE_PILOT',
    target_waypoint_idx: 2,
    auto_avoidance_active: false,
    avoidance_reason: undefined,
    conning_action: 'Following optimal ice lead channel (RIO +22)',
    speed_limit_applied_kts: 12.0
  });

  // Simulated Other AIS Vessels in Region
  const [aisVessels, setAisVessels] = useState<AISVessel[]>([
    {
      id: 'ais_polarstern',
      name: 'R/V POLARSTERN II',
      imo: '9814117',
      call_sign: 'DBFI',
      flag: 'DE',
      polar_class: 'PC3',
      lat: -64.2,
      lon: -63.8,
      speed_kts: 11.5,
      heading_deg: 350.0,
      destination: 'Ushuaia',
      status: 'Underway in ice',
      distance_nm: 48.0,
      bearing_deg: 345.0,
      dcpa_nm: 4.2,
      tcpa_min: 124,
      colregs_situation: 'CLEAR',
      avoidance_action: 'Maintain course'
    },
    {
      id: 'ais_krasin',
      name: 'FESCO KRASIN',
      imo: '7414999',
      call_sign: 'UDBK',
      flag: 'RU',
      polar_class: 'PC1',
      lat: -63.8,
      lon: -64.1,
      speed_kts: 14.0,
      heading_deg: 195.0,
      destination: 'Palmer Station',
      status: 'Icebreaker Escort',
      distance_nm: 22.5,
      bearing_deg: 190.0,
      dcpa_nm: 5.1,
      tcpa_min: 55,
      colregs_situation: 'CLEAR',
      avoidance_action: 'Maintain course'
    },
    {
      id: 'ais_ushuaia',
      name: 'MV USHUAIA VOYAGER',
      imo: '9318852',
      call_sign: 'HP6420',
      flag: 'PA',
      polar_class: '1A Super',
      lat: -63.2,
      lon: -64.8,
      speed_kts: 9.8,
      heading_deg: 160.0,
      destination: 'Deception Island',
      status: 'Eco-cruising',
      distance_nm: 19.4,
      bearing_deg: 330.0,
      dcpa_nm: 3.8,
      tcpa_min: 68,
      colregs_situation: 'OVERTAKING',
      avoidance_action: 'Keep clear as overtaking vessel'
    },
    {
      id: 'ais_bharati',
      name: 'R/V BHARATI EXPLORER',
      imo: '9845231',
      call_sign: 'AUVB',
      flag: 'IN',
      polar_class: 'PC4',
      lat: -65.5,
      lon: -62.5,
      speed_kts: 12.0,
      heading_deg: 210.0,
      destination: 'Larsemann Hills',
      status: 'Science Survey',
      distance_nm: 135.0,
      bearing_deg: 165.0,
      dcpa_nm: 12.5,
      tcpa_min: 240,
      colregs_situation: 'CLEAR',
      avoidance_action: 'Clear passage'
    }
  ]);

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

  // Global ESC Key Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSOSOpen) setIsSOSOpen(false);
        else if (isAISOpen) setIsAISOpen(false);
        else if (isSafeHavenOpen) setIsSafeHavenOpen(false);
        else if (isRoutePlannerOpen) setIsRoutePlannerOpen(false);
        else if (isLogbookOpen) setIsLogbookOpen(false);
        else if (isAlarmsOpen) setIsAlarmsOpen(false);
        else if (isDepthSounderOpen) setIsDepthSounderOpen(false);
        else if (isHelmOpen) setIsHelmOpen(false);
        else if (isLoginModalOpen) setIsLoginModalOpen(false);
        else if (activeTab !== 'map') {
          setActiveTab('map');
          bridgeAudio.playTacticalClick();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSOSOpen, isAISOpen, isSafeHavenOpen, isRoutePlannerOpen, isLogbookOpen, isAlarmsOpen, isDepthSounderOpen, isHelmOpen, isLoginModalOpen, activeTab]);

  useEffect(() => {
    bridgeAudio.enableSound(soundEnabled);
  }, [soundEnabled]);

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

  // Multi-Vessel AIS Simulation & COLREGs Collision Prevention Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setAisVessels((prevList) => {
        return prevList.map((tgt) => {
          const distNm = (tgt.speed_kts / 3600.0) * 1.5 * playbackSpeed;
          const dLat = (distNm / 60.0) * Math.cos((tgt.heading_deg * Math.PI) / 180);
          const dLon = (distNm / (60.0 * Math.cos((tgt.lat * Math.PI) / 180))) * Math.sin((tgt.heading_deg * Math.PI) / 180);

          let nextLat = tgt.lat + dLat;
          let nextLon = tgt.lon + dLon;

          const dY = (nextLat - vessel.lat) * 60;
          const dX = (nextLon - vessel.lon) * 60 * Math.cos((vessel.lat * Math.PI) / 180);
          const currentDistNm = Math.hypot(dY, dX);

          let brg = (Math.atan2(dX, dY) * 180) / Math.PI;
          if (brg < 0) brg += 360;

          const relVx = tgt.speed_kts * Math.sin((tgt.heading_deg * Math.PI) / 180) - vessel.speed_kts * Math.sin((vessel.heading_deg * Math.PI) / 180);
          const relVy = tgt.speed_kts * Math.cos((tgt.heading_deg * Math.PI) / 180) - vessel.speed_kts * Math.cos((vessel.heading_deg * Math.PI) / 180);
          const relV = Math.hypot(relVx, relVy);

          let tcpaMin = 999;
          let dcpaNm = currentDistNm;
          if (relV > 0.5) {
            const timeToCpaHrs = -(dX * relVx + dY * relVy) / (relV * relV);
            if (timeToCpaHrs > 0) {
              tcpaMin = timeToCpaHrs * 60;
              const cpaX = dX + relVx * timeToCpaHrs;
              const cpaY = dY + relVy * timeToCpaHrs;
              dcpaNm = Math.hypot(cpaX, cpaY);
            }
          }

          let situation: 'HEAD_ON' | 'CROSSING_GIVE_WAY' | 'CROSSING_STAND_ON' | 'OVERTAKING' | 'CLEAR' = 'CLEAR';
          let action = 'Clear passage';

          const relHdgDiff = Math.abs(tgt.heading_deg - vessel.heading_deg);
          if (currentDistNm < 15.0) {
            if (relHdgDiff > 160 && relHdgDiff < 200) {
              situation = 'HEAD_ON';
              action = 'COLREGs Rule 14: Both vessels must alter course to STARBOARD';
            } else if (brg > 0 && brg < 112.5) {
              situation = 'CROSSING_GIVE_WAY';
              action = 'COLREGs Rule 15: Give-way to starboard vessel. Alter course to Starboard.';
            } else if (brg > 247.5 && brg < 360) {
              situation = 'CROSSING_STAND_ON';
              action = 'COLREGs Rule 15: Stand-on vessel. Maintain course and speed.';
            } else {
              situation = 'OVERTAKING';
              action = 'COLREGs Rule 13: Overtaking vessel keeps clear.';
            }
          }

          if (dcpaNm < 1.8 && tcpaMin < 15 && autoSail.enabled) {
            setAutoSail(as => ({
              ...as,
              auto_avoidance_active: true,
              avoidance_reason: `COLREGs Starboard Evasion: Avoiding ${tgt.name} (DCPA ${dcpaNm.toFixed(1)} NM)`,
              conning_action: 'Autonomously altered course +25° Starboard to guarantee safe separation'
            }));
          }

          return {
            ...tgt,
            lat: Number(nextLat.toFixed(4)),
            lon: Number(nextLon.toFixed(4)),
            distance_nm: Number(currentDistNm.toFixed(1)),
            bearing_deg: Number(brg.toFixed(0)),
            dcpa_nm: Number(dcpaNm.toFixed(1)),
            tcpa_min: Number(tcpaMin.toFixed(0)),
            colregs_situation: situation,
            avoidance_action: action
          };
        });
      });

      setVessel((prev) => {
        let currentHdg = prev.heading_deg;
        let currentSpd = prev.speed_kts;
        let currentWptIdx = prev.current_waypoint_index || 0;

        if (autoSail.enabled && activeRoute && activeRoute.waypoints.length > 0) {
          const targetWpt = activeRoute.waypoints[currentWptIdx] || activeRoute.waypoints[activeRoute.waypoints.length - 1];
          const dLat = (targetWpt.lat - prev.lat) * 60;
          const dLon = (targetWpt.lon - prev.lon) * 60 * Math.cos((prev.lat * Math.PI) / 180);
          const distToWpt = Math.hypot(dLat, dLon);

          let desiredHeading = (Math.atan2(dLon, dLat) * 180) / Math.PI;
          if (desiredHeading < 0) desiredHeading += 360;

          if (autoSail.auto_avoidance_active) {
            desiredHeading = (desiredHeading + 20) % 360;
          }

          let headingDiff = desiredHeading - currentHdg;
          while (headingDiff < -180) headingDiff += 360;
          while (headingDiff > 180) headingDiff -= 360;

          currentHdg += Math.sign(headingDiff) * Math.min(Math.abs(headingDiff), 2.2 * playbackSpeed);
          if (currentHdg < 0) currentHdg += 360;
          if (currentHdg >= 360) currentHdg -= 360;

          if (distToWpt < 2.0 && currentWptIdx < activeRoute.waypoints.length - 1) {
            currentWptIdx += 1;
            setAutoSail(as => ({ ...as, auto_avoidance_active: false }));
          }

          let baseSpd = targetWpt.speed_kts || 12.0;
          if (stormActive) baseSpd = 5.0;
          if (ridgeActive) baseSpd = 3.2;
          currentSpd = Number(baseSpd.toFixed(1));
        } else if (helm.mode === 'MANUAL_CONNING') {
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
  }, [isPlaying, playbackSpeed, autoSail.enabled, autoSail.auto_avoidance_active, helm.mode, helm.rudder_deg, helm.throttle_pct, activeRoute, stormActive, ridgeActive, fleetProfile, vessel.speed_kts, vessel.heading_deg]);

  // Handle Login
  const handleLoginSuccess = (user: ShipUser, profile: VesselFleetProfile) => {
    setCurrentUser(user);
    setFleetProfile(profile);
    setVessel(prev => ({
      ...prev,
      name: profile.name,
      polar_class: profile.ice_class,
      imo: profile.imo
    }));
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);

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

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  // Trigger SOS GMDSS Mayday
  const handleTriggerSOS = (distressType: any, souls: number) => {
    setSosState({
      active: true,
      distress_type: distressType,
      souls_on_board: souls,
      epirb_active: true,
      broadcast_time: new Date().toISOString().slice(11, 19) + ' UTC',
      sar_station_notified: 'Rothera Research Station SAR',
      sar_distance_nm: 142.5,
      estimated_sar_eta_hrs: 3.5
    });

    setAlarms(prev => [
      {
        id: 'mayday-' + Date.now(),
        timestamp: new Date().toISOString().slice(11, 16) + ' UTC',
        title: '🚨 GMDSS MAYDAY DISTRESS BROADCAST ACTIVE',
        description: `Nature: ${distressType}. Souls on board: ${souls}. EPIRB 406 MHz transmitting.`,
        category: 'DISTRESS_GMDSS',
        severity: 'CRITICAL',
        acknowledged: false,
        source: 'GMDSS CONSOLE'
      },
      ...prev
    ]);
  };

  const handleCancelSOS = () => {
    setSosState(prev => ({ ...prev, active: false, epirb_active: false }));
  };

  const handleTriggerStorm = () => {
    setStormActive(true);
    setVessel(prev => ({ ...prev, status: 'CONNING THROUGH KATABATIC BLIZZARD (48 kts)' }));
    bridgeAudio.playCriticalAlarm();

    setTimeout(() => {
      setStormActive(false);
      setVessel(prev => ({ ...prev, status: 'NORMAL VOYAGE PROGRESS' }));
    }, 15000);
  };

  const handleTriggerIceRidge = () => {
    setRidgeActive(true);
    setVessel(prev => ({ ...prev, status: 'RAMMING MULTI-YEAR CONSOLIDATED RIDGE' }));
    bridgeAudio.playWarningChime();

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

  // If user is not logged in, render the dedicated Full-Page Login
  if (!isLoggedIn) {
    return (
      <UserLoginPage
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={() => setIsLoggedIn(true)}
      />
    );
  }

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
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onOpenSOS={() => setIsSOSOpen(true)}
        onOpenAIS={() => setIsAISOpen(true)}
        onLogout={handleLogout}
        autoSail={autoSail}
        onToggleAutoSail={() => setAutoSail(as => ({ ...as, enabled: !as.enabled }))}
        aisVessels={aisVessels}
      />

      {/* SOS Mayday Banner if Active */}
      {sosState.active && (
        <div className="bg-red-600 px-4 py-1.5 flex items-center justify-between text-xs font-mono text-white font-bold animate-pulse z-40 shadow-lg">
          <div className="flex items-center space-x-2">
            <span>🚨 MAYDAY DISTRESS BROADCAST TRANSMITTING (406 MHz / VHF CH 16)</span>
            <span className="bg-black/30 px-2 py-0.5 rounded text-[10px]">POB: {sosState.souls_on_board}</span>
          </div>
          <button
            onClick={() => setIsSOSOpen(true)}
            className="underline hover:text-red-100"
          >
            VIEW GMDSS STATUS & SAR ETA
          </button>
        </div>
      )}

      {/* Storm Scenario Banner */}
      {stormActive && (
        <div className="bg-red-950/90 border-b border-red-600 px-4 py-1 flex items-center justify-between text-xs font-mono text-red-200 animate-pulse z-40">
          <span>⚠️ SEVERE METOCEAN EVENT: Katabatic Blizzard (Force 10 Gale) - Speed capped to 5.5 kts</span>
          <span className="font-bold">HULL RIO MARGIN MONITORED</span>
        </div>
      )}

      {/* Ridge Scenario Banner */}
      {ridgeActive && (
        <div className="bg-purple-950/90 border-b border-purple-600 px-4 py-1 flex items-center justify-between text-xs font-mono text-purple-200 animate-pulse z-40">
          <span>⚡ ICE PRESSURE WARNING: Heavy Multi-Year Ridge - Increased Ice Resistance (+650 kN)</span>
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
            aisVessels={aisVessels}
            sosState={sosState}
            onSelectIceberg={(berg) => {
              setSelectedIceberg(berg);
              setActiveTab('icebergs');
            }}
            onSelectStation={(st) => {
              setSelectedStation(st);
              setIsSafeHavenOpen(true);
            }}
            onSelectAISVessel={(tgt) => {
              setIsAISOpen(true);
            }}
          />
        )}

        {activeTab === 'radar' && (
          <TacticalRadarHUD
            vessel={vessel}
            icebergs={icebergs}
            aisVessels={aisVessels}
            stations={stations}
            onSelectIceberg={(berg) => {
              setSelectedIceberg(berg);
              setActiveTab('icebergs');
            }}
            onClose={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'polaris' && (
          <PolarisRiskPanel onClose={() => setActiveTab('map')} />
        )}

        {activeTab === 'icebergs' && (
          <IcebergTrajectoryViewer
            icebergs={icebergs}
            selectedIceberg={selectedIceberg}
            onSelectIceberg={setSelectedIceberg}
            onClose={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'sar' && (
          <SARVisionWorkbench onClose={() => setActiveTab('map')} />
        )}

        {activeTab === 'copilot' && (
          <AICopilotDrawer
            vessel={vessel}
            onClose={() => setActiveTab('map')}
          />
        )}

        {/* Floating Conning Controls Drawer */}
        {isHelmOpen && (
          <div className="absolute bottom-3 left-3 z-40 max-w-xl w-full">
            <ConningHelmControls
              vessel={vessel}
              helm={helm}
              activeRoute={activeRoute}
              onUpdateHelm={(nh) => setHelm(prev => ({ ...prev, ...nh }))}
              onEmergencyStop={() => {
                setHelm(prev => ({ ...prev, throttle_pct: -50, rudder_deg: 0 }));
                setVessel(prev => ({ ...prev, speed_kts: 0, status: 'CRASH STOP INITIATED' }));
              }}
              onClose={() => setIsHelmOpen(false)}
            />
          </div>
        )}

        {/* Floating Depth Sounder Drawer */}
        {isDepthSounderOpen && (
          <div className="absolute top-3 left-3 z-40 max-w-md w-full">
            <DepthSounderHUD
              vessel={vessel}
              onClose={() => setIsDepthSounderOpen(false)}
            />
          </div>
        )}

        {/* Floating AIS Anti-Collision Matrix */}
        {isAISOpen && (
          <div className="absolute top-3 right-3 z-40 max-w-2xl w-full">
            <AISCollisionAvoidanceHUD
              vessel={vessel}
              aisVessels={aisVessels}
              onClose={() => setIsAISOpen(false)}
              onExecuteAvoidance={(action, newHdg) => {
                setVessel(prev => ({ ...prev, heading_deg: newHdg }));
              }}
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
        autoSail={autoSail}
        onToggleAutoSail={() => setAutoSail(as => ({ ...as, enabled: !as.enabled }))}
      />

      {/* GMDSS SOS Distress Modal */}
      <EmergencySOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
        vessel={vessel}
        user={currentUser}
        sosState={sosState}
        onTriggerSOS={handleTriggerSOS}
        onCancelSOS={handleCancelSOS}
      />

      {/* Ship Login / Fleet Portal Modal */}
      <ShipLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
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