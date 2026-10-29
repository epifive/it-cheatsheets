# Windows networking commands cheat sheet

Command Prompt tools and their PowerShell equivalents for checking and changing network settings on Windows. Run anything that changes configuration from an elevated prompt. The classic tools (ping, tracert, route, netstat) accept switches written with - or /.

| | |
|---|---|
| **Vendor** | Microsoft |
| **Platform** | Windows and Windows Server |
| **Version scope** | Windows 10, Windows 11 and Windows Server 2019-2025 (Windows PowerShell 5.1 or PowerShell 7) |
| **Commands** | 57 (6 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/windows-networking](https://www.epifive.com/cheatsheets/windows-networking)

## Contents

- [IP configuration](#ip-configuration)
- [Connectivity tests](#connectivity-tests)
- [DNS](#dns)
- [Routing and ARP](#routing-and-arp)
- [Ports and connections](#ports-and-connections)
- [Firewall](#firewall)
- [netsh: interfaces, Wi-Fi and stack resets](#netsh-interfaces-wi-fi-and-stack-resets)
- [Network adapters](#network-adapters)
- [FAQ](#faq)
- [References](#references)

## IP configuration

| Command | What it does | Example |
|---|---|---|
| `ipconfig /all` | Show the full TCP/IP configuration of every adapter, including MAC address, DHCP lease and DNS servers. |  |
| `ipconfig /release [<adapter>]` | Release the DHCP lease on all adapters, or on one named adapter.<br>*Note:* The adapter has no IPv4 address until you renew, so do not run it over a remote session. Use /release6 for DHCPv6. | `ipconfig /release "Ethernet"` |
| `ipconfig /renew [<adapter>]` | Request a new DHCP lease for all adapters or one named adapter.<br>*Note:* Only works on adapters set to obtain an address automatically. Use /renew6 for DHCPv6. | `ipconfig /renew "Ethernet"` |
| `Get-NetIPConfiguration` | Show connected interfaces with their IP address, default gateway and DNS servers.<br>*Note:* -Detailed adds MAC address, network profile, MTU and DHCP status. -All includes disconnected and virtual interfaces. | `Get-NetIPConfiguration -InterfaceAlias "Ethernet" -Detailed` |
| `Get-NetIPAddress` | List IP addresses with their prefix length and origin. | `Get-NetIPAddress -AddressFamily IPv4 -InterfaceAlias "Ethernet"` |
| `New-NetIPAddress -InterfaceAlias <name> -IPAddress <ip> -PrefixLength <bits> -DefaultGateway <gateway>` | Assign a static IP address, prefix length and default gateway.<br>*Note:* Adding an address to a DHCP-enabled interface turns DHCP off for it. The gateway must be in the same subnet as the address. | `New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.10.25 -PrefixLength 24 -DefaultGateway 192.168.10.1` |
| `Set-DnsClientServerAddress -InterfaceAlias <name> -ServerAddresses <ip>,<ip>` | Set static DNS servers on an interface.<br>*Note:* Static DNS servers override the ones handed out by DHCP. | `Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses ("192.168.10.10","192.168.10.11")` |
| `Set-DnsClientServerAddress -InterfaceAlias <name> -ResetServerAddresses` | Remove static DNS servers so the interface uses the ones from DHCP again. | `Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ResetServerAddresses` |

## Connectivity tests

| Command | What it does | Example |
|---|---|---|
| `ping <host>` | Send four ICMP echo requests and show round-trip times.<br>*Note:* -4 or -6 forces the IP version when you ping a name; -a resolves an IP address to a host name. Many firewalls block ICMP, so no reply does not prove the host is down. | `ping 192.0.2.10` |
| `ping -t <host>` | Ping continuously until you stop it.<br>*Note:* Ctrl+Break shows statistics and keeps going; Ctrl+C stops. | `ping -t 192.168.10.1` |
| `ping -n <count> -l <size> <host>` | Send a set number of echo requests with a custom data size.<br>*Note:* Default is 4 requests of 32 bytes; the maximum size is 65,500 bytes. | `ping -n 10 -l 1000 192.0.2.10` |
| `ping -f -l <size> <host>` | Send pings with the Do Not Fragment flag set to find path MTU problems.<br>*Note:* IPv4 only. Lower the size until replies come back instead of a fragmentation error. | `ping -f -l 1472 203.0.113.20` |
| `Test-Connection -ComputerName <host> -Count <n>` | Ping from PowerShell and return objects you can filter.<br>*Note:* Add -Quiet to get True or False. PowerShell 7 calls the parameter -TargetName; -ComputerName still works as an alias. | `Test-Connection -ComputerName server01.contoso.com -Count 2` |
| `Test-NetConnection -ComputerName <host> -Port <port>` | Test whether a TCP port on a remote host accepts connections.<br>*Note:* Look for TcpTestSucceeded : True. -CommonTCPPort accepts HTTP, RDP, SMB or WINRM instead of a number. TCP only. | `Test-NetConnection -ComputerName mail.contoso.com -Port 443` |
| `Test-NetConnection -ComputerName <host> -TraceRoute` | Trace the route to a host from PowerShell. | `Test-NetConnection -ComputerName www.contoso.com -TraceRoute -Hops 15` |
| `Test-NetConnection -ComputerName <host> -InformationLevel Detailed` | Show name resolution results, source address, next hop and ping result in one view.<br>*Note:* -InformationLevel Quiet returns only True or False, which suits scripts. | `Test-NetConnection -ComputerName www.contoso.com -InformationLevel Detailed` |
| `tracert -d <host>` | List each router hop to a destination without reverse DNS lookups.<br>*Note:* -d makes it much faster. -h sets the maximum hops (default 30). Rows of \* mean a hop did not answer, not necessarily a fault. | `tracert -d 203.0.113.25` |
| `pathping -n <host>` | Trace the route, then measure packet loss at every hop and link.<br>*Note:* Takes several minutes because it sends 100 queries to each hop by default (-q). Loss on a link line points at congestion on that link. | `pathping -n 203.0.113.25` |

## DNS

| Command | What it does | Example |
|---|---|---|
| `ipconfig /flushdns` | Clear the DNS client resolver cache.<br>*Note:* Use it after fixing a DNS record so the PC stops using a stale or negative cached answer. |  |
| `ipconfig /displaydns` | Show the DNS client cache, including entries preloaded from the Hosts file. |  |
| `ipconfig /registerdns` | Re-register this computer's name and IP addresses in DNS without a reboot.<br>*Note:* Handy when a domain PC's A record is missing or out of date on the DNS server. |  |
| `nslookup <name> [<dns-server>]` | Look up a name, optionally against a specific DNS server.<br>*Note:* Without a server it uses the default DNS server. Typing nslookup on its own opens interactive mode; type exit to leave. | `nslookup www.contoso.com 192.168.10.10` |
| `nslookup -type=<record> <name>` | Query a specific record type such as MX, TXT, NS or AAAA. | `nslookup -type=MX contoso.com` |
| `Resolve-DnsName -Name <name>` | Resolve a name from PowerShell and return the records as objects.<br>*Note:* By default it queries A and AAAA. -DnsOnly skips LLMNR and NetBIOS; -NoHostsFile ignores the Hosts file. | `Resolve-DnsName -Name www.contoso.com -DnsOnly` |
| `Resolve-DnsName -Name <name> -Type <record> -Server <dns-server>` | Query a record type against a chosen DNS server. | `Resolve-DnsName -Name contoso.com -Type TXT -Server 192.168.10.10` |
| `Get-DnsClientCache` | Show the DNS client cache as objects. | `Get-DnsClientCache -Entry www.contoso.com` |
| `Clear-DnsClientCache` | Clear the DNS client cache from PowerShell, like ipconfig /flushdns. |  |
| `Get-DnsClientServerAddress` | Show which DNS servers each interface is using. | `Get-DnsClientServerAddress -AddressFamily IPv4` |

## Routing and ARP

| Command | What it does | Example |
|---|---|---|
| `route print` | Display the IPv4 and IPv6 routing tables, interface list and persistent routes.<br>*Note:* A destination with \* or ? shows only matching routes. netstat -r prints the same table. | `route print 192.168.*` |
| `route -p add <destination> mask <netmask> <gateway> [metric <n>] [if <index>]` | Add a persistent static route that survives restarts.<br>*Note:* Without -p the route is lost when TCP/IP restarts. Get the interface index for if from route print. | `route -p add 10.20.0.0 mask 255.255.0.0 192.168.10.254 metric 10` |
| `route delete <destination> [mask <netmask>]` | **Destructive.** Delete a route from the routing table.<br>**Warning:** Deleting the default route (0.0.0.0) cuts off all traffic beyond the local subnet, including your remote session. Wildcards such as 10.\* delete every matching route. | `route delete 10.20.0.0 mask 255.255.0.0` |
| `arp -a` | Show the ARP cache of IP-to-MAC address mappings.<br>*Note:* -N limits output to the interface with that IP address and is case-sensitive. | `arp -a -N 192.168.10.25` |
| `arp -d <ip>` | Remove an entry from the ARP cache so it is learned again.<br>*Note:* arp -d \* clears the whole cache. Entries are relearned automatically on the next packet. | `arp -d 192.168.10.1` |
| `Get-NetRoute` | List routes from PowerShell, with next hop and metric.<br>*Note:* Filtering on 0.0.0.0/0 shows the default gateway for each interface. | `Get-NetRoute -DestinationPrefix "0.0.0.0/0"` |
| `New-NetRoute -DestinationPrefix <prefix> -InterfaceAlias <name> -NextHop <gateway>` | Add a static route from PowerShell.<br>*Note:* By default the route is saved in both the active and persistent stores, so it survives a restart. | `New-NetRoute -DestinationPrefix "10.20.0.0/16" -InterfaceAlias "Ethernet" -NextHop 192.168.10.254` |
| `Get-NetNeighbor` | Show the neighbor (ARP and IPv6 neighbor discovery) cache as objects. | `Get-NetNeighbor -AddressFamily IPv4 -InterfaceAlias "Ethernet"` |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `route delete <destination> [mask <netmask>]`: Deleting the default route (0.0.0.0) cuts off all traffic beyond the local subnet, including your remote session. Wildcards such as 10.\* delete every matching route.

## Ports and connections

| Command | What it does | Example |
|---|---|---|
| `netstat -ano` | List all connections and listening ports in numeric form with the owning process ID.<br>*Note:* Match the PID in the last column with Task Manager or Get-Process -Id &lt;pid&gt;. | `netstat -ano \| findstr :3389` |
| `netstat -b` | Show the executable behind each connection or listening port.<br>*Note:* Needs an elevated prompt and can be slow. | `netstat -anb` |
| `Get-NetTCPConnection -State Listen` | List listening TCP ports with the owning process ID.<br>*Note:* The OwningProcess property holds the PID. | `Get-NetTCPConnection -State Listen -LocalPort 443` |
| `Get-NetTCPConnection -State Established` | List active TCP connections, optionally filtered by remote address or port. | `Get-NetTCPConnection -State Established -RemotePort 443` |

## Firewall

| Command | What it does | Example |
|---|---|---|
| `netsh advfirewall show allprofiles` | Show state, default policy, settings and logging for the domain, private and public firewall profiles. | `netsh advfirewall show allprofiles state` |
| `Get-NetFirewallProfile` | Show firewall profile settings from PowerShell.<br>*Note:* Without -PolicyStore it reads the local persistent store; ActiveStore shows the settings in effect, including Group Policy. | `Get-NetFirewallProfile -PolicyStore ActiveStore` |
| `Set-NetFirewallProfile -Profile <profiles> -Enabled True` | Turn the firewall on (or off with False) for one or more profiles.<br>*Note:* Group Policy settings win over local changes on domain-joined machines. | `Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled True` |
| `New-NetFirewallRule -DisplayName <name> -Direction Inbound -Protocol TCP -LocalPort <port> -Action Allow` | Create a firewall rule that allows inbound traffic to a port.<br>*Note:* -Action also accepts Block. -LocalPort takes lists and ranges such as 80,443 or 5000-5020. | `New-NetFirewallRule -DisplayName "Allow HTTPS inbound" -Direction Inbound -Protocol TCP -LocalPort 443 -Action Allow -Profile Domain -RemoteAddress LocalSubnet` |
| `Get-NetFirewallRule -DisplayName <name>` | Find a firewall rule by its display name. | `Get-NetFirewallRule -DisplayName "Allow HTTPS inbound"` |
| `Remove-NetFirewallRule -DisplayName <name>` | **Destructive.** Delete firewall rules that match a display name.<br>**Warning:** Every rule with that display name is deleted at once. Check the match with Get-NetFirewallRule first. | `Remove-NetFirewallRule -DisplayName "Allow HTTPS inbound"` |
| `netsh advfirewall reset` | **Destructive.** Restore the default Windows Firewall policy.<br>**Warning:** Custom rules and settings are lost. Add export &lt;file&gt; to save the current policy first; restore it with netsh advfirewall import. | `netsh advfirewall reset export "C:\Backup\firewall.wfw"` |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `Remove-NetFirewallRule -DisplayName <name>`: Every rule with that display name is deleted at once. Check the match with Get-NetFirewallRule first.
> - `netsh advfirewall reset`: Custom rules and settings are lost. Add export &lt;file&gt; to save the current policy first; restore it with netsh advfirewall import.

## netsh: interfaces, Wi-Fi and stack resets

| Command | What it does | Example |
|---|---|---|
| `netsh interface ipv4 show config` | Show IP address, gateway, DNS and WINS settings for each interface.<br>*Note:* Older scripts write netsh interface ip; Microsoft recommends PowerShell for new automation. | `netsh interface ipv4 show config name="Ethernet"` |
| `netsh wlan show profiles` | List the Wi-Fi profiles saved on this computer. |  |
| `netsh wlan show profiles name=<profile> key=clear` | Show a saved Wi-Fi profile, including the network key in plain text.<br>*Note:* The key appears under Key Content only for a local administrator. Treat the output as a secret. | `netsh wlan show profiles name="CorpWiFi" key=clear` |
| `netsh wlan show wlanreport` | Generate a report that summarizes recent Wi-Fi sessions and activity. |  |
| `netsh int ip reset <logfile>` | **Destructive.** Reset TCP/IP to its default configuration.<br>**Warning:** Overwrites the TCP/IP and DHCP registry settings, which removes static IP addresses, gateways and DNS servers. Run elevated, then restart. | `netsh int ip reset c:\resetlog.txt` |
| `netsh winsock reset` | **Destructive.** Reset the Winsock catalog to a clean state.<br>**Warning:** Removes installed Layered Service Providers, which some VPN, proxy and security software rely on. Run elevated, then restart. |  |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `netsh int ip reset <logfile>`: Overwrites the TCP/IP and DHCP registry settings, which removes static IP addresses, gateways and DNS servers. Run elevated, then restart.
> - `netsh winsock reset`: Removes installed Layered Service Providers, which some VPN, proxy and security software rely on. Run elevated, then restart.

## Network adapters

| Command | What it does | Example |
|---|---|---|
| `Get-NetAdapter` | List network adapters with status, link speed and MAC address.<br>*Note:* -Physical hides virtual adapters; -IncludeHidden shows hidden ones. | `Get-NetAdapter -Physical` |
| `Restart-NetAdapter -Name <name>` | Disable and re-enable an adapter in one step.<br>*Note:* The link drops briefly, which interrupts any session using that adapter. | `Restart-NetAdapter -Name "Ethernet"` |
| `Disable-NetAdapter -Name <name>` | **Destructive.** Disable a network adapter.<br>**Warning:** Prompts for confirmation. Disabling the adapter your remote session uses locks you out until someone re-enables it locally. | `Disable-NetAdapter -Name "Wi-Fi"` |
| `Enable-NetAdapter -Name <name>` | Enable a disabled network adapter. | `Enable-NetAdapter -Name "Wi-Fi"` |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `Disable-NetAdapter -Name <name>`: Prompts for confirmation. Disabling the adapter your remote session uses locks you out until someone re-enables it locally.

## FAQ

### How do I flush the DNS cache in Windows?

Open Command Prompt and run ipconfig /flushdns, or run Clear-DnsClientCache in PowerShell. Both clear the Windows DNS client cache. Browsers such as Chrome and Edge can keep their own cache, so close and reopen the browser if a page still resolves to the old address.

### How do I check if a port is open on a remote server from Windows?

Run Test-NetConnection -ComputerName server.contoso.com -Port 443 in PowerShell. If TcpTestSucceeded is True, a TCP connection to that port was made. It only tests TCP; a False result can mean the service is down or a firewall in the path is blocking the port.

### How do I find which program is using a port in Windows?

Run netstat -ano and note the PID in the last column for the port, then look it up in Task Manager or with Get-Process -Id &lt;pid&gt;. In PowerShell, Get-NetTCPConnection -LocalPort 443 shows the same PID in the OwningProcess property. netstat -b shows the executable name directly but needs an elevated prompt.

### What is the difference between netsh winsock reset and netsh int ip reset?

netsh winsock reset cleans the Winsock catalog and removes Layered Service Providers that some VPN or security tools install. netsh int ip reset rewrites the TCP/IP and DHCP registry settings, which has the same effect as reinstalling TCP/IP and removes static IP and DNS settings. Both need an elevated prompt and a restart.

## References

Every command above was checked against these official pages:

- [ipconfig command reference](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/ipconfig)
- [route command reference](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/route_ws2008)
- [netstat command reference](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netstat)
- [netsh advfirewall command reference](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/netsh-advfirewall)
- [Reset TCP/IP by using the NetShell utility](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/reset-tcp-ip-net-shell)
- [Test-NetConnection (NetTCPIP module)](https://learn.microsoft.com/en-us/powershell/module/nettcpip/test-netconnection)
- [Resolve-DnsName (DnsClient module)](https://learn.microsoft.com/en-us/powershell/module/dnsclient/resolve-dnsname)
- [New-NetFirewallRule (NetSecurity module)](https://learn.microsoft.com/en-us/powershell/module/netsecurity/new-netfirewallrule)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
