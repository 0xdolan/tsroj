import { getBundle, mergeCanonicalMonths, solarWeekdayBlock } from "./bundles";
import type { FormatCalendarOptions } from "./format-options";
import { CALENDAR_CANONICAL_OWNER, CalendarKind, LocaleId } from "./registry";
import type { LocaleData } from "./types";

export type {
	FormatCalendarOptions,
	FormatLabelOverrides,
} from "./format-options";
export {
	mergeFormatOverrides,
	resolveEzafeAfterDay,
	resolveEzafeOnMonth,
	resolveLeadingZero,
} from "./format-options";
export {
	alignVariantList,
	resolveMonthName,
	resolveVariantIndex,
	resolveVariantLabel,
} from "./normalize";
export {
	CALENDAR_CANONICAL_OWNER,
	CalendarKind,
	LocaleId,
	resolveLocaleId,
} from "./registry";
export { resolveCalendarLabels, resolveDigits } from "./resolve-labels";
export type {
	CalendarBlock,
	LocaleBundle,
	LocaleData,
	MonthNames,
	VariantEntry,
	VariantField,
} from "./types";

export function getLocaleData(
	localeId: LocaleId,
	calendar: CalendarKind,
): LocaleData {
	const owner = CALENDAR_CANONICAL_OWNER[calendar];

	if (owner) {
		const canonical = getBundle(owner)?.calendar[calendar];
		if (canonical) {
			return mergeCanonicalMonths(canonical, solarWeekdayBlock(localeId));
		}
	}

	const local = getBundle(localeId)?.calendar[calendar];
	if (local) {
		return local;
	}

	if (calendar === CalendarKind.KURDISH) {
		const fallback =
			getBundle(LocaleId.KMR)?.calendar[CalendarKind.KURDISH] ??
			getBundle(LocaleId.CKB)?.calendar[CalendarKind.KURDISH];
		if (fallback) return fallback;
	}

	return (
		getBundle(LocaleId.EN)?.calendar[CalendarKind.GREGORIAN] ??
		(() => {
			throw new Error("locale bundle en/gregorian is missing");
		})()
	);
}

export function getAmPm(
	localeId: LocaleId,
	overrides?: FormatCalendarOptions,
): [string, string] {
	const merged = overrides?.overrides?.amPm ?? overrides?.amPm;
	if (merged) return merged;
	const bundle = getBundle(localeId) ?? getBundle(LocaleId.EN);
	return bundle?.am_pm ?? ["am", "pm"];
}

export function getDigits(
	localeId: LocaleId,
	overrides?: FormatCalendarOptions,
): string[] {
	const merged = overrides?.overrides?.digits ?? overrides?.digits;
	if (merged) return merged;
	const bundle = getBundle(localeId) ?? getBundle(LocaleId.EN);
	return bundle?.digits ?? ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
}
