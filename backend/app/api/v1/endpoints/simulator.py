from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.simulator import SimulationScenario, SimulationResponse
from app.services.profile_store import profile_store
from app.services.simulator_engine import run_digital_twin_simulation

router = APIRouter()


@router.post("/run", response_model=SimulationResponse, summary="Run Digital Twin What-If Simulation")
def run_simulation(
    scenario: SimulationScenario,
    db: Session = Depends(get_db),
):
    """
    Executes a scenario simulation against the current digital twin profile loaded from the database.
    The original financial profile is NEVER modified.
    Returns side-by-side metrics and 1, 3, 5-year projections.
    """
    current_profile = profile_store.get_profile(db=db)
    return run_digital_twin_simulation(profile=current_profile, scenario=scenario)
