"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Scale,
  Search,
  Sparkles,
  Gavel,
  Home,
  Car,
  Users,
  Building2,
  Heart,
  Briefcase,
  Vote,
  DollarSign,
  Shield,
  TreePine,
  GraduationCap,
  ChevronRight,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    id: "criminal",
    name: "Criminal Law",
    icon: Gavel,
    color: "from-red-500 to-rose-600",
    questions: [
      "What are the penalties for first-time DUI in Colorado?",
      "What constitutes self-defense under Colorado law?",
      "What are the marijuana possession limits in Colorado?",
      "Can I expunge my criminal record in Colorado?",
      "What is the statute of limitations for assault charges?",
      "What defines domestic violence under Colorado statutes?",
      "Is it illegal to record someone without their consent?",
      "What are the penalties for theft under $500?",
    ],
  },
  {
    id: "property",
    name: "Property & Real Estate",
    icon: Home,
    color: "from-amber-500 to-orange-600",
    questions: [
      "How does eminent domain work in Colorado?",
      "What are a landlord's obligations for repairs and maintenance?",
      "Can my landlord evict me without written notice?",
      "What are the rules for security deposit returns?",
      "How do easements work on private property in Colorado?",
      "What are squatter's rights and adverse possession laws?",
      "What disclosures are required when selling a home?",
      "Can an HOA foreclose on my property for unpaid dues?",
    ],
  },
  {
    id: "traffic",
    name: "Traffic & Vehicles",
    icon: Car,
    color: "from-blue-500 to-cyan-600",
    questions: [
      "What are Colorado's DUI blood alcohol limits and penalties?",
      "How many points before my license gets suspended?",
      "What are the penalties for driving without insurance?",
      "What are the child car seat and seat belt requirements?",
      "Is lane splitting legal for motorcycles in Colorado?",
      "What happens if caught driving with a suspended license?",
      "What are the legal window tint limits in Colorado?",
      "How long after an accident can I file an injury claim?",
    ],
  },
  {
    id: "family",
    name: "Family Law",
    icon: Users,
    color: "from-pink-500 to-rose-500",
    questions: [
      "What's the process for filing for divorce in Colorado?",
      "How is child custody determined by Colorado courts?",
      "How is child support calculated in Colorado?",
      "Can grandparents petition for visitation rights?",
      "What is the difference between legal separation and divorce?",
      "How do I modify an existing custody agreement?",
      "What are the rules for alimony and spousal maintenance?",
      "How do I establish legal paternity in Colorado?",
    ],
  },
  {
    id: "business",
    name: "Business & Commerce",
    icon: Building2,
    color: "from-emerald-500 to-teal-600",
    questions: [
      "How do I register an LLC in Colorado?",
      "What business licenses are required to operate in Colorado?",
      "How do non-compete agreements work in Colorado?",
      "What are the rules for classifying independent contractors?",
      "What are the requirements for selling alcohol in Colorado?",
      "How do I dissolve a business entity in Colorado?",
      "What consumer protection laws apply to Colorado businesses?",
      "What are the franchise disclosure requirements?",
    ],
  },
  {
    id: "health",
    name: "Health & Safety",
    icon: Heart,
    color: "from-rose-500 to-pink-600",
    questions: [
      "What are the medical marijuana laws in Colorado?",
      "What are patient rights in Colorado hospitals?",
      "How do advance directives and living wills work?",
      "What are the requirements for mental health holds?",
      "What are the vaccination requirements for school enrollment?",
      "How does medical malpractice work in Colorado?",
      "What are the end-of-life options laws in Colorado?",
      "What food safety regulations apply to restaurants?",
    ],
  },
  {
    id: "employment",
    name: "Employment & Labor",
    icon: Briefcase,
    color: "from-violet-500 to-purple-600",
    questions: [
      "What is the minimum wage in Colorado?",
      "What are the overtime pay requirements in Colorado?",
      "Can I be fired without cause in Colorado?",
      "What workplace discrimination protections exist?",
      "What are the required meal and rest break rules?",
      "How do I file a wage claim with the state?",
      "What whistleblower protections exist in Colorado?",
      "How does workers compensation work in Colorado?",
    ],
  },
  {
    id: "elections",
    name: "Elections & Voting",
    icon: Vote,
    color: "from-indigo-500 to-blue-600",
    questions: [
      "What are the rules about firearms near polling places?",
      "How do I register to vote in Colorado?",
      "What identification is required to vote in Colorado?",
      "How does mail-in ballot voting work in Colorado?",
      "Can people with felony convictions vote in Colorado?",
      "What are the campaign finance disclosure requirements?",
      "What are the rules for ballot initiatives and referendums?",
      "What are the restrictions on electioneering near polls?",
    ],
  },
  {
    id: "taxes",
    name: "Taxes & Revenue",
    icon: DollarSign,
    color: "from-green-500 to-emerald-600",
    questions: [
      "How are property taxes calculated in Colorado?",
      "How do I appeal my property tax assessment?",
      "What tax credits are available for senior citizens?",
      "How does the TABOR amendment affect taxes?",
      "What are the sales tax rules for online purchases?",
      "What income is exempt from Colorado state taxes?",
      "What are the penalties for tax evasion in Colorado?",
      "What are the marijuana excise tax rates?",
    ],
  },
  {
    id: "civil_rights",
    name: "Civil Rights",
    icon: Shield,
    color: "from-purple-500 to-indigo-600",
    questions: [
      "What are my rights if I'm stopped or arrested by police?",
      "What constitutes illegal search and seizure?",
      "What anti-discrimination laws apply to housing?",
      "Can my employer discriminate based on age?",
      "What are the rules for police use of force?",
      "Can I legally record police officers in public?",
      "How do I file a civil rights complaint in Colorado?",
      "What protections exist for LGBTQ individuals?",
    ],
  },
  {
    id: "environment",
    name: "Environment & Water",
    icon: TreePine,
    color: "from-teal-500 to-green-600",
    questions: [
      "How do water rights work in Colorado?",
      "Can I legally collect rainwater on my property?",
      "How do I obtain a water well permit?",
      "What are the regulations for oil and gas drilling?",
      "How do environmental impact assessments work?",
      "What are the penalties for environmental violations?",
      "How do conservation easements work in Colorado?",
      "What are the protected species regulations?",
    ],
  },
  {
    id: "education",
    name: "Education",
    icon: GraduationCap,
    color: "from-cyan-500 to-blue-500",
    questions: [
      "What are the homeschooling requirements in Colorado?",
      "How does public school funding work in Colorado?",
      "What are the special education requirements?",
      "Can students be expelled for off-campus conduct?",
      "What are the rules for charter school enrollment?",
      "What are the teacher certification requirements?",
      "How do I appeal a school disciplinary decision?",
      "What are the immunization requirements for schools?",
    ],
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const handleSearch = (searchQuery?: string) => {
    const q = searchQuery || query;
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-300">AI-Powered Semantic Search</span>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/25">
              <Scale className="w-8 h-8" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Colorado Law Search
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Search the entire Colorado Revised Statutes in plain English.
            Our AI finds the most relevant laws for your question.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative mb-16 max-w-3xl mx-auto">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 via-purple-500 to-amber-500 rounded-2xl blur opacity-30" />
          <div className="relative bg-slate-900 rounded-2xl p-2 border border-white/10">
            <div className="flex items-center gap-3">
              <div className="pl-4">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ask any question about Colorado law..."
                className="flex-1 bg-transparent text-white placeholder-slate-500 outline-none py-4 text-lg"
              />
              <button
                onClick={() => handleSearch()}
                disabled={!query.trim()}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl font-semibold 
                         hover:from-amber-400 hover:to-orange-500 transition-all disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-amber-500/25"
              >
                <Search className="w-5 h-5" />
                Search
              </button>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-6 flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Browse by Category — Click to see example questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isExpanded = expandedCategory === cat.id;

              return (
                <div key={cat.id} className="relative">
                  <button
                    onClick={() => setExpandedCategory(isExpanded ? null : cat.id)}
                    className={`w-full p-4 rounded-xl border transition-all text-left group
                      ${isExpanded
                        ? `bg-gradient-to-br ${cat.color} border-transparent shadow-lg`
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isExpanded ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                        <span className={`font-medium ${isExpanded ? "text-white" : "text-slate-300"}`}>
                          {cat.name}
                        </span>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90 text-white" : "text-slate-500"}`} />
                    </div>
                  </button>

                  {/* Expanded Questions */}
                  {isExpanded && (
                    <div className="mt-2 p-3 bg-slate-900/90 backdrop-blur rounded-xl border border-white/10 space-y-1">
                      {cat.questions.map((question, i) => (
                        <button
                          key={i}
                          onClick={() => handleSearch(question)}
                          className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-300 
                                   hover:bg-white/10 hover:text-white transition-colors flex items-start gap-2"
                        >
                          <Search className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-500" />
                          <span>{question}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-12 p-6 bg-white/5 rounded-2xl border border-white/10">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Tips for Better Search Results
          </h3>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-400">
            <div className="flex gap-3">
              <span className="text-amber-400">✦</span>
              <p>Ask in plain English — "Can my landlord evict me without notice?"</p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-400">✦</span>
              <p>Be specific — "DUI penalties for first offense" works better than just "DUI"</p>
            </div>
            <div className="flex gap-3">
              <span className="text-amber-400">✦</span>
              <p>Include context — "small business LLC registration requirements"</p>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center text-xs text-slate-600 border-t border-white/5 pt-6">
          <p>⚖️ This tool searches Colorado Revised Statutes for informational purposes only. Not legal advice. Consult a licensed attorney for legal matters.</p>
        </div>
      </div>
    </div>
  );
}