# Team Charter — mapping-issues
Run ID: ce0bff71a2e54c3abc0386e5fb5e7b10
Repo: /Users/crlough/Code/personal/az-hp
TICKET_DIR: /Users/crlough/Code/personal/az-hp/.loom/ticket

## Objective (current)

Objective rev: 2
Objective updated_at: 2026-02-18T02:05:29.135326Z

the localhost viewing via make dev-frontend is showing the legend, but no map whatsoever. the app is not complete until i can view the ultimate product

---

## Update 2026-02-18T02:05:29.135326Z

Additionally: investigate why the data pipeline takes over 15 minutes. Identify bottlenecks and potential optimizations.

## Sprint (current)

Name: map display fix
Started: 2026-02-18T01:53:14.621599Z
Tag: sprint:map-display-fix
Ticket rule: include tag `sprint:map-display-fix` on sprint tickets.

## Manager quickstart

Sprint loop:
- Start sprint: `loom team prep-sprint mapping-issues --name "..."`
- Fan-out (preferred): spawn an Investigator; investigator creates tickets directly.
- Plan: decide concurrency + ordering.
- Execute: spawn workers.
- Fan-in: integrate via merge queue; ship.
- Cleanup: retire workers; mark worktrees retirable when safe.

Core:
- Observe roster: `loom team status mapping-issues`
- Capture output: `loom team capture mapping-issues <manager|worker|ticket>`
- Send message: `loom team send mapping-issues <target> "..."`
- Spawn worker: `loom team spawn mapping-issues <TICKET_ID>`
- Resume worker: `loom team resume-worker mapping-issues <WORKER_ID>` (reuse existing worktree)
- Retire worker: `loom team retire mapping-issues <WORKER_ID>`
- Mark worktree retirable: `loom team mark-retirable mapping-issues <WORKER_ID>` (manager-only)
- Bounce worker: `loom team bounce mapping-issues <WORKER_ID|TICKET_ID>`

Durability + waiting:
- Inbox list: `loom team inbox mapping-issues list --to manager --unacked`
- Ack message: `loom team inbox mapping-issues ack <MSG_ID>`
- Wait (blocks; wakes early on inbox): `loom team wait mapping-issues 5m` (or `loom team wait 5m` inside tmux; `snooze` is an alias)
- Clock out (pause team): `loom team clock-out mapping-issues` (keeps state; stops tmux session)
- Clock in (resume team): `loom team clock-in mapping-issues` (restores manager + active workers)
- Update objective: `loom team objective mapping-issues set|append --message "..."`
- Team hygiene: `loom team janitor mapping-issues` (deletes only marked-retirable worktrees)
- When 100% done: `loom team disband mapping-issues` (preserves worktrees by default)

Merge queue (ship code):
- Ensure integrator exists: `loom team spawn-integrator mapping-issues`
- Enqueue approved branch: `loom team merge mapping-issues enqueue --ticket <TICKET_ID> --branch <BRANCH> --from-worker <WORKER_ID>`
- Queue status: `loom team merge mapping-issues list`
- Ship (merge-queue -> origin/main, push=True): `loom team ship mapping-issues` (nothing is shipped until you do this)

## Worker protocol

Workers must:
- Work exactly one ticket in their assigned worktree.
- Update the ticket via loom ticket at least every ~15 minutes or after major steps.
- Escalate when blocked (structured) and notify manager.
- Request review before considering a ticket complete.

