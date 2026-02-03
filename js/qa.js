/**
 * Q&A Page Functionality
 * ระบบส่งคำถามและแสดงคำถามที่ตอบแล้ว
 * รองรับทั้ง localStorage และ Backend API
 */
(function () {
  var questionsList = document.getElementById("qa-list");
  var emptyMessage = document.getElementById("qa-empty");
  var modal = document.getElementById("qa-modal");
  var modalCloseBtn = document.getElementById("modal-close");

  // FAB and Form Modal
  var fab = document.getElementById("qa-fab");
  var formModal = document.getElementById("qa-form-modal");
  var formModalForm = document.getElementById("qa-form-modal-form");
  var formModalCloseBtn = document.getElementById("form-modal-close");

  // Check if using backend API
  var useAPI = typeof QA_CONFIG !== 'undefined' && QA_CONFIG.API_URL && QA_CONFIG.API_URL.length > 0;
  var apiURL = useAPI ? QA_CONFIG.API_URL : '';

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
      var response = await fetch(apiURL + '/api/questions/answered');
      var result = await response.json();
      return result.success ? result.data : [];
    } catch (error) {
      console.error('API Error:', error);
      if (typeof QA_CONFIG !== "undefined" && QA_CONFIG.USE_LOCAL_STORAGE) {
        return getQuestionsLocal().filter(q => q.status === 'answered');
      }
      return [];
    }
  }

  async function submitQuestionAPI(data) {
    try {
      var response = await fetch(apiURL + '/api/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      var result = await response.json();
      return result.success;
    } catch (error) {
      console.error('API Error:', error);
      if (typeof QA_CONFIG !== "undefined" && QA_CONFIG.USE_LOCAL_STORAGE) {
        // Fallback to localStorage
        var questions = getQuestionsLocal();
        var newQuestion = {
          id: Date.now(),
          name: data.name || 'Anonymous',
          category: data.category,
          question: data.question,
          answer: '',
          status: 'pending',
          date: new Date().toISOString()
        };
        questions.unshift(newQuestion);
        saveQuestionsLocal(questions);
        return true;
      }
      return false;
    }
  }

  // ==================== Unified Functions ====================
  async function getAnsweredQuestions() {
    if (useAPI) {
      return await getQuestionsAPI();
    } else {
      return getQuestionsLocal().filter(q => q.status === 'answered');
    }
  }

  async function submitQuestion(data) {
    if (useAPI) {
      return await submitQuestionAPI(data);
    } else {
      var questions = getQuestionsLocal();
      var newQuestion = {
        id: Date.now(),
        name: data.name || 'Anonymous',
        category: data.category,
        question: data.question,
        answer: '',
        status: 'pending',
        date: new Date().toISOString()
      };
      questions.unshift(newQuestion);
      saveQuestionsLocal(questions);
      return true;
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

  // ==================== Render Functions ====================
  async function renderAnsweredQuestions() {
    var answeredQuestions = await getAnsweredQuestions();

    if (answeredQuestions.length === 0) {
      questionsList.innerHTML = "";
      emptyMessage.style.display = "block";
      return;
    }

    emptyMessage.style.display = "none";
    questionsList.innerHTML = answeredQuestions
      .map(function (q) {
        return (
          '<div class="qa-card">' +
          '<div class="qa-card__header">' +
          '<span class="qa-card__category">' + escapeHtml(q.category) + "</span>" +
          '<div class="qa-card__meta">' +
          '<span class="qa-card__author">' + escapeHtml(q.name) + "</span>" +
          '<span class="qa-card__date">' + formatDate(q.date) + "</span>" +
          "</div>" +
          "</div>" +
          '<p class="qa-card__question">' + escapeHtml(q.question) + "</p>" +
          '<div class="qa-card__answer">' +
          '<p class="qa-card__answer-label">คำตอบจากทีมงาน</p>' +
          '<p class="qa-card__answer-text">' + escapeHtml(q.answer) + "</p>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");
  }

  // ==================== Event Handlers ====================
  
  // FAB click - open form modal
  if (fab) {
    fab.addEventListener("click", function () {
      openFormModal();
    });
  }

  // Form Modal functions
  function openFormModal() {
    if (formModal) {
      formModal.classList.add("active");
      document.body.style.overflow = "hidden";
    }
  }

  function closeFormModal() {
    if (formModal) {
      formModal.classList.remove("active");
      document.body.style.overflow = "";
    }
  }

  if (formModalCloseBtn) {
    formModalCloseBtn.addEventListener("click", closeFormModal);
  }

  if (formModal) {
    formModal.querySelector(".qa-form-modal__overlay").addEventListener("click", closeFormModal);
  }

  // Form submission (modal form)
  if (formModalForm) {
    formModalForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      var nameInput = document.getElementById("qa-name-modal");
      var categorySelect = document.getElementById("qa-category-modal");
      var questionTextarea = document.getElementById("qa-question-modal");

      var name = nameInput.value.trim() || "Anonymous";
      var category = categorySelect.value;
      var question = questionTextarea.value.trim();

      if (!category || !question) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }

      var submitBtn = formModalForm.querySelector('.qa-form__submit');
      submitBtn.disabled = true;
      submitBtn.textContent = 'กำลังส่ง...';

      var success = await submitQuestion({ name, category, question });

      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span class="submit-icon">📨</span> ส่งคำถาม';

      if (success) {
        formModalForm.reset();
        closeFormModal();
        modal.classList.add("active");
      } else {
        alert("เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง");
      }
    });
  }

  // Close success modal
  function closeModal() {
    modal.classList.remove("active");
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.querySelector(".qa-modal__overlay").addEventListener("click", closeModal);
  }

  // Escape key handler
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      if (formModal && formModal.classList.contains("active")) {
        closeFormModal();
      } else if (modal && modal.classList.contains("active")) {
        closeModal();
      }
    }
  });

  // Initial render
  renderAnsweredQuestions();
})();
