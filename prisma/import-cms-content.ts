import { PrismaClient } from "@prisma/client";
import {
  formatCmsImportSummary,
  importCmsContentFromI18n,
} from "../src/lib/cms/import/import-cms-content";
import { loadCmsImportLocaleContent } from "../src/lib/cms/import/load-locale-content";

const prisma = new PrismaClient();

async function main() {
  const summary = await importCmsContentFromI18n({
    prisma,
    loadLocaleContent: loadCmsImportLocaleContent,
  });

  console.log(formatCmsImportSummary(summary));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
