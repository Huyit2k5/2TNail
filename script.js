/* =========================================================
   CẤU HÌNH – chỉnh các thông tin của tiệm tại đây
   ========================================================= */
const CONFIG = {
  shopName: "2T's Nail",
  phone: "0349392820",              // hotline + Zalo
  phoneDisplay: "034 939 2820",
  facebookId: "61564306340433",     // ID trang Facebook (m.me/<id>)
  facebookUrl: "https://www.facebook.com/profile.php?id=61564306340433",
  instagram: "nailxinhhocmon",      // TODO: sửa đúng tên Instagram của tiệm (chưa xác nhận)
  tiktok: "nailxinhhocmon",
  // Giờ mở cửa (theo caption TikTok của tiệm: 9:00 - 21:00). 0 = Chủ nhật … 6 = Thứ 7
  hours: { open: 9, close: 21 },
  slotEveryHour: true,
  // Dán link Google Apps Script Web App để lưu lịch vào Google Sheet (để trống = không lưu)
  sheetWebhook: "https://script.google.com/macros/s/AKfycbwUHckfeSNltUUom8GPriXFnemEa9Khr-okz7kWslzAyaaVTlTQhB5g5sLYSjZC7YYhEw/exec",
};

/* Dịch vụ – điền price (vd "từ 150K") khi bạn chốt bảng giá */
const SERVICES = [
  { ic: "✦", name: "Sơn gel", desc: "Bền màu, bóng đẹp, nhiều tông từ nude đến rực rỡ.", price: "" },
  { ic: "❀", name: "Úp & nối móng", desc: "Form móng dài, thon theo dáng tay, nhẹ và tự nhiên.", price: "" },
  { ic: "♛", name: "Đắp bột", desc: "Móng chắc khỏe, tạo form chuẩn, giữ được lâu.", price: "" },
  { ic: "✿", name: "Vẽ nghệ thuật", desc: "Vẽ họa tiết, ombre, mắt mèo, French theo ý bạn.", price: "" },
  { ic: "❖", name: "Đính đá & charm", desc: "Đá, charm, nhũ lấp lánh cho dịp đặc biệt.", price: "" },
  { ic: "☾", name: "Chăm sóc móng", desc: "Làm sạch, tạo form, dưỡng da tay nhẹ nhàng.", price: "" },
];

/* Mẫu nail – thêm ảnh thật: đặt file vào thư mục images/ rồi điền img: "images/ten.jpg" */
const STYLES = ["Tối giản", "Nữ tính", "Đính đá", "Mắt mèo", "French", "Vẽ nghệ thuật", "Lễ & Tết"];
// Ảnh dưới đây là ảnh mẫu từ Unsplash (miễn phí dùng thương mại) – thay bằng ảnh thật của tiệm khi có.
const GALLERY = [
  { id: 1,  name: "Nude kem",        style: "Tối giản",      c: ["#f3dfd6", "#e9c3b4"], img: "images/u5.jpg" },
  { id: 2,  name: "Hồng pastel",     style: "Nữ tính",       c: ["#f9c6d3", "#f08fb0"], img: "images/u10.jpg" },
  { id: 3,  name: "Đá vàng đính tay",style: "Đính đá",       c: ["#2b2b3a", "#8d7bd1"], img: "images/u2.jpg" },
  { id: 4,  name: "Chrome ánh kim",  style: "Mắt mèo",       c: ["#3a2a5e", "#b38af0"], img: "images/u7.jpg" },
  { id: 5,  name: "French màu",      style: "French",        c: ["#fff3ee", "#f1c9c0"], img: "images/u4.jpg" },
  { id: 6,  name: "Nhũ bạc tiệc",    style: "Lễ & Tết",      c: ["#b3122f", "#ff6b6b"], img: "images/u6.jpg" },
  { id: 7,  name: "Nâu trà sữa",     style: "Tối giản",      c: ["#f7f2ef", "#d9ccc6"], img: "images/u12.jpg" },
  { id: 8,  name: "Vàng ánh kim",    style: "Lễ & Tết",      c: ["#c9372c", "#f3c96b"], img: "images/u9.jpg" },
  { id: 9,  name: "Vẽ đen trắng",    style: "Vẽ nghệ thuật", c: ["#ffe1ea", "#e8a3bd"], img: "images/u11.jpg" },
  { id: 10, name: "Mắt mèo nâu đen", style: "Mắt mèo",       c: ["#14394a", "#4fc3c3"], img: "images/u3.jpg" },
];

/* Vòng quay – phần quà là ví dụ, sửa theo chính sách thật của tiệm */
const PRIZES = [
  { t: "Giảm 10%",          code: "2T10",   color: "#f9c6d3" },
  { t: "Tặng sơn dưỡng",    code: "2TCARE", color: "#fff" },
  { t: "Giảm 20K",          code: "2T20K",  color: "#f3b6c6" },
  { t: "Tặng 2 charm",      code: "2TCHARM",color: "#fff" },
  { t: "Giảm 5%",           code: "2T5",    color: "#f9c6d3" },
  { t: "Tặng massage tay",  code: "2TSPA",  color: "#fff" },
];

