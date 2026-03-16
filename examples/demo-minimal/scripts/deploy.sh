#!/usr/bin/env bash
set -euo pipefail

ACCOUNT_ID="<account.near>"
NETWORK="mainnet"
CONTRACT_ID="social.near"
COMPONENT_FILE="src/demo-minimal.jsx"
COMPONENT_NAME="demo-minimal"
PAYLOAD_FILE=".deploy/demo-minimal.mainnet.payload.json"

if [ "<account.near>" = "<account.near>" ]; then
  echo "Set ACCOUNT_ID in scripts/deploy.sh before running" >&2
  exit 1
fi

if [ ! -f "$COMPONENT_FILE" ]; then
  echo "Component source not found: $COMPONENT_FILE" >&2
  exit 1
fi

mkdir -p .deploy
node ./scripts/generate-payload.mjs "$COMPONENT_FILE" "$ACCOUNT_ID" "$COMPONENT_NAME" "$PAYLOAD_FILE"

near call "$CONTRACT_ID" set \
  --accountId "$ACCOUNT_ID" \
  --networkId "$NETWORK" \
  --gas 300000000000000 \
  --deposit 0.01 \
  --argsFile "$PAYLOAD_FILE"

echo "Deployed: $ACCOUNT_ID/widget/$COMPONENT_NAME"
