import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom"; 
import { Menu, X, ChevronRight, LogIn, UserPlus, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../context/AuthContext"; // Import useAuth hook

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth(); // Access global auth state

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => setIsOpen(false), [location]);

  const menuItems = [
    { label: "Home", to: "/" },
    { label: "About Us", to: "/about" },
    { label: "Services", to: "/services" },
    { label: "Contact Us", to: "/contact" },
  ];

  return (
    <nav className={`fixed w-full z-[100] transition-all duration-500 px-6 ${
      scrolled ? "bg-white/90 backdrop-blur-md shadow-md py-2" : "bg-white py-4"
    }`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Link to="/" className="block">
            <img
              src="https://adypu.edu.in/wp-content/themes/adypu/images/logo.png"
              className={`transition-all duration-500 ${scrolled ? "h-10" : "h-14"} w-auto object-contain`}
              alt="ADYPU Logo"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <ul className="hidden lg:flex items-center gap-8">
          {menuItems.map((item, index) => (
            <li key={index} className="relative">
              <Link 
                to={item.to}
                className={`text-[15px] font-bold transition-colors ${
                  location.pathname === item.to ? "text-red-600" : "text-slate-600 hover:text-red-600"
                }`}
              >
                {item.label}
              </Link>
              {location.pathname === item.to && (
                <motion.span layoutId="underline" className="absolute -bottom-1 left-0 w-full h-0.5 bg-red-600" />
              )}
            </li>
          ))}
        </ul>

        {/* Desktop Auth Actions - Dynamic Rendering */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link 
                to="/login" 
                className="px-5 py-2.5 text-slate-700 font-bold text-sm hover:text-red-600 transition-colors"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-95 flex items-center gap-2"
              >
                <UserPlus size={16} /> Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to={`/${user.role}/dashboard`} 
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all"
              >
                <User size={16} /> Dashboard
              </Link>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition-all flex items-center gap-2"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 text-slate-900 active:scale-90 transition-transform"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} className="text-red-600" /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-full left-0 w-full bg-white shadow-2xl overflow-hidden md:hidden border-t border-slate-100"
          >
            <div className="p-6 flex flex-col gap-2">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.to}
                  className={`flex items-center justify-between p-4 rounded-2xl font-bold ${
                    location.pathname === item.to ? "bg-red-50 text-red-600" : "text-slate-700"
                  }`}
                >
                  {item.label} <ChevronRight size={18} className="opacity-30" />
                </Link>
              ))}
              
              <div className="mt-4 pt-4 border-t border-slate-50">
                {!user ? (
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      to="/login" 
                      className="flex items-center justify-center gap-2 py-4 bg-slate-100 text-slate-700 rounded-2xl font-bold"
                    >
                      <LogIn size={18} /> Login
                    </Link>
                    <Link 
                      to="/register" 
                      className="flex items-center justify-center gap-2 py-4 bg-red-600 text-white rounded-2xl font-bold"
                    >
                      <UserPlus size={18} /> Sign Up
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link 
                      to={`/${user.role}/dashboard`} 
                      className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold"
                    >
                      <User size={18} /> Go to {user.role} Dashboard
                    </Link>
                    <button 
                      onClick={logout}
                      className="flex items-center justify-center gap-2 py-4 bg-red-50 text-red-600 rounded-2xl font-bold"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}