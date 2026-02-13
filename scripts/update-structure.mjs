import { execSync } from "child_process"
import { writeFileSync } from "fs"

const files = execSync("git ls-files --cached --others --exclude-standard", {
  encoding: "utf-8",
})
  .trim()
  .split("\n")
  .filter(Boolean)
  .sort()

function buildTree(paths) {
  const root = {}
  for (const p of paths) {
    const parts = p.split("/")
    let node = root
    for (const part of parts) {
      node[part] ??= {}
      node = node[part]
    }
  }
  return root
}

function render(node, prefix = "") {
  const entries = Object.keys(node).sort((a, b) => {
    const aDir = Object.keys(node[a]).length > 0
    const bDir = Object.keys(node[b]).length > 0
    if (aDir !== bDir) return aDir ? 1 : -1
    return a.localeCompare(b)
  })
  const lines = []
  entries.forEach((name, i) => {
    const isLast = i === entries.length - 1
    const connector = isLast ? "└── " : "├── "
    const childPrefix = isLast ? "    " : "│   "
    const children = Object.keys(node[name])
    if (children.length === 0) {
      lines.push(`${prefix}${connector}${name}`)
    } else {
      lines.push(`${prefix}${connector}${name}/`)
      lines.push(...render(node[name], prefix + childPrefix))
    }
  })
  return lines
}

const tree = buildTree(files)
const lines = ["# Project File Structure", "", "```", "tattoo-request-app/"]
lines.push(...render(tree))
lines.push("```", "")

writeFileSync("docs/files-structure.md", lines.join("\n"))
console.log("docs/files-structure.md updated")
