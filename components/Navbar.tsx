
import React from 'react';

const Navbar: React.FC = () => {
  return (
    <header className="w-full px-6 py-5 lg:px-16 flex items-center justify-between">
      {/* Mobile Menu Button */}
      <button className="lg:hidden text-white p-2">
        <span className="material-symbols-outlined">menu</span>
      </button>

      {/* Left Links (Desktop) */}
      <nav className="hidden lg:flex items-center gap-8">
        <a className="text-white/90 text-sm font-semibold hover:text-primary transition-colors" href="#">Pacotes</a>
        <a className="text-white/90 text-sm font-semibold hover:text-primary transition-colors" href="#">Atrações</a>
      </nav>

      {/* Center Logo */}
      <div className="flex items-center justify-center gap-2 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
        <div className="bg-primary p-1.5 rounded-lg">
          <span className="material-symbols-outlined text-white text-2xl">fort</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-white text-lg font-bold leading-none tracking-tight uppercase">Barretos</h1>
          <span className="text-white/70 text-[10px] font-bold tracking-[0.2em] uppercase leading-none">Country Resort</span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6">
        <nav className="hidden lg:flex items-center gap-8">
          <a className="text-white/90 text-sm font-semibold hover:text-primary transition-colors" href="#">Hospedagem</a>
          <a className="text-white/90 text-sm font-semibold hover:text-primary transition-colors" href="#">Contato</a>
        </nav>
        {/* CTA Button */}
        <button className="hidden sm:flex bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-all active:scale-95 shadow-lg shadow-black/20 items-center gap-2">
          <span>Reservar Agora</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
        {/* Mobile Search/User */}
        <button className="lg:hidden text-white p-2">
          <span className="material-symbols-outlined">person</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
