import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { assertComponentName, assertNearAccountId } from "./validation.js";

export interface DeployCommandInput {
  sourceFile: string;
  accountId: string;
  componentName: string;
  network?: "mainnet" | "testnet";
  workdir?: string;
  contractId?: string;
}

export interface DeployCommandResult {
  payloadPath: string;
  command: string;
  widgetId: string;
  contractId: string;
  network: "mainnet" | "testnet";
}

function shellEscape(input: string): string {
  return `'${input.replace(/'/g, `'\\''`)}'`;
}

export function generateDeployCommand(input: DeployCommandInput): DeployCommandResult {
  const network = input.network ?? "mainnet";
  const contractId = (input.contractId ?? "social.near").trim();
  const accountId = assertNearAccountId(input.accountId, "account_id");
  const componentName = assertComponentName(input.componentName, "component_name");

  const workdir = path.resolve(input.workdir ?? process.cwd());
  const deployDir = path.join(workdir, ".deploy");
  fs.mkdirSync(deployDir, { recursive: true });

  const sourcePath = path.resolve(input.sourceFile);
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`source_file not found: ${sourcePath}`);
  }

  const sourceCode = fs.readFileSync(sourcePath, "utf8");
  const widgetId = `${accountId}/widget/${componentName}`;
  const payload = {
    data: {
      [widgetId]: sourceCode
    }
  };

  const payloadPath = path.join(deployDir, `${componentName}.${network}.payload.json`);
  fs.writeFileSync(payloadPath, JSON.stringify(payload, null, 2), "utf8");

  const command = [
    "near call",
    shellEscape(contractId),
    "set",
    "--accountId",
    shellEscape(accountId),
    "--networkId",
    shellEscape(network),
    "--gas",
    "300000000000000",
    "--deposit",
    "0.01",
    "--argsFile",
    shellEscape(payloadPath)
  ].join(" ");

  return { payloadPath, command, widgetId, contractId, network };
}

export function executeDeployCommand(command: string): {
  ok: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
} {
  const result = spawnSync(command, {
    shell: true,
    encoding: "utf8"
  });

  return {
    ok: result.status === 0,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
    exitCode: result.status
  };
}
