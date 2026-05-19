export const initialProducts = [
  {
    id: "p1",
    title: "Casio fx-991EX Scientific Calculator",
    price: 850,
    originalPrice: 1450,
    condition: "Like New",
    category: "Calculators",
    image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=600&auto=format&fit=crop&q=80",
    seller: {
      id: "u2",
      name: "Aarav Sharma",
      branch: "Computer Science",
      year: "4th Year (Senior)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      collegeEmail: "aarav.cs22@college.edu",
      rating: 4.8
    },
    description: "Perfect working condition Casio ClassWiz fx-991EX. Essential for 1st year Engineering Math and Electrical exams. Comes with slide-on hard case and solar backup.",
    createdAt: "2 hours ago",
    tags: ["Engineering", "Math", "Calculator"],
    featured: true
  },
  {
    id: "p2",
    title: "Complete 1st Year Engineering Physics & Math Notes",
    price: 350,
    originalPrice: 700,
    condition: "Good",
    category: "Notes",
    image: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&auto=format&fit=crop&q=80",
    seller: {
      id: "u3",
      name: "Priya Patel",
      branch: "Electronics",
      year: "3rd Year",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      collegeEmail: "priya.ece@college.edu",
      rating: 4.9
    },
    description: "Handwritten, color-coded notes with diagram illustrations and solved past 5 years university exam papers. Scored 9.8 SGPA using these!",
    createdAt: "5 hours ago",
    tags: ["Notes", "Physics", "FirstYear", "TopperNotes"],
    featured: true
  },
  {
    id: "p3",
    title: "Mini Drafter & Engineering Drawing Kit",
    price: 450,
    originalPrice: 900,
    condition: "Good",
    category: "Engineering tools",
    image: "https://images.unsplash.com/photo-1580584126903-c17d41830450?w=600&auto=format&fit=crop&q=80",
    seller: {
      id: "u4",
      name: "Vikram Malhotra",
      branch: "Mechanical",
      year: "2nd Year",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      collegeEmail: "vikram.mech@college.edu",
      rating: 4.6
    },
    description: "Omega Mini drafter, sheet holder, set squares, French curves, and compass set. Barely used during semester 1 graphics lab.",
    createdAt: "1 day ago",
    tags: ["ED", "Drawing", "Mechanical"],
    featured: false
  },
  {
    id: "p4",
    title: "Arduino IoT Starter Kit + Sensors",
    price: 1200,
    originalPrice: 2400,
    condition: "Like New",
    category: "Electronics",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    seller: {
      id: "u2",
      name: "Aarav Sharma",
      branch: "Computer Science",
      year: "4th Year (Senior)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      collegeEmail: "aarav.cs22@college.edu",
      rating: 4.8
    },
    description: "Includes Arduino Uno R3, breadboard, jumper wires, ultrasonic sensor, temperature sensor, OLED screen, and RFID module. Best for mini-projects.",
    createdAt: "3 days ago",
    tags: ["Arduino", "IoT", "Robotics", "Electronics"],
    featured: true
  },
  {
    id: "p5",
    title: "Professional White Lab Coat & Safety Goggles",
    price: 400,
    originalPrice: 850,
    condition: "Like New",
    category: "Lab equipment",
    image: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80",
    seller: {
      id: "u5",
      name: "Sneha Roy",
      branch: "Chemical Engg",
      year: "3rd Year",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      collegeEmail: "sneha.chem@college.edu",
      rating: 5.0
    },
    description: "Standard fit, cotton blend lab coat (Size: M) and anti-fog safety goggles. Required for Chemistry and Bio labs.",
    createdAt: "4 days ago",
    tags: ["Chemistry", "LabCoat", "Safety"],
    featured: false
  },
  {
    id: "p6",
    title: "Cracking the Coding Interview (6th Edition)",
    price: 500,
    originalPrice: 1100,
    condition: "Fair",
    category: "Books",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&auto=format&fit=crop&q=80",
    seller: {
      id: "u6",
      name: "Rohan Verma",
      branch: "Information Tech",
      year: "Alumni / Senior",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      collegeEmail: "rohan.alumni@college.edu",
      rating: 4.9
    },
    description: "The holy grail for FAANG placements and technical interviews. Some highlighted text inside but perfectly readable.",
    createdAt: "1 week ago",
    tags: ["Placements", "DSA", "Coding", "Books"],
    featured: true
  },
  {
    id: "p7",
    title: "1.5 Litre Electric Kettle (Hostel Life Saver)",
    price: 550,
    originalPrice: 1150,
    condition: "Good",
    category: "Hostel essentials",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&auto=format&fit=crop&q=80",
    seller: {
      id: "u3",
      name: "Priya Patel",
      branch: "Electronics",
      year: "3rd Year",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      collegeEmail: "priya.ece@college.edu",
      rating: 4.9
    },
    description: "Prestige electric kettle with auto shut-off. Perfect for Maggi, coffee, or green tea during late night exam cramming in the hostel.",
    createdAt: "2 days ago",
    tags: ["Hostel", "Cooking", "Essentials"],
    featured: false
  },
  {
    id: "p8",
    title: "Adjustable Ergonomic Laptop Stand",
    price: 399,
    originalPrice: 899,
    condition: "Like New",
    category: "Study materials",
    image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop&q=80",
    seller: {
      id: "u4",
      name: "Vikram Malhotra",
      branch: "Mechanical",
      year: "2nd Year",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
      isVerified: true,
      collegeEmail: "vikram.mech@college.edu",
      rating: 4.6
    },
    description: "Aluminium foldable laptop stand with 7 angle adjustments and silicone non-slip pads. Relieves neck strain during coding sessions.",
    createdAt: "5 days ago",
    tags: ["StudyTable", "Laptop", "Ergonomics"],
    featured: false
  }
];

