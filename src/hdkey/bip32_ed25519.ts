/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { hmac } from '@noble/hashes/hmac.js';
import { sha512 } from '@noble/hashes/sha2.js';
import { ed25519 } from '@noble/curves/ed25519.js';
import { Keys } from '../types';
import { HARDENED_OFFSET, parsePath } from '../utils/path';

/**
 * Generates a master node from a seed using BIP32-Ed25519.
 */
export function getMasterKeyFromSeed(seed: Uint8Array): Keys {
  const key = new TextEncoder().encode("ed25519 seed");
  const I = hmac(sha512, key, seed);
  const IL = I.slice(0, 32);
  const IR = I.slice(32, 64);
  
  // Clamp the secret key
  IL[0] &= 248;
  IL[31] &= 63;
  IL[31] |= 64;
  
  const pubKey = ed25519.getPublicKey(IL);
  return { key: IL, chainCode: IR, publicKey: pubKey };
}

/**
 * Derives a child node from a parent node using BIP32-Ed25519.
 */
export function deriveChildKey(parent: Keys, index: number): Keys {
  const isHardened = index >= HARDENED_OFFSET;
  const data = new Uint8Array(1 + 32 + 4);
  
  if (isHardened) {
    data[0] = 0x00;
    data.set(parent.key, 1);
  } else {
    data[0] = 0x02; 
    const pub = ed25519.getPublicKey(parent.key);
    data.set(pub, 1);
  }
  
  const view = new DataView(data.buffer);
  view.setUint32(1 + 32, index, true); // Little-endian
  
  const I = hmac(sha512, parent.chainCode, data);
  const IL = I.slice(0, 32);
  const IR = I.slice(32, 64);
  
  if (!isHardened) {
      const childPriv = addScalars(parent.key, IL);
      const childPub = ed25519.getPublicKey(childPriv);
      return { key: childPriv, chainCode: IR, publicKey: childPub };
  }

  const pubKey = ed25519.getPublicKey(IL);
  return { key: IL, chainCode: IR, publicKey: pubKey };
}

/**
 * Derives a path using BIP32-Ed25519.
 */
export function derivePath(path: string, seed: Uint8Array): Keys {
  const indices = parsePath(path);
  let current = getMasterKeyFromSeed(seed);
  for (const index of indices) {
    current = deriveChildKey(current, index);
  }
  return current;
}

function addScalars(a: Uint8Array, b: Uint8Array): Uint8Array {
    const bn1 = bytesToBigInt(a);
    const bn2 = bytesToBigInt(b);
    const L = BigInt("7237005577332262213973186563042994240857116359379907606001950938285454250989"); 
    const res = (bn1 + bn2) % L;
    return bigIntToBytes(res);
}

function bytesToBigInt(bytes: Uint8Array): bigint {
    let res = 0n;
    for (let i = 0; i < bytes.length; i++) {
        res += BigInt(bytes[i]) << BigInt(i * 8);
    }
    return res;
}

function bigIntToBytes(n: bigint): Uint8Array {
    const res = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
        res[i] = Number((n >> BigInt(i * 8)) & 0xffn);
    }
    return res;
}
