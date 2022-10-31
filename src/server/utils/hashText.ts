import * as crypto from 'crypto';

const mask = 2147483647;

/**
 * Get a 32-bit representation of a long string of text for hashing purposes.
 * @param text 
 * @returns 
 */
export function hashText(text: string) {

    // Postgres serial type is 1-2147483647, aka 31 bits. 
    // You can pick any X bits from a sha hash and it will be a cryptographically secure 
    // X-bit hash. So we're picking 31 bits and calling that a serial number. 
    const hash = crypto.createHash('sha256').update(text.trim()).digest('hex');
    const thirtyTwoBits = parseInt(hash.substring(0, 8), 16);
    const thirtyOneBits = mask & thirtyTwoBits;
    return thirtyOneBits;
}
