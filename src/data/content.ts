import { Profile } from '../types';
import { localDateKey } from '../hooks/useProfile';

export const challengePool: [string, string, string][] = [
  ['💧', 'Изпий две чаши вода', 'Направи го бавно, преди следващото решение.'],
  ['🚶', 'Разходи се 15 минути', 'Смени мястото и остави тялото да се раздвижи.'],
  ['☎', 'Свържи се с човек', 'Едно кратко „Как си?“ е достатъчно.'],
  ['🫁', 'Пет минути спокойно дишане', 'Вдишай за 4, издишай за 6.'],
  ['🍋', 'Направи си различна напитка', 'Чай, лимонада или нещо, което харесваш.'],
  ['📷', 'Снимай нещо красиво', 'Намери цвят или светлина, които ти действат добре.'],
  ['🧹', 'Подреди малък ъгъл', 'Само едно чекмедже или една повърхност.'],
  ['🎵', 'Изслушай любима песен', 'Без да правиш нищо друго през тези минути.'],
  ['📝', 'Назови причината', 'Отбележи какво стои под желанието днес.'],
  ['🌙', 'Подготви по-спокойна вечер', 'Избери час за сън и остави телефона настрана.'],
  ['🌅', 'Виж изгрева или залеза', 'Отдели пет минути само за небето.'],
  ['🥗', 'Хапни нещо истинско', 'Избери храна, която ще даде стабилна енергия.'],
  ['🧊', 'Измий лицето си със студена вода', 'Кратка промяна за тялото и вниманието.'],
  ['📚', 'Прочети пет страници', 'Избери книга, а не социална мрежа.'],
  ['🌳', 'Намери зелено място', 'Парк, дърво или тиха улица са достатъчни.'],
  ['🧘', 'Разтегни тялото за 7 минути', 'Без състезание и без бързане.'],
  ['☕', 'Открий ново безалкохолно място', 'Кафене, чайна или сок бар.'],
  ['🗑', 'Изхвърли една ненужна вещ', 'Малък външен ред за малко вътрешен въздух.'],
  ['✍', 'Запиши три неща, които спечели', 'Фокус върху върнатото, не върху забраната.'],
  ['🛁', 'Вземи топъл душ', 'Използвай го като граница между деня и вечерта.'],
  ['🧩', 'Реши кратък пъзел', 'Дай на мозъка различна задача.'],
  ['🥾', 'Избери различен маршрут', 'Особено ако обичайният минава покрай рисково място.'],
  ['🕯', 'Направи 10 минути тишина', 'Без екран, музика или известия.'],
  ['😂', 'Намери нещо, което те разсмива', 'Кратко видео или разговор с приятел.'],
  ['🍎', 'Приготви закуска за утре', 'Помогни на бъдещото си аз още тази вечер.'],
  ['🎨', 'Нарисувай нещо за 5 минути', 'Не трябва да е красиво, само твое.'],
  ['🪴', 'Погрижи се за растение', 'Полей, почисти или просто го разгледай.'],
  ['🧠', 'Разпознай едно оправдание', 'Запиши го в радара без да го съдиш.'],
  ['👟', 'Направи 1000 допълнителни крачки', 'Натрупай ги спокойно до края на деня.'],
  ['💬', 'Кажи честно как си', 'Избери един безопасен човек.'],
  ['🍵', 'Направи ритуал с чай', 'Избери чаша, аромат и спокойно място.'],
  ['🔕', 'Изключи известията за 30 минути', 'Дай почивка на вниманието си.'],
  ['🛒', 'Купи си полезна малка награда', 'Плод, книга или нещо за хобито ти.'],
  ['🧦', 'Подготви дрехите за утре', 'Една малка грижа за сутринта.'],
  ['🎧', 'Чуй кратък подкаст', 'Избери тема, която няма общо с алкохола.'],
  ['🪟', 'Проветри и поеми 10 дълбоки вдишвания', 'Промени въздуха и темпото.'],
  ['🧑‍🍳', 'Сготви нещо лесно', 'Дори сандвичът може да бъде съзнателно действие.'],
  ['📵', 'Остави телефона в друга стая', 'Започни само с 15 минути.'],
  ['🧱', 'Направи 20 клякания', 'Ако е безопасно за теб, движи се бавно.'],
  ['🗺', 'Планирай кратка разходка за уикенда', 'Избери място и час.'],
  ['💌', 'Изпрати благодарност', 'Едно изречение към човек, който ти е помогнал.'],
  ['🧺', 'Сгъни пет дрехи', 'Спри след пет, ако искаш. Мисията е изпълнена.'],
  ['🌧', 'Послушай звуци от природа', 'Пет минути дъжд, море или гора.'],
  ['🪥', 'Направи вечерната грижа по-рано', 'Създай сигнал, че денят приключва.'],
  ['🚰', 'Напълни бутилка за деня', 'Дръж я на видно място.'],
  ['🧑‍🤝‍🧑', 'Планирай среща без алкохол', 'Предложи разходка, кино или кафе.'],
  ['🎯', 'Избери една задача за утре', 'Само една ясна и изпълнима стъпка.'],
  ['🫶', 'Кажи си едно добро изречение', 'Говори си така, както би говорил на приятел.'],
  ['🛌', 'Легни 20 минути по-рано', 'Сънят е част от превенцията, не награда.'],
];

