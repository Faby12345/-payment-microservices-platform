#!/bin/zsh

ROOT="/Users/turlefabian/Desktop/payment-microservices-platform/backend"
SERVICES=("auth-service" "wallet-service" "transfer-service")

for service in "${SERVICES[@]}"; do
  pkill -f "$ROOT/$service/.*spring-boot:run" 2>/dev/null
  pkill -f "$ROOT/$service/.*mvnw" 2>/dev/null
done

osascript <<EOF
tell application "Terminal"
  set serviceTitles to {"auth-service", "wallet-service", "transfer-service", "ledger-service"}
  repeat with w in windows
    set shouldCloseWindow to false
    repeat with t in tabs of w
      if custom title of t is in serviceTitles then
        set shouldCloseWindow to true
      end if
    end repeat
    if shouldCloseWindow then
      close w
    end if
  end repeat
end tell
EOF

echo "Stopped backend services and closed their Terminal windows."
