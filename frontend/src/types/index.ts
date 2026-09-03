export type DisplayPalette = 'day' | 'dusk' | 'night' | 'thermal';

export type UserRole = 
  | 'MASTER_CAPTAIN'
  | 'ICE_PILOT'
  | 'CHIEF_MATE'
  | 'POLAR_SCIENTIST'
  | 'FLEET_OPERATIONS';

export interface ShipUser {
  id: string;
  call_sign: string;
  vessel_imo: string;
  vessel_name: string;
  polar_class: string;
  role: UserRole;
  full_name: string;
  license_number: string;
  certificate_valid_until: string;
  login_time: string;
}

export interface VesselFleetProfile {
  imo: string;
  name: string;
  flag: string;
  call_sign: string;
  ice_class: string;
  displacement_tons: number;
  length_m: number;
  beam_m: number;
  draft_m: number;
  engine_power_kw: number;
  bow_ice_angle_deg: number;
  max_speed_knots: number;
  home_port: string;
  description: string;
}

export interface AISVessel {
  id: string;
  name: string;
  imo: string;
  call_sign: string;
  flag: string;
  polar_class: string;
  lat: number;
  lon: number;
  speed_kts: number;
  heading_deg: number;
  destination: string;
  status: string;
  distance_nm?: number;
  bearing_deg?: number;
  dcpa_nm?: number;
  tcpa_min?: number;
  colregs_situation?: 'HEAD_ON' | 'CROSSING_GIVE_WAY' | 'CROSSING_STAND_ON' | 'OVERTAKING' | 'CLEAR';
  avoidance_action?: string;
  evasive_active?: boolean;
  base_heading_deg?: number;
  safety_domain_nm?: number;
}

export interface DistressSOSState {
  active: boolean;
  distress_type: 'BESETMENT_SEVERE' | 'ICEBERG_COLLISION' | 'HULL_BREACH' | 'ENGINE_FAILURE' | 'MEDICAL_EMERGENCY';
  souls_on_board: number;
  epirb_active: boolean;
  broadcast_time: string;
  sar_station_notified: string;
  sar_distance_nm: number;
  estimated_sar_eta_hrs: number;
}

export interface AutoSailState {
  enabled: boolean;
  mode: 'AUTONOMOUS_ICE_PILOT' | 'LEAD_SEEKING' | 'FUEL_OPTIMAL_TRANSIT' | 'MANUAL_OVERRIDE';
  target_waypoint_idx: number;
  auto_avoidance_active: boolean;
  avoidance_reason?: string;
  conning_action: string;
  speed_limit_applied_kts: number;
  collision_shield_active?: boolean;
}

export interface BridgeAlarm {
  id: string;
  code: string;
  title: string;
  description: string;
  category: 'COLLISION' | 'POLARIS_RIO' | 'BESETMENT' | 'METOCEAN' | 'EQUIPMENT' | 'DISTRESS_GMDSS';
  severity: 'INFO' | 'CAUTION' | 'WARNING' | 'CRITICAL';
  timestamp: string;
  acknowledged: boolean;
  source: string;
}

export interface LogbookEntry {
  id: string;
  timestamp: string;
  utc_time: string;
  lat: number;
  lon: number;
  heading_deg: number;
  speed_kts: number;
  engine_load_pct: number;
  rio: number;
  ice_stage: string;
  ice_concentration_pct: number;
  ice_resistance_kn: number;
  officer_name: string;
  category: 'ROUTINE_WATCH' | 'POLARIS_ASSESSMENT' | 'ICE_LEAD_CONNING' | 'AVOIDANCE_MANEUVER' | 'ICEBERG_PROXIMITY' | 'INCIDENT';
  remarks: string;
  status: 'AUTHORIZED' | 'ELEVATED_RISK' | 'CRITICAL';
}

