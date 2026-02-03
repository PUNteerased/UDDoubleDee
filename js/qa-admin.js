/**
 * Q&A Admin Page Functionality
 * ระบบจัดการและตอบคำถาม พร้อมลบคำถาม
 * รองรับทั้ง localStorage และ Backend API
 */
(function () {
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
  var logoutBtn = document.getElementById("admin-logout");

  var currentFilter = "all";
  var currentQuestionId = null;
  var adminTokenKey = "qa_admin_token";

  // Check if using backend API
  var useAPI = typeof QA_CONFIG !== 'undefined' && QA_CONFIG.API_URL && QA_CONFIG.API_URL.length > 0;
  var apiURL = useAPI ? QA_CONFIG.API_URL : '';

  function getAdminToken() {
    return sessionStorage.getItem(adminTokenKey) || "";
  }

  function setAdminToken(token) {
    if (token) {
      sessionStorage.setItem(adminTokenKey, token);
    } else {
      sessionStorage.removeItem(adminTokenKey);
    }
  }

  function showAuth(message) {
    if (authError) {
      authError.textContent = message || "";
    }
    if (authModal) {
      authModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function hideAuth() {
    if (authModal) {
      authModal.classList.remove("active");
      document.body.style.overflow = "";
    }
    if (authError) {
      authError.textContent = "";
    }
  }

  async function validateToken(token) {
    if (!token) return false;
    if (useAPI) {
      try {
        var response = await fetch(apiURL + "/api/questions", {
          headers: { "X-Admin-Token": token }
        });
        if (!response.ok) return false;
        var result = await response.json();
        return result && result.success;
      } catch (error) {
        console.error("API Error:", error);
        return false;
      }
    }
    if (typeof QA_CONFIG === "undefined" || !QA_CONFIG.ADMIN_PASSWORD) {
      return false;
    }
    return token === QA_CONFIG.ADMIN_PASSWORD;
  }

  async function ensureAuth() {
    var token = getAdminToken();
    if (!token) {
      showAuth("กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน");
      return false;
    }
    if (!useAPI && (typeof QA_CONFIG === "undefined" || !QA_CONFIG.ADMIN_PASSWORD)) {
      showAuth("กรุณาตั้งค่า ADMIN_PASSWORD ในไฟล์ config.js");
      return false;
    }
    if (!useAPI && token !== QA_CONFIG.ADMIN_PASSWORD) {
      setAdminToken("");
      showAuth("รหัสผ่านไม่ถูกต้อง");
      return false;
    }
    return true;
  }

  // ==================== localStorage Functions ====================
  function getQuestionsLocal() {
    var questions = localStorage.getItem("qa_questions");
    return questions ? JSON.parse(questions) : [];
  }

  function saveQuestionsLocal(questions) {
    localStorage.setItem("qa_questions", JSON.stringify(questions));
  }

  // ==================== API Functions ====================
  async function getQuestionsAPI() {
    try {
      var token = getAdminToken();
      if (!token) {
        showAuth("กรุณากรอกรหัสผ่านเพื่อเข้าใช้งาน");
        return [];
      }
      var response = await fetch(apiURL + '/api/questions', {
        headers: { "X-Admin-Token": token }
      });
      if (response.status === 401 || response.status === 403) {
        setAdminToken("");
        showAuth("รหัสผ่านไม่ถูกต้องหรือหมดอายุ");
        return [];
      }
      var result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('API Error:', error);
      if (typeof QA_CONFIG !== "undefined" && QA_CONFIG.USE_LOCAL_STORAGE) {
        return getQuestionsLocal();
      }
      return [];
    }
  }

  async function updateQuestionAPI(id, answer) {
    try {
      var token = getAdminToken();
      var response = await fetch(apiURL + '/api/questions/' + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', "X-Admin-Token": token },
        body: JSON.stringify({ answer })
      });
      if (response.status === 401 || response.status === 403) {
        setAdminToken("");
        showAuth("รหัสผ่านไม่ถูกต้องหรือหมดอายุ");
        return false;
      }
      var result = await response.json();
      return result.success;
    } catch (error) {
      console.error('API Error:', error);
      if (typeof QA_CONFIG !== "undefined" && QA_CONFIG.USE_LOCAL_STORAGE) {
        // Fallback to localStorage
        var questions = getQuestionsLocal();
        var index = questions.findIndex(q => q.id === id);
        if (index !== -1) {
          questions[index].answer = answer;
          questions[index].status = 'answered';
          questions[index].answeredDate = new Date().toISOString();
          saveQuestionsLocal(questions);
        }
        return true;
      }
      return false;
    }
  }

  async function deleteQuestionAPI(id) {
    try {
      var token = getAdminToken();
      var response = await fetch(apiURL + '/api/questions/' + id, {
        method: 'DELETE',
        headers: { "X-Admin-Token": token }
      });
      if (response.status === 401 || response.status === 403) {
        setAdminToken("");
        showAuth("รหัสผ่านไม่ถูกต้องหรือหมดอายุ");
        return false;
      }
      var result = await response.json();
      return result.success;
    } catch (error) {
      console.error('API Error:', error);
      if (typeof QA_CONFIG !== "undefined" && QA_CONFIG.USE_LOCAL_STORAGE) {
        // Fallback to localStorage
        var questions = getQuestionsLocal();
        var index = questions.findIndex(q => q.id === id);
        if (index !== -1) {
          questions.splice(index, 1);
          saveQuestionsLocal(questions);
        }
        return true;
      }
      return false;
    }
  }

  // ==================== Unified Functions ====================
  async function getQuestions() {
    if (useAPI) {
      return await getQuestionsAPI();
    } else {
      return getQuestionsLocal();
    }
  }

  async function updateQuestion(id, answer) {
    if (useAPI) {
      return await updateQuestionAPI(id, answer);
    } else {
      var questions = getQuestionsLocal();
      var index = questions.findIndex(q => q.id === id);
      if (index !== -1) {
        questions[index].answer = answer;
        questions[index].status = 'answered';
        questions[index].answeredDate = new Date().toISOString();
        saveQuestionsLocal(questions);
        return true;
      }
      return false;
    }
  }

  async function deleteQuestion(id) {
    if (useAPI) {
      return await deleteQuestionAPI(id);
    } else {
      var questions = getQuestionsLocal();
      var index = questions.findIndex(q => q.id === id);
      if (index !== -1) {
        questions.splice(index, 1);
        saveQuestionsLocal(questions);
        return true;
      }
      return false;
    }
  }

  // ==================== Helper Functions ====================
  function formatDate(dateString) {
    var date = new Date(dateString);
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear() + 543;
    var hours = date.getHours().toString().padStart(2, "0");
    var minutes = date.getMinutes().toString().padStart(2, "0");
    return day + "/" + month + "/" + year + " " + hours + ":" + minutes;
  }

  function escapeHtml(text) {
    var div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  function filterQuestions(questions) {
    if (currentFilter === "all") {
      return questions;
    }
    return questions.filter(function (q) {
      return q.status === currentFilter;
    });
  }

  // ==================== Render Functions ====================
  async function renderAdminList() {
    var allowed = await ensureAuth();
    if (!allowed) {
      return;
    }
    hideAuth();
    var questions = await getQuestions();
    var filteredQuestions = filterQuestions(questions);

    if (filteredQuestions.length === 0) {
      adminList.innerHTML = "";
      emptyMessage.style.display = "block";
      return;
    }

    emptyMessage.style.display = "none";
    adminList.innerHTML = filteredQuestions
      .map(function (q) {
        var statusClass = q.status === "answered" ? "status-dot--answered" : "status-dot--pending";
        return (
          '<div class="qa-admin-card" data-id="' + q.id + '">' +
          '<div class="qa-admin-card__status">' +
          '<span class="status-dot ' + statusClass + '"></span>' +
          "</div>" +
          '<div class="qa-admin-card__content">' +
          '<div class="qa-admin-card__header">' +
          '<span class="qa-admin-card__category">' + escapeHtml(q.category) + "</span>" +
          '<span class="qa-admin-card__date">' + formatDate(q.date) + "</span>" +
          "</div>" +
          '<p class="qa-admin-card__question">' + escapeHtml(q.question) + "</p>" +
          '<p class="qa-admin-card__author">จาก: ' + escapeHtml(q.name) + "</p>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    // Add click handlers
    var cards = adminList.querySelectorAll(".qa-admin-card");
    cards.forEach(function (card) {
      card.addEventListener("click", function () {
        var id = parseInt(card.dataset.id);
        openAnswerModal(id);
      });
    });
  }

  // ==================== Modal Functions ====================
  var currentQuestion = null;

  async function openAnswerModal(questionId) {
    var questions = await getQuestions();
    var question = questions.find(function (q) {
      return q.id === questionId;
    });

    if (!question) return;

    currentQuestionId = questionId;
    currentQuestion = question;

    document.getElementById("modal-category").textContent = question.category;
    document.getElementById("modal-date").textContent = formatDate(question.date);
    document.getElementById("modal-author").textContent = question.name;
    document.getElementById("modal-question").textContent = question.question;
    document.getElementById("modal-answer").value = question.answer || "";

    // Show/hide delete button based on status
    if (deleteBtn) {
      deleteBtn.style.display = question.status === 'answered' ? 'block' : 'none';
    }

    answerModal.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeAnswerModal() {
    answerModal.classList.remove("active");
    document.body.style.overflow = "";
    currentQuestionId = null;
    currentQuestion = null;
  }

  // ==================== Event Handlers ====================
  async function saveAnswer() {
    if (currentQuestionId === null) return;

    var answerText = document.getElementById("modal-answer").value.trim();
    if (!answerText) {
      alert("กรุณาพิมพ์คำตอบ");
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'กำลังบันทึก...';

    var success = await updateQuestion(currentQuestionId, answerText);

    saveBtn.disabled = false;
    saveBtn.textContent = 'บันทึกคำตอบ';

    if (success) {
      closeAnswerModal();
      renderAdminList();
    } else {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  }

  async function handleDelete() {
    if (currentQuestionId === null) return;

    if (!confirm("คุณต้องการลบคำถามนี้หรือไม่?")) {
      return;
    }

    deleteBtn.disabled = true;
    deleteBtn.textContent = 'กำลังลบ...';

    var success = await deleteQuestion(currentQuestionId);

    deleteBtn.disabled = false;
    deleteBtn.textContent = 'ลบคำถาม';

    if (success) {
      closeAnswerModal();
      renderAdminList();
    } else {
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
    }
  }

  // Filter button handlers
  filterButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      filterButtons.forEach(function (b) {
        b.classList.remove("qa-filter__btn--active");
      });
      btn.classList.add("qa-filter__btn--active");
      currentFilter = btn.dataset.filter;
      renderAdminList();
    });
  });

  // Modal handlers
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeAnswerModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", closeAnswerModal);
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", saveAnswer);
  }

  if (deleteBtn) {
    deleteBtn.addEventListener("click", handleDelete);
  }

  if (answerModal) {
    answerModal.querySelector(".qa-modal__overlay").addEventListener("click", closeAnswerModal);
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && answerModal && answerModal.classList.contains("active")) {
      closeAnswerModal();
    }
  });

  if (authForm) {
    authForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      var password = authInput ? authInput.value.trim() : "";
      if (!password) {
        showAuth("กรุณากรอกรหัสผ่าน");
        return;
      }
      var ok = await validateToken(password);
      if (ok) {
        setAdminToken(password);
        if (authInput) authInput.value = "";
        hideAuth();
        renderAdminList();
      } else {
        showAuth("รหัสผ่านไม่ถูกต้อง");
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      setAdminToken("");
      showAuth("ออกจากระบบแล้ว กรุณาเข้าสู่ระบบใหม่");
    });
  }

  // Initial render
  renderAdminList();
})();
