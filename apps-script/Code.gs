/**
 * 2T's Nail – nhận lịch hẹn từ landing page và ghi vào Google Sheet.
 *
 * CÁCH DÙNG (khoảng 5 phút):
 * 1. Vào https://sheets.google.com, tạo Sheet mới, đặt tên "Lịch hẹn 2T's Nail".
 * 2. Menu Tiện ích mở rộng (Extensions) > Apps Script. Xóa code mẫu, dán toàn bộ file này vào.
 * 3. (Tùy chọn) Điền email chủ tiệm vào OWNER_EMAIL bên dưới để nhận email mỗi khi có lịch mới.
 * 4. Bấm Triển khai (Deploy) > Tùy chọn triển khai mới > loại "Ứng dụng web":
 *      - Thực thi dưới tên: Tôi
 *      - Ai có quyền truy cập: Bất kỳ ai
 *    Bấm Triển khai, cấp quyền khi Google hỏi, rồi sao chép "URL ứng dụng web" (dạng https://script.google.com/macros/s/.../exec).
 * 5. Dán URL đó vào sheetWebhook trong script.js (CONFIG), lưu và deploy lại trang.
 * Khi sửa code này sau đó: Triển khai > Quản lý triển khai > sửa > Phiên bản mới.
 */

const OWNER_EMAIL = "";          // ví dụ "tiem@gmail.com" – để trống nếu không cần email
const SHEET_NAME = "Lịch hẹn";
const HEADERS = ["Nhận lúc", "Tên", "SĐT", "Dịch vụ", "Ngày hẹn", "Giờ hẹn",
                 "Mẫu thích", "Ưu đãi", "Ghi chú", "Kênh khách chọn", "Trạng thái"];

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
    const gift = d.gift && d.gift.t ? d.gift.t + " (" + d.gift.code + ")" : "";
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

function doGet() { return out({ ok: true, service: "2T's Nail booking" }); }

function clean(v, max) {
  v = String(v == null ? "" : v).replace(/[\u0000-\u001f]/g, " ").trim().slice(0, max);
  return /^[=+\-@]/.test(v) ? "'" + v : v;   // chặn công thức độc hại trong Sheet
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
