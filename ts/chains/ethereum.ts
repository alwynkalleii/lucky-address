import { keccak_256 } from '@noble/hashes/sha3.js';
import { bytesToHex } from '@noble/hashes/utils.js';
import { secp256k1 } from '@noble/curves/secp256k1.js';

import type { Keys } from '../types';


/**
 * Ethereum address generation utilities.
 */
export const Ethereum = {
  /**
   * Standard Ethereum Derivation Path (BIP-44)
   */
  path: "m/44'/60'/0'/0/0",

  /**
   * Generates an Ethereum address from keys.
   * @param keys The derived keys object.
   * @returns Hex-encoded Ethereum address with 0x prefix.
   */
  getAddress(keys: Keys): string {
    // Ethereum uses the hash of the UNCOMPRESSED public key (65 bytes)
    // We decompress the provided public key (which is compressed 33 bytes) 
    // and exclude the first byte (0x04 prefix)
    const pubKey = secp256k1.Point.fromHex(bytesToHex(keys.publicKey)).toBytes(false);
    const hash = keccak_256(pubKey.slice(1));

    // Address is the last 20 bytes of the hash
    const addressBytes = hash.slice(-20);
    return '0x' + bytesToHex(addressBytes);
  }
};
