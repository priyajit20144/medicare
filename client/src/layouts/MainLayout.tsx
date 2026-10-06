import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { CartDrawer } from '../components/common/CartDrawer';
import { ScrollProgressBar, ScrollToTopButton } from '../components/scroll';

export const MainLayout: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-slate-50 selection:bg-emerald-500 selection:text-white relative">
      {/* Scroll-Driven Reading Progress Bar with Vital Rhythm Pulse */}
      <ScrollProgressBar height={3.5} showPercentagePill={true} />

      <Navbar />
      <main className="flex-1 w-full overflow-x-hidden">
        <Outlet />
      </main>
      <CartDrawer />
      <Footer />

      {/* Floating Radial Progress Gauge & Return-to-Top Button */}
      <ScrollToTopButton visibilityThreshold={240} />
    </div>
  );
};

