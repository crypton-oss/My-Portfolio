@echo off
cd /d "%~dp0"
powershell -Command "Start-Process -WindowStyle Hidden -FilePath python -ArgumentList 'main.py' -PassThru | Select-Object -ExpandProperty Id > bot.pid"
echo Bot ishga tushdi (PID: %errorlevel%).
echo To'xtatish uchun: stop.bat
