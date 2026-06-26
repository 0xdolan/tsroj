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

/** Canonical owner for calendar systems that must not be dialect-translated. */
export const CALENDAR_CANONICAL_OWNER: Partial<Record<CalendarKind, LocaleId>> =
	{
		[CalendarKind.PERSIAN]: LocaleId.FA,
		[CalendarKind.ISLAMIC]: LocaleId.AR,
	};

/** BCP-47 style codes resolved to a loaded locale bundle. */
const LOCALE_ALIASES: Record<string, LocaleId> = {
	en: LocaleId.EN,
	fa: LocaleId.FA,
	ar: LocaleId.AR,
	tr: LocaleId.TR,
	kmr: LocaleId.KMR,
	ckb: LocaleId.CKB,
	ku: LocaleId.CKB,
	"ku-latn": LocaleId.KMR,
	zza: LocaleId.KMR,
	diq: LocaleId.KMR,
	kiu: LocaleId.KMR,
	sdh: LocaleId.CKB,
	lki: LocaleId.CKB,
	hac: LocaleId.CKB,
	bqi: LocaleId.CKB,
};

const LOADED_LOCALE_IDS = new Set<LocaleId>([
	LocaleId.EN,
	LocaleId.KMR,
	LocaleId.CKB,
	LocaleId.FA,
	LocaleId.AR,
	LocaleId.TR,
]);

export function resolveLocaleId(lang: string | LocaleId): LocaleId {
	const norm = String(lang).toLowerCase().replace("_", "-");
	const resolved = LOCALE_ALIASES[norm];
	if (resolved) return resolved;
	return LocaleId.CKB;
}

export function isLoadedLocale(localeId: LocaleId): boolean {
	return LOADED_LOCALE_IDS.has(localeId);
}
