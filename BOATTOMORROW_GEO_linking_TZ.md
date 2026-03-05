# BOATTOMORROW
## ТЗ: GEO/AEO-оптимизация и система внутренней перелинковки
**Версия 1.0 | 2025**

---

## Контекст: что изменилось в поиске

Традиционный SEO (позиция в Google) больше не единственная метрика видимости. По данным Previsible, AI-трафик вырос на **527% за первые 5 месяцев 2025 года**. ChatGPT обслуживает 800М+ еженедельных пользователей, Google AI Overviews появляются в более чем 55% поисковых запросов.

Новая воронка выглядит так:
```
Пользователь задаёт вопрос в ChatGPT / Perplexity / Gemini
→ AI синтезирует ответ из нескольких источников
→ Ваш контент цитируется (или нет)
→ Пользователь переходит по ссылке (если переходит вообще)
```

Это означает: цель оптимизации теперь не только «занять первую строку Google», но и «стать источником, которого цитирует AI». Это называется **GEO** (Generative Engine Optimization) и **AEO** (Answer Engine Optimization).

**Важно:** AI-трафик конвертируется в ~2× лучше, чем обычный органический — пользователи приходят с уже сформированным намерением.

---

## Часть 1. GEO/AEO — аудит текущего ТЗ и дополнения

### 1.1. Что уже заложено (хорошо)

Сравниваю с требованиями GEO/AEO:

| Требование GEO/AEO | Статус в текущем ТЗ |
|---|---|
| SSR/SSG — контент индексируется | ✅ Заложено |
| Структурированные данные JSON-LD (Article) | ✅ Заложено |
| metaTitle + metaDescription | ✅ Генерируется LLM |
| H1 с ключевым словом | ✅ Генерируется LLM |
| Логичная H1→H2→H3 иерархия | ✅ В промпте генерации |
| OG-теги для шеринга | ✅ Заложено |
| sitemap.xml | ✅ Заложено |
| robots.txt | ✅ Заложено |
| Breadcrumbs (JSON-LD BreadcrumbList) | ✅ Заложено |
| Alt-тексты для изображений | ✅ Генерируется LLM |
| Canonical URLs | ✅ Заложено |

### 1.2. Что НЕ заложено — необходимо добавить

---

#### ❶ Answer Capsule (самое важное для GEO)

**Что это:** Блок из 40–60 слов в самом начале статьи, который отвечает на главный вопрос прямо и исчерпывающе. Именно его AI-системы «вырезают» и вставляют в свои ответы.

**Исследование Conductor:** контент с чётким answer capsule в первых 100 словах цитируется значительно чаще.

**Что добавить в промпт генерации статьи:**
```
После H1 и до первого раздела обязательно сгенерируй "answer capsule" —
абзац из 40–60 слов, который прямо отвечает на главный вопрос статьи.
Пример для дестинейшена: "Хорватское побережье — одно из лучших мест для
яхтинга в Европе: более 1200 островов, устойчивый летний бриз маэстраль
и развитая сеть марин делают его идеальным для чартера с мая по октябрь.
Наиболее популярен маршрут из Сплита через архипелаг Шибеник."
```

**Добавить в схему БД:**
```prisma
model Article {
  // ...существующие поля...
  answerCapsule  String?   // 40-60 слов, генерируется LLM
}
```

---

#### ❷ FAQ-блок в конце каждой статьи

**Что это:** Секция с 4–6 вопросами и краткими ответами. Каждая пара — самостоятельная единица, которую AI может извлечь и процитировать.

**Почему критично:** ChatGPT структурирует ответы в виде вопрос-ответ. Готовые FAQ-блоки «поднимаются» в синтезированные ответы напрямую.

**Формат (Markdown в контенте статьи):**
```markdown
## Frequently Asked Questions

### Is Croatia good for sailing beginners?
Yes. The Dalmatian coast offers sheltered channels between islands,
predictable summer winds, and well-equipped marinas — making it one of
Europe's most beginner-friendly sailing destinations.

### What is the best month to sail Croatia?
May–June and September offer the best conditions: steady breeze,
fewer crowds, and warm water. July–August is peak season with
stronger winds and busier anchorages.
```

**Добавить в промпт:**
```
В конце статьи, перед заключительным абзацем, добавь раздел
"## Frequently Asked Questions" с 4–5 парами вопрос-ответ.
Вопросы должны быть сформулированы так, как человек спросил бы
в ChatGPT или Perplexity. Ответы — 2–3 предложения, самодостаточные.
```

