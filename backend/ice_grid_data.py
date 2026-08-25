"""
Antarctic Sea Ice & MetOcean Spatial Grid Data Provider
Generates realistic high-resolution spatial fields for:
- Sea Ice Concentration (SIC, 0-100%)
- Sea Ice Thickness (SIT, meters)
- Ice Drift Vectors (u_ice, v_ice in kts)
- Ice Pressure / Ridge convergence index
- Sea Surface Temperature (SST, -2.0 to +4.0 C)
- Significant Wave Height (Hs, meters) & Wind (kts)
Covering major Antarctic sectors:
- Antarctic Peninsula / Drake Passage / Weddell Sea
- Ross Sea / McMurdo Sound
- Prydz Bay / Amery Ice Shelf (Bharati Station)
- Queen Maud Land (Maitri / Neumayer III)
- Wilkes Land / Dumont d'Urville / Casey
"""

import math
import numpy as np
from typing import Dict, List, Any, Tuple

# Key Geographic Features & Ice Shelf Boundaries
ANTARCTIC_SECTORS = [
    {
        "id": "peninsula_weddell",
        "name": "Antarctic Peninsula & Weddell Sea",
        "lat_min": -78.0, "lat_max": -58.0,
        "lon_min": -75.0, "lon_max": -20.0,
        "center": [-65.0, -55.0]
    },
    {
        "id": "ross_sea",
        "name": "Ross Sea Sector & McMurdo",
        "lat_min": -78.5, "lat_max": -60.0,
        "lon_min": 155.0, "lon_max": -160.0,
        "center": [-74.0, 175.0]
    },
    {
        "id": "east_antarctica",
        "name": "East Antarctica & Prydz Bay",
        "lat_min": -72.0, "lat_max": -55.0,
        "lon_min": 20.0, "lon_max": 120.0,
        "center": [-68.0, 75.0]
    }
]

