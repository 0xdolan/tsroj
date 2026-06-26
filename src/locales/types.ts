import type { CalendarKind } from "./registry";

/**
 * i18n-style variant group: parallel `names`, `short`, and optional `min`
 * arrays share the same variant index (0 = default).
 */
export type VariantEntry = {
	names: string[];
	short?: string[];
	min?: string[];
};

export type CalendarBlock = {
	months: VariantEntry[];
	weekdays: VariantEntry[];
};

/** Runtime shape consumed by formatting (normalized from JSON). */
export type LocaleData = CalendarBlock;

export type LocaleBundle = {
	meta: {
		locale: string;
		script: string;
		name: string;
	};
	digits: string[];
	am_pm: [string, string];
	calendar: Partial<Record<CalendarKind, CalendarBlock>>;
};

/** @deprecated Use VariantEntry[] — kept for transitional typing. */
export type MonthNames = string[][];

export type VariantField = "names" | "short" | "min";
