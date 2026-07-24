document.addEventListener("DOMContentLoaded", () => {
  /* Theme Toggle  */
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const themeIcon = document.getElementById("themeIcon");

  const savedTheme = localStorage.getItem("iub_theme") || "light";
  html.setAttribute("data-theme", savedTheme);
  themeIcon.className =
    savedTheme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";

  themeToggle.addEventListener("click", () => {
    const isDark = html.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    html.setAttribute("data-theme", next);
    themeIcon.className =
      next === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
    localStorage.setItem("iub_theme", next);
  });

  /* Color Scheme Switcher */

  const savedAccent = localStorage.getItem("iub_accent");
  const savedAccent2 = localStorage.getItem("iub_accent2");
  if (savedAccent && savedAccent2) {
    html.style.setProperty("--accent", savedAccent);
    html.style.setProperty("--accent2", savedAccent2);
  }

  document.querySelectorAll(".swatch").forEach((sw) => {
    if (sw.dataset.accent === savedAccent) {
      document
        .querySelectorAll(".swatch")
        .forEach((s) => s.classList.remove("active"));
      sw.classList.add("active");
    }
    sw.addEventListener("click", () => {
      document
        .querySelectorAll(".swatch")
        .forEach((s) => s.classList.remove("active"));
      sw.classList.add("active");
      html.style.setProperty("--accent", sw.dataset.accent);
      html.style.setProperty("--accent2", sw.dataset.accent2);
      localStorage.setItem("iub_accent", sw.dataset.accent);
      localStorage.setItem("iub_accent2", sw.dataset.accent2);
    });
  });

  /*  Clock                 */

  const REEL_ITEM_HEIGHT_MAIN = 58;
  const REEL_ITEM_HEIGHT_SEC = 58;

  function buildReel(el, isSecReel) {
    const strip = document.createElement("div");
    strip.className = "reel-strip";
    for (let cycle = 0; cycle < 2; cycle++) {
      for (let d = 0; d <= 9; d++) {
        const span = document.createElement("span");
        span.textContent = d;
        strip.appendChild(span);
      }
    }
    el.appendChild(strip);
    return { strip, index: 0, itemHeight: isSecReel ? REEL_ITEM_HEIGHT_SEC : REEL_ITEM_HEIGHT_MAIN };
  }

  function setReel(reel, transform, animate) {
    reel.strip.style.transition = animate ? "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)" : "none";
    reel.strip.style.transform = `translateY(-${transform * reel.itemHeight}px)`;
  }

  function updateReel(reel, digit) {
    const currentDigit = reel.index % 10;
    const delta = (digit - currentDigit + 10) % 10;
    let newIndex = reel.index + delta;

    setReel(reel, newIndex, true);
    reel.index = newIndex;

    if (newIndex >= 10) {
      setTimeout(() => {
        reel.index = newIndex - 10;
        setReel(reel, reel.index, false);
      }, 520);
    }
  }

  const reels = {};
  document.querySelectorAll(".clock-reel").forEach((el) => {
    const isSec = el.classList.contains("clock-reel-sec");
    reels[el.dataset.slot] = buildReel(el, isSec);
  });

 function updateClock() {
    const now = new Date();
    const rawHour = now.getHours();
    const isPM = rawHour >= 12;
    let hour12 = rawHour % 12;
    if (hour12 === 0) hour12 = 12;

    const h = String(hour12).padStart(2, "0");
    const m = String(now.getMinutes()).padStart(2, "0");
    const s = String(now.getSeconds()).padStart(2, "0");

    updateReel(reels.h1, parseInt(h[0]));
    updateReel(reels.h2, parseInt(h[1]));
    updateReel(reels.m1, parseInt(m[0]));
    updateReel(reels.m2, parseInt(m[1]));
    updateReel(reels.s1, parseInt(s[0]));
    updateReel(reels.s2, parseInt(s[1]));

    document.getElementById("clockAmPm").textContent = isPM ? "PM" : "AM";

    document.getElementById("clockDate").textContent = now.toLocaleDateString(undefined, {
      weekday: "short", day: "numeric", month: "short",
    });
  }
  updateClock();
  setInterval(updateClock, 1000);

  /* Name Capture + Greeting */

  const nameModal = document.getElementById("nameModal");
  const nameInput = document.getElementById("nameInput");
  const saveNameBtn = document.getElementById("saveNameBtn");
  const greetingText = document.getElementById("greetingText");

  function renderGreeting(name) {
    const hour = new Date().getHours();
    let part = "Evening";
    if (hour < 12) part = "Morning";
    else if (hour < 17) part = "Afternoon";
    else if (hour < 21) part = "Evening";
    else part = "Night";
    greetingText.innerHTML = `Good ${part}, <span>${name}</span>`;
  }

  const savedName = localStorage.getItem("iub_user_name");
  if (savedName) {
    renderGreeting(savedName);
  } else {
    nameModal.classList.add("show");
    nameInput.focus();
  }

  function saveName() {
    const val = nameInput.value.trim();
    if (!val) return;
    localStorage.setItem("iub_user_name", val);
    nameModal.classList.remove("show");
    renderGreeting(val);
  }
  saveNameBtn.addEventListener("click", saveName);
  nameInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") saveName();
  });

  /*Live Location & weather        */

  const WEATHER_CODES = {
    0: { label: "Clear sky", icon: "fa-sun" },
    1: { label: "Mainly clear", icon: "fa-cloud-sun" },
    2: { label: "Partly cloudy", icon: "fa-cloud-sun" },
    3: { label: "Overcast", icon: "fa-cloud" },
    45: { label: "Fog", icon: "fa-smog" },
    48: { label: "Fog", icon: "fa-smog" },
    51: { label: "Drizzle", icon: "fa-cloud-rain" },
    53: { label: "Drizzle", icon: "fa-cloud-rain" },
    55: { label: "Drizzle", icon: "fa-cloud-rain" },
    61: { label: "Light rain", icon: "fa-cloud-showers-heavy" },
    63: { label: "Rain", icon: "fa-cloud-showers-heavy" },
    65: { label: "Heavy rain", icon: "fa-cloud-showers-heavy" },
    71: { label: "Snow", icon: "fa-snowflake" },
    73: { label: "Snow", icon: "fa-snowflake" },
    75: { label: "Heavy snow", icon: "fa-snowflake" },
    80: { label: "Rain showers", icon: "fa-cloud-showers-heavy" },
    81: { label: "Rain showers", icon: "fa-cloud-showers-heavy" },
    82: { label: "Rain showers", icon: "fa-cloud-showers-heavy" },
    95: { label: "Thunderstorm", icon: "fa-bolt" },
    96: { label: "Thunderstorm", icon: "fa-bolt" },
    99: { label: "Thunderstorm", icon: "fa-bolt" },
  };

  async function fetchWeather(lat, lon) {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
      );
      const data = await res.json();
      const code = data.current_weather.weathercode;
      const info = WEATHER_CODES[code] || {
        label: "Unknown",
        icon: "fa-cloud",
      };

      document.getElementById("weatherIcon").innerHTML =
        `<i class="fa-solid ${info.icon}"></i>`;
      document.getElementById("weatherTemp").innerHTML =
        `${Math.round(data.current_weather.temperature)}&deg;`;
      document.getElementById("weatherCondition").textContent = info.label;

      if (data.daily) {
        const max = Math.round(data.daily.temperature_2m_max[0]);
        const min = Math.round(data.daily.temperature_2m_min[0]);
        document.getElementById("weatherMinMax").textContent =
          `${min}° / ${max}°`;
      }
    } catch (err) {
      document.getElementById("weatherCondition").textContent = "Unavailable";
    }
  }

  function detectLocation() {
    const locationEl = document.getElementById("locationText");
    if (!navigator.geolocation) {
      locationEl.textContent = "Location not supported";
      document.getElementById("weatherCondition").textContent = "Unavailable";
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`,
          );
          const data = await res.json();
          locationEl.textContent =
            data.locality ||
            data.city ||
            data.principalSubdivision ||
            "Unknown area";
        } catch (err) {
          locationEl.textContent = "Location lookup failed";
        }
        fetchWeather(latitude, longitude);
      },
      () => {
        locationEl.textContent = "Location permission denied";
        document.getElementById("weatherCondition").textContent = "Unavailable";
      },
      { timeout: 10000 },
    );
  }
  detectLocation();

  document.getElementById("weatherWidget").addEventListener("click", () => {
    const loc = document.getElementById("locationText").textContent;
    const query =
      loc &&
      loc !== "Locating..." &&
      !loc.includes("failed") &&
      !loc.includes("denied")
        ? `weather in ${loc}`
        : "weather";
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      "_self",
    );
  });

  /*  Daily Quote           */

  const QUOTES = [
    {
      text: "Seek knowledge from the cradle to the grave.",
      author: "Prophet Muhammad ﷺ",
    },
    {
      text: "The best among you are those who have the best manners and character.",
      author: "Prophet Muhammad ﷺ",
    },
    {
      text: "Whoever follows a path in pursuit of knowledge, Allah makes easy for him a path to Paradise.",
      author: "Prophet Muhammad ﷺ",
    },
    { text: "Indeed, with hardship comes ease.", author: "Qur'an 94:6" },
    {
      text: "And whoever fears Allah, He will make a way out for him.",
      author: "Qur'an 65:2",
    },
    {
      text: "Verily, Allah does not change the condition of a people until they change what is in themselves.",
      author: "Qur'an 13:11",
    },
    { text: "Do not lose hope, nor be sad.", author: "Qur'an 3:139" },
    {
      text: "And it is He who created the heavens and earth in truth, so let your faith be firm.",
      author: "Qur'an 6:73",
    },
    {
      text: "The strong believer is better and more beloved to Allah than the weak believer, while there is good in both.",
      author: "Prophet Muhammad ﷺ",
    },
    {
      text: "None of you truly believes until he wishes for his brother what he wishes for himself.",
      author: "Prophet Muhammad ﷺ",
    },
    {
      text: "Success is the sum of small efforts, repeated day in and day out.",
      author: "Robert Collier",
    },
    {
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
    },
    {
      text: "It always seems impossible until it's done.",
      author: "Nelson Mandela",
    },
    {
      text: "Believe you can and you're halfway there.",
      author: "Theodore Roosevelt",
    },
    {
      text: "The future belongs to those who believe in the beauty of their dreams.",
      author: "Eleanor Roosevelt",
    },
  ];

  function getQuotePeriodKey(now) {
    const today6am = new Date(now);
    today6am.setHours(6, 0, 0, 0);
    const today6pm = new Date(now);
    today6pm.setHours(18, 0, 0, 0);

    let periodStart;
    if (now >= today6pm) {
      periodStart = today6pm;
    } else if (now >= today6am) {
      periodStart = today6am;
    } else {
      periodStart = new Date(today6pm.getTime() - 24 * 60 * 60 * 1000);
    }
    return periodStart.getTime();
  }

  function renderDailyQuote() {
    const now = new Date();
    const periodKey = getQuotePeriodKey(now);
    const cached = JSON.parse(
      localStorage.getItem("iub_daily_quote") || "null",
    );

    let quote;
    if (cached && cached.periodKey === periodKey) {
      quote = cached.quote;
    } else {
      quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      localStorage.setItem(
        "iub_daily_quote",
        JSON.stringify({ periodKey, quote }),
      );
    }

    document.getElementById("quoteText").textContent = `"${quote.text}"`;
    document.getElementById("quoteAuthor").textContent = quote.author;
  }
  renderDailyQuote();

  /*  Portal Buttons  */

  document.getElementById("myIubBtn").onclick = () =>
    window.open("https://my.iub.edu.pk/index.php/login", "_self");
  document.getElementById("eportalBtn").onclick = () =>
    window.open("https://eportal.iub.edu.pk/login", "_self");
  document.getElementById("lmsBtn").onclick = () =>
    window.open("https://lms.iub.edu.pk/login/index.php", "_self");

  /*  Search Bar + Engine  */

  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const engineBtn = document.getElementById("engineBtn");
  const engineDropdown = document.getElementById("engineDropdown");
  const engineIcon = document.getElementById("engineIcon");
  const engineLabel = document.getElementById("engineLabel");

  let currentEngineUrl = "https://www.google.com/search?q=";

  engineBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    engineDropdown.classList.toggle("open");
  });

  document.querySelectorAll(".engine-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      engineLabel.textContent = opt.dataset.engine;
      engineIcon.className = opt.dataset.icon;
      currentEngineUrl = opt.dataset.url;
      engineDropdown.classList.remove("open");
    });
  });

  document.addEventListener("click", () =>
    engineDropdown.classList.remove("open"),
  );

  /* Voice Search */
  const voiceBtn = document.getElementById("voiceBtn");
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    const recog = new SpeechRecognition();
    recog.onresult = (e) => {
      searchInput.value = e.results[0][0].transcript;
    };
    recog.onstart = () => voiceBtn.classList.add("listening");
    recog.onend = () => voiceBtn.classList.remove("listening");
    recog.onerror = () => voiceBtn.classList.remove("listening");

    voiceBtn.addEventListener("click", () => recog.start());
  } else {
    voiceBtn.style.opacity = "0.4";
    voiceBtn.title = "Voice search is not supported in this browser";
    voiceBtn.addEventListener("click", () =>
      alert(
        "Voice search isn't supported in this browser. Try Chrome or Edge.",
      ),
    );
  }

  function runSearch() {
    const q = searchInput.value.trim();
    if (!q) return;
    window.open(currentEngineUrl + encodeURIComponent(q), "_self");
  }
  searchBtn.addEventListener("click", runSearch);
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });

  /*  Help Cards             */

  document.getElementById("liveChatBtn").onclick = () =>
    window.open("https://salmanadeeb.wixsite.com/livechat", "_self");
  document.getElementById("announcementBtn").onclick = () =>
    window.open("https://www.iub.edu.pk/news-update", "_self");
  document.getElementById("contactBtn").onclick = () =>
    window.open("https://www.iub.edu.pk/contact", "_self");

  /*  Picture Slider          */

  const SLIDES = [
    {
      src: "iub-assets/fee_structure_ads.jpg",
      link: "https://www.iub.edu.pk/fee-structure",
    },
    {
      src: "iub-assets/admission_last_date_ads.jpg",
      link: "https://www.iub.edu.pk/admissions",
    },
    {
      src: "iub-assets/merit_list_ads.jpg",
      link: "https://eportal.iub.edu.pk/meritlists/index.php?p=",
    },
    {
      src: "iub-assets/transport_schedule_ads.jpg",
      link: "https://drive.google.com/file/d/1Cte7DZAqOdvqTKsnzE8nQJPbgL2jFs3r/view?usp=sharing",
    },
  ];

  const slideImg = document.getElementById("slideImg");
  const slideLink = document.getElementById("slideLink");
  const slideDots = document.getElementById("slideDots");
  let slideIndex = 0;
  let slideTimer = null;

  function renderSlide() {
    slideImg.src = SLIDES[slideIndex].src;
    slideLink.href = SLIDES[slideIndex].link;
    document.querySelectorAll(".slide-dots span").forEach((dot, i) => {
      dot.classList.toggle("active", i === slideIndex);
    });
  }

  function goToSlide(i) {
    slideIndex = (i + SLIDES.length) % SLIDES.length;
    renderSlide();
  }

  function restartAutoplay() {
    clearInterval(slideTimer);
    slideTimer = setInterval(() => goToSlide(slideIndex + 1), 4000);
  }

  SLIDES.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.addEventListener("click", () => {
      goToSlide(i);
      restartAutoplay();
    });
    slideDots.appendChild(dot);
  });

  document.getElementById("slidePrev").addEventListener("click", () => {
    goToSlide(slideIndex - 1);
    restartAutoplay();
  });
  document.getElementById("slideNext").addEventListener("click", () => {
    goToSlide(slideIndex + 1);
    restartAutoplay();
  });

  renderSlide();
  restartAutoplay();

  /*  Shortcuts               */

  const shortcutsIcons = document.getElementById("shortcutsIcons");
  const DEFAULT_SHORTCUTS = [
    {
      name: "YouTube",
      url: "https://www.youtube.com",
      icon: "https://www.google.com/s2/favicons?domain=youtube.com&sz=64",
    },
    {
      name: "Gmail",
      url: "https://mail.google.com",
      icon: "https://www.google.com/s2/favicons?domain=gmail.com&sz=64",
    },
    {
      name: "Drive",
      url: "https://drive.google.com",
      icon: "https://www.google.com/s2/favicons?domain=drive.google.com&sz=64",
    },
    {
      name: "WhatsApp",
      url: "https://web.whatsapp.com",
      icon: "fa-brands fa-whatsapp",
    },
  ];

  let shortcuts =
    JSON.parse(localStorage.getItem("iub_shortcuts") || "null") ||
    DEFAULT_SHORTCUTS;

  const waShortcut = shortcuts.find((s) => s.url.includes("whatsapp"));
  if (!waShortcut) {
    shortcuts.push({
      name: "WhatsApp",
      url: "https://web.whatsapp.com",
      icon: "fa-brands fa-whatsapp",
    });
    localStorage.setItem("iub_shortcuts", JSON.stringify(shortcuts));
  } else if (!waShortcut.icon.startsWith("fa-")) {
    waShortcut.icon = "fa-brands fa-whatsapp";
    localStorage.setItem("iub_shortcuts", JSON.stringify(shortcuts));
  }

  function renderShortcuts() {
    shortcutsIcons.innerHTML = "";
    shortcuts.forEach((sc, i) => {
      const div = document.createElement("div");
      div.className = "shortcut-icon";
      div.title = sc.name;
      const iconHtml = sc.icon.startsWith("fa-")
        ? `<i class="${sc.icon}" style="color:#25D366;font-size:1rem;"></i>`
        : `<img src="${sc.icon}" alt="${sc.name}" />`;
      div.innerHTML = `
        ${iconHtml}
        <button class="shortcut-remove" data-i="${i}" aria-label="Remove shortcut">&times;</button>
      `;
      div.addEventListener("click", (e) => {
        if (!e.target.closest(".shortcut-remove")) window.open(sc.url, "_self");
      });
      shortcutsIcons.appendChild(div);
    });

    shortcutsIcons.querySelectorAll(".shortcut-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        shortcuts.splice(parseInt(btn.dataset.i), 1);
        localStorage.setItem("iub_shortcuts", JSON.stringify(shortcuts));
        renderShortcuts();
      });
    });

    const addBtn = document.createElement("div");
    addBtn.className = "shortcut-icon";
    addBtn.title = "Add shortcut";
    addBtn.innerHTML = `<i class="fa-solid fa-plus"></i>`;
    addBtn.addEventListener("click", () => {
      const name = prompt("Shortcut name:");
      if (!name) return;
      let url = prompt("URL (e.g. https://example.com):");
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      let domain = "google.com";
      try {
        domain = new URL(url).hostname;
      } catch (e) {}
      shortcuts.push({
        name,
        url,
        icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
      });
      localStorage.setItem("iub_shortcuts", JSON.stringify(shortcuts));
      renderShortcuts();
    });
    shortcutsIcons.appendChild(addBtn);
  }
  renderShortcuts();

  /* AI Tools Sidebar Panel            */

  const aiToolsBtn = document.getElementById("aiToolsBtn");
  const aiToolsPanel = document.getElementById("aiToolsPanel");
  const aiToolsClose = document.getElementById("aiToolsClose");
  const aiToolsGrid = document.getElementById("aiToolsGrid");

  aiToolsBtn.addEventListener("click", () => aiToolsPanel.classList.add("open"));
  aiToolsClose.addEventListener("click", () => aiToolsPanel.classList.remove("open"));

  const DEFAULT_AI_TOOLS = [
    { name: "ChatGPT", url: "https://chat.openai.com/", icon: "assets/ai-icons/chatgpt.png", locked: true },
    { name: "Gemini", url: "https://gemini.google.com/", icon: "assets/ai-icons/gemini.png", locked: true },
    { name: "Copilot", url: "https://copilot.microsoft.com/", icon: "assets/ai-icons/copilot.png", locked: true },
    { name: "Perplexity", url: "https://www.perplexity.ai/", icon: "assets/ai-icons/perplexity.png", locked: true },
    { name: "Claude", url: "https://claude.ai/", icon: "assets/ai-icons/claude.png", locked: true },
  ];

  let aiTools = JSON.parse(localStorage.getItem("iub_ai_tools") || "null") || DEFAULT_AI_TOOLS;

  function renderAiTools() {
    aiToolsGrid.innerHTML = "";

    aiTools.forEach((tool, i) => {
      const a = document.createElement("a");
      a.className = "ai-tool-card";
      a.href = tool.url;
      a.target = "_self";
      a.innerHTML = `
        <img src="${tool.icon}" alt="${tool.name}" />
        <span>${tool.name}</span>
        ${tool.locked ? "" : `<button class="ai-tool-remove" data-i="${i}" aria-label="Remove tool">&times;</button>`}
      `;
      aiToolsGrid.appendChild(a);
    });

    aiToolsGrid.querySelectorAll(".ai-tool-remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        aiTools.splice(parseInt(btn.dataset.i), 1);
        localStorage.setItem("iub_ai_tools", JSON.stringify(aiTools));
        renderAiTools();
      });
    });

    const addCard = document.createElement("div");
    addCard.className = "ai-tool-add";
    addCard.innerHTML = `<i class="fa-solid fa-plus"></i><span>Add Tool</span>`;
    addCard.addEventListener("click", () => {
      const name = prompt("AI tool name:");
      if (!name) return;
      let url = prompt("URL (e.g. https://example.com):");
      if (!url) return;
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      let domain = "google.com";
      try { domain = new URL(url).hostname; } catch (e) {}
      aiTools.push({
        name,
        url,
        icon: `https://www.google.com/s2/favicons?domain=${domain}&sz=64`,
        locked: false,
      });
      localStorage.setItem("iub_ai_tools", JSON.stringify(aiTools));
      renderAiTools();
    });
    aiToolsGrid.appendChild(addCard);
  }

  renderAiTools();

  /*  Bookmarks Panel          */

  const bookmarksPanel = document.getElementById("bookmarksPanel");
  const bookmarksClose = document.getElementById("bookmarksClose");
  const bookmarksBtn = document.getElementById("bookmarksBtn");
  const bookmarkForm = document.getElementById("bookmarkForm");
  const bookmarkName = document.getElementById("bookmarkName");
  const bookmarkUrl = document.getElementById("bookmarkUrl");
  const bookmarkNote = document.getElementById("bookmarkNote");
  const bookmarkCategory = document.getElementById("bookmarkCategory");
  const bookmarksList = document.getElementById("bookmarksList");
  const CATEGORY_ORDER = ["Academic", "Study", "Social", "Other"];

  bookmarksBtn.addEventListener("click", () =>
    bookmarksPanel.classList.add("open"),
  );
  bookmarksClose.addEventListener("click", () =>
    bookmarksPanel.classList.remove("open"),
  );

  let bookmarks = JSON.parse(localStorage.getItem("iub_bookmarks") || "[]");

  function renderBookmarks() {
    bookmarksList.innerHTML = "";
    if (!bookmarks.length) {
      bookmarksList.innerHTML = `<p class="panel-empty">No bookmarks yet.</p>`;
      return;
    }
    CATEGORY_ORDER.forEach((cat) => {
      const items = bookmarks
        .map((b, i) => ({ ...b, _i: i }))
        .filter((b) => b.category === cat);
      if (!items.length) return;
      const title = document.createElement("div");
      title.className = "bookmark-category-title";
      title.textContent = cat;
      bookmarksList.appendChild(title);

      items.forEach((b) => {
        let domain = "google.com";
        try {
          domain = new URL(b.url).hostname;
        } catch (e) {}
        const div = document.createElement("div");
        div.className = "bookmark-item";
        div.innerHTML = `
          <img src="https://www.google.com/s2/favicons?domain=${domain}&sz=64" alt="" />
          <div class="bookmark-item-text">
            <span class="bm-name">${b.name}</span>
            ${b.note ? `<span class="bm-note">${b.note}</span>` : ""}
          </div>
          <button class="bookmark-delete" data-i="${b._i}"><i class="fa-solid fa-trash"></i></button>
        `;
        div.addEventListener("click", (e) => {
          if (!e.target.closest(".bookmark-delete"))
            window.open(b.url, "_self");
        });
        bookmarksList.appendChild(div);
      });
    });

    bookmarksList.querySelectorAll(".bookmark-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        bookmarks.splice(parseInt(btn.dataset.i), 1);
        localStorage.setItem("iub_bookmarks", JSON.stringify(bookmarks));
        renderBookmarks();
      });
    });
  }

  bookmarkForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = bookmarkName.value.trim();
    let url = bookmarkUrl.value.trim();
    const note = bookmarkNote.value.trim();
    const category = bookmarkCategory.value;
    if (!name || !url) return;
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    bookmarks.push({ name, url, note, category });
    localStorage.setItem("iub_bookmarks", JSON.stringify(bookmarks));
    bookmarkForm.reset();
    renderBookmarks();
  });

  renderBookmarks();

  /* To-Do Panel              */

  const todoPanel = document.getElementById("todoPanel");
  const todoClose = document.getElementById("todoClose");
  const todoBtn = document.getElementById("todoBtn");
  const todoForm = document.getElementById("todoForm");
  const todoInput = document.getElementById("todoInput");
  const todoTimeInput = document.getElementById("todoTimeInput");
  const todoList = document.getElementById("todoList");

  todoBtn.addEventListener("click", () => todoPanel.classList.add("open"));
  todoClose.addEventListener("click", () => todoPanel.classList.remove("open"));

  let notes = JSON.parse(localStorage.getItem("iub_notes") || "[]");

  function renderNotes() {
    todoList.innerHTML = "";
    if (!notes.length) {
      todoList.innerHTML = `<p class="panel-empty">No notes yet.</p>`;
      return;
    }
    notes.forEach((note, i) => {
      const div = document.createElement("div");
      div.className = "todo-item";
      div.innerHTML = `
        <div class="todo-item-text">
          <span class="todo-text">${note.text}</span>
          ${note.time ? `<span class="todo-time"><i class="fa-regular fa-clock"></i> ${note.time}</span>` : ""}
        </div>
        <button class="todo-delete" data-i="${i}"><i class="fa-solid fa-trash"></i></button>
      `;
      todoList.appendChild(div);
    });

    todoList.querySelectorAll(".todo-delete").forEach((btn) => {
      btn.addEventListener("click", () => {
        notes.splice(parseInt(btn.dataset.i), 1);
        localStorage.setItem("iub_notes", JSON.stringify(notes));
        renderNotes();
      });
    });
  }

  todoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;
    let formattedTime = "";
    if (todoTimeInput.value) {
      const [h, m] = todoTimeInput.value.split(":");
      const hour = parseInt(h, 10);
      const ampm = hour >= 12 ? "PM" : "AM";
      formattedTime = `${hour % 12 || 12}:${m} ${ampm}`;
    }
    notes.push({ text, time: formattedTime });
    localStorage.setItem("iub_notes", JSON.stringify(notes));
    todoForm.reset();
    renderNotes();
  });

  renderNotes();


  const googleAppsBtn = document.getElementById("googleAppsBtn");
  const googleAppsPanel = document.getElementById("googleAppsPanel");
  const googleAppsClose = document.getElementById("googleAppsClose");
  const googleAppsGrid = document.getElementById("googleAppsGrid");

  googleAppsBtn.addEventListener("click", () => googleAppsPanel.classList.add("open"));
  googleAppsClose.addEventListener("click", () => googleAppsPanel.classList.remove("open"));

  const DEFAULT_GOOGLE_APPS = [
    { name: "Account", url: "https://myaccount.google.com", icon: "assets/google-icons/Cloudidentity.png" },
    { name: "Blogger", url: "https://www.blogger.com", icon: "assets/google-icons/Blogger.png" },
    { name: "Search", url: "https://www.google.com", icon: "assets/google-icons/Search.png" },
    { name: "YouTube", url: "https://www.youtube.com/", icon: "assets/google-icons/Youtube.png" },
    { name: "Keep", url: "https://keep.google.com/", icon: "assets/google-icons/Keep.png" },
    { name: "Meeting", url: "https://meet.google.com/", icon: "assets/google-icons/Meet.png" },
    { name: "Maps", url: "https://www.google.com/maps", icon: "assets/google-icons/Maps.png" },
    { name: "Gemini", url: "https://gemini.google.com/", icon: "assets/google-icons/Gemini.png" },
    { name: "News", url: "https://news.google.com/", icon: "assets/google-icons/News.png" },
    { name: "Mail", url: "https://mail.google.com/", icon: "assets/google-icons/gmail-icon.png" },
    { name: "Chat", url: "https://mail.google.com/chat", icon: "assets/google-icons/Chat.png" },
    { name: "Contacts", url: "https://contacts.google.com/", icon: "assets/google-icons/Contacts.png" },
    { name: "Drive", url: "https://drive.google.com/", icon: "assets/google-icons/Drive.png" },
    { name: "Calendar", url: "https://calendar.google.com/", icon: "assets/google-icons/Calender.png" },
    { name: "Play", url: "https://play.google.com/", icon: "assets/google-icons/Playstore.png" },
    { name: "Translate", url: "https://translate.google.com/", icon: "assets/google-icons/google-translate-icon.png" },
    { name: "Photos", url: "https://photos.google.com/", icon: "assets/google-icons/Photo.png" },
    { name: "Ad Center", url: "https://myadcenter.google.com/", icon: "assets/google-icons/MyAdCenter.png" },
    { name: "Shopping", url: "https://www.google.com/shopping", icon: "assets/google-icons/Shopping.png" },
    { name: "Vids", url: "https://docs.google.com/videos", icon: "assets/google-icons/google-vids-icon.png" },
    { name: "Finance", url: "https://www.google.com/finance", icon: "assets/google-icons/Finance.png" },
    { name: "Docs", url: "https://docs.google.com/document", icon: "assets/google-icons/Docs.png" },
    { name: "Sheets", url: "https://docs.google.com/spreadsheets", icon: "assets/google-icons/Sheets.png" },
    { name: "Slides", url: "https://docs.google.com/presentation", icon: "assets/google-icons/Slides.png" },
    { name: "Books", url: "https://books.google.com", icon: "assets/google-icons/Books.png" },
    { name: "Classroom", url: "https://classroom.google.com", icon: "assets/google-icons/Classroom.png" },
    { name: "Earth", url: "https://earth.google.com", icon: "assets/google-icons/Earth.png" },
    { name: "Saved", url: "https://www.google.com/interests/saved", icon: "assets/google-icons/Saved.png" },
    { name: "Arts & Culture", url: "https://artsandculture.google.com/", icon: "assets/google-icons/ArtsandCulture.png" },
    { name: "Google Ads", url: "https://ads.google.com/", icon: "assets/google-icons/GoogleAds.png" },
    { name: "Merchant Center", url: "https://www.google.com/", icon: "assets/google-icons/MerchantCenter.png" },
    { name: "Google One", url: "https://one.google.com/", icon: "assets/google-icons/GoogleOne.png" },
    { name: "Travel", url: "https://www.google.com/travel", icon: "assets/google-icons/Travel.png" },
    { name: "Forms", url: "https://docs.google.com/forms", icon: "assets/google-icons/Docs.png" },
    { name: "Chrome Web Store", url: "https://chromewebstore.google.com/", icon: "assets/google-icons/Chromewebstore.png" },
    { name: "Passwords", url: "https://passwords.google.com/", icon: "assets/google-icons/Passwaord.png" },
    { name: "Analytics", url: "https://analytics.google.com/analytics/web/provision", icon: "assets/google-icons/Analytics.png" },
    { name: "Wallet", url: "https://wallet.google.com/", icon: "assets/google-icons/Wallet.png" },
    { name: "NotebookLM", url: "https://notebooklm.google.com/", icon: "assets/google-icons/Notebook.png" },
    { name: "Tasks", url: "https://tasks.google.com/", icon: "assets/google-icons/Task.png" },
  ];

  function loadGoogleAppsOrder() {
    const savedOrder = JSON.parse(localStorage.getItem("iub_google_apps_order") || "null");
    if (!savedOrder) return DEFAULT_GOOGLE_APPS.slice();

    const byName = {};
    DEFAULT_GOOGLE_APPS.forEach((app) => (byName[app.name] = app));

    const ordered = savedOrder.map((name) => byName[name]).filter(Boolean);
    DEFAULT_GOOGLE_APPS.forEach((app) => {
      if (!ordered.includes(app)) ordered.push(app);
    });
    return ordered;
  }

  let googleApps = loadGoogleAppsOrder();
  let draggedIndex = null;

  function saveGoogleAppsOrder() {
    localStorage.setItem("iub_google_apps_order", JSON.stringify(googleApps.map((a) => a.name)));
  }

  function renderGoogleApps(animate) {
    const items = Array.from(googleAppsGrid.children);
    const firstRects = new Map();
    if (animate) {
      items.forEach((el) => firstRects.set(el.dataset.name, el.getBoundingClientRect()));
    }

    googleAppsGrid.innerHTML = "";
    googleApps.forEach((app, i) => {
      const a = document.createElement("a");
      a.className = "google-app-item";
      a.href = app.url;
      a.target = "_self";
      a.draggable = true;
      a.dataset.name = app.name;
      a.dataset.index = i;
      a.innerHTML = `<img src="${app.icon}" alt="" /><span>${app.name}</span>`;
      googleAppsGrid.appendChild(a);
    });

    if (animate) {
      const newItems = Array.from(googleAppsGrid.children);
      newItems.forEach((el) => {
        const first = firstRects.get(el.dataset.name);
        if (!first) return;
        const last = el.getBoundingClientRect();
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (dx || dy) {
          el.style.transition = "none";
          el.style.transform = `translate(${dx}px, ${dy}px)`;
          requestAnimationFrame(() => {
            el.style.transition = "transform 0.35s cubic-bezier(0.22, 1, 0.36, 1)";
            el.style.transform = "translate(0, 0)";
          });
        }
      });
    }

    attachDragEvents();
  }

  function attachDragEvents() {
    const items = googleAppsGrid.querySelectorAll(".google-app-item");

    items.forEach((item) => {
      item.addEventListener("dragstart", (e) => {
        draggedIndex = parseInt(item.dataset.index);
        item.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
      });

      item.addEventListener("dragend", () => {
        item.classList.remove("dragging");
        items.forEach((i) => i.classList.remove("drag-over"));
      });

      item.addEventListener("dragover", (e) => {
        e.preventDefault();
        item.classList.add("drag-over");
      });

      item.addEventListener("dragleave", () => {
        item.classList.remove("drag-over");
      });

      item.addEventListener("drop", (e) => {
        e.preventDefault();
        item.classList.remove("drag-over");
        const targetIndex = parseInt(item.dataset.index);
        if (draggedIndex === null || draggedIndex === targetIndex) return;

        const [moved] = googleApps.splice(draggedIndex, 1);
        googleApps.splice(targetIndex, 0, moved);
        draggedIndex = null;

        saveGoogleAppsOrder();
        renderGoogleApps(true);
      });
    });
  }

  renderGoogleApps(false);


  /* Wallpaper Upload + Opacity */
  const wallpaperLayer = document.getElementById("wallpaperLayer");
  const wallpaperBtn = document.getElementById("wallpaperBtn");
  const wallpaperPanel = document.getElementById("wallpaperPanel");
  const wallpaperFileInput = document.getElementById("wallpaperFileInput");
  const wallpaperOpacity = document.getElementById("wallpaperOpacity");
  const wallpaperRemoveBtn = document.getElementById("wallpaperRemoveBtn");

  wallpaperBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpening = !wallpaperPanel.classList.contains("open");
    wallpaperPanel.classList.toggle("open");
    if (isOpening) {
      const rect = wallpaperBtn.getBoundingClientRect();
      wallpaperPanel.style.top = `${rect.bottom + 8}px`;
      wallpaperPanel.style.right = `${window.innerWidth - rect.right}px`;
    }
  });
  document.addEventListener("click", () => wallpaperPanel.classList.remove("open"));
  wallpaperPanel.addEventListener("click", (e) => e.stopPropagation());

  function applyWallpaper(dataUrl) {
    wallpaperLayer.style.backgroundImage = dataUrl ? `url(${dataUrl})` : "none";
  }

  function applyOpacity(value) {
    wallpaperLayer.style.opacity = value / 100;
  }

  const savedWallpaper = localStorage.getItem("iub_wallpaper");
  const savedOpacity = localStorage.getItem("iub_wallpaper_opacity");
  if (savedWallpaper) applyWallpaper(savedWallpaper);
  if (savedOpacity) {
    wallpaperOpacity.value = savedOpacity;
    applyOpacity(savedOpacity);
  }

  wallpaperFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (ev) => {
      img.onload = () => {
        const maxWidth = 1920;
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressed = canvas.toDataURL("image/jpeg", 0.75);
        try {
          localStorage.setItem("iub_wallpaper", compressed);
          applyWallpaper(compressed);
        } catch (err) {
          alert("This image is too large to save. Please try a smaller image.");
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });

  wallpaperOpacity.addEventListener("input", () => {
    applyOpacity(wallpaperOpacity.value);
    localStorage.setItem("iub_wallpaper_opacity", wallpaperOpacity.value);
  });

  wallpaperRemoveBtn.addEventListener("click", () => {
    localStorage.removeItem("iub_wallpaper");
    localStorage.removeItem("iub_wallpaper_opacity");
    applyWallpaper(null);
    wallpaperOpacity.value = 100;
  });
});
