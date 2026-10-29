# Azure CLI commands cheat sheet

The az commands you reach for most when working in Azure from a terminal, grouped by task. Replace placeholders such as myResourceGroup, myVM and mystorageacct with your own names.

| | |
|---|---|
| **Vendor** | Microsoft |
| **Platform** | Azure CLI (az) |
| **Version scope** | Azure CLI 2.6x and later (checked against the current 2.8x reference on Microsoft Learn) |
| **Commands** | 58 (2 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/azure-cli](https://www.epifive.com/cheatsheets/azure-cli)

## Contents

- [Sign in and context](#sign-in-and-context)
- [Output and queries](#output-and-queries)
- [Resource groups and resources](#resource-groups-and-resources)
- [Virtual machines](#virtual-machines)
- [Networking](#networking)
- [Storage](#storage)
- [App Service](#app-service)
- [Identity, access and monitoring](#identity-access-and-monitoring)
- [FAQ](#faq)
- [References](#references)

## Sign in and context

| Command | What it does | Example |
|---|---|---|
| `az login` | Sign in to Azure with your user account.<br>*Note:* Uses Web Account Manager on Windows and a browser on Linux and macOS, and falls back to device code when neither is available. |  |
| `az login --use-device-code` | Sign in with a code you enter on another device.<br>*Note:* Useful over SSH or on servers without a browser. |  |
| `az login --identity` | Sign in with the managed identity of the Azure resource you are running on.<br>*Note:* Add --client-id or --resource-id to pick a user-assigned identity. | `az login --identity --client-id 00000000-0000-0000-0000-000000000000` |
| `az account show` | Show the subscription the CLI is currently using. | `az account show --output table` |
| `az account list --output table` | List the subscriptions your account can use.<br>*Note:* Add --all to include disabled subscriptions and other clouds, or --refresh to re-read them from the server. |  |
| `az account set --subscription <name-or-id>` | Switch the active subscription. | `az account set --subscription "Contoso Production"` |
| `az account list-locations --output table` | List the regions available to the current subscription. |  |
| `az config set defaults.group=myResourceGroup defaults.location=eastus` | Set a default resource group and region so you can omit -g and -l.<br>*Note:* Saved to \~/.azure/config; --local saves it for the current folder only. The az config group is marked experimental. | `az config set defaults.group=myResourceGroup --local` |
| `az version` | Show the installed Azure CLI, module and extension versions. |  |
| `az upgrade` | Upgrade Azure CLI and its extensions.<br>*Note:* Preview command. --yes skips the confirmation prompt. | `az upgrade --yes` |
| `az logout` | Sign out and remove access to your Azure subscriptions from this machine. |  |

## Output and queries

| Command | What it does | Example |
|---|---|---|
| `az vm list --output table` | Show results as a readable table instead of JSON.<br>*Note:* --output (-o) accepts json, jsonc, table, tsv, yaml, yamlc and none. |  |
| `az account show --query id --output tsv` | Return a single raw value, ready to use in a script variable.<br>*Note:* tsv strips the JSON quotes, so the value pastes cleanly into other commands. | `SUB_ID=$(az account show --query id --output tsv)` |
| `az vm list --query "[].{Name:name, RG:resourceGroup}" --output table` | Pick and rename fields with a JMESPath projection. |  |
| `az group list --query "[?location=='westus']"` | Filter results with a JMESPath condition. | `az account list --query "[?isDefault].name" --output tsv` |
| `az config set core.output=table` | Make table the default output format for every command. |  |

## Resource groups and resources

| Command | What it does | Example |
|---|---|---|
| `az group create -n myResourceGroup -l eastus` | Create a resource group in a region. | `az group create -n myResourceGroup -l eastus --tags env=dev owner=it` |
| `az group list --output table` | List the resource groups in the subscription. | `az group list --tag env=dev --output table` |
| `az group exists -n myResourceGroup` | Return true or false depending on whether the group exists. |  |
| `az resource list -g myResourceGroup --output table` | List every resource in a resource group. | `az resource list --resource-type Microsoft.Compute/virtualMachines --output table` |
| `az resource list --tag env=dev` | Find resources that carry a given tag. |  |
| `az resource tag --tags env=dev -i` | Add a tag to a resource while keeping its existing tags.<br>*Note:* Without -i (--is-incremental) the tags you pass replace all existing tags. | `az resource tag --tags env=dev -g myResourceGroup -n myVM --resource-type Microsoft.Compute/virtualMachines -i` |
| `az group delete -n myResourceGroup --yes --no-wait` | **Destructive.** Delete a resource group and everything in it.<br>**Warning:** Permanently deletes every resource in the group (VMs, disks, databases, storage accounts and their data). --yes skips the prompt and --no-wait returns before deletion finishes. |  |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `az group delete -n myResourceGroup --yes --no-wait`: Permanently deletes every resource in the group (VMs, disks, databases, storage accounts and their data). --yes skips the prompt and --no-wait returns before deletion finishes.

## Virtual machines

| Command | What it does | Example |
|---|---|---|
| `az vm image list --output table` | List popular Marketplace images and their aliases, such as Ubuntu2204.<br>*Note:* The cached alias list changes between CLI versions. Older aliases such as UbuntuLTS no longer work; add --all to search the full Marketplace (slow). |  |
| `az vm create -g myResourceGroup -n myVM --image Ubuntu2204 --admin-username azureuser --generate-ssh-keys` | Create a Linux VM and generate SSH keys if you do not have them.<br>*Note:* Keys are stored in \~/.ssh. --image also accepts a full Publisher:Offer:Sku:Version URN. | `az vm create -g myResourceGroup -n myVM --image Ubuntu2204 --size Standard_D2s_v5 --admin-username azureuser --generate-ssh-keys` |
| `az vm list -d --output table` | List VMs with power state, public IP and FQDN.<br>*Note:* -d (--show-details) adds the extra details but makes the command slower. |  |
| `az vm show -d -g myResourceGroup -n myVM --query publicIps --output tsv` | Get the public IP address of a VM. |  |
| `az vm start -g myResourceGroup -n myVM` | Start a stopped or deallocated VM. |  |
| `az vm stop -g myResourceGroup -n myVM` | Power off a VM without releasing its compute resources.<br>*Note:* A stopped VM is still billed for compute. Use az vm deallocate to stop the charges. |  |
| `az vm deallocate -g myResourceGroup -n myVM` | Stop a VM and release its compute so compute billing stops.<br>*Note:* Disks are kept and still billed. | `az vm deallocate -g myResourceGroup -n myVM --no-wait` |
| `az vm restart -g myResourceGroup -n myVM` | Restart a running VM. |  |
| `az vm list-skus -l eastus --size Standard_D --output table` | List VM sizes available in a region, filtered by a partial size name.<br>*Note:* Replaces az vm list-sizes, which is deprecated. Add --zone to show only sizes that support availability zones. |  |
| `az vm resize -g myResourceGroup -n myVM --size Standard_DS3_v2` | Change the size of a VM.<br>*Note:* The VM restarts during the resize. |  |
| `az vm open-port -g myResourceGroup -n myVM --port 443` | Open an inbound port on the VM's network security group.<br>*Note:* Default rule priority is 900. To limit which source addresses can connect, use az network nsg rule create instead. | `az vm open-port -g myResourceGroup -n myVM --port 80-100 --priority 100` |
| `az vm delete -g myResourceGroup -n myVM --yes` | **Destructive.** Delete a VM.<br>**Warning:** The VM is removed permanently. Depending on how it was created, its disks, NIC and public IP may be deleted with it or left behind (and keep costing money), so check the resource group afterwards. |  |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `az vm delete -g myResourceGroup -n myVM --yes`: The VM is removed permanently. Depending on how it was created, its disks, NIC and public IP may be deleted with it or left behind (and keep costing money), so check the resource group afterwards.

## Networking

| Command | What it does | Example |
|---|---|---|
| `az network vnet create -g myResourceGroup -n myVnet --address-prefixes 10.0.0.0/16 --subnet-name mySubnet --subnet-prefixes 10.0.1.0/24` | Create a virtual network with one subnet.<br>*Note:* If you omit --address-prefixes the VNet uses 10.0.0.0/16. |  |
| `az network vnet list -g myResourceGroup --output table` | List the virtual networks in a resource group. |  |
| `az network nsg create -g myResourceGroup -n myNsg` | Create a network security group. |  |
| `az network nsg rule create -g myResourceGroup --nsg-name myNsg -n AllowSSH --priority 1000` | Add a rule to a network security group.<br>*Note:* Priority 100 to 4096, lower runs first. Defaults are Allow, Inbound, any protocol, destination port 80. | `az network nsg rule create -g myResourceGroup --nsg-name myNsg -n AllowSSH --priority 1000 --source-address-prefixes 203.0.113.0/24 --destination-port-ranges 22 --access Allow --protocol Tcp` |
| `az network nsg rule list -g myResourceGroup --nsg-name myNsg --output table` | List the rules in a network security group.<br>*Note:* Add --include-default to show the built-in default rules too. |  |
| `az network public-ip list -g myResourceGroup --output table` | List public IP addresses in a resource group. |  |

## Storage

| Command | What it does | Example |
|---|---|---|
| `az storage account create -n mystorageacct -g myResourceGroup -l eastus --sku Standard_LRS` | Create a storage account with locally redundant storage.<br>*Note:* The name must be globally unique. Without --sku the default is Standard\_RAGRS. |  |
| `az storage container create --account-name mystorageacct -n mycontainer --auth-mode login` | Create a blob container using your Microsoft Entra sign-in instead of an account key.<br>*Note:* --auth-mode login needs a data-plane role such as Storage Blob Data Contributor. Containers are private by default. |  |
| `az storage blob upload --account-name mystorageacct -c mycontainer -n report.pdf -f ./report.pdf --auth-mode login` | Upload a local file as a blob.<br>*Note:* Add --overwrite to replace an existing blob with the same name. |  |
| `az storage blob list --account-name mystorageacct -c mycontainer --auth-mode login --output table` | List the blobs in a container.<br>*Note:* Add --prefix to list only names that start with a given string. |  |
| `az storage blob download --account-name mystorageacct -c mycontainer -n report.pdf -f ./report.pdf --auth-mode login` | Download a blob to a local file. |  |
| `az storage blob upload-batch --account-name mystorageacct -d mycontainer -s ./site --auth-mode login` | Upload every file in a local folder to a container.<br>*Note:* Use --pattern to upload only matching files. |  |

## App Service

| Command | What it does | Example |
|---|---|---|
| `az webapp list-runtimes --os-type linux` | List the runtime stacks you can use with --runtime. |  |
| `az appservice plan create -g myResourceGroup -n myPlan --sku B1` | Create an App Service plan (Linux by default).<br>*Note:* Use --is-linux false to create a Windows plan. | `az appservice plan create -g myResourceGroup -n myPlan --sku B1 --is-linux false` |
| `az webapp create -g myResourceGroup -p myPlan -n myuniqueapp --runtime "PYTHON:3.14"` | Create a web app on an existing plan.<br>*Note:* The app name becomes part of its default hostname, so it must be unique. |  |
| `az webapp deploy -g myResourceGroup -n myuniqueapp --src-path app.zip --type zip` | Deploy a package to a web app.<br>*Note:* Microsoft now recommends webapp create plus webapp deploy because az webapp up is deprecated. |  |
| `az webapp list -g myResourceGroup --output table` | List the web apps in a resource group. |  |
| `az webapp log tail -g myResourceGroup -n myuniqueapp` | Stream live logs from a web app.<br>*Note:* If nothing appears, turn on logging first with az webapp log config. |  |

## Identity, access and monitoring

| Command | What it does | Example |
|---|---|---|
| `az ad signed-in-user show` | Show the Microsoft Entra user you are signed in as. |  |
| `az role assignment create --assignee user@contoso.com --role Reader --scope /subscriptions/<subscription-id>/resourceGroups/myResourceGroup` | Grant a user, group or service principal a role at a scope.<br>*Note:* Scope can be a subscription, resource group or single resource. Grant the narrowest role and scope that does the job. |  |
| `az role assignment list --assignee user@contoso.com --all --output table` | List the role assignments for a user or service principal. | `az role assignment list --scope /subscriptions/<subscription-id> --output table` |
| `az monitor activity-log list -g myResourceGroup --offset 7d` | Show who changed what in a resource group over the last 7 days.<br>*Note:* --offset takes a ##d##h value. Add --caller or --status to narrow the results. |  |
| `az consumption usage list --start-date 2026-10-01 --end-date 2026-10-27 --output table` | List resource usage and cost details for a date range.<br>*Note:* The consumption command group is in preview. Dates are YYYY-MM-DD in UTC and must be given together. |  |

## FAQ

### What is the difference between az vm stop and az vm deallocate?

az vm stop powers off the operating system but keeps the compute allocated, so you are still billed for the VM. az vm deallocate stops the VM and releases the compute, which stops compute charges. Disks are kept and billed in both cases.

### How do I switch subscriptions in Azure CLI?

Run az account list --output table to see the subscriptions you can use, then az account set --subscription with the subscription name or ID. Check the result with az account show. Most commands also accept --subscription to target a different subscription for a single call.

### How do I sign in to Azure CLI without a browser?

Use az login --use-device-code. The CLI prints a code and a sign-in URL that you open on any other device. On Azure VMs and other resources with a managed identity, az login --identity signs in without any interactive step.

### How do I filter Azure CLI output?

Every az command accepts --query, which takes a JMESPath expression. Use \[?field=='value'\] to filter, \[\].{Name:name} to pick fields, and combine it with --output table for reading or --output tsv to feed a single value into a script.

## References

Every command above was checked against these official pages:

- [Azure CLI core commands reference (az login, az upgrade, az version)](https://learn.microsoft.com/en-us/cli/azure/reference-index?view=azure-cli-latest)
- [az account command reference](https://learn.microsoft.com/en-us/cli/azure/account?view=azure-cli-latest)
- [az vm command reference](https://learn.microsoft.com/en-us/cli/azure/vm?view=azure-cli-latest)
- [Find and use Azure Marketplace VM images with Azure CLI](https://learn.microsoft.com/en-us/azure/virtual-machines/linux/cli-ps-findimage)
- [az network nsg rule command reference](https://learn.microsoft.com/en-us/cli/azure/network/nsg/rule?view=azure-cli-latest)
- [az storage blob command reference](https://learn.microsoft.com/en-us/cli/azure/storage/blob?view=azure-cli-latest)
- [az webapp command reference](https://learn.microsoft.com/en-us/cli/azure/webapp?view=azure-cli-latest)
- [Query Azure CLI command results with JMESPath](https://learn.microsoft.com/en-us/cli/azure/query-azure-cli)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
