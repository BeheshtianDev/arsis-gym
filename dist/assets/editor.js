import {
  DRAFT_KEY,
  escapeHTML as e,
  number as n,
  comparePlans,
  fetchContent,
  readDraft,
  validateContent,
} from "./content.js";
import { icon } from "./app.js";

let content,
  published,
  panel = "identity",
  dirty = false;
const sections = [
  ["identity", "هویت و صفحه اصلی", "image"],
  ["features", "امکانات باشگاه", "dumbbell"],
  ["plans", "پلن‌های عضویت", "activity"],
  ["team", "مربیان و مدیریت", "user"],
  ["gallery", "گالری تصاویر", "image"],
  ["contact", "تماس و ساعات فعالیت", "phone"],
  ["faq", "پرسش‌های متداول", "plus"],
];
const root = document.getElementById("editor-root");
const get = (path) =>
  path.split(".").reduce((value, key) => value?.[key], content);
function set(path, value) {
  const parts = path.split(".");
  if (
    parts.some((key) => ["__proto__", "prototype", "constructor"].includes(key))
  )
    throw new Error("مسیر نامعتبر");
  const key = parts.pop();
  const parent = parts.reduce((o, k) => o[k], content);
  parent[key] = value;
  dirty = true;
}
function status(message, error = false, success = false) {
  const box = document.getElementById("editor-status");
  box.textContent = message;
  box.className =
    "editor-status" +
    (error ? " is-error" : "") +
    (success ? " is-success" : "");
}
const clone = (value) => JSON.parse(JSON.stringify(value));

function field(
  path,
  label,
  { type = "text", full = false, hint = "", options = [] } = {},
) {
  const value = get(path),
    id = "field-" + path.replaceAll(".", "-");
  if (type === "checkbox")
    return (
      '<label class="editor-checkbox" for="' +
      id +
      '"><input id="' +
      id +
      '" type="checkbox" data-path="' +
      path +
      '" ' +
      (value ? "checked" : "") +
      ">" +
      e(label) +
      "</label>"
    );
  let control;
  if (type === "textarea" || type === "lines")
    control =
      '<textarea id="' +
      id +
      '" data-path="' +
      path +
      '" ' +
      (type === "lines" ? 'data-lines="true"' : "") +
      ' rows="3">' +
      e(type === "lines" ? value.join("\n") : value) +
      "</textarea>";
  else if (type === "select")
    control =
      '<select id="' +
      id +
      '" data-path="' +
      path +
      '">' +
      options
        .map(
          ([v, l]) =>
            '<option value="' +
            e(v) +
            '" ' +
            (value === v ? "selected" : "") +
            ">" +
            e(l) +
            "</option>",
        )
        .join("") +
      "</select>";
  else
    control =
      '<input id="' +
      id +
      '" data-path="' +
      path +
      '" type="text" ' +
      (["number", "url", "phone"].includes(type) ? 'dir="ltr" ' : "") +
      (type === "number" ? 'inputmode="numeric" data-number="true" ' : "") +
      (type === "phone" ? 'inputmode="tel" ' : "") +
      'value="' +
      e(value) +
      '" ' +
      (type === "url" ? 'spellcheck="false" ' : "") +
      ">";
  return (
    '<div class="editor-field ' +
    (full ? "full-width" : "") +
    '"><label for="' +
    id +
    '">' +
    e(label) +
    "</label>" +
    control +
    (hint ? "<small>" + e(hint) + "</small>" : "") +
    "</div>"
  );
}
const fieldGrid = (html) => '<div class="fields-grid">' + html + "</div>";
function controls(path, index, length) {
  return (
    '<div class="entry-actions"><button type="button" data-move="-1" data-array="' +
    path +
    '" data-index="' +
    index +
    '" ' +
    (index === 0 ? "disabled" : "") +
    ' aria-label="انتقال مورد ' +
    n(index + 1) +
    ' به بالا">بالاتر</button><button type="button" data-move="1" data-array="' +
    path +
    '" data-index="' +
    index +
    '" ' +
    (index === length - 1 ? "disabled" : "") +
    ' aria-label="انتقال مورد ' +
    n(index + 1) +
    ' به پایین">پایین‌تر</button><button type="button" class="delete-entry" data-delete="' +
    path +
    '" data-index="' +
    index +
    '">حذف</button></div>'
  );
}
const entry = (title, path, index, length, inner) =>
  '<section class="editor-entry"><div class="entry-head"><h3>' +
  e(title) +
  "</h3>" +
  controls(path, index, length) +
  "</div>" +
  inner +
  "</section>";
