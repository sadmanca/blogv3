@reference './global.css';

@layer base {
  p,
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply wrap-break-word;
  }

  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    @apply text-balance;
  }

  p {
    @apply text-pretty;
  }
}

@layer components {
  .prose {
    @apply text-foreground text-lg leading-[1.65rem] tracking-[0.3px];
    @apply [&>link[rel="stylesheet"]+*]:mt-0! [&>link[rel="stylesheet"]+*>*]:mt-0!;

    :where(p):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply text-foreground/80 my-6;
    }

    :where(h1, h2, h3, h4, h5, h6):not(
        :where([class~='not-prose'], [class~='not-prose'] *)
      ) {
      @apply text-foreground scroll-mt-32 font-medium xl:scroll-mt-20 tracking-tight;
      /* font-family: 'Handjet', ui-sans-serif, system-ui, sans-serif; */
      position: relative;
    }

    /* H1 - Largest pixels, least width */
    :where(h1):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply mt-4 mb-2 py-4 text-8xl font-bold leading-[4.5rem]; 
      /* @apply bg-ring/40; */
      padding-left: 2.5rem;
    }

    :where(h1):not(:where([class~='not-prose'], [class~='not-prose'] *))::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 1rem;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8' fill='%23878787'%3E%3Crect x='0' y='0' width='4' height='4'/%3E%3Crect x='4' y='4' width='4' height='4'/%3E%3C/svg%3E");
      background-size: 1rem 1rem;
      background-repeat: repeat-y;
      background-position: left top;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      filter: contrast(2);
    }

    /* H2 - Large pixels, small width */
    :where(h2):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply mt-6 py-2 -mb-2 text-5xl font-black leading-[2.7rem];
      /* @apply bg-accent; */
      padding-left: 1.8rem;
    }

    :where(h2):not(:where([class~='not-prose'], [class~='not-prose'] *))::before {
      content: '';
      position: absolute;
      inset: 0 auto 0 0;
      width: 0.75rem;
      height: 100%;
      background-color: var(--h2-bar);
      @apply rounded-r-xl;
    }

    /* H3 - Medium pixels, medium width */
    :where(h3):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply mt-6 py-1 -mb-2 text-4xl font-extrabold leading-[2rem] text-foreground/80;
      padding-left: 3.25rem;
    }

    :where(h3):not(:where([class~='not-prose'], [class~='not-prose'] *))::before {
      content: '';
      position: absolute;
      inset: 0 auto 0 0;
      width: 2.25rem;
      height: 100%;
      background-color: var(--h3-bar);
      @apply rounded-r-lg;
    }

    /* H4 - Smaller pixels, more width */
    :where(h4):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply -mt-2 -mb-2 text-3xl font-bold leading-[2rem] text-foreground/55;
      padding-left: 5.5rem;
    }

    :where(h4):not(:where([class~='not-prose'], [class~='not-prose'] *))::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 4.5rem;
      height: 90%;
      background-color: var(--h4-bar);
      @apply rounded-r-lg;
      transform: translateY(-50%);
    }
    
    :where(h5):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply mt-5 mb-3 text-2xl font-semibold text-foreground/50;
      padding-left: 8rem;
    }

    :where(h5):not(:where([class~='not-prose'], [class~='not-prose'] *))::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 7.25rem;
      height: 60%;
      background-color: var(--h5-bar);
      @apply rounded-r-lg;
      transform: translateY(-50%);
    }
  
   :where(h6):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply mt-5 mb-3 text-2xl font-normal;
      position: relative;
      padding-left: 8.5rem;
    }

    :where(h6):not(:where([class~='not-prose'], [class~='not-prose'] *))::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      width: 7.25rem;
      height: 40%;
      background-color: var(--h6-bar);                                       
      @apply rounded-r-lg;
      transform: translateY(-50%);      
    }

