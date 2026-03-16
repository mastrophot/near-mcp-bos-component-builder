$ErrorActionPreference = "Stop"

$AccountId = "<account.near>"
$Network = "mainnet"
$ContractId = "social.near"
$ComponentFile = "src/demo-token-swap.jsx"
$ComponentName = "demo-token-swap"
$PayloadFile = ".deploy/demo-token-swap.mainnet.payload.json"

if ($AccountId -eq "<account.near>") {
  throw "Set ACCOUNT_ID in scripts/deploy.ps1 before running"
}

if (!(Test-Path $ComponentFile)) {
  throw "Component source not found: $ComponentFile"
}

New-Item -ItemType Directory -Force -Path ".deploy" | Out-Null
node ./scripts/generate-payload.mjs $ComponentFile $AccountId $ComponentName $PayloadFile

near call $ContractId set --accountId $AccountId --networkId $Network --gas 300000000000000 --deposit 0.01 --argsFile $PayloadFile

Write-Host "Deployed: $AccountId/widget/$ComponentName"
