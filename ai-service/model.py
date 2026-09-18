import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SecureChainFlow-AI")

class AnomalyDetector:
    def __init__(self):
        self.model = IsolationForest(contamination=0.1, random_state=42)
        self.is_trained = False
        self._train_initial_model()

    def _train_initial_model(self):
        """
        Train Isolation Forest model on baseline synthetic supply chain sensor data.
        Features: [temperature, humidity, route_deviation_km, transit_delay_hrs]
        """
        np.random.seed(42)
        
        # Generate 500 normal supply chain telemetry readings
        normal_temp = np.random.normal(loc=2.0, scale=1.5, size=450) # Cold chain 2C average
        normal_humidity = np.random.normal(loc=50.0, scale=5.0, size=450)
        normal_route_dev = np.random.exponential(scale=1.0, size=450) # minimal deviation
        normal_delay = np.random.exponential(scale=0.5, size=450)

        # Generate 50 anomalous readings (temperature spikes, extreme route deviation, severe delays)
        anomalous_temp = np.random.uniform(low=12.0, high=35.0, size=50)
        anomalous_humidity = np.random.uniform(low=85.0, high=99.0, size=50)
        anomalous_route_dev = np.random.uniform(low=25.0, high=150.0, size=50)
        anomalous_delay = np.random.uniform(low=10.0, high=72.0, size=50)

        temps = np.concatenate([normal_temp, anomalous_temp])
        humidities = np.concatenate([normal_humidity, anomalous_humidity])
        route_devs = np.concatenate([normal_route_dev, anomalous_route_dev])
        delays = np.concatenate([normal_delay, anomalous_delay])

        df = pd.DataFrame({
            'temperature': temps,
            'humidity': humidities,
            'route_deviation': route_devs,
            'delay_hours': delays
        })

        self.model.fit(df)
        self.is_trained = True
        logger.info("Isolation Forest model initialized & trained successfully on 500 telemetry records!")

    def predict_telemetry(self, temperature: float, humidity: float, route_deviation: float, delay_hours: float, thresholds: dict = None):
        """
        Predict if telemetry reading is anomalous using model + threshold limits.
        """
        features = np.array([[temperature, humidity, route_deviation, delay_hours]])
        
        # Isolation Forest prediction: 1 for inlier (normal), -1 for outlier (anomaly)
        ml_prediction = self.model.predict(features)[0]
        anomaly_score = float(self.model.score_samples(features)[0])

        reasons = []

        # Strict Threshold Validator
        if thresholds:
            min_temp = thresholds.get('minTemp', -20)
            max_temp = thresholds.get('maxTemp', 5)
            max_humidity = thresholds.get('maxHumidity', 80)
            max_route_dev = thresholds.get('maxRouteDeviation', 15)

            if temperature < min_temp:
                reasons.append(f"Temperature freezing breach: {temperature}°C < min threshold {min_temp}°C")
            elif temperature > max_temp:
                reasons.append(f"Cold-chain temperature breach: {temperature}°C > max threshold {max_temp}°C")

            if humidity > max_humidity:
                reasons.append(f"Humidity threshold breach: {humidity}% > max {max_humidity}%")

            if route_deviation > max_route_dev:
                reasons.append(f"Route deviation breach: {route_deviation}km > max {max_route_dev}km")
        
        is_anomaly = (ml_prediction == -1) or (len(reasons) > 0)

        if ml_prediction == -1 and len(reasons) == 0:
            reasons.append(f"Statistical anomaly detected by Isolation Forest (score: {anomaly_score:.3f})")

        return {
            "is_anomaly": is_anomaly,
            "ml_anomaly_score": anomaly_score,
            "isolation_forest_decision": "ANOMALY" if ml_prediction == -1 else "NORMAL",
            "reasons": reasons,
            "risk_level": "HIGH" if is_anomaly else "LOW"
        }

# Global Instance
detector = AnomalyDetector()
