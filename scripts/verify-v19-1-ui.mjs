import fs from "node:fs";

const read = (file) => fs.readFileSync(file, "utf8");
const pkg = JSON.parse(read("package.json"));
const team = read("src/components/TeamBuilderPage.tsx");
const forms = read("src/data/battleForms.ts");
const css = read("src/index.css");

function check(label, ok) {
  if (!ok) throw new Error(`FAIL ${label}`);
  console.log(`PASS ${label}`);
}

check("versión 19.1.0", pkg.version === "19.1.0");
check("selector Forma en Team Builder", team.includes("<label>Forma") && team.includes("setForm(species.name"));
check("solo competitivo", team.includes('mode === "competitive" && formOptions.length > 1'));
check("Mega-Staraptor local", forms.includes('id: "staraptor-mega"') && forms.includes('label: "Mega-Staraptor"'));
check("tipos Mega-Staraptor", forms.includes('types: ["fighting", "flying"]'));
check("stats Mega-Staraptor", forms.includes('attack: 140') && forms.includes('speed: 110'));
check("estilo nota de forma", css.includes(".team-form-note"));
console.log("PASS UI v19.1");
