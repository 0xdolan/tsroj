import { TsrojRangeError, TsrojValueError } from "../exceptions";

export const GREGORIAN_EPOCH = 1721425.5;
export const PERSIAN_EPOCH = 1948320.5;
export const ISLAMIC_EPOCH = 1948439.5;
export const MIN_SUPPORTED_YEAR = 1;
export const MAX_SUPPORTED_YEAR = 9999;

export const KURDISH_SOLAR_YEAR_OFFSET = 1321;

export function _mod(a: number, b: number): number {
	return a - b * Math.floor(a / b);
}

function _requireInt(name: string, value: unknown): number {
	if (typeof value !== "number" || !Number.isInteger(value)) {
		throw new TsrojValueError(`${name} must be an integer`);
	}
	return value;
}

function _requireFiniteNumber(name: string, value: unknown): number {
	if (typeof value !== "number" || !Number.isFinite(value)) {
		throw new TsrojValueError(`${name} must be a finite number`);
	}
	return value;
}

function _requireYearBounds(name: string, year: number): number {
	if (year < MIN_SUPPORTED_YEAR || year > MAX_SUPPORTED_YEAR) {
		throw new TsrojRangeError(
			`${name} must be in [${MIN_SUPPORTED_YEAR}, ${MAX_SUPPORTED_YEAR}], got ${year}`,
		);
	}
	return year;
}

export function isGregorianLeap(year: number): boolean {
	year = _requireInt("year", year);
	_requireYearBounds("year", year);
	return year % 4 === 0 && !(year % 100 === 0 && year % 400 !== 0);
}

export function gregorianToJdn(
	year: number,
	month: number,
	day: number,
): number {
	year = _requireInt("year", year);
	month = _requireInt("month", month);
	day = _requireInt("day", day);
	_requireYearBounds("year", year);

	// Validate Gregorian date natively using JS Date (treating carefully around timezone)
	const d = new Date(Date.UTC(year, month - 1, day));
	if (
		d.getUTCFullYear() !== year ||
		d.getUTCMonth() + 1 !== month ||
		d.getUTCDate() !== day
	) {
		throw new TsrojRangeError(
			`Invalid Gregorian date: ${year}-${month}-${day}`,
		);
	}

	const adj = month <= 2 ? 0 : isGregorianLeap(year) ? -1 : -2;
	return (
		GREGORIAN_EPOCH -
		1 +
		365 * (year - 1) +
		Math.floor((year - 1) / 4) +
		-Math.floor((year - 1) / 100) +
		Math.floor((year - 1) / 400) +
		Math.floor((367 * month - 362) / 12 + adj + day)
	);
}

export function jdnToGregorian(jdn: number): [number, number, number] {
	jdn = _requireFiniteNumber("jdn", jdn);
	const wjd = Math.floor(jdn - 0.5) + 0.5;
	const depoch = wjd - GREGORIAN_EPOCH;
	const quadricent = Math.floor(depoch / 146097);
	const dqc = _mod(depoch, 146097);
	const cent = Math.floor(dqc / 36524);
	const dcent = _mod(dqc, 36524);
	const quad = Math.floor(dcent / 1461);
	const dquad = _mod(dcent, 1461);
	const yindex = Math.floor(dquad / 365);

	let year = Math.floor(quadricent * 400 + cent * 100 + quad * 4 + yindex);
	if (!(cent === 4 || yindex === 4)) {
		year += 1;
	}

	const dayOfYear = wjd - gregorianToJdn(year, 1, 1);
	let leapadj = 0.0;
	if (wjd >= gregorianToJdn(year, 3, 1)) {
		leapadj = isGregorianLeap(year) ? 1.0 : 2.0;
	}

	const month = Math.floor(((dayOfYear + leapadj) * 12 + 373) / 367);
	const day = Math.floor(wjd - gregorianToJdn(year, month, 1) + 1);
	return [year, month, day];
}

export function gregorianDateToJdn(dt: Date): number {
	if (!(dt instanceof Date) || isNaN(dt.getTime())) {
		throw new TsrojValueError("dt must be a valid Date");
	}
	const base = gregorianToJdn(
		dt.getFullYear(),
		dt.getMonth() + 1,
		dt.getDate(),
	);
	const seconds =
		dt.getHours() * 3600 +
		dt.getMinutes() * 60 +
		dt.getSeconds() +
		dt.getMilliseconds() / 1000;
	return base + seconds / 86400;
}

export function jdnToGregorianDate(jdn: number): Date {
	jdn = _requireFiniteNumber("jdn", jdn);
	const [y, m, d] = jdnToGregorian(jdn);
	const dayStart = Math.floor(jdn - 0.5) + 0.5;
	const frac = jdn - dayStart;

	let totalMilliseconds = Math.round(frac * 86400000);
	if (totalMilliseconds >= 86400000) {
		totalMilliseconds = 0;
		const base = new Date(y, m - 1, d);
		base.setDate(base.getDate() + 1);
		return base;
	}

	const seconds = Math.floor(totalMilliseconds / 1000);
	const milliseconds = totalMilliseconds % 1000;
	const hours = Math.floor(seconds / 3600);
	const minutes = Math.floor((seconds % 3600) / 60);
	const secs = seconds % 60;

	return new Date(y, m - 1, d, hours, minutes, secs, milliseconds);
}

export function isPersianLeapYear(year: number): boolean {
	year = _requireInt("year", year);
	_requireYearBounds("year", year);
	return (
		((((year - (year >= 0 ? 474 : 473)) % 2820) + 474 + 38) * 682) % 2816 < 682
	);
}

