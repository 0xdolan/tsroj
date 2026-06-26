import { describe, expect, test } from "vitest";
import { formatCalendarDate } from "../src/formatting";
import { KurdishDate } from "../src/kurdish";
import {
	CalendarKind,
	getLocaleData,
	LocaleId,
	resolveCalendarLabels,
	resolveLocaleId,
	resolveMonthName,
	resolveVariantLabel,
} from "../src/locales";
import { LOCALE_BUNDLES } from "../src/locales/bundles";

describe("locale bundles", () => {
	test("all loaded bundles validate at import time", () => {
		expect(Object.keys(LOCALE_BUNDLES).sort()).toEqual(
			["ar", "ckb", "en", "fa", "kmr", "tr"].sort(),
		);
	});

	test("ckb kurdish months use variant groups", () => {
		const months = getLocaleData(LocaleId.CKB, CalendarKind.KURDISH).months;
		expect(months[0].names).toEqual(["نەورۆز", "خاکه‌لێوه", "ھەرمێ پشکوان"]);
		expect(months[0].short).toEqual(["نەور", "خاک", "ھەرم"]);
		expect(months[1].names).toEqual(["گوڵان", "بانەمەڕ"]);
		expect(months[11].names).toEqual(["ڕەشەمێ", "ڕەشەمە"]);
	});

	test("persian calendar delegates to fa for ckb locale", () => {
		const fa = getLocaleData(LocaleId.FA, CalendarKind.PERSIAN);
		const ckb = getLocaleData(LocaleId.CKB, CalendarKind.PERSIAN);
		expect(ckb.months[0].names[0]).toBe(fa.months[0].names[0]);
		expect(ckb.months[0].names[0]).toBe("فروردین");
		expect(ckb.weekdays[0].names[0]).toBe("شەممە");
	});

	test("islamic calendar delegates to ar for ckb locale", () => {
		const ar = getLocaleData(LocaleId.AR, CalendarKind.ISLAMIC);
		const ckb = getLocaleData(LocaleId.CKB, CalendarKind.ISLAMIC);
		expect(ckb.months[0].names[0]).toBe(ar.months[0].names[0]);
		expect(ckb.months[0].names[0]).toBe("محرم");
		expect(ckb.weekdays[0].names[0]).toBe("شەممە");
	});

	test("fa bundle does not define kurdish calendar", () => {
		expect(LOCALE_BUNDLES[LocaleId.FA]?.calendar.kurdish).toBeUndefined();
	});

	test("resolveLocaleId maps dialect aliases", () => {
		expect(resolveLocaleId("sdh")).toBe(LocaleId.CKB);
		expect(resolveLocaleId("zza")).toBe(LocaleId.KMR);
		expect(resolveLocaleId("ku")).toBe(LocaleId.CKB);
	});
});

describe("variant-aligned labels", () => {
	test("month short follows the same variant index as full name", () => {
		const data = getLocaleData(LocaleId.CKB, CalendarKind.KURDISH);
		expect(resolveVariantLabel(data.months, 0, "names", 1)).toBe("خاکه‌لێوه");
		expect(resolveVariantLabel(data.months, 0, "short", 1)).toBe("خاک");
		expect(resolveVariantLabel(data.months, 0, "short", 2)).toBe("ھەرم");
		expect(resolveVariantLabel(data.months, 1, "short", 1)).toBe("بان");
	});

	test("kmr month shorts align with name variants", () => {
		const data = getLocaleData(LocaleId.KMR, CalendarKind.KURDISH);
		expect(resolveVariantLabel(data.months, 0, "names", 2)).toBe("Nîsan");
		expect(resolveVariantLabel(data.months, 0, "short", 2)).toBe("Nîsa");
		expect(resolveVariantLabel(data.months, 3, "names", 1)).toBe("Pûşper");
		expect(resolveVariantLabel(data.months, 3, "short", 1)).toBe("Pûş");
	});

	test("weekday variants align short and min", () => {
		const data = getLocaleData(LocaleId.KMR, CalendarKind.KURDISH);
		expect(resolveVariantLabel(data.weekdays, 0, "names")).toBe("Şemî");
		expect(resolveVariantLabel(data.weekdays, 0, "names", 1)).toBe("Saturday");
		expect(resolveVariantLabel(data.weekdays, 0, "short", 1)).toBe("Sat");
		expect(resolveVariantLabel(data.weekdays, 0, "min", 1)).toBe("Sa");

		const ckb = getLocaleData(LocaleId.CKB, CalendarKind.KURDISH);
		expect(resolveVariantLabel(ckb.weekdays, 1, "names", 1)).toBe("یەکشەم");
		expect(resolveVariantLabel(ckb.weekdays, 1, "short", 1)).toBe("ی");
	});

	test("resolveMonthName uses default then variant index or name", () => {
		const months = getLocaleData(LocaleId.CKB, CalendarKind.KURDISH).months;
		expect(resolveMonthName(months, 0)).toBe("نەورۆز");
		expect(resolveMonthName(months, 0, 1)).toBe("خاکه‌لێوه");
		expect(resolveMonthName(months, 0, "ھەرمێ پشکوان")).toBe("ھەرمێ پشکوان");
		expect(resolveMonthName(months, 1, 1)).toBe("بانەمەڕ");
	});
});

