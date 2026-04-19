
const CONFIG = {
  // ── Personal ────────────────────────────────────────────────
  name: "Aaron Austin C. Amaro",
  title: "Full Stack Developer | Cybersecurity Specialist",
  organization: "University of Caloocan City",

  // Profile photo — Google Drive direct-view link
  avatar: "https://lh3.googleusercontent.com/d/1Z-us_TF9hIgwajoA0XzfMcgvO6Mh1dbi",

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
    "Game Engine Architect",
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
    "Git", "REST APIs", "Cybersecurity",
  ],

  // ── Education ───────────────────────────────────────────────
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Caloocan City",
    },
  ],

  // ── Experience / Projects ──────────────────────────────────
  projects: [
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
      featured: true,
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
      featured: true,
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
      featured: true,
    },
  ],

  // ── Contact ─────────────────────────────────────────────────
  email: "amaroaaronaustin@gmail.com",
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
