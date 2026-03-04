# BOATTOMORROW — Дизайн-редизайн
## Техническое задание на доработку frontend-стиля
**Версия 1.0 | 2025**

---

## 0. Суть задачи

Текущий сайт (скриншот 3) выглядит как корпоративный SaaS-продукт: тёмный hero, иконки категорий, карточки с тенями, синяя палитра. Нужно перейти в **editorial / журнальный** стиль — минималистичный, типографически богатый, с большим количеством воздуха. Референс — сайт room.eu/tomorrow (скриншоты 1–2).

---

## 1. Ключевые принципы нового стиля

| Аспект | Было (сейчас) | Стало (цель) |
|--------|--------------|-------------|
| Настроение | Corporate SaaS | Editorial magazine |
| Фон | Тёмный navy hero | Белый / off-white `#FAFAF8` |
| Цвет | Navy + оранжевый по всему сайту | Чёрный текст + 1 акцент (оранжевый — только для логотипа и ключевых меток) |
| Типографика | Generic sans (Inter-стиль) | Контрастная пара: editorial serif для заголовков + гротеск для тела |
| Иконки | Везде | Убрать полностью из рубрик и навигации |
| Карточки | С тенями, бордерами, скруглениями | Без теней и бордеров — только изображение + текст |
| Hero | Полноэкранный цветной блок с CTA | Минималистичный заголовок + featured статья |
| Секции | "Latest Articles", "Our Suppliers" | `/ latest`, `/ destinations`, `/ suppliers` — слэш-префикс |
| Кнопки | Filled кнопки везде | Только там, где реально нужен CTA; остальное — текст-ссылки |
| Whitespace | Плотная верстка | Щедрые отступы, воздух между блоками |

---

## 2. Цветовая система

```css
:root {
  /* Базовые */
  --color-bg:         #FAFAF8;   /* off-white, не чисто белый */
  --color-bg-alt:     #F2F1ED;   /* чуть теплее — для секций-подложек */
  --color-text:       #111111;   /* почти чёрный */
  --color-text-muted: #777777;   /* подписи, мета-данные */
  --color-border:     #E5E4DF;   /* тонкие разделители */

  /* Акцент — только для логотипа и типовых меток */
  --color-accent:     #E8500A;   /* оранжевый BOATTOMORROW */

  /* Убираем */
  /* navy #1A3F5C — больше не используется нигде кроме логотипа */
}
```

**Правила использования акцента:**
- Логотип: слово "TOMORROW" остаётся оранжевым
- Бейджи типа поставщика: `Charter Company`, `Sailing School` — оранжевый текст, без фона
- Форма лидов: кнопка submit — оранжевая (единственная яркая кнопка на сайте)
- **Нигде больше**: ни фоны секций, ни иконки, ни ховеры

---

## 3. Типографика

### 3.1. Шрифтовые пары

```css
/* Вариант A (рекомендуемый) */
--font-display: 'Playfair Display', serif;   /* заголовки статей, hero */
--font-body:    'DM Sans', sans-serif;       /* тело, навигация, UI */

/* Вариант B (альтернатива) */
--font-display: 'Cormorant Garamond', serif;
--font-body:    'Figtree', sans-serif;

/* Подключение через Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500&display=swap');
```

### 3.2. Типографическая шкала

```css
/* Display — заголовки статей на странице статьи и featured карточках */
.text-display-xl  { font: 700 3.5rem/1.1 var(--font-display); letter-spacing: -0.02em; }
.text-display-lg  { font: 600 2.5rem/1.2 var(--font-display); letter-spacing: -0.01em; }
.text-display-md  { font: 400 1.75rem/1.3 var(--font-display); }

/* Body — весь основной текст */
.text-body-lg     { font: 400 1.125rem/1.7 var(--font-body); }
.text-body        { font: 400 1rem/1.6 var(--font-body); }
.text-body-sm     { font: 300 0.875rem/1.5 var(--font-body); color: var(--color-text-muted); }

/* UI — навигация, метки, кнопки */
.text-ui          { font: 500 0.875rem/1 var(--font-body); letter-spacing: 0.01em; }
.text-ui-xs       { font: 400 0.75rem/1 var(--font-body); text-transform: uppercase; letter-spacing: 0.08em; }
```

### 3.3. Секционные заголовки (слэш-стиль)

