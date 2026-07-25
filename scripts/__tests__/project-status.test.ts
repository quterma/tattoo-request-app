import { execFileSync, spawnSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, resolve } from "node:path"
import { afterEach, describe, expect, it } from "vitest"

const scriptPath = resolve(process.cwd(), "scripts/project-status.mjs")
const fixtures: string[] = []

function git(root: string, args: string[]) {
  return execFileSync("git", ["-c", "core.excludesFile=/dev/null", ...args], {
    cwd: root,
    encoding: "utf8",
  })
}

function write(root: string, path: string, content: string) {
  const absolutePath = resolve(root, path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content)
}

function makeFixture() {
  const root = mkdtempSync(resolve(tmpdir(), "project-status-"))
  fixtures.push(root)
  write(root, "docs/project/tasks/.gitkeep", "")
  write(root, "docs/project/tasks/done/.gitkeep", "")
  write(root, "docs/project/reviews/.gitkeep", "")
  write(root, "docs/project/research/.gitkeep", "")
  git(root, ["init", "--quiet"])
  return root
}

function commitFixture(root: string) {
  git(root, ["add", "."])
  git(root, [
    "-c",
    "user.name=Project Status Test",
    "-c",
    "user.email=project-status@example.invalid",
    "commit",
    "--quiet",
    "-m",
    "fixture",
  ])
}

function runFixture(root: string) {
  return spawnSync(process.execPath, [scriptPath], {
    cwd: root,
    encoding: "utf8",
  })
}

