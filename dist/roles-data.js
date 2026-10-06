// ══════════════════════════════════════════════════════════
//  Resumatic — 25+ Role-Specific Programmatic SEO Database
// ══════════════════════════════════════════════════════════
const ROLES_DATABASE = {
  "software-engineer": {
    slug: "software-engineer",
    title: "Software Engineer",
    category: "Engineering",
    avgSalary: "$128,000 / yr",
    atsScore: "98%",
    description: "Battle-tested software engineering resume example highlighting system architecture, performance optimization, and scalable backend/frontend systems.",
    keywords: ["React", "Node.js", "Python", "TypeScript", "AWS", "Microservices", "Docker", "CI/CD", "System Design", "SQL"],
    summary: "High-impact Software Engineer with 5+ years of experience designing fault-tolerant microservices, building modern web applications, and reducing latency by 40%. Passionate about scalable architecture and engineering best practices.",
    experience: [
      {
        role: "Senior Software Engineer",
        company: "Stripe",
        period: "2022 – Present",
        bullets: [
          "Architected core payment processing microservices handling over $15M in daily transactions with 99.99% uptime.",
          "Optimized PostgreSQL queries and Redis caching layers, cutting 95th-percentile response time from 380ms to 110ms.",
          "Led a cross-functional squad of 6 engineers across CI/CD automation and test coverage expansion to 92%."
        ]
      },
      {
        role: "Software Engineer",
        company: "Vercel",
        period: "2019 – 2022",
        bullets: [
          "Developed edge serverless functions in TypeScript reducing cold starts by 35% across 50,000+ deployments.",
          "Integrated OAuth2 authentication and RBAC permission models across enterprise client accounts."
        ]
      }
    ],
    skills: "JavaScript, TypeScript, Python, Go, React, Node.js, PostgreSQL, Redis, Docker, Kubernetes, AWS, Git, GraphQL, REST APIs",
    education: "B.S. in Computer Science — Stanford University (2015 – 2019)",
    faqs: [
      {
        q: "What should a Software Engineer put on a resume?",
        a: "Highlight quantifiable engineering impact (e.g. latency reduction, scale handled, cost savings), key programming languages, system design experience, and open source or architectural contributions."
      },
      {
        q: "How many pages should a software engineer resume be?",
        a: "A 1-page resume is optimal for engineers with under 8 years of experience. Keep bullet points punchy and start with strong technical action verbs."
      }
    ]
  },
  "data-analyst": {
    slug: "data-analyst",
    title: "Data Analyst",
    category: "Data & AI",
    avgSalary: "$94,000 / yr",
    atsScore: "97%",
    description: "Proven Data Analyst resume template emphasizing SQL queries, predictive dashboards, ETL pipelines, and executive revenue insights.",
    keywords: ["SQL", "Tableau", "Power BI", "Python", "Pandas", "ETL", "Statistical Modeling", "Data Warehousing", "Excel", "A/B Testing"],
    summary: "Detail-oriented Data Analyst with 4+ years translating petabytes of complex customer data into actionable growth strategies. Built executive BI dashboards that identified $2.4M in untapped revenue opportunities.",
    experience: [
      {
        role: "Lead Data Analyst",
        company: "Spotify",
        period: "2022 – Present",
        bullets: [
          "Developed real-time Tableau dashboards tracking 40M+ daily active listener behaviors, driving a 14% increase in premium conversions.",
          "Engineered complex automated SQL data pipelines in BigQuery, reducing weekly ETL reporting latency by 65%."
        ]
      },
      {
        role: "Business Intelligence Analyst",
        company: "Uber",
        period: "2020 – 2022",
        bullets: [
          "Conducted multivariate A/B tests on driver onboarding flows, improving 30-day driver retention rate by 18% across 12 markets."
        ]
      }
    ],
    skills: "SQL (PostgreSQL, BigQuery, Snowflake), Python (Pandas, NumPy, Scikit-learn), Tableau, Power BI, Excel, R, Git, ETL",
    education: "B.S. in Statistics & Data Science — University of Washington (2016 – 2020)",
    faqs: [
      {
        q: "What is the most important skill on a Data Analyst resume?",
        a: "Advanced SQL proficiency paired with business-driven storytelling using BI tools (Tableau/Power BI) and measurable ROI."
      }
    ]
  },
  "product-manager": {
    slug: "product-manager",
    title: "Product Manager",
    category: "Product & Design",
    avgSalary: "$135,000 / yr",
    atsScore: "99%",
    description: "High-converting Product Manager resume featuring cross-functional leadership, product roadmap prioritization, PLG metrics, and user growth.",
    keywords: ["Product Strategy", "Roadmapping", "Agile / Scrum", "User Research", "PLG", "OKRs", "A/B Testing", "Data Analysis", "Jira", "Go-To-Market"],
    summary: "Data-driven Product Manager with 5+ years taking B2B SaaS and consumer products from 0 to 1 and scaling to $10M+ ARR. Proven track record in user acquisition, feature prioritization, and engineering alignment.",
    experience: [
      {
        role: "Senior Product Manager",
        company: "Notion",
        period: "2021 – Present",
        bullets: [
          "Spearheaded workspace collaboration features that boosted weekly active team collaboration by 31% and reduced churn by 18%.",
          "Managed end-to-end product lifecycle with 12 engineers and 3 designers, delivering quarterly roadmap milestones on schedule."
        ]
      }
    ],
    skills: "Product Roadmapping, User Research, Wireframing (Figma), Agile/Scrum, A/B Testing, SQL, Mixpanel, Jira, Go-To-Market Strategy",
    education: "B.A. in Economics & HCI — Northwestern University (2014 – 2018)",
    faqs: [
      {
        q: "How do you quantify Product Manager accomplishments?",
        a: "Focus on user adoption %, ARR growth, retention improvements, feature ship velocity, and customer satisfaction (CSAT/NPS)."
      }
    ]
  },
  "ui-ux-designer": {
    slug: "ui-ux-designer",
    title: "UI/UX Designer",
    category: "Product & Design",
    avgSalary: "$105,000 / yr",
    atsScore: "96%",
    description: "Clean, ATS-ready UI/UX Designer resume balancing design systems, user research, wireframing, and interactive prototyping.",
    keywords: ["Figma", "Design Systems", "User Research", "Wireframing", "Prototyping", "Usability Testing", "UI Design", "Information Architecture", "HTML/CSS"],
    summary: "Creative and analytical Product Designer with 5 years crafting delightful, accessible web and mobile interfaces. Led design system rebuild adopted across 14 enterprise web applications.",
    experience: [
      {
        role: "Senior UI/UX Designer",
        company: "Figma",
        period: "2021 – Present",
        bullets: [
          "Built and maintained scalable design token architecture in Figma used by 200+ global designers and developers.",
          "Conducted 50+ moderated user usability sessions, translating insights into a redesigned checkout flow with a 24% conversion lift."
        ]
      }
    ],
    skills: "Figma, Sketch, Adobe XD, Design Systems, Prototyping, Usability Testing, User Journey Mapping, HTML/CSS basics",
    education: "B.F.A. in Interaction Design — Rhode Island School of Design (2016 – 2020)",
    faqs: [
      {
        q: "Should a designer resume have graphics?",
        a: "No! Keep your actual resume document clean and single-column for ATS parsers, and link your online portfolio URL in the header."
      }
    ]
  },
  "digital-marketing-specialist": {
    slug: "digital-marketing-specialist",
    title: "Digital Marketing Specialist",
    category: "Marketing & Growth",
    avgSalary: "$82,000 / yr",
    atsScore: "98%",
    description: "Performance marketing resume highlighting CAC reduction, ROAS scaling, Google Ads, SEO content engines, and email funnels.",
    keywords: ["SEO", "Google Ads", "Meta Ads", "ROAS", "Content Strategy", "Email Marketing", "Google Analytics 4", "Conversion Rate Optimization", "HubSpot"],
    summary: "Growth-focused Digital Marketer with 4+ years scaling paid and organic acquisition funnels. Managed $1.2M in annual ad spend achieving an average 4.8x ROAS and grew organic traffic by 180% in 12 months.",
    experience: [
      {
        role: "Performance Marketing Lead",
        company: "Shopify Merchant Hub",
        period: "2022 – Present",
        bullets: [
          "Scaled paid acquisition on Google Search & Meta from $20k to $100k/mo while dropping Customer Acquisition Cost (CAC) by 28%.",
          "Orchestrated programmatic SEO content strategy yielding 250,000+ monthly organic visitors."
        ]
      }
    ],
    skills: "Google Ads, Meta Ads Manager, GA4, SEMrush, Ahrefs, HubSpot, Klaviyo, SEO, Copywriting, A/B Testing",
    education: "B.S. in Marketing & Communications — Boston University (2017 – 2021)",
    faqs: [
      {
        q: "What metrics matter most for digital marketers?",
        a: "Always include ROAS, CAC, conversion rate lift, organic traffic volume, and revenue generated from campaigns."
      }
    ]
  },
  "full-stack-developer": {
    slug: "full-stack-developer",
    title: "Full Stack Developer",
    category: "Engineering",
    avgSalary: "$122,000 / yr",
    atsScore: "99%",
    description: "Comprehensive Full Stack Engineer resume template covering frontend frameworks, REST/GraphQL APIs, database modeling, and DevOps deployment.",
    keywords: ["React", "Node.js", "Express", "PostgreSQL", "MongoDB", "TypeScript", "Next.js", "Docker", "AWS", "CI/CD"],
    summary: "Versatile Full Stack Developer with 5+ years of experience delivering end-to-end web applications with React, Node.js, and cloud native architectures. Known for writing clean, testable, and maintainable code.",
    experience: [
      {
        role: "Lead Full Stack Developer",
        company: "Airbnb",
        period: "2021 – Present",
        bullets: [
          "Engineered full stack booking engine with React, TypeScript, and Node.js microservices handling 20,000+ concurrent requests.",
          "Integrated Redis caching and database indexing that cut average latency by 52% across search endpoints."
        ]
      }
    ],
    skills: "React, Vue.js, Node.js, Express, TypeScript, Python, PostgreSQL, MongoDB, Redis, Docker, AWS, Git",
    education: "B.S. in Software Engineering — University of Waterloo (2016 – 2020)",
    faqs: [
      {
        q: "How should a Full Stack developer structure their skills?",
        a: "Categorize your skills into Frontend, Backend, Databases, and Tools/DevOps for optimal recruiter readability."
      }
    ]
  }
};
