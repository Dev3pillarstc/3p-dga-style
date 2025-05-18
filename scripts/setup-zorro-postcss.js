const fs = require("fs");
const path = require("path");

// === 1. Create `theme.less` if it doesn't exist ===
const themePath = path.resolve(process.cwd(), "../../../src", "theme.less");

if (!fs.existsSync(themePath)) {
  console.log("[MyLibrary-X] theme.less not found. Creating...");

  const lessContent = `
@import "../node_modules/ng-zorro-antd/ng-zorro-antd.less";
@primary-color: #1da57a;
`.trim();

  fs.writeFileSync(themePath, lessContent, "utf8");
  console.log("[MyLibrary-X] ✅ theme.less created with NG-ZORRO theme.");
} else {
  console.log("[MyLibrary-X] ✅ theme.less already exists. Skipping.");
}

// === 2. Modify angular.json ===
const angularJsonPath = path.resolve(process.cwd(), "../../../angular.json");

if (!fs.existsSync(angularJsonPath)) {
  console.error("[MyLibrary-X] ❌ angular.json not found.");
  process.exit(1);
}

const angularJson = JSON.parse(fs.readFileSync(angularJsonPath, "utf8"));

// Use first project name dynamically, change if needed
const projectName = Object.keys(angularJson.projects)[0];
const projectConfig = angularJson.projects[projectName];
const buildOptions = projectConfig?.architect?.build?.options;

if (!buildOptions) {
  console.error("[MyLibrary-X] ❌ build options not found in angular.json");
  process.exit(1);
}

// -- Add asset path
if (!Array.isArray(buildOptions.assets)) {
  buildOptions.assets = [];
}

const newAsset = {
  glob: "**/*",
  input: "./node_modules/@ant-design/icons-angular/src/inline-svg/",
  output: "/assets/",
};

const assetExists = buildOptions.assets.some(
  (a) =>
    a.glob === newAsset.glob &&
    a.input === newAsset.input &&
    a.output === newAsset.output
);

if (!assetExists) {
  buildOptions.assets.push(newAsset);
  console.log("[MyLibrary-X] ✅ Asset path added to angular.json");
} else {
  console.log("[MyLibrary-X] ⚠️ Asset path already exists in angular.json");
}

// -- Add styles
if (!Array.isArray(buildOptions.styles)) {
  buildOptions.styles = [];
}

const stylesToAdd = [
  "node_modules/ng-zorro-antd/ng-zorro-antd.min.css",
  "src/theme.less",
];

stylesToAdd.forEach((styleEntry) => {
  if (!buildOptions.styles.includes(styleEntry)) {
    buildOptions.styles.push(styleEntry);
    console.log(`[MyLibrary-X] Added '${styleEntry}' to styles array.`);
  } else {
    console.log(`[MyLibrary-X] '${styleEntry}' already in styles array.`);
  }
});

// add dga & zorro import statement in styles.scss
const stylesPath = path.resolve(process.cwd(), "../../../src", "styles.scss");
const importStatement = `@use "@3p-dga-style/shared-styles" as *;
@import "ng-zorro-antd/ng-zorro-antd.min.css";`;

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

// -- Write back angular.json
fs.writeFileSync(angularJsonPath, JSON.stringify(angularJson, null, 2), "utf8");
console.log("[MyLibrary-X] angular.json updated successfully.");