export const initialPosts = [
  {
    id: "post1",
    author: {
      name: "Aarav Sharma",
      branch: "Computer Science",
      year: "4th Year (Senior)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      isVerified: true
    },
    category: "Internship guidance",
    title: "How I cracked a summer internship at Microsoft (On-Campus)",
    content: "Hey juniors! Placement season is approaching. I wanted to share my prep strategy. 1) Master DSA in C++ or Java. LeetCode top 150 is essential. 2) Have at least 2 robust full-stack or Web3 projects. 3) Practice CS Fundamentals (OS, DBMS, CN) thoroughly. Feel free to ask questions below or connect in chat!",
    upvotes: 48,
    comments: [
      {
        id: "c1",
        author: "Karan Johar",
        year: "2nd Year",
        avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80",
        content: "Thanks senior! Did they ask system design for summer interns?",
        createdAt: "1 hour ago"
      },
      {
        id: "c2",
        author: "Aarav Sharma",
        year: "4th Year (Senior)",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
        content: "@Karan Only basic OOPs design questions. High-level architecture isn't expected for 3rd year interns.",
        createdAt: "45 mins ago"
      }
    ],
    createdAt: "1 day ago",
    tags: ["Microsoft", "Internship", "DSA", "Placements"]
  },
  {
    id: "post2",
    author: {
      name: "Dr. Ananya Iyer",
      branch: "Mathematics Dept",
      year: "Professor",
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80",
      isVerified: true
    },
    category: "Exam discussions",
    title: "Important update regarding Semester 3 Linear Algebra Midterms",
    content: "Students please note that the syllabus for the upcoming midterm exam will include Eigenvalues, Eigenvectors, and Orthogonalization. Practice theorems from Chapter 4 of Gilbert Strang. Past papers are available in the library repository.",
    upvotes: 32,
    comments: [],
    createdAt: "2 days ago",
    tags: ["Math", "Midterms", "Announcement"]
  },
  {
    id: "post3",
    author: {
      name: "Priya Patel",
      branch: "Electronics",
      year: "3rd Year",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      isVerified: true
    },
    category: "Study help",
    title: "Need help debugging Verilog code for 4-bit ALU lab test",
    content: "My simulation output is throwing an X state during the carry lookahead addition phase. I've attached my testbench logic. Any VLSI/Digital logic seniors who can spot the error?",
    upvotes: 15,
    comments: [
      {
        id: "c3",
        author: "Vikram Malhotra",
        year: "2nd Year",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80",
        content: "Make sure all your inputs are initialized in initial block at time 0!",
        createdAt: "3 hours ago"
      }
    ],
    createdAt: "3 days ago",
    tags: ["Verilog", "VLSI", "LabExam"]
  },
  {
    id: "post4",
    author: {
      name: "TechClub Campus",
      branch: "Official Society",
      year: "Club",
      avatar: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200&auto=format&fit=crop&q=80",
      isVerified: true
    },
    category: "Events",
    title: "🏆 Annual 36-Hour Campus Hackathon: 'HackTheFuture 2026' Announced!",
    content: "Registrations are now open! Exciting prizes worth ₹1,000,000, free food, swag bags, and direct interviews with our sponsor companies. Form teams of 2 to 4. All departments welcome!",
    upvotes: 89,
    comments: [],
    createdAt: "4 days ago",
    tags: ["Hackathon", "Coding", "Events", "Prizes"]
  }
];

