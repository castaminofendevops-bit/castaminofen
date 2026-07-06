/**
 * Runs axe-core against key web routes.
 * Requires the Next.js server: pnpm --filter @castaminofen/web start
 * Or use: pnpm --filter @castaminofen/web a11y (starts server automatically)
 */
import { execSync } from 'node:child_process';

const BASE = process.env.A11Y_BASE_URL ?? 'http://localhost:3100';
const ROUTES = ['/', '/search', '/login', '/register'];

let hasViolations = false;

for (const route of ROUTES) {
  const url = `${BASE}${route}`;
  console.log(`\n[axe] Scanning ${url} …`);
  try {
    execSync(`npx @axe-core/cli "${url}" --tags wcag2a,wcag2aa`, {
      stdio: 'inherit',
      env: process.env,
    });
  } catch {
    hasViolations = true;
    console.error(`[axe] Violations found on ${url}`);
  }
}

if (hasViolations) {
  console.error('\n[axe] Accessibility check failed.');
  process.exit(1);
}

console.log('\n[axe] All scanned routes passed WCAG 2.x A/AA rules.');
