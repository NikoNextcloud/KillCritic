const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

const emptyProfile = () => ({
  schemaVersion: 2,
  profileName: '',
  createdAt: '',
  moods: [],
  reasons: [],
  cravings: [],
  missions: 0,
  contact: '',
  wins: 0,
  costs: [],
  riskPlaces: [],
  radarEntries: [],
  aiInsights: []
});

let data = loadProfile();
let recorder;
let recordedChunks = [];
let audioUrl = localStorage.getItem('kc_audio') || '';
let crisisInterval;
let locationWatcher;
let remaining = 300;
let breathTick = 0;
const warnedPlaces = new Set();

function loadProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem('killcritic') || 'null');
    if (!saved || saved.schemaVersion !== 2) return emptyProfile();
    return { ...emptyProfile(), ...saved };
  } catch {
    return emptyProfile();
  }
}

function save() {
  localStorage.setItem('killcritic', JSON.stringify(data));
  render();
}

function toast(message, duration = 2500) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  setTimeout(() => element.classList.remove('show'), duration);
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
}

function render() {
  $('#todayLabel').textContent = new Intl.DateTimeFormat('bg-BG', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).toUpperCase();
  $('#winsCount').textContent = data.wins;
  $('#profileName').textContent = data.profileName || 'Моето спокойно аз';
  $('#profileInitials').textContent = (data.profileName || 'АЗ').slice(0, 2).toUpperCase();
  $('#contactDisplay').textContent = data.contact || 'Добави телефон';
  $('#callContact').href = 'tel:' + (data.contact || '112');
  $('#onboarding').classList.toggle('active', !data.profileName);
  $('#onboarding').setAttribute('aria-hidden', data.profileName ? 'true' : 'false');

  const totals = data.costs.reduce((sum, item) => ({
    sleep: sum.sleep + Number(item.sleep || 0),
    money: sum.money + Number(item.money || 0),
    workouts: sum.workouts + Number(item.workouts || 0)
  }), { sleep: 0, money: 0, workouts: 0 });
  $('#costEntriesCount').textContent = data.costs.length;
  $('#totalSleepCost').textContent = `${totals.sleep.toFixed(1)} ч.`;
  $('#totalMoneyCost').textContent = `${totals.money.toFixed(2)} лв.`;
  $('#totalWorkouts').textContent = totals.workouts;
  if (data.aiInsights.length) $('#aiInsightText').textContent = data.aiInsights.at(-1).text;

  const recent = data.moods.slice(-7);
  const chart = $('#moodChart');
  const scores = { '😊': 95, '😐': 65, '😔': 38, '😡': 48, '😰': 30 };
  chart.innerHTML = '';
  for (let index = 0; index < 7; index++) {
    const mood = recent[index];
    const column = document.createElement('div');
    column.className = 'chart-col';
    column.innerHTML = `<span>${mood?.emoji || '·'}</span><div class="chart-bar" style="height:${mood ? scores[mood.emoji] : 15}%"></div><small>${mood ? new Date(mood.at).toLocaleDateString('bg-BG', { weekday: 'short' }) : '—'}</small>`;
    chart.append(column);
  }

  const topReason = Object.entries(data.reasons.reduce((all, item) => {
    all[item.reason] = (all[item.reason] || 0) + 1;
    return all;
  }, {})).sort((a, b) => b[1] - a[1])[0];
  $('#patternText').textContent = topReason
    ? `Най-често отбелязваш „${topReason[0].toLowerCase()}“. Това е добра точка за ранна грижа.`
    : 'Когато събереш няколко отбелязвания, тук ще видиш своите закономерности.';
}

$$('.bottom-nav button').forEach(button => button.onclick = () => {
  $$('.bottom-nav button').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  $$('.page').forEach(page => page.classList.remove('active'));
  $('#' + button.dataset.page).classList.add('active');
  scrollTo({ top: 0, behavior: 'smooth' });
});

$('#profileButton').onclick = () => $('.bottom-nav button[data-page="youPage"]').click();

