export function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

export function arrayEquals(a, b) {
	return Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((val, index) => val === b[index]);
}
