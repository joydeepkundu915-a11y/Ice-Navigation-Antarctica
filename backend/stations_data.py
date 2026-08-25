"""
Antarctic Research Stations, Bases, Safe Havens, and Emergency Shelters Catalog
Includes coordinates, operating nations, runway/helipad capabilities, medical facilities, and safe anchorage depth.
"""

ANTARCTIC_STATIONS = [
    {
        "id": "mcmurdo",
        "name": "McMurdo Station",
        "operator": "United States (USAP)",
        "lat": -77.8460,
        "lon": 166.6680,
        "sector": "Ross Sea",
        "type": "Permanent Research Station",
        "capacity_summer": 1000,
        "capacity_winter": 250,
        "facilities": ["Full Surgical Hospital", "Ice Runway (Pegasus/Phoenix)", "Helipad", "Deep Water Wharf", "Fuel Depot"],
        "safe_anchorage": True,
        "anchorage_depth_m": 28.0,
        "vhf_channel": "16 / 68",
        "medical_level": "Tier 4 (Surgical & Trauma Unit)",
        "fuel_support": "F-34 / MGO / Jet A-1",
        "description": "Largest Antarctic station, logistics hub for Ross Sea sector with ice pier and deep-water anchorage in Winter Quarters Bay."
    },
    {
        "id": "rothera",
        "name": "Rothera Research Station",
        "operator": "United Kingdom (BAS)",
        "lat": -67.5700,
        "lon": -68.1300,
        "sector": "Antarctic Peninsula (Adelaide Island)",
        "type": "Permanent Research Station",
        "capacity_summer": 160,
        "capacity_winter": 25,
        "facilities": ["Crushed Rock Runway (900m)", "Biscoe Wharf (Deep Water)", "Helipad", "Level 3 Medical Clinic", "Dive Facility"],
        "safe_anchorage": True,
        "anchorage_depth_m": 35.0,
        "vhf_channel": "16 / 12",
        "medical_level": "Tier 3 (Emergency Stabilization & Telemedicine)",
        "fuel_support": "MGO / Avtur",
        "description": "British Antarctic Survey logistics hub on Adelaide Island, equipped with Biscoe Wharf capable of berthing RRS Sir David Attenborough."
    },
    {
        "id": "palmer",
        "name": "Palmer Station",
        "operator": "United States (USAP)",
        "lat": -64.7740,
        "lon": -64.0530,
        "sector": "Antarctic Peninsula (Anvers Island)",
        "type": "Permanent Research Station",
        "capacity_summer": 45,
        "capacity_winter": 20,
        "facilities": ["Zodiac Landing Wharf", "Helipad", "Marine Bio Labs", "Hyperbaric Chamber Support"],
        "safe_anchorage": True,
        "anchorage_depth_m": 22.0,
        "vhf_channel": "16 / 6",
        "medical_level": "Tier 2 (Advanced Trauma & Hyperbaric)",
        "fuel_support": "MGO Marine Gas Oil",
        "description": "US station on Anvers Island with sheltered Arthur Harbor anchorage, excellent protection from northern swell."
    },
    {
        "id": "esperanza",
        "name": "Esperanza Base",
        "operator": "Argentina (IAA)",
        "lat": -63.3970,
        "lon": -56.9980,
        "sector": "Northern Antarctic Peninsula (Hope Bay)",
        "type": "Permanent Settlement",
        "capacity_summer": 90,
        "capacity_winter": 55,
        "facilities": ["Helipad", "Seaplane Ramp", "Emergency Clinic", "School", "Meteorological Center"],
        "safe_anchorage": False,
        "anchorage_depth_m": 15.0,
        "vhf_channel": "16 / 14",
        "medical_level": "Tier 2 (Emergency Trauma Clinic)",
        "fuel_support": "GOA (Antarctic Gas Oil)",
        "description": "Argentine base in Hope Bay, prone to extreme katabatic winds exceeding 80 knots; anchorage requires active anchor watch."
    },
    {
        "id": "freifrey",
        "name": "Base Presidente Eduardo Frei Montalva",
        "operator": "Chile (INACH / FACh)",
        "lat": -62.1917,
        "lon": -58.9867,
        "sector": "South Shetland Islands (King George Island)",
        "type": "Permanent Air & Maritime Hub",
        "capacity_summer": 150,
        "capacity_winter": 80,
        "facilities": ["1300m Asphalt/Gravel Runway (Teniente Rodolfo Marsh)", "Hospital with Surgery", "Maritime Port Captaincy", "Helipads"],
        "safe_anchorage": True,
        "anchorage_depth_m": 18.0,
        "vhf_channel": "16 / 14 / 74",
        "medical_level": "Tier 3 (Surgical & Medevac Staging Base)",
        "fuel_support": "MGO / Jet A-1 / Aviation Kerosene",
        "description": "Major air-sea intermodal hub in the South Shetlands. Maxwell Bay provides good shelter during easterly storms."
    },
    {
        "id": "neumayer3",
        "name": "Neumayer-Station III",
        "operator": "Germany (AWI)",
        "lat": -70.6740,
        "lon": -8.2740,
        "sector": "Weddell Sea / Ekström Ice Shelf",
        "type": "Permanent Elevated Station",
        "capacity_summer": 60,
        "capacity_winter": 10,
        "facilities": ["Skiway (1000m)", "Helipad", "Scientific Observatories", "PistenBully Fleet"],
        "safe_anchorage": True,
        "anchorage_depth_m": 120.0,
        "vhf_channel": "16 / 72",
        "medical_level": "Tier 2 (Telemedicine & Emergency Surgical)",
        "fuel_support": "Polar Diesel",
        "description": "German station on Ekström Ice Shelf. Supply vessels moor directly to the sea ice edge in Atka Bay."
    },
    {
        "id": "halley6",
        "name": "Halley VI Research Station",
        "operator": "United Kingdom (BAS)",
        "lat": -75.5800,
        "lon": -26.2000,
        "sector": "Brunt Ice Shelf (Weddell Sea)",
        "type": "Relocatable Summer Station",
        "capacity_summer": 32,
        "capacity_winter": 0,
        "facilities": ["Skiway", "Atmospheric & Space Science Lab", "Mobile Hydraulic Modules"],
        "safe_anchorage": False,
        "anchorage_depth_m": 150.0,
        "vhf_channel": "16 / 68",
        "medical_level": "Tier 2 (First Response & Medevac Ready)",
        "fuel_support": "Polar Diesel (Avtur)",
        "description": "Station on the dynamic Brunt Ice Shelf, near active calving chasms (origin of Iceberg A-74 and A-81)."
    },
    {
        "id": "maitri",
        "name": "Maitri Station",
        "operator": "India (NCAOR)",
        "lat": -70.7670,
        "lon": 11.7330,
        "sector": "Queen Maud Land (Schirmacher Oasis)",
        "type": "Permanent Station",
        "capacity_summer": 65,
        "capacity_winter": 25,
        "facilities": ["Helipads", "Freshwater Lake Access (Priyadarshini)", "Medical Clinic", "Seismological Station"],
        "safe_anchorage": True,
        "anchorage_depth_m": 80.0,
        "vhf_channel": "16 / 6",
        "medical_level": "Tier 2 (Emergency Trauma Unit)",
        "fuel_support": "Special Polar Fuel",
        "description": "India's inland coastal staging base in Schirmacher Oasis, receiving sea logistics via India Bay (Princess Astrid Coast)."
    },
    {
        "id": "bharati",
        "name": "Bharati Station",
        "operator": "India (NCAOR)",
        "lat": -69.4070,
        "lon": 76.1900,
        "sector": "Prydz Bay / Larsemann Hills",
        "type": "Permanent Energy-Efficient Station",
        "capacity_summer": 47,
        "capacity_winter": 23,
        "facilities": ["Helipad", "Deep Water Approach in Thala Fjord", "Advanced Clean Lab", "Satellite Ground Station"],
        "safe_anchorage": True,
        "anchorage_depth_m": 42.0,
        "vhf_channel": "16 / 10",
        "medical_level": "Tier 2 (Telemedicine & Emergency Care)",
        "fuel_support": "MGO / Polar Diesel",
        "description": "State-of-the-art Indian station with direct maritime access in Prydz Bay, sheltered by Grovnes peninsula."
    },
    {
        "id": "casey",
        "name": "Casey Station",
        "operator": "Australia (AAD)",
        "lat": -66.2820,
        "lon": 110.5280,
        "sector": "East Antarctica (Wilkes Land)",
        "type": "Permanent Research Station",
        "capacity_summer": 110,
        "capacity_winter": 20,
        "facilities": ["Wilkins Aerodrome (Ice Runway 3200m)", "Barge Landing Ramp", "Helipads", "Tier 3 Hospital"],
        "safe_anchorage": True,
        "anchorage_depth_m": 25.0,
        "vhf_channel": "16 / 67",
        "medical_level": "Tier 3 (Surgical & Medevac Base)",
        "fuel_support": "SAB (Special Antarctic Blend)",
        "description": "Australian Antarctic Division primary air and maritime terminal with deep-water Newcomb Bay anchorage."
    },
    {
        "id": "dumont_durville",
        "name": "Dumont d'Urville Station",
        "operator": "France (IPEV)",
        "lat": -66.6630,
        "lon": 140.0010,
        "sector": "Adélie Land",
        "type": "Permanent Research Station",
        "capacity_summer": 80,
        "capacity_winter": 30,
        "facilities": ["Helipad", "Barge Landing Wharf", "Pétrel Island Protected Haven", "Medical Clinic"],
        "safe_anchorage": True,
        "anchorage_depth_m": 20.0,
        "vhf_channel": "16 / 12",
        "medical_level": "Tier 2 (Emergency Treatment)",
        "fuel_support": "Polar Diesel",
        "description": "French research station located on Petrel Island in the Archipel de Pointe Géologie, prone to coastal fast ice."
    },
    {
        "id": "deception_island",
        "name": "Deception Island (Whalers Bay)",
        "operator": "Natural Safe Haven / International",
        "lat": -62.9770,
        "lon": -60.5500,
        "sector": "South Shetland Islands",
        "type": "Volcanic Caldera Safe Haven",
        "capacity_summer": 0,
        "capacity_winter": 0,
        "facilities": ["Protected Natural Harbor (Port Foster)", "Historic Whaling Station Refuge Shelters"],
        "safe_anchorage": True,
        "anchorage_depth_m": 12.0,
        "vhf_channel": "16",
        "medical_level": "Emergency Unmanned Shelter",
        "fuel_support": "None",
        "description": "Sunken volcanic caldera entered through Neptune's Bellows; premier natural 360-degree storm shelter in Antarctica."
    }
]

