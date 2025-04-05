import React, { useState, useEffect } from 'react';
import { Mic } from 'lucide-react';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
      scrolled 
        ? 'max-w-4xl w-full mt-4 rounded-full backdrop-blur-md bg-white/60 shadow-lg' 
        : 'max-w-5xl w-full mt-6 rounded-full backdrop-blur-sm bg-white/40'
    }`}>
      <div className="px-6 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <div className="h-9 w-9 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
            <Mic className="h-5 w-5 text-white" />
          </div>
          <span className="text-blue-600 font-bold text-xl">VOX AI</span>
        </div>
        <div className="hidden md:flex gap-8">
          <a href="#" className="text-blue-800 hover:text-blue-600 transition-colors">Meetings</a>
          <a href="#" className="text-blue-800 hover:text-blue-600 transition-colors">Contact</a>
          <a href="#" className="text-blue-800 hover:text-blue-600 transition-colors">About</a>
        </div>
        <button className="px-5 py-2 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-md">
          Sign Up
        </button>
      </div>
    </nav>
  );
};

export default Navbar;