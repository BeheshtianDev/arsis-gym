import {
  escapeHTML as e,
  number as n,
  safeURL,
  phoneURL,
  comparePlans,
  fetchContent,
  readDraft,
} from "./content.js";

const paths = {
  arrow: '<path d="M19 12H5m6 6-6-6 6-6"/>',
  down: '<path d="M12 5v14m6-6-6 6-6-6"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  phone: '<path d="m6 3 4 4-2 3c1 3 3 5 6 6l3-2 4 4-2 3C10 22 2 14 3 5Z"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  dumbbell:
    '<path d="m5 9 4-4m6 14 4-4M8 8l8 8M3 7l4-4M17 21l4-4M3 11l8-8M13 21l8-8"/>',
  activity: '<path d="M2 12h4l3-9 6 18 3-9h4"/>',
  steam:
    '<path d="M5 18h14M7 14c-5-4 5-5 0-10m5 10c-5-4 5-5 0-10m5 10c-5-4 5-5 0-10"/>',
  waves:
    '<path d="M2 7q3-3 6 0t6 0 6 0M2 12q3-3 6 0t6 0 6 0M2 17q3-3 6 0t6 0 6 0"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  image:
    '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m21 16-6-6L3 21"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  expand: '<path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/>',
  instagram:
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17 7h.01"/>',
  shield:
    '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z"/><path d="m8 12 3 3 5-6"/>',
};
export const icon = (source, cls = "") => {
  // 1. Direct SVG code
  if (typeof source === "string" && source.trim().startsWith("<svg")) {
    return source;
  }

  // 2. SVG file
  if (typeof source === "string" && source.toLowerCase().endsWith(".svg")) {
    return (
      '<img class="icon ' +
      cls +
      '" src="' +
      source +
      '" alt="" aria-hidden="true">'
    );
  }

  // 3. Existing built-in icon
  return (
    '<svg class="icon ' +
    cls +
    '" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (paths[source] || paths.plus) +
    "</svg>"
  );
};
const sample = (text = "نمونه") =>
  '<span class="sample-label">' + text + "</span>";
const imageMarkup = (src, alt, cls = "", eager = false) =>
  safeURL(src, "image")
    ? '<img class="' +
      cls +
      '" src="' +
      e(safeURL(src, "image")) +
      '" alt="' +
      e(alt) +
      '" ' +
      (eager ? 'fetchpriority="high"' : 'loading="lazy"') +
      ' decoding="async" width="1536" height="1024">'
    : '<div class="photo-placeholder ' +
      cls +
      '">' +
      icon("image") +
      "<span>تصویر به‌زودی</span></div>";
const sectionHead = (kicker, title, desc = "", link = "") =>
  '<div class="section-heading reveal"><div><p class="eyebrow">' +
  e(kicker) +
  "</p><h2>" +
  e(title) +
  "</h2>" +
  (desc ? '<p class="muted">' + e(desc) + "</p>" : "") +
  "</div>" +
  link +
  "</div>";
const arrowLink = (href, text) =>
  '<a class="text-link" href="' +
  href +
  '">' +
  e(text) +
  icon("arrow") +
  "</a>";

export function renderHeader(d, page) {
  const nav = [
    ["home", "./index.html", "خانه"],
    ["facilities", "./index.html#facilities", "امکانات"],
    ["plans", "./plans.html", "پلن‌های عضویت"],
    ["team", "./team.html", "مربیان و مدیریت"],
    ["gallery", "./index.html#gallery", "گالری"],
  ];
  return (
    '<header class="site-header"><div class="container header-inner"><a class="brand" href="./index.html" aria-label="' +
    e(d.brand.name) +
    '، صفحه اصلی">' +
    (safeURL(d.brand.logo, "image")
      ? '<img class="brand-logo" src="' +
        e(safeURL(d.brand.logo, "image")) +
        '" alt="لوگوی ' +
        e(d.brand.name) +
        '" width="120" height="56">'
      : '<span class="brand-name">' + e(d.brand.name) + "</span>") +
    '<span class="brand-caption">' +
    e(d.brand.tagline) +
    '</span></a><nav id="primary-nav" class="primary-nav" aria-label="منوی اصلی">' +
    nav
      .map(
        ([id, url, label]) =>
          '<a href="' +
          url +
          '" ' +
          (page === id ? 'aria-current="page"' : "") +
          ">" +
          label +
          "</a>",
      )
      .join("") +
    '</nav><a class="button button-outline header-contact" href="./contact.html" ' +
    (page === "contact" ? 'aria-current="page"' : "") +
    ">تماس با ما" +
    icon("arrow") +
    '</a><button class="menu-toggle icon-button" aria-label="باز کردن منو" aria-expanded="false" aria-controls="primary-nav">' +
    icon("menu") +
    "</button></div></header>"
  );
}

