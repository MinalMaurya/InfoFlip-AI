import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Share2, 
  MessageSquare, 
  Smartphone, 
  Mail, 
  Send, 
  Megaphone, 
  MousePointerClick, 
  Hash, 
  Copy, 
  Check, 
  Download, 
  ShieldCheck, 
  FileText,
  UserCheck
} from 'lucide-react';
import { copyItem, downloadFile, generateFileName } from '../../services/export/exportService.js';

const CHANNEL_ICONS = {
  linkedin: Share2,
  twitter: MessageSquare,
  whatsapp: Smartphone,
  email: Mail,
  sms: Send,
  announcement: Megaphone,
  cta: MousePointerClick,
  hashtags: Hash
};

export default function ExportAssetCard({ item, exportPackage }) {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const {
    outputId,
    channelId,
    title,
    content,
    status,
    reviewer,
    reviewedAt,
    reviewerRemarks,
    wordCount,
    characterCount,
    provider
  } = item;

  const ChannelIcon = CHANNEL_ICONS[channelId] || Share2;

  const handleCopy = async () => {
    const res = await copyItem(item);
    if (res.success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadTxt = () => {
    const filename = generateFileName(exportPackage, 'txt', channelId);
    downloadFile(content, filename, 'text/plain;charset=utf-8');
  };

  return (
    <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden flex flex-col transition-all">
      {/* Top Header */}
      <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 shadow-2xs">
            <ChannelIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {title || channelId.toUpperCase()}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                {status || 'APPROVED'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              <span className="capitalize font-medium">{channelId}</span>
              <span>&bull;</span>
              <span>{wordCount} words</span>
              <span>&bull;</span>
              <span>{characterCount} chars</span>
              {provider && (
                <>
                  <span>&bull;</span>
                  <span className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded">
                    {provider}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
            title="Download individual channel as text file"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>.txt</span>
          </button>
        </div>
      </div>

      {/* Content Preview */}
      <div className="p-4 sm:p-5 flex-1 space-y-3">
        <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans max-h-60 overflow-y-auto">
          {content}
        </div>

        {/* Human Review Audit Lineage Bar */}
        <div className="p-2.5 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 flex flex-wrap items-center justify-between gap-2 text-[11px] text-emerald-900 dark:text-emerald-300">
          <div className="flex items-center gap-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{reviewer}</span>
            <span className="text-emerald-600/70 dark:text-emerald-400/70">&bull;</span>
            <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">
              {new Date(reviewedAt).toLocaleString()}
            </span>
          </div>
          {reviewerRemarks && (
            <div className="italic text-slate-600 dark:text-slate-400 text-[11px]">
              "{reviewerRemarks}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
