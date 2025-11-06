# NEXC Application Testing & Enhancement Work Plan

## Project Overview
**Company**: NEXC Ltd (Next in Construction)
**Company Number**: 16239395
**Registered Office**: 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ
**Project Start**: 2021 (Original CSL platform)
**Rebranding**: 2024-2025 (CSL → NEXC)
**Current Status**: Development & Testing Phase

---

## CRITICAL: Branding Consistency Update (Priority 1) 🚨

### Status: IN PROGRESS
**Objective**: Complete rebrand from CSL (Construction Safety Line) to NEXC (Next in Construction)

### Files Requiring Branding Updates:

#### ✅ COMPLETED
- [x] Logo components
- [x] Theme configuration  
- [x] Email templates (email.service.js)
- [x] Dashboard welcome messages
- [x] About page content
- [x] Landing pages

#### 🔄 IN PROGRESS
- [ ] `/public/index.html` - Update title, meta description, keywords
- [ ] `/build/manifest.json` - Update app name and short name
- [ ] `/src/pages/TermsCondition.js` - Update page title
- [ ] `/src/pages/PrivacyPolicy.js` - Verify company details
- [ ] `/src/layouts/LogoOnlyLayout.js` - Verify copyright year (2010-2025)
- [ ] `/src/components/_external-pages/landing/` - Check for hardcoded CSL refs
- [ ] `/src/components/_external-pages/about/` - Verify all company references

#### ⏳ PENDING REVIEW
- [ ] Database content (company references in stored data)
- [ ] Email template strings
- [ ] PDF generation templates
- [ ] Invoice templates
- [ ] Legal documents

### Company Information Reference:
```
<userPrompt>
Provide the fully rewritten file, incorporating the suggested code change. You must produce the complete file.
</userPrompt>
