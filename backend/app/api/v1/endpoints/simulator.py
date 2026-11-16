from fastapi import APIRouter
from app.schemas.simulator import SimulationScenario, SimulationResponse
from app.services.profile_store import profile_store
from app.services.simulator_engine import run_digital_twin_simulation

router = APIRouter()


@router.post("/run", response_model=SimulationResponse, summary="Run Digital Twin What-If Simulation")
def run_simulation(scenario: SimulationScenario):
    """
    Executes a scenario simulation against the current digital twin profile.
    The original financial profile is NEVER modified.
    Returns side-by-side metrics and 1, 3, 5-year projections.
    """
    current_profile = profile_store.get_profile()
    return run_digital_twin_simulation(profile=current_profile, scenario=scenario)
