const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Curated benchmarks for Indian tech market roles
 */
const ROLE_BENCHMARKS = {
  'full-stack-engineer': {
    title: 'Full Stack Engineer',
    coreSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'REST APIs', 'System Design', 'Git', 'AWS'],
    certifications: [
      { name: 'AWS Certified Developer - Associate', provider: 'Amazon Web Services', url: 'https://aws.amazon.com/certification/certified-developer-associate/', duration: '4-6 weeks', relevance: 'Very High in Indian MNCs & Startups' },
      { name: 'Meta Front-End Developer Professional Certificate', provider: 'Coursera / Meta', url: 'https://www.coursera.org/professional-certificates/meta-front-end-developer', duration: '6-8 weeks', relevance: 'High' }
    ],
    projects: [
      { title: 'Scalable Microservices E-Commerce with UPI Webhooks', techStack: ['Node.js', 'Express', 'PostgreSQL', 'Redis', 'Docker'], description: 'Build end-to-end checkout with idempotent webhook processing, Redis caching for inventory, and JWT auth.', duration: '3 weeks', difficulty: 'Intermediate' },
      { title: 'Real-Time Collaborative Workspace', techStack: ['React', 'TypeScript', 'WebSockets', 'TailwindCSS', 'MongoDB'], description: 'Live multi-cursor editing, optimistic UI updates, and conflict resolution.', duration: '4 weeks', difficulty: 'Advanced' }
    ]
  },
  'backend-engineer': {
    title: 'Backend Engineer / SDE-2',
    coreSkills: ['Java', 'Spring Boot', 'Go', 'Python', 'PostgreSQL', 'Kafka', 'Redis', 'Microservices', 'Docker', 'Kubernetes'],
    certifications: [
      { name: 'AWS Certified Solutions Architect - Associate', provider: 'AWS', url: 'https://aws.amazon.com/certification/certified-solutions-architect-associate/', duration: '6-8 weeks', relevance: 'Gold Standard for SDE-2 in India' },
      { name: 'Confluent Certified Developer for Apache Kafka', provider: 'Confluent', url: 'https://www.confluent.io/certification/', duration: '3-4 weeks', relevance: 'High for Tier-1 Product Companies' }
    ],
    projects: [
      { title: 'High-Throughput Event Streaming Pipeline', techStack: ['Kafka', 'Go', 'PostgreSQL', 'Prometheus'], description: 'Ingest 10k events/sec with backpressure handling, partitioned consumers, and Grafana telemetry.', duration: '3 weeks', difficulty: 'Advanced' },
      { title: 'Distributed Rate Limiter & API Gateway', techStack: ['Java', 'Spring Boot', 'Redis', 'Docker'], description: 'Token bucket and sliding window rate limiting across distributed pods.', duration: '3 weeks', difficulty: 'Intermediate' }
    ]
  },
  'frontend-engineer': {
    title: 'Frontend Engineer',
    coreSkills: ['JavaScript (ES6+)', 'TypeScript', 'React', 'Next.js', 'HTML5/CSS3', 'Performance Optimization', 'Web Vitals', 'State Management'],
    certifications: [
      { name: 'Meta Front-End Developer Certificate', provider: 'Coursera / Meta', url: 'https://www.coursera.org/', duration: '6 weeks', relevance: 'High' },
      { name: 'NPTEL Computer Graphics & Web Technology', provider: 'IIT Kharagpur / SWAYAM', url: 'https://nptel.ac.in/', duration: '8 weeks', relevance: 'Recognized by Indian Academia & MNCs' }
    ],
    projects: [
      { title: 'High-Performance Design System & Component Library', techStack: ['React', 'TypeScript', 'Storybook', 'Vite'], description: 'Accessible WCAG 2.1 AA compliant components with zero-runtime CSS tokens and automated visual regression tests.', duration: '3 weeks', difficulty: 'Intermediate' }
    ]
  },
  'devops-cloud': {
    title: 'DevOps & Cloud Infrastructure Engineer',
    coreSkills: ['Linux', 'Docker', 'Kubernetes', 'Terraform', 'CI/CD (GitHub Actions)', 'AWS', 'Monitoring (Prometheus/Grafana)', 'Python / Bash'],
    certifications: [
      { name: 'CKA: Certified Kubernetes Administrator', provider: 'Linux Foundation', url: 'https://www.cncf.io/certification/cka/', duration: '8 weeks', relevance: 'Top Tier Hiring Advantage in India' },
      { name: 'HashiCorp Certified: Terraform Associate', provider: 'HashiCorp', url: 'https://www.hashicorp.com/certification/terraform-associate', duration: '3 weeks', relevance: 'High' }
    ],
    projects: [
      { title: 'Multi-Environment GitOps Kubernetes Pipeline', techStack: ['Kubernetes', 'ArgoCD', 'Terraform', 'Helm', 'AWS EKS'], description: 'Automated cluster provisioning and zero-downtime canary deployments.', duration: '4 weeks', difficulty: 'Advanced' }
    ]
  },
  'data-engineer': {
    title: 'Data & AI Engineer',
    coreSkills: ['Python', 'SQL', 'Apache Spark', 'Airflow', 'Snowflake / BigQuery', 'Data Warehousing', 'ETL / ELT Pipelines'],
    certifications: [
      { name: 'Databricks Certified Data Engineer Associate', provider: 'Databricks', url: 'https://www.databricks.com/learn/certification', duration: '5 weeks', relevance: 'High demand in Bangalore & Hyderabad' },
      { name: 'Google Cloud Professional Data Engineer', provider: 'Google Cloud', url: 'https://cloud.google.com/learn/certification/data-engineer', duration: '6-8 weeks', relevance: 'Very High' }
    ],
    projects: [
      { title: 'End-to-End Batch & Streaming Data Lakehouse', techStack: ['PySpark', 'Delta Lake', 'Airflow', 'PostgreSQL', 'Docker'], description: 'Pipeline transforming clickstream events into curated analytics tables with data quality alerts.', duration: '4 weeks', difficulty: 'Advanced' }
    ]
  }
};

