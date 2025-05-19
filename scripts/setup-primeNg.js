const fs = require("fs");
const path = require("path");

// === 1. Create `mypreset.ts` if not exists ===
const presetPath = path.resolve(process.cwd(), "../../../mypreset.ts");

if (!fs.existsSync(presetPath)) {
  console.log("[MyLibrary-X] mypreset.ts not found. Creating it now...");

  const configContent = `
// mypreset.ts
import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{indigo.50}',
      100: '{indigo.100}',
      200: '{indigo.200}',
      300: '{indigo.300}',
      400: '{indigo.400}',
      500: '{indigo.500}',
      600: '{indigo.600}',
      700: '{indigo.700}',
      800: '{indigo.800}',
      900: '{indigo.900}',
      950: '{indigo.950}'
    }
  }
});

export default MyPreset;
`.trim();

  fs.writeFileSync(presetPath, configContent, "utf-8");
  console.log("[MyLibrary-X] mypreset.ts created successfully.");
} else {
  console.log("[MyLibrary-X] mypreset.ts already exists. Skipping creation.");
}

// === 2. Update app.config.ts ===
const appConfigPath = path.resolve(
  process.cwd(),
  "../../../src/app/app.config.ts"
);

if (!fs.existsSync(appConfigPath)) {
  console.error("[MyLibrary-X] app.config.ts not found. Aborting update.");
  process.exit(1);
}

let content = fs.readFileSync(appConfigPath, "utf-8");

// Step 1: Add missing imports if not present
const importStatements = [
  `import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';`,
  `import { providePrimeNG } from 'primeng/config';`,
  `import MyPreset from '../../mypreset';`,
];

importStatements.forEach((imp) => {
  if (!content.includes(imp)) {
    const lastImportIndex = content.lastIndexOf("import ");
    const nextLineIndex = content.indexOf("\n", lastImportIndex);
    content =
      content.slice(0, nextLineIndex + 1) +
      imp +
      "\n" +
      content.slice(nextLineIndex + 1);
  }
});

// Step 2: Cleanly inject into providers array
const providersRegex = /(providers\s*:\s*\[)([\s\S]*?)(\])/m;
const injection = `provideAnimationsAsync(),\n    providePrimeNG({\n      theme: {\n        preset: MyPreset\n      }\n    })`;

content = content.replace(providersRegex, (match, start, middle, end) => {
  const hasAnimations = middle.includes("provideAnimationsAsync()");
  if (hasAnimations) return match;

  const existingProviders = middle.trim().replace(/,+$/, ""); // Remove trailing comma
  const newProviders =
    existingProviders.length > 0
      ? `${existingProviders},\n    ${injection}`
      : `    ${injection}`;

  return `${start}\n    ${newProviders}\n  ${end}`;
});

// Step 3: Remove extra commas
content = content.replace(/,\s*,/g, ","); // Fix double commas

// Save file
fs.writeFileSync(appConfigPath, content, "utf-8");
console.log("[MyLibrary-X] app.config.ts updated successfully.");