export function renderFooter(d) {
  const phone = phoneURL(d.contact.phone);
  return (
    '<footer class="site-footer"><div class="container footer-main"><div class="footer-brand"><a class="brand-name" href="./index.html">' +
    e(d.brand.name) +
    "</a><p>" +
    e(d.brand.tagline) +
    '<br>دریاچه چیتگر، تهران</p></div><nav aria-label="پیوندهای پایین صفحه"><a href="./index.html#facilities">امکانات باشگاه</a><a href="./plans.html">پلن‌های عضویت</a><a href="./team.html">مربیان و مدیریت</a><a href="./contact.html">تماس با ما</a></nav><div class="footer-contact"><span>برای آشنایی بیشتر، در ارتباط باشیم.</span>' +
    (phone
      ? '<a class="footer-phone" href="' +
        phone +
        '" dir="ltr">' +
        e(d.contact.phone) +
        "</a>"
      : '<span class="muted">شماره تماس به‌زودی اعلام می‌شود</span>') +
    '</div></div><div class="container footer-bottom"><p>تمامی حقوق این وب‌سایت متعلق به ' +
    e(d.brand.name) +
    " است.</p><span>تمرین. تداوم. پیشرفت.</span></div></footer>"
  );
}

function facilities(d) {
  return (
    '<section id="facilities" class="section facilities-section"><div class="container">' +
    sectionHead("امکانات آرسیس", "هر آنچه برای یک تمرین خوب نیاز دارید.") +
    '<div class="facilities-grid">' +
    d.features
      .map(
        (f, i) =>
          '<article class="facility reveal"><div class="facility-top">' +
          icon(f.icon) +
          "<span>" +
          n(i + 1).padStart(2, "۰") +
          "</span></div><h3>" +
          e(f.title) +
          "</h3><p>" +
          e(f.description) +
          "</p></article>",
      )
      .join("") +
    "</div></div></section>"
  );
}

function membershipSummary(d) {
  return (
    '<section class="section plans-overview"><div class="container">' +
    sectionHead(
      "پلن‌های عضویت",
      "ریتم تمرین خودتان را پیدا کنید.",
      "تعداد جلسات و هزینه هر جلسه را کنار هم ببینید.",
      arrowLink("./plans.html", "مقایسه همه پلن‌ها"),
    ) +
    '<div class="category-grid">' +
    d.categories
      .map((c, i) => {
        const real = c.plans.filter((p) => !p.sample && p.price && p.sessions);
        const pool = real.length
          ? real
          : c.plans.filter((p) => p.price && p.sessions);
        const min = pool.length
          ? Math.min(...pool.map((p) => p.price / p.sessions))
          : null;
        return (
          '<article class="category-card reveal ' +
          (i === 1 ? "category-featured" : "") +
          '"><div class="category-top"><span>' +
          n(i + 1).padStart(2, "۰") +
          "</span>" +
          icon(i === 0 ? "dumbbell" : i === 1 ? "shield" : "activity") +
          "</div><h3>" +
          e(c.name) +
          "</h3><p>" +
          e(c.summary) +
          '</p><div class="category-rate">' +
          (min !== null
            ? "<span>هر جلسه از " +
              (!real.length ? sample("قیمت نمونه") : "") +
              "</span><strong>" +
              n(min) +
              " <small>تومان</small></strong>"
            : "<strong>قیمت به‌زودی</strong>") +
          '</div><a class="button ' +
          (i === 1 ? "button-dark" : "button-outline") +
          '" href="./plans.html#' +
          c.id +
          '">مشاهده ' +
          n(c.plans.length) +
          " پلن" +
          icon("arrow") +
          "</a></article>"
        );
      })
      .join("") +
    "</div></div></section>"
  );
}

