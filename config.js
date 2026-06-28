
const CONFIG = {
  // ── Personal ────────────────────────────────────────────────
  name: "Aaron Austin C. Amaro",
  title: "Full Stack Developer | Cybersecurity Specialist",
  organization: "University of Caloocan City",
  tagline: "I build resilient backend systems, intelligent workflows, and interactive digital worlds.",
  availability: "Open to internships, collaborative builds, and junior development opportunities.",

  // Profile photo — Google Drive direct-view link
  avatar: "https://lh3.googleusercontent.com/d/1wVLaANjOPyS_FSQpsdic8u79WRU2C6HB",

  // University logo — Google Drive direct-view link
  universityLogo: "https://lh3.googleusercontent.com/d/1yjmrJoOXJcNG5A9jOffb1Z8uKx7D44Hb",

  // Brief paragraph shown in the "About" section
  summary: `I'm a dedicated Computer Science student at the University of Caloocan City, specializing in full-stack development, AI agent development, and cybersecurity. I build robust backend systems, architect cloud integrations, and design game engine mechanics using Unity and p5.js. My focus is on bridging academic learning with real-world application — turning code into impact.`,

  // Typing effect roles
  roles: [
    "Full Stack Developer",
    "Backend Specialist",
    "Cybersecurity Enthusiast",
    "AI Agent Developer",
  ],

  // ── Social Links ────────────────────────────────────────────
  socials: [
    {
      platform: "GitHub",
      url: "https://github.com/XierreAg301",
      icon: "github",
    },
    {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/in/aaron-austin-amaro-4aa812400",
      icon: "linkedin",
    },
    {
      platform: "X / Twitter",
      url: "https://x.com/aaron_amar30511",
      icon: "twitter",
    },
    {
      platform: "Facebook",
      url: "https://www.facebook.com/aaronaustin.amaro",
      icon: "facebook",
    },
  ],

  // ── Skills ──────────────────────────────────────────────────
  skills: [
    "JavaScript", "TypeScript", "React", "Node.js", "Next.js",
    "PHP", "Laravel", "C#", "Java", "Python",
    "Unity", "p5.js", "Firebase", "Supabase",
    "Google Cloud", "HTML & CSS", "Tailwind CSS",
    "Git", "REST APIs", "Cybersecurity", "PostgreSQL",
  ],
  skillClusters: [
    {
      name: "Frontend",
      description: "Accessible, responsive interfaces that make complex systems easier to operate.",
      skills: ["JavaScript", "TypeScript", "React", "Next.js", "HTML & CSS", "Tailwind CSS"],
    },
    {
      name: "Backend",
      description: "Service architecture, business logic, authentication, and API integration.",
      skills: ["Node.js", "PHP", "Laravel", "Java", "Python", "C#", "REST APIs"],
    },
    {
      name: "AI / Agents",
      description: "Intelligent workflows and agent-oriented systems grounded in practical automation.",
      skills: ["Python", "Node.js", "REST APIs"],
    },
    {
      name: "Cybersecurity",
      description: "Security-aware implementation, identity flows, and defensive system thinking.",
      skills: ["Cybersecurity", "Git", "REST APIs"],
    },
    {
      name: "Cloud / Data",
      description: "Cloud-backed applications with reliable storage and real-time data services.",
      skills: ["PostgreSQL", "Firebase", "Supabase", "Google Cloud"],
    },
    {
      name: "Creative / Game Development",
      description: "Interactive systems, procedural worlds, and gameplay mechanics built from code.",
      skills: ["Unity", "p5.js", "C#", "JavaScript"],
    },
  ],

  // ── Education ───────────────────────────────────────────────
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Caloocan City",
    },
  ],
  journey: [
    {
      year: "2022",
      title: "Started Computer Science",
      description: "Began the BSCS program at the University of Caloocan City.",
    },
    {
      year: "2023",
      title: "Built a Full-Stack Foundation",
      description: "Developed practical experience across React, Node.js, and cloud platforms.",
    },
    {
      year: "2024",
      title: "Expanded into Cybersecurity and AI",
      description: "Connected software engineering with security and intelligent automation.",
    },
    {
      year: "2025",
      title: "Delivered Production-Oriented Systems",
      description: "Built procurement and emergency-response workflows for real operational needs.",
    },
  ],

  // ── Experience / Projects ──────────────────────────────────
  // Each project may optionally include any of these fields. They render inside
  // the expanded project card only when present (omit or leave empty to hide):
  //   images: [                                          // screenshots of the project
  //     "https://lh3.googleusercontent.com/d/<DRIVE_FILE_ID>",  // Google Drive image (same as certificates)
  //     "/projects/awcs-1.png",                          // ...or a local file in public/projects/
  //   ],
  //   repoUrl: "https://github.com/XierreAg301/<repo>",  // source repository (optional)
  //   demoUrl: "https://<live-deployment-url>",          // live demo / deployment (optional)
  projects: [
    {
      title: "Procurement and Inventory System",
      role: "Database Manager & Backend Developer",
      date: "August – November 2025",
      technologies: ["PHP", "PostgreSQL"],
      description: [
        "Architected a robust backend using PHP and PostgreSQL to power a comprehensive procurement and inventory system initially deployed for the POCC Cubao branch, with scalable support for multiple regional branches.",
        "Developed distinct, role-based dashboards and secure authentication flows for Admin Assistants, Procurement Managers, and Suppliers, ensuring targeted data visibility for stock management and pending requests.",
        "Integrated dynamic PDF generation capabilities to instantly compile detailed inventory reports and standardized purchase requests, optimizing operational reporting across all managed locations.",
      ],
      outcome: "Delivered role-based procurement, stock, and reporting workflows designed to support multiple branches.",
      featured: true,
    },
    {
      title: "Automatic Welfare Check-In System (AWCS)",
      role: "Backend Developer",
      date: "August – November 2025",
      technologies: ["HTML & CSS", "Laravel Blade", "PHP", "Supabase", "Vercel"],
      description: [
        "Developed an Automated System using Vercel to manage disaster welfare checks, utilizing automated SMS and escalate unresponsive cases to emergency teams.",
        "Designed a responsive, user-friendly dashboard for emergency responders utilizing Laravel Blade, HTML, and CSS to seamlessly visualize real-time safety statuses.",
        "Integrated Supabase as a cloud database solution within a Laravel (PHP) architecture, ensuring secure and immediate processing of incoming SMS and voice call responses.",
      ],
      outcome: "Created a cloud-backed safety-status workflow that helps responders identify and escalate unresponsive cases.",
      featured: false,
    },
    {
      title: "BugHunt: Debug or Die!",
      role: "Backend Developer & API Integrator",
      date: "March – April 2026",
      technologies: ["C#", "Unity", "Google Cloud", "Firebase", "Node.js"],
      description: [
        "Integrated the Maya Sandbox API utilizing Node.js in Google Cloud to securely process and manage simulated in-game transactions.",
        "Architected and managed a scalable backend database using Firebase to efficiently store player progression, game states, and real-time data.",
        "Engineered secure user authentication by implementing Google Single Sign-On (SSO) to seamlessly handle player login and registration within the Unity foundation.",
      ],
      outcome: "Connected authenticated players, simulated transactions, and persistent progression through a scalable game backend.",
      featured: false,
    },
    {
      title: "2DCraft",
      role: "Full Stack Developer",
      date: "February – March 2026",
      technologies: ["HTML & CSS", "Java", "JavaScript", "P5 library"],
      description: [
        "Engineered a 2D voxel game engine from scratch using JavaScript (p5.js), implementing noise algorithms and JSON tilesets for procedural world generation.",
        "Programmed fully destructible terrain and sandbox mechanics, utilizing array-based structures for efficient inventory and block management.",
        "Developed interactive gameplay systems, including a dynamic day/night cycle, enemy spawn logic, and a comprehensive crafting UI.",
      ],
      outcome: "Produced a playable procedural sandbox with destructible terrain, crafting, inventory, and dynamic world systems.",
      featured: false,
    },
  ],

  // ── Contact ─────────────────────────────────────────────────
  email: "amaro.aaronaustinbscs2023@gmail.com",
  phone: "+639685081968",
  phoneDisplay: "+63 968 508 1968",

  // ── Certificates / Google Drive Links ───────────────────────
  certificates: [
    {
      title: "Automate or Stagnate: Building Intelligent Workflows",
      url: "https://drive.google.com/file/d/1F44xjqrnuwReWsG6estmy3Wg5LI7aePr/view?usp=sharing",
      imageUrl: "https://lh3.googleusercontent.com/d/1F44xjqrnuwReWsG6estmy3Wg5LI7aePr",
    },
    {
      title: "Coursera Google Certificate: Cybersecurity",
      url: "https://drive.google.com/file/d/1i0ay-Ex7-b3lNjhQjGFuW4WnoVbus1aW/view?usp=sharing",
      imageUrl: "https://lh3.googleusercontent.com/d/1i0ay-Ex7-b3lNjhQjGFuW4WnoVbus1aW",
    },
    {
      title: "Web Deployment E-Certificate",
      url: "https://drive.google.com/file/d/1_8ywRGn3Stjs7Jz7rEQprVIFdpaU60KL/view?usp=sharing",
      imageUrl: "https://lh3.googleusercontent.com/d/1_8ywRGn3Stjs7Jz7rEQprVIFdpaU60KL",
    },
  ],

  resumeLink: "https://docs.google.com/document/d/1AM7y768XhlLBhpUdXyKJ0jTupsw81RwWdhvXz19u3yI/edit?usp=sharing",
};

export { CONFIG };
