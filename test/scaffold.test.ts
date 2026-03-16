import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { scaffoldBosComponent } from "../src/scaffold.js";

describe("scaffoldBosComponent", () => {
  it("creates scaffold files and metadata", () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "bos-scaffold-"));

    const result = scaffoldBosComponent({
      outputDir: tmp,
      componentName: "portfolio_widget",
      template: "portfolio-card",
      accountId: "example.near",
      description: "test scaffold"
    });

    expect(fs.existsSync(result.root)).toBe(true);
    expect(fs.existsSync(result.componentPath)).toBe(true);
    expect(fs.existsSync(result.deployScriptPath)).toBe(true);
    expect(fs.existsSync(result.deployPowerShellPath)).toBe(true);
    expect(result.widgetId).toBe("example.near/widget/portfolio_widget");

    const configRaw = fs.readFileSync(path.join(result.root, "bos.config.json"), "utf8");
    const config = JSON.parse(configRaw) as { componentName: string; template: string };
    expect(config.componentName).toBe("portfolio_widget");
    expect(config.template).toBe("portfolio-card");
  });
});
