import type { FormatCalendarOptions } from "@0xdolan/tsroj";

export type ClockMode = "live" | "custom";

export interface DemoState {
	mode: ClockMode;
	timezone: string;
	locale: string;
	displayCalendar: string;
	formatPattern: string;
	useLocaleDigits: boolean;
	monthVariant: string;
	weekdayVariant: string;
	kurdishYear: number;
	kurdishMonth: number;
	kurdishDay: number;
	hour: number;
	minute: number;
	second: number;
	overrideMonth: string;
	overrideMonthShort: string;
	overrideWeekday: string;
	overrideWeekdayShort: string;
	overrideWeekdayMin: string;
	overrideDigits: string;
	showAdvanced: boolean;
	ezafeAfterDay: boolean;
	ezafeOnMonth: boolean;
	leadingZero: boolean;
}

export const DEFAULT_STATE: DemoState = {
	mode: "live",
	timezone: "Asia/Baghdad",
	locale: "ckb",
	displayCalendar: "kurdish",
	formatPattern: "%A, %d %B %Y",
	useLocaleDigits: true,
	monthVariant: "",
	weekdayVariant: "",
	kurdishYear: 2726,
	kurdishMonth: 4,
	kurdishDay: 5,
	hour: 12,
	minute: 0,
	second: 0,
	overrideMonth: "",
	overrideMonthShort: "",
	overrideWeekday: "",
	overrideWeekdayShort: "",
	overrideWeekdayMin: "",
	overrideDigits: "",
	showAdvanced: false,
	ezafeAfterDay: true,
	ezafeOnMonth: true,
	leadingZero: false,
};

export const FORMAT_PRESETS: Array<{ label: string; value: string }> = [
	{ label: "Full date", value: "%A, %d %B %Y" },
	{ label: "Compact", value: "%a %b %-d, %Y" },
	{ label: "ISO Kurdish", value: "%Y-%m-%d" },
	{ label: "Time + date", value: "%I:%M:%S %p — %A, %d %B" },
	{ label: "Weekday min", value: "%E %d %b %Y" },
];

export function buildFormatOptions(state: DemoState): FormatCalendarOptions {
	const options: FormatCalendarOptions = {
		locale: state.locale,
		calendar: state.displayCalendar as FormatCalendarOptions["calendar"],
		useLocaleDigits: state.useLocaleDigits,
	};

	if (state.locale === "ckb") {
		options.ezafeAfterDay = state.ezafeAfterDay;
		options.ezafeOnMonth = state.ezafeOnMonth;
	}

	if (state.locale === "ckb" || state.locale === "fa" || state.locale === "ar") {
		options.leadingZero = state.leadingZero;
	}

	if (state.monthVariant !== "") {
		const asNum = Number(state.monthVariant);
		options.monthVariant = Number.isNaN(asNum)
			? state.monthVariant
			: asNum;
	}
	if (state.weekdayVariant !== "") {
		const asNum = Number(state.weekdayVariant);
		options.weekdayVariant = Number.isNaN(asNum)
			? state.weekdayVariant
			: asNum;
	}

	const overrides: FormatCalendarOptions = {};
	if (state.overrideMonth) overrides.month = state.overrideMonth;
	if (state.overrideMonthShort) overrides.monthShort = state.overrideMonthShort;
	if (state.overrideWeekday) overrides.weekday = state.overrideWeekday;
	if (state.overrideWeekdayShort)
		overrides.weekdayShort = state.overrideWeekdayShort;
	if (state.overrideWeekdayMin) overrides.weekdayMin = state.overrideWeekdayMin;
	if (state.overrideDigits.trim()) {
		overrides.digits = state.overrideDigits.trim().split("");
	}

	if (Object.keys(overrides).length > 0) {
		options.overrides = overrides;
		for (const [k, v] of Object.entries(overrides)) {
			(options as Record<string, unknown>)[k] = v;
		}
	}

	return options;
}

export function formatTimezoneDisplay(timezone: string): string {
	if (timezone === "local") return "Local";
	return timezone.replace(/_/g, " ");
}

export function getShiftedDate(timeZone: string): Date {
	if (timeZone === "local") return new Date();

	const formatter = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "numeric",
		day: "numeric",
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hour12: false,
	});

	const parts = formatter.formatToParts(new Date());
	const map: Record<string, number> = {};
	for (const part of parts) {
		if (part.type !== "literal") map[part.type] = Number.parseInt(part.value, 10);
	}

	return new Date(
		map.year,
		map.month - 1,
		map.day,
		map.hour === 24 ? 0 : map.hour,
		map.minute,
		map.second,
		0,
	);
}
