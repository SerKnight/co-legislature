"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Scale, Search, Sparkles, Gavel, Home, Car, Users, Building2, Heart,
  Briefcase, Vote, DollarSign, Shield, TreePine, GraduationCap,
  ChevronDown, X, ArrowLeft, Dices
} from "lucide-react";

const categories = [
  { id: "criminal", name: "Criminal Law", icon: Gavel, color: "from-orange-500 to-orange-600", pill: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    subtopics: [
      { name: "DUI & Impaired Driving", questions: ["What are the penalties for first-time DUI?", "What are Colorado's blood alcohol limits?", "Can I refuse a breathalyzer test?", "How long does a DUI stay on my record?"] },
      { name: "Drug Offenses", questions: ["What are marijuana possession limits?", "What are penalties for drug paraphernalia?", "Is CBD oil legal in Colorado?", "What is a DUID charge?"] },
      { name: "Violent Crimes", questions: ["What constitutes self-defense?", "What defines domestic violence?", "What is the statute of limitations for assault?", "What are harassment laws?"] },
      { name: "Theft & Property Crimes", questions: ["What are penalties for theft under $500?", "What constitutes burglary vs robbery?", "What is criminal mischief?", "Can I be charged for shoplifting?"] },
      { name: "Record & Expungement", questions: ["Can I expunge my criminal record?", "What crimes can be sealed?", "How long until I can seal my record?", "Does expungement apply to DUI?"] },
    ]},
  { id: "property", name: "Property & Real Estate", icon: Home, color: "from-yellow-500 to-amber-600", pill: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    subtopics: [
      { name: "Landlord-Tenant", questions: ["Can my landlord evict me without notice?", "What are security deposit return rules?", "What repairs must landlords make?", "How much notice to end a lease?"] },
      { name: "Buying & Selling", questions: ["What disclosures are required when selling?", "How do title searches work?", "What are closing cost responsibilities?", "Can a seller back out of a contract?"] },
      { name: "Property Rights", questions: ["How does eminent domain work?", "How do easements work?", "What are squatter's rights?", "Can I build a fence on my property line?"] },
      { name: "HOA & Communities", questions: ["Can an HOA foreclose on my property?", "How do I fight an HOA fine?", "What can HOAs regulate?", "Can I opt out of an HOA?"] },
    ]},
  { id: "traffic", name: "Traffic & Vehicles", icon: Car, color: "from-blue-600 to-blue-700", pill: "bg-blue-600/20 text-blue-300 border-blue-600/30",
    subtopics: [
      { name: "License & Points", questions: ["How many points before suspension?", "How do I get my license back?", "Can I attend traffic school?", "How long do points stay on my record?"] },
      { name: "Insurance & Registration", questions: ["What are penalties for no insurance?", "What's required for vehicle registration?", "Do I need an emissions test?", "What if I'm hit by uninsured driver?"] },
      { name: "Traffic Violations", questions: ["What are speeding ticket penalties?", "Is lane splitting legal?", "What are window tint limits?", "Can I fight a red light camera ticket?"] },
      { name: "Accidents & Claims", questions: ["How long to file an injury claim?", "What if the other driver fled?", "Do I have to report an accident?", "What's Colorado's fault system?"] },
    ]},
  { id: "family", name: "Family Law", icon: Users, color: "from-orange-500 to-red-600", pill: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    subtopics: [
      { name: "Divorce & Separation", questions: ["What's the divorce filing process?", "Legal separation vs divorce?", "How is property divided?", "How long does divorce take?"] },
      { name: "Child Custody", questions: ["How is custody determined?", "Can I modify a custody agreement?", "What is parental relocation law?", "What are grandparent visitation rights?"] },
      { name: "Child & Spousal Support", questions: ["How is child support calculated?", "What are alimony rules?", "Can support orders be modified?", "What if they don't pay support?"] },
      { name: "Paternity & Adoption", questions: ["How do I establish paternity?", "What is the adoption process?", "Can a father sign away rights?", "What are step-parent adoption rules?"] },
    ]},
  { id: "business", name: "Business & Commerce", icon: Building2, color: "from-blue-600 to-indigo-700", pill: "bg-blue-600/20 text-blue-300 border-blue-600/30",
    subtopics: [
      { name: "Formation & Registration", questions: ["How do I register an LLC?", "LLC vs Corporation differences?", "What business licenses are needed?", "How do I get an EIN?"] },
      { name: "Employment & Contractors", questions: ["Independent contractor rules?", "How do non-competes work?", "What are hiring requirements?", "Can I require drug testing?"] },
      { name: "Licensing & Permits", questions: ["Requirements for selling alcohol?", "How do I get a contractor license?", "What permits for food service?", "Home business regulations?"] },
      { name: "Dissolution & Disputes", questions: ["How do I dissolve a business?", "What are breach of contract remedies?", "How do partnership disputes work?", "What is commercial arbitration?"] },
    ]},
  { id: "employment", name: "Employment & Labor", icon: Briefcase, color: "from-yellow-500 to-orange-600", pill: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    subtopics: [
      { name: "Wages & Hours", questions: ["What is minimum wage in Colorado?", "What are overtime requirements?", "Required meal and rest breaks?", "How do I file a wage claim?"] },
      { name: "Termination & Rights", questions: ["Can I be fired without cause?", "What is wrongful termination?", "What are final paycheck rules?", "Do I get paid for unused PTO?"] },
      { name: "Discrimination & Harassment", questions: ["What discrimination protections exist?", "How do I file an EEOC complaint?", "What constitutes hostile workplace?", "What are retaliation protections?"] },
      { name: "Safety & Benefits", questions: ["How does workers comp work?", "What whistleblower protections exist?", "What are OSHA requirements?", "Can I be fired for filing workers comp?"] },
    ]},
  { id: "taxes", name: "Taxes & Revenue", icon: DollarSign, color: "from-blue-600 to-blue-700", pill: "bg-blue-600/20 text-blue-300 border-blue-600/30",
    subtopics: [
      { name: "Property Taxes", questions: ["How are property taxes calculated?", "How do I appeal my assessment?", "What exemptions are available?", "When are property taxes due?"] },
      { name: "Income & Sales Tax", questions: ["What income is exempt?", "How does sales tax work online?", "What are Colorado tax brackets?", "How do I file state taxes?"] },
      { name: "Credits & Exemptions", questions: ["Tax credits for seniors?", "What is the TABOR refund?", "Homestead exemption rules?", "What are energy tax credits?"] },
      { name: "Special Taxes", questions: ["Marijuana excise tax rates?", "How do estate taxes work?", "What are lodging tax rules?", "Vehicle ownership taxes?"] },
    ]},
  { id: "civil_rights", name: "Civil Rights", icon: Shield, color: "from-orange-500 to-red-600", pill: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    subtopics: [
      { name: "Police Interactions", questions: ["Rights if stopped by police?", "Can I record police in public?", "What are police use of force rules?", "What is illegal search and seizure?"] },
      { name: "Discrimination", questions: ["Housing discrimination laws?", "Employment discrimination protections?", "Public accommodation rights?", "LGBTQ protections in Colorado?"] },
      { name: "Filing Complaints", questions: ["How to file a civil rights complaint?", "What is the CCRD?", "Can I sue for civil rights violations?", "What damages can I recover?"] },
    ]},
  { id: "environment", name: "Environment & Water", icon: TreePine, color: "from-blue-600 to-teal-600", pill: "bg-blue-600/20 text-blue-300 border-blue-600/30",
    subtopics: [
      { name: "Water Rights", questions: ["How do water rights work?", "Can I collect rainwater?", "How to get a well permit?", "What are water court procedures?"] },
      { name: "Land Use", questions: ["How do conservation easements work?", "What are zoning regulations?", "Can I subdivide my property?", "What are setback requirements?"] },
      { name: "Regulations & Permits", questions: ["Oil and gas drilling regulations?", "Environmental impact assessments?", "Penalties for environmental violations?", "Protected species regulations?"] },
    ]},
  { id: "elections", name: "Elections & Voting", icon: Vote, color: "from-blue-700 to-indigo-700", pill: "bg-blue-700/20 text-blue-300 border-blue-700/30",
    subtopics: [
      { name: "Voter Registration", questions: ["How do I register to vote?", "Can felons vote in Colorado?", "What ID is required to vote?", "Can I register on election day?"] },
      { name: "Voting Process", questions: ["How does mail-in voting work?", "Where is my polling place?", "Can I track my ballot?", "What if my ballot is rejected?"] },
      { name: "Campaign & Elections", questions: ["Campaign finance requirements?", "Rules for ballot initiatives?", "What is electioneering?", "Firearms near polling places?"] },
    ]},
  { id: "health", name: "Health & Safety", icon: Heart, color: "from-orange-500 to-orange-600", pill: "bg-orange-500/20 text-orange-300 border-orange-500/30",
    subtopics: [
      { name: "Medical Rights", questions: ["What are patient rights?", "How do advance directives work?", "What are informed consent rules?", "Can I access my medical records?"] },
      { name: "Cannabis", questions: ["Medical marijuana laws?", "How to get a medical card?", "Where can I consume cannabis?", "What are possession limits?"] },
      { name: "Mental Health", questions: ["Requirements for mental health holds?", "What is a M-1 hold?", "Patient rights in psychiatric care?", "How to contest involuntary commitment?"] },
      { name: "Public Health", questions: ["School vaccination requirements?", "Food safety regulations?", "What are end-of-life options?", "Medical malpractice rules?"] },
    ]},
  { id: "education", name: "Education", icon: GraduationCap, color: "from-yellow-500 to-yellow-600", pill: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
    subtopics: [
      { name: "Homeschool & Private", questions: ["What are homeschooling requirements?", "Charter school enrollment rules?", "Private school regulations?", "What testing is required?"] },
      { name: "Public Schools", questions: ["How does school funding work?", "Can I choose which school?", "What are transfer rules?", "School immunization requirements?"] },
      { name: "Special Education", questions: ["What are special education requirements?", "How do IEPs work?", "What is a 504 plan?", "How to dispute special ed decisions?"] },
      { name: "Discipline & Rights", questions: ["Can students be expelled for off-campus conduct?", "How to appeal disciplinary decisions?", "What are student speech rights?", "Search and seizure in schools?"] },
    ]},
];