const add = (path, label) =>
  '<button type="button" class="add-entry" data-add="' +
  path +
  '">' +
  icon("plus") +
  e(label) +
  "</button>";
const lead = (title, description) =>
  "<h2>" +
  e(title) +
  '</h2><p class="panel-description">' +
  e(description) +
  "</p>";
const urlHint =
  "مسیر محلی مثل ./assets/images/photo.webp یا نشانی کامل HTTPS. فایل تصویر را جداگانه در پوشه تصاویر قرار دهید.";

function renderIdentity() {
  return (
    lead(
      "هویت و صفحه اصلی",
      "متن‌ها را ویرایش کنید. اگر مسیر لوگو خالی باشد، نام آرسیس به‌صورت نوشتاری نمایش داده می‌شود.",
    ) +
    fieldGrid(
      field("brand.name", "نام فارسی") +
        field("brand.latinName", "نام لاتین") +
        field("brand.tagline", "توضیح کنار نام") +
        field("brand.logo", "مسیر لوگو", { type: "url", hint: urlHint }) +
        field("home.eyebrow", "موقعیت بالای عنوان") +
        field("home.titleLine1", "خط اول عنوان اصلی") +
        field("home.titleLine2", "خط دوم عنوان اصلی") +
        field("home.description", "توضیح اصلی", {
          type: "textarea",
          full: true,
        }) +
        field("home.heroImage", "مسیر تصویر اصلی", {
          type: "url",
          full: true,
          hint: urlHint,
        }) +
        field("home.heroAlt", "توضیح دسترس‌پذیر تصویر اصلی", { full: true }) +
        field(
          "home.heroSample",
          "تصویر اصلی نمونه است؛ برچسب نمونه نمایش داده شود.",
          { type: "checkbox" },
        ) +
        field("home.aboutTitle", "عنوان معرفی مجموعه", { type: "textarea" }) +
        field("home.aboutDescription", "متن معرفی مجموعه", {
          type: "textarea",
        }),
    ) +
    '<p class="editor-inline-note">برای جایگزینی فونت، راهنمای دارایی‌ها را بخوانید. رنگ اصلی از فایل assets/brand.css قابل تغییر است.</p>'
  );
}
function renderFeatures() {
  return (
    lead(
      "امکانات باشگاه",
      "امکانات جدید اضافه کنید، متن هر مورد را تغییر دهید و ترتیب نمایش را تنظیم کنید.",
    ) +
    content.features
      .map((f, i) =>
        entry(
          f.title || "امکان جدید",
          "features",
          i,
          content.features.length,
          fieldGrid(
            field("features." + i + ".title", "عنوان") +
              field("features." + i + ".icon", "آیکون", {
                type: "select",
                options: [
                  ["dumbbell", "بدنسازی"],
                  ["activity", "تمرین"],
                  ["steam", "سونا"],
                  ["waves", "آب و جکوزی"],
                  ["shield", "خدمات ویژه"],
                  ["clock", "زمان"],
                  ["plus", "عمومی"],
                ],
              }) +
              field("features." + i + ".description", "توضیح", {
                type: "textarea",
                full: true,
              }),
          ),
        ),
      )
      .join("") +
    add("features", "افزودن امکان جدید")
  );
}
function renderPlans() {
  return (
    lead(
      "پلن‌های عضویت",
      "همه قیمت‌ها به تومان هستند. برای اطلاعات نامشخص، فیلد عددی را خالی بگذارید. برچسب نمونه را فقط پس از درج اطلاعات واقعی بردارید.",
    ) +
    content.categories
      .map((c, ci) => {
        const path = "categories." + ci;
        return (
          '<section class="editor-category"><h3>' +
          e(c.name) +
          " · " +
          n(c.plans.length) +
          " پلن</h3>" +
          fieldGrid(
            field(path + ".name", "نام دسته") +
              field(path + ".summary", "خلاصه دسته") +
              field(path + ".description", "توضیح خدمات دسته", {
                type: "textarea",
              }) +
              field(
                path + ".inclusions",
                "خدمات مشترک این دسته؛ هر مورد در یک خط",
                { type: "lines" },
              ),
          ) +
          c.plans
            .map((p, i) => {
              const prefix = path + ".plans." + i;
              const result = comparePlans(c.plans)[i];
              return entry(
                p.name || "پلن جدید",
                path + ".plans",
                i,
                c.plans.length,
                fieldGrid(
                  field(prefix + ".name", "نام پلن") +
                    field(prefix + ".sessions", "تعداد جلسات", {
                      type: "number",
                    }) +
                    field(prefix + ".days", "مهلت استفاده؛ روز", {
                      type: "number",
                    }) +
                    field(prefix + ".price", "قیمت کل؛ تومان", {
                      type: "number",
                    }) +
                    field(
                      prefix + ".sample",
                      "این پلن نمونه است و قیمت واقعی باشگاه نیست.",
                      { type: "checkbox" },
                    ),
                ) +
                  '<p class="editor-inline-note">هزینه هر جلسه در آخرین نمایش: ' +
                  (result.perSession !== null
                    ? n(result.perSession) + " تومان"
                    : "پس از ورود قیمت و تعداد جلسات محاسبه می‌شود") +
                  "</p>",
              );
            })
            .join("") +
          add(path + ".plans", "افزودن پلن به " + c.name) +
          "</section>"
        );
      })
      .join("") +
    '<hr class="editor-divider">' +
    fieldGrid(
      field("planNote", "شرایط عضویت و استفاده از پلن‌ها", {
        type: "textarea",
        full: true,
      }),
    )
  );
}
function renderTeam() {
  return (
    lead(
      "مربیان و مدیریت",
      "هر شخص را در گروه مربیان یا مدیریت قرار دهید. عکس و مشخصات نمونه را با اطلاعات واقعی جایگزین کنید.",
    ) +
    content.team
      .map((t, i) => {
        const p = "team." + i;
        return entry(
          t.name || "عضو جدید",
          "team",
          i,
          content.team.length,
          fieldGrid(
            field(p + ".name", "نام و نام خانوادگی") +
              field(p + ".role", "سمت یا تخصص") +
              field(p + ".group", "گروه", {
                type: "select",
                options: [
                  ["trainer", "مربی"],
                  ["management", "مدیریت"],
                ],
              }) +
              field(p + ".image", "مسیر عکس", { type: "url", hint: urlHint }) +
              field(p + ".bio", "معرفی و سوابق", {
                type: "textarea",
                full: true,
              }) +
              field(p + ".sample", "اطلاعات این عضو هنوز نمونه است.", {
                type: "checkbox",
              }),
          ),
        );
      })
      .join("") +
    add("team", "افزودن عضو تیم")
  );
}
function renderGallery() {
  return (
    lead(
      "گالری تصاویر",
      "عکس‌ها با کلیک بزرگ می‌شوند. برای خانه‌های خالی، مسیر تصویر را خالی بگذارید. فقط تصاویر مجاز برای انتشار را اضافه کنید.",
    ) +
    content.gallery
      .map((g, i) => {
        const p = "gallery." + i;
        return entry(
          g.title || "تصویر جدید",
          "gallery",
          i,
          content.gallery.length,
          fieldGrid(
            field(p + ".title", "عنوان تصویر") +
              field(p + ".image", "مسیر تصویر", {
                type: "url",
                hint: urlHint,
              }) +
              field(p + ".alt", "توضیح تصویر برای دسترس‌پذیری", {
                full: true,
              }) +
              field(
                p + ".sample",
                "این تصویر نمونه است؛ برچسب نمونه نمایش داده شود.",
                { type: "checkbox" },
              ),
          ),
        );
      })
      .join("") +
    add("gallery", "افزودن تصویر")
  );
}
function renderContact() {
  return (
    lead(
      "تماس و ساعات فعالیت",
      "شماره تماس خالی به‌صورت متن «به‌زودی» نمایش داده می‌شود. پیوند اینستاگرام و نقشه تا زمان ورود نشانی نمایش داده نمی‌شوند.",
    ) +
    fieldGrid(
      field("contact.phone", "شماره تماس", {
        type: "phone",
        hint: "نمونه قالب: 021xxxxxxxx یا +9821xxxxxxxx؛ شماره واقعی مجموعه را وارد کنید.",
      }) +
        field("contact.instagram", "پیوند اینستاگرام", { type: "url" }) +
        field("contact.address", "نشانی کامل", {
          type: "textarea",
          full: true,
        }) +
        field("contact.mapUrl", "پیوند موقعیت در نقشه", {
          type: "url",
          full: true,
        }) +
        field("contact.directions", "راهنمای دسترسی و مراجعه", {
          type: "textarea",
          full: true,
        }),
    ) +
    '<h3 class="editor-subheading">ساعات فعالیت</h3>' +
    content.schedule
      .map((s, i) =>
        entry(
          s.label || "بازه جدید",
          "schedule",
          i,
          content.schedule.length,
          fieldGrid(
            field("schedule." + i + ".label", "روز یا بازه") +
              field("schedule." + i + ".value", "ساعات فعالیت"),
          ),
        ),
      )
      .join("") +
    add("schedule", "افزودن بازه فعالیت")
  );
}
function renderFaq() {
  return (
    lead(
      "پرسش‌های متداول",
      "پاسخ‌ها را مطابق شرایط واقعی مجموعه بنویسید. پرسش‌های بدون نیاز را حذف کنید.",
    ) +
    content.faq
      .map((f, i) =>
        entry(
          "پرسش " + n(i + 1),
          "faq",
          i,
          content.faq.length,
          fieldGrid(
            field("faq." + i + ".question", "پرسش", { full: true }) +
              field("faq." + i + ".answer", "پاسخ", {
                type: "textarea",
                full: true,
              }),
          ),
        ),
      )
      .join("") +
    add("faq", "افزودن پرسش")
  );
}

