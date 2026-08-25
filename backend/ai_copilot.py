"""
AI-Enabled Polar Navigation Decision Support Copilot
Expert Polar Ice Pilot, Conning Advisor, and IMO Polar Code Decision Engine.
Integrates live vessel telemetry, iceberg drift physics, POLARIS RIO outcomes, and Antarctic station logistics.
"""

from typing import Dict, List, Any
from stations_data import find_nearest_stations, ANTARCTIC_STATIONS
from polaris_engine import PolarisEvaluator, POLAR_VESSEL_PROFILES
from iceberg_tracker import IcebergRegistry

# Polar Maritime Knowledge Base & Standard Operating Procedures (SOPs)
POLAR_SOPS = {
    "BESET_IN_ICE": {
        "title": "Emergency Procedure: Vessel Beset / Trapped in Ice Under Pressure",
        "steps": [
            "1. Inform Bridge Team and Chief Engineer immediately. Do not attempt continuous high-power backing without assessing rudder/propeller clearance.",
            "2. Fill heeling tanks alternately (if equipped with active anti-heeling system) to rock vessel hull and break static friction adhesion.",
            "3. Trim vessel by the stern slightly to submerge propeller blades beneath solid ice sheet level.",
            "4. Maintain watch on ice drift direction. If drift carries vessel toward shallows or ice shelf grounding zones, broadcast Pan-Pan or Mayday on VHF Ch 16.",
            "5. Contact nearest Icebreaker asset or MRCC Ushuaia / MRCC Punta Arenas / Maritime NZ.",
            "6. Keep main engine cooling sea chests clear using steam blowback to prevent slush ice clogging (frazil ice blockage)."
        ],
        "polar_code_ref": "IMO Polar Code Part I-A Chapter 11 (Voyage Planning & Besetment Mitigation)"
    },
    "CONNING_IN_PACK": {
        "title": "Tactical Conning Tactics in Broken Pack Ice & Leads",
        "steps": [
            "1. Always enter ice at minimum steerage speed (< 4 kts) at right angles (90 deg) to the ice edge to avoid shearing the bow.",
            "2. Utilize navigable leads and polynyas detected by SAR C-band radar; avoid entering blind leads with blind termini.",
            "3. When navigating between floes, use rudder gently. Never turn hard against a heavy floe as this swings the vulnerable stern and propeller into the ice.",
            "4. When ramming ridges: back off 1-2 ship lengths, accelerate to 6-8 kts, ride up onto the ice using bow incline, and immediately reduce pitch as the ship comes to rest to avoid getting wedged.",
            "5. Maintain continuous lookout for growlers and bergy bits that cannot be seen on radar in high sea states."
        ],
        "polar_code_ref": "IMO Polar Code Part I-B Guidance / WMO Sea Ice Nomenclature"
    }
}

