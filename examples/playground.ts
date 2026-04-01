import { KurdishDate, KurdishDateTime } from './src';

console.log("=== tsroj Playground ===");

// 1. Create a native JavaScript Date
const today = new Date();
console.log(`\nLocal JS Date: ${today.toDateString()} ${today.toTimeString()}`);

// 2. Convert to Kurdish Solar Date
const kurdishDate = KurdishDate.fromGregorian(today);
console.log(`\nKurdish Date (Year-Month-Day): ${kurdishDate.year}-${kurdishDate.month}-${kurdishDate.day}`);

// 3. Format it beautifully in different dialects Using standard tokens
console.log("\n--- Formatting Tests ---");
console.log(`English Format      : ${kurdishDate.strftime("%A, %d %B %Y", { locale: "en" })}`);
console.log(`Kurmanji Format     : ${kurdishDate.strftime("%A, %d %B %Y", { locale: "kmr" })}`);
console.log(`Sorani Format       : ${kurdishDate.strftime("%A, %d %B %Y", { locale: "ckb" })}`);
console.log(`Sorani (with digits): ${kurdishDate.strftime("%A, %d %B %Y", { locale: "ckb", useLocaleDigits: true })}`);

// 4. Test KurdishDateTime conversions
console.log("\n--- DateTime Tests ---");
const datetime = KurdishDateTime.fromJSDate(today);
console.log(`Kurdish Local Time : ${datetime.strftime("%Y-%m-%d %I:%M %p", { locale: "en" })}`);
console.log(`Sorani Local Time  : ${datetime.strftime("%Y-%m-%d %I:%M %p", { locale: "ckb" })}`);

// 5. Test conversions to other calendar systems structurally
console.log("\n--- Structural Tests ---");
const persian = kurdishDate.toPersian();
console.log(`As Persian (Jalali): Year ${persian[0]}, Month ${persian[1]}, Day ${persian[2]}`);

const islamic = kurdishDate.toIslamic();
console.log(`As Islamic (Hijri):  Year ${islamic[0]}, Month ${islamic[1]}, Day ${islamic[2]}`);