function gallerySection(d) {
  return (
    '<section id="gallery" class="section gallery-section"><div class="container">' +
    sectionHead(
      "گالری باشگاه",
      "نگاهی از نزدیک.",
      "فضای تمرین، انرژی حرکت و آرامش پس از آن.",
    ) +
    '<div class="gallery-grid">' +
    d.gallery
      .map((g, i) => {
        const src = safeURL(g.image, "image");
        const inner =
          '<div class="gallery-photo">' +
          imageMarkup(g.image, g.alt) +
          (g.sample ? sample(src ? "تصویر نمونه" : "محل تصویر") : "") +
          (src
            ? '<span class="expand-icon">' + icon("expand") + "</span>"
            : "") +
          '</div><div class="gallery-caption"><span>' +
          e(g.title) +
          "</span><span>" +
          n(i + 1).padStart(2, "۰") +
          "</span></div>";
        return src
          ? '<button class="gallery-item reveal" data-gallery="' +
              i +
              '" aria-label="بزرگ‌نمایی ' +
              e(g.title) +
              '">' +
              inner +
              "</button>"
          : '<div class="gallery-item reveal">' + inner + "</div>";
      })
      .join("") +
    "</div>" +
    (d.gallery.some((g) => g.sample)
      ? '<p class="fine-print">تصاویر نمونه، تصویر واقعی مجموعه آرسیس نیستند و با تصاویر باشگاه جایگزین خواهند شد.</p>'
      : "") +
    "</div></section>"
  );
}

function teamCard(t) {
  const src = safeURL(t.image, "image");
  return (
    '<article class="team-card reveal"><div class="team-photo">' +
    (src
      ? imageMarkup(t.image, t.name)
      : '<div class="person-placeholder">' +
        icon("user") +
        "<span>تصویر " +
        (t.group === "management" ? "مدیر" : "مربی") +
        "</span></div>") +
    (t.sample ? sample("اطلاعات نمونه") : "") +
    '</div><div class="team-info"><p class="eyebrow">' +
    e(t.role) +
    "</p><h3>" +
    e(t.name) +
    "</h3><p>" +
    e(t.bio) +
    "</p></div></article>"
  );
}

function faqSection(d) {
  if (!d.faq.length) return "";
  return (
    '<section class="section faq-section"><div class="container faq-layout"><div class="reveal"><p class="eyebrow">پیش از شروع</p><h2>شاید سؤال شما هم باشد.</h2><p class="muted">برای اطلاعات بیشتر با مجموعه در ارتباط باشید.</p>' +
    arrowLink("./contact.html", "تماس با آرسیس") +
    '</div><div class="faq-list">' +
    d.faq
      .map(
        (f) =>
          '<details class="reveal"><summary>' +
          e(f.question) +
          icon("plus") +
          "</summary><p>" +
          e(f.answer) +
          "</p></details>",
      )
      .join("") +
    "</div></div></section>"
  );
}

function contactStrip(d) {
  return (
    '<section class="contact-strip"><div class="container contact-strip-inner reveal"><div><p class="eyebrow">شروع یک مسیر تازه</p><h2>جای شما در آرسیس خالی‌ست.</h2><p>برای آشنایی با مجموعه و شرایط عضویت با ما در ارتباط باشید.</p></div><a class="button button-dark" href="./contact.html">تماس با باشگاه' +
    icon("arrow") +
    "</a></div></section>"
  );
}