class PolarAICopilot:
    """AI Polar Ice Pilot reasoning engine."""

    @classmethod
    def get_tactical_advice(
        cls,
        user_message: str,
        vessel_lat: float = -65.5,
        vessel_lon: float = -64.2,
        polar_class: str = "PC4",
        vessel_speed_kts: float = 11.2,
        ice_concentration_pct: float = 45.0,
        ice_thickness_m: float = 0.9
    ) -> Dict[str, Any]:
        """
        Processes user query in the context of current telemetry, ice conditions,
        POLARIS evaluation, and nearest safe havens.
        """
        query = user_message.lower().strip()
        nearest_stations = find_nearest_stations(vessel_lat, vessel_lon, max_results=3)
        nearest = nearest_stations[0] if nearest_stations else None

        # POLARIS calculation for context
        regime = PolarisEvaluator.estimate_ice_regime_from_sic_and_thickness(ice_concentration_pct, ice_thickness_m)
        polaris_eval = PolarisEvaluator.evaluate_rio(polar_class, regime)

        # Categorize query intent
        response_text = ""
        action_items = []
        severity = "INFO"
        category = "GENERAL_ADVISORY"

        if "beset" in query or "trapped" in query or "pressure" in query or "stuck" in query:
            sop = POLAR_SOPS["BESET_IN_ICE"]
            category = "EMERGENCY_BESETMENT"
            severity = "CRITICAL"
            response_text = f"**CRITICAL TACTICAL DIRECTIVE: BESETMENT MITIGATION**\n\nYour vessel ({polar_class}) is in ice concentration of {ice_concentration_pct}% with {ice_thickness_m}m thickness (Current POLARIS RIO: {polaris_eval['rio']}).\n\n**Immediate Standard Operating Procedures:**\n" + "\n".join(sop["steps"])
            if nearest:
                response_text += f"\n\n**Nearest Emergency Haven:** {nearest['name']} ({nearest['distance_nm']} NM, Bearing {nearest['bearing_deg']}°). Medical: {nearest['medical_level']}. VHF Ch {nearest['vhf_channel']}."
            action_items = [
                "Activate hull anti-heeling rocking tanks",
                "Verify propeller clearance before astern propulsion",
                "Monitor frazil ice in sea suction strainers",
                f"Prepare emergency comms with {nearest['name'] if nearest else 'MRCC'}"
            ]

        elif "safe haven" in query or "nearest station" in query or "shelter" in query or "port" in query or "harbor" in query:
            category = "SAFE_HAVEN_ROUTING"
            severity = "ADVISORY"
            response_text = f"**NEAREST ANTARCTIC SAFE HAVENS & EMERGENCY BASES**\n\nPosition: {abs(vessel_lat):.2f}°S, {abs(vessel_lon):.2f}°W\n\n"
            for st in nearest_stations:
                anchorage_note = f"Safe Anchorage: Yes (Depth {st['anchorage_depth_m']}m)" if st['safe_anchorage'] else "Anchorage: Unsafe / Active Anchor Watch"
                response_text += f"🏛️ **{st['name']}** ({st['operator']})\n- Distance: **{st['distance_nm']} NM** | Bearing: **{st['bearing_deg']}°** | Est. Steaming: **{st['steaming_time_hrs_10kt']} hrs** @ 10kt\n- Sector: {st['sector']} | Facilities: {', '.join(st['facilities'][:3])}\n- Medical: **{st['medical_level']}** | VHF: **Ch {st['vhf_channel']}**\n- {anchorage_note}\n\n"
            action_items = [
                f"Establish VHF radio contact on {nearest['vhf_channel'] if nearest else 'Ch 16'}",
                f"Steer course {nearest['bearing_deg']}° toward {nearest['name'] if nearest else 'Haven'}",
                "Check harbor bathymetry against vessel draft"
            ]

        elif "polaris" in query or "rio" in query or "risk" in query or "polar code" in query:
            category = "POLARIS_COMPLIANCE"
            severity = "WARNING" if polaris_eval["rio"] < 0 else "INFO"
            response_text = f"**IMO POLAR CODE POLARIS EVALUATION (MSC.1/Circ.1519)**\n\n- **Vessel Class:** {polar_class} ({POLAR_VESSEL_PROFILES.get(polar_class, {}).get('name', 'Ice-Classed')})\n- **Evaluated Ice Regime:** {ice_concentration_pct}% Concentration, {ice_thickness_m}m Thickness\n- **Calculated RIO Score:** **{polaris_eval['rio']}**\n- **Operational Status:** **{polaris_eval['status']}** ({polaris_eval['status_description']})\n- **Recommended Conning Speed:** **{polaris_eval['recommended_speed_limit_kts']} kts**\n- **Hull Stress Threshold:** {polaris_eval['hull_stress_risk']}\n- **Escort Requirement:** {'MANDATORY ICEBREAKER ESCORT' if polaris_eval['escort_required'] else 'Independent Navigation Authorized'}"
            action_items = [
                f"Cap maximum conning speed at {polaris_eval['recommended_speed_limit_kts']} kts",
                "Log POLARIS RIO evaluation into Polar Water Operational Manual (PWOM)",
                "Engage forward-looking sonar / searchlights"
            ]

        elif "iceberg" in query or "a-23a" in query or "collision" in query or "radar" in query:
            category = "ICEBERG_TACTICS"
            severity = "WARNING"
            response_text = f"**ICEBERG DRIFT & COLLISION AVOIDANCE ADVISORY**\n\n- **Hydrodynamic Drift Dynamics:** Icebergs drift under a balance of wind drag ($C_a \\approx 1.35$), deep keel water drag ($C_w \\approx 0.90$), and Coriolis force ($f = 2\\Omega\\sin\\phi$), deflecting left of the wind in the Southern Hemisphere.\n- **Stealth Radar Hazard:** Bergy bits and growlers have waterline freeboards < 1m, making them undetectable in sea clutter > Sea State 4. Use both S-band (10cm) for precipitation penetration and X-band (3cm) for surface detail.\n- **Mega-Iceberg A-23a Note:** Area 3,800 sq km, drifting northeast at ~1.45 kts. Stay at least 12-15 NM clear of its southern wake due to continuous calving of high-mass tabular fragments."
            action_items = [
                "Maintain 3-mile visual and radar guard zones",
                "Adjust radar anti-clutter sea (STC) filter manually",
                "Station double ice lookouts on monkey island / flying bridge"
            ]

        elif "conning" in query or "lead" in query or "technique" in query or "ramming" in query:
            sop = POLAR_SOPS["CONNING_IN_PACK"]
            category = "CONNING_TECHNIQUE"
            severity = "INFO"
            response_text = f"**TACTICAL CONNING & LEAD NAVIGATION GUIDE**\n\n" + "\n".join(sop["steps"])
            action_items = [
                "Steer along radar-identified thermal leads",
                "Avoid sharp helm movements in pack ice",
                "Maintain backing path clearance"
            ]

        else:
            # General Polar Pilot Intelligent Response
            category = "GENERAL_ADVISORY"
            severity = "INFO"
            response_text = f"**POLAR DECISION SUPPORT OFFICER (AI ICE PILOT)**\n\nI am monitoring your vessel ({polar_class}) at **{abs(vessel_lat):.2f}°S, {abs(vessel_lon):.2f}°W** steaming at **{vessel_speed_kts} kts** in **{ice_concentration_pct}% ice ({ice_thickness_m}m thickness)**.\n\n- **Current POLARIS RIO:** **{polaris_eval['rio']}** ({polaris_eval['status']})\n- **Recommended Conning Speed Limit:** **{polaris_eval['recommended_speed_limit_kts']} kts**\n- **Nearest Base:** **{nearest['name']}** ({nearest['distance_nm']} NM, Bearing {nearest['bearing_deg']}°)\n\nYou can ask me for:\n1. Emergency besetment & ice pressure breakout SOPs\n2. Nearest safe haven harbors with medical Tier ratings\n3. POLARIS RIO evaluations and Polar Code speed caps\n4. Iceberg A-23a drift trajectory analysis\n5. SAR satellite lead detection & tactical conning advice"
            action_items = [
                "Continuous monitoring of ice concentration telemetry",
                "Check radar Plan Position Indicator (PPI) for stealth growlers"
            ]

        return {
            "query": user_message,
            "category": category,
            "severity": severity,
            "response": response_text,
            "action_items": action_items,
            "telemetry_context": {
                "vessel_lat": vessel_lat,
                "vessel_lon": vessel_lon,
                "polar_class": polar_class,
                "speed_kts": vessel_speed_kts,
                "ice_concentration_pct": ice_concentration_pct,
                "ice_thickness_m": ice_thickness_m,
                "rio": polaris_eval["rio"],
                "polaris_status": polaris_eval["status"],
                "nearest_station": nearest["name"] if nearest else None,
                "nearest_distance_nm": nearest["distance_nm"] if nearest else None
            }
        }
