import { Station, Iceberg, RoutePlan, SARScene } from '../types';

const API_BASE_URL = typeof window !== 'undefined' && window.location.port === '5173'
  ? 'http://localhost:8000'
  : '';

export const polarApi = {
  // Fetch all Antarctic stations
  async getStations(): Promise<Station[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stations`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.stations;
    } catch (e) {
      console.warn('Backend unavailable, using static stations fallback', e);
      return [];
    }
  },

  // Query nearest safe havens
  async getNearestStations(lat: number, lon: number, maxResults: number = 4): Promise<Station[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stations/nearest?lat=${lat}&lon=${lon}&max_results=${maxResults}`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.nearest_stations;
    } catch (e) {
      console.warn('Backend nearest stations query failed', e);
      return [];
    }
  },

  // Fetch all active icebergs & trajectory cones
  async getIcebergs(): Promise<Iceberg[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/icebergs`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.icebergs;
    } catch (e) {
      console.warn('Backend icebergs query failed', e);
      return [];
    }
  },

  // Fetch sea-ice grid points & ice edge contour
  async getIceFieldSample(): Promise<{ grid_points: any[]; ice_edge_contour: number[][] }> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/ice-field/sample?step_deg=2.5`);
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Backend ice field query failed', e);
      return { grid_points: [], ice_edge_contour: [] };
    }
  },

  // Calculate Pareto optimal routes
  async calculateParetoRoutes(originId: string, destId: string, polarClass: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/routes/pareto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin_id: originId,
          destination_id: destId,
          polar_class: polarClass
        })
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Backend routing failed', e);
      return null;
    }
  },

  // Evaluate POLARIS RIO for arbitrary ice regime
  async evaluatePolaris(polarClass: string, iceRegime: any[]): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/polaris/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          polar_class: polarClass,
          ice_regime: iceRegime
        })
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Backend POLARIS evaluation failed', e);
      return null;
    }
  },

  // Get SAR satellite image presets
  async getSARPresets(): Promise<SARScene[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sar/presets`);
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      return data.presets;
    } catch (e) {
      console.warn('Backend SAR presets failed', e);
      return [];
    }
  },

  // Analyze SAR satellite image
  async analyzeSAR(imageId: string): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/sar/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_id: imageId })
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Backend SAR analyze failed', e);
      return null;
    }
  },

  // Chat with Polar Ice Pilot AI Copilot
  async chatCopilot(params: {
    message: string;
    vessel_lat?: number;
    vessel_lon?: number;
    polar_class?: string;
    vessel_speed_kts?: number;
    ice_concentration_pct?: number;
    ice_thickness_m?: number;
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/copilot/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      console.warn('Backend copilot failed', e);
      return {
        category: 'OFFLINE_MODE',
        severity: 'INFO',
        response: 'Backend connection offline. Polar Decision Engine operates on local bridge heuristics.',
        action_items: ['Verify local server connectivity on port 8000']
      };
    }
  },

  // Compute Lindqvist Ice Resistance
  async calculateResistance(params: {
    beam_m: number;
    draft_m: number;
    length_m: number;
    ice_thickness_m: number;
    ice_concentration_pct: number;
    ship_speed_kts: number;
  }): Promise<any> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/physics/resistance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      if (!res.ok) throw new Error('API error');
      return await res.json();
    } catch (e) {
      return null;
    }
  }
};
