"""
Antarctic Polar Sea-Ice, Iceberg Trajectory, and Navigation Decision Support System
FastAPI Backend Server

Provides RESTful endpoints and WebSocket streams for:
- Polar stereographic geospatial ice fields & WMO sea-ice concentrations
- Active mega-iceberg registry, hydrodynamic drift vectors & Monte Carlo uncertainty cones
- IMO Polar Code MSC.1/Circ.1519 POLARIS RIO evaluation engine
- Multi-objective Pareto route optimization (Safest / Fastest / Fuel-Optimal with Lindqvist resistance)
- Synthetic Aperture Radar (SAR) Sentinel-1 AI lead & feature detection
- Polar Ice Pilot Decision Support AI Copilot
- Nearest Antarctic Research Stations & Emergency Shelters Locator
"""

import math
import os
import asyncio
from typing import Dict, List, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from stations_data import ANTARCTIC_STATIONS, find_nearest_stations, get_station_by_id
from polar_physics import (
    IcebergDriftSimulator,
    PolarShipResistanceModel,
    haversine_distance_nm,
    calculate_bearing_deg
)
from polaris_engine import PolarisEvaluator, POLAR_VESSEL_PROFILES, POLARIS_RIV_TABLE
from ice_grid_data import AntarcticIceFieldEngine, ANTARCTIC_SECTORS
from iceberg_tracker import IcebergRegistry
from routing_engine import PolarRoutingEngine
from sar_vision import SARVisionAnalyzer
from ai_copilot import PolarAICopilot

