// Regenerates this repository's Markdown from the EpiFive cheat sheet data (one JSON file per sheet).
//
//   node generate.mjs [path-to-cheatsheets-json-dir]
//
// Default source: E:\epifive\content\cheatsheets. Writes README.md, sheets/<slug>.md, REPO_META.md and
// .github/ISSUE_TEMPLATE/correction.md next to this script. LICENSE is not touched.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = 'https://www.epifive.com';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(process.argv[2] ?? 'E:/epifive/content/cheatsheets');

if (!fs.existsSync(SRC)) {
  console.error(`Source folder not found: ${SRC}\nUsage: node generate.mjs <path-to-cheatsheets-json-dir>`);
  process.exit(1);
}

// ---------- Markdown helpers ----------

/** Plain text for a table cell or paragraph: escape characters Markdown or HTML would interpret. */
const escapeText = (s) =>
  String(s)
    .replace(/\\/g, '\\\\')
    .replace(/([*_~[\]|])/g, '\\$1')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
/** Plain text, with any URL inside it shown as code so placeholder URLs do not become links. */
const text = (s) =>
  String(s)
    .split(/(https?:\/\/[^\s,;)]*[^\s,;.)])/)
    .map((part, i) => (i % 2 ? code(part) : escapeText(part)))
    .join('');

/** Inline code. Pipes must be escaped inside GFM table cells even within a code span. */
const code = (s, inTable = true) => {
  const v = String(s);
  const ticks = v.includes('`') ? '``' : '`';
  const pad = ticks.length > 1 ? ' ' : '';
  return `${ticks}${pad}${inTable ? v.replace(/\|/g, '\\|') : v}${pad}${ticks}`;
};

/** GitHub heading anchor. */
const anchor = (h) =>
  h
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');

const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;

// ---------- Load ----------

const sheets = fs
  .readdirSync(SRC)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(SRC, f), 'utf8')))
  .sort((a, b) => a.shortTitle.localeCompare(b.shortTitle));

const count = (d) => d.sections.reduce((n, s) => n + s.rows.length, 0);
const destructiveCount = (d) => d.sections.reduce((n, s) => n + s.rows.filter((r) => r.destructive).length, 0);
const total = sheets.reduce((n, d) => n + count(d), 0);
const latest = sheets.map((d) => d.updated).sort().at(-1);

// ---------- One file per sheet ----------

fs.mkdirSync(path.join(HERE, 'sheets'), { recursive: true });
for (const f of fs.readdirSync(path.join(HERE, 'sheets'))) if (f.endsWith('.md')) fs.rmSync(path.join(HERE, 'sheets', f));

for (const d of sheets) {
  const web = `${SITE}/cheatsheets/${d.slug}`;
  const L = [];
  L.push(`# ${text(d.title)}`, '');
  L.push(text(d.intro), '');
  L.push(`| | |`, `|---|---|`);
  L.push(`| **Vendor** | ${text(d.vendor)} |`);
  L.push(`| **Platform** | ${text(d.platform)} |`);
  L.push(`| **Version scope** | ${text(d.versionScope)} |`);
  L.push(`| **Commands** | ${count(d)} (${destructiveCount(d)} marked destructive) |`);
  L.push(`| **Last verified** | ${d.updated} |`);
  L.push('');
  L.push(`Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/${d.slug}](${web})`, '');
  L.push('## Contents', '');
  for (const s of d.sections) L.push(`- [${text(s.heading)}](#${anchor(s.heading)})`);
  L.push(`- [FAQ](#faq)`, `- [References](#references)`, '');

  for (const s of d.sections) {
    L.push(`## ${text(s.heading)}`, '');
    L.push('| Command | What it does | Example |', '|---|---|---|');
    for (const r of s.rows) {
      let does = text(r.does);
      if (r.destructive) does = `**Destructive.** ${does}`;
      if (r.notes) does += `<br>${r.destructive ? '**Warning:** ' : '*Note:* '}${text(r.notes)}`;
      L.push(`| ${code(r.command)} | ${does} | ${r.example ? code(r.example) : ''} |`);
    }
    L.push('');
    const danger = s.rows.filter((r) => r.destructive);
    if (danger.length) {
      L.push('> [!WARNING]');
      L.push(`> ${danger.length === 1 ? 'This command changes or deletes data and cannot easily be undone' : 'These commands change or delete data and cannot easily be undone'}:`);
      for (const r of danger) L.push(`> - ${code(r.command, false)}: ${text(r.notes)}`);
      L.push('');
    }
  }

  L.push('## FAQ', '');
  for (const f of d.faqs) L.push(`### ${text(f.question)}`, '', text(f.answer), '');

  L.push('## References', '');
  L.push('Every command above was checked against these official pages:', '');
  for (const r of d.references) L.push(`- [${text(r.title)}](${r.url})`);
  L.push('');
  L.push('---', '');
  L.push(
    `Last verified ${d.updated}. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.`,
    '',
  );
  L.push(`Part of the [EpiFive IT cheat sheets](${SITE}/cheatsheets). Licensed under CC BY 4.0.`, '');
  fs.writeFileSync(path.join(HERE, 'sheets', `${d.slug}.md`), L.join('\n'));
}

// ---------- README ----------

