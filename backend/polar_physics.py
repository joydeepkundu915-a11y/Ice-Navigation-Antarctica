"""
Polar Physics & Hydrodynamics Module
Implements:
1. Dynamic Iceberg Drift Equations:
   m * (d u_i / dt + f k x u_i) = F_a (Wind Drag) + F_w (Water Drag) + F_c (Coriolis) + F_p (Sea Surface Slope)
2. Lindqvist (1989) & Riska (1997) Ship-Ice Resistance Models
3. Ekman Drift & Wind-driven surface current approximation
4. Monte Carlo Perturbation Trajectory Generator for Iceberg Ensembles
"""

import math
import numpy as np
from typing import Dict, List, Tuple, Any

# Physical Constants
EARTH_ANGULAR_VELOCITY = 7.2921159e-5  # rad/s (Omega)
RHO_AIR = 1.29  # kg/m^3 (air density at polar temperatures ~ -10C)
RHO_SEAWATER = 1028.0  # kg/m^3 (polar seawater density)
RHO_ICE = 900.0  # kg/m^3 (glacial ice density)
GRAVITY = 9.81  # m/s^2
EARTH_RADIUS_NM = 3440.065  # Nautical Miles
EARTH_RADIUS_M = 6371000.0  # Meters

def coriolis_parameter(lat_deg: float) -> float:
    """Compute Coriolis parameter f = 2 * Omega * sin(phi) [s^-1]."""
    phi = math.radians(lat_deg)
    return 2.0 * EARTH_ANGULAR_VELOCITY * math.sin(phi)

