# Ubiquiti EdgeOS and UniFi SSH commands cheat sheet

EdgeRouter commands for the EdgeOS CLI over SSH or the Web UI CLI button, plus the few SSH commands Ubiquiti documents for UniFi access points and switches. EdgeOS starts in operational mode ($); type configure to reach configuration mode (#).

| | |
|---|---|
| **Vendor** | Ubiquiti |
| **Platform** | EdgeOS (EdgeRouter) and UniFi devices |
| **Version scope** | EdgeOS 2.0.x (EdgeRouter) and UniFi Network devices over SSH |
| **Commands** | 48 (8 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/ubiquiti-unifi-edgeos](https://www.epifive.com/cheatsheets/ubiquiti-unifi-edgeos)

## Contents

- [EdgeOS access and operational mode](#edgeos-access-and-operational-mode)
- [EdgeOS configuration mode](#edgeos-configuration-mode)
- [EdgeOS common configuration](#edgeos-common-configuration)
- [EdgeOS firmware and system](#edgeos-firmware-and-system)
- [UniFi device SSH and adoption](#unifi-device-ssh-and-adoption)
- [UniFi firmware over SSH](#unifi-firmware-over-ssh)
- [FAQ](#faq)
- [References](#references)

## EdgeOS access and operational mode

| Command | What it does | Example |
|---|---|---|
| `ssh <username>@<router-ip>` | Open an SSH session to the EdgeRouter CLI.<br>*Note:* A factory-default EdgeRouter answers on 192.168.1.1 on eth0. Press ? to list commands, twice to add descriptions. | `ssh ubnt@192.168.1.1` |
| `show version` | Show the EdgeOS version, hardware model and serial number.<br>*Note:* The HW S/N value is the router's base MAC address. |  |
| `show interfaces` | List interfaces with IP addresses, state (S/L) and descriptions.<br>*Note:* S/L u/u means the interface is administratively up and the link is up. |  |
| `show ip route` | Show the IPv4 routing table.<br>*Note:* show ip route table &lt;number&gt; shows a policy-based routing table. |  |
| `show configuration commands \| no-more` | Print the whole configuration as set commands without paging.<br>*Note:* Useful for copying sections to another router or keeping a text backup. |  |
| `show system commit` | List the stored commit revisions.<br>*Note:* show system commit diff &lt;nr&gt; shows what that commit changed. |  |
| `ping <host>` | Send ICMP echo requests to test reachability.<br>*Note:* Press Ctrl+C to stop. From configuration mode, use run ping &lt;host&gt;. | `ping 198.51.100.10` |
| `traceroute <host>` | Trace the path to an IPv4 host or host name.<br>*Note:* Use traceroute6 for IPv6 destinations. | `traceroute 198.51.100.10` |
| `show interfaces ethernet <interface> capture` | Capture packets on an interface and print them in the terminal.<br>*Note:* Press Ctrl+C to stop. For filters and saving to a file, use sudo tcpdump. | `show interfaces ethernet eth0 capture port 22` |
| `sudo tcpdump -i <interface> -n <filter>` | Capture packets with tcpdump for more detailed filtering.<br>*Note:* Add -c &lt;count&gt; to stop after a number of packets and -w &lt;file&gt;.pcap to save for Wireshark. | `sudo tcpdump -i eth0 -n tcp dst port 22` |

## EdgeOS configuration mode

| Command | What it does | Example |
|---|---|---|
| `configure` | Enter configuration mode; the prompt changes from $ to #. |  |
| `set <config-path> <value>` | Add or change a configuration statement in the working configuration.<br>*Note:* Nothing changes on the router until you commit. | `set service dns forwarding listen-on eth1` |
| `delete <config-path>` | **Destructive.** Remove a configuration statement and everything under it.<br>**Warning:** After commit, the removed settings stop working at once; deleting an interface or service you are connected through can cut off your session. | `delete interfaces ethernet eth1` |
| `show` | In configuration mode, show the configuration tree or one part of it.<br>*Note:* Default values may be hidden. | `show service` |
| `compare` | Show the difference between the working configuration and the active one.<br>*Note:* Lines starting with + are additions and - are removals. Run it before commit. |  |
| `commit` | Apply the set and delete changes to the running (active) configuration.<br>*Note:* Committed changes are lost at the next reboot unless you also save. |  |
| `commit-confirm <minutes>` | Commit, then reboot automatically after the set minutes unless you confirm.<br>*Note:* Use it for remote changes that might lock you out. Type confirm to keep the change. | `commit-confirm 5` |
| `confirm` | Accept a pending commit-confirm and cancel the automatic reboot. |  |
| `commit comment <text>` | Commit and attach a comment that appears in show system commit. | `commit comment removed-telnet` |
| `save` | Write the active configuration to /config/config.boot so it survives a reboot.<br>*Note:* save &lt;file&gt; writes a copy to another file in /config, and save tftp://&lt;server&gt;/&lt;file&gt; copies it to a TFTP server. |  |
| `load <file>` | Load a saved configuration file into the working configuration.<br>*Note:* Nothing changes until you compare, commit and save. | `load backupconfig.boot` |
| `rollback <revision>` | **Destructive.** Return to an earlier commit revision.<br>**Warning:** The router reboots to apply it, and changes committed after that revision are lost. Check revisions with show system commit first. | `rollback 2` |
| `run <operational-command>` | Run an operational mode command without leaving configuration mode. | `run show interfaces` |
| `exit` | Leave configuration mode and return to operational mode. |  |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `delete <config-path>`: After commit, the removed settings stop working at once; deleting an interface or service you are connected through can cut off your session.
> - `rollback <revision>`: The router reboots to apply it, and changes committed after that revision are lost. Check revisions with show system commit first.

## EdgeOS common configuration

| Command | What it does | Example |
|---|---|---|
| `set interfaces ethernet <interface> address <ip>/<prefix>` | Assign a static IPv4 address to an Ethernet interface. | `set interfaces ethernet eth1 address 10.0.1.1/24` |
| `set interfaces ethernet <interface> vif <vlan-id> address <ip>/<prefix>` | Create a VLAN subinterface with an address on an Ethernet port.<br>*Note:* On models with a built-in switch, use set interfaces switch switch0 vif 10 address 10.0.10.1/24. | `set interfaces ethernet eth1 vif 10 address 10.0.10.1/24` |
| `set protocols static route <prefix> next-hop <gateway-ip>` | Add a static route through a next-hop gateway.<br>*Note:* 0.0.0.0/0 is the default route. Optional keywords include distance and description. | `set protocols static route 0.0.0.0/0 next-hop 203.0.113.1 distance 1` |
| `set service dhcp-server shared-network-name <name> subnet <subnet> default-router <ip>` | Set the gateway handed to DHCP clients in a subnet. | `set service dhcp-server shared-network-name LAN1 subnet 192.168.1.0/24 default-router 192.168.1.1` |
| `set service dhcp-server shared-network-name <name> subnet <subnet> dns-server <ip>` | Set the DNS server handed to DHCP clients. | `set service dhcp-server shared-network-name LAN1 subnet 192.168.1.0/24 dns-server 192.168.1.1` |
| `set service dhcp-server shared-network-name <name> subnet <subnet> start <first-ip> stop <last-ip>` | Set the range of addresses the DHCP server hands out.<br>*Note:* Set the lease time in seconds with lease 86400. | `set service dhcp-server shared-network-name LAN1 subnet 192.168.1.0/24 start 192.168.1.38 stop 192.168.1.243` |
| `set service dhcp-server shared-network-name <name> subnet <subnet> static-mapping <host> ip-address <ip>` | Reserve an IP address for a device.<br>*Note:* Pair it with static-mapping &lt;host&gt; mac-address &lt;mac-address&gt;. | `set service dhcp-server shared-network-name LAN1 subnet 192.168.1.0/24 static-mapping printer ip-address 192.168.1.240` |
| `set service dns forwarding name-server <ip>` | Set the upstream DNS server used by the router's DNS forwarder.<br>*Note:* Choose which LAN interfaces it answers on with set service dns forwarding listen-on &lt;interface&gt;. | `set service dns forwarding name-server 1.1.1.1` |
| `set system static-host-mapping host-name <name> inet <ip>` | Add a local DNS host entry served by the router. | `set system static-host-mapping host-name nas.example.com inet 192.168.1.20` |
| `set service nat rule <number> type masquerade` | Create a masquerade (source NAT) rule so LAN hosts share the WAN address.<br>*Note:* Also set outbound-interface eth0 (the WAN), protocol all and a description on the same rule, then commit ; save. | `set service nat rule 5010 type masquerade` |

## EdgeOS firmware and system

| Command | What it does | Example |
|---|---|---|
| `show system image` | List the installed firmware images and which one is running and which boots next. |  |
| `show system storage` | Show free storage space before a firmware upgrade.<br>*Note:* show system image storage shows how much space each image uses. |  |
| `add system image <url-or-file>` | Download and install a firmware image as the next boot image.<br>*Note:* Also accepts https://, tftp://, ftp:// and scp:// sources. Reboot to run the new image. | `add system image /tmp/firmware.tar` |
| `set system image default-boot` | Swap which of the two stored images boots next.<br>*Note:* Use it to go back to the previous firmware, then reboot. |  |
| `delete system image` | **Destructive.** Delete the stored backup (non-running) firmware image to free space.<br>**Warning:** The old image is gone, so you can no longer fall back to it with set system image default-boot. |  |
| `add system boot-image` | Update the bootloader from the running EdgeOS release.<br>*Note:* Check the version with show system boot-image, then reboot. Do not power off or reboot during the update. |  |
| `reboot` | **Destructive.** Restart the EdgeRouter.<br>**Warning:** All routing and connections stop until it is back up, and committed but unsaved changes are lost. Asks Proceed with reboot? \[confirm\]. |  |
| `sudo cp /opt/vyatta/etc/config.boot.default /config/config.boot` | **Destructive.** Replace the startup configuration with the factory default (reset on the next reboot).<br>**Warning:** After reboot all configuration is lost, including usernames and passwords; the router returns to 192.168.1.1 on eth0. Other system files are kept. |  |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `delete system image`: The old image is gone, so you can no longer fall back to it with set system image default-boot.
> - `reboot`: All routing and connections stop until it is back up, and committed but unsaved changes are lost. Asks Proceed with reboot? \[confirm\].
> - `sudo cp /opt/vyatta/etc/config.boot.default /config/config.boot`: After reboot all configuration is lost, including usernames and passwords; the router returns to 192.168.1.1 on eth0. Other system files are kept.

## UniFi device SSH and adoption

| Command | What it does | Example |
|---|---|---|
| `ssh <username>@<device-ip>` | Open an SSH session to a UniFi access point, switch or gateway.<br>*Note:* Before adoption devices use ui / ui (ubnt / ubnt on older devices). After adoption, find the credentials under Device SSH Settings in UniFi Network. Ubiquiti recommends SSH only when its support asks. | `ssh ui@192.168.1.20` |
| `set-inform http://<host>:8080/inform` | Point a factory-default device at a UniFi Network application for adoption.<br>*Note:* Ubiquiti calls this a last resort for Layer 3 or remote adoption. TCP 8080 must be reachable, and you may need to run it again after the device appears. Official UniFi Hosting shows a Copy Inform URL. | `set-inform http://192.168.1.10:8080/inform` |

## UniFi firmware over SSH

| Command | What it does | Example |
|---|---|---|
| `upgrade <firmware-url>` | **Destructive.** Download and install firmware on a UniFi access point, switch or USG.<br>**Warning:** The device reboots when done and drops clients meanwhile. Ubiquiti does not officially support SSH updates; copy the link from its release notes. | `upgrade https://dl.ui.com/unifi/firmware/<model>/<version>/<file>.bin` |
| `scp <firmware-file> <username>@<device-ip>:/tmp/fwupdate.bin` | Copy a firmware file from your computer to a device without internet access.<br>*Note:* Run it on your computer, then install with syswrapper.sh upgrade2 & on the device. | `scp firmware.bin ui@192.168.1.20:/tmp/fwupdate.bin` |
| `syswrapper.sh upgrade2 &` | **Destructive.** Install the firmware file at /tmp/fwupdate.bin on an access point or switch.<br>**Warning:** The device reboots when done. For the USW-Multi image, run fwutil -p /tmp/fwupdate.bin first. |  |
| `ubnt-systool fwupdate <firmware-url-or-file>` | **Destructive.** Update UniFi OS on a console or gateway over SSH.<br>**Warning:** The console reboots to finish the update. Ubiquiti warns that SSH updating may stop a console from working; use it only when its support asks. | `ubnt-systool fwupdate /tmp/fwupdate.bin` |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `upgrade <firmware-url>`: The device reboots when done and drops clients meanwhile. Ubiquiti does not officially support SSH updates; copy the link from its release notes.
> - `syswrapper.sh upgrade2 &`: The device reboots when done. For the USW-Multi image, run fwutil -p /tmp/fwupdate.bin first.
> - `ubnt-systool fwupdate <firmware-url-or-file>`: The console reboots to finish the update. Ubiquiti warns that SSH updating may stop a console from working; use it only when its support asks.

## FAQ

### What is the difference between commit and save on an EdgeRouter?

commit applies your set and delete changes to the active (running) configuration. save writes the active configuration to /config/config.boot, which the router loads at boot. If you commit without saving and the router reboots, the committed changes are lost. Run compare before commit to review the changes.

### How do I factory reset an EdgeRouter from the CLI?

Run sudo cp /opt/vyatta/etc/config.boot.default /config/config.boot and then reboot. This clears the whole configuration, including usernames and passwords, and the router comes back on 192.168.1.1 on eth0. It keeps other system files; the reset button clears both configuration and system files.

### How do I adopt a UniFi access point with set-inform?

Make sure the device is in its factory default state, SSH to it (ui / ui, or ubnt / ubnt on older devices) and run set-inform `http://<host>:8080/inform` with the address of your UniFi Network application. Then adopt it in UniFi Network, and repeat set-inform if it does not finish. The device must reach the application on TCP 8080. Ubiquiti treats SSH as a last resort after Layer 2 discovery, DHCP option 43, DNS or Zero-Touch Provisioning.

### How do I factory reset a UniFi access point or switch?

Ubiquiti documents two ways: choose Forget (or Unmanage) for the device in UniFi Network, which unmanages it and restores factory defaults, or hold the Reset button for 5 to 10 seconds while the device stays powered. The button reset does not remove the device from the application it was adopted to, so forget it there too if you are moving it.

## References

Every command above was checked against these official pages:

- [EdgeRouter - Configuration and Operational Mode (UISP Help Center)](https://help.uisp.com/hc/en-us/articles/22591199766551-EdgeRouter-Configuration-and-Operational-Mode)
- [EdgeRouter - Archiving and Managing the Configuration Files (UISP Help Center)](https://help.uisp.com/hc/en-us/articles/22591188157079-EdgeRouter-Archiving-and-Managing-the-Configuration-Files)
- [EdgeRouter - How to Upgrade the EdgeOS Firmware (UISP Help Center)](https://help.uisp.com/hc/en-us/articles/22591203404311-EdgeRouter-How-to-Upgrade-the-EdgeOS-Firmware)
- [EdgeRouter - How to Add a Static Route (UISP Help Center)](https://help.uisp.com/hc/en-us/articles/22591218256791-EdgeRouter-How-to-Add-a-Static-Route)
- [EdgeRouter - Reset to Factory Defaults (UISP Help Center)](https://help.uisp.com/hc/en-us/articles/22591216117015-EdgeRouter-Reset-to-Factory-Defaults)
- [Remote Adoption (Layer 3) (Ubiquiti Help Center)](https://help.ui.com/hc/en-us/articles/204909754-Remote-Adoption-Layer-3)
- [Connecting to UniFi with Debug Tools and SSH (Ubiquiti Help Center)](https://help.ui.com/hc/en-us/articles/204909374-UniFi-Connect-with-SSH-Advanced)
- [UniFi - Advanced Updating Techniques (Ubiquiti Help Center)](https://help.ui.com/hc/en-us/articles/204910064-UniFi-Advanced-Updating-Techniques)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
