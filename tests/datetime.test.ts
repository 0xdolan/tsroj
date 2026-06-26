import { describe, expect, test } from "vitest";
import { KurdishDateTime } from "../src/kurdish";

describe("KurdishDateTime API", () => {
	test("Instantiates and maps time correctly", () => {
		const kdt = new KurdishDateTime(2726, 1, 4, 15, 30, 0, 0);
		expect(kdt.year).toBe(2726);
		expect(kdt.hour).toBe(15);
		expect(kdt.minute).toBe(30);

		const jsDate = kdt.toJSDate();
		// 2726-01-04 maps to Gregorian 2026-03-24
		expect(jsDate.getFullYear()).toBe(2026);
		expect(jsDate.getMonth()).toBe(2); // 0-based month, so 2 = March
		expect(jsDate.getDate()).toBe(24);
		expect(jsDate.getHours()).toBe(15);
		expect(jsDate.getMinutes()).toBe(30);
	});

	test("fromJSDate constructs natively matching hours", () => {
		const d = new Date(2026, 2, 24, 15, 30, 45, 120);
		const kdt = KurdishDateTime.fromJSDate(d);

		expect(kdt.year).toBe(2726);
		expect(kdt.month).toBe(1);
		expect(kdt.day).toBe(4);
		expect(kdt.hour).toBe(15);
		expect(kdt.minute).toBe(30);
		expect(kdt.second).toBe(45);
		expect(kdt.millisecond).toBe(120);
	});

	test("Time formatting AM/PM", () => {
		const kdtMorning = new KurdishDateTime(2726, 1, 4, 9, 15, 0);
		const kdtAfternoon = new KurdishDateTime(2726, 1, 4, 18, 45, 0);

		// English (leading zero on by default)
		expect(kdtMorning.strftime("%H:%M %p", { locale: "en" })).toBe("09:15 AM");
		expect(kdtAfternoon.strftime("%H:%M %p", { locale: "en" })).toBe(
			"18:45 PM",
		);
		expect(kdtAfternoon.strftime("%I:%M %p", { locale: "en" })).toBe(
			"06:45 PM",
		);

		// Kurdish (ckb): no leading zero by default
		expect(kdtMorning.strftime("%H:%M %p", { locale: "ckb" })).toBe("9:15 پ.ن");
		expect(kdtAfternoon.strftime("%I:%M %p", { locale: "ckb" })).toBe(
			"6:45 د.ن",
		);
		expect(
			kdtMorning.strftime("%H:%M %p", { locale: "ckb", leadingZero: true }),
		).toBe("09:15 پ.ن");
	});

	test("Time formatting uses locale digits when requested", () => {
		const kdt = new KurdishDateTime(2726, 1, 4, 9, 5, 8);

		expect(
			kdt.strftime("%I:%M:%S", {
				locale: "ckb",
				useLocaleDigits: true,
				leadingZero: true,
			}),
		).toBe("٠٩:٠٥:٠٨");

		expect(
			kdt.strftime("%I:%M:%S", {
				locale: "ckb",
				useLocaleDigits: true,
				leadingZero: false,
			}),
		).toBe("٩:٥:٨");

		expect(
			kdt.strftime("%I:%M:%S", {
				locale: "fa",
				useLocaleDigits: true,
				leadingZero: true,
			}),
		).toBe("۰۹:۰۵:۰۸");

		expect(
			kdt.strftime("%I:%M:%S", { locale: "en", useLocaleDigits: false }),
		).toBe("09:05:08");
	});

	test("Serialization and Deserialization", () => {
		const kdt = new KurdishDateTime(2726, 1, 12, 9, 20, 30, 400);
		const str = kdt.toString();
		const jsonStr = JSON.stringify({ date: kdt });

		// toString and toJSON
		expect(str).toBe("2726-01-12T09:20:30.400");
		expect(jsonStr).toBe('{"date":"2726-01-12T09:20:30.400"}');

		// fromString structural parity
		const parsed = KurdishDateTime.fromString("2726-01-12T09:20:30.400Z");
		expect(parsed.year).toBe(2726);
		expect(parsed.month).toBe(1);
		expect(parsed.day).toBe(12);
		expect(parsed.hour).toBe(9);
		expect(parsed.minute).toBe(20);
		expect(parsed.second).toBe(30);
		expect(parsed.millisecond).toBe(400);

		// Errors correctly intentionally
		expect(() => KurdishDateTime.fromString("malformed")).toThrowError(
			"Invalid datetime format, expected YYYY-MM-DDTHH:mm:ss",
		);
	});
});
