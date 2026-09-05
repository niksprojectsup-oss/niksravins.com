import type { PublicContent } from "./types";

const internationalFaq = {
  question: "咨询使用什么语言进行？",
  answer:
    "咨询以英语进行。欢迎国际客户——在线咨询面向全球开放。",
};

export const zhContent: PublicContent = {
  locale: "zh",
  translationStatus: "published",
  site: {
    name: "Niks Ravins",
    method: "Adaptive Association Processing (AAP)",
    availability: "全球在线",
    brandDescriptor: "自主神经系统自动反应改写专家",
    email: "hello@niksravins.com",
    bookingUrl: "/book",
  },
  internationalNotice: {
    line1: "全球在线",
    line2: "咨询以英语进行",
  },
  header: {
    book: "预约",
    bookSession: "预约咨询",
    clientPortal: "客户门户",
  },
  sectionLabels: {
    trustHeading: "人们为何来到这里",
    aapLabel: "AAP",
    testimonialsLabel: "观察到的变化",
    testimonialsHeading: "日常生活中的转变",
    contactHeading: "联系",
    aboutImageAlt: "Niks Ravins 肖像",
  },
  navigation: [
    { label: "关于", href: "#about" },
    { label: "AAP", href: "#aap" },
    { label: "FAQ", href: "#faq" },
    { label: "联系", href: "#contact" },
  ],
  hero: {
    name: "Niks Ravins",
    headline: "你明白这种反应。它仍然会发生。",
    explanation: [
      "自动情绪反应之所以持续，是因为神经系统仍将它们与特定的过往经历联系在一起。",
      "大多数来到这里的人，早已理解自己的模式。谈话解释了它们，却没有改变反应。",
      "咨询聚焦于识别并改变那些习得的情感关联。",
    ],
    primaryCta: { label: "预约咨询", href: "/book" },
    secondaryCta: { label: "AAP 如何运作", href: "#aap" },
  },
  trust: {
    statements: [
      "人们来这里，不是因为不了解自己。",
      "大多数人已经了解了。",
      "他们来，是因为理解本身没有改变反应。",
      "这项工作聚焦于改变反应本身。",
    ],
  },
  about: {
    title: "这项工作为何存在",
    story: [
      "多年来，我在客户身上反复看到同一件事：清晰的洞察，未变的反应。他们能完美描述模式。焦虑依然到来。退缩依然出现。愤怒依然快于思考。",
      "AAP 源于这一观察——也源于我自己那些理解无法触及的反应经历。不是来自想要证明的理论，而是来自一个挥之不去的问题：如果一个人已经知道为何反应，究竟还需要改变什么？",
      "我的答案是关联本身——过往经历与当下反应之间习得的联结。这项工作存在的意义，就是直接触及这一联结，通过一个结构化的咨询框架，该框架建立在大量实践工作和持续观察自动情绪反应如何转变的基础之上。",
    ],
  },
  aap: {
    title: "AAP 如何运作",
    intro:
      "Adaptive Association Processing 不是用来学习的。它发生在咨询中——安静、精准，以你的系统所允许的节奏进行。",
    points: [
      {
        title: "咨询中发生什么",
        description:
          "我们定位一个特定的反应——那个仍然自动出现的反应——并追溯维持它的情感关联。咨询始终聚焦在这一联结上。无需表演，无需急于获得洞察。",
      },
      {
        title: "为何同样的反应会回来",
        description:
          "当神经系统仍将当下时刻视为与过去相连时，反应就会重复。关联是习得的。仅凭理解难以覆盖它，因为它在思考之前就已运作。",
      },
      {
        title: "一段记忆如何延伸至今",
        description:
          "情感关联不需要有意识的回忆。一个语调、一个眼神、一种情境，就能激活与原始经历相同的反应——即使理性上明白过去不是现在。",
      },
      {
        title: "可能改变什么",
        description:
          "当关联发生转变，随之而来的反应可能减弱或完全不再出现。这不是承诺。客户常描述的是：不是新的理解，而是日常生活中不同的反应。",
      },
    ],
  },
  testimonials: {
    intro:
      "这些是人们在自动反应开始转变后，常在日常生活中注意到的变化。不是因为他们更努力或换了思维方式，而是因为反应本身已经不同。",
    items: [
      {
        title: "检查停止了",
        description:
          "监控伴侣社交媒体的冲动就这样淡去了。不是因为自控或纪律，而是因为神经系统不再将其视为需要检查的东西。",
      },
      {
        title: "紧缩感减轻了",
        description:
          "工作发言前的胸闷现在很少出现。准备依然继续。身体的反应不再相同。",
      },
      {
        title: "愤怒来得少了",
        description:
          "与当下无关的愤怒不再抢先于思考。情境没有改变。反应改变了。",
      },
    ],
  },
  faq: {
    headingLabel: "问题",
    heading: "人们常问什么",
    items: [
      internationalFaq,
      {
        question: "咨询过程中会发生什么？",
        answer:
          "我们识别一个特定的自动反应，并处理与之相连的情感关联。咨询结构化且聚焦。不要求你表演或产出洞察——工作发生在关联本身的层面。",
      },
      {
        question: "我需要重新经历过去吗？",
        answer: [
          "不是大多数人想象的那种方式。",
          "目标不是重新经历痛苦，也不是停留在困难的情绪中。",
          "在咨询中，我们会短暂激活与你的自动反应相连的特定情感记忆或习得关联。这让神经系统能够触及仍在维持该反应的模式。",
          "随后，焦点转向改变神经系统的反应方式。目的不是反复回溯过去，而是让与该记忆相连的反应得以改变。",
          "大多数客户会惊讶于：与创造改变所花的时间相比，谈论过去的时间是多么少。",
        ],
      },
      {
        question: "AAP 是心理治疗吗？",
        answer:
          "是的。AAP 是在心理治疗中使用的结构化咨询框架。它不是教练，也不是在治疗关系之外单独应用的技术。",
      },
      {
        question: "人们通常进行多少次咨询？",
        answer:
          "因人而异。有些人在几次咨询中处理一个模式。有些人持续更久。没有规定的疗程——我们会一直工作，直到你为此而来的反应转变到在日常生活中足够有意义。",
      },
      {
        question: "如果我已经尝试过治疗，这还能帮助我吗？",
        answer:
          "通常可以——尤其是如果之前的治疗帮助你理解了模式，但自动反应仍然存在。AAP 处理的是不同的层面：不是关于反应的故事，而是产生反应的关联。",
      },
      {
        question: "如果我正处于危机中怎么办？",
        answer:
          "本服务不提供紧急照护。如果你处于即时危险或正在经历心理健康危机，请联系当地紧急服务或你所在地区的危机热线。",
      },
    ],
  },
  finalCta: {
    lines: [
      "如果你已经理解自己多年，",
      "但反应仍然感觉是自动的，",
      "也许缺失的不是理解。",
    ],
    button: { label: "预约咨询", href: "/book" },
  },
  bookingPublic: {
    label: "预约",
    title: "预约咨询",
    subtitle:
      "开始改变那些不再服务于你的自动反应。欢迎国际客户——咨询以英语进行。",
  },
  bookingUi: {
    hero: {
      title: "预约咨询",
      subtitle:
        "开始改变那些不再服务于你的自动反应。",
    },
    services: {
      title: "选择服务",
      description: "所有项目均为在线付费咨询。",
      choose: "选择",
      selected: "已选择",
    },
    calendar: {
      title: "选择时间",
      packageTitle: "选择首次咨询",
      packageDescription:
        "立即预约首次咨询。第 2–5 次咨询可稍后通过客户门户逐一预约。",
      description:
        "选择一个可用的在线咨询时段。你只会看到 Niks 可进行在线工作的时间。",
      loading: "正在加载可用时间…",
      noAvailability:
        "下一个预约窗口内没有可用的在线咨询。请稍后再查看。",
      noSlots: "此日期没有可用时间。",
      showMoreTimes: "显示更多时间",
      showFewerTimes: "显示更少时间",
      courseStartTitle: "选择开始日期",
      courseStartDescription: "请选择您希望课程或项目开始的日期。",
      courseStartLabel: "课程开始日期",
    },
    form: {
      title: "你的信息",
      description:
        "这些信息有助于为咨询做准备。此处分享的一切均保密。",
      sessionIntentionLabel: "咨询意图",
      sessionIntentionPlaceholder:
        "请简要描述你希望处理的反应或模式。",
    },
    payment: {
      title: "付款",
      description: "请使用银行卡安全完成预约。",
      stripeLabel: "银行卡支付",
    },
    paymentSuccess: {
      title: "付款已确认",
      errorTitle: "无法验证付款",
      message:
        "谢谢 — 我们已成功收到您的付款。您的预约已确认，您将很快收到确认邮件。",
      packageMessage:
        "您的深度转化套餐已确认。您将收到包含预约详情和 Client Portal 访问方式的邮件。",
      courseMessage:
        "您的课程已确认。您将很快收到包含预约详情的邮件。",
      closing:
        "如果确认邮件在几分钟内未送达，请检查垃圾邮件文件夹。期待与您见面。",
      sessionLanguageNote:
        "咨询将以英语进行。在线咨询面向全球客户开放。",
      missingSessionId:
        "由于未提供结账参考信息，我们无法验证您的付款。",
      invalidSession:
        "我们找不到有效的结账会话。如果您已完成付款，请检查邮件或联系我们。",
      notPaid:
        "您的付款尚未完成。如果您已被扣款，请携带付款详情联系我们。",
      error:
        "我们目前无法验证您的付款。请稍后重试或查看邮件中的确认信息。",
      tryAgain: "返回预约",
    },
    confirmation: {
      title: "你的咨询已确认。",
      message:
        "确认邮件及咨询详情已发送至你提供的地址。",
      closing:
        "如果几分钟内未收到，请检查垃圾邮件文件夹。期待与你见面。",
      sessionLanguageNote:
        "你的咨询将以英语进行。在线咨询面向全球开放。",
    },
    actions: {
      continue: "继续",
      back: "返回",
      confirmBooking: "确认预约",
      returnHome: "返回首页",
    },
  },
  seo: {
    home: {
      title: "Niks Ravins | 深度转化与 Adaptive Association Processing",
      description:
        "与 Niks Ravins 进行 Adaptive Association Processing（AAP）在线深度转化咨询。处理情绪模式、关系与个人转化。咨询以英语进行，面向全球。",
    },
    book: {
      title: "预约咨询",
      description:
        "预约 Niks Ravins 的在线转化咨询。首次咨询及 5 次咨询旅程面向全球开放。咨询以英语进行。",
    },
  },
  footer: {
    rights: "保留所有权利。",
  },
  languageSwitcherLabel: "选择语言",
};