export const missions: string[] = [
  'Излез и снимай нещо синьо.',
  'Извърви 2 километра без бързане.',
  'Открий ново кафе или чай.',
  'Обади се на човек, когото харесваш.',
  'Пусни една песен и подреди малък ъгъл.',
  'Намери място, от което се вижда небето.',
  'Направи си студена лимонада.',
];

export const moodOptions: { mood: string; emoji: string; label: string }[] = [
  { mood: 'Страхотно', emoji: '😊', label: 'супер' },
  { mood: 'Спокойно', emoji: '😐', label: 'равно' },
  { mood: 'Тъжно', emoji: '😔', label: 'тъжно' },
  { mood: 'Ядосано', emoji: '😡', label: 'яд' },
  { mood: 'Тревожно', emoji: '😰', label: 'тревога' },
];

export const reasonOptions = ['Стрес', 'Самота', 'Скука', 'Празник', 'Тревожност', 'Умора'];

function seededRandom(seed: number) {
  let value = seed || 1;
  return () => {
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function todayChallenges(profile: Profile): [string, string, string][] {
  const key = localDateKey();
  const variant = profile.challengeVariant[key] || 0;
  const seed = [...key].reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 11), 0) + variant * 7919;
  const random = seededRandom(seed);
  const shuffled = challengePool
    .map((item, index) => ({ item, order: random() + index / 100000 }))
    .sort((a, b) => a.order - b.order);
  return shuffled.slice(0, 6).map((entry) => entry.item);
}

export function calendarStatistics(profile: Profile) {
  const entries = Object.entries(profile.sobrietyDays).sort((a, b) => a[0].localeCompare(b[0]));
  const allSober = entries.filter(([, state]) => state === 'sober').length;
  let best = 0;
  let run = 0;
  let previousDate: Date | null = null;
  entries.forEach(([key, state]) => {
    const date = new Date(`${key}T12:00:00`);
    const consecutive = previousDate && Math.round((date.getTime() - previousDate.getTime()) / 86400000) === 1;
    if (state === 'sober') run = consecutive ? run + 1 : 1;
    else run = 0;
    best = Math.max(best, run);
    previousDate = date;
  });

  let current = 0;
  const cursor = new Date();
  if (!profile.sobrietyDays[localDateKey(cursor)]) cursor.setDate(cursor.getDate() - 1);
  while (profile.sobrietyDays[localDateKey(cursor)] === 'sober') {
    current++;
    cursor.setDate(cursor.getDate() - 1);
  }

  let recentSober = 0;
  let recentDrink = 0;
  for (let offset = 0; offset < 30; offset++) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const state = profile.sobrietyDays[localDateKey(date)];
    if (state === 'sober') recentSober++;
    if (state === 'drink') recentDrink++;
  }
  const recentPercent = recentSober + recentDrink ? Math.round((recentSober / (recentSober + recentDrink)) * 100) : 0;

  return { current, best, allSober, recentPercent };
}

export function monthStatistics(profile: Profile, cursor: Date) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  let sober = 0;
  let drink = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const key = localDateKey(new Date(year, month, day));
    const state = profile.sobrietyDays[key];
    if (state === 'sober') sober++;
    if (state === 'drink') drink++;
  }
  return { sober, drink, success: sober + drink ? Math.round((sober / (sober + drink)) * 100) : 0 };
}
