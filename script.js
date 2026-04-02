 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/script.js b/script.js
new file mode 100644
index 0000000000000000000000000000000000000000..f4834355e3e3b373897cbefc66c89e64192925cf
--- /dev/null
+++ b/script.js
@@ -0,0 +1,515 @@
+const sections = document.querySelectorAll('.section');
+const navButtons = document.querySelectorAll('[data-nav]');
+const topNav = document.querySelector('.main-nav');
+const mobileNavToggle = document.getElementById('mobileNavToggle');
+
+const surahListEl = document.getElementById('surahList');
+const surahSearchEl = document.getElementById('surahSearch');
+const ayahContainer = document.getElementById('ayahContainer');
+
+const reciterSelect = document.getElementById('reciterSelect');
+const audioSurahSelect = document.getElementById('audioSurahSelect');
+const playPauseBtn = document.getElementById('playPauseBtn');
+const prevBtn = document.getElementById('prevBtn');
+const nextBtn = document.getElementById('nextBtn');
+const audioPlayer = document.getElementById('audioPlayer');
+const audioNowPlaying = document.getElementById('audioNowPlaying');
+
+const azkarTabs = document.querySelectorAll('.tab');
+const azkarListEl = document.getElementById('azkarList');
+
+const prayerForm = document.getElementById('prayerForm');
+const cityInput = document.getElementById('cityInput');
+const countryInput = document.getElementById('countryInput');
+const methodSelect = document.getElementById('methodSelect');
+const detectLocationBtn = document.getElementById('detectLocationBtn');
+const prayerDate = document.getElementById('prayerDate');
+const prayerTimes = document.getElementById('prayerTimes');
+const nextPrayerEl = document.getElementById('nextPrayer');
+
+const tasbeehPresetsEl = document.getElementById('tasbeehPresets');
+const tasbeehLabelEl = document.getElementById('tasbeehLabel');
+const tasbeehCountEl = document.getElementById('tasbeehCount');
+const tasbeehGoalEl = document.getElementById('tasbeehGoal');
+const tasbeehIncrementBtn = document.getElementById('tasbeehIncrement');
+const tasbeehResetBtn = document.getElementById('tasbeehReset');
+const tasbeehStatusEl = document.getElementById('tasbeehStatus');
+const customDhikrInput = document.getElementById('customDhikrInput');
+
+const appState = {
+  surahs: [],
+  reciters: [],
+  currentSurahAudioIndex: 1,
+  azkarMode: 'morning',
+  tasbeeh: {
+    dhikr: 'سُبْحَانَ ٱللَّٰهِ',
+    count: 0,
+    goal: 33,
+    completedRounds: 0
+  },
+  nextPrayerInterval: null,
+  todayTimings: null
+};
+
+const fallbackReciters = [
+  { id: 'husary', name: 'Mahmoud Khalil Al-Husary', baseUrl: 'https://everyayah.com/data/Husary_128kbps/' },
+  { id: 'minshawi', name: 'Mohamed Siddiq Al-Minshawi', baseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/' },
+  { id: 'sudais', name: 'Abdur-Rahman As-Sudais', baseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/' },
+  { id: 'shuraym', name: 'Saud Al-Shuraim', baseUrl: 'https://everyayah.com/data/Saud_ash-Shuraym_128kbps/' },
+  { id: 'ajamy', name: 'Ahmed Al-Ajamy', baseUrl: 'https://everyayah.com/data/ahmed_ibn_ali_al_ajamy_128kbps/' }
+];
+
+const tasbeehPresets = [
+  'سُبْحَانَ ٱللَّٰهِ',
+  'ٱلْحَمْدُ لِلَّٰهِ',
+  'ٱللَّٰهُ أَكْبَرُ',
+  'لَا إِلَٰهَ إِلَّا ٱللَّٰهُ',
+  'أَسْتَغْفِرُ ٱللَّٰهَ'
+];
+
+const azkarData = {
+  morning: [
+    { text: 'أَصْـبَحْنا وَأَصْـبَحَ المُـلكُ لله، والحَمدُ لله، لا إلهَ إلاّ اللهُ وَحدَهُ لا شَريكَ له.', count: '1x' },
+    { text: 'اللّهـمَّ بِكَ أَصْـبَحْنا وَبِكَ أَمْسَـينا وَبِكَ نَحْـيا وَبِكَ نَمـوتُ وَإِلَـيْكَ النُّـشور.', count: '1x' },
+    { text: 'اللّهُـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْتَ، خَلَـقْتَني وَأَنا عَبْـدُك.', count: '1x' },
+    { text: 'رَضيتُ بِاللهِ رَبَّاً وَبِالإسْلامِ ديـناً وَبِمُحَـمَّدٍ صلى الله عليه وسلم نَبِيّـاً.', count: '3x' },
+    { text: 'اللّهُـمَّ إِنِّـي أَصْـبَحْتُ أُشْـهِدُكَ وَأُشْـهِدُ حَمَلَـةَ عَـرْشِـكَ.', count: '4x' },
+    { text: 'حَسْبِيَ اللهُ لا إلهَ إلاّ هُوَ عَلَيهِ تَوَكَّـلتُ وَهُوَ رَبُّ العَرْشِ العَظـيم.', count: '7x' },
+    { text: 'اللّهُـمَّ عافِـني في بَدَنـي، اللّهُـمَّ عافِـني في سَمْـعي، اللّهُـمَّ عافِـني في بَصَـري.', count: '3x' },
+    { text: 'اللّهُـمَّ إِنّـي أَعـوذُ بِكَ مِنَ الكُـفْرِ والفَـقْرِ، وَأَعـوذُ بِكَ مِنْ عَذابِ القَـبْرِ.', count: '3x' },
+    { text: 'أَسْتَغْفِرُ اللهَ وَأتُوبُ إِلَيْهِ', count: '100x' },
+    { text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', count: '100x' }
+  ],
+  evening: [
+    { text: 'أَمْسَيْنا وَأَمْسَى المُلكُ لله، والحَمدُ لله، لا إلهَ إلاّ اللهُ وَحدَهُ لا شَريكَ له.', count: '1x' },
+    { text: 'اللّهـمَّ بِكَ أَمْسَـينا وَبِكَ أَصْـبَحْنا وَبِكَ نَحْـيا وَبِكَ نَمـوتُ وَإِلَـيْكَ المَصـير.', count: '1x' },
+    { text: 'رَضيتُ بِاللهِ رَبَّاً وَبِالإسْلامِ ديـناً وَبِمُحَـمَّدٍ صلى الله عليه وسلم نَبِيّـاً.', count: '3x' },
+    { text: 'أَعُوذُ بِكَلِماتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَق.', count: '3x' },
+    { text: 'اللّهُـمَّ إِنِّـي أَمْسَيْتُ أُشْـهِدُكَ وَأُشْـهِدُ حَمَلَـةَ عَـرْشِـكَ.', count: '4x' },
+    { text: 'بِسْمِ اللهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ.', count: '3x' },
+    { text: 'حَسْبِيَ اللهُ لا إلهَ إلاّ هُوَ عَلَيهِ تَوَكَّـلتُ وَهُوَ رَبُّ العَرْشِ العَظـيم.', count: '7x' },
+    { text: 'اللّهُـمَّ إِنّـي أَعـوذُ بِكَ مِنَ الكَسَلِ وَسوءِ الكِبَرِ.', count: '1x' },
+    { text: 'أَسْتَغْفِرُ اللهَ وَأتُوبُ إِلَيْهِ', count: '100x' },
+    { text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', count: '100x' }
+  ],
+  sleep: [
+    { text: 'بِاسْمِكَ اللّهُمَّ أَمُوتُ وَأَحْيَا', count: '1x' },
+    { text: 'اللّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ', count: '3x' },
+    { text: 'سُبْحَانَ اللهِ', count: '33x' },
+    { text: 'الْحَمْدُ لِلَّهِ', count: '33x' },
+    { text: 'اللَّهُ أَكْبَرُ', count: '34x' },
+    { text: 'آية الكرسي', count: '1x' },
+    { text: 'سورة الإخلاص، الفلق، الناس', count: '3x' }
+  ],
+  afterPrayer: [
+    { text: 'أَسْتَغْفِرُ اللَّهَ', count: '3x' },
+    { text: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ...', count: '1x' },
+    { text: 'سُبْحَانَ اللَّهِ', count: '33x' },
+    { text: 'الْحَمْدُ لِلَّهِ', count: '33x' },
+    { text: 'اللَّهُ أَكْبَرُ', count: '33x' },
+    { text: 'لَا إِلَهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ...', count: '1x' },
+    { text: 'آية الكرسي', count: '1x' }
+  ]
+};
+
+function navigateTo(sectionId) {
+  sections.forEach((section) => section.classList.toggle('active', section.id === sectionId));
+  document.querySelectorAll('.nav-link').forEach((nav) => nav.classList.toggle('active', nav.dataset.nav === sectionId));
+  topNav.classList.remove('open');
+}
+
+navButtons.forEach((button) => button.addEventListener('click', () => navigateTo(button.dataset.nav)));
+mobileNavToggle.addEventListener('click', () => topNav.classList.toggle('open'));
+
+function renderSurahList(filteredSurahs) {
+  surahListEl.innerHTML = filteredSurahs
+    .map(
+      (surah) => `
+      <button class="list-item" data-surah-id="${surah.number}">
+        <h4 class="surah-name">${surah.number}. ${surah.englishName}</h4>
+        <p class="surah-meta">${surah.name} • ${surah.numberOfAyahs} Ayahs</p>
+      </button>`
+    )
+    .join('');
+
+  surahListEl.querySelectorAll('.list-item').forEach((item) => {
+    item.addEventListener('click', () => loadSurahAyahs(item.dataset.surahId));
+  });
+}
+
+async function loadSurahs() {
+  try {
+    const response = await fetch('https://api.alquran.cloud/v1/surah');
+    const { data } = await response.json();
+    appState.surahs = data;
+    renderSurahList(data);
+
+    audioSurahSelect.innerHTML = data
+      .map((surah) => `<option value="${surah.number}">${surah.number}. ${surah.englishName}</option>`)
+      .join('');
+  } catch (error) {
+    surahListEl.innerHTML = '<p>Unable to load Surah list. Please try again later.</p>';
+  }
+}
+
+async function loadSurahAyahs(surahNumber) {
+  ayahContainer.innerHTML = '<div class="placeholder"><p>Loading verses...</p></div>';
+  surahListEl.querySelectorAll('.list-item').forEach((item) => {
+    item.classList.toggle('active', item.dataset.surahId === String(surahNumber));
+  });
+
+  try {
+    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
+    const result = await response.json();
+    const heading = `
+      <div class="ayah" style="position:sticky;top:0;background:var(--panel);z-index:2;">
+        <h3 style="margin:0;">${result.data.englishName} (${result.data.name})</h3>
+        <small>${result.data.revelationType} • ${result.data.numberOfAyahs} Ayahs</small>
+      </div>`;
+
+    const ayahs = result.data.ayahs
+      .map(
+        (ayah) => `
+        <div class="ayah">
+          <p>${ayah.text}</p>
+          <small>Ayah ${ayah.numberInSurah}</small>
+        </div>`
+      )
+      .join('');
+
+    ayahContainer.innerHTML = heading + ayahs;
+  } catch (error) {
+    ayahContainer.innerHTML = '<div class="placeholder"><p>Failed to load this Surah.</p></div>';
+  }
+}
+
+surahSearchEl.addEventListener('input', (event) => {
+  const query = event.target.value.toLowerCase().trim();
+  const filtered = appState.surahs.filter(
+    (surah) =>
+      surah.englishName.toLowerCase().includes(query) ||
+      surah.englishNameTranslation.toLowerCase().includes(query) ||
+      String(surah.number).includes(query)
+  );
+  renderSurahList(filtered);
+});
+
+function normalizeServer(server) {
+  if (!server) return null;
+  const withProtocol = server.startsWith('http') ? server : `https://${server}`;
+  return withProtocol.endsWith('/') ? withProtocol : `${withProtocol}/`;
+}
+
+async function loadManyReciters() {
+  try {
+    const response = await fetch('https://mp3quran.net/api/v3/reciters?language=eng');
+    const payload = await response.json();
+    const reciters = (payload.reciters || [])
+      .flatMap((reciter) =>
+        (reciter.moshaf || []).map((moshaf, idx) => ({
+          id: `${reciter.id}-${idx}`,
+          name: `${reciter.name} (${moshaf.name})`,
+          baseUrl: normalizeServer(moshaf.server)
+        }))
+      )
+      .filter((item) => item.baseUrl)
+      .slice(0, 50);
+
+    appState.reciters = reciters.length ? reciters : fallbackReciters;
+  } catch (error) {
+    appState.reciters = fallbackReciters;
+  }
+
+  reciterSelect.innerHTML = appState.reciters
+    .map((reciter) => `<option value="${reciter.id}">${reciter.name}</option>`)
+    .join('');
+}
+
+function initializeAudio() {
+  const pad = (num) => String(num).padStart(3, '0');
+
+  function updateAudioSource(autoPlay = false) {
+    const selectedReciter = appState.reciters.find((reciter) => reciter.id === reciterSelect.value);
+    appState.currentSurahAudioIndex = Number(audioSurahSelect.value) || 1;
+    if (!selectedReciter) return;
+
+    const surah = appState.surahs.find((item) => item.number === appState.currentSurahAudioIndex);
+    audioPlayer.src = `${selectedReciter.baseUrl}${pad(appState.currentSurahAudioIndex)}.mp3`;
+    audioNowPlaying.textContent = `${selectedReciter.name} — Surah ${surah?.englishName || appState.currentSurahAudioIndex}`;
+
+    if (autoPlay) {
+      audioPlayer.play().catch(() => {});
+    }
+  }
+
+  playPauseBtn.addEventListener('click', () => {
+    if (!audioPlayer.src) {
+      updateAudioSource(true);
+      return;
+    }
+    if (audioPlayer.paused) {
+      audioPlayer.play().catch(() => {});
+    } else {
+      audioPlayer.pause();
+    }
+  });
+
+  prevBtn.addEventListener('click', () => {
+    const prev = Math.max(1, Number(audioSurahSelect.value) - 1);
+    audioSurahSelect.value = String(prev);
+    updateAudioSource(true);
+  });
+
+  nextBtn.addEventListener('click', () => {
+    const next = Math.min(114, Number(audioSurahSelect.value) + 1);
+    audioSurahSelect.value = String(next);
+    updateAudioSource(true);
+  });
+
+  reciterSelect.addEventListener('change', () => updateAudioSource());
+  audioSurahSelect.addEventListener('change', () => updateAudioSource());
+
+  audioPlayer.addEventListener('ended', () => {
+    if (Number(audioSurahSelect.value) < 114) {
+      audioSurahSelect.value = String(Number(audioSurahSelect.value) + 1);
+      updateAudioSource(true);
+    }
+  });
+
+  audioPlayer.addEventListener('pause', () => {
+    if (audioPlayer.currentTime > 0 && !audioPlayer.ended) {
+      playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
+    }
+  });
+
+  audioPlayer.addEventListener('play', () => {
+    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
+  });
+}
+
+function renderAzkar(mode) {
+  const items = azkarData[mode] || [];
+  azkarListEl.innerHTML = items
+    .map(
+      (item, index) => `
+      <article class="azkar-item card">
+        <p>${item.text}</p>
+        <small>Repeat: ${item.count} • #${index + 1}</small>
+      </article>`
+    )
+    .join('');
+}
+
+azkarTabs.forEach((tab) => {
+  tab.addEventListener('click', () => {
+    azkarTabs.forEach((btn) => btn.classList.remove('active'));
+    tab.classList.add('active');
+    appState.azkarMode = tab.dataset.azkar;
+    renderAzkar(appState.azkarMode);
+  });
+});
+
+function saveTasbeeh() {
+  localStorage.setItem('noorIslamTasbeeh', JSON.stringify(appState.tasbeeh));
+}
+
+function loadTasbeeh() {
+  const raw = localStorage.getItem('noorIslamTasbeeh');
+  if (!raw) return;
+  try {
+    const parsed = JSON.parse(raw);
+    appState.tasbeeh = { ...appState.tasbeeh, ...parsed };
+  } catch (error) {
+    // no-op
+  }
+}
+
+function renderTasbeeh() {
+  tasbeehCountEl.textContent = appState.tasbeeh.count;
+  tasbeehLabelEl.textContent = appState.tasbeeh.dhikr;
+  tasbeehGoalEl.value = appState.tasbeeh.goal;
+  tasbeehStatusEl.textContent = `Completed rounds: ${appState.tasbeeh.completedRounds}`;
+}
+
+function initTasbeeh() {
+  tasbeehPresetsEl.innerHTML = tasbeehPresets
+    .map((dhikr) => `<button class="tasbeeh-pill" data-dhikr="${dhikr}">${dhikr}</button>`)
+    .join('');
+
+  tasbeehPresetsEl.querySelectorAll('.tasbeeh-pill').forEach((btn) => {
+    btn.addEventListener('click', () => {
+      appState.tasbeeh.dhikr = btn.dataset.dhikr;
+      renderTasbeeh();
+      saveTasbeeh();
+    });
+  });
+
+  tasbeehIncrementBtn.addEventListener('click', () => {
+    if (customDhikrInput.value.trim()) {
+      appState.tasbeeh.dhikr = customDhikrInput.value.trim();
+    }
+
+    appState.tasbeeh.goal = Math.max(1, Number(tasbeehGoalEl.value) || 33);
+    appState.tasbeeh.count += 1;
+
+    if (appState.tasbeeh.count >= appState.tasbeeh.goal) {
+      appState.tasbeeh.completedRounds += 1;
+      appState.tasbeeh.count = 0;
+      tasbeehStatusEl.textContent = `MashaAllah! Goal reached. Completed rounds: ${appState.tasbeeh.completedRounds}`;
+    }
+
+    renderTasbeeh();
+    saveTasbeeh();
+  });
+
+  tasbeehResetBtn.addEventListener('click', () => {
+    appState.tasbeeh.count = 0;
+    appState.tasbeeh.completedRounds = 0;
+    renderTasbeeh();
+    saveTasbeeh();
+  });
+
+  tasbeehGoalEl.addEventListener('change', () => {
+    appState.tasbeeh.goal = Math.max(1, Number(tasbeehGoalEl.value) || 33);
+    renderTasbeeh();
+    saveTasbeeh();
+  });
+
+  loadTasbeeh();
+  renderTasbeeh();
+}
+
+function getNextPrayer(timings) {
+  const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
+  const now = new Date();
+
+  for (const prayer of prayerOrder) {
+    const [hour, minute] = timings[prayer].split(':').map(Number);
+    const prayerTime = new Date();
+    prayerTime.setHours(hour, minute, 0, 0);
+
+    if (prayerTime > now) {
+      return { name: prayer, time: prayerTime };
+    }
+  }
+
+  const [hour, minute] = timings.Fajr.split(':').map(Number);
+  const tomorrowFajr = new Date();
+  tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
+  tomorrowFajr.setHours(hour, minute, 0, 0);
+  return { name: 'Fajr', time: tomorrowFajr };
+}
+
+function startNextPrayerCountdown() {
+  if (appState.nextPrayerInterval) {
+    clearInterval(appState.nextPrayerInterval);
+  }
+
+  if (!appState.todayTimings) return;
+
+  const update = () => {
+    const next = getNextPrayer(appState.todayTimings);
+    const diffMs = next.time - new Date();
+    const hours = Math.floor(diffMs / (1000 * 60 * 60));
+    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
+    nextPrayerEl.textContent = `Next prayer: ${next.name} in ${hours}h ${minutes}m`;
+  };
+
+  update();
+  appState.nextPrayerInterval = setInterval(update, 30000);
+}
+
+async function loadPrayerTimesByCity(city, country, method = '2') {
+  prayerDate.textContent = 'Loading prayer times...';
+  prayerTimes.innerHTML = '';
+
+  const response = await fetch(
+    `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(
+      country
+    )}&method=${method}`
+  );
+  const { data } = await response.json();
+  return { data, location: `${city}, ${country}` };
+}
+
+async function loadPrayerTimesByCoords(latitude, longitude, method = '2') {
+  prayerDate.textContent = 'Detecting location and loading prayer times...';
+  prayerTimes.innerHTML = '';
+
+  const response = await fetch(
+    `https://api.aladhan.com/v1/timings?latitude=${latitude}&longitude=${longitude}&method=${method}`
+  );
+  const { data } = await response.json();
+  const location = `Lat ${latitude.toFixed(3)}, Lon ${longitude.toFixed(3)}`;
+  return { data, location };
+}
+
+function renderPrayerResult(result) {
+  const { data, location } = result;
+  const relevant = {
+    Fajr: 'fa-cloud-moon',
+    Sunrise: 'fa-sun',
+    Dhuhr: 'fa-sun',
+    Asr: 'fa-cloud-sun',
+    Maghrib: 'fa-moon',
+    Isha: 'fa-star-and-crescent'
+  };
+
+  prayerDate.textContent = `${data.date.readable} • ${location} • TZ: ${data.meta.timezone}`;
+
+  prayerTimes.innerHTML = Object.entries(relevant)
+    .map(
+      ([name, icon]) => `
+      <div class="prayer-item">
+        <strong><i class="fa-solid ${icon}"></i> ${name}</strong>
+        <span>${data.timings[name]}</span>
+      </div>`
+    )
+    .join('');
+
+  appState.todayTimings = data.timings;
+  startNextPrayerCountdown();
+}
+
+async function loadPrayerTimes(city = 'Makkah', country = 'Saudi Arabia', method = '2') {
+  try {
+    const result = await loadPrayerTimesByCity(city, country, method);
+    renderPrayerResult(result);
+  } catch (error) {
+    prayerDate.textContent = 'Unable to fetch prayer times right now.';
+  }
+}
+
+prayerForm.addEventListener('submit', (event) => {
+  event.preventDefault();
+  loadPrayerTimes(cityInput.value.trim(), countryInput.value.trim(), methodSelect.value);
+});
+
+detectLocationBtn.addEventListener('click', () => {
+  if (!navigator.geolocation) {
+    nextPrayerEl.textContent = 'Geolocation is not supported in your browser.';
+    return;
+  }
+
+  navigator.geolocation.getCurrentPosition(
+    async (position) => {
+      try {
+        const result = await loadPrayerTimesByCoords(position.coords.latitude, position.coords.longitude, methodSelect.value);
+        renderPrayerResult(result);
+      } catch (error) {
+        prayerDate.textContent = 'Unable to load prayer times from your location.';
+      }
+    },
+    () => {
+      nextPrayerEl.textContent = 'Location permission was denied.';
+    }
+  );
+});
+
+(async function init() {
+  await Promise.all([loadSurahs(), loadManyReciters()]);
+  initializeAudio();
+  renderAzkar(appState.azkarMode);
+  initTasbeeh();
+  loadPrayerTimes();
+})();
 
EOF
)
