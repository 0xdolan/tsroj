import { KurdishDate, KurdishDateTime } from "../src/index";

console.log("=== tsroj Playground ===\n");

const today = new Date();
console.log(`Local JS Date: ${today.toDateString()} ${today.toTimeString()}`);

const kurdishDate = KurdishDate.fromGregorian(today);
console.log(
	`\nKurdish Date (Y-M-D): ${kurdishDate.year}-${kurdishDate.month}-${kurdishDate.day}`,
);

console.log("\n--- Locale formatting ---");
console.log(
	`English : ${kurdishDate.strftime("%A, %d %B %Y", { locale: "en" })}`,
);
console.log(
	`Kurmanji: ${kurdishDate.strftime("%A, %d %B %Y", { locale: "kmr" })}`,
);
console.log(
	`Sorani  : ${kurdishDate.strftime("%A, %d %B %Y", { locale: "ckb" })}`,
);
console.log(
	`Sorani (locale digits): ${kurdishDate.strftime("%A, %d %B %Y", { locale: "ckb", useLocaleDigits: true })}`,
);

const month4 = new KurdishDate(2726, 4, 5);
console.log(
	`\nSorani month 4 (پووشپەڕ): ${month4.strftime("%B %b", { locale: "ckb" })}`,
);

console.log("\n--- Month / weekday variants ---");
console.log(
	`Default month 1 : ${kurdishDate.strftime("%B %b", { locale: "ckb" })}`,
);
console.log(
	`Variant month 1 : ${kurdishDate.strftime("%B %b", { locale: "ckb", monthVariant: 1 })}`,
);
console.log(
	`Weekday min %E  : ${kurdishDate.strftime("%A %a %E", { locale: "kmr" })}`,
);

console.log("\n--- Manual overrides ---");
console.log(
	kurdishDate.strftime("%B %A", {
		locale: "ckb",
		month: "OverrideMonth",
		weekday: "OverrideDay",
	}),
);

console.log("\n--- DateTime ---");
const datetime = KurdishDateTime.fromJSDate(today);
console.log(
	`English time: ${datetime.strftime("%Y-%m-%d %I:%M %p", { locale: "en" })}`,
);
console.log(
	`Sorani time  : ${datetime.strftime("%Y-%m-%d %I:%M %p", { locale: "ckb", useLocaleDigits: true })}`,
);

console.log("\n--- Calendar conversions ---");
const persian = kurdishDate.toPersian();
console.log(`Persian: ${persian[0]}-${persian[1]}-${persian[2]}`);
const islamic = kurdishDate.toIslamic();
console.log(`Islamic: ${islamic[0]}-${islamic[1]}-${islamic[2]}`);

console.log(
	`\nPersian formatted: ${kurdishDate.strftime("%B %d %Y", { locale: "ckb", calendar: "persian" })}`,
);
console.log(
	`Islamic formatted: ${kurdishDate.strftime("%B %d %Y", { locale: "ckb", calendar: "islamic" })}`,
);