```tsx
// Компонент SectionHeading
<h2 className="section-heading">
  <span className="slash">/</span> destinations
</h2>

// CSS
.section-heading {
  font: 300 1.5rem/1 var(--font-body);
  letter-spacing: -0.01em;
}
.section-heading .slash {
  color: var(--color-accent);
  margin-right: 0.25em;
}
```

---

## 4. Навигация

### 4.1. Desktop navbar

**Было:** логотип | Destinations Boats Learning Routes Tips | Sign in | Get Started (синяя кнопка)

**Стало:**
```
[BOAT TOMORROW]    Destinations  Boats  Learning  Routes  Tips         Sign in  Get Started →
```

- Фон: `var(--color-bg)` — белый, без теней
- Нижняя граница: `1px solid var(--color-border)` — только при скролле (добавляется через JS/intersection)
- "Get Started →" — текст-ссылка, НЕ кнопка с фоном. Стрелка добавляется CSS `::after`
- Логотип: `BOAT` обычным чёрным + `TOMORROW` оранжевым, шрифт `var(--font-body)`, weight 500
- Все пункты меню: `text-ui`, цвет `var(--color-text)`, ховер через `opacity: 0.5` (без подчёркивания)
- `position: sticky; top: 0; z-index: 50`

### 4.2. Mobile navbar

- Hamburger → fullscreen overlay (белый фон)
- Пункты меню крупно, по одному, с анимацией stagger
- Внизу оверлея: email для связи

---

## 5. Главная страница — реструктуризация

### 5.1. Hero — убрать цветной блок

**Было:** `bg-navy`, полноэкранный, h1 + подзаголовок + 2 кнопки

**Стало:**
```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  /boat tomorrow                                     │  ← маленький, мутный
│                                                     │
│  Discover your next          [Большое фото          │
│  sailing adventure           featured статьи        │
│                              занимает правую        │
│  Ideas and guides            половину/60%]          │
│  for life on water.                                 │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Реализация:**
```tsx
<section className="hero">
  {/* Левая колонка — текст */}
  <div className="hero-text">
    <p className="hero-eyebrow">/ boat tomorrow</p>
    <h1 className="hero-title">
      Discover your next<br/>
      sailing adventure
    </h1>
    <p className="hero-sub">Ideas and guides for life on water.</p>
  </div>

  {/* Правая колонка — featured статья */}
  <a href={`/articles/${featured.slug}`} className="hero-featured">
    <div className="hero-img-wrap">
      <Image src={featured.coverImageUrl} fill alt={featured.title} />
    </div>
    <p className="hero-category">/ {featured.category}</p>
    <h2 className="hero-featured-title">{featured.title}</h2>
    <p className="hero-byline">by {featured.supplier.name}</p>
  </a>
</section>
```

```css
.hero {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 4rem;
  padding: 5rem 0 4rem;
  border-bottom: 1px solid var(--color-border);
}
.hero-title {
  font: 300 clamp(2.5rem, 5vw, 4rem)/1.1 var(--font-display);
  letter-spacing: -0.02em;
}
.hero-img-wrap {
  position: relative;
  aspect-ratio: 4/3;
  overflow: hidden;
}
```

### 5.2. Секция "/ latest" — замена "Latest Articles"

**Было:** `<h2>Latest Articles</h2>` + subtitle + 3 карточки в ряд с тенями

**Стало:**
```
/ latest                                              [view all →]
─────────────────────────────────────────────────────────────────
[Большая featured карточка: изображение + category + title + author]
─────────────────────────────────────────────────────────────────
[Карточка 2]        [Карточка 3]        [Карточка 4]
```

**Структура featured карточки (первый элемент):**
```tsx
<article className="card-featured">
  <a href={`/articles/${article.slug}`}>
    <div className="card-img-wrap ratio-16-9">
      <Image src={article.coverImageUrl} fill />
    </div>
    <div className="card-body">
      <p className="card-meta">
        <span className="card-category">{article.category}</span>
        <span className="card-sep">/</span>
        <span>by {article.supplier.name}</span>
      </p>
      <h3 className="card-title-lg">{article.title}</h3>
    </div>
  </a>
</article>
```

**Структура обычной карточки (2, 3, 4):**
```tsx
<article className="card">
  <a href={`/articles/${article.slug}`}>
    <div className="card-img-wrap ratio-4-3">
      <Image src={article.coverImageUrl} fill />
    </div>
    <p className="card-meta-sm">
      <span>{article.category}</span>
      <span className="card-sep">/</span>
      <span>by {article.supplier.name}</span>
    </p>
    <h3 className="card-title">{article.title}</h3>
  </a>
