/**
 * Provably Fair Outcome Cryptographic Verifier
 * Uses SHA-256 to generate and verify unpredictable, unmanipulated game outcomes.
 */

export async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSeed(): string {
  const chars = '0123456789abcdefABCDEF';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Calculates deterministic outcome from seeds:
 * Number: 0 to 9
 * Size: 0-4 = SMALL, 5-9 = BIG
 * Color: 1,3,7,9 = GREEN; 2,4,6,8 = RED; 0,5 = VIOLET
 */
export async function calculateRoundOutcome(serverSeed: string, roundNumber: number, clientSeed: string) {
  const rawInput = `${serverSeed}-${roundNumber}-${clientSeed}`;
  const hash = await sha256(rawInput);
  
  // Extract integer from first 8 chars of hash
  const subHex = hash.substring(0, 8);
  const intVal = parseInt(subHex, 16);
  const resultNumber = intVal % 10;

  const resultSize: 'BIG' | 'SMALL' = resultNumber >= 5 ? 'BIG' : 'SMALL';
  
  let resultColor: 'RED' | 'GREEN' | 'VIOLET' = 'GREEN';
  if (resultNumber === 0 || resultNumber === 5) {
    resultColor = 'VIOLET';
  } else if (resultNumber % 2 === 0) {
    resultColor = 'RED';
  } else {
    resultColor = 'GREEN';
  }

  return {
    hash,
    resultNumber,
    resultSize,
    resultColor
  };
}
