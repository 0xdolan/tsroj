import type {
	FormatCalendarOptions,
	FormatLabelOverrides,
} from "./format-options";
import { mergeFormatOverrides } from "./format-options";
import { resolveMonthName, resolveVariantLabel } from "./normalize";
import type { LocaleData } from "./types";

export type ResolvedCalendarLabels = {
	month: string;
	monthShort: string;
	weekday: string;
	weekdayShort: string;
	weekdayMin: string;
};

export function resolveCalendarLabels(
	locData: LocaleData,
	monthIndex: number,
	weekdayIndex: number,
	options?: FormatCalendarOptions,
): ResolvedCalendarLabels {
	const overrides = mergeFormatOverrides(options);
	const monthVariant = options?.monthVariant ?? options?.kurdishVariant;
	const weekdayVariant = options?.weekdayVariant;

	return {
		month:
			overrides.month ??
			resolveMonthName(locData.months, monthIndex, monthVariant),
		monthShort:
			overrides.monthShort ??
			resolveVariantLabel(locData.months, monthIndex, "short", monthVariant),
		weekday:
			overrides.weekday ??
			resolveVariantLabel(
				locData.weekdays,
				weekdayIndex,
				"names",
				weekdayVariant,
			),
		weekdayShort:
			overrides.weekdayShort ??
			resolveVariantLabel(
				locData.weekdays,
				weekdayIndex,
				"short",
				weekdayVariant,
			),
		weekdayMin:
			overrides.weekdayMin ??
			resolveVariantLabel(
				locData.weekdays,
				weekdayIndex,
				"min",
				weekdayVariant,
			),
	};
}

export function resolveDigits(
	localeDigits: string[],
	overrides: FormatLabelOverrides,
): string[] {
	if (overrides.digits) {
		if (overrides.digits.length !== 10) {
			throw new Error("digits override must contain exactly 10 characters");
		}
		return overrides.digits;
	}
	return localeDigits;
}
