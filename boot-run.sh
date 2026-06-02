#!/bin/zsh
ROOT="/Users/turlefabian/Desktop/payment-microservices-platform/backend"

open_service() {
  local name="$1"
  osascript <<EOF
tell application "Terminal"
  activate
  do script "printf '\\\\e]0;$name\\\\a'; cd '$ROOT/$name' || exit 1; ./mvnw spring-boot:run; echo; echo '$name stopped. Press Ctrl+D or close this window when done.'; exec zsh"
end tell
EOF
  sleep 1
}

open_service "auth-service"
open_service "wallet-service"
open_service "transfer-service"
open_service "ledger-service"
# open_service "api-gateway"
