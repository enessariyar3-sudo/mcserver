# Cloudflare Pages Deployment Guide

This guide will help you deploy your Minecraft server website to Cloudflare Pages.

## Prerequisites

- A Cloudflare account (free tier works)
- Your project code on GitHub
- Supabase project set up and configured

## Step 1: Prepare Your Repository

1. Make sure your code is pushed to a GitHub repository
2. Ensure all environment variables are NOT committed to the repo
3. Your `.gitignore` should include `.env` file

## Step 2: Connect to Cloudflare Pages

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Go to **Pages** in the left sidebar
3. Click **Create a project**
4. Click **Connect to Git**
5. Authorize Cloudflare to access your GitHub account
6. Select your repository

## Step 3: Configure Build Settings

Use these settings:

- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave as default)
- **Node version**: `18` or higher

## Step 4: Add Environment Variables

Add the following environment variables in Cloudflare Pages settings:

```
VITE_SUPABASE_URL=https://bxhnxfwrumeqvnpwymin.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4aG54ZndydW1lcXZucHd5bWluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NDI5MDUsImV4cCI6MjA2OTAxODkwNX0.YXWu3lJQkUfo7PLe1NlYy3yTMIUH4SWS_bHcwpG_na0
VITE_SUPABASE_PROJECT_ID=bxhnxfwrumeqvnpwymin
```

To add environment variables:
1. Go to your project in Cloudflare Pages
2. Click **Settings** tab
3. Scroll to **Environment variables**
4. Click **Add variable**
5. Add each variable for both **Production** and **Preview** environments

## Step 5: Deploy

1. Click **Save and Deploy**
2. Cloudflare will start building your project
3. Wait for the build to complete (usually 2-5 minutes)
4. Once deployed, you'll get a URL like `your-project.pages.dev`

## Step 6: Configure Custom Domain (Optional)

1. In your Cloudflare Pages project, go to **Custom domains**
2. Click **Set up a custom domain**
3. Enter your domain name (e.g., `indusnetwork.com`)
4. Follow the DNS configuration instructions
5. Wait for DNS propagation (can take up to 24 hours)

## Step 7: Configure Supabase for Production

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **URL Configuration**
3. Add your Cloudflare Pages URL to **Site URL**
4. Add `https://your-domain.pages.dev/*` to **Redirect URLs**
5. If using custom domain, add that too

## Step 8: Test Your Deployment

1. Visit your deployed URL
2. Test authentication (login/signup)
3. Test payment gateway connections
4. Verify all features work correctly

## Continuous Deployment

Cloudflare Pages automatically redeploys your site when you push to your GitHub repository:

- Pushes to `main` branch → Production deployment
- Pushes to other branches → Preview deployments

## Troubleshooting

### Build Fails

- Check the build logs in Cloudflare dashboard
- Ensure all dependencies are in `package.json`
- Verify Node version compatibility

### Environment Variables Not Working

- Make sure variables start with `VITE_` prefix
- Check they're added to both Production and Preview
- Redeploy after adding variables

### 404 Errors on Refresh

Add a `_redirects` file in your `public` folder:
```
/* /index.html 200
```

This is already included in the project.

### CORS Errors

- Verify Supabase URL configuration
- Check that all API endpoints are correctly configured
- Ensure Cloudflare Pages URL is in Supabase allowed origins

## Performance Optimization

Cloudflare Pages automatically provides:
- ✅ Global CDN
- ✅ Automatic HTTPS
- ✅ DDoS protection
- ✅ Unlimited bandwidth (free tier)
- ✅ Fast builds and deployments

## Monitoring

Monitor your deployment:
1. **Analytics**: Cloudflare Dashboard > Pages > Your Project > Analytics
2. **Build logs**: Available in deployment history
3. **Real-time logs**: Use Cloudflare Workers if needed

## Cost

- Cloudflare Pages free tier includes:
  - Unlimited sites
  - Unlimited requests
  - Unlimited bandwidth
  - 500 builds/month
  - 1 build at a time

## Support

- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare Community](https://community.cloudflare.com/)
- [Supabase Documentation](https://supabase.com/docs)

## Security Checklist

- ✅ Environment variables are not in the code
- ✅ Supabase RLS policies are enabled
- ✅ API keys are stored as secrets
- ✅ HTTPS is enforced
- ✅ CORS is properly configured
- ✅ Rate limiting is configured in Supabase

## Next Steps

After deployment:
1. Set up monitoring and alerts
2. Configure backup strategy for database
3. Add Terms & Conditions page
4. Set up email notifications
5. Configure payment webhooks
6. Add analytics tracking
