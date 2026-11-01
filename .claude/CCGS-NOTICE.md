# Claude Code Game Studios — nguồn và giấy phép

Các agent trong `.claude/agents/` được lấy từ
[Donchitos/Claude-Code-Game-Studios](https://github.com/Donchitos/Claude-Code-Game-Studios)
(commit `05ad7c8a5b8aa2aa86bbd3439ae7cf7295cac418`, 19/10/2026, giấy phép MIT bên dưới), rồi chỉnh cho ArcadeX.
Các skill trong `.claude/skills/` được viết lại cho ArcadeX, dựa trên ý tưởng các skill cùng tên ở upstream.

## Đã lấy (19 agent, có chỉnh)
game-designer, level-designer, systems-designer, economy-designer, ux-designer, accessibility-specialist,
qa-lead, qa-tester, gameplay-programmer, ui-programmer, performance-analyst, security-engineer,
technical-artist, art-director, sound-designer, writer, narrative-director, producer, creative-director.

Chỉnh sửa:
- Bỏ `memory`, đặt `model: inherit`.
- Thay mục "Collaboration Protocol" (hỏi người dùng trước mỗi lần ghi file) bằng mục "Working in ArcadeX" dành cho subagent.
- Đổi đường dẫn `design/`, `production/` sang `docs/`, `docs/qa/`.
- Bỏ các phần gắn với Godot/Unity/Unreal, `project.yaml`, director gate, registry và sprint.
- Thêm số liệu và công cụ web: bundle, Canvas 2D, WebP, PGlite, Playwright.

## Skill viết lại (11)
game-review (từ design-review), level-review (từ team-level), balance-check, playtest-report, bug-report,
qa-plan, perf-profile, ux-review, tech-debt, scope-check, brainstorm.

## Không lấy
Agent riêng cho engine (Godot/Unity/Unreal), 63 skill còn lại, toàn bộ hook, statusline, `settings.json`,
`project.yaml`, cấu trúc `design/`/`production/`. Lý do: ArcadeX là PWA web và giữ quy trình làm việc hiện tại.

## Giấy phép upstream

MIT License

Copyright (c) 2026 Donchitos

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
