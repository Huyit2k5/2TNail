/* =========================================================
   CẤU HÌNH
   Nội dung trang (giá, mẫu nail, giờ mở cửa, liên hệ...) được đọc từ Google Sheet
   thông qua Apps Script (xem apps-script/Code.gs). Phần "DỮ LIỆU DỰ PHÒNG" bên dưới
   chỉ hiện khi chưa kết nối được Sheet hoặc Sheet bị lỗi.
   ========================================================= */
const CONFIG = {
  shopName: "2T's Nail",
  phone: "0349392820",
  phone2: "0936300648",
  facebookId: "61564306340433",
  facebookUrl: "https://www.facebook.com/profile.php?id=61564306340433",
  instagram: "nailxinhhocmon",      // TODO: xác nhận tên Instagram thật của tiệm
  tiktok: "nailxinhhocmon",
  address: "40/7 Đặng Thúc Vịnh, Hóc Môn, Hồ Chí Minh",
  addressNote: "Gần Coopmart, cạnh chùa Minh Hòa",
  hours: { open: 9, close: 21 },
  promo: "",
  // Địa chỉ Apps Script Web App: nhận lịch hẹn (POST) và đọc nội dung (GET ?action=content)
  sheetWebhook: "https://script.google.com/macros/s/AKfycbwUHckfeSNltUUom8GPriXFnemEa9Khr-okz7kWslzAyaaVTlTQhB5g5sLYSjZC7YYhEw/exec",
};

let SERVICES = [
  { name: "Sơn gel", desc: "Bền màu, bóng đẹp, nhiều tông từ nude đến rực rỡ.", price: "" },
  { name: "Úp & nối móng", desc: "Form móng dài, thon theo dáng tay, nhẹ và tự nhiên.", price: "" },
  { name: "Đắp bột", desc: "Móng chắc khỏe, tạo form chuẩn, giữ được lâu.", price: "" },
  { name: "Vẽ nghệ thuật", desc: "Vẽ họa tiết, ombre, mắt mèo, French theo ý bạn.", price: "" },
  { name: "Đính đá & charm", desc: "Đá, charm, nhũ lấp lánh cho dịp đặc biệt.", price: "" },
  { name: "Chăm sóc móng", desc: "Làm sạch, tạo form, dưỡng da tay nhẹ nhàng.", price: "" },
];
// Ảnh mẫu từ Unsplash (miễn phí dùng thương mại) – thay bằng ảnh thật của tiệm trong Sheet.
let GALLERY = [
  { name: "Nude kem",         style: "Tối giản",      img: "images/u5.jpg" },
  { name: "Hồng pastel",      style: "Nữ tính",       img: "images/u10.jpg" },
  { name: "Đá vàng đính tay", style: "Đính đá",       img: "images/u2.jpg" },
  { name: "Chrome ánh kim",   style: "Mắt mèo",       img: "images/u7.jpg" },
  { name: "French màu",       style: "French",        img: "images/u4.jpg" },
  { name: "Nhũ bạc tiệc",     style: "Lễ & Tết",      img: "images/u6.jpg" },
  { name: "Nâu trà sữa",      style: "Tối giản",      img: "images/u12.jpg" },
  { name: "Vàng ánh kim",     style: "Lễ & Tết",      img: "images/u9.jpg" },
  { name: "Vẽ đen trắng",     style: "Vẽ nghệ thuật", img: "images/u11.jpg" },
  { name: "Mắt mèo nâu đen",  style: "Mắt mèo",       img: "images/u3.jpg" },
];
let VIDEOS = ["7688985421933530389", "7663059345667820820", "7653721297716923669"];
let PRIZES = [
  { t: "Giảm 10%", code: "2T10" }, { t: "Tặng sơn dưỡng", code: "2TCARE" }, { t: "Giảm 20K", code: "2T20K" },
  { t: "Tặng 2 charm", code: "2TCHARM" }, { t: "Giảm 5%", code: "2T5" }, { t: "Tặng massage tay", code: "2TSPA" },
];

