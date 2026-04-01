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

		// English
		expect(kdtMorning.strftime("%H:%M %p", { locale: "en" })).toBe("09:15 AM");
		expect(kdtAfternoon.strftime("%H:%M %p", { locale: "en" })).toBe(
			"18:45 PM",
		);
		// Using 12-hour %I
		expect(kdtAfternoon.strftime("%I:%M %p", { locale: "en" })).toBe(
			"06:45 PM",
		);

		// Kurdish (CKB/KMR etc mapped internally)
		expect(kdtMorning.strftime("%H:%M %p", { locale: "ckb" })).toBe(
			"09:15 پ.ن",
		);
		expect(kdtAfternoon.strftime("%I:%M %p", { locale: "ckb" })).toBe(
			"06:45 د.ن",
		);
	});
});
