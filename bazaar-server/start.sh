#!/bin/sh

# Start the cron daemon in the background
echo "Starting cron daemon..."
crond -b

# Create log directory if it doesn't exist
mkdir -p /var/log/cron

# Run the check script once to handle initial setup
echo "Running initial scrape check..."
/app/scripts/check_and_scrape.sh

# Start the Node.js server
echo "Starting Node.js server..."
cd /app && node server.js