/* Quiz */
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
function toast(msg) {
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove("show"), 3600);
}

/* ---------- Liên kết liên hệ ---------- */
const LINKS = {
  zalo: `https://zalo.me/${CONFIG.phone}`,
  fb: `https://m.me/${CONFIG.facebookId}`,
  ig: `https://ig.me/m/${CONFIG.instagram}`,
  igProfile: `https://www.instagram.com/${CONFIG.instagram}/`,
  tiktok: `https://www.tiktok.com/@${CONFIG.tiktok}`,
  call: `tel:${CONFIG.phone}`,
};
$("#fabZalo").href = LINKS.zalo; $("#fabFb").href = LINKS.fb; $("#fabCall").href = LINKS.call;
$("#phoneLink").href = LINKS.call; $("#phoneLink").textContent = CONFIG.phoneDisplay;
$("#ttLink").href = LINKS.tiktok;
$("#socials").innerHTML = [
  ["Zalo", LINKS.zalo], ["Facebook", CONFIG.facebookUrl],
  ["Instagram", LINKS.igProfile], ["TikTok", LINKS.tiktok],
].map(([n, h]) => `<a href="${h}" target="_blank" rel="noopener">${n}</a>`).join("");
$("#yr").textContent = new Date().getFullYear();

/* ---------- Giờ mở cửa & trạng thái ---------- */
const { open, close } = CONFIG.hours;
$("#hoursText").textContent = `Mỗi ngày, ${pad(open)}:00 – ${pad(close)}:00`;
function updateStatus() {
  const n = new Date(), h = n.getHours() + n.getMinutes() / 60;
  const el = $("#openStatus"), isOpen = h >= open && h < close;
  el.className = "status " + (isOpen ? "open" : "closed");
  el.textContent = isOpen ? `Đang mở cửa · đến ${pad(close)}:00` : `Đã đóng cửa · mở lại ${pad(open)}:00`;
}
updateStatus(); setInterval(updateStatus, 60000);

/* ---------- Dịch vụ ---------- */
$("#services").innerHTML = SERVICES.map(s => `
  <article class="card reveal"><div class="ic">${s.ic}</div><h3>${s.name}</h3><p>${s.desc}</p>
  <div class="price">${s.price || "Nhắn tiệm để báo giá"}</div></article>`).join("");
$("#fService").innerHTML = `<option value="">Chưa chọn – tiệm tư vấn</option>` +
  SERVICES.map(s => `<option>${s.name}</option>`).join("");

/* ---------- Mẫu nail + yêu thích ---------- */
let wish = new Set(store.get("wish", []));
let filter = "Tất cả";
function renderFilters() {
  $("#filters").innerHTML = ["Tất cả", ...STYLES].map(s =>
    `<button class="chip ${s === filter ? "on" : ""}" data-f="${s}">${s}</button>`).join("");
}
function renderGallery() {
  const list = GALLERY.filter(g => filter === "Tất cả" || g.style === filter);
  $("#gallery").innerHTML = list.map(g => `
    <div class="tile" style="background:linear-gradient(145deg,${g.c[0]},${g.c[1]});animation-delay:${Math.random() * .2}s">
      ${g.img ? `<img src="${g.img}" alt="${g.name}" loading="lazy">` : ""}<span class="shine"></span>
      <button class="heart ${wish.has(g.id) ? "on" : ""}" data-id="${g.id}" aria-label="Chọn mẫu ${g.name}" aria-pressed="${wish.has(g.id)}">${wish.has(g.id) ? "♥" : "♡"}</button>
      <div><h4>${g.name}</h4><small>${g.style}</small></div>
    </div>`).join("");
}
function renderPicked() {
  const box = $("#picked"), items = GALLERY.filter(g => wish.has(g.id));
  box.innerHTML = items.length
    ? items.map(g => `<span class="pk">${g.name}<button type="button" data-rm="${g.id}" aria-label="Bỏ ${g.name}">×</button></span>`).join("")
    : `<em>Chưa chọn – bạn có thể chọn ở mục Mẫu nail hoặc ghi chú bên dưới.</em>`;
}
function toggleWish(id) {
  wish.has(id) ? wish.delete(id) : wish.add(id);
  store.set("wish", [...wish]); renderGallery(); renderPicked();
}
$("#filters").addEventListener("click", e => {
  const b = e.target.closest("[data-f]"); if (!b) return;
  filter = b.dataset.f; renderFilters(); renderGallery();
});
$("#gallery").addEventListener("click", e => {
  const h = e.target.closest(".heart"); if (!h) return;
  const id = +h.dataset.id; toggleWish(id);
  if (wish.has(id)) toast("Đã thêm vào lịch hẹn của bạn ♥");
});
$("#picked").addEventListener("click", e => {
  const b = e.target.closest("[data-rm]"); if (b) toggleWish(+b.dataset.rm);
});
renderFilters(); renderGallery(); renderPicked();