**Добавить в схему БД:**
```prisma
model Article {
  // ...
  faqItems  Json?  // [{ q: string, a: string }]
}
```

---

#### ❸ FAQ Schema (JSON-LD) для каждой статьи

**Что это:** Структурированная разметка FAQ-блока, которую Google AI Overviews и Bing Copilot используют для извлечения ответов.

**Добавить в `app/articles/[slug]/page.tsx`:**
```tsx
// Генерируется из faqItems статьи
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": article.faqItems?.map(item => ({
    "@type": "Question",
    "name": item.q,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": item.a
    }
  }))
}

// В <head>:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
/>
```

---

#### ❹ Расширенный JSON-LD для статей

Текущий ТЗ предусматривает базовый `Article`. Для GEO нужен расширенный вариант:

```tsx
const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": article.title,
  "description": article.metaDescription,  // ← answer capsule здесь
  "image": article.coverImageUrl,
  "datePublished": article.publishedAt,
  "dateModified": article.updatedAt,       // ← добавить поле updatedAt в БД
  "author": {
    "@type": "Organization",
    "name": article.supplier.name,
    "url": `https://boattomorrow.com/suppliers/${article.supplier.slug}`
  },
  "publisher": {
    "@type": "Organization",
    "name": "BOATTOMORROW",
    "url": "https://boattomorrow.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://boattomorrow.com/logo.png"
    }
  },
  "about": {
    "@type": "Place",        // ← для дестинейшенов
    "name": article.region
  },
  "keywords": article.tags.join(", "),
  "wordCount": article.content.split(' ').length,
  "inLanguage": "en",
  "isPartOf": {
    "@type": "WebSite",
    "name": "BOATTOMORROW",
    "url": "https://boattomorrow.com"
  }
}
```

---

#### ❺ `updatedAt` и freshness сигналы

**Что это:** Perplexity AI в первую очередь цитирует контент, опубликованный за последние 90 дней. Google AI Overviews также учитывает дату обновления.

**Что добавить:**

```prisma
model Article {
  // ...
  updatedAt   DateTime  @updatedAt   // ← добавить
}
```

```tsx
// В <head> статьи:
<meta property="article:published_time" content={article.publishedAt} />
<meta property="article:modified_time" content={article.updatedAt} />
```

**Механика «освежения» контента:** При редактировании статьи суперадмином или поставщиком — автоматически обновлять `updatedAt`. Также добавить поле `lastReviewedAt` — дата последней редакторской проверки, даже без изменения текста.

---

#### ❻ Блок «Key Facts» — табличные данные

AI-системы хорошо извлекают структурированные факты. Для дестинейшенов и маршрутов добавить стандартизированный блок:

**Добавить в схему БД:**
```prisma
model Article {
  // ...
  keyFacts  Json?  // [{ label: string, value: string }]
}
```

**Пример генерации (в промпте):**
```
Для дестинейшенов сгенерируй поле keyFacts — массив из 6–8 пар:
[
  { "label": "Best season", "value": "May–October" },
  { "label": "Typical wind", "value": "Maestral (NW), 10–20 knots" },
  { "label": "Main marina hub", "value": "Split ACI Marina" },
  { "label": "Difficulty level", "value": "Beginner to intermediate" },
  { "label": "Charter base", "value": "Split, Trogir, Šibenik" },
  { "label": "Average week cost", "value": "€1,500–4,000 for a 40ft yacht" }
]
```

**Рендер на странице статьи:**
```tsx
{article.keyFacts && (
  <aside className="key-facts">
    <h3>Key Facts</h3>
    <dl>
      {article.keyFacts.map(f => (
        <div key={f.label}>
          <dt>{f.label}</dt>
          <dd>{f.value}</dd>
        </div>
      ))}
    </dl>
  </aside>
)}
```

---

#### ❼ `llms.txt` — новый стандарт для AI-краулеров

**Что это:** Аналог `robots.txt`, но для LLM. Файл по адресу `https://boattomorrow.com/llms.txt` объясняет AI-системам структуру сайта и разрешает индексацию.

