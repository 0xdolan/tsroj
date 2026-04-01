import { describe, expect, test } from "vitest";
import {
	gregorianToJdn,
	islamicToJdn,
	jdnToGregorian,
	jdnToIslamic,
	jdnToPersian,
	persianToJdn,
} from "../src/core/convert";
import { formatCalendarDate } from "../src/formatting";
import { KurdishDate, KurdishEra } from "../src/kurdish";
import { LocaleId } from "../src/locales";

describe("JDN Conversion Alignments", () => {
	test("Gregorian 2018-04-10 is mapped accurately to Persian, Kurdish, and Islamic", () => {
		// 1. Convert to JDN from Gregorian
		const jdn = gregorianToJdn(2018, 4, 10);

		// 2. Map back to Gregorian
		expect(jdnToGregorian(jdn)).toEqual([2018, 4, 10]);

		// 3. Persian
		expect(jdnToPersian(jdn)).toEqual([1397, 1, 21]);

		// 4. Islamic
		expect(jdnToIslamic(jdn)).toEqual([1439, 7, 24]);
	});

	test("KurdishDate wrapper converts properly", () => {
		const d = new Date(2018, 3, 10); // April 10, 2018
		const kd = KurdishDate.fromGregorian(d);

		// Kurdish solar uses year offset (Persian 1397 + 1321 = 2718)
		expect(kd.year).toBe(2718);
		expect(kd.month).toBe(1);
		expect(kd.day).toBe(21);
		expect(kd.era).toBe(KurdishEra.SOLAR_PERSIAN_OFFSET);

		expect(kd.toGregorian()).toEqual([2018, 4, 10]);
		expect(kd.toPersian()).toEqual([1397, 1, 21]);
		expect(kd.toIslamic()).toEqual([1439, 7, 24]);
	});

	test("Kurdish formatting", () => {
		const kd = new KurdishDate(2726, 1, 25);
		// Should match standard formatting %A, %d %B %Y
		// 2726-01-25 translates to Gregorian 2026-04-14 (Tuesday)
		// Tuesday -> English
		expect(kd.strftime("%Y-%m-%d", { locale: "en" })).toBe("2726-01-25");
		expect(kd.strftime("%B", { locale: "kmr" })).toBe("Nîsan");
		expect(kd.strftime("%B", { locale: "ckb" })).toBe("خاکه‌لێوه");
		// Native digits CKB
		expect(kd.strftime("%Y", { locale: "ckb", useLocaleDigits: true })).toBe(
			"٢٧٢٦",
		);
	});
});
