import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sparkles, Bot, GraduationCap, ArrowUpRight, CheckCircle2, Bookmark, Lightbulb, Compass, Loader2, X, Link, Award, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../config';
import ProductCard from '../marketplace/ProductCard';

export default function AiAdvisor() {
  const { currentUser } = useAuth();
  const { products } = useApp();
  
  // Local states for recommendations
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [studyResources, setStudyResources] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedGuide, setSelectedGuide] = useState(null); // Active guide for detailed modal

  // Dynamic user data from context
  const userName = currentUser?.name || "Guest Student";
  const userCollegeId = currentUser?.college_id || currentUser?.collegeId || "COL-GUEST";
  const branch = currentUser?.branch || "Computer Science Engg.";
  const year = currentUser?.year || "1st Year";

  // Detailed guide syllabus and links maps for the interactive modal
  const guideDetailsMap = {
    // CS/IT Resources
    "fb_rec1": {
      title: "Data Structures & Algorithms Roadmap 2026",
      syllabus: [
        { topic: "Arrays & Hashing", details: "Time/Space Complexity, Hash Maps, Two Pointers (1-2 Weeks)" },
        { topic: "Stack, Queue & Linked Lists", details: "Memory structures, node operations, reversal algorithms (3-4 Weeks)" },
        { topic: "Trees & Graphs", details: "Recursion, BFS, DFS, Binary Search Trees, Graph coloring (5-7 Weeks)" },
        { topic: "Dynamic Programming", details: "Memoization vs Tabulation, Knapsack, LCS, grid paths (8-10 Weeks)" }
      ],
      links: [
        { label: "NeetCode DSA Practice Sheet", url: "https://neetcode.io/practice" },
        { label: "Striver's A2Z Placement Course", url: "https://takeuforward.org/strivers-a2z-dsa-course-sheet-2023/" }
      ]
    },
    "fb_rec2": {
      title: "DBMS & Operating Systems Semester Cheat Sheets",
      syllabus: [
        { topic: "DBMS Normalization", details: "Functional Dependencies, 1NF, 2NF, 3NF, BCNF rules" },
        { topic: "Transaction & ACID Properties", details: "Concurrency control, Serializability, 2-Phase Locking" },
        { topic: "OS Process Scheduling", details: "FIFO, SJF, Round Robin, SRTF, Gantt charts" },
        { topic: "Memory Management", details: "Paging, Segmentation, LRU Page Replacement algorithms" }
      ],
      links: [
        { label: "GeeksforGeeks DBMS Cheat Sheet", url: "https://www.geeksforgeeks.org/dbms-cheat-sheet-interview-preparation/" },
        { label: "Gate Smashers Operating Systems Course", url: "https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p" }
      ]
    },
    "fb_rec3": {
      title: "Full-Stack Web Development Starter Guide",
      syllabus: [
        { topic: "Frontend Fundamentals", details: "React hooks (useState, useEffect), CSS flexbox, grid, Tailwind" },
        { topic: "Backend Server Design", details: "Node.js, Express routing, REST API design, JWT auth" },
        { topic: "Database Schema", details: "PostgreSQL relational tables vs MongoDB Document modeling" }
      ],
      links: [
        { label: "MDN Web Development Documentation", url: "https://developer.mozilla.500" },
        { label: "freeCodeCamp MERN Stack Course", url: "https://www.freecodecamp.org/news/learn-mern-stack-full-tutorial/" }
      ]
    },
    // ECE/EE Resources
    "fb_rec1_ece": {
      title: "VLSI & Digital Logic Design Lab Guide",
      syllabus: [
        { topic: "Verilog Basics", details: "Gate-level modeling, Dataflow modeling, Behavioral structures" },
        { topic: "Combinational Circuits", details: "Adders, Decoders, Multiplexers (1-2 Weeks)" },
        { topic: "Sequential Logic Design", details: "D Flip Flops, Counters, shift registers (3-4 Weeks)" },
        { topic: "ALU Lab Project", details: "Curated 4-bit Arithmetic Logic Unit implementation (5 Weeks)" }
      ],
      links: [
        { label: "HDLBits Verilog Practice Portal", url: "https://hdlbits.01xz.net/wiki/Main_Page" },
        { label: "VLSI Placement & Interview Sheet", url: "https://www.geeksforgeeks.org/vlsi-design-tutorials/" }
      ]
    },
    "fb_rec2_ece": {
      title: "Microcontrollers (8085/8086) Assembly Cheat Sheet",
      syllabus: [
        { topic: "Architecture mapping", details: "Accumulators, registers, stack pointers, interrupts" },
        { topic: "Instruction Set Mnemonics", details: "MOV, MVI, LXI, ADD, JMP, CALL instruction mapping" },
        { topic: "Pin Configurations", details: "Multiplexed address data buses, control signals" }
      ],
      links: [
        { label: "8085 Microprocessor Assembly Guide", url: "https://www.geeksforgeeks.org/instruction-set-in-8085-microprocessor/" }
      ]
    },
    "fb_rec3_ece": {
      title: "Analog & Digital Communications Lecture Notes",
      syllabus: [
        { topic: "Signals & Fourier analysis", details: "Fourier transforms, spectral analysis of signals" },
        { topic: "AM & FM Modulation", details: "Amplitude, Frequency, Phase modulation, superheterodyne receivers" },
        { topic: "Digital coding schemes", details: "Nyquist criteria, PCM, delta modulation, ASK, FSK, PSK" }
      ],
      links: [
        { label: "NPTEL Digital Communications Lectures", url: "https://nptel.ac.in/courses/108104091" }
      ]
    },
    // General Resources
    "fb_rec1_gen": {
      title: "Engineering Mechanics & Applied Physics Solver",
      syllabus: [
        { topic: "Forces & Friction", details: "Lami's theorem, concurrent forces, friction coefficients" },
        { topic: "Beam Analyzers", details: "Shear force, bending moments, support reactions" },
        { topic: "Wave Optics & Quantum", details: "Interference, diffraction, Schrödinger wave equations" }
      ],
      links: [
        { label: "Khan Academy Physics Practice", url: "https://www.khanacademy.org/physics" }
      ]
    },
    "fb_rec2_gen": {
      title: "Engineering Drawing & Mini-Drafter Setup Manual",
      syllabus: [
        { topic: "Mini-Drafter Calibration", details: "Locking mechanism, parallel alignment, scaling rules" },
        { topic: "Projections of Points & Lines", details: "First angle projections, true length calculations" },
        { topic: "Orthographic Projections", details: "Front view, Top view, Side view projections of solids" }
      ],
      links: [
        { label: "Engineering Graphics Video Lectures", url: "https://www.youtube.com/playlist?list=PLDN15yElcADMcX74g5jA9_vF_S4zX0l4c" }
      ]
    },
    "fb_rec3_gen": {
      title: "Industrial Internships & Training Roadmap",
      syllabus: [
        { topic: "Core Certifications", details: "AutoCAD/SolidWorks for Mech/Civil, PLC-SCADA for EE" },
        { topic: "Vocational Internships", details: "Applying to railways, electricity boards, or manufacturing units" },
        { topic: "Campus Placement Prep", details: "Quantitative aptitude, resume styling, HR mock interviews" }
      ],
      links: [
        { label: "Internshala Training & Internships Portal", url: "https://internshala.com/" }
      ]
    }
  };

  // Robust fallback data map based on user's branch
  const getFallbackResources = (branchName) => {
    const bLower = branchName.toLowerCase();
    if (bLower.includes("computer") || bLower.includes("information") || bLower.includes("cs") || bLower.includes("it")) {
      return [
        {
          id: "fb_rec1",
          title: "Data Structures & Algorithms Roadmap 2026",
          type: "Study Guide",
          matchRatio: "98% Match",
          reason: "Essential DSA preparation tracker for your upcoming internship drive.",
          url: "#",
          tag: "Highly Recommended"
        },
        {
          id: "fb_rec2",
          title: "DBMS & Operating Systems Semester Cheat Sheets",
          type: "Exam Prep",
          matchRatio: "94% Match",
          reason: "Most asked interview questions and solved midterm topics.",
          url: "#",
          tag: "Trending Now"
        },
        {
          id: "fb_rec3",
          title: "Full-Stack Web Development Starter Guide",
          type: "Project Resource",
          matchRatio: "88% Match",
          reason: "Practical web dev roadmap for building resume-worthy semester projects.",
          url: "#",
          tag: "Smart Match"
        }
      ];
    } else if (bLower.includes("electr") || bLower.includes("ece") || bLower.includes("ee")) {
      return [
        {
          id: "fb_rec1_ece",
          title: "VLSI & Digital Logic Design Lab Guide",
          type: "Lab Resource",
          matchRatio: "96% Match",
          reason: "Complete solved Verilog testbenches for semester ALU tests.",
          url: "#",
          tag: "Highly Recommended"
        },
        {
          id: "fb_rec2_ece",
          title: "Microcontrollers (8085/8086) Assembly Cheat Sheet",
          type: "Exam Prep",
          matchRatio: "92% Match",
          reason: "Direct reference charts for instruction sets and interrupts.",
          url: "#",
          tag: "Trending Now"
        },
        {
          id: "fb_rec3_ece",
          title: "Analog & Digital Communications Lecture Notes",
          type: "Study Guide",
          matchRatio: "89% Match",
          reason: "Handwritten topper summary summary covering Fourier transforms and modulation.",
          url: "#",
          tag: "Smart Match"
        }
      ];
    } else {
      return [
        {
          id: "fb_rec1_gen",
          title: "Engineering Mechanics & Applied Physics Solver",
          type: "Exam Prep",
          matchRatio: "95% Match",
          reason: "Step-by-step solutions for past university dynamics questions.",
          url: "#",
          tag: "Highly Recommended"
        },
        {
          id: "fb_rec2_gen",
          title: "Engineering Drawing & Mini-Drafter Setup Manual",
          type: "Graphics Lab",
          matchRatio: "90% Match",
          reason: "Isometric projections and orthographic drawing tutorials.",
          url: "#",
          tag: "Trending Now"
        },
        {
          id: "fb_rec3_gen",
          title: "Industrial Internships & Training Roadmap",
          type: "Career Guide",
          matchRatio: "85% Match",
          reason: "Recommended certificates and core industry training tracks.",
          url: "#",
          tag: "Smart Match"
        }
      ];
    }
  };

  const getFallbackProducts = (branchName) => {
    const bLower = branchName.toLowerCase();
    const branchWords = bLower.split(' ').filter(w => w.length > 2);
    
    let filtered = products.filter(p => {
      const titleLower = p.title?.toLowerCase() || "";
      const descLower = p.description?.toLowerCase() || "";
      const tagsList = p.tags && Array.isArray(p.tags) ? p.tags : [];
      const tagsLower = tagsList.map(t => t.toLowerCase());
      
      const matchesBranch = branchWords.some(w => titleLower.includes(w) || descLower.includes(w) || tagsLower.some(t => t.includes(w)));
      const matchesGeneral = titleLower.includes("math") || titleLower.includes("physics") || titleLower.includes("calculator") || titleLower.includes("drafter");
      return matchesBranch || matchesGeneral;
    });

    if (filtered.length === 0) {
      filtered = products.slice(0, 3);
    }
    return filtered.slice(0, 3);
  };

  useEffect(() => {
    const getRecommendations = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      try {
        const response = await axios.get(`${API_URL}/api/products/recommendations`, {
          params: { branch, year },
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.products && response.data.products.length > 0) {
          setRecommendedProducts(response.data.products);
        } else {
          setRecommendedProducts(getFallbackProducts(branch));
        }

        if (response.data.resources && response.data.resources.length > 0) {
          // Normalize backend IDs to ECE or General maps if needed
          const backendResources = response.data.resources.map(res => {
            const matchedKey = Object.keys(guideDetailsMap).find(k => guideDetailsMap[k].title === res.title);
            return matchedKey ? { ...res, id: matchedKey } : res;
          });
          setStudyResources(backendResources);
        } else {
          setStudyResources(getFallbackResources(branch));
        }
      } catch (err) {
        console.warn("Backend recommendation API failed. Using robust local fallback profiles:", err);
        setRecommendedProducts(getFallbackProducts(branch));
        setStudyResources(getFallbackResources(branch));
      } finally {
        setIsLoading(false);
      }
    };

    getRecommendations();
  }, [branch, year, products]);

  // Open overlay modal for guide
  const handleAccessGuide = (guide) => {
    // Match the mock details map key
    const details = guideDetailsMap[guide.id] || {
      title: guide.title,
      syllabus: [{ topic: "Curriculum Syllabus", details: guide.reason }],
      links: [{ label: "Browse General Study Resources", url: "https://www.geeksforgeeks.org" }]
    };
    setSelectedGuide(details);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 animate-fade-in relative">
      
      {/* AI Header Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden border border-purple-500/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-200 text-xs font-bold backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '5s' }} />
              <span>Campus AI Study Advisor</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Personalized Recommendations for <span className="bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">{branch}</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
              Our smart recommendation engine analyzes your batch curriculum ({year}) and marketplace trends to suggest high-scoring study guides and necessary lab tools.
            </p>
          </div>

          {/* Student Batch Overview Box */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl flex flex-col items-center sm:items-start space-y-3 flex-shrink-0 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-2xl text-white shadow">
                <Bot className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs font-bold text-purple-300 uppercase tracking-wider">AI Profile Assessment</p>
                <p className="text-lg font-black">{userName}</p>
                <p className="text-xs text-slate-300">{userCollegeId}</p>
              </div>
            </div>
            <div className="w-full pt-2 border-t border-white/10 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1" /> Syllabus Aligned</span>
              <span>Semester Focus ({year})</span>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-xs text-slate-400 font-bold tracking-wider uppercase">Loading recommendations...</p>
        </div>
      ) : (
        <>
          {/* Recommended Marketplace Gear */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Compass className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">Smart Gear Match</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Highly relevant items currently listed for sale by seniors in your branch</p>
                </div>
              </div>
            </div>

            {recommendedProducts.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 border border-dashed border-slate-200 dark:border-slate-700 p-12 text-center rounded-3xl">
                <Compass className="w-8 h-8 mx-auto text-slate-350 dark:text-slate-500 mb-3" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No matching gear listed today</p>
                <p className="text-xs text-slate-450 mt-1">Keep checking out! Seniors upload tools, drafters, and calculators regularly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {recommendedProducts.map(prod => (
                  <ProductCard key={prod.id} product={prod} />
                ))}
              </div>
            )}
          </div>

          {/* AI Curated Study Resources */}
          <div className="space-y-6 pt-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">AI Curated Study Guides & Roadmaps</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Handpicked resources based on recent campus exam discussions</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {studyResources.map((res) => (
                <div key={res.id} className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between space-y-4 group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-950/40 text-purple-750 dark:text-purple-305 font-bold rounded-xl border border-purple-200 dark:border-purple-800/60">
                        {res.type}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-lg border border-emerald-500/30 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1" /> {res.matchRatio}
                      </span>
                    </div>

                    <h3 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {res.title}
                    </h3>
                    <p className="text-xs text-slate-505 dark:text-slate-400 leading-relaxed">
                      {res.reason}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400">{res.tag}</span>
                    <button 
                      onClick={() => handleAccessGuide(res)}
                      className="flex items-center space-x-1 font-bold text-purple-600 dark:text-purple-400 hover:underline"
                    >
                      <span>Access Guide</span> <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Guide Access Overlay Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden max-h-[85vh] overflow-y-auto">
            {/* Glow design details */}
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
            
            {/* Modal Header */}
            <div className="flex justify-between items-start pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 text-xs font-bold">
                  <Award className="w-3.5 h-3.5" />
                  <span>Curated Learning Guide</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-850 dark:text-slate-100 leading-tight pt-1.5">
                  {selectedGuide.title}
                </h2>
              </div>
              <button 
                onClick={() => setSelectedGuide(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-650 transition-colors"
                title="Close Portal"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Curriculum Roadmap */}
            <div className="space-y-4 text-left">
              <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-indigo-500" />
                Suggested Timeline & Topics
              </h3>
              <div className="space-y-3.5">
                {selectedGuide.syllabus.map((syl, index) => (
                  <div key={index} className="p-4 bg-slate-50 dark:bg-slate-850/60 rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-start space-x-3.5 hover:shadow-sm transition">
                    <span className="w-6.5 h-6.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-650 dark:text-indigo-400 font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 dark:text-slate-205">{syl.topic}</h4>
                      <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{syl.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* External Links */}
            <div className="space-y-3 text-left pt-2">
              <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest flex items-center">
                <Link className="w-4 h-4 mr-1.5 text-purple-500" />
                Verified Reference Library
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedGuide.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3.5 bg-gradient-to-r from-purple-600/5 to-indigo-600/5 hover:from-purple-600/10 hover:to-indigo-600/10 border border-purple-500/10 hover:border-purple-500/30 rounded-2xl flex items-center justify-between text-xs font-extrabold text-purple-750 dark:text-purple-305 transition duration-200 group"
                  >
                    <span className="truncate">{link.label}</span>
                    <ArrowUpRight className="w-4 h-4 stroke-[2.5] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedGuide(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs transition shadow-sm"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}
