import { hmac } from '@noble/hashes/hmac.js';
import { sha512 } from '@noble/hashes/sha2.js';

import { getStrategy } from './curves';
import { parsePath, HARDENED_OFFSET } from '../utils/path';

import type { Keys, SupportedCurve } from '../types';

/**
 * Generates a master key from a seed using SLIP-10.
 */
export function getMasterKeyFromSeed(seed: Uint8Array, curve: SupportedCurve): Keys {
  if (seed.length < 16 || seed.length > 64) {
    throw new Error('Seed length must be between 16 and 64 bytes');
  }

  const strategy = getStrategy(curve);
  const key = new TextEncoder().encode(strategy.masterSeed);
  let data = seed;
  let I: Uint8Array;
  let IL: Uint8Array;
  let IR: Uint8Array;

  while (true) {
    I = hmac(sha512, key, data);
    IL = I.slice(0, 32);
    IR = I.slice(32, 64);

    if (strategy.isValidPrivateKey(IL)) {
      break;
    }
    data = I;
  }

  const pubKey = strategy.getPublicKey(IL);
  return { privateKey: IL, chainCode: IR, publicKey: pubKey };
}

/**
 * Derives a child key from a parent key using SLIP-10.
 */
export function deriveChildKey(parent: Keys, index: number, curve: SupportedCurve): Keys {
  const strategy = getStrategy(curve);
  const isHardened = index >= HARDENED_OFFSET;

  if (!isHardened && !strategy.supportsUnhardened) {
    throw new Error(`${strategy.masterSeed} only supports hardened derivation. Indices must be >= 2^31.`);
  }

  const data = new Uint8Array(37);
  if (isHardened) {
    data[0] = 0x00;
    data.set(parent.privateKey, 1);
  } else {
    const pub = strategy.getPublicKey(parent.privateKey);
    data.set(strategy.serializePublicKey(pub), 0);
  }

  const view = new DataView(data.buffer);
  view.setUint32(33, index, false); // Big-endian

  let I: Uint8Array;
  let IL: Uint8Array;
  let IR: Uint8Array;
  let childPriv: Uint8Array;

  let hkey = parent.chainCode;
  let hdata = data;

  while (true) {
    I = hmac(sha512, hkey, hdata);
    IL = I.slice(0, 32);
    IR = I.slice(32, 64);

    if (strategy.isValidPrivateKey(IL)) {
      childPriv = strategy.computeChildPrivateKey(IL, parent.privateKey);
      if (strategy.isValidPrivateKey(childPriv)) {
        break;
      }
    }
    hdata = new Uint8Array(2 + I.length);
    hdata[0] = 0x01;
    hdata.set(I, 1);
  }

  const pubKey = strategy.getPublicKey(childPriv);
  return { privateKey: childPriv, chainCode: IR, publicKey: pubKey };
}

/**
 * Derives a key from a path using SLIP-10.
 */
export function derivePath(path: string, seed: Uint8Array, curve: SupportedCurve): Keys {
  const indices = parsePath(path);
  let current = getMasterKeyFromSeed(seed, curve);
  for (const index of indices) {
    current = deriveChildKey(current, index, curve);
  }
  return current;
}
