@echo off
title Bauzeitenplan
cd /d "%~dp0"
echo.
echo  Bauzeitenplan se pokrece... otvori u browseru:  http://127.0.0.1:5050
echo  (zatvori ovaj prozor da ugasis aplikaciju)
echo.
start "" http://127.0.0.1:5050
python app.py
pause