**Создать `/public/llms.txt`:**
```
# BOATTOMORROW - Yachting Content Platform

> BOATTOMORROW is an editorial platform covering sailing destinations,
> yacht charter, boat reviews, and sailing education.
> Content is written by verified yachting industry suppliers and
> edited to professional standards.

## Content

- Destinations: https://boattomorrow.com/destinations
- Boats & Yachts: https://boattomorrow.com/boats
- Sailing Routes: https://boattomorrow.com/routes
- Learning: https://boattomorrow.com/learning
- Tips: https://boattomorrow.com/tips
- Suppliers: https://boattomorrow.com/suppliers

## About

Publisher: BOATTOMORROW
Language: English
Update frequency: Daily
Content type: Editorial articles, destination guides, boat reviews
```

---

#### ❽ Entity Consistency — единообразие названий

**Что это:** AI-системы строят «граф знаний» о сущностях. Если одна дестинация называется «Croatia», «Croatian Coast», «Dalmatia» и «Croatia sailing» в разных статьях — AI не объединяет их в одну сущность.

**Что добавить в БД:**
```prisma
model Destination {
  id           String    @id @default(uuid())
  canonicalName String   @unique  // "Croatia - Dalmatian Coast"
  aliases      String[]           // ["Croatia", "Dalmatia", "Croatian sailing"]
  region       String             // "Mediterranean"
  articles     Article[]
}

model Article {
  // ...
  destinationId  String?
  destination    Destination? @relation(fields: [destinationId], references: [id])
}
```

Это позволяет: на странице дестинейшена агрегировать все статьи по ней, создавать автоматические хабы `/destinations/croatia`, строить перелинковку (см. Часть 2).

---

#### ❾ `robots.txt` — открыть AI-краулеры

Большинство AI-систем используют собственных краулеров. Текущий `robots.txt` должен явно их допускать:

```
User-agent: *
Disallow: /supplier/
Disallow: /admin/
Allow: /

# Explicit allow for AI crawlers
User-agent: GPTBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: ClaudeBot
Allow: /

Sitemap: https://boattomorrow.com/sitemap.xml
```

---

### 1.3. Обновлённый промпт генерации статьи

С учётом всех GEO-требований промпт из основного ТЗ расширяется:

```
SYSTEM:
Ты — профессиональный SEO и GEO редактор яхтенного журнала BOATTOMORROW.
Твой контент должен цитироваться в ChatGPT, Perplexity и Google AI Overviews.

USER:
На основе данных квиза сгенерируй статью в формате JSON со следующими полями:

{
  "title": "H1, до 60 символов, ключевое слово в начале",
  "slug": "keyword-destination-sailing",
  "answerCapsule": "40-60 слов, прямой ответ на главный вопрос статьи",
  "content": "Markdown. Структура:
    ## [Section 1]
    ## [Section 2]
    ...
    ## Frequently Asked Questions
    ### [Вопрос как в ChatGPT]
    [Ответ 2-3 предложения, самодостаточный]
    ...4-5 пар вопрос-ответ...
    [Заключительный абзац]",
  "keyFacts": [{ "label": "...", "value": "..." }],  // 6-8 пар
  "faqItems": [{ "q": "...", "a": "..." }],          // 4-5 пар (из FAQ в тексте)
  "metaTitle": "до 60 символов",
  "metaDescription": "до 160 символов, с призывом",
  "tags": ["...", "...", "...", "...", "..."],
  "excerpt": "2-3 предложения для карточки",
  "altTexts": ["описание для каждого фото"]
}
```

---

## Часть 2. Система внутренней перелинковки

### 2.1. Почему это критично

Внутренняя перелинковка решает три задачи одновременно:

| Задача | Механика |
|---|---|
| **SEO** | Передаёт «ссылочный вес» между страницами, помогает Google понять структуру сайта |
| **GEO** | AI-системы при индексации следуют по ссылкам — связанный контент чаще попадает в один ответ |
| **UX/конверсия** | Удерживает пользователя на сайте, ведёт к форме лидогенерации |

Исследование seoTuners: сайты, исправившие внутренний граф ссылок, попадают в AI Overviews и ChatGPT-цитаты **за несколько недель**.

### 2.2. Архитектура перелинковки BOATTOMORROW

Структура — «ступенчатая пирамида»:

```
                    [ Главная / ]
                         │
           ┌─────────────┼─────────────┐
           │             │             │
    [/destinations]  [/boats]    [/learning]  ← Хабы рубрик
           │             │             │
    [/destinations/  [/boats/     [/learning/
       croatia]        catamaran]   beginners]  ← Хабы дестинейшенов/типов
           │             │             │
     [Статья 1]    [Статья A]    [Статья X]   ← Листовые страницы
     [Статья 2]    [Статья B]
     [Статья 3]
           │
    [/suppliers/adriatic-sails]               ← Профиль поставщика
```

