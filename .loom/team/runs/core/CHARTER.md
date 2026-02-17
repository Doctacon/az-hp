# Team Charter — core
Run ID: 794bda0ac36a4c5d80b3325da461df60
Repo: /Users/crlough/Code/personal/az-hp
TICKET_DIR: /Users/crlough/Code/personal/az-hp/.loom/ticket

## Objective (current)

Objective rev: 1
Objective updated_at: 2026-02-17T17:05:49.335142Z

Build the application after reading status.md

## Sprint (current)

(none)

## Manager quickstart

Sprint loop:
- Start sprint: `loom team prep-sprint core --name "..."`
- Fan-out (preferred): spawn an Investigator; investigator creates tickets directly.
- Plan: decide concurrency + ordering.
- Execute: spawn workers.
- Fan-in: integrate via merge queue; ship.
- Cleanup: retire workers; mark worktrees retirable when safe.

Core:
- Observe roster: `loom team status core`
- Capture output: `loom team capture core <manager|worker|ticket>`
- Send message: `loom team send core <target> "..."`
- Spawn worker: `loom team spawn core <TICKET_ID>`
- Resume worker: `loom team resume-worker core <WORKER_ID>` (reuse existing worktree)
- Retire worker: `loom team retire core <WORKER_ID>`
- Mark worktree retirable: `loom team mark-retirable core <WORKER_ID>` (manager-only)
- Bounce worker: `loom team bounce core <WORKER_ID|TICKET_ID>`

Durability + waiting:
- Inbox list: `loom team inbox core list --to manager --unacked`
- Ack message: `loom team inbox core ack <MSG_ID>`
- Wait (blocks; wakes early on inbox): `loom team wait core 5m` (or `loom team wait 5m` inside tmux; `snooze` is an alias)
- Clock out (pause team): `loom team clock-out core` (keeps state; stops tmux session)
- Clock in (resume team): `loom team clock-in core` (restores manager + active workers)
- Update objective: `loom team objective core set|append --message "..."`
- Team hygiene: `loom team janitor core` (deletes only marked-retirable worktrees)
- When 100% done: `loom team disband core` (preserves worktrees by default)

Merge queue (ship code):
- Ensure integrator exists: `loom team spawn-integrator core`
- Enqueue approved branch: `loom team merge core enqueue --ticket <TICKET_ID> --branch <BRANCH> --from-worker <WORKER_ID>`
- Queue status: `loom team merge core list`
- Ship (merge-queue -> origin/main, push=True): `loom team ship core` (nothing is shipped until you do this)

## Worker protocol

Workers must:
- Work exactly one ticket in their assigned worktree.
- Update the ticket via loom ticket at least every ~15 minutes or after major steps.
- Escalate when blocked (structured) and notify manager.
- Request review before considering a ticket complete.