/**
 * Fallback deterministic generator ensuring high-grade response even if offline
 */
function generateDeterministicRoadmap({ currentRole, targetRole, skills = [], experienceLevel, timeline }) {
  const normTarget = (targetRole || 'Software Engineer').toLowerCase();
  let matchedKey = 'full-stack-engineer';

  if (normTarget.includes('back') || normTarget.includes('api') || normTarget.includes('system') || normTarget.includes('java')) {
    matchedKey = 'backend-engineer';
  } else if (normTarget.includes('front') || normTarget.includes('ui') || normTarget.includes('react') || normTarget.includes('web')) {
    matchedKey = 'frontend-engineer';
  } else if (normTarget.includes('devops') || normTarget.includes('cloud') || normTarget.includes('infra') || normTarget.includes('sre')) {
    matchedKey = 'devops-cloud';
  } else if (normTarget.includes('data') || normTarget.includes('ml') || normTarget.includes('ai') || normTarget.includes('analytics')) {
    matchedKey = 'data-engineer';
  }

  const benchmark = ROLE_BENCHMARKS[matchedKey];
  const lowerUserSkills = new Set(skills.map(s => String(s).toLowerCase().trim()));
  const missingCore = benchmark.coreSkills.filter(s => !lowerUserSkills.has(s.toLowerCase()));
  const matchedCore = benchmark.coreSkills.filter(s => lowerUserSkills.has(s.toLowerCase()));

  // Score calculation: baseline (45) + matched proportion (up to 45) + experience bonus
  const matchRatio = benchmark.coreSkills.length > 0 ? (matchedCore.length / benchmark.coreSkills.length) : 0.5;
  const expBonus = experienceLevel === '4-7' ? 10 : (experienceLevel === '1-3' ? 5 : 0);
  const profileScore = Math.min(94, Math.max(38, Math.round(45 + (matchRatio * 45) + expBonus)));

  const p1Skills = missingCore.slice(0, 3).length ? missingCore.slice(0, 3) : ['Core CS Fundamentals', 'Git Workflows', 'Clean Code'];
  const p2Skills = missingCore.slice(3, 6).length ? missingCore.slice(3, 6) : ['Advanced Architecture', 'Microservices', 'Database Tuning'];
  const p3Skills = ['Cloud Architecture & CI/CD', 'Scalability Patterns', 'Security & Telemetry'];
  const p4Skills = ['System Design & High Availability', 'Cross-functional Leadership', 'Staff+ Problem Solving'];

  const phases = [
    {
      phaseNumber: 1,
      label: 'Phase 1: Skill Gap Foundation & Rapid Wins',
      duration: 'Month 1 (Days 1–30)',
      focus: `Close priority gaps in ${p1Skills.join(', ')} while consolidating modern development practices.`,
      skills: p1Skills,
      certifications: [
        benchmark.certifications[0] || { name: 'NPTEL Cloud Computing & Distributed Systems', provider: 'IIT SWAYAM', duration: '4 weeks', relevance: 'Strong Academic & Enterprise Signal' }
      ],
      projects: [
        {
          title: `Production-Grade ${targetRole} Boilerplate & API Service`,
          techStack: p1Skills.concat(['Docker', 'Git']),
          description: `Build and document an end-to-end service adhering to 12-factor application standards with automated test suites.`,
          duration: '2 weeks',
          difficulty: 'Intermediate'
        }
      ],
      resumeImpact: `+12 ATS Points — Adds critical keyword density and resolves missing primary stack requirements.`
    },
    {
      phaseNumber: 2,
      label: 'Phase 2: Core Production Competency & System Architecture',
      duration: 'Months 2–3 (Days 31–90)',
      focus: `Build deep architectural competence in ${p2Skills.join(', ')} and integrate production databases.`,
      skills: p2Skills,
      certifications: [
        benchmark.certifications[1] || { name: 'AWS Certified Cloud Practitioner', provider: 'Amazon Web Services', duration: '3 weeks', relevance: 'High' }
      ],
      projects: [
        benchmark.projects[0] || {
          title: 'Distributed Transaction Processing Engine',
          techStack: ['PostgreSQL', 'Redis', 'Docker', 'Node.js'],
          description: 'Multi-tenant architecture handling concurrency, optimistic locking, and background worker queues.',
          duration: '3 weeks',
          difficulty: 'Intermediate'
        }
      ],
      resumeImpact: `+18 ATS Points — Positions you ahead of 70% of applicants with measurable system implementation bullets.`
    },
    {
      phaseNumber: 3,
      label: 'Phase 3: Scale, Cloud Infrastructure & Industry Certifications',
      duration: 'Months 4–6',
      focus: 'Master cloud deployment, container orchestration, telemetry, and industry-recognized certifications.',
      skills: p3Skills,
      certifications: [
        benchmark.certifications[0] || { name: 'Google Associate Cloud Engineer', provider: 'Google Cloud', duration: '6 weeks', relevance: 'Very High' }
      ],
      projects: [
        benchmark.projects[1] || {
          title: 'Automated CI/CD GitOps Cluster with Prometheus Telemetry',
          techStack: ['Docker', 'Kubernetes', 'GitHub Actions', 'Grafana'],
          description: 'Zero-downtime rolling deployments with automated health checks, rate limiting, and structured logging.',
          duration: '4 weeks',
          difficulty: 'Advanced'
        }
      ],
      resumeImpact: `+15 ATS Points — Validates DevOps, cloud fluency, and enterprise readiness for Tier-1 product firms.`
    },
    {
      phaseNumber: 4,
      label: 'Phase 4: High-Scale System Design & Interview Mastery',
      duration: 'Months 7–12',
      focus: 'System design depth, cross-team technical leadership, mock interview rounds, and FAANG/Unicorn targeting.',
      skills: p4Skills,
      certifications: [
        { name: 'Advanced System Design & Scalability Badge', provider: 'CareerForge Academy', duration: '4 weeks', relevance: 'Tailored for SDE-2 / Senior Panels' }
      ],
      projects: [
        {
          title: 'High-Concurrency Distributed Rate Limiter & Telemetry Hub',
          techStack: ['Distributed Systems', 'Redis Cluster', 'Kafka', 'System Design'],
          description: 'Design and benchmark a system handling 50,000 requests/sec with graceful degradation under network partition.',
          duration: '4 weeks',
          difficulty: 'Advanced'
        }
      ],
      resumeImpact: `+20 ATS Points — Elevates resume from junior executor to senior systems architect with high callback rates.`
    }
  ];

  const milestones = [
    { id: 'm1', text: `Complete fundamental refresh on ${p1Skills[0] || 'core stack'}`, phase: 1, completed: false },
    { id: 'm2', text: 'Deploy Phase 1 project live with GitHub README documentation', phase: 1, completed: false },
    { id: 'm3', text: `Build and benchmark ${phases[1].projects[0]?.title || 'Phase 2 system'}`, phase: 2, completed: false },
    { id: 'm4', text: `Complete ${phases[1].certifications[0]?.name || 'relevant certification'}`, phase: 2, completed: false },
    { id: 'm5', text: 'Set up Dockerized CI/CD workflow and monitoring dashboard', phase: 3, completed: false },
    { id: 'm6', text: 'Pass 10 System Design & DSA interview mocks for Indian product companies', phase: 4, completed: false }
  ];

  const readinessSummary = `You have ${matchedCore.length} of ${benchmark.coreSkills.length} critical skills for ${targetRole}. Focus on ${missingCore.slice(0, 3).join(', ') || 'production architecture'} in Month 1 to move your profile from ${profileScore}% to 85%+ readiness.`;

  return {
    targetRole,
    currentRole: currentRole || 'CS Graduate / Engineer',
    experienceLevel,
    timeline: timeline || '6 months',
    profileScore,
    readinessSummary,
    phases,
    milestones
  };
}

