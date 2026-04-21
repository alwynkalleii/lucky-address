import { describe, it, expect } from 'vitest';
import { generateLuckyAddress } from '../src/index';

describe('Address Generation with Known Vectors', () => {
  it('generates correct addresses for standard test vector', async () => {
    // Standard test vector mnemonic
    const mnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    
    // Test multiple chains and variants
    const symbols = [
      "bitcoin_p2pkh",
      "bitcoin_p2sh",
      "bitcoin_p2wpkh",
      "bitcoin_p2tr",
      "ethereum",
      "solana",
      "tron",
      "sui_ed25519",
    ];

    const addresses = await generateLuckyAddress(mnemonic, symbols);

    const expected = {
      "bitcoin_p2pkh": "1LqBGSKuX5yYUonjxT5qGfpUsXKYYWeabA",
      "bitcoin_p2sh": "37VucYSaXLCAsxYyAPfbSi9eh4iEcbShgf",
      "bitcoin_p2wpkh": "bc1qcr8te4kr609gcawutmrza0j4xv80jy8z306fyu",
      "bitcoin_p2tr": "bc1p5cyxnuxmeuwuvkwfem96lqzszd02n6xdcjrs20cac6yqjjwudpxqkedrcr",
      "ethereum": "0x9858effd232b4033e47d90003d41ec34ecaeda94",
      "solana": "HAgk14JpMQLgt6rVgv7cBQFJWFto5Dqxi472uT3DKpqk",
      "tron": "TUEZSdKsoDHQMeZwihtdoBiN46zxhGWYdH",
      "sui_ed25519": "0x5e93a736d04fbb25737aa40bee40171ef79f65fae833749e3c089fe7cc2161f1"
    };

    for (const s of symbols) {
      expect(addresses[s]).toBe(expected[s as keyof typeof expected]);
    }
  });
});
