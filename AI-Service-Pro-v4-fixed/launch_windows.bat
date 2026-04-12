@echo off
cd /d %~dp0
where py >nul 2>nul
if %errorlevel% neq 0 (
  echo Python Launcher 'py' introuvable. Installe Python 64-bit puis relance.
  exit /b 1
)
if not exist .venv (
  py -3.14 -m venv .venv
)
call .venv\Scripts\activate.bat
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
if not exist .env copy .env.example .env
uvicorn app.main:app --host 0.0.0.0 --port 8010 --reload
