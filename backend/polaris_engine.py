"""
IMO Polar Code POLARIS Engine (MSC.1/Circ.1519)
Polar Operational Limit Assessment Risk Indexing System

Calculates:
1. Risk Index Values (RIV) across Polar Classes (PC1 to PC7) and Finnish-Swedish Ice Classes (1A Super to 1C)
2. Risk Index Outcome (RIO): RIO = Sum(C_i * RIV_i)
3. Operational Status:
   - RIO >= 0: Authorized (Normal Operation)
   - -10 <= RIO < 0: Elevated Risk (Special Measures / Speed Limitations)
   - RIO < -10: Operation Prohibited
4. Safe speed recommendations based on ice type and hull strength.
"""

from typing import Dict, List, Any

# POLARIS Standard Risk Index Values Table (Normal / Non-decayed Ice)
# Key: Ice Type -> {Polar Class: RIV}
POLARIS_RIV_TABLE: Dict[str, Dict[str, int]] = {
    "open_water": {
        "PC1": 3, "PC2": 3, "PC3": 3, "PC4": 3, "PC5": 3, "PC6": 3, "PC7": 3, "1AS": 3, "1A": 3, "1B": 3, "1C": 3, "NON_ICE": 3
    },
    "bergy_water": {
        "PC1": 2, "PC2": 2, "PC3": 2, "PC4": 2, "PC5": 2, "PC6": 2, "PC7": 1, "1AS": 1, "1A": 0, "1B": -1, "1C": -2, "NON_ICE": -4
    },
    "grey_ice": {  # 10 - 15 cm
        "PC1": 3, "PC2": 3, "PC3": 3, "PC4": 3, "PC5": 3, "PC6": 3, "PC7": 2, "1AS": 2, "1A": 2, "1B": 1, "1C": 1, "NON_ICE": -1
    },
    "grey_white_ice": {  # 15 - 30 cm
        "PC1": 3, "PC2": 3, "PC3": 3, "PC4": 3, "PC5": 3, "PC6": 2, "PC7": 2, "1AS": 2, "1A": 1, "1B": 0, "1C": -1, "NON_ICE": -3
    },
    "thin_first_year_stage1": {  # 30 - 50 cm
        "PC1": 3, "PC2": 3, "PC3": 3, "PC4": 2, "PC5": 2, "PC6": 1, "PC7": 1, "1AS": 1, "1A": 0, "1B": -2, "1C": -3, "NON_ICE": -5
    },
    "thin_first_year_stage2": {  # 50 - 70 cm
        "PC1": 3, "PC2": 3, "PC3": 2, "PC4": 2, "PC5": 1, "PC6": 0, "PC7": 0, "1AS": 0, "1A": -1, "1B": -3, "1C": -5, "NON_ICE": -7
    },
    "medium_first_year": {  # 70 - 120 cm
        "PC1": 3, "PC2": 2, "PC3": 2, "PC4": 1, "PC5": 0, "PC6": -1, "PC7": -2, "1AS": -2, "1A": -3, "1B": -5, "1C": -7, "NON_ICE": -8
    },
    "thick_first_year": {  # > 120 cm
        "PC1": 2, "PC2": 2, "PC3": 1, "PC4": 0, "PC5": -1, "PC6": -2, "PC7": -3, "1AS": -4, "1A": -5, "1B": -7, "1C": -8, "NON_ICE": -10
    },
    "second_year_ice": {  # Old ice, ~ 2m
        "PC1": 2, "PC2": 1, "PC3": 0, "PC4": -1, "PC5": -2, "PC6": -3, "PC7": -4, "1AS": -5, "1A": -7, "1B": -8, "1C": -10, "NON_ICE": -10
    },
    "multi_year_ice": {  # Thick old floes, > 2.5m, heavy ridges
        "PC1": 2, "PC2": 1, "PC3": -1, "PC4": -2, "PC5": -3, "PC6": -4, "PC7": -5, "1AS": -7, "1A": -8, "1B": -10, "1C": -10, "NON_ICE": -10
    },
    "glacial_ice_growler": {  # Growlers / Bergy bits
        "PC1": 1, "PC2": 0, "PC3": -1, "PC4": -2, "PC5": -3, "PC6": -4, "PC7": -5, "1AS": -6, "1A": -8, "1B": -10, "1C": -10, "NON_ICE": -10
    }
}

