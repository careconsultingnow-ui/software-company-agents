# LendTrack | Production Deployment & Hosting Guide

**Application:** LendTrack - Loan Management System for Private Quick Lending Agencies  
**Bundle Version:** v1.0.0  
**Build Artifact:** `lendtrack-web-deploy-bundle/dist`

---

## Deployment Option 1: Cloudflare Pages (Recommended - 100% Free & Global Edge)

Because this application is a modern, client-side, zero-latency Single Page Application with persistent LocalStorage, hosting it on Cloudflare Pages provides instant load times for lenders in Belize and the Caribbean with zero monthly infrastructure cost.

### Method A: Direct CLI Deployment
If you have Wrangler / Cloudflare CLI installed:
```powershell
cd lendtrack-web-deploy-bundle
npx.cmd -y wrangler pages deploy ./dist --project-name=lendtrack-demo
```

### Method B: Cloudflare Dashboard (Drag & Drop)
1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/) $\rightarrow$ **Workers & Pages**.
2. Click **Create Application** $\rightarrow$ **Pages** $\rightarrow$ **Upload Assets**.
3. Name your project `lendtrack-demo`.
4. Drag and drop the `dist/` folder from this deployment bundle.
5. Click **Deploy Site**. Your live URL will be active immediately (e.g. `https://lendtrack-demo.pages.dev`).

---

## Deployment Option 2: Vercel / Netlify

### Vercel CLI:
```powershell
cd lendtrack-web-deploy-bundle/dist
npx.cmd -y vercel --prod
```

### Netlify Drop:
1. Go to [Netlify Drop](https://app.netlify.com/drop).
2. Drag and drop the `dist/` folder.
3. Your site is instantly live with a free custom subdomain.

---

## Deployment Option 3: Local Offline / On-Premise (In-Office Quick Loan Shops)

For lending agencies with spotty internet or private offices:
1. Double-click `start-local-demo.bat` inside this folder.
2. The launcher automatically detects Python or Node, starts an HTTP server on port 4173, and launches your default browser directly to `http://localhost:4173`.
3. All borrower profiles, repayments, and print receipts work 100% offline with zero external dependencies.

---

## Sales Demo Assets Included in this Bundle

- **`dist/`**: Pre-built, optimized, and minified production web application.
- **`sample-borrowers-import.csv`**: A pre-formatted test CSV containing 5 Belizean borrowers ready for the 1-click migration demo.
- **`start-local-demo.bat`**: Instant offline Windows demo launcher.
- **`wrangler.toml`**: Cloudflare Pages configuration.
