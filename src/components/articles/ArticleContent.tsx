'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { InlineLeadCapture } from '@/components/leads/InlineLeadCapture'

interface ArticleContentProps {
  content: string
  supplierId: string
  articleId: string
  supplierType: 'charter' | 'manufacturer' | 'school'
  destination?: string
}

export function ArticleContent({
  content,
  supplierId,
  articleId,
  supplierType,
  destination,
}: ArticleContentProps) {
  // Split content by h2 headings to insert CTAs between sections
  const sections = content.split(/(?=^## )/m)

  // Determine CTA insertion points: after 2nd and 4th h2
  const ctaPositions: number[] = []
  let h2Count = 0
  for (let i = 0; i < sections.length; i++) {
    if (sections[i].startsWith('## ')) {
      h2Count++
      if (h2Count === 2) ctaPositions.push(i)
      if (h2Count === 4) ctaPositions.push(i)
    }
  }

  return (
    <div className="prose-editorial py-12">
      {sections.map((section, i) => {
        const posIdx = ctaPositions.indexOf(i)
        const capturePoint =
          posIdx === 0 ? 'inline_cta_1' : posIdx === 1 ? 'inline_cta_2' : null

        return (
          <div key={i}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {section}
            </ReactMarkdown>
            {capturePoint && (
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