/* Quiz (cố định trong code) */
const QUIZ = [
  { q: "Bạn làm nail cho dịp nào?", o: [
    ["Đi làm, đi học hằng ngày", "Tối giản"], ["Hẹn hò, đi chơi", "Nữ tính"],
    ["Tiệc, sinh nhật, chụp ảnh", "Đính đá"], ["Tết, lễ, sự kiện", "Lễ & Tết"] ] },
  { q: "Phong cách của bạn là?", o: [
    ["Nhẹ nhàng, thanh lịch", "French"], ["Ngọt ngào, dễ thương", "Nữ tính"],
    ["Cá tính, nổi bật", "Mắt mèo"], ["Gọn gàng, đơn giản", "Tối giản"] ] },
  { q: "Bạn thích điểm nhấn nào?", o: [
    ["Màu trơn bóng đẹp", "Tối giản"], ["Đá, charm lấp lánh", "Đính đá"],
    ["Hiệu ứng ánh kim chuyển màu", "Mắt mèo"], ["Viền trắng/hồng tinh tế", "French"] ] },
];

/* ========================================================= */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};
const pad = n => String(n).padStart(2, "0");
// Mọi chữ lấy từ Sheet đều đi qua esc() trước khi chèn vào trang
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const safeImg = u => (/^(images\/[\w./-]+|https:\/\/[^\s"'<>]+)$/.test(String(u || "")) ? u : "");
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 3600);
}
const GRADS = [["#f3dfd6", "#e9c3b4"], ["#f9c6d3", "#f08fb0"], ["#2b2b3a", "#8d7bd1"], ["#3a2a5e", "#b38af0"],
  ["#fff3ee", "#f1c9c0"], ["#b3122f", "#ff6b6b"], ["#14394a", "#4fc3c3"], ["#c9372c", "#f3c96b"]];
const gradFor = name => { let h = 0; for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return GRADS[h % GRADS.length]; };
const fmtPhone = p => (/^\d{10}$/.test(p) ? `${p.slice(0, 4)} ${p.slice(4, 7)} ${p.slice(7)}` : p);

/* ---------- Hiệu ứng xuất hiện ---------- */
const io = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add("in"); io.unobserve(en.target);
}), { threshold: .12 });
function observe() { $$(".reveal:not(.in)").forEach(el => io.observe(el)); }

/* ---------- Liên hệ, giờ, thông báo ---------- */
let OPEN = CONFIG.hours.open, CLOSE = CONFIG.hours.close;
function renderContact() {
  const phone = CONFIG.phone, enc = encodeURIComponent(CONFIG.address);
  const L = {
    zalo: `https://zalo.me/${phone}`, fb: `https://m.me/${CONFIG.facebookId}`,
    ig: `https://www.instagram.com/${CONFIG.instagram}/`, tt: `https://www.tiktok.com/@${CONFIG.tiktok}`,
  };
  $("#fabZalo").href = L.zalo; $("#fabFb").href = L.fb; $("#fabCall").href = `tel:${phone}`;
  $("#ttLink").href = L.tt; $("#ttAll").href = L.tt;
  $$(".ttName").forEach(el => el.textContent = "@" + CONFIG.tiktok);
  const hp = $("#hintPhone"); hp.href = `tel:${phone}`; hp.textContent = fmtPhone(phone);
  $("#phones").innerHTML = [phone, CONFIG.phone2].filter(Boolean)
    .map(p => `<a href="tel:${esc(p)}">${esc(fmtPhone(p))}</a>`).join(" · ");
  $("#socials").innerHTML = [["Zalo", L.zalo], ["Facebook", CONFIG.facebookUrl], ["Instagram", L.ig], ["TikTok", L.tt]]
    .map(([n, h]) => `<a href="${esc(h)}" target="_blank" rel="noopener">${n}</a>`).join("");
  $("#addrText").textContent = CONFIG.address;
  $("#addrNote").textContent = CONFIG.addressNote; $("#addrNote").hidden = !CONFIG.addressNote;
  $("#trustNote").textContent = CONFIG.addressNote || CONFIG.address;
  $("#dirBtn").href = `https://www.google.com/maps/dir/?api=1&destination=${enc}`;
  const mf = $("#mapFrame"), src = `https://www.google.com/maps?q=${enc}&output=embed`;
  if (mf.getAttribute("src") !== src) mf.src = src;
  $("#hoursText").textContent = `Mỗi ngày, ${pad(OPEN)}:00 – ${pad(CLOSE)}:00`;
  const pr = $("#promo"); pr.textContent = CONFIG.promo; pr.hidden = !CONFIG.promo;
  $("#yr").textContent = new Date().getFullYear();
}
function updateStatus() {
  const n = new Date(), h = n.getHours() + n.getMinutes() / 60;
  const el = $("#openStatus"), isOpen = h >= OPEN && h < CLOSE;
  el.className = "status " + (isOpen ? "open" : "closed");
  el.textContent = isOpen ? `Đang mở cửa · đến ${pad(CLOSE)}:00` : `Đã đóng cửa · mở lại ${pad(OPEN)}:00`;
}

