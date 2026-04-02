const sections = document.querySelectorAll('.section');
const navButtons = document.querySelectorAll('[data-nav]');
const topNav = document.querySelector('.main-nav');
const mobileNavToggle = document.getElementById('mobileNavToggle');

const surahListEl = document.getElementById('surahList');
const surahSearchEl = document.getElementById('surahSearch');
const ayahContainer = document.getElementById('ayahContainer');

const reciterSelect = document.getElementById('reciterSelect');
const audioSurahSelect = document.getElementById('audioSurahSelect');
const playPauseBtn = document.getElementById('playPauseBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const audioPlayer = document.getElementById('audioPlayer');
const audioNowPlaying = document.getElementById('audioNowPlaying');

const azkarTabs = document.querySelectorAll('.tab');
const azkarListEl = document.getElementById('azkarList');

const prayerForm = document.getElementById('prayerForm');
const cityInput = document.getElementById('cityInput');
const countryInput = document.getElementById('countryInput');
const prayerDate = document.getElementById('prayerDate');
const prayerTimes = document.getElementById('prayerTimes');

const appState = {
  surahs: [],
  currentSurahAudioIndex: 0,
  azkarMode: 'morning'
};

const reciters = [
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    baseUrl: 'https://everyayah.com/data/Husary_128kbps/'
  },
  {
    id: 'minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    baseUrl: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/'
  },
  {
    id: 'sudais',
    name: 'Abdur-Rahman As-Sudais',
    baseUrl: 'https://everyayah.com/data/Abdurrahmaan_As-Sudais_192kbps/'
  }
];

const azkarData = {
  morning: [
    { text: 'أَصْـبَحْنا وَأَصْـبَحَ المُـلكُ لله، والحَمدُ لله، لا إلهَ إلاّ اللهُ وَحدَهُ لا شَريكَ له.', count: '1x' },
    { text: 'اللّهـمَّ بِكَ أَصْـبَحْنا وَبِكَ أَمْسَـينا وَبِكَ نَحْـيا وَبِكَ نَمـوتُ وَإِلَـيْكَ النُّـشور.', count: '1x' },
    { text: 'اللّهُـمَّ أَنْتَ رَبِّـي لا إلهَ إلاّ أَنْتَ، خَلَـقْتَني وَأَنا عَبْـدُك.', count: '1x' },
    { text: 'سُبْحَانَ اللهِ وَبِحَمْدِهِ', count: '100x' },
    { text: 'اللّهُـمَّ عافِـني في بَدَنـي، اللّهُـمَّ عافِـني في سَمْـعي، اللّهُـمَّ عافِـني في بَصَـري.', count: '3x' }
  ],
  evening: [
    { text: 'أَمْسَيْنا وَأَمْسَى المُلكُ لله، والحَمدُ لله، لا إلهَ إلاّ اللهُ وَحدَهُ لا شَريكَ له.', count: '1x' },
    { text: 'اللّهـمَّ بِكَ أَمْسَـينا وَبِكَ أَصْـبَحْنا وَبِكَ نَحْـيا وَبِكَ نَمـوتُ وَإِلَـيْكَ المَصـير.', count: '1x' },
    { text: 'رَضيتُ بِاللهِ رَبَّاً وَبِالإسْلامِ ديـناً وَبِمُحَـمَّدٍ صلى الله عليه وسلم نَبِيّـاً.', count: '3x' },
    { text: 'أَعُوذُ بِكَلِماتِ اللهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَق.', count: '3x' },
    { text: 'حَسْبِيَ اللهُ لا إلهَ إلاّ هُوَ عَلَيهِ تَوَكَّـلتُ وَهُوَ رَبُّ العَرْشِ العَظـيم.', count: '7x' }
  ]
};

function navigateTo(sectionId) {
  sections.forEach((section) => section.classList.toggle('active', section.id === sectionId));
  document.querySelectorAll('.nav-link').forEach((nav) => {
    nav.classList.toggle('active', nav.dataset.nav === sectionId);
  });
  topNav.classList.remove('open');
}

navButtons.forEach((button) => {
  button.addEventListener('click', () => navigateTo(button.dataset.nav));
});

mobileNavToggle.addEventListener('click', () => topNav.classList.toggle('open'));

function renderSurahList(filteredSurahs) {
  surahListEl.innerHTML = filteredSurahs
    .map(
      (surah) => `
        <button class="list-item" data-surah-id="${surah.number}">
          <h4 class="surah-name">${surah.number}. ${surah.englishName}</h4>
          <p class="surah-meta">${surah.name} • ${surah.numberOfAyahs} Ayahs</p>
        </button>
      `
    )
    .join('');

  surahListEl.querySelectorAll('.list-item').forEach((item) => {
    item.addEventListener('click', () => loadSurahAyahs(item.dataset.surahId));
  });
}

async function loadSurahs() {
  try {
    const response = await fetch('https://api.alquran.cloud/v1/surah');
    const { data } = await response.json();
    appState.surahs = data;
    renderSurahList(data);

    audioSurahSelect.innerHTML = data
      .map((surah) => `<option value="${surah.number}">${surah.number}. ${surah.englishName}</option>`)
      .join('');
  } catch (error) {
    surahListEl.innerHTML = '<p>Unable to load Surah list. Please try again later.</p>';
  }
}

