from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict
import requests
import os
import logging
from model import detector

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("SecureChainFlow-FastAPI")

app = FastAPI(
    title="SecureChainFlow AI/ML Intelligence Microservice",
    description="Real-time Supply Chain Anomaly Detection & On-Chain Flagging Hook",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BACKEND_API_URL = os.getenv("BACKEND_API_URL", "http://127.0.0.1:5000")

class TelemetryPayload(BaseModel):
    productId: str
    temperature: float = Field(..., description="Current sensor temperature in Celsius")
    humidity: float = Field(..., description="Current humidity percentage")
    routeDeviationKm: float = Field(0.0, description="Deviation from planned route in kilometers")
    delayHours: float = Field(0.0, description="Transit delay in hours")
    thresholds: Optional[Dict] = Field(default=None, description="Custom sensor safe thresholds")
    autoFlagOnChain: bool = Field(default=True, description="Automatically trigger smart contract lock if anomaly detected")

class FlagRequest(BaseModel):
    productId: str
    reason: str

@app.get("/")
def root():
    return {
        "service": "SecureChainFlow AI Intelligence Microservice",
        "status": "online",
        "model_trained": detector.is_trained
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "FastAPI Anomaly Detection Engine"}

def trigger_onchain_flag(product_id: str, reason: str):
    """
    Automated Webhook: Calls Node.js Express backend to execute flagAnomalousProduct transaction
    """
    url = f"{BACKEND_API_URL}/api/product/flag"
    logger.info(f"Triggering automated on-chain lock for product {product_id} at {url}...")
    try:
        response = requests.post(url, json={"productId": product_id, "reason": reason}, timeout=5)
        if response.status_code == 200:
            logger.info(f"Successfully flagged product {product_id} on-chain! Tx response: {response.json()}")
        else:
            logger.warning(f"Backend flag endpoint returned status {response.status_code}: {response.text}")
    except Exception as e:
        logger.error(f"Failed to call backend flag endpoint: {str(e)}")

@app.post("/api/ai/analyze-sensor-stream")
def analyze_sensor_stream(payload: TelemetryPayload, background_tasks: BackgroundTasks):
    """
    Analyze real-time sensor streams and trigger on-chain contract lock if anomalies occur
    """
    try:
        analysis = detector.predict_telemetry(
            temperature=payload.temperature,
            humidity=payload.humidity,
            route_deviation=payload.routeDeviationKm,
            delay_hours=payload.delayHours,
            thresholds=payload.thresholds
        )

        flagged_on_chain = False
        reason_str = ""

        if analysis["is_anomaly"]:
            reason_str = " | ".join(analysis["reasons"])
            logger.warning(f"ANOMALY DETECTED for product {payload.productId}! Reasons: {reason_str}")

            if payload.autoFlagOnChain:
                background_tasks.add_task(trigger_onchain_flag, payload.productId, reason_str)
                flagged_on_chain = True

        return {
            "productId": payload.productId,
            "telemetry": {
                "temperature": payload.temperature,
                "humidity": payload.humidity,
                "routeDeviationKm": payload.routeDeviationKm,
                "delayHours": payload.delayHours
            },
            "analysis": analysis,
            "autoFlagTriggered": flagged_on_chain,
            "flagReason": reason_str
        }

    except Exception as e:
        logger.error(f"Error analyzing telemetry stream: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
