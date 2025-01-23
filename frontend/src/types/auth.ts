export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
  }

  export interface DecodedToken {
    id: string;
    name: string;
    email: string;
    exp: number;
    iat: number;
  }
  
  
  export interface LoginCredentials {
    email: string;
    password: string;
  }
  
  export interface RegisterCredentials {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
  
  export interface AuthResponse {
    token: string;
    user: User;
  }
  
  // JWTのペイロードの型定義
  export interface JWTPayload {
    sub: string;  // ユーザーID
    email: string;
    name: string;
    exp: number;  // 有効期限のタイムスタンプ
    iat: number;  // 発行時のタイムスタンプ
  }