# Lucky Address

A lightweight, universally compatible, and Tree-Shakable implementation of the **[SLIP-0010](https://github.com/satoshilabs/slips/blob/master/slip-0010.md)** standard for Hierarchical Deterministic (HD) wallets.

## 🌟 Features

## 📦 Installation

```bash
pnpm install lucky-address
```

## 🚀 Quick Start

### Solana (Ed25519)

```typescript
import { Slip10 } from 'slip10-universal';
import { ed25519Provider } from 'slip10-universal/curves/ed25519';

// 64-byte seed from BIP-39 mnemonic
const seed = new Uint8Array(64); 
const masterNode = Slip10.fromSeed(seed, ed25519Provider);

// Derive child path (Solana: m/44'/501'/0'/0')
const childNode = masterNode.derivePath("m/44'/501'/0'/0'");

console.log('Private Key:', childNode.privateKey);
```

### Bitcoin (Secp256k1)

```typescript
import { Slip10 } from 'slip10-universal';
import { secp256k1Provider } from 'slip10-universal/curves/secp256k1';

const masterNode = Slip10.fromSeed(seed, secp256k1Provider);
const btcNode = masterNode.derivePath("m/44'/0'/0'/0/0");

console.log('Private Key:', btcNode.privateKey);
```

## 📄 License

Apache-2.0
