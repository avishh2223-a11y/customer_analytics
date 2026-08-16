import tempfile
import unittest
from pathlib import Path

from src.adaptive.platform import AdaptivePlatform


class AdaptivePlatformTests(unittest.TestCase):
    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.platform = AdaptivePlatform(Path(self.temp_dir.name))
        self.project = self.platform.create_project("Generic retention analysis")

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_profiles_and_trains_on_a_non_telco_schema(self):
        rows = ["member_ref,engagement_events,annual_spend,contract_tier,outcome"]
        for index in range(30):
            outcome = "lost" if index % 3 == 0 else "active"
            rows.append(f"MEM-{index:03d},{index % 9},{100 + index * 7},{'flex' if index % 2 else 'annual'},{outcome}")
        dataset = self.platform.upload_dataset(self.project["id"], "generic_members.csv", "\n".join(rows).encode("utf-8"))
        profile = dataset["profile"]
        self.assertEqual(profile["rowCount"], 30)
        self.assertEqual(profile["identifierCandidates"][0]["column"], "member_ref")
        self.assertTrue(any(candidate["column"] == "outcome" for candidate in profile["targetCandidates"]))

        confirmed = self.platform.confirm_target(self.project["id"], dataset["id"], "outcome")
        self.assertEqual(confirmed["problemType"], "binary_classification")
        model = self.platform.train(self.project["id"], dataset["id"])
        self.assertIsNotNone(model["productionThreshold"])

        prediction = self.platform.predict(self.project["id"], dataset["id"], "MEM-004", model["id"])
        self.assertIn(prediction["predictedClass"], {"active", "lost"})
        self.assertEqual(prediction["threshold"], model["productionThreshold"])

        local_explanation = self.platform.explain(self.project["id"], dataset["id"], "MEM-004", model["id"])
        global_explanation = self.platform.explain(self.project["id"], dataset["id"], model_id=model["id"])
        self.assertGreater(len(local_explanation["contributions"]), 0)
        self.assertGreater(len(global_explanation["features"]), 0)

        recommendation = self.platform.recommend(self.project["id"], dataset["id"], "MEM-004", model["id"])
        self.assertIn("production threshold", recommendation["recommendation"]["reason"])
        self.assertIn("engagement", recommendation["recommendation"]["reason"])
        self.assertGreaterEqual(len(self.platform.list_records(self.project["id"], "explanations", dataset["id"])), 2)
        self.assertEqual(len(self.platform.list_records(self.project["id"], "recommendations", dataset["id"])), 1)

        audit = self.platform.audit(self.project["id"], dataset["id"], model["id"])
        self.assertEqual(audit["status"], "pass")

    def test_supports_a_second_regression_dataset_shape(self):
        rows = ["record_reference,days_since_visit,account_value,support_tickets,renewal_value"]
        for index in range(32):
            rows.append(f"REF-{index:03d},{index % 11},{500 + index * 19},{index % 4},{120 + index * 2.75}")
        dataset = self.platform.upload_dataset(self.project["id"], "value_forecast.csv", "\n".join(rows).encode("utf-8"))
        confirmed = self.platform.confirm_target(self.project["id"], dataset["id"], "renewal_value")
        self.assertEqual(confirmed["problemType"], "regression")
        model = self.platform.train(self.project["id"], dataset["id"])
        self.assertIsNone(model["productionThreshold"])
        prediction = self.platform.predict(self.project["id"], dataset["id"], "REF-006", model["id"])
        self.assertIsInstance(prediction["prediction"], float)
        self.assertIsNone(prediction["threshold"])


if __name__ == "__main__":
    unittest.main()
