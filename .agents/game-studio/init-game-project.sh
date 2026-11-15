#!/usr/bin/env bash
# ============================================================================
# init-game-project.sh
# Khởi tạo nhanh cấu trúc Game Studio Agent (21 Agents + 125 Skills + Rules + Templates)
# cho bất kỳ dự án game mới hoặc hiện có nào trên 12 Engines + Web thuần:
# (godot4, unity, unreal5, roblox, ebitengine, phaser, pixijs, threejs, bevy, pygame, love2d, defold, web).
# ============================================================================
set -euo pipefail

STUDIO_HUB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

TARGET_DIR="${1:-}"
ENGINE_TYPE="${2:-godot4}"
RIGOR_MODE="${3:-minimal}"
LINK_MODE="${4:---copy}" # --copy (mặc định, độc lập hoàn toàn) hoặc --symlink (liên kết động về Hub)

if [[ -z "$TARGET_DIR" ]]; then
  echo "Cách dùng: $0 <đường_dẫn_dự_án> [godot4|unity|unreal5|roblox|ebitengine|phaser|pixijs|threejs|bevy|pygame|love2d|defold|web] [minimal|standard|full] [--copy|--symlink]"
  echo "Ví dụ:    $0 ~/Projects/NewGame godot4 standard"
  exit 1
fi

mkdir -p "$TARGET_DIR"
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"
PROJECT_NAME="$(basename "$TARGET_DIR")"

echo "=================================================================="
echo "🎮 Khởi tạo Game Studio Agent cho dự án: $PROJECT_NAME"
echo "📂 Thư mục đích : $TARGET_DIR"
echo "⚙️  Engine       : $ENGINE_TYPE | Chế độ Rigor: $RIGOR_MODE"
echo "=================================================================="

# 1. Tạo cấu trúc thư mục sản xuất chuẩn Studio
mkdir -p \
  "$TARGET_DIR/.claude/agents" \
  "$TARGET_DIR/.claude/skills" \
  "$TARGET_DIR/.claude/rules" \
  "$TARGET_DIR/design/gdd" \
  "$TARGET_DIR/design/narrative" \
  "$TARGET_DIR/design/registry" \
  "$TARGET_DIR/docs/architecture" \
  "$TARGET_DIR/docs/adr" \
  "$TARGET_DIR/production/epics" \
  "$TARGET_DIR/production/stories" \
  "$TARGET_DIR/production/sprints" \
  "$TARGET_DIR/production/qa/evidence" \
  "$TARGET_DIR/production/qa/bugs" \
  "$TARGET_DIR/production/release" \
  "$TARGET_DIR/production/session-state" \
  "$TARGET_DIR/prototypes" \
  "$TARGET_DIR/tests/unit" \
  "$TARGET_DIR/tests/integration" \
  "$TARGET_DIR/tests/config"

# 2. Sao chép CLAUDE.md và project.yaml (nếu chưa có)
if [[ ! -f "$TARGET_DIR/CLAUDE.md" ]]; then
  cp "$STUDIO_HUB_DIR/CLAUDE.md" "$TARGET_DIR/CLAUDE.md"
  echo "✅ Đã tạo CLAUDE.md"
else
  echo "ℹ️  Giữ nguyên CLAUDE.md hiện có (bản mẫu mới lưu tại CLAUDE.studio.md)"
  cp "$STUDIO_HUB_DIR/CLAUDE.md" "$TARGET_DIR/CLAUDE.studio.md"
fi

if [[ ! -f "$TARGET_DIR/project.yaml" ]]; then
  # Mặc định theo baseline dự án mới trong docs/VERSION-SUPPORT.md (kiểm tra 2026-11-11).
  # Dự án hiện có: sửa engine.version cho đúng phiên bản đã ghim của dự án.
  case "$ENGINE_TYPE" in
    godot4)     ENGINE_VERSION="4.7";     ENGINE_LANG="gdscript";   CODE_ROOT="src" ;;
    unity)      ENGINE_VERSION="6000.3";  ENGINE_LANG="csharp";     CODE_ROOT="Assets\/Scripts" ;;
    unreal5)    ENGINE_VERSION="5.8";     ENGINE_LANG="cpp";        CODE_ROOT="Source" ;;
    roblox)     ENGINE_VERSION="rolling"; ENGINE_LANG="luau";       CODE_ROOT="src" ;;
    ebitengine) ENGINE_VERSION="2.10.6";  ENGINE_LANG="go";         CODE_ROOT="." ;;
    phaser)     ENGINE_VERSION="4.2.1";   ENGINE_LANG="typescript"; CODE_ROOT="src" ;;
    pixijs)     ENGINE_VERSION="8.22.0";  ENGINE_LANG="typescript"; CODE_ROOT="src" ;;
    threejs)    ENGINE_VERSION="r187";    ENGINE_LANG="typescript"; CODE_ROOT="src" ;;
    bevy)       ENGINE_VERSION="0.20.1";  ENGINE_LANG="rust";       CODE_ROOT="src" ;;
    pygame)     ENGINE_VERSION="2.5.8";   ENGINE_LANG="python";     CODE_ROOT="src" ;;
    love2d)     ENGINE_VERSION="11.5";    ENGINE_LANG="lua";        CODE_ROOT="." ;;
    defold)     ENGINE_VERSION="1.14.1";  ENGINE_LANG="lua";        CODE_ROOT="main" ;;
    web)        ENGINE_VERSION="";        ENGINE_LANG="javascript"; CODE_ROOT="." ;;
    *)          ENGINE_VERSION="";        ENGINE_LANG="";           CODE_ROOT="src" ;;
  esac
  sed \
    -e "s/name: \"My Game Project\"/name: \"$PROJECT_NAME\"/" \
    -e "s/type: \"godot4\"/type: \"$ENGINE_TYPE\"/" \
    -e "s/^  version: \"4.7\"/  version: \"$ENGINE_VERSION\"/" \
    -e "s/^  language: \"gdscript\"/  language: \"$ENGINE_LANG\"/" \
    -e "s/^  code_root: \"src\"/  code_root: \"$CODE_ROOT\"/" \
    -e "s/rigor: \"minimal\"/rigor: \"$RIGOR_MODE\"/" \
    "$STUDIO_HUB_DIR/project.template.yaml" > "$TARGET_DIR/project.yaml"
  echo "✅ Đã tạo project.yaml (Engine: $ENGINE_TYPE, Rigor: $RIGOR_MODE)"
