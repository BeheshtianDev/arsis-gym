export const DRAFT_KEY = "arsis.content.draft.v1";
export const fa = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
export const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
export const number = (value) => fa.format(value);

export function safeURL(value, kind = "link") {
  if (typeof value !== "string" || !value.trim()) return "";
  const url = value.trim();
  if (/[\u0000-\u0020\u007f\\]/.test(url)) return "";
  if (
    kind === "image" &&
    /^(?:\.\/)?assets\/[\w\-./%]+\.(?:png|jpe?g|webp|avif|svg)$/i.test(url) &&
    !url.split("/").includes("..")
  )
    return url;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return "";
    if (parsed.username || parsed.password) return "";
    return parsed.href;
  } catch {
    return "";
  }
}

export function phoneURL(value) {
  const normalized = String(value ?? "")
    .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
    .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632))
    .replace(/[\s()\-]/g, "");
  return /^\+?\d{7,15}$/.test(normalized) ? "tel:" + normalized : "";
}

export function comparePlans(plans) {
  return plans.map((plan) => {
    const usable = (p) =>
      Number.isFinite(p.price) &&
      p.price > 0 &&
      Number.isInteger(p.sessions) &&
      p.sessions > 0;
    if (!usable(plan))
      return {
        ...plan,
        perSession: null,
        saving: 0,
        savingPercent: 0,
        best: false,
        baselineSessions: null,
      };
    // Compare only within a category and the same sample/published cohort.
    const cohort = plans.filter((p) => usable(p) && p.sample === plan.sample);
    const baseline = [...cohort].sort(
      (a, b) => a.sessions - b.sessions || a.price - b.price,
    )[0];
    const baselineRate = baseline.price / baseline.sessions;
    const rate = plan.price / plan.sessions;
    const minimum = Math.min(...cohort.map((p) => p.price / p.sessions));
    return {
      ...plan,
      perSession: rate,
      saving: Math.max(0, baselineRate - rate),
      savingPercent: Math.max(0, (1 - rate / baselineRate) * 100),
      best: cohort.length > 1 && Math.abs(rate - minimum) < 0.001,
      baselineSessions: baseline.sessions,
    };
  });
}

export function validateContent(data) {
  const fail = (msg) => {
    throw new Error(msg);
  };
  const obj = (o, name) => {
    if (!o || typeof o !== "object" || Array.isArray(o))
      fail("ساختار «" + name + "» معتبر نیست.");
  };
  const str = (v, name, max = 6000) => {
    if (typeof v !== "string" || v.length > max)
      fail("متن «" + name + "» معتبر نیست.");
  };
  const bool = (v, name) => {
    if (typeof v !== "boolean") fail("وضعیت «" + name + "» معتبر نیست.");
  };
  const arr = (v, name, max = 100) => {
    if (!Array.isArray(v) || v.length > max)
      fail("فهرست «" + name + "» معتبر نیست.");
  };
  const fields = (o, keys, name) => {
    obj(o, name);
    keys.forEach((k) => str(o[k], name + " / " + k));
  };
  const url = (v, name, kind = "link") => {
    str(v, name, 3000);
    if (v && !safeURL(v, kind))
      fail(
        "آدرس «" +
          name +
          "» معتبر نیست. برای تصویر از assets/... یا نشانی HTTPS استفاده کنید.",
      );
  };
  obj(data, "محتوا");
  if (data.version !== 1) fail("نسخه فایل پشتیبانی نمی‌شود.");
  fields(data.brand, ["name", "latinName", "tagline", "logo"], "هویت");
  url(data.brand.logo, "لوگو", "image");
  fields(
    data.home,
    [
      "eyebrow",
      "titleLine1",
      "titleLine2",
      "description",
      "heroImage",
      "heroAlt",
      "aboutTitle",
      "aboutDescription",
    ],
    "صفحه اصلی",
  );
  url(data.home.heroImage, "تصویر اصلی", "image");
  bool(data.home.heroSample, "تصویر نمونه");
  arr(data.features, "امکانات");
  data.features.forEach((f) => {
    fields(f, ["title", "description", "icon"], "امکان");
  });
  arr(data.categories, "دسته‌های پلن", 3);
  if (data.categories.length !== 3) fail("سه دسته پلن باید موجود باشد.");
  const requiredIds = ["normal", "vip", "crossfit"];
  if (
    new Set(data.categories.map((c) => c?.id)).size !== 3 ||
    data.categories.some((c) => !requiredIds.includes(c?.id))
  )
    fail("شناسه دسته‌های پلن معتبر نیست.");
  const ids = new Set();
  data.categories.forEach((c) => {
    fields(c, ["id", "name", "summary", "description"], "دسته پلن");
    arr(c.inclusions, "خدمات پلن", 30);
    c.inclusions.forEach((v) => str(v, "خدمات"));
    arr(c.plans, "پلن‌ها", 50);
    c.plans.forEach((p) => {
      fields(p, ["id", "name"], "پلن");
      if (!p.id || ids.has(p.id)) fail("شناسه پلن‌ها باید یکتا باشد.");
      ids.add(p.id);
      bool(p.sample, "قیمت نمونه");
      for (const k of ["sessions", "days"])
        if (
          p[k] !== null &&
          (!Number.isSafeInteger(p[k]) || p[k] <= 0 || p[k] > 10000)
        )
          fail("تعداد جلسات و اعتبار باید عدد صحیح مثبت یا خالی باشد.");
      if (
        p.price !== null &&
        (!Number.isSafeInteger(p.price) ||
          p.price <= 0 ||
          p.price > 1000000000000)
      )
        fail("قیمت باید عدد صحیح مثبت به تومان یا خالی باشد.");
    });
  });
  arr(data.team, "تیم");
  data.team.forEach((t) => {
    fields(t, ["id", "name", "role", "group", "bio", "image"], "عضو تیم");
    if (!["trainer", "management"].includes(t.group))
      fail("گروه عضو تیم معتبر نیست.");
    url(t.image, "تصویر تیم", "image");
    bool(t.sample, "عضو نمونه");
  });
  arr(data.gallery, "گالری");
  data.gallery.forEach((g) => {
    fields(g, ["id", "title", "image", "alt"], "گالری");
    url(g.image, "عکس گالری", "image");
    bool(g.sample, "عکس نمونه");
  });
  arr(data.schedule, "ساعات");
  data.schedule.forEach((s) => fields(s, ["label", "value"], "ساعات"));
  arr(data.faq, "پرسش‌ها");
  data.faq.forEach((f) => fields(f, ["question", "answer"], "پرسش"));
  fields(
    data.contact,
    ["phone", "address", "mapUrl", "instagram", "directions"],
    "تماس",
  );
  if (data.contact.phone && !phoneURL(data.contact.phone))
    fail(
      "شماره تماس معتبر نیست. فقط رقم، فاصله، خط تیره و پیش‌شماره مجاز است.",
    );
  url(data.contact.mapUrl, "نقشه");
  url(data.contact.instagram, "اینستاگرام");
  str(data.planNote, "شرایط پلن");
  return data;
}

export async function fetchContent() {
  const response = await fetch("./content.json", { cache: "no-cache" });
  if (!response.ok)
    throw new Error(
      "دریافت اطلاعات باشگاه ممکن نشد. لطفاً صفحه را دوباره بارگذاری کنید.",
    );
  return validateContent(await response.json());
}

export function readDraft() {
  const raw = localStorage.getItem(DRAFT_KEY);
  return raw ? validateContent(JSON.parse(raw)) : null;
}