POLAR_VESSEL_PROFILES: Dict[str, Dict[str, Any]] = {
    "PC1": {
        "name": "Heavy Polar Research Icebreaker",
        "description": "Year-round operation in all polar waters",
        "max_speed_ow_kts": 16.0,
        "ice_breaking_cap_m": 3.0,
        "beam_m": 25.0,
        "draft_m": 11.0,
        "length_m": 140.0,
        "installed_power_mw": 24.0,
        "example_vessel": "RV Polarstern II / Arktika class"
    },
    "PC2": {
        "name": "Medium Polar Icebreaker",
        "description": "Year-round operation in moderate multi-year ice",
        "max_speed_ow_kts": 15.0,
        "ice_breaking_cap_m": 2.2,
        "beam_m": 24.0,
        "draft_m": 9.5,
        "length_m": 128.0,
        "installed_power_mw": 18.0,
        "example_vessel": "RRS Sir David Attenborough"
    },
    "PC4": {
        "name": "Heavy Antarctic Expedition Vessel",
        "description": "Year-round operation in thick first-year ice",
        "max_speed_ow_kts": 15.5,
        "ice_breaking_cap_m": 1.5,
        "beam_m": 21.0,
        "draft_m": 8.0,
        "length_m": 120.0,
        "installed_power_mw": 14.0,
        "example_vessel": "SA Agulhas II / Kronprins Haakon"
    },
    "PC6": {
        "name": "Light Antarctic Research Vessel",
        "description": "Summer/autumn operation in medium first-year ice",
        "max_speed_ow_kts": 14.0,
        "ice_breaking_cap_m": 0.8,
        "beam_m": 18.0,
        "draft_m": 6.5,
        "length_m": 90.0,
        "installed_power_mw": 7.5,
        "example_vessel": "RV Laurence M. Gould / Hesperides"
    },
    "PC7": {
        "name": "Antarctic Cruise / Cargo Vessel",
        "description": "Summer/autumn operation in thin first-year ice",
        "max_speed_ow_kts": 14.0,
        "ice_breaking_cap_m": 0.5,
        "beam_m": 19.0,
        "draft_m": 6.0,
        "length_m": 105.0,
        "installed_power_mw": 6.0,
        "example_vessel": "Scenic Eclipse / Fram"
    },
    "1AS": {
        "name": "Baltic 1A Super Ice-Strengthened Ship",
        "description": "Extreme Baltic conditions / light polar summer ice",
        "max_speed_ow_kts": 14.5,
        "ice_breaking_cap_m": 0.6,
        "beam_m": 20.0,
        "draft_m": 7.0,
        "length_m": 110.0,
        "installed_power_mw": 6.5,
        "example_vessel": "Antarctic supply supply freighter"
    },
    "NON_ICE": {
        "name": "Open Water Non-Strengthened Vessel",
        "description": "No ice strengthening (Open Water only)",
        "max_speed_ow_kts": 13.0,
        "ice_breaking_cap_m": 0.0,
        "beam_m": 16.0,
        "draft_m": 5.5,
        "length_m": 85.0,
        "installed_power_mw": 4.0,
        "example_vessel": "Standard merchant/fishery vessel"
    }
}


