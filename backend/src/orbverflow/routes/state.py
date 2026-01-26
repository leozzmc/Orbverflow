from fastapi import APIRouter, Query
from orbverflow.app_state import store

router = APIRouter(prefix="/state", tags=["state"])


@router.get("/latest")
async def get_latest_all():
    print(f"[state/latest] store id = {id(store)}")
    latest = await store.latest_all()
    return {
        "ok": True,
        "count": len(latest),
        "latest": {k: v.model_dump() for k, v in latest.items()},
    }


@router.get("/sat/{sat_id}")
async def get_recent_sat(sat_id: str, minutes: int = Query(5, ge=1, le=60)):
    records = await store.recent_sat(sat_id, minutes=minutes)
    return {
        "ok": True,
        "sat_id": sat_id,
        "minutes": minutes,
        "count": len(records),
        "records": [r.model_dump() for r in records],
    }
    
