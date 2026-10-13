import fs from "node:fs";
import path from "node:path";
import { createHash, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const rootDir = process.cwd();

async function seedOfficialRecords() {
  const officialDir = path.join(rootDir, "seed-assets", "official");
  const recordsJsonPath = path.join(officialDir, "records.json");

  if (!fs.existsSync(recordsJsonPath)) {
    console.log("No official/records.json found. Skipping official records.");
    return;
  }

  const recordsData = JSON.parse(fs.readFileSync(recordsJsonPath, "utf-8"));

  for (const [fileName, metadata] of Object.entries(recordsData)) {
    const filePath = path.join(officialDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const sha256 = createHash("sha256").update(fileBuffer).digest("hex");

    // Check if record exists
    const { data: existing, error: checkError } = await supabase
      .from("verified_records")
      .select("id")
      .eq("sha256", sha256)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking verified_records for ${fileName}:`, checkError.message);
      continue;
    }

    if (existing) {
      console.log(`Skipping official record ${fileName} (${sha256.slice(0, 8)}...): already exists.`);
      continue;
    }

    const ext = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") ? "jpg" : "png";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";
    const recordId = randomUUID();
    const storagePath = `${recordId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("official-files")
      .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false });

    if (uploadError) {
      console.error(`Error uploading ${fileName}:`, uploadError.message);
      continue;
    }

    const { error: insertError } = await supabase
      .from("verified_records")
      .insert({
        id: recordId,
        sha256,
        title: metadata.title,
        file_name: fileName,
        storage_path: storagePath,
        stamped_by: "Registrar Office",
      });

    if (insertError) {
      console.error(`Error inserting verified_record for ${fileName}:`, insertError.message);
    } else {
      console.log(`Successfully seeded official record: ${fileName} (${metadata.title})`);
    }
  }
}

async function seedReports() {
  const reportedDir = path.join(rootDir, "seed-assets", "reported");
  const reportsJsonPath = path.join(reportedDir, "reports.json");

  if (!fs.existsSync(reportsJsonPath)) {
    console.log("No reported/reports.json found. Skipping reports.");
    return;
  }

  const reportsData = JSON.parse(fs.readFileSync(reportsJsonPath, "utf-8"));

  for (const [fileName, metadata] of Object.entries(reportsData)) {
    const filePath = path.join(reportedDir, fileName);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    const fileBuffer = fs.readFileSync(filePath);
    const sha256 = createHash("sha256").update(fileBuffer).digest("hex");

    // Check if report exists
    const { data: existing, error: checkError } = await supabase
      .from("reports")
      .select("id")
      .eq("sha256", sha256)
      .maybeSingle();

    if (checkError) {
      console.error(`Error checking reports for ${fileName}:`, checkError.message);
      continue;
    }

    if (existing) {
      console.log(`Skipping report ${fileName} (${sha256.slice(0, 8)}...): already exists.`);
      continue;
    }

    const ext = fileName.endsWith(".jpg") || fileName.endsWith(".jpeg") ? "jpg" : "png";
    const mimeType = ext === "png" ? "image/png" : "image/jpeg";
    const reportId = randomUUID();
    const storagePath = `${reportId}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("report-files")
      .upload(storagePath, fileBuffer, { contentType: mimeType, upsert: false });

    if (uploadError) {
      console.error(`Error uploading ${fileName}:`, uploadError.message);
      continue;
    }

    const { error: insertError } = await supabase
      .from("reports")
      .insert({
        id: reportId,
        sha256,
        file_name: fileName,
        storage_path: storagePath,
        note: metadata.note || null,
        status: metadata.status || "reported",
      });

    if (insertError) {
      console.error(`Error inserting report for ${fileName}:`, insertError.message);
    } else {
      console.log(`Successfully seeded report: ${fileName} [${metadata.status}]`);
    }
  }
}

async function run() {
  console.log("Seeding official records...");
  await seedOfficialRecords();
  console.log("Seeding reports...");
  await seedReports();
  console.log("Seeding complete.");
}

run().catch((err) => {
  console.error("Seed script failed:", err);
  process.exit(1);
});
