import React, { useState } from 'react';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';
import ToastContainer from '../components/notifications/ToastContainer';

const DashboardLayout = ({ children, activeTab, onTabChange, onTicketCreated }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors">
      <Navbar onTicketCreated={onTicketCreated} />
      
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
        
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {children}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default DashboardLayout;