/*
    :where(h6):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply mt-5 mb-3 text-2xl font-semibold;
      padding-left: 7rem;
    }

    :where(h6):not(:where([class~='not-prose'], [class~='not-prose'] *))::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 6rem;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 10' fill='%23878787'%3E%3Crect x='0' y='0' width='1' height='1'/%3E%3Crect x='2' y='0' width='1' height='1'/%3E%3Crect x='4' y='0' width='1' height='1'/%3E%3Crect x='6' y='0' width='1' height='1'/%3E%3Crect x='8' y='0' width='1' height='1'/%3E%3Crect x='10' y='0' width='1' height='1'/%3E%3Crect x='12' y='0' width='1' height='1'/%3E%3Crect x='14' y='0' width='1' height='1'/%3E%3Crect x='16' y='0' width='1' height='1'/%3E%3Crect x='18' y='0' width='1' height='1'/%3E%3Crect x='1' y='1' width='1' height='1'/%3E%3Crect x='19' y='1' width='1' height='1'/%3E%3C/svg%3E");
      background-size: 0.15rem 0.05rem;
      background-repeat: repeat;
      background-position: left top;
      image-rendering: pixelated;
      image-rendering: -moz-crisp-edges;
      image-rendering: crisp-edges;
      filter: contrast(2);
    }
*/

    :where(a):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      /* @apply text-secondary-foreground bg-border decoration-muted-foreground hover:text-foreground hover:decoration-foreground font-medium break-words underline underline-offset-[3px] transition-colors; */
      @apply text-secondary-foreground decoration-muted-foreground hover:text-background hover:text-background hover:bg-primary font-medium break-words underline underline-offset-[3px] transition-colors p-[2.5px] duration-0;
    }

    :where(strong):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply text-foreground font-medium;
    }

    :where(ul):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply marker:text-foreground/30 my-5 ml-6 list-disc [&>li]:mt-2;
    }

    :where(ol):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply marker:text-foreground/30 my-5 ml-6 list-decimal [&>li]:mt-2;
      @apply [&[type='A']]:list-[upper-alpha] [&[type='I']]:list-[upper-roman] [&[type='a']]:list-[lower-alpha] [&[type='i']]:list-[lower-roman];
    }

    :where(li):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply text-foreground/80 pl-2 [&>p]:my-0;
    }

    :where(ul ul, ol ol, ul ol, ol ul):not(
        :where([class~='not-prose'], [class~='not-prose'] *)
      ) {
      @apply marker:text-foreground/30 my-2 ml-6;
    }

    :where(code):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply bg-muted/50 text-foreground relative rounded-sm px-[0.3rem] py-[0.2rem] text-sm font-medium break-words;
      @apply [&>span[data-line='']>*]:text-(--shiki-light) dark:[&>span[data-line='']>*]:text-(--shiki-dark);
    }

    :where(blockquote):not(
        :where([class~='not-prose'], [class~='not-prose'] *)
      ) {
      @apply [&_*]:text-muted-foreground small my-6 border-l-2 pl-6;
    }

    :where(hr):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply my-8 border-t;
    }

    :where(table):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply mx-auto my-6 text-sm;
      display: table;
      width: 100%;
      table-layout: auto;
      text-align: start;
      margin-top: 0em;
      margin-bottom: 0em;
      font-size: 0.875em;
      min-width: 100%;
    }

    :where(thead):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply border-muted-foreground/30 border-b;
      position: sticky;
      top: 0;
      background-color: hsl(var(--background));
      z-index: 1;
    }

    :where(td):not(:where([class~='not-prose'], [class~='not-prose'] *)),
    :where(th):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      line-height: 1.05;
      word-wrap: break-word;
    }

    table {
      text-indent: 0;
      border-color: inherit;
      border-collapse: collapse;
      width: 100%;
    }

    .table-container {
      overflow-x: auto;
      overflow-y: auto;
      max-height: min(70vh, 600px);
      width: 100%;
      margin: 0 -1em;
      padding-top: 0em;
      padding-bottom: 0em;
      padding-left: 1em;
      padding-right: 1em;
    }

    .dark table thead {
      background-color: hsl(var(--background));
    }

    :where(th):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply px-4 py-2 font-medium;
      @apply text-left [&[align=center]]:text-center [&[align=right]]:text-right;
      line-height: 1.05;
    }

    :where(tr):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply border-muted-foreground/30 border-y first:border-t-0 last:border-b-0;
    }

    :where(td):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply text-foreground/80 small fix-margin px-4 py-2 align-top break-words;
      @apply text-left [&[align=center]]:text-center [&[align=right]]:text-right;
      line-height: 1.05;
    }

    :where(img, video, figure, .expressive-code):not(
        :where([class~='not-prose'], [class~='not-prose'] *)
      ) {
      @apply mx-auto my-6;
    }

    :where(pre):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply max-h-[min(68vh,1000px)]! overflow-y-auto [&::-webkit-scrollbar-corner]:hidden;
    }

    :where(summary):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply [&~*]:small [&~*>*]:first:mt-0! [&~*>*]:last:mb-0!;
    }

    :where(kbd):not(:where([class~='not-prose'], [class~='not-prose'] *)) {
      @apply text-foreground bg-muted rounded-lg border px-2 py-1 text-xs font-medium;
    }

    :where(.katex-display):not(
        :where([class~='not-prose'], [class~='not-prose'] *)
      ) {
      @apply text-foreground/80 my-6 overflow-x-auto overflow-y-hidden py-2 tracking-normal;
    }
  }

  .marquee {
    @apply relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4 -mb-6;
    @apply border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05] active:bg-gray-950/[.1];
    @apply dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15] dark:active:bg-gray-50/[.2];
  }
}