$('#createProfile').onclick = () => {
  const name = $('#onboardingName').value.trim();
  if (!name) return toast('Въведи име или прякор');
  data = emptyProfile();
  data.profileName = name;
  data.createdAt = new Date().toISOString();
  localStorage.removeItem('kc_audio');
  audioUrl = '';
  save();
  toast('Твоят профил започна от 0');
};

$('#newProfile').onclick = () => {
  if (!confirm('Новият профил ще изтрие сегашните локални записи. Да продължим ли?')) return;
  data = emptyProfile();
  localStorage.removeItem('kc_audio');
  localStorage.removeItem('killcritic');
  audioUrl = '';
  render();
};

$('#moodPicker').onclick = event => {
  const button = event.target.closest('button');
  if (!button) return;
  $$('#moodPicker button').forEach(item => item.classList.remove('selected'));
  button.classList.add('selected');
  data.moods.push({ mood: button.dataset.mood, emoji: button.dataset.emoji, at: new Date().toISOString() });
  $('#moodStatus').textContent = 'запазено';
  save();
  toast('Настроението е отбелязано');
};

const missions = ['Излез и снимай нещо синьо.', 'Извърви 2 километра без бързане.', 'Открий ново кафе или чай.', 'Обади се на човек, когото харесваш.', 'Пусни една песен и подреди малък ъгъл.', 'Намери място, от което се вижда небето.', 'Направи си студена лимонада.'];
$('#newMission').onclick = () => $('#missionText').textContent = missions[Math.floor(Math.random() * missions.length)];
$('#completeMission').onclick = () => {
  data.missions++;
  data.wins++;
  save();
  toast('Мисията е твоя победа ✦');
  $('#newMission').click();
};

const modal = $('#modal');
const content = $('#modalContent');
function openModal(html) {
  content.innerHTML = html;
  modal.classList.add('open');
  modal.setAttribute('aria-hidden', 'false');
}
function closeModal() {
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
}
$$('[data-close]').forEach(element => element.onclick = closeModal);

$('#openSimulator').onclick = () => {
  openModal(`<p class="eyebrow">СИМУЛАТОР „СЛЕД 6 ЧАСА“</p><h2>Нека видим целия сценарий.</h2><p>Това е ориентир, не медицинска прогноза.</p><div class="field"><label>Колко напитки обмисляш?</label><input id="drinkCount" type="range" min="1" max="10" value="5"><strong><output id="drinkOut">5</output> напитки</strong></div><div class="result-box" id="simResult"></div><button class="primary" data-close-now>Добре, видях го</button>`);
  const range = $('#drinkCount');
  const result = $('#simResult');
  const calculate = () => {
    const count = Number(range.value);
    $('#drinkOut').textContent = count;
    result.innerHTML = `<strong>Възможният утрешен отпечатък</strong><p>≈ ${Math.round(count * 55)} мин. нарушен сън<br>≈ ${count * 6} лв. разход<br>Енергия: −${Math.min(70, count * 8)}%</p>`;
  };
  range.oninput = calculate;
  calculate();
  $('[data-close-now]').onclick = closeModal;
};

$('#openReason').onclick = () => openModal(`<p class="eyebrow">БЕЗ ПИСАНЕ</p><h2>Какво стои под желанието?</h2><div class="choice-list" id="reasons">${['Стрес', 'Самота', 'Скука', 'Празник', 'Тревожност', 'Умора'].map(reason => `<button>${reason}</button>`).join('')}</div><button class="primary" id="saveReason">Запази наблюдението</button>`);

$('#openMessage').onclick = () => {
  openModal(`<p class="eyebrow">ПОСЛАНИЕ ОТ ТРЕЗВОТО АЗ</p><h2>Твоят глас е по-силен.</h2><p>Запиши кратко послание за труден момент. То остава в този браузър.</p><div class="record-status" id="recordStatus">${audioUrl ? 'Има запазено послание.' : 'Все още няма запис.'}</div><button class="primary" id="recordButton">● Започни запис</button> ${audioUrl ? '<button class="text-button" id="previewAudio">▶ Чуй записа</button>' : ''}`);
  setTimeout(bindRecorder);
};