fi

# 3. Đưa 21 Agents, 4 Rules và 125 Skills vào .claude/ của dự án
AGENT_COUNT=0
for agent_file in "$STUDIO_HUB_DIR"/agents/*/*.md; do
  [[ -e "$agent_file" ]] || continue
  base_name="$(basename "$agent_file")"
  if [[ "$LINK_MODE" == "--symlink" ]]; then
    ln -sfn "$agent_file" "$TARGET_DIR/.claude/agents/$base_name"
  else
    cp "$agent_file" "$TARGET_DIR/.claude/agents/$base_name"
  fi
  AGENT_COUNT=$((AGENT_COUNT + 1))
done
echo "✅ Đã cài đặt $AGENT_COUNT Subagents & Team Strikes vào .claude/agents/"

for rule_file in "$STUDIO_HUB_DIR"/rules/*.md; do
  [[ -e "$rule_file" ]] || continue
  base_name="$(basename "$rule_file")"
  if [[ "$LINK_MODE" == "--symlink" ]]; then
    ln -sfn "$rule_file" "$TARGET_DIR/.claude/rules/$base_name"
  else
    cp "$rule_file" "$TARGET_DIR/.claude/rules/$base_name"
  fi
done
echo "✅ Đã cài đặt 4 bộ quy chuẩn đường dẫn vào .claude/rules/"

SKILL_COUNT=0
for skill_dir in "$STUDIO_HUB_DIR"/skills/*/*; do
  [[ -d "$skill_dir" ]] || continue
  skill_name="$(basename "$skill_dir")"
  if [[ "$LINK_MODE" == "--symlink" ]]; then
    ln -sfn "$skill_dir" "$TARGET_DIR/.claude/skills/$skill_name"
  else
    mkdir -p "$TARGET_DIR/.claude/skills/$skill_name"
    cp -R "$skill_dir/"* "$TARGET_DIR/.claude/skills/$skill_name/"
  fi
  SKILL_COUNT=$((SKILL_COUNT + 1))
done
echo "✅ Đã cài đặt toàn bộ $SKILL_COUNT Skills vào .claude/skills/"

# Checkout pixelfx (skill pixelfx clone vào .pixelfx/ khi cần) không được commit vào repo game
if ! grep -qxF ".pixelfx/" "$TARGET_DIR/.gitignore" 2>/dev/null; then
  echo ".pixelfx/" >> "$TARGET_DIR/.gitignore"
fi

# 4. Sao chép Templates và khởi tạo Session Checkpoint active.md
mkdir -p "$TARGET_DIR/docs/templates"
cp "$STUDIO_HUB_DIR"/templates/*.md "$TARGET_DIR/docs/templates/"

if [[ ! -f "$TARGET_DIR/production/session-state/active.md" ]]; then
  sed \
    -e "s/{{PROJECT_NAME}}/$PROJECT_NAME/g" \
    -e "s/{{ENGINE_TYPE}}/$ENGINE_TYPE/g" \
    -e "s/{{RIGOR_MODE}}/$RIGOR_MODE/g" \
    "$STUDIO_HUB_DIR/templates/active-session-template.md" > "$TARGET_DIR/production/session-state/active.md"
  echo "✅ Đã khởi tạo checkpoint: production/session-state/active.md"
fi

echo "=================================================================="
echo "🎉 Hoàn tất! Dự án $PROJECT_NAME đã sẵn sàng với $SKILL_COUNT Skills & $AGENT_COUNT Agents."
echo "👉 Gợi ý bắt đầu: Mở AI Agent tại $TARGET_DIR và gọi /start, hoặc nói \"make me a game\" (/prototype) để có bản chơi được ngay"
echo "=================================================================="
