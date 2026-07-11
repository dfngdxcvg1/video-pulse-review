# GitHub to Cloudflare Auto Update

This is the production automation path for `pingdou123.uk`.

## What It Does

Every day at `01:00 UTC`, GitHub Actions will:

```txt
fetch YouTube candidates
filter risky or low-quality videos
add up to 3 conservative pages
build the static site
deploy outputs/video-pulse to Cloudflare Worker 123
commit updated data back to GitHub
```

If no good videos are found, it may add 0 videos. That is intentional.

## Required GitHub Secrets

Add these in:

```txt
GitHub repository -> Settings -> Secrets and variables -> Actions -> New repository secret
```

Required secrets:

```txt
YOUTUBE_API_KEY
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
```

For this Cloudflare account, the account id is:

```txt
a5560e16ae1b0dcbb6feb2e41d358008
```

## Cloudflare API Token

Create a Cloudflare API token with permission to deploy Workers:

```txt
Account -> Cloudflare Workers Scripts -> Edit
Account -> Account Settings -> Read
Zone -> Zone -> Read
```

If Cloudflare offers a Wrangler/Workers edit template, use that and scope it to this account.

## Manual Run

On GitHub:

```txt
Actions -> Daily Cloudflare video update -> Run workflow
```

After it finishes, check:

```txt
https://pingdou123.uk/
```
