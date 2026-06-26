/** Arabic script blocks + presentation forms (ckb, fa, ar digits and letters). */
const ARABIC_SCRIPT_RE =
	/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;

const SEGMENT_RE =
	/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+|[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]+/g;

export function containsArabicScript(text: string): boolean {
	return ARABIC_SCRIPT_RE.test(text);
}

export function isScriptLocale(locale: string): boolean {
	return locale === "ckb" || locale === "fa" || locale === "ar";
}

export function isRtlLocale(locale: string): boolean {
	return isScriptLocale(locale);
}

export function setScriptAwareContent(
	el: HTMLElement,
	text: string,
	options?: { dir?: "ltr" | "rtl" },
): void {
	el.textContent = "";

	if (options?.dir) {
		el.setAttribute("dir", options.dir);
	} else {
		el.removeAttribute("dir");
	}

	if (!containsArabicScript(text)) {
		el.textContent = text;
		return;
	}

	const parts = text.match(SEGMENT_RE) ?? [text];
	for (const part of parts) {
		if (containsArabicScript(part)) {
			const span = document.createElement("span");
			span.className = "script-text";
			span.textContent = part;
			el.appendChild(span);
		} else {
			el.appendChild(document.createTextNode(part));
		}
	}
}
