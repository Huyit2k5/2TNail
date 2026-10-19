/**
 * 2T's Nail – Apps Script cho landing page.
 *  1) doPost: nhận lịch hẹn từ trang và ghi vào tab "Lịch hẹn".
 *  2) doGet ?action=content: trả nội dung trang (giá, mẫu nail, giờ mở cửa...) đọc từ các tab trong Sheet.
 *
 * CÀI ĐẶT LẦN ĐẦU (xem thêm tab "Hướng dẫn" sau khi chạy bước 3):
 * 1. Dán toàn bộ file này vào Apps Script của Sheet (Tiện ích mở rộng > Apps Script), Lưu.
 * 2. (Tùy chọn) điền email chủ tiệm vào OWNER_EMAIL để nhận email khi có lịch mới.
 * 3. Chọn hàm setupContentSheets ở thanh trên, bấm Chạy (Run), cấp quyền. Các tab nội dung sẽ được tạo
 *    với dữ liệu mẫu (không ghi đè tab đã có). Từ lần sau Sheet có thêm menu "2T's Nail".
 * 4. Deploy > Manage deployments > bút chì (Edit) > Version: New version > Deploy.
 *    (Địa chỉ /exec giữ nguyên. Mỗi lần sửa file này đều phải làm lại bước 4.)
 */

const OWNER_EMAIL = "";          // ví dụ "tiem@gmail.com" – để trống nếu không cần email
const SHEET_NAME = "Lịch hẹn";
const HEADERS = ["Nhận lúc", "Tên", "SĐT", "Dịch vụ", "Ngày hẹn", "Giờ hẹn",
                 "Mẫu thích", "Ưu đãi", "Ghi chú", "Kênh khách chọn", "Trạng thái"];

/* Tên các tab nội dung */
const TAB = {
  settings: "Cài đặt", services: "Dịch vụ", gallery: "Mẫu nail",
  videos: "Video TikTok", prizes: "Quà vòng quay", guide: "Hướng dẫn",
};
const STYLE_LIST = ["Tối giản", "Nữ tính", "Đính đá", "Mắt mèo", "French", "Vẽ nghệ thuật", "Lễ & Tết"];
const SETTING_KEYS = {
  "số điện thoại": "phone", "số điện thoại 2": "phone2",
  "giờ mở cửa": "hoursOpen", "giờ đóng cửa": "hoursClose",
  "địa chỉ": "address", "ghi chú địa chỉ": "addressNote",
  "facebook": "facebook", "instagram": "instagram", "tiktok": "tiktok",
  "thông báo đầu trang": "promo",
};
const CACHE_KEY = "content_v1";
const CACHE_SECONDS = 300;

/* ============ Menu & tự xóa bộ nhớ đệm khi sửa Sheet ============ */
function onOpen() {
  SpreadsheetApp.getUi().createMenu("2T's Nail")
    .addItem("Tạo các tab nội dung (chạy 1 lần)", "setupContentSheets")
    .addItem("Làm mới trang web ngay", "clearContentCache")
    .addToUi();
}
function onEdit() { clearContentCache(); }
function clearContentCache() { CacheService.getScriptCache().remove(CACHE_KEY); }

/* ============ Nhận lịch hẹn ============ */
function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse((e.postData && e.postData.contents) || "{}");

    const name = clean(d.name, 80), phone = clean(d.phone, 20);
    if (!name || !/^[0-9 +().-]{8,15}$/.test(phone)) return out({ ok: false, error: "invalid" });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEADERS);
      sh.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#141414").setFontColor("#ffffff");
      sh.setFrozenRows(1);
    }
    const gift = d.gift && d.gift.t ? clean(d.gift.t, 60) + " (" + clean(d.gift.code, 20) + ")" : "";
    const channel = { zalo: "Zalo", fb: "Facebook", ig: "Instagram", call: "Gọi điện" }[d.channel] || clean(d.channel, 20);
    const row = [new Date(), name, "'" + phone, clean(d.service, 60) || "Cần tư vấn", clean(d.date, 12),
                 clean(d.slot, 8) || "Linh hoạt", (d.styles || []).slice(0, 10).map(s => clean(s, 40)).join(", "),
                 gift, clean(d.note, 500), channel, "Mới"];
    sh.appendRow(row);

    if (OWNER_EMAIL) {
      MailApp.sendEmail(OWNER_EMAIL, "Lịch hẹn mới: " + name + " – " + row[4] + " " + row[5],
        "Tên: " + name + "\nSĐT: " + phone + "\nDịch vụ: " + row[3] + "\nThời gian: " + row[5] + " ngày " + row[4] +
        "\nMẫu thích: " + row[6] + "\nƯu đãi: " + gift + "\nGhi chú: " + row[8] + "\nKênh: " + channel);
    }
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

