import {
  Armchair,
  BookOpen,
  Camera,
  Dumbbell,
  Gift,
  Headphones,
  HeartPulse,
  Laptop,
  Shirt,
  Smartphone,
  Sparkles,
  Utensils,
  Watch,
} from 'lucide-react';
export function CategoryIcon({ name, className = 'size-7' }: { name: string; className?: string }) {
  const key = name.toLowerCase();
  const Icon = /phone|mobile/.test(key)
    ? Smartphone
    : /computer|laptop|electronic/.test(key)
      ? Laptop
      : /audio|headphone/.test(key)
        ? Headphones
        : /cloth|fashion|apparel/.test(key)
          ? Shirt
          : /home|furniture|living/.test(key)
            ? Armchair
            : /beauty|cosmetic/.test(key)
              ? Sparkles
              : /sport|fitness/.test(key)
                ? Dumbbell
                : /health/.test(key)
                  ? HeartPulse
                  : /watch|accessor/.test(key)
                    ? Watch
                    : /book/.test(key)
                      ? BookOpen
                      : /camera/.test(key)
                        ? Camera
                        : /kitchen|food/.test(key)
                          ? Utensils
                          : Gift;
  return <Icon className={className} strokeWidth={1.5} aria-hidden="true" />;
}
