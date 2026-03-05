# BOATTOMORROW
## ТЗ: Деtection-proof контент — гайд и промпты
**Версия 1.0 | 2025**

---

## Часть 1. Честная картина: что думают поисковики об AI-контенте

### Google: официальная позиция

Google прямо заявляет: использование AI для создания полезного контента — не спам. Проблема возникает только если цель генерации — "манипуляция позициями в поиске", а не помощь пользователям.

Иными словами: **Google карает не AI-тексты, а плохие тексты**. Метод производства не имеет значения — имеет значение качество результата.

### Но есть важный нюанс — "Scaled Content Abuse"

В июне 2025 года Google начал выдавать ручные санкции за «массовое злоупотребление контентом» — прицельно против сайтов, которые масштабно используют AI-генерацию. Сайты получали уведомление в Search Console: «страницы вашего сайта используют агрессивные спам-техники, включая масштабное злоупотребление контентом». Что особенно важно: под удар попадали в том числе сайты, чьи AI-статьи хорошо ранжировались — именно это и служило поводом для санкции.

### Что на самом деле детектирует Google

Google не запускает тест «это написал AI» — и не нуждается в этом. Система SpamBrain и алгоритм полезного контента флагируют материал по сигналам качества: поверхностное покрытие темы, непроверенные утверждения, дублирующийся текст, массово опубликованные страницы без человеческого участия.

### Реальная статистика

Данные Originality AI на июнь 2025: 16.51% всех результатов поиска Google содержат AI-генерированный контент. Это означает, что AI-контент ранжируется — вопрос только в его качестве.

### Вывод для BOATTOMORROW

Ваша ситуация — **принципиально отличается от "спамного" AI**:
- Контент основан на реальном опыте живых людей (ответы поставщиков)
- Это не копипаст и не переработка чужих страниц
- Каждая статья уникальна по источнику данных
- Есть человеческое редактирование (суперадмин может одобрять/редактировать)

Единственный реальный риск — **стилистические AI-маркеры**, которые детектируют как автоматические системы, так и живые читатели. Именно их нужно убирать.

---

## Часть 2. Полный список AI-маркеров

### 2.1. Слова-триггеры («AI vocabulary»)

Распределение «AI-словаря» меняется с эпохами моделей. Слово «delve» было характерно для GPT-4 в 2023–начале 2024, затем стало реже появляться и к 2025 почти исчезло. Ниже — актуальный список по эпохам:

**Эпоха 2023 – середина 2024 (GPT-4):**
> delve, boasts, bolstered, crucial, emphasizing, enduring, garner, intricate/intricacies, interplay, key (прилагательное), landscape, meticulous/meticulously, pivotal, underscore, tapestry, testament, valuable, vibrant

**Эпоха середина 2024 – середина 2025 (GPT-4o / Claude 3.x):**
> align with, bolstered, crucial, emphasizing, enhance, enduring, fostering, highlighting, pivotal, showcasing, underscore, vibrant

**Универсальные AI-слова (все эпохи):**
> realm, beacon, cacophony, comprehensive, leverage (глагол), utilize/utilising, facilitate, demonstrate, revolutionary, groundbreaking, cutting-edge, game-changer, unlock, discover, dive deep, seamless, transformative, scalable, thought leadership

**Фразы-заглушки:**
> "It is worth noting that", "It is important to note", "Needless to say", "In today's ever-evolving world", "In the realm of", "When it comes to", "In conclusion", "In summary", "Moreover", "Furthermore", "Additionally", "First and foremost"

**Модальные заглушки:**
> "could potentially", "might possibly", "may perhaps", "seems to suggest"

**Паразиты вежливости (из AI-чатботов):**
> "Certainly!", "Great question", "I'd be happy to", "I hope this helps", "Feel free to", "Don't hesitate to"

---

### 2.2. Пунктуационные маркеры

Длинное тире (em dash) стало, пожалуй, наиболее обсуждаемым пунктуационным индикатором AI-генерации. Оно появляется с поразительной частотой в AI-тексте — как универсальное решение для соединения идей, добавления акцента или введения объяснений. Эта сверхзависимость стала настолько заметной, что некоторые наблюдатели прозвали его «тире ChatGPT».