/* ============ Trả nội dung trang ============ */
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action === "content") {
    try {
      const cache = CacheService.getScriptCache();
      const hit = cache.get(CACHE_KEY);
      if (hit) return ContentService.createTextOutput(hit).setMimeType(ContentService.MimeType.JSON);
      const json = JSON.stringify(Object.assign({ ok: true }, readContent()));
      try { cache.put(CACHE_KEY, json, CACHE_SECONDS); } catch (_) {}
      return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
    } catch (err) {
      return out({ ok: false, error: String(err) });
    }
  }
  return out({ ok: true, service: "2T's Nail booking" });
}

function readContent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const res = {};

  const rows = name => {
    const sh = ss.getSheetByName(name);
    if (!sh || sh.getLastRow() < 2) return sh ? [] : null;
    return sh.getRange(2, 1, sh.getLastRow() - 1, Math.max(sh.getLastColumn(), 4)).getValues();
  };

  const st = ss.getSheetByName(TAB.settings);
  if (st && st.getLastRow() >= 2) {
    const s = {};
    st.getRange(2, 1, st.getLastRow() - 1, 2).getValues().forEach(r => {
      const key = SETTING_KEYS[String(r[0]).trim().toLowerCase()];
      if (key) s[key] = txt(r[1], 300);
    });
    s.phone = phoneText(s.phone); s.phone2 = phoneText(s.phone2);
    s.hoursOpen = parseHour(s.hoursOpen); s.hoursClose = parseHour(s.hoursClose);
    res.settings = s;
  }

  const sv = rows(TAB.services);
  if (sv) res.services = sv.filter(r => txt(r[0], 80) && visible(r[3]))
    .slice(0, 20).map(r => ({ name: txt(r[0], 80), desc: txt(r[1], 200), price: txt(r[2], 60) }));

  const gl = rows(TAB.gallery);
  if (gl) res.gallery = gl.filter(r => txt(r[0], 80) && visible(r[3]))
    .slice(0, 60).map(r => ({ name: txt(r[0], 80), style: txt(r[1], 40) || "Khác", img: imageUrl(r[2]) }));

  const vd = rows(TAB.videos);
  if (vd) res.videos = vd.filter(r => visible(r[1])).map(r => tiktokId(r[0])).filter(Boolean).slice(0, 12);

  const pz = rows(TAB.prizes);
  if (pz) res.prizes = pz.filter(r => txt(r[0], 60) && visible(r[2]))
    .slice(0, 12).map(r => ({ t: txt(r[0], 60), code: txt(r[1], 20) }));

  return res;
}

