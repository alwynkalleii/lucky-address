import { describe, it, expect } from 'vitest';
import { getMasterKeyFromSeed, derivePath } from '../ts/hdkey/slip10';
import { hexToBytes, bytesToHex } from '@noble/hashes/utils.js';

describe('SLIP-10 Test Vectors', () => {
  describe('secp256k1 - Vector 1', () => {
    const seed = hexToBytes('000102030405060708090a0b0c0d0e0f');

    it('should derive correctly for chain m', async () => {
      const root = await getMasterKeyFromSeed(seed, 'secp256k1');
      expect(bytesToHex(root.privateKey)).toBe('e8f32e723decf4051aefac8e2c93c9c5b214313817cdb01a1494b917c8436b35');
      expect(bytesToHex(root.chainCode)).toBe('873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508');
    });

    it("should derive correctly for chain m/0'", async () => {
      const child = await derivePath("m/0'", seed, 'secp256k1');
      expect(bytesToHex(child.privateKey)).toBe('edb2e14f9ee77d26dd93b4ecede8d16ed408ce149b6cd80b0715a2d911a0afea');
      expect(bytesToHex(child.chainCode)).toBe('47fdacbd0f1097043b78c63c20c34ef4ed9a111d980047ad16282c7ae6236141');
    });
  });

  describe('nist256p1 - Vector 1', () => {
    const seed = hexToBytes('000102030405060708090a0b0c0d0e0f');

    it('should derive correctly for chain m', async () => {
      const root = await getMasterKeyFromSeed(seed, 'p256');
      expect(bytesToHex(root.privateKey)).toBe('612091aaa12e22dd2abef664f8a01a82cae99ad7441b7ef8110424915c268bc2');
      expect(bytesToHex(root.chainCode)).toBe('beeb672fe4621673f722f38529c07392fecaa61015c80c34f29ce8b41b3cb6ea');
    });

    it("should derive correctly for chain m/0'", async () => {
      const child = await derivePath("m/0'", seed, 'p256');
      expect(bytesToHex(child.privateKey)).toBe('6939694369114c67917a182c59ddb8cafc3004e63ca5d3b84403ba8613debc0c');
      expect(bytesToHex(child.chainCode)).toBe('3460cea53e6a6bb5fb391eeef3237ffd8724bf0a40e94943c98b83825342ee11');
    });
  });

  describe('ed25519 - Vector 1', () => {
    const seed = hexToBytes('000102030405060708090a0b0c0d0e0f');

    it('should derive correctly for chain m', async () => {
      const root = await getMasterKeyFromSeed(seed, 'ed25519');
      expect(bytesToHex(root.privateKey)).toBe('2b4be7f19ee27bbf30c667b642d5f4aa69fd169872f8fc3059c08ebae2eb19e7');
      expect(bytesToHex(root.chainCode)).toBe('90046a93de5380a72b5e45010748567d5ea02bbf6522f979e05c0d8d8ca9fffb');
    });

    it("should derive correctly for chain m/0'", async () => {
      const child = await derivePath("m/0'", seed, 'ed25519');
      expect(bytesToHex(child.privateKey)).toBe('68e0fe46dfb67e368c75379acec591dad19df3cde26e63b93a8e704f1dade7a3');
      expect(bytesToHex(child.chainCode)).toBe('8b59aa11380b624e81507a27fedda59fea6d0b779a778918a2fd3590e16e9c69');
    });
  });

  describe('curve25519 - Vector 1', () => {
    const seed = hexToBytes('000102030405060708090a0b0c0d0e0f');

    it('should derive correctly for chain m', async () => {
      const root = await getMasterKeyFromSeed(seed, 'curve25519');
      expect(bytesToHex(root.privateKey)).toBe('2b4be7f19ee27bbf30c667b642d5f4aa69fd169872f8fc3059c08ebae2eb19e7');
      expect(bytesToHex(root.chainCode)).toBe('90046a93de5380a72b5e45010748567d5ea02bbf6522f979e05c0d8d8ca9fffb');
    });
  });
});
