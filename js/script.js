// ========== GLOBAL VARIABLES ==========
let musicPlaying = false;
const bgMusic = document.getElementById("bgMusic");
const openButton = document.getElementById("openButton");
const openingOverlay = document.getElementById("openingOverlay");
const envelopeContainer = document.getElementById("envelopeContainer");
const envelopeComponent = document.getElementById("envelopeComponent");

// Configuration - Google Apps Script URL
const SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyHWGJS-58vuBe6Ky1LeZDeFNTZPvGS6xmeWN-ij7Se4qjoFtd3DVQxgy1Bbz5As3DEoA/exec";

// Wedding date: 30/11/2025 13:30:00
const weddingDate = new Date("2025-11-30T13:30:00").getTime();

// ========== OPENING SCREEN ==========
function openInvite() {
  // Hide opening overlay immediately if present
  if (openingOverlay && !openingOverlay.classList.contains("hidden")) {
    openingOverlay.classList.add("hidden");
  }

  // Note: do not auto-play music here. Music will start when the user
  // opens the envelope (explicit gesture).

  // Kick off any elements already in view
  setTimeout(() => {
    triggerAllAnimations();
  }, 300);
}

// Keep the button as an optional fallback (desktop browsers with strict policies)
if (openButton) {
  openButton.addEventListener("click", openInvite);
}

// We intentionally do not auto-open the invite on load. The envelope
// click will trigger opening and music playback.

// Music will be started once when the envelope is opened (user gesture).
let musicStarted = false;
function startMusicOnOpen() {
  if (musicStarted || !bgMusic) return;
  musicStarted = true;
  try {
    bgMusic.muted = false;
    if (bgMusic.volume < 0.7) bgMusic.volume = 0.7;
    bgMusic.play().catch(() => {});
    musicPlaying = true;
  } catch (e) {
    // ignore
  }
}

// ========== ENVELOPE OPENING ANIMATION ==========
let envelopeOpened = false;
if (envelopeComponent) {
  envelopeComponent.addEventListener("click", function () {
    if (!envelopeOpened) {
      envelopeContainer.classList.remove("close");
      envelopeContainer.classList.add("open");
      envelopeOpened = true;
      // start music on first open
      startMusicOnOpen();
    } else {
      envelopeContainer.classList.remove("open");
      envelopeContainer.classList.add("close");
      envelopeOpened = false;
    }
  });
}