/* ---------- Dịch vụ ---------- */
function renderServices() {
  $("#services").innerHTML = SERVICES.map(s => `
    <article class="card reveal"><h3>${esc(s.name)}</h3><p>${esc(s.desc)}</p>
    <div class="price">${esc(s.price) || "Nhắn tiệm để báo giá"}</div></article>`).join("");
  $("#fService").innerHTML = `<option value="">Chưa chọn – tiệm tư vấn</option>` +
    SERVICES.map(s => `<option>${esc(s.name)}</option>`).join("");
}

/* ---------- Mẫu nail + yêu thích (lưu theo tên mẫu) ---------- */
let wish = new Set(store.get("wish2", []));
let filter = "Tất cả";
const styles = () => [...new Set(GALLERY.map(g => g.style))];
function renderFilters() {
  if (filter !== "Tất cả" && !styles().includes(filter)) filter = "Tất cả";
  $("#filters").innerHTML = ["Tất cả", ...styles()].map(s =>
    `<button class="chip ${s === filter ? "on" : ""}" data-f="${esc(s)}">${esc(s)}</button>`).join("");
}
function renderGallery() {
  const list = GALLERY.filter(g => filter === "Tất cả" || g.style === filter);
  $("#gallery").innerHTML = list.map(g => {
    const c = gradFor(g.name), img = safeImg(g.img), on = wish.has(g.name);
    return `<div class="tile" style="background:linear-gradient(145deg,${c[0]},${c[1]})">
      ${img ? `<img src="${esc(img)}" alt="${esc(g.name)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">` : ""}<span class="shine"></span>
      <button class="heart ${on ? "on" : ""}" data-id="${esc(g.name)}" aria-label="Chọn mẫu ${esc(g.name)}" aria-pressed="${on}">${on ? "♥" : "♡"}</button>
      <div><h4>${esc(g.name)}</h4><small>${esc(g.style)}</small></div>
    </div>`;
  }).join("");
}
function renderPicked() {
  const box = $("#picked"), items = GALLERY.filter(g => wish.has(g.name));
  box.innerHTML = items.length
    ? items.map(g => `<span class="pk">${esc(g.name)}<button type="button" data-rm="${esc(g.name)}" aria-label="Bỏ ${esc(g.name)}">×</button></span>`).join("")
    : `<em>Chưa chọn – bạn có thể chọn ở mục Mẫu nail hoặc ghi chú bên dưới.</em>`;
}
function toggleWish(name) {
  wish.has(name) ? wish.delete(name) : wish.add(name);
  store.set("wish2", [...wish]); renderGallery(); renderPicked();
}
$("#filters").addEventListener("click", e => {
  const b = e.target.closest("[data-f]"); if (!b) return;
  filter = b.dataset.f; renderFilters(); renderGallery();
});
$("#gallery").addEventListener("click", e => {
  const h = e.target.closest(".heart"); if (!h) return;
  const id = h.dataset.id; toggleWish(id);
  if (wish.has(id)) toast("Đã thêm vào lịch hẹn của bạn ♥");
});
$("#picked").addEventListener("click", e => {
  const b = e.target.closest("[data-rm]"); if (b) toggleWish(b.dataset.rm);
});

/* ---------- Video TikTok ---------- */
function renderVideos() {
  $("#video").hidden = !VIDEOS.length;
  $('[data-nav="video"]').hidden = !VIDEOS.length;
  const cur = $("#videos").dataset.ids, now = VIDEOS.join(",");
  if (cur === now) return;               // không tải lại video đang xem nếu danh sách không đổi
  $("#videos").dataset.ids = now;
  $("#videos").innerHTML = VIDEOS.map(i => `
    <figure class="vid"><div class="vbox"><iframe src="https://www.tiktok.com/player/v1/${i}?music_info=0&description=0&rel=0" title="Video TikTok ${esc(CONFIG.shopName)}" loading="lazy" allow="fullscreen; clipboard-write; encrypted-media" allowfullscreen></iframe></div>
    <a class="vlink" target="_blank" rel="noopener" href="https://www.tiktok.com/@${esc(CONFIG.tiktok)}/video/${i}">Mở trên TikTok ↗</a></figure>`).join("");
}

