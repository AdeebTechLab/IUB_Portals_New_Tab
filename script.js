window.onload = () => {
  function updateClock() {
    const now = new Date();
    document.getElementById("hours").textContent = String(now.getHours()).padStart(2, "0");
    document.getElementById("minutes").textContent = String(now.getMinutes()).padStart(2, "0");
    document.getElementById("seconds").textContent = String(now.getSeconds()).padStart(2, "0");
    document.getElementById("date").textContent = now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  setInterval(updateClock, 1000);
  updateClock();

  async function fetchTemp() {
    try {
      const res = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=29.3956&longitude=71.6833&current_weather=true"
      );
      const data = await res.json();
      document.getElementById("tempVal").textContent = `${data.current_weather.temperature}°C`;
    } catch (err) {
      console.error("Temperature fetch error:", err);
      document.getElementById("tempVal").textContent = "30°C";
    }
  }

  fetchTemp();

  // Slider
  const slides = [
    { src: "Assets/fee_structure_ads.jpg", link: "https://www.iub.edu.pk/fee-structure" },
    { src: "Assets/admission_last_date_ads.jpg", link: "https://www.iub.edu.pk/admissions" },
    { src: "Assets/merit_list_ads.jpg", link: "https://eportal.iub.edu.pk/meritlists/index.php?p=" },
    { src: "Assets/transport_schedule_ads.jpg", link: "https://drive.google.com/file/d/1Cte7DZAqOdvqTKsnzE8nQJPbgL2jFs3r/view?usp=sharing" },
  ];

  let current = 0;
  const slideImg = document.getElementById("slide");
  const dotsContainer = document.getElementById("dots");

  slides.forEach((_, index) => {
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (index === 0) dot.classList.add("active");
    dot.onclick = () => {
      current = index;
      updateSlide();
    };
    dotsContainer.appendChild(dot);
  });

  function updateSlide() {
    slideImg.src = slides[current].src;
    document.querySelectorAll(".dot").forEach((dot, i) => {
      dot.classList.toggle("active", i === current);
    });
  }

  slideImg.onclick = () => window.open(slides[current].link, "_self");

  document.getElementById("prev").onclick = () => {
    current = (current - 1 + slides.length) % slides.length;
    updateSlide();
  };

  document.getElementById("next").onclick = () => {
    current = (current + 1) % slides.length;
    updateSlide();
  };

  setInterval(() => {
    current = (current + 1) % slides.length;
    updateSlide();
  }, 3000);

  // Button actions
  const todoBtn = document.getElementById("todoBtn");
  document.getElementById("bookmarkBtn").onclick = () => alert("Your bookmarks popup!");
  document.getElementById("liveChat").onclick = () => window.open("https://salmanadeeb.wixsite.com/livechat", "_self");
  document.getElementById("announcement").onclick = () => window.open("https://www.iub.edu.pk/news-update", "_self");
  document.getElementById("contact").onclick = () => window.open("https://www.iub.edu.pk/contact", "_self");
  document.getElementById("eportalBtn").onclick = () => window.open("https://eportal.iub.edu.pk/login", "_self");
  document.getElementById("myiubBtn").onclick = () => window.open("https://my.iub.edu.pk/index.php/login", "_self");
  document.getElementById("lmsBtn").onclick = () => window.open("https://lms.iub.edu.pk/login/index.php", "_self");

  // Google Apps Modal
  const modal = document.getElementById("googleModal");
  const btn = document.getElementById("googleBtn");
  const closeBtn = document.getElementById("closeBtn");

  btn.onclick = () => {
    modal.style.display = modal.style.display === "block" ? "none" : "block";
  };
  if (closeBtn) {
    closeBtn.onclick = () => {
      modal.style.display = "none";
    };
  }
  window.onclick = (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
    }
  };
  window.openApp = (url) => {
    window.open(url, "_self");
    modal.style.display = "none";
  };

  if (todoBtn) {
    todoBtn.onclick = () => window.open("https://tasks.google.com/tasks", "_self");
  }

  // AI Tools panel
  const aiPanel = document.getElementById("aiPanel");
  const aiPanelClose = document.getElementById("aiPanelClose");
  const aiToggleBtn = document.getElementById("aiBtn");

  const toggleAiPanel = (forceOpen) => {
    if (!aiPanel) return;
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !aiPanel.classList.contains("open");
    aiPanel.classList.toggle("open", shouldOpen);
    aiPanel.setAttribute("aria-hidden", String(!shouldOpen));
  };

  if (aiToggleBtn) {
    aiToggleBtn.onclick = (e) => {
      e.stopPropagation();
      toggleAiPanel();
    };
  }
  if (aiPanelClose) {
    aiPanelClose.onclick = () => toggleAiPanel(false);
  }
  if (aiPanel) {
    aiPanel.querySelectorAll(".ai-panel-btn").forEach((btn) => {
      btn.onclick = () => {
        const url = btn.getAttribute("data-url");
        if (url) window.open(url, "_self");
      };
    });
  }

  document.addEventListener("click", (e) => {
    if (!aiPanel || !aiPanel.classList.contains("open")) return;
    if (aiPanel.contains(e.target) || e.target === aiToggleBtn) return;
    toggleAiPanel(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && aiPanel && aiPanel.classList.contains("open")) {
      toggleAiPanel(false);
    }
  });

  // Voice Search
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    const recog = new SpeechRecognition();
    document.getElementById("voiceBtn").onclick = () => {
      recog.start();
    };
    recog.onresult = (e) => {
      document.getElementById("searchInput").value = e.results[0][0].transcript;
    };
  }

  // Location
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    document.getElementById("location").textContent = "Location not supported";
  }

  function success(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
      .then((response) => response.json())
      .then((data) => {
        const city = data.address.city || data.address.town || data.address.village || "Unknown";
        document.getElementById("location").textContent = city;
      })
      .catch(() => {
        document.getElementById("location").textContent = "Location unavailable";
      });
  }

  function error() {
    document.getElementById("location").textContent = "Permission denied";
  }

  // Search Bar
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");

  searchBtn.onclick = () => {
    const q = searchInput.value.trim();
    if (q) window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_self");
  };

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const q = searchInput.value.trim();
      if (q) window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, "_self");
    }
  });
};