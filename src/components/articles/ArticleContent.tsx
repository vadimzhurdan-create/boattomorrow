'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { InlineLeadCapture } from '@/components/leads/InlineLeadCapture'

interface ArticleContentProps {
  content: string
  supplierId: string
  articleId: string
  supplierType: 'charter' | 'manufacturer' | 'school'
  destination?: string
}

/**
 * Detect whether content is HTML or Markdown.
 * If the first non-whitespace content starts with an HTML tag, treat as HTML.
 */
function isHtmlContent(content: string): boolean {
  const trimmed = content.trimStart()
  return trimmed.startsWith('<')
}

/**
 * Split content into sections by h2 headings.
 * Works for both markdown (## Heading) and HTML (<h2>Heading</h2>).
 */
function splitByH2(content: string, isHtml: boolean): string[] {
  if (isHtml) {
    // Split by <h2> tags, keeping the tag with its section
    return content.split(/(?=<h2[\s>])/i).filter((s) => s.trim())
  }
  return content.split(/(?=^## )/m).filter((s) => s.trim())
}

/**
 * Determine CTA insertion points: after 2nd and 4th h2 section.
 */
function getCTAPositions(sections: string[], isHtml: boolean): number[] {
  const positions: number[] = []
  let h2Count = 0
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i].trimStart()
    const isH2 = isHtml ? /^<h2[\s>]/i.test(s) : s.startsWith('## ')
    if (isH2) {
      h2Count++
      if (h2Count === 2) positions.push(i)
      if (h2Count === 4) positions.push(i)
    }
  }
  return positions
}

/* ── HTML section renderer ── */
function HtmlSection({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
}

/* ── Markdown section renderer ── */
function MarkdownSection({ markdown }: { markdown: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]}>
      {markdown}
    </ReactMarkdown>
  )
}

export function ArticleContent({
  content,
  supplierId,
  articleId,
  supplierType,
  destination,
}: ArticleContentProps) {
  const isHtml = isHtmlContent(content)
  const sections = splitByH2(content, isHtml)
  const ctaPositions = getCTAPositions(sections, isHtml)

  return (
    <div className="prose-editorial py-12">
      {sections.map((section, i) => {
        const posIdx = ctaPositions.indexOf(i)
        const capturePoint =
          posIdx === 0 ? 'inline_cta_1' : posIdx === 1 ? 'inline_cta_2' : null

        return (
          <div key={i}>
            {isHtml ? (
              <HtmlSection html={section} />
            ) : (
              <MarkdownSection markdown={section} />
            )}
            {capturePoint && supplierId && (
              <InlineLeadCapture
                supplierId={supplierId}
                articleId={articleId}
                supplierType={supplierType}
                destination={destination}
                capturePoint={capturePoint}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
