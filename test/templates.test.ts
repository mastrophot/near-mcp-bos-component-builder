import { describe, expect, it } from "vitest";

import { listTemplates, renderTemplate } from "../src/templates.js";

describe("templates", () => {
  it("returns all built-in templates", () => {
    const templates = listTemplates();
    expect(templates.map((t) => t.name).sort()).toEqual([
      "minimal",
      "portfolio-card",
      "token-swap-widget"
    ]);
  });

  it("renders minimal template with component name", () => {
    const jsx = renderTemplate("minimal", "demoWidget", "demo description");
    expect(jsx).toContain("demoWidget");
    expect(jsx).toContain("demo description");
  });
});
