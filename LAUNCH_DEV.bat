@echo off
title DonutProfit Dev Server
cd /d "%~dp0"
echo ========================================================
echo   Starting DonutProfit (DonutFortune + Donut Stake UI)
echo ========================================================
echo.
call npm.cmd run dev
pause
