import type { CalendarBlock, VariantEntry, VariantField } from "./types";

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);
const MAX_LABEL_LEN = 64;

function assertSafeString(value: unknown, path: string): string {
	if (typeof value !== "string") {
		throw new Error(`${path}: expected string`);
	}
	if (value.length > MAX_LABEL_LEN) {
		throw new Error(`${path}: exceeds max length ${MAX_LABEL_LEN}`);
	}
	return value;
}

function unwrapStringList(raw: unknown, path: string): string[] {
	if (typeof raw === "string") {
		return [assertSafeString(raw, path)];
	}
	if (!Array.isArray(raw) || raw.length === 0) {
		throw new Error(`${path}: expected non-empty string or string array`);
	}
	return raw.map((name, i) => assertSafeString(name, `${path}[${i}]`));
}

/** Pad secondary variants to match primary length (variant index alignment). */
export function alignVariantList(
	primary: string[],
	secondary: string[] | undefined,
	_path: string,
): string[] {
	if (!secondary) {
		return [...primary];
	}
	return primary.map((name, i) => {
		if (secondary[i] !== undefined) {
			return secondary[i];
		}
		if (secondary[0] !== undefined) {
			return secondary[0];
		}
		return name;
	});
}

function normalizeVariantEntry(raw: unknown, path: string): VariantEntry {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		throw new Error(`${path}: expected variant object`);
	}
	const obj = raw as Record<string, unknown>;
	for (const key of Object.keys(obj)) {
		if (FORBIDDEN_KEYS.has(key)) {
			throw new Error(`${path}: forbidden key ${key}`);
		}
	}
	const names = unwrapStringList(obj.names ?? obj.name, `${path}.names`);
	const short = obj.short
		? alignVariantList(
				names,
				unwrapStringList(obj.short, `${path}.short`),
				`${path}.short`,
			)
		: undefined;
	const min = obj.min
		? alignVariantList(
				names,
				unwrapStringList(obj.min, `${path}.min`),
				`${path}.min`,
			)
		: undefined;
	return { names, short, min };
}

function isVariantObject(raw: unknown): raw is Record<string, unknown> {
	return (
		!!raw &&
		typeof raw === "object" &&
		!Array.isArray(raw) &&
		("names" in raw || "name" in raw)
	);
}

function normalizeVariantEntries(
	raw: unknown,
	path: string,
	count: number,
	legacyShorts?: unknown,
): VariantEntry[] {
	if (!Array.isArray(raw) || raw.length !== count) {
		throw new Error(`${path}: expected ${count} entries`);
	}
	const shorts = Array.isArray(legacyShorts) ? legacyShorts : undefined;
	return raw.map((entry, i) => {
		const entryPath = `${path}[${i}]`;
		if (isVariantObject(entry)) {
			return normalizeVariantEntry(entry, entryPath);
		}
		const names = unwrapStringList(entry, entryPath);
		const shortRaw = shorts?.[i];
		const short = shortRaw
			? alignVariantList(
					names,
					unwrapStringList(shortRaw, `${path}_short[${i}]`),
					`${path}_short[${i}]`,
				)
			: undefined;
		return { names, short };
	});
}

export function normalizeCalendarBlock(
	raw: unknown,
	path = "calendar",
): CalendarBlock {
	if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
		throw new Error(`${path}: expected object`);
	}
	for (const key of Object.keys(raw)) {
		if (FORBIDDEN_KEYS.has(key)) {
			throw new Error(`${path}: forbidden key ${key}`);
		}
	}
	const block = raw as Record<string, unknown>;

	const months = normalizeVariantEntries(
		block.months,
		`${path}.months`,
		12,
		block.months_short,
	);

	const weekdays = normalizeVariantEntries(
		block.weekdays,
		`${path}.weekdays`,
		7,
		undefined,
	);

	// Legacy: separate weekdays_short / weekdays_min arrays
	const legacyShorts = block.weekdays_short;
	const legacyMins = block.weekdays_min;
	if (legacyShorts || legacyMins) {
		for (let i = 0; i < weekdays.length; i++) {
			const wd = weekdays[i];
			if (legacyShorts) {
				wd.short = alignVariantList(
					wd.names,
					unwrapStringList(
						(Array.isArray(legacyShorts) ? legacyShorts : [])[i],
						`${path}.weekdays_short[${i}]`,
					),
					`${path}.weekdays_short[${i}]`,
				);
			}
			if (legacyMins) {
				wd.min = alignVariantList(
					wd.names,
					unwrapStringList(
						(Array.isArray(legacyMins) ? legacyMins : [])[i],
						`${path}.weekdays_min[${i}]`,
					),
					`${path}.weekdays_min[${i}]`,
				);
			}
		}
	}

	return { months, weekdays };
}

export function resolveVariantIndex(
	names: string[],
	variant?: string | number,
): number {
	if (variant === undefined) {
		return 0;
	}
	if (typeof variant === "number") {
		if (variant >= 0 && variant < names.length) {
			return variant;
		}
		return 0;
	}
	const target = variant.normalize("NFC");
	const idx = names.findIndex((n) => n.normalize("NFC") === target);
	return idx >= 0 ? idx : 0;
}

export function resolveVariantLabel(
	entries: VariantEntry[],
	index: number,
	field: VariantField,
	variant?: string | number,
): string {
	const entry = entries[index];
	if (!entry?.names?.length) {
		return String(index + 1);
	}

	let variantIdx = resolveVariantIndex(entry.names, variant);

	if (typeof variant === "string") {
		const target = variant.normalize("NFC");
		const localIdx = entry.names.findIndex(
			(n) => n.normalize("NFC") === target,
		);
		if (localIdx >= 0) {
			variantIdx = localIdx;
		} else {
			for (const e of entries) {
				const globalIdx = e.names.findIndex(
					(n) => n.normalize("NFC") === target,
				);
				if (globalIdx >= 0 && e === entry) {
					variantIdx = globalIdx;
					break;
				}
			}
		}
	}

	const names = entry.names;
	const shorts = entry.short ?? names;
	const mins = entry.min ?? entry.short ?? names;
	const pool = field === "names" ? names : field === "short" ? shorts : mins;
	return pool[variantIdx] ?? pool[0] ?? names[0];
}

/** Resolve a full month name (backward-compatible helper). */
export function resolveMonthName(
	months: VariantEntry[],
	monthIndex: number,
	variant?: string | number,
): string {
	if (typeof variant === "string") {
		const target = variant.normalize("NFC");
		for (let i = 0; i < months.length; i++) {
			const match = months[i].names.find((n) => n.normalize("NFC") === target);
			if (match) {
				return resolveVariantLabel(months, i, "names", variant);
			}
		}
	}
	return resolveVariantLabel(months, monthIndex, "names", variant);
}

export function deepFreeze<T>(value: T): T {
	if (value === null || typeof value !== "object") {
		return value;
	}
	Object.freeze(value);
	for (const key of Object.keys(value)) {
		const child = (value as Record<string, unknown>)[key];
		if (
			child !== null &&
			typeof child === "object" &&
			!Object.isFrozen(child)
		) {
			deepFreeze(child);
		}
	}
	return value;
}
