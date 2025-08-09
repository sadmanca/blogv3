export type ThumbnailColors = {
  iconLight:  string;
  iconDark:   string;
  bgLight:    string;
  bgDark:     string;
};

export function getThumbnailColors(data: Record<string, any>): ThumbnailColors {
  const theme: 'dark-on-light' | 'light-on-dark' =
    data.thumbnailTheme === 'light-on-dark' ? 'light-on-dark' : 'dark-on-light';

  const defaults = {
    'dark-on-light': { icon: '#374151', bg: '#f3f4f6' }, // gray-700 / gray-100
    'light-on-dark': { icon: '#f9fafb', bg: '#374151' }, // gray-50  / gray-700
  }[theme];

  const iconLight = data.thumbnailIconColor      ?? defaults.icon;
  const iconDark  = data.thumbnailIconColorDark  ?? iconLight;
  const bgLight   = data.thumbnailBgColor        ?? defaults.bg;
  const bgDark    = data.thumbnailBgColorDark    ?? bgLight;

  return { iconLight, iconDark, bgLight, bgDark };
}