async function bindRecorder() {
  const button = $('#recordButton');
  if (!button) return;
  button.onclick = async () => {
    try {
      if (!recorder || recorder.state === 'inactive') {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordedChunks = [];
        recorder = new MediaRecorder(stream);
        recorder.ondataavailable = event => recordedChunks.push(event.data);
        recorder.onstop = () => {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              localStorage.setItem('kc_audio', reader.result);
              audioUrl = reader.result;
              toast('Посланието е запазено');
            } catch { toast('Записът е твърде дълъг за локално пазене'); }
          };
          reader.readAsDataURL(new Blob(recordedChunks, { type: 'audio/webm' }));
          stream.getTracks().forEach(track => track.stop());
        };
        recorder.start();
        button.textContent = '■ Спри и запази';
        $('#recordStatus').textContent = 'Записваме… говори спокойно.';
      } else {
        recorder.stop();
        button.textContent = '● Нов запис';
        $('#recordStatus').textContent = 'Запазване…';
      }
    } catch { toast('Разреши достъп до микрофона'); }
  };
  const preview = $('#previewAudio');
  if (preview) preview.onclick = () => new Audio(audioUrl).play();
}

$('#openCost').onclick = openCostModal;
function openCostModal() {
  const rows = data.costs.slice().reverse().map(item => `<div class="list-row"><div><strong>${new Date(item.at).toLocaleDateString('bg-BG')} · ${item.money.toFixed(2)} лв.</strong><small>${item.sleep} ч. сън · енергия ${item.energy}/10 · тревожност ${item.anxiety}/10</small></div><button class="danger-btn" data-delete-cost="${item.id}">Изтрий</button></div>`).join('');
  openModal(`<p class="eyebrow">ИСТИНСКАТА ЦЕНА</p><h2>Ти въвеждаш реалните стойности.</h2><p>Няма автоматични догадки. Запиши последствията, които действително си усетил.</p><div class="form-grid"><div class="field"><label>Похарчени пари (лв.)</label><input id="costMoney" type="number" min="0" step="0.01" value="0"></div><div class="field"><label>Загубен сън (часове)</label><input id="costSleep" type="number" min="0" step="0.5" value="0"></div><div class="field"><label>Енергия на следващия ден (0–10)</label><input id="costEnergy" type="number" min="0" max="10" value="5"></div><div class="field"><label>Пропуснати тренировки</label><input id="costWorkouts" type="number" min="0" step="1" value="0"></div><div class="field"><label>Тревожност (0–10)</label><input id="costAnxiety" type="number" min="0" max="10" value="5"></div><div class="field"><label>Продуктивност (0–10)</label><input id="costProductivity" type="number" min="0" max="10" value="5"></div></div><div class="field"><label>Бележка по желание</label><textarea id="costNote" placeholder="Какво още ти струваше този случай?"></textarea></div><button class="primary" id="saveCost">Запази случая</button><div class="cost-list">${rows || '<p>Още няма записани случаи.</p>'}</div>`);
}

$('#openRadar').onclick = openRadarModal;
function openRadarModal() {
  const history = data.radarEntries.slice(-5).reverse().map(item => `<div class="list-row"><div><strong>„${escapeHtml(item.text)}“</strong><small>план ${item.planned} · реално ${item.actual} напитки</small></div></div>`).join('');
  openModal(`<p class="eyebrow">AI РАДАР ЗА САМОЗАБЛУДА</p><h2>Какво си казваш в момента?</h2><p>Напиши го с твоите думи. Радарът сравнява мисълта с личната ти история.</p><div class="field"><label>Моята мисъл</label><textarea id="radarText" placeholder="Например: Само една, днес заслужавам..."></textarea></div><div class="form-grid"><div class="field"><label>Колко планираше?</label><input id="radarPlanned" type="number" min="0" value="1"></div><div class="field"><label>Колко стана реално?</label><input id="radarActual" type="number" min="0" value="0"></div></div><p><small>При анализа текстът и последните записи се изпращат към настроения AI сървър. GPS координати не се изпращат.</small></p><button class="primary" id="analyzeRadar">Анализирай и запази</button><div id="radarResult"></div><div class="radar-history">${history}</div>`);
}

