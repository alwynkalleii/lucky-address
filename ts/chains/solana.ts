import { base58 } from '@scure/base';

import type { Keys } from '../types';

/**
 * Solana address generation utilities.
 */
export const Solana = {
  /**
   * Standard Solana Derivation Path (BIP-44 with Ed25519)
   * Note: Solana usually uses hardened derivation for all parts of the path.
   */
  path: "m/44'/501'/0'/0'",

  /**
   * Generates a Solana address from keys.
   * @param keys The derived keys object.
   * @returns Base58-encoded Solana address.
   */
  getAddress(keys: Keys): string {
    // Solana address is simply the base58 encoding of the 32-byte ed25519 public key
    // For slip10, the pubKey returned has a leading 0x00 indicating it's compressed/length
    // Wait, let's verify what keys.publicKey has for ed25519:
    // It's created via curve strategy serializePublicKey, which adds a 0x00 byte for SLIP-10 ed25519.
    // Let's strip the leading 0x00 if it's 33 bytes, or just use ed25519.getPublicKey (but the user asked not to regenerate).
    const pubKey = keys.publicKey.length === 33 ? keys.publicKey.slice(1) : keys.publicKey;

    // Ed25519 public keys are 32 bytes
    return base58.encode(pubKey);
  }
};
