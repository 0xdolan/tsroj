import {
	gregorianDateToJdn,
	gregorianToJdn,
	islamicToJdn,
	jdnToGregorian,
	jdnToGregorianDate,
	jdnToIslamic,
	jdnToPersian,
	KURDISH_SOLAR_YEAR_OFFSET,
	MAX_SUPPORTED_YEAR,
	MIN_SUPPORTED_YEAR,
	persianToJdn,
	persianWeekdayFromGregorian,
} from "./core/convert";
import { TsrojRangeError, TsrojValueError } from "./exceptions";
import { formatCalendarDate } from "./formatting";
import { CalendarKind, LocaleId, resolveLocaleId } from "./locales";

export enum KurdishEra {
	SOLAR_PERSIAN_OFFSET = "solar_persian_offset",
	FALL_OF_NINEVEH = "fall_of_nineveh",
}

export class KurdishDate {
	public readonly year: number;
	public readonly month: number;
	public readonly day: number;
	public readonly era: KurdishEra;
	private readonly _jdn: number;

	constructor(
		year: number,
		month: number,
		day: number,
		era: KurdishEra = KurdishEra.SOLAR_PERSIAN_OFFSET,
	) {
		if (
			!Number.isInteger(year) ||
			!Number.isInteger(month) ||
			!Number.isInteger(day)
		) {
			throw new TsrojValueError("Year, month, and day must be integers");
		}
		this.era = era;

		// Calculate JDN safely going through Persian layer
		let jalaliYear = year;
		if (era === KurdishEra.SOLAR_PERSIAN_OFFSET) {
			jalaliYear = year - KURDISH_SOLAR_YEAR_OFFSET;
		} else if (era === KurdishEra.FALL_OF_NINEVEH) {
			jalaliYear = year - 1233;
		}

		this.year = year;
		this.month = month;
		this.day = day;
		this._jdn = persianToJdn(jalaliYear, month, day);

		// Validate bounds via gregorian limits
		const [gy, gm, gd] = jdnToGregorian(this._jdn);
		if (gy < MIN_SUPPORTED_YEAR || gy > MAX_SUPPORTED_YEAR) {
			throw new TsrojRangeError(
				`Computed Gregorian Year ${gy} is out of bounds`,
			);
		}
	}

	static fromJdn(
		jdn: number,
		era: KurdishEra = KurdishEra.SOLAR_PERSIAN_OFFSET,
	): KurdishDate {
		const [py, pm, pd] = jdnToPersian(jdn);
		let ky = py;
		if (era === KurdishEra.SOLAR_PERSIAN_OFFSET) {
			ky += KURDISH_SOLAR_YEAR_OFFSET;
		} else if (era === KurdishEra.FALL_OF_NINEVEH) {
			ky += 1233;
		}
		return new KurdishDate(ky, pm, pd, era);
	}

	static fromGregorian(
		d: Date,
		era: KurdishEra = KurdishEra.SOLAR_PERSIAN_OFFSET,
	): KurdishDate {
		const pyJdn = gregorianToJdn(
			d.getFullYear(),
			d.getMonth() + 1,
			d.getDate(),
		);
		return KurdishDate.fromJdn(pyJdn, era);
	}

	static fromPersian(
		year: number,
		month: number,
		day: number,
		era: KurdishEra = KurdishEra.SOLAR_PERSIAN_OFFSET,
	): KurdishDate {
		const jdn = persianToJdn(year, month, day);
		return KurdishDate.fromJdn(jdn, era);
	}

	static fromIslamic(
		year: number,
		month: number,
		day: number,
		era: KurdishEra = KurdishEra.SOLAR_PERSIAN_OFFSET,
	): KurdishDate {
		const jdn = islamicToJdn(year, month, day);
		return KurdishDate.fromJdn(jdn, era);
	}

	static today(era: KurdishEra = KurdishEra.SOLAR_PERSIAN_OFFSET): KurdishDate {
		return KurdishDate.fromGregorian(new Date(), era);
	}

	static fromString(
		str: string,
		era: KurdishEra = KurdishEra.SOLAR_PERSIAN_OFFSET,
	): KurdishDate {
		if (typeof str !== "string" || !/^\d{1,4}-\d{1,2}-\d{1,2}$/.test(str)) {
			throw new TsrojValueError("Invalid string format, expected YYYY-MM-DD");
		}
		const [y, m, d] = str.split("-").map((p) => parseInt(p, 10));
		return new KurdishDate(y, m, d, era);
	}

	toJSON(): string {
		return this.toString();
	}

	toString(): string {
		return `${this.year.toString().padStart(4, "0")}-${this.month.toString().padStart(2, "0")}-${this.day.toString().padStart(2, "0")}`;
	}

	toJdn(): number {
		return this._jdn;
	}

	toJSDate(): Date {
		const [y, m, d] = jdnToGregorian(this._jdn);
		return new Date(Date.UTC(y, m - 1, d)); // Using UTC prevents timezone shift
	}

	toGregorian(): [number, number, number] {
		return jdnToGregorian(this._jdn);
	}

	toPersian(): [number, number, number] {
		return jdnToPersian(this._jdn);
	}

	toIslamic(): [number, number, number] {
		return jdnToIslamic(this._jdn);
	}

