import type { ReactNode } from "react";

function inline(text: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|`[^`]+`)/g;
  return text.split(pattern).filter(Boolean).map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    return <span key={index}>{part}</span>;
  });
}

type Block =
  | { kind: "paragraph"; lines: string[] }
  | { kind: "ul" | "ol"; items: string[] }
  | { kind: "heading"; level: number; text: string }
  | { kind: "quote"; text: string };

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: { kind: "ul" | "ol"; items: string[] } | null = null;
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ kind: "paragraph", lines: paragraph });
    paragraph = [];
  };
  const flushList = () => {
    if (list) blocks.push(list);
    list = null;
  };

  for (const sourceLine of content.replace(/\r\n?/g, "\n").split("\n")) {
    const line = sourceLine.trim();
    if (!line) { flushParagraph(); flushList(); continue; }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph(); flushList();
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph(); flushList(); blocks.push({ kind: "quote", text: quote[1] });
      continue;
    }
    const unordered = line.match(/^[-*•]\s+(.+)$/);
    const ordered = line.match(/^\d+[.)]\s+(.+)$/);
    if (unordered || ordered) {
      flushParagraph();
      const kind = unordered ? "ul" : "ol";
      if (!list || list.kind !== kind) { flushList(); list = { kind, items: [] }; }
      list.items.push((unordered ?? ordered)![1]);
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph(); flushList();
  return blocks;
}

/** Renders a safe Markdown subset as React nodes; raw HTML is never injected. */
export function GusAiMarkdown({ content }: { content: string }) {
  return (
    <div className="gus-ai-markdown">
      {parseBlocks(content).map((block, index) => {
        if (block.kind === "heading") {
          const children = inline(block.text);
          if (block.level === 1) return <h3 key={index}>{children}</h3>;
          if (block.level === 2) return <h4 key={index}>{children}</h4>;
          return <h5 key={index}>{children}</h5>;
        }
        if (block.kind === "ul" || block.kind === "ol") {
          const items = block.items.map((item, itemIndex) => <li key={itemIndex}>{inline(item)}</li>);
          return block.kind === "ul" ? <ul key={index}>{items}</ul> : <ol key={index}>{items}</ol>;
        }
        if (block.kind === "quote") return <blockquote key={index}>{inline(block.text)}</blockquote>;
        return <p key={index}>{block.lines.map((line, lineIndex) => (
          <span key={lineIndex}>{lineIndex > 0 && <br />}{inline(line)}</span>
        ))}</p>;
      })}
    </div>
  );
}