/**
 * Primary AI Roadmap Generation Service
 */
exports.generateRoadmapFromAI = async ({ currentRole, targetRole, skills = [], experienceLevel, timeline, resumeData }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return generateDeterministicRoadmap({ currentRole, targetRole, skills, experienceLevel, timeline });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
You are an expert career transition strategist and tech hiring director in India.
Generate a structured, hyper-practical Career Roadmap for an Indian computer science professional or graduate targeting: "${targetRole}".

Candidate Profile:
- Current Role / Background: ${currentRole || 'Fresher / CS Graduate'}
- Experience Level: ${experienceLevel}
- Stated Skills: ${skills.join(', ') || 'N/A'}
- Target Timeline: ${timeline || '6 months'}
- Resume Context: ${resumeData ? JSON.stringify(resumeData).slice(0, 1000) : 'None'}

Requirements:
1. Provide a profileScore (0 to 100) reflecting readiness for ${targetRole}.
2. Provide a readinessSummary string explaining where they stand in the Indian job market and how to bridge the gap.
3. Provide exactly 4 phases:
   - Phase 1: 30-day Foundation & Skill Gaps
   - Phase 2: 90-day Core Production Competency
   - Phase 3: 6-month Scale, Cloud & Certifications (Include top Indian market recognized certifications like AWS, NPTEL, Coursera, GCP)
   - Phase 4: 12-month High-Scale System Design & Senior Impact
4. Each phase must include:
   - phaseNumber: 1, 2, 3, 4
   - label: String
   - duration: String
   - focus: String
   - skills: Array of strings
   - certifications: Array of { name, provider, url, duration, relevance }
   - projects: Array of { title, techStack: [string], description, duration, difficulty: "Beginner"|"Intermediate"|"Advanced" }
   - resumeImpact: String (e.g. "+15 ATS Points for ...")
5. Provide an array of 6 milestones: [{ id: "m1", text: string, phase: number, completed: false }].

Output strictly in JSON matching this schema:
{
  "targetRole": "${targetRole}",
  "currentRole": "${currentRole || 'CS Graduate'}",
  "experienceLevel": "${experienceLevel}",
  "timeline": "${timeline}",
  "profileScore": number,
  "readinessSummary": string,
  "phases": [...],
  "milestones": [...]
}
`.trim();

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const parsed = JSON.parse(responseText);
    return parsed;
  } catch (err) {
    console.warn('[aiService] Gemini Roadmap generation failed, falling back to deterministic benchmark:', err.message);
    return generateDeterministicRoadmap({ currentRole, targetRole, skills, experienceLevel, timeline });
  }
};

/**
 * Company Tier Profiles for Indian Market
 */
const COMPANY_TIER_PROFILES = {
  'FAANG': {
    overview: 'FAANG & Tier-1 Global Tech (Google, Amazon, Microsoft, Uber India) emphasize exceptional algorithm optimization, rigorous system design, and strict leadership/cultural alignment.',
    interviewFocus: 'Round 1-2: DSA (Graphs, Dynamic Programming, Trees) with strict time/space complexity analysis. Round 3: Low-Level / Machine Coding. Round 4: High-Level System Design (scalability, caching, partitioning). Round 5: Behavioral (Amazon 16 Leadership Principles / Googleyness).',
    preparationTips: [
      'Practice LeetCode Medium/Hard patterns (Sliding Window, Monotonic Stack, Topo Sort).',
      'Explain your thought process out loud before writing a single line of code.',
      'In behavioral questions, always speak in the first person ("I architected...", "My decision was...").'
    ]
  },
  'Unicorn': {
    overview: 'Indian Tech Unicorns (Flipkart, Swiggy, Zomato, Razorpay, PhonePe) prioritize machine coding speed, practical concurrency, resilient database schemas, and microservice debugging.',
    interviewFocus: 'Round 1: Machine Coding (90 mins live coding - OOP design, design patterns, working test cases). Round 2: Problem Solving & DSA. Round 3: High-Level System Design. Round 4: Hiring Manager & Culture Fit.',
    preparationTips: [
      'Master OOP design patterns: Strategy, Factory, Observer, Singleton.',
      'Be prepared to design real-time systems like order dispatch, wallet balances, or notification queues.',
      'Highlight concrete latency cuts, uptime guarantees, and production incident handling.'
    ]
  },
  'Product': {
    overview: 'Mid-to-large product enterprises (Atlassian, Cisco, Oracle, Intuit, Zoho) look for clean code maintainability, API design standards, and collaborative team mindset.',
    interviewFocus: 'Round 1: DSA & Problem Solving. Round 2: Object-Oriented Design & API architecture. Round 3: System Architecture & Database Design. Round 4: Cultural Values.',
    preparationTips: [
      'Focus on SOLID principles and clean RESTful API contracts.',
      'Demonstrate test-driven development (TDD) awareness and clean exception handling.',
      'Emphasize asynchronous programming and database indexing.'
    ]
  },
  'IT Services': {
    overview: 'Premier IT Services cohorts (TCS Digital/Prime, Infosys Power Programmer, Cognizant GenC Next) look for strong core CS foundations, Java/C++/Python competence, and structured analytical thinking.',
    interviewFocus: 'Round 1: Coding Assessment (Data structures & algorithmic problem solving). Round 2: Technical Interview (OOPs, DBMS, Operating Systems, Computer Networks). Round 3: HR & Versatility Round.',
    preparationTips: [
      'Be rock solid on Core Java / C++, OOP principles, normalization, and indexing in SQL.',
      'Be ready to explain project architecture and your individual contribution clearly.',
      'Practice clear communication and project walkthroughs.'
    ]
  },
  'Startup': {
    overview: 'High-growth early/growth-stage startups seek full-stack ownership, rapid product iteration, self-direction, and pragmatic engineering trade-offs.',
    interviewFocus: 'Round 1: Practical Take-Home or Live Pair Programming. Round 2: Deep Dive into past projects & architectural decisions. Round 3: Founder / VP Engineering Fit.',
    preparationTips: [
      'Showcase live deployed projects, GitHub code quality, and technical agency.',
      'Discuss trade-offs between rapid shipping vs technical debt.',
      'Demonstrate familiarity with cloud hosting, CI/CD, and fast debugging.'
    ]
  }
};

/**
 * Deterministic Interview Questions Fallback
 */
function generateDeterministicQuestions({ companyTier = 'Product', role = 'Software Engineer', roundType = 'Full Loop', experienceSnippets = [] }) {
  const profile = COMPANY_TIER_PROFILES[companyTier] || COMPANY_TIER_PROFILES['Product'];
  const snippetContext = experienceSnippets.length ? experienceSnippets.join(' ') : '';

  const questions = [
    // DSA
    {
      id: 'q1',
      category: 'DSA',
      question: 'Given an array of integers representing request latencies, find the maximum sum of a contiguous subarray using Kadane\'s Algorithm, and explain how you would handle streaming input.',
      hint: 'Maintain currentMax and globalMax. For streaming data, think about bounded sliding window buffers.',
      difficulty: 'Medium',
      practiced: false
    },
    {
      id: 'q2',
      category: 'DSA',
      question: 'Design an LRU (Least Recently Used) Cache with O(1) get and put operations. Walk through the data structure trade-offs.',
      hint: 'Combine a Hash Map for O(1) lookups with a Doubly Linked List for O(1) eviction and node reordering.',
      difficulty: 'Medium',
      practiced: false
    },
    {
      id: 'q3',
      category: 'DSA',
      question: 'Given a directed graph of microservice dependencies, detect if there is a circular dependency cycle using Kahn\'s Algorithm (Topological Sort).',
      hint: 'Compute in-degrees for all vertices. Push zero in-degree nodes into a queue and decrement child in-degrees.',
      difficulty: 'Hard',
      practiced: false
    },
    {
      id: 'q4',
      category: 'DSA',
      question: 'Find the lowest common ancestor (LCA) of two nodes in a binary search tree vs an arbitrary binary tree.',
      hint: 'For BST use value ordering; for general tree, recurse left and right and check where both pointers return non-null.',
      difficulty: 'Medium',
      practiced: false
    },
    {
      id: 'q5',
      category: 'DSA',
      question: 'Find the median from a continuous data stream of incoming transaction amounts.',
      hint: 'Maintain two heaps: a Max-Heap for the lower half and a Min-Heap for the upper half, keeping sizes balanced within 1.',
      difficulty: 'Hard',
      practiced: false
    },

    // System Design
    {
      id: 'q6',
      category: 'System Design',
      question: `Design an Idempotent Payment Webhook Processing System for an Indian checkout platform (like Razorpay/UPI). How do you prevent double-charging during network retries?`,
      hint: 'Use unique transaction UUIDs, distributed Redis locks, and database unique constraints with idempotent status states.',
      difficulty: 'Medium',
      practiced: false
    },
    {
      id: 'q7',
      category: 'System Design',
      question: `How would you architect a real-time notification service delivering SMS and push notifications to 5 million Indian users with tier-based priority?`,
      hint: 'Partition with Kafka topics (high/normal/bulk), worker auto-scaling groups, and circuit breakers for third-party telecom gateways.',
      difficulty: 'Hard',
      practiced: false
    },
    {
      id: 'q8',
      category: 'System Design',
      question: 'Design a distributed URL shortener (e.g. Bitly) handling 10,000 writes/sec and 100,000 reads/sec with custom aliases and telemetry.',
      hint: 'Base62 encoding of 64-bit integer IDs (Snowflake generator), Redis caching layer for read bursts, and Cassandra/PostgreSQL storage.',
      difficulty: 'Medium',
      practiced: false
    },
    {
      id: 'q9',
      category: 'System Design',
      question: 'Explain database sharding strategies (Range-based, Hash-based, Directory-based). What are the trade-offs during cross-shard joins and rebalancing?',
      hint: 'Discuss consistent hashing with virtual nodes to minimize data migration during cluster resizing.',
      difficulty: 'Hard',
      practiced: false
    },

    // Behavioral (Tailored to user context)
    {
      id: 'q10',
      category: 'Behavioral',
      question: snippetContext
        ? `You noted working on "${snippetContext.slice(0, 70)}...". Tell me about a critical technical blocker you encountered during that project and how you resolved it.`
        : `Tell me about a high-stakes production incident or outage you encountered. How did you triage, fix, and post-mortem the root cause?`,
      hint: 'Structure using STAR (Situation, Task, Action, Result). Highlight your specific diagnostic methodology and what you learned.',
      difficulty: 'Medium',
      practiced: false
    },
    {
      id: 'q11',
      category: 'Behavioral',
      question: 'Describe a situation where you had a strong technical disagreement with a senior engineer or product manager. How did you navigate the trade-offs?',
      hint: 'Showcase data-driven persuasion, willingness to listen, and prioritizing user/business outcome over ego.',
      difficulty: 'Medium',
      practiced: false
    },
    {
      id: 'q12',
      category: 'Behavioral',
      question: 'Tell me about a time you had to deliver a critical feature under an aggressive deadline without compromising code quality.',
      hint: 'Discuss scope negotiation, MVP slicing, automated testing safeguards, and clear stakeholder communication.',
      difficulty: 'Easy',
      practiced: false
    },
    {
      id: 'q13',
      category: 'Behavioral',
      question: 'Share an example where you took proactive ownership of a system beyond your assigned ticket or sprint scope.',
      hint: 'Focus on technical debt elimination, CI/CD speedup, or mentoring a junior team member.',
      difficulty: 'Easy',
      practiced: false
    },

    // HR & Career
    {
      id: 'q14',
      category: 'HR',
      question: `Why are you looking to join a ${companyTier} engineering team at this point in your career? What expectations do you have from our engineering culture?`,
      hint: 'Connect your learning curve, technical aspirations, and appreciation for the company tier\'s scale and challenges.',
      difficulty: 'Easy',
      practiced: false
    },
    {
      id: 'q15',
      category: 'HR',
      question: 'Where do you see yourself technically in 3 years? Do you lean toward individual contributor depth (Staff/Architect) or engineering management?',
      hint: 'Express passion for technical mastery while acknowledging the value of team enablement and mentorship.',
      difficulty: 'Easy',
      practiced: false
    }
  ];

  return {
    companyTier,
    role,
    roundType,
    companyOverview: profile.overview,
    interviewFocus: profile.interviewFocus,
    preparationTips: profile.preparationTips,
    questions
  };
}

/**
 * Primary Interview Question Generator
 */
exports.generateInterviewQuestions = async ({ companyTier, role, roundType, experienceSnippets = [], resumeData }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return generateDeterministicQuestions({ companyTier, role, roundType, experienceSnippets });
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
You are a Principal Engineering Director and Hiring Bar Raiser for ${companyTier} tech companies in India (such as Google, Amazon, Flipkart, Swiggy, Razorpay, or TCS Digital).
Generate a targeted suite of 15 interview questions for a candidate interviewing for the role of "${role}" in the "${roundType}" format.

Candidate Context:
- Company Tier: ${companyTier}
- Target Role: ${role}
- Round Focus: ${roundType}
- Experience Snippets: ${experienceSnippets.join(' | ') || 'None provided'}
- Resume Context: ${resumeData ? JSON.stringify(resumeData).slice(0, 800) : 'None'}

Requirements:
1. Provide companyOverview (2-3 sentences explaining interview expectations for ${companyTier} companies in India).
2. Provide interviewFocus (summary of interview round structure).
3. Provide an array of preparationTips (3 actionable tips).
4. Generate 15 questions categorized across:
   - "DSA" (4-5 questions: algorithms, data structure trade-offs)
   - "System Design" (4-5 questions: scalable architecture, concurrency, caching, messaging)
   - "Behavioral" (3-4 questions: STAR format, referencing user's experience snippets if available)
   - "HR" (2 questions: cultural values, career trajectory)
5. Each question must include:
   - id: string ("q1", "q2", etc.)
   - category: "DSA" | "System Design" | "Behavioral" | "HR"
   - question: string
   - hint: string (concise guidance)
   - difficulty: "Easy" | "Medium" | "Hard"
   - practiced: false

Output strictly in JSON matching this schema:
{
  "companyTier": "${companyTier}",
  "role": "${role}",
  "roundType": "${roundType}",
  "companyOverview": string,
  "interviewFocus": string,
  "preparationTips": [string, string, string],
  "questions": [
    {
      "id": "q1",
      "category": "DSA",
      "question": "...",
      "hint": "...",
      "difficulty": "Medium",
      "practiced": false
    }
  ]
}
`.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return JSON.parse(text);
  } catch (err) {
    console.warn('[aiService] Gemini interview question generation failed, using benchmark fallback:', err.message);
    return generateDeterministicQuestions({ companyTier, role, roundType, experienceSnippets });
  }
};

