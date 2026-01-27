from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from orbverflow.app_state import playbook_engine, playbook_store

router = APIRouter()

class ApprovalReq(BaseModel):
    operator: str

@router.post("/playbooks/{playbook_id}/approve")
def approve_playbook(playbook_id: str, req: ApprovalReq):
    try:
        pb = playbook_engine.approve(playbook_id)
    except ValueError:
        raise HTTPException(404, "Playbook not found")

    return {
        "ok": True,
        "playbook_id": pb.id,
        "state": pb.state,
        "operator": req.operator
    }
