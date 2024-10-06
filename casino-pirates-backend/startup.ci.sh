#!/usr/bin/env bash
set -e

/opt/wait-for-it.sh apiDB:5432
npm run migration:run
npm run seed:run
npm run start:prod > /dev/null 2>&1 &
/opt/wait-for-it.sh 127.0.0.1:$APP_PORT
npm run test:e2e -- --runInBand
