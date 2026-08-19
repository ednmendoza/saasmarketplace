"""Backend API tests for SaaS marketplace dashboard."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://app-showcase-426.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@marketplace.com"
ADMIN_PASSWORD = "admin123"


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api_client):
    r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    data = r.json()
    assert "token" in data and data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# --- Auth ---
class TestAuth:
    def test_login_success(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        d = r.json()
        assert d["user"]["email"] == ADMIN_EMAIL
        assert isinstance(d["token"], str) and len(d["token"]) > 20

    def test_login_wrong_password(self, api_client):
        r = api_client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_with_bearer(self, api_client, auth_headers):
        r = api_client.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL

    def test_me_without_token(self, api_client):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401


# --- Apps listing ---
class TestApps:
    def test_list_apps(self, api_client):
        r = api_client.get(f"{API}/apps")
        assert r.status_code == 200
        apps = r.json()
        assert isinstance(apps, list)
        assert len(apps) >= 16
        # ensure no _id leaked
        assert "_id" not in apps[0]
        assert "id" in apps[0] and "name" in apps[0] and "category" in apps[0]

    def test_stats(self, api_client):
        r = api_client.get(f"{API}/apps/stats")
        assert r.status_code == 200
        s = r.json()
        assert s["total_apps"] >= 16
        assert s["categories_count"] >= 7
        assert isinstance(s["avg_rating"], (int, float))
        assert "active_integrations" in s

    def test_search_filter(self, api_client):
        r = api_client.get(f"{API}/apps", params={"search": "slack"})
        assert r.status_code == 200
        names = [a["name"].lower() for a in r.json()]
        assert any("slack" in n for n in names)

    def test_category_filter(self, api_client):
        r = api_client.get(f"{API}/apps", params={"category": "DevOps"})
        assert r.status_code == 200
        for a in r.json():
            assert a["category"] == "DevOps"

    def test_get_app_by_id(self, api_client):
        listing = api_client.get(f"{API}/apps").json()
        app_id = listing[0]["id"]
        r = api_client.get(f"{API}/apps/{app_id}")
        assert r.status_code == 200
        assert r.json()["id"] == app_id

    def test_get_app_404(self, api_client):
        r = api_client.get(f"{API}/apps/nonexistent-id-xxx")
        assert r.status_code == 404


# --- Auth protection ---
class TestAuthProtection:
    def test_create_requires_auth(self):
        r = requests.post(f"{API}/apps", json={"name": "X", "category": "DevOps"})
        assert r.status_code == 401

    def test_update_requires_auth(self):
        r = requests.put(f"{API}/apps/anything", json={"name": "X", "category": "DevOps"})
        assert r.status_code == 401

    def test_delete_requires_auth(self):
        r = requests.delete(f"{API}/apps/anything")
        assert r.status_code == 401

    def test_autofill_requires_auth(self):
        r = requests.post(f"{API}/apps/ai-autofill", json={"query": "Slack"})
        assert r.status_code == 401


# --- CRUD ---
class TestCRUD:
    created_id = None

    def test_create_app(self, api_client, auth_headers):
        payload = {
            "name": "TEST_App_Pytest",
            "category": "DevOps",
            "tagline": "test",
            "description": "Just a test app",
            "rating": 4.2,
            "tags": ["Test"],
            "features": ["A", "B"],
            "compliance": ["SOC 2"],
        }
        r = api_client.post(f"{API}/apps", json=payload, headers=auth_headers)
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["name"] == payload["name"]
        assert d["slug"] == "test_app_pytest"
        assert "id" in d
        TestCRUD.created_id = d["id"]

        # verify persistence
        g = api_client.get(f"{API}/apps/{d['id']}")
        assert g.status_code == 200
        assert g.json()["name"] == payload["name"]

    def test_update_app(self, api_client, auth_headers):
        assert TestCRUD.created_id
        payload = {
            "name": "TEST_App_Pytest_Updated",
            "category": "Analytics",
            "description": "Updated",
        }
        r = api_client.put(f"{API}/apps/{TestCRUD.created_id}", json=payload, headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["name"] == payload["name"]
        assert r.json()["category"] == "Analytics"

        g = api_client.get(f"{API}/apps/{TestCRUD.created_id}").json()
        assert g["category"] == "Analytics"

    def test_delete_app(self, api_client, auth_headers):
        assert TestCRUD.created_id
        r = api_client.delete(f"{API}/apps/{TestCRUD.created_id}", headers=auth_headers)
        assert r.status_code == 200
        g = api_client.get(f"{API}/apps/{TestCRUD.created_id}")
        assert g.status_code == 404


# --- AI autofill (real LLM call) ---
class TestAIAutofill:
    def test_autofill_airtable(self, api_client, auth_headers):
        r = api_client.post(f"{API}/apps/ai-autofill", json={"query": "Airtable"}, headers=auth_headers, timeout=60)
        assert r.status_code == 200, r.text
        d = r.json()
        for k in ["name", "category", "description", "features", "tags"]:
            assert k in d, f"missing {k}"
        assert isinstance(d["features"], list) and len(d["features"]) >= 1
        assert "airtable" in d["name"].lower()
