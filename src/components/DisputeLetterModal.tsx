import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Copy, Check, FileText, Send, Printer } from "lucide-react";
import { BillAnalysis } from "../types";

interface DisputeLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: BillAnalysis;
}

export default function DisputeLetterModal({ isOpen, onClose, bill }: DisputeLetterModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const flaggedChargesText = bill.charges
    .filter((c) => c.isFlagged)
    .map((c) => `  - ${c.name} ($${c.amount.toFixed(2)}): ${c.simplification}`)
    .join("\n");

  const totalFlaggedSavings = bill.charges
    .filter((c) => c.isFlagged)
    .reduce((sum, c) => sum + c.amount, 0)
    .toFixed(2);

  const letterTemplate = `Date: ${today}
To: Customer Billing Department
Provider: ${bill.merchant}
Account Number: ${bill.accountNumber || "N/A"}

RE: Formal Fee Dispute and Request for Account Audit

Dear Customer Solutions Team,

I am writing to formally request a dispute review and adjustments regarding my recent statement associated with account ID ${bill.accountNumber || "N/A"}.

Upon closer examination of the itemized details, I noted several non-mandatory fees and service surcharges which I believe should be waved or credited:

${flaggedChargesText}

The cumulative total of these disputed charges amounts to $${totalFlaggedSavings}. As a loyal customer who values your service, I find these markups highly unclear and request that they be removed from my outstanding invoice or credited back to my account immediately. Additionally, please update my profile parameters to opt out of these supplementary surcharges going forward.

I request a formal response and written confirmation regarding these adjustments within five (5) business days. Thank you for your swift attention to this matter.

Sincerely,
[Your Name]
[Your Phone Number or Contact Email]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(letterTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="relative z-10 w-full max-w-2xl overflow-hidden rounded-[32px] frosted-glass-heavy min-h-[400px] flex flex-col p-8 text-[#e5e1e4]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-[#ddb7ff]/10 rounded border border-[#ddb7ff]/20">
                <FileText className="w-5 h-5 text-[#ddb7ff]" />
              </div>
              <div>
                <h3 className="font-bold text-white tracking-tight text-lg">AI dispute Document Generator</h3>
                <p className="text-xs text-[#cfc2d6]">Ready to submit to {bill.merchant}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#cfc2d6] hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Letter Body Container */}
          <div className="flex-1 overflow-y-auto max-h-[350px] mb-6 p-4 rounded-xl border border-white/5 bg-black/30 font-mono text-xs leading-relaxed text-slate-300 select-all whitespace-pre-wrap custom-scrollbar">
            {letterTemplate}
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center border-t border-white/10 pt-4 mt-auto">
            <span className="text-xs text-[#cfc2d6]/80 text-center sm:text-left">
              💡 <span className="font-semibold text-[#ddb7ff]">Tip:</span> Edit the contact info at the bottom before sending!
            </span>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-4 py-2 text-xs font-semibold rounded-lg bg-white/5 border border-white/10 text-[#e5e1e4] hover:bg-white/10 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Print
              </button>
              
              <button
                onClick={handleCopy}
                className={`flex items-center justify-center gap-1.5 flex-1 sm:flex-none px-5 py-2.5 text-xs font-bold rounded-lg transition-all ${
                  copied
                    ? "bg-green-600 text-white"
                    : "bg-[#b76dff] text-[#2c0051] hover:brightness-115 active:scale-98"
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy Letter Text
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
