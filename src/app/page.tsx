
"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Phone, Search, Star, Home, ArrowLeft, Users, Key } from 'lucide-react';
import HeroSection from '@/components/home/HeroSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import FeaturedProperties from '@/components/home/FeaturedProperties';
import CallToAction from '@/components/home/CallToAction';
import Testimonials from '@/components/home/Testimonials';
import Statistics from '@/components/home/Statistics';
import ContactSection from '@/components/home/ContactSection';
import Footer from '@/components/home/Footer';
import Navbar from '@/components/home/Navbar';

export default function PremiumLanding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);


  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar />
      {/* Hero Section */}
      <HeroSection />
      {/* Features Section */}
      <WhyChooseUs />
      {/* Featured Properties */}
      <FeaturedProperties />
      {/* Call to Action */}
      <CallToAction />
      {/* Testimonials Section */}
      <Testimonials />
      {/* Stats Section */}
      <Statistics />
      {/* Footer */}
      <Footer />
      {/* Scroll to Top Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: isScrolled ? 1 : 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 left-8 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      </motion.button>
    </div>
  );
} 