function task({
  status = "ready",
  extra = "",
  completion,
}: {
  status?: string
  extra?: string
  completion?: string
} = {}) {
  return `# Task

## Status

\`${status}\` · trailing text

## Execution

- Executor: \`codex\`
- Reviewer: \`claude\`
${extra}
${completion ? `\n## Completion obligations\n\n${completion}\n` : ""}
`
}

afterEach(() => {
  for (const fixture of fixtures.splice(0)) {
    rmSync(fixture, { recursive: true, force: true })
  }
})

describe("project status command", () => {
  it("renders canonical artifacts, status variants, Blocks, gaps, and open work with exit 0", () => {
    const root = makeFixture()
    write(
      root,
      "docs/project/tasks/TASK_OPEN.md",
      task({ extra: "- Blocks: docs/project/tasks/TASK_NEXT.md" }),
    )
    write(root, "docs/project/tasks/TASK_NEXT.md", task({ status: "draft" }))
    write(
      root,
      "docs/project/tasks/done/TASK_DONE.md",
      task({ status: "done", completion: "None" }),
    )
    write(
      root,
      "docs/project/reviews/REVIEW_one.md",
      "Status: awaiting-review trailing text\nReviewer: codex\nRequested by: IMPL: fixture\n",
    )
    write(
      root,
      "docs/project/research/RESEARCH_one.md",
      "Status: `awaiting-research` · trailing text\nResearcher: codex\nRequested by: META: fixture\n",
    )
    commitFixture(root)

    const result = runFixture(root)

    expect(result.status).toBe(0)
    expect(result.stdout).toContain("Tasks (3)")
    expect(result.stdout).toContain("status=awaiting-review")
    expect(result.stdout).toContain("status=awaiting-research")
    expect(result.stdout).toContain("⛔ BLOCKS docs/project/tasks/TASK_NEXT.md")
    expect(result.stdout).toContain(
      "blocked work: not represented by structured data",
    )
    expect(result.stdout).toContain("Integrity (0 errors, 0 warnings)")
  })

  it("reports malformed task metadata, illegal locations, and literal baseline hashes", () => {
    const root = makeFixture()
    write(root, "docs/project/tasks/TASK_MISSING.md", "# Task\n")
    write(
      root,
      "docs/project/tasks/TASK_DUPLICATE.md",
      `${task()}\n## Status\n\n\`ready\`\n`,
    )
    write(
      root,
      "docs/project/tasks/TASK_UNKNOWN.md",
      task({ status: "invented" }),
    )
    write(
      root,
      "docs/project/tasks/TASK_DONE_ACTIVE.md",
      task({ status: "done", completion: "None" }),
    )
    write(root, "docs/project/tasks/done/TASK_READY_DONE.md", task())
    write(
      root,
      "docs/project/tasks/TASK_BASELINE.md",
      task({ extra: "- Baseline commit: deadbeef" }),
    )
    write(
      root,
      "docs/project/reviews/REVIEW_UNKNOWN.md",
      "Status: `invented`\nReviewer: codex\nRequested by: IMPL: malformed\n",
    )
    commitFixture(root)

    const result = runFixture(root)

    expect(result.status).toBe(1)
    expect(result.stdout).toContain("TASK_STATUS_MISSING")
    expect(result.stdout).toContain("TASK_STATUS_DUPLICATED")
    expect(result.stdout).toContain("TASK_STATUS_UNKNOWN")
    expect(result.stdout).toContain("TASK_STATUS_LOCATION")
    expect(result.stdout).toContain("TASK_LITERAL_BASELINE")
    expect(result.stdout).toContain("REVIEW_STATUS_UNKNOWN")
  })

  it("enforces the active-review invariant and awaiting-external transport buffers", () => {
    const root = makeFixture()
    write(
      root,
      "docs/project/reviews/REVIEW_one.md",
      "Status: `awaiting-review`\nReviewer: codex\nRequested by: IMPL: one\n",
    )
    write(
      root,
      "docs/project/reviews/REVIEW_two.md",
      "Status: `consensus`\nReviewer: codex\nRequested by: IMPL: two\n",
    )
    write(
      root,
      "docs/project/research/RESEARCH_external.md",
      "Status: `awaiting-external`\nResearcher: codex\nRequested by: STRAT: external\n",
    )
    commitFixture(root)

    const result = runFixture(root)

    expect(result.status).toBe(1)
    expect(result.stdout).toContain("REVIEW_MULTIPLE_ACTIVE")
    expect(
      result.stdout.match(/RESEARCH_EXTERNAL_BUFFER_MISSING/g),
    ).toHaveLength(2)
  })

  it("flags an orphaned queued review", () => {
    const root = makeFixture()
    write(
      root,
      "docs/project/reviews/REVIEW_queued.md",
      "Status: `queued`\nReviewer: codex\nRequested by: IMPL: queued\n",
    )
    commitFixture(root)

    const result = runFixture(root)

    expect(result.status).toBe(1)
    expect(result.stdout).toContain("REVIEW_ORPHANED_QUEUE")
  })

  it("validates completion evidence and tracked-in work items", () => {
    const root = makeFixture()
    write(
      root,
      "docs/project/PROJECT_BACKLOG.md",
      "# Backlog\n\n## Follow-up\n",
    )
    write(
      root,
      "docs/project/tasks/done/TASK_VALID.md",
      task({
        status: "done",
        completion: `- CO-1 — verified
  - Disposition: completed — command output recorded
- CO-2 — deferred
  - Disposition: tracked in: \`docs/project/PROJECT_BACKLOG.md#follow-up\``,
      }),
    )
    write(
      root,
      "docs/project/tasks/done/TASK_UNRESOLVED.md",
      task({
        status: "done",
        completion: `- CO-1 — still open
  - Disposition: OPEN`,
      }),
    )
    write(
      root,
      "docs/project/tasks/done/TASK_MISSING_TARGET.md",
      task({
        status: "done",
        completion: `- CO-1 — deferred
  - Disposition: tracked in: \`docs/project/tasks/MISSING.md\``,
      }),
    )
    write(
      root,
      "docs/project/tasks/done/TASK_JOURNAL_TARGET.md",
      task({
        status: "done",
        completion: `- CO-1 — deferred
  - Disposition: tracked in: \`docs/project/PROJECT_STAGE_LOG.md\``,
      }),
    )
    write(
      root,
      "docs/project/tasks/done/TASK_LEGACY.md",
      task({ status: "done" }),
    )
    commitFixture(root)

    const result = runFixture(root)

    expect(result.status).toBe(1)
    expect(result.stdout).toContain("TASK_COMPLETION_UNRESOLVED")
    expect(result.stdout).toContain("TASK_COMPLETION_TARGET_MISSING")
    expect(result.stdout).toContain("TASK_COMPLETION_TARGET_NOT_WORK_ITEM")
    expect(result.stdout).toContain("TASK_COMPLETION_SECTION_MISSING")
    expect(result.stdout).not.toContain("TASK_VALID.md: CO-")
  })

  it("warns without failing for a legacy done task without completion obligations", () => {
    const root = makeFixture()
    write(
      root,
      "docs/project/tasks/done/TASK_LEGACY.md",
      task({ status: "done" }),
    )
    commitFixture(root)

    const result = runFixture(root)

    expect(result.status).toBe(0)
    expect(result.stdout).toContain("Integrity (0 errors, 1 warnings)")
    expect(result.stdout).toContain("TASK_COMPLETION_SECTION_MISSING")
  })

  it("accepts an explicit None written as prose", () => {
    const root = makeFixture()
    write(
      root,
      "docs/project/tasks/done/TASK_NONE.md",
      task({
        status: "done",
        completion: "None.\n\nReconciled against the four objective sources.",
      }),
    )
    commitFixture(root)

    const result = runFixture(root)

    expect(result.status).toBe(0)
    expect(result.stdout).not.toContain("TASK_COMPLETION_ENTRY_MISSING")
  })

  it("ignores the STRAT brief that shares the tasks directory", () => {
    const root = makeFixture()
    write(root, "docs/project/tasks/TASK_OPEN.md", task())
    write(
      root,
      "docs/project/tasks/STAGE_6_STRAT_BRIEF.md",
      "Purpose\nSTRAT Next-Session Brief.\n",
    )
    commitFixture(root)

    const result = runFixture(root)

    expect(result.status).toBe(0)
    expect(result.stdout).toContain("Tasks (1)")
    expect(result.stdout).not.toContain("STRAT_BRIEF")
    expect(result.stdout).toContain("Integrity (0 errors, 0 warnings)")
  })

  it("adds Git overlay markers and leaves the working tree unchanged", () => {
    const root = makeFixture()
    write(root, "docs/project/tasks/TASK_MODIFIED.md", task())
    commitFixture(root)
    write(
      root,
      "docs/project/tasks/TASK_MODIFIED.md",
      `${readFileSync(resolve(root, "docs/project/tasks/TASK_MODIFIED.md"), "utf8")}\n`,
    )
    write(
      root,
      "docs/project/tasks/TASK_UNTRACKED.md",
      task({ status: "draft" }),
    )
    const before = git(root, [
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
    ])

    const result = runFixture(root)
    const after = git(root, [
      "status",
      "--porcelain=v1",
      "--untracked-files=all",
    ])

    expect(result.status).toBe(0)
    expect(result.stdout).toContain("[modified] TASK_MODIFIED.md")
    expect(result.stdout).toContain("[untracked] TASK_UNTRACKED.md")
    expect(after).toBe(before)
  })
})
