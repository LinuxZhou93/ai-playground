#!/bin/bash
cd "$(dirname "$0")"
# Resize terminal window to look like an app
printf '\e[8;40;60t'
python3 src/terminal_app.py
