from model import detector

def test_model():
    print("Testing SecureChainFlow Isolation Forest AI Model...")

    # Test 1: Normal telemetry
    normal_res = detector.predict_telemetry(
        temperature=3.5,
        humidity=45.0,
        route_deviation=0.5,
        delay_hours=0.2,
        thresholds={"minTemp": -20, "maxTemp": 5, "maxHumidity": 80, "maxRouteDeviation": 15}
    )
    print("\nNormal Telemetry Result:")
    print("Is Anomaly:", normal_res["is_anomaly"])
    print("Risk Level:", normal_res["risk_level"])

    # Test 2: Temperature Spike Breach
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
    print("Risk Level:", temp_spike_res["risk_level"])

    # Test 3: Severe Route Deviation Anomaly
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
    print("Risk Level:", route_dev_res["risk_level"])

if __name__ == "__main__":
    test_model()
