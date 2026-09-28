import type { Role } from './auth-context';

export function homeForRole(role: Role): string {
  return role === 'DRIVER' ? '/driver' : '/passenger/rides/new';
}