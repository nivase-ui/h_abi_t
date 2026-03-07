// Generates PNG icons from SVG for PWA
// Run: node scripts/generate-icons.js

const fs = require("fs");
const { execSync } = require("child_process");

// Since we can't easily rasterize SVG to PNG without extra deps in Node,
// we'll create simple canvas-based PNGs using a data URL approach.
// For now, copy the SVGs and note that real PNGs should be generated.

// Create placeholder PNGs by writing minimal valid PNG files
// In production, use a tool like sharp or Inkscape.

// For the MVP, the SVGs will work as notification icons on most platforms.
// We'll create symlinks/copies.

const sizes = [192, 512];
const iconSvg = fs.readFileSync("public/icons/icon.svg", "utf-8");

// Write SVG as the icon files (browsers accept SVG in manifests and notifications)
sizes.forEach((size) => {
  const filename = `public/icons/icon-${size}.png`;
  // Write the SVG content — Chrome/Safari accept this
  fs.copyFileSync("public/icons/icon.svg", filename);
  console.log(`Created ${filename}`);
});

fs.copyFileSync("public/icons/badge.svg", "public/icons/badge-72.png");
console.log("Created public/icons/badge-72.png");
console.log("\nNote: For production, generate real PNGs using sharp or an image editor.");
