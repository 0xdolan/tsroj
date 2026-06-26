import {
	CalendarKind,
	formatCalendarDate,
	getLocaleData,
	KurdishDateTime,
	resolveLocaleId,
} from "@0xdolan/tsroj";
import {
	buildFormatOptions,
	type DemoState,
	formatTimezoneDisplay,
	getShiftedDate,
} from "./state";
import {
	isRtlLocale,
	isScriptLocale,
	setScriptAwareContent,
} from "./script-font";

function resolveKdt(state: DemoState): KurdishDateTime {
	if (state.mode === "live") {
		const now = getShiftedDate(state.timezone);
		return KurdishDateTime.fromJSDate(now);
	}
	return new KurdishDateTime(
		state.kurdishYear,
		state.kurdishMonth,
		state.kurdishDay,
		state.hour,
		state.minute,
		state.second,
	);
}

function formatCard(
	kdt: KurdishDateTime,
	calendar: CalendarKind,
	state: DemoState,
	pattern: string,
): string {
	return formatCalendarDate(kdt, pattern, {
		...buildFormatOptions(state),
		calendar,
	});
}

export function populateMonthVariants(
	state: DemoState,
	select: HTMLSelectElement,
): void {
	const localeId = resolveLocaleId(state.locale);
	const data = getLocaleData(localeId, CalendarKind.KURDISH);
	const monthIndex = Math.max(1, Math.min(12, state.kurdishMonth)) - 1;
	const entry = data.months[monthIndex];
	const current = select.value;

	select.innerHTML = "";
	const defaultOpt = document.createElement("option");
	defaultOpt.value = "";
	defaultOpt.textContent = `Default (${entry?.names[0] ?? "—"})`;
	select.appendChild(defaultOpt);

	if (entry) {
		for (let i = 0; i < entry.names.length; i++) {
			const opt = document.createElement("option");
			opt.value = String(i);
			opt.textContent = `${i}: ${entry.names[i]} / ${entry.short?.[i] ?? entry.names[i]}`;
			select.appendChild(opt);
		}
	}

	select.value = current;
}

