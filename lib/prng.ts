/**
 * XorShift32 PRNG for deterministic avatar generation
 * Provides consistent randomization from a seed value
 */
export class XorShift32 {
	private state: number;

	constructor(seed: number) {
		// Ensure seed is never 0 (would break XorShift)
		this.state = seed === 0 ? 1 : seed >>> 0;
	}

	/**
	 * Generate next random number (0 to 2^32-1)
	 */
	next(): number {
		this.state ^= this.state << 13;
		this.state ^= this.state >>> 17;
		this.state ^= this.state << 5;
		return this.state >>> 0;
	}

	/**
	 * Generate random integer from 0 to max-1
	 */
	int(max: number): number {
		return this.next() % max;
	}

	/**
	 * Pick random element from array
	 */
	pick<T>(array: T[]): T {
		return array[this.int(array.length)];
	}

	/**
	 * Return true with probability p (0-1)
	 */
	chance(p: number): boolean {
		return this.next() / 0x100000000 < p;
	}

	/**
	 * Generate random float between 0 and 1
	 */
	float(): number {
		return this.next() / 0x100000000;
	}
}

/**
 * Convert email to deterministic seed
 */
export function emailToSeed(email: string, salt = ""): number {
	const normalized = email.trim().toLowerCase() + salt;

	// Simple MD5-like hash implementation
	let hash = 0;
	for (let i = 0; i < normalized.length; i++) {
		const char = normalized.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}

	return Math.abs(hash);
}
