# React + TypeScript + Vite

# React UI-kit

## Создание проекта

```js
npm create vite@latest
```

## Подключение tailwindcss

```js
npm install tailwindcss postcss autoprefixer
```

```js
npx tailwindcss init -p
```

Отредактируйте **tailwind.config.js**, чтобы включить:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

src/index.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Оптимизация настроек Tailwind для производства

Tailwind позволяет вам удалить все неиспользуемые CSS, чтобы вы могли отправлять свой проект без каких-либо дополнительных наворотов.

Чтобы настроить это, отредактируйте свой **postcss.config.js** с помощью:

```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    ...(process.env.NODE_ENV === "production"
      ? {
          cssnano: {},
        }
      : {}),
  },
};
```

# Добавление темной темы

## Добавление различного представления цветов

Создаем файл **./src/styles/palette/theme-[тип темы].css** добавляем переменные палитры

```css
@import 'tailwindcss/base';

@layer base {
  :root[data-theme~="dark"] {
    --color-primary: #43ee00;
    --color-primary-100: #cce3fd;
  }
}
```

и для базового типа
```css
@import 'tailwindcss/base';

@layer base {
  :root {
    --color-primary: #006FEE;
    --color-primary-100: #cce3fd;
  }
}
```


Далее добавляем файл **./src/config/colors.ts** 
Далее этот объект будет разименован в theme.extend.colors
```js
export default {
  primary: {
    DEFAULT: "var(--color-primary)",
    100: "var(--color-primary-100)",
  },
};
```

В файле tailwind.config.js добавляем следующий фрагмент
```js
import customColors from "./src/config/colors.ts";

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "data-theme",
  theme: {
    extend: {
      colors: {
        ...customColors,
      },
    },
  }
};
```



