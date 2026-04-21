/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { keccak_256 } from '@noble/hashes/sha3.js';
import { ed25519 } from '@noble/curves/ed25519.js';
import { Keys } from '../types';

/**
 * Generates a Monero master node from a seed.
 */
export function getMasterKeyFromSeed(seed: Uint8Array): Keys {
  const spendKey = reduceScalar(keccak_256(seed));
  const viewKey = reduceScalar(keccak_256(spendKey));
  const pubKey = ed25519.getPublicKey(spendKey);
  
  return { key: spendKey, chainCode: viewKey, publicKey: pubKey };
}

function reduceScalar(scalar: Uint8Array): Uint8Array {
  const L = BigInt('0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed');
  let res = 0n;
  for (let i = 0; i < scalar.length; i++) {
    res += BigInt(scalar[i]) << BigInt(i * 8);
  }
  const reduced = res % L;
  const bytes = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
     bytes[i] = Number((reduced >> BigInt(i * 8)) & 0xffn);
  }
  return bytes;
}

export function getPublicKey(privateKey: Uint8Array): Uint8Array {
  return ed25519.getPublicKey(privateKey);
}