function renderPanel() {
  document.getElementById("editor-panel").innerHTML = {
    identity: renderIdentity,
    features: renderFeatures,
    plans: renderPlans,
    team: renderTeam,
    gallery: renderGallery,
    contact: renderContact,
    faq: renderFaq,
  }[panel]();
  document.querySelectorAll("[data-panel]").forEach((b) => {
    if (b.dataset.panel === panel) b.setAttribute("aria-current", "page");
    else b.removeAttribute("aria-current");
  });
}
function saveDraft() {
  try {
    validateContent(content);
    localStorage.setItem(DRAFT_KEY, JSON.stringify(content));
    dirty = false;
    status(
      "پیش‌نویس در این مرورگر ذخیره شد. برای انتشار عمومی، خروجی JSON را جایگزین فایل سایت کنید.",
      false,
      true,
    );
    return true;
  } catch (error) {
    status(
      "ذخیره انجام نشد: " +
        error.message +
        " می‌توانید پس از اصلاح اطلاعات، خروجی فایل بگیرید.",
      true,
    );
    return false;
  }
}
function confirmChange(message) {
  return new Promise((resolve) => {
    const dialog = document.getElementById("confirm-dialog");
    dialog.querySelector("p").textContent = message;
    dialog.returnValue = "cancel";
    dialog.addEventListener(
      "close",
      () => resolve(dialog.returnValue === "confirm"),
      { once: true },
    );
    dialog.showModal();
  });
}
function newItem(path) {
  const id = () => crypto.randomUUID();
  if (path === "features")
    return {
      title: "امکان جدید",
      description: "توضیح این امکان را وارد کنید.",
      icon: "plus",
    };
  if (path === "team")
    return {
      id: id(),
      name: "نام عضو جدید",
      role: "سمت یا تخصص",
      group: "trainer",
      bio: "معرفی این عضو را وارد کنید.",
      image: "",
      sample: true,
    };
  if (path === "gallery")
    return {
      id: id(),
      title: "عنوان تصویر",
      image: "",
      alt: "توضیح تصویر",
      sample: true,
    };
  if (path === "schedule")
    return { label: "روز یا بازه جدید", value: "ساعات فعالیت" };
  if (path === "faq") return { question: "پرسش جدید", answer: "پاسخ پرسش" };
  if (/^categories\.\d\.plans$/.test(path))
    return {
      id: id(),
      name: "پلن جدید",
      sessions: null,
      days: null,
      price: null,
      sample: true,
    };
  throw new Error("فهرست ناشناخته");
}

