/** DEV satura publicēšana: portreti (LV), savienotāji, drošības/piekrišanas teksti,
 *  e-pastu veidnes (LV+EN), mehānismu saites. Palaišana: npx tsx scripts/identity-content-publish.ts */
import { readFileSync } from "node:fs";
import { PrismaClient, IdentityContentStatus, IdentityTranslationStatus } from "@prisma/client";

const prisma = new PrismaClient();
const pub = (value: string) => ({
  translationStatus: IdentityTranslationStatus.PUBLISHED,
  draftValue: value,
  publishedValue: value,
});

async function upsertT(entityType: string, entityId: string, field: string, locale: string, value: string) {
  await prisma.identityContentTranslation.upsert({
    where: { entityType_entityId_field_locale: { entityType, entityId, field, locale } },
    update: pub(value),
    create: { entityType, entityId, field, locale, ...pub(value) },
  });
}

async function main() {
  // 1) Portretu fragmenti LV (200 uzskati × 2 lauki)
  const lines = readFileSync("prisma/identity-portraits-lv.jsonl", "utf8").trim().split("\n");
  const beliefs = await prisma.identityBelief.findMany();
  const byKey = new Map(beliefs.map((b) => [b.stableKey, b.id]));
  let pn = 0;
  for (const line of lines) {
    const { key, now, future } = JSON.parse(line);
    const id = byKey.get(key);
    if (!id) { console.error("missing belief", key); continue; }
    await upsertT("BELIEF", id, "portraitNow", "lv", now);
    await upsertT("BELIEF", id, "portraitFuture", "lv", future);
    pn += 2;
  }
  console.log("portrait translations:", pn);

  // 2) Savienotājfrāzes
  const connectors: { key: string; kind: "OPENING"|"JOIN_SIMILAR"|"JOIN_CONTRAST"|"TRANSITION"|"CLOSING"; lv: string; en: string }[] = [
    { key: "opening", kind: "OPENING",
      lv: "Paldies, ka veltīji laiku šai izpētei. Zemāk — uzmanīgs apraksts par to, kā izvēlētie uzskati var izpausties ikdienas dzīvē. Tas nav diagnoze un ne spriedums — tikai spogulis, kas palīdz pamanīt modeļus, kuri varbūt jau sen darbojas fonā.",
      en: "Thank you for taking the time for this reflection. Below is a careful description of how the beliefs you selected may show up in everyday life. This is not a diagnosis or a judgment — only a mirror to help you notice patterns that may have been operating in the background for a long time." },
    { key: "join-similar", kind: "JOIN_SIMILAR",
      lv: "Tas bieži savienojas ar līdzīgu izjūtu:",
      en: "This often connects with a similar feeling:" },
    { key: "join-contrast", kind: "JOIN_CONTRAST",
      lv: "Reizēm tas izpaužas arī savādāk:",
      en: "Sometimes it also shows up differently:" },
    { key: "transition", kind: "TRANSITION",
      lv: "Un tagad — kā tava dzīve varētu izskatīties, ja šie uzskati vairs nenoteiktu tavas izvēles. Tas nav solījums un ne pozitīvs apgalvojums — tikai iespēja, kuru vari izpētīt savā tempā.",
      en: "And now — how your life could look if these beliefs no longer governed your choices. This is not a promise and not a positive affirmation — only a possibility you can explore at your own pace." },
    { key: "closing", kind: "CLOSING",
      lv: "Ja kāds no šiem aprakstiem šķita pazīstams, tas nozīmē, ka esi sācis pamanīt savus modeļus — un pamanīšana ir pirmais solis uz izvēles brīvību. Individuāls darbs ar speciālistu var palīdzēt šos modeļus izpētīt dziļāk.",
      en: "If any of these descriptions felt familiar, it means you have started noticing your patterns — and noticing is the first step toward freedom of choice. Individual work with a specialist can help you explore these patterns more deeply." },
    { key: "closing-future", kind: "CLOSING",
      lv: "Šīs izmaiņas nenotiek vienu dienu — tās veidojas mazos, atkārtotos soļos. Katrs brīdis, kad pamanī veco modeli un izvēlies ko citu, ir reāla pārmaiņa. Ja vēlies šo ceļu iet ar atbalstu — individuālā sesija ir droša vieta, kur to sākt.",
      en: "These changes do not happen in a day — they are built in small, repeated steps. Every moment you notice the old pattern and choose differently is real change. If you want to walk this path with support — an individual session is a safe place to start." },
  ];
  for (const c of connectors) {
    const row = await prisma.identityConnector.upsert({
      where: { key: c.key }, update: { kind: c.kind, status: IdentityContentStatus.PUBLISHED },
      create: { key: c.key, kind: c.kind, status: IdentityContentStatus.PUBLISHED },
    });
    await upsertT("CONNECTOR", row.id, "text", "lv", c.lv);
    await upsertT("CONNECTOR", row.id, "text", "en", c.en);
  }
  console.log("connectors:", connectors.length);

  // 3) Drošības teksts + mārketinga piekrišanas teksts
  const safetyLv = "Ja atklāti par to, ko piedzīvoji, rodas pārņemošas sajūtas — Tev nav jāpaliek ar tām vienam. Ja ir domas par paškaitējumu vai tu jūties briesmās — zvani 112 vai 113, vai sazinies ar uzticamu cilvēku. Tavas izjūtas ir reālas, un palīdzība ir pieejama.";
  const safetyEn = "If talking about what you experienced brings up overwhelming feelings — you do not have to stay with them alone. If you have thoughts of self-harm or feel in danger — call 112 or 113, or reach out to someone you trust. Your feelings are real, and help is available.";
  await upsertT("SAFETY_TEXT", "crisis-block", "body", "lv", safetyLv);
  await upsertT("SAFETY_TEXT", "crisis-block", "body", "en", safetyEn);
  const consentLv = "Vēlos saņemt turpmākus e-pastus ar materiāliem par iekšējo uzskatu darbu un individuālām sesijām (var atteikties jebkurā brīdī).";
  const consentEn = "I would like to receive occasional emails with materials on inner belief work and individual sessions (unsubscribe anytime).";
  await upsertT("CONSENT_TEXT", "marketing-consent", "label", "lv", consentLv);
  await upsertT("CONSENT_TEXT", "marketing-consent", "label", "en", consentEn);
  console.log("safety + consent done");

  // 4) E-pastu veidnes
  const tpl = async (step: string, fields: Record<string, { lv: string; en: string }>) => {
    const t = await prisma.identityEmailTemplate.update({
      where: { step }, data: { status: IdentityContentStatus.PUBLISHED },
    });
    for (const [field, v] of Object.entries(fields)) {
      await upsertT("EMAIL_TEMPLATE", t.id, field, "lv", v.lv);
      await upsertT("EMAIL_TEMPLATE", t.id, field, "en", v.en);
    }
    return t.id;
  };
  await tpl("RESULT", {
    subject: { lv: "Tavs Identitātes testa rezultāts — divi portreti", en: "Your Identity Test results — two portraits" },
    greeting: { lv: "Sveiki,", en: "Hello," },
    intro: { lv: "Paldies, ka aizpildīji Identitātes testu. Zemāk ir divi personalizēti portreti, kas izveidoti no uzskatiem, kurus tu izvēlējies.", en: "Thank you for completing the Identity Test. Below are two personalized portraits created from the beliefs you selected." },
    nowTitle: { lv: "Kā šie uzskati var izpausties šodien", en: "How these beliefs may show up today" },
    futureTitle: { lv: "Kā dzīve varētu izskatīties bez tiem", en: "How life could look without them" },
    disclaimer: { lv: "Šis nav medicīnisks vai psiholoģisks slēdziens — tas ir reflektīvs materiāls, kas apraksta iespējamos uzskatu izpausmes veidus.", en: "This is not a medical or psychological assessment — it is a reflective material describing possible ways these beliefs may manifest." },
    sessionLead: { lv: "Ja vēlies izpētīt savus uzskatus individuālā darbā ar speciālistu — rezervē sesiju:", en: "If you would like to explore your beliefs in individual work with a specialist — book a session:" },
    sessionCta: { lv: "Rezervēt sesiju", en: "Book a session" },
    privacyNote: { lv: "Šis e-pasts tika nosūtīts uz Tavu norādīto adresi. Tavas atbildes ir šifrētas un netiek izmantotas citos nolūkos.", en: "This email was sent to the address you provided. Your answers are encrypted and are not used for other purposes." },
  });
  await tpl("DAY_1", {
    subject: { lv: "Viena doma no Tava testa", en: "A thought from your test" },
    body: { lv: "Sveiki,\n\nVakar saņēmi savus Identitātes testa portretus. Ja vēl neesi tos pārlasījis — iesaku to izdarīt mierīgā brīdī.\n\nViena doma, ko izvēlēties ar sevi: uzskati, kurus atzīmēji, nav tavi defekti — tie ir modeļi, kas kādreiz aizsargāja. Pamanīt tos, nepazūdinot sevi — tas ir darba sākums.\n\nJa rodas jautājumi — vienkārši atbildi uz šo e-pastu.", en: "Hello,\n\nYesterday you received your Identity Test portraits. If you have not revisited them yet — I suggest doing so in a quiet moment.\n\nOne thought to take with you: the beliefs you selected are not flaws — they are patterns that once protected you. Noticing them without erasing yourself — that is where the work begins.\n\nIf questions arise — simply reply to this email." },
  });
  await tpl("DAY_3", {
    subject: { lv: "Mazs eksperiments šai nedēļai", en: "A small experiment for this week" },
    body: { lv: "Sveiki,\n\nJa pēc testa kāds uzskats īpaši 'atskanēja' — iesaku šonedēļ vienkārši to pamanīt. Ne mainīt, ne cīnīties — tikai pamanīt brīdi, kad tas ieslēdzas.\n\nPiemēram: ja uzskats 'man jāizturas pareizi' parādās sarunā — ievēro to, pasaki sev 'aha, tas ir tas uzskats', un turpini.\n\nPamanīšana bez darbības ir pirmā izmaiņa. Pārējais nāk vēlāk.", en: "Hello,\n\nIf one belief from the test particularly resonated — I suggest simply noticing it this week. Not changing it, not fighting it — just noticing the moment it activates.\n\nFor example: if the belief 'I must behave correctly' appears in a conversation — notice it, tell yourself 'ah, that is that belief', and continue.\n\nNoticing without action is the first change. The rest comes later." },
  });
  await tpl("DAY_5", {
    subject: { lv: "Kad uzskats grib palikt", en: "When a belief wants to stay" },
    body: { lv: "Sveiki,\n\nUzskatu maiņa reti notiek tāpēc, ka kāds tev saka 'tā nav taisnība'. Tā notiek, kad tu pats pieredzi, ka dzīvot var arī citādi.\n\nTāpēc individuālā sesija nav par 'labošanu' — tā ir vieta, kur droši izmēģināt jaunu attiecību modeli, ko vēlāk pārnest uz dzīvi.\n\nJa jūti, ka laiks sākt — rezervē sesiju niksravins.com/book.\n\nAr cieņu,\nNiks", en: "Hello,\n\nBeliefs rarely change because someone tells you 'that is not true'. They change when you experience that living differently is possible.\n\nThat is why an individual session is not about 'fixing' — it is a place to safely try a new way of relating, to later carry into your life.\n\nIf you feel it is time to begin — book a session at niksravins.com/book.\n\nWith respect,\nNiks" },
  });
  console.log("templates published: RESULT, DAY_1, DAY_3, DAY_5");

  // 5) Mehānismu saites — heuristika pa apakštēmām
  const mechMap: Record<string, string[]> = {
    "T01-S01": ["self-blame"], "T01-S02": ["external-validation"], "T01-S03": ["external-validation","avoidance"],
    "T01-S04": ["perfectionism","external-validation"], "T01-S05": ["external-validation","over-responsibility"],
    "T02-S01": ["rejection-fear"], "T02-S02": ["control","rejection-fear"], "T02-S03": ["intimacy-avoidance","avoidance"],
    "T02-S04": ["over-responsibility","rejection-fear"], "T02-S05": ["rejection-fear"],
    "T03-S01": ["self-blame","avoidance"], "T03-S02": ["external-validation","perfectionism"], "T03-S03": ["external-validation","over-responsibility"],
    "T03-S04": ["over-responsibility"], "T03-S05": ["over-responsibility","self-blame"],
    "T04-S01": ["control","helplessness"], "T04-S02": ["control"], "T04-S03": ["intimacy-avoidance"],
    "T04-S04": ["control","avoidance"], "T04-S05": ["helplessness"],
    "T05-S01": ["avoidance","perfectionism"], "T05-S02": ["self-blame","external-validation"], "T05-S03": ["external-validation"],
    "T05-S04": ["avoidance"], "T05-S05": ["self-blame","over-responsibility"],
    "T06-S01": ["external-validation","perfectionism"], "T06-S02": ["perfectionism"], "T06-S03": ["external-validation","rejection-fear"],
    "T06-S04": ["helplessness","avoidance"], "T06-S05": ["over-responsibility","perfectionism"],
    "T07-S01": ["scarcity-expectation","control"], "T07-S02": ["self-blame","scarcity-expectation"], "T07-S03": ["over-responsibility","scarcity-expectation"],
    "T07-S04": ["scarcity-expectation","avoidance"], "T07-S05": ["scarcity-expectation","self-blame"],
    "T08-S01": ["helplessness","avoidance"], "T08-S02": ["avoidance","control"], "T08-S03": ["external-validation","helplessness"],
    "T08-S04": ["self-blame","helplessness"], "T08-S05": ["avoidance","scarcity-expectation"],
    "T09-S01": ["rejection-fear","over-responsibility"], "T09-S02": ["avoidance","rejection-fear"], "T09-S03": ["control","helplessness"],
    "T09-S04": ["over-responsibility","self-blame"], "T09-S05": ["external-validation","helplessness"],
    "T10-S01": ["avoidance","self-blame"], "T10-S02": ["over-responsibility","avoidance"], "T10-S03": ["helplessness","self-blame"],
    "T10-S04": ["self-blame","avoidance"], "T10-S05": ["helplessness","self-blame"],
  };
  const tags = await prisma.identityMechanismTag.findMany();
  const tagByKey = new Map(tags.map((t) => [t.key, t.id]));
  const subs = await prisma.identityTestSubcategory.findMany({ include: { beliefs: true } });
  const subByKey = new Map(subs.map((s) => [s.stableKey, s]));
  let links = 0;
  for (const [subKey, mechKeys] of Object.entries(mechMap)) {
    const sub = subByKey.get(subKey);
    if (!sub) continue;
    for (const b of sub.beliefs) {
      for (const mk of mechKeys) {
        const tagId = tagByKey.get(mk);
        if (!tagId) continue;
        await prisma.identityBeliefMechanism.upsert({
          where: { beliefId_tagId: { beliefId: b.id, tagId } },
          update: {}, create: { beliefId: b.id, tagId },
        });
        links++;
      }
    }
  }
  console.log("mechanism links:", links);

  // 6) Publicēt tagus + visus uzskatus/apakštēmas/tēmas
  await prisma.identityMechanismTag.updateMany({ data: { status: IdentityContentStatus.PUBLISHED } });
  await prisma.identityBelief.updateMany({ data: { status: IdentityContentStatus.PUBLISHED } });
  await prisma.identityTestSubcategory.updateMany({ data: { status: IdentityContentStatus.PUBLISHED } });
  await prisma.identityTestTheme.updateMany({ data: { status: IdentityContentStatus.PUBLISHED } });
  console.log("all content PUBLISHED");
}

main().finally(() => prisma.$disconnect());