$('#openPlaces').onclick = openPlacesModal;
function openPlacesModal() {
  const places = data.riskPlaces.map(place => `<div class="list-row"><div><strong>${escapeHtml(place.name)}</strong><small>радиус ${place.radius} м · ${place.lat.toFixed(4)}, ${place.lng.toFixed(4)}</small></div><button class="danger-btn" data-delete-place="${place.id}">Изтрий</button></div>`).join('');
  openModal(`<p class="eyebrow">РИСКОВИ МЕСТА</p><h2>Предупреждение преди автоматичния избор.</h2><p>Запази текущото място. Когато приложението е отворено и влезеш в избрания радиус, ще получиш предупреждение.</p><div class="field"><label>Име на мястото</label><input id="placeName" placeholder="Например: барът до офиса"></div><div class="field"><label>Радиус за предупреждение</label><input id="placeRadius" type="number" min="50" max="2000" value="200"></div><button class="primary" id="saveCurrentPlace">⌖ Запази текущото местоположение</button><div class="location-status" id="locationStatus">${locationWatcher ? 'GPS наблюдението е активно.' : 'GPS ще се активира след разрешение.'}</div><div class="place-list">${places || '<p>Още няма запазени рискови места.</p>'}</div>`);
}

document.addEventListener('click', async event => {
  if (event.target.matches('#reasons button')) {
    $$('#reasons button').forEach(item => item.classList.remove('selected'));
    event.target.classList.add('selected');
  }
  if (event.target.id === 'saveReason') {
    const selected = $('#reasons .selected');
    if (!selected) return toast('Избери една причина');
    data.reasons.push({ reason: selected.textContent, at: new Date().toISOString() });
    data.wins++;
    save(); closeModal(); toast('Наблюдението е запазено');
  }
  if (event.target.id === 'saveCost') saveCostEntry();
  if (event.target.dataset.deleteCost) {
    data.costs = data.costs.filter(item => item.id !== event.target.dataset.deleteCost);
    save(); openCostModal();
  }
  if (event.target.id === 'analyzeRadar') await analyzeRadar();
  if (event.target.id === 'saveCurrentPlace') saveCurrentPlace();
  if (event.target.dataset.deletePlace) {
    data.riskPlaces = data.riskPlaces.filter(place => place.id !== event.target.dataset.deletePlace);
    save(); openPlacesModal(); startLocationWatch();
  }
  if (event.target.id === 'saveContact') {
    data.contact = $('#contactInput').value.trim();
    save(); closeModal(); toast('Контактът е запазен');
  }
});

function numberValue(id, min = 0, max = Infinity) {
  return Math.min(max, Math.max(min, Number($(id).value) || 0));
}

function saveCostEntry() {
  const entry = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    at: new Date().toISOString(),
    money: numberValue('#costMoney'),
    sleep: numberValue('#costSleep'),
    energy: numberValue('#costEnergy', 0, 10),
    workouts: numberValue('#costWorkouts'),
    anxiety: numberValue('#costAnxiety', 0, 10),
    productivity: numberValue('#costProductivity', 0, 10),
    note: $('#costNote').value.trim()
  };
  data.costs.push(entry);
  data.wins++;
  save(); openCostModal(); toast('Истинската цена е записана');
}

function normalizedText(text) {
  return text.toLocaleLowerCase('bg-BG').replace(/[^a-zа-я0-9 ]/gi, '').trim();
}

