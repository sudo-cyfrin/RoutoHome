# Vercel Deployment Guide

## Environment Variables

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following environment variable:
   - **Name**: `VITE_GEMINI_API_KEY`
   - **Value**: Your Google Gemini API key

## Important Notes

- Environment variables in Vite must be prefixed with `VITE_` to be accessible in the browser
- The `.env` file is for local development only
- Never commit your actual API key to version control
- Make sure your API key has the correct permissions for Google GenAI

## Troubleshooting

If the app works locally but not on Vercel:

1. **Check Environment Variables**: Ensure `VITE_GEMINI_API_KEY` is set in Vercel dashboard
2. **Check Build Logs**: Look for any errors during the build process
3. **Check Console**: Open browser dev tools on your deployed site to check for JavaScript errors
4. **API Key Validity**: Ensure your Gemini API key is valid and has the correct permissions

## Local Development

Copy `.env.example` to `.env` and add your API key:
```bash
cp .env.example .env
# Edit .env with your actual API key
```
