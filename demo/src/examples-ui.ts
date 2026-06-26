import {
	DEMO_EXAMPLES,
	EXAMPLE_DEFAULTS,
	type ExampleDefinition,
	exampleCode,
	exampleState,
	runExample,
} from "./examples";
import { wrapCodeWithCopy } from "./copy-ui";
import { isRtlLocale, setScriptAwareContent } from "./script-font";
import type { DemoState } from "./state";

const CATEGORY_LABELS: Record<string, string> = {
	locale: "Locales",
	calendar: "Calendars",
	variant: "Variants",
	format: "Formatting",
	override: "Overrides",
};

const CATEGORY_STYLES: Record<string, string> = {
	locale: "bg-sky-100 text-sky-800 border border-sky-200",
	calendar: "bg-sky-50 text-sky-900 border border-sky-200",
	variant: "bg-base-200 text-sky-900 border border-base-300",
	format: "bg-sky-100 text-sky-900 border border-sky-300",
	override: "bg-base-200 text-base-content/80 border border-base-300",
};

type ExampleUiCallbacks = {
	onApply: (state: DemoState) => void;
	onResetMain: () => void;
};

function buildExampleCard(
	ex: ExampleDefinition,
	callbacks: ExampleUiCallbacks,
): HTMLElement {
	const card = document.createElement("article");
	card.className = "card bg-base-100 border border-base-300 shadow-sm";
	card.dataset.exampleId = ex.id;

	const custom: Partial<DemoState> = {};
	const st = () => exampleState(ex, custom);

	const body = document.createElement("div");
	body.className = "card-body example-card-body";

	const badge = document.createElement("span");
	badge.className = `inline-block text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded ${CATEGORY_STYLES[ex.category]}`;
	badge.textContent = CATEGORY_LABELS[ex.category];

	const title = document.createElement("h3");
	title.className = "font-semibold text-sm mt-0.5";
	title.textContent = ex.title;

	const desc = document.createElement("p");
	desc.className = "text-xs text-base-content/60 leading-relaxed";
	desc.textContent = ex.description;

	const output = document.createElement("div");
	output.className = "example-output";

	const fields = document.createElement("div");
	fields.className = "grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1";

	const patternRow = document.createElement("label");
	patternRow.className = "form-control";
	patternRow.innerHTML = `<span class="label-text text-xs">Pattern</span>`;
	const patternInput = document.createElement("input");
	patternInput.type = "text";
	patternInput.className = "input input-bordered input-sm w-full font-mono";
	patternInput.value = ex.pattern;
	patternRow.appendChild(patternInput);
	fields.appendChild(patternRow);

	const localeRow = document.createElement("label");
	localeRow.className = "form-control";
	localeRow.innerHTML = `<span class="label-text text-xs">Locale</span>`;
	const localeSelect = document.createElement("select");
	localeSelect.className = "select select-bordered select-sm w-full";
	for (const loc of ["en", "ckb", "kmr", "fa", "ar", "tr"]) {
		const opt = document.createElement("option");
		opt.value = loc;
		opt.textContent = loc;
		if (loc === (ex.apply.locale ?? EXAMPLE_DEFAULTS.locale)) opt.selected = true;
		localeSelect.appendChild(opt);
	}
	localeRow.appendChild(localeSelect);
	fields.appendChild(localeRow);

	const code = document.createElement("pre");
	code.textContent = "";

	const actions = document.createElement("div");
	actions.className = "flex flex-wrap gap-2 pt-1";

	const refresh = () => {
		custom.formatPattern = patternInput.value;
		custom.locale = localeSelect.value;
		const current = st();
		const result = runExample(ex, custom);
		setScriptAwareContent(output, result, {
			dir: isRtlLocale(current.locale) ? "rtl" : "ltr",
		});
		code.textContent = exampleCode(ex, custom);
	};

	const tryBtn = document.createElement("button");
	tryBtn.type = "button";
	tryBtn.className = "btn btn-primary btn-sm";
	tryBtn.textContent = "Apply";
	tryBtn.addEventListener("click", () => {
		callbacks.onApply(exampleState(ex, custom));
		window.scrollTo({ top: 0, behavior: "smooth" });
	});

	const resetExBtn = document.createElement("button");
	resetExBtn.type = "button";
	resetExBtn.className = "btn btn-outline btn-sm border-base-300";
	resetExBtn.textContent = "Reset";
	resetExBtn.addEventListener("click", () => {
		patternInput.value = ex.pattern;
		localeSelect.value = ex.apply.locale ?? EXAMPLE_DEFAULTS.locale;
		Object.keys(custom).forEach((k) => delete custom[k as keyof DemoState]);
		refresh();
	});

	patternInput.addEventListener("input", refresh);
	localeSelect.addEventListener("change", refresh);

	actions.append(tryBtn, resetExBtn);
	body.append(badge, title, desc, output, fields, code, actions);
	card.appendChild(body);
	wrapCodeWithCopy(code);
	refresh();
	return card;
}

export function mountExamplesSection(callbacks: ExampleUiCallbacks): void {
	const grid = document.getElementById("examples-grid");
	if (!grid) return;
	grid.innerHTML = "";

	for (const ex of DEMO_EXAMPLES) {
		grid.appendChild(buildExampleCard(ex, callbacks));
	}
}