async function loadSurahAyahs(surahNumber) {
  ayahContainer.innerHTML = '<div class="placeholder"><p>Loading verses...</p></div>';
  surahListEl.querySelectorAll('.list-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.surahId === String(surahNumber));
  });

  try {
    const response = await fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/ar.alafasy`);
    const result = await response.json();

    const heading = `
      <div class="ayah" style="position:sticky;top:0;background:var(--panel);z-index:2;">
        <h3 style="margin:0;">${result.data.englishName} (${result.data.name})</h3>
        <small>${result.data.revelationType} • ${result.data.numberOfAyahs} Ayahs</small>
      </div>
    `;

    const ayahs = result.data.ayahs
      .map(
        (ayah) => `
          <div class="ayah">
            <p>${ayah.text}</p>
            <small>Ayah ${ayah.numberInSurah}</small>
          </div>
        `
      )
      .join('');

    ayahContainer.innerHTML = heading + ayahs;
  } catch (error) {
    ayahContainer.innerHTML = '<div class="placeholder"><p>Failed to load this Surah.</p></div>';
  }
}

surahSearchEl.addEventListener('input', (event) => {
  const query = event.target.value.toLowerCase().trim();
  const filtered = appState.surahs.filter(
    (surah) =>
      surah.englishName.toLowerCase().includes(query) ||
      surah.name.includes(query) ||
      String(surah.number).includes(query)
  );
  renderSurahList(filtered);
});

function initializeAudio() {
  reciterSelect.innerHTML = reciters
    .map((reciter) => `<option value="${reciter.id}">${reciter.name}</option>`)
    .join('');

  const pad = (num) => String(num).padStart(3, '0');

  function updateAudioSource(autoPlay = false) {
    const selectedReciter = reciters.find((reciter) => reciter.id === reciterSelect.value);
    appState.currentSurahAudioIndex = Number(audioSurahSelect.value) || 1;

    if (!selectedReciter) return;

    const surah = appState.surahs.find((item) => item.number === appState.currentSurahAudioIndex);
    audioPlayer.src = `${selectedReciter.baseUrl}${pad(appState.currentSurahAudioIndex)}.mp3`;
    audioNowPlaying.textContent = `${selectedReciter.name} — Surah ${surah?.englishName || appState.currentSurahAudioIndex}`;

    if (autoPlay) {
      audioPlayer.play();
      playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    }
  }

  playPauseBtn.addEventListener('click', () => {
    if (!audioPlayer.src) {
      updateAudioSource(true);
      return;
    }

    if (audioPlayer.paused) {
      audioPlayer.play();
      playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
    } else {
      audioPlayer.pause();
      playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
    }
  });

  prevBtn.addEventListener('click', () => {
    const prev = Math.max(1, Number(audioSurahSelect.value) - 1);
    audioSurahSelect.value = String(prev);
    updateAudioSource(true);
  });

  nextBtn.addEventListener('click', () => {
    const next = Math.min(114, Number(audioSurahSelect.value) + 1);
    audioSurahSelect.value = String(next);
    updateAudioSource(true);
  });

  reciterSelect.addEventListener('change', () => updateAudioSource());
  audioSurahSelect.addEventListener('change', () => updateAudioSource());

  audioPlayer.addEventListener('ended', () => {
    if (Number(audioSurahSelect.value) < 114) {
      audioSurahSelect.value = String(Number(audioSurahSelect.value) + 1);
      updateAudioSource(true);
    }
  });

  audioPlayer.addEventListener('pause', () => {
    if (audioPlayer.currentTime > 0 && !audioPlayer.ended) {
      playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
    }
  });

  audioPlayer.addEventListener('play', () => {
    playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
  });
}

function renderAzkar(mode) {
  const items = azkarData[mode] || [];
  azkarListEl.innerHTML = items
    .map(
      (item, index) => `
      <article class="azkar-item card">
        <p>${item.text}</p>
        <small>Repeat: ${item.count} • #${index + 1}</small>
      </article>
    `
    )
    .join('');
}

azkarTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    azkarTabs.forEach((btn) => btn.classList.remove('active'));
    tab.classList.add('active');
    appState.azkarMode = tab.dataset.azkar;
    renderAzkar(appState.azkarMode);
  });
});

async function loadPrayerTimes(city = 'Makkah', country = 'Saudi Arabia') {
  prayerDate.textContent = 'Loading prayer times...';
  prayerTimes.innerHTML = '';

  try {
    const response = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(
        country
      )}&method=2`
    );
    const { data } = await response.json();

    const relevant = {
      Fajr: 'fa-cloud-moon',
      Dhuhr: 'fa-sun',
      Asr: 'fa-cloud-sun',
      Maghrib: 'fa-moon',
      Isha: 'fa-star-and-crescent'
    };

    prayerDate.textContent = `${data.date.readable} • ${city}, ${country}`;

    prayerTimes.innerHTML = Object.entries(relevant)
      .map(
        ([name, icon]) => `
          <div class="prayer-item">
            <strong><i class="fa-solid ${icon}"></i> ${name}</strong>
            <span>${data.timings[name]}</span>
          </div>
        `
      )
      .join('');
  } catch (error) {
    prayerDate.textContent = 'Unable to fetch prayer times right now.';
  }
}

prayerForm.addEventListener('submit', (event) => {
  event.preventDefault();
  loadPrayerTimes(cityInput.value.trim(), countryInput.value.trim());
});

(async function init() {
  await loadSurahs();
  initializeAudio();
  renderAzkar(appState.azkarMode);
  loadPrayerTimes();
})();
