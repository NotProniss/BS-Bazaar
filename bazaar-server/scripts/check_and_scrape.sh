#!/bin/sh

# Script to check if 25 hours have passed since last scrape and run it if needed

LAST_RUN_FILE="/app/data/last_scrape_time"
CURRENT_TIME=$(date +%s)
TWENTY_FIVE_HOURS=90000  # 25 hours in seconds (25 * 60 * 60)

# Check if last run file exists
if [ -f "$LAST_RUN_FILE" ]; then
    LAST_RUN_TIME=$(cat "$LAST_RUN_FILE")
    TIME_DIFF=$((CURRENT_TIME - LAST_RUN_TIME))
    
    # Check if 25 hours have passed
    if [ $TIME_DIFF -ge $TWENTY_FIVE_HOURS ]; then
        echo "[$(date)] 25+ hours have passed since last scrape. Running scrape now..."
        cd /app/scripts
        python3 scrape.py
        # Update last run time
        echo "$CURRENT_TIME" > "$LAST_RUN_FILE"
        echo "[$(date)] Scrape completed and timestamp updated."
    else
        HOURS_REMAINING=$(((TWENTY_FIVE_HOURS - TIME_DIFF) / 3600))
        echo "[$(date)] Only $((TIME_DIFF / 3600)) hours since last scrape. $HOURS_REMAINING hours remaining until next run."
    fi
else
    # First run - create the file and run scrape
    echo "[$(date)] First run detected. Running initial scrape..."
    cd /app/scripts
    python3 scrape.py
    echo "$CURRENT_TIME" > "$LAST_RUN_FILE"
    echo "[$(date)] Initial scrape completed and timestamp created."
fi
