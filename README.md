<div align="center">
  <img src="./assets/logo.png" alt="tsroj logo" width="250" />
</div>

# tsroj

**tsroj** is the definitive TypeScript library for the Kurdish **solar** calendar. It allows for highly accurate date conversions to and from **Gregorian**, **Persian (Jalali)**, and **Tabular Islamic** dates natively using JavaScript runtime APIs.

Built explicitly using the standard `Date` object and JS `Math` constants, it serves as a lightweight, robust drop-in substitution in any Node or Browser application. **Runtime dependencies: none.**

- **Engine**: Node.js & Browser Compatible
- **Ecosystem**: `pnpm` / `npm`
- **Supported year range**: `1..9999` (aligned with native limits)

## Quick Start

`KurdishDate` and `KurdishDateTime` integrate cleanly with existing JS standard ecosystem methods.

```bash
npm install @0xdolan/tsroj
# or
pnpm install @0xdolan/tsroj
```

### Basic Creation and Conversions
```typescript
import { KurdishDate, KurdishDateTime, KurdishEra } from '@0xdolan/tsroj';

// 1. Start from a Gregorian Date
const d = new Date(2026, 2, 23); // March 23, 2026
const kd = KurdishDate.fromGregorian(d);

console.log(kd.year, kd.month, kd.day);  // Output: 2726 1 3

// 2. Or initialize natively in Kurdish
const kdNative = new KurdishDate(2726, 1, 3);

// 3. Effortless Conversions to other systems
console.log(kdNative.toGregorian());  // Output: [2026, 3, 23]
console.log(kdNative.toPersian());    // Output: [1405, 1, 3]
console.log(kdNative.toIslamic());    // Output: [1447, 10, 4]

// 4. Time components natively supported
const now = KurdishDateTime.now();
console.log(`${now.year}-${now.month}-${now.day} ${now.hour}:${now.minute}`);
```

### Beautiful Formatting (`strftime`)

Formatting strings directly maps out month and weekday translations depending on the selected locale.
Supported locales: `ckb` (Sorani), `kmr` (Kurmanji), `fa` (Persian), `ar` (Arabic), `tr` (Turkish), `en` (English).

```typescript
import { KurdishDate } from '@0xdolan/tsroj';

const kd = new KurdishDate(2726, 1, 25);

// English evaluation
console.log(kd.strftime("%A, %d %B %Y", { locale: "en" }));
// Output: Tuesday, 25 Xakelêwe 2726

// Sorani evaluation
console.log(kd.strftime("%A, %d %B %Y", { locale: "ckb" }));
// Output: سێشەممە, 25 خاکەلێوە 2726

// Kurmanji evaluation
console.log(kd.strftime("%A, %d %B %Y", { locale: "kmr" }));
// Output: Sêşem, 25 Nîsan 2726
```

## Security

`tsroj` avoids memory leaks, Prototype pollution, and `eval()` arbitrary injection attacks.
The JSON locale dictionary is statically bound. See `SECURITY.md` for our zero-dependency ecosystem guarantees.

## License

GPL-3.0.