const R = [];
R.push('# IT command cheat sheets', '');
R.push(
  `[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)`,
  '',
);
R.push(
  `${total} everyday commands for ${sheets.length} platforms that IT admins and network engineers use every week: Cisco, Juniper, FortiGate, MikroTik, Ubiquiti, Linux and Windows networking, Git, Azure CLI, Active Directory, Exchange Online and Microsoft Graph PowerShell. Every command is checked against the vendor's official documentation, destructive commands carry a warning, and each sheet lists the pages it was verified against.`,
  '',
);
R.push(`Maintained by [EpiFive](${SITE}). Searchable, copy-button version with PDF downloads: ${SITE}/cheatsheets`, '');
R.push('## Contents', '');
R.push('- [Cheat sheets](#cheat-sheets)');
R.push('- [How the sheets are written](#how-the-sheets-are-written)');
R.push('- [Contributing](#contributing)');
R.push('- [Regenerating the Markdown](#regenerating-the-markdown)');
R.push('- [License](#license)', '');

R.push('## Cheat sheets', '');
R.push('| Cheat sheet | Platform | Commands | Last verified | Web and PDF |', '|---|---|---:|---|---|');
for (const d of sheets) {
  R.push(
    `| [${text(d.shortTitle)}](sheets/${d.slug}.md) | ${text(d.platform)} | ${count(d)} | ${d.updated} | [epifive.com/cheatsheets/${d.slug}](${SITE}/cheatsheets/${d.slug}) |`,
  );
}
R.push('', `**${total} commands** in total, last verified ${latest}.`, '');
R.push('Each sheet groups commands by task in a `Command | What it does | Example` table, followed by a short FAQ and the official references.', '');

R.push('## How the sheets are written', '');
R.push('- **Official documentation only.** Every command, flag and keyword matches the vendor documentation or man page for the version in the sheet\'s scope. Anything that could not be confirmed is left out.');
R.push('- **Destructive commands are flagged.** Commands that reload, erase, reset, delete or overwrite something are marked **Destructive** and listed again in a warning box with what is lost.');
R.push('- **Safe placeholders.** Examples use `<interface>`-style placeholders, `contoso.com` and `example.com`, and documentation IP ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24, 2001:db8::/32).');
R.push('- **Copy-safe.** Commands and examples use straight quotes and plain hyphens, so they paste cleanly into a terminal.');
R.push('- **Dated.** Each sheet shows when it was last verified against its references.', '');

R.push('## Contributing', '');
R.push('Corrections are welcome. A command changed in a new release, a flag is wrong, or a better official example exists:', '');
R.push('1. Open an issue with the **Correction** template.');
R.push('2. Name the sheet and the command.');
R.push('3. Include the link to the official documentation that shows the correct syntax. Corrections without an official source cannot be accepted, because every command here must trace back to the vendor.', '');
R.push('New commands are considered the same way: one issue per command, with the official doc link and the version it applies to.', '');

R.push('## Regenerating the Markdown', '');
R.push('The sheets are generated from structured JSON data with Node.js 18 or later:', '');
R.push('```sh', 'node generate.mjs <path-to-cheatsheets-json-folder>', '```', '');
R.push('The script rewrites `README.md`, `sheets/*.md`, `REPO_META.md` and the issue template. Edit the data, not the generated Markdown.', '');

R.push('## License', '');
R.push(
  `The cheat sheet content is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). You may copy, adapt and share it, including commercially, with attribution. Suggested attribution: "IT command cheat sheets by EpiFive, ${SITE}/cheatsheets, CC BY 4.0". Vendor and product names are trademarks of their owners; this project is not affiliated with or endorsed by any vendor.`,
  '',
);
R.push('---', '');
R.push(`Made by [EpiFive](${SITE}): practical IT, cloud and networking guides.`, '');
fs.writeFileSync(path.join(HERE, 'README.md'), R.join('\n'));

// ---------- Issue template and repo metadata ----------

fs.mkdirSync(path.join(HERE, '.github', 'ISSUE_TEMPLATE'), { recursive: true });
fs.writeFileSync(
  path.join(HERE, '.github', 'ISSUE_TEMPLATE', 'correction.md'),
  `---
name: Correction
about: Report a wrong, outdated or missing command, with the official documentation link
title: "[Correction] <sheet>: <command>"
labels: correction
---

**Cheat sheet**
<!-- For example: cisco-ios -->

**Command or row**
<!-- Paste the command as it appears in the sheet, or "new command" -->

**What is wrong**
<!-- The flag changed, the command was removed, the description is inaccurate, ... -->

**Suggested fix**
<!-- The corrected command, description or example -->

**Official documentation link (required)**
<!-- A link to the vendor's official documentation or man page that shows the correct syntax.
     Corrections without an official source cannot be accepted. -->

**Version**
<!-- The software version this applies to, for example IOS XE 17.12 or Az CLI 2.65 -->
`,
);

fs.writeFileSync(
  path.join(HERE, 'REPO_META.md'),
  `# Repository metadata

For the GitHub "About" box.

**Name:** it-cheatsheets

**Description:** ${total} verified IT command cheat sheets for Cisco IOS, Juniper Junos, FortiGate, MikroTik, Ubiquiti, Linux, Windows, Git, Azure CLI and Microsoft 365 PowerShell. CC BY 4.0.

**Website:** ${SITE}/cheatsheets

**Topics (14):**

cheatsheet, cheatsheets, sysadmin, network-engineering, cisco-ios, juniper, fortigate, mikrotik, powershell, azure-cli, active-directory, exchange-online, microsoft-graph, git
`,
);

console.log(`Wrote ${sheets.length} sheets (${total} commands) to ${HERE}`);
