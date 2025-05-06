import type { Trait } from './Trait';
import type { Skill } from './Skill';

export interface Role {
  id: number;
  name: string;
  gender: 'Male' | 'Female';
  age: number;
  traits: Trait[];
  skills: Skill[];
  specialtyType?: Skill['type'];
} 