import arBundle from "./ar/common.json";
import ckbBundle from "./ckb/common.json";
import enBundle from "./en/common.json";
import faBundle from "./fa/common.json";
import kmrBundle from "./kmr/common.json";
import { deepFreeze, normalizeCalendarBlock } from "./normalize";
import { CalendarKind, isLoadedLocale, LocaleId } from "./registry";
import trBundle from "./tr/common.json";
import type { CalendarBlock, LocaleBundle } from "./types";

function loadBundle(raw: unknown, localeId: LocaleId): LocaleBundle {
	const data = raw as LocaleBundle;
	const calendar: LocaleBundle["calendar"] = {};
	for (const [kind, block] of Object.entries(data.calendar)) {
		calendar[kind as CalendarKind] = normalizeCalendarBlock(
			block,
			`${localeId}.calendar.${kind}`,
		);
	}
	if (data.digits.length !== 10) {
		throw new Error(`${localeId}: digits must contain exactly 10 entries`);
	}
	if (data.am_pm.length !== 2) {
		throw new Error(`${localeId}: am_pm must contain exactly 2 entries`);
	}
	return deepFreeze({
		...data,
		am_pm: [data.am_pm[0], data.am_pm[1]],
		calendar,
	});
}

export const LOCALE_BUNDLES = deepFreeze({
	[LocaleId.EN]: loadBundle(enBundle, LocaleId.EN),
	[LocaleId.KMR]: loadBundle(kmrBundle, LocaleId.KMR),
	[LocaleId.CKB]: loadBundle(ckbBundle, LocaleId.CKB),
	[LocaleId.FA]: loadBundle(faBundle, LocaleId.FA),
	[LocaleId.AR]: loadBundle(arBundle, LocaleId.AR),
	[LocaleId.TR]: loadBundle(trBundle, LocaleId.TR),
}) as Readonly<Partial<Record<LocaleId, LocaleBundle>>>;

export function getBundle(localeId: LocaleId): LocaleBundle | undefined {
	if (!isLoadedLocale(localeId) && localeId !== LocaleId.KU) {
		return undefined;
	}
	return LOCALE_BUNDLES[localeId === LocaleId.KU ? LocaleId.CKB : localeId];
}

/** Solar calendars (Sat=0): weekdays from the locale's Kurdish block when available. */
export function solarWeekdayBlock(
	localeId: LocaleId,
): CalendarBlock | undefined {
	const bundle = getBundle(localeId);
	return (
		bundle?.calendar[CalendarKind.KURDISH] ??
		bundle?.calendar[CalendarKind.GREGORIAN]
	);
}

export function mergeCanonicalMonths(
	canonical: CalendarBlock,
	weekdays: CalendarBlock | undefined,
): CalendarBlock {
	if (!weekdays) return canonical;
	return {
		months: canonical.months,
		weekdays: weekdays.weekdays,
	};
}
