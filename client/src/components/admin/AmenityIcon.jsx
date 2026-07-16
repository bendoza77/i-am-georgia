import {
  Wifi,
  Waves,
  Sparkles,
  UtensilsCrossed,
  Wine,
  Car,
  Dumbbell,
  Plane,
  PawPrint,
  Mountain,
  Flame,
  ConciergeBell,
  Snowflake,
  Coffee,
} from 'lucide-react';

const MAP = {
  wifi: Wifi,
  pool: Waves,
  spa: Sparkles,
  restaurant: UtensilsCrossed,
  bar: Wine,
  parking: Car,
  gym: Dumbbell,
  shuttle: Plane,
  pet: PawPrint,
  view: Mountain,
  wine: Wine,
  fireplace: Flame,
  concierge: ConciergeBell,
  ski: Snowflake,
  breakfast: Coffee,
};

export default function AmenityIcon({ name, ...props }) {
  const Cmp = MAP[name] ?? Sparkles;
  return <Cmp {...props} />;
}
