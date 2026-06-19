@echo off
cd /d "%~dp0"
if exist bot.pid (
    set /p PID=<bot.pid
    taskkill /f /pid %PID% >nul 2>&1
    del bot.pid
    echo Bot (PID: %PID%) to'xtatildi.
) else (
    echo bot.pid topilmadi. Bot allaqachon to'xtagan bo'lishi mumkin.
)
