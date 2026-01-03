import jwt, { type JwtPayload } from 'jsonwebtoken';

export class JWTService {
  static generateToken(userId: number, role: string): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    return jwt.sign(
      { userId, role }, 
      secret, 
      { expiresIn: '15m' }
    );
  }

  static verifyToken(token: string): { userId: number; role: string; iat: number; exp: number } {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    
    const decoded = jwt.verify(token, secret) as JwtPayload & { userId: number; role: string };
    
    if (!decoded.iat || !decoded.exp) {
        throw new Error("Invalid token payload");
    }

    return {
      userId: decoded.userId,
      role: decoded.role,
      iat: decoded.iat,
      exp: decoded.exp
    };
  }
}
