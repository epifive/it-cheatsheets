# FortiGate CLI commands cheat sheet (FortiOS)

Everyday FortiOS CLI commands grouped by task, from the SSH or console prompt. On a FortiGate with VDOMs, enter the right VDOM (config vdom, edit &lt;name&gt;) or global scope before running them.

| | |
|---|---|
| **Vendor** | Fortinet |
| **Platform** | FortiGate (FortiOS) |
| **Version scope** | FortiOS 7.4 and 7.6 |
| **Commands** | 59 (7 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/fortigate-cli](https://www.epifive.com/cheatsheets/fortigate-cli)

## Contents

- [CLI basics and system status](#cli-basics-and-system-status)
- [Interfaces and routing](#interfaces-and-routing)
- [Firewall policy and objects](#firewall-policy-and-objects)
- [IPsec VPN](#ipsec-vpn)
- [Ping, traceroute and packet capture](#ping-traceroute-and-packet-capture)
- [Debug flow and session table](#debug-flow-and-session-table)
- [High availability](#high-availability)
- [Backup, reboot and reset](#backup-reboot-and-reset)
- [FAQ](#faq)
- [References](#references)

## CLI basics and system status

| Command | What it does | Example |
|---|---|---|
| `get system status` | Show firmware version, serial number, FortiGuard engine versions and other system information.<br>*Note:* Words can be shortened to any unique prefix, so g sy stat runs the same command. |  |
| `get system performance status` | Show CPU and memory use, average network usage, sessions, session setup rate and uptime. | `get system performance status \| grep Uptime` |
| `diagnose sys top <delay> <lines> <iterations>` | Show the processes using the most CPU and memory.<br>*Note:* Delay is in seconds (default 5), lines defaults to 20 and iterations defaults to unlimited. | `diagnose sys top 5 20 3` |
| `show <path>` | Show the configuration of a path, listing only values changed from the defaults. | `show system interface port1` |
| `show full-configuration <path>` | Show the configuration of a path including every default value.<br>*Note:* Fortinet docs often shorten it to show full. | `show full-configuration system interface port1` |
| `show \| grep -f <text>` | Search the configuration and print each match inside its full config block.<br>*Note:* grep works on get, show and diagnose output and also takes -i (ignore case), -n, -A, -B and -C. | `show \| grep -f ldap-group1` |
| `config <path>` | Enter a configuration object or table; the prompt changes to show the scope. | `config firewall policy` |
| `edit <name-or-id>` | Create or open a table entry.<br>*Note:* In numbered tables such as firewall policies, edit 0 creates a new entry that gets the next free ID when saved. | `edit 0` |
| `set <field> <value>` | Set a field value inside the current object or entry.<br>*Note:* On list fields set replaces the whole list. Use append to add an item and unselect to remove one. | `set allowaccess ping https ssh` |
| `next` | Save the current table entry and stay in the table to edit another one. |  |
| `end` | Save the changes and leave the current config scope. |  |
| `abort` | Leave the current edit or config command without saving changes. |  |
| `config system console` | Console settings; set output standard turns off the --More-- paging of long output.<br>*Note:* set output more turns paging back on. Finish with end. | `set output standard` |

## Interfaces and routing

| Command | What it does | Example |
|---|---|---|
| `config system interface` | Configure physical, VLAN and other interfaces, including IP address and admin access.<br>*Note:* Typical block: edit port2, set ip ..., set allowaccess ping https ssh, next, end. Removing https or ssh from the interface you manage through cuts off your session. | `set ip 192.168.10.1 255.255.255.0` |
| `diagnose hardware deviceinfo nic <port>` | Show hardware details and counters for a physical port. | `diagnose hardware deviceinfo nic port1` |
| `diagnose ip arp list` | Show the ARP table. |  |
| `get router info routing-table all` | Show every route in the active routing table with its type, source and outgoing interface. |  |
| `get router info routing-table details <ip-or-prefix>` | Show the routing table entry that matches a destination. | `get router info routing-table details 203.0.113.10` |
| `config router static` | Add or change IPv4 static routes.<br>*Note:* Typical block: edit 0, set dst 198.51.100.0 255.255.255.0, set gateway 192.0.2.1, set device port1, next, end. dst defaults to 0.0.0.0 0.0.0.0, which makes a default route. | `set gateway 192.0.2.1` |

## Firewall policy and objects

| Command | What it does | Example |
|---|---|---|
| `config firewall address` | Create IPv4 address objects such as subnets, ranges and FQDNs.<br>*Note:* Start with edit &lt;name&gt;. For a hostname use set type fqdn and set fqdn www.example.com. | `set subnet 192.168.10.0 255.255.255.0` |
| `config firewall addrgrp` | Group address objects so a policy can use them together.<br>*Note:* set member replaces the list; use append member to add one object. | `set member "web01" "web02"` |
| `config firewall policy` | Create or edit firewall policies.<br>*Note:* Common fields: name, srcintf, dstintf, srcaddr, dstaddr, action, schedule, service, nat, logtraffic and status. | `set action accept` |
| `clone <id> to <new-id>` | Copy a table entry, such as a firewall policy, to a new ID.<br>*Note:* Run it inside config firewall policy, then end. Not every table supports clone. | `clone 27 to 30` |
| `diagnose firewall iprope lookup <src-ip> <src-port> <dst-ip> <dst-port> <protocol> <in-interface> <policy-type>` | Show which firewall policy would match a given flow, without sending traffic.<br>*Note:* Policy type (policy or proxy) was added in 7.4.1. Use the real ingress interface. Policy ID 0 means the implicit deny. | `diagnose firewall iprope lookup 192.168.10.20 50000 203.0.113.10 443 6 port2 policy` |

## IPsec VPN

| Command | What it does | Example |
|---|---|---|
| `get vpn ipsec tunnel summary` | List IPsec tunnels with peer address, selectors up and rx/tx packet and error counts.<br>*Note:* selectors(total,up) 1/1 with rising rx and tx counters means phase 2 is up and passing traffic. |  |
| `diagnose vpn ike gateway list` | Show phase 1 status for each gateway: IKE version, peer, IKE and IPsec SA counts and lifetimes.<br>*Note:* Add name &lt;phase1-name&gt; to show one gateway. | `diagnose vpn ike gateway list name to-branch1` |
| `diagnose vpn tunnel list` | Show phase 2 tunnels with selectors, SPIs and traffic counters.<br>*Note:* Add name &lt;phase1-name&gt; to show one tunnel. | `diagnose vpn tunnel list name to-branch1` |
| `diagnose vpn ike status` | Show a summary of the IKE daemon and its SA counts. |  |
| `diagnose vpn ike gateway clear name <phase1-name>` | **Destructive.** Clear the IKE SAs for one gateway so the tunnel renegotiates.<br>**Warning:** Traffic over that tunnel stops until it renegotiates. Without name &lt;phase1-name&gt; it clears every IKE gateway, dropping all IPsec tunnels. | `diagnose vpn ike gateway clear name to-branch1` |
| `diagnose debug application ike -1` | Turn on full IKE negotiation debugging.<br>*Note:* Follow with diagnose debug enable. Stop with diagnose debug disable and diagnose debug reset. |  |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `diagnose vpn ike gateway clear name <phase1-name>`: Traffic over that tunnel stops until it renegotiates. Without name &lt;phase1-name&gt; it clears every IKE gateway, dropping all IPsec tunnels.

## Ping, traceroute and packet capture

| Command | What it does | Example |
|---|---|---|
| `execute ping <host>` | Ping an IP address or hostname from the FortiGate. | `execute ping 192.0.2.1` |
| `execute ping-options source <ip>` | Set the source address used by later execute ping commands.<br>*Note:* execute ping-options view-settings shows the current options; execute ping-options reset restores defaults. | `execute ping-options source 192.168.10.1` |
| `execute ping-options repeat-count <n>` | Set how many pings execute ping sends. | `execute ping-options repeat-count 10` |
| `execute traceroute <host>` | Trace the path from the FortiGate to an IP address or hostname. | `execute traceroute 203.0.113.10` |
| `diagnose sniffer packet <interface> '<filter>' <verbose> <count> <tsformat>` | Capture packets on an interface (or any) with a tcpdump-style filter.<br>*Note:* Use none for no filter. Verbose 4 adds interface names; 6 adds the full Ethernet payload. Leave out the count to run until Ctrl+C. Timestamp l is local time, a is UTC. Hardware-offloaded traffic may not show. | `diagnose sniffer packet any 'host 192.0.2.10 and icmp' 4 20 l` |

## Debug flow and session table

| Command | What it does | Example |
|---|---|---|
| `diagnose debug flow filter clear` | Remove any existing debug flow filter. |  |
| `diagnose debug flow filter addr <ip>` | Trace only packets to or from an address.<br>*Note:* Other filters: saddr, daddr, port, sport, dport, proto and negate. Use filter6 for IPv6. | `diagnose debug flow filter addr 192.0.2.10` |
| `diagnose debug flow show function-name enable` | Include kernel function names in the trace output. |  |
| `diagnose debug console timestamp enable` | Add timestamps to debug output on the console. |  |
| `diagnose debug enable` | Start printing debug output to the console. |  |
| `diagnose debug flow trace start <count>` | Trace the next packets that match the filter, showing route lookup, policy match and NAT.<br>*Note:* Traffic offloaded to NP6 or NP7 processors is not traced; test with ICMP or disable offload. Keep traces short: output is also logged to FortiAnalyzer or FortiCloud if connected. | `diagnose debug flow trace start 100` |
| `diagnose debug flow trace stop` | Stop the flow trace. |  |
| `diagnose debug disable` | Stop printing debug output. |  |
| `diagnose debug reset` | Reset all debug levels to their defaults.<br>*Note:* Run it after every debug session so no debug keeps running in the background. |  |
| `diagnose sys session filter clear` | Clear the session filter before setting a new one. |  |
| `diagnose sys session filter <key> <value>` | Limit session list and session clear to matching sessions.<br>*Note:* Keys include src, dst, sport, dport, proto, policy, sintf, dintf and vd. Run several filter lines to combine them. Filters apply only to your current CLI session. | `diagnose sys session filter dst 203.0.113.10` |
| `diagnose sys session list` | List sessions that match the filter, or every session if no filter is set. |  |
| `diagnose sys session stat` | Show session table statistics. |  |
| `diagnose sys session clear` | **Destructive.** Clear the sessions that match the current filter.<br>**Warning:** With no filter set it clears every session on the FortiGate and drops all connections, including yours. Check the filter with diagnose sys session list first. |  |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `diagnose sys session clear`: With no filter set it clears every session on the FortiGate and drops all connections, including yours. Check the filter with diagnose sys session list first.

## High availability

| Command | What it does | Example |
|---|---|---|
| `get system ha status` | Show HA mode, cluster members, which unit is primary and why, and sync status.<br>*Note:* If every member reports itself as primary, the cluster is split (heartbeat lost). |  |
| `diagnose sys ha checksum cluster` | Show configuration checksums for every cluster member; matching values mean the configs are in sync.<br>*Note:* Run it from the global scope on a FortiGate with VDOMs. |  |
| `diagnose sys ha checksum show <global-or-vdom>` | Show detailed checksums on the unit you are logged in to, to find which part is out of sync. | `diagnose sys ha checksum show root` |

## Backup, reboot and reset

| Command | What it does | Example |
|---|---|---|
| `execute backup config tftp <file> <server> [<password>]` | Back up the configuration to a TFTP server.<br>*Note:* Other targets: ftp, sftp, usb and management-station. A password encrypts the backup file. | `execute backup config tftp fgt-backup.conf 192.168.10.5` |
| `execute restore config tftp <file> <server> [<password>]` | **Destructive.** Load a configuration file from a TFTP server.<br>**Warning:** Replaces the running configuration and restarts the FortiGate, so traffic stops during the reboot. | `execute restore config tftp fgt-backup.conf 192.168.10.5` |
| `execute tac report` | Run a large set of diagnostic commands and print the output for a support case or a baseline.<br>*Note:* Log the session in your SSH client; the output is long. |  |
| `execute reboot` | **Destructive.** Restart the FortiGate.<br>**Warning:** All traffic and VPNs stop until the unit is back up. Asks for confirmation. |  |
| `execute shutdown` | **Destructive.** Shut down the FortiGate.<br>**Warning:** The unit stays off until someone powers it on locally. Asks for confirmation. |  |
| `execute factoryreset` | **Destructive.** Reset the FortiGate to its factory default configuration.<br>**Warning:** Erases the whole configuration, including interfaces, policies, VPNs and admin accounts. Back up first. Asks for confirmation. |  |
| `execute factoryreset2` | **Destructive.** Reset to factory defaults but keep interface, VDOM and static route settings.<br>**Warning:** Erases policies, objects, VPNs and other settings. Back up first. |  |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `execute restore config tftp <file> <server> [<password>]`: Replaces the running configuration and restarts the FortiGate, so traffic stops during the reboot.
> - `execute reboot`: All traffic and VPNs stop until the unit is back up. Asks for confirmation.
> - `execute shutdown`: The unit stays off until someone powers it on locally. Asks for confirmation.
> - `execute factoryreset`: Erases the whole configuration, including interfaces, policies, VPNs and admin accounts. Back up first. Asks for confirmation.
> - `execute factoryreset2`: Erases policies, objects, VPNs and other settings. Back up first.

## FAQ

### How do I see the full configuration on a FortiGate from the CLI?

Run show to print every setting that differs from the defaults, or show full-configuration to include the default values too. Add a path to narrow it, for example show full-configuration system interface port1, and pipe to grep -f &lt;text&gt; to see each match inside its full config block.

### How do I capture packets on a FortiGate CLI?

Use diagnose sniffer packet &lt;interface&gt; '&lt;filter&gt;' &lt;verbose&gt; &lt;count&gt;, for example diagnose sniffer packet any 'host 192.0.2.10' 4 20. Verbose 4 shows which interface each packet used, and Ctrl+C stops the capture. Traffic offloaded to NP processors may not appear.

### How do I find which FortiGate policy is blocking traffic?

Set a filter with diagnose debug flow filter addr &lt;ip&gt;, run diagnose debug enable and diagnose debug flow trace start 100, then generate the traffic. The trace shows the route lookup and the policy that matched; a deny by policy 0 means the implicit deny. diagnose firewall iprope lookup gives the same answer without sending traffic. Finish with diagnose debug disable and diagnose debug reset.

### How do I check if FortiGate HA is in sync?

Run get system ha status to see the cluster members and sync status, then diagnose sys ha checksum cluster from the global scope. If every member shows the same checksums, the configurations match. If not, compare diagnose sys ha checksum show global and show &lt;vdom&gt; on each unit to find the part that differs.

## References

Every command above was checked against these official pages:

- [FortiOS 7.6.4 CLI Reference](https://docs.fortinet.com/document/fortigate/7.6.4/cli-reference/84566/fortios-cli-reference)
- [FortiOS 7.4 Administration Guide: CLI basics](https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/896276/cli-basics)
- [FortiOS 7.4 Administration Guide: Debugging the packet flow](https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/54688/debugging-the-packet-flow)
- [FortiOS 7.4 Administration Guide: Performing a sniffer trace or packet capture](https://docs.fortinet.com/document/fortigate/7.4.9/administration-guide/680228/performing-a-sniffer-trace-or-packet-capture)
- [FortiOS 7.4 Administration Guide: IPsec related diagnose commands](https://docs.fortinet.com/document/fortigate/7.4.0/administration-guide/44240/ipsec-related-diagnose-commands)
- [FortiOS 7.4 Administration Guide: Troubleshoot an HA formation](https://docs.fortinet.com/document/fortigate/7.4.4/administration-guide/946059/troubleshoot-an-ha-formation)
- [FortiOS 7.4 New Features: Policy lookup tool updated to policy match (7.4.1)](https://docs.fortinet.com/document/fortigate/7.4.0/new-features/482902/update-policy-lookup-tool-with-policy-match-tool-7-4-1)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