/* ---------- Quiz ---------- */
let qi = 0, tally = {};
function renderQuiz() {
  const box = $("#quizBox");
  if (qi >= QUIZ.length) {
    const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
    const pick = GALLERY.find(g => g.style === best) || GALLERY[0];
    const has = GALLERY.some(g => g.style === best);
    box.innerHTML = `<div class="result"><div class="big">2|T</div>
      <h3>Bạn hợp phong cách “${esc(best)}”</h3>
      <p>Gợi ý của tiệm: mẫu <b>${esc(pick.name)}</b>. Thêm vào lịch hẹn để tiệm chuẩn bị trước cho bạn nhé.</p>
      <div class="acts">
        <button class="btn btn-ink" id="qAdd">Chọn mẫu này &amp; đặt lịch</button>
        ${has ? `<button class="btn btn-line" id="qSee">Xem cả nhóm “${esc(best)}”</button>` : ""}
        <button class="btn btn-line" id="qAgain">Làm lại</button></div></div>`;
    $("#qAdd").onclick = () => { wish.add(pick.name); store.set("wish2", [...wish]); renderGallery(); renderPicked(); location.hash = "#dat-lich"; toast("Đã thêm mẫu vào lịch hẹn ♥"); };
    if (has) $("#qSee").onclick = () => { filter = best; renderFilters(); renderGallery(); location.hash = "#mau-nail"; };
    $("#qAgain").onclick = () => { qi = 0; tally = {}; renderQuiz(); };
    return;
  }
  const q = QUIZ[qi];
  box.innerHTML = `<div class="qbar"><i style="width:${(qi / QUIZ.length) * 100}%"></i></div>
    <h3>${qi + 1}/${QUIZ.length} · ${q.q}</h3>
    <div class="opts">${q.o.map(([t, k]) => `<button class="opt" data-k="${k}">${t}</button>`).join("")}</div>`;
}
$("#quizBox").addEventListener("click", e => {
  const b = e.target.closest(".opt"); if (!b) return;
  tally[b.dataset.k] = (tally[b.dataset.k] || 0) + 1; qi++; renderQuiz();
});

/* ---------- Vòng quay may mắn ---------- */
const wheel = $("#wheel");
const WHEEL_COLORS = ["#f9c6d3", "#fff", "#f3b6c6", "#fff"];
let gift = store.get("gift", null), rot = 0, spinning = false;
function renderWheel() {
  $("#uu-dai").hidden = !PRIZES.length;
  $('[data-nav="uu-dai"]').hidden = !PRIZES.length;
  const n = PRIZES.length; if (!n) return;
  const seg = 360 / n;
  const col = i => (n % 2 && i === n - 1 ? "#f3b6c6" : WHEEL_COLORS[i % 4]);
  wheel.style.background = `conic-gradient(${PRIZES.map((p, i) => `${col(i)} ${i * seg}deg ${(i + 1) * seg}deg`).join(",")})`;
  wheel.innerHTML = PRIZES.map((p, i) =>
    `<span style="transform:rotate(${i * seg + seg / 2 - 90}deg) translateY(-50%)">${esc(p.t)}</span>`).join("");
}
function showGift() {
  const g = $("#giftLine");
  if (!gift || !PRIZES.length) { g.hidden = true; return; }
  $("#prizeTitle").textContent = `Bạn nhận được: ${gift.t} 🎉`;
  $("#prizeText").textContent = "Đưa mã này cho tiệm khi đến làm (hoặc để tự động gửi kèm lịch hẹn).";
  const c = $("#prizeCode"); c.hidden = false; c.textContent = gift.code;
  $("#prizeUse").hidden = false; $("#spinBtn").disabled = true; $("#spinBtn").textContent = "ĐÃ QUAY";
  g.hidden = false; g.textContent = `🎁 Ưu đãi đã áp dụng: ${gift.t} (mã ${gift.code})`;
}
$("#spinBtn").addEventListener("click", () => {
  if (gift || spinning || !PRIZES.length) return;
  spinning = true;
  const n = PRIZES.length, seg = 360 / n, i = Math.floor(Math.random() * n);
  const center = i * seg + seg / 2, jitter = (Math.random() - .5) * seg * .6;
  rot += 360 * 6 + (360 - center) + jitter - (rot % 360);
  $("#spinBtn").disabled = true;
  wheel.style.transform = `rotate(${rot}deg)`;
  const prize = PRIZES[i];
  setTimeout(() => { spinning = false; gift = prize; store.set("gift", gift); showGift(); confetti(); toast(`Chúc mừng! Bạn trúng: ${gift.t}`); }, 5200);
});

