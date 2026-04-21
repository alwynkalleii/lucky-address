# Slip10 Universal

[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

A lightweight, universally compatible, and Tree-Shakable implementation of the **[SLIP-0010](https://github.com/satoshilabs/slips/blob/master/slip-0010.md)** standard for Hierarchical Deterministic (HD) wallets.

## 🌟 Features

- 🌳 **Tree-Shakable**: Bring your own curve! Only bundle the cryptography you actually use.
- 🔒 **Secure Foundation**: Built on top of the audited, zero-dependency [`@noble/curves`](https://github.com/paulmillr/noble-curves) and [`@noble/hashes`](https://github.com/paulmillr/noble-hashes).
- ⚡ **Lightweight**: Pure derivation logic. Optimized for performance and size.
- 🛡️ **Strict Validation**: Automatically prevents insecure unhardened derivations for `ed25519`.

## 📦 Installation

```bash
npm install slip10-universal
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
