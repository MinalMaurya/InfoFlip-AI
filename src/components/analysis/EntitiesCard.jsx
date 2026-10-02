import React from 'react';
import { 
  Building2, 
  UserCheck, 
  MapPin, 
  Cpu, 
  Calendar, 
  Layers,
  Sparkles 
} from 'lucide-react';

export default function EntitiesCard({ entities }) {
  if (!entities) return null;

  const sections = [
    { title: 'Organizations', items: entities.organizations, icon: Building2, color: 'indigo' },
    { title: 'Locations', items: entities.locations, icon: MapPin, color: 'blue' },
    { title: 'Technologies / Assets', items: entities.technologies, icon: Cpu, color: 'purple' },
    { title: 'People / Roles', items: entities.people, icon: UserCheck, color: 'emerald' },
    { title: 'Dates / Milestones', items: entities.dates, icon: Calendar, color: 'amber' },
    { title: 'Other Entities', items: entities.other, icon: Layers, color: 'slate' }
  ].filter(s => Array.isArray(s.items) && s.items.length > 0);

  if (sections.length === 0) return null;

  const totalEntityCount = sections.reduce((acc, s) => acc + s.items.length, 0);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Named Entities Recognized ({totalEntityCount})
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Extracted mentions across administrative and operational scopes
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span>Detected</span>
        </span>
      </div>

      {/* Entity Categories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {sections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300">
                <Icon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{sec.title}</span>
                <span className="text-[10px] text-slate-400 font-normal">({sec.items.length})</span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {sec.items.map((item, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 shadow-2xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
