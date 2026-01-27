from typing import List, Dict
from pydantic import BaseModel
import time

class SafetyImpact(BaseModel):
    fuel: str
    attitude: str
    thermal: str
    power_pct: int
    mission: str
    risk_level: str

class Playbook(BaseModel):
    id: str
    name: str
    incident_id: str
    actions: List[str]
    safety_impact: SafetyImpact
    command_snippets: List[str]
    state: str  # PROPOSED / APPROVED / EXECUTED
    created_at: float
