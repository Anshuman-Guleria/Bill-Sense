import { motion } from "motion/react";
import { Receipt, Sparkles, Lightbulb, ShieldCheck } from "lucide-react";

export default function InteractiveHeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
      className="relative z-20 mt-16 md:mt-24 w-full max-w-2xl mx-auto"
    >
      <div 
        className="relative overflow-hidden p-6 md:p-8 rounded-[32px] frosted-glass-heavy transition-all duration-500 group hover:border-[#ddb7ff]/40 hover:shadow-[#ddb7ff]/10"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
        }}
      >
        {/* Decorative corner glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#ddb7ff]/15 blur-[60px] rounded-full group-hover:bg-[#ddb7ff]/25 transition-colors duration-700" />
        
        {/* Card Header */}
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-inner">
              <Receipt className="w-5 h-5 text-[#ddb7ff]" />
            </div>
            <div>
              <div className="text-[10px] tracking-wider font-semibold text-[#cfc2d6] uppercase font-mono">MERCHANT</div>
              <div className="text-sm font-bold text-white tracking-tight">Global Cloud Services</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] tracking-wider font-semibold text-[#cfc2d6] uppercase font-mono">TOTAL DUE</div>
            <div className="text-lg font-mono font-black text-[#ddb7ff] tracking-tight">$1,240.50</div>
          </div>
        </div>

        {/* Card Body Charges */}
        <div className="space-y-6">
          {/* Bill Item 1 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#ddb7ff]/40 hover:bg-white/10 transition-all duration-300 shadow-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white text-sm">Service Fee</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-[#ffb4ab]/15 text-[#ffb4ab] border border-[#ffb4ab]/20 uppercase font-mono">
                  JARGON
                </span>
              </div>
              <div className="text-xs text-[#cfc2d6] font-mono">$15.00</div>
            </div>
            <div className="flex items-center gap-2 bg-[#ddb7ff]/10 p-3 rounded-xl border border-[#ddb7ff]/20">
              <Sparkles className="w-4 h-4 text-[#ddb7ff] shrink-0" />
              <div className="text-xs text-[#ddb7ff] font-medium">
                <span className="font-bold text-[#ddb7ff]">Simplified:</span> A mark-up charge for simply processing your payment.
              </div>
            </div>
          </div>

          {/* Bill Item 2 */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-[#4cd7f6]/40 hover:bg-white/10 transition-all duration-300 shadow-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-white text-sm">Infrastructure Tax Offset</span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold tracking-wider bg-[#4cd7f6]/15 text-[#4cd7f6] border border-[#4cd7f6]/20 uppercase font-mono">
                  COMPLEX
                </span>
              </div>
              <div className="text-xs text-[#cfc2d6] font-mono">$42.80</div>
            </div>
            <div className="flex items-center gap-2 bg-[#4cd7f6]/10 p-3 rounded-xl border border-[#4cd7f6]/20">
              <Lightbulb className="w-4 h-4 text-[#4cd7f6] shrink-0" />
              <div className="text-xs text-[#4cd7f6] font-medium">
                <span className="font-bold text-[#4cd7f6]">Simplified:</span> Standard local municipal server technology surcharge.
              </div>
            </div>
          </div>
        </div>

        {/* Card Footer Banner */}
        <div className="mt-8 pt-6 border-t border-white/10 flex justify-center">
          <div className="flex items-center gap-2 text-[#cfc2d6]/80 text-xs font-mono">
            <ShieldCheck className="w-4 h-4 text-[#4cd7f6]" />
            AI Analysis complete • 99.8% Accuracy
          </div>
        </div>
      </div>

      {/* Atmospheric bottom shadow */}
      <div className="absolute -z-10 -bottom-8 -left-8 w-64 h-64 bg-[#4cd7f6]/5 blur-[80px] rounded-full pointer-events-none" />
    </motion.div>
  );
}
