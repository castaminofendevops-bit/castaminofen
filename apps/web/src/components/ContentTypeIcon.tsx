interface ContentTypeIconProps {
  type: string;
  size?: number;
}

const ICONS: Record<string, { path: string; label: string }> = {
  PODCAST: {
    label: 'پادکست',
    path: 'M12 14a3 3 0 0 0 3-3V5a3 3 0 1 0-6 0v6a3 3 0 0 0 3 3zm6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
  },
  AUDIOBOOK: {
    label: 'کتاب صوتی',
    path: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z',
  },
  VIDEO: {
    label: 'ویدیو',
    path: 'M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14M5 18h8a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2z',
  },
};

const DEFAULT = {
  label: 'محتوا',
  path: 'M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zm12-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z',
};

export function ContentTypeIcon({ type, size = 40 }: ContentTypeIconProps) {
  const icon = ICONS[type] || DEFAULT;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="content-type-icon"
    >
      <title>{icon.label}</title>
      <path d={icon.path} />
    </svg>
  );
}
