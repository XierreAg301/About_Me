
const CONFIG = {
  // ── Personal ────────────────────────────────────────────────
  name: "Aaron Austin C. Amaro",
  title: "BS Computer Science Student",
  organization: "University of Caloocan City",

  // Profile photo — Google Drive direct-view link
  avatar: "https://lh3.googleusercontent.com/d/1Z-us_TF9hIgwajoA0XzfMcgvO6Mh1dbi",

  // University logo — Google Drive direct-view link
  universityLogo: "https://lh3.googleusercontent.com/d/1yjmrJoOXJcNG5A9jOffb1Z8uKx7D44Hb",

  // Brief paragraph shown in the "Professional Summary" card.
  summary: `Aaron Austin C. Amaro is a dedicated Bachelor of Science in Computer Science student at the University of Caloocan City. With a passion for technology and software development, Aaron is continuously building skills in programming, web development, and problem-solving. He is eager to learn, collaborate, and contribute to meaningful projects that push the boundaries of what technology can achieve. Outside academics, Aaron enjoys exploring new tools, contributing to open-source projects, and staying up-to-date with the latest in computer science.`,

  // ── Social Links ────────────────────────────────────────────
  socials: [
    {
      platform: "LinkedIn",
      url: "https://www.linkedin.com/in/aaron-austin-amaro-4aa812400",
      viewBox: "0 0 448 512",
      path: "M100.3 448l-92.9 0 0-299.1 92.9 0 0 299.1zM53.8 108.1C24.1 108.1 0 83.5 0 53.8 0 39.5 5.7 25.9 15.8 15.8s23.8-15.8 38-15.8 27.9 5.7 38 15.8 15.8 23.8 15.8 38c0 29.7-24.1 54.3-53.8 54.3zM447.9 448l-92.7 0 0-145.6c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7l0 148.1-92.8 0 0-299.1 89.1 0 0 40.8 1.3 0c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3l0 164.3-.1 0z"
    },
    {
      platform: "X / Twitter",
      url: "https://x.com/aaron_amar30511",
      viewBox: "0 0 448 512",
      path: "M357.2 48L427.8 48 273.6 224.2 455 464 313 464 201.7 318.6 74.5 464 3.8 464 168.7 275.5-5.2 48 140.4 48 240.9 180.9 357.2 48zM332.4 421.8l39.1 0-252.4-333.8-42 0 255.3 333.8z"
    },
    {
      platform: "GitHub",
      url: "https://github.com/XierreAg301",
      viewBox: "0 0 512 512",
      path: "M173.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3 .3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5 .3-6.2 2.3zm44.2-1.7c-2.9 .7-4.9 2.6-4.6 4.9 .3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM252.8 8c-138.7 0-244.8 105.3-244.8 244 0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1 100-33.2 167.8-128.1 167.8-239 0-138.7-112.5-244-251.2-244zM105.2 352.9c-1.3 1-1 3.3 .7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3 .3 2.9 2.3 3.9 1.6 1 3.6 .7 4.3-.7 .7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3 .7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3 .7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9s4.3 3.3 5.6 2.3c1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
    },
    {
      platform: "Facebook",
      url: "https://www.facebook.com/aaronaustin.amaro",
      viewBox: "0 0 320 512",
      path: "M80 299.3l0 212.7 116 0 0-212.7 86.5 0 18-97.8-104.5 0 0-34.6c0-51.7 20.3-71.5 72.7-71.5 16.3 0 29.4 .4 37 1.2l0-88.7C291.4 4 256.4 0 236.2 0 129.3 0 80 50.5 80 159.4l0 42.1-66 0 0 97.8 66 0z"
    }
  ],

  // ── Education ───────────────────────────────────────────────
  education: [
    {
      degree: "Bachelor of Science in Computer Science",
      school: "University of Caloocan City"
    }
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
      imageUrl: "https://lh3.googleusercontent.com/d/1F44xjqrnuwReWsG6estmy3Wg5LI7aePr"
    },
    {
      title: "Coursera Google Certificate: Cybersecurity",
      url: "https://drive.google.com/file/d/1i0ay-Ex7-b3lNjhQjGFuW4WnoVbus1aW/view?usp=sharing",
      imageUrl: "https://lh3.googleusercontent.com/d/1i0ay-Ex7-b3lNjhQjGFuW4WnoVbus1aW"
    },
    {
      title: "Web Deployment E-Certificate",
      url: "https://drive.google.com/file/d/1_8ywRGn3Stjs7Jz7rEQprVIFdpaU60KL/view?usp=sharing",
      imageUrl: "https://lh3.googleusercontent.com/d/1_8ywRGn3Stjs7Jz7rEQprVIFdpaU60KL"
    }
  ],

  // ── Projects ────────────────────────────────────────────────
  projects: [],


  resumeLink: null
};
