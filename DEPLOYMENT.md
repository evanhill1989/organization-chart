# Deployment Guide

This guide ensures clean, issue-free deployments to Vercel.

## Quick Pre-Deployment Check

Before pushing to Vercel, run the following command to verify your code is ready:

```bash
npm run deploy:check
```

This single command runs all necessary checks:
1. **TypeScript type checking** - Catches type errors
2. **ESLint** - Ensures code quality standards
3. **Production build** - Verifies the app builds successfully

## Manual Step-by-Step Process

If you prefer to run checks individually:

### 1. TypeScript Type Check
```bash
npm run typecheck
```
**What it checks:** Validates all TypeScript types without emitting files
**What to do if it fails:** Fix type errors reported in the output

### 2. Lint Check
```bash
npm run lint
```
**What it checks:** Code quality, unused variables, and style issues
**What to do if it fails:** Fix ESLint errors reported in the output

### 3. Production Build
```bash
npm run build
```
**What it checks:** Whether the app builds successfully for production
**What to do if it fails:** Review build errors and fix any import issues or compilation errors

### 4. Test Locally (Optional)
```bash
npm run start
```
After building, you can test the production build locally to ensure everything works as expected.

## Environment Variables

Ensure these environment variables are set in Vercel:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `DATABASE_URL` - PostgreSQL connection string (if needed)

## Deployment Checklist

Before deploying:
- [ ] Run `npm run deploy:check` and ensure all checks pass
- [ ] Verify environment variables are set in Vercel dashboard
- [ ] Check that `.env.local` secrets are NOT committed to git
- [ ] Review recent commits for any sensitive data
- [ ] Test the app locally with production build (`npm run start`)
- [ ] Commit and push to GitHub
- [ ] Verify Vercel deployment succeeds
- [ ] Test the live site after deployment

## Common Issues and Solutions

### TypeScript Errors
**Issue:** Type errors in auto-generated files
**Solution:** Run `npm run typegen` to regenerate React Router types

### Linting Errors
**Issue:** Unused variables or imports
**Solution:** Remove unused code or add `// eslint-disable-next-line` comment if intentional

### Build Failures
**Issue:** Import errors or missing dependencies
**Solution:** Check that all imports are correct and run `npm install` to ensure dependencies are installed

### Environment Variable Issues
**Issue:** App fails to connect to Supabase
**Solution:** Verify that `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly in Vercel

## Ignored Folders

The following folders are automatically ignored by ESLint:
- `dist/` - Vite build output (for library mode)
- `build/` - React Router build output
- `.react-router/` - Auto-generated type files

## Vercel Configuration

This project uses the default Vercel settings for React Router apps:
- **Framework Preset:** React Router
- **Build Command:** `npm run build`
- **Output Directory:** `build/client` (auto-detected)
- **Install Command:** `npm install`

## Git Workflow

Recommended workflow for deployment:

```bash
# 1. Make your changes
# 2. Run pre-deployment checks
npm run deploy:check

# 3. If all checks pass, commit and push
git add .
git commit -m "Your commit message"
git push origin main

# 4. Vercel will automatically deploy
```

## Rollback Strategy

If a deployment has issues:
1. Go to Vercel dashboard
2. Find the previous working deployment
3. Click "Promote to Production"
4. Fix issues locally and redeploy

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [React Router Deployment Guide](https://reactrouter.com/en/main/guides/deployment)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/environment-variables)
