import type { ContentBlock } from "@/types";
import { Callout } from "@/components/article/Callout";
import { InfoTable } from "@/components/article/InfoTable";
import { StepByStep } from "@/components/article/StepByStep";
import { OfficialSourceBlock } from "@/components/article/OfficialSourceBlock";

export function renderBlocks(blocks: ContentBlock[]) {
  return blocks.map((block, i) => {
    switch (block.type) {
      case "heading": {
        const Tag = block.level === 2 ? "h2" : "h3";
        return (
          <Tag key={i} id={block.id}>
            {block.text}
          </Tag>
        );
      }
      case "paragraph":
        return <p key={i}>{block.text}</p>;
      case "list": {
        const Tag = block.ordered ? "ol" : "ul";
        return (
          <Tag key={i} className={block.ordered ? "list-decimal pl-6 space-y-1" : "list-disc pl-6 space-y-1"}>
            {block.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </Tag>
        );
      }
      case "table":
        return <InfoTable key={i} headers={block.headers} rows={block.rows} caption={block.caption} />;
      case "callout":
        return (
          <Callout key={i} variant={block.variant} title={block.title}>
            {block.text}
          </Callout>
        );
      case "steps":
        return <StepByStep key={i} steps={block.steps} />;
      case "official-source":
        return <OfficialSourceBlock key={i} source={block.source} />;
      default:
        return null;
    }
  });
}

export function extractHeadings(blocks: ContentBlock[]) {
  return blocks
    .filter((b): b is Extract<ContentBlock, { type: "heading" }> => b.type === "heading")
    .map((b) => ({ id: b.id, text: b.text, level: b.level }));
}
