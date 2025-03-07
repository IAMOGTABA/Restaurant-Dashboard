export type UserRole = 'OWNER' | 'MANAGER' | 'KITCHEN' | 'BAR' | 'WAITER' | 'RECEPTIONIST' | 'SHISHA';

export type AuthUser = {
  id: string;
  username: string;
  name: string;
  email: string;
  role: UserRole;
  active: boolean;
}

export type LoginCredentials = {
  username: string;
  password: string;
}

export type SignupCredentials = {
  username: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
} 