app = FastAPI(
    title="AI Antarctic Navigation & Iceberg Decision Support System",
    version="2.0.0",
    description="Mission-critical polar ECDIS & navigation decision support API for Antarctic waters."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Models
class PointIceRequest(BaseModel):
    lat: float
    lon: float

class CpaRequest(BaseModel):
    ship_lat: float
    ship_lon: float
    ship_speed_kts: float
    ship_heading_deg: float
    iceberg_id: str

class RouteRequest(BaseModel):
    origin_id: str = "ushuaia"
    destination_id: str = "rothera"
    polar_class: str = "PC4"
    objective: str = "safest"

class ParetoRouteRequest(BaseModel):
    origin_id: str = "ushuaia"
    destination_id: str = "rothera"
    polar_class: str = "PC4"

class PolarisRegimeComponent(BaseModel):
    ice_type: str
    concentration_tenths: int

class PolarisEvaluationRequest(BaseModel):
    polar_class: str = "PC4"
    ice_regime: List[PolarisRegimeComponent]

class SARAnalysisRequest(BaseModel):
    image_id: Optional[str] = "SAR-SENTINEL1-WEDDELL-A23A"
    custom_lat: Optional[float] = None
    custom_lon: Optional[float] = None

class CopilotChatRequest(BaseModel):
    message: str
    vessel_lat: Optional[float] = -65.5
    vessel_lon: Optional[float] = -64.2
    polar_class: Optional[str] = "PC4"
    vessel_speed_kts: Optional[float] = 11.2
    ice_concentration_pct: Optional[float] = 45.0
    ice_thickness_m: Optional[float] = 0.9

class ResistanceRequest(BaseModel):
    beam_m: float = 21.0
    draft_m: float = 8.0
    length_m: float = 120.0
    ice_thickness_m: float = 1.0
    ice_concentration_pct: float = 70.0
    ship_speed_kts: float = 8.0

# ----------------- REST Endpoints -----------------

@app.get("/api/status")
@app.get("/api/health")
def get_api_status():
    return {
        "system": "AI-Enabled Antarctic Sea-Ice & Iceberg Navigation Decision Support System",
        "version": "2.0.0",
        "status": "OPERATIONAL",
        "sectors_covered": len(ANTARCTIC_SECTORS),
        "tracked_stations": len(ANTARCTIC_STATIONS),
        "active_icebergs": len(IcebergRegistry.get_all_icebergs())
    }

@app.get("/api/stations")
def get_stations():
    return {
        "stations": ANTARCTIC_STATIONS,
        "count": len(ANTARCTIC_STATIONS)
    }

@app.get("/api/stations/nearest")
def get_nearest_stations(lat: float = Query(...), lon: float = Query(...), max_results: int = Query(4)):
    results = find_nearest_stations(lat, lon, max_results)
    return {"nearest_stations": results}

@app.get("/api/ice-field/sample")
def get_ice_field_sample(
    lat_min: float = -78.0,
    lat_max: float = -58.0,
    lon_min: float = -80.0,
    lon_max: float = 180.0,
    step_deg: float = 3.0
):
    grid = AntarcticIceFieldEngine.get_antarctic_grid_sample(lat_min, lat_max, lon_min, lon_max, step_deg)
    contour = AntarcticIceFieldEngine.get_ice_edge_contour()
    return {
        "grid_points": grid,
        "count": len(grid),
        "ice_edge_contour": contour,
        "sectors": ANTARCTIC_SECTORS
    }

@app.post("/api/ice-field/point")
def get_point_ice_condition(req: PointIceRequest):
    return AntarcticIceFieldEngine.get_point_ice_condition(req.lat, req.lon)

@app.get("/api/icebergs")
def get_icebergs():
    icebergs = IcebergRegistry.get_all_icebergs()
    return {
        "icebergs": icebergs,
        "count": len(icebergs)
    }

@app.post("/api/icebergs/cpa")
def calculate_iceberg_cpa(req: CpaRequest):
    return IcebergRegistry.calculate_cpa_tcpa(
        ship_lat=req.ship_lat,
        ship_lon=req.ship_lon,
        ship_speed_kts=req.ship_speed_kts,
        ship_heading_deg=req.ship_heading_deg,
        iceberg_id=req.iceberg_id
    )

@app.get("/api/routes/endpoints")
def get_route_endpoints():
    return PolarRoutingEngine.get_all_endpoints()

@app.post("/api/routes/calculate")
def calculate_route(req: RouteRequest):
    return PolarRoutingEngine.generate_route(
        origin_id=req.origin_id,
        destination_id=req.destination_id,
        polar_class=req.polar_class,
        objective=req.objective
    )

@app.post("/api/routes/pareto")
def calculate_pareto_routes(req: ParetoRouteRequest):
    return PolarRoutingEngine.get_pareto_route_options(
        origin_id=req.origin_id,
        destination_id=req.destination_id,
        polar_class=req.polar_class
    )

@app.post("/api/polaris/evaluate")
def evaluate_polaris(req: PolarisEvaluationRequest):
    regime_list = [{"ice_type": c.ice_type, "concentration_tenths": c.concentration_tenths} for c in req.ice_regime]
    return PolarisEvaluator.evaluate_rio(req.polar_class, regime_list)

@app.get("/api/polaris/vessel-profiles")
def get_vessel_profiles():
    return {
        "profiles": POLAR_VESSEL_PROFILES,
        "riv_table": POLARIS_RIV_TABLE
    }

@app.get("/api/sar/presets")
def get_sar_presets():
    return {"presets": SARVisionAnalyzer.get_presets()}

@app.post("/api/sar/analyze")
def analyze_sar(req: SARAnalysisRequest):
    return SARVisionAnalyzer.analyze_sar_image(req.image_id, req.custom_lat, req.custom_lon)

@app.post("/api/copilot/chat")
def chat_copilot(req: CopilotChatRequest):
    return PolarAICopilot.get_tactical_advice(
        user_message=req.message,
        vessel_lat=req.vessel_lat,
        vessel_lon=req.vessel_lon,
        polar_class=req.polar_class,
        vessel_speed_kts=req.vessel_speed_kts,
        ice_concentration_pct=req.ice_concentration_pct,
        ice_thickness_m=req.ice_thickness_m
    )

@app.post("/api/physics/resistance")
def calculate_resistance(req: ResistanceRequest):
    model = PolarShipResistanceModel()
    return model.calculate_lindqvist_resistance(
        vessel_beam_m=req.beam_m,
        vessel_draft_m=req.draft_m,
        vessel_length_m=req.length_m,
        bow_stem_angle_deg=28.0,
        bow_flare_angle_deg=45.0,
        ice_thickness_m=req.ice_thickness_m,
        ice_concentration_pct=req.ice_concentration_pct,
        ship_speed_kts=req.ship_speed_kts
    )

# ----------------- WebSocket Live Telemetry Feed -----------------

@app.websocket("/ws/live-stream")
async def websocket_telemetry_stream(websocket: WebSocket):
    await websocket.accept()
    sim_time_sec = 0
    # Initial simulated vessel state (heading south through Drake towards Rothera)
    ship_lat = -62.5
    ship_lon = -64.0
    ship_speed = 12.0
    ship_heading = 175.0

    try:
        while True:
            sim_time_sec += 3
            # Advance simulated ship
            d_nm = (ship_speed / 3600.0) * 3.0 * 20.0  # 20x simulated speed
            d_lat = - (d_nm / 60.0) * math.cos(math.radians(ship_heading))
            d_lon = (d_nm / (60.0 * math.cos(math.radians(ship_lat)))) * math.sin(math.radians(ship_heading))
            ship_lat += d_lat
            ship_lon += d_lon

            ice_cond = AntarcticIceFieldEngine.get_point_ice_condition(ship_lat, ship_lon)
            cpa_a23a = IcebergRegistry.calculate_cpa_tcpa(ship_lat, ship_lon, ship_speed, ship_heading, "A-23a")

            payload = {
                "timestamp": sim_time_sec,
                "vessel": {
                    "lat": round(ship_lat, 4),
                    "lon": round(ship_lon, 4),
                    "speed_kts": ship_speed,
                    "heading_deg": ship_heading,
                    "polar_class": "PC4",
                    "status": "UNDERWAY_IN_ICE_WATCH"
                },
                "environment": ice_cond,
                "cpa_alert": cpa_a23a
            }

            await websocket.send_json(payload)
            await asyncio.sleep(2.0)
    except WebSocketDisconnect:
        pass
    except Exception:
        pass

# ----------------- Serve Frontend Static SPA (Single Server) -----------------
FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))
ASSETS_DIR = os.path.join(FRONTEND_DIST, "assets")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

@app.get("/{full_path:path}")
async def serve_spa_app(full_path: str):
    # Do not intercept API or WS routes
    if full_path.startswith("api") or full_path.startswith("ws") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        return None
    file_target = os.path.join(FRONTEND_DIST, full_path)
    if os.path.exists(file_target) and os.path.isfile(file_target):
        return FileResponse(file_target)
    index_html = os.path.join(FRONTEND_DIST, "index.html")
    if os.path.exists(index_html):
        return FileResponse(index_html)
    return {"message": "POLARIS ECDIS API Server Active. Frontend dist building..."}
