---
layout: post
title: "Enabling pbcopy over SSH with iTerm2"
date: 2024-11-30
categories: blog
---

When working in the command line, you may want to quickly copy command output or file contents to your clipboard, perhaps to share with someone or for simple text manipulation. On macOS, the simplest approach is using the `pbcopy` command, which copies any piped input to your clipboard. Similar to `xclip` on Linux, this is a very simple command that works well for many use cases.

However, `pbcopy` typically doesn't work in remote SSH sessions. While there are various workarounds with different levels of complexity and thoroughness, I've found a straightforward solution for iTerm2 users that's simpler than the alternatives discussed in [this Stack Overflow thread](https://stackoverflow.com/questions/1152362/how-to-send-data-to-local-clipboard-from-a-remote-ssh-session).

Here's how to enable `pbcopy` over SSH:

1. First, define this function on the remote server by adding it to your `~/.bashrc`:

    ```bash
    pbcopy() {
        input=$(cat)
        encoded=$(printf "%s" "$input" | base64 -w 0)
        printf "\033]52;c;%s\007" "$encoded"
    }
    ```

2. In iTerm2 on your local machine, navigate to Settings > General > Selection and enable "Applications in terminal may access clipboard". You can leave "Allow sending of clipboard contents?" set to "Always Ask" as it doesn't affect this functionality.

3. For tmux users, add this line to your `~/.tmux.conf` to ensure clipboard interaction works within tmux sessions:
   - `set -s set-clipboard on`
   - This setting allows `tmux` to interact with the system clipboard, ensuring that the `pbcopy` function works seamlessly within `tmux` sessions.

Note: This method is specific to macOS and iTerm2.
