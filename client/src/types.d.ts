export interface LoginProps {
  email: string;
  password: string;
}

export interface SignupProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
}
