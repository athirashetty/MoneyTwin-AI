from app.api.v1.endpoints.health import health_check
from app.core.config import settings
from app.main import root


def test_health_check_payload():
    result = health_check()
    assert result["status"] == "online"
    assert result["service"] == settings.PROJECT_NAME
    assert result["version"] == settings.VERSION
    assert "timestamp" in result
    assert result["features"]["financial_twin"] == "active"


def test_root_payload():
    result = root()
    assert "MoneyTwin" in result["message"]
    assert result["health"] == "/api/health"
    assert result["docs"] == "/docs"
