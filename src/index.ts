#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

import { executeDeployCommand, generateDeployCommand } from "./deploy.js";
import { scaffoldBosComponent } from "./scaffold.js";
import { isTemplateName, listTemplates } from "./templates.js";

const server = new Server(
  {
    name: "mcp-near-bos-component-builder",
    version: "0.1.0"
  },
  {
    capabilities: {
      tools: {}
    }
  }
);

const scaffoldSchema = z.object({
  output_dir: z.string().min(1),
  component_name: z.string().min(1),
  template: z.string().default("minimal"),
  account_id: z.string().optional(),
  description: z.string().optional()
});

const deploySchema = z.object({
  source_file: z.string().min(1),
  account_id: z.string().min(2),
  component_name: z.string().min(1),
  network: z.enum(["mainnet", "testnet"]).default("mainnet"),
  contract_id: z.string().optional(),
  workdir: z.string().optional(),
  execute: z.boolean().default(false)
});

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "bos_list_templates",
      description: "List ready-to-use BOS component templates.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false
      }
    },
    {
      name: "bos_scaffold_component",
      description:
        "Scaffold a BOS component project with source template, config, payload generator, and deploy scripts.",
      inputSchema: {
        type: "object",
        properties: {
          output_dir: { type: "string", description: "Directory where scaffold folder will be created" },
          component_name: { type: "string", description: "BOS component name (file + widget suffix)" },
          template: { type: "string", enum: ["minimal", "token-swap-widget", "portfolio-card"] },
          account_id: { type: "string", description: "NEAR account id for target widget path (optional)" },
          description: { type: "string", description: "Optional component description" }
        },
        required: ["output_dir", "component_name"]
      }
    },
    {
      name: "bos_deploy_component",
      description:
        "Generate deployment payload/command for NEAR Social and optionally execute near-cli deployment.",
      inputSchema: {
        type: "object",
        properties: {
          source_file: { type: "string", description: "Path to .jsx BOS component source" },
          account_id: { type: "string", description: "NEAR account id that publishes widget" },
          component_name: { type: "string", description: "Widget component name" },
          network: { type: "string", enum: ["mainnet", "testnet"], default: "mainnet" },
          contract_id: { type: "string", description: "Social contract id (default social.near)" },
          workdir: { type: "string", description: "Directory for .deploy payload output" },
          execute: { type: "boolean", description: "Run generated near command (default false)" }
        },
        required: ["source_file", "account_id", "component_name"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const name = request.params.name;
  const args = request.params.arguments ?? {};

  try {
    if (name === "bos_list_templates") {
      const templates = listTemplates();
      return {
        content: [{ type: "text", text: JSON.stringify({ templates, count: templates.length }, null, 2) }]
      };
    }

    if (name === "bos_scaffold_component") {
      const parsed = scaffoldSchema.parse(args);
      if (!isTemplateName(parsed.template)) {
        throw new Error(`Unknown template: ${parsed.template}`);
      }

      const result = scaffoldBosComponent({
        outputDir: parsed.output_dir,
        componentName: parsed.component_name,
        template: parsed.template,
        accountId: parsed.account_id,
        description: parsed.description
      });

      return {
        content: [{ type: "text", text: JSON.stringify({ ok: true, ...result }, null, 2) }]
      };
    }

    if (name === "bos_deploy_component") {
      const parsed = deploySchema.parse(args);
      const generated = generateDeployCommand({
        sourceFile: parsed.source_file,
        accountId: parsed.account_id,
        componentName: parsed.component_name,
        network: parsed.network,
        contractId: parsed.contract_id,
        workdir: parsed.workdir
      });

      if (!parsed.execute) {
        return {
          content: [{ type: "text", text: JSON.stringify({ ok: true, execute: false, ...generated }, null, 2) }]
        };
      }

      const execution = executeDeployCommand(generated.command);
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: execution.ok, execute: true, ...generated, execution }, null, 2) }]
      };
    }

    return {
      content: [{ type: "text", text: JSON.stringify({ error: "unknown_tool", tool: name }, null, 2) }],
      isError: true
    };
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              error: "tool_error",
              message: error instanceof Error ? error.message : String(error)
            },
            null,
            2
          )
        }
      ],
      isError: true
    };
  }
});

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server failed:", err);
  process.exit(1);
});