**Каждая страница ссылается вверх** (breadcrumbs + «Все статьи о Хорватии»)
**Каждая страница ссылается вниз** (похожие статьи, профиль автора)
**Горизонтальные ссылки** (связанные дестинейшены, другие маршруты из той же статьи)

---

### 2.3. Типы перелинковки и их реализация

#### Тип A: Автоматическая контекстная перелинковка в тексте

LLM при генерации статьи расставляет ссылки на другие статьи BOATTOMORROW прямо в тексте. Это самый ценный тип для GEO — «естественные» анкоры в теле статьи.

**Как работает:**
1. При генерации статьи API получает список опубликованных статей (title + slug + tags)
2. В промпт добавляется инструкция расставить контекстные ссылки
3. LLM вставляет `[anchor text](/articles/slug)` в Markdown там, где они уместны

**Добавить в API-роут `/api/quiz/generate`:**
```typescript
// Перед вызовом LLM — загружаем список связанных статей
const relatedArticles = await prisma.article.findMany({
  where: {
    status: 'published',
    OR: [
      { region: quizSession.answers.region },
      { tags: { hasSome: quizSession.answers.tags } },
      { category: quizSession.answers.category }
    ]
  },
  select: { title: true, slug: true, tags: true, category: true },
  take: 20
})

// Добавляем в промпт:
const contextLinks = `
Available internal links for contextual linking (use 2-4 naturally in the text):
${relatedArticles.map(a => `- [${a.title}](/articles/${a.slug})`).join('\n')}

Insert these as Markdown links where they fit naturally in the content.
Do not force them. If a mention of Croatia naturally connects to another article
about Croatian sailing routes, link it.
`
```

---

#### Тип B: Хабы дестинейшенов — автогенерируемые страницы

**Что это:** Страница `/destinations/croatia` автоматически агрегирует все статьи с `region = "Croatia"` — без ручного создания.

**Добавить маршрут `/destinations/[region]/page.tsx`:**
```typescript
// app/(public)/destinations/[region]/page.tsx

export async function generateStaticParams() {
  const regions = await prisma.article.groupBy({
    by: ['region'],
    where: { status: 'published', region: { not: null } }
  })
  return regions.map(r => ({ region: slugify(r.region) }))
}

export default async function RegionHub({ params }) {
  const articles = await prisma.article.findMany({
    where: {
      status: 'published',
      region: { contains: params.region, mode: 'insensitive' }
    },
    orderBy: { publishedAt: 'desc' }
  })

  // JSON-LD для хаба
  const hubSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Sailing ${params.region} — BOATTOMORROW`,
    "description": `All sailing guides, destinations, and routes for ${params.region}`,
    "url": `https://boattomorrow.com/destinations/${params.region}`
  }

  return (
    <>
      <script type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(hubSchema) }} />
      <h1>/ {params.region}</h1>
      <p className="hub-intro">
        {articles.length} articles about sailing {params.region}
      </p>
      {/* Featured + grid */}
      <ArticleGrid articles={articles} />
    </>
  )
}
```

**Это создаёт:** `/destinations/croatia`, `/destinations/greece`, `/destinations/caribbean` и т.д. автоматически при публикации новых статей.

---

#### Тип C: Related Articles — боковая панель и «/ read next»

**Алгоритм подбора похожих статей (по убыванию приоритета):**

```typescript
// lib/related-articles.ts
export async function getRelatedArticles(article: Article, limit = 3) {
  // 1. Сначала ищем: совпадение тегов + тот же регион
  const byTagsAndRegion = await prisma.article.findMany({
    where: {
      id: { not: article.id },
      status: 'published',
      region: article.region,
      tags: { hasSome: article.tags }
    },
    orderBy: { viewsCount: 'desc' },
    take: limit
  })
  if (byTagsAndRegion.length >= limit) return byTagsAndRegion

  // 2. Затем: тот же регион, любые теги
  const byRegion = await prisma.article.findMany({
    where: {
      id: { notIn: [article.id, ...byTagsAndRegion.map(a => a.id)] },
      status: 'published',
      region: article.region
    },
    orderBy: { viewsCount: 'desc' },
    take: limit - byTagsAndRegion.length
  })

  // 3. Добираем: та же рубрика
  const byCategory = await prisma.article.findMany({
    where: {
      id: { notIn: [article.id, ...byTagsAndRegion.map(a => a.id), ...byRegion.map(a => a.id)] },
      status: 'published',
      category: article.category
    },
    orderBy: { viewsCount: 'desc' },
    take: limit - byTagsAndRegion.length - byRegion.length
  })

  return [...byTagsAndRegion, ...byRegion, ...byCategory]
}
```

**Размещение на странице статьи:**
```tsx
// Конец статьи — "/ read next"
<section className="read-next">
  <SectionHeading>/ read next</SectionHeading>
  <ArticleGrid articles={relatedArticles} columns={3} />
