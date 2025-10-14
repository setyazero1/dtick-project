'use client';

import { useState, useEffect } from 'react';
import { X, Wallet, Shield, Briefcase, User, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { connectWallet, getWalletAddress } from '@/lib/cardano/lucid';
import { getUserRole } from '@/lib/utils';
import toast from 'react-hot-toast';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal = ({ isOpen, onClose }: LoginModalProps) => {
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | 'organizer' | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const { login } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      checkAvailableWallets();
    }
  }, [isOpen]);

  const checkAvailableWallets = () => {
    const wallets: string[] = [];
    // @ts-ignore
    if (typeof window !== 'undefined' && window.cardano) {
      // @ts-ignore
      const cardano = window.cardano;
      if (cardano.nami) wallets.push('nami');
      if (cardano.eternl) wallets.push('eternl');
      if (cardano.flint) wallets.push('flint');
      if (cardano.yoroi) wallets.push('yoroi');
      if (cardano.lace) wallets.push('lace');
    }
    setAvailableWallets(wallets);
  };

  const handleConnect = async (walletName: string) => {
    if (!selectedRole) {
      toast.error('Please select a role first');
      return;
    }

    setIsConnecting(true);
    try {
      const lucid = await connectWallet(walletName);
      const address = await getWalletAddress(lucid);
      const actualRole = getUserRole(address);

      // Validate role access
      if (selectedRole === 'admin' && actualRole !== 'admin') {
        toast.error('This wallet is not authorized as Admin');
        setIsConnecting(false);
        return;
      }

      if (selectedRole === 'organizer' && actualRole !== 'organizer') {
        toast.error('This wallet is not authorized as Organizer');
        setIsConnecting(false);
        return;
      }

      // If user selected admin/organizer but wallet is user
      if (selectedRole !== 'user' && actualRole === 'user') {
        toast.error(`This wallet can only login as User`);
        setIsConnecting(false);
        return;
      }

      // Success - login with actual role
      login(address);
      toast.success(`Connected as ${actualRole}!`);
      onClose();
    } catch (error: any) {
      console.error('Connection error:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  if (!isOpen) return null;

  const roles = [
    {
      id: 'user' as const,
      title: 'User',
      description: 'Buy and resell tickets',
      icon: User,
      color: 'from-purple-500 to-pink-500',
      features: ['Buy tickets', 'Resell on marketplace', 'View my tickets']
    },
    {
      id: 'admin' as const,
      title: 'Admin',
      description: 'Monitor platform',
      icon: Shield,
      color: 'from-red-500 to-pink-500',
      features: ['View dashboard', 'Monitor events', 'Track finances']
    },
    {
      id: 'organizer' as const,
      title: 'Organizer',
      description: 'Create and manage events',
      icon: Briefcase,
      color: 'from-blue-500 to-cyan-500',
      features: ['Create events', 'Manage tickets', 'View analytics']
    }
  ];

  const walletLogos: Record<string, string> = {
    nami: '🦊',
    eternl: '♾️',
    flint: '🔥',
    yoroi: '🦋',
    lace: '🎴'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border border-purple-500/20 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-purple-500/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Connect Wallet</h2>
            <p className="text-gray-400 text-sm mt-1">Choose your role and connect your Cardano wallet</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 border border-gray-700 text-gray-400 hover:text-white hover:border-purple-500/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Role Selection */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Step 1: Select Your Role</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                        : 'border-gray-700 bg-slate-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${role.color} mb-4`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-white mb-1">{role.title}</h4>
                    <p className="text-sm text-gray-400 mb-4">{role.description}</p>
                    <ul className="space-y-1">
                      {role.features.map((feature, idx) => (
                        <li key={idx} className="text-xs text-gray-500 flex items-center">
                          <span className="w-1 h-1 bg-purple-500 rounded-full mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    {isSelected && (
                      <div className="absolute top-4 right-4 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallet Selection */}
          {selectedRole && (
            <div className="animate-fade-in">
              <h3 className="text-lg font-semibold text-white mb-4">Step 2: Choose Wallet</h3>
              
              {availableWallets.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {availableWallets.map((wallet) => (
                    <button
                      key={wallet}
                      onClick={() => handleConnect(wallet)}
                      disabled={isConnecting}
                      className="flex items-center space-x-4 p-4 rounded-xl bg-slate-800 border border-gray-700 hover:border-purple-500/50 hover:bg-slate-700/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="text-4xl">{walletLogos[wallet]}</div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-white capitalize">{wallet}</div>
                        <div className="text-xs text-gray-400">Click to connect</div>
                      </div>
                      {isConnecting && (
                        <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-yellow-500 mb-2">No Wallet Detected</h4>
                  <p className="text-gray-400 text-sm mb-4">
                    Please install a Cardano wallet extension to continue
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <a
                      href="https://namiwallet.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-gray-700 rounded-lg text-sm text-white transition-colors"
                    >
                      Nami
                    </a>
                    <a
                      href="https://eternl.io"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-gray-700 rounded-lg text-sm text-white transition-colors"
                    >
                      Eternl
                    </a>
                    <a
                      href="https://flint-wallet.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-gray-700 rounded-lg text-sm text-white transition-colors"
                    >
                      Flint
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-gray-300">
                <p className="font-medium text-blue-400 mb-1">Important:</p>
                <ul className="space-y-1 text-gray-400">
                  <li>• Admin role requires pre-configured admin wallet</li>
                  <li>• Organizer role requires registered organizer wallet</li>
                  <li>• All other wallets can only login as User</li>
                  <li>• Make sure you're on {process.env.NEXT_PUBLIC_NETWORK} network</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;