// ========== COUNTDOWN TIMER ==========
function updateCountdown() {
  const now = new Date().getTime();
  const distance = weddingDate - now;

  if (distance < 0) {
    document.getElementById("days").textContent = "0";
    document.getElementById("hours").textContent = "0";
    document.getElementById("minutes").textContent = "0";
    document.getElementById("seconds").textContent = "0";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("days").textContent = days;
  document.getElementById("hours").textContent = hours;
  document.getElementById("minutes").textContent = minutes;
  document.getElementById("seconds").textContent = seconds;
}

// Update countdown every second
setInterval(updateCountdown, 1000);
updateCountdown();

// ========== SCROLL ANIMATIONS ==========
// Set initial animation states
function initializeAnimationStates() {
  const animatedElements = document.querySelectorAll("[data-transition-key]");

  animatedElements.forEach((element) => {
    const transitionKey = element.getAttribute("data-transition-key");

    // Set initial opacity
    element.style.opacity = "0";

    // Set initial transform based on animation type
    if (transitionKey.includes("slide-up")) {
      element.style.transform = "translateY(60px)";
    } else if (transitionKey.includes("slide-down")) {
      element.style.transform = "translateY(-60px)";
    } else if (transitionKey.includes("slide-left")) {
      element.style.transform = "translateX(60px)";
    } else if (transitionKey.includes("slide-right")) {
      element.style.transform = "translateX(-60px)";
    } else if (transitionKey.includes("fade-in")) {
      element.style.transform = "none";
    } else if (transitionKey.includes("scale")) {
      element.style.transform = "scale(0.8)";
    }
  });
}

// Helper to parse key and animate a single element
function animateElementByTransitionKey(element, transitionKey) {
  // Parse transition parameters
  // Pattern: elementId-animationType-duration-delay-easing-loop
  const parts = transitionKey.split("-");
  let duration = 1.3;
  let delay = 0;

  // Find animation type index first (e.g., slide-up, fade-in, scale)
  let animationTypeIndex = -1;
  const animationTypes = [
    "slide-up",
    "slide-down",
    "slide-left",
    "slide-right",
    "fade-in",
    "scale",
  ];
  for (let i = 0; i < parts.length - 1; i++) {
    const combined = parts[i] + "-" + parts[i + 1];
    if (animationTypes.includes(combined)) {
      animationTypeIndex = i;
      break;
    }
  }

  // Numbers come after animation type
  if (animationTypeIndex >= 0 && animationTypeIndex + 2 < parts.length) {
    const durationStr = parts[animationTypeIndex + 2];
    const delayStr = parts[animationTypeIndex + 3];
    if (!isNaN(parseFloat(durationStr))) duration = parseFloat(durationStr);
    if (!isNaN(parseFloat(delayStr))) delay = parseFloat(delayStr);
  }

  setTimeout(() => {
    element.style.transition = `all ${duration}s cubic-bezier(0.4, 0, 0.2, 1)`;
    element.style.opacity = "1";

    // Reset transform based on animation type
    if (
      transitionKey.includes("slide-up") ||
      transitionKey.includes("slide-down")
    ) {
      element.style.transform = "translateY(0)";
    } else if (
      transitionKey.includes("slide-left") ||
      transitionKey.includes("slide-right")
    ) {
      element.style.transform = "translateX(0)";
    } else if (transitionKey.includes("fade-in")) {
      element.style.transform = "none";
    } else if (transitionKey.includes("scale")) {
      element.style.transform = "scale(1)";
    }

    element.classList.add("animated");
  }, delay * 1000);
}

// Intersection Observer for scroll-triggered animations
let observer = null;
function initObserver() {
  const scrollRoot = document.querySelector(".styles_customScroll__kBx4W");
  const observerOptions = {
    root: scrollRoot || null,
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const element = entry.target;
        const transitionKey = element.getAttribute("data-transition-key");

        if (transitionKey && element.style.opacity === "0") {
          animateElementByTransitionKey(element, transitionKey);

          // Unobserve after animation starts
          observer.unobserve(element);
        }
      }
    });
  }, observerOptions);
}

// Initialize and observe all animated elements
document.addEventListener("DOMContentLoaded", () => {
  if (!observer) initObserver();
  // First, set initial states for elements that don't have them
  const animatedElements = document.querySelectorAll("[data-transition-key]");

  animatedElements.forEach((element) => {
    const transitionKey = element.getAttribute("data-transition-key");

    // Only initialize if element doesn't already have opacity:0 in inline style
    const currentStyle = element.getAttribute("style") || "";
    if (!currentStyle.includes("opacity:0")) {
      // Set initial opacity
      element.style.opacity = "0";

      // Set initial transform based on animation type
      if (transitionKey.includes("slide-up")) {
        element.style.transform = "translateY(60px)";
      } else if (transitionKey.includes("slide-down")) {
        element.style.transform = "translateY(-60px)";
      } else if (transitionKey.includes("slide-left")) {
        element.style.transform = "translateX(60px)";
      } else if (transitionKey.includes("slide-right")) {
        element.style.transform = "translateX(-60px)";
      } else if (transitionKey.includes("fade-in")) {
        element.style.transform = "none";
      } else if (transitionKey.includes("scale")) {
        element.style.transform = "scale(0.8)";
      }
    }
  });

  // Then observe for intersection
  animatedElements.forEach((element) => {
    if (observer) observer.observe(element);
  });
});

