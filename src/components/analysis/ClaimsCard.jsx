import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  AlertTriangle,
  FileText
} from 'lucide-react';
import { 
  CLAIM_VERIFICATION_STATUSES, 
  isHighRiskClaim,
  UNVERIFIED_SOURCE_NOTICE,
  HIGH_RISK_CLAIM_WARNING 
} from '../../types/contentConfidence.js';

export default function ClaimsCard({ claims, sourceText = '' }) {
  if (!claims || claims.length === 0) return null;

  const getClaimEvidence = (claim) => {
    const isHighRisk = isHighRiskClaim(claim);
    const hasIndependentProof = Boolean(
      claim.independentlyVerified === true ||
      claim.isIndependentlyVerified === true ||
      (claim.verificationResult && claim.verificationResult.verified === true)
    );

    // 1. Independently verified
    if (hasIndependentProof) {
      return {
        origin: CLAIM_VERIFICATION_STATUSES.INDEPENDENTLY_VERIFIED,
        isHighRisk,
        isIndependentlyVerified: true,
        verificationStatus: 'Independently verified',
        icon: CheckCircle2,
        badgeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        cardClass: 'bg-emerald-50/30 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-900/40',
        iconClass: 'bg-emerald-100 dark:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300',
        note: 'Verified against authoritative official source'
      };
    }

    // 2. Unknown or not detected
    if (claim.evidenceLevel === 'Not detected' || claim.origin === CLAIM_VERIFICATION_STATUSES.UNKNOWN) {
      return {
        origin: CLAIM_VERIFICATION_STATUSES.UNKNOWN,
        isHighRisk,
        isIndependentlyVerified: false,
        verificationStatus: isHighRisk ? 'Verification required' : 'Ungrounded origin',
        icon: HelpCircle,
        badgeClass: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
        cardClass: 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800',
        iconClass: 'bg-slate-200/80 dark:bg-slate-700 text-slate-600 dark:text-slate-300',
        note: 'Origin cannot be verified from provided source document'
      };
    }

    // 3. Inferred
    if (claim.type === 'ai-inferred' || claim.evidenceLevel === 'Inferred') {
      return {
        origin: CLAIM_VERIFICATION_STATUSES.INFERRED,
        isHighRisk,
        isIndependentlyVerified: false,
        verificationStatus: isHighRisk ? 'Verification required' : 'AI inference',
        icon: Sparkles,
        badgeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        cardClass: 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-200/80 dark:border-amber-900/40',
        iconClass: 'bg-amber-100 dark:bg-amber-900/80 text-amber-700 dark:text-amber-300',
        note: 'Semantically inferred by AI (not directly stated in source)'
      };
    }

    // 4. Extracted from source (Source-grounded, but NOT independently verified)
    return {
      origin: CLAIM_VERIFICATION_STATUSES.EXTRACTED_FROM_SOURCE,
      isHighRisk,
      isIndependentlyVerified: false,
      verificationStatus: isHighRisk ? 'Verification required' : 'Extracted from source',
      icon: isHighRisk ? AlertTriangle : FileText,
      badgeClass: isHighRisk
        ? 'bg-orange-50 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800'
        : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      cardClass: isHighRisk
        ? 'bg-orange-50/25 dark:bg-orange-950/20 border-orange-200/80 dark:border-orange-900/40'
        : 'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200/80 dark:border-slate-800',
      iconClass: isHighRisk
        ? 'bg-orange-100 dark:bg-orange-900/80 text-orange-700 dark:text-orange-300'
        : 'bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300',
      note: isHighRisk
        ? 'High-risk claim from source — ' + UNVERIFIED_SOURCE_NOTICE
        : 'Extracted directly from supplied source text'
    };
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-2xs space-y-4">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Claim Origin & Verification Status
            </h3>
            <span className="text-[10px] text-slate-400 dark:text-slate-500">
              Explicit separation of extracted source facts, AI inferences, and independent verification
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold">
          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Extracted from source
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Inferred
          </span>
          <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" /> Verification required
          </span>
        </div>
      </div>

      {/* Claims List */}
      <div className="space-y-2.5">
        {claims.map((claim, idx) => {
          const evidence = getClaimEvidence(claim);
          const Icon = evidence.icon;
          const statement = typeof claim === 'string' ? claim : claim.statement;
          const sourceExcerpt = claim.sourceExcerpt || claim.excerpt || null;

          return (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border flex items-start gap-3 transition-colors ${evidence.cardClass}`}
            >
              <div className="mt-0.5 shrink-0">
                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${evidence.iconClass}`}>
                  <Icon className="w-3 h-3" />
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 font-normal">
                  {statement}
                </p>

                {sourceExcerpt && (
                  <div className="mt-1.5 p-2 rounded-lg bg-white/70 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-[11px] text-slate-600 dark:text-slate-300 italic">
                    Source excerpt: "{sourceExcerpt}"
                  </div>
                )}

                {evidence.isHighRisk && !evidence.isIndependentlyVerified && (
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200 flex items-start gap-1.5 leading-relaxed">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>{HIGH_RISK_CLAIM_WARNING}</span>
                  </div>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                  <span className={`px-2 py-0.5 rounded font-bold uppercase border ${evidence.badgeClass}`}>
                    {evidence.origin}
                  </span>
                  {evidence.isHighRisk && (
                    <span className="px-2 py-0.5 rounded font-bold uppercase bg-orange-100 dark:bg-orange-950/80 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
                      ⚠️ High-Risk Claim • Verification required
                    </span>
                  )}
                  <span>•</span>
                  <span>{evidence.note}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
