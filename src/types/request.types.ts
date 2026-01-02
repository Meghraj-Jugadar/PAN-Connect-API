export interface CreateUserRequest {
  Body: {
    name?: string;
    email: string;
    password: string;
  };
}

export interface LoginRequest {
  Body: {
    email: string;
    password: string;
  };
}
