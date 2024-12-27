import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<any>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navigationItems = [
        { 
            name: 'الرئيسية', 
            path: '/' 
        },
        {
            name: 'العقارات',
            path: '/properties',
            dropdownItems: [
                { name: 'جميع العقارات', path: '/properties' },
                { name: 'الفلل', path: '/properties' },
                { name: 'الشقق', path: '/properties' },
                { name: 'الأراضي', path: '/properties' }
            ]
        },
        { 
            name: 'من نحن', 
            path: '/' 
        },
        { 
            name: 'اتصل بنا', 
            path: '/' 
        }
    ];

    return (
        <>
            {/* Top Bar */}
            <div className={`hidden md:block transition-all duration-300 ${
                isScrolled ? 'h-0 opacity-0' : 'h-10 opacity-100'
            }`}>
                <div className="bg-gray-900 text-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="flex items-center justify-between h-10">
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    <span>+968 1234 5678</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    <span>مسقط، عمان</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`fixed w-full z-50 transition-all duration-300 ${
                    isScrolled
                        ? 'bg-white shadow-lg py-4'
                        : 'bg-transparent py-6'
                }`}
            >
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`text-2xl font-bold transition-colors ${
                                    isScrolled ? 'text-gray-900' : 'text-white'
                                }`}
                            >
                                عقارات عمان
                            </motion.div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center space-x-8 space-x-reverse">
                            {navigationItems.map((item) => (
                                <div
                                    key={item.name}
                                    className="relative"
                                    onMouseEnter={() => setActiveDropdown(item.name)}
                                    onMouseLeave={() => setActiveDropdown(null)}
                                >
                                    <motion.div
                                        className="flex items-center gap-1 cursor-pointer"
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                    >
                                        <Link
                                            href={item.path}
                                            className={`${
                                                isScrolled ? 'text-gray-800' : 'text-white'
                                            } hover:text-blue-500 transition-colors font-medium`}
                                        >
                                            {item.name}
                                        </Link>
                                        {item.dropdownItems && (
                                            <ChevronDown className={`w-4 h-4 transition-transform ${
                                                activeDropdown === item.name ? 'rotate-180' : ''
                                            } ${
                                                isScrolled ? 'text-gray-800' : 'text-white'
                                            }`} />
                                        )}
                                    </motion.div>

                                    {/* Dropdown Menu */}
                                    {item.dropdownItems && (
                                        <AnimatePresence>
                                            {activeDropdown === item.name && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 border border-gray-100"
                                                >
                                                    {item.dropdownItems.map((dropdownItem) => (
                                                        <Link
                                                            key={dropdownItem.name}
                                                            href={dropdownItem.path}
                                                            className="block px-4 py-2 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                                        >
                                                            {dropdownItem.name}
                                                        </Link>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="hidden md:block bg-blue-600 text-white px-6 py-2 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 font-medium"
                            >
                                ابدأ الآن
                            </motion.button>

                            {/* Mobile Menu Button */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden p-2 rounded-lg border border-gray-200 bg-white/10 backdrop-blur-sm"
                            >
                                {isMobileMenuOpen ? (
                                    <X className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
                                ) : (
                                    <Menu className={`w-6 h-6 ${isScrolled ? 'text-gray-900' : 'text-white'}`} />
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {isMobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden bg-white border-t border-gray-100 mt-4"
                        >
                            <div className="max-w-7xl mx-auto px-4 py-4">
                                {navigationItems.map((item) => (
                                    <div key={item.name} className="py-2">
                                        <Link
                                            href={item.path}
                                            className="block text-gray-900 hover:text-blue-600 transition-colors font-medium"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            {item.name}
                                        </Link>
                                        {item.dropdownItems && (
                                            <div className="pr-4 mt-2 space-y-2">
                                                {item.dropdownItems.map((dropdownItem) => (
                                                    <Link
                                                        key={dropdownItem.name}
                                                        href={dropdownItem.path}
                                                        className="block text-gray-600 hover:text-blue-600 transition-colors"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                    >
                                                        {dropdownItem.name}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full mt-4 bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 font-medium"
                                >
                                    ابدأ الآن
                                </motion.button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </>
    );
}