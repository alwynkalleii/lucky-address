import { useState } from 'react';

import { generateMnemonic, generateLuckyAddress } from 'lucky-address';

import { wordlist as english } from 'lucky-address/wordlists/english.js';
import { wordlist as czech } from 'lucky-address/wordlists/czech.js';
import { wordlist as french } from 'lucky-address/wordlists/french.js';
import { wordlist as italian } from 'lucky-address/wordlists/italian.js';
import { wordlist as japanese } from 'lucky-address/wordlists/japanese.js';
import { wordlist as korean } from 'lucky-address/wordlists/korean.js';
import { wordlist as portuguese } from 'lucky-address/wordlists/portuguese.js';
import { wordlist as spanish } from 'lucky-address/wordlists/spanish.js';
import { wordlist as simplifiedChinese } from 'lucky-address/wordlists/simplified-chinese.js';
import { wordlist as traditionalChinese } from 'lucky-address/wordlists/traditional-chinese.js';

import { RefreshCw, Copy, CheckCircle2, Settings, X, Check } from 'lucide-react';

const CHAINS = [
  { id: 'bitcoin_p2pkh', name: 'Bitcoin (Legacy)' },
  { id: 'bitcoin_p2sh', name: 'Bitcoin (Nested SegWit)' },
  { id: 'bitcoin_p2wpkh', name: 'Bitcoin (Native SegWit)' },
  { id: 'bitcoin_p2tr', name: 'Bitcoin (Taproot)' },
  { id: 'ethereum', name: 'Ethereum / EVM' },
  { id: 'solana', name: 'Solana' },
  { id: 'tron', name: 'Tron' },
  { id: 'sui_ed25519', name: 'Sui (Ed25519)' },
  { id: 'sui_secp256k1', name: 'Sui (Secp256k1)' },
  { id: 'sui_secp256r1', name: 'Sui (Secp256r1)' },
  { id: 'monero', name: 'Monero' },
];

const WORDLISTS: Record<string, { name: string, list: string[] }> = {
  english: { name: 'English', list: english },
  czech: { name: 'Czech', list: czech },
  french: { name: 'French', list: french },
  italian: { name: 'Italian', list: italian },
  japanese: { name: 'Japanese', list: japanese },
  korean: { name: 'Korean', list: korean },
  portuguese: { name: 'Portuguese', list: portuguese },
  spanish: { name: 'Spanish', list: spanish },
  simplifiedChinese: { name: '简体中文', list: simplifiedChinese },
  traditionalChinese: { name: '繁体中文', list: traditionalChinese },
};

