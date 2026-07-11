# Cloud Auto Update

This project should not expose the YouTube Data API key in browser JavaScript. For a deployed site, use a cloud scheduled job.

## Recommended Setup

Use GitHub Actions to update the static site once per day and upload it to Supabase Storage:

1. Push this project to a GitHub repository.
2. Open the repository on GitHub.
3. Go to `Settings -> Secrets and variables -> Actions`.
4. Add these repository secrets:

```txt
YOUTUBE_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

5. Use your YouTube Data API key for `YOUTUBE_API_KEY`.
6. Use your Supabase project URL for `SUPABASE_URL`.
7. Use the Supabase `service_role` key for `SUPABASE_SERVICE_ROLE_KEY`. Do not use the anon public key for deployment because the deploy script needs to delete and overwrite files.
8. The workflow at `.github/workflows/daily-video-update.yml` will run every day at `01:00 UTC`.

The workflow will:

```txt
fetch YouTube candidates
filter risky videos
add up to 3 conservative drafts
rebuild the static site
clear and upload the `outputs/video-pulse` files to Supabase Storage bucket `123`
commit the generated files back to the repository
```

If the candidates are not good enough, it may add 0 videos. That is intentional.

## Hosting

For Cloudflare Pages, set:

```txt
Build command: node src/build.mjs
Output directory: outputs/video-pulse
```

When GitHub Actions commits updates, Cloudflare Pages can redeploy automatically from the repository.

## Manual Trigger

On GitHub, open:

```txt
Actions -> Daily video update -> Run workflow
```

This runs the same update immediately.
