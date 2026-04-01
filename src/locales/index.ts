import rawCatalog from "./catalog.json";

export enum LocaleId {
	CKB = "ckb",
	KMR = "kmr",
	KU = "ku",
	EN = "en",
	FA = "fa",
	AR = "ar",
	TR = "tr",
}

export enum CalendarKind {
	KURDISH = "kurdish",
	GREGORIAN = "gregorian",
	PERSIAN = "persian",
	ISLAMIC = "islamic",
}

export function resolveLocaleId(lang: string | LocaleId): LocaleId {
	const norm = lang.toLowerCase().replace("_", "-");
	if (norm === "en") return LocaleId.EN;
	if (norm === "fa") return LocaleId.FA;
	if (norm === "ar") return LocaleId.AR;
	if (norm === "tr") return LocaleId.TR;
	if (norm === "kmr" || ["zza", "diq", "kiu", "ku-latn"].includes(norm))
		return LocaleId.KMR;
	if (norm === "ckb" || ["ku", "sdh", "lki", "hac"].includes(norm))
		return LocaleId.CKB;
	return LocaleId.CKB;
}

export type LocaleData = {
	months: string[][];
	months_short: string[][];
	weekdays: string[][];
	weekdays_short: string[][];
	weekdays_min?: string[][];
};

export function getLocaleData(
	localeId: LocaleId,
	calendar: CalendarKind,
): LocaleData {
	let catLocale = localeId as string;
	if (catLocale === "ku") catLocale = "ckb";

	const catalog: any = rawCatalog;
	if (!catalog.locales[catLocale]) {
		catLocale = "en";
	}

	// For Kurdish calendar, try 'kurdish' key, if not, fallback to persian structure for names if not exist, or just gregorian
	const calData =
		catalog.locales[catLocale][calendar] || catalog.locales["en"]["gregorian"];
	return calData as LocaleData;
}

export function getAmPm(localeId: LocaleId): [string, string] {
	let catLocale = localeId as string;
	if (catLocale === "ku") catLocale = "ckb";
	const catalog: any = rawCatalog;
	const data = catalog.locales[catLocale];
	return data?.am_pm || ["am", "pm"];
}

export function getDigits(localeId: LocaleId): string[] {
	let catLocale = localeId as string;
	if (catLocale === "ku") catLocale = "ckb";
	const catalog: any = rawCatalog;
	const data = catalog.locales[catLocale];
	return data?.digits || ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
}