export const initialChats = [
  {
    id: "chat_1",
    user: {
      id: "u2",
      name: "Aarav Sharma",
      branch: "Computer Science",
      year: "4th Year (Senior)",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
      isVerified: true
    },
    product: {
      title: "Casio fx-991EX Scientific Calculator",
      price: 850
    },
    lastMessage: "Sure, we can meet near the Central Canteen at 4 PM tomorrow.",
    lastMessageTime: "10:30 AM",
    unread: true,
    messages: [
      { sender: "me", text: "Hi Aarav, is the Casio calculator still available?", time: "10:15 AM" },
      { sender: "them", text: "Hello! Yes it is. Working perfectly.", time: "10:18 AM" },
      { sender: "me", text: "Can you do ₹750? I can come pick it up from your hostel block.", time: "10:20 AM" },
      { sender: "them", text: "₹800 is the final price bro, it comes with extra battery.", time: "10:25 AM" },
      { sender: "me", text: "Deal! Where can we meet?", time: "10:28 AM" },
      { sender: "them", text: "Sure, we can meet near the Central Canteen at 4 PM tomorrow.", time: "10:30 AM" }
    ]
  },
  {
    id: "chat_2",
    user: {
      id: "u3",
      name: "Priya Patel",
      branch: "Electronics",
      year: "3rd Year",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
      isVerified: true
    },
    product: {
      title: "Complete 1st Year Engineering Physics & Math Notes",
      price: 350
    },
    lastMessage: "I've sent the sample chapter PDF to your email.",
    lastMessageTime: "Yesterday",
    unread: false,
    messages: [
      { sender: "me", text: "Hi Priya! Are your Physics notes helpful for numericals?", time: "Yesterday" },
      { sender: "them", text: "Absolutely! I solved all standard university problem sets in them.", time: "Yesterday" },
      { sender: "them", text: "I've sent the sample chapter PDF to your email.", time: "Yesterday" }
    ]
  }
];

export const aiStudyResources = [
  {
    id: "rec1",
    title: "Data Structures & Algorithms Roadmap 2026",
    type: "Study Guide",
    matchRatio: "98% Match",
    reason: "Based on your interest in Computer Science and recent community searches.",
    url: "#",
    tag: "Highly Recommended"
  },
  {
    id: "rec2",
    title: "Past 5 Years Solved Engineering Mathematics II Papers",
    type: "Exam Prep",
    matchRatio: "95% Match",
    reason: "Midterm exams are approaching in 3 weeks for your batch.",
    url: "#",
    tag: "Trending Now"
  },
  {
    id: "rec3",
    title: "Interactive Circuit Design Simulator Guide",
    type: "Lab Resource",
    matchRatio: "88% Match",
    reason: "Matched with your saved items in 'Electronics' category.",
    url: "#",
    tag: "Smart Match"
  }
];
