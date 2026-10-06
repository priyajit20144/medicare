import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { ENV } from '../config/env';
import { UserRole } from '../models/User';

export interface TokenPayload {
  userId: string;
  role: UserRole;
  email: string;
  auth0Id?: string;
  isAuth0?: boolean;
}

let jwksClientInstance: jwksRsa.JwksClient | null = null;

function getJwksClient(domain: string): jwksRsa.JwksClient {
  if (!jwksClientInstance) {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    jwksClientInstance = jwksRsa({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
      jwksUri: `https://${cleanDomain}/.well-known/jwks.json`,
    });
  }
  return jwksClientInstance;
}

export function generateToken(payload: TokenPayload): string {
  if (!ENV.JWT_SECRET || ENV.JWT_SECRET === 'REPLACE_WITH_YOUR_JWT_SECRET') {
    if (ENV.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be configured in production!');
    }
  }

  return jwt.sign(payload, ENV.JWT_SECRET, {
    expiresIn: ENV.JWT_EXPIRES_IN as any,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, ENV.JWT_SECRET) as TokenPayload;
}

export async function verifyAuth0Token(token: string): Promise<any> {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === 'string' || !decoded.header.kid) {
    throw new Error('Invalid Auth0 token format: missing Key ID (kid) in header');
  }

  if (!ENV.AUTH0_DOMAIN) {
    throw new Error('AUTH0_DOMAIN is not configured in .env. Please provide your Auth0 Tenant Domain.');
  }

  const client = getJwksClient(ENV.AUTH0_DOMAIN);
  const key = await client.getSigningKey(decoded.header.kid);
  const signingKey = key.getPublicKey();

  const options: jwt.VerifyOptions = {
    algorithms: ['RS256'],
  };

  if (ENV.AUTH0_AUDIENCE) {
    options.audience = ENV.AUTH0_AUDIENCE;
  }
  if (ENV.AUTH0_ISSUER_URL) {
    options.issuer = ENV.AUTH0_ISSUER_URL;
  }

  return jwt.verify(token, signingKey, options);
}

export async function verifyTokenUnified(token: string): Promise<TokenPayload> {
  const decoded = jwt.decode(token, { complete: true }) as any;

  // Check if token was signed using Auth0 RS256 algorithm
  if (decoded?.header?.alg === 'RS256') {
    const auth0Payload = await verifyAuth0Token(token);
    const role: UserRole =
      auth0Payload['https://medicare.com/role'] ||
      auth0Payload['http://localhost:5000/role'] ||
      (auth0Payload.permissions?.includes('admin') ? 'ADMIN' : 'USER');

    const email =
      auth0Payload.email ||
      auth0Payload['https://medicare.com/email'] ||
      `${auth0Payload.sub?.replace(/[^a-zA-Z0-9]/g, '_')}@auth0.user`;

    return {
      userId: auth0Payload.sub,
      auth0Id: auth0Payload.sub,
      role,
      email,
      isAuth0: true,
    };
  }

  // Fallback to Native Medicare HS256 JWT
  return verifyToken(token);
}
