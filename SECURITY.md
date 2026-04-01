# Security

## Reporting

Report sensitive vulnerabilities through the repository’s private security advisory channel or maintainer contact on the GitHub project page—not in public issues.

## Development practices

- **Zero Runtime Dependencies**: `tsroj` has absolute 0 dependencies at runtime. There is no supply-chain surface threat.
- **Strictly Typed**: TypeScript bounds and custom Errors (`TsrojRangeError`, `TsrojValueError`) prevent mis-aligned floating points, unsafe integer assignments, or prototype pollution vulnerabilities typically found in older javascript engines.
- **Input validation**: All calendar components validate year/month/day ranges intrinsically before evaluating arrays or strings.
- **No Unsafe Parsing**: There is absolutely no `eval` or unsafe JS parsers processing date objects. String formatting operates iteratively left-to-right using fixed memory boundaries mapping to local constants without executing regex callbacks globally.