export default function App() {
  const [mnemonic, setMnemonic] = useState('');
  const [addresses, setAddresses] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mnemonicLength, setMnemonicLength] = useState<number>(12);
  const [language, setLanguage] = useState<string>('english');
  const [selectedChains, setSelectedChains] = useState<string[]>(['bitcoin_p2tr', 'ethereum', 'solana', 'tron']);


  const handleGenerate = () => {
    setIsGenerating(true);
    try {
      const activeWordlist = WORDLISTS[language].list;
      const newMnemonic = generateMnemonic(activeWordlist, mnemonicLength);
      setMnemonic(newMnemonic);

      const generatedAddresses = generateLuckyAddress(
        newMnemonic,
        selectedChains
      );
      setAddresses(generatedAddresses);
    } catch (error) {
      console.error('Failed to generate addresses:', error);
    } finally {
      setIsGenerating(false);
    }
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleChain = (chainId: string) => {
    setSelectedChains(prev =>
      prev.includes(chainId) ? prev.filter(id => id !== chainId) : [...prev, chainId]
    );
  };

  const activeChains = CHAINS.filter(c => selectedChains.includes(c.id));

  return (
    <div className="min-h-screen bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:20px_20px] selection:bg-blue-100">
      <header className="bg-white/50 border-b border-gray-200 text-center p-4">
        <h1 className="text-lg font-semibold tracking-tight text-gray-900">
          Lucky Address
        </h1>
        <p className="text-gray-500 text-sm">
          Find your lucky address on multiple chains.
        </p>
      </header>

      <main className="max-w-5xl mx-auto my-4 grid gap-4">
        {/* Mnemonic Generator Section */}
        <section className="bg-blue-50/80 border border-gray-200 rounded-2xl shadow p-6 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-lg font-sans">Recovery Phrase</h2>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                title="Settings"
              >
                <Settings size={20} />
              </button>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer"
              >
                <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} />
                Generate
              </button>
            </div>
          </div>

          {mnemonic && (
            <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm relative group">
              <div className="grid grid-cols-3 md:grid-cols-4 gap-4 font-mono">
                {mnemonic.split(' ').map((word, index) => (
                  <div key={index} className="flex gap-2 items-center bg-gray-50 rounded px-3 py-2 border border-gray-100">
                    <span className="text-xs font-mono text-gray-400 select-none w-4">{index + 1}</span>
                    <span className="text-gray-800">{word}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleCopy(mnemonic, 'mnemonic')}
                className="absolute top-4 right-4 p-2 bg-white rounded-lg border border-gray-200 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 text-gray-600"
                title="Copy Phrase"
              >
                {copiedKey === 'mnemonic' ? <CheckCircle2 size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
          )}

          {!mnemonic && (
            <div className="h-32 rounded-xl border-2 border-dashed border-blue-200 bg-white flex flex-col items-center justify-center text-blue-400">
              <p>Click "Generate" to begin</p>
            </div>
          )}
        </section>

        {/* Derived Addresses Section */}
        {mnemonic && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-gray-800">Derived Addresses</h3>
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">m/Purpose'/CoinType'/Account'/Change/Index</span>
            </div>

            <div className="grid gap-3">
              {activeChains.map((chain) => {
                const address = addresses[chain.id];
                return (
                  <div key={chain.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-blue-300 transition-colors group">
                    <div className="w-full md:w-1/3 shrink-0">
                      <span className="font-medium text-gray-900">{chain.name}</span>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{chain.id}</div>
                    </div>

                    <div className="w-full md:w-2/3 flex items-center justify-end gap-3">
                      {isGenerating ? (
                        <div className="bg-gray-100 rounded animate-pulse h-6 w-full max-w-sm"></div>
                      ) : address ? (
                        <>
                          <div className="font-mono text-sm text-gray-600 break-all bg-gray-50 px-3 py-1.5 rounded-md border border-gray-100 text-right">
                            {address}
                          </div>
                          <button
                            onClick={() => handleCopy(address, chain.id)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                            title="Copy address"
                          >
                            {copiedKey === chain.id ? <CheckCircle2 size={18} className="text-green-500" /> : <Copy size={18} />}
                          </button>
                        </>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Failed to derive</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 p-1 rounded-md transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">

                {/* Length & Language Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Mnemonic Length</label>
                    <select
                      value={mnemonicLength}
                      onChange={(e) => setMnemonicLength(Number(e.target.value))}
                      className="w-full border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2 text-gray-800"
                    >
                      {[12, 15, 18, 21, 24].map(len => (
                        <option key={len} value={len}>{len} Words</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 px-3 py-2 text-gray-800"
                    >
                      {Object.entries(WORDLISTS).map(([key, data]) => (
                        <option key={key} value={key}>{data.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <hr className="border-gray-100" />

                {/* Chains Selection */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Select Chains to Derive</label>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{selectedChains.length} selected</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {CHAINS.map(chain => {
                      const isSelected = selectedChains.includes(chain.id);
                      return (
                        <button
                          key={chain.id}
                          onClick={() => toggleChain(chain.id)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${isSelected
                            ? 'border-blue-500 bg-blue-50/50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                            }`}
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-500 text-white' : 'border border-gray-300'}`}>
                            {isSelected && <Check size={12} strokeWidth={3} />}
                          </div>
                          <div className="truncate">
                            <div className={`text-sm font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                              {chain.name}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors cursor-pointer shadow-sm shadow-blue-600/20"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
