import { KurdishDate, KurdishDateTime } from "@0xdolan/tsroj";
import { buildFormatOptions, type DemoState } from "./state";

export type ExampleCategory =
	| "locale"
	| "calendar"
	| "variant"
	| "format"
	| "override";

export interface ExampleDefinition {
	id: string;
	category: ExampleCategory;
	title: string;
	description: string;
	/** Partial state applied when user clicks “Try”. */
	apply: Partial<DemoState>;
	pattern: string;
	/** Fixed Kurdish date for reproducible output (custom mode). */
	sample: {
		year: number;
		month: number;
		day: number;
		hour: number;
		minute: number;
		second: number;
	};
}

export const EXAMPLE_DEFAULTS: DemoState = {
	mode: "custom",
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
	hour: 9,
	minute: 30,
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

export const DEMO_EXAMPLES: ExampleDefinition[] = [
	{
		id: "ckb-kurdish",
		category: "locale",
		title: "Sorani · Kurdish solar",
		description: "Central Kurdish (ckb) month names such as پووشپەڕ.",
		apply: { locale: "ckb", displayCalendar: "kurdish", useLocaleDigits: true },
		pattern: "%A, %d %B %Y",
		sample: { year: 2726, month: 4, day: 5, hour: 9, minute: 30, second: 0 },
	},
	{
		id: "kmr-kurdish",
		category: "locale",
		title: "Kurmanji · Kurdish solar",
		description: "Northern Kurdish (kmr) Latin script labels.",
		apply: { locale: "kmr", displayCalendar: "kurdish", useLocaleDigits: false },
		pattern: "%A, %d %B %Y",
		sample: { year: 2726, month: 1, day: 25, hour: 9, minute: 30, second: 0 },
	},
	{
		id: "en-kurdish",
		category: "locale",
		title: "English · Kurdish solar",
		description: "English locale with Latin transliterations.",
		apply: { locale: "en", displayCalendar: "kurdish", useLocaleDigits: false },
		pattern: "%A, %d %B %Y",
		sample: { year: 2726, month: 4, day: 5, hour: 9, minute: 30, second: 0 },
	},
	{
		id: "fa-persian",
		category: "calendar",
		title: "Persian (Jalali)",
		description: "Canonical Persian month names from the fa bundle.",
		apply: { locale: "fa", displayCalendar: "persian", useLocaleDigits: true },
		pattern: "%A, %d %B %Y",
		sample: { year: 2726, month: 4, day: 5, hour: 9, minute: 30, second: 0 },
	},
	{
		id: "ar-islamic",
		category: "calendar",
		title: "Arabic · Hijri",
		description: "Canonical Arabic Islamic months from the ar bundle.",
		apply: { locale: "ar", displayCalendar: "islamic", useLocaleDigits: true },
		pattern: "%A, %d %B %Y",
		sample: { year: 2726, month: 4, day: 5, hour: 9, minute: 30, second: 0 },
	},
	{
		id: "ckb-gregorian",
		category: "calendar",
		title: "Sorani · Gregorian",
		description: "Gregorian calendar labels in Sorani script.",
		apply: { locale: "ckb", displayCalendar: "gregorian", useLocaleDigits: true },
		pattern: "%A, %d %B %Y",
		sample: { year: 2726, month: 4, day: 5, hour: 9, minute: 30, second: 0 },
	},
	{
		id: "tr-gregorian",
		category: "locale",
		title: "Turkish · Gregorian",
		description: "Turkish locale for Gregorian formatting.",
		apply: { locale: "tr", displayCalendar: "gregorian", useLocaleDigits: false },
		pattern: "%A, %d %B %Y",
		sample: { year: 2726, month: 4, day: 5, hour: 9, minute: 30, second: 0 },
	},
	{
		id: "month-variant-index",
		category: "variant",
		title: "Month variant (index)",
		description: "Alternate Sorani month name via monthVariant: 1.",
		apply: {
			locale: "ckb",
			displayCalendar: "kurdish",
			monthVariant: "1",
			useLocaleDigits: true,
		},
		pattern: "%B (%b)",
		sample: { year: 2726, month: 1, day: 25, hour: 9, minute: 30, second: 0 },
	},
	{
		id: "month-variant-name",
		category: "variant",
		title: "Month variant (name)",
		description: "Select variant by exact Kurdish month name string.",
		apply: {
			locale: "kmr",
			displayCalendar: "kurdish",
			monthVariant: "Nîsan",
			useLocaleDigits: false,
		},
		pattern: "%B — %b",
		sample: { year: 2726, month: 1, day: 25, hour: 9, minute: 30, second: 0 },
	},
	{
		id: "weekday-variant",
		category: "variant",
		title: "Weekday variant + min",
		description: "Weekday alternate forms with %A %a %E tokens.",
		apply: {
			locale: "kmr",
			displayCalendar: "kurdish",
			weekdayVariant: "1",
			useLocaleDigits: false,
		},
		pattern: "%A · %a · %E",
		sample: { year: 2726, month: 1, day: 25, hour: 9, minute: 30, second: 0 },
	},
	{
		id: "locale-digits",
		category: "format",
		title: "Locale digits",
		description: "Arabic-Indic digits for Sorani output.",
		apply: { locale: "ckb", displayCalendar: "kurdish", useLocaleDigits: true },
		pattern: "%Y-%m-%d %I:%M %p",
		sample: { year: 2726, month: 4, day: 5, hour: 14, minute: 5, second: 0 },
	},
	{
		id: "compact-pattern",
		category: "format",
		title: "Compact pattern",
		description: "Short weekday and month tokens.",
		apply: { locale: "ckb", displayCalendar: "kurdish", useLocaleDigits: true },
		pattern: "%a %b %-d, %Y",
		sample: { year: 2726, month: 4, day: 5, hour: 9, minute: 30, second: 0 },
	},
	{
		id: "manual-override",
		category: "override",
		title: "Manual label overrides",
		description: "User-provided month and weekday labels take priority.",
		apply: {
			locale: "ckb",
			displayCalendar: "kurdish",
			overrideMonth: "ManualMonth",
			overrideWeekday: "ManualDay",
			useLocaleDigits: false,
		},
		pattern: "%A, %d %B",
		sample: { year: 2726, month: 4, day: 5, hour: 9, minute: 30, second: 0 },
	},
];

export function exampleState(
	ex: ExampleDefinition,
	overrides?: Partial<DemoState>,
): DemoState {
	return {
		...EXAMPLE_DEFAULTS,
		...ex.apply,
		...ex.sample,
		mode: "custom",
		formatPattern: ex.pattern,
		kurdishYear: ex.sample.year,
		kurdishMonth: ex.sample.month,
		kurdishDay: ex.sample.day,
		hour: ex.sample.hour,
		minute: ex.sample.minute,
		second: ex.sample.second,
		...overrides,
	};
}

export function runExample(
	ex: ExampleDefinition,
	overrides?: Partial<DemoState>,
): string {
	const st = exampleState(ex, overrides);
	const kdt = new KurdishDateTime(
		st.kurdishYear,
		st.kurdishMonth,
		st.kurdishDay,
		st.hour,
		st.minute,
		st.second,
	);
	return kdt.strftime(st.formatPattern, buildFormatOptions(st));
}

export function exampleCode(
	ex: ExampleDefinition,
	overrides?: Partial<DemoState>,
): string {
	const st = exampleState(ex, overrides);
	const optsLines: string[] = [`  locale: "${st.locale}"`];
	if (st.displayCalendar !== "kurdish") {
		optsLines.push(`  calendar: "${st.displayCalendar}"`);
	}
	if (st.useLocaleDigits) optsLines.push("  useLocaleDigits: true");
	if (st.locale === "ckb" && !st.ezafeAfterDay) optsLines.push("  ezafeAfterDay: false");
	if (st.locale === "ckb" && !st.ezafeOnMonth) optsLines.push("  ezafeOnMonth: false");
	if (
		(st.locale === "ckb" || st.locale === "fa" || st.locale === "ar") &&
		st.leadingZero
	) {
		optsLines.push("  leadingZero: true");
	}
	if (st.monthVariant) optsLines.push(`  monthVariant: ${JSON.stringify(st.monthVariant)}`);
	if (st.weekdayVariant)
		optsLines.push(`  weekdayVariant: ${JSON.stringify(st.weekdayVariant)}`);
	if (st.overrideMonth) optsLines.push(`  month: ${JSON.stringify(st.overrideMonth)}`);
	if (st.overrideWeekday)
		optsLines.push(`  weekday: ${JSON.stringify(st.overrideWeekday)}`);

	const optsBlock =
		optsLines.length === 1
			? `{ locale: "${st.locale}" }`
			: `{\n${optsLines.join(",\n")},\n}`;

	return `const kd = new KurdishDate(${st.kurdishYear}, ${st.kurdishMonth}, ${st.kurdishDay});
kd.strftime("${st.formatPattern}", ${optsBlock});`;
}

/** Quick sanity check used in docs — پووشپەڕ month 4 */
export function soraniMonth4Label(): string {
	return new KurdishDate(2726, 4, 5).strftime("%B", { locale: "ckb" });
}
