'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth } from '../lib/api';

type User = {
  id?: number;
  name?: string;
  email?: string;
  phone?: string | null;
};

const Header: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); // mobile menu
  const [dropdownOpen, setDropdownOpen] = useState(false); // profile menu
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsAuthenticated(true);
        // AuthChecker will validate the token and set user data
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const onAuthChange = () => {
      const token = localStorage.getItem('token');
      if (token) {
        auth.getUser().then(res => {
          setUser(res.data);
          setIsAuthenticated(true);
        }).catch(() => {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
        });
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    };

    window.addEventListener('authChange', onAuthChange);
    return () => {
      window.removeEventListener('authChange', onAuthChange);
    };
  }, []);

  // click outside for dropdown
  useEffect(() => {
    const onDocClick = (ev: MouseEvent) => {
      if (dropdownOpen && dropdownRef.current && !dropdownRef.current.contains(ev.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') {
        setDropdownOpen(false);
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [dropdownOpen]);

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (e) {
      // ignore - ensure local cleanup anyway
      // console.error('logout err', e);
    } finally {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
      setDropdownOpen(false);
      router.push('/');
    }
  };

  const initials = (name?: string) => {
    if (!name) return 'HS';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <header className=" justify-center items-center top-0 z-50 bg-[#2E2D2D] border-b border-[#FFB200]">
      <div className="w-full justify-between px-4 sm:px-6 lg:px-8 py-3 flex items-center ">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 w-full">
          <div className="text-white ">
           <img className="max-w-25 md: " src="/../logo.svg " alt="" />
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex justify-items-end gap-8 w-4xl text-center">
          <a href="https://yandex.ru/maps/38/volgograd/house/ulitsa_mikhaila_balonina_7/YE0YcwZgQEYPQFpifXtwcn9lZw==/?indoorLevel=1&ll=44.510938%2C48.713363&z=17.14">Ул.Балонина 7, Волгоград </a>
          <p className="text-center"> Круглосуточно</p>
          <a href="tel:+79033384141" className="text-white/80 hover:text-white transition">+7 (903)338-41-41</a>
        </nav>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link
                href="/login"
                className="px-10 py-3  bg-[#1E1E1E] text-white hover:bg-[#d4af37] rounded-lg hover: transition"
              >
                Войти
              </Link>
            </>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                className="flex items-center gap-2 pr-3 pl-2 py-2 rounded-lg bg-white/6 hover:bg-white/8 transition"
                aria-expanded={dropdownOpen}
                onClick={() => setDropdownOpen((s) => !s)}
              >
                <div className="w-8 h-8 rounded-full 0 flex items-center justify-center text-white shadow-sm">
                  <i className="bx bx-user text-xl"></i>
                </div>
                <div className="flex flex-col items-start leading-tight text-left">
                  <span className="text-white text-sm">{user?.name ?? 'Профиль'}</span>
                  <span className="text-white/60 text-xs">{user?.email ?? ''}</span>
                </div>
                <svg className={`w-4 h-4 ml-2 text-white/80 transform transition ${dropdownOpen ? 'rotate-180' : 'rotate-0'}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06-.02L10 10.584l3.71-3.395a.75.75 0 011.02 1.1l-4.25 3.893a.75.75 0 01-1.02 0L5.25 8.29a.75.75 0 01-.02-1.08z" clipRule="evenodd" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-black/90 border border-gold/30 rounded-lg shadow-2xl py-2 animate-fade-in z-50 backdrop-blur-sm">
                  <Link href="/profile" className="block px-4 py-2 text-white hover:bg-gold/10 transition-colors">Профиль</Link>
                  <Link href="/booking" className="block px-4 py-2 text-white hover:bg-gold/10 transition-colors">Мои брони</Link>
                  <div className="border-t border-gold/20 my-1" />
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-gold hover:bg-gold/10 transition-colors">Выйти</button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen((s) => !s)}
            aria-label="Toggle menu"
            className="p-2 rounded-lg bg-white/6 hover:bg-white/8 transition"
          >
            <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none">
              {isOpen ? (
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden bg-gradient-to-b from-black/60 to-gray-900/65 border-t border-white/5 overflow-hidden transition-[max-height,opacity] duration-300 ${isOpen ? 'max-h-[420px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 py-4 space-y-3">
          <Link href="/" className="block text-white/90 py-2" onClick={() => setIsOpen(false)}>Главная</Link>
          <Link href="/room-types" className="block text-white/90 py-2" onClick={() => setIsOpen(false)}>Номера</Link>
          <Link href="/booking" className="block text-white/90 py-2" onClick={() => setIsOpen(false)}>Бронирование</Link>
          <a href="#contacts" className="block text-white/90 py-2" onClick={() => setIsOpen(false)}>Контакты</a>

          <div className="pt-2 border-t border-white/5">
            {!isAuthenticated ? (
              <>
                <Link href="/login" className="block w-full text-center py-3 mt-2 rounded-lg bg-[#FFB200]">Войти</Link>

              </>
            ) : (
              <>
                <Link href="/profile" className="block w-full text-center py-3 mt-2 rounded-lg bg-white/6 text-white" onClick={() => setIsOpen(false)}>Профиль</Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="block w-full text-center py-3 mt-2 rounded-lg bg-red-600 text-white">Выйти</button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