function homePage(d) {
  return (
    '<section class="hero"><div class="container hero-grid"><div class="hero-copy"><p class="eyebrow">' +
    icon("pin") +
    e(d.home.eyebrow) +
    "</p><h1>" +
    e(d.home.titleLine1) +
    "<span>" +
    e(d.home.titleLine2) +
    '</span></h1><p class="hero-description">' +
    e(d.home.description) +
    '</p><div class="hero-actions"><a class="button button-dark" href="./plans.html">مشاهده پلن‌های عضویت' +
    icon("arrow") +
    '</a><a class="hero-secondary" href="#about">آشنایی با آرسیس' +
    icon("down") +
    '</a></div><div class="hero-disciplines"><span>بدنسازی</span><span>کراس‌فیت</span><span>سونا و جکوزی</span></div></div><div class="hero-visual">' +
    imageMarkup(d.home.heroImage, d.home.heroAlt, "hero-photo", true) +
    (d.home.heroSample ? sample("تصویر نمونه") : "") +
    '<div class="hero-image-caption"><span>فضایی برای<br><strong>نسخه قوی‌تر شما.</strong></span><span class="caption-arrow">' +
    icon("arrow") +
    '</span></div></div></div></section><section id="about" class="about-section section"><div class="container about-grid reveal"><div><p class="eyebrow">به آرسیس خوش آمدید</p><h2>' +
    e(d.home.aboutTitle).replaceAll("\n", "<br>") +
    "</h2></div><div><p>" +
    e(d.home.aboutDescription) +
    '</p><span class="about-note">باشگاه اختصاصی آقایان · محدوده دریاچه چیتگر</span></div></div></section>' +
    facilities(d) +
    membershipSummary(d) +
    gallerySection(d) +
    '<section class="section"><div class="container">' +
    sectionHead(
      "تیم آرسیس",
      "کنار شما، در مسیر پیشرفت.",
      "آشنایی با مربیان و همراهان شما در مجموعه.",
      arrowLink("./team.html", "مربیان و مدیریت"),
    ) +
    '<div class="team-grid">' +
    d.team
      .filter((t) => t.group === "trainer")
      .slice(0, 3)
      .map(teamCard)
      .join("") +
    "</div></div></section>" +
    faqSection(d) +
    '<section class="section home-hours"><div class="container hours-brief"><div><p class="eyebrow">زمان تمرین شما</p><h2>ساعات فعالیت مجموعه</h2></div><div class="schedule-list">' +
    d.schedule
      .map(
        (s) =>
          "<div><span>" +
          e(s.label) +
          "</span><span>" +
          e(s.value) +
          "</span></div>",
      )
      .join("") +
    "</div></div></section>" +
    contactStrip(d)
  );
}

function planCard(p) {
  return (
    '<article class="plan-card ' +
    (p.best ? "best-plan" : "") +
    '"><div class="plan-flag">' +
    (p.best
      ? "<span>کمترین هزینه هر جلسه</span>"
      : "<span>" + e(p.name) + "</span>") +
    '</div><div class="plan-body"><div class="plan-name">' +
    e(p.name) +
    (p.sample ? sample("نمونه") : "") +
    "</div><h3>" +
    (p.sessions !== null ? n(p.sessions) : "—") +
    ' <span>جلسه</span></h3><p class="plan-validity">' +
    (p.days !== null ? n(p.days) + " روز مهلت استفاده" : "اعتبار به‌زودی") +
    '</p><div class="unit-price"><span>هزینه هر جلسه</span><strong>' +
    (p.perSession !== null ? n(p.perSession) : "—") +
    '</strong><span>تومان</span></div><p class="plan-saving">' +
    (p.saving > 0
      ? n(p.savingPercent) +
        "٪ کمتر از پلن " +
        n(p.baselineSessions) +
        " جلسه‌ای"
      : "مبنای مقایسه در همین دسته") +
    '</p><div class="total-price"><span>مبلغ کل</span><strong>' +
    (p.price !== null ? n(p.price) : "—") +
    ' <small>تومان</small></strong></div><a class="button ' +
    (p.best ? "button-dark" : "button-outline") +
    '" href="./contact.html">اطلاعات بیشتر' +
    icon("arrow") +
    "</a></div></article>"
  );
}

