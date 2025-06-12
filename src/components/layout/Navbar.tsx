// components/layout/Navbar.tsx
"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import Button from '../ui/button';
import { IoMenu, IoClose } from 'react-icons/io5';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationLinks = [
    { name: 'Home', href: '/' },
    { name: 'Properties', href: '/properties' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <nav className="bg-white shadow-sm fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" passHref>
              <span className="text-2xl font-bold text-blue-600 cursor-pointer">
                RealEstate
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                passHref
              >
                <span className="text-gray-700 hover:text-blue-600 transition-colors cursor-pointer">
                  {link.name}
                </span>
              </Link>
            ))}
            <Button variant="outline" size="sm">
              Sign In
            </Button>
            <Button size="sm">List Property</Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 p-2 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-4 pt-4 pb-3 space-y-1">
            {navigationLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                passHref
              >
                <span
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 hover:bg-gray-50 rounded-md cursor-pointer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </span>
              </Link>
            ))}
            <div className="mt-4 space-y-2">
              <Button variant="outline" fullWidth>
                Sign In
              </Button>
              <Button fullWidth>List Property</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