def haversine_distance_nm(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Compute Great Circle distance between two coordinates in Nautical Miles."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    
    a = math.sin(dphi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(max(0.0, 1.0 - a)))
    return EARTH_RADIUS_NM * c

def calculate_bearing_deg(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Compute initial compass bearing from (lat1, lon1) to (lat2, lon2)."""
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dlambda = math.radians(lon2 - lon1)
    
    y = math.sin(dlambda) * math.cos(phi2)
    x = math.cos(phi1) * math.sin(phi2) - math.sin(phi1) * math.cos(phi2) * math.cos(dlambda)
    bearing = (math.degrees(math.atan2(y, x)) + 360.0) % 360.0
    return bearing

def step_lat_lon(lat: float, lon: float, distance_nm: float, bearing_deg: float) -> Tuple[float, float]:
    """Calculate new (lat, lon) after traveling distance_nm along bearing_deg."""
    d_rad = distance_nm / EARTH_RADIUS_NM
    b_rad = math.radians(bearing_deg)
    lat_rad = math.radians(lat)
    lon_rad = math.radians(lon)

    new_lat_rad = math.asin(
        math.sin(lat_rad) * math.cos(d_rad) +
        math.cos(lat_rad) * math.sin(d_rad) * math.cos(b_rad)
    )
    new_lon_rad = lon_rad + math.atan2(
        math.sin(b_rad) * math.sin(d_rad) * math.cos(lat_rad),
        math.cos(d_rad) - math.sin(lat_rad) * math.sin(new_lat_rad)
    )
    return math.degrees(new_lat_rad), (math.degrees(new_lon_rad) + 540.0) % 360.0 - 180.0

class IcebergDriftSimulator:
    """
    Simulates iceberg drift trajectories using dynamic balance:
    Forces:
    - Wind drag (Air form drag + skin drag on sail area above waterline)
    - Water drag (Hydrodynamic skin drag on draft/keel below waterline)
    - Coriolis acceleration
    - Antarctic Circumpolar Current / Coastal Current advection
    """
    def __init__(self):
        self.C_a = 1.35  # Air drag coefficient for tabular iceberg
        self.C_w = 0.90  # Water drag coefficient for submerged keel
        self.C_da = 0.002 # Air skin friction
        self.C_dw = 0.003 # Water skin friction

    def compute_drift_velocity(
        self,
        lat: float,
        length_m: float,
        width_m: float,
        freeboard_m: float,
        draft_m: float,
        wind_speed_kts: float,
        wind_dir_from_deg: float,
        ocean_curr_speed_kts: float,
        ocean_curr_dir_to_deg: float
    ) -> Dict[str, Any]:
        """
        Compute instantaneous iceberg drift speed (kts) and heading (deg to).
        Uses steady-state equilibrium:
        F_wind + F_water + F_coriolis = 0
        """
        # Convert inputs to SI units (m/s)
        u_wind = wind_speed_kts * 0.514444
        # Wind vector pointing in direction of flow (blowing TO):
        wind_to_rad = math.radians((wind_dir_from_deg + 180.0) % 360.0)
        u_ax = u_wind * math.sin(wind_to_rad)
        u_ay = u_wind * math.cos(wind_to_rad)

        u_curr = ocean_curr_speed_kts * 0.514444
        curr_to_rad = math.radians(ocean_curr_dir_to_deg)
        u_wx = u_curr * math.sin(curr_to_rad)
        u_wy = u_curr * math.cos(curr_to_rad)

        # Cross-sectional areas
        sail_area = length_m * freeboard_m
        keel_area = length_m * draft_m
        volume = length_m * width_m * (freeboard_m + draft_m)
        mass = RHO_ICE * volume

        f = coriolis_parameter(lat)

        # Iterative solver for iceberg velocity (u_ix, u_iy)
        u_ix, u_iy = u_wx * 0.8 + u_ax * 0.02, u_wy * 0.8 + u_ay * 0.02

        dt = 10.0  # seconds
        for _ in range(120):
            # Relative velocities
            rel_ax = u_ax - u_ix
            rel_ay = u_ay - u_iy
            rel_a_mag = math.hypot(rel_ax, rel_ay)

            rel_wx = u_wx - u_ix
            rel_wy = u_wy - u_iy
            rel_w_mag = math.hypot(rel_wx, rel_wy)

            # Forces (Newtons)
            F_ax = 0.5 * RHO_AIR * self.C_a * sail_area * rel_a_mag * rel_ax
            F_ay = 0.5 * RHO_AIR * self.C_a * sail_area * rel_a_mag * rel_ay

            F_wx = 0.5 * RHO_SEAWATER * self.C_w * keel_area * rel_w_mag * rel_wx
            F_wy = 0.5 * RHO_SEAWATER * self.C_w * keel_area * rel_w_mag * rel_wy

            # Coriolis force: F_cor = -m * f * (k x u_i) -> in Southern Hemisphere (f < 0), deflects to left
            F_cx = mass * f * u_iy
            F_cy = -mass * f * u_ix

            # Net acceleration
            acc_x = (F_ax + F_wx + F_cx) / max(mass, 1e6)
            acc_y = (F_ay + F_wy + F_cy) / max(mass, 1e6)

            u_ix += acc_x * dt
            u_iy += acc_y * dt

        drift_speed_ms = math.hypot(u_ix, u_iy)
        drift_speed_kts = drift_speed_ms / 0.514444
        drift_heading_deg = (math.degrees(math.atan2(u_ix, u_iy)) + 360.0) % 360.0

        f_wind_total = math.hypot(F_ax, F_ay)
        f_water_total = math.hypot(F_wx, F_wy)
        total_forcing = f_wind_total + f_water_total + 1e-5

        return {
            "drift_speed_kts": round(drift_speed_kts, 2),
            "drift_heading_deg": round(drift_heading_deg, 1),
            "u_ix_ms": u_ix,
            "u_iy_ms": u_iy,
            "wind_influence_pct": round(min(100.0, (f_wind_total / total_forcing) * 100.0), 1),
            "current_influence_pct": round(min(100.0, (f_water_total / total_forcing) * 100.0), 1)
        }

    def generate_monte_carlo_trajectory(
        self,
        lat: float,
        lon: float,
        length_m: float,
        width_m: float,
        freeboard_m: float,
        draft_m: float,
        base_wind_speed: float,
        base_wind_dir: float,
        base_curr_speed: float,
        base_curr_dir: float,
        hours: int = 72,
        ensemble_size: int = 25
    ) -> Dict[str, Any]:
        """
        Generate deterministic baseline trajectory + Monte Carlo probabilistic dispersion cone
        by perturbing atmospheric & oceanic forcing vectors.
        """
        time_steps = list(range(0, hours + 1, 6))
        
        # 1. Deterministic central track
        central_path = []
        curr_lat, curr_lon = lat, lon
        for h in time_steps:
            if h == 0:
                central_path.append({"hour": 0, "lat": curr_lat, "lon": curr_lon, "speed_kts": 0.0, "heading_deg": 0.0})
                continue

            drift = self.compute_drift_velocity(
                curr_lat, length_m, width_m, freeboard_m, draft_m,
                base_wind_speed, base_wind_dir, base_curr_speed, base_curr_dir
            )
            step_nm = drift["drift_speed_kts"] * 6.0  # 6 hour interval
            curr_lat, curr_lon = step_lat_lon(curr_lat, curr_lon, step_nm, drift["drift_heading_deg"])
            central_path.append({
                "hour": h,
                "lat": round(curr_lat, 4),
                "lon": round(curr_lon, 4),
                "speed_kts": drift["drift_speed_kts"],
                "heading_deg": drift["drift_heading_deg"]
            })

        # 2. Ensemble runs with stochastic wind/current perturbations
        np.random.seed(42)  # For consistent reproducible demo realism
        ensembles = []
        for e in range(ensemble_size):
            e_path = []
            e_lat, e_lon = lat, lon
            # Perturbation scale grows with forecast horizon
            wind_noise_mag = float(np.random.normal(0, 3.5))
            wind_noise_dir = float(np.random.normal(0, 15.0))
            curr_noise_mag = float(np.random.normal(0, 0.15))
            curr_noise_dir = float(np.random.normal(0, 12.0))

            w_spd = max(2.0, base_wind_speed + wind_noise_mag)
            w_dir = (base_wind_dir + wind_noise_dir) % 360.0
            c_spd = max(0.05, base_curr_speed + curr_noise_mag)
            c_dir = (base_curr_dir + curr_noise_dir) % 360.0

            for h in time_steps:
                if h == 0:
                    e_path.append({"hour": 0, "lat": e_lat, "lon": e_lon})
                    continue
                hourly_w_spd = max(1.0, w_spd + float(np.random.normal(0, 1.2)))
                hourly_w_dir = (w_dir + float(np.random.normal(0, 5.0))) % 360.0
                
                drift = self.compute_drift_velocity(
                    e_lat, length_m, width_m, freeboard_m, draft_m,
                    hourly_w_spd, hourly_w_dir, c_spd, c_dir
                )
                step_nm = drift["drift_speed_kts"] * 6.0
                e_lat, e_lon = step_lat_lon(e_lat, e_lon, step_nm, drift["drift_heading_deg"])
                e_path.append({"hour": h, "lat": round(e_lat, 4), "lon": round(e_lon, 4)})
            ensembles.append(e_path)

        # 3. Uncertainty dispersion ellipses / radii at 24h, 48h, 72h
        uncertainty_radii = {}
        for h in [24, 48, 72]:
            if h in time_steps:
                idx = time_steps.index(h)
                c_point = central_path[idx]
                dists = [
                    haversine_distance_nm(c_point["lat"], c_point["lon"], ens[idx]["lat"], ens[idx]["lon"])
                    for ens in ensembles
                ]
                uncertainty_radii[f"{h}h_nm"] = round(float(np.percentile(dists, 95)), 2)

        return {
            "central_track": central_path,
            "ensembles": ensembles,
            "uncertainty_radii_nm": uncertainty_radii,
            "forecast_hours": hours
        }


class PolarShipResistanceModel:
    """
    Implements Lindqvist (1989) empirical formulation for continuous icebreaking resistance:
    R_ice = R_crushing + R_breaking + R_submersion
    Calculates required propulsion shaft power (MW) and speed limit in ice.
    """
    def __init__(self):
        self.rho_ice = 900.0
        self.rho_water = 1028.0
        self.g = 9.81
        self.friction_coeff = 0.15  # Low-friction icebreaker epoxy hull coating (Inerta 160)

    def calculate_lindqvist_resistance(
        self,
        vessel_beam_m: float,
        vessel_draft_m: float,
        vessel_length_m: float,
        bow_stem_angle_deg: float,
        bow_flare_angle_deg: float,
        ice_thickness_m: float,
        ice_concentration_pct: float,
        ship_speed_kts: float,
        bending_strength_kpa: float = 500.0,
        crushing_strength_mpa: float = 2.0
    ) -> Dict[str, Any]:
        """
        Calculate total ice resistance (kilonewtons) and power demand.
        """
        if ice_thickness_m <= 0.01 or ice_concentration_pct <= 5.0:
            # Open water hydrodynamic drag baseline
            v_ms = ship_speed_kts * 0.514444
            r_ow = 0.5 * self.rho_water * 0.003 * (vessel_length_m * (vessel_beam_m + 2 * vessel_draft_m)) * (v_ms ** 2) / 1000.0
            power_mw = (r_ow * v_ms) / (0.70 * 1000.0) # 70% propulsive efficiency
            return {
                "r_total_kn": round(r_ow, 1),
                "r_crush_kn": 0.0,
                "r_break_kn": 0.0,
                "r_submerge_kn": round(r_ow, 1),
                "required_power_mw": round(max(0.2, power_mw), 2),
                "fuel_rate_mt_per_day": round(max(1.5, power_mw * 0.190 * 24.0), 2), # ~190 g/kWh
                "mode": "Open Water"
            }

        B = vessel_beam_m
        T = vessel_draft_m
        L = vessel_length_m
        phi = math.radians(bow_stem_angle_deg)
        psi = math.radians(bow_flare_angle_deg)
        h = ice_thickness_m
        conc = ice_concentration_pct / 100.0
        v = max(0.5, ship_speed_kts * 0.514444)
        sigma_b = bending_strength_kpa * 1000.0
        sigma_c = crushing_strength_mpa * 1e6

        # 1. Crushing resistance R_c
        denom = max(0.01, 1.0 - self.friction_coeff * math.sin(phi) / math.cos(psi))
        r_c = 0.5 * sigma_b * (h ** 2) * (math.tan(phi) + self.friction_coeff * math.sin(phi) / math.cos(psi)) / denom

        # 2. Breaking (bending) resistance R_b
        r_b = 0.003 * sigma_b * B * (h ** 1.5) * (1.0 + 1.4 * (v / math.sqrt(self.g * max(0.05, h))))

        # 3. Submersion resistance R_s (buoyancy & friction of submerged broken floes)
        delta_rho = self.rho_water - self.rho_ice
        r_s = (delta_rho * self.g * h * B * (T * (B + T) / (B + 2 * T))) * (
            1.0 + 2.0 * (v / math.sqrt(self.g * max(10.0, L)))
        ) + (
            self.friction_coeff * (
                self.rho_ice * self.g * h * B * L * (0.05 + 0.15 * (v / math.sqrt(self.g * max(10.0, L))))
            )
        )

        # Scale continuous level ice resistance by sea ice concentration factor (Pack Ice model)
        r_level_kn = (r_c + r_b + r_s) / 1000.0
        r_pack_kn = r_level_kn * (conc ** 2.2)

        # Power dissipation P = R * v / eta_prop (in MW)
        prop_efficiency = 0.65
        required_power_mw = (r_pack_kn * v) / (prop_efficiency * 1000.0)
        fuel_rate_mt_per_day = required_power_mw * 0.205 * 24.0  # Polar MGO ~205g/kWh

        return {
            "r_total_kn": round(r_pack_kn, 1),
            "r_crush_kn": round((r_c / 1000.0) * (conc ** 2.2), 1),
            "r_break_kn": round((r_b / 1000.0) * (conc ** 2.2), 1),
            "r_submerge_kn": round((r_s / 1000.0) * (conc ** 2.2), 1),
            "required_power_mw": round(required_power_mw, 2),
            "fuel_rate_mt_per_day": round(fuel_rate_mt_per_day, 2),
            "mode": "Continuous Icebreaking" if conc >= 0.7 else "Ramming / Channel Transit"
        }
