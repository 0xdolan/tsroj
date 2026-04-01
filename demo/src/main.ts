import './style.css';
import { KurdishDateTime, LocaleId } from '@0xdolan/tsroj';

const timeEl = document.getElementById('ku-time')!;
const dateEl = document.getElementById('ku-date')!;
const grDateEl = document.getElementById('gr-date')!;
const isDateEl = document.getElementById('is-date')!;
const peDateEl = document.getElementById('pe-date')!;
const dialectSelector = document.getElementById('dialect') as HTMLSelectElement;

// Helper to ordinalize english days (1st, 2nd, etc)
function getOrdinalNum(n: number) {
  return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
}

function updateDisplays() {
  const now = new Date();
  const kdt = KurdishDateTime.fromJSDate(now);
  const locale = dialectSelector.value as LocaleId;

  // Render Kurdish Date & Time formatting
  timeEl.textContent = kdt.strftime("%I:%M:%S %p", { locale, useLocaleDigits: locale !== 'en' });
  dateEl.textContent = kdt.strftime("%A, %d %B %Y", { locale, useLocaleDigits: locale !== 'en' });

  // Render Gregorian (Standard JS / English)
  grDateEl.textContent = `${now.toLocaleDateString('en-US', { weekday: 'long' })}, ${getOrdinalNum(now.getDate())} ${now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`;
  
  // Render Persian Structure
  const [py, pm, pd] = kdt.toPersian();
  peDateEl.textContent = `Year ${py}, Month ${pm}, Day ${pd}`;

  // Render Islamic Structure
  const [iy, im, id] = kdt.toIslamic();
  isDateEl.textContent = `Year ${iy}, Month ${im}, Day ${id}`;
}

// Attach event and initiate loop
dialectSelector.addEventListener('change', updateDisplays);
setInterval(updateDisplays, 1000);
updateDisplays(); // initial call
