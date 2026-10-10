# Integration Specification: Category Schema & SEO Alignment

**To**: Taqnik CMS Engineering & Product Team  
**From**: CareerForge AI Engineering Team  
**Date**: October 2026  
**Subject**: Required Category Taxonomy for CareerForge Blog Integration  

---

## 1. Context & Requirement

CareerForge's content architecture (`careernest.taqnik.in/blog.html`) is structured around **5 core career and job-search SEO pillars**:

1. **`ATS Secrets`** — Content covering Applicant Tracking Systems, parsing algorithms, and keyword scoring.
2. **`Resume Writing`** — Guides on bullet point formulas, power verbs, and resume formatting.
3. **`Cover Letters`** — Strategies for tailored cover letters and outreach frameworks.
4. **`Interview Prep`** — Behavioral frameworks (STAR method), technical and system design interview tactics.
5. **`Career Growth`** — Salary negotiation, career roadmaps, and promotion strategies.

In the initial integration guide, the `category` field was specified with generic SaaS values (`Tutorials`, `Explainers`, `Best Practices`, `Products Review`, `Products Comparison`). 

To ensure articles align with CareerForge's user navigation, frontend filter tabs, and Google search indexing (`schema.org/BlogPosting` and `schema.org/BreadcrumbList`), **Taqnik CMS must publish articles using CareerForge's 5 domain-specific categories.**

---

## 2. Required Changes in Taqnik CMS

### A. Update CMS Category Configuration (`src/cms.config.ts`)
Configure the category selector in the Taqnik CMS admin dashboard for the CareerForge workspace/tenant:

```typescript
// src/cms.config.ts (or tenant taxonomy config)
export const CAREERFORGE_CATEGORIES = [
  "ATS Secrets",
  "Resume Writing",
  "Cover Letters",
  "Interview Prep",
  "Career Growth",
] as const;

export type CareerForgeCategory = typeof CAREERFORGE_CATEGORIES[number];
```

### B. Update OpenAPI Spec (`docs/openapi.yaml`)
Update the `category` enum in `PublishBlogPostRequest`:

```yaml
category:
  type: string
  description: CareerForge SEO pillar category
  enum:
    - ATS Secrets
    - Resume Writing
    - Cover Letters
    - Interview Prep
    - Career Growth
```

---

## 3. Updated Webhook Payload Example

When an article is published from Taqnik CMS to `POST /api/blog/publish`, the `category` field should strictly match one of the 5 values:

```json
{
  "id": "how-to-beat-ats-in-2026",
  "title": "How to Beat Applicant Tracking Systems in 2026",
  "excerpt": "A concise summary of how modern AI parsers evaluate resumes.",
  "content": "## Introduction\n\nYour resume is your first impression...",
  "image": "https://images.unsplash.com/photo-example?w=800",
  "category": "ATS Secrets",
  "publishDate": "October 8, 2026",
  "readTime": "6 min read",
  "author_name": "Elena Rostova",
  "author_role": "Head of Career Intelligence",
  "author_avatar": "https://images.unsplash.com/photo-avatar?w=150",
  "tags": ["ATS", "Resume", "Job Search"],
  "published": true
}
```

---

## 4. Endpoint Compatibility

CareerForge's ingestion endpoint (`POST /api/blog/publish`) is currently live and ready to accept posts containing these categories immediately.

If you have any questions or need to review the updated OpenAPI spec, our interactive Swagger documentation is live at `/api/docs`.