export interface HelmState {
  mode: 'AUTO_WAYPOINT' | 'MANUAL_CONNING';
  target_heading_deg: number;
  target_speed_kts: number;
  rudder_deg: number;
  throttle_pct: number;
  bow_thruster_pct: number;
  propeller_rpm: number;
  hull_strain_mpa: number;
  ice_crush_force_kn: number;
}

export interface Station {
  id: string;
  name: string;
  operator: string;
  lat: number;
  lon: number;
  sector: string;
  type: string;
  capacity_summer: number;
  capacity_winter: number;
  facilities: string[];
  safe_anchorage: boolean;
  anchorage_depth_m: number;
  vhf_channel: string;
  medical_level: string;
  fuel_support: string;
  description: string;
  distance_nm?: number;
  bearing_deg?: number;
  steaming_time_hrs_10kt?: number;
}

export interface IcebergTrajectoryPoint {
  hour: number;
  lat: number;
  lon: number;
  speed_kts: number;
  heading_deg: number;
}

export interface Iceberg {
  id: string;
  name: string;
  origin_shelf: string;
  lat: number;
  lon: number;
  length_km: number;
  width_km: number;
  area_sq_km: number;
  freeboard_m: number;
  draft_m: number;
  estimated_mass_gigatons: number;
  drift_speed_kts: number;
  drift_heading_deg: number;
  threat_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  hazard_corridor: string;
  notes: string;
  current_drift?: {
    drift_speed_kts: number;
    drift_heading_deg: number;
    wind_influence_pct: number;
    current_influence_pct: number;
  };
  trajectory_72h: IcebergTrajectoryPoint[];
  uncertainty_radii_nm: {
    '24h_nm': number;
    '48h_nm': number;
    '72h_nm': number;
  };
}

export interface Waypoint {
  index: number;
  name: string;
  lat: number;
  lon: number;
  leg_distance_nm: number;
  cumulative_distance_nm: number;
  speed_kts: number;
  bearing_deg: number;
  ice_concentration_pct: number;
  ice_thickness_m: number;
  ice_stage: string;
  rio: number;
  polaris_status: 'AUTHORIZED' | 'ELEVATED_RISK' | 'PROHIBITED';
  status_color: string;
  wind_speed_kts: number;
  wind_dir_deg: number;
  wave_height_m: number;
  leg_hours: number;
  leg_fuel_mt: number;
}

export interface RoutePlan {
  origin: { id: string; name: string; lat: number; lon: number };
  destination: { id: string; name: string; lat: number; lon: number };
  polar_class: string;
  vessel_profile: any;
  objective: string;
  total_distance_nm: number;
  estimated_voyage_hours: number;
  estimated_voyage_days: number;
  total_fuel_mgo_mt: number;
  average_rio: number;
  min_rio: number;
  overall_safety_rating: string;
  feasibility_notes: string;
  waypoints: Waypoint[];
}

export interface SARDetection {
  type: string;
  label: string;
  confidence: number;
  bbox: { x: number; y: number; width: number; height: number };
  danger_level: string;
  conning_advice: string;
  width_m?: number;
  ice_concentration_pct?: number;
}

export interface SARScene {
  id: string;
  title: string;
  satellite: string;
  acquisition_date: string;
  sector: string;
  coordinates: { lat_center: number; lon_center: number };
  resolution_m: number;
  image_url: string;
  summary: string;
  detections: SARDetection[];
}

export interface VesselState {
  lat: number;
  lon: number;
  speed_kts: number;
  heading_deg: number;
  polar_class: string;
  name: string;
  imo: string;
  status: string;
  engine_load_pct: number;
  ice_resistance_kn: number;
  fuel_flow_m3_h: number;
  current_waypoint_index?: number;
  wake_history?: Array<{
    lat: number;
    lon: number;
    speed: number;
    resistance: number;
    time: string;
  }>;
}

export interface CPAAlert {
  iceberg_id: string;
  iceberg_name: string;
  distance_nm: number;
  bearing_deg: number;
  cpa_distance_nm: number;
  tcpa_minutes: number;
  threat_level: string;
  evasive_action: string;
}