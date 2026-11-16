import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16"/>
      <stop offset="50%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00D084"/>
      <stop offset="50%" stop-color="#06B6D4"/>
      <stop offset="100%" stop-color="#3B82F6"/>
    </linearGradient>
    <linearGradient id="cardBg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="60" result="blur"/>
    </filter>
  </defs>

  <!-- Background Base -->
  <rect width="1200" height="630" fill="url(#bg)"/>

  <!-- Emerald Ambient Glow -->
  <circle cx="1050" cy="120" r="280" fill="#00D084" opacity="0.12" filter="url(#glow)"/>
  <circle cx="150" cy="500" r="260" fill="#06B6D4" opacity="0.08" filter="url(#glow)"/>

  <!-- Top Accent Bar -->
  <rect x="0" y="0" width="1200" height="8" fill="url(#accent)"/>

  <!-- Content Container Card -->
  <rect x="80" y="70" width="1040" height="490" rx="28" fill="url(#cardBg)" stroke="#334155" stroke-width="1.5"/>

  <!-- Inner Top Line of Card -->
  <rect x="80" y="70" width="1040" height="6" rx="3" fill="url(#accent)"/>

  <!-- Top Header Inside Card -->
  <!-- Maya Icon Box -->
  <rect x="130" y="120" width="60" height="60" rx="16" fill="#00D084" opacity="0.15"/>
  <text x="160" y="162" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="32" font-weight="900" fill="#00D084" text-anchor="middle">M</text>

  <!-- Header Title -->
  <text x="210" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#00D084" letter-spacing="2">OFFICIAL AGREEMENT &amp; TRACKER</text>
  <text x="210" y="175" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="28" font-weight="800" fill="#FFFFFF" letter-spacing="-0.5">PAYMENT SCHEDULE</text>

  <!-- Live Status Badge on Right -->
  <rect x="910" y="125" width="150" height="38" rx="19" fill="#00D084" opacity="0.15" stroke="#00D084" stroke-width="1.2"/>
  <circle cx="932" cy="144" r="5" fill="#00D084"/>
  <text x="948" y="149" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#00D084">LIVE TRACKER</text>

  <!-- Divider -->
  <line x1="130" y1="210" x2="1070" y2="210" stroke="#334155" stroke-width="1"/>

  <!-- Two Column Information Section -->
  <!-- Column 1: Payer & Receiver -->
  <g transform="translate(130, 240)">
    <!-- Payer Box -->
    <text x="0" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#94A3B8" letter-spacing="1">PAYER</text>
    <text x="0" y="45" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Ramazan Delos Santos</text>
    <text x="0" y="68" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#64748B">Verified Agreement Signee</text>

    <!-- Receiver Box -->
    <text x="0" y="125" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="700" fill="#94A3B8" letter-spacing="1">RECEIVER</text>
    <text x="0" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="24" font-weight="800" fill="#FFFFFF">Sarah Martin</text>
    <text x="0" y="178" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="500" fill="#64748B">Official Payee via Maya Wallet</text>
  </g>

  <!-- Column 2: Financial Stats (Right Box) -->
  <g transform="translate(600, 240)">
    <rect x="0" y="0" width="470" height="200" rx="20" fill="#0F172A" stroke="#334155" stroke-width="1"/>
    
    <!-- Monthly Amount -->
    <text x="30" y="40" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="700" fill="#94A3B8" letter-spacing="1">MONTHLY INSTALLMENT</text>
    <text x="30" y="80" font-family="'JetBrains Mono', monospace, sans-serif" font-size="34" font-weight="800" fill="#38BDF8">₱33,400.00</text>
    <text x="260" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="700" fill="#94A3B8">PHP / mo</text>

    <line x1="30" y1="110" x2="440" y2="110" stroke="#1E293B" stroke-width="1.5"/>

    <!-- Total Agreement & Duration -->
    <g transform="translate(30, 135)">
      <text x="0" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#64748B" letter-spacing="1">TOTAL AGREEMENT</text>
      <text x="0" y="42" font-family="'JetBrains Mono', monospace, sans-serif" font-size="20" font-weight="800" fill="#FFFFFF">₱200,400.00</text>
    </g>

    <g transform="translate(230, 135)">
      <text x="0" y="15" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11" font-weight="700" fill="#64748B" letter-spacing="1">PLAN DURATION</text>
      <text x="0" y="42" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="800" fill="#00D084">6 Months (Nov - Apr)</text>
    </g>
  </g>

  <!-- Bottom Details Bar -->
  <g transform="translate(130, 485)">
    <text x="0" y="25" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="600" fill="#94A3B8">
      Maya Account: <tspan fill="#F8FAFC" font-weight="700">0917-882-9421</tspan> · Real-Time Admin Status &amp; Reference Log
    </text>
  </g>
</svg>
`;

async function run() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const outputPath = path.join(publicDir, 'og-image.png');
  await sharp(Buffer.from(svg))
    .png({ quality: 95 })
    .toFile(outputPath);

  console.log('og-image.png generated successfully at', outputPath);
}

run().catch(console.error);
