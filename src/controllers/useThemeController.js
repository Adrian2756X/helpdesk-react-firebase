/**
 * CONTROLLER — useThemeController
 * Responsabilidad: Gestionar el estado del tema (dark/light) y su persistencia.
 * Aplica el atributo data-theme al DOM como efecto secundario.
 */

import { useState, useEffect } from 'react';

const THEME_KEY = 'helpdesk_theme';

export function useThemeController() {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem(THEME_KEY) || 'dark';
  });

  // Efecto: sincroniza el estado React con el atributo del DOM y localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme };
}