describe("strftime variants and overrides", () => {
	test("ckb month 4 is پووشپەڕ", () => {
		const kd = new KurdishDate(2726, 4, 5);
		expect(kd.strftime("%B", { locale: "ckb" })).toBe("پووشپەڕ");
		expect(kd.strftime("%b", { locale: "ckb" })).toBe("پووش");
	});

	test("strftime respects monthVariant for full and short names", () => {
		const kd = new KurdishDate(2726, 1, 25);
		expect(kd.strftime("%B", { locale: "ckb" })).toBe("نەورۆز");
		expect(kd.strftime("%b", { locale: "ckb" })).toBe("نەور");
		expect(kd.strftime("%B", { locale: "ckb", monthVariant: 1 })).toBe(
			"خاکه‌لێوه",
		);
		expect(kd.strftime("%b", { locale: "ckb", monthVariant: 1 })).toBe("خاک");
		expect(kd.strftime("%B", { locale: "kmr" })).toBe("Newroz");
		expect(kd.strftime("%b", { locale: "kmr", monthVariant: 2 })).toBe("Nîsa");
	});

	test("strftime respects weekdayVariant and %E weekday min token", () => {
		const kd = new KurdishDate(2726, 1, 24);
		expect(kd.strftime("%A", { locale: "kmr" })).toBe("Duşem");
		expect(kd.strftime("%a", { locale: "kmr" })).toBe("Duş");
		expect(kd.strftime("%E", { locale: "kmr" })).toBe("D");
		expect(kd.strftime("%A", { locale: "kmr", weekdayVariant: 1 })).toBe(
			"Monday",
		);
		expect(kd.strftime("%a", { locale: "kmr", weekdayVariant: 1 })).toBe("Mon");
	});

	test("manual label overrides take precedence", () => {
		const kd = new KurdishDate(2726, 1, 25);
		const data = getLocaleData(LocaleId.CKB, CalendarKind.KURDISH);
		const labels = resolveCalendarLabels(data, 0, 2, {
			month: "CustomMonth",
			monthShort: "CM",
			weekday: "CustomDay",
			weekdayShort: "CD",
			weekdayMin: "c",
		});
		expect(labels.month).toBe("CustomMonth");
		expect(labels.monthShort).toBe("CM");
		expect(labels.weekday).toBe("CustomDay");

		expect(
			kd.strftime("%B %b %A %a %E", {
				locale: "ckb",
				month: "ManualMonth",
				monthShort: "MM",
				weekday: "ManualDay",
				weekdayShort: "MD",
				weekdayMin: "m",
			}),
		).toBe("ManualMonth MM ManualDay MD m");
	});

	test("nested overrides object works", () => {
		const kd = new KurdishDate(2726, 1, 25);
		expect(
			kd.strftime("%B", {
				locale: "ckb",
				overrides: { month: "NestedMonth" },
			}),
		).toBe("NestedMonth");
	});

	test("digits override with useLocaleDigits", () => {
		const kd = new KurdishDate(2726, 1, 25);
		const customDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
		expect(
			kd.strftime("%Y", {
				locale: "en",
				useLocaleDigits: true,
				digits: customDigits,
			}),
		).toBe("۲۷۲۶");
	});

	test("ckb ezafe after day when month name is in pattern", () => {
		const kd = new KurdishDate(2726, 4, 5);
		expect(kd.strftime("%d %B", { locale: "ckb" })).toBe("5ی پووشپەڕ");
		expect(kd.strftime("%d %B", { locale: "ckb", ezafeAfterDay: false })).toBe(
			"5 پووشپەڕ",
		);
	});

	test("ckb ezafe on month when day, month name, and year are in pattern", () => {
		const kd = new KurdishDate(2726, 4, 5);
		expect(kd.strftime("%d %B %Y", { locale: "ckb" })).toBe("5ی پووشپەڕی 2726");
		expect(
			kd.strftime("%d %B %Y", { locale: "ckb", ezafeOnMonth: false }),
		).toBe("5ی پووشپەڕ 2726");
		expect(
			kd.strftime("%d %B %Y", {
				locale: "ckb",
				ezafeAfterDay: false,
				ezafeOnMonth: false,
			}),
		).toBe("5 پووشپەڕ 2726");
	});

	test("leading zero defaults off for ckb, fa, ar", () => {
		const kd = new KurdishDate(2726, 4, 5);
		expect(kd.strftime("%d/%m", { locale: "ckb" })).toBe("5/4");
		expect(
			kd.strftime("%d/%m", { locale: "fa", calendar: CalendarKind.PERSIAN }),
		).toBe("5/4");
		expect(kd.strftime("%d/%m", { locale: "en" })).toBe("05/04");
		expect(kd.strftime("%d/%m", { locale: "ckb", leadingZero: true })).toBe(
			"05/04",
		);
	});
});

describe("formatting integration", () => {
	test("islamic formatting uses Arabic month names", () => {
		const kd = KurdishDate.fromGregorian(new Date(2018, 3, 10));
		const out = formatCalendarDate(kd, "%B", {
			calendar: CalendarKind.ISLAMIC,
			locale: LocaleId.CKB,
		});
		expect(out).toBe("رجب");
	});

	test("legacy flat weekday arrays still load for en gregorian", () => {
		const data = getLocaleData(LocaleId.EN, CalendarKind.GREGORIAN);
		expect(data.weekdays[0].names[0]).toBe("Monday");
		expect(data.weekdays[0].short?.[0]).toBe("Mon");
		expect(data.weekdays[0].min?.[0]).toBe("Mo");
	});
});
