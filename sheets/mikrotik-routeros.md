# MikroTik RouterOS v7 commands cheat sheet

Everyday RouterOS v7 terminal commands grouped by task, for SSH, the WinBox terminal or a serial console. RouterOS v7 accepts menu paths with spaces or slashes, so /ip address print and /ip/address/print run the same command.

| | |
|---|---|
| **Vendor** | MikroTik |
| **Platform** | RouterOS |
| **Version scope** | RouterOS v7 |
| **Commands** | 60 (5 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/mikrotik-routeros](https://www.epifive.com/cheatsheets/mikrotik-routeros)

## Contents

- [CLI basics and navigation](#cli-basics-and-navigation)
- [Users and management services](#users-and-management-services)
- [Interfaces, bridge and VLANs](#interfaces-bridge-and-vlans)
- [IP addressing, DHCP and DNS](#ip-addressing-dhcp-and-dns)
- [Routing and OSPF](#routing-and-ospf)
- [Firewall and NAT](#firewall-and-nat)
- [Troubleshooting](#troubleshooting)
- [Backup, upgrade and system](#backup-upgrade-and-system)
- [FAQ](#faq)
- [References](#references)

## CLI basics and navigation

| Command | What it does | Example |
|---|---|---|
| `/system identity set name=<name>` | Set the router name shown in the prompt, neighbor discovery and SNMP.<br>*Note:* Check it with /system identity print. | `/system identity set name=Office-GW` |
| `/system resource print` | Show uptime, RouterOS version, CPU load, free memory and free disk space.<br>*Note:* /system resource cpu print shows the load per core. |  |
| `print` | List the items of the current or named menu.<br>*Note:* Add detail for property=value output, where to filter, count-only to count. Item numbers change with each print. | `/ip address print` |
| `/export` | Print the configuration as commands, showing only values changed from the defaults.<br>*Note:* Run it inside a menu to export only that menu. Passwords and keys are hidden unless you add show-sensitive; user passwords are never exported. | `/ip firewall export` |
| `/export file=<name>` | Save the configuration export to a .rsc script file on the router.<br>*Note:* The file appears in /file print. Download it to keep an off-router copy. | `/export file=config-2026-10-28` |
| `/import <file>.rsc` | Run the commands in a .rsc script file.<br>*Note:* Add verbose=yes dry-run to simulate the import and find errors without changing the configuration. | `/import config-2026-10-28.rsc` |
| `Ctrl+X (or F4)` | Toggle safe mode in the terminal.<br>*Note:* If the session drops, changes made in safe mode are undone after the TCP timeout (about 9 minutes). Ctrl+D also undoes them; /quit keeps them. Safe mode holds up to 100 actions. |  |
| `/undo` | Undo the last configuration change.<br>*Note:* /redo reapplies it. /system history print lists recent changes. |  |

## Users and management services

| Command | What it does | Example |
|---|---|---|
| `/user add name=<name> password=<password> group=full` | Create an administrator account.<br>*Note:* The built-in groups are full, write and read. Even read includes the reboot and sensitive policies. | `/user add name=netadmin password=Use-A-Long-Passphrase group=full` |
| `/user set <name> password=<password>` | Change another user's password.<br>*Note:* Users change their own password with /password. | `/user set netadmin password=New-Long-Passphrase` |
| `/user remove admin` | **Destructive.** Delete the default admin account.<br>**Warning:** The account is gone at once. Log in with another full-group user first so you do not lock yourself out. |  |
| `/ip service print` | List management services such as winbox, ssh, telnet, ftp, www and api, with their ports and state. |  |
| `/ip service disable telnet,ftp,www,api` | Turn off management services you do not use.<br>*Note:* Keep at least one way in, such as SSH or WinBox, enabled before you disconnect. |  |
| `/ip service set ssh port=<port>` | Move a management service to another TCP port.<br>*Note:* MikroTik recommends blocking management access from the WAN with input-chain firewall rules as well. | `/ip service set ssh port=2200` |
| `/tool mac-server set allowed-interface-list=LAN` | Allow MAC Telnet only from interfaces in the LAN list.<br>*Note:* Do the same for MAC WinBox with /tool mac-server mac-winbox set allowed-interface-list=LAN. |  |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `/user remove admin`: The account is gone at once. Log in with another full-group user first so you do not lock yourself out.

## Interfaces, bridge and VLANs

| Command | What it does | Example |
|---|---|---|
| `/interface print` | List interfaces with their type, MTU and running state.<br>*Note:* /interface print stats shows packet, byte and error counters. |  |
| `/interface list add name=<list>` | Create an interface list for use in firewall and service settings.<br>*Note:* Add members with /interface list member add list=LAN interface=bridge1. | `/interface list add name=LAN` |
| `/interface bridge add name=<bridge>` | Create a bridge.<br>*Note:* Add vlan-filtering=yes only after the VLAN table is in place. | `/interface bridge add name=bridge1` |
| `/interface bridge port add bridge=<bridge> interface=<interface>` | Add a port to the bridge, optionally as an access port with a PVID.<br>*Note:* PVID has no effect until VLAN filtering is enabled on the bridge. | `/interface bridge port add bridge=bridge1 interface=ether2 pvid=20` |
| `/interface bridge vlan add bridge=<bridge> tagged=<ports> untagged=<ports> vlan-ids=<id>` | Add a bridge VLAN table entry with its tagged (trunk) and untagged (access) ports.<br>*Note:* For router access to a VLAN, also tag the bridge itself, for example tagged=bridge1,ether1. | `/interface bridge vlan add bridge=bridge1 tagged=ether1 untagged=ether2 vlan-ids=20` |
| `/interface bridge set <bridge> vlan-filtering=yes` | Turn on VLAN filtering so the bridge enforces the VLAN table.<br>*Note:* This can cut off your own access. Make the change from a serial console or a port outside the bridge, or in safe mode. | `/interface bridge set bridge1 vlan-filtering=yes` |
| `/interface vlan add interface=<bridge> name=<name> vlan-id=<id>` | Create a VLAN interface so the router can have an IP address in that VLAN. | `/interface vlan add interface=bridge1 name=VLAN99 vlan-id=99` |

## IP addressing, DHCP and DNS

| Command | What it does | Example |
|---|---|---|
| `/ip address add address=<ip>/<prefix> interface=<interface>` | Assign an IPv4 address to an interface. | `/ip address add address=192.168.88.1/24 interface=bridge1` |
| `/ip dhcp-client add interface=<interface>` | Get an address, default route and DNS servers from the ISP by DHCP.<br>*Note:* Check what it received with /ip dhcp-client print detail. | `/ip dhcp-client add interface=ether1` |
| `/ip pool add name=<pool> ranges=<start>-<end>` | Create an address pool for the DHCP server.<br>*Note:* Do not include the router's own address in the pool. | `/ip pool add name=dhcp_pool0 ranges=192.168.88.10-192.168.88.254` |
| `/ip dhcp-server setup` | Run the wizard that creates the pool, DHCP network and server in one step.<br>*Note:* It asks for the interface, address space, gateway, address range, DNS servers and lease time. |  |
| `/ip dhcp-server add name=<name> interface=<interface> address-pool=<pool>` | Create a DHCP server on an interface. | `/ip dhcp-server add name=dhcp1 interface=bridge1 address-pool=dhcp_pool0` |
| `/ip dhcp-server network add address=<subnet> gateway=<ip> dns-server=<ip>` | Set the gateway and DNS server handed to DHCP clients in a subnet. | `/ip dhcp-server network add address=192.168.88.0/24 gateway=192.168.88.1 dns-server=192.168.88.1` |
| `/ip dhcp-server lease print` | List DHCP leases with address, MAC address, host name and status. |  |
| `/ip dhcp-server lease make-static <number>` | Turn a dynamic lease into a static reservation.<br>*Note:* Use the item number from the last lease print. | `/ip dhcp-server lease make-static 0` |
| `/ip dns set servers=<dns1>,<dns2>` | Set the upstream DNS servers the router uses.<br>*Note:* allow-remote-requests=yes makes the router a DNS server for the LAN. Block port 53 from the WAN if you enable it. | `/ip dns set servers=1.1.1.1,9.9.9.9` |

## Routing and OSPF

| Command | What it does | Example |
|---|---|---|
| `/ip route add gateway=<next-hop>` | Add a default route (0.0.0.0/0) through a gateway.<br>*Note:* Not needed when the DHCP client already adds the default route. | `/ip route add gateway=203.0.113.1` |
| `/ip route add dst-address=<prefix> gateway=<next-hop>` | Add a static route to a network. | `/ip route add dst-address=10.0.1.0/24 gateway=10.0.0.1` |
| `/ip route print` | Show the IPv4 routing table.<br>*Note:* /routing route print shows routes of all address families with every attribute. | `/ip route print where dst-address=10.0.1.0/24` |
| `/routing ospf instance add name=<name> version=2 router-id=<id>` | Create an OSPFv2 instance (RouterOS v7 syntax).<br>*Note:* In v7 OSPFv2 and OSPFv3 share the /routing ospf menu and there is no default instance. | `/routing ospf instance add name=v2inst version=2 router-id=10.255.255.1` |
| `/routing ospf area add name=<name> area-id=<id> instance=<instance>` | Add an OSPF area to an instance. | `/routing ospf area add name=backbone_v2 area-id=0.0.0.0 instance=v2inst` |
| `/routing ospf interface-template add networks=<prefix> area=<area>` | Run OSPF on interfaces whose addresses fall in the given networks.<br>*Note:* Use interfaces=&lt;name&gt; instead of networks= to match by interface. | `/routing ospf interface-template add networks=192.168.88.0/24 area=backbone_v2` |
| `/routing ospf neighbor print` | List OSPF neighbors and their adjacency state.<br>*Note:* A healthy adjacency reaches the Full state (2-way is normal between non-DR routers). |  |

## Firewall and NAT

| Command | What it does | Example |
|---|---|---|
| `/ip firewall filter add chain=input connection-state=established,related,untracked action=accept` | Accept return traffic to the router.<br>*Note:* Rules are checked top to bottom and the first match wins. Put this rule first. |  |
| `/ip firewall filter add chain=input connection-state=invalid action=drop` | Drop invalid packets addressed to the router. |  |
| `/ip firewall filter add chain=input src-address-list=<list> action=accept` | Accept traffic to the router from addresses in an address list. | `/ip firewall filter add chain=input src-address-list=allowed_to_router action=accept` |
| `/ip firewall filter add chain=input in-interface=<wan> action=drop` | Drop everything else that reaches the router from the WAN.<br>*Note:* Add it last, after the accept rules for the access you still need, or use safe mode in case it locks you out. | `/ip firewall filter add chain=input in-interface=ether1 action=drop` |
| `/ip firewall nat add chain=srcnat out-interface=<wan> action=masquerade` | Share the WAN address with the LAN (source NAT that follows a changing WAN IP).<br>*Note:* Masquerade is meant for a dynamic WAN IP (DHCP or PPPoE). With a fixed public IP you can use action=src-nat to-addresses=&lt;public-ip&gt;. | `/ip firewall nat add chain=srcnat out-interface=ether1 action=masquerade` |
| `/ip firewall nat add chain=dstnat in-interface=<wan> protocol=tcp dst-port=<port> action=dst-nat to-addresses=<lan-ip> to-ports=<port>` | Forward a port from the WAN to a LAN host. | `/ip firewall nat add chain=dstnat in-interface=ether1 protocol=tcp dst-port=443 action=dst-nat to-addresses=192.168.88.20 to-ports=443` |
| `/ip firewall address-list add list=<list> address=<address>` | Add an address, range or prefix to a named address list.<br>*Note:* List entries with /ip firewall address-list print where list=blocked. | `/ip firewall address-list add list=blocked address=203.0.113.0/24` |
| `/ip firewall filter print stats` | Show packet and byte counters for each filter rule.<br>*Note:* Use it to see which rule is matching or dropping traffic. |  |

## Troubleshooting

| Command | What it does | Example |
|---|---|---|
| `/ping <host> count=<n>` | Send ICMP echo requests to test reachability.<br>*Note:* Add src-address=, interface= or size= with do-not-fragment to test specific paths and MTU. | `/ping 198.51.100.10 count=3` |
| `/tool traceroute <host>` | List the hops on the path to a host with loss and round-trip times. | `/tool traceroute 198.51.100.10 count=3` |
| `/tool torch <interface>` | Show live traffic flows on an interface, grouped by address, protocol and port.<br>*Note:* Torch sees traffic before the firewall filters it. Press Ctrl+C to stop, or add duration=10s. | `/tool torch ether1 src-address=192.168.88.21/32` |
| `/tool sniffer quick interface=<interface>` | Capture packets and print them live in the terminal.<br>*Note:* Press Q to stop. Packets handled by a hardware-offloaded bridge are not visible. | `/tool sniffer quick interface=ether1 port=bootps,bootpc duration=10s` |
| `/log print` | Show the log entries kept in memory.<br>*Note:* Add follow-only to watch new entries as they arrive. | `/log print where topics~"dhcp"` |
| `/interface monitor-traffic <interface>` | Show live receive and transmit rates for an interface.<br>*Note:* Without duration it refreshes until you press Ctrl+C. | `/interface monitor-traffic ether1 duration=3` |

## Backup, upgrade and system

| Command | What it does | Example |
|---|---|---|
| `/system backup save name=<name> password=<password>` | Save the whole configuration to an encrypted binary .backup file.<br>*Note:* Without a password the backup is unencrypted. Restore it on the same device, ideally on the same RouterOS version. | `/system backup save name=config-before-update password=Use-A-Long-Passphrase` |
| `/system backup load name=<name> password=<password>` | **Destructive.** Restore a binary backup.<br>**Warning:** Replaces the entire current configuration and reboots the router. Changes made since the backup are lost. | `/system backup load name=config-before-update password=Use-A-Long-Passphrase` |
| `/system reboot` | **Destructive.** Restart the router.<br>**Warning:** Drops every connection and all traffic until the router is back up. Asks for confirmation. |  |
| `/system reset-configuration` | **Destructive.** Erase the configuration and reboot to the default or an empty configuration.<br>**Warning:** All settings, including IP addresses, firewall rules and users, are lost. keep-users=yes keeps user accounts; no-defaults=yes skips the default configuration; skip-backup=yes skips the automatic backup. | `/system reset-configuration no-defaults=yes skip-backup=yes` |
| `/system package update set channel=<channel>` | Choose the release channel used when checking for updates.<br>*Note:* Channels are long-term, stable, testing and development. | `/system package update set channel=stable` |
| `/system package update check-for-updates` | Check MikroTik's server for a newer RouterOS version in the selected channel.<br>*Note:* The router itself needs DNS and HTTPS access to the download server. |  |
| `/system package update install` | **Destructive.** Download and install the latest RouterOS packages, then reboot.<br>**Warning:** The router reboots automatically and drops all traffic during the upgrade. Save a backup first. Use download instead to install at the next manual reboot. |  |
| `/system routerboard upgrade` | Upgrade the RouterBOOT bootloader to match the installed RouterOS.<br>*Note:* Takes effect after the next /system reboot. MikroTik recommends it after every RouterOS upgrade. |  |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `/system backup load name=<name> password=<password>`: Replaces the entire current configuration and reboots the router. Changes made since the backup are lost.
> - `/system reboot`: Drops every connection and all traffic until the router is back up. Asks for confirmation.
> - `/system reset-configuration`: All settings, including IP addresses, firewall rules and users, are lost. keep-users=yes keeps user accounts; no-defaults=yes skips the default configuration; skip-backup=yes skips the automatic backup.
> - `/system package update install`: The router reboots automatically and drops all traffic during the upgrade. Save a backup first. Use download instead to install at the next manual reboot.

## FAQ

### How do I back up a MikroTik router from the command line?

Use two kinds of backup. /export file=&lt;name&gt; writes a readable .rsc script that you can edit and import on another router; passwords and keys are hidden unless you add show-sensitive, and user passwords are never exported. /system backup save name=&lt;name&gt; password=&lt;password&gt; writes an encrypted binary copy of the whole configuration, meant to be restored on the same device. Download both files from /file so a copy lives off the router.

### What is safe mode in MikroTik and how do I use it?

Press Ctrl+X (or F4) in the terminal and the prompt shows SAFE. If your session drops while safe mode is on, RouterOS undoes every change made in safe mode once the TCP timeout (about 9 minutes) passes. Press Ctrl+X again to keep the changes. Ctrl+D also undoes them, while /quit keeps them. Safe mode only tracks 100 actions, so make risky changes in small steps.

### How do I upgrade RouterOS from the CLI?

Save a backup, then run /system package update set channel=stable, /system package update check-for-updates and /system package update install. The router downloads the packages and reboots on its own. After it is back, run /system routerboard upgrade and reboot again to update the bootloader. A router on v6 sees v7.12.1 first in the upgrade channel and must install that before newer v7 releases appear.

### What changed in the RouterOS v7 CLI compared with v6?

Menu paths can be typed with spaces or slashes, so /ip/route/print and /ip route print are the same. OSPF moved to /routing ospf, where you create an instance, an area and an interface-template yourself because v7 has no defaults. Routing rules moved from /ip route rule to /routing rule, and custom routing tables must be created in /routing table before you use them.

## References

Every command above was checked against these official pages:

- [MikroTik RouterOS manual: Console](https://manual.mikrotik.com/docs/management-tools/console/)
- [MikroTik RouterOS manual: Configuration Management](https://manual.mikrotik.com/docs/getting-started/configuration-management/)
- [MikroTik RouterOS documentation: First Time Configuration](https://help.mikrotik.com/docs/spaces/ROS/pages/328151/First+Time+Configuration)
- [MikroTik RouterOS manual: Bridge VLAN Table](https://manual.mikrotik.com/docs/bridging-and-switching/user-guides/bridge-vlan-table/)
- [MikroTik RouterOS manual: DHCP Server](https://manual.mikrotik.com/docs/network-management/dhcp/server/)
- [MikroTik RouterOS documentation: OSPF](https://help.mikrotik.com/docs/spaces/ROS/pages/9863229/OSPF)
- [MikroTik RouterOS manual: Torch](https://manual.mikrotik.com/docs/diagnostics-monitoring-and-troubleshooting/torch/)
- [MikroTik RouterOS manual: Upgrade](https://manual.mikrotik.com/docs/getting-started/installation-and-upgrade/upgrade/)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
