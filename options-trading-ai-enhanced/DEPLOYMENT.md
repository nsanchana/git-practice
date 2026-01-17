# Deploying Unicron to Vercel

This guide will walk you through deploying your Unicron Options Trading AI application to Vercel for multi-device access.

## Prerequisites

Before deploying, ensure you have:
- A [Vercel account](https://vercel.com/signup) (free tier works fine)
- A [GitHub account](https://github.com/signup)
- Your Anthropic API key from [console.anthropic.com](https://console.anthropic.com/)
- Git installed on your machine

## Step 1: Prepare Your Repository

### 1.1 Initialize Git Repository (if not already done)

```bash
cd /Users/nareshsanchana/git-practice/options-trading-ai-enhanced
git init
git add .
git commit -m "Initial commit - Unicron Options Trading AI"
```

### 1.2 Create GitHub Repository

1. Go to [github.com/new](https://github.com/new)
2. Create a new repository named `unicron-options-trading`
3. Don't initialize with README (we already have files)
4. Click "Create repository"

### 1.3 Push to GitHub

```bash
git remote add origin https://github.com/nsanchana/unicron-options-trading.git
git branch -M main
git push -u origin main
```

## Step 2: Install Vercel CLI (Optional)

You can deploy via Vercel's web interface or CLI. For CLI deployment:

```bash
npm install -g vercel
vercel login
```

## Step 3: Configure Environment Variables

Before deploying, you need to set up environment variables in Vercel.

### Required Environment Variables:

1. **ANTHROPIC_API_KEY** - Your Claude API key for AI analysis
2. **SESSION_SECRET** - A random string for session encryption
3. **FRONTEND_URL** - Your Vercel app URL (e.g., `https://your-app.vercel.app`)
4. **NODE_ENV** - Set to `production`

### Generate a Session Secret

Run this command to generate a secure random secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output - you'll need it for Vercel.

## Step 4: Deploy to Vercel

### Option A: Deploy via Vercel Web Interface (Recommended)

1. **Go to [vercel.com](https://vercel.com/) and sign in**

2. **Click "Add New..." → "Project"**

3. **Import your GitHub repository:**
   - Click "Import" next to your `unicorn-options-trading` repository
   - If you don't see it, click "Adjust GitHub App Permissions"

4. **Configure Project:**
   - **Framework Preset:** Vite
   - **Root Directory:** `./` (leave as default)
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

5. **Add Environment Variables:**

   Click "Environment Variables" and add:

   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-api03-...` (your API key) |
   | `SESSION_SECRET` | (paste the random secret you generated) |
   | `NODE_ENV` | `production` |
   | `FRONTEND_URL` | Leave blank for now, we'll update after first deploy |

6. **Click "Deploy"**

   Vercel will build and deploy your application. This takes 2-3 minutes.

7. **Update FRONTEND_URL:**
   - Once deployed, copy your app URL (e.g., `https://unicorn-options-trading.vercel.app`)
   - Go to "Settings" → "Environment Variables"
   - Edit `FRONTEND_URL` and set it to your app URL
   - Click "Save"
   - Redeploy by going to "Deployments" → click the "..." menu → "Redeploy"

### Option B: Deploy via CLI

```bash
cd /Users/nareshsanchana/git-practice/options-trading-ai-enhanced
vercel
```

Follow the prompts:
- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name? **unicorn-options-trading**
- In which directory? **./`** (press Enter)
- Override settings? **N**

After deployment, add environment variables:

```bash
vercel env add ANTHROPIC_API_KEY
# Paste your API key when prompted

vercel env add SESSION_SECRET
# Paste your generated secret

vercel env add NODE_ENV
# Type: production

vercel env add FRONTEND_URL
# Type your Vercel app URL
```

Then redeploy:

```bash
vercel --prod
```

## Step 5: Create Your First User

1. **Visit your deployed app URL** (e.g., `https://unicorn-options-trading.vercel.app`)

2. **Click "Register"** on the login page

3. **Create your account:**
   - Username: Choose a username
   - Password: Choose a strong password
   - Email: (optional)

4. **Click "Register"**

You're now logged in and can access Unicron from any device!

## Step 6: Verify Everything Works

Test the following features:

- ✅ **Login/Logout** - Log out and log back in
- ✅ **Company Research** - Search for a company (e.g., AAPL)
- ✅ **AI Analysis** - Verify sections show AI-generated insights (not generic templates)
- ✅ **Trade Review** - Add a trade and verify it appears in Dashboard
- ✅ **Settings** - Update your portfolio settings
- ✅ **Export** - Export research or trade data to CSV

## Production Configuration

### Database Considerations

**Current Setup:** SQLite database stored in `/tmp` directory on Vercel

**Limitations:**
- SQLite files in `/tmp` are ephemeral on Vercel serverless functions
- User accounts may be lost between deployments
- This is fine for personal use with 1-2 users

**For Production Use:**

If you need persistent user accounts, consider upgrading to a hosted database:

1. **PostgreSQL on Vercel Postgres** (Recommended)
   - Free tier available
   - Fully managed
   - [Vercel Postgres Setup](https://vercel.com/docs/storage/vercel-postgres)

2. **Supabase** (Alternative)
   - Free tier generous
   - PostgreSQL + Authentication built-in
   - [Supabase Setup](https://supabase.com/docs)

To migrate from SQLite to PostgreSQL, you'll need to:
- Update `auth.js` database dialect from `sqlite` to `postgres`
- Add database connection URL to environment variables
- Redeploy

### Security Best Practices

1. **Use Strong Session Secret**
   - Never commit session secret to git
   - Generate a new random secret for production

2. **Enable HTTPS Only**
   - Vercel provides this automatically
   - Cookies are set with `secure: true` in production

3. **API Key Protection**
   - API key is only used server-side
   - Never exposed to frontend
   - Stored securely in Vercel environment variables

4. **Regular Updates**
   - Keep dependencies updated: `npm update`
   - Monitor security advisories

## Troubleshooting

### "Invalid API key" Error

**Problem:** AI analysis shows fallback text instead of Claude insights

**Solution:**
1. Go to Vercel → Settings → Environment Variables
2. Verify `ANTHROPIC_API_KEY` is set correctly
3. Check it starts with `sk-ant-`
4. Redeploy the application

### "Unauthorized" on API Calls

**Problem:** Can't perform actions after logging in

**Solution:**
1. Verify `FRONTEND_URL` matches your actual Vercel URL exactly
2. Check browser console for CORS errors
3. Clear browser cookies and log in again
4. Redeploy if environment variables were changed

### "Session expired" Immediately After Login

**Problem:** Can't stay logged in

**Solution:**
1. Verify `SESSION_SECRET` environment variable is set
2. Make sure cookies are enabled in your browser
3. Check that `FRONTEND_URL` doesn't have trailing slash

### Database/Users Reset After Deployment

**Problem:** Users disappear after redeployment

**Explanation:** SQLite database is stored in `/tmp` which is ephemeral on Vercel

**Solutions:**
- **For personal use:** Just re-register after deployments (infrequent)
- **For production:** Migrate to PostgreSQL (see "Database Considerations" above)

### Build Failures

**Problem:** Deployment fails during build

**Common causes:**
1. Missing dependencies - run `npm install` locally first
2. TypeScript errors - check build with `npm run build` locally
3. Environment variables not set

**Solution:**
- Check build logs in Vercel dashboard
- Test build locally: `npm run build`
- Ensure all dependencies are in `package.json`

## Updating Your Deployment

### Automatic Deployments (Recommended)

Any push to your `main` branch triggers automatic deployment:

```bash
git add .
git commit -m "Update feature X"
git push origin main
```

Vercel will automatically build and deploy the changes.

### Manual Redeployment

Via Vercel Dashboard:
1. Go to "Deployments"
2. Click "..." menu on latest deployment
3. Click "Redeploy"

Via CLI:
```bash
vercel --prod
```

## Custom Domain (Optional)

To use your own domain (e.g., `unicron.yourdomain.com`):

1. Go to Vercel → Settings → Domains
2. Click "Add Domain"
3. Enter your domain name
4. Follow DNS configuration instructions
5. Update `FRONTEND_URL` environment variable to your custom domain
6. Redeploy

## Monitoring and Analytics

### View Application Logs

**Via Vercel Dashboard:**
1. Go to your project
2. Click "Logs" tab
3. Filter by function (server.js) or deployment

**Via CLI:**
```bash
vercel logs
```

### Monitor API Usage

**Anthropic API Usage:**
- Visit [console.anthropic.com](https://console.anthropic.com/)
- Check "Usage" section for token consumption
- Set up billing alerts if needed

### Vercel Analytics (Optional)

Enable Web Analytics in Vercel dashboard for:
- Page views
- User sessions
- Performance metrics

## Cost Considerations

### Vercel Hosting
- **Hobby Plan:** Free
  - 100GB bandwidth/month
  - Unlimited deployments
  - Sufficient for personal use

### Anthropic API
- **Claude 3.5 Sonnet:**
  - Input: ~$3 per 1M tokens
  - Output: ~$15 per 1M tokens
  - Typical usage: ~$0.50/day for 5-10 researches
  - ~$15/month for regular use

### Database (if upgraded)
- **SQLite (current):** Free (but ephemeral on Vercel)
- **Vercel Postgres:** Free tier available (5GB storage)
- **Supabase:** Free tier available (500MB database, 2GB bandwidth)

## Support Resources

- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **Anthropic Documentation:** [docs.anthropic.com](https://docs.anthropic.com)
- **Anthropic Status:** [status.anthropic.com](https://status.anthropic.com)

## Next Steps

After successful deployment:

1. ✅ **Bookmark your app URL** for easy access
2. ✅ **Add app to phone home screen** for mobile access
3. ✅ **Test from different devices** to verify cross-device functionality
4. ✅ **Set up browser notifications** (if you enable PWA features)
5. ✅ **Review your first AI-generated research** to ensure quality
6. ✅ **Consider upgrading to PostgreSQL** if you need persistent user accounts

Congratulations! Your Unicron Options Trading AI is now live and accessible from anywhere! 🎉