export function persianDaysInMonth(year: number, month: number): number {
	year = _requireInt("year", year);
	month = _requireInt("month", month);
	_requireYearBounds("year", year);
	if (month < 1 || month > 12) {
		throw new TsrojRangeError("month must be 1..12");
	}
	if (month <= 6) return 31;
	if (month <= 11) return 30;
	return isPersianLeapYear(year) ? 30 : 29;
}

export function persianToJdn(year: number, month: number, day: number): number {
	year = _requireInt("year", year);
	month = _requireInt("month", month);
	day = _requireInt("day", day);
	_requireYearBounds("year", year);

	const dim = persianDaysInMonth(year, month);
	if (day < 1 || day > dim) {
		throw new TsrojRangeError(
			`day must be 1..${dim} for Persian month ${month}`,
		);
	}

	const epbase = year - (year >= 0 ? 474 : 473);
	const epyear = 474 + _mod(epbase, 2820);

	return (
		day +
		(month <= 7 ? (month - 1) * 31 : (month - 1) * 30 + 6) +
		Math.floor((epyear * 682 - 110) / 2816) +
		(epyear - 1) * 365 +
		Math.floor(epbase / 2820) * 1029983 +
		(PERSIAN_EPOCH - 1)
	);
}

export function jdnToPersian(jdn: number): [number, number, number] {
	jdn = _requireFiniteNumber("jdn", jdn);
	jdn = Math.floor(jdn) + 0.5;
	const depoch = jdn - persianToJdn(475, 1, 1);
	const cycle = Math.floor(depoch / 1029983);
	const cyear = _mod(depoch, 1029983);

	let ycycle: number;
	if (cyear === 1029982) {
		ycycle = 2820;
	} else {
		const aux1 = Math.floor(cyear / 366);
		const aux2 = _mod(cyear, 366);
		ycycle =
			Math.floor((2134 * aux1 + 2816 * aux2 + 2815) / 1028522) + aux1 + 1;
	}

	let year = Math.floor(ycycle + 2820 * cycle + 474);
	if (year <= 0) {
		year -= 1;
	}

	const dayOfYear = jdn - persianToJdn(year, 1, 1) + 1;
	let month: number;
	if (dayOfYear <= 186) {
		month = Math.ceil(dayOfYear / 31);
	} else {
		month = Math.ceil((dayOfYear - 6) / 30);
	}

	const day = Math.floor(jdn - persianToJdn(year, month, 1) + 1);
	return [year, month, day];
}

export function isIslamicLeapYear(year: number): boolean {
	year = _requireInt("year", year);
	_requireYearBounds("year", year);
	return (year * 11 + 14) % 30 < 11;
}

export function islamicDaysInMonth(year: number, month: number): number {
	year = _requireInt("year", year);
	month = _requireInt("month", month);
	_requireYearBounds("year", year);
	if (month < 1 || month > 12) {
		throw new TsrojRangeError("month must be 1..12");
	}
	if ([1, 3, 5, 7, 9, 11].includes(month)) return 30;
	if ([2, 4, 6, 8, 10].includes(month)) return 29;
	return isIslamicLeapYear(year) ? 30 : 29;
}

export function islamicToJdn(year: number, month: number, day: number): number {
	year = _requireInt("year", year);
	month = _requireInt("month", month);
	day = _requireInt("day", day);
	_requireYearBounds("year", year);

	const dim = islamicDaysInMonth(year, month);
	if (day < 1 || day > dim) {
		throw new TsrojRangeError(
			`day must be 1..${dim} for Islamic month ${month}`,
		);
	}

	return (
		day +
		Math.ceil(29.5 * (month - 1)) +
		(year - 1) * 354 +
		Math.floor((3 + 11 * year) / 30) +
		ISLAMIC_EPOCH -
		1
	);
}

export function jdnToIslamic(jdn: number): [number, number, number] {
	jdn = _requireFiniteNumber("jdn", jdn);
	jdn = Math.floor(jdn) + 0.5;
	const year = Math.floor((30 * (jdn - ISLAMIC_EPOCH) + 10646) / 10631);
	const month = Math.min(
		12,
		Math.ceil((jdn - (29 + islamicToJdn(year, 1, 1))) / 29.5) + 1,
	);
	const day = Math.floor(jdn - islamicToJdn(year, month, 1) + 1);
	return [year, month, day];
}

export function persianWeekdayFromGregorian(d: Date): number {
	if (!(d instanceof Date) || isNaN(d.getTime())) {
		throw new TsrojValueError("d must be a valid Date");
	}
	// d.getDay(): Sunday=0, Monday=1, ..., Saturday=6
	// JS map: Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6, Sun=0.
	// Wait, Python's date.weekday() is 0 for Monday to 6 for Sunday.
	// We want to map it to Saturday=1 to Friday=7.
	// JS getDay(): Sun=0, Mon=1, Tue=2, Wed=3, Thu=4, Fri=5, Sat=6
	// In Python: (weekday + 2) % 7 + 1
	// Mon(1)->(1-1+2)%7+1=3 => (JS: 1+1 = 2) Let's be rigorous:
	// We want Sat=1, Sun=2, Mon=3, Tue=4, Wed=5, Thu=6, Fri=7
	// JS getDay() + 2 => Sat(6)->8 => %7=1 => +1=2 (wrong, should be 1)
	// Let's use getDay() directly:
	// Sun(0) -> 2
	// Mon(1) -> 3
	// Tue(2) -> 4
	// Wed(3) -> 5
	// Thu(4) -> 6
	// Fri(5) -> 7
	// Sat(6) -> 1
	const map = [2, 3, 4, 5, 6, 7, 1];
	return map[d.getDay()];
}