function localRadarAnalysis(text, planned) {
  const normalized = normalizedText(text);
  const phrases = ['само една', 'заслужавам', 'няма проблем', 'контролирам се', 'последно', 'от утре', 'всички пият'];
  const found = phrases.filter(phrase => normalized.includes(phrase));
  const similar = data.radarEntries.filter(item => {
    const old = normalizedText(item.text);
    return found.some(phrase => old.includes(phrase)) || (normalized.length > 5 && old.includes(normalized.slice(0, Math.min(12, normalized.length))));
  });
  const exceeded = similar.filter(item => Number(item.actual) > Number(item.planned)).length;
  if (similar.length) return `Тази мисъл прилича на ${similar.length} твои предишни случая. В ${exceeded} от тях си изпил повече от планираното. Това е модел за наблюдение, не присъда.`;
  if (found.length) return `Радарът разпозна типична фраза: „${found[0]}“. Все още няма достатъчно лична история за сравнение. Планът ти в момента е ${planned} напитки.`;
  return 'Това е първи подобен запис. Запазваме го, за да сравняваме бъдещите решения с реалния резултат.';
}

async function analyzeRadar() {
  const text = $('#radarText').value.trim();
  if (!text) return toast('Напиши мисълта, която искаш да провериш');
  const planned = numberValue('#radarPlanned');
  const actual = numberValue('#radarActual');
  const local = localRadarAnalysis(text, planned);
  const entry = { id: String(Date.now()), text, planned, actual, at: new Date().toISOString(), analysis: local };
  data.radarEntries.push(entry);
  save();
  const result = $('#radarResult');
  result.innerHTML = `<div class="radar-box"><strong>Личен радар</strong><p>${escapeHtml(local)}</p><small>AI проверката се зарежда…</small></div>`;
  const ai = await requestAI('radar', { current: entry, history: data.radarEntries.slice(-20), costs: data.costs.slice(-10), reasons: data.reasons.slice(-20) });
  if (ai) {
    entry.analysis = ai;
    save();
    result.innerHTML = `<div class="radar-box"><strong>AI анализ</strong><p>${escapeHtml(ai)}</p><small>Наблюдение, не медицинска диагноза.</small></div>`;
  } else {
    result.querySelector('small').textContent = 'Локален анализ — AI сървърът не е активен в тази публикация.';
  }
}

async function requestAI(mode, payload) {
  try {
    const response = await fetch('/api/ai', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode, payload }) });
    if (!response.ok) return '';
    const result = await response.json();
    return result.analysis || '';
  } catch { return ''; }
}

$('#runDeepAnalysis').onclick = async () => {
  const button = $('#runDeepAnalysis');
  button.disabled = true;
  button.textContent = 'Анализирам…';
  const local = buildLocalDeepInsight();
  const ai = await requestAI('deep', { moods: data.moods.slice(-30), reasons: data.reasons.slice(-30), cravings: data.cravings.slice(-30), costs: data.costs.slice(-20), radar: data.radarEntries.slice(-20) });
  const insight = ai || local;
  data.aiInsights.push({ text: insight, at: new Date().toISOString(), source: ai ? 'ai' : 'local' });
  save();
  button.disabled = false;
  button.textContent = 'Анализирай записите';
  toast(ai ? 'AI анализът е готов' : 'Показан е локален анализ; AI endpoint не е активен', 3500);
};

function buildLocalDeepInsight() {
  if (!data.costs.length && !data.reasons.length && !data.radarEntries.length) return 'Нужни са още няколко лични записа, за да се появи надежден модел.';
  const averageAnxiety = data.costs.length ? data.costs.reduce((sum, item) => sum + item.anxiety, 0) / data.costs.length : 0;
  const exceeded = data.radarEntries.filter(item => item.actual > item.planned).length;
  return `Имаш ${data.costs.length} записа за цена и ${data.radarEntries.length} записа в радара. Средната отбелязана тревожност е ${averageAnxiety.toFixed(1)}/10. В ${exceeded} случая реалното количество е било над планираното.`;
}

function saveCurrentPlace() {
  if (!navigator.geolocation) return toast('Този браузър не поддържа геолокация');
  const name = $('#placeName').value.trim();
  if (!name) return toast('Дай име на мястото');
  const status = $('#locationStatus');
  status.textContent = 'Определям местоположението…';
  navigator.geolocation.getCurrentPosition(position => {
    data.riskPlaces.push({
      id: String(Date.now()), name,
      radius: numberValue('#placeRadius', 50, 2000),
      lat: position.coords.latitude, lng: position.coords.longitude,
      createdAt: new Date().toISOString()
    });
    data.wins++;
    save(); openPlacesModal(); startLocationWatch(); toast('Рисковото място е запазено');
  }, error => status.textContent = locationError(error), { enableHighAccuracy: true, timeout: 12000 });
}