/* ---------- Quiz ---------- */
let qi = 0, tally = {};
function renderQuiz() {
  const box = $("#quizBox");
  if (qi >= QUIZ.length) {
    const best = Object.entries(tally).sort((a, b) => b[1] - a[1])[0][0];
    const pick = GALLERY.find(g => g.style === best);
    box.innerHTML = `<div class="result"><div class="big">2|T</div>
      <h3>Bạn hợp phong cách “${best}”</h3>
      <p>Gợi ý của tiệm: mẫu <b>${pick.name}</b>. Thêm vào lịch hẹn để tiệm chuẩn bị trước cho bạn nhé.</p>
      <div class="acts">
        <button class="btn btn-ink" id="qAdd">Chọn mẫu này &amp; đặt lịch</button>
        <button class="btn btn-line" id="qSee">Xem cả nhóm “${best}”</button>
        <button class="btn btn-line" id="qAgain">Làm lại</button></div></div>`;
    $("#qAdd").onclick = () => { wish.add(pick.id); store.set("wish", [...wish]); renderGallery(); renderPicked(); location.hash = "#dat-lich"; toast("Đã thêm mẫu vào lịch hẹn ♥"); };
    $("#qSee").onclick = () => { filter = best; renderFilters(); renderGallery(); location.hash = "#mau-nail"; };
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
renderQuiz();

/* ---------- Vòng quay may mắn ---------- */
const wheel = $("#wheel"), seg = 360 / PRIZES.length;
wheel.style.background = `conic-gradient(${PRIZES.map((p, i) => `${p.color} ${i * seg}deg ${(i + 1) * seg}deg`).join(",")})`;
wheel.innerHTML = PRIZES.map((p, i) =>
  `<span style="transform:rotate(${i * seg + seg / 2 - 90}deg) translateY(-50%)">${p.t}</span>`).join("");
let gift = store.get("gift", null), rot = 0;
function showGift() {
  if (!gift) return;
  $("#prizeTitle").textContent = `Bạn nhận được: ${gift.t} 🎉`;
  $("#prizeText").textContent = "Đưa mã này cho tiệm khi đến làm (hoặc để tự động gửi kèm lịch hẹn).";
  const c = $("#prizeCode"); c.hidden = false; c.textContent = gift.code;
  $("#prizeUse").hidden = false; $("#spinBtn").disabled = true; $("#spinBtn").textContent = "ĐÃ QUAY";
  const g = $("#giftLine"); g.hidden = false; g.textContent = `🎁 Ưu đãi đã áp dụng: ${gift.t} (mã ${gift.code})`;
}
$("#spinBtn").addEventListener("click", () => {
  if (gift) return;
  const i = Math.floor(Math.random() * PRIZES.length);
  const center = i * seg + seg / 2, jitter = (Math.random() - .5) * seg * .6;
  rot += 360 * 6 + (360 - center) + jitter - (rot % 360);
  $("#spinBtn").disabled = true;
  wheel.style.transform = `rotate(${rot}deg)`;
  setTimeout(() => { gift = PRIZES[i]; store.set("gift", gift); showGift(); confetti(); toast(`Chúc mừng! Bạn trúng: ${gift.t}`); }, 5200);
});
showGift();

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
  const arr = []; for (let h = open; h < close; h++) arr.push(h);
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
renderSlots();

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
  if (!CONFIG.sheetWebhook) return showErr(`Chưa gửi được lịch. Bạn vui lòng gọi ${CONFIG.phoneDisplay} để đặt lịch nhé.`);

  const payload = { ...d, slot, gift, styles: GALLERY.filter(g => wish.has(g.id)).map(g => g.name) };
  sendBtn.disabled = true; sendBtn.textContent = "Đang gửi…";
  try {
    await fetch(CONFIG.sheetWebhook, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
  } catch {
    sendBtn.disabled = false; sendBtn.textContent = "Gửi lịch hẹn";
    return showErr(`Chưa gửi được lịch, bạn thử lại hoặc gọi ${CONFIG.phoneDisplay} giúp tiệm nhé.`);
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
  wish.clear(); store.set("wish", []); renderGallery(); renderPicked();
  sendBtn.disabled = false; sendBtn.textContent = "Gửi lịch hẹn";
  $("#doneBox").hidden = true; form.hidden = false;
});

/* ---------- Hiệu ứng ---------- */
const nav = $("#nav");
addEventListener("scroll", () => nav.classList.toggle("solid", scrollY > 20), { passive: true });

const io = new IntersectionObserver(es => es.forEach(en => {
  if (!en.isIntersecting) return;
  en.target.classList.add("in"); io.unobserve(en.target);
}), { threshold: .12 });
function observe() { $$(".reveal:not(.in)").forEach(el => io.observe(el)); }
observe();

// vệt lấp lánh theo chuột (chỉ trên thiết bị có chuột)
if (matchMedia("(hover:hover) and (pointer:fine)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
  let last = 0;
  addEventListener("pointermove", e => {
    const n = performance.now(); if (n - last < 70) return; last = n;
    const s = document.createElement("span"); s.className = "sp"; s.textContent = "●";
    s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px"; s.style.fontSize = 8 + Math.random() * 10 + "px";
    document.body.appendChild(s); setTimeout(() => s.remove(), 800);
  });
}
