/**
 * Q&A Admin Page (Cloudflare Worker Version)
 * - ทุกเครื่องเข้าได้
 * - ใส่รหัสถูกถึงจะบันทึกได้
 * - ข้อมูลกลางอยู่ที่ Cloudflare Worker
 */
(function () {
  // ==================== CONFIG ====================
  const API_URL = "https://qa-api.demakpai555.workers.dev"; // <-- URL Worker
  const ADMIN_PASSWORD = "udkubnonh";     // <-- รหัส admin

  // ==================== ELEMENTS ====================
  var adminList = document.getElementById("qa-admin-list");
  var emptyMessage = document.getElementById("qa-admin-empty");

  var filterButtons = document.querySelectorAll(".qa-filter__btn");

  var answerModal = document.getElementById("answer-modal");
  var modalCloseBtn = document.getElementById("answer-modal-close");
  var cancelBtn = document.getElementById("answer-cancel");
  var saveBtn = document.getElementById("answer-save");
  var deleteBtn = document.getElementById("answer-delete");

  var authModal = document.getElementById("admin-auth");
  var authForm = document.getElementById("admin-auth-form");
  var authInput = document.getElementById("admin-auth-password");
  var authError = document.getElementById("admin-auth-error");

  // ==================== STATE ====================
  var questions = [];
  var currentQuestion = null;
  var currentFilter = "all";
  var isAuthed = false;

  // ==================== AUTH ====================
  function showAuth(message) {
    if (authError) authError.textContent = message || "";
    authModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function hideAuth() {
    authModal.classList.remove("active");
    document.body.style.overflow = "";
    if (authError) authError.textContent = "";
  }

  // ==================== API ====================
  async function loadQuestions() {
    try {
      const res = await fetch(API_URL);
      questions = await res.json();
      renderAdminList();
    } catch (err) {
      alert("โหลดข้อมูลไม่สำเร็จ");
    }
  }

  async function saveAllQuestions() {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        password: ADMIN_PASSWORD,
        questions: questions
      })
    });
    return res.ok;
  }

  // ==================== HELPERS ====================
  function formatDate(dateString) {
    var date = new Date(dateString);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear() + 543;
    var hours = date.getHours().toString().padStart(2, "0");
    var minutes = date.getMinutes().toString().padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function filteredQuestions() {
    if (currentFilter === "all") return questions;
    return questions.filter(q => q.status === currentFilter);
  }

  // ==================== RENDER ====================
  function renderAdminList() {
    if (!isAuthed) return;

    var list = filteredQuestions();

    if (list.length === 0) {
      adminList.innerHTML = "";
      emptyMessage.style.display = "block";
      return;
    }

    emptyMessage.style.display = "none";
    adminList.innerHTML = list.map(q => {
      return `
        <div class="qa-admin-card" data-id="${q.id}">
          <div class="qa-admin-card__content">
            <span class="qa-admin-card__category">${escapeHtml(q.category)}</span>
            <span class="qa-admin-card__date">${formatDate(q.date)}</span>
            <p class="qa-admin-card__question">${escapeHtml(q.question)}</p>
            <p class="qa-admin-card__author">จาก: ${escapeHtml(q.name)}</p>
          </div>
        </div>
      `;
    }).join("");

    adminList.querySelectorAll(".qa-admin-card").forEach(card => {
      card.addEventListener("click", () => {
        openAnswerModal(Number(card.dataset.id));
      });
    });
  }

  // ==================== MODAL ====================
  function openAnswerModal(id) {
    currentQuestion = questions.find(q => q.id === id);
    if (!currentQuestion) return;

    document.getElementById("modal-category").textContent = currentQuestion.category;
    document.getElementById("modal-date").textContent = formatDate(currentQuestion.date);
    document.getElementById("modal-author").textContent = currentQuestion.name;
    document.getElementById("modal-question").textContent = currentQuestion.question;
    document.getElementById("modal-answer").value = currentQuestion.answer || "";

    deleteBtn.style.display = currentQuestion.status === "answered" ? "block" : "none";

    answerModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeAnswerModal() {
    answerModal.classList.remove("active");
    document.body.style.overflow = "";
    currentQuestion = null;
  }

  // ==================== ACTIONS ====================
  async function saveAnswer() {
    var answerText = document.getElementById("modal-answer").value.trim();
    if (!answerText) {
      alert("กรุณาพิมพ์คำตอบ");
      return;
    }

    currentQuestion.answer = answerText;
    currentQuestion.status = "answered";

    saveBtn.disabled = true;
    saveBtn.textContent = "กำลังบันทึก...";

    var ok = await saveAllQuestions();

    saveBtn.disabled = false;
    saveBtn.textContent = "บันทึกคำตอบ";

    if (ok) {
      closeAnswerModal();
      renderAdminList();
    } else {
      alert("รหัสผ่านไม่ถูกต้อง หรือบันทึกไม่สำเร็จ");
    }
  }

  async function deleteQuestion() {
    if (!confirm("คุณต้องการลบคำถามนี้หรือไม่?")) return;

    questions = questions.filter(q => q !== currentQuestion);

    deleteBtn.disabled = true;
    deleteBtn.textContent = "กำลังลบ...";

    var ok = await saveAllQuestions();

    deleteBtn.disabled = false;
    deleteBtn.textContent = "ลบคำถาม";

    if (ok) {
      closeAnswerModal();
      renderAdminList();
    } else {
      alert("ลบไม่สำเร็จ");
    }
  }

  // ==================== EVENTS ====================
  if (authForm) {
    authForm.addEventListener("submit", e => {
      e.preventDefault();
      var password = authInput.value.trim();
      if (password !== ADMIN_PASSWORD) {
        showAuth("รหัสผ่านไม่ถูกต้อง");
        return;
      }
      isAuthed = true;
      hideAuth();
      loadQuestions();
    });
  }

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("qa-filter__btn--active"));
      btn.classList.add("qa-filter__btn--active");
      currentFilter = btn.dataset.filter;
      renderAdminList();
    });
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener("click", closeAnswerModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeAnswerModal);
  if (saveBtn) saveBtn.addEventListener("click", saveAnswer);
  if (deleteBtn) deleteBtn.addEventListener("click", deleteQuestion);

  // ==================== INIT ====================
  showAuth("กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน");
})();
