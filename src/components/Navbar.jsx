import React, { useState } from 'react';
import { 
  History, 
  Info, 
  Menu, 
  X, 
  Cpu, 
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onSelectWorkflow,
  historyCount = 0 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Workflow tabs: any of the 6 stages is part of the 'Create' workflow
  const isWorkflowActive = ['create', 'understand', 'transform', 'communicate', 'review', 'export', 'workspace'].includes(activeTab);

  const navItems = [
    { 
      id: 'create', 
      label: 'Create', 
      icon: PlusCircle, 
      isActive: isWorkflowActive 
    },
    { 
      id: 'history', 
      label: 'History', 
      icon: History, 
      count: historyCount, 
      isActive: activeTab === 'history' 
    },
    { 
      id: 'about', 
      label: 'About', 
      icon: Info, 
      isActive: activeTab === 'about' 
    },
  ];

  const handleNavClick = (itemId) => {
    if (itemId === 'create') {
      if (onSelectWorkflow) {
        onSelectWorkflow();
      } else {
        setActiveTab('create');
      }
    } else {
      setActiveTab(itemId);
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Brand Area: InfoFlip Mascot Logo & Title */}
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => handleNavClick('create')}
              className="flex items-center gap-3 text-left group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
              title="InfoFlip-AI GenAI Platform"
            >
              {/* Mascot Logo Badge */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden shadow-xs border border-primary/30 dark:border-primary/40 bg-white dark:bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shrink-0">
                <img 
                  src="/infoflip-logo.png" 
                  alt="InfoFlip-AI Logo" 
                  className="w-full h-full object-cover"
                  loading="eager"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold bg-gradient-to-r from-slate-900 via-primary to-primary-hover dark:from-white dark:via-accent dark:to-accent bg-clip-text text-transparent tracking-tight">
                    InfoFlip<span className="text-primary dark:text-accent">-AI</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-surface-selected text-primary dark:text-accent border border-primary/30 dark:border-primary/40">
                    <Cpu className="w-3 h-3 text-text-primary0" /> SIH26154
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  GenAI Content Transformation Platform
                </p>
              </div>
            </button>
          </div>

          {/* Desktop Global Navigation (Create | History | About) */}
          <nav className="hidden md:flex items-center gap-1.5" aria-label="Global Navigation">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.isActive;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    active
                      ? 'text-primary dark:text-accent bg-surface-selected/60 shadow-2xs border border-primary/30'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-primary dark:text-accent' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.count > 0 && (
                    <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-surface-selected dark:bg-surface-selected text-primary dark:text-accent">
                      {item.count}
                    </span>
                  )}
                  {active && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-primary dark:bg-accent/30 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right side: Theme Toggle & Verification Badges */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Human Review Status Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Human Review Active</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Dropdown Menu (Strictly: Create, History, About) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2 shadow-lg animate-fade-in">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium px-2 py-1">
            GenAI Content Transformation Platform (SIH 26154)
          </p>
          <div className="grid grid-cols-1 gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = item.isActive;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    active
                      ? 'bg-surface-selected text-primary dark:text-accent font-bold'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${active ? 'text-primary dark:text-accent' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-surface-selected text-primary dark:text-accent">
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-2">
            <span>SIH26154 Multi-Channel AI Pipeline</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Human in the Loop
            </span>
          </div>
        </div>
      )}
    </header>
  );
}