function confetti() {
  const cols = ["#d9577f", "#f3b6c6", "#141414", "#f3c96b"];
  for (let i = 0; i < 40; i++) {
    const s = document.createElement("span");
    s.textContent = "●"; s.className = "sp";
    s.style.cssText = `left:${50 + (Math.random() - .5) * 40}vw;top:${40 + Math.random() * 10}vh;font-size:${12 + Math.random() * 18}px;color:${cols[i % 4]};animation-duration:${1 + Math.random()}s`;
    document.body.appendChild(s); setTimeout(() => s.remove(), 2000);
  }
}

/* ---------- Đặt lịch ---------- */
const form = $("#bookForm"), fDate = $("#fDate");
let slot = "";
const today = new Date(); const iso = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
fDate.min = iso(today); fDate.value = iso(today);
function renderSlots() {
  const isToday = fDate.value === iso(new Date()), nowH = new Date().getHours() + new Date().getMinutes() / 60;
  const arr = []; for (let h = OPEN; h < CLOSE; h++) arr.push(h);
  if (slot && !arr.some(h => `${pad(h)}:00` === slot)) slot = "";
  $("#slots").innerHTML = arr.map(h => {
    const v = `${pad(h)}:00`, dis = isToday && h <= nowH;
    if (dis && slot === v) slot = "";
    return `<button type="button" class="slot ${slot === v ? "on" : ""}" data-t="${v}" ${dis ? "disabled" : ""}>${v}</button>`;
  }).join("");
}
fDate.addEventListener("change", renderSlots);
$("#slots").addEventListener("click", e => {
  const b = e.target.closest(".slot"); if (!b || b.disabled) return;
  slot = b.dataset.t; renderSlots();
});

const CH_NAME = { zalo: "Zalo", call: "điện thoại", fb: "Facebook", ig: "Instagram" };
const sendBtn = $("#sendBtn"), formErr = $("#formErr");
function showErr(m) { formErr.textContent = m; formErr.hidden = false; }

