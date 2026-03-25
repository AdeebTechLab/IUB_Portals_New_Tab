window.onload = () => {
  // Dark/Light Mode Toggle
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector("i") : null;
  const savedTheme = localStorage.getItem("theme") || "light";
  const setIcon = (dark) => {
    if (!themeIcon) return;
    themeIcon.className = dark ? "fa-solid fa-sun" : "fa-solid fa-moon";
  };
  
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    setIcon(true);
  } else {
    document.body.classList.remove("dark-mode");
    setIcon(false);
  }
  
  if (themeToggleBtn) {
    themeToggleBtn.onclick = () => {
      document.body.classList.toggle("dark-mode");
      const isDarkMode = document.body.classList.contains("dark-mode");
      localStorage.setItem("theme", isDarkMode ? "dark" : "light");
      setIcon(isDarkMode);
    };
  }

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
  const cameraBtn = document.getElementById("cameraBtn");
  if (cameraBtn) {
    cameraBtn.onclick = () => {
      document.getElementById("searchInput").focus();
      cameraBtn.classList.add("active");
      setTimeout(() => cameraBtn.classList.remove("active"), 250);
    };
  }
  const aiModeBtn = document.getElementById("aiModeBtn");
  if (aiModeBtn) {
    aiModeBtn.onclick = () => aiModeBtn.classList.toggle("active");
  }
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
    window.open(url, "_blank");
    modal.style.display = "none";
  };

  // ToDo Panel Logic
  const todoPanel = document.getElementById("todoPanel");
  const todoPanelClose = document.getElementById("todoPanelClose");
  const todoForm = document.getElementById("todoForm");
  const todoInput = document.getElementById("todoInput");
  const todoTimeInput = document.getElementById("todoTimeInput");
  const todoList = document.getElementById("todoList");

  const toggleTodoPanel = (forceOpen) => {
    if (!todoPanel) return;
    const shouldOpen = typeof forceOpen === "boolean" ? forceOpen : !todoPanel.classList.contains("open");
    todoPanel.classList.toggle("open", shouldOpen);
    todoPanel.setAttribute("aria-hidden", String(!shouldOpen));
  };

  if (todoBtn) {
    todoBtn.onclick = (e) => {
      e.stopPropagation();
      toggleTodoPanel();
    };
  }
  if (todoPanelClose) {
    todoPanelClose.onclick = () => toggleTodoPanel(false);
  }

  // Load notes
  let notes = JSON.parse(localStorage.getItem("dashboard_notes") || "[]");

  const renderNotes = () => {
    if (!todoList) return;
    todoList.innerHTML = "";
    notes.forEach((note, index) => {
      const li = document.createElement("li");
      li.className = "todo-item";
      li.innerHTML = `
        <div class="todo-content">
          <span class="todo-text">${note.text}</span>
          ${note.time ? `<span class="todo-time-display"><i class="fa-regular fa-clock"></i> ${note.time}</span>` : ""}
        </div>
        <button class="todo-delete" data-index="${index}" aria-label="Delete note"><i class="fa-solid fa-trash"></i></button>
      `;
      todoList.appendChild(li);
    });

    document.querySelectorAll(".todo-delete").forEach(btn => {
      btn.onclick = (e) => {
        const idx = parseInt(e.currentTarget.getAttribute("data-index"));
        notes.splice(idx, 1);
        localStorage.setItem("dashboard_notes", JSON.stringify(notes));
        renderNotes();
      };
    });
  };

  if (todoForm) {
    todoForm.onsubmit = (e) => {
      e.preventDefault();
      const text = todoInput.value.trim();
      if (!text) return;
      
      let formattedTime = "";
      if (todoTimeInput.value) {
        const [hours, mins] = todoTimeInput.value.split(":");
        const h = parseInt(hours, 10);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        formattedTime = `${h12}:${mins} ${ampm}`;
      }

      notes.push({ text: text, time: formattedTime });
      localStorage.setItem("dashboard_notes", JSON.stringify(notes));
      todoInput.value = "";
      todoTimeInput.value = "";
      renderNotes();
    };
    renderNotes();
  }

  document.addEventListener("click", (e) => {
    if (!todoPanel || !todoPanel.classList.contains("open")) return;
    if (todoPanel.contains(e.target) || e.target === todoBtn) return;
    toggleTodoPanel(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && todoPanel && todoPanel.classList.contains("open")) {
      toggleTodoPanel(false);
    }
  });

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
  document.getElementById("location").textContent = "Bahawalpur";

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

  // Shortcuts Logic
  const shortcutsWrapper = document.getElementById("shortcutsWrapper");
  const addShortcutModal = document.getElementById("addShortcutModal");
  const shortcutNameInput = document.getElementById("shortcutName");
  const shortcutUrlInput = document.getElementById("shortcutUrl");
  const saveShortcutBtn = document.getElementById("saveShortcutBtn");
  const cancelShortcutBtn = document.getElementById("cancelShortcutBtn");

  const defaultShortcuts = [
    { name: "Facebook", url: "https://www.facebook.com", icon: "https://www.google.com/s2/favicons?domain=facebook.com&sz=64" },
    { name: "YouTube", url: "https://www.youtube.com", icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64" },
    { name: "WhatsApp", url: "https://web.whatsapp.com", icon: "https://www.google.com/s2/favicons?domain=whatsapp.com&sz=64" },
  ];

  let shortcuts = JSON.parse(localStorage.getItem("dashboard_shortcuts"));
  if (!shortcuts) {
    shortcuts = defaultShortcuts;
    localStorage.setItem("dashboard_shortcuts", JSON.stringify(shortcuts));
  }

  const renderShortcuts = () => {
    if (!shortcutsWrapper) return;
    shortcutsWrapper.innerHTML = "";
    
    shortcuts.forEach((sc, index) => {
      const div = document.createElement("div");
      div.className = "shortcut-item";
      div.onclick = (e) => {
        if (!e.target.closest(".remove-shortcut")) {
          window.open(sc.url, "_blank");
        }
      };
      
      div.innerHTML = `
        <div class="shortcut-icon"><img src="${sc.icon}" alt="${sc.name}" /></div>
        <p title="${sc.name}">${sc.name}</p>
        <button class="remove-shortcut" data-index="${index}" title="Remove">✖</button>
      `;
      shortcutsWrapper.appendChild(div);
    });

    const addBtn = document.createElement("div");
    addBtn.className = "shortcut-item";
    addBtn.onclick = () => {
      shortcutNameInput.value = "";
      shortcutUrlInput.value = "";
      if (addShortcutModal) addShortcutModal.style.display = "flex";
    };
    addBtn.innerHTML = `
      <div class="shortcut-icon add-shortcut-btn"><i class="fa-solid fa-plus"></i></div>
      <p>Add</p>
    `;
    shortcutsWrapper.appendChild(addBtn);

    document.querySelectorAll(".remove-shortcut").forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const idx = parseInt(e.currentTarget.getAttribute("data-index"));
        shortcuts.splice(idx, 1);
        localStorage.setItem("dashboard_shortcuts", JSON.stringify(shortcuts));
        renderShortcuts();
      };
    });
  };

  renderShortcuts();

  if (cancelShortcutBtn) {
    cancelShortcutBtn.onclick = () => {
      addShortcutModal.style.display = "none";
    };
  }

  if (saveShortcutBtn) {
    saveShortcutBtn.onclick = () => {
      const name = shortcutNameInput.value.trim();
      let url = shortcutUrlInput.value.trim();
      if (!name || !url) {
        alert("Please enter both name and URL.");
        return;
      }
      if (!/^https?:\/\//i.test(url)) {
        url = "https://" + url;
      }
      
      let domain = "google.com";
      try { domain = new URL(url).hostname; } catch(e){}
      const icon = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
      
      shortcuts.push({ name, url, icon });
      localStorage.setItem("dashboard_shortcuts", JSON.stringify(shortcuts));
      addShortcutModal.style.display = "none";
      renderShortcuts();
    };
  }

  window.addEventListener("click", (e) => {
    if (e.target === addShortcutModal) {
      addShortcutModal.style.display = "none";
    }
  });

};
