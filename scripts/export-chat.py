"""Turn the Cursor agent transcript into a readable chat log."""

from __future__ import annotations

import json
import re
from pathlib import Path

SRC = Path(
    r"C:\Users\Liam Hoyle\.cursor\projects\c-Website\agent-transcripts"
    r"\1ea7371f-8cfe-4266-b61a-890f88ac4e20"
    r"\1ea7371f-8cfe-4266-b61a-890f88ac4e20.jsonl"
)
PRIOR = Path(r"C:\Users\Liam Hoyle\Downloads\4eos_website_redesign_chat_summary.txt")
OUT = Path(r"C:\Website\CHAT-HISTORY.txt")

USER_QUERY = re.compile(r"<user_query>\s*(.*?)\s*</user_query>", re.S)
TIMESTAMP = re.compile(r"<timestamp>(.*?)</timestamp>")


def text_blocks(content) -> list[str]:
    if isinstance(content, str):
        return [content]
    if not isinstance(content, list):
        return []
    out = []
    for part in content:
        if isinstance(part, dict) and part.get("type") == "text":
            t = part.get("text") or ""
            if t.strip():
                out.append(t)
    return out


def tool_lines(content) -> list[str]:
    if not isinstance(content, list):
        return []
    lines = []
    for part in content:
        if not isinstance(part, dict) or part.get("type") != "tool_use":
            continue
        name = part.get("name") or "tool"
        raw = part.get("input") or {}
        if name == "CallDynamicTool":
            ns = raw.get("namespace", "")
            tn = raw.get("toolName", "")
            name = f"{ns}.{tn}" if ns and tn else name
            raw = raw.get("arguments") or raw
        hint = ""
        if isinstance(raw, dict):
            for key in ("path", "command", "url", "query", "glob_pattern", "pattern"):
                if raw.get(key):
                    hint = f"{key}={raw[key]}"
                    break
            if not hint and raw.get("contents") is None:
                hint = ", ".join(f"{k}" for k in list(raw)[:4])
        if hint:
            lines.append(f"  [tool] {name}  {hint}")
        else:
            lines.append(f"  [tool] {name}")
    return lines


def clean_user(text: str) -> tuple[str | None, str]:
    ts = TIMESTAMP.search(text)
    stamp = ts.group(1).strip() if ts else None
    m = USER_QUERY.search(text)
    body = m.group(1).strip() if m else text.strip()
    body = re.sub(r"<system_notification>.*?</system_notification>", "", body, flags=re.S)
    body = re.sub(r"<agent_transcripts>.*?</agent_transcripts>", "", body, flags=re.S)
    body = re.sub(r"<timestamp>.*?</timestamp>", "", body).strip()
    return stamp, body


def main() -> None:
    chunks: list[str] = []
    chunks.append("4EOS WEBSITE — FULL BUILD CHAT")
    chunks.append("=" * 72)
    chunks.append(
        "This file is the complete Cursor session that built the Next.js site "
        "in this repo, plus the earlier chat that started the redesign. "
        "Read it in order. User messages are the requests. Assistant text is "
        "what was done. [tool] lines are the actions taken."
    )
    chunks.append("")

    if PRIOR.exists():
        chunks.append("PART 1 — PRIOR CHAT (before this Cursor session)")
        chunks.append("-" * 72)
        chunks.append(PRIOR.read_text(encoding="utf-8", errors="replace").strip())
        chunks.append("")
        chunks.append("")

    chunks.append("PART 2 — CURSOR SESSION")
    chunks.append("-" * 72)
    chunks.append(f"Source: {SRC}")
    chunks.append("")

    n_user = n_asst = 0
    for raw in SRC.read_text(encoding="utf-8", errors="replace").splitlines():
        if not raw.strip():
            continue
        try:
            ev = json.loads(raw)
        except json.JSONDecodeError:
            continue
        role = ev.get("role") or ev.get("type") or ""
        msg = ev.get("message") or {}
        content = msg.get("content") if isinstance(msg, dict) else None
        texts = text_blocks(content)
        tools = tool_lines(content)

        if role == "user":
            joined = "\n".join(texts)
            stamp, body = clean_user(joined)
            if not body:
                continue
            n_user += 1
            chunks.append("")
            header = f"USER — {stamp}" if stamp else "USER"
            chunks.append(header)
            chunks.append("-" * len(header))
            chunks.append(body)
            chunks.append("")
        elif role == "assistant":
            n_asst += 1
            body = "\n".join(texts).strip()
            # Drop internal thinking-style leftovers that are only tool narration
            if body or tools:
                chunks.append("ASSISTANT")
                chunks.append("---------")
                if body:
                    chunks.append(body)
                if tools:
                    chunks.append("")
                    chunks.extend(tools)
                chunks.append("")

    chunks.append("")
    chunks.append(f"(Exported {n_user} user turns and {n_asst} assistant turns.)")
    OUT.write_text("\n".join(chunks), encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
