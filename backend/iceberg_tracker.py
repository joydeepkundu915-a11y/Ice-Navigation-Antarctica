"""
Active Antarctic Iceberg Tracking & Trajectory Prediction Registry
Tracks world-famous mega-icebergs (A-23a, A-81, A-76a, D-28, etc.)
and smaller navigational hazard clusters (growlers, bergy bits).
Generates physical drift vectors, CPA (Closest Point of Approach), and Monte Carlo dispersion cones.
"""

import math
from typing import Dict, List, Any
from polar_physics import IcebergDriftSimulator, haversine_distance_nm, calculate_bearing_deg

# Active Mega-Icebergs & Calving Catalog
TRACKED_ICEBERGS = [
    {
        "id": "A-23a",
        "name": "Iceberg A-23a (World's Largest Tabular Iceberg)",
        "origin_shelf": "Filchner-Ronne Ice Shelf (Calved 1986, Grounded till 2020)",
        "lat": -59.4200,
        "lon": -44.1500,
        "length_km": 68.0,
        "width_km": 54.0,
        "area_sq_km": 3800.0,
        "freeboard_m": 45.0,
        "draft_m": 280.0,
        "estimated_mass_gigatons": 1050.0,
        "drift_speed_kts": 1.45,
        "drift_heading_deg": 48.0,
        "threat_level": "EXTREME",
        "hazard_corridor": "Scotia Sea / South Georgia Iceberg Alley",
        "notes": "Drifting rapidly through the Antarctic Circumpolar Current toward South Georgia Island shallow banks. Significant fragmentation of bergy bits shedding along wake."
    },
    {
        "id": "A-81",
        "name": "Iceberg A-81",
        "origin_shelf": "Brunt Ice Shelf (Chasm 1 Calving, Jan 2023)",
        "lat": -75.8500,
        "lon": -31.4000,
        "length_km": 52.0,
        "width_km": 30.0,
        "area_sq_km": 1550.0,
        "freeboard_m": 40.0,
        "draft_m": 240.0,
        "estimated_mass_gigatons": 480.0,
        "drift_speed_kts": 0.85,
        "drift_heading_deg": 285.0,
        "threat_level": "HIGH",
        "hazard_corridor": "Weddell Sea Coastal Current (East Wind Drift)",
        "notes": "Entrained in the Weddell Gyre western boundary current. Interacting with McDonald Ice Rumples."
    },
    {
        "id": "A-76A",
        "name": "Iceberg A-76A",
        "origin_shelf": "Ronne Ice Shelf (Calved May 2021)",
        "lat": -54.2000,
        "lon": -38.5000,
        "length_km": 42.0,
        "width_km": 26.0,
        "area_sq_km": 1100.0,
        "freeboard_m": 35.0,
        "draft_m": 210.0,
        "estimated_mass_gigatons": 320.0,
        "drift_speed_kts": 1.70,
        "drift_heading_deg": 65.0,
        "threat_level": "MODERATE",
        "hazard_corridor": "South Atlantic Polar Front Zone",
        "notes": "In active thermo-mechanical decay and basal melting as SST exceeds +2°C. Multiple mega-growlers trailing in 20NM radius."
    },
    {
        "id": "D-28",
        "name": "Iceberg D-28 ('Moo-cow')",
        "origin_shelf": "Amery Ice Shelf (Calved Sept 2019)",
        "lat": -64.8000,
        "lon": 68.2000,
        "length_km": 48.0,
        "width_km": 31.0,
        "area_sq_km": 1490.0,
        "freeboard_m": 42.0,
        "draft_m": 250.0,
        "estimated_mass_gigatons": 410.0,
        "drift_speed_kts": 0.95,
        "drift_heading_deg": 310.0,
        "threat_level": "HIGH",
        "hazard_corridor": "Prydz Bay / Indian Ocean Sector (En route Bharati Station approach)",
        "notes": "Direct navigational hazard to Indian NCAOR resupply vessels heading into Thala Fjord / Larsemann Hills."
    },
    {
        "id": "B-22A",
        "name": "Iceberg B-22A",
        "origin_shelf": "Thwaites Glacier Tongue (Amundsen Sea)",
        "lat": -74.1000,
        "lon": -108.5000,
        "length_km": 45.0,
        "width_km": 28.0,
        "area_sq_km": 1250.0,
        "freeboard_m": 50.0,
        "draft_m": 300.0,
        "estimated_mass_gigatons": 450.0,
        "drift_speed_kts": 0.60,
        "drift_heading_deg": 260.0,
        "threat_level": "CRITICAL",
        "hazard_corridor": "Amundsen Sea Embayment",
        "notes": "Remnants of massive Thwaites 'Doomsday Glacier' grounding line calvings, prone to sudden capsizing."
    },
    {
        "id": "GROWLER-CLUSTER-MAXWELL",
        "name": "Maxwell Bay Growler & Bergy Bit Cluster",
        "origin_shelf": "Collins Ice Cap (King George Island)",
        "lat": -62.2400,
        "lon": -58.8500,
        "length_km": 0.08,
        "width_km": 0.05,
        "area_sq_km": 0.004,
        "freeboard_m": 1.5,
        "draft_m": 8.0,
        "estimated_mass_gigatons": 0.00005,
        "drift_speed_kts": 1.10,
        "drift_heading_deg": 140.0,
        "threat_level": "HIGH_STEALTH",
        "hazard_corridor": "King George Island Sound (Frei / Artigas / Bellingshausen approach)",
        "notes": "Low radar cross-section (RCS) stealth hazards; almost flush with wave troughs, dangerous for high-speed expedition zodiacs and cruise ships."
    }
]

simulator = IcebergDriftSimulator()

