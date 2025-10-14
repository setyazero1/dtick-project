'use client';

import { useEffect, useState } from 'react';
import { Wallet, AlertCircle } from 'lucide-react';

interface WalletInfo {
  name: string;
  icon: string;
  installed: boolean;
}

const WalletConnect = () => {
  const [wallets, setWallets] = useState<WalletInfo[]>([]);

  useEffect(() => {
    checkWallets();
  }, []);

  const checkWallets = () => {
    const walletList: WalletInfo[] = [
      { name: 'nami', icon: '🦊', installed: false },
      { name: 'eternl', icon: '♾️', installed: false },
      { name: 'flint', icon: '🔥', installed: false },
      { name: 'yoroi', icon: '🦋', installed: false },
      { name: 'lace', icon: '🎴', installed: false },
    ];

    if (typeof window !== 'undefined' && (window as any).cardano) {
      const cardano = (window as any).cardano;
      walletList.forEach(wallet => {
        if (cardano[wallet.name]) {
          wallet.installed = true;
        }
      });
    }

    setWallets(walletList);
  };

  const installedCount = wallets.filter(w => w.installed).length;

  return (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-purple-500/20">
      <div className="flex items-center space-x-3 mb-4">
        <Wallet className="w-6 h-6 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Detected Wallets</h3>
      </div>

      {installedCount > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {wallets
            .filter(w => w.installed)
            .map(wallet => (
              <div
                key={wallet.name}
                className="flex items-center space-x-2 p-3 bg-slate-900/50 rounded-lg border border-green-500/30"
              >
                <span className="text-2xl">{wallet.icon}</span>
                <span className="text-sm font-medium text-white capitalize">
                  {wallet.name}
                </span>
              </div>
            ))}
        </div>
      ) : (
        <div className="flex items-start space-x-3 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-500 font-medium mb-1">
              No Cardano wallet detected
            </p>
            <p className="text-xs text-gray-400">
              Please install a wallet extension to use dTick
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;