</article>
```

**Что убирается из карточек:**
- `box-shadow` — убрать полностью
- `border` и `border-radius` на карточке — убрать
- `excerpt` текст — убрать (только заголовок)
- Бейдж-пилюли категорий с цветными фонами — заменить на plain text с мутным цветом
- Кнопки "Read more" — убрать (вся карточка кликабельна)

**Hover на карточке:**
```css
.card-img-wrap img {
  transition: transform 0.4s ease;
}
.card:hover .card-img-wrap img {
  transform: scale(1.03);
}
.card-title {
  transition: opacity 0.2s;
}
.card:hover .card-title {
  opacity: 0.6;
}
```

### 5.3. Рубричные секции — замена иконок

**Было:** `<h2>Popular Categories</h2>` + 6 ячеек с иконками SVG + название + описание

**Стало:** Секции с названием в слэш-стиле, каждая показывает 3 свежие статьи из рубрики

```
/ destinations                                        [view all →]
──────────────────────────────────────────────────────────────────
[карточка]          [карточка]          [карточка]

/ boats                                               [view all →]
──────────────────────────────────────────────────────────────────
[карточка]          [карточка]          [карточка]
```

**Секция рубрики — компонент:**
```tsx
function CategorySection({ slug, articles }) {
  return (
    <section className="category-section">
      <div className="section-header">
        <SectionHeading>/ {slug}</SectionHeading>
        <Link href={`/${slug}`} className="view-all">view all →</Link>
      </div>
      <div className="cards-grid-3">
        {articles.map(a => <ArticleCard key={a.id} article={a} />)}
      </div>
    </section>
  )
}
```

```css
.category-section {
  padding: 3rem 0;
  border-top: 1px solid var(--color-border);
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1.5rem;
}
.view-all {
  font: 400 0.875rem/1 var(--font-body);
  color: var(--color-text-muted);
  text-decoration: none;
}
.view-all:hover { color: var(--color-text); }
.cards-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
}
```

### 5.4. "/ suppliers" — замена блока "Our Suppliers"

**Было:** список с аватарами, текстом, тегами — выглядит как список контактов

**Стало:** горизонтальный скролл или сетка 3 колонки, карточки — только лого + название + тип + регионы

```tsx
<section className="category-section">
  <div className="section-header">
    <SectionHeading>/ suppliers</SectionHeading>
    <Link href="/suppliers" className="view-all">view all →</Link>
  </div>
  <div className="cards-grid-3">
    {suppliers.map(s => (
      <Link key={s.id} href={`/suppliers/${s.slug}`} className="supplier-card">
        <div className="supplier-logo">
          {s.logoUrl ? <Image src={s.logoUrl} /> : <span>{s.name[0]}</span>}
        </div>
        <div>
          <p className="supplier-type">{s.type}</p>   {/* оранжевым */}
          <h3 className="supplier-name">{s.name}</h3>
          <p className="supplier-regions">{s.regions.join(' · ')}</p>
        </div>
      </Link>
    ))}
  </div>
