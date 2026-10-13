import fs from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";

const baseUrl = process.argv[2]?.replace(/\/+$/, "");

if (!baseUrl) {
  console.error("Usage: node scripts/preflight.mjs <BASE_URL>");
  process.exit(1);
}

const expectedPath = path.join(process.cwd(), "demo-files", "expected.json");
if (!fs.existsSync(expectedPath)) {
  console.error("Error: demo-files/expected.json not found.");
  process.exit(1);
}

const expectedData = JSON.parse(fs.readFileSync(expectedPath, "utf-8"));
let hasFail = false;

async function runPreflight() {
  console.log(`Running preflight verification against: ${baseUrl}\n`);

  for (const [fileName, expectedStatus] of Object.entries(expectedData)) {
    const filePath = path.join(process.cwd(), "demo-files", fileName);
    if (!fs.existsSync(filePath)) {
      console.error(`FAIL: File not found: ${fileName}`);
      hasFail = true;
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const sha256 = createHash("sha256").update(fileBuffer).digest("hex");

    try {
      const res = await fetch(`${baseUrl}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sha256 }),
      });

      if (!res.ok) {
        console.error(`FAIL: ${fileName} returned HTTP ${res.status}`);
        hasFail = true;
        continue;
      }

      const data = await res.json();
      if (data.status === expectedStatus) {
        console.log(`PASS: ${fileName} -> expected "${expectedStatus}", got "${data.status}" (hash: ${sha256.slice(0, 8)}...${sha256.slice(-8)})`);
      } else {
        console.error(`FAIL: ${fileName} -> expected "${expectedStatus}", got "${data.status}"`);
        hasFail = true;
      }
    } catch (err) {
      console.error(`FAIL: ${fileName} network error:`, err.message);
      hasFail = true;
    }
  }

  if (hasFail) {
    console.error("\nPreflight check: FAILED");
    process.exit(1);
  } else {
    console.log("\nPreflight check: ALL PASS");
    process.exit(0);
  }
}

runPreflight();
