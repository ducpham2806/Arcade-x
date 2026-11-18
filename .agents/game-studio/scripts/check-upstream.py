#!/usr/bin/env python3
"""Report what changed in the hub's two upstream repositories since the last sync.

Usage:
    python3 scripts/check-upstream.py [--cache DIR] [--apply-agas]

Reads the recorded commits from docs/UPSTREAM-SYNC.md, clones or fetches both upstreams
into --cache (default: <tmp>/gsa-upstream), and prints:

* awesome-gamedev-agent-skills (AGAS): commits since the recorded one, skills that changed,
  new and removed upstream skills, and hub copies that were edited locally (those are never
  overwritten).
* Claude-Code-Game-Studios (CCGS): commits since the recorded one, CHANGELOG headings newer than
  the recorded release, and the `.claude/skills` folders added, removed or renamed. The hub's
  CCGS-derived skills are hand-written syntheses, so CCGS changes are merged by hand.
* agency-agents and pixelfx: hub skills that embed upstream text between
  `<!-- agency:start -->` / `<!-- pixelfx:start -->` markers, whose upstream file changed, and new
  agency-agents game-development agents the hub does not have yet.

--apply-agas copies every changed AGAS skill that has no local edits over its hub folder and
removes the files upstream deleted from it. --apply-blocks refreshes the agency and pixelfx blocks
whose hub text still matches the recorded upstream version (hub notes outside the markers stay). New upstream skills are only reported: pick their
hub category, copy them, then update docs/UPSTREAM-SYNC.md, CLAUDE.md and README.md.

Standard library only; needs git on PATH.
"""

from __future__ import annotations

import argparse
import filecmp
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SYNC_DOC = REPO_ROOT / "docs" / "UPSTREAM-SYNC.md"
UPSTREAMS = {
    "agas": "https://github.com/gamedev-skills/awesome-gamedev-agent-skills.git",
    "ccgs": "https://github.com/Donchitos/Claude-Code-Game-Studios.git",
    "agency": "https://github.com/msitarzewski/agency-agents.git",
    "pixelfx": "https://github.com/patch-gg/pixelfx.git",
}
# Hub skills that embed upstream text: marker tag -> (repo key, GitHub slug).
BLOCK_SOURCES = {"agency": ("agency", "msitarzewski/agency-agents"), "pixelfx": ("pixelfx", "patch-gg/pixelfx")}
SOURCE_RE = re.compile(r"<!-- Source: (\S+) (\S+) @ ([0-9a-f]{7,40})")


def git(repo: Path, *args: str) -> str:
    return subprocess.run(["git", "-C", str(repo), *args], check=True, capture_output=True, text=True).stdout


def recorded(key: str, text: str) -> str:
    match = re.search(rf"<!-- {key}: ([^ ]+) -->", text)
    if not match:
        sys.exit(f"{SYNC_DOC}: missing <!-- {key}: ... --> marker")
    return match.group(1)


def checkout(cache: Path, name: str) -> Path:
    repo = cache / name
    if (repo / ".git").is_dir():
        git(repo, "fetch", "--quiet", "origin")
        git(repo, "reset", "--quiet", "--hard", "origin/HEAD")
    else:
        cache.mkdir(parents=True, exist_ok=True)
        subprocess.run(["git", "clone", "--quiet", UPSTREAMS[name], str(repo)], check=True)
    return repo


def upstream_skill_dirs(repo: Path, rev: str) -> dict[str, str]:
    """{skill name: path in repo} for router/ and skills/<category>/<name>/ at rev."""
    names = git(repo, "ls-tree", "-r", "--name-only", rev).splitlines()
    found = {}
    for path in names:
        parts = path.split("/")
        if parts[-1] == "SKILL.md" and (parts[:-1] == ["router"] or (len(parts) == 4 and parts[0] == "skills")):
            found[parts[-2]] = "/".join(parts[:-1])
    return found


