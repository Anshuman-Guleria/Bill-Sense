import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Rocket,
  Receipt,
  FileText,
  BadgeAlert,
  ChevronRight,
  Trash2,
  Lock,
  Globe,
  DollarSign,
  HelpCircle,
  TrendingDown,
  Activity,
  History,
  CheckCircle2,
  MousePointerClick
} from "lucide-react";
import NeonShaderBackground from "./components/NeonShaderBackground";
import InteractiveHeroCard from "./components/InteractiveHeroCard";
import DisputeLetterModal from "./components/DisputeLetterModal";
import { SAMPLE_BILLS } from "./data/sampleBills";
import { BillAnalysis, SavedBill, ChargeItem } from "./types";

export default function App() {
  // Navigation & Page State
  const [activeTab, setActiveTab] = useState<"dashboard" | "analysis" | "insights" | "pricing">("dashboard");
  const [billInput, setBillInput] = useState("");
  const [loadingState, setLoadingState] = useState<"idle" | "loading" | "complete">("idle");
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  
  // Storage State
  const [analyzedBill, setAnalyzedBill] = useState<BillAnalysis | null>(null);
  const [billHistory, setBillHistory] = useState<SavedBill[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

  // Modals & UI Toggles
  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [pricingCycle, setPricingCycle] = useState<"monthly" | "yearly">("monthly");
  const [pricingSuccessMsg, setPricingSuccessMsg] = useState<string | null>(null);

  // Preset loading screen text rotation
  const loadingMessages = [
    "Uploading secure statement data...",
    "Analyzing billing merchant details...",
    "Deconstructing transactional charges...",
    "Simplifying financial jargon...",
    "Detecting obscure surcharges and fees...",
    "Formulating optimal dispute recommendation guidelines..."
  ];

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("billsense_history");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SavedBill[];
        setBillHistory(parsed);
        if (parsed.length > 0) {
          // Default selection if already analyzed
          setAnalyzedBill(parsed[0]);
          setSelectedHistoryId(parsed[0].id);
        }
      } catch (err) {
        console.error("Failed to parse local bill history", err);
      }
    }
  }, []);

  // Sync historical shifts with top-level state
  const handleSelectHistory = (id: string) => {
    const found = billHistory.find((b) => b.id === id);
    if (found) {
      setAnalyzedBill(found);
      setSelectedHistoryId(id);
      setActiveTab("dashboard");
    }
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = billHistory.filter((b) => b.id !== id);
    setBillHistory(updated);
    localStorage.setItem("billsense_history", JSON.stringify(updated));

    if (selectedHistoryId === id) {
      if (updated.length > 0) {
        setAnalyzedBill(updated[0]);
        setSelectedHistoryId(updated[0].id);
      } else {
        setAnalyzedBill(null);
        setSelectedHistoryId(null);
      }
    }
  };

  // Pre-fill bill draft
  const handleSelectPreset = (text: string) => {
    setBillInput(text);
    // Pulse effect
    const area = document.getElementById("bill-textarea");
    if (area) {
      area.classList.add("ring-2", "ring-[#ddb7ff]");
      setTimeout(() => area.classList.remove("ring-2", "ring-[#ddb7ff]"), 800);
    }
  };

  // Analyze API route execution trigger
  const handleAnalyzeBill = async () => {
    const textToAnalyze = billInput.trim();
    if (!textToAnalyze || textToAnalyze.length < 5) {
      alert("Please enter or paste raw bill items text details to analyze.");
      return;
    }

    // Trigger loading state sequences
    setLoadingState("loading");
    setLoadingProgress(0);
    setLoadingMsgIdx(0);

    // Dynamic rotation of loading statements
    const textInterval = setInterval(() => {
      setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
    }, 1200);

    // Smooth linear loading progress animation taking ~5 seconds
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 98) {
          clearInterval(progressInterval);
          return 98;
        }
        return prev + 1;
      });
    }, 50);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ billText: textToAnalyze })
      });

      if (!response.ok) {
        throw new Error("Billing analysis server request failed.");
      }

      const parsedResults = (await response.json()) as BillAnalysis;

      // Finish loading animation
      setTimeout(() => {
        clearInterval(textInterval);
        clearInterval(progressInterval);
        setLoadingProgress(100);

        setTimeout(() => {
          // Save with timestamps to state and local storage
          const newSave: SavedBill = {
            ...parsedResults,
            id: "bill_" + Date.now(),
            timestamp: new Date().toLocaleString(),
            rawText: textToAnalyze
          };

          const updatedHistory = [newSave, ...billHistory];
          setBillHistory(updatedHistory);
          localStorage.setItem("billsense_history", JSON.stringify(updatedHistory));

          setAnalyzedBill(newSave);
          setSelectedHistoryId(newSave.id);
          setLoadingState("complete");
          
          // Switch automatically to standard results display
          setTimeout(() => {
            setLoadingState("idle");
            setActiveTab("dashboard");
          }, 600);

        }, 400);
      }, 500);

    } catch (err) {
      console.error("Fail analyzing bill details: ", err);
      clearInterval(textInterval);
      clearInterval(progressInterval);
      setLoadingState("idle");
      alert("Failed connecting to AI engine server. Check connection details and try again.");
    }
  };

  // Mock pricing trigger
  const handleCheckoutMock = (plan: string) => {
    setPricingSuccessMsg(`Thank you! Simulated payment process initiated for ${plan} plan. (Free preview sandbox state).`);
    setTimeout(() => setPricingSuccessMsg(null), 5000);
  };

  const getFlaggedTotal = (bill: BillAnalysis) => {
    return bill.charges.filter((c) => c.isFlagged).reduce((a, b) => a + b.amount, 0);
  };

  const getFlaggedPercentage = (bill: BillAnalysis) => {
    if (!bill.totalAmount) return 0;
    const flagged = getFlaggedTotal(bill);
    return Math.round((flagged / bill.totalAmount) * 100);
  };

  return (
    <div className="min-h-screen text-[#e5e1e4] flex flex-col font-sans select-none relative pb-12 overflow-x-hidden bg-[#0a0c12]">
      
      {/* Background Interactive Shader */}
      <NeonShaderBackground />

      {/* Layered Glass Ambient Orbs */}
      <div className="absolute top-[-100px] left-[-100px] w-[500px] h-[500px] bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-[-150px] right-[-100px] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[20%] right-[10%] w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none -z-10" />

      {/* Header Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-40 bg-[#0a0c12]/60 backdrop-blur-3xl border-b border-white/10 shadow-lg">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-7xl mx-auto">
          
          {/* Logo */}
          <div 
            onClick={() => {
              setActiveTab("dashboard");
              setAnalyzedBill(billHistory[0] || null);
            }}
            className="flex items-center gap-1.5 cursor-pointer select-none group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#b76dff] flex items-center justify-center font-bold text-[#2c0051] text-lg transform group-hover:rotate-6 transition-all duration-300 shadow-md shadow-[#b76dff]/20">
              BS
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-[#ddb7ff] bg-clip-text text-transparent">
              BillSense
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative py-1 ${
                activeTab === "dashboard" ? "text-[#ddb7ff]" : "text-[#cfc2d6] hover:text-white"
              }`}
            >
              Dashboard
              {activeTab === "dashboard" && (
                <motion.div layoutId="nav-glow" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ddb7ff]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("analysis")}
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative py-1 ${
                activeTab === "analysis" ? "text-[#ddb7ff]" : "text-[#cfc2d6] hover:text-white"
              }`}
            >
              Analysis
              {activeTab === "analysis" && (
                <motion.div layoutId="nav-glow" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ddb7ff]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative py-1 ${
                activeTab === "insights" ? "text-[#ddb7ff]" : "text-[#cfc2d6] hover:text-white"
              }`}
            >
              Insights
              {activeTab === "insights" && (
                <motion.div layoutId="nav-glow" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ddb7ff]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("pricing")}
              className={`text-sm font-semibold tracking-wide transition-all duration-300 relative py-1 ${
                activeTab === "pricing" ? "text-[#ddb7ff]" : "text-[#cfc2d6] hover:text-white"
              }`}
            >
              Pricing
              {activeTab === "pricing" && (
                <motion.div layoutId="nav-glow" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#ddb7ff]" />
              )}
            </button>
          </div>

          {/* Header Action Button */}
          <button
            onClick={() => setActiveTab("analysis")}
            className="hidden sm:inline-flex items-center px-4.5 py-1.5 rounded-full text-xs font-bold bg-[#ddb7ff] text-[#490080] hover:scale-105 active:scale-95 transition-all shadow-md shadow-[#ddb7ff]/10"
          >
            Try BillSense
          </button>
        </div>
      </nav>

      {/* Main Container Content */}
      <main className="flex-1 pt-24 px-4 md:px-8 max-w-7xl mx-auto w-full flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* loading Screen wrapper overlay */}
          {loadingState === "loading" && (
            <motion.div
              key="loading-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-[#0a0c12]/92 backdrop-blur-md flex flex-col items-center justify-center px-6"
            >
              <div className="w-full max-w-md p-8 rounded-[32px] frosted-glass-heavy flex flex-col items-center text-center shadow-2xl">
                <span className="text-sm font-bold text-[#b76dff] tracking-widest uppercase mb-2 font-mono">Analyzing Intelligence</span>
                <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">BillSense</h2>
                
                {/* Circular pulsing ring spinner */}
                <div className="relative w-32 h-32 mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-white/5 rounded-full" />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="absolute inset-0 border-4 border-[#ddb7ff] border-t-transparent border-r-transparent rounded-full shadow-[0_0_15px_rgba(221,183,255,0.4)]"
                  />
                  <Receipt className="w-10 h-10 text-[#ddb7ff]" />
                </div>

                {/* Rotating description */}
                <div className="h-14 flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={loadingMsgIdx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-[#cfc2d6] font-medium tracking-wide leading-relaxed"
                    >
                      {loadingMessages[loadingMsgIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Progress Bar slider */}
                <div className="w-full bg-white/5 h-[4px] rounded-full mt-6 overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-[#ddb7ff] to-[#b76dff] progress-glow transition-all duration-100 rounded-full"
                    style={{ width: `${loadingProgress}%` }}
                  />
                </div>
                <div className="flex justify-between w-full mt-2 text-[10px] text-[#cfc2d6]/70 uppercase tracking-widest font-mono">
                  <span>PROCESSING</span>
                  <span className="text-[#ddb7ff] font-semibold">{loadingProgress}%</span>
                </div>
              </div>

              {/* Secure bottom banner */}
              <div className="mt-6 flex items-center gap-1.5 text-xs text-[#cfc2d6]/60 font-mono">
                <Lock className="w-3.5 h-3.5 text-[#4cd7f6]" />
                Bank-grade 256-bit secure encryption active
              </div>
            </motion.div>
          )}

          {/* TAB 1: HERO / LANDING PAGE & RESULTS DASHBOARD */}
          {activeTab === "dashboard" && (
            <motion.div
              key="dashboard-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col gap-10 py-4"
            >
              {analyzedBill ? (
                /* ACTUAL BILL ANALYSIS RESULTS DASHBOARD */
                <div className="flex flex-col gap-8">
                  
                  {/* Results Header block */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-white/5 pb-6">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#4cd7f6] animate-pulse" />
                        <span className="text-xs font-bold text-[#4cd7f6] tracking-widest uppercase font-mono">ANALYSIS COMPLETE</span>
                      </div>
                      <h1 className="text-3xl font-extrabold text-white tracking-tight">Statement Evaluation</h1>
                      <p className="text-xs text-[#cfc2d6] mt-1 font-mono">
                        Merchant: <span className="text-white font-bold">{analyzedBill.merchant}</span> • Date: <span className="text-white font-bold">{analyzedBill.billingDate}</span> • Account ID: <span className="text-white font-bold">{analyzedBill.accountNumber}</span>
                      </p>
                    </div>

                    {/* Dashboard tools: Switch between processed bills */}
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                      {billHistory.length > 1 && (
                        <div className="flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md rounded-xl px-3 py-1.5 focus-within:border-[#ddb7ff]/50">
                          <History className="w-4 h-4 text-[#cfc2d6]" />
                          <select
                            value={selectedHistoryId || ""}
                            onChange={(e) => handleSelectHistory(e.target.value)}
                            className="bg-transparent text-xs font-bold text-[#cfc2d6] border-none outline-none focus:ring-0 cursor-pointer pr-8"
                          >
                            {billHistory.map((h) => (
                              <option key={h.id} value={h.id} className="bg-[#1c1b1d] text-white">
                                {h.merchant} ({h.totalAmount ? `$${h.totalAmount.toFixed(2)}` : "Analyzing"})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      
                      <button
                        onClick={() => {
                          setBillInput("");
                          setActiveTab("analysis");
                        }}
                        className="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#ddb7ff]" />
                        Analyze New Statement
                      </button>
                    </div>
                  </div>

                  {/* BENTO GRID results layout */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Grid Item A: Plain English Executive Summary */}
                    <div className="lg:col-span-8 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl relative overflow-hidden group shadow-lg">
                      <div className="absolute -right-24 -top-24 w-48 h-48 bg-[#ddb7ff]/10 blur-3xl rounded-full" />
                      <div className="flex items-start gap-4 mb-4">
                        <div className="p-2 bg-[#ddb7ff]/10 rounded-xl border border-[#ddb7ff]/20">
                          <FileText className="w-5 h-5 text-[#ddb7ff]" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-white tracking-tight">Plain English Summary</h2>
                          <span className="text-[10px] uppercase font-mono tracking-wider text-[#cfc2d6]">Executive Overview</span>
                        </div>
                      </div>
                      <p className="text-sm text-[#cfc2d6] leading-relaxed select-text mt-2 font-sans font-medium">
                        {analyzedBill.summary}
                      </p>
                    </div>

                    {/* Grid Item B: Financial Surcharges Leakage Visualizer */}
                    <div className="lg:col-span-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col justify-between group shadow-lg">
                      <div>
                        <span className="text-[10px] uppercase font-mono tracking-wider text-[#cfc2d6] mb-1 block">Inflated exposure</span>
                        <div className="text-4xl font-extrabold text-[#4cd7f6] font-mono tracking-tight">
                          ${analyzedBill.totalAmount?.toFixed(2)}
                        </div>
                        <p className="text-xs text-[#cfc2d6]/80 mt-1 font-sans">
                          Contains <span className="text-[#ffb4ab] font-bold">${getFlaggedTotal(analyzedBill).toFixed(2)}</span> ({getFlaggedPercentage(analyzedBill)}%) in flagged surcharges.
                        </p>
                      </div>

                      {/* Spark chart graphics */}
                      <div className="mt-6 pt-4 border-t border-white/5">
                        <div className="flex items-end gap-1.5 h-16 justify-between mb-2">
                          <div className="bg-[#4cd7f6]/10 hover:bg-[#4cd7f6]/20 transition-all rounded-t w-full h-[35%]" title="Prior Month 4" />
                          <div className="bg-[#4cd7f6]/20 hover:bg-[#4cd7f6]/30 transition-all rounded-t w-full h-[55%]" title="Prior Month 3" />
                          <div className="bg-[#4cd7f6]/10 hover:bg-[#4cd7f6]/20 transition-all rounded-t w-full h-[30%]" title="Prior Month 2" />
                          <div className="bg-[#4cd7f6]/30 hover:bg-[#4cd7f6]/40 transition-all rounded-t w-full h-[65%]" title="Previous Month" />
                          <div className="bg-gradient-to-t from-[#4cd7f6] to-[#ddb7ff] hover:brightness-110 transition-all rounded-t w-full h-[85%] shadow-[0_0_10px_rgba(76,215,246,0.3)] animate-pulse" title="Current Month State" />
                        </div>
                        <div className="flex justify-between text-[10px] text-[#cfc2d6]/60 font-mono">
                          <span>HISTORIC EXPOSURE RANGE</span>
                          <span className="text-[#4cd7f6] font-bold">CURRENT</span>
                        </div>
                      </div>
                    </div>

                    {/* Grid Item C: Dynamic Charge Breakdown Table */}
                    <div className="lg:col-span-6 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex flex-col shadow-lg">
                      <div className="flex items-center justify-between mb-6 pb-2 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <Receipt className="w-5 h-5 text-[#cfc2d6]" />
                          <h2 className="text-lg font-bold text-white tracking-tight">Charge Breakdown</h2>
                        </div>
                        <span className="text-[10px] font-mono font-semibold bg-white/5 px-2 py-0.5 rounded text-[#cfc2d6]">
                          {analyzedBill.charges?.length || 0} ITEMS DETECTED
                        </span>
                      </div>

                      <div className="flex-1 overflow-y-auto max-h-[420px] pr-2 space-y-3 custom-scrollbar">
                        {analyzedBill.charges?.map((charge) => (
                          <div
                            key={charge.id}
                            className={`flex justify-between items-center p-3 rounded-lg border transition-all ${
                              charge.isFlagged
                                ? "bg-[#ffb4ab]/5 border-[#ffb4ab]/15 hover:border-[#ffb4ab]/30"
                                : "bg-white/5 border-white/5 hover:border-white/10"
                            }`}
                          >
                            <div className="flex flex-col min-w-0 max-w-[70%]">
                              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                <span className="font-semibold text-white text-xs truncate leading-normal" title={charge.name}>
                                  {charge.name}
                                </span>
                                {charge.isFlagged && (
                                  <span className="px-1.5 py-0.2 rounded text-[8px] font-extrabold tracking-wider bg-[#ffb4ab]/10 text-[#ffb4ab] uppercase font-mono">
                                    FLAGGED
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] text-[#cfc2d6] font-mono capitalize">
                                {charge.category}
                              </span>
                            </div>
                            <span className="font-bold text-white font-mono text-xs text-right whitespace-nowrap">
                              ${charge.amount?.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Grid Item D: suspicious charges breakdown card */}
                    <div className="lg:col-span-6 flex flex-col gap-6">
                      
                      {/* Suspicious breakdown list */}
                      <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl flex-grow shadow-lg">
                        <div className="flex items-center gap-2 mb-6 pb-2 border-b border-white/10">
                          <BadgeAlert className="w-5 h-5 text-[#ffb4ab]" />
                          <h2 className="text-lg font-bold text-white tracking-tight font-sans">Flagged Surcharges Info</h2>
                          <div className="flex h-2 w-2 relative ml-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffb4ab] opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ffb4ab]" />
                          </div>
                        </div>

                        <div className="overflow-y-auto max-h-[300px] pr-2 space-y-4 custom-scrollbar">
                          {analyzedBill.charges?.filter((c) => c.isFlagged).length === 0 ? (
                            <div className="text-center py-10 text-xs text-[#cfc2d6]/70 italic">
                              Excellent! No supplementary suspicious surcharges identified on this invoice.
                            </div>
                          ) : (
                            analyzedBill.charges
                              ?.filter((c) => c.isFlagged)
                              .map((charge) => (
                                <div
                                  key={charge.id}
                                  className="p-3.5 rounded-lg bg-black/40 border-l-2 border-[#b76dff] hover:bg-black/50 transition-all flex flex-col gap-2 group"
                                >
                                  <div className="flex justify-between items-start gap-2">
                                    <span className="text-xs font-bold text-[#b76dff] group-hover:text-[#ddb7ff] transition-all">
                                      {charge.name}
                                    </span>
                                    <span className="text-xs font-bold text-white font-mono shrink-0">
                                      ${charge.amount?.toFixed(2)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-[#cfc2d6] italic font-medium leading-relaxed">
                                    <strong>Simplified:</strong> {charge.simplification}
                                  </p>
                                  <div className="text-[10px] text-[#4cd7f6] mt-1 bg-[#4cd7f6]/5 p-2 rounded border border-[#4cd7f6]/10 font-sans leading-relaxed">
                                    <strong>How to avoid:</strong> {charge.actionTip}
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      {/* Grid Item E: Final Dispute Action Recommendation Box */}
                      <div className="p-6 rounded-2xl border border-[#ddb7ff]/30 bg-[#ddb7ff]/5 backdrop-blur-xl relative overflow-hidden group flex flex-col md:flex-row items-start gap-4 shadow-lg">
                        <div className="p-3 bg-[#ddb7ff]/20 rounded-full shrink-0 shadow-md">
                          <Sparkles className="w-6 h-6 text-[#ddb7ff]" />
                        </div>
                        <div className="flex-1">
                          <h2 className="text-base font-extrabold text-white tracking-tight mb-1">Final Recommendation</h2>
                          <p className="text-xs text-[#cfc2d6] leading-relaxed mb-4">
                            {analyzedBill.recommendation}
                          </p>
                          <button
                            onClick={() => setDisputeModalOpen(true)}
                            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-white text-[#2c0051] font-bold text-xs select-all hover:bg-[#ddb7ff] hover:text-[#490080] transition-all duration-300 shadow-md transform hover:-translate-y-0.5"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Start Dispute Process
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              ) : (
                /* BILLSENSE MAIN LANDING / INTRO SHOWCASE */
                <div className="flex flex-col items-center py-4 text-center">
                  
                  {/* Announcement bubble */}
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 font-mono text-xs select-text">
                    <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse shadow-[0_0_8px_#4cd7f6]" />
                    <span className="text-[10px] font-semibold text-[#cfc2d6] uppercase tracking-wider">Intelligent Bill Processing Live</span>
                  </div>

                  {/* Hero Headline */}
                  <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight leading-none text-glow select-text">
                    Understand Any <span className="text-[#ddb7ff] italic glow-primary-brand select-text">Bill</span> <br /> in Seconds
                  </h1>

                  {/* Hero Subtitle description */}
                  <p className="text-sm md:text-lg text-[#cfc2d6] max-w-2xl mb-10 font-medium select-text leading-relaxed">
                    Paste any confusing statement and instantly simplify arbitrary charges, hidden administrative fees, and corporate legal jargon in plain English.
                  </p>

                  {/* Core CTAs */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-12 relative z-30">
                    <button
                      onClick={() => setActiveTab("analysis")}
                      className="px-8 py-3.5 rounded-xl text-sm font-extrabold bg-gradient-to-r from-[#ddb7ff] to-[#b76dff] text-[#2c0051] shadow-lg shadow-[#b76dff]/15 hover:shadow-[#b76dff]/30 hover:scale-103 active:scale-97 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Get Started Free</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => {
                        setBillInput(SAMPLE_BILLS[0].text);
                        setActiveTab("analysis");
                      }}
                      className="px-8 py-3.5 rounded-xl text-sm font-extrabold bg-white/5 border border-white/10 text-white hover:bg-white/12 hover:border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <MousePointerClick className="w-4 h-4 text-[#4cd7f6]" />
                      <span>View Active Demo</span>
                    </button>
                  </div>

                  {/* Feature highlights bullets */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl w-full border-t border-white/5 pt-10 mt-6 text-left">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#4cd7f6]/10 rounded-lg text-[#4cd7f6] shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white mb-0.5 uppercase tracking-wide">Jargon Translation</h4>
                        <p className="text-[11px] text-[#cfc2d6] leading-relaxed">Unclear, heavy descriptions resolved instantly into standard human language terms.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-[#b76dff]/10 rounded-lg text-[#b76dff] shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white mb-0.5 uppercase tracking-wide">Fee Detection</h4>
                        <p className="text-[11px] text-[#cfc2d6] leading-relaxed">Instantly highlights non-mandatory surcharges, rentals, and hidden markup fees.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-green-500/10 rounded-lg text-green-400 shrink-0">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white mb-0.5 uppercase tracking-wide">Dispute Assistance</h4>
                        <p className="text-[11px] text-[#cfc2d6] leading-relaxed">Generated consumer letters and structural guidelines ready to clip and send.</p>
                      </div>
                    </div>
                  </div>

                  {/* Interactive mock showcase container */}
                  <InteractiveHeroCard />

                </div>
              )}
            </motion.div>
          )}

          {/* TAB 2: ANALYSIS INPUT FORM */}
          {activeTab === "analysis" && (
            <motion.div
              key="analysis-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-8 max-w-4xl mx-auto w-full py-4"
            >
              <div className="text-center">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Intelligent Analysis</h1>
                <p className="text-xs text-[#cfc2d6] mt-2 max-w-xl mx-auto">
                  Deconstruct your financial statements with absolute precision. Our AI identifies billing errors, hidden equipment fees, and monthly overhead reduction vectors.
                </p>
              </div>

              {/* Input Interactive Glass Container */}
              <div className="p-6 md:p-8 rounded-[32px] frosted-glass-heavy shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#ddb7ff]/10 blur-[100px] rounded-full" />
                
                {/* 1. sample preset quick tabs */}
                <div className="mb-6 relative z-15">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-[#cfc2d6]/80 block mb-3 font-mono">
                    CHOOSE STATEMENT SAMPLES FOR TESTING
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {SAMPLE_BILLS.map((b) => (
                      <button
                        key={b.key}
                        onClick={() => handleSelectPreset(b.text)}
                        className="px-4 py-2 rounded-full text-xs font-semibold bg-white/5 border border-white/5 hover:bg-white/10 hover:border-[#ddb7ff]/30 text-white transition-all cursor-pointer flex items-center gap-1.5 focus:scale-95"
                      >
                        <Receipt className="w-3.5 h-3.5 text-[#ddb7ff]" />
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Text Input area */}
                <div className="relative z-10 flex flex-col">
                  <div className="flex justify-between items-center mb-1 text-[10px] text-[#cfc2d6] uppercase tracking-wider font-mono font-semibold">
                    <span>PASTE BILL DOCUMENT CONTENT OR EXTRAS HERE</span>
                    <span>{billInput.length} CHARACTERS</span>
                  </div>
                  <textarea
                    id="bill-textarea"
                    placeholder="Enter or paste statement transaction line receipts, standard utilities outputs, or raw items listing text..."
                    value={billInput}
                    onChange={(e) => setBillInput(e.target.value)}
                    className="w-full h-64 bg-black/30 border border-white/10 rounded-2xl p-5 font-mono text-xs text-white leading-relaxed placeholder:text-[#cfc2d6]/40 focus:outline-none focus:border-[#ddb7ff]/50 focus:ring-1 focus:ring-[#ddb7ff]/20 transition-all custom-scrollbar resize-none"
                  />
                </div>

                {/* Action Trigger box */}
                <div className="mt-6 flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-2 text-xs text-[#cfc2d6] select-text font-medium">
                    <div className="h-2 w-2 relative flex shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#4cd7f6] opacity-75 animate-duration-1000" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-[#4cd7f6]" />
                    </div>
                    <span>AI Engine Status: Active & Ready</span>
                  </div>

                  <button
                    onClick={handleAnalyzeBill}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-[#ddb7ff] to-[#b76dff] text-[#2c0051] hover:brightness-110 hover:scale-102 active:scale-98 transition-all shrink-0 w-full sm:w-auto cursor-pointer"
                  >
                    <span>Analyze Bill Statement</span>
                    <Rocket className="w-4 h-4 shrink-0" />
                  </button>
                </div>
              </div>

              {/* Secure storage bottom disclosure bar */}
              <div className="flex items-center justify-center gap-2 text-[#cfc2d6]/60 text-xs text-center select-text">
                <ShieldCheck className="w-4 h-4 text-[#4cd7f6]" />
                Client-First Privacy: No statement files or credentials are persisted permanently on our servers.
              </div>
            </motion.div>
          )}

          {/* TAB 3: INSIGHTS & HISTORICAL LOGS */}
          {activeTab === "insights" && (
            <motion.div
              key="insights-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-8 max-w-5xl mx-auto w-full py-4"
            >
              <div className="text-center">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Financial Surcharges Insights</h1>
                <p className="text-xs text-[#cfc2d6] mt-2 max-w-xl mx-auto">
                  Aggregate evaluation tracking all analysed profiles. Review hidden fees leakage over time and prioritize disputes.
                </p>
              </div>

              {billHistory.length === 0 ? (
                /* EMPTY INSIGHTS LOGS DISPLAY */
                <div className="p-12 text-center rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl max-w-xl mx-auto shadow-xl">
                  <BadgeAlert className="w-12 h-12 text-[#ddb7ff] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-white mb-2">No statements processed yet</h3>
                  <p className="text-xs text-[#cfc2d6] mb-6">
                    Analyze some bills in the Analysis center to build aggregated evaluations, insights charts, and dispute schedules.
                  </p>
                  <button
                    onClick={() => setActiveTab("analysis")}
                    className="px-6 py-2.5 bg-[#b76dff] text-[#2c0051] font-bold text-xs rounded-lg hover:scale-103 transition-all"
                  >
                    Upload My First Statement
                  </button>
                </div>
              ) : (
                /* INTERACTIVE INSIGHTS PANEL */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Summary Metric Bento widgets */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    
                    {/* Bento A: Accumulated disputed savings potential */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-mono tracking-wider uppercase text-[#cfc2d6]">Total Dispute Potential</span>
                        <TrendingDown className="w-5 h-5 text-green-400" />
                      </div>
                      <div className="text-4xl font-black font-mono text-green-400">
                        ${billHistory.reduce((sum, b) => sum + getFlaggedTotal(b), 0).toFixed(2)}
                      </div>
                      <p className="text-xs text-[#cfc2d6]/80 mt-2">
                        Aggregated fee load found across <span className="text-white font-bold">{billHistory.length}</span> analyzed statements.
                      </p>
                    </div>

                    {/* Bento B: Fee leakage efficiency metric */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
                      <div className="flex justify-between items-start mb-4">
                        <span className="text-[10px] font-mono tracking-wider uppercase text-[#cfc2d6]">Average bill markup</span>
                        <Activity className="w-5 h-5 text-[#ffb4ab]" />
                      </div>
                      <div className="text-3xl font-extrabold font-mono text-[#ffb4ab]">
                        {Math.round(
                          billHistory.reduce((sum, b) => sum + getFlaggedPercentage(b), 0) / billHistory.length
                        )}%
                      </div>
                      <p className="text-xs text-[#cfc2d6]/80 mt-2">
                        Average percentage of bills consist of non-mandatory or suspicious markups.
                      </p>
                    </div>

                    {/* Bento C: Top problematic categorizers */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-[#cfc2d6] mb-3 block">Top fee sources</span>
                      <div className="space-y-3">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white">Modem & Leasing Rentals</span>
                          <span className="text-[#ddb7ff] font-mono">18% avg</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white">Admin Processing Fees</span>
                          <span className="text-[#ddb7ff] font-mono">24% avg</span>
                        </div>
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-white">Late & ATM Penalties</span>
                          <span className="text-[#ddb7ff] font-mono">15% avg</span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* History Logs Center display */}
                  <div className="lg:col-span-8 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
                    <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                      <h2 className="text-lg font-bold text-white tracking-tight">Statement History Logs</h2>
                      <span className="text-xs font-mono font-semibold text-[#cfc2d6] bg-white/10 px-2.5 py-1 rounded">
                        {billHistory.length} SAVED
                      </span>
                    </div>

                    <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                      {billHistory.map((bill) => (
                        <div
                          key={bill.id}
                          onClick={() => handleSelectHistory(bill.id)}
                          className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-[#ddb7ff]/45 hover:bg-white/10 transition-all cursor-pointer flex justify-between items-center gap-4 group shadow-sm"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2.5 mb-1.5 min-w-0">
                              <h3 className="text-sm font-bold text-white group-hover:text-[#ddb7ff] transition-all truncate">
                                {bill.merchant}
                              </h3>
                              <span className="px-2 py-0.2 rounded text-[8px] font-mono font-extrabold tracking-wider bg-white/5 text-[#cfc2d6] whitespace-nowrap">
                                {bill.charges?.length || 0} ITEMS
                              </span>
                            </div>
                            <span className="text-[10px] text-[#cfc2d6]/70 font-mono block">
                              Processed: {bill.timestamp} • Account: {bill.accountNumber}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 shrink-0 font-mono text-right">
                            <div>
                              <div className="text-xs font-bold text-white">${bill.totalAmount?.toFixed(2)}</div>
                              <div className="text-[9px] text-[#ffb4ab] font-bold">
                                -${getFlaggedTotal(bill).toFixed(2)} Fee Markups
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => handleDeleteHistory(bill.id, e)}
                              className="p-1.5 rounded-lg text-[#cfc2d6]/60 hover:text-[#ffb4ab] hover:bg-[#ffb4ab]/10 transition-all opacity-0 group-hover:opacity-100"
                              title="Delete log"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                            <ChevronRight className="w-5 h-5 text-[#cfc2d6]/60" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: PRICING PLANS COMPACT BOX */}
          {activeTab === "pricing" && (
            <motion.div
              key="pricing-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-8 max-w-4xl mx-auto w-full py-4"
            >
              <div className="text-center">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">Flexible, Transparent Pricing</h1>
                <p className="text-xs text-[#cfc2d6] mt-2 max-w-md mx-auto">
                  Protect yourself from hidden administrative creep with our professional bill processing suite. Choose a plan that fits your volume needs.
                </p>

                {/* Monthly/Yearly Billing toggle selector */}
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/5 p-1 rounded-full mt-6 relative z-30">
                  <button
                    onClick={() => setPricingCycle("monthly")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      pricingCycle === "monthly" ? "bg-[#b76dff] text-[#2c0051] shadow" : "text-[#cfc2d6] hover:text-white"
                    }`}
                  >
                    Billed Monthly
                  </button>
                  <button
                    onClick={() => setPricingCycle("yearly")}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all relative ${
                      pricingCycle === "yearly" ? "bg-[#b76dff] text-[#2c0051] shadow" : "text-[#cfc2d6] hover:text-white"
                    }`}
                  >
                    Billed Annually
                    <span className="absolute -top-3.5 -right-3 bg-green-500 text-white text-[8px] font-extrabold px-1.5 py-0.2 rounded-full tracking-wider uppercase transform scale-90">
                      Save 20%
                    </span>
                  </button>
                </div>
              </div>

              {/* Checkout dynamic message feedback */}
              {pricingSuccessMsg && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-xl text-center text-xs font-medium"
                >
                  {pricingSuccessMsg}
                </motion.div>
              )}

              {/* Pricing Cards Comparison Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-20">
                
                {/* Plan 1: Free Basic Tier */}
                <div className="p-8 rounded-[32px] frosted-glass-heavy flex flex-col justify-between group hover:border-white/20 transition-all duration-300 shadow-xl">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-white">BillSense Lite</h3>
                        <p className="text-[11px] text-[#cfc2d6]/80 mt-0.5">Perfect for primary individual testing</p>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-bold bg-[#cfc2d6]/10 text-white border border-white/10 uppercase tracking-widest rounded-full font-mono">
                        BASIC
                      </span>
                    </div>

                    <div className="text-3xl font-black text-white font-mono tracking-tight mb-6">
                      $0 <span className="text-xs font-normal text-[#cfc2d6]/60">/ forever</span>
                    </div>

                    <ul className="space-y-4 text-xs font-medium text-[#cfc2d6] border-t border-white/5 pt-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#4cd7f6]" />
                        Up to 3 statements processed monthly
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#4cd7f6]" />
                        Rule-based markup fee identification
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#4cd7f6]" />
                        Structured simplification definitions
                      </li>
                      <li className="flex items-center gap-2 text-[#cfc2d6]/40 line-through">
                        Custom AI tailored formal dispute letters
                      </li>
                      <li className="flex items-center gap-2 text-[#cfc2d6]/40 line-through">
                        Historical trend visualization aggregations
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => setActiveTab("analysis")}
                    className="w-full mt-8 py-3 rounded-xl font-bold text-xs bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Analyze Free Now
                  </button>
                </div>

                {/* Plan 2: Pro Tier */}
                <div className="p-8 rounded-[32px] frosted-glass-heavy border-[#ddb7ff]/30 bg-[#ddb7ff]/5 backdrop-blur-2xl flex flex-col justify-between group shadow-xl relative overflow-hidden">
                  {/* Decorative card gradient flair */}
                  <div className="absolute -right-20 -top-20 w-44 h-44 bg-[#ddb7ff]/15 blur-3xl rounded-full" />
                  
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-extrabold text-white">BillSense Pro</h3>
                        <p className="text-[11px] text-[#ddb7ff]/80 mt-0.5">Maximum savings & deep auditing</p>
                      </div>
                      <span className="px-2.5 py-1 text-[9px] font-bold bg-[#ddb7ff]/10 text-[#ddb7ff] border border-[#ddb7ff]/20 uppercase tracking-widest rounded-full font-mono animate-pulse">
                        POPULAR
                      </span>
                    </div>

                    <div className="text-3xl font-black text-white font-mono tracking-tight mb-6">
                      {pricingCycle === "monthly" ? "$19" : "$15"}{" "}
                      <span className="text-xs font-normal text-[#cfc2d6]/60">/ month</span>
                    </div>

                    <ul className="space-y-4 text-xs font-medium text-[#cfc2d6] border-t border-[#ddb7ff]/10 pt-6">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Unlimited statement analysis audits
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Next-Gen server-side Gemini AI processing
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Tailored interactive formal dispute drafting
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Save multi-month historical trend insights
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        Priority customer advocacy solutions support
                      </li>
                    </ul>
                  </div>

                  <button
                    onClick={() => handleCheckoutMock("PRO")}
                    className="w-full mt-8 py-3 rounded-xl font-bold text-xs bg-[#ddb7ff] text-[#490080] hover:brightness-110 active:scale-98 transition-all shadow-md shadow-[#ddb7ff]/10 cursor-pointer"
                  >
                    Go Pro
                  </button>
                </div>

              </div>

              {/* General FAQ section */}
              <div className="mt-12 border-t border-white/5 pt-10 text-left max-w-2xl mx-auto w-full">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider mb-6 text-center select-text">Frequently Asked Questions</h3>
                <div className="space-y-6 select-text">
                  <div className="select-text">
                    <h4 className="text-xs font-bold text-white mb-1">How soon do I receive findings after pasting?</h4>
                    <p className="text-[11px] text-[#cfc2d6]/80 leading-relaxed">Audits process in about 4-6 seconds using our server-proxied Gemini models, which parse line items and draft dispute arguments simultaneously.</p>
                  </div>
                  <div className="select-text">
                    <h4 className="text-xs font-bold text-white mb-1 font-sans">Is my diagnostic banking detail safe?</h4>
                    <p className="text-[11px] text-[#cfc2d6]/80 leading-relaxed font-sans">Absolutely. BillSense runs strictly transient operations. No raw files or scanned credit numbers are saved permanently on our backends. All storage remains local to your device’s sandbox memory.</p>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer Branding Bar */}
      <footer className="w-full py-6 border-t border-white/5 bg-[#0e0e10]/80 backdrop-blur-xl mt-20 relative z-10 font-mono">
        <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 gap-6 max-w-7xl mx-auto">
          
          {/* Logo Name */}
          <div className="text-sm font-bold text-[#ddb7ff]">BillSense</div>
          
          {/* Copyrights */}
          <div className="text-[10px] text-[#cfc2d6]/60">
            © 2026 BillSense. Elevated Financial Intelligence & Advocacy.
          </div>

          {/* Guidelines Links */}
          <div className="flex gap-6 text-[10px]">
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[#cfc2d6] hover:text-white transition-opacity font-mono">Privacy</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[#cfc2d6] hover:text-white transition-opacity font-mono">Terms</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[#cfc2d6] hover:text-white transition-opacity font-mono">Security</a>
            <a href="#" onClick={(e) => e.preventDefault()} className="text-[#cfc2d6] hover:text-white transition-opacity font-mono font-sans">Support</a>
          </div>
        </div>
      </footer>

      {/* Active Dispute generation Formal document overlays */}
      {analyzedBill && (
        <DisputeLetterModal
          isOpen={disputeModalOpen}
          onClose={() => setDisputeModalOpen(false)}
          bill={analyzedBill}
        />
      )}

    </div>
  );
}