// Ensure animations kick in for elements visible after overlay is closed
function triggerAllAnimations() {
  const animatedElements = document.querySelectorAll("[data-transition-key]");
  const scrollRoot = document.querySelector(".styles_customScroll__kBx4W");
  const viewportRect = scrollRoot
    ? scrollRoot.getBoundingClientRect()
    : {
        top: 0,
        left: 0,
        right: (window.innerWidth || document.documentElement.clientWidth) + 0,
        bottom:
          (window.innerHeight || document.documentElement.clientHeight) + 0,
      };
  animatedElements.forEach((element) => {
    if (element.style.opacity === "0") {
      const rect = element.getBoundingClientRect();
      const isVisible =
        rect.bottom > viewportRect.top &&
        rect.right > viewportRect.left &&
        rect.top < viewportRect.bottom &&
        rect.left < viewportRect.right;
      if (isVisible) {
        const transitionKey = element.getAttribute("data-transition-key");
        if (transitionKey)
          animateElementByTransitionKey(element, transitionKey);
      }
    }
  });
}

// ========== SMOOTH SCROLL ==========
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// ========== PREVENT CONTEXT MENU ON IMAGES ==========
document.querySelectorAll("img").forEach((img) => {
  img.addEventListener("contextmenu", (e) => e.preventDefault());
});

// ========== LOADING STATE ==========
window.addEventListener("load", () => {
  // All resources loaded
  console.log("Wedding invitation loaded successfully!");

  // Preload music
  bgMusic.load();
});

// ========== UTILITIES ==========
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ===== AUDIO UNLOCK HELPERS =====
let audioUnlockAttached = false;
function attachAudioUnlock() {
  if (audioUnlockAttached || !bgMusic) return;
  audioUnlockAttached = true;
  const types = ["pointerdown", "touchstart", "click", "keydown", "wheel"];
  const handler = () => {
    try {
      bgMusic.muted = false;
      // Smooth fade-in to pleasant level
      const targetVol = Math.min(1, Math.max(0.5, bgMusic.volume || 0.7));
      fadeVolumeTo(bgMusic, targetVol, 800);
      bgMusic.play();
    } catch (e) {}
    musicPlaying = true;
    types.forEach((t) => window.removeEventListener(t, handler, true));
  };
  types.forEach((t) =>
    window.addEventListener(t, handler, { capture: true, once: true })
  );
}

