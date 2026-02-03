/**
 * Member Modal Functionality
 * แสดง popup ข้อมูลสมาชิกเมื่อคลิกที่การ์ด
 */
(function () {
  var modal = document.getElementById("member-modal");
  if (!modal) return;

  var modalPhoto = document.getElementById("modal-photo");
  var modalNickname = document.getElementById("modal-nickname");
  var modalFullname = document.getElementById("modal-fullname");
  var modalBadge = document.getElementById("modal-badge");
  var modalBirthday = document.getElementById("modal-birthday");
  var modalClass = document.getElementById("modal-class");
  var modalIg = document.getElementById("modal-ig");
  var modalIgText = document.getElementById("modal-ig-text");
  var closeBtn = modal.querySelector(".member-modal__close");
  var overlay = modal.querySelector(".member-modal__overlay");

  var cards = document.querySelectorAll(".member-card");

  cards.forEach(function (card) {
    card.style.cursor = "pointer";
    card.addEventListener("click", function () {
      var nickname = card.dataset.nickname;
      var fullname = card.dataset.fullname;
      var position = card.dataset.position;
      var birthday = card.dataset.birthday;
      var className = card.dataset.class;
      var ig = card.dataset.ig;
      var photo = card.dataset.photo;

      modalPhoto.src = photo;
      modalPhoto.alt = nickname;
      modalNickname.textContent = nickname;
      modalFullname.textContent = fullname;
      modalBadge.textContent = position;
      modalBirthday.textContent = birthday;
      modalClass.textContent = className;
      modalIg.href = "https://instagram.com/" + ig;
      modalIgText.textContent = "@" + ig;

      modal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
  });

  function closeModal() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }

  closeBtn.addEventListener("click", closeModal);
  overlay.addEventListener("click", closeModal);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("active")) {
      closeModal();
    }
  });
})();
