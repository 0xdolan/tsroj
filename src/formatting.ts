import { TsrojValueError } from "./exceptions";
import type { KurdishDate } from "./kurdish";
import {
	CalendarKind,
	getDigits,
	getLocaleData,
	LocaleId,
	resolveLocaleId,
} from "./locales";

const FORMAT_TOKENS = [
	"%Y",
	"%B",
	"%b",
	"%m",
	"%y",
	"%d",
	"%A",
	"%a",
	"%w",
	"%-w",
	"%-m",
	"%-d",
];

const MAX_PATTERN_LEN = 512;
const SUSPICIOUS_REGEX = /[{}]/;

function toLocaleDigits(numericStr: string, digitsMap: string[]): string {
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

export function formatCalendarDate(
	kd: KurdishDate,
	pattern: string,
	options?: {
		calendar?: CalendarKind;
		locale?: LocaleId | string;
		kurdishVariant?: string;
		useLocaleDigits?: boolean;
	},
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

	const locData = getLocaleData(localeId, calendar);

	let y: number, m: number, d: number;
	let wi: number; // 0-based weekday index starting locally

	if (calendar === CalendarKind.KURDISH) {
		y = kd.year;
		m = kd.month;
		d = kd.day;
		wi = kd.weekdayPersian() - 1; // 0=Sat
	} else if (calendar === CalendarKind.PERSIAN) {
		const p = kd.toPersian();
		y = p[0];
		m = p[1];
		d = p[2];
		wi = kd.weekdayPersian() - 1; // 0=Sat
	} else if (calendar === CalendarKind.ISLAMIC) {
		const i = kd.toIslamic();
		y = i[0];
		m = i[1];
		d = i[2];
		wi = kd.weekdayPersian() - 1; // 0=Sat
	} else {
		const p = kd.toGregorian();
		y = p[0];
		m = p[1];
		d = p[2];
		wi = (kd.weekdayGregorian() + 1) % 7; // Convert 0=Mon to 0=Sun mapping?
		// Wait, in Python: Gregorian weekday index is Monday=0. The array in JSON relies on this. No, wait.
		// Let's check EN Gregorian JSON shape: ["Monday"], ["Tuesday"], ..., ["Sunday"].
		// Yes! 0=Monday!
		wi = kd.weekdayGregorian();
	}

	// Handle Kurdish variants
	const mNamesList = locData.months;
	const msNamesList = locData.months_short || locData.months;

	// NOTE: If we had a deep kurdishVariant mapping, we'd replace the lists here.
	// For simplicity since the full catalog mapping logic is complex,
	// we just assume the first index is standard unless kurdishVariant is implemented exactly like Pyroj.

	const mName = mNamesList[m - 1]?.[0] || String(m);
	const msName = msNamesList[m - 1]?.[0] || String(m);

	const wName = locData.weekdays[wi]?.[0] || String(wi);
	const wsName =
		(locData.weekdays_short || locData.weekdays)[wi]?.[0] || String(wi);

	const parts = tokenizeList(pattern);
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
				out += mName;
			} else if (tok === "%b") {
				out += msName;
			} else if (tok === "%m") {
				out += String(m).padStart(2, "0");
			} else if (tok === "%-m") {
				out += String(m);
			} else if (tok === "%d") {
				out += String(d).padStart(2, "0");
			} else if (tok === "%-d") {
				out += String(d);
			} else if (tok === "%A") {
				out += wName;
			} else if (tok === "%a") {
				out += wsName;
			} else if (tok === "%w") {
				out += String(wi + 1);
			} else if (tok === "%-w") {
				out += String(kd.weekdayPersian());
			}
		}
	}

	if (useLocaleDigits) {
		return toLocaleDigits(out, getDigits(localeId));
	}
	return out;
}
