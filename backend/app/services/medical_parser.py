import re
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

class MedicalParser:
    """
    Parses raw extracted medical report text into structured JSON.
    Uses flexible multi-pattern matching to handle various real-world lab report formats.
    """

    # Each key maps to a list of regex patterns to try in order
    PATTERNS = {
        "hemoglobin": [
            r"h(?:a?e?moglobin|gb)\s*[:\-]?\s*(\d+\.?\d*)\s*(g[/\s]?d[Ll]?)?",
            r"hgb\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "glucose_fasting": [
            r"f(?:asting)?\s*(?:blood\s*)?(?:glucose|sugar|bs|bsl)\s*[:\-]?\s*(\d+\.?\d*)\s*(mg[/\s]?d[Ll]?)?",
            r"fbs\s*[:\-]?\s*(\d+\.?\d*)",
            r"blood\s*glucose\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "total_cholesterol": [
            r"t(?:otal)?\s*chol(?:esterol)?\s*[:\-]?\s*(\d+\.?\d*)\s*(mg[/\s]?d[Ll]?)?",
            r"cholesterol\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "hba1c": [
            r"hb[a-z]?1c\s*[:\-]?\s*(\d+\.?\d*)\s*(%)?",
            r"glycated\s*hemo\w*\s*[:\-]?\s*(\d+\.?\d*)",
            r"glycosylated\s*\w*\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "vitamin_d": [
            r"(?:25-?oh[-\s]?)?vitamin\s*d(?:\s*total)?\s*[:\-]?\s*(\d+\.?\d*)\s*(ng[/\s]?m[Ll]?)?",
            r"vit(?:amin)?\s*d\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "hdl_cholesterol": [
            r"hdl(?:\s*-?\s*c(?:holesterol)?)?\s*[:\-]?\s*(\d+\.?\d*)\s*(mg[/\s]?d[Ll]?)?",
            r"high\s*density\s*\w*\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "ldl_cholesterol": [
            r"ldl(?:\s*-?\s*c(?:holesterol)?)?\s*[:\-]?\s*(\d+\.?\d*)\s*(mg[/\s]?d[Ll]?)?",
            r"low\s*density\s*\w*\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "triglycerides": [
            r"trig(?:lycerides?)?\s*[:\-]?\s*(\d+\.?\d*)\s*(mg[/\s]?d[Ll]?)?",
            r"tg\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "wbc": [
            r"(?:total\s*)?(?:wbc|white\s*blood\s*(?:cell|count))\s*[:\-]?\s*(\d+\.?\d*)\s*(?:x10[³3]?[/\s]?[μu][Ll]?|cells[/\s]?[μu][Ll]?)?",
            r"leukocytes?\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "rbc": [
            r"(?:total\s*)?(?:rbc|red\s*blood\s*(?:cell|count))\s*[:\-]?\s*(\d+\.?\d*)",
            r"erythrocytes?\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "platelets": [
            r"(?:platelet|plt)(?:\s*count)?\s*[:\-]?\s*(\d+\.?\d*)",
            r"thrombocytes?\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "creatinine": [
            r"creatinine\s*[:\-]?\s*(\d+\.?\d*)\s*(mg[/\s]?d[Ll]?)?",
            r"creat\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "urea": [
            r"(?:blood\s*)?urea(?:\s*nitrogen)?\s*[:\-]?\s*(\d+\.?\d*)\s*(mg[/\s]?d[Ll]?)?",
            r"\bbun\b\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "uric_acid": [
            r"uric\s*acid\s*[:\-]?\s*(\d+\.?\d*)\s*(mg[/\s]?d[Ll]?)?",
        ],
        "sgpt_alt": [
            r"(?:sgpt|alt)(?:\s*/\s*(?:alt|sgpt))?\s*[:\-]?\s*(\d+\.?\d*)\s*(?:u/l|iu/l|u/l)?",
            r"alanine\s*(?:amino)?trans\w*\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "sgot_ast": [
            r"(?:sgot|ast)(?:\s*/\s*(?:ast|sgot))?\s*[:\-]?\s*(\d+\.?\d*)\s*(?:u/l|iu/l)?",
            r"aspartate\s*(?:amino)?trans\w*\s*[:\-]?\s*(\d+\.?\d*)",
        ],
        "tsh": [
            r"tsh\s*[:\-]?\s*(\d+\.?\d*)\s*(m?[iμu]u[/\s]?m[Ll]|[uμ]iu[/\s]?m[Ll])?",
            r"thyroid\s*stimul\w+\s*[:\-]?\s*(\d+\.?\d*)",
        ],
    }

    # Units lookup for display
    UNITS = {
        "hemoglobin": "g/dL", "glucose_fasting": "mg/dL", "total_cholesterol": "mg/dL",
        "hba1c": "%", "vitamin_d": "ng/mL", "hdl_cholesterol": "mg/dL",
        "ldl_cholesterol": "mg/dL", "triglycerides": "mg/dL", "wbc": "×10³/μL",
        "rbc": "×10⁶/μL", "platelets": "×10³/μL", "creatinine": "mg/dL",
        "urea": "mg/dL", "uric_acid": "mg/dL", "sgpt_alt": "U/L",
        "sgot_ast": "U/L", "tsh": "μIU/mL",
    }

    @staticmethod
    def parse_text(text: str) -> Dict[str, Any]:
        results = {}
        for marker_key, patterns in MedicalParser.PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
                if match:
                    value_str = match.group(1)
                    try:
                        value = float(value_str)
                        # Sanity check: skip obviously wrong values
                        if value <= 0 or value > 100000:
                            continue
                        status = MedicalParser._determine_status(marker_key, value)
                        unit = MedicalParser.UNITS.get(marker_key, "")
                        results[marker_key] = {
                            "value": value,
                            "unit": unit,
                            "status": status,
                            "display_name": marker_key.replace("_", " ").title()
                        }
                        break  # Stop after first successful pattern
                    except (ValueError, IndexError):
                        continue
        return results

    @staticmethod
    def _determine_status(marker: str, value: float) -> str:
        ranges = {
            "hemoglobin":        lambda v: "low" if v < 12.0 else ("high" if v > 17.5 else "normal"),
            "glucose_fasting":   lambda v: "low" if v < 70 else ("normal" if v <= 99 else ("borderline" if v <= 125 else "high")),
            "total_cholesterol": lambda v: "normal" if v < 200 else ("borderline" if v <= 239 else "high"),
            "hba1c":             lambda v: "normal" if v < 5.7 else ("borderline" if v <= 6.4 else "high"),
            "vitamin_d":         lambda v: "low" if v < 20 else ("borderline" if v <= 30 else ("normal" if v <= 50 else "high")),
            "hdl_cholesterol":   lambda v: "low" if v < 40 else ("normal" if v <= 60 else "high"),
            "ldl_cholesterol":   lambda v: "normal" if v < 100 else ("borderline" if v <= 159 else "high"),
            "triglycerides":     lambda v: "normal" if v < 150 else ("borderline" if v <= 199 else "high"),
            "wbc":               lambda v: "low" if v < 4.0 else ("high" if v > 11.0 else "normal"),
            "rbc":               lambda v: "low" if v < 4.0 else ("high" if v > 6.0 else "normal"),
            "platelets":         lambda v: "low" if v < 150 else ("high" if v > 400 else "normal"),
            "creatinine":        lambda v: "normal" if v <= 1.2 else "high",
            "urea":              lambda v: "normal" if v <= 45 else "high",
            "uric_acid":         lambda v: "normal" if v <= 7.0 else "high",
            "sgpt_alt":          lambda v: "normal" if v <= 40 else "high",
            "sgot_ast":          lambda v: "normal" if v <= 40 else "high",
            "tsh":               lambda v: "low" if v < 0.4 else ("high" if v > 4.0 else "normal"),
        }
        fn = ranges.get(marker)
        return fn(value) if fn else "unknown"
