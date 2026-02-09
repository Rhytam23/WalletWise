import React from 'react'
import { Wallet } from 'lucide-react';

const Navbar = ({ isMenuOpen, setIsMenuOpen, smoothScroll, navigate }) => {
    return (
        <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/80 border-b border-zinc-200">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

                {/* Logo */}
                <button
                    onClick={() => smoothScroll("top")}
                    className="flex items-center gap-2 font-bold text-xl text-zinc-900"
                >
                    <Wallet size={24} className="text-black" />
                    WalletWise
                </button>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    <button
                        onClick={() => smoothScroll("about")}
                        className="text-zinc-600 hover:text-black transition"
                    >
                        About
                    </button>

                    <button
                        onClick={() => smoothScroll("features")}
                        className="text-zinc-600 hover:text-black transition"
                    >
                        Features
                    </button>

                    <button
                        onClick={() => navigate("/signup")}
                        className="px-5 py-2 rounded-full bg-black text-white hover:bg-zinc-800 transition"
                    >
                        Get Started
                    </button>
                </nav>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden flex flex-col gap-1"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <span className="w-6 h-[2px] bg-black" />
                    <span className="w-6 h-[2px] bg-black" />
                    <span className="w-6 h-[2px] bg-black" />
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-zinc-200 px-4 py-4 space-y-4">
                    <button onClick={() => smoothScroll("about")} className="block w-full text-left">
                        About
                    </button>
                    <button onClick={() => smoothScroll("features")} className="block w-full text-left">
                        Features
                    </button>
                    <button
                        onClick={() => navigate("/signup")}
                        className="w-full py-2 rounded-lg bg-black text-white"
                    >
                        Get Started
                    </button>
                </div>
            )}
        </header>

    )
}

export default Navbar
