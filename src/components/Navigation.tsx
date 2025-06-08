
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Mountain, Camera, Map, Phone, Clock, Shield } from 'lucide-react';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'خانه', icon: Mountain, labelEn: 'Home' },
    { path: '/history', label: 'تاریخچه', icon: Clock, labelEn: 'History' },
    { path: '/landscape', label: 'طبیعت', icon: Camera, labelEn: 'Nature' },
    { path: '/heritage', label: 'میراث', icon: Shield, labelEn: 'Heritage' },
    { path: '/threats', label: 'تهدیدات', icon: Shield, labelEn: 'Threats' },
    { path: '/gallery', label: 'گالری', icon: Camera, labelEn: 'Gallery' },
    { path: '/tourism', label: 'گردشگری', icon: Map, labelEn: 'Tourism' },
    { path: '/contact', label: 'تماس', icon: Phone, labelEn: 'Contact' }
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden lg:flex fixed top-6 left-1/2 transform -translate-x-1/2 z-50 bg-heritage-night-blue/90 backdrop-blur-md border border-heritage-royal-blue/50 rounded-full px-8 py-4">
        <div className="flex items-center space-x-8 space-x-reverse">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`group flex items-center space-x-2 space-x-reverse px-4 py-2 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-heritage-pistachio text-heritage-deep-blue' 
                    : 'text-heritage-pistachio hover:bg-heritage-royal-blue/50'
                }`}
              >
                <Icon size={18} />
                <span className="text-sm font-medium">{item.label}</span>
                <span className="text-xs opacity-60 english-text hidden group-hover:block">
                  {item.labelEn}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Mobile Navigation Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-6 right-6 z-50 bg-heritage-night-blue/90 backdrop-blur-md border border-heritage-royal-blue/50 rounded-full p-3 text-heritage-pistachio"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-heritage-deep-blue/95 backdrop-blur-lg">
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center space-x-4 space-x-reverse text-heritage-pistachio hover:text-heritage-sage transition-colors duration-300"
                >
                  <Icon size={24} />
                  <span className="text-xl font-medium">{item.label}</span>
                  <span className="text-sm opacity-60 english-text">{item.labelEn}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default Navigation;
