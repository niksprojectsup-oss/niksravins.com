import { PrismaClient } from "@prisma/client";
import {
  formatCmsImportSummary,
  updateCmsDraftContentFromSource,
} from "../src/lib/cms/import/import-cms-content";
import { loadCmsImportLocaleContent } from "../src/lib/cms/import/load-locale-content";

const prisma = new PrismaClient();

async function main() {
  const summary = await updateCmsDraftContentFromSource({
    prisma,
    loadLocaleContent: loadCmsImportLocaleContent,
    locale: "en",
    pageSlugs: ["home", "about", "aap", "faq"],
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
