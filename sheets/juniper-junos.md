# Juniper Junos OS commands cheat sheet

Everyday Junos CLI commands grouped by task. Operational mode (prompt &gt;) shows status; configuration mode (prompt #) edits a candidate configuration that does nothing until you commit it.

| | |
|---|---|
| **Vendor** | Juniper Networks |
| **Platform** | Junos OS |
| **Version scope** | Junos OS 22.x and later (EX/SRX/MX; ELS syntax for EX switching) |
| **Commands** | 57 (4 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/juniper-junos](https://www.epifive.com/cheatsheets/juniper-junos)

## Contents

- [Modes and navigation](#modes-and-navigation)
- [Editing and committing](#editing-and-committing)
- [Viewing the configuration](#viewing-the-configuration)
- [System setup](#system-setup)
- [Interfaces and VLANs (EX with ELS)](#interfaces-and-vlans-ex-with-els)
- [Routing](#routing)
- [Monitoring and troubleshooting](#monitoring-and-troubleshooting)
- [Files, rescue and system](#files-rescue-and-system)
- [FAQ](#faq)
- [References](#references)

## Modes and navigation

| Command | What it does | Example |
|---|---|---|
| `cli` | Start the Junos CLI in operational mode from the shell.<br>*Note:* Needed when you log in as root on the console, which lands in the shell. | `root@% cli` |
| `configure` | Enter configuration mode to edit the shared candidate configuration.<br>*Note:* The prompt changes to # with an \[edit\] banner. Up to 32 users can edit at once and see each other's changes. | `user@host> configure` |
| `configure exclusive` | Enter configuration mode and lock the candidate so others cannot commit.<br>*Note:* Other users can still enter configuration mode but cannot make permanent changes while you hold the lock. |  |
| `configure private` | Edit a private copy of the candidate so a commit includes only your changes.<br>*Note:* Run update in configuration mode to pull in changes other users have committed. |  |
| `edit <hierarchy>` | Move to a level of the configuration hierarchy, creating it if needed.<br>*Note:* The \[edit ...\] banner shows where you are. up goes one level up and top returns to \[edit\]. | `edit interfaces ge-0/0/1` |
| `run <operational-command>` | Run an operational mode command without leaving configuration mode. | `run show interfaces terse` |
| `exit configuration-mode` | Leave configuration mode from any level without a prompt.<br>*Note:* Plain exit moves back one level, and from the top level asks before leaving with uncommitted changes. |  |

## Editing and committing

| Command | What it does | Example |
|---|---|---|
| `set <statement-path>` | Add or change a statement in the candidate configuration.<br>*Note:* Your position in the hierarchy does not change. Nothing takes effect until commit. | `set system host-name SW1-OFFICE` |
| `delete <statement-path>` | **Destructive.** Remove a statement and everything under it from the candidate configuration.<br>**Warning:** All subordinate statements under the path are removed too. Live traffic is affected only after commit; rollback 0 undoes it before then. | `delete protocols ospf` |
| `show \| compare` | Show uncommitted changes against the active configuration.<br>*Note:* Lines starting with + are added and lines starting with - are removed. Run it before every commit. |  |
| `show \| compare rollback <n>` | Compare the candidate with a previously committed configuration. | `show \| compare rollback 1` |
| `commit check` | Check the candidate configuration for errors without activating it. |  |
| `commit` | Activate the candidate configuration.<br>*Note:* Add comment "&lt;text&gt;" to record why, for example commit comment "Add VLAN 30". View past commits with show system commit. |  |
| `commit confirmed <minutes>` | Activate the candidate but roll back automatically unless you confirm in time.<br>*Note:* The default is 10 minutes. Confirm with commit or commit check before the timer ends. Use it for remote changes that could cut off your access. | `commit confirmed 5` |
| `commit and-quit` | Commit and return to operational mode in one step. |  |
| `rollback <n>` | Load a previously committed configuration into the candidate.<br>*Note:* 0 is the active configuration and 49 the oldest; Junos keeps the last 50 commits. Run commit to activate the one you loaded. | `rollback 1` |
| `rollback 0` | Discard all uncommitted changes in the candidate configuration.<br>*Note:* Reloads the active configuration into the candidate. Committed changes are not touched. |  |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `delete <statement-path>`: All subordinate statements under the path are removed too. Live traffic is affected only after commit; rollback 0 undoes it before then.

## Viewing the configuration

| Command | What it does | Example |
|---|---|---|
| `show configuration` | Show the committed configuration that is running now (operational mode).<br>*Note:* In configuration mode, show displays the candidate at the current level instead. | `show configuration interfaces ge-0/0/1` |
| `show configuration \| display set` | Show the configuration as the set commands that would recreate it.<br>*Note:* In configuration mode use show \| display set, or show \| display set relative for paths from your current level. |  |
| `<command> \| match <pattern>` | Show only output lines that match a pattern.<br>*Note:* Quote patterns that contain spaces. \| except hides matching lines and \| count counts lines. | `show configuration \| display set \| match ge-0/0/1` |
| `<command> \| no-more` | Print the whole output without pausing at each screen. | `show configuration \| no-more` |

## System setup

| Command | What it does | Example |
|---|---|---|
| `set system host-name <name>` | Set the device hostname shown in the prompt.<br>*Note:* Enclose the name in double quotes if it contains spaces. | `set system host-name SW1-OFFICE` |
| `set system root-authentication plain-text-password` | Set the root password; you are prompted to type it twice.<br>*Note:* Junos will not accept a commit until a root password is set. The password is stored encrypted. |  |
| `set system login user <name> class super-user authentication plain-text-password` | Create a local admin account with full permissions.<br>*Note:* Other built-in classes are operator, read-only and unauthorized. | `set system login user netadmin class super-user authentication plain-text-password` |
| `set system services ssh` | Enable the SSH server for remote management. |  |
| `set system ntp server <address>` | Sync the system clock with an NTP server.<br>*Note:* Check sync with show ntp associations and show ntp status. | `set system ntp server 192.0.2.123` |
| `set system name-server <address>` | Add a DNS server for name resolution. | `set system name-server 192.0.2.53` |

## Interfaces and VLANs (EX with ELS)

| Command | What it does | Example |
|---|---|---|
| `set interfaces <interface> unit 0 family inet address <address/prefix>` | Assign an IPv4 address to a routed interface. | `set interfaces ge-0/0/0 unit 0 family inet address 192.0.2.1/24` |
| `set interfaces <interface> disable` | Administratively shut down an interface.<br>*Note:* Bring it back with delete interfaces &lt;interface&gt; disable, then commit. | `set interfaces ge-0/0/5 disable` |
| `set vlans <vlan-name> vlan-id <id>` | Create a VLAN with a name and an 802.1Q ID.<br>*Note:* On ELS switches every VLAN must have an ID or the commit fails. | `set vlans STAFF vlan-id 10` |
| `set interfaces <interface> unit 0 family ethernet-switching interface-mode access` | Make a switch port an access port. | `set interfaces ge-0/0/1 unit 0 family ethernet-switching interface-mode access` |
| `set interfaces <interface> unit 0 family ethernet-switching vlan members <vlan>` | Put a port in a VLAN, by VLAN name or ID.<br>*Note:* For a trunk, list several VLANs in brackets, for example vlan members \[ STAFF VOICE \]. | `set interfaces ge-0/0/1 unit 0 family ethernet-switching vlan members STAFF` |
| `set interfaces <interface> unit 0 family ethernet-switching interface-mode trunk` | Make a switch port a trunk that carries several tagged VLANs. | `set interfaces ge-0/0/47 unit 0 family ethernet-switching interface-mode trunk` |
| `set interfaces <interface> native-vlan-id <vlan-id>` | Accept untagged data frames on a trunk and place them in this VLAN.<br>*Note:* On ELS it goes on the physical interface, and the same VLAN must also be in the port's vlan members. Without it, untagged data frames on a trunk are dropped. | `set interfaces ge-0/0/47 native-vlan-id 99` |
| `set interfaces irb unit <n> family inet address <address/prefix>` | Create a Layer 3 IRB interface to route for a VLAN. | `set interfaces irb unit 10 family inet address 192.168.10.1/24` |
| `set vlans <vlan-name> l3-interface irb.<n>` | Bind the IRB interface to a VLAN so the VLAN can be routed. | `set vlans STAFF l3-interface irb.10` |

## Routing

| Command | What it does | Example |
|---|---|---|
| `set routing-options static route <prefix> next-hop <address>` | Add a static route.<br>*Note:* Static routes have a default preference of 5 and become active only when the next hop is reachable. | `set routing-options static route 198.51.100.0/24 next-hop 192.0.2.254` |
| `set routing-options static route 0.0.0.0/0 next-hop <address>` | Add a default route. | `set routing-options static route 0.0.0.0/0 next-hop 203.0.113.1` |
| `show route` | Show active entries in the routing tables.<br>*Note:* Add a prefix or address to see only matching routes. | `show route 198.51.100.0/24` |
| `show route protocol <protocol>` | Show only routes learned from one source, such as static, direct, local, ospf or bgp. | `show route protocol static` |

## Monitoring and troubleshooting

| Command | What it does | Example |
|---|---|---|
| `show interfaces terse` | List interfaces with admin and link state, protocol family and addresses. | `show interfaces terse \| match ge-0/0` |
| `show vlans` | List VLANs with their IDs and member interfaces (ELS). |  |
| `show ethernet-switching table` | Show the MAC addresses the switch has learned, with VLAN and interface (ELS). |  |
| `show lldp neighbors` | List neighboring devices discovered with LLDP. | `show lldp neighbors interface ge-0/0/47` |
| `show version` | Show the hostname and the Junos OS version running on the device. |  |
| `show log messages` | Show the main system log file.<br>*Note:* show log on its own lists the available log files. | `show log messages \| last 50` |
| `ping <host> count <n>` | Send a set number of ICMP echo requests.<br>*Note:* Without count, ping runs until you press Ctrl+C. Add rapid for a single summary line, or source &lt;address&gt; to pick the source IP. | `ping 192.0.2.10 count 5` |
| `traceroute <host>` | Show the hops packets take to reach a destination. | `traceroute 198.51.100.25` |
| `monitor interface <interface>` | Show live interface statistics, updated every second.<br>*Note:* Use monitor interface traffic for all active interfaces. Press q or Esc to quit. | `monitor interface ge-0/0/1` |
| `monitor traffic interface <interface>` | Capture packet headers sent and received by the Routing Engine on an interface.<br>*Note:* Shows control-plane traffic to and from the device, not transit traffic. Use count to stop after a number of packets. | `monitor traffic interface ge-0/0/0 no-resolve count 20` |

## Files, rescue and system

| Command | What it does | Example |
|---|---|---|
| `save <filename>` | Save the candidate configuration at the current level to a file (configuration mode).<br>*Note:* By default the file goes in your home directory. It includes uncommitted changes. | `save sw1-backup.conf` |
| `file list <path>` | List files on the device. | `file list /var/tmp detail` |
| `load merge terminal` | Paste configuration text and merge it into the candidate.<br>*Note:* Press Ctrl+D on a new line to finish. Use load set terminal to paste set commands. Review with show \| compare, then commit. |  |
| `load override <filename>` | **Destructive.** Replace the whole candidate configuration with a saved file.<br>**Warning:** Everything in the candidate that is not in the file is discarded, and the next commit makes that live. Check with show \| compare before committing. | `load override sw1-backup.conf` |
| `request system configuration rescue save` | Save the current committed configuration as the rescue configuration.<br>*Note:* Restore it later with rollback rescue followed by commit. |  |
| `request system reboot` | **Destructive.** Reboot the device.<br>**Warning:** All traffic through the device stops while it restarts. Commit or discard pending changes first. EX switches wait one minute before rebooting; clear system reboot cancels a scheduled reboot. | `request system reboot in 10` |
| `request system zeroize` | **Destructive.** Erase all configuration, logs and user files and reset the device to factory defaults.<br>**Warning:** Removes the configuration, log files, passwords, secrets and private keys, then reboots to the factory default configuration. Afterwards you can only log in from the console as root. Back up the configuration first. |  |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `load override <filename>`: Everything in the candidate that is not in the file is discarded, and the next commit makes that live. Check with show \| compare before committing.
> - `request system reboot`: All traffic through the device stops while it restarts. Commit or discard pending changes first. EX switches wait one minute before rebooting; clear system reboot cancels a scheduled reboot.
> - `request system zeroize`: Removes the configuration, log files, passwords, secrets and private keys, then reboots to the factory default configuration. Afterwards you can only log in from the console as root. Back up the configuration first.

## FAQ

### What is the difference between operational mode and configuration mode in Junos?

Operational mode (prompt &gt;) is for monitoring and troubleshooting with commands such as show, ping and monitor. Configuration mode (prompt # with an \[edit\] banner), entered with configure, is for changing settings. Changes made there go into a candidate configuration and only take effect when you run commit.

### How does commit confirmed work in Junos?

commit confirmed activates the candidate configuration temporarily. If you do not enter commit or commit check within the timeout (10 minutes by default, or the number of minutes you give, such as commit confirmed 5), Junos automatically rolls back to the previous configuration. It protects you from losing remote access through a bad change.

### How do I undo a configuration change on a Juniper device?

For uncommitted changes, run rollback 0 in configuration mode to discard them. To return to an earlier committed configuration, run rollback &lt;n&gt; (for example rollback 1 for the previous one), check it with show \| compare, then commit. Junos keeps the last 50 committed configurations, numbered 0 to 49.

### How do I show the Junos configuration as set commands?

In operational mode run show configuration \| display set. In configuration mode run show \| display set, or show \| display set relative to see paths from your current hierarchy level. Add \| match &lt;pattern&gt; to filter, for example show configuration \| display set \| match ge-0/0/1.

## References

Every command above was checked against these official pages:

- [Junos OS CLI User Guide: Commit the Configuration](https://www.juniper.net/documentation/us/en/software/junos/cli/topics/topic-map/junos-configuration-commit.html)
- [Junos OS CLI User Guide: CLI Configuration Mode Overview](https://www.juniper.net/documentation/us/en/software/junos/cli/topics/topic-map/cli-configuration.html)
- [Junos OS CLI User Guide: Overview of the Configure Command](https://www.juniper.net/documentation/us/en/software/junos/cli/topics/topic-map/configure-command.html)
- [Junos OS CLI User Guide: View the Configuration](https://www.juniper.net/documentation/us/en/software/junos/cli/topics/topic-map/junos-configuartion-viewing.html)
- [Junos OS: Layer 2 Networking (Enhanced Layer 2 Software)](https://www.juniper.net/documentation/en_US/junos/topics/task/configuration/bridging-vlans-ex-series-cli-els.html)
- [Junos OS: Configure Static Routes](https://www.juniper.net/documentation/us/en/software/junos/static-routing/topics/topic-map/config_static-routes.html)
- [Junos OS CLI Reference: request system reboot](https://www.juniper.net/documentation/us/en/software/junos/cli-reference/topics/ref/command/request-system-reboot.html)
- [Junos OS CLI Reference: request system zeroize](https://www.juniper.net/documentation/us/en/software/junos/cli-reference/topics/ref/command/request-system-zeroize.html)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
