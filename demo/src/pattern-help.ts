import { formatCalendarDate, KurdishDateTime } from "@0xdolan/tsroj";
import { copyText } from "./copy-ui";
import {
	isRtlLocale,
	setScriptAwareContent,
} from "./script-font";
import { buildFormatOptions, getShiftedDate, type DemoState } from "./state";

type TokenHelp = {
	token: string;
	title: string;
	description: string;
};

const PATTERN_TOKENS: TokenHelp[] = [
	{
		token: "%A",
		title: "Full weekday",
		description: "Localized full weekday name (Saturday-first week).",
	},
	{
		token: "%a",
		title: "Short weekday",
		description: "Abbreviated weekday name.",
	},
	{
		token: "%E",
		title: "Minimum weekday",
		description: "Shortest weekday label (Kurdish locales).",
	},
	{
		token: "%B",
		title: "Full month",
		description: "Localized full month name for the active calendar.",
	},
	{
		token: "%b",
		title: "Short month",
		description: "Abbreviated month name.",
	},
	{
		token: "%Y",
		title: "4-digit year",
		description: "Year with leading zeros (e.g. 2726).",
	},
	{
		token: "%m",
		title: "Month number",
		description: "Month 01–12; leading zero depends on locale options.",
	},
	{
		token: "%d",
		title: "Day of month",
		description: "Day 01–31; Sorani may append ezafe «ی» when a month name is present.",
	},
];

function resolveDemoKdt(state: DemoState): KurdishDateTime {
	if (state.mode === "live") {
		return KurdishDateTime.fromJSDate(getShiftedDate(state.timezone));
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

function formatPattern(
	pattern: string,
	state: DemoState,
): { text: string; error: boolean } {
	try {
		const kdt = resolveDemoKdt(state);
		return {
			text: formatCalendarDate(kdt, pattern, buildFormatOptions(state)),
			error: false,
		};
	} catch (err) {
		return {
			text: err instanceof Error ? err.message : "Invalid pattern",
			error: true,
		};
	}
}

function renderTokenList(
	container: HTMLElement,
	state: DemoState,
): void {
	container.innerHTML = "";
	const options = buildFormatOptions(state);
	const kdt = resolveDemoKdt(state);
	const rtl = isRtlLocale(state.locale);

	for (const entry of PATTERN_TOKENS) {
		let sample = "—";
		try {
			sample = formatCalendarDate(kdt, entry.token, options);
		} catch {
			sample = "—";
		}

		const card = document.createElement("article");
		card.className = "pattern-token-card";

		const head = document.createElement("div");
		head.className = "pattern-token-head";

		const code = document.createElement("code");
		code.className = "pattern-token-code";
		code.textContent = entry.token;

		const title = document.createElement("h4");
		title.className = "pattern-token-title";
		title.textContent = entry.title;

		head.append(code, title);

		const desc = document.createElement("p");
		desc.className = "pattern-token-desc";
		desc.textContent = entry.description;

		const example = document.createElement("p");
		example.className = "pattern-token-example";

		const exampleLabel = document.createTextNode("Example: ");
		const exampleOut = document.createElement("output");
		exampleOut.className = "pattern-token-sample";
		setScriptAwareContent(exampleOut, sample, {
			dir: rtl ? "rtl" : "ltr",
		});
		example.append(exampleLabel, exampleOut);

		card.append(head, desc, example);
		container.appendChild(card);
	}
}

export function mountPatternHelp(getState: () => DemoState): void {
	const dialog = document.getElementById(
		"pattern-help-modal",
	) as HTMLDialogElement;
	const trigger = document.getElementById("pattern-help-trigger");
	const closeBtn = document.getElementById("pattern-help-close");
	const doneBtn = document.getElementById("pattern-help-done");
	const tokenList = document.getElementById("pattern-token-list");
	const input = document.getElementById(
		"pattern-help-input",
	) as HTMLInputElement;
	const preview = document.getElementById("pattern-help-preview");
	const copyPatternBtn = document.getElementById(
		"pattern-help-copy-pattern",
	) as HTMLButtonElement;
	const copyOutputBtn = document.getElementById(
		"pattern-help-copy-output",
	) as HTMLButtonElement;

	if (!dialog || !trigger || !tokenList || !input || !preview) return;

	const close = () => dialog.close();

	const refreshPreview = () => {
		const state = getState();
		const { text, error } = formatPattern(input.value, state);
		setScriptAwareContent(preview, text, {
			dir: isRtlLocale(state.locale) ? "rtl" : "ltr",
		});
		preview.classList.toggle("pattern-help-preview-error", error);
	};

	const open = () => {
		const state = getState();
		input.value = state.formatPattern;
		renderTokenList(tokenList, state);
		refreshPreview();
		dialog.showModal();
		input.focus();
		input.select();
	};

	trigger.addEventListener("click", open);
	closeBtn?.addEventListener("click", close);
	doneBtn?.addEventListener("click", close);
	input.addEventListener("input", refreshPreview);

	copyPatternBtn?.addEventListener("click", () => {
		void copyText(input.value, copyPatternBtn);
	});

	copyOutputBtn?.addEventListener("click", () => {
		void copyText(preview.textContent ?? "", copyOutputBtn);
	});

	dialog.addEventListener("close", () => {
		input.value = "";
		preview.textContent = "";
		preview.classList.remove("pattern-help-preview-error");
		trigger.focus();
	});
}