def hub_skill_dirs() -> dict[str, Path]:
    return {p.parent.name: p.parent for p in (REPO_ROOT / "skills").glob("*/*/SKILL.md")}


def tree_files(repo: Path, rev: str, prefix: str) -> set[str]:
    out = git(repo, "ls-tree", "-r", "--name-only", rev, "--", prefix + "/")
    return {line[len(prefix) + 1:] for line in out.splitlines()}


def has_local_edits(repo: Path, base: str, updir: str, hubdir: Path) -> bool:
    """True when the hub copy differs from the upstream folder at the recorded commit."""
    try:
        base_files = tree_files(repo, base, updir)
    except subprocess.CalledProcessError:
        return True
    hub_files = {p.relative_to(hubdir).as_posix() for p in hubdir.rglob("*") if p.is_file()}
    if base_files != hub_files:
        return True
    for rel in base_files:
        blob = subprocess.run(["git", "-C", str(repo), "show", f"{base}:{updir}/{rel}"],
                              check=True, capture_output=True).stdout
        if blob != (hubdir / rel).read_bytes():
            return True
    return False


def dirs_equal(a: Path, b: Path) -> bool:
    cmp = filecmp.dircmp(a, b)
    if cmp.left_only or cmp.right_only or cmp.diff_files or cmp.funny_files:
        return False
    return all(dirs_equal(a / d, b / d) for d in cmp.common_dirs)


def report_agas(repo: Path, base: str, apply: bool) -> None:
    head = git(repo, "rev-parse", "--short", "HEAD").strip()
    print(f"== awesome-gamedev-agent-skills: recorded {base[:7]}, upstream HEAD {head}")
    print(git(repo, "log", "--oneline", "--no-merges", f"{base}..HEAD") or "  (no new commits)")
    up_head, up_base, hub = upstream_skill_dirs(repo, "HEAD"), upstream_skill_dirs(repo, base), hub_skill_dirs()
    for name in sorted(set(up_head) - set(hub)):
        print(f"  NEW upstream skill: {name} ({up_head[name]}) - choose a hub category and copy it")
    for name in sorted(set(up_base) - set(up_head)):
        print(f"  REMOVED upstream: {name} - decide whether the hub keeps it")
    for name in sorted(set(up_head) & set(hub)):
        updir, hubdir = repo / up_head[name], hub[name]
        if dirs_equal(updir, hubdir):
            continue
        if name in up_base and has_local_edits(repo, base, up_base[name], hubdir):
            print(f"  CHANGED + LOCAL EDITS (merge by hand): {name}")
            continue
        print(f"  CHANGED: {name}")
        if apply:
            for src in updir.rglob("*"):
                if src.is_file():
                    dst = hubdir / src.relative_to(updir)
                    dst.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copy2(src, dst)
            for old in [p for p in hubdir.rglob("*") if p.is_file()]:
                if not (updir / old.relative_to(hubdir)).exists():
                    old.unlink()
                    print(f"    removed {old.relative_to(REPO_ROOT)}")
    print()


def report_ccgs(repo: Path, base: str, version: str) -> None:
    head = git(repo, "rev-parse", "--short", "HEAD").strip()
    print(f"== Claude-Code-Game-Studios: recorded {base[:7]} (v{version}), upstream HEAD {head}")
    print(git(repo, "log", "--oneline", f"{base}..HEAD") or "  (no new commits)")
    changelog = (repo / "CHANGELOG.md").read_text(encoding="utf-8")
    newer = []
    for heading in re.findall(r"^## \[([^\]]+)\][^\n]*", changelog, re.M):
        if heading == version:
            break
        newer.append(heading)
    print("  Releases newer than recorded: " + (", ".join(newer) if newer else "none"))
    def skill_folders(rev: str) -> set[str]:
        out = git(repo, "ls-tree", "--name-only", f"{rev}:.claude/skills")
        return set(out.split())

    before, after = skill_folders(base), skill_folders("HEAD")
    for name in sorted(after - before):
        print(f"  NEW skill: /{name}")
    for name in sorted(before - after):
        print(f"  REMOVED skill: /{name}")
    changed = git(repo, "diff", "--name-only", base, "HEAD", "--", ".claude/skills").split()
    touched = sorted({path.split("/")[2] for path in changed} & before & after)
    if touched:
        print(f"  Changed skills ({len(touched)}): " + ", ".join(f"/{name}" for name in touched))
    print("  Merge CCGS changes into the hub's CCGS-derived skills by hand (see docs/UPSTREAM-SYNC.md).\n")


