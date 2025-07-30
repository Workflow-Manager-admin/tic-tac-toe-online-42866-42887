#!/bin/bash
cd /home/kavia/workspace/code-generation/tic-tac-toe-online-42866-42887/frontend_react_js
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

