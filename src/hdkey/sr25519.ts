/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { cryptoWaitReady, sr25519DeriveHard, sr25519DeriveSoft, sr25519PairFromSeed } from '@polkadot/util-crypto';
import { Keys } from '../types';
import { HARDENED_OFFSET, parsePath } from '../utils/path';

let asyncReady: Promise<boolean> | null = null;

async function ensureReady() {
  if (!asyncReady) asyncReady = cryptoWaitReady();
  return asyncReady;
}

/**
 * Generates a master node from a seed using sr25519.
 */
export async function getMasterKeyFromSeed(seed: Uint8Array): Promise<Keys> {
  await ensureReady();
  const fullSeed = seed.length > 32 ? seed.slice(0, 32) : seed;
  const { publicKey, secretKey } = sr25519PairFromSeed(fullSeed);
  const privateKey = secretKey.slice(0, 32);
  const chainCode = secretKey.slice(32, 64);
  return { key: privateKey, chainCode, publicKey };
}

/**
 * Derives a child node from a parent node using sr25519.
 */
export async function deriveChildKey(parent: Keys, index: number): Promise<Keys> {
  await ensureReady();
  const isHardened = index >= HARDENED_OFFSET;
  
  // Reconstruct the 64-byte secret key expected by polkadot (pair = secret + chainCode)
  const fullSecretKey = new Uint8Array(64);
  fullSecretKey.set(parent.key, 0);
  fullSecretKey.set(parent.chainCode, 32);
  
  // Polkadot derive functions expect an object with a secretKey property
  const parentPair = { 
    secretKey: fullSecretKey,
    publicKey: parent.publicKey || new Uint8Array(32) // Not strictly needed for secret derivation but good practice
  };
  
  const chainCodeBytes = new Uint8Array(32);
  const dv = new DataView(chainCodeBytes.buffer);
  dv.setUint32(0, index, true);
  
  let childKeyPair: { secretKey: Uint8Array, publicKey: Uint8Array };
  if (isHardened) {
    childKeyPair = sr25519DeriveHard(parentPair, chainCodeBytes);
  } else {
    childKeyPair = sr25519DeriveSoft(parentPair, chainCodeBytes);
  }
  
  const privateKey = childKeyPair.secretKey.slice(0, 32);
  const chainCode = childKeyPair.secretKey.slice(32, 64);
  const publicKey = childKeyPair.publicKey;
  
  return { key: privateKey, chainCode, publicKey };
}

/**
 * Derives a path using sr25519.
 */
export async function derivePath(path: string, seed: Uint8Array): Promise<Keys> {
  const indices = parsePath(path);
  let current = await getMasterKeyFromSeed(seed);
  for (const index of indices) {
    current = await deriveChildKey(current, index);
  }
  return current;
}
