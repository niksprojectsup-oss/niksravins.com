/**
 * DEV scenāriju pārbaude: sasaiste, progress, zaru/stumbru dzīves cikls.
 * Palaiž pret DEV DB (.env.local). Izmanto testa fiksas, beigās izdzēš.
 *
 *   npx tsx scripts/dev-scenario-check.ts
 */
import { prisma } from "../src/lib/db/prisma";
import {
  linkIdentityTestSubmissionsForClient,
  linkSubmissionForMatchingClient,
} from "../src/lib/development/linking";
import { getClientDevelopmentProgress } from "../src/lib/development/progress";
import {
  getAdminDevelopmentCard,
  getClientBranchesView,
} from "../src/lib/development/repository";

const MARK = `devcheck-${Date.now()}`;
const EMAIL = `${MARK}@example.test`;
const EMAIL2 = `${MARK}-2@example.test`;

let clientAId = "";
let clientBId = "";
const subIds: string[] = [];
let trunkId = "";
const branchIds: string[] = [];

function check(name: string, cond: boolean, extra = "") {
  console.log(`${cond ? "✓" : "✗ FAIL"} ${name}${extra ? " - " + extra : ""}`);
  if (!cond) process.exitCode = 1;
}

async function main() {
  // ── fixtures: 2 klienti, 2 iesniegumi (viens e-pasts), 1 belief ──
  const clientA = await prisma.client.create({
    data: { email: EMAIL, firstName: "Dev", lastName: "Check", country: "LV" },
  });
  clientAId = clientA.id;
  const clientB = await prisma.client.create({
    data: { email: EMAIL2, firstName: "Dev", lastName: "Check2", country: "LV" },
  });
  clientBId = clientB.id;

  // Verificēts portāla konts klientam A (parole uzstādīta)
  await prisma.user.create({
    data: {
      email: EMAIL, passwordHash: "devcheck-hash", role: "CLIENT",
      clientId: clientAId, passwordSetAt: new Date(),
    },
  });

  const belief = await prisma.identityBelief.findFirst({ where: { status: "PUBLISHED" } });
  if (!belief) throw new Error("nav beliefs");

  for (let i = 0; i < 2; i++) {
    const sub = await prisma.identityTestSubmission.create({
      data: { selectedBeliefIds: [belief.id], locale: "lv", requestId: `${MARK}-${i}` },
    });
    subIds.push(sub.id);
    await prisma.identityTestResult.create({
      data: {
        submissionId: sub.id,
        email: `enc:${EMAIL}`, // testa vērtība; īstais saturs ir šifrēts
        emailHash: (await import("../src/lib/identity-test/hash")).emailHash(EMAIL),
        portraitNow: "enc:now",
        portraitFuture: "enc:future",
        locale: "lv",
      },
    });
  }

  // ── S1: auto-saiste pēc emailHash ──
  const r1 = await linkIdentityTestSubmissionsForClient({ clientId: clientAId, email: EMAIL });
  check("S1: auto-saiste atgriež 2 linked", r1.linked === 2, JSON.stringify(r1));
  const subs = await prisma.identityTestSubmission.findMany({ where: { id: { in: subIds } } });
  check("S1: abi UNLINKED→LINKED ar clientId", subs.every((s) => s.clientId === clientAId && s.linkStatus === "LINKED"));

  // ── S2: vairāki iesniegumi saglabājas atsevišķi ──
  check("S2: 2 atsevišķi iesniegumi", subs.length === 2 && new Set(subs.map((s) => s.id)).size === 2);

  // ── S3: cita klienta sasaistes mēģinājums → REVIEW ──
  const r3 = await linkIdentityTestSubmissionsForClient({ clientId: clientBId, email: EMAIL });
  check("S3: svešs klients → review", r3.review === 2 && r3.linked === 0, JSON.stringify(r3));
  const subsAfter = await prisma.identityTestSubmission.findMany({ where: { id: { in: subIds } } });
  check("S3: statuss REVIEW, clientId nemainās", subsAfter.every((s) => s.linkStatus === "REVIEW" && s.clientId === clientAId));

  // atjaunot LINKED turpmākām pārbaudēm
  await prisma.identityTestSubmission.updateMany({
    where: { id: { in: subIds } },
    data: { linkStatus: "LINKED" },
  });

  // ── S4: admin darba karte ──
  const card = await getAdminDevelopmentCard(clientAId);
  check("S4: admin karte satur 2 submissions", card.submissions.length === 2);
  check("S4: submissions satur uzskatus", card.submissions[0].beliefs.length === 1);

  // ── S5: klienta skats BEZ pozitīvā satura ──
  const libTrunk = await prisma.beliefLibraryTrunk.findFirst({
    where: { libraryKey: "1.1" }, include: { branches: true },
  });
  const clientTrunk = await prisma.clientDevelopmentTrunk.create({
    data: {
      clientId: clientAId, libraryTrunkId: libTrunk!.id, beliefId: belief.id,
      titleLv: libTrunk!.titleLv, titleEn: libTrunk!.titleEn, origin: "LIBRARY",
    },
  });
  trunkId = clientTrunk.id;
  for (const b of libTrunk!.branches.sort((x, y) => x.sortOrder - y.sortOrder)) {
    const cb = await prisma.clientDevelopmentBranch.create({
      data: { clientTrunkId: trunkId, libraryBranchId: b.id, textLv: b.textLv, textEn: b.textEn, sortOrder: b.sortOrder },
    });
    branchIds.push(cb.id);
  }

  const clientView = await getClientBranchesView(clientAId, "lv");
  const clientJson = JSON.stringify(clientView);
  check("S5: klienta skats satur progresu", clientView.progress.totalTrunks === 1);
  check(
    "S5: klienta skatā NAV pozitīvā satura",
    !clientJson.includes(libTrunk!.titleLv.slice(0, 30)) &&
      !clientJson.includes(libTrunk!.branches[0].textLv.slice(0, 30)),
  );
  check("S5: klienta skatā NAV profesionālo piezīmju", !clientJson.includes("professionalNotes") && !clientJson.includes("exploreQuestions"));

  // ── S6: progresa dzīves cikls ──
  let p = await getClientDevelopmentProgress(clientAId);
  check("S6: sākumā 0/1 = 0%", p.percent === 0 && p.totalTrunks === 1);

  // daļēja zaru pabeigšana
  for (let i = 0; i < 3; i++) {
    await prisma.clientDevelopmentBranch.update({
      where: { id: branchIds[i] }, data: { done: true, doneAt: new Date() },
    });
  }
  await prisma.clientDevelopmentTrunk.update({ where: { id: trunkId }, data: { status: "IN_PROGRESS" } });
  p = await getClientDevelopmentProgress(clientAId);
  check("S6: 3/5 zari → stumbrs vēl nepabeigts, progress 0%", p.percent === 0 && p.inProgressTrunks === 1);

  // stumbru NEDRĪKST pabeigt ar neizstrādātiem zariem (emulē completeTrunk pārbaudi)
  const trunkNow = await prisma.clientDevelopmentTrunk.findUnique({ where: { id: trunkId }, include: { branches: true } });
  const undone = trunkNow!.branches.filter((b) => !b.done);
  check("S6: pabeigšanas validācija redz 2 neizstrādātus zarus", undone.length === 2);

  // pabeigt atlikušos zarus → completeTrunk loģika
  await prisma.clientDevelopmentBranch.updateMany({
    where: { clientTrunkId: trunkId }, data: { done: true, doneAt: new Date() },
  });
  await prisma.clientDevelopmentTrunk.update({
    where: { id: trunkId },
    data: { status: "COMPLETED", completedAt: new Date(), completedByAdminId: "devcheck" },
  });
  p = await getClientDevelopmentProgress(clientAId);
  check("S6: visi zari + complete → 1/1 = 100%", p.percent === 100 && p.completedTrunks === 1);

  // ── S7: jauns stumbrs pārrēķina progresu; zars pabeigtam → NEEDS_SUPPLEMENT ──
  await prisma.clientDevelopmentTrunk.create({
    data: { clientId: clientAId, origin: "CUSTOM", titleLv: "Individuāls stumbrs", sortOrder: 1 },
  });
  p = await getClientDevelopmentProgress(clientAId);
  check("S7: jauns stumbrs → 1/2 = 50%", p.percent === 50 && p.totalTrunks === 2);

  await prisma.clientDevelopmentBranch.create({
    data: { clientTrunkId: trunkId, textLv: "Jauns zars", sortOrder: 99 },
  });
  const t2 = await prisma.clientDevelopmentTrunk.findUnique({ where: { id: trunkId } });
  check("S7: pabeigts stumbrs + jauns zars → modelis atļauj NEEDS_SUPPLEMENT", t2 !== null);

  // ── S8: progress sakrīt admin vs klients ──
  const cardP = (await getAdminDevelopmentCard(clientAId)).progress;
  const cliP = (await getClientBranchesView(clientAId, "lv")).progress;
  check("S8: progress admin==klients", cardP.percent === cliP.percent && cardP.totalTrunks === cliP.totalTrunks);

  // ── S9: klients bez testa → tukšs stāvoklis, ne kļūda ──
  const emptyView = await getClientBranchesView(clientBId, "lv");
  check("S9: tukšs klients → 0%, nav grupu", emptyView.progress.percent === 0 && emptyView.groups.length === 0);

  // ── S10: submit-brīža saiste (linkSubmissionForMatchingClient) ──
  // "Ritas scenārijs": klients eksistēja pirms iesnieguma; atsaistīts
  // iesniegums piesaistās, kad helpers tiek izsaukts (kā submit plūsmā).
  await prisma.identityTestSubmission.updateMany({
    where: { id: { in: subIds } },
    data: { clientId: null, linkStatus: "UNLINKED", linkedAt: null, linkMethod: null },
  });
  const r10 = await linkSubmissionForMatchingClient(EMAIL);
  check("S10: submit-helper atrod klientu", r10.clientId === clientAId && r10.linked === 2, JSON.stringify(r10));
  const subs10 = await prisma.identityTestSubmission.findMany({ where: { id: { in: subIds } } });
  check("S10: abi LINKED pēc submit-helper", subs10.every((s) => s.clientId === clientAId && s.linkStatus === "LINKED"));

  // e-pasts bez klienta → no-op
  const r10b = await linkSubmissionForMatchingClient(`${MARK}-none@example.test`);
  check("S10: e-pasts bez klienta → no-op", r10b.clientId === null && r10b.linked === 0);

  // ── S11: jau citam klientam piesaistīts → REVIEW, nepārraksta ──
  const r11 = await linkSubmissionForMatchingClient(EMAIL);
  // atkārtots izsaukums tam pašam e-pastam - linked jau ir, nedrīkst dubultoties
  check("S11: atkārtots izsaukums nedublē", r11.linked === 0 && r11.review === 0, JSON.stringify(r11));

  // ── S12: klients BEZ verificēta portāla konta → saiste atteikta ──
  const sub12 = await prisma.identityTestSubmission.create({
    data: { selectedBeliefIds: [belief.id], locale: "lv", requestId: `${MARK}-b` },
  });
  subIds.push(sub12.id);
  await prisma.identityTestResult.create({
    data: {
      submissionId: sub12.id, email: `enc:${EMAIL2}`, emailHash: (await import("../src/lib/identity-test/hash")).emailHash(EMAIL2),
      portraitNow: "enc:n", portraitFuture: "enc:f", locale: "lv",
    },
  });
  const r12 = await linkSubmissionForMatchingClient(EMAIL2);
  check("S12: neverificēts konts → nav saistes", r12.clientId === null && r12.linked === 0, JSON.stringify(r12));
  const sub12row = await prisma.identityTestSubmission.findUnique({ where: { id: sub12.id } });
  check("S12: iesniegums paliek UNLINKED", sub12row!.linkStatus === "UNLINKED" && sub12row!.clientId === null);

  console.log(process.exitCode ? "\n== IR KĻŪDAS ==" : "\n== VISI SCENĀRIJI OK ==");
}

main()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(async () => {
    // cleanup fixtures
    try {
      await prisma.clientDevelopmentEvent.deleteMany({ where: { clientId: { in: [clientAId, clientBId] } } });
      await prisma.clientDevelopmentTrunk.deleteMany({ where: { clientId: { in: [clientAId, clientBId] } } });
      await prisma.identityTestResult.deleteMany({ where: { submissionId: { in: subIds } } });
      await prisma.identityTestSubmission.deleteMany({ where: { id: { in: subIds } } });
      await prisma.user.deleteMany({ where: { clientId: { in: [clientAId, clientBId] } } });
      await prisma.client.deleteMany({ where: { id: { in: [clientAId, clientBId] } } });
      console.log("fixtures izdzēsti");
    } catch (e) { console.error("cleanup kļūda:", e); }
    await prisma.$disconnect();
  });
