# Exchange Online PowerShell commands cheat sheet

Everyday Exchange Online admin tasks from the ExchangeOnlineManagement V3 module. Role-based access control decides which cmdlets and parameters you can run after you connect.

| | |
|---|---|
| **Vendor** | Microsoft |
| **Platform** | Exchange Online (Microsoft 365) |
| **Version scope** | ExchangeOnlineManagement module 3.x (REST-based cmdlets) |
| **Commands** | 55 (5 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/exchange-online-powershell](https://www.epifive.com/cheatsheets/exchange-online-powershell)

## Contents

- [Install and connect](#install-and-connect)
- [Mailboxes](#mailboxes)
- [Mailbox permissions](#mailbox-permissions)
- [Forwarding and inbox rules](#forwarding-and-inbox-rules)
- [Mail flow and message trace](#mail-flow-and-message-trace)
- [Archive, retention and holds](#archive-retention-and-holds)
- [Distribution lists and Microsoft 365 groups](#distribution-lists-and-microsoft-365-groups)
- [Calendars and automatic replies](#calendars-and-automatic-replies)
- [FAQ](#faq)
- [References](#references)

## Install and connect

| Command | What it does | Example |
|---|---|---|
| `Install-Module -Name ExchangeOnlineManagement` | Install the Exchange Online PowerShell module from the PowerShell Gallery.<br>*Note:* Versions 3.10.0 and later need PowerShell 7.6 or later on PowerShell 7; Windows PowerShell 5.1 is not affected. | `Install-Module -Name ExchangeOnlineManagement -Scope CurrentUser` |
| `Update-Module -Name ExchangeOnlineManagement` | Update an existing installation to the latest release. | `Update-Module -Name ExchangeOnlineManagement -Scope CurrentUser` |
| `Import-Module ExchangeOnlineManagement` | Load the module into the current session.<br>*Note:* Usually optional: running Connect-ExchangeOnline loads an installed module for you. |  |
| `Connect-ExchangeOnline -UserPrincipalName <UPN>` | Sign in to Exchange Online PowerShell with modern authentication, with or without MFA.<br>*Note:* Add -Device on a machine without a browser, or -DelegatedOrganization &lt;tenant&gt;.onmicrosoft.com to manage a customer tenant as a partner. | `Connect-ExchangeOnline -UserPrincipalName admin@contoso.com` |
| `Get-ConnectionInformation` | List the active REST-based connections in this PowerShell window.<br>*Note:* Get-PSSession does not show REST connections, so use this instead. |  |
| `Disconnect-ExchangeOnline -Confirm:$false` | Close the session without a confirmation prompt.<br>*Note:* Always disconnect when finished; abandoned sessions count against your limit until they expire. |  |

## Mailboxes

| Command | What it does | Example |
|---|---|---|
| `Get-EXOMailbox -ResultSize Unlimited` | List every mailbox with a minimal, fast set of properties.<br>*Note:* The default is 1000 results. Add -Properties or -PropertySets (for example Quota, Archive, Delivery) for more fields. |  |
| `Get-EXOMailbox -RecipientTypeDetails SharedMailbox` | List mailboxes of one subtype, such as shared or room mailboxes. | `Get-EXOMailbox -RecipientTypeDetails SharedMailbox,RoomMailbox -ResultSize Unlimited` |
| `Get-EXOMailbox -Identity <mailbox> -Properties <list>` | Show chosen properties for one mailbox. | `Get-EXOMailbox -Identity user@contoso.com -Properties DisplayName,EmailAddresses,Alias` |
| `Get-Mailbox -Identity <mailbox>` | Show the full property set for a mailbox, including properties Get-EXOMailbox leaves out.<br>*Note:* Slower than Get-EXOMailbox for bulk queries; use it for single mailboxes. | `Get-Mailbox -Identity user@contoso.com \| Format-List` |
| `Get-EXOMailboxStatistics -Identity <mailbox>` | Show mailbox size, item count and deleted item size.<br>*Note:* Add -Archive to get the same figures for the archive mailbox. | `Get-EXOMailboxStatistics -Identity user@contoso.com` |
| `New-Mailbox -Shared -Name <name>` | Create a shared mailbox. | `New-Mailbox -Shared -Name "Sales Department" -DisplayName "Sales Department" -Alias Sales` |
| `Set-Mailbox -Identity <mailbox> -Type Shared` | Convert a user mailbox to a shared mailbox.<br>*Note:* Use -Type Regular to convert back. Other values: Room, Equipment. | `Set-Mailbox -Identity leaver@contoso.com -Type Shared` |
| `Set-Mailbox -Identity <mailbox> -EmailAddresses @{Add="<address>"}` | Add a secondary SMTP address without touching existing addresses.<br>*Note:* Use @{Remove="&lt;address&gt;"} to remove one. Listing addresses without Add or Remove replaces them all. | `Set-Mailbox -Identity user@contoso.com -EmailAddresses @{Add="sales@contoso.com"}` |
| `Set-Mailbox -Identity <mailbox> -HiddenFromAddressListsEnabled $true` | Hide a mailbox from the global address list. | `Set-Mailbox -Identity leaver@contoso.com -HiddenFromAddressListsEnabled $true` |

## Mailbox permissions

| Command | What it does | Example |
|---|---|---|
| `Add-MailboxPermission -Identity <mailbox> -User <user> -AccessRights FullAccess` | Give a user full access to open another mailbox.<br>*Note:* -AutoMapping $false stops Outlook adding the mailbox automatically. The default is $true. | `Add-MailboxPermission -Identity sales@contoso.com -User user@contoso.com -AccessRights FullAccess -InheritanceType All -AutoMapping $false` |
| `Get-EXOMailboxPermission -Identity <mailbox>` | List who has permissions on a mailbox. | `Get-EXOMailboxPermission -Identity sales@contoso.com -User user@contoso.com` |
| `Remove-MailboxPermission -Identity <mailbox> -User <user> -AccessRights FullAccess` | **Destructive.** Take away a user's full access to a mailbox.<br>**Warning:** Warning: the user loses access to the mailbox immediately. Confirm the user and mailbox before running it. | `Remove-MailboxPermission -Identity sales@contoso.com -User user@contoso.com -AccessRights FullAccess -InheritanceType All` |
| `Add-RecipientPermission -Identity <mailbox> -AccessRights SendAs -Trustee <user>` | Let a user send mail that appears to come directly from the mailbox. | `Add-RecipientPermission -Identity sales@contoso.com -AccessRights SendAs -Trustee user@contoso.com` |
| `Get-EXORecipientPermission -Identity <mailbox>` | List Send As permissions on a mailbox. | `Get-EXORecipientPermission -Identity sales@contoso.com` |
| `Remove-RecipientPermission -Identity <mailbox> -AccessRights SendAs -Trustee <user>` | **Destructive.** Remove a user's Send As permission.<br>**Warning:** Warning: the user can no longer send as the mailbox. Confirm the trustee first. | `Remove-RecipientPermission -Identity sales@contoso.com -AccessRights SendAs -Trustee user@contoso.com` |
| `Set-Mailbox -Identity <mailbox> -GrantSendOnBehalfTo @{Add="<user>"}` | Let a user send on behalf of the mailbox without replacing existing delegates.<br>*Note:* Recipients see "&lt;sender&gt; on behalf of &lt;mailbox&gt;". Without @{Add=...} the list is overwritten. | `Set-Mailbox -Identity sales@contoso.com -GrantSendOnBehalfTo @{Add="user@contoso.com"}` |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `Remove-MailboxPermission -Identity <mailbox> -User <user> -AccessRights FullAccess`: Warning: the user loses access to the mailbox immediately. Confirm the user and mailbox before running it.
> - `Remove-RecipientPermission -Identity <mailbox> -AccessRights SendAs -Trustee <user>`: Warning: the user can no longer send as the mailbox. Confirm the trustee first.

## Forwarding and inbox rules

| Command | What it does | Example |
|---|---|---|
| `Set-Mailbox -Identity <mailbox> -ForwardingSmtpAddress <address> -DeliverToMailboxAndForward $true` | Forward a mailbox's mail to another address and keep a copy in the mailbox.<br>*Note:* With -DeliverToMailboxAndForward $false (the default) mail is only forwarded, not kept. | `Set-Mailbox -Identity user@contoso.com -ForwardingSmtpAddress manager@contoso.com -DeliverToMailboxAndForward $true` |
| `Set-Mailbox -Identity <mailbox> -ForwardingSmtpAddress $null` | Turn off SMTP forwarding on a mailbox. | `Set-Mailbox -Identity user@contoso.com -ForwardingSmtpAddress $null` |
| `Get-EXOMailbox -ResultSize Unlimited -PropertySets Delivery` | Audit forwarding settings across all mailboxes.<br>*Note:* The Delivery property set includes ForwardingAddress, ForwardingSmtpAddress and DeliverToMailboxAndForward. | `Get-EXOMailbox -ResultSize Unlimited -PropertySets Delivery \| Where-Object {$_.ForwardingSmtpAddress -or $_.ForwardingAddress} \| Select-Object UserPrincipalName,ForwardingSmtpAddress,ForwardingAddress,DeliverToMailboxAndForward` |
| `Get-InboxRule -Mailbox <mailbox>` | List a mailbox's Inbox rules.<br>*Note:* -IncludeHidden also returns hidden rules. Filtering on ForwardTo, ForwardAsAttachmentTo and RedirectTo finds rules that send mail elsewhere, a common sign of a compromised account. | `Get-InboxRule -Mailbox user@contoso.com -IncludeHidden \| Where-Object {$_.ForwardTo -or $_.ForwardAsAttachmentTo -or $_.RedirectTo}` |
| `Remove-InboxRule -Mailbox <mailbox> -Identity <rule>` | **Destructive.** Delete an Inbox rule from a mailbox.<br>**Warning:** Warning: the rule is deleted permanently. Piping Get-InboxRule into Remove-InboxRule removes every rule in the mailbox. | `Remove-InboxRule -Mailbox user@contoso.com -Identity "Forward to external"` |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `Remove-InboxRule -Mailbox <mailbox> -Identity <rule>`: Warning: the rule is deleted permanently. Piping Get-InboxRule into Remove-InboxRule removes every rule in the mailbox.

## Mail flow and message trace

| Command | What it does | Example |
|---|---|---|
| `Get-MessageTraceV2 -SenderAddress <address> -StartDate <date> -EndDate <date>` | Trace messages from a sender over a date range.<br>*Note:* Replaces Get-MessageTrace, which Microsoft is deprecating. Searches the last 90 days, at most 10 days per query; returns 1000 results by default and up to 5000 with -ResultSize. Dates use your computer's short date format. | `Get-MessageTraceV2 -SenderAddress user@contoso.com -StartDate 10/20/2026 -EndDate 10/27/2026` |
| `Get-MessageTraceV2 -RecipientAddress <address> -Status Failed` | Find messages to a recipient that failed delivery.<br>*Note:* Without dates it covers the last 48 hours. Other -Status values: Delivered, Expanded, FilteredAsSpam, GettingStatus, Pending. | `Get-MessageTraceV2 -RecipientAddress user@contoso.com -Status Failed,Quarantined` |
| `Get-MessageTraceDetailV2 -MessageTraceId <guid> -RecipientAddress <address>` | Show the event-by-event detail of one traced message. | `Get-MessageTraceV2 -SenderAddress user@contoso.com -StartDate 10/20/2026 -EndDate 10/27/2026 \| Get-MessageTraceDetailV2` |
| `Get-TransportRule` | List mail flow (transport) rules. | `Get-TransportRule "External subject tag" \| Format-List` |
| `New-TransportRule -Name <name> -FromScope NotInOrganization -PrependSubject <text>` | Create a mail flow rule that tags the subject of mail from outside the organisation.<br>*Note:* Add -Mode Audit to log what the rule would do without changing messages. Enforce is the default. | `New-TransportRule -Name "External subject tag" -FromScope NotInOrganization -PrependSubject "[External] "` |
| `Get-AcceptedDomain` | List the domains the tenant accepts mail for; also a quick test that you are connected. |  |

## Archive, retention and holds

| Command | What it does | Example |
|---|---|---|
| `Enable-Mailbox -Identity <mailbox> -Archive` | Turn on the archive mailbox for an existing mailbox. | `Enable-Mailbox -Identity user@contoso.com -Archive` |
| `Get-EXOMailbox -Archive -ResultSize Unlimited` | List only mailboxes that have an archive enabled. |  |
| `Set-Mailbox -Identity <mailbox> -RetentionPolicy <policy>` | Assign a messaging records management (MRM) retention policy to a mailbox. | `Set-Mailbox -Identity user@contoso.com -RetentionPolicy "Default MRM Policy"` |
| `Start-ManagedFolderAssistant -Identity <mailbox>` | Ask the Managed Folder Assistant to process a mailbox's retention settings now.<br>*Note:* Useful after enabling an archive or changing a retention policy instead of waiting for the next scheduled run. | `Start-ManagedFolderAssistant -Identity user@contoso.com` |
| `Set-Mailbox -Identity <mailbox> -LitigationHoldEnabled $true` | Place a mailbox on Litigation Hold so deleted and changed items are kept.<br>*Note:* -LitigationHoldDuration is in days from when each item was received or created; the default is unlimited. | `Set-Mailbox -Identity user@contoso.com -LitigationHoldEnabled $true -LitigationHoldDuration 2555` |

## Distribution lists and Microsoft 365 groups

| Command | What it does | Example |
|---|---|---|
| `Get-DistributionGroup -ResultSize Unlimited` | List distribution groups and mail-enabled security groups. | `Get-DistributionGroup -Identity "Marketing" \| Format-List` |
| `New-DistributionGroup -Name <name> -Members <list>` | Create a distribution group with initial members.<br>*Note:* Add -Type Security to create a mail-enabled security group instead. | `New-DistributionGroup -Name "ITDepartment" -Members user1@contoso.com,user2@contoso.com` |
| `Get-DistributionGroupMember -Identity <group>` | List the members of a distribution group. | `Get-DistributionGroupMember -Identity "ITDepartment" -ResultSize Unlimited` |
| `Add-DistributionGroupMember -Identity <group> -Member <recipient>` | Add a member to a distribution group. | `Add-DistributionGroupMember -Identity "ITDepartment" -Member user@contoso.com` |
| `Remove-DistributionGroupMember -Identity <group> -Member <recipient>` | **Destructive.** Remove a member from a distribution group.<br>**Warning:** Warning: the member stops receiving the group's mail and loses any access granted through the group. | `Remove-DistributionGroupMember -Identity "ITDepartment" -Member user@contoso.com` |
| `Get-UnifiedGroup -ResultSize Unlimited` | List Microsoft 365 groups.<br>*Note:* The example finds groups with no owner. | `Get-UnifiedGroup \| Where-Object {-Not $_.ManagedBy}` |
| `Get-UnifiedGroupLinks -Identity <group> -LinkType Members` | List the members (or owners) of a Microsoft 365 group. | `Get-UnifiedGroupLinks -Identity "Legal Department" -LinkType Owners` |
| `Add-UnifiedGroupLinks -Identity <group> -LinkType Members -Links <list>` | Add members (or owners) to a Microsoft 365 group.<br>*Note:* With this cmdlet a user must be a member before you can add them with -LinkType Owners. | `Add-UnifiedGroupLinks -Identity "Legal Department" -LinkType Members -Links user1@contoso.com,user2@contoso.com` |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `Remove-DistributionGroupMember -Identity <group> -Member <recipient>`: Warning: the member stops receiving the group's mail and loses any access granted through the group.

## Calendars and automatic replies

| Command | What it does | Example |
|---|---|---|
| `Add-MailboxFolderPermission -Identity <mailbox>:\Calendar -User <user> -AccessRights <role>` | Share a calendar with a user at a given permission level.<br>*Note:* Common roles: AvailabilityOnly, LimitedDetails, Reviewer, Editor, Owner. -SharingPermissionFlags Delegate makes the user a calendar delegate. | `Add-MailboxFolderPermission -Identity user@contoso.com:\Calendar -User assistant@contoso.com -AccessRights Editor -SharingPermissionFlags Delegate` |
| `Get-EXOMailboxFolderPermission -Identity <mailbox>:\Calendar` | List who has access to a calendar and at what level. | `Get-EXOMailboxFolderPermission -Identity user@contoso.com:\Calendar` |
| `Set-MailboxFolderPermission -Identity <mailbox>:\Calendar -User <user> -AccessRights <role>` | Change an existing calendar permission.<br>*Note:* Set- modifies an existing permission entry; use Add- for a user who has no entry yet. | `Set-MailboxFolderPermission -Identity user@contoso.com:\Calendar -User assistant@contoso.com -AccessRights Reviewer` |
| `Remove-MailboxFolderPermission -Identity <mailbox>:\Calendar -User <user>` | **Destructive.** Remove a user's access to a calendar.<br>**Warning:** Warning: the user immediately loses the calendar, including any delegate rights. | `Remove-MailboxFolderPermission -Identity user@contoso.com:\Calendar -User assistant@contoso.com` |
| `Set-CalendarProcessing -Identity <resource> -AutomateProcessing AutoAccept` | Make a room or equipment mailbox accept or decline bookings automatically.<br>*Note:* None disables processing; AutoUpdate leaves requests tentative until a delegate approves. | `Set-CalendarProcessing -Identity "Room 221" -AutomateProcessing AutoAccept -AllowConflicts $false` |
| `Get-CalendarProcessing -Identity <resource>` | Show a resource mailbox's booking settings. | `Get-CalendarProcessing -Identity "Room 221" \| Format-List` |
| `Set-MailboxAutoReplyConfiguration -Identity <mailbox> -AutoReplyState Scheduled` | Schedule out-of-office replies for a mailbox.<br>*Note:* Use -AutoReplyState Enabled to start now with no end date. -ExternalAudience accepts None, Known or All. | `Set-MailboxAutoReplyConfiguration -Identity user@contoso.com -AutoReplyState Scheduled -StartTime "11/03/2026 08:00" -EndTime "11/07/2026 17:00" -InternalMessage "I am out of the office this week." -ExternalMessage "I am out of the office this week." -ExternalAudience All` |
| `Set-MailboxAutoReplyConfiguration -Identity <mailbox> -AutoReplyState Disabled` | Turn off automatic replies. | `Set-MailboxAutoReplyConfiguration -Identity user@contoso.com -AutoReplyState Disabled` |
| `Get-MailboxAutoReplyConfiguration -Identity <mailbox>` | Show a mailbox's automatic reply state and messages. | `Get-MailboxAutoReplyConfiguration -Identity user@contoso.com` |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `Remove-MailboxFolderPermission -Identity <mailbox>:\Calendar -User <user>`: Warning: the user immediately loses the calendar, including any delegate rights.

## FAQ

### How do I connect to Exchange Online PowerShell?

Install the module with Install-Module -Name ExchangeOnlineManagement, then run Connect-ExchangeOnline -UserPrincipalName admin@contoso.com and sign in (MFA is supported). When you are done, run Disconnect-ExchangeOnline -Confirm:$false so the session does not count against your limit.

### What is the difference between Get-Mailbox and Get-EXOMailbox?

Get-EXOMailbox is one of the REST-based Get-EXO\* cmdlets in the V3 module. It returns a minimal property set by default, so it is much faster for thousands of mailboxes; ask for more with -Properties or -PropertySets. Get-Mailbox returns every property and suits one-off lookups.

### Is Get-MessageTrace deprecated?

Yes. Microsoft Learn marks Get-MessageTrace as replaced by Get-MessageTraceV2, and Get-MessageTraceDetail by Get-MessageTraceDetailV2. The V2 cmdlets search 90 days of data, up to 10 days per query, and use -ResultSize (up to 5000) instead of the old paging parameters.

### How do I give someone full access and Send As on a shared mailbox?

Run Add-MailboxPermission -Identity shared@contoso.com -User user@contoso.com -AccessRights FullAccess for full access, then Add-RecipientPermission -Identity shared@contoso.com -AccessRights SendAs -Trustee user@contoso.com for Send As. Check the result with Get-EXOMailboxPermission and Get-EXORecipientPermission.

## References

Every command above was checked against these official pages:

- [About the Exchange Online PowerShell V3 module](https://learn.microsoft.com/en-us/powershell/exchange/exchange-online-powershell-v2)
- [Connect to Exchange Online PowerShell](https://learn.microsoft.com/en-us/powershell/exchange/connect-to-exchange-online-powershell)
- [Property sets in Exchange Online PowerShell module cmdlets](https://learn.microsoft.com/en-us/powershell/exchange/cmdlet-property-sets)
- [Get-EXOMailbox](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/get-exomailbox)
- [Set-Mailbox](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/set-mailbox)
- [Add-MailboxPermission](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/add-mailboxpermission)
- [Get-MessageTraceV2](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/get-messagetracev2)
- [Add-MailboxFolderPermission](https://learn.microsoft.com/en-us/powershell/module/exchangepowershell/add-mailboxfolderpermission)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
