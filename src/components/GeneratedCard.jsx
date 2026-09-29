import React, { useState } from 'react';
import { 
  Share2, 
  FileText, 
  Mail, 
  Newspaper, 
  Megaphone, 
  Copy, 
  Check, 
  Download, 
  Edit3, 
  Save, 
  X, 
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

const FORMAT_ICONS = {
  'Social Media Post': Share2,
  'Short Brief': FileText,
  'Email': Mail,
  'Press Release': Newspaper,
  'Awareness Message': Megaphone,
};

export default function GeneratedCard({ 
  artefact, 
  onUpdateContent 
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(artefact.content);
  const [copied, setCopied] = useState(false);

  const Icon = FORMAT_ICONS[artefact.format] || FileText;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(artefact.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const filename = `${artefact.format.toLowerCase().replace(/\s+/g, '_')}_${artefact.language.toLowerCase()}.txt`;
    const element = document.createElement('a');
    const file = new Blob([
      `# InfoFlip-AI Generated Artefact\n` +
      `# Format: ${artefact.format}\n` +
      `# Target Audience: ${artefact.audience}\n` +
      `# Tone: ${artefact.tone}\n` +
      `# Language: ${artefact.language}\n` +
      `# Generated: ${new Date().toLocaleString()}\n\n` +
      artefact.content
    ], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveEdit = () => {
    onUpdateContent(artefact.id, draftContent);
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setDraftContent(artefact.content);
    setIsEditing(false);
  };

  // Live word and char count
  const wordCount = (isEditing ? draftContent : artefact.content).split(/\s+/).filter(Boolean).length;
  const charCount = (isEditing ? draftContent : artefact.content).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
      
      {/* Card Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              {artefact.format}
              {artefact.isEdited && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Edited & Reviewed ✓
                </span>
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                {artefact.audience}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {artefact.tone}
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-100">
                {artefact.language}
              </span>
            </div>
          </div>
        </div>

        {/* Human Review Banner Tag */}
        <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Review before publishing</span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-indigo-700 font-semibold bg-indigo-50/70 px-3 py-1.5 rounded-lg border border-indigo-100">
              <span className="flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5" />
                Human Review Mode: Edit and refine content before dispatch
              </span>
            </div>
            <textarea
              value={draftContent}
              onChange={(e) => setDraftContent(e.target.value)}
              rows={9}
              className="w-full p-3.5 text-sm rounded-xl border border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-sans leading-relaxed text-slate-800 bg-white"
              autoFocus
            />
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50/40 p-4 rounded-xl border border-slate-100 min-h-[160px]">
              {artefact.content}
            </div>
          </div>
        )}

        {/* Footer Metrics & Actions */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 font-medium">
            <span>{wordCount} words</span>
            <span className="mx-1.5 text-slate-300">•</span>
            <span>{charCount} chars</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Edit Button */}
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors shadow-2xs active:scale-95"
                title="Edit content"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit</span>
              </button>
            )}

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 shadow-2xs active:scale-95 ${
                copied
                  ? 'bg-emerald-600 text-white border border-emerald-600'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
              title="Copy to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Copied ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>Copy</span>
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs active:scale-95"
              title="Download as .txt"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Download</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
