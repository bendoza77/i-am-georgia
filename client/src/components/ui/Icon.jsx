import {
  Compass,
  Route,
  HeartHandshake,
  ShieldCheck,
  Sparkles,
  Leaf,
  Gem,
  Users,
  Wine,
  Mountain,
  Landmark,
  Utensils,
  Trees,
  Snowflake,
  Star,
  Clock,
  Gauge,
  CalendarDays,
  MapPin,
  ArrowRight,
  ArrowUpRight,
  Plane,
} from 'lucide-react';

const MAP = {
  compass: Compass,
  route: Route,
  'heart-handshake': HeartHandshake,
  'shield-check': ShieldCheck,
  sparkles: Sparkles,
  leaf: Leaf,
  gem: Gem,
  users: Users,
  wine: Wine,
  mountain: Mountain,
  landmark: Landmark,
  utensils: Utensils,
  trees: Trees,
  snowflake: Snowflake,
  star: Star,
  clock: Clock,
  gauge: Gauge,
  calendar: CalendarDays,
  pin: MapPin,
  arrow: ArrowRight,
  'arrow-up-right': ArrowUpRight,
  plane: Plane,
};

/**
 * Render a lucide icon by name (keeps data serializable).
 */
export default function Icon({ name, ...props }) {
  const Cmp = MAP[name] ?? Sparkles;
  return <Cmp {...props} />;
}
