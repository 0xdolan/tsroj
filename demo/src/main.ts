import "./style.css";
import { wrapCodeWithCopy } from "./copy-ui";
import { mountExamplesSection } from "./examples-ui";
import { renderDemo, syncCustomFromLive } from "./render";
import {
	DEFAULT_STATE,
	FORMAT_PRESETS,
	type DemoState,
} from "./state";

import { mountPatternHelp } from "./pattern-help";
import { mountTimezonePicker } from "./timezone-picker";

let state: DemoState = { ...DEFAULT_STATE };
let tickTimer: ReturnType<typeof setInterval> | null = null;
let timezonePicker: ReturnType<typeof mountTimezonePicker> | null = null;

function readStateFromForm(): DemoState {
	const form = document.getElementById("controls-form") as HTMLFormElement;
	const modeInput = form.querySelector<HTMLInputElement>('input[name="mode"]:checked')!;

	return {
		...state,
		mode: modeInput.value as DemoState["mode"],
		timezone: timezonePicker?.getValue() ?? (document.getElementById("timezone") as HTMLInputElement).value,
		locale: (document.getElementById("locale") as HTMLSelectElement).value,
		displayCalendar: (document.getElementById("display-calendar") as HTMLSelectElement).value,
		formatPattern: (document.getElementById("format-pattern") as HTMLInputElement).value,
		useLocaleDigits: (document.getElementById("use-locale-digits") as HTMLInputElement).checked,
		monthVariant: (document.getElementById("month-variant") as HTMLSelectElement).value,
		weekdayVariant: (document.getElementById("weekday-variant") as HTMLInputElement).value,
		kurdishYear: Number((document.getElementById("ku-year") as HTMLInputElement).value),
		kurdishMonth: Number((document.getElementById("ku-month") as HTMLInputElement).value),
		kurdishDay: Number((document.getElementById("ku-day") as HTMLInputElement).value),
		hour: Number((document.getElementById("ku-hour") as HTMLInputElement).value),
		minute: Number((document.getElementById("ku-minute") as HTMLInputElement).value),
		second: Number((document.getElementById("ku-second") as HTMLInputElement).value),
		overrideMonth: (document.getElementById("override-month") as HTMLInputElement).value,
		overrideMonthShort: (document.getElementById("override-month-short") as HTMLInputElement).value,
		overrideWeekday: (document.getElementById("override-weekday") as HTMLInputElement).value,
		overrideWeekdayShort: (document.getElementById("override-weekday-short") as HTMLInputElement).value,
		overrideWeekdayMin: (document.getElementById("override-weekday-min") as HTMLInputElement).value,
		overrideDigits: (document.getElementById("override-digits") as HTMLInputElement).value,
		showAdvanced: (document.getElementById("advanced-toggle") as HTMLInputElement).checked,
		ezafeAfterDay: (document.getElementById("ezafe-after-day") as HTMLInputElement).checked,
		ezafeOnMonth: (document.getElementById("ezafe-on-month") as HTMLInputElement).checked,
		leadingZero: (document.getElementById("leading-zero") as HTMLInputElement).checked,
	};
}

function applyStateToForm(next: DemoState): void {
	const modeRadios = document.querySelectorAll<HTMLInputElement>('input[name="mode"]');
	for (const radio of modeRadios) {
		radio.checked = radio.value === next.mode;
	}

	timezonePicker?.setValue(next.timezone);
	(document.getElementById("locale") as HTMLSelectElement).value = next.locale;
	(document.getElementById("display-calendar") as HTMLSelectElement).value = next.displayCalendar;
	(document.getElementById("format-pattern") as HTMLInputElement).value = next.formatPattern;
	(document.getElementById("use-locale-digits") as HTMLInputElement).checked = next.useLocaleDigits;
	(document.getElementById("month-variant") as HTMLSelectElement).value = next.monthVariant;
	(document.getElementById("weekday-variant") as HTMLInputElement).value = next.weekdayVariant;
	(document.getElementById("ku-year") as HTMLInputElement).value = String(next.kurdishYear);
	(document.getElementById("ku-month") as HTMLInputElement).value = String(next.kurdishMonth);
	(document.getElementById("ku-day") as HTMLInputElement).value = String(next.kurdishDay);
	(document.getElementById("ku-hour") as HTMLInputElement).value = String(next.hour);
	(document.getElementById("ku-minute") as HTMLInputElement).value = String(next.minute);
	(document.getElementById("ku-second") as HTMLInputElement).value = String(next.second);
	(document.getElementById("override-month") as HTMLInputElement).value = next.overrideMonth;
	(document.getElementById("override-month-short") as HTMLInputElement).value = next.overrideMonthShort;
	(document.getElementById("override-weekday") as HTMLInputElement).value = next.overrideWeekday;
	(document.getElementById("override-weekday-short") as HTMLInputElement).value = next.overrideWeekdayShort;
	(document.getElementById("override-weekday-min") as HTMLInputElement).value = next.overrideWeekdayMin;
	(document.getElementById("override-digits") as HTMLInputElement).value = next.overrideDigits;
	(document.getElementById("ezafe-after-day") as HTMLInputElement).checked = next.ezafeAfterDay;
	(document.getElementById("ezafe-on-month") as HTMLInputElement).checked = next.ezafeOnMonth;
	(document.getElementById("leading-zero") as HTMLInputElement).checked = next.leadingZero;

	document.getElementById("custom-date-panel")?.classList.toggle("hidden", next.mode !== "custom");
}

