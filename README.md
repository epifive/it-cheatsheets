# IT command cheat sheets

[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-lightgrey.svg)](https://creativecommons.org/licenses/by/4.0/)

662 everyday commands for 12 platforms that IT admins and network engineers use every week: Cisco, Juniper, FortiGate, MikroTik, Ubiquiti, Linux and Windows networking, Git, Azure CLI, Active Directory, Exchange Online and Microsoft Graph PowerShell. Every command is checked against the vendor's official documentation, destructive commands carry a warning, and each sheet lists the pages it was verified against.

Maintained by [EpiFive](https://www.epifive.com). Searchable, copy-button version with PDF downloads: https://www.epifive.com/cheatsheets

## Contents

- [Cheat sheets](#cheat-sheets)
- [How the sheets are written](#how-the-sheets-are-written)
- [Contributing](#contributing)
- [Regenerating the Markdown](#regenerating-the-markdown)
- [License](#license)

## Cheat sheets

| Cheat sheet | Platform | Commands | Last verified | Web and PDF |
|---|---|---:|---|---|
| [Active Directory PowerShell](sheets/active-directory-powershell.md) | Active Directory Domain Services | 50 | 2026-10-28 | [epifive.com/cheatsheets/active-directory-powershell](https://www.epifive.com/cheatsheets/active-directory-powershell) |
| [Azure CLI](sheets/azure-cli.md) | Azure CLI (az) | 58 | 2026-10-28 | [epifive.com/cheatsheets/azure-cli](https://www.epifive.com/cheatsheets/azure-cli) |
| [Cisco IOS / IOS XE](sheets/cisco-ios.md) | IOS and IOS XE | 60 | 2026-10-28 | [epifive.com/cheatsheets/cisco-ios](https://www.epifive.com/cheatsheets/cisco-ios) |
| [Exchange Online PowerShell](sheets/exchange-online-powershell.md) | Exchange Online (Microsoft 365) | 55 | 2026-10-28 | [epifive.com/cheatsheets/exchange-online-powershell](https://www.epifive.com/cheatsheets/exchange-online-powershell) |
| [FortiGate CLI](sheets/fortigate-cli.md) | FortiGate (FortiOS) | 59 | 2026-10-28 | [epifive.com/cheatsheets/fortigate-cli](https://www.epifive.com/cheatsheets/fortigate-cli) |
| [Git](sheets/git.md) | Git command line | 56 | 2026-10-28 | [epifive.com/cheatsheets/git](https://www.epifive.com/cheatsheets/git) |
| [Juniper Junos OS](sheets/juniper-junos.md) | Junos OS | 57 | 2026-10-28 | [epifive.com/cheatsheets/juniper-junos](https://www.epifive.com/cheatsheets/juniper-junos) |
| [Linux networking](sheets/linux-networking.md) | Linux (Debian, Ubuntu, RHEL and derivatives) | 57 | 2026-10-28 | [epifive.com/cheatsheets/linux-networking](https://www.epifive.com/cheatsheets/linux-networking) |
| [Microsoft Graph PowerShell](sheets/microsoft-graph-powershell.md) | Microsoft Entra ID and Microsoft 365 | 45 | 2026-10-28 | [epifive.com/cheatsheets/microsoft-graph-powershell](https://www.epifive.com/cheatsheets/microsoft-graph-powershell) |
| [MikroTik RouterOS v7](sheets/mikrotik-routeros.md) | RouterOS | 60 | 2026-10-28 | [epifive.com/cheatsheets/mikrotik-routeros](https://www.epifive.com/cheatsheets/mikrotik-routeros) |
| [Ubiquiti EdgeOS / UniFi](sheets/ubiquiti-unifi-edgeos.md) | EdgeOS (EdgeRouter) and UniFi devices | 48 | 2026-10-28 | [epifive.com/cheatsheets/ubiquiti-unifi-edgeos](https://www.epifive.com/cheatsheets/ubiquiti-unifi-edgeos) |
| [Windows networking](sheets/windows-networking.md) | Windows and Windows Server | 57 | 2026-10-28 | [epifive.com/cheatsheets/windows-networking](https://www.epifive.com/cheatsheets/windows-networking) |

**662 commands** in total, last verified 2026-10-28.

Each sheet groups commands by task in a `Command | What it does | Example` table, followed by a short FAQ and the official references.

## How the sheets are written

- **Official documentation only.** Every command, flag and keyword matches the vendor documentation or man page for the version in the sheet's scope. Anything that could not be confirmed is left out.
- **Destructive commands are flagged.** Commands that reload, erase, reset, delete or overwrite something are marked **Destructive** and listed again in a warning box with what is lost.
- **Safe placeholders.** Examples use `<interface>`-style placeholders, `contoso.com` and `example.com`, and documentation IP ranges (192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24, 2001:db8::/32).
- **Copy-safe.** Commands and examples use straight quotes and plain hyphens, so they paste cleanly into a terminal.
- **Dated.** Each sheet shows when it was last verified against its references.

## Contributing

Corrections are welcome. A command changed in a new release, a flag is wrong, or a better official example exists:

1. Open an issue with the **Correction** template.
2. Name the sheet and the command.
3. Include the link to the official documentation that shows the correct syntax. Corrections without an official source cannot be accepted, because every command here must trace back to the vendor.

New commands are considered the same way: one issue per command, with the official doc link and the version it applies to.

## Regenerating the Markdown

The sheets are generated from structured JSON data with Node.js 18 or later:

```sh
node generate.mjs <path-to-cheatsheets-json-folder>
```

The script rewrites `README.md`, `sheets/*.md`, `REPO_META.md` and the issue template. Edit the data, not the generated Markdown.

## License

The cheat sheet content is licensed under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/). You may copy, adapt and share it, including commercially, with attribution. Suggested attribution: "IT command cheat sheets by EpiFive, https://www.epifive.com/cheatsheets, CC BY 4.0". Vendor and product names are trademarks of their owners; this project is not affiliated with or endorsed by any vendor.

---

Made by [EpiFive](https://www.epifive.com): practical IT, cloud and networking guides.
