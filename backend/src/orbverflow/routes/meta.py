from fastapi import APIRouter
from orbverflow.app_state import prov_registry

router = APIRouter(prefix="/meta", tags=["meta"])


@router.get("/dataset")
def get_dataset_meta():
    meta = prov_registry.get_dataset()
    if not meta:
        # should not happen after Issue-10 default, but keep safe fallback
        return {"ok": True, "has_dataset": False, "dataset": None}

    # Issue-10: flatten fields for UI, and keep legacy "dataset" key too
    return {
        "ok": True,
        "has_dataset": True,
        **meta,
        "dataset": meta,
    }
