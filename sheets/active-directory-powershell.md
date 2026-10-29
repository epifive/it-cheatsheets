# Active Directory PowerShell commands cheat sheet

Everyday cmdlets from the ActiveDirectory PowerShell module, plus repadmin and dcdiag for domain health. Read-only commands work for any domain user; changes need the right delegated rights.

| | |
|---|---|
| **Vendor** | Microsoft |
| **Platform** | Active Directory Domain Services |
| **Version scope** | ActiveDirectory module on Windows Server 2016-2025 and RSAT for Windows 10/11 |
| **Commands** | 50 (2 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/active-directory-powershell](https://www.epifive.com/cheatsheets/active-directory-powershell)

## Contents

- [Setup and domain info](#setup-and-domain-info)
- [Users](#users)
- [Groups](#groups)
- [Computers](#computers)
- [OUs, objects and the recycle bin](#ous-objects-and-the-recycle-bin)
- [Domain controller and replication health](#domain-controller-and-replication-health)
- [Password policy](#password-policy)
- [FAQ](#faq)
- [References](#references)

## Setup and domain info

| Command | What it does | Example |
|---|---|---|
| `Add-WindowsCapability -Online -Name Rsat.ActiveDirectory.DS-LDS.Tools~~~~0.0.1.0` | Install the AD DS and AD LDS tools, including the ActiveDirectory module, on Windows 10 or 11.<br>*Note:* Run from an elevated PowerShell window. Get-WindowsCapability -Online \| Where-Object Name -like 'RSAT\*' lists every RSAT tool. |  |
| `Install-WindowsFeature -Name RSAT-AD-Tools -IncludeAllSubFeature` | Install the AD DS and AD LDS management tools, including the module, on Windows Server. |  |
| `Import-Module ActiveDirectory` | Load the ActiveDirectory module into the current session.<br>*Note:* PowerShell loads it automatically the first time you run an AD cmdlet; import it explicitly at the top of scripts. |  |
| `Get-ADDomain` | Show the current domain, its functional level and the PDC emulator, RID master and infrastructure master. | `Get-ADDomain -Identity contoso.com` |
| `Get-ADForest` | Show the forest, its domains, global catalogs, functional level and schema and domain naming masters. | `Get-ADForest -Identity contoso.com` |
| `Get-ADDomainController -Discover` | Find a domain controller through the DC locator, optionally one offering a given service.<br>*Note:* -Service "GlobalCatalog" finds a global catalog server; -ForceDiscover skips the cached result. | `Get-ADDomainController -Discover -Service "PrimaryDC"` |
| `Get-ADDomainController -Filter *` | List every domain controller in the domain. | `Get-ADDomainController -Filter * \| Select-Object Name,Site,IPv4Address,OperatingSystem` |

## Users

| Command | What it does | Example |
|---|---|---|
| `Get-ADUser -Identity <user> -Properties *` | Show every attribute of one user account.<br>*Note:* -Identity accepts a sAMAccountName, distinguished name, GUID or SID. Without -Properties only a small default set is returned. | `Get-ADUser -Identity jsmith -Properties *` |
| `Get-ADUser -Filter <filter>` | Find users that match a filter.<br>*Note:* -Filter is required when you do not use -Identity; -Filter \* returns every user. | `Get-ADUser -Filter "Department -eq 'Sales'" -Properties Department,Title` |
| `Get-ADUser -Filter * -SearchBase <OU-DN>` | List the users in one OU and the OUs below it.<br>*Note:* -SearchScope OneLevel limits the search to that OU only. | `Get-ADUser -Filter * -SearchBase "OU=Staff,DC=contoso,DC=com"` |
| `New-ADUser -Name <name> -SamAccountName <user> -AccountPassword <securestring> -Enabled $true` | Create a user account with a password and enable it.<br>*Note:* Without -Enabled $true the account is created disabled, with or without a password. Without -Path it goes into the default Users container. | `New-ADUser -Name "Jane Smith" -GivenName Jane -Surname Smith -SamAccountName jsmith -UserPrincipalName jsmith@contoso.com -Path "OU=Staff,DC=contoso,DC=com" -AccountPassword (Read-Host -AsSecureString "Password") -Enabled $true -ChangePasswordAtLogon $true` |
| `Set-ADUser -Identity <user> -<Parameter> <value>` | Change attributes on an existing user.<br>*Note:* For attributes without their own parameter use -Replace @{attribute='value'}, -Add, -Remove or -Clear. | `Set-ADUser -Identity jsmith -Title "Sales Manager" -Department Sales -ChangePasswordAtLogon $true` |
| `Set-ADAccountPassword -Identity <user> -Reset -NewPassword <securestring>` | Reset a user's password as an administrator.<br>*Note:* Follow with Set-ADUser -Identity jsmith -ChangePasswordAtLogon $true to force a change at next sign-in. | `Set-ADAccountPassword -Identity jsmith -Reset -NewPassword (Read-Host -AsSecureString "New password")` |
| `Unlock-ADAccount -Identity <user>` | Unlock an account that was locked out by failed sign-ins. | `Unlock-ADAccount -Identity jsmith` |
| `Enable-ADAccount -Identity <user>` | Enable a disabled user, computer or service account. | `Enable-ADAccount -Identity jsmith` |
| `Disable-ADAccount -Identity <user>` | Disable an account so it can no longer sign in.<br>*Note:* Safer than deleting a leaver: the SID, group memberships and attributes stay intact if you need them back. | `Disable-ADAccount -Identity jsmith` |
| `Search-ADAccount -LockedOut` | List accounts that are currently locked out. | `Search-ADAccount -LockedOut -UsersOnly \| Select-Object Name,SamAccountName` |
| `Search-ADAccount -AccountInactive -TimeSpan <days.hh:mm:ss>` | Find accounts that have not signed in within a period.<br>*Note:* -DateTime uses a fixed date instead of a period. Requires Windows Server 2003 domain functional level or higher. | `Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly` |
| `Search-ADAccount -PasswordExpired` | List accounts whose password has expired. | `Search-ADAccount -PasswordExpired -UsersOnly` |
| `Search-ADAccount -PasswordNeverExpires` | List accounts set so their password never expires, a common audit finding. | `Search-ADAccount -PasswordNeverExpires -UsersOnly` |
| `Set-ADAccountExpiration -Identity <user> -DateTime <date>` | Set the date an account stops working, for contractors and temporary staff. | `Set-ADAccountExpiration -Identity contractor01 -DateTime "2026-12-31"` |
| `Remove-ADUser -Identity <user>` | **Destructive.** Delete a user account.<br>**Warning:** The account, its SID and its group memberships are removed. Without the AD Recycle Bin you need an authoritative restore from backup to get it back. Prompts for confirmation by default. | `Remove-ADUser -Identity jsmith` |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `Remove-ADUser -Identity <user>`: The account, its SID and its group memberships are removed. Without the AD Recycle Bin you need an authoritative restore from backup to get it back. Prompts for confirmation by default.

## Groups

| Command | What it does | Example |
|---|---|---|
| `Get-ADGroup -Filter <filter>` | Find groups by name, scope or category.<br>*Note:* Use -Identity &lt;group&gt; -Properties member to read one group's member list. | `Get-ADGroup -Filter 'GroupCategory -eq "Security" -and Name -like "Sales*"'` |
| `New-ADGroup -Name <name> -GroupScope <scope> -GroupCategory <category>` | Create a security or distribution group.<br>*Note:* -GroupScope takes DomainLocal, Global or Universal; -GroupCategory takes Security or Distribution. | `New-ADGroup -Name "Sales Team" -SamAccountName SalesTeam -GroupScope Global -GroupCategory Security -Path "OU=Groups,DC=contoso,DC=com"` |
| `Add-ADGroupMember -Identity <group> -Members <member>,<member>` | Add users, computers or groups to a group.<br>*Note:* Users pick up a new security group membership at their next sign-in. | `Add-ADGroupMember -Identity SalesTeam -Members jsmith,akumar` |
| `Get-ADGroupMember -Identity <group> -Recursive` | List the members of a group, including members of nested groups.<br>*Note:* -Recursive returns the users and computers at the end of the nesting chain, not the nested groups themselves. | `Get-ADGroupMember -Identity "Domain Admins" -Recursive \| Select-Object Name,objectClass` |
| `Remove-ADGroupMember -Identity <group> -Members <member>` | **Destructive.** Remove members from a group.<br>**Warning:** The member loses any access granted through that group. Prompts for confirmation; scripts add -Confirm:$false. | `Remove-ADGroupMember -Identity SalesTeam -Members jsmith` |
| `Get-ADPrincipalGroupMembership -Identity <user>` | List the groups a user, computer or group is a member of. | `Get-ADPrincipalGroupMembership -Identity jsmith \| Select-Object Name` |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `Remove-ADGroupMember -Identity <group> -Members <member>`: The member loses any access granted through that group. Prompts for confirmation; scripts add -Confirm:$false.

## Computers

| Command | What it does | Example |
|---|---|---|
| `Get-ADComputer -Filter <filter>` | Find computer accounts and read properties such as OS and IP address.<br>*Note:* Use -Identity &lt;name&gt; -Properties \* to see everything about one computer. | `Get-ADComputer -Filter 'Name -like "SALES-*"' -Properties OperatingSystem,IPv4Address` |
| `Search-ADAccount -AccountInactive -ComputersOnly -TimeSpan <days.hh:mm:ss>` | Find computer accounts that have not signed in to the domain within a period. | `Search-ADAccount -AccountInactive -ComputersOnly -TimeSpan 90.00:00:00` |
| `Test-ComputerSecureChannel` | Check the trust between this domain member and its domain; returns True or False.<br>*Note:* Run it on the member computer, not on a domain controller. Windows PowerShell 5.1 only. | `Test-ComputerSecureChannel -Server dc01.contoso.com -Verbose` |
| `Test-ComputerSecureChannel -Repair -Credential <domain\user>` | Repair a broken trust relationship without rejoining the domain.<br>*Note:* The account needs permission to reset the computer account. Windows PowerShell 5.1 only. | `Test-ComputerSecureChannel -Repair -Credential CONTOSO\admin01` |
| `Reset-ComputerMachinePassword -Server <dc> -Credential <domain\user>` | Reset the computer account password that this machine shares with the domain.<br>*Note:* Windows PowerShell 5.1 only. | `Reset-ComputerMachinePassword -Server dc01.contoso.com -Credential CONTOSO\admin01` |

## OUs, objects and the recycle bin

| Command | What it does | Example |
|---|---|---|
| `New-ADOrganizationalUnit -Name <name> -Path <parent-DN>` | Create an organizational unit.<br>*Note:* New OUs are protected from accidental deletion unless you pass -ProtectedFromAccidentalDeletion $false. | `New-ADOrganizationalUnit -Name "Staff" -Path "DC=contoso,DC=com"` |
| `Move-ADObject -Identity <DN> -TargetPath <OU-DN>` | Move a user, computer, group or OU to another OU.<br>*Note:* Group Policy linked to the new OU applies from the next policy refresh. | `Move-ADObject -Identity "CN=Jane Smith,OU=Staff,DC=contoso,DC=com" -TargetPath "OU=Sales,DC=contoso,DC=com"` |
| `Set-ADObject -Identity <DN> -ProtectedFromAccidentalDeletion <bool>` | Turn deletion protection on or off for an object.<br>*Note:* A protected OU cannot be deleted or moved until protection is cleared. Turn it back on afterwards. | `Set-ADObject -Identity "OU=Staff,DC=contoso,DC=com" -ProtectedFromAccidentalDeletion $false` |
| `Get-ADOptionalFeature -Identity 'Recycle Bin Feature'` | Show the AD Recycle Bin feature and where it is enabled. |  |
| `Enable-ADOptionalFeature -Identity 'Recycle Bin Feature' -Scope ForestOrConfigurationSet -Target <forest>` | Enable the Active Directory Recycle Bin for the forest.<br>*Note:* Cannot be disabled once enabled. Needs Windows Server 2008 R2 forest functional level and Enterprise Admins rights. Objects deleted before you enable it can only come back from a backup. | `Enable-ADOptionalFeature -Identity 'Recycle Bin Feature' -Scope ForestOrConfigurationSet -Target contoso.com` |
| `Get-ADObject -Filter <filter> -IncludeDeletedObjects` | Find deleted objects, including ones in the Deleted Objects container. | `Get-ADObject -Filter 'samAccountName -eq "jsmith"' -IncludeDeletedObjects` |
| `Restore-ADObject -Identity <object>` | Restore a deleted object with its attributes and group memberships from the recycle bin.<br>*Note:* Works only if the Recycle Bin was enabled before the object was deleted. -TargetPath restores to a different OU. | `Get-ADObject -Filter 'samAccountName -eq "jsmith"' -IncludeDeletedObjects \| Restore-ADObject` |

## Domain controller and replication health

| Command | What it does | Example |
|---|---|---|
| `Get-ADReplicationPartnerMetadata -Target <dc>` | Show replication partners of a DC with last success time and last result.<br>*Note:* LastReplicationResult of 0 means success; also check ConsecutiveReplicationFailures. | `Get-ADReplicationPartnerMetadata -Target dc01 -PartnerType Inbound` |
| `Get-ADReplicationPartnerMetadata -Target <domain> -Scope Domain` | Show replication status for every DC in a domain. | `Get-ADReplicationPartnerMetadata -Target contoso.com -Scope Domain \| Select-Object Server,Partner,LastReplicationSuccess,LastReplicationResult` |
| `Get-ADReplicationFailure -Target <dc-or-domain>` | List replication failures for a DC, site, domain or forest. | `Get-ADReplicationFailure -Target contoso.com -Scope Domain` |
| `repadmin /replsummary` | Summarize replication across domain controllers and flag the ones that are failing.<br>*Note:* /errorsonly shows only DCs with partner errors. Installed with the AD DS tools. | `repadmin /replsummary * /bysrc /bydest /sort:delta` |
| `repadmin /showrepl <dc>` | Show when a DC last tried inbound replication for each partition and whether it worked. | `repadmin /showrepl dc01` |
| `dcdiag /s:<dc>` | Run the standard domain controller health tests against a DC.<br>*Note:* /q prints only errors, /v adds detail, /e tests every DC in the enterprise and /c runs the comprehensive set. | `dcdiag /s:dc01 /q` |
| `dcdiag /test:DNS` | Test DNS registration, forwarders and delegation for domain controllers. | `dcdiag /test:DNS /s:dc01 /v` |

## Password policy

| Command | What it does | Example |
|---|---|---|
| `Get-ADDefaultDomainPasswordPolicy` | Show the domain password and lockout policy: length, complexity, age and lockout threshold. | `Get-ADDefaultDomainPasswordPolicy -Identity contoso.com` |
| `Get-ADFineGrainedPasswordPolicy -Filter *` | List fine-grained password policies (PSOs) and their precedence. | `Get-ADFineGrainedPasswordPolicy -Filter * \| Select-Object Name,Precedence,MinPasswordLength,AppliesTo` |
| `Get-ADUserResultantPasswordPolicy -Identity <user>` | Show which fine-grained password policy actually applies to a user.<br>*Note:* A PSO linked directly to the user wins over ones linked to groups; among groups the lowest precedence value wins. | `Get-ADUserResultantPasswordPolicy -Identity jsmith` |

## FAQ

### How do I install the Active Directory PowerShell module on Windows 11?

Open PowerShell as administrator and run Add-WindowsCapability -Online -Name Rsat.ActiveDirectory.DS-LDS.Tools\~\~\~\~0.0.1.0. On Windows Server use Install-WindowsFeature -Name RSAT-AD-Tools -IncludeAllSubFeature. The cmdlets are then available; Import-Module ActiveDirectory loads them explicitly.

### How do I unlock an Active Directory account with PowerShell?

Find locked accounts with Search-ADAccount -LockedOut -UsersOnly, then run Unlock-ADAccount -Identity &lt;username&gt;. If the account locks again soon after, a phone, mapped drive, service or saved credential is probably still trying an old password.

### How do I find inactive users in Active Directory?

Run Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly to list user accounts with no sign-in in the last 90 days. Review the list before acting, and disable accounts with Disable-ADAccount rather than deleting them so they can be re-enabled if something breaks.

### Can I restore a deleted Active Directory user?

Yes, if the AD Recycle Bin was enabled before the deletion: find the object with Get-ADObject -IncludeDeletedObjects and pipe it to Restore-ADObject, which brings back its attributes and group memberships. Without the Recycle Bin you need an authoritative restore from a system state backup. Enabling the Recycle Bin cannot be undone.

## References

Every command above was checked against these official pages:

- [Remote Server Administration Tools (RSAT) for Windows](https://learn.microsoft.com/en-us/windows-server/remote/remote-server-administration-tools)
- [New-ADUser (ActiveDirectory module)](https://learn.microsoft.com/en-us/powershell/module/activedirectory/new-aduser)
- [Search-ADAccount (ActiveDirectory module)](https://learn.microsoft.com/en-us/powershell/module/activedirectory/search-adaccount)
- [Restore-ADObject (ActiveDirectory module)](https://learn.microsoft.com/en-us/powershell/module/activedirectory/restore-adobject)
- [Active Directory Recycle Bin and Administrative Center enhancements](https://learn.microsoft.com/en-us/windows-server/identity/ad-ds/get-started/adac/introduction-to-active-directory-administrative-center-enhancements--level-100-)
- [Get-ADReplicationPartnerMetadata (ActiveDirectory module)](https://learn.microsoft.com/en-us/powershell/module/activedirectory/get-adreplicationpartnermetadata)
- [Repadmin /replsummary](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2012-r2-and-2012/cc835092(v=ws.11))
- [dcdiag command reference](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/dcdiag)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
