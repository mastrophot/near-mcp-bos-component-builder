import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { generateDeployCommand } from "../src/deploy.js";

describe("generateDeployCommand", () => {
  it("writes payload json and command", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bos-deploy-"));
    const sourceFile = path.join(tmp, "component.jsx");
    fs.writeFileSync(sourceFile, "return <div>Hello</div>;\n", "utf8");

    const result = generateDeployCommand({
      sourceFile,
      accountId: "builder.near",
      componentName: "hello_widget",
      network: "testnet",
      workdir: tmp
    });

    expect(result.widgetId).toBe("builder.near/widget/hello_widget");
    expect(result.network).toBe("testnet");
    expect(fs.existsSync(result.payloadPath)).toBe(true);
    expect(result.command).toContain("near call");
    expect(result.command).toContain("--networkId 'testnet'");

    const payload = JSON.parse(fs.readFileSync(result.payloadPath, "utf8")) as {
      data: Record<string, string>;
    };
    expect(payload.data["builder.near/widget/hello_widget"]).toContain("Hello");
  });
});