/**
 * STAR Answer Builder Service
 */
exports.generateSTARAnswer = async ({ question, situation, task, action, result }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const fallbackAnswer = `In my previous role, ${situation || 'our system faced severe scaling bottlenecks during peak transaction hours'}. My responsibility was to ${task || 'lead the architectural refactor and eliminate database locking without downtime'}. I took action by ${action || 'implementing Redis caching, introducing asynchronous queue workers, and tuning SQL connection pools'}. As a result, ${result || 'we decreased p99 response times by 42% and achieved 99.99% uptime with zero transaction dropouts'}.`;

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return {
      success: true,
      polishedAnswer: fallbackAnswer
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an executive interview coach preparing an Indian software engineer for top tech panels.
Synthesize the candidate's STAR inputs into a compelling, concise, and metric-driven behavioral interview response (under 200 words).

Interview Question: "${question}"
Candidate STAR Inputs:
- Situation: ${situation}
- Task: ${task}
- Action: ${action}
- Result: ${result}

Guidelines:
- First-person voice ("I led...", "I resolved...")
- Highlight agency, leadership, engineering depth, and measurable business impact
- Eliminate passive phrasing ("was responsible for")
- Ready to deliver verbally in 90 seconds.
`.trim();

    const aiRes = await model.generateContent(prompt);
    const polished = aiRes.response.text().trim();
    return {
      success: true,
      polishedAnswer: polished || fallbackAnswer
    };
  } catch (err) {
    console.warn('[aiService] Gemini STAR synthesis failed, using fallback:', err.message);
    return {
      success: true,
      polishedAnswer: fallbackAnswer
    };
  }
};

/**
 * Advanced Roadmap Recalibration (90-Day / Milestone Check-in)
 */
exports.recalibrateRoadmapFromAI = async ({ currentRoadmap, completedMilestoneIds = [], userReflection = '' }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const totalMilestones = (currentRoadmap.milestones || []).length || 6;
  const completedCount = completedMilestoneIds.length;
  const completionRatio = completedCount / (totalMilestones || 1);

  const newScore = Math.min(95, Math.round((currentRoadmap.profileScore || 65) + completedCount * 5.5));

  const fallbackResult = {
    profileScore: newScore,
    readinessSummary: `Great progress! With ${completedCount}/${totalMilestones} milestones cleared, you have demonstrated solid technical follow-through. Your profile is now in the top ${Math.max(10, 40 - Math.round(completionRatio * 30))}% of candidate pools for ${currentRoadmap.targetRole}.`,
    recalibrationNote: 'Roadmap dynamically recalibrated to focus on advanced production deployment, scale optimization, and interview readiness.',
    phases: currentRoadmap.phases.map(p => {
      if (p.phaseNumber === 1 && completedCount >= 2) {
        return { ...p, label: `${p.label} (Completed ✓)` };
      }
      return p;
    }),
    nextActions: [
      'Showcase your latest production project on GitHub with a comprehensive README and live demo.',
      'Transition your practice from basic LeetCode into System Design Tradeoffs and concurrency patterns.',
      'Start applying to target companies while continuing Phase 3 & 4 milestones.'
    ]
  };

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return fallbackResult;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const prompt = `
You are an executive engineering mentor in India evaluating a software developer's progress.
The candidate has completed ${completedCount} out of ${totalMilestones} milestones on their roadmap for ${currentRoadmap.targetRole}.
Candidate reflection / notes: "${userReflection || 'Finished core fundamentals and project setup'}"

Analyze their progress and return JSON matching this schema:
{
  "profileScore": number (new score between ${Math.max(newScore - 5, 50)} and 96),
  "readinessSummary": string (encouraging, realistic assessment of their current competitive position in the Indian hiring market),
  "recalibrationNote": string (what changed in their strategy),
  "nextActions": [string, string, string] (top 3 next highest-leverage actions to land the job)
}
`.trim();

    const res = await model.generateContent(prompt);
    const parsed = JSON.parse(res.response.text());

    return {
      profileScore: parsed.profileScore || newScore,
      readinessSummary: parsed.readinessSummary || fallbackResult.readinessSummary,
      recalibrationNote: parsed.recalibrationNote || fallbackResult.recalibrationNote,
      nextActions: parsed.nextActions || fallbackResult.nextActions,
      phases: fallbackResult.phases
    };
  } catch (err) {
    console.warn('[aiService] Recalibration failed, using fallback:', err.message);
    return fallbackResult;
  }
};

/**
 * Interactive Mock Interview Turn (Conversational AI Interviewer)
 */
exports.conductMockInterviewTurn = async ({ role = 'Software Engineer', companyTier = 'Product', roundType = 'Technical Round', history = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const fallbackResponses = [
    "That is a solid foundational approach. Could you elaborate on how you would handle network partition or database failover in this scenario?",
    "Understood. What is the time and space complexity of your solution, and where would the primary memory bottleneck emerge under high concurrency?",
    "Good practical choice. If traffic suddenly increased by 10x during an Indian festival sale, what caching or queueing strategy would prevent cascading service failures?",
    "Let's touch on the behavioral aspect: tell me about a critical technical disagreement you had with a teammate on this design and how you reached consensus."
  ];

  const defaultTurn = {
    role: 'assistant',
    message: fallbackResponses[Math.min(history.length, fallbackResponses.length - 1)],
    isFollowUp: true
  };

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return defaultTurn;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const formattedHistory = (history || []).map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.message}`).join('\n');

    const prompt = `
You are a Principal Engineering Lead conducting a realistic ${roundType} interview at a top ${companyTier} company in India for the role of ${role}.
Candidate and Interviewer conversation history so far:
${formattedHistory}

Your goal:
- Act strictly as the interviewer.
- Provide a brief acknowledgment of the candidate's last answer, then ask ONE sharp, deep follow-up question or probe an edge case (scale, bottlenecks, failure modes, data consistency, or STAR metrics).
- Keep your entire reply under 3-4 sentences. Do NOT output candidate answers. Be conversational, direct, and rigorous.
`.trim();

    const res = await model.generateContent(prompt);
    const reply = res.response.text().trim();

    return {
      role: 'assistant',
      message: reply || defaultTurn.message,
      isFollowUp: true
    };
  } catch (err) {
    console.warn('[aiService] Mock turn generation failed, using fallback:', err.message);
    return defaultTurn;
  }
};