</section>
```

```css
.supplier-card {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
  text-decoration: none;
  color: inherit;
  padding: 1.25rem 0;
  border-top: 1px solid var(--color-border);
}
.supplier-card:hover .supplier-name { opacity: 0.5; }
.supplier-logo {
  width: 48px; height: 48px;
  border: 1px solid var(--color-border);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.supplier-type {
  font: 400 0.75rem/1 var(--font-body);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  margin-bottom: 0.25rem;
}
.supplier-name {
  font: 500 1rem/1.3 var(--font-body);
  transition: opacity 0.2s;
}
.supplier-regions {
  font: 300 0.8rem/1 var(--font-body);
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}
```

### 5.5. Статистика — убрать или трансформировать

**Было:** `bg-navy` блок с 3 крупными цифрами на тёмном фоне

**Стало:** тонкая строка-разделитель между секциями (или убрать совсем)

```tsx
<div className="stats-row">
  <div className="stat">
    <span className="stat-num">{articlesCount}</span>
    <span className="stat-label">published articles</span>
  </div>
  <div className="stat">
    <span className="stat-num">{suppliersCount}</span>
    <span className="stat-label">trusted suppliers</span>
  </div>
  <div className="stat">
    <span className="stat-num">{destinationsCount}</span>
    <span className="stat-label">sailing destinations</span>
  </div>
</div>
```

```css
.stats-row {
  display: flex;
  gap: 4rem;
  padding: 2.5rem 0;
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
}
.stat-num {
  font: 300 2.5rem/1 var(--font-display);
  display: block;
}
.stat-label {
  font: 400 0.8rem/1 var(--font-body);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}
```

### 5.6. CTA-секция "Join BOATTOMORROW"

**Было:** `bg-navy`, крупный заголовок, белый текст, кнопка

**Стало:** `bg: var(--color-bg-alt)`, тонкая рамка, лаконичный текст

```css
.cta-section {
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  padding: 4rem;
  text-align: center;
  margin: 4rem 0;
}
.cta-section h2 {
  font: 300 2rem/1.2 var(--font-display);
  margin-bottom: 0.75rem;
}
.cta-section p {
  color: var(--color-text-muted);
  max-width: 40ch;
  margin: 0 auto 2rem;
}
.btn-primary {
  display: inline-block;
  background: var(--color-accent);
  color: white;
  padding: 0.75rem 2rem;
  font: 500 0.875rem/1 var(--font-body);
  letter-spacing: 0.02em;
  text-decoration: none;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.85; }
```

---

## 6. Страница статьи — изменения

**Было:** заголовок + полная ширина изображение + стандартный body text

**Стало (по образцу room.eu/tomorrow):**

```
Breadcrumb: / destinations / croatia

[Мета: категория / автор / дата]

# Заголовок статьи крупным display serif

──────────────────────────────────────────────────

[Большое изображение — полная ширина контейнера]

Body text — колонка 680px, центрированная, с увеличенным line-height
...

[Inline изображения в тексте — полная ширина колонки]

/ read next                           [view all →]
──────────────────────────────
[3 похожие карточки]
```

**CSS для страницы статьи:**
```css
.article-header {
  max-width: 800px;
  margin: 0 auto;
  padding: 3rem 0 2rem;
}
.article-meta {
  display: flex;
  gap: 1rem;
  font: 400 0.8rem/1 var(--font-body);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 1.5rem;
}
.article-title {
  font: 400 clamp(2rem, 4vw, 3rem)/1.15 var(--font-display);
  letter-spacing: -0.02em;
  margin-bottom: 1rem;
}
.article-cover {
  width: 100%;
  aspect-ratio: 16/9;
  overflow: hidden;
  margin: 2rem 0 3rem;
}
.article-body {
  max-width: 680px;
  margin: 0 auto;
  font: 400 1.125rem/1.75 var(--font-body);
}
.article-body h2 {
  font: 600 1.5rem/1.3 var(--font-display);
  margin: 2.5rem 0 0.75rem;
}
```

**Sidebar убирается с десктопа.** Блок поставщика и форма лида переносятся:
- Профиль поставщика — после заголовка, тонкая строка
- Форма лида — после текста статьи, перед "/ read next"

---

## 7. Страница рубрики (/destinations, /boats, ...)

**Было:** hero-баннер рубрики + фильтры + карточки

**Стало:**
```
/ destinations                          [фильтры как inline chips, без рамок]

──────────────────────────────────────────────────────────────────────
[Featured статья — горизонтальная: 60% фото | 40% текст]
──────────────────────────────────────────────────────────────────────
[карточка]   [карточка]   [карточка]
[карточка]   [карточка]   [карточка]
```

**Фильтры — inline стиль (не dropdown-кнопки):**
```tsx
<div className="filters">
  {regions.map(r => (
    <button
      key={r}
      className={`filter-chip ${active === r ? 'active' : ''}`}
    >
      {r}
    </button>
  ))}
</div>
```

```css
.filters { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 2rem; }
.filter-chip {
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--color-border);
  background: transparent;
  font: 400 0.8rem/1 var(--font-body);
  cursor: pointer;
  transition: all 0.15s;
}
.filter-chip:hover,
.filter-chip.active {
  background: var(--color-text);
  color: var(--color-bg);
  border-color: var(--color-text);
}
```

---

## 8. Footer

**Было:** тёмный navy footer с 4 колонками

**Стало:** светлый, минималистичный

```
──────────────────────────────────────────────
BOAT TOMORROW                    subscribe →

Explore            For Suppliers      Contact
Destinations       Join as Supplier   info@boattomorrow.com
Boats              Supplier Login
Learning           All Suppliers
Routes
Tips

