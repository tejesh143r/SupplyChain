@echo off
echo ======================================================================
echo    SecureChainFlow: Blockchain & AI Supply Chain Platform Startup
echo ======================================================================
echo.

echo Starting Smart Contract Local Hardhat Node...
start "SecureChainFlow - Hardhat Node" cmd /k "cd /d %~dp0smart-contract && npm run node"

timeout /t 5

echo Deploying Smart Contract to Local Node...
start "SecureChainFlow - Contract Deployer" cmd /k "cd /d %~dp0smart-contract && npm run deploy:local"

timeout /t 3

echo Starting Node.js Express Backend API (Port 5000)...
start "SecureChainFlow - Express Backend" cmd /k "cd /d %~dp0backend && npm start"

echo Starting Python FastAPI AI Intelligence Microservice (Port 8000)...
start "SecureChainFlow - FastAPI AI Microservice" cmd /k "cd /d %~dp0ai-service && python main.py"

echo Starting React Vite Frontend Dashboard (Port 3000)...
start "SecureChainFlow - React Web Dashboard" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo All SecureChainFlow microservices launched!
echo - Frontend Dashboard: http://localhost:3000
echo - Backend Express API: http://localhost:5000
echo - Python FastAPI AI:  http://localhost:8000
echo ======================================================================
