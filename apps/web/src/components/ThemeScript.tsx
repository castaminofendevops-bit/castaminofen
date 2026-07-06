/** Prevents flash of wrong theme before React hydrates */
export function ThemeScript() {
  const script = `
(function () {
  try {
    var key = 'castaminofen-theme';
    var stored = localStorage.getItem(key);
    var theme = stored === 'light' || stored === 'dark' ? stored : 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
