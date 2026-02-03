/**
 * Q&A Configuration
 * ตั้งค่า API URL สำหรับระบบ Q&A
 */

// ตั้งค่า API URL ที่นี่ (แนะนำ: Cloudflare Pages + Pages Functions)
// - ถ้าโฮสต์บน Cloudflare Pages: ใช้ค่า default (same-origin) ได้เลย
// - ถ้าต้องการชี้ไป API ภายนอก: ใส่ URL เต็ม เช่น 'https://your-api.example.com'
// - ถ้าเว้นว่าง '' และรันแบบ file:// อาจเรียก API ไม่ได้ (ให้ตั้งเป็น localhost/URL แทน)

var __isLocalFile = typeof location !== "undefined" && location.protocol === "file:";
var __isLocalhost = typeof location !== "undefined" && (location.hostname === "localhost" || location.hostname === "127.0.0.1");

var QA_CONFIG = {
  API_URL: "https://qa-api.demakpai555.workers.dev",
  USE_LOCAL_STORAGE: false
  ADMIN_PASSWORD: 'udkubnong'
};
