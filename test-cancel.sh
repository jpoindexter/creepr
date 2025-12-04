#!/bin/bash

# Start a long crawl
echo "Starting crawl..."
SESSION_ID=$(curl -s -X POST http://localhost:3500/api/crawl \
  -H "Content-Type: application/json" \
  -d '{"url":"http://example.com","maxDepth":10,"maxPages":500}' \
  | jq -r '.sessionId')

echo "Session ID: $SESSION_ID"
echo "Waiting 0.5 seconds..."
sleep 0.5

# Try to cancel
echo "Attempting to cancel..."
RESULT=$(curl -s -X DELETE http://localhost:3500/api/crawl/$SESSION_ID)
echo "Cancel result: $RESULT"

# Check progress
echo "Checking final progress..."
sleep 1
curl -s http://localhost:3500/api/crawl/$SESSION_ID/progress | jq