function fadeVolumeTo(audio, target, durationMs) {
  const start = audio.volume || 0;
  const startTime = performance.now();
  function step(ts) {
    const p = Math.min(1, (ts - startTime) / durationMs);
    audio.volume = start + (target - start) * p;
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// Debounced scroll handler
const handleScroll = debounce(() => {
  // Add any scroll-based effects here
}, 100);

// Prefer scroll events from the main content scroll container if it exists
const scrollRootForEvents =
  document.querySelector(".styles_customScroll__kBx4W") || window;
scrollRootForEvents.addEventListener("scroll", handleScroll);

// ========== RESPONSIVE ADJUSTMENTS ==========
// Scale the fixed 500px canvas to fit the viewport width on small screens
function scaleCanvasToViewport() {
  const root = document.getElementById("root-page-container");
  if (!root) return;

  const canvas = root.firstElementChild; // the inner 500 x N element
  if (!canvas) return;

  const TARGET_WIDTH = 500;
  const availableWidth = Math.min(
    window.innerWidth || document.documentElement.clientWidth || TARGET_WIDTH,
    document.documentElement.clientWidth || TARGET_WIDTH
  );
  const scale = Math.min(1, availableWidth / TARGET_WIDTH);

  // Apply visual scale
  canvas.style.transformOrigin = "top left";
  canvas.style.position = canvas.style.position || "relative";
  // When scaledWidth === availableWidth, no horizontal offset is needed; keep flush-left
  canvas.style.left = "0px";
  canvas.style.transform = `scale(${scale})`;

  // Adjust the root container's layout size so scrolling matches the scaled height
  const originalHeight = canvas.offsetHeight; // unchanged by transform
  const scaledWidth = Math.round(TARGET_WIDTH * scale);
  root.style.height = Math.round(originalHeight * scale) + "px";
  root.style.width = scaledWidth + "px"; // match scaled canvas width exactly
  root.style.margin = "0 auto"; // keep centered

  // Keep the wishes container aligned with the scaled canvas width
  const wishes = document.getElementById("wishes-container");
  if (wishes) {
    wishes.style.width = scaledWidth + "px";
  }
}

// Ensure the wishes container is not a child of a transformed element,
// otherwise position: fixed behaves like absolute.
function ensureWishesContainerMounted() {
  const wishes = document.getElementById("wishes-container");
  if (!wishes) return;
  const root = document.getElementById("root-page-container");
  const canvas = root && root.firstElementChild;
  if (canvas && canvas.contains(wishes)) {
    // Move to <body> so it's fixed relative to the viewport
    document.body.appendChild(wishes);
  }
  // Make sure it's fixed and above content
  wishes.style.position = wishes.style.position || "fixed";
  wishes.style.zIndex = wishes.style.zIndex || "9999";
}
function adjustForMobile() {
  scaleCanvasToViewport();
}

// Xử lý RSVP Form
document.addEventListener("DOMContentLoaded", function () {
  const rsvpForm = document.getElementById("rsvp-form");

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const submitButton = rsvpForm.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.textContent;

      // Disable button and show loading state
      submitButton.disabled = true;
      submitButton.textContent = "Đang gửi...";
      submitButton.style.opacity = "0.7";
      submitButton.style.cursor = "not-allowed";

      const attendanceValue = document.querySelector(
        'input[name="rsvp-attendance"]:checked'
      ).value;
      const willAttend = attendanceValue === "yes";

      const formData = {
        action: "rsvp",
        name: document.getElementById("rsvp-name").value,
        attendance: willAttend ? "Có, tôi sẽ tham dự" : "Không thể tham dự",
        count: document.getElementById("rsvp-count").value,
      };

      console.log("Sending RSVP:", formData);

      fetch(`${SCRIPT_URL}?action=rsvp`, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(formData),
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("RSVP response:", data);

          // Reset button state
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          submitButton.style.opacity = "1";
          submitButton.style.cursor = "pointer";

          if (data.result === "success") {
            if (willAttend) {
              alert(
                "Cảm ơn bạn đã xác nhận tham dự! 💒\nChúng mình rất vui và háo hức được đón tiếp bạn trong ngày trọng đại này! ❤️"
              );
            } else {
              alert(
                "Cảm ơn bạn đã gửi phản hồi! 🌸\nChúng mình hiểu và mong sẽ có dịp gặp gỡ bạn trong tương lai. Chúc bạn luôn mạnh khỏe và hạnh phúc!"
              );
            }
            rsvpForm.reset();
          } else {
            alert("Có lỗi xảy ra: " + (data.error || "Unknown error"));
          }
        })
        .catch((error) => {
          // Reset button state on error
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
          submitButton.style.opacity = "1";
          submitButton.style.cursor = "pointer";

          console.error("Error:", error);
          alert("Có lỗi xảy ra. Vui lòng thử lại!");
        });
    });
  }
});

// ========== WISHES/BLESSING SECTION ==========

// Wishes elements
const wishesSendBtn = document.getElementById("wishes-send-btn");
const wishesModal = document.getElementById("wishes-modal");
const wishesModalClose = document.getElementById("wishes-modal-close");
const wishesForm = document.getElementById("wishes-form");
const wishesList = document.getElementById("wishes-list");
const wishesContainer = document.getElementById("wishes-container");
const wishesToggleBtn = document.getElementById("wishes-toggle-btn");

// Toggle wishes display
if (wishesToggleBtn) {
  wishesToggleBtn.addEventListener("click", () => {
    wishesContainer.classList.toggle("collapsed");

    // Change icon based on state
    if (wishesContainer.classList.contains("collapsed")) {
      // Show custom wish icon image when collapsed
      wishesToggleBtn.innerHTML = `<img src="images/icon_wish_send.png" alt="Wishes" style="width:20px;height:20px;display:block" />`;
    } else {
      // Show X when expanded
      wishesToggleBtn.textContent = "×";
    }

    // Pause/resume marquee when collapsed/expanded
    if (wishesContainer.classList.contains("collapsed")) {
      pauseWishesMarquee();
    } else {
      resumeWishesMarquee();
    }
  });
}

