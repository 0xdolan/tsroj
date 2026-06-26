import { TsrojValueError } from "./exceptions";
import type { KurdishDate } from "./kurdish";
import {
	CalendarKind,
	type FormatCalendarOptions,
	getDigits,
	getLocaleData,
	LocaleId,
	resolveCalendarLabels,
	resolveDigits,
	resolveEzafeAfterDay,
	resolveEzafeOnMonth,
	resolveLeadingZero,
	resolveLocaleId,
} from "./locales";
import { mergeFormatOverrides } from "./locales/format-options";

const FORMAT_TOKENS = [
	"%Y",
	"%B",
	"%b",
	"%m",
	"%y",
	"%d",
	"%A",
	"%a",
	"%E",
	"%w",
	"%-w",
	"%-m",
	"%-d",
];

const DAY_TOKENS = new Set(["%d", "%-d"]);
const MONTH_NAME_TOKENS = new Set(["%B", "%b"]);
const YEAR_TOKENS = new Set(["%Y", "%y"]);

const MAX_PATTERN_LEN = 512;
const SUSPICIOUS_REGEX = /[{}]/;
const EZAFE = "ی";

export function toLocaleDigits(
	numericStr: string,
	digitsMap: string[],
): string {
	return numericStr
		.split("")
		.map((ch) => {
			const code = ch.charCodeAt(0);
			if (code >= 48 && code <= 57) {
				return digitsMap[code - 48];
			}
			return ch;
		})
		.join("");
}

function tokenizeList(
	pattern: string,
): Array<{ type: "t" | "l"; val: string }> {
	const parts: Array<{ type: "t" | "l"; val: string }> = [];
	let i = 0;
	while (i < pattern.length) {
		let matched = false;
		for (const tok of FORMAT_TOKENS) {
			if (pattern.startsWith(tok, i)) {
				parts.push({ type: "t", val: tok });
				i += tok.length;
				matched = true;
				break;
			}
		}
		if (!matched) {
			parts.push({ type: "l", val: pattern[i] });
			i++;
		}
	}
	return parts;
}

function analyzePattern(parts: Array<{ type: "t" | "l"; val: string }>): {
	hasDay: boolean;
	hasMonthName: boolean;
	hasYear: boolean;
} {
	let hasDay = false;
	let hasMonthName = false;
	let hasYear = false;
	for (const seg of parts) {
		if (seg.type !== "t") continue;
		if (DAY_TOKENS.has(seg.val)) hasDay = true;
		if (MONTH_NAME_TOKENS.has(seg.val)) hasMonthName = true;
		if (YEAR_TOKENS.has(seg.val)) hasYear = true;
	}
	return { hasDay, hasMonthName, hasYear };
}

function formatDay(
	d: number,
	tok: string,
	padNumeric: boolean,
	ezafeAfterDay: boolean,
): string {
	let out =
		tok === "%-d"
			? String(d)
			: padNumeric
				? String(d).padStart(2, "0")
				: String(d);
	if (ezafeAfterDay) out += EZAFE;
	return out;
}

function formatMonthNum(m: number, tok: string, padNumeric: boolean): string {
	if (tok === "%-m") return String(m);
	return padNumeric ? String(m).padStart(2, "0") : String(m);
}

function formatMonthName(label: string, ezafeOnMonth: boolean): string {
	return ezafeOnMonth ? label + EZAFE : label;
}

export type { FormatCalendarOptions, FormatLabelOverrides } from "./locales";

export function formatCalendarDate(
	kd: KurdishDate,
	pattern: string,
	options?: FormatCalendarOptions,
): string {
	if (typeof pattern !== "string") {
		throw new TsrojValueError("pattern must be string");
	}
	if (pattern.length > MAX_PATTERN_LEN) {
		throw new TsrojValueError(`pattern exceeds max length ${MAX_PATTERN_LEN}`);
	}
	if (SUSPICIOUS_REGEX.test(pattern)) {
		throw new TsrojValueError(
			"pattern must not contain '{' or '}'; use fixed % tokens only",
		);
	}

	const calendar = options?.calendar || CalendarKind.KURDISH;
	const localeStr = options?.locale || LocaleId.EN;
	const localeId = resolveLocaleId(localeStr);
	const useLocaleDigits = options?.useLocaleDigits || false;
	const labelOverrides = mergeFormatOverrides(options);
	const padNumeric = resolveLeadingZero(localeId, options?.leadingZero);

	const locData = getLocaleData(localeId, calendar);

	let y: number;
	let m: number;
	let d: number;
	let wi: number;

	if (calendar === CalendarKind.KURDISH) {
		y = kd.year;
		m = kd.month;
		d = kd.day;
		wi = kd.weekdayPersian() - 1;
	} else if (calendar === CalendarKind.PERSIAN) {
		const p = kd.toPersian();
		y = p[0];
		m = p[1];
		d = p[2];
		wi = kd.weekdayPersian() - 1;
	} else if (calendar === CalendarKind.ISLAMIC) {
		const i = kd.toIslamic();
		y = i[0];
		m = i[1];
		d = i[2];
		wi = kd.weekdayPersian() - 1;
	} else {
		const p = kd.toGregorian();
		y = p[0];
		m = p[1];
		d = p[2];
		wi = kd.weekdayGregorian();
	}

	const labels = resolveCalendarLabels(locData, m - 1, wi, options);

	let digitsMap: string[];
	try {
		digitsMap = resolveDigits(getDigits(localeId), labelOverrides);
	} catch (err) {
		throw new TsrojValueError(
			err instanceof Error ? err.message : "invalid digits override",
		);
	}

	const parts = tokenizeList(pattern);
	const patternCtx = analyzePattern(parts);

	const applyEzafeAfterDay =
		resolveEzafeAfterDay(localeId, options?.ezafeAfterDay) &&
		patternCtx.hasDay &&
		patternCtx.hasMonthName;

	const applyEzafeOnMonth =
		resolveEzafeOnMonth(localeId, options?.ezafeOnMonth) &&
		patternCtx.hasDay &&
		patternCtx.hasMonthName &&
		patternCtx.hasYear;

	let out = "";

	for (const seg of parts) {
		if (seg.type === "l") {
			out += seg.val;
		} else {
			const tok = seg.val;
			if (tok === "%Y") {
				out += String(y).padStart(4, "0");
			} else if (tok === "%y") {
				out += String(y % 100).padStart(2, "0");
			} else if (tok === "%B") {
				out += formatMonthName(labels.month, applyEzafeOnMonth);
			} else if (tok === "%b") {
				out += formatMonthName(labels.monthShort, applyEzafeOnMonth);
			} else if (tok === "%m" || tok === "%-m") {
				out += formatMonthNum(m, tok, padNumeric);
			} else if (tok === "%d" || tok === "%-d") {
				out += formatDay(d, tok, padNumeric, applyEzafeAfterDay);
			} else if (tok === "%A") {
				out += labels.weekday;
			} else if (tok === "%a") {
				out += labels.weekdayShort;
			} else if (tok === "%E") {
				out += labels.weekdayMin;
			} else if (tok === "%w") {
				out += String(wi + 1);
			} else if (tok === "%-w") {
				out += String(kd.weekdayPersian());
			}
		}
	}

	if (useLocaleDigits) {
		return toLocaleDigits(out, digitsMap);
	}
	return out;
}
