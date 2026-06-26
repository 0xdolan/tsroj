const FALLBACK_TIMEZONES = [
	"UTC",
	"Africa/Cairo",
	"America/Chicago",
	"America/Los_Angeles",
	"America/New_York",
	"Asia/Baghdad",
	"Asia/Dubai",
	"Asia/Tehran",
	"Europe/Berlin",
	"Europe/Istanbul",
	"Europe/London",
];

const QUICK_PICKS = [
	"local",
	"UTC",
	"Asia/Baghdad",
	"Asia/Tehran",
	"Europe/Istanbul",
	"Europe/London",
	"America/New_York",
] as const;

const REGION_LABELS: Record<string, string> = {
	local: "Suggested",
	Africa: "Africa",
	America: "Americas",
	Antarctica: "Antarctica",
	Arctic: "Arctic",
	Asia: "Asia",
	Atlantic: "Atlantic",
	Australia: "Australia",
	Europe: "Europe",
	Indian: "Indian Ocean",
	Pacific: "Pacific",
	UTC: "UTC",
};

const offsetCache = new Map<string, string>();

export function getAllTimezones(): string[] {
	try {
		if (typeof Intl !== "undefined" && "supportedValuesOf" in Intl) {
			return [...Intl.supportedValuesOf("timeZone")].sort();
		}
	} catch {
		/* unsupported */
	}
	return [...FALLBACK_TIMEZONES].sort();
}

function zoneCity(z: string): string {
	if (z === "local") return "Local browser";
	if (z === "UTC") return "Coordinated Universal Time";
	const segment = z.split("/").pop() ?? z;
	return segment.replace(/_/g, " ");
}

function zoneRegion(z: string): string {
	if (z === "local") return "local";
	if (z === "UTC") return "UTC";
	return z.split("/")[0] ?? "Other";
}

function regionLabel(region: string): string {
	return REGION_LABELS[region] ?? region;
}

function regionAbbr(z: string): string {
	const region = zoneRegion(z);
	if (region === "local") return "⌂";
	if (region === "UTC") return "UTC";
	return region.slice(0, 2).toUpperCase();
}

function formatUtcOffset(tz: string): string {
	if (tz === "local") return "Auto";
	const cached = offsetCache.get(tz);
	if (cached !== undefined) return cached;

	try {
		const formatter = new Intl.DateTimeFormat("en-US", {
			timeZone: tz,
			timeZoneName: "shortOffset",
		});
		const part = formatter
			.formatToParts(new Date())
			.find((p) => p.type === "timeZoneName");
		const value = part?.value?.replace("GMT", "UTC") ?? "";
		offsetCache.set(tz, value);
		return value;
	} catch {
		offsetCache.set(tz, "");
		return "";
	}
}

export function mountTimezonePicker(
	onChange: () => void,
): { getValue: () => string; setValue: (tz: string) => void } {
	const hidden = document.getElementById("timezone") as HTMLInputElement;
	const trigger = document.getElementById("timezone-trigger")!;
	const label = document.getElementById("timezone-label")!;
	const dialog = document.getElementById("timezone-modal") as HTMLDialogElement;
	const search = document.getElementById("timezone-search") as HTMLInputElement;
	const list = document.getElementById("timezone-list")!;
	const empty = document.getElementById("timezone-empty")!;
	const count = document.getElementById("timezone-count")!;
	const quick = document.getElementById("timezone-quick")!;

	const zones = ["local", ...getAllTimezones()];

	function selectZone(z: string): void {
		hidden.value = z;
		label.textContent = z === "local" ? "Local browser" : z;
		dialog.close();
		search.value = "";
		renderList();
		onChange();
	}

	function createRow(z: string): HTMLButtonElement {
		const selected = hidden.value === z;
		const btn = document.createElement("button");
		btn.type = "button";
		btn.role = "option";
		btn.setAttribute("aria-selected", selected ? "true" : "false");
		btn.className = `timezone-row${selected ? " timezone-row-active" : ""}`;
		btn.dataset.tz = z;

		const avatar = document.createElement("span");
		avatar.className = "timezone-row-avatar";
		avatar.textContent = regionAbbr(z);
		avatar.setAttribute("aria-hidden", "true");

		const body = document.createElement("span");
		body.className = "timezone-row-body";

		const title = document.createElement("span");
		title.className = "timezone-row-title";
		title.textContent = zoneCity(z);

		const meta = document.createElement("span");
		meta.className = "timezone-row-meta";
		meta.textContent = z === "local" ? "Use system timezone" : z;

		body.append(title, meta);

		const offset = formatUtcOffset(z);
		const badge = document.createElement("span");
		badge.className = "badge badge-ghost badge-sm timezone-row-offset font-mono";
		badge.textContent = offset || "—";

		const check = document.createElement("span");
		check.className = "timezone-row-check";
		check.innerHTML =
			'<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>';
		check.hidden = !selected;

		btn.append(avatar, body, badge, check);
		btn.addEventListener("click", () => selectZone(z));
		return btn;
	}

	function renderQuickPicks(): void {
		quick.innerHTML = "";
		for (const z of QUICK_PICKS) {
			const chip = document.createElement("button");
			chip.type = "button";
			chip.className = `btn btn-xs btn-outline timezone-quick-chip${
				hidden.value === z ? " btn-primary" : ""
			}`;
			chip.textContent = z === "local" ? "Local" : zoneCity(z);
			chip.title = z === "local" ? "Local browser" : z;
			chip.addEventListener("click", () => selectZone(z));
			quick.appendChild(chip);
		}
	}

	function renderList(filter = ""): void {
		const q = filter.trim().toLowerCase();
		const filtering = q.length > 0;

		quick.hidden = filtering;
		if (!filtering) renderQuickPicks();

		list.innerHTML = "";
		let shown = 0;
		let lastRegion = "";

		for (const z of zones) {
			const city = zoneCity(z);
			const region = zoneRegion(z);
			if (
				q &&
				!z.toLowerCase().includes(q) &&
				!city.toLowerCase().includes(q) &&
				!region.toLowerCase().includes(q)
			) {
				continue;
			}

			if (!filtering && region !== lastRegion) {
				lastRegion = region;
				const heading = document.createElement("div");
				heading.className = "timezone-group-label";
				heading.textContent = regionLabel(region);
				list.appendChild(heading);
			}

			list.appendChild(createRow(z));
			shown += 1;
		}

		empty.classList.toggle("hidden", shown > 0);
		list.classList.toggle("hidden", shown === 0);
		count.textContent =
			shown === zones.length
				? `${shown} timezones`
				: `${shown} of ${zones.length} shown`;
	}

	trigger.addEventListener("click", () => {
		search.value = "";
		renderList();
		dialog.showModal();
		search.focus();
	});

	search.addEventListener("input", () => renderList(search.value));

	document.getElementById("timezone-modal-close")?.addEventListener("click", () => {
		dialog.close();
	});

	dialog.addEventListener("close", () => {
		search.value = "";
	});

	return {
		getValue: () => hidden.value,
		setValue: (tz: string) => {
			hidden.value = tz;
			label.textContent = tz === "local" ? "Local browser" : tz;
		},
	};
}
