/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { sha256 } from '@noble/hashes/sha2.js';
import { ripemd160 } from '@noble/hashes/legacy.js';
import { base58check, bech32, bech32m } from '@scure/base';
import { secp256k1 } from '@noble/curves/secp256k1.js';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils.js';
import { Keys } from '../types';

/**
 * Bitcoin Address Variants
 */
export type BitcoinAddressVariant = 'p2pkh' | 'p2sh' | 'p2wpkh' | 'p2tr';

/**
 * Standard Bitcoin Derivation Paths
 */
export const BITCOIN_PATHS = {
  p2pkh: "m/44'/0'/0'/0/0",
  p2sh: "m/49'/0'/0'/0/0",
  p2wpkh: "m/84'/0'/0'/0/0",
  p2tr: "m/86'/0'/0'/0/0",
} as const;

/**
 * Bitcoin address generation utilities.
 */
export const Bitcoin = {
  /**
   * Generates a Bitcoin address from keys.
   * @param keys The derived keys object.
   * @param variant The address type to generate.
   * @returns The encoded Bitcoin address string.
   */
  getAddress(keys: Keys, variant: BitcoinAddressVariant = 'p2pkh'): string {
    const compressedPubKey = keys.publicKey;
    const hash160 = ripemd160(sha256(compressedPubKey));

    switch (variant) {
      case 'p2pkh':
        return base58check(sha256).encode(new Uint8Array([0x00, ...hash160]));

      case 'p2sh': {
        const redeemScript = new Uint8Array(22);
        redeemScript[0] = 0x00;
        redeemScript[1] = 0x14;
        redeemScript.set(hash160, 2);
        const scriptHash = ripemd160(sha256(redeemScript));
        return base58check(sha256).encode(new Uint8Array([0x05, ...scriptHash]));
      }

      case 'p2wpkh': {
        const words = bech32.toWords(hash160);
        return bech32.encode('bc', [0, ...words]);
      }

      case 'p2tr': {
        // Taproot using BIP86 (tweaked key)
        const pub = secp256k1.Point.fromHex(bytesToHex(compressedPubKey));
        const xOnly = pub.toHex(true).slice(2);
        const xOnlyBytes = hexToBytes(xOnly);

        const tagBytes = new TextEncoder().encode('TapTweak');
        const tagHash = sha256(tagBytes);
        const t = new Uint8Array(tagHash.length * 2);
        t.set(tagHash, 0);
        t.set(tagHash, tagHash.length);
        
        const tweak = sha256.create().update(t).update(xOnlyBytes).digest();
        const hasEvenY = pub.toAffine().y % 2n === 0n;
        const P = hasEvenY ? pub : pub.negate();
        const tweakInt = BigInt('0x' + bytesToHex(tweak));
        
        // Output public key Q = P + tweak * G
        const Q = P.add(secp256k1.Point.BASE.multiply(tweakInt));
        const tweakedXOnly = hexToBytes(Q.toHex(true).slice(2));
        
        const words = bech32m.toWords(tweakedXOnly);
        return bech32m.encode('bc', [1, ...words]);
      }

      default:
        throw new Error(`Unsupported Bitcoin address variant: ${variant}`);
    }
  },

  /**
   * Returns the standard derivation path for a given variant.
   */
  getPath(variant: BitcoinAddressVariant): string {
    return BITCOIN_PATHS[variant];
  }
};