def get_station_by_id(station_id: str):
    for s in ANTARCTIC_STATIONS:
        if s["id"] == station_id:
            return s
    return None

def find_nearest_stations(lat: float, lon: float, max_results: int = 4):
    """Calculate Great Circle distance to all Antarctic stations and sort by proximity."""
    import math
    
    def haversine_nm(lat1, lon1, lat2, lon2):
        R_nm = 3440.065 # Earth radius in Nautical Miles
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        
        a = math.sin(dphi/2.0)**2 + math.cos(phi1)*math.cos(phi2)*math.sin(dlambda/2.0)**2
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R_nm * c

    results = []
    for st in ANTARCTIC_STATIONS:
        dist = haversine_nm(lat, lon, st["lat"], st["lon"])
        bearing = (math.degrees(math.atan2(
            math.sin(math.radians(st["lon"] - lon)) * math.cos(math.radians(st["lat"])),
            math.cos(math.radians(lat)) * math.sin(math.radians(st["lat"])) -
            math.sin(math.radians(lat)) * math.cos(math.radians(st["lat"])) * math.cos(math.radians(st["lon"] - lon))
        )) + 360) % 360
        
        results.append({
            **st,
            "distance_nm": round(dist, 1),
            "bearing_deg": round(bearing, 1),
            "steaming_time_hrs_10kt": round(dist / 10.0, 1)
        })
        
    results.sort(key=lambda x: x["distance_nm"])
    return results[:max_results]
