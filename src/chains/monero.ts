/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { keccak_256 } from '@noble/hashes/sha3.js';
import { base58xmr } from '@scure/base';
import { ed25519 } from '@noble/curves/ed25519.js';
import { Keys } from '../types';

export const Monero = {
  // Monero doesn't use standard BIP-44 path derivation in the same way,
  // but we can provide a placeholder or return an empty string.
  path: "",

  /**
   * Generates a Monero standard address from keys.
   * @param keys The derived keys object.
   * @param isTestnet True if generating a testnet address (network byte 0x35).
   * @returns Monero Base58 Address string.
   */
  getAddress(keys: Keys, isTestnet: boolean = false): string {
    const networkByte = isTestnet ? 0x35 : 0x12;

    const publicSpendKey = keys.publicKey;
    // In our hdkey/monero implementation, the private view key is stored in chainCode
    const publicViewKey = ed25519.getPublicKey(keys.chainCode);

    const addressData = new Uint8Array(65);
    addressData[0] = networkByte;
    addressData.set(publicSpendKey, 1);
    addressData.set(publicViewKey, 33);

    const checksum = keccak_256(addressData).slice(0, 4);

    const fullAddress = new Uint8Array(69);
    fullAddress.set(addressData, 0);
    fullAddress.set(checksum, 65);

    return base58xmr.encode(fullAddress);
  }
};