	weekdayGregorian(): number {
		// 0=Monday, 6=Sunday for JS? No, JS gets Day is 0=Sun, 1=Mon.
		// Pyroj `date.weekday()` returns 0=Monday. We will return JS standard where 0 is Sunday, or Python standard?
		// User requested natively JS standard where appropriate but compatible.
		// Let's implement Python standard `weekday()` (0=Mon, 6=Sun) and `weekdayPersian()` (1=Sat, 7=Fri).
		const jsDate = this.toJSDate();
		const jsDay = jsDate.getUTCDay(); // 0=Sun, 1=Mon
		return jsDay === 0 ? 6 : jsDay - 1;
	}

	weekdayPersian(): number {
		const jsDate = this.toJSDate();
		return persianWeekdayFromGregorian(jsDate); // 1=Sat, 7=Fri
	}

	strftime(
		formatStr: string,
		opts?: {
			locale?: string | LocaleId;
			kurdishVariant?: string;
			useLocaleDigits?: boolean;
		},
	): string {
		return formatCalendarDate(this, formatStr, {
			calendar: CalendarKind.KURDISH,
			locale: opts?.locale || LocaleId.EN,
			kurdishVariant: opts?.kurdishVariant,
			useLocaleDigits: opts?.useLocaleDigits,
		});
	}
}

export class KurdishDateTime extends KurdishDate {
	public readonly hour: number;
	public readonly minute: number;
	public readonly second: number;
	public readonly millisecond: number;

	constructor(
		year: number,
		month: number,
		day: number,
		hour: number = 0,
		minute: number = 0,
		second: number = 0,
		millisecond: number = 0,
		era: KurdishEra = KurdishEra.SOLAR_PERSIAN_OFFSET,
	) {
		super(year, month, day, era);
		if (
			!Number.isInteger(hour) ||
			!Number.isInteger(minute) ||
			!Number.isInteger(second) ||
			!Number.isInteger(millisecond)
		) {
			throw new TsrojValueError("Time components must be integers");
		}
		if (
			hour < 0 ||
			hour > 23 ||
			minute < 0 ||
			minute > 59 ||
			second < 0 ||
			second > 59 ||
			millisecond < 0 ||
			millisecond > 999
		) {
			throw new TsrojRangeError("Time component out of bounds");
		}
		this.hour = hour;
		this.minute = minute;
		this.second = second;
		this.millisecond = millisecond;
	}

	static fromJSDate(
		d: Date,
		era: KurdishEra = KurdishEra.SOLAR_PERSIAN_OFFSET,
	): KurdishDateTime {
		const kd = KurdishDate.fromGregorian(d, era);
		return new KurdishDateTime(
			kd.year,
			kd.month,
			kd.day,
			d.getHours(),
			d.getMinutes(),
			d.getSeconds(),
			d.getMilliseconds(),
			era,
		);
	}

	static now(
		era: KurdishEra = KurdishEra.SOLAR_PERSIAN_OFFSET,
	): KurdishDateTime {
		return KurdishDateTime.fromJSDate(new Date(), era);
	}

	static fromString(
		str: string,
		era: KurdishEra = KurdishEra.SOLAR_PERSIAN_OFFSET,
	): KurdishDateTime {
		// Expects YYYY-MM-DDTHH:mm:ss.ms
		if (typeof str !== "string" || !str.includes("T")) {
			throw new TsrojValueError(
				"Invalid datetime format, expected YYYY-MM-DDTHH:mm:ss",
			);
		}
		const [datePart, timePart] = str.split("T");
		const dateObj = KurdishDate.fromString(datePart, era);

		const timeReg = /^(\d{1,2}):(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?Z?$/;
		const match = timePart.match(timeReg);
		if (!match) {
			throw new TsrojValueError("Invalid time format, expected HH:mm:ss");
		}

		const h = parseInt(match[1], 10);
		const m = parseInt(match[2], 10);
		const s = parseInt(match[3], 10);
		const ms = match[4] ? parseInt(match[4].padEnd(3, "0"), 10) : 0;
		return new KurdishDateTime(
			dateObj.year,
			dateObj.month,
			dateObj.day,
			h,
			m,
			s,
			ms,
			era,
		);
	}

	toJSON(): string {
		return this.toString();
	}

	toString(): string {
		return `${super.toString()}T${this.hour.toString().padStart(2, "0")}:${this.minute.toString().padStart(2, "0")}:${this.second.toString().padStart(2, "0")}.${this.millisecond.toString().padStart(3, "0")}`;
	}

	toJSDate(): Date {
		const [y, m, d] = this.toGregorian();
		return new Date(
			y,
			m - 1,
			d,
			this.hour,
			this.minute,
			this.second,
			this.millisecond,
		);
	}

	strftime(
		formatStr: string,
		opts?: {
			locale?: string | LocaleId;
			kurdishVariant?: string;
			useLocaleDigits?: boolean;
		},
	): string {
		let out = super.strftime(formatStr, opts);

		// Replace Time strings.
		// This is a minimal set to support basic time formatting, you can expand it
		const P = opts?.locale ? resolveLocaleId(opts.locale) : LocaleId.EN;
		const ampm =
			P === LocaleId.CKB || P === LocaleId.AR || P === LocaleId.FA
				? this.hour < 12
					? "پ.ن"
					: "د.ن"
				: this.hour < 12
					? "AM"
					: "PM"; // Need to actually use getAmPm but kept simple here

		const h12 = this.hour % 12 || 12;

		out = out.replace(/%H/g, this.hour.toString().padStart(2, "0"));
		out = out.replace(/%I/g, h12.toString().padStart(2, "0"));
		out = out.replace(/%M/g, this.minute.toString().padStart(2, "0"));
		out = out.replace(/%S/g, this.second.toString().padStart(2, "0"));
		out = out.replace(/%p/g, ampm);

		return out;
	}
}
