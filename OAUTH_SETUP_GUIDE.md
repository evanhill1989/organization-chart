# OAuth Setup Guide
## Google and GitHub Authentication for Supabase

This guide walks you through setting up Google and GitHub OAuth providers for your Organization Chart app.

---

## Prerequisites

- Supabase project set up
- Access to your Supabase dashboard
- Google account (for Google OAuth)
- GitHub account (for GitHub OAuth)

---

## Part 1: Configure Google OAuth

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - Choose **External** user type
   - Fill in app name (e.g., "Organization Chart")
   - Add your email as developer contact
   - Save and continue through the scopes and test users sections

### Step 2: Configure OAuth Client ID

1. Application type: **Web application**
2. Name: "Organization Chart Web Client" (or any name)
3. **Authorized JavaScript origins:**
   - `http://localhost:5173` (development)
   - Your production URL (e.g., `https://yourapp.com`)
4. **Authorized redirect URIs** - Add these:
   - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
   - (Replace `YOUR_SUPABASE_PROJECT_REF` with your actual Supabase project reference)

   **How to find your Supabase project reference:**
   - Go to your Supabase dashboard
   - Look at the URL: `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`
   - Or go to **Settings** → **API** and look at the Project URL

5. Click **Create**
6. **SAVE** the `Client ID` and `Client Secret` - you'll need these next

### Step 3: Add Google Credentials to Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** in the list
4. Toggle it **ON**
5. Paste your Google **Client ID**
6. Paste your Google **Client Secret**
7. Click **Save**

---

## Part 2: Configure GitHub OAuth

### Step 1: Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/profile)
2. Scroll down and click **Developer settings** (in left sidebar)
3. Click **OAuth Apps**
4. Click **New OAuth App**

### Step 2: Configure OAuth App

1. **Application name:** "Organization Chart" (or any name)
2. **Homepage URL:**
   - Development: `http://localhost:5173`
   - Production: `https://yourapp.com`
3. **Authorization callback URL:**
   - `https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback`
   - (Same as Google - replace with your Supabase project ref)
4. Click **Register application**

### Step 3: Generate Client Secret

1. After creating the app, you'll see the **Client ID** - copy it
2. Click **Generate a new client secret**
3. **SAVE** the secret immediately - GitHub only shows it once!

### Step 4: Add GitHub Credentials to Supabase

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **GitHub** in the list
4. Toggle it **ON**
5. Paste your GitHub **Client ID**
6. Paste your GitHub **Client Secret**
7. Click **Save**

---

## Part 3: Verify Setup

### Test OAuth Flow

1. Start your dev server: `npm run dev`
2. Navigate to `/login`
3. Click **Google** or **GitHub** button
4. You should be redirected to the provider's auth page
5. After authorizing, you should be redirected back to `/org-chart`

### Troubleshooting

**Error: "redirect_uri_mismatch"**
- Double-check your authorized redirect URIs in Google/GitHub settings
- Make sure they exactly match: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
- No trailing slashes

**Error: "Invalid credentials"**
- Verify you copied the Client ID and Secret correctly
- Make sure there are no extra spaces
- Try regenerating the credentials

**OAuth works but then redirects to login**
- Check browser console for errors
- Verify AuthContext is properly initialized
- Check that ProtectedRoute is working

**Users created via OAuth don't see data**
- This is expected! OAuth creates new users
- Your existing data is tied to your email/password user account
- You'll need to sign in with the original email/password account to see your data
- Or you can manually update the `org_nodes` table to assign data to the OAuth user's UUID

---

## Notes

- **Development vs Production:** Remember to update redirect URIs when deploying
- **Security:** Never commit OAuth secrets to version control
- **Testing:** OAuth providers often require HTTPS in production (localhost HTTP is fine for dev)
- **User Accounts:** Each OAuth provider creates a separate user account, even with the same email

---

## Next Steps

After OAuth is configured:
1. Test the login flow with both providers
2. Verify users are created in Supabase Auth
3. Continue with the data layer updates to filter by user_id
