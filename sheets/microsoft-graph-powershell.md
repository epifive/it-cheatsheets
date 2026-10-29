# Microsoft Graph PowerShell commands cheat sheet

The Microsoft Graph PowerShell SDK replaces the retired AzureAD and MSOnline modules. Each cmdlet needs a Graph permission scope, which you request with Connect-MgGraph -Scopes; least-privileged scopes from Microsoft Learn are listed in the notes.

| | |
|---|---|
| **Vendor** | Microsoft |
| **Platform** | Microsoft Entra ID and Microsoft 365 |
| **Version scope** | Microsoft.Graph PowerShell SDK 2.x (v1.0 endpoint) |
| **Commands** | 45 (5 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/microsoft-graph-powershell](https://www.epifive.com/cheatsheets/microsoft-graph-powershell)

## Contents

- [Install and connect](#install-and-connect)
- [Users](#users)
- [Licences](#licences)
- [Groups](#groups)
- [Admin roles and authentication methods](#admin-roles-and-authentication-methods)
- [Sign-in and audit logs](#sign-in-and-audit-logs)
- [Devices and applications](#devices-and-applications)
- [Raw Graph requests](#raw-graph-requests)
- [FAQ](#faq)
- [References](#references)

## Install and connect

| Command | What it does | Example |
|---|---|---|
| `Install-Module Microsoft.Graph -Scope CurrentUser` | Install the Microsoft Graph PowerShell SDK (v1.0 cmdlets) for the current user.<br>*Note:* Beta cmdlets live in a separate module: Install-Module Microsoft.Graph.Beta. Select-MgProfile no longer exists in v2. | `Install-Module Microsoft.Graph -Scope CurrentUser -Repository PSGallery -Force` |
| `Update-Module Microsoft.Graph` | Update the SDK and its sub-modules to the latest release. |  |
| `Connect-MgGraph -Scopes <scopes>` | Sign in with delegated access and request the permission scopes you need.<br>*Note:* Add -UseDeviceAuthentication on a machine without a browser. Run it again with extra scopes to add permissions. | `Connect-MgGraph -Scopes "User.Read.All","Group.ReadWrite.All"` |
| `Connect-MgGraph -ClientId <app-id> -TenantId <tenant-id> -CertificateThumbprint <thumbprint>` | Sign in app-only with an app registration and a certificate, for unattended scripts. | `Connect-MgGraph -ClientId "<app-id>" -TenantId "contoso.onmicrosoft.com" -CertificateThumbprint "<thumbprint>"` |
| `Get-MgContext` | Show the signed-in account, tenant, auth type and granted scopes. | `Get-MgContext \| Select-Object -ExpandProperty Scopes` |
| `Find-MgGraphCommand -Command <cmdlet>` | Show the API URI a cmdlet calls and the permissions it can use.<br>*Note:* Use -Uri "/users/{id}" to go the other way and find cmdlets for an API path. | `Find-MgGraphCommand -Command Get-MgUser` |
| `Find-MgGraphPermission <keyword>` | Search Graph permission names and descriptions. | `Find-MgGraphPermission application.Read \| Format-List` |
| `Disconnect-MgGraph` | Sign out and end the current Graph session. |  |

## Users

| Command | What it does | Example |
|---|---|---|
| `Get-MgUser -UserId <id-or-upn>` | Get one user by object ID or user principal name.<br>*Note:* Scope: User.Read.All (User.ReadBasic.All for basic properties only). | `Get-MgUser -UserId user@contoso.com \| Format-List Id,DisplayName,Mail,UserPrincipalName` |
| `Get-MgUser -All -Property <list>` | List every user, returning the properties you ask for.<br>*Note:* Without -All only the first page is returned. Many properties, such as AccountEnabled, are only filled in when you name them in -Property. | `Get-MgUser -All -Property Id,DisplayName,UserPrincipalName,AccountEnabled,UsageLocation \| Select-Object DisplayName,UserPrincipalName,AccountEnabled,UsageLocation` |
| `Get-MgUser -Filter <odata-filter>` | Find users with an OData filter. | `Get-MgUser -Filter "startsWith(displayName,'a')" -Top 10` |
| `Get-MgUser -ConsistencyLevel eventual -CountVariable <name> -Filter <odata-filter>` | Run an advanced query (endsWith, ne, not, counts) that needs the eventual consistency header.<br>*Note:* Advanced queries need both -ConsistencyLevel eventual and -CountVariable. The count lands in $userCount. | `Get-MgUser -ConsistencyLevel eventual -CountVariable userCount -Filter "endsWith(mail,'@contoso.com')" -All` |
| `Get-MgUser -ConsistencyLevel eventual -CountVariable <name> -Filter 'assignedLicenses/$count eq 0'` | List users who have no licence assigned.<br>*Note:* Use single quotes so PowerShell does not expand $count. | `Get-MgUser -ConsistencyLevel eventual -CountVariable unlicensed -Filter 'assignedLicenses/$count eq 0' -All` |
| `New-MgUser -DisplayName <name> -PasswordProfile <hashtable> -AccountEnabled -MailNickname <alias> -UserPrincipalName <upn>` | Create a cloud user account.<br>*Note:* Scope: User.ReadWrite.All (least privileged: User.Create). | `$PasswordProfile = @{ Password = '<temporary-password>'; ForceChangePasswordNextSignIn = $true }; New-MgUser -DisplayName 'Alex Wilber' -PasswordProfile $PasswordProfile -AccountEnabled -MailNickname 'alexw' -UserPrincipalName 'alexw@contoso.com'` |
| `Update-MgUser -UserId <id-or-upn> -UsageLocation <country-code>` | Set the user's usage location, which must be set before a licence can be assigned.<br>*Note:* Two-letter ISO 3166 code such as US, GB or IN. Scope: User.ReadWrite.All (least privileged: User.ReadUpdate.All). | `Update-MgUser -UserId user@contoso.com -UsageLocation GB` |
| `Update-MgUser -UserId <id-or-upn> -AccountEnabled:$false` | **Destructive.** Block a user from signing in by disabling the account.<br>**Warning:** Warning: the user is blocked from signing in to every app. Least-privileged scopes: User.EnableDisableAccount.All plus User.Read.All; disabling an admin needs a suitably privileged admin role. Use -AccountEnabled to re-enable. | `Update-MgUser -UserId leaver@contoso.com -AccountEnabled:$false` |
| `Revoke-MgUserSignInSession -UserId <id-or-upn>` | **Destructive.** Invalidate a user's refresh tokens and browser session cookies so they must sign in again.<br>**Warning:** Warning: signs the user out of every app and device; there can be a delay of a few minutes. Scope: User.RevokeSessions.All. | `Revoke-MgUserSignInSession -UserId user@contoso.com` |
| `Remove-MgUser -UserId <id-or-upn>` | **Destructive.** Delete a user account.<br>**Warning:** Warning: the user, mailbox and licence assignments move to deleted items and are permanently deleted after 30 days if not restored. Scope: User.ReadWrite.All. | `Remove-MgUser -UserId leaver@contoso.com -Confirm` |
| `Restore-MgDirectoryDeletedItem -DirectoryObjectId <id>` | Restore a recently deleted user, group, application or service principal from deleted items.<br>*Note:* Deleted items stay available for up to 30 days, then are deleted permanently. | `Restore-MgDirectoryDeletedItem -DirectoryObjectId '<object-id>'` |
| `Get-MgUserMemberOf -UserId <id-or-upn> -All` | List the groups and directory roles a user belongs to directly. | `Get-MgUserMemberOf -UserId user@contoso.com -All` |
| `Get-MgUserManager -UserId <id-or-upn>` | Get a user's manager. | `Get-MgUserManager -UserId user@contoso.com` |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `Update-MgUser -UserId <id-or-upn> -AccountEnabled:$false`: Warning: the user is blocked from signing in to every app. Least-privileged scopes: User.EnableDisableAccount.All plus User.Read.All; disabling an admin needs a suitably privileged admin role. Use -AccountEnabled to re-enable.
> - `Revoke-MgUserSignInSession -UserId <id-or-upn>`: Warning: signs the user out of every app and device; there can be a delay of a few minutes. Scope: User.RevokeSessions.All.
> - `Remove-MgUser -UserId <id-or-upn>`: Warning: the user, mailbox and licence assignments move to deleted items and are permanently deleted after 30 days if not restored. Scope: User.ReadWrite.All.

## Licences

| Command | What it does | Example |
|---|---|---|
| `Get-MgSubscribedSku -All` | List the tenant's licence SKUs with SkuId, SkuPartNumber and consumed units.<br>*Note:* Scope: LicenseAssignment.Read.All (Organization.Read.All also works). | `Get-MgSubscribedSku -All \| Select-Object SkuPartNumber,SkuId,ConsumedUnits` |
| `Set-MgUserLicense -UserId <id-or-upn> -AddLicenses @{SkuId = <sku-id>} -RemoveLicenses @()` | Assign a licence to a user.<br>*Note:* Both -AddLicenses and -RemoveLicenses are required, even when one is empty. The user needs a UsageLocation first. Scope: LicenseAssignment.ReadWrite.All. | `$Sku = Get-MgSubscribedSku -All \| Where-Object SkuPartNumber -eq 'SPE_E3'; Set-MgUserLicense -UserId user@contoso.com -AddLicenses @{SkuId = $Sku.SkuId} -RemoveLicenses @()` |
| `Set-MgUserLicense -UserId <id-or-upn> -AddLicenses @() -RemoveLicenses @(<sku-id>)` | **Destructive.** Remove a licence from a user.<br>**Warning:** Warning: the user loses the services in that licence, and service data tied to it can be lost. Scope: LicenseAssignment.ReadWrite.All. | `Set-MgUserLicense -UserId leaver@contoso.com -AddLicenses @() -RemoveLicenses @($Sku.SkuId)` |
| `Get-MgUserLicenseDetail -UserId <id-or-upn>` | Show the licences and service plans assigned to a user.<br>*Note:* Scope: LicenseAssignment.Read.All. | `Get-MgUserLicenseDetail -UserId user@contoso.com \| Select-Object SkuPartNumber,SkuId` |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `Set-MgUserLicense -UserId <id-or-upn> -AddLicenses @() -RemoveLicenses @(<sku-id>)`: Warning: the user loses the services in that licence, and service data tied to it can be lost. Scope: LicenseAssignment.ReadWrite.All.

## Groups

| Command | What it does | Example |
|---|---|---|
| `Get-MgGroup -Filter <odata-filter>` | Find groups, for example by display name.<br>*Note:* Scope: Group.Read.All. Use -All to list every group. | `Get-MgGroup -Filter "displayName eq 'Sales Team'" \| Format-List Id,DisplayName,GroupTypes` |
| `New-MgGroup -DisplayName <name> -MailEnabled:$false -MailNickname <alias> -SecurityEnabled` | Create a security group.<br>*Note:* Scope: Group.ReadWrite.All. | `New-MgGroup -DisplayName 'VPN Users' -MailEnabled:$false -MailNickname 'vpnusers' -SecurityEnabled` |
| `New-MgGroup -DisplayName <name> -GroupTypes 'Unified' -MailEnabled -MailNickname <alias> -SecurityEnabled:$false` | Create a Microsoft 365 group. | `New-MgGroup -DisplayName 'Marketing' -GroupTypes 'Unified' -MailEnabled -MailNickname 'marketing' -SecurityEnabled:$false` |
| `New-MgGroupMember -GroupId <group-id> -DirectoryObjectId <object-id>` | Add a user or other directory object to a group.<br>*Note:* Scope: GroupMember.ReadWrite.All. | `New-MgGroupMember -GroupId '<group-id>' -DirectoryObjectId (Get-MgUser -UserId user@contoso.com).Id` |
| `Get-MgGroupMember -GroupId <group-id> -All` | List every member of a group.<br>*Note:* Scope: GroupMember.Read.All. Results are directory objects; details such as the UPN are in AdditionalProperties. | `Get-MgGroupMember -GroupId '<group-id>' -All` |
| `New-MgGroupOwner -GroupId <group-id> -DirectoryObjectId <object-id>` | Add an owner to a group. | `New-MgGroupOwner -GroupId '<group-id>' -DirectoryObjectId '<user-object-id>'` |
| `Remove-MgGroupMemberByRef -GroupId <group-id> -DirectoryObjectId <object-id>` | **Destructive.** Remove a member from a group.<br>**Warning:** Warning: the member loses any access, licences or policies applied through the group. Scope: GroupMember.ReadWrite.All. | `Remove-MgGroupMemberByRef -GroupId '<group-id>' -DirectoryObjectId '<user-object-id>'` |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `Remove-MgGroupMemberByRef -GroupId <group-id> -DirectoryObjectId <object-id>`: Warning: the member loses any access, licences or policies applied through the group. Scope: GroupMember.ReadWrite.All.

## Admin roles and authentication methods

| Command | What it does | Example |
|---|---|---|
| `Get-MgDirectoryRole` | List the directory roles that are activated in the tenant.<br>*Note:* Scope: RoleManagement.Read.Directory. Only activated roles are returned; Get-MgRoleManagementDirectoryRoleAssignment covers every assignment. | `Get-MgDirectoryRole \| Select-Object Id,DisplayName` |
| `Get-MgDirectoryRoleMember -DirectoryRoleId <role-id>` | List members of an activated directory role, such as Global Administrator.<br>*Note:* Scope: RoleManagement.Read.Directory. | `Get-MgDirectoryRoleMember -DirectoryRoleId (Get-MgDirectoryRole -Filter "displayName eq 'Global Administrator'").Id` |
| `Get-MgRoleManagementDirectoryRoleAssignment -Filter <odata-filter>` | List role assignments through the unified RBAC API, for example all roles held by one user.<br>*Note:* Scope: RoleManagement.Read.Directory. principalId and roleDefinitionId support eq and in filters. | `Get-MgRoleManagementDirectoryRoleAssignment -Filter "principalId eq '<user-object-id>'" -ExpandProperty roleDefinition` |
| `Get-MgUserAuthenticationMethod -UserId <id-or-upn>` | List a user's registered authentication methods, such as Authenticator, phone and FIDO2.<br>*Note:* Scope for other users: UserAuthenticationMethod.Read.All; the admin also needs a role such as Global Reader or Authentication Administrator. | `Get-MgUserAuthenticationMethod -UserId user@contoso.com` |

## Sign-in and audit logs

| Command | What it does | Example |
|---|---|---|
| `Get-MgAuditLogSignIn -Filter <odata-filter> -Top <n>` | Read Entra ID sign-in logs.<br>*Note:* Scope: AuditLog.Read.All. userPrincipalName supports eq and startsWith; createdDateTime supports eq, le and ge. Only data within the Entra retention period is returned. | `Get-MgAuditLogSignIn -Filter "userPrincipalName eq 'user@contoso.com'" -Top 20` |
| `Get-MgAuditLogSignIn -Filter "createdDateTime ge <date>"` | Read sign-ins since a given UTC date and time. | `Get-MgAuditLogSignIn -Filter "createdDateTime ge 2026-10-27T00:00:00Z" -Top 100` |
| `Get-MgAuditLogDirectoryAudit -Filter <odata-filter>` | Read the Entra ID audit log of directory changes.<br>*Note:* Scope: AuditLog.Read.All. | `Get-MgAuditLogDirectoryAudit -Filter "initiatedBy/user/id eq '<user-object-id>'" -Top 50` |

## Devices and applications

| Command | What it does | Example |
|---|---|---|
| `Get-MgDevice -All` | List devices registered or joined to Entra ID.<br>*Note:* Scope: Device.Read.All. | `Get-MgDevice -Filter "operatingSystem eq 'Windows'" -All \| Select-Object DisplayName,OperatingSystemVersion,ApproximateLastSignInDateTime` |
| `Get-MgUserRegisteredDevice -UserId <id-or-upn>` | List devices registered by a user. | `Get-MgUserRegisteredDevice -UserId user@contoso.com` |
| `Get-MgApplication -Filter <odata-filter>` | List app registrations, or find one by its application (client) ID.<br>*Note:* Scope: Application.Read.All. | `Get-MgApplication -Filter "appId eq '<app-id>'" \| Format-List Id,DisplayName,AppId,SignInAudience` |
| `Get-MgServicePrincipal -Filter <odata-filter>` | List enterprise applications (service principals) in the tenant.<br>*Note:* Scope: Application.Read.All. | `Get-MgServicePrincipal -Filter "displayName eq 'Power BI Service'" \| Format-List Id,DisplayName,AppId` |

## Raw Graph requests

| Command | What it does | Example |
|---|---|---|
| `Invoke-MgGraphRequest -Method GET -Uri <url>` | Call any Microsoft Graph endpoint directly using the current session.<br>*Note:* Useful when no cmdlet exists yet. Use single quotes so PowerShell does not expand $top. | `Invoke-MgGraphRequest -Method GET -Uri 'https://graph.microsoft.com/v1.0/users?$top=5'` |
| `Invoke-MgGraphRequest -Method PATCH -Uri <url> -Body <hashtable>` | Send a write request, such as updating a user property, with a request body. | `Invoke-MgGraphRequest -Method PATCH -Uri 'https://graph.microsoft.com/v1.0/users/user@contoso.com' -Body @{ jobTitle = 'Sales Manager' }` |

## FAQ

### What replaces the AzureAD and MSOnline PowerShell modules?

The Microsoft Graph PowerShell SDK. The AzureAD and MSOnline modules are retired, so scripts using Get-AzureADUser or Get-MsolUser should move to Graph cmdlets such as Get-MgUser, Set-MgUserLicense and Get-MgGroupMember. Install it with Install-Module Microsoft.Graph -Scope CurrentUser.

### Why does Get-MgUser return empty values for some properties?

Graph returns only a default set of user properties. Properties such as AccountEnabled, UsageLocation or SignInActivity must be requested with -Property, for example Get-MgUser -All -Property DisplayName,AccountEnabled. Use -All as well, or you only get the first page.

### How do I assign a Microsoft 365 licence with Graph PowerShell?

Set the user's usage location with Update-MgUser -UsageLocation, find the SkuId with Get-MgSubscribedSku -All, then run Set-MgUserLicense -UserId user@contoso.com -AddLicenses @{SkuId = '&lt;sku-id&gt;'} -RemoveLicenses @(). Connect with the LicenseAssignment.ReadWrite.All scope.

### What happened to Select-MgProfile?

It was removed in version 2 of the SDK. The Microsoft.Graph module now targets only the v1.0 endpoint, and beta cmdlets come from a separate Microsoft.Graph.Beta module with an MgBeta prefix, such as Get-MgBetaUser.

## References

Every command above was checked against these official pages:

- [Install the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/installation)
- [Get started with the Microsoft Graph PowerShell SDK](https://learn.microsoft.com/en-us/powershell/microsoftgraph/get-started)
- [Get-MgUser (Microsoft.Graph.Users)](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.users/get-mguser)
- [Set-MgUserLicense (Microsoft.Graph.Users.Actions)](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.users.actions/set-mguserlicense)
- [New-MgGroupMember (Microsoft.Graph.Groups)](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.groups/new-mggroupmember)
- [Get-MgAuditLogSignIn (Microsoft.Graph.Reports)](https://learn.microsoft.com/en-us/powershell/module/microsoft.graph.reports/get-mgauditlogsignin)
- [Update user (Microsoft Graph API permissions)](https://learn.microsoft.com/en-us/graph/api/user-update)
- [Advanced query capabilities on Microsoft Entra ID objects](https://learn.microsoft.com/en-us/graph/aad-advanced-queries)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