function plansPage(d) {
  return (
    '<section class="page-intro"><div class="container"><p class="eyebrow">پلن‌های عضویت</p><h1>تمرین با برنامه.<br><span>انتخاب با آگاهی.</span></h1><p>پلن مناسب را با توجه به تعداد جلسات، زمان استفاده و هزینه هر جلسه انتخاب کنید.</p></div></section><section class="section plan-selection"><div class="container"><div class="plan-tabs" role="tablist" aria-label="نوع عضویت">' +
    d.categories
      .map(
        (c, i) =>
          '<button id="tab-' +
          c.id +
          '" type="button" role="tab" aria-selected="' +
          (i === 0) +
          '" aria-controls="panel-' +
          c.id +
          '" tabindex="' +
          (i === 0 ? 0 : -1) +
          '" data-plan-tab="' +
          c.id +
          '">' +
          e(c.name) +
          "<span>" +
          n(c.plans.length) +
          " پلن</span></button>",
      )
      .join("") +
    "</div>" +
    d.categories
      .map(
        (c, i) =>
          '<div id="panel-' +
          c.id +
          '" role="tabpanel" aria-labelledby="tab-' +
          c.id +
          '" tabindex="0" ' +
          (i === 0 ? "" : "hidden") +
          '><div class="category-description"><div><h2>' +
          e(c.name) +
          "</h2><p>" +
          e(c.summary) +
          "</p></div><p>" +
          e(c.description) +
          "</p></div>" +
          (c.plans.some((p) => p.sample)
            ? '<div class="sample-notice">' +
              icon("image") +
              "<p>پلن‌های دارای برچسب «نمونه» صرفاً برای نمایش هستند؛ قیمت و شرایط واقعی باشگاه هنوز درج نشده است.</p></div>"
            : "") +
          '<div class="plan-grid">' +
          comparePlans(c.plans).map(planCard).join("") +
          '</div><div class="plan-inclusions"><h3>خدمات این دسته</h3><ul>' +
          c.inclusions
            .map((item) => "<li>" + icon("check") + e(item) + "</li>")
            .join("") +
          "</ul></div></div>",
      )
      .join("") +
    '<div class="comparison-note"><div>' +
    icon("activity") +
    '<h3>مقایسه هزینه هر جلسه</h3></div><p>مبلغ کل ÷ تعداد جلسات = هزینه هر جلسه. درصد کاهش هزینه نسبت به پلن با کمترین تعداد جلسات در همان دسته محاسبه می‌شود. مهلت استفاده و خدمات هر دسته را هم در انتخاب در نظر بگیرید.</p><p>قیمت‌های نمونه فقط با نمونه‌ها و قیمت‌های واقعی فقط با قیمت‌های واقعی مقایسه می‌شوند. مبالغ نمایشی به نزدیک‌ترین تومان گرد شده‌اند.</p></div><div class="plan-terms"><h3>شرایط عضویت</h3><p>' +
    e(d.planNote) +
    "</p></div></div></section>" +
    contactStrip(d)
  );
}

function teamPage(d) {
  return (
    '<section class="page-intro"><div class="container"><p class="eyebrow">تیم آرسیس</p><h1>پیشرفت شما،<br><span>همراهی ما.</span></h1><p>با مربیان و مدیریت مجموعه آشنا شوید.</p></div></section><section class="section team-page"><div class="container">' +
    sectionHead("همراه تمرین شما", "مربیان مجموعه") +
    '<div class="team-grid">' +
    d.team
      .filter((t) => t.group === "trainer")
      .map(teamCard)
      .join("") +
    '</div></div></section><section class="section management-section"><div class="container">' +
    sectionHead("پشت صحنه آرسیس", "مدیریت مجموعه") +
    '<div class="management-grid">' +
    d.team
      .filter((t) => t.group === "management")
      .map(teamCard)
      .join("") +
    "</div></div></section>" +
    contactStrip(d)
  );
}

function contactPage(d) {
  const phone = phoneURL(d.contact.phone),
    map = safeURL(d.contact.mapUrl),
    mapEmbed = safeURL(d.contact.mapEmbedUrl),
    insta = safeURL(d.contact.instagram);
  return (
    '<section class="page-intro"><div class="container"><p class="eyebrow">تماس با آرسیس</p><h1>یک قدم تا<br><span>شروع مسیر شما.</span></h1><p>برای آشنایی بیشتر با مجموعه و پلن‌ها با ما تماس بگیرید.</p></div></section><section class="section contact-section"><div class="container contact-layout"><div class="contact-details"><article class="contact-block">' +
    icon("phone") +
    "<div><h2>تماس با باشگاه</h2>" +
    (phone
      ? '<a class="contact-number" href="' +
        phone +
        '" dir="ltr">' +
        e(d.contact.phone) +
        "</a>"
      : '<p class="muted">شماره تماس به‌زودی اعلام می‌شود.</p>') +
    '</div></article><article class="contact-block">' +
    icon("pin") +
    '<div><h2>نشانی مجموعه</h2><p class="preserve-lines">' +
    e(d.contact.address) +
    "</p>" +
    (map
      ? '<a class="text-link" href="' +
        e(map) +
        '" target="_blank" rel="noopener noreferrer">مسیریابی' +
        icon("arrow") +
        "</a>"
      : "") +
    '</div></article><article class="contact-block">' +
    icon("clock") +
    '<div><h2>ساعات فعالیت</h2><div class="schedule-list">' +
    d.schedule
      .map(
        (s) =>
          "<div><span>" +
          e(s.label) +
          "</span><span>" +
          e(s.value) +
          "</span></div>",
      )
      .join("") +
    "</div></div></article>" +
    (insta
      ? '<article class="contact-block">' +
        icon("instagram") +
        '<div><h2>اینستاگرام آرسیس</h2><a class="text-link" href="' +
        e(insta) +
        '" target="_blank" rel="noopener noreferrer">مشاهده صفحه' +
        icon("arrow") +
        "</a></div></article>"
      : "") +
    '</div><div class="location-panel">' +
    (mapEmbed
      ? '<div class="map-embed"><iframe src="' +
        e(mapEmbed) +
        '" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" title="موقعیت باشگاه آرسیس"></iframe></div>'
      : '<div class="location-placeholder">' +
        icon("pin") +
        "<span>تهران</span><strong>دریاچه چیتگر</strong><p>موقعیت دقیق مجموعه به‌زودی درج می‌شود.</p>" +
        "</div>") +
    '<div class="directions-note"><h2>راهنمای مراجعه</h2><p>' +
    e(d.contact.directions) +
    "</p></div></div></div></section>"
  );
}
export function renderPage(page, d) {
  return (
    { home: homePage, plans: plansPage, team: teamPage, contact: contactPage }[
      page
    ] || homePage
  )(d);
}

