import { keccak_256 } from '@noble/hashes/sha3.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { createBase58check } from '@scure/base';
import { secp256k1 } from '@noble/curves/secp256k1.js';

import type { Keys } from '../types';


/**
 * Tron address generation utilities.
 */
export const Tron = {
  /**
   * Standard Tron Derivation Path (BIP-44)
   */
  path: "m/44'/195'/0'/0/0",

  /**
   * Generates a Tron address from keys.
   * @param keys The derived keys object.
   * @returns Base58Check-encoded Tron address (starts with T).
   */
  getAddress(keys: Keys): string {
    // Tron address is similar to Ethereum but with a different prefix and encoding
    // 1. Get uncompressed pubkey (65 bytes) from the given public key
    const pubKey = secp256k1.Point.fromHex(bytesToHex(keys.publicKey)).toBytes(false);

    // 2. Keccak256 hash of the 64 bytes (exclude 0x04)
    const hash = keccak_256(pubKey.slice(1));

    // 3. Take last 20 bytes
    const addressBytes = hash.slice(-20);

    // 4. Prepend 0x41 (65) for Mainnet
    const tronBytes = new Uint8Array(21);
    tronBytes[0] = 0x41;
    tronBytes.set(addressBytes, 1);

    // 5. Base58Check encode
    return createBase58check(sha256).encode(tronBytes);
  }
};
