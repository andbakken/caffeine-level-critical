<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Deploy / oppdateringer

Hostet drift (apex + tenant-kunder) har en kanonisk oppgraderings-runbook:
[`infra/DEPLOY.md`](infra/DEPLOY.md). **Bruk den ved all utrulling av ny kode** – den
dekker bygg av felles image, rullering av apex (compose) og av alle tenants
(`control-plane/src/rollout.ts`), verifisering og rollback. Prod-standarddata kommer fra
`prisma/bootstrap.ts` (idempotent); `prisma/seed.ts` er kun for lokal dev og skal aldri
kjøres mot prod.
