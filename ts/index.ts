import { generateMnemonic as bip39GenerateMnemonic, mnemonicToSeedSync } from '@scure/bip39';

import * as hdkey from './hdkey';
import * as chains from './chains';

import type { SupportedCurve, Keys } from './types';

function derivePath(path: string, seed: Uint8Array, curve: SupportedCurve = 'secp256k1'): Keys {
  switch (curve) {
    case 'secp256k1':
    case 'ed25519':
    case 'p256':
    case 'curve25519':
      return hdkey.slip10.derivePath(path, seed, curve);
    case 'bip32-ed25519':
      return hdkey.bip32_ed25519.derivePath(path, seed);
    case 'monero':
      return hdkey.monero.getMasterKeyFromSeed(seed); // Path derivation not supported, return root
    default:
      throw new Error(`Unsupported curve or standard: ${curve}`);
  }
}

export function generateMnemonic(wordlist: string[], length: number = 12): string {
  // Correctly calculating the strength (entropy bits) based on mnemonic length.
  // 1 word = 11 bits. The formula (length / 3) calculates the checksum bits.
  // Total bits (length * 11) - Checksum bits (length / 3) = Entropy bits (strength).
  const strength = length * 11 - (length / 3);
  return bip39GenerateMnemonic(wordlist, strength);
}

export function generateLuckyAddress(mnemonic: string, symbols: string[]): Record<string, string> {
  const seed = mnemonicToSeedSync(mnemonic);
  const result: Record<string, string> = {};

  for (const symbol of symbols) {
    const [chain, variant] = symbol.split('_');

    if (chain === 'bitcoin') {
      const btcVariant = (variant || 'p2pkh') as chains.BitcoinAddressVariant;
      const path = chains.Bitcoin.getPath(btcVariant);
      const keys = derivePath(path, seed, 'secp256k1');
      result[symbol] = chains.Bitcoin.getAddress(keys, btcVariant);
    } else if (chain === 'ethereum') {
      const keys = derivePath(chains.Ethereum.path, seed, 'secp256k1');
      result[symbol] = chains.Ethereum.getAddress(keys);
    } else if (chain === 'solana') {
      const keys = derivePath(chains.Solana.path, seed, 'ed25519');
      result[symbol] = chains.Solana.getAddress(keys);
    } else if (chain === 'tron') {
      const keys = derivePath(chains.Tron.path, seed, 'secp256k1');
      result[symbol] = chains.Tron.getAddress(keys);
    } else if (chain === 'sui') {
      const suiVariant = (variant || 'ed25519') as chains.SuiAddressVariant;
      const path = chains.Sui.getPath(suiVariant);
      let curve: SupportedCurve = 'ed25519';
      if (suiVariant === 'secp256k1') curve = 'secp256k1';
      if (suiVariant === 'secp256r1') curve = 'p256';
      const keys = derivePath(path, seed, curve);
      result[symbol] = chains.Sui.getAddress(keys, suiVariant);
    } else if (chain === 'monero') {
      const keys = derivePath(chains.Monero.path, seed, 'monero');
      result[symbol] = chains.Monero.getAddress(keys);
    } else {
      throw new Error(`Unsupported chain: ${chain}`);
    }
  }

  return result;
}
