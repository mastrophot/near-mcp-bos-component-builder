# demo-token-swap

Template: token-swap-widget

Widget path: `<account.near>/widget/demo-token-swap`

## Files
- `src/demo-token-swap.jsx`: BOS component source
- `bos.config.json`: scaffold metadata
- `scripts/generate-payload.mjs`: NEAR Social payload builder
- `scripts/deploy.sh` / `scripts/deploy.ps1`: deployment automation

## Deploy (bash)
```bash
# 1) set real account in scripts/deploy.sh
# 2) login once
near login

# 3) deploy
./scripts/deploy.sh
```

## Deploy (PowerShell)
```powershell
# 1) set real account in scripts/deploy.ps1
near login
./scripts/deploy.ps1
```
