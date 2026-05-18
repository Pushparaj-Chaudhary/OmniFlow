import React, { useState } from 'react';
import Navigation from './Navigation';
import TopHeader from './TopHeader';
import SettingsModal from './SettingsModal';

const MainLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="h-dvh flex bg-gray-50 overflow-hidden text-gray-900 font-sans dark:bg-gray-900 dark:text-gray-100 transition-colors">
      <Navigation 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden w-full max-w-[1600px] mx-auto bg-[#F9FAFB] dark:bg-slate-900 transition-colors">
        <TopHeader setIsMobileMenuOpen={setIsMobileMenuOpen} />
        
        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 pb-20 relative hide-scrollbar">
          {children}
        </div>
      </main>
      
      {/* Global Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
};

export default MainLayout;
