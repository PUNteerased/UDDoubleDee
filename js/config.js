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
  // ถ้าอยู่บน Cloudflare Pages จะใช้ same-origin อัตโนมัติ
  // ถ้าเปิดแบบ file:// หรือ localhost (เช่น Live Server) จะไม่เรียก API
  API_URL: (__isLocalFile || __isLocalhost) ? "" : (location ? location.origin : ""),
  
  // ถ้าอยู่บนเครื่องตัวเอง ให้ใช้ localStorage ชั่วคราวเพื่อทดสอบได้
  // เมื่อขึ้น Cloudflare Pages ให้ใช้ false เพื่อให้ทุกเครื่องเห็นข้อมูลเดียวกัน
  USE_LOCAL_STORAGE: (__isLocalFile || __isLocalhost),

  // รหัสผ่านสำหรับหน้า Q&A Admin (ใช้เมื่อไม่มี backend / localStorage เท่านั้น)
  // แนะนำให้เปลี่ยนเป็นรหัสของคุณเอง
  ADMIN_PASSWORD: 'change-me'
};