@utility fix-margin {
  @apply [&>*]:first:mt-0! [&>*]:last:mb-0!;
}

@utility small {
  @apply text-sm leading-6 [&_code]:text-xs [&_img,video,figure,details,blockquote,.katex-display,.expressive-code]:my-4! [&_li,ol]:mt-0 [&_p]:my-2! [&_ul]:my-0;
}

figcaption:not(.header) {
  @apply text-base ml-1 -mt-4 text-gray-400 dark:text-gray-400;
}

.heart-invert {
  @apply inline-block filter invert dark:filter-none;
}

.hover-card {
  @apply no-underline transition-all duration-200 ease-in-out rounded-lg;
}

/* Define CSS variables for box-shadow values */
:root {
  --box-shadow-small: 0px 0.1px 0.1px #e9e9e9, 0px 0.1px 0.1px #e8e8e8, 0.1px 0px 0px rgba(0, 0, 0, 0.06);
  --box-shadow-large: 0px 2px 1px #e9e9e9, 0px 3px 1px #e8e8e8, 9px 14px 18px rgba(0, 0, 0, 0.06);
  --translate-y-small: -2px;
  --translate-y-large: -3px;
}

/* Apply the box-shadow and transform based on the container size */
.hover-card:hover {
  @apply z-10 bg-gradient-to-r from-white to-border border border-gray-100 shadow-lg;
  box-shadow: var(--box-shadow-large);
  transform: translateY(var(--translate-y-large));
}

/* Adjust box-shadow and transform for smaller containers */
@media (max-width: 1px) {
  .hover-card:hover {
    box-shadow: var(--box-shadow-small);
    transform: translateY(var(--translate-y-small));
  }
}

.hover-card:active {
  @apply bg-gray-200 border border-gray-400 transition-all duration-100 ease-in;
}

.hover-card.highlight {
  @apply bg-yellow-100 border border-transparent;
}

.hover-card.highlight:hover {
  @apply bg-gradient-to-r from-yellow-100 to-transparent border border-yellow-300 shadow-lg;
  box-shadow: 0px 2px 1px 1px #fff394, 0px 3px 1px 1px #ffe770, 9px 14px 18px rgba(0, 0, 0, 0.06) !important;
}

.hover-card.highlight:active {
  @apply bg-yellow-100 border border-yellow-300;
}

[data-theme='dark'] .hover-card:hover {
  @apply bg-gradient-to-r from-gray-900/80 to-border border border-gray-700;
  box-shadow: 0px 3px 2px #313131, 0px 3px 1px #3a3a3a, 9px 14px 18px rgba(255, 255, 255, 0.08) !important;
}

[data-theme='dark'] .hover-card:active {
  @apply bg-gray-800 border border-gray-600 transition-all duration-100 ease-in;
}

[data-theme='dark'] .hover-card.highlight {
  @apply bg-yellow-900 border border-transparent;
}

[data-theme='dark'] .hover-card.highlight:hover {
  @apply bg-gradient-to-r from-yellow-900 to-transparent border border-yellow-700;
  box-shadow: 0px 2px 1px 1px #7a6f00, 0px 3px 1px 1px #8a7f00, 9px 14px 18px rgba(0, 0, 0, 0.06) !important;
}

[data-theme='dark'] .hover-card.highlight:active {
  @apply bg-yellow-900 border border-yellow-700;
}

.handjet {
  font-family: 'Handjet', ui-sans-serif, system-ui, sans-serif !important;
}