// Open wishes modal when clicking send button
if (wishesSendBtn) {
  wishesSendBtn.addEventListener("click", () => {
    wishesModal.classList.add("active");
  });
}

// Close wishes modal
if (wishesModalClose) {
  wishesModalClose.addEventListener("click", () => {
    wishesModal.classList.remove("active");
  });
}

// Close modal when clicking outside
if (wishesModal) {
  wishesModal.addEventListener("click", (e) => {
    if (e.target === wishesModal) {
      wishesModal.classList.remove("active");
    }
  });
}

// Handle wishes form submission
if (wishesForm) {
  wishesForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const submitBtn = wishesForm.querySelector(".wishes-submit-btn");
    const originalText = submitBtn.textContent;

    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.textContent = "Đang gửi...";

    const wishData = {
      action: "wish",
      name: document.getElementById("wish-name").value.trim(),
      message: document.getElementById("wish-message").value.trim(),
      timestamp: new Date().toISOString(),
    };

    console.log("Sending wish:", wishData);

    // Send wish to Google Sheets
    fetch(`${SCRIPT_URL}?action=wish`, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain",
      },
      body: JSON.stringify(wishData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Wish response:", data);

        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        if (data.result === "success") {
          // Show success message
          alert(
            "Cảm ơn bạn đã gửi lời chúc! 💕\nLời chúc của bạn sẽ xuất hiện trong giây lát."
          );

          // Close modal and reset form
          wishesModal.classList.remove("active");
          wishesForm.reset();

          // Refresh wishes list immediately
          fetchWishes();
        } else {
          alert("Có lỗi xảy ra: " + (data.error || "Unknown error"));
        }
      })
      .catch((error) => {
        // Reset button
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        console.error("Error:", error);
        alert("Có lỗi xảy ra khi gửi lời chúc. Vui lòng thử lại!");
      });
  });
}

// Fetch wishes from Google Sheets
function fetchWishes() {
  // GET request with action parameter
  const fetchURL = `${SCRIPT_URL}?action=wishes`;

  console.log("Fetching wishes from:", fetchURL);

  fetch(fetchURL)
    .then((response) => {
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      return response.text(); // Đọc text trước để debug
    })
    .then((text) => {
      console.log("Raw response:", text);
      try {
        const data = JSON.parse(text);
        console.log("Parsed data:", data);

        if (data && data.wishes && Array.isArray(data.wishes)) {
          console.log("Found wishes:", data.wishes.length);
          displayWishes(data.wishes);
        } else {
          console.warn("No wishes array in response:", data);
          // wishesList.innerHTML =
          //   '<div class="wish-item"><strong>💕 Hãy là người đầu tiên gửi lời chúc!</strong></div>';
        }
      } catch (e) {
        console.error("JSON parse error:", e);
        console.log("Response was:", text);
        wishesList.innerHTML =
          '<div class="wish-item"><strong>⚠️ Lỗi tải lời chúc. Vui lòng kiểm tra console.</strong></div>';
      }
    })
    .catch((error) => {
      console.error("Error fetching wishes:", error);
      // Show default message if fetch fails
      // wishesList.innerHTML =
      //   '<div class="wish-item"><strong>💕 Hãy là người đầu tiên gửi lời chúc!</strong></div>';
    });
}