def upstream_block(tag: str, text: str) -> str:
    """The part of an upstream file the hub embeds between its markers."""
    if tag == "agency":
        return text[4:].split("\n---\n", 1)[1].strip("\n")
    start = text.index("## 1. Look for an existing effect first")
    end = text.find("## 5. Publish it on Patch")
    return text[start:end if end != -1 else None].strip("\n")


def show(repo: Path, rev: str, path: str) -> str | None:
    try:
        return git(repo, "show", f"{rev}:{path}")
    except subprocess.CalledProcessError:
        return None


def report_blocks(tag: str, repo: Path, base: str, apply: bool) -> None:
    _, slug = BLOCK_SOURCES[tag]
    head = git(repo, "rev-parse", "--short", "HEAD").strip()
    print(f"== {slug}: recorded {base[:7]}, upstream HEAD {head}")
    print(git(repo, "log", "--oneline", "--no-merges", f"{base}..HEAD") or "  (no new commits)")
    tracked = set()
    for skill in sorted((REPO_ROOT / "skills").glob("*/*/SKILL.md")):
        text = skill.read_text(encoding="utf-8")
        match = SOURCE_RE.search(text)
        if not match or match.group(1) != slug:
            continue
        path, old_sha = match.group(2), match.group(3)
        tracked.add(path)
        begin, end = f"<!-- {tag}:start -->\n", f"<!-- {tag}:end -->"
        inner = text[text.index(begin) + len(begin):text.index(end)].strip("\n")
        now, then = show(repo, "HEAD", path), show(repo, old_sha, path)
        name = skill.parent.name
        if now is None:
            print(f"  REMOVED upstream: {path} (hub skill {name})")
            continue
        if upstream_block(tag, now) == inner:
            continue
        if then is None or upstream_block(tag, then) != inner:
            print(f"  CHANGED + LOCAL EDITS inside the block (merge by hand): {name} <- {path}")
            continue
        print(f"  CHANGED: {name} <- {path}")
        if apply:
            fresh = text[:text.index(begin) + len(begin)] + upstream_block(tag, now) + "\n" + text[text.index(end):]
            fresh = fresh.replace(f"{path} @ {old_sha}", f"{path} @ {head}", 1)
            skill.write_text(fresh, encoding="utf-8")
    if tag == "agency":
        for path in sorted(git(repo, "ls-tree", "-r", "--name-only", "HEAD", "--", "game-development").split()):
            if path.endswith(".md") and path not in tracked:
                print(f"  NEW game-development agent not in the hub: {path}")
    print()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--cache", type=Path, default=Path(tempfile.gettempdir()) / "gsa-upstream")
    parser.add_argument("--apply-agas", action="store_true", help="overwrite unedited hub copies of changed AGAS skills")
    parser.add_argument("--apply-blocks", action="store_true", help="refresh unedited agency/pixelfx blocks")
    args = parser.parse_args()
    text = SYNC_DOC.read_text(encoding="utf-8")
    report_agas(checkout(args.cache, "agas"), recorded("agas-commit", text), args.apply_agas)
    report_ccgs(checkout(args.cache, "ccgs"), recorded("ccgs-commit", text), recorded("ccgs-version", text))
    for tag, (key, _) in BLOCK_SOURCES.items():
        report_blocks(tag, checkout(args.cache, key), recorded(f"{key}-commit", text), args.apply_blocks)
    return 0


if __name__ == "__main__":
    sys.exit(main())