type Category = typeof categories[number];

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expandedSubtopic, setExpandedSubtopic] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const handleFeelingLucky = async () => {
    if (isRolling) return;
    
    setIsRolling(true);
    setQuery("");
    
    try {
      const response = await fetch("/api/lucky", { method: "POST" });
      const data = await response.json();
      
      if (data.query) {
        const text = data.query;
        let i = 0;
        setQuery("");
        
        const typeInterval = setInterval(() => {
          if (i < text.length) {
            setQuery(text.slice(0, i + 1));
            i++;
          } else {
            clearInterval(typeInterval);
            setIsRolling(false);
            setTimeout(() => {
              router.push(`/search?q=${encodeURIComponent(text)}`);
            }, 400);
          }
        }, 30);
      } else {
        setIsRolling(false);
      }
    } catch (error) {
      console.error("Feeling lucky error:", error);
      setIsRolling(false);
    }
  };

  const handleCategorySelect = (cat: Category) => {
    if (selectedCategory?.id === cat.id) {
      setSelectedCategory(null);
      setExpandedSubtopic(null);
    } else {
      setSelectedCategory(cat);
      setExpandedSubtopic(null);
    }
  };

  const handleBack = () => {
    setSelectedCategory(null);
    setExpandedSubtopic(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Background - Colorado themed */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        {isRolling && (
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-500/30 rounded-full blur-3xl animate-ping" />
        )}
      </div>

      {/* Rolling Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes dice-roll {
          0%, 100% { transform: rotate(0deg) scale(1); }
          25% { transform: rotate(90deg) scale(1.1); }
          50% { transform: rotate(180deg) scale(1); }
          75% { transform: rotate(270deg) scale(1.1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .dice-rolling {
          animation: dice-roll 0.5s ease-in-out infinite;
        }
        .shimmer-border {
          background: linear-gradient(90deg, #002868, #FFD700, #BF0A30, #FFD700, #002868);
          background-size: 200% 100%;
          animation: shimmer 1s linear infinite;
        }
      `}} />

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-8">
        {/* Header with Colorado Flag */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-300">AI-Powered Colorado Statute Search</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            {/* Colorado Flag Icon */}
            <div className="relative p-3 rounded-2xl bg-gradient-to-br from-blue-700 to-blue-800 shadow-lg shadow-blue-600/25 overflow-hidden">
              <div className="absolute inset-0 bg-white/10" style={{ clipPath: "circle(30% at 50% 50%)" }} />
              <div className="absolute inset-0 bg-red-600/80" style={{ clipPath: "circle(20% at 50% 50%)" }} />
              <div className="absolute inset-0 bg-yellow-400/90" style={{ clipPath: "circle(12% at 50% 50%)" }} />
              <Scale className="w-8 h-8 relative z-10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Colorado Law Lookup
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Search the Colorado Revised Statutes in plain English.
          </p>
        </div>

        {/* Search Box - Colorado themed */}
        <div className="relative mb-8 max-w-3xl mx-auto">
          <div className={`absolute -inset-1 rounded-2xl blur opacity-30 transition-all duration-300 ${
            isRolling 
              ? "shimmer-border" 
              : "bg-gradient-to-r from-blue-600 via-orange-500 to-yellow-500"
          }`} />
          <div className={`relative bg-slate-900 rounded-2xl p-2 border transition-colors duration-300 ${
            isRolling ? "border-yellow-500/50" : "border-white/10"
          }`}>
            <div className="flex items-center gap-3">
              <div className="pl-4"><Search className="w-5 h-5 text-slate-400" /></div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder={isRolling ? "Rolling the dice..." : "Ask any question about Colorado law..."}
                className={`flex-1 bg-transparent placeholder-slate-500 outline-none py-4 text-lg transition-colors ${
                  isRolling ? "text-yellow-400" : "text-white"
                } cursor-text`}
                disabled={isRolling}
              />
              {query && !isRolling && (
                <button onClick={() => setQuery("")} className="p-2 text-slate-500 hover:text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              )}
              
              {/* Feeling Lucky Button */}
              <button
                onClick={handleFeelingLucky}
                disabled={isRolling}
                className={`group relative px-4 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 overflow-hidden cursor-pointer ${
                  isRolling
                    ? "bg-yellow-600 text-slate-900 cursor-wait"
                    : "bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-slate-900 hover:shadow-lg hover:shadow-yellow-500/25"
                }`}
                title="Get a random legal question!"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="absolute top-1 left-2 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: "1s" }} />
                  <div className="absolute bottom-2 right-3 w-1 h-1 bg-white rounded-full animate-ping" style={{ animationDuration: "1.5s", animationDelay: "0.2s" }} />
                  <div className="absolute top-2 right-6 w-0.5 h-0.5 bg-white rounded-full animate-ping" style={{ animationDuration: "1.2s", animationDelay: "0.5s" }} />
                </div>
                
                <Dices className={`w-5 h-5 ${isRolling ? "dice-rolling" : "group-hover:rotate-12 transition-transform"}`} />
                <span className="hidden sm:inline font-bold">{isRolling ? "Rolling..." : "Lucky"}</span>
              </button>

              <button
                onClick={() => handleSearch()}
                disabled={!query.trim() || isRolling}
                className="px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-700 rounded-xl font-semibold 
                         hover:from-orange-500 hover:to-orange-600 transition-all disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-orange-600/25 cursor-pointer"
              >
                <Search className="w-5 h-5" /> <span className="hidden sm:inline">Search</span>
              </button>
            </div>
          </div>
          
          {/* Lucky button hint */}
          <div className="flex justify-center mt-3">
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Dices className="w-3 h-3" />
              <span>Click <span className="text-yellow-400 font-medium">Lucky</span> to discover a random legal question</span>
            </p>
          </div>
        </div>

        {/* Back Button */}
        {selectedCategory && (
          <div className="mb-4">
            <button onClick={handleBack} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm cursor-pointer">
              <ArrowLeft className="w-4 h-4" /> Back to all categories
            </button>
          </div>
        )}

        {/* Step 1: Category Pills */}
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            {selectedCategory ? "Selected Area" : "① Choose a Legal Area"}
          </h2>
          <div className="flex flex-wrap gap-2">
            {(selectedCategory ? [selectedCategory] : categories).map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory?.id === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all flex items-center gap-2 cursor-pointer
                    ${isSelected 
                      ? `bg-gradient-to-r ${cat.color} border-transparent text-white shadow-lg` 
                      : `${cat.pill} border hover:scale-105`}`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.name}
                  {isSelected && <X className="w-3.5 h-3.5 ml-1 opacity-70" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Subtopics */}
        {selectedCategory && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              ② What specifically about {selectedCategory.name}?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {selectedCategory.subtopics.map((subtopic, idx) => {
                const isExpanded = expandedSubtopic === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => setExpandedSubtopic(isExpanded ? null : idx)}
                    className={`px-4 py-3 rounded-xl border text-left transition-all cursor-pointer
                      ${isExpanded 
                        ? `bg-gradient-to-r ${selectedCategory.color} border-transparent text-white` 
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-300"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{subtopic.name}</span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Questions */}
        {selectedCategory && expandedSubtopic !== null && (
          <div className="mb-6">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              ③ Common Questions — Click to search
            </h2>
            <div className="p-4 bg-slate-900/80 backdrop-blur rounded-xl border border-white/10">
              <div className="grid md:grid-cols-2 gap-2">
                {selectedCategory.subtopics[expandedSubtopic].questions.map((question, i) => (
                  <button
                    key={i}
                    onClick={() => handleSearch(question)}
                    className="w-full text-left px-4 py-3 rounded-lg text-sm text-slate-300 
                             bg-white/5 hover:bg-white/10 hover:text-white transition-all 
                             flex items-center gap-3 group cursor-pointer"
                  >
                    <Search className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors flex-shrink-0" />
                    <span>{question}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Category Grid (when none selected) */}
        {!selectedCategory && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Or browse all categories
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat)}
                    className="p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 
                             hover:border-white/20 transition-all text-left group cursor-pointer"
                  >
                    <Icon className="w-5 h-5 text-slate-400 group-hover:text-white mb-2 transition-colors" />
                    <span className="font-medium text-slate-300 group-hover:text-white text-sm">
                      {cat.name}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{cat.subtopics.length} topics</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tips */}
        {!selectedCategory && (
          <div className="mt-8 p-5 bg-white/5 rounded-2xl border border-white/10">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">💡 Search Tips</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-400">
              <div className="flex gap-2"><span className="text-orange-400">✦</span><p>Ask in plain English</p></div>
              <div className="flex gap-2"><span className="text-yellow-400">✦</span><p>Be specific with your question</p></div>
              <div className="flex gap-2"><span className="text-blue-400">🎲</span><p>Try "Lucky" for a random question!</p></div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8 text-center text-xs text-slate-600 border-t border-white/5 pt-6">
          <p>⚖️ For informational purposes only. Not legal advice. Consult a licensed Colorado attorney.</p>
        </div>
      </div>
    </div>
  );
}