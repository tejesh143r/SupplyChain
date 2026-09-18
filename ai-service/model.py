import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SecureChainFlow-AI")

DEFAULT_THRESHOLDS = {
    'minTemp': -20,
    'maxTemp': 5,
    'maxHumidity': 80,
    'maxRouteDeviation': 15,
    'maxDelayHours': 12,
}


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

        normal_temp = np.random.normal(loc=2.0, scale=1.5, size=450)
        normal_humidity = np.random.normal(loc=50.0, scale=5.0, size=450)
        normal_route_dev = np.random.exponential(scale=1.0, size=450)
        normal_delay = np.random.exponential(scale=0.5, size=450)

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

    def _score_risk(self, temperature, humidity, route_deviation, delay_hours, thresholds=None):
        risk_score = 0
        thresholds = {**DEFAULT_THRESHOLDS, **(thresholds or {})}

        min_temp = thresholds['minTemp']
        max_temp = thresholds['maxTemp']
        max_humidity = thresholds['maxHumidity']
        max_route_dev = thresholds['maxRouteDeviation']
        max_delay_hours = thresholds['maxDelayHours']

        if temperature < min_temp:
            risk_score += max(50, min(70, abs(temperature - min_temp) * 8))
        elif temperature > max_temp:
            risk_score += max(60, min(90, (temperature - max_temp) * 9))

        if humidity > max_humidity:
            risk_score += max(30, min(60, (humidity - max_humidity) * 2))

        if route_deviation > max_route_dev:
            risk_score += max(60, min(90, (route_deviation - max_route_dev) * 1.4))

        if delay_hours > max_delay_hours:
            risk_score += max(35, min(55, (delay_hours - max_delay_hours) * 5))

        if temperature < 0:
            risk_score += 10
        if humidity > 85:
            risk_score += 8
        if route_deviation > 30:
            risk_score += 12
        if delay_hours > 6:
            risk_score += 10

        risk_score = min(100, max(0, int(round(risk_score))))
        return risk_score

    def predict_telemetry(self, temperature: float, humidity: float, route_deviation: float, delay_hours: float, thresholds: dict = None):
        """
        Predict if telemetry reading is anomalous and return an operational risk score in [0,100].
        """
        features = pd.DataFrame([
            {
                'temperature': temperature,
                'humidity': humidity,
                'route_deviation': route_deviation,
                'delay_hours': delay_hours,
            }
        ])

        ml_prediction = self.model.predict(features)[0]
        anomaly_score = float(self.model.score_samples(features)[0])
        reasons = []
        thresholds = {**DEFAULT_THRESHOLDS, **(thresholds or {})}

        min_temp = thresholds['minTemp']
        max_temp = thresholds['maxTemp']
        max_humidity = thresholds['maxHumidity']
        max_route_dev = thresholds['maxRouteDeviation']
        max_delay_hours = thresholds['maxDelayHours']

        if temperature < min_temp:
            reasons.append(f"Temperature freezing breach: {temperature}°C < min threshold {min_temp}°C")
        elif temperature > max_temp:
            reasons.append(f"Cold-chain temperature breach: {temperature}°C > max threshold {max_temp}°C")

        if humidity > max_humidity:
            reasons.append(f"Humidity threshold breach: {humidity}% > max {max_humidity}%")

        if route_deviation > max_route_dev:
            reasons.append(f"Route deviation breach: {route_deviation}km > max {max_route_dev}km")

        if delay_hours > max_delay_hours:
            reasons.append(f"Transit delay breach: {delay_hours}h > max {max_delay_hours}h")

        if ml_prediction == -1 and not reasons:
            reasons.append(f"Statistical anomaly detected by Isolation Forest (score: {anomaly_score:.3f})")

        risk_score = self._score_risk(temperature, humidity, route_deviation, delay_hours, thresholds)

        if ml_prediction == -1:
            risk_score = max(risk_score, 70)
        if reasons:
            risk_score = max(risk_score, min(100, 60 + len(reasons) * 18))

        is_anomaly = bool((ml_prediction == -1) or bool(reasons))

        if risk_score >= 80:
            risk_level = "CRITICAL"
        elif risk_score >= 60:
            risk_level = "HIGH"
        elif risk_score >= 30:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        return {
            "is_anomaly": is_anomaly,
            "ml_anomaly_score": anomaly_score,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "isolation_forest_decision": "ANOMALY" if ml_prediction == -1 else "NORMAL",
            "reasons": reasons,
        }


# Global Instance
detector = AnomalyDetector()
