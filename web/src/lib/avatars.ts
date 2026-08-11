import type { LucideIcon } from 'lucide-react'
import {
  GraduationCap,
  BookOpen,
  Laptop,
  Bird,
  Cat,
  Dog,
  Rabbit,
  Bot,
  FlaskConical,
  Palette,
  Rocket,
  Star,
  Book,
  Trophy,
  Globe,
  Fish,
} from 'lucide-react'

export interface Avatar {
  id: string
  icon: LucideIcon
  label: string
}

export const AVATARS: Avatar[] = [
  { id: 'graduate', icon: GraduationCap, label: 'Graduate' },
  { id: 'student', icon: BookOpen, label: 'Student' },
  { id: 'laptop', icon: Laptop, label: 'Laptop' },
  { id: 'bird', icon: Bird, label: 'Bird' },
  { id: 'cat', icon: Cat, label: 'Cat' },
  { id: 'dog', icon: Dog, label: 'Dog' },
  { id: 'rabbit', icon: Rabbit, label: 'Rabbit' },
  { id: 'robot', icon: Bot, label: 'Robot' },
  { id: 'science', icon: FlaskConical, label: 'Science' },
  { id: 'art', icon: Palette, label: 'Art' },
  { id: 'rocket', icon: Rocket, label: 'Rocket' },
  { id: 'star', icon: Star, label: 'Star' },
  { id: 'book', icon: Book, label: 'Books' },
  { id: 'trophy', icon: Trophy, label: 'Trophy' },
  { id: 'globe', icon: Globe, label: 'Globe' },
  { id: 'fish', icon: Fish, label: 'Fish' },
]
