from model import detector


def assert_all(condition, message):
    if not condition:
        raise AssertionError(message)


def test_model():
    print("Testing SecureChainFlow Isolation Forest AI Model...")

    normal_res = detector.predict_telemetry(
        temperature=3.5,
        humidity=45.0,
        route_deviation=0.5,
        delay_hours=0.2,
        thresholds={"minTemp": -20, "maxTemp": 5, "maxHumidity": 80, "maxRouteDeviation": 15}
    )
    print("\nNormal Telemetry Result:")
    print("Is Anomaly:", normal_res["is_anomaly"])
    print("Risk Score:", normal_res["risk_score"])
    print("Risk Level:", normal_res["risk_level"])
    assert_all(normal_res["is_anomaly"] is False, "Normal telemetry should not be flagged")
    assert_all(0 <= normal_res["risk_score"] <= 100, "Risk score must be in [0,100]")
    assert_all(normal_res["risk_score"] < 35, "Normal telemetry should remain low risk")

    temp_spike_res = detector.predict_telemetry(
        temperature=14.8,
        humidity=50.0,
        route_deviation=2.0,
        delay_hours=1.0,
        thresholds={"minTemp": -20, "maxTemp": 5, "maxHumidity": 80, "maxRouteDeviation": 15}
    )
    print("\nTemperature Spike Result:")
    print("Is Anomaly:", temp_spike_res["is_anomaly"])
    print("Reasons:", temp_spike_res["reasons"])
    print("Risk Score:", temp_spike_res["risk_score"])
    print("Risk Level:", temp_spike_res["risk_level"])
    assert_all(temp_spike_res["is_anomaly"] is True, "Temperature threshold breach must trigger anomaly")
    assert_all(temp_spike_res["risk_score"] >= 60, "Temperature breach should produce high risk score")

    route_dev_res = detector.predict_telemetry(
        temperature=2.0,
        humidity=55.0,
        route_deviation=85.0,
        delay_hours=12.0,
        thresholds={"minTemp": -20, "maxTemp": 5, "maxHumidity": 80, "maxRouteDeviation": 15}
    )
    print("\nSevere Route Deviation Result:")
    print("Is Anomaly:", route_dev_res["is_anomaly"])
    print("Reasons:", route_dev_res["reasons"])
    print("Risk Score:", route_dev_res["risk_score"])
    print("Risk Level:", route_dev_res["risk_level"])
    assert_all(route_dev_res["is_anomaly"] is True, "Route deviation breach must trigger anomaly")
    assert_all(route_dev_res["risk_score"] >= 80, "Severe route deviation should score critical risk")


if __name__ == "__main__":
    test_model()
    print("\nAI model verification passed.")
