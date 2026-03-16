import fs from "node:fs";
import path from "node:path";

import { TemplateName, renderTemplate } from "./templates.js";
import { assertComponentName, assertNearAccountId } from "./validation.js";

export interface ScaffoldParams {
  outputDir: string;
  componentName: string;
  template: TemplateName;
  accountId?: string;
  description?: string;
}

export interface ScaffoldResult {
  root: string;
  files: string[];
  componentPath: string;
  deployScriptPath: string;
  deployPowerShellPath: string;
  widgetId: string;
}

function writeFileSafe(filePath: string, content: string): void {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, "utf8");
}

export function scaffoldBosComponent(params: ScaffoldParams): ScaffoldResult {
  const componentName = assertComponentName(params.componentName);
  const accountId = params.accountId ? assertNearAccountId(params.accountId, "account_id") : "<account.near>";

  const root = path.resolve(params.outputDir, componentName);
  const srcDir = path.join(root, "src");
  const scriptsDir = path.join(root, "scripts");
  const deployDir = path.join(root, ".deploy");

  fs.mkdirSync(srcDir, { recursive: true });
  fs.mkdirSync(scriptsDir, { recursive: true });
  fs.mkdirSync(deployDir, { recursive: true });

  const componentCode = renderTemplate(params.template, componentName, params.description);
  const componentPath = path.join(srcDir, `${componentName}.jsx`);
  writeFileSafe(componentPath, componentCode);

  const widgetId = `${accountId}/widget/${componentName}`;
  const configPath = path.join(root, "bos.config.json");
  writeFileSafe(
    configPath,
    JSON.stringify(
      {
        componentName,
        template: params.template,
        widgetId,
        description: params.description ?? "Generated BOS component"
      },
      null,
      2
    )
  );

  const payloadGeneratorPath = path.join(scriptsDir, "generate-payload.mjs");
  writeFileSafe(
    payloadGeneratorPath,
    [
      "import fs from \"node:fs\";",
      "",
      "const [sourceFile, accountId, componentName, outFile] = process.argv.slice(2);",
      "",
      "if (!sourceFile || !accountId || !componentName || !outFile) {",
      "  console.error(\"Usage: node generate-payload.mjs <source-file> <account-id> <component-name> <output-json>\");",
      "  process.exit(1);",
      "}",
      "",
      "const source = fs.readFileSync(sourceFile, \"utf8\");",
      "const widgetKey = accountId + \"/widget/\" + componentName;",
      "const payload = { data: { [widgetKey]: source } };",
      "fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), \"utf8\");",
      "console.log(\"payload written to \" + outFile);",
      ""
    ].join("\n")
  );

  const deployScriptPath = path.join(scriptsDir, "deploy.sh");
  writeFileSafe(
    deployScriptPath,
    [
      "#!/usr/bin/env bash",
      "set -euo pipefail",
      "",
      `ACCOUNT_ID=\"${accountId}\"`,
      "NETWORK=\"mainnet\"",
      "CONTRACT_ID=\"social.near\"",
      `COMPONENT_FILE=\"src/${componentName}.jsx\"`,
      `COMPONENT_NAME=\"${componentName}\"`,
      `PAYLOAD_FILE=\".deploy/${componentName}.mainnet.payload.json\"`,
      "",
      `if [ \"${accountId}\" = \"<account.near>\" ]; then`,
      "  echo \"Set ACCOUNT_ID in scripts/deploy.sh before running\" >&2",
      "  exit 1",
      "fi",
      "",
      "if [ ! -f \"$COMPONENT_FILE\" ]; then",
      "  echo \"Component source not found: $COMPONENT_FILE\" >&2",
      "  exit 1",
      "fi",
      "",
      "mkdir -p .deploy",
      "node ./scripts/generate-payload.mjs \"$COMPONENT_FILE\" \"$ACCOUNT_ID\" \"$COMPONENT_NAME\" \"$PAYLOAD_FILE\"",
      "",
      "near call \"$CONTRACT_ID\" set \\",
      "  --accountId \"$ACCOUNT_ID\" \\",
      "  --networkId \"$NETWORK\" \\",
      "  --gas 300000000000000 \\",
      "  --deposit 0.01 \\",
      "  --argsFile \"$PAYLOAD_FILE\"",
      "",
      "echo \"Deployed: $ACCOUNT_ID/widget/$COMPONENT_NAME\"",
      ""
    ].join("\n")
  );
  fs.chmodSync(deployScriptPath, 0o755);

  const deployPowerShellPath = path.join(scriptsDir, "deploy.ps1");
  writeFileSafe(
    deployPowerShellPath,
    [
      "$ErrorActionPreference = \"Stop\"",
      "",
      `$AccountId = \"${accountId}\"`,
      "$Network = \"mainnet\"",
      "$ContractId = \"social.near\"",
      `$ComponentFile = \"src/${componentName}.jsx\"`,
      `$ComponentName = \"${componentName}\"`,
      `$PayloadFile = \".deploy/${componentName}.mainnet.payload.json\"`,
      "",
      "if ($AccountId -eq \"<account.near>\") {",
      "  throw \"Set ACCOUNT_ID in scripts/deploy.ps1 before running\"",
      "}",
      "",
      "if (!(Test-Path $ComponentFile)) {",
      "  throw \"Component source not found: $ComponentFile\"",
      "}",
      "",
      "New-Item -ItemType Directory -Force -Path \".deploy\" | Out-Null",
      "node ./scripts/generate-payload.mjs $ComponentFile $AccountId $ComponentName $PayloadFile",
      "",
      "near call $ContractId set --accountId $AccountId --networkId $Network --gas 300000000000000 --deposit 0.01 --argsFile $PayloadFile",
      "",
      "Write-Host \"Deployed: $AccountId/widget/$ComponentName\"",
      ""
    ].join("\n")
  );

  const readmePath = path.join(root, "README.md");
  writeFileSafe(
    readmePath,
    [
      `# ${componentName}`,
      "",
      `Template: ${params.template}`,
      "",
      `Widget path: \`${widgetId}\``,
      "",
      "## Files",
      `- \`src/${componentName}.jsx\`: BOS component source`,
      "- `bos.config.json`: scaffold metadata",
      "- `scripts/generate-payload.mjs`: NEAR Social payload builder",
      "- `scripts/deploy.sh` / `scripts/deploy.ps1`: deployment automation",
      "",
      "## Deploy (bash)",
      "```bash",
      "# 1) set real account in scripts/deploy.sh",
      "# 2) login once",
      "near login",
      "",
      "# 3) deploy",
      "./scripts/deploy.sh",
      "```",
      "",
      "## Deploy (PowerShell)",
      "```powershell",
      "# 1) set real account in scripts/deploy.ps1",
      "near login",
      "./scripts/deploy.ps1",
      "```",
      ""
    ].join("\n")
  );

  const rootGitIgnorePath = path.join(root, ".gitignore");
  writeFileSafe(rootGitIgnorePath, ".deploy/\nnode_modules/\n.DS_Store\n");

  return {
    root,
    files: [
      componentPath,
      configPath,
      payloadGeneratorPath,
      deployScriptPath,
      deployPowerShellPath,
      readmePath,
      rootGitIgnorePath
    ],
    componentPath,
    deployScriptPath,
    deployPowerShellPath,
    widgetId
  };
}
