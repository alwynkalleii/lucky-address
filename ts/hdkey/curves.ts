import { secp256k1 } from '@noble/curves/secp256k1.js';
import { ed25519 } from '@noble/curves/ed25519.js';
import { p256 } from '@noble/curves/nist.js';

import type { CurveStrategy, SupportedCurve } from '../types';

const bytesToBigInt = (bytes: Uint8Array) => BigInt('0x' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join(''));
const bigIntToBytes = (num: bigint) => {
  let hex = num.toString(16);
  if (hex.length % 2 !== 0) hex = '0' + hex;
  const bytes = new Uint8Array(32);
  const hexBytes = hex.match(/.{1,2}/g) || [];
  for (let i = 0; i < hexBytes.length; i++) {
    bytes[32 - hexBytes.length + i] = parseInt(hexBytes[i], 16);
  }
  return bytes;
};

export const Secp256k1Strategy: CurveStrategy = {
  masterSeed: "Bitcoin seed",
  supportsUnhardened: true,
  getPublicKey: (priv) => secp256k1.getPublicKey(priv, true),
  serializePublicKey: (pub) => pub,
  isValidPrivateKey: (priv) => {
    const n = secp256k1.Point.CURVE().n;
    const val = bytesToBigInt(priv);
    return val > 0n && val < n;
  },
  computeChildPrivateKey: (IL, parentPriv) => {
    const n = secp256k1.Point.CURVE().n;
    const val = (bytesToBigInt(IL) + bytesToBigInt(parentPriv)) % n;
    return bigIntToBytes(val);
  }
};

export const Ed25519Strategy: CurveStrategy = {
  masterSeed: "ed25519 seed",
  supportsUnhardened: false,
  getPublicKey: (priv) => ed25519.getPublicKey(priv),
  serializePublicKey: (pub) => {
    const res = new Uint8Array(33);
    res[0] = 0x00;
    res.set(pub, 1);
    return res;
  },
  isValidPrivateKey: () => true,
  computeChildPrivateKey: (IL) => IL
};

export const Nist256p1Strategy: CurveStrategy = {
  masterSeed: "Nist256p1 seed",
  supportsUnhardened: true,
  getPublicKey: (priv) => p256.getPublicKey(priv, true),
  serializePublicKey: (pub) => pub,
  isValidPrivateKey: (priv) => {
    const n = p256.Point.CURVE().n;
    const val = bytesToBigInt(priv);
    return val > 0n && val < n;
  },
  computeChildPrivateKey: (IL, parentPriv) => {
    const n = p256.Point.CURVE().n;
    const val = (bytesToBigInt(IL) + bytesToBigInt(parentPriv)) % n;
    return bigIntToBytes(val);
  }
};

export const Curve25519Strategy: CurveStrategy = {
  masterSeed: "ed25519 seed",
  supportsUnhardened: false,
  getPublicKey: (priv) => ed25519.getPublicKey(priv), // Use ed25519 point for derivation
  serializePublicKey: (pub) => {
    const res = new Uint8Array(33);
    res[0] = 0x00;
    res.set(pub, 1);
    return res;
  },
  isValidPrivateKey: () => true,
  computeChildPrivateKey: (IL) => IL
};

export function getStrategy(curve: SupportedCurve): CurveStrategy {
  switch (curve) {
    case 'secp256k1': return Secp256k1Strategy;
    case 'ed25519': return Ed25519Strategy;
    case 'p256': return Nist256p1Strategy;
    case 'curve25519': return Curve25519Strategy;
    default: throw new Error(`Curve ${curve} not supported by SLIP-10`);
  }
}
