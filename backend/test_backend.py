"""
Unit & Integration Verification Script for Antarctic Navigation Backend
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from polar_physics import (
    coriolis_parameter,
    haversine_distance_nm,
    IcebergDriftSimulator,
    PolarShipResistanceModel
)
from polaris_engine import PolarisEvaluator
from ice_grid_data import AntarcticIceFieldEngine
from iceberg_tracker import IcebergRegistry
from routing_engine import PolarRoutingEngine
from sar_vision import SARVisionAnalyzer
from ai_copilot import PolarAICopilot
from stations_data import ANTARCTIC_STATIONS, find_nearest_stations

def test_all():
    print("=== 1. Testing Polar Physics & Coriolis ===")
    f_65s = coriolis_parameter(-65.0)
    print(f"Coriolis parameter at 65S: {f_65s:.6e} s^-1 (Expected negative in SH)")
    assert f_65s < 0, "Coriolis parameter at 65S must be negative in Southern Hemisphere"

    dist = haversine_distance_nm(-54.8, -68.3, -67.57, -68.13)
    print(f"Distance Ushuaia to Rothera: {dist:.1f} NM")
    assert 700 < dist < 850, f"Distance out of expected range: {dist}"

    sim = IcebergDriftSimulator()
    drift = sim.compute_drift_velocity(
        lat=-60.0,
        length_m=50000,
        width_m=30000,
        freeboard_m=40,
        draft_m=250,
        wind_speed_kts=25,
        wind_dir_from_deg=270,
        ocean_curr_speed_kts=0.6,
        ocean_curr_dir_to_deg=60
    )
    print(f"Iceberg drift computed: Speed {drift['drift_speed_kts']} kts, Heading {drift['drift_heading_deg']} deg")
    assert drift["drift_speed_kts"] > 0, "Iceberg drift speed should be positive"

    mc = sim.generate_monte_carlo_trajectory(
        lat=-60.0, lon=-45.0,
        length_m=50000, width_m=30000, freeboard_m=40, draft_m=250,
        base_wind_speed=25, base_wind_dir=270, base_curr_speed=0.6, base_curr_dir=60,
        hours=72, ensemble_size=10
    )
    print(f"Monte Carlo ensembles generated: {len(mc['ensembles'])}, 72h radius: {mc['uncertainty_radii_nm'].get('72h_nm')} NM")
    assert len(mc["central_track"]) > 0

    print("\n=== 2. Testing POLARIS RIO Engine ===")
    regime = [
        {"ice_type": "medium_first_year", "concentration_tenths": 6},
        {"ice_type": "open_water", "concentration_tenths": 4}
    ]
    pc4_eval = PolarisEvaluator.evaluate_rio("PC4", regime)
    non_ice_eval = PolarisEvaluator.evaluate_rio("NON_ICE", regime)
    print(f"PC4 in 6/10 medium first-year: RIO = {pc4_eval['rio']}, Status: {pc4_eval['status']}")
    print(f"NON_ICE in 6/10 medium first-year: RIO = {non_ice_eval['rio']}, Status: {non_ice_eval['status']}")
    assert pc4_eval["rio"] > non_ice_eval["rio"], "PC4 should have higher RIO than NON_ICE"

    print("\n=== 3. Testing Ice Grid Data & Antarctic Stations ===")
    sample_ice = AntarcticIceFieldEngine.get_point_ice_condition(-68.0, -60.0)
    print(f"Weddell Sea sample (-68S, -60W): SIC = {sample_ice['sea_ice_concentration_pct']}%, SIT = {sample_ice['sea_ice_thickness_m']}m, Stage = {sample_ice['ice_stage']}")
    assert sample_ice["sea_ice_concentration_pct"] > 50

    nearest = find_nearest_stations(-67.0, -68.0, 3)
    print(f"Nearest station to (-67, -68): {nearest[0]['name']} at {nearest[0]['distance_nm']} NM")
    assert "Rothera" in nearest[0]["name"] or "Palmer" in nearest[0]["name"]

    print("\n=== 4. Testing Iceberg Registry & CPA ===")
    icebergs = IcebergRegistry.get_all_icebergs()
    print(f"Tracked Icebergs count: {len(icebergs)}")
    assert len(icebergs) >= 5

    cpa = IcebergRegistry.calculate_cpa_tcpa(-58.0, -46.0, 12.0, 110.0, "A-23a")
    print(f"CPA to A-23a: {cpa['cpa_nm']} NM, TCPA: {cpa['tcpa_minutes']} min, Risk: {cpa['collision_risk']}")

    print("\n=== 5. Testing Multi-Objective Route Planner ===")
    pareto = PolarRoutingEngine.get_pareto_route_options("ushuaia", "rothera", "PC4")
    print(f"Safest Route: {pareto['safest_route']['total_distance_nm']} NM, Duration: {pareto['safest_route']['estimated_voyage_days']} days, Min RIO: {pareto['safest_route']['min_rio']}")
    print(f"Fastest Route: {pareto['fastest_route']['total_distance_nm']} NM, Duration: {pareto['fastest_route']['estimated_voyage_days']} days, Min RIO: {pareto['fastest_route']['min_rio']}")
    print(f"Fuel-Optimal Route: {pareto['fuel_optimal_route']['total_fuel_mgo_mt']} MT MGO")
    assert len(pareto["safest_route"]["waypoints"]) > 5

    print("\n=== 6. Testing SAR Vision Module ===")
    sar_res = SARVisionAnalyzer.analyze_sar_image("SAR-SENTINEL1-WEDDELL-A23A")
    print(f"SAR Analysis: {sar_res['title']}, Navigability Score: {sar_res['navigability_score']}, Detections: {len(sar_res['detections'])}")
    assert sar_res["navigability_score"] > 0

    print("\n=== 7. Testing AI Decision Copilot ===")
    copilot_res = PolarAICopilot.get_tactical_advice(
        "Our vessel is beset in heavy ice pressure, what are the immediate steps?",
        -68.0, -65.0, "PC4", 0.0, 90.0, 1.8
    )
    print(f"Copilot Category: {copilot_res['category']}, Severity: {copilot_res['severity']}")
    print(f"Action Items: {len(copilot_res['action_items'])}")
    assert "BESET" in copilot_res["category"]

    print("\n>>> ALL BACKEND TESTS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    test_all()