form.addEventListener("submit", async e => {
  e.preventDefault();
  formErr.hidden = true;
  const d = Object.fromEntries(new FormData(form));
  let ok = true;
  ["name", "phone"].forEach(n => {
    const el = form.elements[n]; const bad = !el.value.trim() || (n === "phone" && !/^[0-9 +().-]{8,15}$/.test(el.value.trim()));
    el.classList.toggle("err", bad); if (bad) ok = false;
  });
  if (!ok) return toast("Bạn kiểm tra lại tên và số điện thoại nhé");
  if (!d.date) return toast("Vui lòng chọn ngày hẹn");
  if (!CONFIG.sheetWebhook) return showErr(`Chưa gửi được lịch. Bạn vui lòng gọi ${fmtPhone(CONFIG.phone)} để đặt lịch nhé.`);

  const payload = { ...d, slot, gift: PRIZES.length ? gift : null, styles: GALLERY.filter(g => wish.has(g.name)).map(g => g.name) };
  sendBtn.disabled = true; sendBtn.textContent = "Đang gửi…";
  try {
    await fetch(CONFIG.sheetWebhook, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
  } catch {
    sendBtn.disabled = false; sendBtn.textContent = "Gửi lịch hẹn";
    return showErr(`Chưa gửi được lịch, bạn thử lại hoặc gọi ${fmtPhone(CONFIG.phone)} giúp tiệm nhé.`);
  }
  store.set("lastBooking", { ...d, slot, at: Date.now() });
  const [y, m, dd] = d.date.split("-");
  $("#doneText").textContent = `Cảm ơn ${d.name.trim()}! Tiệm đã nhận lịch ${slot || "linh hoạt"} ngày ${dd}/${m}/${y} và sẽ liên hệ lại qua ${CH_NAME[d.channel] || "số điện thoại"} (${d.phone.trim()}) để xác nhận.`;
  form.hidden = true; $("#doneBox").hidden = false;
  $("#doneBox").scrollIntoView({ behavior: "smooth", block: "center" });
  confetti();
});
$("#againBtn").addEventListener("click", () => {
  form.reset(); fDate.value = iso(new Date()); slot = ""; renderSlots();
  wish.clear(); store.set("wish2", []); renderGallery(); renderPicked();
  sendBtn.disabled = false; sendBtn.textContent = "Gửi lịch hẹn";
  $("#doneBox").hidden = true; form.hidden = false;
});

/* ---------- Áp dụng nội dung từ Sheet ---------- */
const handle = (v, host) => {
  v = String(v || "").trim();
  const m = v.match(new RegExp(host + "\\.com/@?([^/?#\\s]+)", "i"));
  return (m ? m[1] : v).replace(/^@/, "");
};
function applyContent(c) {
  if (!c || c.ok === false) return;
  const s = c.settings || {};
  const digits = v => String(v || "").replace(/[^\d+]/g, "");
  if (digits(s.phone)) CONFIG.phone = digits(s.phone);
  CONFIG.phone2 = "phone2" in s ? digits(s.phone2) : CONFIG.phone2;
  if (Number.isFinite(s.hoursOpen)) OPEN = s.hoursOpen;
  if (Number.isFinite(s.hoursClose)) CLOSE = s.hoursClose;
  if (OPEN >= CLOSE) { OPEN = CONFIG.hours.open; CLOSE = CONFIG.hours.close; }
  if (s.address) CONFIG.address = s.address;
  if ("addressNote" in s) CONFIG.addressNote = s.addressNote;
  if (s.facebook) {
    CONFIG.facebookUrl = /^https:\/\//.test(s.facebook) ? s.facebook : `https://www.facebook.com/${handle(s.facebook, "facebook")}`;
    const m = CONFIG.facebookUrl.match(/[?&]id=(\d+)/) || CONFIG.facebookUrl.match(/facebook\.com\/([^/?#]+)/i);
    if (m) CONFIG.facebookId = m[1];
  }
  if (s.instagram) CONFIG.instagram = handle(s.instagram, "instagram");
  if (s.tiktok) CONFIG.tiktok = handle(s.tiktok, "tiktok");
  if ("promo" in s) CONFIG.promo = s.promo;
  if (Array.isArray(c.services) && c.services.length) SERVICES = c.services;
  if (Array.isArray(c.gallery) && c.gallery.length) GALLERY = c.gallery;
  if (Array.isArray(c.videos)) VIDEOS = c.videos.filter(v => /^\d{15,25}$/.test(v));
  if (Array.isArray(c.prizes)) PRIZES = c.prizes;
  renderAll();
}
function renderAll() {
  renderContact(); updateStatus(); renderServices();
  renderFilters(); renderGallery(); renderPicked();
  renderVideos(); renderWheel(); showGift(); renderSlots(); observe();
}
async function loadContent() {
  if (!CONFIG.sheetWebhook) return;
  const cached = store.get("content_v1", null);
  let last = cached ? JSON.stringify(cached) : "";
  if (cached) applyContent(cached);
  try {
    const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 8000);
    const r = await fetch(`${CONFIG.sheetWebhook}?action=content`, { signal: ctl.signal }); clearTimeout(t);
    const c = await r.json();
    if (c && c.ok) { const j = JSON.stringify(c); if (j !== last) { store.set("content_v1", c); applyContent(c); } }
  } catch { /* dùng dữ liệu dự phòng / bản đã lưu */ }
}

/* ---------- Hiệu ứng ---------- */
const nav = $("#nav");
addEventListener("scroll", () => nav.classList.toggle("solid", scrollY > 20), { passive: true });
if (matchMedia("(hover:hover) and (pointer:fine)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
  let last = 0;
  addEventListener("pointermove", e => {
    const n = performance.now(); if (n - last < 70) return; last = n;
    const s = document.createElement("span"); s.className = "sp"; s.textContent = "●";
    s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px"; s.style.fontSize = 8 + Math.random() * 10 + "px";
    document.body.appendChild(s); setTimeout(() => s.remove(), 800);
  });
}

/* ---------- Khởi động ---------- */
renderQuiz();
renderAll();
setInterval(updateStatus, 60000);
loadContent();