// Display wishes in vertical list
function displayWishes(wishes) {
  if (!wishes || wishes.length === 0) {
    // wishesList.innerHTML =
    //   '<div class="wish-item"><strong>💕 Hãy là người đầu tiên gửi lời chúc!</strong></div>';
    // Setup marquee with placeholder content
    setupWishesMarquee();
    return;
  }

  // Create wish items HTML - vertical list
  const wishItems = wishes
    .map(
      (wish) =>
        `<div class="wish-item">
      <strong>${escapeHtml(wish.name)}: </strong>
      <text class="wish-item-message">${escapeHtml(wish.message)}</text>
    </div>`
    )
    .join("");

  wishesList.innerHTML = wishItems;

  // Initialize/restart marquee after DOM updates
  setupWishesMarquee();
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Initialize wishes on page load (only once)
document.addEventListener("DOMContentLoaded", () => {
  fetchWishes();
  // Ensure initial scale after DOM is ready
  ensureWishesContainerMounted();
  adjustForMobile();
});

window.addEventListener("resize", debounce(adjustForMobile, 150));
adjustForMobile();

// ========== WISHES AUTO-SCROLL / MARQUEE ==========
let wishesMarqueeRaf = null;
let wishesMarqueePaused = false;
let wishesMarqueeOffset = 0;
let wishesMarqueeLoopHeight = 0;
let wishesMarqueeLastTs = null;

function cancelWishesMarquee() {
  if (wishesMarqueeRaf) {
    cancelAnimationFrame(wishesMarqueeRaf);
    wishesMarqueeRaf = null;
  }
  wishesMarqueeLastTs = null;
}

function pauseWishesMarquee() {
  wishesMarqueePaused = true;
}

function resumeWishesMarquee() {
  wishesMarqueePaused = false;
}

function setupWishesMarquee() {
  const display = document.getElementById("wishes-display");
  const list = document.getElementById("wishes-list");
  if (!display || !list) return;

  // Clean previous clones to avoid growth
  Array.from(list.querySelectorAll(".wish-item.clone")).forEach((el) =>
    el.remove()
  );

  const items = Array.from(list.children).filter((el) =>
    el.classList.contains("wish-item")
  );
  if (items.length === 0) return;

  // Check if content is taller than container BEFORE setting up marquee
  const displayHeight = display.clientHeight || display.offsetHeight || 0;
  const contentHeight = list.scrollHeight;

  // If content fits within the container, don't scroll - align to bottom
  if (contentHeight <= displayHeight) {
    // Align content to bottom of container (like messages appearing from below)
    const offset = Math.max(0, displayHeight - contentHeight);
    list.style.transform = `translateY(${offset}px)`;
    cancelWishesMarquee(); // Stop any running animation
    return;
  }

  // Content is taller than container, proceed with marquee setup
  // Duplicate original set once to create a seamless loop
  const originals = items.filter((el) => !el.classList.contains("clone"));
  originals.forEach((el) => {
    const clone = el.cloneNode(true);
    clone.classList.add("clone");
    list.appendChild(clone);
  });

  // Compute loop height as half of total after duplication
  // Use scrollHeight for accurate value including gaps
  const totalHeight = list.scrollHeight; // includes gaps and all items
  wishesMarqueeLoopHeight = Math.max(1, Math.round(totalHeight / 3));

  // Set initial transform state so content appears to scroll up from the bottom
  // Start the offset near the end of the original content so items enter from below
  // Position the viewport to show the tail of the originals (loopHeight - displayHeight)
  wishesMarqueeOffset = Math.max(0, wishesMarqueeLoopHeight - displayHeight);
  list.style.transform = `translateY(-${wishesMarqueeOffset}px)`;

  // Removed hover/touch pause so the marquee keeps running even when the user moves the cursor over it

  // Start loop
  cancelWishesMarquee();
  const speed = 80; // px per second (faster)
  function step(ts) {
    if (!wishesMarqueeLastTs) wishesMarqueeLastTs = ts;
    const dt = (ts - wishesMarqueeLastTs) / 1000; // seconds
    wishesMarqueeLastTs = ts;

    if (
      !wishesMarqueePaused &&
      !wishesContainer?.classList?.contains("collapsed")
    ) {
      wishesMarqueeOffset += speed * dt;
      if (wishesMarqueeOffset >= wishesMarqueeLoopHeight) {
        wishesMarqueeOffset -= wishesMarqueeLoopHeight;
      }
      list.style.transform = `translateY(-${wishesMarqueeOffset}px)`;
    }

    wishesMarqueeRaf = requestAnimationFrame(step);
  }
  wishesMarqueeRaf = requestAnimationFrame(step);
}
