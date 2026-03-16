import fs from "node:fs";

const [sourceFile, accountId, componentName, outFile] = process.argv.slice(2);

if (!sourceFile || !accountId || !componentName || !outFile) {
  console.error("Usage: node generate-payload.mjs <source-file> <account-id> <component-name> <output-json>");
  process.exit(1);
}

const source = fs.readFileSync(sourceFile, "utf8");
const widgetKey = accountId + "/widget/" + componentName;
const payload = { data: { [widgetKey]: source } };
fs.writeFileSync(outFile, JSON.stringify(payload, null, 2), "utf8");
console.log("payload written to " + outFile);
