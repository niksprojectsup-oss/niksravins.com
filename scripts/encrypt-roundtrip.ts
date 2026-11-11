import { encryptField, decryptField } from "../src/lib/security/encryption";
const mode = process.argv[2];
if (mode === "encrypt") {
  process.stdout.write(encryptField("restart-roundtrip-test@example.lv"));
} else if (mode === "decrypt") {
  const v = process.argv[3] ?? "";
  console.log(decryptField(v));
}
