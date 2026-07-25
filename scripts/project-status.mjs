import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { basename, dirname, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const TASK_STATUSES = [
  "awaiting-claude-review",
  "in progress",
  "superseded",
  "ready",
  "draft",
  "done",
]
const OPEN_TASK_STATUSES = new Set([
  "draft",
  "ready",
  "in progress",
  "awaiting-claude-review",
])
const REVIEW_STATUSES = new Set([
  "queued",
  "awaiting-review",
  "awaiting-response",
  "consensus",
])
const RESEARCH_STATUSES = new Set([
  "awaiting-research",
  "awaiting-external",
  "awaiting-response",
  "awaiting-owner",
  "closed",
])
const TERMINAL_TASK_STATUSES = new Set(["done", "superseded"])
const COMPLETION_WORDS =
  "completed|done|closed|met|verified|confirmed|resolved|none"

function toRepoPath(path) {
  return path.split(sep).join("/")
}

function issue(level, code, artifact, message) {
  return { level, code, artifact, message }
}

function filesDirectlyUnder(directory) {
  if (!existsSync(directory)) {
    return []
  }

  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
    .map((entry) => resolve(directory, entry.name))
    .sort((left, right) => left.localeCompare(right))
}

function artifactFiles(directory) {
  return filesDirectlyUnder(directory).filter((path) => {
    const name = basename(path)
    return !name.endsWith(".request.md") && !name.endsWith(".answer.md")
  })
}

// STRAT briefs live in docs/project/tasks/ by protocol (AI_TASK_PROTOCOL.md — STRAT
// Next-Session Brief) but carry no task metadata; parsing them as tasks reports a
// permanently malformed repository.
function taskFiles(directory) {
  return filesDirectlyUnder(directory).filter(
    (path) => !/_STRAT_BRIEF\.md$/i.test(basename(path)),
  )
}

function fieldMatches(content, field, allowListMarker = false) {
  const marker = allowListMarker ? String.raw`\s*(?:-\s*)?` : ""
  return [
    ...content.matchAll(
      new RegExp(String.raw`^${marker}${field}:\s*(.+?)\s*$`, "gim"),
    ),
  ]
}

function firstMetadataValue(raw) {
  const value = raw.trim()
  const backticked = value.match(/^`([^`]+)`/)
  return (backticked?.[1] ?? value.match(/^(\S+)/)?.[1] ?? "").trim()
}

function taskStatusValue(raw) {
  const value = raw.trim().replace(/^`/, "")
  return (
    TASK_STATUSES.find((status) => {
      const remainder = value.slice(status.length)
      return (
        value.startsWith(status) && (!remainder || /^[`\s·(]/.test(remainder))
      )
    }) ?? firstMetadataValue(raw)
  )
}

function statusLineAfterHeading(content, headingMatch) {
  const remainder = content.slice(headingMatch.index + headingMatch[0].length)
  return remainder
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean)
}

function gitStateLabel(code) {
  if (code === "??") {
    return "untracked"
  }

  const states = []
  const index = code[0]
  const worktree = code[1]
  if (index && index !== " ") {
    states.push(index === "D" ? "staged-deleted" : "staged")
  }
  if (worktree && worktree !== " ") {
    states.push(worktree === "D" ? "deleted" : "modified")
  }
  return states.length > 0 ? [...new Set(states)].join("+") : "clean"
}

function readGitOverlay(root) {
  const output = execFileSync(
    "git",
    [
      "-c",
      `safe.directory=${toRepoPath(root)}`,
      "-c",
      "core.excludesFile=/dev/null",
      "status",
      "--porcelain=v1",
      "-z",
      "--untracked-files=all",
    ],
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  )
  const entries = output.split("\0")
  const overlay = new Map()

  for (let index = 0; index < entries.length; index += 1) {
    const entry = entries[index]
    if (!entry) {
      continue
    }

    const code = entry.slice(0, 2)
    const path = entry.slice(3)
    overlay.set(toRepoPath(path), gitStateLabel(code))
    if (code.includes("R") || code.includes("C")) {
      index += 1
    }
  }

  return overlay
}

function sectionBody(content, heading) {
  const match = new RegExp(String.raw`^## ${heading}\s*$`, "im").exec(content)
  if (!match) {
    return undefined
  }

  const start = match.index + match[0].length
  const nextHeading = /^## .+$/m.exec(content.slice(start))
  const end = nextHeading ? start + nextHeading.index : content.length
  return content.slice(start, end).trim()
}

function completionFragments(section) {
  const starts = [...section.matchAll(/^\s*-\s*(?:\*\*)?(CO-\d+)\b.*$/gim)].map(
    (match) => ({
      id: match[1].toUpperCase(),
      index: match.index,
    }),
  )
  const fragments = new Map()

  starts.forEach((start, index) => {
    const end = starts[index + 1]?.index ?? section.length
    const entries = fragments.get(start.id) ?? []
    entries.push(section.slice(start.index, end))
    fragments.set(start.id, entries)
  })

  return fragments
}

function trackedTargets(fragment) {
  return [
    ...fragment.matchAll(
      /(?:tracked in:?|routed to)\s*(?:`([^`]+)`|([^\r\n]+))/gi,
    ),
  ]
    .map((match) => (match[1] ?? match[2]).trim())
    .filter((target) => /\.md(?:#|\b)|\bSTRAT brief\b/i.test(target))
}

function targetPath(target, root) {
  const [targetWithoutAnchor, rawAnchor] = target.split("#", 2)
  const cleaned = targetWithoutAnchor
    .replace(/\*\*/g, "")
    .replace(/[),.;]+$/g, "")
    .trim()
  const explicitPath = cleaned.match(/(?:docs\/)?[A-Za-z0-9_.\-/]+\.md/i)?.[0]
  if (!explicitPath) {
    return undefined
  }

  const candidates = [explicitPath]
  if (!explicitPath.startsWith("docs/")) {
    candidates.push(`docs/project/${explicitPath}`)
    candidates.push(`docs/project/tasks/${explicitPath}`)
  }

  const resolvedTarget = candidates
    .map((candidate) => resolve(root, candidate))
    .find((candidate) => existsSync(candidate))
  if (!resolvedTarget) {
    return undefined
  }

  if (basename(resolvedTarget).toLowerCase() !== "project_backlog.md") {
    return resolvedTarget
  }
  if (!rawAnchor) {
    return undefined
  }

  let requestedAnchor = rawAnchor.trim().toLowerCase()
  try {
    requestedAnchor = decodeURIComponent(requestedAnchor)
  } catch {
    return undefined
  }
  const anchors = readFileSync(resolvedTarget, "utf8")
    .split(/\r?\n/)
    .filter((line) => /^#{1,6}\s+/.test(line))
    .map((line) =>
      line
        .replace(/^#{1,6}\s+/, "")
        .replace(/[`*_~]/g, "")
        .trim()
        .toLowerCase()
        .replace(/[^\p{L}\p{N}\s-]/gu, "")
        .replace(/\s+/g, "-"),
    )
  return anchors.includes(requestedAnchor) ? resolvedTarget : undefined
}

function invalidWorkItemTarget(target) {
  return /PROJECT_STAGE_LOG\.md|(?:^|[/\\])[^/\\]*_STRAT_BRIEF\.md|\bSTRAT brief\b/i.test(
    target,
  )
}

function hasCompletionEvidence(fragment) {
  const dispositions = [
    ...fragment.matchAll(/Disposition:\s*([^\r\n]+)/gi),
  ].map((match) => match[1].replace(/\*\*/g, "").trim())
  if (dispositions.length > 0) {
    return dispositions.some(
      (value) =>
        value.length > 0 &&
        !/<[^>]+>/.test(value) &&
        !/\b(?:open|partial(?:ly)?|pending|unresolved)\b/i.test(value) &&
        !/\b(?:expected|fill(?:s|ed)?|tracked|routed|moved|deferred|todo|tbd|placeholder)\b/i.test(
          value,
        ),
    )
  }

  const emphasizedEvidence = new RegExp(
    String.raw`\b(?:${COMPLETION_WORDS.toUpperCase()})\b`,
  )
  return (
    emphasizedEvidence.test(fragment) ||
    /Owner decision[^\r\n]{0,120}\baccept(?:ed)?\b/i.test(fragment)
  )
}

function validateCompletionObligations(content, artifact, root, issues) {
  const section = sectionBody(content, "Completion obligations")
  if (section === undefined) {
    issues.push(
      issue(
        "WARN",
        "TASK_COMPLETION_SECTION_MISSING",
        artifact,
        "done task has no Completion obligations section (legacy task; not an error)",
      ),
    )
    return
  }

  const fragments = completionFragments(section)
  if (fragments.size === 0) {
    // The explicit-none marker is written as prose ("None.", "None introduced: …"),
    // so match the word at line start rather than demanding a bare line.
    if (!/^\s*(?:\*\*)?None\b/im.test(section)) {
      issues.push(
        issue(
          "ERROR",
          "TASK_COMPLETION_ENTRY_MISSING",
          artifact,
          "Completion obligations section contains neither CO entries nor an explicit None",
        ),
      )
    }
    return
  }

  for (const [id, entries] of fragments) {
    let resolved = entries.some((entry) => hasCompletionEvidence(entry))
    const targets = entries.flatMap(trackedTargets)

    if (
      entries.some(
        (entry) =>
          /Disposition:\s*(?:\*\*)?tracked\b/i.test(entry) &&
          /\bSTRAT brief\b/i.test(entry),
      )
    ) {
      issues.push(
        issue(
          "ERROR",
          "TASK_COMPLETION_TARGET_NOT_WORK_ITEM",
          artifact,
          `${id} tracks work in a STRAT brief`,
        ),
      )
    }

    for (const target of targets) {
      if (invalidWorkItemTarget(target)) {
        issues.push(
          issue(
            "ERROR",
            "TASK_COMPLETION_TARGET_NOT_WORK_ITEM",
            artifact,
            `${id} tracks work in a journal or STRAT brief: ${target}`,
          ),
        )
        continue
      }

      const resolvedTarget = targetPath(target, root)
      if (!resolvedTarget) {
        issues.push(
          issue(
            "ERROR",
            "TASK_COMPLETION_TARGET_MISSING",
            artifact,
            `${id} tracked-in target does not resolve to an existing task/backlog entry: ${target}`,
          ),
        )
        continue
      }

      resolved = true
    }

    if (!resolved) {
      issues.push(
        issue(
          "ERROR",
          "TASK_COMPLETION_UNRESOLVED",
          artifact,
          `${id} has neither completion evidence nor an existing tracked-in work item`,
        ),
      )
    }
  }
}

function parseTask(path, location, root, gitOverlay, issues) {
  const content = readFileSync(path, "utf8")
  const artifact = toRepoPath(relative(root, path))
  const statusHeadings = [...content.matchAll(/^## Status\s*$/gim)]
  let status = "unknown"

  if (statusHeadings.length === 0) {
    issues.push(
      issue(
        "ERROR",
        "TASK_STATUS_MISSING",
        artifact,
        "missing ## Status section",
      ),
    )
  } else {
    if (statusHeadings.length > 1) {
      issues.push(
        issue(
          "ERROR",
          "TASK_STATUS_DUPLICATED",
          artifact,
          `found ${statusHeadings.length} ## Status sections`,
        ),
      )
    }
    const rawStatus = statusLineAfterHeading(content, statusHeadings[0])
    status = rawStatus ? taskStatusValue(rawStatus) : "unknown"
    if (!TASK_STATUSES.includes(status)) {
      issues.push(
        issue(
          "ERROR",
          "TASK_STATUS_UNKNOWN",
          artifact,
          `unknown task status: ${status}`,
        ),
      )
    }
  }

  const executorMatches = fieldMatches(content, "Executor", true)
  const reviewerMatches = fieldMatches(content, "Reviewer", true)
  const blockMatches = fieldMatches(content, "Blocks", true)
  const executor =
    firstMetadataValue(executorMatches[0]?.[1] ?? "") || "missing"
  const reviewer =
    firstMetadataValue(reviewerMatches[0]?.[1] ?? "") || "missing"

  if (executorMatches.length === 0) {
    issues.push(
      issue(
        "ERROR",
        "TASK_EXECUTOR_MISSING",
        artifact,
        "missing Executor metadata",
      ),
    )
  } else if (executorMatches.length > 1) {
    issues.push(
      issue(
        "ERROR",
        "TASK_EXECUTOR_DUPLICATED",
        artifact,
        `found ${executorMatches.length} Executor fields`,
      ),
    )
  } else if (!["claude", "codex"].includes(executor)) {
    issues.push(
      issue(
        "ERROR",
        "TASK_EXECUTOR_UNKNOWN",
        artifact,
        `unknown task executor: ${executor}`,
      ),
    )
  }
  if (reviewerMatches.length === 0) {
    issues.push(
      issue(
        "ERROR",
        "TASK_REVIEWER_MISSING",
        artifact,
        "missing Reviewer metadata",
      ),
    )
  } else if (reviewerMatches.length > 1) {
    issues.push(
      issue(
        "ERROR",
        "TASK_REVIEWER_DUPLICATED",
        artifact,
        `found ${reviewerMatches.length} Reviewer fields`,
      ),
    )
  } else if (reviewer !== "claude") {
    issues.push(
      issue(
        "ERROR",
        "TASK_REVIEWER_UNKNOWN",
        artifact,
        `unknown task reviewer: ${reviewer}`,
      ),
    )
  }
  if (blockMatches.length > 1) {
    issues.push(
      issue(
        "ERROR",
        "TASK_BLOCKS_DUPLICATED",
        artifact,
        `found ${blockMatches.length} Blocks fields`,
      ),
    )
  }

  if (location === "active" && TERMINAL_TASK_STATUSES.has(status)) {
    issues.push(
      issue(
        "ERROR",
        "TASK_STATUS_LOCATION",
        artifact,
        `${status} task is still in docs/project/tasks`,
      ),
    )
  }
  if (location === "done" && !TERMINAL_TASK_STATUSES.has(status)) {
    issues.push(
      issue(
        "ERROR",
        "TASK_STATUS_LOCATION",
        artifact,
        `${status} task is inside docs/project/tasks/done`,
      ),
    )
  }

  const literalBaselines = [
    ...content.matchAll(
      /^\s*(?:-\s*)?Baseline commit:\s*`?([0-9a-f]{7,40})`?(?:\s|$)/gim,
    ),
  ]
  if (literalBaselines.length > 0) {
    issues.push(
      issue(
        "ERROR",
        "TASK_LITERAL_BASELINE",
        artifact,
        `literal Baseline commit hash is forbidden: ${literalBaselines[0][1]}`,
      ),
    )
  }

  if (status === "done") {
    validateCompletionObligations(content, artifact, root, issues)
  }

  return {
    name: basename(path),
    status,
    executor,
    reviewer,
    blocks: blockMatches[0]?.[1].trim(),
    location: artifact,
    git: gitOverlay.get(artifact) ?? "clean",
  }
}

function parseThread(path, kind, root, gitOverlay, issues) {
  const content = readFileSync(path, "utf8")
  const artifact = toRepoPath(relative(root, path))
  const header = content.split(/^## /m)[0]
  const statusMatches = fieldMatches(header, "Status")
  const actorField = kind === "review" ? "Reviewer" : "Researcher"
  const actorMatches = fieldMatches(header, actorField)
  const requestedMatches = fieldMatches(header, "Requested by")
  const allowedStatuses =
    kind === "review" ? REVIEW_STATUSES : RESEARCH_STATUSES
  const prefix = kind === "review" ? "REVIEW" : "RESEARCH"
  let status = "unknown"

  if (statusMatches.length === 0) {
    issues.push(
      issue(
        "ERROR",
        `${prefix}_STATUS_MISSING`,
        artifact,
        "missing Status header",
      ),
    )
  } else {
    if (statusMatches.length > 1) {
      issues.push(
        issue(
          "ERROR",
          `${prefix}_STATUS_DUPLICATED`,
          artifact,
          `found ${statusMatches.length} Status headers`,
        ),
      )
    }
    status = firstMetadataValue(statusMatches[0][1]) || "unknown"
    if (!allowedStatuses.has(status)) {
      issues.push(
        issue(
          "ERROR",
          `${prefix}_STATUS_UNKNOWN`,
          artifact,
          `unknown ${kind} status: ${status}`,
        ),
      )
    }
  }

  if (actorMatches.length === 0) {
    issues.push(
      issue(
        "ERROR",
        `${prefix}_${actorField.toUpperCase()}_MISSING`,
        artifact,
        `missing ${actorField} header`,
      ),
    )
  } else if (actorMatches.length > 1) {
    issues.push(
      issue(
        "ERROR",
        `${prefix}_${actorField.toUpperCase()}_DUPLICATED`,
        artifact,
        `found ${actorMatches.length} ${actorField} headers`,
      ),
    )
  } else {
    const actor = firstMetadataValue(actorMatches[0][1])
    const allowedActors = kind === "review" ? ["codex", "external"] : ["codex"]
    if (!allowedActors.includes(actor)) {
      issues.push(
        issue(
          "ERROR",
          `${prefix}_${actorField.toUpperCase()}_UNKNOWN`,
          artifact,
          `unknown ${actorField.toLowerCase()}: ${actor}`,
        ),
      )
    }
  }
  if (requestedMatches.length === 0) {
    issues.push(
      issue(
        "ERROR",
        `${prefix}_REQUESTED_BY_MISSING`,
        artifact,
        "missing Requested by header",
      ),
    )
  } else if (requestedMatches.length > 1) {
    issues.push(
      issue(
        "ERROR",
        `${prefix}_REQUESTED_BY_DUPLICATED`,
        artifact,
        `found ${requestedMatches.length} Requested by headers`,
      ),
    )
  }

  return {
    name: basename(path),
    status,
    actor: firstMetadataValue(actorMatches[0]?.[1] ?? "") || "missing",
    requestedBy: requestedMatches[0]?.[1].trim() || "missing",
    location: artifact,
    git: gitOverlay.get(artifact) ?? "clean",
    absolutePath: path,
  }
}

function validateReviewSet(reviews, issues) {
  const active = reviews.filter((review) => review.status !== "queued")
  const queued = reviews.filter((review) => review.status === "queued")

  if (active.length > 1) {
    issues.push(
      issue(
        "ERROR",
        "REVIEW_MULTIPLE_ACTIVE",
        "docs/project/reviews",
        `found ${active.length} active review threads`,
      ),
    )
  }
  if (active.length === 0 && queued.length > 0) {
    issues.push(
      issue(
        "ERROR",
        "REVIEW_ORPHANED_QUEUE",
        "docs/project/reviews",
        `${queued.length} queued review thread(s) exist while no thread is active`,
      ),
    )
  }
}

function validateResearchBuffers(research, issues) {
  for (const thread of research) {
    if (thread.status !== "awaiting-external") {
      continue
    }

    const stem = thread.absolutePath.slice(0, -".md".length)
    for (const suffix of [".request.md", ".answer.md"]) {
      const buffer = `${stem}${suffix}`
      if (!existsSync(buffer)) {
        issues.push(
          issue(
            "ERROR",
            "RESEARCH_EXTERNAL_BUFFER_MISSING",
            thread.location,
            `missing ${toRepoPath(relative(dirname(thread.absolutePath), buffer))}`,
          ),
        )
      }
    }
  }
}

export function collectProjectStatus(root = process.cwd()) {
  const absoluteRoot = resolve(root)
  const issues = []
  let gitOverlay = new Map()

  try {
    gitOverlay = readGitOverlay(absoluteRoot)
  } catch (error) {
    issues.push(
      issue(
        "ERROR",
        "GIT_STATUS_FAILED",
        ".",
        error instanceof Error
          ? error.message.split(/\r?\n/)[0]
          : String(error),
      ),
    )
  }

  const activeTaskDirectory = resolve(absoluteRoot, "docs/project/tasks")
  const doneTaskDirectory = resolve(activeTaskDirectory, "done")
  const tasks = [
    ...taskFiles(activeTaskDirectory).map((path) =>
      parseTask(path, "active", absoluteRoot, gitOverlay, issues),
    ),
    ...taskFiles(doneTaskDirectory).map((path) =>
      parseTask(path, "done", absoluteRoot, gitOverlay, issues),
    ),
  ]

  const reviews = artifactFiles(
    resolve(absoluteRoot, "docs/project/reviews"),
  ).map((path) => parseThread(path, "review", absoluteRoot, gitOverlay, issues))
  const research = artifactFiles(
    resolve(absoluteRoot, "docs/project/research"),
  ).map((path) =>
    parseThread(path, "research", absoluteRoot, gitOverlay, issues),
  )

  validateReviewSet(reviews, issues)
  validateResearchBuffers(research, issues)

  return { tasks, reviews, research, issues }
}

function renderArtifacts(items, renderItem) {
  if (items.length === 0) {
    return ["- none"]
  }
  return items.flatMap(renderItem)
}

export function renderProjectStatus(status) {
  const errors = status.issues.filter((entry) => entry.level === "ERROR")
  const warnings = status.issues.filter((entry) => entry.level === "WARN")
  const lines = ["Project status", "", `Tasks (${status.tasks.length})`]

  lines.push(
    ...renderArtifacts(status.tasks, (task) => {
      const taskLines = [
        `- [${task.git}] ${task.name} | status=${task.status} | executor=${task.executor} | reviewer=${task.reviewer} | location=${task.location}`,
      ]
      if (OPEN_TASK_STATUSES.has(task.status) && task.blocks) {
        taskLines.push(`  ⛔ BLOCKS ${task.blocks}`)
      }
      return taskLines
    }),
    "",
    `Review threads (${status.reviews.length})`,
    ...renderArtifacts(status.reviews, (thread) => [
      `- [${thread.git}] ${thread.name} | status=${thread.status} | reviewer=${thread.actor} | requested-by=${thread.requestedBy} | location=${thread.location}`,
    ]),
    "",
    `Research threads (${status.research.length})`,
    ...renderArtifacts(status.research, (thread) => [
      `- [${thread.git}] ${thread.name} | status=${thread.status} | researcher=${thread.actor} | requested-by=${thread.requestedBy} | location=${thread.location}`,
    ]),
    "",
    "Unstructured gaps",
    "- blocked work: not represented by structured data",
    "- deferred accepted findings: not represented by structured data",
    "",
    `Integrity (${errors.length} errors, ${warnings.length} warnings)`,
    ...(status.issues.length > 0
      ? status.issues.map(
          (entry) =>
            `- ${entry.level} ${entry.code} ${entry.artifact}: ${entry.message}`,
        )
      : ["- none"]),
    "",
    `Summary: tasks=${status.tasks.length} reviews=${status.reviews.length} research=${status.research.length} errors=${errors.length} warnings=${warnings.length}`,
  )

  return lines.join("\n")
}

export function runProjectStatus(root = process.cwd()) {
  const status = collectProjectStatus(root)
  return {
    output: renderProjectStatus(status),
    exitCode: status.issues.some((entry) => entry.level === "ERROR") ? 1 : 0,
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : undefined
if (invokedPath === fileURLToPath(import.meta.url)) {
  const result = runProjectStatus()
  console.log(result.output)
  process.exitCode = result.exitCode
}
