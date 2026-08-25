import React, { useState, useEffect } from 'react';
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
import { Station, Iceberg, RoutePlan, VesselState, CPAAlert } from './types';
import { polarApi } from './services/api';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('map');
  const [stations, setStations] = useState<Station[]>([]);
  const [icebergs, setIcebergs] = useState<Iceberg[]>([]);
  const [iceGrid, setIceGrid] = useState<any[]>([]);
  const [activeRoute, setActiveRoute] = useState<RoutePlan | null>(null);
  const [selectedIceberg, setSelectedIceberg] = useState<Iceberg | null>(null);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // Modals
  const [isSafeHavenOpen, setIsSafeHavenOpen] = useState<boolean>(false);
  const [isRoutePlannerOpen, setIsRoutePlannerOpen] = useState<boolean>(false);

  // Simulated Vessel State
  const [vessel, setVessel] = useState<VesselState>({
    lat: -63.5,
    lon: -64.5,
    speed_kts: 12.0,
    heading_deg: 175.0,
    polar_class: 'PC4',
    name: 'R/V POLARIS NAVIGATOR',
    status: 'TRANSITING DRAKE PASSAGE SOUTHBOUND',
    engine_load_pct: 65,
    ice_resistance_kn: 340,
    fuel_flow_m3_h: 1.2
  });

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [cpaAlert, setCpaAlert] = useState<CPAAlert | null>(null);
  const [stormActive, setStormActive] = useState<boolean>(false);

  // Initial Data Fetching
  useEffect(() => {
    const initData = async () => {
      // 1. Fetch Stations
      const stData = await polarApi.getStations();
      if (stData && stData.length > 0) {
        setStations(stData);
      }

      // 2. Fetch Icebergs
      const bergData = await polarApi.getIcebergs();
      if (bergData && bergData.length > 0) {
        setIcebergs(bergData);
        setSelectedIceberg(bergData[0]);
      }

      // 3. Fetch Ice Grid
      const gridData = await polarApi.getIceFieldSample();
      if (gridData?.grid_points?.length > 0) {
        setIceGrid(gridData.grid_points);
      }

      // 4. Compute Initial Route (Ushuaia -> Rothera)
      const routeData = await polarApi.calculateParetoRoutes('ushuaia', 'rothera', 'PC4');
      if (routeData?.safest_route) {
        setActiveRoute(routeData.safest_route);
      }
    };

    initData();
  }, []);

  // Vessel Voyage Simulation Loop
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setVessel((prev) => {
        // Step vessel southwards towards Rothera
        const distNm = (prev.speed_kts / 3600.0) * 1.5 * playbackSpeed;
        const dLat = -(distNm / 60.0) * Math.cos((prev.heading_deg * Math.PI) / 180);
        const dLon = (distNm / (60.0 * Math.cos((prev.lat * Math.PI) / 180))) * Math.sin((prev.heading_deg * Math.PI) / 180);

        let newLat = prev.lat + dLat;
        let newLon = prev.lon + dLon;

        // Loop if arrived at Rothera
        if (newLat < -67.5) {
          newLat = -55.0;
          newLon = -67.0;
        }

        return {
          ...prev,
          lat: Number(newLat.toFixed(4)),
          lon: Number(newLon.toFixed(4))
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Compute CPA Collision Warning to A-23a
  useEffect(() => {
    if (icebergs.length > 0) {
      const a23a = icebergs.find((b) => b.id === 'A-23a') || icebergs[0];
      const dLat = (a23a.lat - vessel.lat) * 60;
      const dLon = (a23a.lon - vessel.lon) * 60 * Math.cos((vessel.lat * Math.PI) / 180);
      const dist = Math.hypot(dLat, dLon);

      setCpaAlert({
        iceberg_id: a23a.id,
        iceberg_name: a23a.name,
        current_distance_nm: Number(dist.toFixed(1)),
        bearing_deg: 85.0,
        cpa_nm: Number((dist * 0.88).toFixed(1)),
        tcpa_minutes: Number(((dist / 14.0) * 60).toFixed(0)),
        relative_speed_kts: 13.5,
        collision_risk: dist < 15 ? 'PROXIMITY_WARNING' : 'CLEAR_PASSAGE'
      });
    }
  }, [vessel.lat, vessel.lon, icebergs]);

  const handleTriggerStorm = () => {
    setStormActive(true);
    setVessel(prev => ({ ...prev, speed_kts: 5.5, status: 'CONNING THROUGH KATABATIC GALE (48 kts)' }));
    setTimeout(() => {
      setStormActive(false);
      setVessel(prev => ({ ...prev, speed_kts: 12.0, status: 'NORMAL VOYAGE PROGRESS' }));
    }, 12000);
  };

  const handleResetSimulation = () => {
    setVessel({
      lat: -55.2,
      lon: -67.5,
      speed_kts: 12.0,
      heading_deg: 175.0,
      polar_class: 'PC4',
      name: 'R/V POLARIS NAVIGATOR',
      status: 'DEPARTED USHUAIA FOR ROTHERA',
      engine_load_pct: 65,
      ice_resistance_kn: 340,
      fuel_flow_m3_h: 1.2
    });
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-polar-900 overflow-hidden text-slate-100 font-sans">
      {/* Top Tactical Bridge Header */}
      <BridgeHeader
        vessel={vessel}
        cpaAlert={cpaAlert}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSafeHaven={() => setIsSafeHavenOpen(true)}
        onOpenRoutePlanner={() => setIsRoutePlannerOpen(true)}
      />

      {/* Storm Scenario Banner */}
      {stormActive && (
        <div className="bg-red-950/90 border-b border-red-600 px-4 py-1.5 flex items-center justify-between text-xs font-mono text-red-200 animate-pulse z-40">
          <span>⚠️ SEVERE METOCEAN EVENT: Katabatic Blizzard (Force 10 Gale) - Speed capped to 5.5 kts</span>
          <span className="font-bold">HULL RIO MARGIN MONITORED</span>
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
      </main>

      {/* Bottom Voyage Simulation Toolbar */}
      <SimulationControls
        isPlaying={isPlaying}
        onTogglePlay={() => setIsPlaying(!isPlaying)}
        playbackSpeed={playbackSpeed}
        onSetPlaybackSpeed={setPlaybackSpeed}
        vessel={vessel}
        onTriggerStorm={handleTriggerStorm}
        onResetSimulation={handleResetSimulation}
      />

      {/* Modals */}
      <RoutePlannerModal
        isOpen={isRoutePlannerOpen}
        onClose={() => setIsRoutePlannerOpen(false)}
        onApplyRoute={(r) => {
          setActiveRoute(r);
          setActiveTab('map');
        }}
        currentRoute={activeRoute}
      />

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