**Конкретные пунктуационные паттерны AI:**
- **Em dash (—)** — гораздо чаще, чем у людей; вместо запятых, скобок, двоеточий
- **Точка с запятой** — AI злоупотребляет ею там, где человек написал бы два предложения
- **Двоеточие в середине предложения** — AI использует его слишком механически
- **Скобки для «дополнений»** — частый AI-прием пояснений в скобках (вот так)

---

### 2.3. Структурные маркеры

Отсутствие вариации в длинах предложений создаёт то, что исследователи называют низкой «пульсацией» (burstiness) — отсутствие естественного чередования коротких и длинных предложений, которое характеризует человеческий текст.

**Структурные паттерны, выдающие AI:**
- Все предложения примерно одинаковой длины (40–70 символов)
- Каждый абзац строго 3–4 предложения
- Каждый пункт списка одинаковой длины
- Чрезмерная симметрия: "On one hand... On the other hand..."
- «Качели»: первая половина предложения делает утверждение, вторая сразу его оговаривает: "While X has benefits, it's important to note that Y..."

**Типичные AI-структуры вступлений:**
- "In today's [adjective] world..."
- "When it comes to [topic]..."
- "Whether you're a [persona] or a [persona]..."
- "In this comprehensive guide, we'll explore..."

**Типичные AI-концовки:**
- Резюме всего сказанного в последнем абзаце
- "By following these tips, you can..."
- "Ultimately, the key is..."

---

### 2.4. Семантические маркеры

AI застревает в режиме «бизнес-кэжуал»: предпочитает «utilize» вместо «use», «facilitate» вместо «help», «demonstrate» вместо «show». Человек переключает регистры — использует книжное слово рядом со сленгом или простым односложным словом.

**Что выдаёт AI на уровне смысла:**
- Абстрактные существительные вместо конкретных образов («landscape» вместо описания реального места)
- Отсутствие конкретных деталей — «beautiful anchorage» вместо «the anchorage at Palmizana, where you can swim to three different tavernas»
- Сенсорные описания без «физики места» — AI знает, что море солёное, но не знает, как оно пахнет в 6 утра в Сплите
- Нет «неловких» деталей, ошибок, противоречий — человеческий опыт несимметричен
- Всегда «взвешенный» тон — AI избегает сильных мнений

---

## Часть 3. Практическое решение для BOATTOMORROW

### 3.1. Двухшаговая модель обработки текста

```
Шаг 1: Opus 4.6 генерирует черновик
           ↓
Шаг 2: Второй вызов LLM — «humanizer pass»
           ↓
Финальный текст → на модерацию или публикацию
```

Это добавляет ~$0.10–0.15 к стоимости одной статьи, но принципиально меняет качество.

---

### 3.2. Системный промпт для «humanizer pass»

Добавить новый API-роут `/api/quiz/humanize` и вызывать его после генерации статьи:

```typescript
// lib/prompts/humanizer.ts

export const HUMANIZER_SYSTEM_PROMPT = `
You are a professional editor at a sailing magazine. Your job is to rewrite
AI-generated drafts so they sound like they were written by a human expert
who has actually sailed these waters.

RULES — STRICTLY FOLLOW:

PUNCTUATION:
- Never use em dashes (—). Replace with: a period, comma, colon, or new sentence.
- Use exclamation marks maximum once per article, and only if genuinely warranted.
- Semicolons: avoid unless absolutely necessary.

BANNED WORDS (replace with simpler, more natural alternatives):
delve, tapestry, realm, beacon, landscape (abstract), pivotal, crucial,
comprehensive, leverage (verb), utilize, facilitate, demonstrate (verb),
underscore (verb), testament, vibrant, bolster, garner, interplay,
intricate, meticulous, enduring, fostering, showcasing, align with,
game-changer, groundbreaking, cutting-edge, revolutionary, transformative,
seamless, unlock, discover (as CTA verb)

BANNED PHRASES:
- "It is worth noting that"
- "It is important to note"
- "In today's [adjective] world"
- "When it comes to"
- "In conclusion" / "In summary" / "To summarize"
- "Moreover" / "Furthermore" / "Additionally" (replace with "Also" or just continue)
- "First and foremost"
- "could potentially" / "might possibly"
- "Whether you're a X or a Y"
- Any sentence starting with "Certainly"

SENTENCE RHYTHM:
- Vary sentence length deliberately. Short sentences have power. Use them.
- After a complex sentence, follow with a short one.
- Not every paragraph needs to be 3-4 sentences. Two-sentence paragraphs are fine.
- One-sentence paragraphs are occasionally powerful. Use them.