function update(): void {
	state = readStateFromForm();
	applyStateToForm(state);
	renderDemo(state);
}

function resetToDefaults(): void {
	state = { ...DEFAULT_STATE };
	applyStateToForm(state);
	update();
	manageTick();
}

function applyExampleState(next: DemoState): void {
	state = { ...next, mode: "custom" };
	applyStateToForm(state);
	update();
	manageTick();
}

function setupPresets(): void {
	const presetSelect = document.getElementById("format-preset") as HTMLSelectElement;
	for (const preset of FORMAT_PRESETS) {
		const opt = document.createElement("option");
		opt.value = preset.value;
		opt.textContent = preset.label;
		presetSelect.appendChild(opt);
	}
	presetSelect.addEventListener("change", () => {
		(document.getElementById("format-pattern") as HTMLInputElement).value = presetSelect.value;
		update();
	});
}

function setupModeRadios(): void {
	const radios = document.querySelectorAll<HTMLInputElement>('input[name="mode"]');
	for (const radio of radios) {
		radio.addEventListener("change", () => {
			if (radio.value === "custom" && radio.checked) {
				state = syncCustomFromLive(readStateFromForm());
				applyStateToForm(state);
			}
			update();
			manageTick();
		});
	}
}

function manageTick(): void {
	if (tickTimer) clearInterval(tickTimer);
	if (state.mode === "live") {
		tickTimer = setInterval(update, 1000);
	}
}

function bindControls(): void {
	const form = document.getElementById("controls-form")!;
	form.addEventListener("input", update);
	form.addEventListener("change", update);

	document.getElementById("sync-now")?.addEventListener("click", () => {
		state = syncCustomFromLive(readStateFromForm());
		applyStateToForm(state);
		update();
	});

	document.getElementById("reset-all-defaults")?.addEventListener("click", resetToDefaults);
}

function setupLocalePills(): void {
	const pills = document.querySelectorAll<HTMLButtonElement>("#locale-pills [data-locale]");
	for (const pill of pills) {
		pill.addEventListener("click", () => {
			const locale = pill.dataset.locale;
			if (!locale) return;
			(document.getElementById("locale") as HTMLSelectElement).value = locale;
			update();
		});
	}
}

const PANEL_SIDE_KEY = "tsroj-panel-side";
type PanelSide = "left" | "right";

function setupPanelSide(): void {
	const layout = document.getElementById("main-layout");
	const leftBtn = document.getElementById("panel-side-left");
	const rightBtn = document.getElementById("panel-side-right");

	const apply = (side: PanelSide) => {
		layout?.classList.toggle("panel-left", side === "left");
		layout?.classList.toggle("panel-right", side === "right");
		leftBtn?.classList.toggle("panel-side-active", side === "left");
		rightBtn?.classList.toggle("panel-side-active", side === "right");
		leftBtn?.setAttribute("aria-pressed", side === "left" ? "true" : "false");
		rightBtn?.setAttribute("aria-pressed", side === "right" ? "true" : "false");
		try {
			localStorage.setItem(PANEL_SIDE_KEY, side);
		} catch {
			/* storage unavailable */
		}
	};

	let saved: PanelSide = "right";
	try {
		const stored = localStorage.getItem(PANEL_SIDE_KEY);
		if (stored === "left" || stored === "right") saved = stored;
	} catch {
		/* storage unavailable */
	}
	apply(saved);

	leftBtn?.addEventListener("click", () => apply("left"));
	rightBtn?.addEventListener("click", () => apply("right"));
}

function setupMobileControls(): void {
	const aside = document.getElementById("controls-aside");
	const backdrop = document.getElementById("mobile-backdrop");
	const openBtn = document.getElementById("toggle-mobile-controls");
	const closeBtn = document.getElementById("close-mobile-controls");

	const open = () => {
		aside?.classList.add("is-open");
		backdrop?.classList.remove("hidden");
		document.body.style.overflow = "hidden";
	};

	const close = () => {
		aside?.classList.remove("is-open");
		backdrop?.classList.add("hidden");
		document.body.style.overflow = "";
	};

	openBtn?.addEventListener("click", open);
	closeBtn?.addEventListener("click", close);
	backdrop?.addEventListener("click", close);
}

function init(): void {
	setupPresets();
	setupModeRadios();
	setupLocalePills();
	setupPanelSide();
	setupMobileControls();
	timezonePicker = mountTimezonePicker(update);
	mountPatternHelp(readStateFromForm);
	bindControls();
	mountExamplesSection({
		onApply: applyExampleState,
		onResetMain: resetToDefaults,
	});

	const npmInstall = document.getElementById("npm-install-cmd");
	if (npmInstall) wrapCodeWithCopy(npmInstall, "Copy install command");

	applyStateToForm(state);
	update();
	manageTick();
}

init();