class AntarcticIceFieldEngine:
    """Generates analytical and rasterized sea-ice and ocean state across Antarctica."""

    @staticmethod
    def get_point_ice_condition(lat: float, lon: float) -> Dict[str, Any]:
        """
        Calculates local ice concentration, thickness, drift, and MetOcean state
        based on latitude, geography, proximity to ice shelves, and Weddell/Ross Gyres.
        """
        # Base polar latitude factor (Ice edge around -60S in winter, -66S in summer)
        # Assuming typical polar navigation season (late spring / summer)
        lat_abs = abs(lat)

        # Land check (Antarctic continent roughly lat < -63 in peninsula, < -70 elsewhere)
        is_continent = False
        if lat < -82:
            is_continent = True
        elif lat < -72 and (-150 < lon < -60):
            is_continent = True
        elif lat < -74 and (-60 < lon < 60):
            is_continent = True

        # Weddell Sea gyre effect (heavy multi-year ice packed against eastern side of Antarctic Peninsula)
        is_weddell = (-76.0 <= lat <= -63.0) and (-62.0 <= lon <= -30.0)
        is_ross = (-78.0 <= lat <= -70.0) and (160.0 <= lon or lon <= -165.0)
        is_drake = (-62.0 <= lat <= -55.0) and (-70.0 <= lon <= -55.0)
        is_prydz = (-70.0 <= lat <= -66.0) and (70.0 <= lon <= 80.0)

        # Base concentration calculation
        if lat >= -58.0:
            sic = 0.0
            thickness = 0.0
            ice_stage = "Open Water"
        elif is_drake:
            # Drake passage is predominantly open water / bergy water
            sic = max(0.0, min(15.0, (lat_abs - 59.0) * 4.0))
            thickness = 0.3 if sic > 0 else 0.0
            ice_stage = "Open / Bergy Water" if sic > 0 else "Open Water"
        elif is_weddell:
            # Weddell Sea has heavy pack ice and multi-year ice accumulation
            sic = min(98.0, max(15.0, (lat_abs - 61.0) * 12.0 + (abs(lon + 55.0) * 0.4)))
            thickness = 1.2 + (lat_abs - 62.0) * 0.15 + (1.0 if lon < -50.0 else 0.4)
            ice_stage = "Multi-Year / Heavy Pack Ice" if thickness > 2.0 else "Thick First-Year Pack"
        elif is_ross:
            # Ross Sea polynya + coastal fast ice
            if -76.0 <= lat <= -74.0 and 165.0 <= lon <= 178.0:
                # Ross Sea Polynya (open water / thin young ice)
                sic = 25.0
                thickness = 0.4
                ice_stage = "Polynya / Young Thin Ice"
            else:
                sic = min(95.0, max(20.0, (lat_abs - 66.0) * 11.0))
                thickness = 1.0 + (lat_abs - 68.0) * 0.12
                ice_stage = "Medium to Thick First-Year Ice"
        elif is_prydz:
            sic = min(88.0, max(10.0, (lat_abs - 64.0) * 14.0))
            thickness = 0.8 + (lat_abs - 66.0) * 0.12
            ice_stage = "Fast Ice / Coastal Pack"
        else:
            if lat_abs < 63.0:
                sic = 0.0
                thickness = 0.0
                ice_stage = "Open Water"
            else:
                sic = min(92.0, max(0.0, (lat_abs - 63.0) * 9.5))
                thickness = max(0.1, (lat_abs - 63.0) * 0.22) if sic > 0 else 0.0
                ice_stage = "First-Year Pack Ice" if thickness >= 0.7 else "Thin Ice / Slush"

        sic = round(float(sic), 1)
        thickness = round(float(thickness), 2)

        # Ice drift velocity & current vectors (Antarctic Circumpolar Current & Coastal Easterlies)
        if lat >= -64.0:
            # ACC eastward flow
            u_ice = round(0.4 + (abs(lat) - 55.0) * 0.05, 2)  # Eastward
            v_ice = round(-0.15, 2)  # Slight northward Ekman component
            current_dir_deg = 80.0
            current_spd_kts = 0.6
        else:
            # Antarctic Coastal Current (East Wind Drift - westward flow near coast)
            u_ice = round(-0.35 - (abs(lat) - 64.0) * 0.04, 2) # Westward
            v_ice = round(0.12, 2) # Northward divergence
            current_dir_deg = 260.0
            current_spd_kts = 0.45

        # Ice Pressure Ridge & Besetting Hazard Index (0 to 100)
        # High when ice concentration is > 85% and onshore wind causes compression
        if sic > 80:
            pressure_index = min(100, int((sic - 75) * 4.2 + thickness * 15))
        else:
            pressure_index = int(sic * 0.2)

        # MetOcean conditions
        wind_speed_kts = round(18.0 + (abs(lat) - 55.0) * 0.8 + math.sin(lon * 0.1) * 6.0, 1)
        wind_dir_deg = round((270.0 + math.cos(lat * 0.2) * 45.0) % 360.0, 1)
        sst_c = round(max(-1.85, 4.5 - (lat_abs - 50.0) * 0.28), 2)
        wave_height_m = round(max(0.2, (1.0 - sic / 100.0) * (2.0 + wind_speed_kts * 0.08)), 2)

        return {
            "lat": lat,
            "lon": lon,
            "sea_ice_concentration_pct": sic,
            "sea_ice_thickness_m": thickness,
            "ice_stage": ice_stage,
            "ice_pressure_index": pressure_index,
            "ice_drift_speed_kts": round(math.hypot(u_ice, v_ice), 2),
            "ice_drift_heading_deg": round((math.degrees(math.atan2(u_ice, v_ice)) + 360.0) % 360.0, 1),
            "sst_c": sst_c,
            "surface_current_spd_kts": current_spd_kts,
            "surface_current_dir_deg": current_dir_deg,
            "wind_speed_kts": wind_speed_kts,
            "wind_dir_from_deg": wind_dir_deg,
            "wave_height_m": wave_height_m,
            "visibility_nm": 12.0 if sic < 70 else 4.5
        }

    @classmethod
    def get_antarctic_grid_sample(
        cls,
        lat_min: float = -78.0,
        lat_max: float = -60.0,
        lon_min: float = -80.0,
        lon_max: float = 180.0,
        step_deg: float = 2.0
    ) -> List[Dict[str, Any]]:
        """Generates spatial grid sample points for heatmap and vector layer visualization."""
        points = []
        lats = np.arange(lat_min, lat_max + step_deg, step_deg)
        lons = np.arange(lon_min, lon_max + step_deg, step_deg * 2.0)

        for la in lats:
            for lo in lons:
                pt = cls.get_point_ice_condition(float(la), float(lo))
                points.append(pt)
        return points

    @classmethod
    def get_ice_edge_contour(cls) -> List[List[float]]:
        """Returns polygonal coordinates representing the marginal sea ice zone (15% SIC border)."""
        contour = []
        # Approximate summer ice edge line across 360 degrees longitude
        for deg in range(-180, 180, 5):
            # Dynamic ice edge variation by sector
            if -70 <= deg <= -40:  # Weddell Sea extends further north
                lat = -61.5 + math.sin(deg * 0.15) * 1.5
            elif 150 <= deg or deg <= -160:  # Ross Sea
                lat = -66.0 + math.cos(deg * 0.1) * 2.0
            elif 60 <= deg <= 100:  # Prydz Bay
                lat = -63.5 + math.sin(deg * 0.2) * 1.0
            else:
                lat = -64.0 + math.sin(deg * 0.05) * 1.8
            contour.append([round(lat, 3), float(deg)])
        return contour
