/**
 * Page Loader
 * แสดง loading animation พร้อม progress bar ตามการโหลดจริง
 * ขั้นต่ำ 1.5 วินาที
 */
(function() {
  var loader = document.getElementById('page-loader');
  var progressBar = document.getElementById('loader-progress-bar');
  var percentText = document.getElementById('loader-percent');
  
  if (!loader || !progressBar || !percentText) return;

  var MIN_LOAD_TIME = 1500; // ขั้นต่ำ 1.5 วินาที
  var startTime = Date.now();
  var currentProgress = 0;
  var targetProgress = 0;
  var animationFrame;
  var isComplete = false;

  // Get all resources to track
  var images = document.images;
  var totalResources = images.length + 1; // +1 for DOM
  var loadedResources = 0;

  // Update progress bar smoothly
  function animateProgress() {
    if (currentProgress < targetProgress) {
      currentProgress += Math.max(1, (targetProgress - currentProgress) * 0.1);
      if (currentProgress > targetProgress) currentProgress = targetProgress;
      
      var displayProgress = Math.round(currentProgress);
      progressBar.style.width = displayProgress + '%';
      percentText.textContent = displayProgress + '%';
    }
    
    if (currentProgress < 100 || !isComplete) {
      animationFrame = requestAnimationFrame(animateProgress);
    }
  }

  // Calculate progress based on loaded resources
  function updateResourceProgress() {
    loadedResources++;
    var resourceProgress = (loadedResources / totalResources) * 100;
    targetProgress = Math.min(95, resourceProgress); // Cap at 95% until fully loaded
  }

  // Track image loading
  function trackImages() {
    for (var i = 0; i < images.length; i++) {
      if (images[i].complete) {
        loadedResources++;
      } else {
        images[i].addEventListener('load', updateResourceProgress);
        images[i].addEventListener('error', updateResourceProgress);
      }
    }
    // Update initial progress
    targetProgress = Math.min(95, (loadedResources / totalResources) * 100);
  }

  // Complete loading
  function completeLoading() {
    var elapsedTime = Date.now() - startTime;
    var remainingTime = Math.max(0, MIN_LOAD_TIME - elapsedTime);

    // Wait for minimum time before completing
    setTimeout(function() {
      targetProgress = 100;
      isComplete = true;
      
      // Wait for animation to reach 100%
      var checkComplete = setInterval(function() {
        if (currentProgress >= 99) {
          clearInterval(checkComplete);
          currentProgress = 100;
          progressBar.style.width = '100%';
          percentText.textContent = '100%';
          
          setTimeout(function() {
            loader.classList.add('loaded');
            document.body.style.overflow = '';
            cancelAnimationFrame(animationFrame);
          }, 200);
        }
      }, 50);
    }, remainingTime);
  }

  // Initialize
  function init() {
    document.body.style.overflow = 'hidden';
    
    // Start with small progress for DOM ready
    targetProgress = 10;
    
    // Track images
    trackImages();
    
    // Start animation
    animateProgress();

    // When DOM is ready
    if (document.readyState === 'interactive' || document.readyState === 'complete') {
      targetProgress = Math.max(targetProgress, 30);
    } else {
      document.addEventListener('DOMContentLoaded', function() {
        targetProgress = Math.max(targetProgress, 30);
      });
    }

    // When page is fully loaded
    if (document.readyState === 'complete') {
      completeLoading();
    } else {
      window.addEventListener('load', completeLoading);
    }
  }

  init();
})();