/**
 * Mock Interview Comprehensive Scorecard Evaluator
 */
exports.evaluateMockInterviewSession = async ({ role = 'Software Engineer', companyTier = 'Product', roundType = 'Technical', history = [] }) => {
  const apiKey = process.env.GEMINI_API_KEY;

  const fallbackScorecard = {
    overallScore: 82,
    hiringDecision: 'Hire',
    technicalAccuracy: {
      score: 85,
      feedback: 'Good grasp of architectural patterns, clean separation of concerns, and DB schema design.'
    },
    structureSTAR: {
      score: 80,
      feedback: 'Answers were structured and well-grounded, though could feature more specific quantified outcomes (e.g. latency reduced by X%).'
    },
    communicationClarity: {
      score: 82,
      feedback: 'Articulate responses with proactive explanations of tradeoffs before jumping into implementation.'
    },
    strengths: [
      'Demonstrated concrete system design and failure mode awareness.',
      'Communicated tradeoffs between SQL and NoSQL clearly.',
      'Remained calm and receptive when pressed on edge cases.'
    ],
    improvements: [
      'Always state your assumptions out loud before finalizing API endpoints.',
      'Quantify the business and metric impact of past projects using exact numbers.',
      'Prepare deeper examples for high-concurrency race condition handling.'
    ]
  };

  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    return fallbackScorecard;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: { responseMimeType: 'application/json' }
    });

    const conversationText = history.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.message}`).join('\n');

    const prompt = `
You are the Bar Raiser / Hiring Committee Chair at a top ${companyTier} company in India evaluating an interview for ${role}.
Review the complete candidate interview transcript below:
${conversationText}

Produce an objective hiring scorecard in JSON format matching this schema:
{
  "overallScore": number (0 to 100),
  "hiringDecision": "Strong Hire" | "Hire" | "Leaning Hire" | "No Hire",
  "technicalAccuracy": { "score": number, "feedback": string },
  "structureSTAR": { "score": number, "feedback": string },
  "communicationClarity": { "score": number, "feedback": string },
  "strengths": [string, string, string],
  "improvements": [string, string, string]
}
`.trim();

    const res = await model.generateContent(prompt);
    const scorecard = JSON.parse(res.response.text());
    return scorecard;
  } catch (err) {
    console.warn('[aiService] Mock evaluation failed, using fallback:', err.message);
    return fallbackScorecard;
  }
};


