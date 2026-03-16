# mcp-near-bos-component-builder

MCP server for building and deploying NEAR BOS (Blockchain Operating System) components.

It ships three core capabilities required by the job:

1. BOS component scaffolding
2. Multiple ready templates
3. Deployment automation for NEAR Social (`social.near`)

## Features

- `bos_list_templates`: discover built-in templates
- `bos_scaffold_component`: generate project scaffold with source + scripts + config
- `bos_deploy_component`: generate NEAR Social payload/CLI command and optionally execute

Built-in templates:
- `minimal`
- `token-swap-widget`
- `portfolio-card`

## Install

```bash
npm install -g mcp-near-bos-component-builder
```

## MCP configuration example (Claude Desktop)

Add this entry to your MCP config:

```json
{
  "mcpServers": {
    "near-bos-builder": {
      "command": "mcp-near-bos-component-builder"
    }
  }
}
```

Or run from source:

```json
{
  "mcpServers": {
    "near-bos-builder": {
      "command": "node",
      "args": ["/absolute/path/to/near-mcp-bos-component-builder/dist/index.js"]
    }
  }
}
```

## Tool reference

### 1) `bos_list_templates`
Lists available templates with descriptions/tags.

Input: none

### 2) `bos_scaffold_component`
Generates a ready-to-edit BOS project folder.

Input:
- `output_dir` (required)
- `component_name` (required)
- `template` (`minimal|token-swap-widget|portfolio-card`, default `minimal`)
- `account_id` (optional)
- `description` (optional)

Output includes:
- `root`
- `files[]`
- `componentPath`
- `deployScriptPath`
- `deployPowerShellPath`
- `widgetId`

Generated scaffold contains:
- `src/<component>.jsx`
- `bos.config.json`
- `scripts/generate-payload.mjs`
- `scripts/deploy.sh`
- `scripts/deploy.ps1`
- local `README.md`

### 3) `bos_deploy_component`
Creates deployment payload and command for NEAR Social publishing.

Input:
- `source_file` (required)
- `account_id` (required)
- `component_name` (required)
- `network` (`mainnet|testnet`, default `mainnet`)
- `contract_id` (optional, default `social.near`)
- `workdir` (optional)
- `execute` (optional, default `false`)

Behavior:
- always writes `.deploy/<component>.<network>.payload.json`
- returns ready `near call ...` command
- if `execute=true`, runs command and returns stdout/stderr/exit code

## Local development

```bash
npm install
npm run build
npm test
```

## NEAR Social deployment notes

- Ensure `near` CLI is installed and authorized (`near login`).
- Deploy uses `0.01` NEAR deposit and `300 Tgas` defaults.
- Widget key format: `<account_id>/widget/<component_name>`

## Publish checklist

```bash
npm run build
npm test
npm publish --access public
```

## License

MIT
