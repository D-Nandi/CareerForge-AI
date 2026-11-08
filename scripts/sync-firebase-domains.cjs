/**
 * CareerNest — Sync Firebase Authorized Domains
 * Adds production domains to Firebase Authentication authorized domains via Google Cloud Identity Toolkit API
 */

const path = require('path');
const fs = require('fs');

async function syncDomains() {
  const keyPath = path.resolve(__dirname, '../backend/config/serviceAccountKey.json');
  if (!fs.existsSync(keyPath)) {
    console.error('❌ serviceAccountKey.json not found at:', keyPath);
    process.exit(1);
  }

  const key = require(keyPath);
  const { GoogleAuth } = require(path.resolve(__dirname, '../backend/node_modules/google-auth-library'));

  console.log(`📡 Connecting to Google Cloud Identity Toolkit for project: ${key.project_id}...`);

  const auth = new GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
  });

  const client = await auth.getClient();
  const getUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${key.project_id}/config`;
  const patchUrl = `https://identitytoolkit.googleapis.com/admin/v2/projects/${key.project_id}/config?updateMask=authorizedDomains`;

  const current = await client.request({ url: getUrl });
  const existingDomains = current.data.authorizedDomains || [];
  console.log('📋 Existing authorized domains:', existingDomains);

  const targetDomains = [
    'localhost',
    '127.0.0.1',
    'careernest.taqnik.in',
    'www.careernest.taqnik.in',
    'taqnik.in',
    'career-forge-ai-sigma.vercel.app',
    'careerforge-ai-c1f65.firebaseapp.com',
    'careerforge-ai-c1f65.web.app'
  ];

  const domainSet = new Set(existingDomains);
  let changed = false;

  for (const d of targetDomains) {
    if (!domainSet.has(d)) {
      domainSet.add(d);
      changed = true;
    }
  }

  if (!changed) {
    console.log('✅ All target domains are already authorized in Firebase.');
    return;
  }

  const updatedList = Array.from(domainSet);
  console.log('🚀 Updating authorized domains in Firebase...', updatedList);

  const res = await client.request({
    url: patchUrl,
    method: 'PATCH',
    data: { authorizedDomains: updatedList }
  });

  console.log('✅ Successfully updated Firebase Authorized Domains:');
  console.log(res.data.authorizedDomains);
}

syncDomains().catch(err => {
  console.error('❌ Failed to sync domains:', err.response?.data || err.message || err);
  process.exit(1);
});

