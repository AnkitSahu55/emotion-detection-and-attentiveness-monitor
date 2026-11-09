@echo off
echo ================================
echo  Emotion Monitor - Backend Setup
echo ================================

cd /d "%~dp0"

:: Check if venv exists
if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

:: Activate venv
call venv\Scripts\activate.bat

:: Install / upgrade deps
echo Installing dependencies...
pip install -r requirements.txt --quiet

echo.
echo Starting server on ws://localhost:8765
echo Press Ctrl+C to stop.
echo.

uvicorn main:app --host 0.0.0.0 --port 8765 --reload
