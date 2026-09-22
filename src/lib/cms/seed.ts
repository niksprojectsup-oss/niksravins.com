import { CMS_PAGE_DEFINITIONS } from "@/lib/cms/definitions";
import { prisma } from "@/lib/db/prisma";

export async function seedCmsPages(): Promise<void> {
  for (const pageDef of CMS_PAGE_DEFINITIONS) {
    const page = await prisma.cmsPage.upsert({
      where: { slug: pageDef.slug },
      create: {
        slug: pageDef.slug,
        title: pageDef.title,
        status: "DRAFT",
      },
      update: {
        title: pageDef.title,
      },
    });

    for (const sectionDef of pageDef.sections) {
      await prisma.cmsSection.upsert({
        where: {
          pageId_key: {
            pageId: page.id,
            key: sectionDef.key,
          },
        },
        create: {
          pageId: page.id,
          key: sectionDef.key,
          title: sectionDef.title,
          sortOrder: sectionDef.sortOrder,
        },
        update: {
          title: sectionDef.title,
          sortOrder: sectionDef.sortOrder,
        },
      });
    }
  }
}
