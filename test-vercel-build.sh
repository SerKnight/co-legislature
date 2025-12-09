#!/bin/bash
set -e  # Exit on any error

echo "=== Simulating Vercel Build ==="

# Clean slate
echo "Cleaning..."
rm -rf node_modules package-lock.json .next .npmrc

# Get token from environment
if [ -z "$FOUNDRY_TOKEN" ]; then
  echo "ERROR: FOUNDRY_TOKEN not set"
  exit 1
fi

# Create NPM_RC like Vercel
export NPM_RC="registry=https://registry.npmjs.org
@colorado-legislature-explorer:registry=https://camelot.usw-3.palantirfoundry.com/artifacts/api/repositories/ri.artifacts.main.repository.127abe55-3840-4ec5-bf00-23bb1422ed6d/contents/release/npm
//camelot.usw-3.palantirfoundry.com/artifacts/api/repositories/ri.artifacts.main.repository.127abe55-3840-4ec5-bf00-23bb1422ed6d/contents/release/npm/:_authToken=$FOUNDRY_TOKEN"

# Write .npmrc (what Vercel does at build time)
echo "$NPM_RC" > .npmrc

echo "=== Generated .npmrc ==="
cat .npmrc

echo ""
echo "=== Installing dependencies ==="
npm install --loglevel verbose

echo ""
echo "=== Running build ==="
npm run build

echo ""
echo "✅ Build succeeded!"
