# Linux networking commands cheat sheet

Modern Linux tools for checking and changing network settings. Commands that change addresses, routes, connections or firewall rules need root, so prefix them with sudo. Changes made with ip are lost on reboot; use nmcli or your distribution's network config to make them permanent.

| | |
|---|---|
| **Vendor** | Linux |
| **Platform** | Linux (Debian, Ubuntu, RHEL and derivatives) |
| **Version scope** | Current iproute2, NetworkManager 1.4x, nftables 1.x, BIND 9 dig and tcpdump 4.99 (Debian/Ubuntu/RHEL) |
| **Commands** | 57 (7 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/linux-networking](https://www.epifive.com/cheatsheets/linux-networking)

## Contents

- [Interfaces and addresses](#interfaces-and-addresses)
- [Routes and neighbours](#routes-and-neighbours)
- [Sockets and ports](#sockets-and-ports)
- [NetworkManager (nmcli)](#networkmanager-nmcli)
- [DNS lookups](#dns-lookups)
- [Path and reachability](#path-and-reachability)
- [Packet capture (tcpdump)](#packet-capture-tcpdump)
- [nftables firewall basics](#nftables-firewall-basics)
- [FAQ](#faq)
- [References](#references)

## Interfaces and addresses

| Command | What it does | Example |
|---|---|---|
| `ip -br address` | List every interface with its state and IP addresses in a short table.<br>*Note:* ip objects can be abbreviated: a for address, r for route, n for neigh. | `ip -br a` |
| `ip -br link` | List interfaces with their link state and MAC address. |  |
| `ip -s link show dev <interface>` | Show link details plus RX and TX packet, error and drop counters. | `ip -s link show dev eth0` |
| `ip link set dev <interface> up` | Bring an interface up. | `ip link set dev eth0 up` |
| `ip link set dev <interface> down` | **Destructive.** Take an interface down.<br>**Warning:** Drops all traffic on that interface; running it on the interface you are connected through cuts off your SSH session. | `ip link set dev eth1 down` |
| `ip link set dev <interface> mtu <bytes>` | Change the MTU of an interface. | `ip link set dev eth0 mtu 1400` |
| `ip address add <ip>/<prefix> dev <interface>` | Add an IP address to an interface. | `ip address add 192.0.2.10/24 dev eth0` |
| `ip address del <ip>/<prefix> dev <interface>` | **Destructive.** Remove one IP address from an interface.<br>**Warning:** Removing the address you are connected to drops your session. | `ip address del 192.0.2.10/24 dev eth0` |
| `ip address flush dev <interface>` | **Destructive.** Remove all IP addresses from an interface.<br>**Warning:** Removes every matching address at once with no undo. Without scope global it also removes IPv6 link-local addresses. | `ip address flush dev eth4 scope global` |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `ip link set dev <interface> down`: Drops all traffic on that interface; running it on the interface you are connected through cuts off your SSH session.
> - `ip address del <ip>/<prefix> dev <interface>`: Removing the address you are connected to drops your session.
> - `ip address flush dev <interface>`: Removes every matching address at once with no undo. Without scope global it also removes IPv6 link-local addresses.

## Routes and neighbours

| Command | What it does | Example |
|---|---|---|
| `ip route` | Show the main routing table.<br>*Note:* -6 shows IPv6 routes. | `ip -6 route` |
| `ip route add default via <gateway> dev <interface>` | Add a default route through a gateway. | `ip route add default via 192.0.2.1 dev eth0` |
| `ip route add <prefix> via <gateway>` | Add a static route to a network.<br>*Note:* Use ip route replace to add or change a route in one step. Add metric &lt;n&gt; to set the preference; lower wins. | `ip route add 198.51.100.0/24 via 192.0.2.254` |
| `ip route del <prefix>` | Remove a route.<br>*Note:* Deleting the default route on a remote server cuts off access from other networks. | `ip route del 198.51.100.0/24` |
| `ip route get <ip>` | Show the route, source address and interface the kernel would use for a destination.<br>*Note:* No packet is sent. | `ip route get 203.0.113.10` |
| `ip neigh` | Show the ARP (IPv4) and NDP (IPv6) neighbour table with entry states.<br>*Note:* States include REACHABLE, STALE, FAILED and PERMANENT. |  |
| `ip neigh flush dev <interface>` | Clear neighbour (ARP) entries on an interface so they are learned again. | `ip neigh flush dev eth0` |

## Sockets and ports

| Command | What it does | Example |
|---|---|---|
| `ss -tulpn` | List listening TCP and UDP sockets with port numbers and the owning process.<br>*Note:* -p needs root to show processes owned by other users. |  |
| `ss -s` | Print a summary of socket counts by type and state. |  |
| `ss -tn state established` | List established TCP connections with numeric addresses and ports. |  |
| `ss -tn '( dport = :<port> or sport = :<port> )'` | List TCP sockets to or from a given port. | `ss -tn '( dport = :443 or sport = :443 )'` |

## NetworkManager (nmcli)

| Command | What it does | Example |
|---|---|---|
| `nmcli general status` | Show the overall status of NetworkManager and connectivity. |  |
| `nmcli device status` | List devices with their type, state and active connection profile. |  |
| `nmcli device show <interface>` | Show details of a device, including addresses, gateway and DNS. | `nmcli device show eth0` |
| `nmcli connection show` | List connection profiles stored on the system.<br>*Note:* --active lists only profiles in use. Add a profile name to see all its settings. | `nmcli connection show --active` |
| `nmcli connection up <profile>` | Activate a connection profile, applying its saved settings. | `nmcli connection up office-lan` |
| `nmcli connection down <profile>` | **Destructive.** Deactivate a connection profile.<br>**Warning:** Takes the interface offline; over SSH this disconnects you if it is the profile you are using. | `nmcli connection down office-lan` |
| `nmcli connection modify <profile> ipv4.addresses <ip>/<prefix> ipv4.gateway <gateway> ipv4.dns <dns> ipv4.method manual` | Give a profile a static IPv4 address, gateway and DNS server.<br>*Note:* Saved to the profile only; run nmcli connection up &lt;profile&gt; to apply. Set ipv4.method auto to go back to DHCP. | `nmcli connection modify office-lan ipv4.addresses 192.168.10.20/24 ipv4.gateway 192.168.10.1 ipv4.dns 192.168.10.1 ipv4.method manual` |
| `nmcli connection modify <profile> +ipv4.dns <dns>` | Append a DNS server to a profile without replacing the existing ones.<br>*Note:* Use -ipv4.dns to remove one. | `nmcli connection modify office-lan +ipv4.dns 192.168.10.2` |
| `nmcli connection add type ethernet con-name <profile> ifname <interface>` | Create a new Ethernet connection profile (DHCP unless you set ipv4.method). | `nmcli connection add type ethernet con-name office-lan ifname eth0` |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `nmcli connection down <profile>`: Takes the interface offline; over SSH this disconnects you if it is the profile you are using.

## DNS lookups

| Command | What it does | Example |
|---|---|---|
| `dig <name> [<type>]` | Query DNS for a name; with no type it looks up the A record. | `dig example.com MX` |
| `dig +short <name>` | Print only the answer values. | `dig +short example.com AAAA` |
| `dig @<server> <name>` | Send the query to a specific DNS server instead of the system resolver. | `dig @192.0.2.53 example.com` |
| `dig -x <ip>` | Do a reverse (PTR) lookup for an IPv4 or IPv6 address. | `dig -x 192.0.2.10` |
| `dig +trace <name>` | Follow the delegation from the root servers down and show the answer from each server. | `dig +trace example.com` |
| `resolvectl status` | Show the global and per-link DNS servers and search domains used by systemd-resolved. |  |
| `resolvectl query <name-or-ip>` | Resolve a name or address through systemd-resolved, as applications see it. | `resolvectl query example.com` |
| `resolvectl flush-caches` | Flush the systemd-resolved DNS cache. |  |

## Path and reachability

| Command | What it does | Example |
|---|---|---|
| `ping -c <count> <host>` | Send a set number of ICMP echo requests and stop.<br>*Note:* -4 or -6 forces the IP version; -I &lt;interface&gt; sets the source interface or address. | `ping -c 4 192.0.2.1` |
| `ping -M do -s <size> <host>` | Test path MTU by sending packets with Don't Fragment set.<br>*Note:* 1472 bytes of data plus 28 bytes of headers is a 1500-byte IPv4 packet. If it fails, lower the size until it passes. | `ping -M do -s 1472 192.0.2.1` |
| `traceroute -n <host>` | Show each hop to a destination without resolving names.<br>*Note:* Uses UDP probes by default. -I uses ICMP echo; -T -p 443 uses TCP SYN to port 443 and needs root. | `traceroute -n 203.0.113.10` |
| `tracepath -n <host>` | Trace the path and discover the path MTU, without root. | `tracepath -n 203.0.113.10` |
| `mtr --report --report-cycles <n> <host>` | Run several traceroute cycles and print per-hop loss and latency statistics.<br>*Note:* Install the mtr package (mtr-tiny on minimal Debian/Ubuntu). --tcp --port 443 probes with TCP instead of ICMP. | `mtr --report --report-cycles 10 --no-dns 203.0.113.10` |

## Packet capture (tcpdump)

| Command | What it does | Example |
|---|---|---|
| `tcpdump -D` | List the interfaces tcpdump can capture on. |  |
| `tcpdump -i <interface> -n` | Capture on an interface without converting addresses and port numbers to names.<br>*Note:* any captures on all interfaces (not in promiscuous mode). Add -c &lt;count&gt; to stop after that many packets. | `tcpdump -i any -n` |
| `tcpdump -i <interface> -n host <ip>` | Capture only traffic to or from one host. | `tcpdump -i eth0 -n host 192.0.2.10` |
| `tcpdump -i <interface> -n '<filter>'` | Capture with a combined filter on host, port or protocol.<br>*Note:* Quote filters that contain spaces or parentheses. | `tcpdump -i eth0 -n 'src host 192.0.2.10 and port 53'` |
| `tcpdump -i <interface> -w <file>.pcap` | Write raw packets to a file for Wireshark instead of printing them. | `tcpdump -i eth0 -w capture.pcap 'port 443'` |
| `tcpdump -r <file>.pcap` | Read and print packets from a saved capture file. | `tcpdump -n -r capture.pcap` |

## nftables firewall basics

| Command | What it does | Example |
|---|---|---|
| `nft list ruleset` | Print the whole firewall ruleset.<br>*Note:* The output can be loaded again with nft -f. | `nft list ruleset > /etc/nftables.rules` |
| `nft -a list table <family> <table>` | List one table with each rule's handle number. | `nft -a list table inet filter` |
| `nft add table <family> <table>` | Create a table.<br>*Note:* The inet family covers IPv4 and IPv6 together. | `nft add table inet filter` |
| `nft add chain <family> <table> <chain> '{ type filter hook input priority 0; policy drop; }'` | **Destructive.** Create a base chain that filters incoming packets and drops anything not accepted.<br>**Warning:** With policy drop, incoming traffic including SSH is blocked at once until accept rules exist. On a remote server load the chain and its accept rules together from a file with nft -f. | `nft add chain inet filter input '{ type filter hook input priority 0; policy drop; }'` |
| `nft add rule <family> <table> <chain> ct state established,related accept` | Allow return traffic for connections that are already established. | `nft add rule inet filter input ct state established,related accept` |
| `nft add rule <family> <table> <chain> tcp dport 22 accept` | Allow incoming SSH.<br>*Note:* Use a set for several ports: tcp dport { 22, 443 } accept. | `nft add rule inet filter input tcp dport 22 accept` |
| `nft delete rule <family> <table> <chain> handle <n>` | **Destructive.** Remove one rule by its handle number.<br>**Warning:** The rule is removed immediately. Find the handle with nft -a list table. | `nft delete rule inet filter input handle 5` |
| `nft -f <file>` | Load a ruleset from a file.<br>*Note:* nft -c -f &lt;file&gt; checks the file without applying it. | `nft -f /etc/nftables.rules` |
| `nft flush ruleset` | **Destructive.** Remove all tables, chains and rules.<br>**Warning:** Leaves no packet filtering at all, and anything not saved is lost. Save first with nft list ruleset &gt; &lt;file&gt;. |  |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `nft add chain <family> <table> <chain> '{ type filter hook input priority 0; policy drop; }'`: With policy drop, incoming traffic including SSH is blocked at once until accept rules exist. On a remote server load the chain and its accept rules together from a file with nft -f.
> - `nft delete rule <family> <table> <chain> handle <n>`: The rule is removed immediately. Find the handle with nft -a list table.
> - `nft flush ruleset`: Leaves no packet filtering at all, and anything not saved is lost. Save first with nft list ruleset &gt; &lt;file&gt;.

## FAQ

### What replaced ifconfig and netstat on Linux?

The iproute2 tools. Use ip address (or ip -br a) instead of ifconfig, ip route instead of route, ip neigh instead of arp, and ss instead of netstat, for example ss -tulpn to list listening ports and the processes that own them.

### How do I see which process is listening on a port in Linux?

Run sudo ss -tulpn. It lists listening TCP and UDP sockets with numeric ports and the process name and PID. Without root, -p only shows processes you own. Filter by port with an expression such as ss -tln '( sport = :443 )'.

### How do I set a static IP address on Linux with nmcli?

Run nmcli connection modify &lt;profile&gt; ipv4.addresses 192.168.10.20/24 ipv4.gateway 192.168.10.1 ipv4.dns 192.168.10.1 ipv4.method manual, then nmcli connection up &lt;profile&gt; to apply it. Find the profile name with nmcli connection show. The setting survives reboots because it is saved in the profile.

### How do I check which DNS server Linux is using?

On systems with systemd-resolved (Ubuntu and many others) run resolvectl status to see the DNS servers per interface. On NetworkManager systems nmcli device show &lt;interface&gt; also lists them. To test a specific server directly, use dig @&lt;server&gt; example.com.

## References

Every command above was checked against these official pages:

- [ip-address(8) manual page](https://man7.org/linux/man-pages/man8/ip-address.8.html)
- [ip-route(8) manual page](https://man7.org/linux/man-pages/man8/ip-route.8.html)
- [ss(8) manual page](https://man7.org/linux/man-pages/man8/ss.8.html)
- [nmcli(1) NetworkManager reference manual](https://networkmanager.dev/docs/api/latest/nmcli.html)
- [BIND 9 manual pages: dig](https://bind9.readthedocs.io/en/latest/manpages.html)
- [tcpdump(1) manual page](https://www.tcpdump.org/manpages/tcpdump.1.html)
- [nft(8) manual page](https://www.netfilter.org/projects/nftables/manpage.html)
- [nftables wiki: Quick reference](https://wiki.nftables.org/wiki-nftables/index.php/Quick_reference-nftables_in_10_minutes)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
