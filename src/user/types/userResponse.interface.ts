export interface UserResponse {
  id: number;
  email: string;
  username: string;
  bio?: string;
  image?: string;
  token: string;
}

export interface UserResponseInterface {
  user: UserResponse;
}
