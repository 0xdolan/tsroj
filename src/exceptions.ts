export class TsrojError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
		// Set the prototype explicitly for extending built-in Error in TS
		Object.setPrototypeOf(this, new.target.prototype);
	}
}

export class TsrojRangeError extends TsrojError {
	constructor(message: string) {
		super(message);
	}
}

export class TsrojValueError extends TsrojError {
	constructor(message: string) {
		super(message);
	}
}