class PolarisEvaluator:
    """Evaluates POLARIS RIO and generates operational recommendations."""

    @staticmethod
    def evaluate_rio(
        polar_class: str,
        ice_regime: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        ice_regime is a list of dicts:
        [
            {"ice_type": "medium_first_year", "concentration_tenths": 4},
            {"ice_type": "thin_first_year_stage2", "concentration_tenths": 3},
            {"ice_type": "open_water", "concentration_tenths": 3}
        ]
        Sum of concentration_tenths must equal 10.
        """
        p_class = polar_class.upper()
        if p_class not in POLAR_VESSEL_PROFILES:
            p_class = "PC4"  # Default fallback

        rio_total = 0
        breakdown = []
        total_tenths = 0

        for comp in ice_regime:
            itype = comp.get("ice_type", "open_water")
            tenths = int(comp.get("concentration_tenths", 0))
            total_tenths += tenths

            riv_table_entry = POLARIS_RIV_TABLE.get(itype, POLARIS_RIV_TABLE["open_water"])
            riv_val = riv_table_entry.get(p_class, -5)
            contrib = tenths * riv_val
            rio_total += contrib

            breakdown.append({
                "ice_type": itype,
                "concentration_tenths": tenths,
                "riv": riv_val,
                "rio_contribution": contrib
            })

        # Operational status interpretation
        if rio_total >= 0:
            status = "AUTHORIZED"
            status_color = "#10b981"  # Emerald green
            status_desc = "Normal operation permitted. Safe ice regime for vessel polar class."
            speed_limit_kts = POLAR_VESSEL_PROFILES[p_class]["max_speed_ow_kts"]
            if rio_total < 5:
                speed_limit_kts = min(speed_limit_kts, 11.0)
            escort_required = False
            hull_stress_risk = "Low (< 35% Yield Strength)"
        elif -10 <= rio_total < 0:
            status = "ELEVATED_RISK"
            status_color = "#f59e0b"  # Amber
            status_desc = "Operation requires special risk mitigation, severe speed reductions, or icebreaker escort."
            speed_limit_kts = max(3.0, min(7.0, POLAR_VESSEL_PROFILES[p_class]["max_speed_ow_kts"] * 0.45))
            escort_required = True
            hull_stress_risk = "Moderate (50-80% Yield Strength) - Watch for ice jamming"
        else:
            status = "PROHIBITED"
            status_color = "#ef4444"  # Red
            status_desc = "Operation not permitted under IMO Polar Code. Structural damage or besetting imminent."
            speed_limit_kts = 0.0
            escort_required = True
            hull_stress_risk = "Critical (> 95% Yield Strength) - Risk of hull breach/pinching"

        return {
            "polar_class": p_class,
            "vessel_profile": POLAR_VESSEL_PROFILES.get(p_class),
            "rio": rio_total,
            "status": status,
            "status_color": status_color,
            "status_description": status_desc,
            "recommended_speed_limit_kts": round(speed_limit_kts, 1),
            "escort_required": escort_required,
            "hull_stress_risk": hull_stress_risk,
            "regime_breakdown": breakdown
        }

    @staticmethod
    def estimate_ice_regime_from_sic_and_thickness(
        sic_pct: float,
        thickness_m: float
    ) -> List[Dict[str, Any]]:
        """
        Converts bulk Sea Ice Concentration (%) and Sea Ice Thickness (m) into POLARIS ice tenths.
        """
        ice_tenths = int(round(sic_pct / 10.0))
        ice_tenths = max(0, min(10, ice_tenths))
        water_tenths = 10 - ice_tenths

        if ice_tenths == 0:
            return [{"ice_type": "open_water", "concentration_tenths": 10}]

        # Determine ice type from thickness
        if thickness_m < 0.15:
            ice_type = "grey_ice"
        elif thickness_m < 0.30:
            ice_type = "grey_white_ice"
        elif thickness_m < 0.50:
            ice_type = "thin_first_year_stage1"
        elif thickness_m < 0.70:
            ice_type = "thin_first_year_stage2"
        elif thickness_m < 1.20:
            ice_type = "medium_first_year"
        elif thickness_m < 2.00:
            ice_type = "thick_first_year"
        elif thickness_m < 2.50:
            ice_type = "second_year_ice"
        else:
            ice_type = "multi_year_ice"

        regime = []
        if ice_tenths > 0:
            regime.append({"ice_type": ice_type, "concentration_tenths": ice_tenths})
        if water_tenths > 0:
            regime.append({"ice_type": "open_water", "concentration_tenths": water_tenths})

        return regime
