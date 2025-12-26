import { execSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

function getGitCommit() {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim()
  } catch {
    return "unknown"
  }
}

function getRepoUrl() {
  try {
    let remoteUrl = ""
    try {
      remoteUrl = execSync("git config --get remote.origin.url")
        .toString()
        .trim()
    } catch {
      const remotes = execSync("git remote").toString().trim().split("\n")
      if (remotes.length > 0 && remotes[0]) {
        remoteUrl = execSync(`git config --get remote.${remotes[0]}.url`)
          .toString()
          .trim()
      }
    }

    if (remoteUrl.startsWith("git@")) {
      remoteUrl = remoteUrl
        .replace(":", "/")
        .replace("git@", "https://")
        .replace(".git", "")
    } else if (remoteUrl.startsWith("https://")) {
      remoteUrl = remoteUrl.replace(".git", "")
    }
    return remoteUrl
  } catch {
    return ""
  }
}

const version = {
  buildId: Date.now().toString(),
  commit: getGitCommit(),
  repoUrl: getRepoUrl(),
  timestamp: new Date().toISOString(),
}

const publicDir = path.join(process.cwd(), "public")
const versionFile = path.join(publicDir, "version.json")

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true })
}

fs.writeFileSync(versionFile, JSON.stringify(version, null, 2))

console.log(`Generated version.json with buildId: ${version.buildId}`)
