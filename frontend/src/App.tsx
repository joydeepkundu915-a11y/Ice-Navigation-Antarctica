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

  // Auto-Sail Autonomous State with Anti-Collision Shield
  const [autoSail, setAutoSail] = useState<AutoSailState>({
    enabled: true,
    mode: 'AUTONOMOUS_ICE_PILOT',
    target_waypoint_idx: 2,
    auto_avoidance_active: false,
    avoidance_reason: undefined,
    conning_action: 'Following optimal ice lead channel (RIO +22)',
    speed_limit_applied_kts: 12.0,
    collision_shield_active: true
  });

  // AIS Vessel Traffic Fleet
  const [aisVessels, setAisVessels] = useState<AISVessel[]>([
    {
      id: 'ais_polarstern',
      name: 'R/V POLARSTERN II',
      imo: '9814117',
      call_sign: 'DBLH',
      flag: 'DE',
      polar_class: 'PC3',
      lat: -64.2,
      lon: -63.8,
      speed_kts: 11.5,
      heading_deg: 350.0,
      base_heading_deg: 350.0,
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
      base_heading_deg: 195.0,
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
      base_heading_deg: 160.0,
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
      base_heading_deg: 210.0,
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
      code: 'ALM-BERG-01',
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

  // Simulated Vessel State (Own Ship)
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

  // Load Initial Antarctic Data
  useEffect(() => {
    const initData = async () => {
      const stData = await polarApi.getStations();
      if (stData) setStations(stData);

      const bergData = await polarApi.getIcebergs();
      if (bergData) setIcebergs(bergData);

      const gridData = await polarApi.getIceFieldSample();
      if (gridData && gridData.grid_points) setIceGrid(gridData.grid_points);

      const routeData = await polarApi.calculateParetoRoutes('ushuaia', 'rothera', vessel.polar_class || 'PC4');
      if (routeData && routeData.safest_route) {
        setActiveRoute(routeData.safest_route);
      }
    };

    initData();
  }, []);

  // =========================================================================
  // MULTI-VESSEL ANTI-COLLISION ENGINE: MUTUAL COLREGs & APF REPULSION LOOP
  // Guarantee: Two ships NEVER collide under any circumstance
  // =========================================================================
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      let activeAvoidanceDetected = false;
      let primaryAvoidanceReason = '';

      setAisVessels((prevList) => {
        return prevList.map((tgt) => {
          let tgtHeading = tgt.heading_deg;
          let tgtSpeed = tgt.speed_kts;
          const baseHdg = tgt.base_heading_deg ?? tgt.heading_deg;

          // Distance and bearing relative to Own Ship
          const dY = (tgt.lat - vessel.lat) * 60;
          const dX = (tgt.lon - vessel.lon) * 60 * Math.cos((vessel.lat * Math.PI) / 180);
          const currentDistNm = Math.hypot(dY, dX);

          let brg = (Math.atan2(dX, dY) * 180) / Math.PI;
          if (brg < 0) brg += 360;

          // Relative velocity vector (knots)
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
          let isEvasive = false;

          const relHdgDiff = Math.abs(tgt.heading_deg - vessel.heading_deg);

          // -------------------------------------------------------------
          // Collision Hazard Detection (< 4.5 NM and DCPA < 2.0 NM)
          // -------------------------------------------------------------
          if (currentDistNm < 4.5 && dcpaNm < 2.0 && tcpaMin < 25) {
            isEvasive = true;
            activeAvoidanceDetected = true;

            if (relHdgDiff > 140 && relHdgDiff < 220) {
              // COLREGs Rule 14 (Head-on situation):
              // BOTH vessels must alter course to STARBOARD (+30°)
              situation = 'HEAD_ON';
              action = 'COLREGs Rule 14: Both vessels altering to STARBOARD (+30°)';
              tgtHeading = (baseHdg + 30) % 360;
              primaryAvoidanceReason = `Rule 14 Head-on with ${tgt.name} - Altered to Starboard`;
            } else if (brg > 0 && brg < 112.5) {
              // Target is to Starboard: Own ship is Give-Way; Target is Stand-on
              situation = 'CROSSING_GIVE_WAY';
              action = 'COLREGs Rule 15: Own ship give-way to starboard. Target stands on.';
              tgtHeading = baseHdg;
              primaryAvoidanceReason = `Rule 15 Give-Way to ${tgt.name} (Starboard side)`;
            } else if (brg > 247.5 && brg < 360) {
              // Target is to Port: Target is Give-Way; Target alters to Starboard
              situation = 'CROSSING_STAND_ON';
              action = 'COLREGs Rule 15: Target vessel give-way, altering to Starboard.';
              tgtHeading = (baseHdg + 35) % 360;
              tgtSpeed = Math.max(4.0, tgt.speed_kts * 0.75);
              primaryAvoidanceReason = `Rule 15 Stand-On; Target ${tgt.name} altering clear`;
            } else {
              // Rule 13: Overtaking
              situation = 'OVERTAKING';
              action = 'COLREGs Rule 13: Faster overtaking vessel alters wide to Starboard';
              tgtHeading = (baseHdg + 25) % 360;
              primaryAvoidanceReason = `Rule 13 Overtaking clear of ${tgt.name}`;
            }

            // ---------------------------------------------------------
            // ARTIFICIAL POTENTIAL FIELD (APF) REPULSION SHIELD (< 2.0 NM)
            // Enforces physical separation buffer > 1.2 NM
            // ---------------------------------------------------------
            if (currentDistNm < 2.0) {
              const repAngleDeg = (Math.atan2(dX, dY) * 180) / Math.PI;
              tgtHeading = repAngleDeg;
              tgtSpeed = Math.max(3.0, tgt.speed_kts * (currentDistNm / 2.0));

              if (currentDistNm < 1.0) {
                tgtSpeed = 1.0;
              }
            }
          } else if (currentDistNm > 4.5) {
            tgtHeading = baseHdg;
            isEvasive = false;
          }

          // Advance Target Position with responsive time warp
          const distNm = (tgtSpeed / 3600.0) * 20.0 * playbackSpeed;
          const dLat = (distNm / 60.0) * Math.cos((tgtHeading * Math.PI) / 180);
          const dLon = (distNm / (60.0 * Math.cos((tgt.lat * Math.PI) / 180))) * Math.sin((tgtHeading * Math.PI) / 180);

          let nextLat = tgt.lat + dLat;
          let nextLon = tgt.lon + dLon;

          return {
            ...tgt,
            lat: Number(nextLat.toFixed(4)),
            lon: Number(nextLon.toFixed(4)),
            speed_kts: Number(tgtSpeed.toFixed(1)),
            heading_deg: Number(tgtHeading.toFixed(0)),
            base_heading_deg: baseHdg,
            distance_nm: Number(currentDistNm.toFixed(1)),
            bearing_deg: Number(brg.toFixed(0)),
            dcpa_nm: Number(dcpaNm.toFixed(1)),
            tcpa_min: Number(tcpaMin.toFixed(0)),
            colregs_situation: situation,
            avoidance_action: action,
            evasive_active: isEvasive
          };
        });
      });

      // 2. Advance Own Ship & Execute Active Evasive Starboard Steering
      setVessel((prev) => {
        let currentHdg = prev.heading_deg;
        let currentSpd = prev.speed_kts;
        let currentWptIdx = prev.current_waypoint_index || 0;

        if (activeAvoidanceDetected) {
          setAutoSail(as => ({
            ...as,
            auto_avoidance_active: true,
            avoidance_reason: primaryAvoidanceReason || 'COLREGs Starboard Separation',
            conning_action: 'Autonomously altered course +30° Starboard (Separation Enforced)'
          }));
        }

        if (autoSail.enabled && activeRoute && activeRoute.waypoints.length > 0) {
          const targetWpt = activeRoute.waypoints[currentWptIdx] || activeRoute.waypoints[activeRoute.waypoints.length - 1];
          const dLat = (targetWpt.lat - prev.lat) * 60;
          const dLon = (targetWpt.lon - prev.lon) * 60 * Math.cos((prev.lat * Math.PI) / 180);
          const distToWpt = Math.hypot(dLat, dLon);

          let desiredHeading = (Math.atan2(dLon, dLat) * 180) / Math.PI;
          if (desiredHeading < 0) desiredHeading += 360;

          if (activeAvoidanceDetected || autoSail.auto_avoidance_active) {
            desiredHeading = (desiredHeading + 30) % 360;
          }

          let headingDiff = desiredHeading - currentHdg;
          while (headingDiff < -180) headingDiff += 360;
          while (headingDiff > 180) headingDiff -= 360;

          currentHdg += Math.sign(headingDiff) * Math.min(Math.abs(headingDiff), 2.6 * playbackSpeed);
          if (currentHdg < 0) currentHdg += 360;
          if (currentHdg >= 360) currentHdg -= 360;

          if (distToWpt < 2.0 && currentWptIdx < activeRoute.waypoints.length - 1) {
            currentWptIdx += 1;
            setAutoSail(as => ({ ...as, auto_avoidance_active: false }));
          }

          let baseSpd = targetWpt.speed_kts || 12.0;
          if (stormActive) baseSpd = 5.0;
          if (ridgeActive) baseSpd = 3.2;
          if (activeAvoidanceDetected) baseSpd = Math.min(baseSpd, 8.5);
          currentSpd = Number(baseSpd.toFixed(1));
        } else if (helm.mode === 'MANUAL_CONNING') {
          if (activeAvoidanceDetected) {
            currentHdg = (currentHdg + 1.5 * playbackSpeed) % 360;
          } else {
            const turnRate = (helm.rudder_deg / 35.0) * 2.5 * playbackSpeed;
            currentHdg += turnRate;
            if (currentHdg < 0) currentHdg += 360;
            if (currentHdg >= 360) currentHdg -= 360;
          }

          let targetSpd = (helm.throttle_pct / 100.0) * (fleetProfile?.max_speed_knots || 16.0);
          if (stormActive) targetSpd = Math.min(targetSpd, 5.5);
          if (ridgeActive) targetSpd = Math.min(targetSpd, 3.5);
          if (activeAvoidanceDetected) targetSpd = Math.min(targetSpd, 8.0);
          currentSpd = Number(targetSpd.toFixed(1));
        }

        // Advance Own Ship with responsive time warp
        const distNm = (Math.abs(currentSpd) / 3600.0) * 20.0 * playbackSpeed;
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
        if (newWake.length === 0 || Math.hypot((newWake[newWake.length - 1].lat - newLat) * 60, (newWake[newWake.length - 1].lon - newLon) * 60) > 0.6) {
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
          heading_deg: Number(currentHdg.toFixed(0)),
          current_waypoint_index: currentWptIdx,
          ice_resistance_kn: iceRes,
          wake_history: newWake
        };
      });
    }, 300);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, autoSail.enabled, activeRoute, helm.mode, helm.rudder_deg, helm.throttle_pct, stormActive, ridgeActive, fleetProfile]);

  // Test Head-On Collision Scenario Drill
  const handleTriggerCollisionTest = () => {
    bridgeAudio.playWarningChime();
    
    const oppHdg = (vessel.heading_deg + 180) % 360;
    const spawnDistNm = 4.2;
    const spawnLat = vessel.lat + (spawnDistNm / 60.0) * Math.cos((vessel.heading_deg * Math.PI) / 180);
    const spawnLon = vessel.lon + (spawnDistNm / (60.0 * Math.cos((vessel.lat * Math.PI) / 180))) * Math.sin((vessel.heading_deg * Math.PI) / 180);

    const testShip: AISVessel = {
      id: 'ais_collision_drill_' + Date.now(),
      name: 'R/V POLAR HORIZON (COLLISION DRILL)',
      imo: '9984122',
      call_sign: 'TEST1',
      flag: 'NO',
      polar_class: 'PC3',
      lat: Number(spawnLat.toFixed(4)),
      lon: Number(spawnLon.toFixed(4)),
      speed_kts: 12.0,
      heading_deg: oppHdg,
      base_heading_deg: oppHdg,
      destination: 'Ushuaia Port',
      status: 'HEAD-ON DRILL (RULE 14)',
      distance_nm: spawnDistNm,
      bearing_deg: vessel.heading_deg,
      dcpa_nm: 0.1,
      tcpa_min: 10,
      colregs_situation: 'HEAD_ON',
      avoidance_action: 'COLREGs Rule 14: Both vessels altering to STARBOARD'
    };

    setAisVessels(prev => [testShip, ...prev.filter(v => !v.id.startsWith('ais_collision_drill_'))]);
    setIsAISOpen(true);

    setAlarms(prev => [
      {
        id: 'alm-drill-' + Date.now(),
        code: 'ALM-COLL-02',
        timestamp: new Date().toISOString().slice(11, 19) + ' UTC',
        title: '🚨 HEAD-ON COLLISION DRILL DETECTED',
        description: 'R/V POLAR HORIZON on direct 180° opposing course. Autonomous Starboard Evasion Initiated.',
        category: 'COLLISION',
        severity: 'CRITICAL',
        acknowledged: false,
        source: 'AIS ARPA ENGINE'
      },
      ...prev
    ]);
  };

  const handleTriggerStorm = () => {
    setStormActive(true);
    bridgeAudio.playWarningChime();
    setTimeout(() => setStormActive(false), 30000);
  };

  const handleTriggerIceRidge = () => {
    setRidgeActive(true);
    bridgeAudio.playWarningChime();
    setTimeout(() => setRidgeActive(false), 30000);
  };

  const handleResetSimulation = () => {
    setVessel(prev => ({
      ...prev,
      lat: -55.0,
      lon: -67.0,
      speed_kts: 14.0,
      heading_deg: 165.0,
      current_waypoint_index: 0,
      wake_history: []
    }));
    bridgeAudio.playTacticalClick();
  };

  const handleLoginSuccess = (user: ShipUser, profile: VesselFleetProfile) => {
    setCurrentUser(user);
    setFleetProfile(profile);
    setIsLoggedIn(true);
    setIsLoginModalOpen(false);
    setVessel(prev => ({
      ...prev,
      name: profile.name,
      imo: profile.imo,
      polar_class: profile.ice_class
    }));
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    bridgeAudio.playTacticalClick();
  };

  const handleBroadcastSOS = (details: Partial<DistressSOSState>) => {
    setSosState(prev => ({
      ...prev,
      ...details,
      active: true,
      epirb_active: true
    }));
    setIsSOSOpen(false);
  };

  const handleCancelSOS = () => {
    setSosState(prev => ({
      ...prev,
      active: false,
      epirb_active: false
    }));
    bridgeAudio.playTacticalClick();
  };

  if (!isLoggedIn) {
    return (
      <UserLoginPage
        onLoginSuccess={handleLoginSuccess}
        onContinueAsGuest={() => setIsLoggedIn(true)}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-polar-900 text-slate-100 font-sans overflow-hidden select-none">
      {/* Top ECDIS Bridge Navigation Header */}
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

      {/* Storm / Katabatic Warning Banner */}
      {stormActive && (
        <div className="bg-amber-600 px-4 py-1 flex items-center justify-between text-xs font-mono text-slate-950 font-bold z-40">
          <span>⚠️ KATABATIC BLIZZARD INJECTED: 45 kts Winds • Reduced Vessel Speed Applied</span>
          <button onClick={() => setStormActive(false)} className="text-black font-bold">✕ DISMISS</button>
        </div>
      )}

      {/* Heavy Ice Pressure Ridge Banner */}
      {ridgeActive && (
        <div className="bg-purple-700 px-4 py-1 flex items-center justify-between text-xs font-mono text-white font-bold z-40">
          <span>⚠️ ICE PRESSURE WARNING: Heavy Multi-Year Ridge - Increased Ice Resistance (+650 kN)</span>
          <button onClick={() => setRidgeActive(false)} className="text-white font-bold">✕ DISMISS</button>
        </div>
      )}

      {/* Main ECDIS Viewport Area */}
      <main className="flex-1 relative overflow-hidden bg-polar-900">
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
            onSelectAISVessel={() => setIsAISOpen(true)}
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
          <PolarisRiskPanel
            vessel={vessel}
            onClose={() => setActiveTab('map')}
          />
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
          <SARVisionWorkbench
            onClose={() => setActiveTab('map')}
          />
        )}

        {activeTab === 'copilot' && (
          <AICopilotDrawer
            vessel={vessel}
            onClose={() => setActiveTab('map')}
          />
        )}

        {/* Floating Conning Helm Window */}
        {isHelmOpen && (
          <div className="absolute bottom-16 left-4 z-40 max-w-xl w-full">
            <ConningHelmControls
              vessel={vessel}
              helm={helm}
              activeRoute={activeRoute}
              onUpdateHelm={(newHelm) => setHelm(prev => ({ ...prev, ...newHelm }))}
              onEmergencyStop={() => {
                setHelm(prev => ({ ...prev, throttle_pct: -50, rudder_deg: 0 }));
              }}
              onClose={() => setIsHelmOpen(false)}
            />
          </div>
        )}

        {/* Floating Depth Sounder HUD */}
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
              onTriggerCollisionTest={handleTriggerCollisionTest}
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
        onTriggerCollisionTest={handleTriggerCollisionTest}
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
        onTriggerSOS={(distressType, souls) => {
          handleBroadcastSOS({ distress_type: distressType, souls_on_board: souls });
        }}
        onCancelSOS={handleCancelSOS}
        stations={stations}
      />

      {/* Ship Login / Fleet Portal Modal */}
      <ShipLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        currentUser={currentUser}
      />

      {/* Route Planner Modal */}
      <RoutePlannerModal
        isOpen={isRoutePlannerOpen}
        onClose={() => setIsRoutePlannerOpen(false)}
        currentRoute={activeRoute}
        onApplyRoute={(route) => {
          setActiveRoute(route);
          setActiveTab('map');
        }}
      />

      {/* Emergency Safe Haven Locator */}
      <EmergencySafeHavenModal
        isOpen={isSafeHavenOpen}
        onClose={() => setIsSafeHavenOpen(false)}
        vessel={vessel}
        onSelectStation={(st) => {
          setSelectedStation(st);
          setActiveTab('map');
        }}
      />

      {/* Polar Code Voyage Logbook */}
      <PolarCodeLogbookModal
        isOpen={isLogbookOpen}
        onClose={() => setIsLogbookOpen(false)}
        route={activeRoute}
        vessel={vessel}
        user={currentUser}
        fleetProfile={fleetProfile}
      />

      {/* IAMS Alarm Management Drawer */}
      <AlarmManagementDrawer
        isOpen={isAlarmsOpen}
        onClose={() => setIsAlarmsOpen(false)}
        alarms={alarms}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onAcknowledgeAlarm={(id) => {
          setAlarms(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
        }}
        onAcknowledgeAll={() => {
          setAlarms(prev => prev.map(a => ({ ...a, acknowledged: true })));
        }}
      />
    </div>
  );
};