──────────────────────────────────────────────
© 2025 BOATTOMORROW. All rights reserved.
```

```css
footer {
  background: var(--color-bg);
  border-top: 1px solid var(--color-border);
  padding: 4rem 0 2rem;
}
.footer-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 3rem;
}
.footer-links { color: var(--color-text-muted); font-size: 0.875rem; line-height: 2; }
.footer-links a:hover { color: var(--color-text); }
.footer-bottom {
  border-top: 1px solid var(--color-border);
  padding-top: 1.5rem;
  font: 400 0.75rem/1 var(--font-body);
  color: var(--color-text-muted);
}
```

---

## 9. Форма лидогенерации — визуальное обновление

**Было:** синий sidebar-блок с фоном, похожий на рекламный баннер

**Стало:** минималистичный, встроенный в поток страницы

```
──────────────────────────────────
Интересует яхта в этом регионе?

[Имя ___________________________]
[Email __________________________]
[Даты ___________________________]
[Кол-во человек _________________]

                    Отправить заявку →
──────────────────────────────────
```

```css
.lead-form-section {
  border-top: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  padding: 2.5rem 0;
  margin: 3rem 0;
}
.lead-form-section h3 {
  font: 400 1.5rem/1.2 var(--font-display);
  margin-bottom: 1.5rem;
}
.lead-form input,
.lead-form textarea {
  width: 100%;
  border: none;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  padding: 0.75rem 0;
  font: 400 1rem/1 var(--font-body);
  margin-bottom: 0.5rem;
  outline: none;
  transition: border-color 0.2s;
}
.lead-form input:focus,
.lead-form textarea:focus {
  border-bottom-color: var(--color-text);
}
.lead-form-submit {
  display: flex;
  justify-content: flex-end;
  margin-top: 1.5rem;
}
```

---

## 10. Анимации и micro-interactions

Минимально, но выверенно:

```css
/* Страница загружается: staggered fade-up для секций */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
.section-animate {
  animation: fadeUp 0.5s ease both;
}
.section-animate:nth-child(1) { animation-delay: 0s; }
.section-animate:nth-child(2) { animation-delay: 0.1s; }
.section-animate:nth-child(3) { animation-delay: 0.2s; }

/* Изображения: overflow hidden + scale на hover */
.card-img-wrap { overflow: hidden; }
.card-img-wrap img { transition: transform 0.5s ease; }
.card:hover .card-img-wrap img { transform: scale(1.04); }

/* Ссылки: нет underline по умолчанию, есть на hover */
a { text-decoration: none; }
a:hover { text-decoration: underline; text-underline-offset: 3px; }

/* Navbar: граница появляется при скролле */
.navbar { transition: border-bottom-color 0.2s; border-bottom: 1px solid transparent; }
.navbar.scrolled { border-bottom-color: var(--color-border); }
```

---

## 11. Tailwind-конфиг (если используется Tailwind)

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        bg:       '#FAFAF8',
        'bg-alt': '#F2F1ED',
        text:     '#111111',
        muted:    '#777777',
        border:   '#E5E4DF',
        accent:   '#E8500A',
      },
      fontFamily: {
        display: ['Playfair Display', 'Georgia', 'serif'],
        body:    ['DM Sans', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2.5rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
        'display-md': ['1.75rem', { lineHeight: '1.3' }],
      },
    },
  },
}
```

---

## 12. Чек-лист изменений для разработки

### Глобальные изменения
- [ ] Подключить Google Fonts: Playfair Display + DM Sans
- [ ] Обновить `tailwind.config.js` с новыми токенами
- [ ] Создать CSS переменные в `globals.css`
- [ ] Убрать все `bg-navy` / `bg-blue-*` классы из глобальных стилей

### Компоненты
- [ ] `Navbar` — убрать синюю кнопку, сделать transparent + scroll border
- [ ] `SectionHeading` — новый компонент со слэш-префиксом
- [ ] `ArticleCard` — убрать тени, бордер-радиус, excerpt; оставить img + meta + title
- [ ] `SupplierCard` — горизонтальный лейаут: лого + type (акцент) + name + regions
- [ ] `LeadForm` — underline inputs, без box-styling
- [ ] `Footer` — светлый, убрать тёмный фон

### Страницы
- [ ] `page.tsx` (главная) — новый hero (2 колонки), убрать icon-grid, добавить слэш-секции
- [ ] `articles/[slug]` — центрированная колонка 680px, убрать sidebar
- [ ] `[category]/page.tsx` — убрать hero-баннер, добавить inline filters
- [ ] Stats блок — убрать navy фон, сделать светлую строку
- [ ] CTA секция — убрать navy фон, использовать `bg-alt`

---

*BOATTOMORROW Design Refinement TZ v1.0*
