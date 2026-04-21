import { useState, useCallback, useMemo } from 'react';
import { generateMnemonic, generateLuckyAddress } from '../../src/index'; 
import { wordlist as english } from '@scure/bip39/wordlists/english.js';
import { wordlist as spanish } from '@scure/bip39/wordlists/spanish.js';
import { wordlist as french } from '@scure/bip39/wordlists/french.js';
import { wordlist as japanese } from '@scure/bip39/wordlists/japanese.js';

import { RefreshCw, Copy, CheckCircle2, Settings, X, Check } from 'lucide-react';

const CHAINS = [
  { id: 'bitcoin_p2pkh', name: 'Bitcoin (Legacy P2PKH)' },
  { id: 'bitcoin_p2sh', name: 'Bitcoin (Nested SegWit P2SH)' },
  { id: 'bitcoin_p2wpkh', name: 'Bitcoin (Native SegWit Bech32)' },
  { id: 'bitcoin_p2tr', name: 'Bitcoin (Taproot P2TR)' },
  { id: 'ethereum', name: 'Ethereum / EVM' },
  { id: 'solana', name: 'Solana' },
  { id: 'tron', name: 'Tron' },
  { id: 'sui_ed25519', name: 'Sui (Ed25519)' },
  { id: 'sui_secp256k1', name: 'Sui (Secp256k1)' },
  { id: 'sui_secp256r1', name: 'Sui (Secp256r1)' },
  { id: 'monero', name: 'Monero' },
  { id: 'monero_testnet', name: 'Monero (Testnet)' }
];

const WORDLISTS: Record<string, { name: string, list: string[] }> = {
  english: { name: 'English', list: english },
  spanish: { name: 'Spanish', list: spanish },
  french: { name: 'French', list: french },
  japanese: { name: 'Japanese', list: japanese },
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
  
  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    try {
      const activeWordlist = WORDLISTS[language].list;
      const newMnemonic = generateMnemonic(activeWordlist, mnemonicLength);
      setMnemonic(newMnemonic);
      
      const generatedAddresses = await generateLuckyAddress(
        newMnemonic,
        selectedChains
      );
      setAddresses(generatedAddresses);
    } catch (error) {
      console.error('Failed to generate addresses:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [mnemonicLength, language, selectedChains]);

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

  const activeChains = useMemo(() => CHAINS.filter(c => selectedChains.includes(c.id)), [selectedChains]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900 mb-2">
            LuckyAddress Universal Multi-Chain
          </h1>
          <p className="text-gray-500 text-lg">
            Generate a secure mnemonic and derive addresses across multiple curves and networks instantly.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 grid gap-8">
        
        {/* Mnemonic Generator Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden relative">
          <div className="p-6 md:p-8 bg-blue-50/50">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h2 className="text-xl font-medium tracking-tight">Recovery Phrase</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {mnemonicLength}-word BIP39 mnemonic phrase used to derive all wallets.
                </p>
              </div>
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
                  disabled={isGenerating || selectedChains.length === 0}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-sm shadow-blue-600/20"
                >
                  <RefreshCw size={18} className={isGenerating ? "animate-spin" : ""} />
                  {mnemonic ? "Generate New" : "Generate Mnemonic"}
                </button>
              </div>
            </div>

            {mnemonic && (
              <div className="bg-white p-6 rounded-xl border border-blue-100 shadow-sm relative group">
                <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
                  {mnemonic.split(' ').map((word, index) => (
                    <div key={index} className="flex gap-2 items-center bg-gray-50 rounded px-3 py-2 border border-gray-100">
                      <span className="text-xs font-mono text-gray-400 select-none w-4">{index + 1}</span>
                      <span className="font-medium text-gray-800">{word}</span>
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
                <p>Click "Generate Mnemonic" to begin</p>
              </div>
            )}
          </div>
        </section>

        {/* Derived Addresses Section */}
        {mnemonic && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-800">Derived Addresses</h3>
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
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                            isSelected 
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
