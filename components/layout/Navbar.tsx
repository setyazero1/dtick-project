'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Wallet, LogOut, User, Shield, Briefcase } from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import LoginModal from '@/components/auth/LoginModal';
import { truncateAddress } from '@/lib/utils';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { href: '/', label: 'Home' },
        { href: '/events', label: 'Events' },
      ];
    }

    switch (user?.role) {
      case 'admin':
        return [
          { href: '/admin', label: 'Dashboard' },
          { href: '/events', label: 'Events' },
        ];
      case 'organizer':
        return [
          { href: '/organizer', label: 'Dashboard' },
          { href: '/events', label: 'Events' },
        ];
      case 'user':
      default:
        return [
          { href: '/', label: 'Home' },
          { href: '/events', label: 'Events' },
          { href: '/marketplace', label: 'Marketplace' },
          { href: '/my-tickets', label: 'My Tickets' },
        ];
    }
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'organizer':
        return <Briefcase className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleColor = () => {
    switch (user?.role) {
      case 'admin':
        return 'from-red-500 to-pink-500';
      case 'organizer':
        return 'from-blue-500 to-cyan-500';
      default:
        return 'from-purple-500 to-pink-500';
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      <nav
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          isScrolled
            ? 'bg-slate-900/95 backdrop-blur-lg border-b border-purple-500/20 shadow-lg'
            : 'bg-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xl">dT</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                dTick
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors relative group',
                    pathname === link.href
                      ? 'text-purple-400'
                      : 'text-gray-300 hover:text-white'
                  )}
                >
                  {link.label}
                  <span
                    className={cn(
                      'absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 transition-all',
                      pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'
                    )}
                  />
                </Link>
              ))}
            </div>

            {/* Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-3">
                  {/* User Info */}
                  <div className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r',
                    getRoleColor(),
                    'bg-opacity-10 border border-current border-opacity-30'
                  )}>
                    {getRoleIcon()}
                    <div className="flex flex-col">
                      <span className="text-xs text-gray-400 capitalize">{user.role}</span>
                      <span className="text-sm font-medium text-white">
                        {truncateAddress(user.walletAddress, 8)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Logout Button */}
                  <button
                    onClick={logout}
                    className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  <Wallet className="w-5 h-5" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-900/98 backdrop-blur-lg border-t border-purple-500/20">
            <div className="px-4 py-6 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    'block px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    pathname === link.href
                      ? 'bg-purple-500/20 text-purple-400'
                      : 'text-gray-300 hover:bg-purple-500/10 hover:text-white'
                  )}
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-gray-700">
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <div className={cn(
                      'flex items-center space-x-2 px-4 py-3 rounded-lg bg-gradient-to-r',
                      getRoleColor(),
                      'bg-opacity-10 border border-current border-opacity-30'
                    )}>
                      {getRoleIcon()}
                      <div className="flex flex-col flex-1">
                        <span className="text-xs text-gray-400 capitalize">{user.role}</span>
                        <span className="text-sm font-medium text-white">
                          {truncateAddress(user.walletAddress, 12)}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setIsLoginModalOpen(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium rounded-lg"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>Connect Wallet</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </>
  );
};

export default Navbar;