/* ============ Tạo các tab nội dung với dữ liệu mẫu ============ */
function setupContentSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const made = [];
  const site = "https://2tnail.vercel.app/images/";

  const make = (name, headers, data, opts) => {
    if (ss.getSheetByName(name)) return;
    const sh = ss.insertSheet(name); made.push(name);
    sh.getRange(1, 1, 1, headers.length).setValues([headers])
      .setFontWeight("bold").setBackground("#141414").setFontColor("#ffffff");
    sh.setFrozenRows(1);
    if (opts.textCol) sh.getRange(2, opts.textCol, 200, 1).setNumberFormat("@");   // giữ nguyên số 0 đầu của SĐT
    if (data.length) {
      const full = data.map(r => headers.map((_, i) => (r[i] === undefined ? "" : r[i])));   // bù ô trống cho đủ số cột
      sh.getRange(2, 1, full.length, headers.length).setValues(full);
    }
    (opts.widths || []).forEach((w, i) => sh.setColumnWidth(i + 1, w));
    if (opts.checkCol) {
      const rng = sh.getRange(2, opts.checkCol, 200, 1);
      rng.insertCheckboxes();
      sh.getRange(2, opts.checkCol, data.length, 1).setValue(true);
    }
    if (opts.styleCol) {
      sh.getRange(2, opts.styleCol, 200, 1).setDataValidation(
        SpreadsheetApp.newDataValidation().requireValueInList(STYLE_LIST, true).setAllowInvalid(true).build());
    }
  };

  make(TAB.settings, ["Mục", "Giá trị"], [
    ["Số điện thoại", "0349392820"], ["Số điện thoại 2", "0936300648"],
    ["Giờ mở cửa", 9], ["Giờ đóng cửa", 21],
    ["Địa chỉ", "40/7 Đặng Thúc Vịnh, Hóc Môn, TP.HCM"], ["Ghi chú địa chỉ", "Gần Coopmart, cạnh chùa Minh Hòa"],
    ["Facebook", "https://www.facebook.com/profile.php?id=61564306340433"],
    ["Instagram", "nailxinhhocmon"], ["TikTok", "nailxinhhocmon"],
    ["Thông báo đầu trang", ""],
  ], { widths: [200, 460], textCol: 2 });

  make(TAB.services, ["Tên dịch vụ", "Mô tả", "Giá (ví dụ: từ 150K)", "Hiện"], [
    ["Sơn gel", "Bền màu, bóng đẹp, nhiều tông từ nude đến rực rỡ.", ""],
    ["Úp & nối móng", "Form móng dài, thon theo dáng tay, nhẹ và tự nhiên.", ""],
    ["Đắp bột", "Móng chắc khỏe, tạo form chuẩn, giữ được lâu.", ""],
    ["Vẽ nghệ thuật", "Vẽ họa tiết, ombre, mắt mèo, French theo ý bạn.", ""],
    ["Đính đá & charm", "Đá, charm, nhũ lấp lánh cho dịp đặc biệt.", ""],
    ["Chăm sóc móng", "Làm sạch, tạo form, dưỡng da tay nhẹ nhàng.", ""],
  ], { widths: [180, 420, 160, 60], checkCol: 4 });

  make(TAB.gallery, ["Tên mẫu", "Nhóm", "Link ảnh (Google Drive hoặc https://...)", "Hiện"], [
    ["Nude kem", "Tối giản", site + "u5.jpg"], ["Hồng pastel", "Nữ tính", site + "u10.jpg"],
    ["Đá vàng đính tay", "Đính đá", site + "u2.jpg"], ["Chrome ánh kim", "Mắt mèo", site + "u7.jpg"],
    ["French màu", "French", site + "u4.jpg"], ["Nhũ bạc tiệc", "Lễ & Tết", site + "u6.jpg"],
    ["Nâu trà sữa", "Tối giản", site + "u12.jpg"], ["Vàng ánh kim", "Lễ & Tết", site + "u9.jpg"],
    ["Vẽ đen trắng", "Vẽ nghệ thuật", site + "u11.jpg"], ["Mắt mèo nâu đen", "Mắt mèo", site + "u3.jpg"],
  ], { widths: [180, 140, 480, 60], checkCol: 4, styleCol: 2 });

  make(TAB.videos, ["Link video TikTok", "Hiện"], [
    ["https://www.tiktok.com/@nailxinhhocmon/video/7688985421933530389"],
    ["https://www.tiktok.com/@nailxinhhocmon/video/7663059345667820820"],
    ["https://www.tiktok.com/@nailxinhhocmon/video/7653721297716923669"],
  ], { widths: [520, 60], checkCol: 2 });

  make(TAB.prizes, ["Tên quà", "Mã", "Hiện"], [
    ["Giảm 10%", "2T10"], ["Tặng sơn dưỡng", "2TCARE"], ["Giảm 20K", "2T20K"],
    ["Tặng 2 charm", "2TCHARM"], ["Giảm 5%", "2T5"], ["Tặng massage tay", "2TSPA"],
  ], { widths: [220, 140, 60], checkCol: 3 });

  if (!ss.getSheetByName(TAB.guide)) {
    const g = ss.insertSheet(TAB.guide); made.push(TAB.guide);
    const lines = [
      ["HƯỚNG DẪN CẬP NHẬT TRANG WEB 2T'S NAIL"], [""],
      ["Sửa trong các tab bên dưới, vài giây đến vài phút sau trang web sẽ tự đổi. Không cần làm gì thêm."], [""],
      ["• Cài đặt: số điện thoại, giờ mở cửa (ghi số, ví dụ 9 và 21), địa chỉ, link mạng xã hội, thông báo đầu trang (để trống = không hiện)."],
      ["• Dịch vụ: mỗi dòng một dịch vụ. Cột Giá để trống thì trang ghi 'Nhắn tiệm để báo giá'."],
      ["• Mẫu nail: mỗi dòng một mẫu. Chọn Nhóm trong danh sách. Bỏ tích ô 'Hiện' để ẩn mẫu mà không phải xóa."],
      ["• Video TikTok: dán link video (dạng https://www.tiktok.com/@.../video/...). Xóa hết dòng thì mục video ẩn đi."],
      ["• Quà vòng quay: mỗi dòng một phần quà. Xóa hết hoặc bỏ tích hết thì mục vòng quay ẩn đi."],
      ["• Lịch hẹn: khách gửi từ trang web sẽ hiện ở đây. Chỉ xem, đổi cột Trạng thái khi đã xử lý."], [""],
      ["THÊM ẢNH MẪU NAIL"],
      ["1. Tải ảnh lên một thư mục Google Drive của tiệm (ảnh dọc, tỉ lệ 4:5 là đẹp nhất, dưới 1 MB)."],
      ["2. Chuột phải vào ảnh > Chia sẻ > 'Bất kỳ ai có đường liên kết' > Người xem. (BẮT BUỘC, nếu không ảnh không hiện.)"],
      ["3. Bấm 'Sao chép đường liên kết' rồi dán vào cột 'Link ảnh' của tab Mẫu nail."],
      ["4. Không xóa hoặc đổi tên ảnh trong Drive, nếu xóa ảnh trên trang sẽ biến mất."], [""],
      ["Muốn thay đổi ngay lập tức: menu '2T's Nail' > 'Làm mới trang web ngay'."],
      ["Lỡ sửa nhầm: Tệp > Lịch sử phiên bản > Xem lịch sử phiên bản để khôi phục."],
    ];
    g.getRange(1, 1, lines.length, 1).setValues(lines).setWrap(true);
    g.setColumnWidth(1, 760); g.getRange(1, 1).setFontWeight("bold").setFontSize(14);
    g.getRange(10, 1).setFontWeight("bold");
  }
  clearContentCache();
  SpreadsheetApp.getActiveSpreadsheet().toast(made.length ? "Đã tạo: " + made.join(", ") : "Các tab đã có sẵn, không đổi gì.", "2T's Nail", 8);
}

