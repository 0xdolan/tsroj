/**
 * One-time helper: reads legacy catalog.json and writes i18next-style locale files.
 * Run: node scripts/extract-locales.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(
	readFileSync(join(root, "src/locales/catalog.json"), "utf8"),
);

function unwrapNested(arr) {
	return arr.map((entry) => {
		if (Array.isArray(entry)) return entry;
		return [entry];
	});
}

function unwrapStrings(arr) {
	return arr.map((entry) => (Array.isArray(entry) ? entry[0] : entry));
}

function toBlock(cal) {
	return {
		months: unwrapNested(cal.months),
		months_short: unwrapNested(cal.months_short),
		weekdays: unwrapStrings(cal.weekdays),
		weekdays_short: unwrapStrings(cal.weekdays_short),
		weekdays_min: cal.weekdays_min
			? unwrapStrings(cal.weekdays_min)
			: undefined,
	};
}

const CKB_KURDISH_MONTHS = [
	["نەورۆز", "خاکه‌لێوه", "ھەرمێ پشکوان"],
	["گوڵان", "بانەمەڕ"],
	["جۆزه‌ردان"],
	["پووشپەڕ"],
	["گه‌لاوێژ"],
	["خه‌رمانان"],
	["ڕەزبەر"],
	["گەڵاڕێزان"],
	["سه‌رماوه‌ز"],
	["به‌فرانبار"],
	["ڕێبەندان"],
	["ڕەشەمێ", "ڕەشەمە"],
];

const CKB_KURDISH_MONTHS_SHORT = [
	["نەور"],
	["گوڵا"],
	["جۆزه"],
	["پووش"],
	["گه‌ل"],
	["خه‌ر"],
	["ڕەز"],
	["گەڵ"],
	["سه‌ر"],
	["به‌ف"],
	["ڕێب"],
	["ڕەش"],
];

const META = {
	en: { locale: "en", script: "Latn", name: "English" },
	kmr: { locale: "kmr", script: "Latn", name: "Northern Kurdish (Kurmanji)" },
	ckb: { locale: "ckb", script: "Arab", name: "Central Kurdish (Sorani)" },
	fa: { locale: "fa", script: "Arab", name: "Persian" },
	ar: { locale: "ar", script: "Arab", name: "Arabic" },
	tr: { locale: "tr", script: "Latn", name: "Turkish" },
};

/** Locales that only own gregorian + kurdish; persian/islamic delegate at runtime. */
const SLIM_LOCALES = new Set(["ckb", "kmr", "ku"]);

for (const [id, data] of Object.entries(catalog.locales)) {
	if (id === "ku") continue;

	const calendar = {};
	for (const [calId, calData] of Object.entries(data)) {
		if (calId === "digits" || calId === "am_pm") continue;
		if (SLIM_LOCALES.has(id) && (calId === "persian" || calId === "islamic")) {
			continue;
		}
		calendar[calId] = toBlock(calData);
	}

	if (id === "ckb") {
		calendar.kurdish = {
			...calendar.kurdish,
			months: CKB_KURDISH_MONTHS,
			months_short: CKB_KURDISH_MONTHS_SHORT,
		};
	}

	if (id === "fa") {
		delete calendar.kurdish;
	}

	if (id === "ar") {
		delete calendar.kurdish;
	}

	const bundle = {
		meta: META[id] ?? { locale: id, script: "Latn", name: id },
		digits: data.digits,
		am_pm: data.am_pm,
		calendar,
	};

	const outDir = join(root, "src/locales", id);
	mkdirSync(outDir, { recursive: true });
	writeFileSync(
		join(outDir, "common.json"),
		`${JSON.stringify(bundle, null, "\t")}\n`,
	);
	console.log(`wrote ${id}/common.json`);
}
