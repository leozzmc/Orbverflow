from typing import Dict, Any

# sat_id -> latest mission summary
MISSION_SUMMARIES: Dict[str, Dict[str, Any]] = {}


def update_summary(sat_id: str, summary: Dict[str, Any]) -> None:
    # store a shallow copy to avoid accidental external mutation
    MISSION_SUMMARIES[sat_id] = dict(summary)


def get_all_summaries() -> Dict[str, Dict[str, Any]]:
    # return a shallow copy
    return dict(MISSION_SUMMARIES)