/* ============ Tiện ích ============ */
function visible(v) {
  if (v === false) return false;
  const s = String(v).trim().toLowerCase();
  return !(s === "false" || s === "không" || s === "khong" || s === "ẩn" || s === "an" || s === "0");
}
function parseHour(v) {
  const m = String(v == null ? "" : v).match(/(\d{1,2})/);
  const h = m ? +m[1] : null;
  return h !== null && h >= 0 && h <= 24 ? h : null;
}
function phoneText(v) {
  const s = String(v == null ? "" : v).trim();
  return /^\d{9}$/.test(s) ? "0" + s : s;   // Sheet hay tự biến 0349... thành số và mất số 0 đầu
}
function tiktokId(v) {
  const m = String(v || "").match(/video\/(\d{15,25})/) || String(v || "").match(/^\s*(\d{15,25})\s*$/);
  return m ? m[1] : "";
}
function imageUrl(v) {
  const u = String(v || "").trim();
  if (!u) return "";
  const d = u.match(/drive\.google\.com\/file\/d\/([\w-]{10,})/) || u.match(/drive\.google\.com\/(?:open|uc|thumbnail)\?[^#]*\bid=([\w-]{10,})/);
  if (d) return "https://drive.google.com/thumbnail?id=" + d[1] + "&sz=w800";
  return /^https:\/\/[^\s"'<>]+$/.test(u) ? u : "";
}
function txt(v, max) {
  return String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
}
function clean(v, max) {
  v = String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(v) ? "'" + v : v;   // chặn công thức độc hại trong Sheet
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
