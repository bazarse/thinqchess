// src/components/ThemeRegistry.js
"use client";

import { CacheProvider } from "@emotion/react";
import createEmotionCache from "@/utils/emotionCache";

const cache = createEmotionCache();

export default function ThemeRegistry({ children }) {
  return <CacheProvider value={cache}>{children}</CacheProvider>;
}
