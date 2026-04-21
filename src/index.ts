/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as slip10 from './hdkey/slip10';
import * as bip32_ed25519 from './hdkey/bip32_ed25519';
import * as monero from './hdkey/monero';
import * as sr25519 from './hdkey/sr25519';
import { SupportedCurve, Keys } from './types';
import { Bitcoin, BitcoinAddressVariant } from './chains/bitcoin';
import { Ethereum } from './chains/ethereum';
import { Tron } from './chains/tron';
import { Solana } from './chains/solana';
import { Sui, SuiAddressVariant } from './chains/sui';
import { Monero } from './chains/monero';
import { generateMnemonic as bip39GenerateMnemonic, mnemonicToSeedSync } from '@scure/bip39';

async function derivePath(path: string, seed: Uint8Array, curve: SupportedCurve = 'secp256k1'): Promise<Keys> {
  switch (curve) {
    case 'secp256k1':
    case 'ed25519':
    case 'p256':
    case 'curve25519':
      return slip10.derivePath(path, seed, curve);
    case 'bip32-ed25519':
      return bip32_ed25519.derivePath(path, seed);
    case 'monero':
      return monero.getMasterKeyFromSeed(seed); // Path derivation not supported, return root
    case 'sr25519':
      return sr25519.derivePath(path, seed);
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

export async function generateLuckyAddress(mnemonic: string, symbols: string[]): Promise<Record<string, string>> {
  const seed = mnemonicToSeedSync(mnemonic);
  const result: Record<string, string> = {};

  for (const symbol of symbols) {
    const [chain, variant] = symbol.split('_');

    if (chain === 'bitcoin') {
      const btcVariant = (variant || 'p2pkh') as BitcoinAddressVariant;
      const path = Bitcoin.getPath(btcVariant);
      const keys = await derivePath(path, seed, 'secp256k1');
      result[symbol] = Bitcoin.getAddress(keys, btcVariant);
    } else if (chain === 'ethereum') {
      const keys = await derivePath(Ethereum.path, seed, 'secp256k1');
      result[symbol] = Ethereum.getAddress(keys);
    } else if (chain === 'solana') {
      const keys = await derivePath(Solana.path, seed, 'ed25519');
      result[symbol] = Solana.getAddress(keys);
    } else if (chain === 'tron') {
      const keys = await derivePath(Tron.path, seed, 'secp256k1');
      result[symbol] = Tron.getAddress(keys);
    } else if (chain === 'sui') {
      const suiVariant = (variant || 'ed25519') as SuiAddressVariant;
      const path = Sui.getPath(suiVariant);
      let curve: SupportedCurve = 'ed25519';
      if (suiVariant === 'secp256k1') curve = 'secp256k1';
      if (suiVariant === 'secp256r1') curve = 'p256';
      const keys = await derivePath(path, seed, curve);
      result[symbol] = Sui.getAddress(keys, suiVariant);
    } else if (chain === 'monero') {
      // For Monero we don't derive path, just pass the seed
      const isTestnet = variant === 'testnet';
      const keys = await derivePath(Monero.path, seed, 'monero');
      result[symbol] = Monero.getAddress(keys, isTestnet);
    } else {
      throw new Error(`Unsupported chain: ${chain}`);
    }
  }

  return result;
}
