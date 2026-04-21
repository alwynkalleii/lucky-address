/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { blake2b } from '@noble/hashes/blake2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { Keys } from '../types';

export type SuiAddressVariant = 'ed25519' | 'secp256k1' | 'secp256r1';

export const SUI_PATHS = {
  ed25519: "m/44'/784'/0'/0'/0'",
  secp256k1: "m/54'/784'/0'/0/0",
  secp256r1: "m/74'/784'/0'/0/0",
} as const;

export const Sui = {
  getPath(variant: SuiAddressVariant): string {
    return SUI_PATHS[variant];
  },

  getAddress(keys: Keys, variant: SuiAddressVariant = 'ed25519'): string {
    let flag: Uint8Array;
    let pubKeyBytes: Uint8Array;

    if (variant === 'ed25519') {
      flag = new Uint8Array([0x00]);
      // Our ed25519 public keys from slip10 might be prefixed with 0x00 (length 33)
      pubKeyBytes = keys.publicKey.length === 33 ? keys.publicKey.slice(1) : keys.publicKey;
    } else if (variant === 'secp256k1') {
      flag = new Uint8Array([0x01]);
      pubKeyBytes = keys.publicKey; // should be 33 bytes compressed
    } else if (variant === 'secp256r1') {
      flag = new Uint8Array([0x02]);
      pubKeyBytes = keys.publicKey; // should be 33 bytes compressed
    } else {
      throw new Error(`Unsupported Sui address variant: ${variant}`);
    }

    const data = new Uint8Array(1 + pubKeyBytes.length);
    data.set(flag, 0);
    data.set(pubKeyBytes, 1);

    const hash = blake2b(data, { dkLen: 32 });
    return '0x' + bytesToHex(hash);
  }
};