class IcebergRegistry:
    """Iceberg state manager and trajectory engine."""

    @classmethod
    def get_all_icebergs(cls) -> List[Dict[str, Any]]:
        """Return all tracked icebergs with real-time calculated trajectories."""
        results = []
        for berg in TRACKED_ICEBERGS:
            # Simulate 72-hour forecast trajectory with Monte Carlo envelope
            # MetOcean conditions based on local sector
            w_spd = 22.0 if berg["lat"] < -65 else 28.0
            w_dir = 250.0 if berg["lat"] > -64 else 90.0
            c_spd = 0.8 if "Scotia" in berg["hazard_corridor"] else 0.4
            c_dir = 55.0 if "Scotia" in berg["hazard_corridor"] else 275.0

            traj_data = simulator.generate_monte_carlo_trajectory(
                lat=berg["lat"],
                lon=berg["lon"],
                length_m=berg["length_km"] * 1000.0,
                width_m=berg["width_km"] * 1000.0,
                freeboard_m=berg["freeboard_m"],
                draft_m=berg["draft_m"],
                base_wind_speed=w_spd,
                base_wind_dir=w_dir,
                base_curr_speed=c_spd,
                base_curr_dir=c_dir,
                hours=72,
                ensemble_size=15
            )

            drift_info = simulator.compute_drift_velocity(
                lat=berg["lat"],
                length_m=berg["length_km"] * 1000.0,
                width_m=berg["width_km"] * 1000.0,
                freeboard_m=berg["freeboard_m"],
                draft_m=berg["draft_m"],
                wind_speed_kts=w_spd,
                wind_dir_from_deg=w_dir,
                ocean_curr_speed_kts=c_spd,
                ocean_curr_dir_to_deg=c_dir
            )

            results.append({
                **berg,
                "current_drift": drift_info,
                "trajectory_72h": traj_data["central_track"],
                "monte_carlo_ensembles": traj_data["ensembles"],
                "uncertainty_radii_nm": traj_data["uncertainty_radii_nm"]
            })
        return results

    @classmethod
    def calculate_cpa_tcpa(
        cls,
        ship_lat: float,
        ship_lon: float,
        ship_speed_kts: float,
        ship_heading_deg: float,
        iceberg_id: str
    ) -> Dict[str, Any]:
        """
        Calculate Closest Point of Approach (CPA in NM) and Time to CPA (TCPA in minutes)
        between vessel and target iceberg based on relative velocity vectors.
        """
        target = None
        for b in TRACKED_ICEBERGS:
            if b["id"] == iceberg_id:
                target = b
                break

        if not target:
            return {"error": "Iceberg not found"}

        # Initial relative distance and bearing
        d_init = haversine_distance_nm(ship_lat, ship_lon, target["lat"], target["lon"])
        brg = calculate_bearing_deg(ship_lat, ship_lon, target["lat"], target["lon"])

        # Ship velocity vector (m/s)
        v_ship = ship_speed_kts * 0.514444
        h_ship_rad = math.radians(ship_heading_deg)
        v_sx = v_ship * math.sin(h_ship_rad)
        v_sy = v_ship * math.cos(h_ship_rad)

        # Iceberg velocity vector (m/s)
        v_berg = target["drift_speed_kts"] * 0.514444
        h_berg_rad = math.radians(target["drift_heading_deg"])
        v_bx = v_berg * math.sin(h_berg_rad)
        v_by = v_berg * math.cos(h_berg_rad)

        # Relative velocity vector (Iceberg relative to Ship)
        v_rel_x = v_bx - v_sx
        v_rel_y = v_by - v_sy
        v_rel_mag = math.hypot(v_rel_x, v_rel_y)  # m/s

        if v_rel_mag < 0.01:
            return {
                "iceberg_id": target["id"],
                "iceberg_name": target["name"],
                "distance_nm": round(d_init, 2),
                "bearing_deg": round(brg, 1),
                "cpa_nm": round(d_init, 2),
                "tcpa_minutes": 0.0,
                "collision_risk": "STATIC_CLEAR"
            }

        # Vector from ship to iceberg in meters
        d_init_m = d_init * 1852.0
        brg_rad = math.radians(brg)
        p_x = d_init_m * math.sin(brg_rad)
        p_y = d_init_m * math.cos(brg_rad)

        # TCPA = - (P . V_rel) / |V_rel|^2
        t_cpa_sec = - (p_x * v_rel_x + p_y * v_rel_y) / (v_rel_mag ** 2)
        tcpa_min = t_cpa_sec / 60.0

        if t_cpa_sec < 0:
            # Diverging
            cpa_m = d_init_m
            risk = "DIVERGING_SAFE"
        else:
            # Position at CPA
            cpa_x = p_x + v_rel_x * t_cpa_sec
            cpa_y = p_y + v_rel_y * t_cpa_sec
            cpa_m = math.hypot(cpa_x, cpa_y)
            cpa_nm = cpa_m / 1852.0

            if cpa_nm < 1.0:
                risk = "CRITICAL_COLLISION_ALERT"
            elif cpa_nm < 3.0:
                risk = "PROXIMITY_WARNING"
            elif cpa_nm < 8.0:
                risk = "MONITORED_CROSSING"
            else:
                risk = "CLEAR_PASSAGE"

        cpa_nm = round(cpa_m / 1852.0, 2)

        return {
            "iceberg_id": target["id"],
            "iceberg_name": target["name"],
            "current_distance_nm": round(d_init, 2),
            "bearing_deg": round(brg, 1),
            "cpa_nm": cpa_nm,
            "tcpa_minutes": round(max(0.0, tcpa_min), 1),
            "relative_speed_kts": round(v_rel_mag / 0.514444, 2),
            "collision_risk": risk
        }