REGISTER:
- Write like a knowledgeable sailor, not a corporate brochure.
- Prefer specific over general: "the bora can arrive at 3am without warning"
  not "wind conditions can be unpredictable."
- Use concrete details from the source material.
- It's okay to have a point of view. "Most sailors overestimate the difficulty
  of this passage" is better than "The passage requires experience."

STRUCTURE:
- The intro should drop the reader into a scene or a specific fact.
  NOT: "Croatia is a stunning destination with crystal-clear waters."
  YES: "The ACI marina in Šibenik fills up by Thursday in July. Plan accordingly."
- Don't summarize at the end. End on a specific detail or a genuine observation.

OUTPUT:
Return only the rewritten article text in the same Markdown format as the input.
Do not add explanations, notes, or commentary.
`
```

---

### 3.3. Промпт для вызова humanizer

```typescript
// api/quiz/humanize/route.ts

const humanizedContent = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',   // Sonnet достаточно для этого шага
  max_tokens: 4000,
  system: HUMANIZER_SYSTEM_PROMPT,
  messages: [{
    role: 'user',
    content: `Rewrite this article draft following your editorial rules.
Preserve all factual information, the structure, and the SEO elements
(H2 headings, FAQ section, key facts). Only change the style and language.

ARTICLE:
${generatedDraft}`
  }]
})
```

---

### 3.4. Обновление основного промпта генерации

Параллельно — запретить AI-маркеры уже на уровне первичной генерации:

```
Добавить в конец системного промпта Opus 4.6:

STYLE RULES:
- Never use em dashes (—)
- Never use: delve, tapestry, realm, pivotal, crucial, comprehensive,
  leverage, utilize, furthermore, moreover, additionally, in conclusion
- Never open a section with "When it comes to" or "In today's world"
- Vary sentence length. Mix short and long sentences.
- Prefer specific facts over general claims.
- Write in the register of Yachting Monthly or Cruising World, not a PR release.
```

---

### 3.5. Добавление «человеческих сигналов» в промпт

Это самое важное для BOATTOMORROW — у вас есть реальный источник: ответы поставщика.
LLM нужно использовать их максимально.

```
Добавить в промпт генерации:

AUTHENTICITY REQUIREMENTS:
The supplier has given you specific, first-hand knowledge. Use it.

1. Quote the supplier's own words (paraphrased, not verbatim) at least once:
   "The company recommends arriving at Kornati before noon in August..."
   
2. Include at least one specific local detail that wouldn't appear in a generic
   article about this destination: a specific marina name, a local dish,
   a specific wind pattern time, a particular hazard.

3. Include at least one piece of counter-intuitive or non-obvious advice:
   something that contradicts what most tourists assume.

4. If the supplier mentioned any personal anecdote or preference, include it.
   First-person experience, even paraphrased, is a strong trust signal.
```

---

### 3.6. Инструкция для суперадмина: финальная проверка

Добавить в интерфейс суперадмина — **чеклист перед публикацией**:

```
При модерации статьи проверить:

☐ Нет em dash (—) в тексте
☐ Нет слов: delve, tapestry, pivotal, crucial, comprehensive
☐ Нет фраз: "It is worth noting", "In conclusion", "Moreover"
☐ Первое предложение не начинается с общего утверждения
☐ Есть хотя бы одна конкретная деталь (название места, цифра, время)
☐ Финал статьи не является пересказом её начала
☐ Все предложения не одинаковой длины (проверить визуально)
☐ Есть атрибуция поставщику: "According to [Company]..." или аналог
```

Технически это можно реализовать как автоматическую проверку при сохранении черновика — простой regex на запрещённые слова с предупреждением в UI.

---

### 3.7. Сигналы E-E-A-T (Experience, Expertise, Authority, Trust)

Это то, что Google реально оценивает — и что одновременно делает текст «нечеловечески»:

| Сигнал | Что добавить |
|---|---|
| **Experience** | Атрибуция поставщику: «По словам команды Adriatic Sails...» |
| **Expertise** | Конкретные технические детали из квиза: точные ветра, глубины, сезоны |
| **Authority** | Byline с именем компании, ссылка на профиль поставщика |
| **Trust** | Дата публикации, дата последнего обновления, реальные фото |

