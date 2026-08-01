import {
  Briefcase,
  Building2,
  Car,
  CircleDashed,
  Clapperboard,
  Dumbbell,
  Gift,
  GraduationCap,
  HeartPulse,
  Home,
  Laptop,
  Plane,
  ShoppingBag,
  Utensils,
  Zap,
} from 'lucide-react';

// Ramp from the redesign: brand green stepping down into a neutral tail.
export const PALETTE = ['#049D66', '#1FAF74', '#57C492', '#8FD8B6', '#C3EAD8', '#9AA6AF'];

// Matched on a lowercased substring so user-created categories ("Food & dining",
// "Groceries", "Cab rides") land on a sensible glyph instead of the fallback.
const ICON_RULES = [
  [['food', 'dining', 'grocer', 'restaurant', 'meal', 'coffee'], Utensils],
  [['transport', 'travel', 'cab', 'taxi', 'fuel', 'petrol', 'car'], Car],
  [['flight', 'trip', 'holiday', 'vacation'], Plane],
  [['rent', 'housing', 'home', 'mortgage'], Home],
  [['entertain', 'movie', 'cinema', 'stream', 'game'], Clapperboard],
  [['utilit', 'electric', 'water', 'internet', 'broadband', 'bill', 'phone'], Zap],
  [['health', 'medical', 'doctor', 'pharmac', 'insurance'], HeartPulse],
  [['fitness', 'gym', 'sport'], Dumbbell],
  [['shop', 'cloth', 'apparel'], ShoppingBag],
  [['education', 'course', 'school', 'tuition', 'book'], GraduationCap],
  [['gift', 'donation', 'charity'], Gift],
  [['salary', 'payroll', 'wage'], Briefcase],
  [['freelance', 'consult', 'contract'], Laptop],
  [['business', 'invest', 'dividend', 'rental income'], Building2],
];

export const categoryIcon = (name) => {
  const key = (name || '').toLowerCase();
  const match = ICON_RULES.find(([needles]) => needles.some((n) => key.includes(n)));
  return match ? match[1] : CircleDashed;
};

// Stable colour for a category name — the same category keeps its swatch whether
// it shows up in the donut, the ledger table or a budget bar.
export const buildColorMap = (names) => {
  const map = {};
  names.forEach((name, index) => {
    map[name] = PALETTE[index % PALETTE.length];
  });
  return map;
};

export const colorForIndex = (index) => PALETTE[index % PALETTE.length];