function wireGallery(d) {
  const items = d.gallery
    .map((g, i) => ({ ...g, index: i }))
    .filter((g) => safeURL(g.image, "image"));
  if (!items.length) return;
  const dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.setAttribute("aria-labelledby", "lightbox-title");
  dialog.innerHTML =
    '<div class="lightbox-shell"><button type="button" class="icon-button lightbox-close" aria-label="بستن تصویر">' +
    icon("close") +
    '</button><figure><img width="1536" height="1024" alt=""><figcaption id="lightbox-title"></figcaption></figure><div class="lightbox-controls"><button class="icon-button lightbox-prev" aria-label="تصویر قبلی">' +
    icon("arrow", "flipped") +
    '</button><span class="lightbox-count"></span><button class="icon-button lightbox-next" aria-label="تصویر بعدی">' +
    icon("arrow") +
    "</button></div></div>";
  document.body.append(dialog);
  let current = 0;
  const show = (index) => {
    current = (index + items.length) % items.length;
    const g = items[current];
    const img = dialog.querySelector("img");
    img.src = safeURL(g.image, "image");
    img.alt = g.alt;
    dialog.querySelector("figcaption").textContent =
      g.title + (g.sample ? " · تصویر نمونه" : "");
    dialog.querySelector(".lightbox-count").textContent =
      n(current + 1) + " / " + n(items.length);
  };
  document.querySelectorAll("[data-gallery]").forEach((button) =>
    button.addEventListener("click", () => {
      show(items.findIndex((g) => g.index === Number(button.dataset.gallery)));
      dialog.showModal();
      document.body.classList.add("modal-open");
    }),
  );
  dialog
    .querySelector(".lightbox-close")
    .addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("close", () =>
    document.body.classList.remove("modal-open"),
  );
  dialog
    .querySelector(".lightbox-prev")
    .addEventListener("click", () => show(current - 1));
  dialog
    .querySelector(".lightbox-next")
    .addEventListener("click", () => show(current + 1));
  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(current + 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(current - 1);
    }
  });
}