function locationError(error) {
  if (error.code === 1) return 'Достъпът до местоположение не е разрешен.';
  if (error.code === 2) return 'Местоположението не може да бъде определено.';
  return 'GPS заявката отне твърде дълго.';
}

function distanceInMeters(lat1, lng1, lat2, lng2) {
  const radius = 6371000;
  const toRad = value => value * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return radius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function startLocationWatch() {
  if (locationWatcher) navigator.geolocation.clearWatch(locationWatcher);
  if (!navigator.geolocation || !data.riskPlaces.length) return;
  locationWatcher = navigator.geolocation.watchPosition(position => {
    data.riskPlaces.forEach(place => {
      const distance = distanceInMeters(position.coords.latitude, position.coords.longitude, place.lat, place.lng);
      if (distance <= place.radius && !warnedPlaces.has(place.id)) {
        warnedPlaces.add(place.id);
        navigator.vibrate?.([200, 100, 200]);
        toast(`Наближаваш „${place.name}“. Искаш ли да избереш друг маршрут?`, 6500);
      }
      if (distance > place.radius * 1.5) warnedPlaces.delete(place.id);
    });
  }, () => {}, { enableHighAccuracy: false, maximumAge: 30000 });
}

function startCrisis() {
  remaining = 300;
  $('#crisisTitle').innerHTML = 'Остани тук<br>за следващия дъх.';
  $('#crisisTimer').textContent = '05:00';
  $('#crisis').classList.add('active');
  $('#crisis').setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  clearInterval(crisisInterval);
  crisisInterval = setInterval(() => {
    remaining--;
    $('#crisisTimer').textContent = `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
    breathTick++;
    $('#breathLabel').textContent = breathTick % 8 < 4 ? 'Вдишай' : 'Издишай';
    if (remaining <= 0) {
      clearInterval(crisisInterval);
      $('#crisisTitle').innerHTML = 'Ти остана.<br>Вълната се промени.';
      data.wins++;
      save();
    }
  }, 1000);
}

$('#startCraving').onclick = startCrisis;
$('#openBreathing').onclick = startCrisis;
$('#exitCrisis').onclick = () => {
  clearInterval(crisisInterval);
  $('#crisis').classList.remove('active');
  $('#crisis').setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};
$('#intensitySlider').oninput = event => $('#intensityOutput').textContent = event.target.value;
$('#saveIntensity').onclick = () => {
  data.cravings.push({ level: Number($('#intensitySlider').value), at: new Date().toISOString() });
  data.wins++;
  save(); toast('Запазено. Всяка вълна има край.');
};
$('#playRecording').onclick = () => audioUrl ? new Audio(audioUrl).play() : toast('Първо запиши свое послание');

$('#contactSetting').onclick = () => openModal(`<p class="eyebrow">ЧОВЕК ЗА КОНТАКТ</p><h2>Кой да е на един бутон разстояние?</h2><div class="field"><label>Телефон</label><input id="contactInput" type="tel" value="${escapeHtml(data.contact)}" placeholder="+359..."></div><button class="primary" id="saveContact">Запази</button>`);

$('#exportData').onclick = () => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = 'killcritic-my-data.json';
  anchor.click();
  URL.revokeObjectURL(anchor.href);
};

$('#resetData').onclick = () => {
  if (!confirm('Сигурен ли си? Всички стойности ще се върнат на 0 и локалните записи ще бъдат изтрити.')) return;
  const name = data.profileName;
  data = emptyProfile();
  data.profileName = name;
  data.createdAt = new Date().toISOString();
  localStorage.removeItem('kc_audio');
  audioUrl = '';
  save();
  toast('Всичко е върнато на 0');
};

render();
if (data.profileName) startLocationWatch();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || ['localhost', '127.0.0.1'].includes(location.hostname))) navigator.serviceWorker.register('./service-worker.js').catch(() => {});