export function renderDemo(state: DemoState): void {
	const kdt = resolveKdt(state);
	const localeId = resolveLocaleId(state.locale);
	const isRtl = isRtlLocale(state.locale);
	// Keep UI chrome LTR; only date output elements get RTL direction
	document.documentElement.dir = "ltr";
	document.documentElement.lang = state.locale;

	const textDir = isRtl ? ("rtl" as const) : ("ltr" as const);

	const setCardText = (id: string, text: string) => {
		const el = document.getElementById(id);
		if (!el) return;
		setScriptAwareContent(el, text, { dir: textDir });
	};

	const fmtOpts = buildFormatOptions(state);
	const gr = kdt.toGregorian();

	const CALENDAR_LABELS: Record<string, string> = {
		kurdish: "Kurdish solar",
		gregorian: "Gregorian",
		persian: "Persian",
		islamic: "Islamic",
	};

	// Hero
	const heroTime = document.getElementById("hero-time")!;
	const heroAmPm = document.getElementById("hero-ampm")!;
	const heroDate = document.getElementById("hero-date")!;
	const heroWeekday = document.getElementById("hero-weekday")!;
	const heroStruct = document.getElementById("hero-struct")!;
	const heroPattern = document.getElementById("hero-pattern")!;
	const heroTimezone = document.getElementById("hero-timezone")!;
	const heroCalendarChip = document.getElementById("hero-calendar-chip")!;
	const heroLocaleChip = document.getElementById("hero-locale-chip")!;
	const heroModeLabel = document.getElementById("hero-mode-label")!;
	const heroSyncBadge = document.getElementById("hero-sync-badge")!;

	setScriptAwareContent(heroWeekday, kdt.strftime("%A", fmtOpts), { dir: textDir });
	setScriptAwareContent(heroDate, kdt.strftime("%d %B %Y", fmtOpts), { dir: textDir });
	const clockFmtOpts = {
		...fmtOpts,
		leadingZero:
			state.locale === "ckb" || state.locale === "fa" || state.locale === "ar"
				? true
				: fmtOpts.leadingZero,
	};
	const timeStr = kdt.strftime("%I:%M:%S", clockFmtOpts);
	setScriptAwareContent(heroTime, timeStr, { dir: "ltr" });
	const h12 = kdt.hour % 12 || 12;
	const pad = (n: number) => String(n).padStart(2, "0");
	heroTime.setAttribute(
		"datetime",
		`${pad(h12)}:${pad(kdt.minute)}:${pad(kdt.second)}`,
	);
	setScriptAwareContent(heroAmPm, kdt.strftime("%p", clockFmtOpts), { dir: textDir });
	heroStruct.textContent = `${kdt.year} / ${kdt.month} / ${kdt.day}`;
	heroPattern.textContent = state.formatPattern;
	heroTimezone.textContent = formatTimezoneDisplay(state.timezone);

	heroCalendarChip.textContent =
		CALENDAR_LABELS[state.displayCalendar] ?? state.displayCalendar;
	heroLocaleChip.textContent = localeId;
	const isLive = state.mode === "live";
	heroModeLabel.textContent = isLive ? "Live" : "Custom";
	heroSyncBadge.className = `hero-sync-badge ${isLive ? "is-live" : "is-custom"}`;
	heroCalendarChip.className = "hero-chip hero-chip-accent";

	const setText = (id: string, text: string) => {
		const el = document.getElementById(id);
		if (el) el.textContent = text;
	};

	setCardText("card-kurdish", formatCard(kdt, CalendarKind.KURDISH, state, "%A, %d %B %Y"));
	setCardText("card-gregorian", formatCard(kdt, CalendarKind.GREGORIAN, state, "%A, %d %B %Y"));
	setCardText("card-persian", formatCard(kdt, CalendarKind.PERSIAN, state, "%A, %d %B %Y"));
	setCardText("card-islamic", formatCard(kdt, CalendarKind.ISLAMIC, state, "%A, %d %B %Y"));

	// Structural readouts
	const [py, pm, pd] = kdt.toPersian();
	const [iy, im, id] = kdt.toIslamic();
	setText(
		"struct-kurdish",
		`${kdt.year} / ${kdt.month} / ${kdt.day}`,
	);
	setText("struct-gregorian", `${gr[0]} / ${gr[1]} / ${gr[2]}`);
	setText("struct-persian", `${py} / ${pm} / ${pd}`);
	setText("struct-islamic", `${iy} / ${im} / ${id}`);

	syncLocalePills(state.locale);

	const ckbPanel = document.getElementById("ckb-options-panel");
	const rtlNumericPanel = document.getElementById("rtl-numeric-panel");
	const isRtlNumeric = isScriptLocale(state.locale);
	ckbPanel?.classList.toggle("hidden", state.locale !== "ckb");
	rtlNumericPanel?.classList.toggle("hidden", !isRtlNumeric);

	const monthVarSelect = document.getElementById(
		"month-variant",
	) as HTMLSelectElement | null;
	if (monthVarSelect) {
		monthVarSelect.classList.toggle("font-kurdish", isRtlNumeric);
		populateMonthVariants(state, monthVarSelect);
	}

	document.getElementById("controls-form")?.classList.toggle(
		"locale-script",
		isRtlNumeric,
	);
}

export function syncLocalePills(locale: string): void {
	const pills = document.querySelectorAll<HTMLButtonElement>("#locale-pills [data-locale]");
	for (const pill of pills) {
		const active = pill.dataset.locale === locale;
		pill.classList.toggle("locale-pill-active", active);
		pill.setAttribute("aria-pressed", active ? "true" : "false");
	}
}

export function syncCustomFromLive(state: DemoState): DemoState {
	const now = getShiftedDate(state.timezone);
	const kdt = KurdishDateTime.fromJSDate(now);
	return {
		...state,
		kurdishYear: kdt.year,
		kurdishMonth: kdt.month,
		kurdishDay: kdt.day,
		hour: kdt.hour,
		minute: kdt.minute,
		second: kdt.second,
	};
}