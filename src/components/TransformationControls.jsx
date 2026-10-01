import React from 'react';
import { 
  Users, 
  Sliders, 
  Languages, 
  LayoutGrid, 
  Sparkles, 
  Check, 
  Share2, 
  FileText, 
  Mail, 
  Megaphone, 
  Newspaper 
} from 'lucide-react';

export const AUDIENCE_OPTIONS = [
  'General Public',
  'Students',
  'Government Officials',
  'Internal Teams',
  'Media'
];

export const TONE_OPTIONS = [
  'Formal',
  'Simple',
  'Urgent',
  'Informative',
  'Professional'
];

export const LANGUAGE_OPTIONS = [
  { id: 'English', label: 'English', flag: '🇬🇧' },
  { id: 'Hindi', label: 'Hindi (हिंदी)', flag: '🇮🇳' },
  { id: 'Marathi', label: 'Marathi (मराठी)', flag: '🇮🇳' }
];

export const FORMAT_OPTIONS = [
  { id: 'Social Media Post', icon: Share2, desc: 'Engaging, concise with hashtags & action cues' },
  { id: 'Short Brief', icon: FileText, desc: 'Executive situational digest & key directives' },
  { id: 'Email', icon: Mail, desc: 'Formal salutation, clear summary & next steps' },
  { id: 'Press Release', icon: Newspaper, desc: 'Official media release with verified quote' },
  { id: 'Awareness Message', icon: Megaphone, desc: 'High-impact dos & donts with emergency numbers' },
];

export default function TransformationControls({
  audience,
  setAudience,
  tone,
  setTone,
  language,
  setLanguage,
  selectedFormats,
  setSelectedFormats,
  onTransform,
  isTransforming,
  formatError
}) {
  const toggleFormat = (formatId) => {
    if (selectedFormats.includes(formatId)) {
      if (selectedFormats.length === 1) return; // keep at least 1
      setSelectedFormats(selectedFormats.filter((f) => f !== formatId));
    } else {
      setSelectedFormats([...selectedFormats, formatId]);
    }
  };

  const selectAllFormats = () => {
    setSelectedFormats(FORMAT_OPTIONS.map((f) => f.id));
  };

  const resetDefaultFormats = () => {
    setSelectedFormats(['Social Media Post', 'Short Brief', 'Email']);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-sm">
            2
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Transformation Settings
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                (Context & Intent Configuration)
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Customize tone, target cohort, language, and output distribution channels
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        
        {/* Row 1: Audience & Tone */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Audience Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Target Audience
            </label>
            <div className="relative">
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value)}
                className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 cursor-pointer"
              >
                {AUDIENCE_OPTIONS.map((aud) => (
                  <option key={aud} value={aud} className="dark:bg-slate-900 dark:text-slate-100">
                    {aud}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Adapts jargon, formality, and reading level for the reader.
            </p>
          </div>

          {/* Tone Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Tone & Voice
            </label>
            <div className="relative">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full bg-slate-50/70 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 cursor-pointer"
              >
                {TONE_OPTIONS.map((t) => (
                  <option key={t} value={t} className="dark:bg-slate-900 dark:text-slate-100">
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Tunes emotional urgency, structure, and directive framing.
            </p>
          </div>

        </div>

        {/* Row 2: Language Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Languages className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Output Language
            </span>
            <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
              Authentic Vernacular Synthesis
            </span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {LANGUAGE_OPTIONS.map((lang) => {
              const isSelected = language === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => setLanguage(lang.id)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-150 ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-2xs'
                      : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Row 3: Output Formats Multi-Select */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Communication Artefacts ({selectedFormats.length} selected)
            </label>
            <div className="flex items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={selectAllFormats}
                className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
              >
                Select All
              </button>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <button
                type="button"
                onClick={resetDefaultFormats}
                className="text-slate-500 dark:text-slate-400 hover:underline"
              >
                Reset Default
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {FORMAT_OPTIONS.map((fmt) => {
              const Icon = fmt.icon;
              const isSelected = selectedFormats.includes(fmt.id);

              return (
                <button
                  key={fmt.id}
                  type="button"
                  onClick={() => toggleFormat(fmt.id)}
                  className={`text-left p-3 rounded-xl border transition-all duration-150 relative flex items-start gap-2.5 ${
                    isSelected
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-400 dark:border-indigo-600 text-slate-900 dark:text-slate-100 shadow-2xs ring-1 ring-indigo-400/30'
                      : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg shrink-0 ${
                    isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="text-xs font-bold leading-tight">
                      {fmt.id}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {fmt.desc}
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 dark:border-slate-600'
                  }`}>
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>

          {formatError && (
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1 mt-1">
              ⚠️ {formatError}
            </p>
          )}
        </div>

        {/* Primary CTA: Transform Button */}
        <div className="pt-3">
          <button
            type="button"
            onClick={onTransform}
            disabled={isTransforming}
            className={`w-full py-4 px-6 rounded-xl font-bold text-base text-white shadow-lg transition-all duration-200 flex items-center justify-center gap-3 relative overflow-hidden group ${
              isTransforming
                ? 'bg-indigo-400 dark:bg-indigo-600/70 cursor-not-allowed shadow-none'
                : 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:via-indigo-700 hover:to-purple-700 shadow-indigo-300/40 dark:shadow-indigo-950/60 hover:shadow-indigo-400/50 active:scale-[0.99]'
            }`}
          >
            <Sparkles className={`w-5 h-5 ${isTransforming ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
            <span>
              {isTransforming ? 'Transforming Source Content...' : '✦ Transform Content'}
            </span>
          </button>
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            One Source → Context & Intent Understanding → Synchronized Multi-Format Output
          </p>
        </div>

      </div>
    </div>
  );
}
