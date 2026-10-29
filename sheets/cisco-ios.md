# Cisco IOS and IOS XE commands cheat sheet

Everyday Cisco CLI commands for switches and routers, grouped by task. The prompt shows the mode: &gt; is user EXEC, # is privileged EXEC and (config)# is configuration mode. Changes go live at once but are lost on reboot until you save them.

| | |
|---|---|
| **Vendor** | Cisco |
| **Platform** | IOS and IOS XE |
| **Version scope** | Cisco IOS XE 17.x (most commands also work on IOS 15.x) |
| **Commands** | 60 (4 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/cisco-ios](https://www.epifive.com/cheatsheets/cisco-ios)

## Contents

- [Basics and modes](#basics-and-modes)
- [Device setup and secure access](#device-setup-and-secure-access)
- [Interfaces](#interfaces)
- [VLANs and trunks](#vlans-and-trunks)
- [Routing](#routing)
- [Show and troubleshooting](#show-and-troubleshooting)
- [Saving and managing the configuration](#saving-and-managing-the-configuration)
- [FAQ](#faq)
- [References](#references)

## Basics and modes

| Command | What it does | Example |
|---|---|---|
| `enable` | Enter privileged EXEC mode from user EXEC mode.<br>*Note:* The prompt changes from &gt; to #. Use disable to go back to user EXEC. | `Switch> enable` |
| `configure terminal` | Enter global configuration mode.<br>*Note:* The prompt becomes (config)#. Commands take effect in the running configuration as soon as you enter them. | `Switch# configure terminal` |
| `end` | Return to privileged EXEC mode from any configuration mode.<br>*Note:* Ctrl-Z does the same. exit moves up only one level, for example from (config-if)# to (config)#. |  |
| `?` | List the commands, keywords or arguments available at this point.<br>*Note:* Type part of a word followed by ? (for example sh?) to list the commands that start with it. | `show ?` |
| `do <exec-command>` | Run a show or other EXEC command without leaving configuration mode.<br>*Note:* do cannot run configure terminal. | `do show ip interface brief` |
| `<show-command> \| include <regex>` | Show only the output lines that match a pattern.<br>*Note:* Use \| begin to start at the first match and \| exclude to hide matching lines. Patterns are case sensitive. | `show running-config \| include hostname` |

## Device setup and secure access

| Command | What it does | Example |
|---|---|---|
| `hostname <name>` | Set the device name shown in the prompt.<br>*Note:* Start with a letter and use only letters, digits and hyphens, up to 63 characters. | `hostname SW1-OFFICE` |
| `enable secret <password>` | Set the password for privileged EXEC mode, stored as a one-way hash.<br>*Note:* Use enable secret rather than enable password. If both exist, enable secret wins. | `enable secret Ch4nge-Me-2026` |
| `username <name> privilege 15 secret <password>` | Create a local admin account with a hashed password.<br>*Note:* Privilege 15 gives the user privileged EXEC access. Use secret, not password, so it is not stored reversibly. | `username netadmin privilege 15 secret Ch4nge-Me-2026` |
| `ip domain name <domain>` | Set the default DNS domain name of the device.<br>*Note:* A hostname and domain name are needed before you can generate the RSA key for SSH. Older releases use ip domain-name. | `ip domain name example.com` |
| `crypto key generate rsa general-keys modulus <bits>` | Generate the RSA key pair that turns on the SSH server.<br>*Note:* Use 2048 bits or more. If SSH commands are rejected, the key was not generated. | `crypto key generate rsa general-keys modulus 2048` |
| `ip ssh version 2` | Accept only SSH version 2 connections.<br>*Note:* Without this command the SSH server runs in compatibility mode and also accepts SSH version 1. Check with show ip ssh. |  |
| `line vty 0 15` | Enter configuration mode for the virtual terminal (SSH and Telnet) lines.<br>*Note:* The number of lines varies by platform (Catalyst 9000 switches have more). Apply SSH-only settings to every line. |  |
| `login local` | Make the selected lines check logins against the local username database.<br>*Note:* If aaa new-model is configured, AAA method lists control login instead. | `Switch(config-line)# login local` |
| `transport input ssh` | Allow only SSH, not Telnet, on the selected lines. | `Switch(config-line)# transport input ssh` |
| `banner motd <c> <message> <c>` | Set the message of the day shown to everyone who connects.<br>*Note:* &lt;c&gt; is any delimiter character that does not appear in the message. | `banner motd # Authorized access only. Activity is logged. #` |
| `ntp server <ip-address>` | Sync the device clock with an NTP server.<br>*Note:* Add prefer to the server you want used first when several are configured. | `ntp server 192.0.2.123` |
| `logging host <ip-address>` | Send syslog messages to a remote syslog server.<br>*Note:* Repeat for more servers. logging trap &lt;level&gt; sets the lowest severity sent; the default is informational. | `logging host 192.0.2.50` |

## Interfaces

| Command | What it does | Example |
|---|---|---|
| `interface <interface>` | Enter configuration mode for one interface.<br>*Note:* Abbreviations such as gi1/0/1 also work. | `interface GigabitEthernet1/0/1` |
| `interface range <interface> - <last-port>` | Configure several interfaces at once.<br>*Note:* Put a space before the hyphen. Separate several ranges with a comma. | `interface range GigabitEthernet1/0/1 - 24` |
| `description <text>` | Label an interface so its purpose shows in the configuration and show output. | `description Uplink to core switch` |
| `ip address <ip-address> <subnet-mask>` | Assign an IPv4 address to a routed interface or SVI.<br>*Note:* On a switch, use it on an SVI (interface vlan) or on a physical port first turned into a routed port with no switchport. | `ip address 192.168.10.1 255.255.255.0` |
| `shutdown` | Administratively disable an interface.<br>*Note:* The interface shows as administratively down until you enter no shutdown. |  |
| `no shutdown` | Enable an interface that was shut down.<br>*Note:* Check the result with show ip interface brief. |  |
| `interface vlan <vlan-id>` | Create or edit a switched virtual interface (SVI) for a VLAN.<br>*Note:* Give it an IP address to manage the switch or to route between VLANs (with ip routing). | `interface vlan 10` |

## VLANs and trunks

| Command | What it does | Example |
|---|---|---|
| `vlan <vlan-id>` | Create a VLAN and enter VLAN configuration mode.<br>*Note:* Valid IDs are 1 to 4094. The prompt becomes (config-vlan)#. | `vlan 10` |
| `name <vlan-name>` | Give the VLAN a name.<br>*Note:* Without a name the VLAN is called VLAN followed by its zero-padded ID, such as VLAN0010. | `name STAFF` |
| `switchport mode access` | Make the port an access port that carries one untagged VLAN. |  |
| `switchport access vlan <vlan-id>` | Put an access port in a VLAN.<br>*Note:* If the VLAN does not exist yet, the switch creates it. | `switchport access vlan 10` |
| `switchport mode trunk` | Make the port an 802.1Q trunk that carries several tagged VLANs. |  |
| `switchport trunk native vlan <vlan-id>` | Set the VLAN used for untagged traffic on a trunk.<br>*Note:* The default is VLAN 1. Use the same native VLAN on both ends of the trunk or spanning-tree loops can result. | `switchport trunk native vlan 99` |
| `switchport trunk allowed vlan <vlan-list>` | Set the exact list of VLANs a trunk may carry.<br>*Note:* This replaces the existing list. Use ranges like 10-20 with no spaces. All VLANs are allowed by default. | `switchport trunk allowed vlan 10,20,99` |
| `switchport trunk allowed vlan add <vlan-list>` | Add VLANs to a trunk's allowed list without replacing it.<br>*Note:* The same command takes remove, except, all and none. | `switchport trunk allowed vlan add 30` |
| `show vlan brief` | List VLANs with their names, status and access ports. |  |
| `show interfaces trunk` | Show trunk ports with their native VLAN and allowed and active VLANs.<br>*Note:* For one port's mode, native VLAN and allowed list, use show interfaces &lt;interface&gt; switchport. |  |

## Routing

| Command | What it does | Example |
|---|---|---|
| `ip routing` | Turn on IPv4 routing on a Layer 3 switch.<br>*Note:* Catalyst switches start in Layer 2 mode with IP routing disabled. |  |
| `ip route <prefix> <mask> {<next-hop> \| <interface>} [<distance>]` | Add a static route.<br>*Note:* Set a distance higher than your routing protocol's to make a floating backup route. Remove it with no ip route. | `ip route 10.20.0.0 255.255.0.0 192.168.1.2` |
| `ip route 0.0.0.0 0.0.0.0 <next-hop>` | Add a default route (gateway of last resort). | `ip route 0.0.0.0 0.0.0.0 203.0.113.1` |
| `router ospf <process-id>` | Start an OSPF process and enter router configuration mode.<br>*Note:* The process ID is local to the device and does not have to match neighbors. | `router ospf 1` |
| `network <address> <wildcard-mask> area <area-id>` | Run OSPF on interfaces whose addresses match the range and place them in an area.<br>*Note:* Uses a wildcard (inverse) mask, not a subnet mask. Every area must connect to backbone area 0. | `network 192.168.10.0 0.0.0.255 area 0` |
| `show ip route` | Show the routing table, including the gateway of last resort.<br>*Note:* Codes at the start of each line show the source, for example C connected, S static, O OSPF. | `show ip route 10.20.0.0` |
| `show ip ospf neighbor` | List OSPF neighbors and their adjacency state.<br>*Note:* Add detail for more. Neighbors that exchange routes reach FULL; DROTHER pairs on a LAN stay at 2WAY. |  |

## Show and troubleshooting

| Command | What it does | Example |
|---|---|---|
| `show version` | Show the software version, uptime and hardware model. | `show version \| include Version` |
| `show running-config` | Show the configuration currently in use.<br>*Note:* Add interface &lt;interface&gt; to see just one interface. |  |
| `show ip interface brief` | List interfaces with their IP address and up or down status in one line each.<br>*Note:* Status administratively down means the interface is shut down. |  |
| `show interfaces status` | List switch ports with description, status, VLAN, duplex, speed and type. | `show interfaces status err-disabled` |
| `show interfaces <interface>` | Show detailed status and counters for an interface, including errors.<br>*Note:* Reset the counters with clear counters &lt;interface&gt;. | `show interfaces GigabitEthernet1/0/1` |
| `show cdp neighbors` | List directly connected Cisco devices and the ports that link them.<br>*Note:* detail adds IP address, software version and native VLAN. CDP must be enabled (cdp run). | `show cdp neighbors detail` |
| `show mac address-table` | Show the MAC addresses the switch has learned and the port and VLAN for each.<br>*Note:* Filter with address &lt;mac&gt;, interface &lt;interface&gt;, vlan &lt;vlan-id&gt; or dynamic. | `show mac address-table interface GigabitEthernet1/0/5` |
| `ping <ip-address>` | Send ICMP echo requests to test reachability.<br>*Note:* ! means a reply and . means a timeout. Type ping alone in privileged EXEC mode for extended ping (source, count, size). | `ping 192.0.2.10` |
| `traceroute <ip-address>` | Show the hops packets take to reach a destination.<br>*Note:* \* means a probe timed out. | `traceroute 198.51.100.25` |
| `debug <feature>` | Print live diagnostic messages for a feature.<br>*Note:* Debug output can load the CPU heavily on a busy device. On an SSH session, run terminal monitor to see it. | `debug ip ssh` |
| `undebug all` | Turn off all debugging.<br>*Note:* Same as no debug all. Turning off console logging only hides output; it does not stop the debug. |  |

## Saving and managing the configuration

| Command | What it does | Example |
|---|---|---|
| `copy running-config startup-config` | Save the running configuration so it survives a reload.<br>*Note:* Short form of copy system:running-config nvram:startup-config. |  |
| `write memory` | Save the running configuration to NVRAM.<br>*Note:* Same result as copy running-config startup-config. |  |
| `show startup-config` | Show the saved configuration the device will load at the next boot. |  |
| `reload` | **Destructive.** Restart the device.<br>**Warning:** Drops all traffic through the device while it boots, and any unsaved changes in the running configuration are lost. Answer no at the save prompt only if you mean to discard them. |  |
| `reload in <minutes>` | **Destructive.** Schedule a restart after a number of minutes.<br>**Warning:** The device restarts and loses unsaved changes when the timer runs out. Useful as a safety net before risky remote changes; cancel it with reload cancel once you know you still have access. | `reload in 10` |
| `erase startup-config` | **Destructive.** Delete the saved startup configuration.<br>**Warning:** The saved configuration is gone and cannot be restored on most platforms. After the next reload the device boots with no configuration. Back it up first. |  |
| `write erase` | **Destructive.** Delete the saved startup configuration (older form of erase nvram:).<br>**Warning:** Same effect as erase startup-config: the saved configuration is lost and the device boots unconfigured after a reload. Cisco documents erase nvram: as the replacement. |  |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `reload`: Drops all traffic through the device while it boots, and any unsaved changes in the running configuration are lost. Answer no at the save prompt only if you mean to discard them.
> - `reload in <minutes>`: The device restarts and loses unsaved changes when the timer runs out. Useful as a safety net before risky remote changes; cancel it with reload cancel once you know you still have access.
> - `erase startup-config`: The saved configuration is gone and cannot be restored on most platforms. After the next reload the device boots with no configuration. Back it up first.
> - `write erase`: Same effect as erase startup-config: the saved configuration is lost and the device boots unconfigured after a reload. Cisco documents erase nvram: as the replacement.

## FAQ

### What is the difference between write memory and copy running-config startup-config?

Both save the running configuration so it is loaded at the next boot. copy running-config startup-config is the documented form and short for copy system:running-config nvram:startup-config. write memory is the older command that saves the running configuration to NVRAM. On a normal switch or router the result is the same.

### What is the difference between enable secret and enable password?

Both protect privileged EXEC mode. enable secret stores a one-way hash (type 9 by default on current IOS XE), while enable password is kept in clear text unless service password-encryption applies weak, reversible type 7 encryption. If both are configured, enable secret takes precedence. Cisco recommends enable secret.

### How do I enable SSH on a Cisco switch or router?

Set a hostname and ip domain name, create a local user with username &lt;name&gt; privilege 15 secret &lt;password&gt;, generate a key with crypto key generate rsa general-keys modulus 2048, and set ip ssh version 2. Then under line vty enter login local and transport input ssh. Check it with show ip ssh, and save with copy running-config startup-config.

### How do I reset a Cisco switch to a blank configuration?

From privileged EXEC mode run erase startup-config (or write erase), then reload. When asked whether to save the modified configuration, answer no, otherwise the running configuration is written back. The device then boots with no configuration. Back up the configuration first.

## References

Every command above was checked against these official pages:

- [Cisco Catalyst 9300 Command Reference, IOS XE 17.17.x: Using the Command-Line Interface](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-17/command_reference/b_1717_9300_cr/using_the_command_line_interface.html)
- [Cisco Catalyst 9300 System Management Configuration Guide, IOS XE 17.17.x: Administering the Device](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-17/configuration_guide/sys_mgmt/b_1717_sys_mgmt_9300_cg/administering_the_device.html)
- [Cisco Catalyst 9300 Security Configuration Guide, IOS XE 17.17.x: Controlling Switch Access with Passwords and Privilege Levels](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-17/configuration_guide/sec/b_1717_sec_9300_cg/controlling_switch_access_with_passwords_and_privilege_levels.html)
- [Cisco: Configure SSH on Routers](https://www.cisco.com/c/en/us/support/docs/security-vpn/secure-shell-ssh/4145-ssh.html)
- [Cisco Catalyst 9300 Interface and Hardware Configuration Guide, IOS XE 17.17.x: Configuring Interface Characteristics](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-17/configuration_guide/int_hw/b_1717_int_and_hw_9300_cg/configuring_interface_characteristics.html)
- [Cisco Catalyst 9300 VLAN Configuration Guide, IOS XE 17.17.x: Configuring VLAN Trunks](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-17/configuration_guide/vlan/b_1717_vlan_9300_cg/configuring_vlan_trunks.html)
- [Cisco Catalyst 9300 IP Routing Configuration Guide, IOS XE 17.17.x: Configuring OSPF](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-17/configuration_guide/rtng/b_1717_rtng_9300_cg/configuring_ospf.html)
- [Cisco Catalyst 9300 System Management Configuration Guide, IOS XE 17.17.x: Managing Configuration Files](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/software/release/17-17/configuration_guide/sys_mgmt/b_1717_sys_mgmt_9300_cg/managing_configuration_files.html)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
