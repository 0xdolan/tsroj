import './style.css';
import { KurdishDateTime, LocaleId } from '@0xdolan/tsroj';

const timeEl = document.getElementById('ku-time')!;
const dateEl = document.getElementById('ku-date')!;
const grDateEl = document.getElementById('gr-date')!;
const isDateEl = document.getElementById('is-date')!;
const peDateEl = document.getElementById('pe-date')!;
const dialectSelector = document.getElementById('dialect') as HTMLSelectElement;
const timezoneSelector = document.getElementById('timezone') as HTMLSelectElement;

// Helper to ordinalize english days (1st, 2nd, etc)
function getOrdinalNum(n: number) {
  return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}

function getShiftedDate(timeZone: string) {
  if (timeZone === 'local') return new Date();
  
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false
  });
  
  const parts = formatter.formatToParts(new Date());
  const map: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') map[part.type] = parseInt(part.value, 10);
  }
  
  // Return fake Date object shifted to the simulated native timezone
  return new Date(map.year, map.month - 1, map.day, map.hour === 24 ? 0 : map.hour, map.minute, map.second, 0);
}

function updateDisplays() {
  const targetTimezone = timezoneSelector.value;
  const now = getShiftedDate(targetTimezone);
  const kdt = KurdishDateTime.fromJSDate(now);
  const locale = dialectSelector.value as LocaleId;

  // Render Kurdish Date & Time formatting (With Punctuation Mapping)
  let rawTime = kdt.strftime("%I:%M:%S %p", { locale, useLocaleDigits: locale === 'ckb' });
  let rawDate = kdt.strftime("%A, %d %B %Y", { locale, useLocaleDigits: locale === 'ckb' });

  if (locale === 'ckb') {
    rawTime = rawTime.replace(/,/g, '،');
    rawDate = rawDate.replace(/,/g, '،');
    timeEl.classList.add('ckb-text');
    dateEl.classList.add('ckb-text');
    peDateEl.classList.add('ckb-text');
    isDateEl.classList.add('ckb-text');
  } else {
    timeEl.classList.remove('ckb-text');
    dateEl.classList.remove('ckb-text');
    peDateEl.classList.remove('ckb-text');
    isDateEl.classList.remove('ckb-text');
  }

  timeEl.textContent = rawTime;
  dateEl.textContent = rawDate;

  // Render Gregorian (Standard JS / English)
  grDateEl.textContent = `${now.toLocaleDateString('en-US', { weekday: 'long' })}, ${getOrdinalNum(now.getDate())} ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  
  // Render Persian Structure
  const [py, pm, pd] = kdt.toPersian();
  peDateEl.textContent = locale === 'ckb' ? `ساڵی ${py}، مانگی ${pm}، ڕۆژی ${pd}` : `Year ${py}, Month ${pm}, Day ${pd}`;

  // Render Islamic Structure
  const [iy, im, id] = kdt.toIslamic();
  isDateEl.textContent = locale === 'ckb' ? `ساڵی ${iy}، مانگی ${im}، ڕۆژی ${id}` : `Year ${iy}, Month ${im}, Day ${id}`;
}

// Attach event and initiate loop
dialectSelector.addEventListener('change', updateDisplays);
timezoneSelector.addEventListener('change', updateDisplays);
setInterval(updateDisplays, 1000);
updateDisplays(); // initial call