async function start() {
  try {
    published = await fetchContent();
    let restored = null,
      warning = "";
    try {
      restored = readDraft();
    } catch {
      warning = "خواندن پیش‌نویس محلی ممکن نشد. محتوای منتشرشده بارگذاری شد.";
    }
    content = clone(restored || published);
    root.innerHTML =
      '<header class="editor-header"><div class="editor-header-inner"><div class="editor-title"><a class="brand-name" href="./index.html">آرسیس</a><h1>ویرایش محتوای سایت</h1></div><nav aria-label="پیوندهای ویرایشگر"><a href="./guide.html">راهنمای ویرایش و انتشار</a><a href="./index.html" target="_blank" rel="noopener">مشاهده سایت</a></nav></div></header><div class="editor-layout"><nav class="editor-sidebar" aria-label="بخش‌های ویرایشگر">' +
      sections
        .map(
          ([id, title, ico]) =>
            '<button type="button" data-panel="' +
            id +
            '">' +
            icon(ico) +
            title +
            "</button>",
        )
        .join("") +
      '<p class="sidebar-note">این ابزار، ویرایشگر محلی است. تغییر اطلاعات در این صفحه به‌تنهایی سایت منتشرشده را تغییر نمی‌دهد.</p></nav><main id="editor-main" class="editor-workspace"><div class="editor-notice"><strong>ویرایش، پیش‌نمایش، سپس انتشار</strong>۱. اطلاعات را تغییر دهید. ۲. پیش‌نمایش محلی را ببینید. ۳. فایل JSON را دریافت کنید و در پوشه سایت جایگزین کنید. این ویرایشگر ورود یا ذخیره‌سازی مشترک روی سرور ندارد.</div><div class="editor-toolbar"><button class="button button-dark" id="save-draft">ذخیره در این مرورگر</button><button class="button button-outline" id="preview-draft">پیش‌نمایش</button><button class="button button-dark" id="publish-site">اعمال تغییرات و انتشار</button><button class="button button-outline" id="reset-draft">بازگشت به نسخه سایت</button></div><div id="editor-status" class="editor-status" role="status" aria-live="polite"></div><div id="editor-panel" class="editor-panel"></div></main></div><dialog id="confirm-dialog" class="confirm-dialog" aria-labelledby="confirm-heading"><h2 id="confirm-heading">تأیید تغییر</h2><p></p><form method="dialog" class="confirm-actions"><button class="button button-dark" value="confirm">ادامه</button><button class="button button-outline" value="cancel" autofocus>انصراف</button></form></dialog>';
    renderPanel();
    status(
      warning ||
        (restored
          ? "پیش‌نویس ذخیره‌شده این مرورگر بارگذاری شد."
          : "محتوای نسخه سایت بارگذاری شد."),
    );
    root.addEventListener("input", (event) => {
      const input = event.target;
      if (!input.dataset.path) return;
      let value = input.type === "checkbox" ? input.checked : input.value;
      if (input.dataset.number) {
        const text = input.value
          .trim()
          .replace(/[۰-۹]/g, (c) => String(c.charCodeAt(0) - 1776))
          .replace(/[٠-٩]/g, (c) => String(c.charCodeAt(0) - 1632))
          .replace(/[,٬]/g, "");
        value = text === "" ? null : /^\d+$/.test(text) ? Number(text) : text;
      }
      if (input.dataset.lines)
        value = input.value
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean);
      set(input.dataset.path, value);
      status("تغییرات جدید هنوز در این مرورگر ذخیره نشده‌اند.");
    });
    root.addEventListener("click", async (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      if (button.dataset.panel) {
        panel = button.dataset.panel;
        renderPanel();
        return;
      }
      if (button.dataset.add) {
        const list = get(button.dataset.add);
        list.push(newItem(button.dataset.add));
        dirty = true;
        renderPanel();
        status("مورد جدید اضافه شد؛ اطلاعات را تکمیل و ذخیره کنید.");
        return;
      }
      if (button.dataset.delete) {
        if (
          !(await confirmChange(
            "این مورد از پیش‌نویس حذف شود؟ نسخه منتشرشده سایت تغییر نمی‌کند.",
          ))
        )
          return;
        get(button.dataset.delete).splice(Number(button.dataset.index), 1);
        dirty = true;
        renderPanel();
        status("مورد از پیش‌نویس حذف شد.");
        return;
      }
      if (button.dataset.move) {
        const list = get(button.dataset.array),
          index = Number(button.dataset.index),
          next = index + Number(button.dataset.move);
        if (next >= 0 && next < list.length) {
          [list[index], list[next]] = [list[next], list[index]];
          dirty = true;
          renderPanel();
          status("ترتیب نمایش تغییر کرد.");
        }
        return;
      }
    });
    document.getElementById("save-draft").addEventListener("click", saveDraft);
    document.getElementById("preview-draft").addEventListener("click", () => {
      if (saveDraft())
        window.open("./index.html?preview=1", "_blank", "noopener");
    });
    document
      .querySelector("#publish-site")
      .addEventListener("click", async () => {
        if (!validateContent(content)) {
          status("محتوای فعلی معتبر نیست.", true);
          return;
        }

        const confirmed = confirm(
          "آیا مطمئن هستید؟ تغییرات در سایت اصلی منتشر خواهد شد.",
        );

        if (!confirmed) return;

        const button = document.querySelector("#publish-site");

        button.disabled = true;
        button.textContent = "در حال انتشار...";

        status("در حال ارسال تغییرات به GitHub...");

        try {
          const response = await fetch("/api/publish", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(content),
          });

          const result = await response.json();

          if (!response.ok || !result.ok) {
            throw new Error(result.error || "انتشار تغییرات انجام نشد.");
          }

          dirty = false;

          status(
            "تغییرات با موفقیت منتشر شد. Vercel deployment را آغاز می‌کند.",
          );
        } catch (error) {
          console.error(error);

          status(error.message || "خطا هنگام انتشار تغییرات.", true);
        } finally {
          button.disabled = false;
          button.textContent = "اعمال تغییرات و انتشار";
        }
      });
    document
      .getElementById("reset-draft")
      .addEventListener("click", async () => {
        if (
          !(await confirmChange(
            "پیش‌نویس محلی کنار گذاشته و نسخه منتشرشده سایت بارگذاری شود؟ ابتدا از تغییرات موردنیاز خروجی بگیرید.",
          ))
        )
          return;
        try {
          const current = await fetchContent();
          localStorage.removeItem(DRAFT_KEY);
          published = current;
          content = clone(current);
          dirty = false;
          renderPanel();
          status("نسخه منتشرشده بارگذاری و پیش‌نویس محلی حذف شد.", false, true);
        } catch (error) {
          status("بازگشت انجام نشد: " + error.message, true);
        }
      });
    window.addEventListener("beforeunload", (event) => {
      if (dirty) {
        event.preventDefault();
        event.returnValue = "";
      }
    });
  } catch (error) {
    root.innerHTML =
      '<div class="container load-state"><h1>ویرایشگر آماده نشد</h1><p>' +
      e(error.message) +
      '</p><a class="button button-dark" href="./editor.html">تلاش دوباره</a></div>';
  }
}
start();
