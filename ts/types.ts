/**
 * Supported curves and derivation standards.
 */
export type SupportedCurve =
  | 'secp256k1'
  | 'ed25519'
  | 'p256'
  | 'curve25519'
  | 'bip32-ed25519'
  | 'sr25519'
  | 'monero';

/**
 * Plain object representing derived keys and chain code.
 */
export interface Keys {
  /** The private key. */
  privateKey: Uint8Array;
  /** The 32-byte chain code. */
  chainCode: Uint8Array;
  /** Public key associated with the private key. */
  publicKey: Uint8Array;
}

/**
 * Options for derivation functions.
 */
export interface DeriveOptions {
  /** Root seed for path derivation. */
  seed?: Uint8Array;
  /** Path for derivation (e.g., "m/44'/0'/0'"). */
  path?: string;
  /** Curve or standard to use. */
  curve?: SupportedCurve;
}

/**
 * Strategy interface for curve-specific logic remains useful internally
 * but we will expose functional wrappers.
 */
export interface CurveStrategy {
  masterSeed: string;
  supportsUnhardened: boolean;
  getPublicKey(privateKey: Uint8Array): Uint8Array;
  serializePublicKey(publicKey: Uint8Array): Uint8Array;
  isValidPrivateKey(privateKey: Uint8Array): boolean;
  computeChildPrivateKey(IL: Uint8Array, parentPrivateKey: Uint8Array): Uint8Array;
}
