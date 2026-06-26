const COPY_SVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>`;

const CHECK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;

export async function copyText(
	text: string,
	btn?: HTMLButtonElement,
): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		if (btn) {
			const prev = btn.innerHTML;
			btn.innerHTML = CHECK_SVG;
			btn.classList.add("is-copied");
			setTimeout(() => {
				btn.innerHTML = prev;
				btn.classList.remove("is-copied");
			}, 1400);
		}
		return true;
	} catch {
		return false;
	}
}

export function wrapCodeWithCopy(
	codeEl: HTMLElement,
	label = "Copy code",
): void {
	const wrap = document.createElement("div");
	wrap.className = "code-copy-wrap group";

	const btn = document.createElement("button");
	btn.type = "button";
	btn.className = "copy-icon-btn";
	btn.setAttribute("aria-label", label);
	btn.innerHTML = COPY_SVG;

	codeEl.parentNode?.insertBefore(wrap, codeEl);
	wrap.append(codeEl, btn);

	btn.addEventListener("click", async () => {
		await copyText(codeEl.textContent ?? "", btn);
	});
}