**Добавить в схему статьи:**
```prisma
model Article {
  // ...
  bylineText  String?   // "Written by Adriatic Sails, based on 15 years of experience chartering in Croatia"
  supplierQuote String? // Цитата от поставщика для sidebar или pullquote
}
```

**Добавить в промпт:**
```
At the end of the intro section, include a one-sentence attribution:
"This guide is based on [X] years of experience chartering in [region],
shared by [Company Name]."
```

---

## Часть 4. Технические изменения в коде

### 4.1. Новый роут: POST /api/quiz/humanize

```typescript
// app/api/quiz/humanize/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { anthropic } from '@/lib/anthropic'
import { HUMANIZER_SYSTEM_PROMPT } from '@/lib/prompts/humanizer'

export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { content, articleId } = await req.json()

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4000,
    system: HUMANIZER_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: `Rewrite this article:\n\n${content}` }]
  })

  const humanized = response.content[0].type === 'text'
    ? response.content[0].text
    : content

  return NextResponse.json({ content: humanized })
}
```

### 4.2. Утилита: автопроверка на AI-маркеры

```typescript
// lib/ai-detector.ts

const AI_WORDS = [
  'delve', 'tapestry', 'realm', 'pivotal', 'crucial', 'comprehensive',
  'leverage', 'utilize', 'moreover', 'furthermore', 'additionally',
  'bolster', 'garner', 'intricate', 'meticulous', 'testament',
  'vibrant', 'seamless', 'transformative', 'groundbreaking'
]

const AI_PHRASES = [
  'it is worth noting',
  'it is important to note',
  'in conclusion',
  'in summary',
  'in today\'s world',
  'when it comes to',
  'first and foremost',
  'could potentially',
  'might possibly'
]

const EM_DASH_REGEX = /—/g

export function detectAIMarkers(text: string): {
  score: number
  issues: { type: string, matches: string[] }[]
} {
  const lower = text.toLowerCase()
  const issues = []

  // Проверка слов
  const foundWords = AI_WORDS.filter(w => lower.includes(w))
  if (foundWords.length > 0)
    issues.push({ type: 'AI words', matches: foundWords })

  // Проверка фраз
  const foundPhrases = AI_PHRASES.filter(p => lower.includes(p))
  if (foundPhrases.length > 0)
    issues.push({ type: 'AI phrases', matches: foundPhrases })

  // Проверка em dash
  const emDashes = text.match(EM_DASH_REGEX)
  if (emDashes && emDashes.length > 1)
    issues.push({ type: 'Em dash overuse', matches: [`${emDashes.length} occurrences`] })

  // Проверка длины предложений (низкая «пульсация»)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 10)
  const lengths = sentences.map(s => s.trim().split(' ').length)
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length
  const variance = lengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lengths.length
  if (variance < 15)
    issues.push({ type: 'Low burstiness', matches: ['Sentence lengths too uniform'] })

  const score = Math.max(0, 100 - issues.length * 15 - foundWords.length * 5)

  return { score, issues }
}
```

### 4.3. Предупреждение в UI редактора

В форме редактирования черновика добавить автоматическую проверку:

```tsx
// components/ArticleEditor.tsx
import { detectAIMarkers } from '@/lib/ai-detector'

const { score, issues } = detectAIMarkers(content)

{score < 70 && (
  <div className="ai-warning">
    <p>⚠ Detected {issues.length} AI writing patterns. Consider humanizing:</p>
    <ul>
      {issues.map(i => (
        <li key={i.type}>
          <strong>{i.type}:</strong> {i.matches.join(', ')}
        </li>
      ))}
    </ul>
    <button onClick={handleHumanize}>Auto-humanize →</button>
  </div>
)}
```

---

## Итоговая схема обработки статьи

```
Поставщик отвечает на квиз
           ↓
/api/quiz/generate
[Opus 4.6 + запрет AI-слов в промпте]
           ↓
Черновик статьи
           ↓
/api/quiz/humanize
[Sonnet 4.6 + humanizer промпт]
           ↓
Автопроверка detectAIMarkers()
           ↓
Если score < 70 → предупреждение поставщику / суперадмину
           ↓
Модерация суперадмином (чеклист)
           ↓
Публикация
```

**Стоимость добавленного шага:** ~$0.10 на статью (Sonnet 4.6, ~3K токенов).

---

*BOATTOMORROW — AI Detection Prevention Guide v1.0*
