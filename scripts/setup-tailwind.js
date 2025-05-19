const fs = require("fs");
const path = require("path");

// === 1. Create `.postcssrc.json` if not exists ===
const postcssPath = path.resolve(process.cwd(), "../../../.postcssrc.json");

if (!fs.existsSync(postcssPath)) {
  console.log("[MyLibrary-X] .postcssrc.json not found. Creating it now...");

  const configContent = {
    plugins: {
      "@tailwindcss/postcss": {},
    },
  };

  fs.writeFileSync(postcssPath, JSON.stringify(configContent, null, 2));
  console.log("[MyLibrary-X] .postcssrc.json created with Tailwind config.");
} else {
  console.log(
    "[MyLibrary-X] .postcssrc.json already exists. Skipping creation."
  );
}

// === 2. Inject Tailwind import into styles.scss if not present ===
const stylesPath = path.resolve(process.cwd(), "../../../src", "styles.scss");
const importStatement = '@import "tailwindcss";';

if (fs.existsSync(stylesPath)) {
  const content = fs.readFileSync(stylesPath, "utf8");

  if (!content.includes(importStatement)) {
    fs.appendFileSync(stylesPath, `\n${importStatement}\n`);
    console.log('[MyLibrary-X] Added @import "tailwindcss"; to styles.scss');
  } else {
    console.log("[MyLibrary-X] styles.scss already includes Tailwind import.");
  }
} else {
  console.warn(
    "[MyLibrary-X] styles.scss not found. Please add:\n" +
      `  ${importStatement}\n` +
      "...to your global SCSS file manually."
  );
}
