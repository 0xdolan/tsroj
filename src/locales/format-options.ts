import { type CalendarKind, LocaleId } from "./registry";

/** Manual label overrides — highest priority over locale bundles. */
export type FormatLabelOverrides = {
	month?: string;
	monthShort?: string;
	weekday?: string;
	weekdayShort?: string;
	weekdayMin?: string;
	/** Ten digit characters (index 0 = digit zero). */
	digits?: string[];
	amPm?: [string, string];
};

export type FormatCalendarOptions = FormatLabelOverrides & {
	calendar?: CalendarKind;
	locale?: LocaleId | string;
	/** Variant index or exact name for the active month. */
	monthVariant?: string | number;
	/** Variant index or exact name for the active weekday. */
	weekdayVariant?: string | number;
	/** @deprecated Use `monthVariant` instead. */
	kurdishVariant?: string | number;
	useLocaleDigits?: boolean;
	/**
	 * Pad day/month numeric tokens (%d, %m) with a leading zero.
	 * Default `false` for ckb, fa, ar; `true` for other locales.
	 */
	leadingZero?: boolean;
	/**
	 * Sorani (ckb): append ezafe «ی» after the day when a month name (%B/%b) is in the pattern.
	 * Default `true` for ckb only.
	 */
	ezafeAfterDay?: boolean;
	/**
	 * Sorani (ckb): append ezafe «ی» to the month name when day, month name, and year are in the pattern.
	 * Default `true` for ckb only.
	 */
	ezafeOnMonth?: boolean;
	/** Nested overrides (merged with top-level override fields). */
	overrides?: FormatLabelOverrides;
};

const RTL_NUMERIC_LOCALES = new Set<LocaleId>([
	LocaleId.CKB,
	LocaleId.FA,
	LocaleId.AR,
]);

export function resolveLeadingZero(
	localeId: LocaleId,
	explicit?: boolean,
): boolean {
	if (explicit !== undefined) return explicit;
	return !RTL_NUMERIC_LOCALES.has(localeId);
}

export function resolveEzafeAfterDay(
	localeId: LocaleId,
	explicit?: boolean,
): boolean {
	if (localeId !== LocaleId.CKB) return false;
	if (explicit !== undefined) return explicit;
	return true;
}

export function resolveEzafeOnMonth(
	localeId: LocaleId,
	explicit?: boolean,
): boolean {
	if (localeId !== LocaleId.CKB) return false;
	if (explicit !== undefined) return explicit;
	return true;
}

export function mergeFormatOverrides(
	options?: FormatCalendarOptions,
): FormatLabelOverrides {
	if (!options) return {};
	const { overrides, ...top } = options;
	return {
		...overrides,
		...(top.month !== undefined ? { month: top.month } : {}),
		...(top.monthShort !== undefined ? { monthShort: top.monthShort } : {}),
		...(top.weekday !== undefined ? { weekday: top.weekday } : {}),
		...(top.weekdayShort !== undefined
			? { weekdayShort: top.weekdayShort }
			: {}),
		...(top.weekdayMin !== undefined ? { weekdayMin: top.weekdayMin } : {}),
		...(top.digits !== undefined ? { digits: top.digits } : {}),
		...(top.amPm !== undefined ? { amPm: top.amPm } : {}),
	};
}