function wireTabs(d) {
  const tabs = [...document.querySelectorAll("[data-plan-tab]")];
  if (!tabs.length) return;
  const select = (id, focus = false) => {
    tabs.forEach((tab) => {
      const active = tab.dataset.planTab === id;
      tab.setAttribute("aria-selected", String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById("panel-" + tab.dataset.planTab).hidden = !active;
      if (active && focus) tab.focus();
    });
  };
  const initial = location.hash.slice(1);
  if (d.categories.some((c) => c.id === initial)) select(initial);
  tabs.forEach((tab, i) => {
    tab.addEventListener("click", () => {
      select(tab.dataset.planTab);
      history.replaceState(null, "", "#" + tab.dataset.planTab);
    });
    tab.addEventListener("keydown", (event) => {
      let next;
      if (event.key === "ArrowLeft") next = (i + 1) % tabs.length;
      if (event.key === "ArrowRight")
        next = (i - 1 + tabs.length) % tabs.length;
      if (event.key === "Home") next = 0;
      if (event.key === "End") next = tabs.length - 1;
      if (next !== undefined) {
        event.preventDefault();
        select(tabs[next].dataset.planTab, true);
        history.replaceState(null, "", "#" + tabs[next].dataset.planTab);
      }
    });
  });
}

async function start() {
  const page = document.body.dataset.page || "home";
  try {
    let draft = null;
    const preview = new URLSearchParams(location.search).get("preview") === "1";
    if (preview) {
      try {
        draft = readDraft();
      } catch {
        draft = null;
      }
    }
    const d = draft || (await fetchContent());
    document.getElementById("site-header").innerHTML = renderHeader(d, page);
    document.getElementById("main").innerHTML = renderPage(page, d);
    document.getElementById("site-footer").innerHTML = renderFooter(d);
    document.title =
      ({
        home: "باشگاه ورزشی آقایان در چیتگر",
        plans: "پلن‌های عضویت",
        team: "مربیان و مدیریت",
        contact: "تماس با ما",
      }[page] || "باشگاه ورزشی") +
      " | " +
      d.brand.name;
    if (preview) {
      const notice = document.createElement("div");
      notice.className = "draft-banner";
      notice.innerHTML =
        "<span>" +
        (draft
          ? "پیش‌نمایش محلی؛ این تغییرات هنوز منتشر نشده‌اند."
          : "پیش‌نویسی در این مرورگر نیست؛ محتوای منتشرشده نمایش داده می‌شود.") +
        '</span><a href="./editor.html">بازگشت به ویرایشگر</a>';
      document.getElementById("site-header").after(notice);
      document.querySelectorAll('a[href^="./"]').forEach((a) => {
        const url = new URL(a.href);
        if (
          url.pathname.endsWith(".html") &&
          !url.pathname.endsWith("editor.html")
        ) {
          url.searchParams.set("preview", "1");
          a.href = url.href;
        }
      });
    }
    const toggle = document.querySelector(".menu-toggle"),
      nav = document.querySelector(".primary-nav");
    const close = () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "باز کردن منو");
      nav.classList.remove("is-open");
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "بستن منو" : "باز کردن منو");
      nav.classList.toggle("is-open", open);
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
    document.addEventListener("keydown", (event) => {
      if (
        event.key === "Escape" &&
        toggle.getAttribute("aria-expanded") === "true"
      ) {
        close();
        toggle.focus();
      }
    });
    document.addEventListener("click", (event) => {
      if (!event.target.closest(".header-inner")) close();
    });
    matchMedia("(min-width: 1001px)").addEventListener("change", close);
    wireTabs(d);
    wireGallery(d);
    document.querySelectorAll("img").forEach((img) => {
      const onError = () => {
        img.hidden = true;
        const message = document.createElement("span");
        message.className = "image-fallback";
        message.textContent = "تصویر در دسترس نیست";
        img.after(message);
      };
      img.addEventListener("error", onError, { once: true });
      if (img.complete && !img.naturalWidth) onError();
    });
    if (
      !matchMedia("(prefers-reduced-motion: reduce)").matches &&
      "IntersectionObserver" in window
    ) {
      const observer = new IntersectionObserver(
        (entries) =>
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.remove("reveal-ready");
              observer.unobserve(entry.target);
            }
          }),
        { threshold: 0.07 },
      );
      document.querySelectorAll(".reveal").forEach((el) => {
        if (el.getBoundingClientRect().top > innerHeight) {
          el.classList.add("reveal-ready");
          observer.observe(el);
        }
      });
    }
    const anchor = location.hash.slice(1);
    const target = document.getElementById(anchor);
    if (target && !anchor.startsWith("panel-"))
      requestAnimationFrame(() =>
        target.scrollIntoView({ behavior: "instant", block: "start" }),
      );
  } catch (error) {
    document.getElementById("main").innerHTML =
      '<div class="container load-state"><h1>اطلاعات باشگاه در دسترس نیست</h1><p>' +
      e(error.message) +
      '</p><a class="button button-dark" href="' +
      e(location.pathname) +
      '">تلاش دوباره</a></div>';
  }
}
if (typeof document !== "undefined" && document.body?.dataset.page) start();
