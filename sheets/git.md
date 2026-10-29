# Git commands cheat sheet

The Git commands you use every day, grouped by task, with the risky ones flagged. Replace placeholders such as &lt;file&gt;, &lt;branch&gt; and &lt;commit&gt; with your own values.

| | |
|---|---|
| **Vendor** | Git |
| **Platform** | Git command line |
| **Version scope** | Git 2.40 and later (checked against the Git 2.56 reference on git-scm.com) |
| **Commands** | 56 (6 marked destructive) |
| **Last verified** | 2026-10-28 |

Searchable version with copy buttons and a printable PDF: [epifive.com/cheatsheets/git](https://www.epifive.com/cheatsheets/git)

## Contents

- [Setup](#setup)
- [Start a repository](#start-a-repository)
- [Daily work](#daily-work)
- [Branches](#branches)
- [Remotes](#remotes)
- [History](#history)
- [Undo and stash](#undo-and-stash)
- [Tags](#tags)
- [FAQ](#faq)
- [References](#references)

## Setup

| Command | What it does | Example |
|---|---|---|
| `git config --global user.name "Your Name"` | Set the name recorded in your commits.<br>*Note:* Git 2.46 and later also accept git config set --global user.name "Your Name"; the older form still works. |  |
| `git config --global user.email "you@example.com"` | Set the email address recorded in your commits. |  |
| `git config --global init.defaultBranch main` | Use main as the branch name for new repositories. |  |
| `git config --list --show-origin` | List every setting and the file it comes from.<br>*Note:* Git 2.46 and later also offer git config list --show-origin. |  |

## Start a repository

| Command | What it does | Example |
|---|---|---|
| `git init` | Create a new repository in the current folder.<br>*Note:* -b (--initial-branch) sets the first branch name for this repository only. | `git init -b main` |
| `git clone <url>` | Copy a remote repository, including its full history. | `git clone https://example.com/team/project.git` |
| `git clone --depth 1 <url>` | Make a shallow clone with only the latest commit.<br>*Note:* Faster for large repositories and CI. Implies --single-branch unless you pass --no-single-branch. |  |
| `git clone --branch <name> <url>` | Clone and check out a specific branch or tag. | `git clone --branch release-2.1 https://example.com/team/project.git` |

## Daily work

| Command | What it does | Example |
|---|---|---|
| `git status -sb` | Show changed files in short format with the branch and tracking status. |  |
| `git add <file>` | Stage a file for the next commit. | `git add src/app.js` |
| `git add -p` | Choose which changes to stage, hunk by hunk. |  |
| `git restore --staged <file>` | Unstage a file but keep your changes in the working tree. |  |
| `git restore <file>` | **Destructive.** Discard uncommitted changes to a file.<br>**Warning:** Unstaged edits to the file are lost and cannot be recovered from Git. |  |
| `git commit -m "<message>"` | Commit the staged changes with a message. | `git commit -m "Fix login timeout"` |
| `git commit -am "<message>"` | Stage all modified tracked files and commit them in one step.<br>*Note:* New untracked files are not included; add them with git add first. |  |
| `git commit --amend` | Replace the last commit with a new one that includes staged changes or a new message.<br>*Note:* This rewrites the commit. Avoid amending commits you have already pushed to a shared branch. |  |
| `git diff` | Show changes that are not staged yet. |  |
| `git diff --staged` | Show changes that are staged for the next commit.<br>*Note:* --staged is a synonym of --cached. |  |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `git restore <file>`: Unstaged edits to the file are lost and cannot be recovered from Git.

## Branches

| Command | What it does | Example |
|---|---|---|
| `git branch -a` | List local and remote-tracking branches. |  |
| `git switch -c <branch>` | Create a new branch and switch to it. | `git switch -c feature/login-timeout` |
| `git switch <branch>` | Switch to an existing branch.<br>*Note:* git switch - returns to the branch you were on before. | `git switch -` |
| `git branch -m <new-name>` | Rename the current branch. |  |
| `git branch -d <branch>` | Delete a branch that has been merged.<br>*Note:* Refuses to delete a branch with unmerged work, which makes it the safe option. |  |
| `git branch -D <branch>` | **Destructive.** Force-delete a branch even if it is not merged.<br>**Warning:** Commits that exist only on that branch are no longer reachable. You can usually recover them from git reflog for a limited time. |  |
| `git merge --no-ff <branch>` | Merge a branch into the current one and always create a merge commit. | `git merge --no-ff feature/login-timeout` |
| `git merge --abort` | Cancel a merge that has conflicts and go back to the state before it started. |  |
| `git rebase <branch>` | Replay your commits on top of another branch.<br>*Note:* Rewrites commit IDs. Do not rebase commits that others have already pulled. | `git rebase main` |
| `git rebase -i HEAD~3` | Edit, reorder, squash or drop the last three commits interactively. |  |
| `git rebase --continue` | Carry on after resolving a rebase conflict.<br>*Note:* Use git rebase --abort to give up and return to where you started. |  |

> [!WARNING]
> This command changes or deletes data and cannot easily be undone:
> - `git branch -D <branch>`: Commits that exist only on that branch are no longer reachable. You can usually recover them from git reflog for a limited time.

## Remotes

| Command | What it does | Example |
|---|---|---|
| `git remote -v` | List remotes with their fetch and push URLs. |  |
| `git remote add origin <url>` | Connect a local repository to a remote. | `git remote add origin https://example.com/team/project.git` |
| `git remote set-url origin <url>` | Change the URL of an existing remote. |  |
| `git fetch --prune` | Download new commits and remove remote-tracking branches deleted on the remote.<br>*Note:* Fetch never changes your own branches or working files. |  |
| `git pull --rebase` | Fetch and rebase your local commits on top of the upstream branch.<br>*Note:* Avoids an extra merge commit when you and others commit to the same branch. |  |
| `git push -u origin <branch>` | Push a branch and set it as the upstream for later git push and git pull. | `git push -u origin feature/login-timeout` |
| `git push --force-with-lease` | **Destructive.** Overwrite the remote branch only if it still matches what you last fetched.<br>**Warning:** Replaces remote history, so commits on the remote branch that are not in yours are discarded. Safer than --force because it refuses if someone else pushed since your last fetch. |  |
| `git push origin --delete <branch>` | **Destructive.** Delete a branch on the remote.<br>**Warning:** Removes the branch for everyone. Commits only on that branch become unreachable on the remote. |  |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `git push --force-with-lease`: Replaces remote history, so commits on the remote branch that are not in yours are discarded. Safer than --force because it refuses if someone else pushed since your last fetch.
> - `git push origin --delete <branch>`: Removes the branch for everyone. Commits only on that branch become unreachable on the remote.

## History

| Command | What it does | Example |
|---|---|---|
| `git log --oneline --graph --decorate --all` | Show a compact graph of every branch with branch and tag names. |  |
| `git log -p -- <file>` | Show the history of one file with the change in each commit.<br>*Note:* --follow keeps tracking the file across renames. | `git log -p --follow -- src/app.js` |
| `git log --author=<pattern>` | Show only commits by a matching author. | `git log --author="Jane" --oneline` |
| `git show <commit>` | Show a commit's message and changes. | `git show HEAD~1` |
| `git blame <file>` | Show who last changed each line of a file and in which commit. | `git blame -L 10,20 src/app.js` |
| `git reflog` | Show where HEAD has pointed recently, including commits lost after a reset or rebase.<br>*Note:* The first place to look when you need to recover work. |  |

## Undo and stash

| Command | What it does | Example |
|---|---|---|
| `git revert <commit>` | Create a new commit that reverses an earlier commit.<br>*Note:* Safe on shared branches because it does not rewrite history. |  |
| `git reset --soft HEAD~1` | Undo the last commit but keep its changes staged. |  |
| `git reset HEAD~1` | Undo the last commit and keep its changes as unstaged edits.<br>*Note:* --mixed is the default mode. |  |
| `git reset --hard <commit>` | **Destructive.** Move the branch to a commit and make the working tree match it exactly.<br>**Warning:** All uncommitted changes to tracked files are lost. Commits after &lt;commit&gt; can usually be found in git reflog for a while. | `git reset --hard origin/main` |
| `git clean -n` | Preview which untracked files git clean would remove. |  |
| `git clean -fd` | **Destructive.** Remove untracked files and directories.<br>**Warning:** Untracked files are deleted from disk and Git has no copy to restore. Run git clean -n first. |  |
| `git stash push -m "<message>"` | Save uncommitted changes and return to a clean working tree.<br>*Note:* -u also stashes untracked files. | `git stash push -u -m "wip login fix"` |
| `git stash list` | List saved stashes. |  |
| `git stash pop` | Apply the latest stash and remove it from the list.<br>*Note:* If applying causes conflicts, the stash is kept so you do not lose it. |  |
| `git cherry-pick <commit>` | Apply the changes from one commit onto the current branch.<br>*Note:* Add -x to record the original commit ID in the message. |  |

> [!WARNING]
> These commands change or delete data and cannot easily be undone:
> - `git reset --hard <commit>`: All uncommitted changes to tracked files are lost. Commits after &lt;commit&gt; can usually be found in git reflog for a while.
> - `git clean -fd`: Untracked files are deleted from disk and Git has no copy to restore. Run git clean -n first.

## Tags

| Command | What it does | Example |
|---|---|---|
| `git tag -a <tag> -m "<message>"` | Create an annotated tag on the current commit. | `git tag -a v1.2.0 -m "Release 1.2.0"` |
| `git tag -l` | List tags. | `git tag -l "v1.*"` |
| `git push origin --tags` | Push all local tags to the remote.<br>*Note:* Tags are not pushed by a plain git push; push one by name or use --tags. | `git push origin v1.2.0` |

## FAQ

### What is the difference between git fetch and git pull?

git fetch downloads new commits and updates remote-tracking branches such as origin/main, but leaves your own branches and files alone. git pull runs a fetch and then integrates the upstream changes into your current branch, by merging or, with --rebase, by rebasing.

### How do I undo the last Git commit?

If you have not pushed it, git reset --soft HEAD\~1 removes the commit and keeps its changes staged, and git reset HEAD\~1 keeps them as unstaged edits. If the commit is already on a shared branch, use git revert, which adds a new commit that reverses it without rewriting history.

### What is the difference between git merge and git rebase?

git merge joins two branches and keeps both histories, adding a merge commit when needed. git rebase replays your commits on top of another branch, which gives a straight history but creates new commit IDs. Rebase only commits that have not been shared with others.

### Is git push --force-with-lease safer than git push --force?

Yes. --force overwrites the remote branch no matter what is there. --force-with-lease only overwrites it if the remote still points where your last fetch saw it, so it refuses when someone else has pushed in the meantime. Both still rewrite remote history.

## References

Every command above was checked against these official pages:

- [Git reference documentation](https://git-scm.com/docs)
- [git-config documentation](https://git-scm.com/docs/git-config)
- [git-restore documentation](https://git-scm.com/docs/git-restore)
- [git-switch documentation](https://git-scm.com/docs/git-switch)
- [git-push documentation](https://git-scm.com/docs/git-push)
- [git-rebase documentation](https://git-scm.com/docs/git-rebase)
- [git-reset documentation](https://git-scm.com/docs/git-reset)
- [git-stash documentation](https://git-scm.com/docs/git-stash)

---

Last verified 2026-10-28. Found a wrong flag or an outdated command? Open an issue with the "Correction" template and include the link to the official documentation.

Part of the [EpiFive IT cheat sheets](https://www.epifive.com/cheatsheets). Licensed under CC BY 4.0.
