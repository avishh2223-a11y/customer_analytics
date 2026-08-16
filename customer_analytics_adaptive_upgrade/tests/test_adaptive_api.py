import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient

from src.api.adaptive import platform
from src.api.main import app


class AdaptiveApiTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.client = TestClient(app)
        self.original_root = platform.root
        platform.root = Path(self.temp_dir.name)
        platform.root.mkdir(parents=True, exist_ok=True)

    def tearDown(self):
        platform.root = self.original_root
        self.temp_dir.cleanup()

    def test_generic_dataset_api_flow(self):
        created = self.client.post("/api/adaptive/projects", json={"name": "Adaptive API test"})
        self.assertEqual(created.status_code, 200)
        project_id = created.json()["id"]

        rows = ["account_reference,activity_score,annual_value,renewal_plan,outcome"]
        for index in range(30):
            rows.append(f"ACCT-{index:03d},{index % 8},{200 + index * 11},{'monthly' if index % 2 else 'annual'},{'departed' if index % 3 == 0 else 'active'}")
        uploaded = self.client.post(f"/api/adaptive/projects/{project_id}/datasets", files={"file": ("generic.csv", "\n".join(rows), "text/csv")})
        self.assertEqual(uploaded.status_code, 200)
        dataset_id = uploaded.json()["id"]

        confirmed = self.client.post(f"/api/adaptive/projects/{project_id}/datasets/{dataset_id}/target", json={"targetColumn": "outcome"})
        self.assertEqual(confirmed.status_code, 200)
        trained = self.client.post(f"/api/adaptive/projects/{project_id}/datasets/{dataset_id}/train")
        self.assertEqual(trained.status_code, 200)

        predicted = self.client.post(f"/api/adaptive/projects/{project_id}/datasets/{dataset_id}/predict", json={"customerKey": "ACCT-004"})
        self.assertEqual(predicted.status_code, 200)
        self.assertIn(predicted.json()["predictedClass"], {"active", "departed"})
        self.assertEqual(predicted.json()["threshold"], trained.json()["productionThreshold"])

        audited = self.client.post(f"/api/adaptive/projects/{project_id}/datasets/{dataset_id}/audit")
        self.assertEqual(audited.status_code, 200)
        self.assertEqual(audited.json()["status"], "pass")

        persisted_explanations = self.client.get(f"/api/adaptive/projects/{project_id}/datasets/{dataset_id}/explanations")
        persisted_recommendations = self.client.get(f"/api/adaptive/projects/{project_id}/datasets/{dataset_id}/recommendations")
        self.assertEqual(persisted_explanations.status_code, 200)
        self.assertEqual(persisted_recommendations.status_code, 200)


if __name__ == "__main__":
    unittest.main()