</section>

// Sidebar (десктоп) — "More from this region"
<aside className="article-sidebar">
  <h4>More from {article.region}</h4>
  {relatedArticles.slice(0, 3).map(a => (
    <ArticleCardCompact key={a.id} article={a} />
  ))}
</aside>
```

---

#### Тип D: Перелинковка поставщик ↔ статьи

Двунаправленные ссылки между профилями поставщиков и их статьями:

```
Статья → «Written by [Company Name]» → /suppliers/company-slug
Профиль поставщика → «Articles by this supplier» → список статей
```

**На странице статьи — карточка поставщика:**
```tsx
<div className="article-supplier-card">
  <Link href={`/suppliers/${article.supplier.slug}`}>
    {/* Лого + имя + тип */}
  </Link>
  <p>More guides from {article.supplier.name}:</p>
  {supplierOtherArticles.map(a => (
    <Link key={a.id} href={`/articles/${a.slug}`}>{a.title}</Link>
  ))}
</div>
```

**На странице поставщика — все его статьи:**
```tsx
<section>
  <h2>Guides by {supplier.name}</h2>
  <ArticleGrid articles={supplierArticles} />
</section>
```

---

#### Тип E: Breadcrumbs — навигационные ссылки

На каждой странице — хлебные крошки, каждый уровень — ссылка:

```
BOATTOMORROW → Destinations → Croatia → Sailing the Dalmatian Coast
     ↑               ↑            ↑
   /             /destinations  /destinations/croatia
```

```tsx
// components/Breadcrumbs.tsx
export function Breadcrumbs({ items }: { items: { label: string, href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="breadcrumbs">
        <li><Link href="/">BOATTOMORROW</Link></li>
        {items.map((item, i) => (
          <li key={i}>
            {item.href
              ? <Link href={item.href}>{item.label}</Link>
              : <span>{item.label}</span>
            }
          </li>
        ))}
      </ol>
    </nav>
  )
}

// На странице статьи:
<Breadcrumbs items={[
  { label: article.category, href: `/${article.category}` },
  { label: article.region, href: `/destinations/${slugify(article.region)}` },
  { label: article.title }
]} />
```

**Breadcrumbs JSON-LD** (уже есть в основном ТЗ, но уточнить):
```tsx
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Destinations",
      "item": "https://boattomorrow.com/destinations" },
    { "@type": "ListItem", "position": 2, "name": article.region,
      "item": `https://boattomorrow.com/destinations/${slugify(article.region)}` },
    { "@type": "ListItem", "position": 3, "name": article.title,
      "item": `https://boattomorrow.com/articles/${article.slug}` }
  ]
}
```

---

#### Тип F: Перекрёстные ссылки в тексте — «якорные» хабы

Некоторые статьи должны становиться **cornerstone content** — «якорными» страницами, на которые ссылаются все статьи по теме.

Примеры cornerstone для BOATTOMORROW:
- «The Complete Guide to Yacht Charter in Croatia» → на неё ссылаются все хорватские статьи
- «How to Choose a Sailing Yacht: Beginner's Guide» → на неё ссылаются статьи про конкретные модели
- «Mediterranean Sailing Seasons: Month by Month» → на неё ссылаются все средиземноморские дестинейшены

**Реализация в БД:**
```prisma
model Article {
  // ...
  isCornerstone  Boolean   @default(false)
  cornerstoneId  String?   // статья может «принадлежать» cornerstone
  cornerstone    Article?  @relation("CornerstoneArticles", fields: [cornerstoneId], references: [id])
  subArticles    Article[] @relation("CornerstoneArticles")
}
```

**В промпте генерации — если есть cornerstone:**
```
If there is a cornerstone article for this destination/topic, always include
a natural contextual link to it in the article body.
Cornerstone article: [title] → [/articles/slug]
```

---

### 2.4. Новые таблицы и поля в БД

```prisma
// Добавить к существующей схеме:

model Article {
  // ...новые поля GEO:
  answerCapsule  String?
  faqItems       Json?       // [{ q, a }]
  keyFacts       Json?       // [{ label, value }]
  updatedAt      DateTime    @updatedAt
  lastReviewedAt DateTime?
  isCornerstone  Boolean     @default(false)
  cornerstoneId  String?
  cornerstone    Article?    @relation("CornerstoneArticles", fields: [cornerstoneId], references: [id])
  subArticles    Article[]   @relation("CornerstoneArticles")
  destinationId  String?
  destination    Destination? @relation(fields: [destinationId], references: [id])
}

model Destination {
  id            String    @id @default(uuid())
  canonicalName String    @unique   // "Croatia - Dalmatian Coast"
  slug          String    @unique   // "croatia"
  aliases       String[]
  region        String              // "Mediterranean"
  description   String?            // короткое описание для хаб-страницы
  coverImageUrl String?
  articles      Article[]
  createdAt     DateTime  @default(now())
}
```

---

### 2.5. Новые API-роуты для перелинковки

```
GET  /api/articles/[id]/related      → похожие статьи (алгоритм Тип C)
GET  /api/destinations               → список всех дестинейшенов с кол-вом статей
GET  /api/destinations/[slug]        → дестинейшен + все его статьи
GET  /api/suppliers/[slug]/articles  → все статьи поставщика
GET  /api/articles/[id]/context-links → список статей для контекстной перелинковки (для LLM)
```

---

## Часть 3. Чек-лист реализации

### GEO/AEO — приоритет

- [ ] Добавить `answerCapsule`, `faqItems`, `keyFacts`, `updatedAt` в схему `Article`
- [ ] Обновить промпт генерации — добавить answer capsule, FAQ-блок, keyFacts
- [ ] Добавить FAQ Schema (JSON-LD) на страницу статьи
- [ ] Расширить Article JSON-LD (`dateModified`, `wordCount`, `about`, `inLanguage`)
- [ ] Добавить OG `article:published_time` и `article:modified_time` в `<head>`
- [ ] Создать `/public/llms.txt`
- [ ] Обновить `robots.txt` — добавить разрешения для AI-краулеров
- [ ] Рендерить блок «Key Facts» на странице статьи
- [ ] Рендерить FAQ-блок с правильной разметкой `<dl>` или `<details>`

### Перелинковка — приоритет

- [ ] Создать таблицу `Destination` в Prisma + миграция
- [ ] Добавить поля перелинковки в `Article` (cornerstone, destination, updatedAt)
- [ ] Реализовать `lib/related-articles.ts` — алгоритм подбора
- [ ] Создать хаб-страницы `/destinations/[region]` (автогенерация через SSG)
- [ ] Добавить «/ read next» секцию на страницу статьи
- [ ] Добавить `Breadcrumbs` компонент + JSON-LD на все страницы
- [ ] Добавить карточку поставщика со ссылками на его другие статьи
- [ ] Добавить на страницу поставщика полный список его статей
- [ ] Реализовать контекстную перелинковку через LLM при генерации (API context-links)
- [ ] В суперадмин добавить возможность помечать статью как `isCornerstone`

---

## Итоговая сводка: что не было и теперь есть

| Был пробел | Решение |
|---|---|
| Нет GEO-структуры контента | Answer capsule + FAQ-блок в каждой статье |
| Нет FAQ Schema | JSON-LD FAQPage на каждой статье |
| Нет сигнала freshness | `updatedAt` + OG `article:modified_time` |
| Нет структурированных фактов | `keyFacts` блок + рендер |
| AI-краулеры могут быть заблокированы | `llms.txt` + обновлённый `robots.txt` |
| Нет хабов дестинейшенов | `/destinations/[region]` — автогенерация |
| Нет связи между статьями | Related articles алгоритм + «/ read next» |
| Нет двусторонней связи поставщик↔статьи | Карточки + списки на обеих страницах |
| Нет breadcrumbs с JSON-LD | Компонент Breadcrumbs + schema |
| Нет cornerstone-архитектуры | `isCornerstone` флаг + контекстные ссылки |
| Нет entity consistency | Таблица `Destination` с каноническими именами |

---

*BOATTOMORROW — GEO/AEO + Internal Linking TZ v1.0*
