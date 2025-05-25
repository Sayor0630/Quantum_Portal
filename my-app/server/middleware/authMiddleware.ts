import { NextRequest } from 'next/server'; // NextResponse is not used here, but often useful
import jwt from 'jsonwebtoken';
// Commenting out User and dbConnect imports as the DB check is optional and commented out below
// import User from '@/server/models/User'; 
// import dbConnect from '@/server/utils/dbConnect';

const JWT_SECRET = process.env.JWT_SECRET;

export interface AuthenticatedUser {
  id: string;
  roles: string[];
}

interface DecodedToken {
  userId: string; // Ensure this matches the payload key used during token signing
  roles: string[];
  iat: number;
  exp: number;
}

export async function authenticateRequest(req: NextRequest): Promise<{ user?: AuthenticatedUser; error?: string; status?: number }> {
  if (!JWT_SECRET) {
    console.error("JWT_SECRET not defined in environment variables.");
    return { error: 'Authentication configuration error. Please contact support.', status: 500 };
  }

  const authHeader = req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return { error: 'Access denied. No token provided.', status: 401 };
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    // Optional: Check if user still exists and is active in the database
    // This adds a DB hit for every authenticated request but ensures user validity.
    // await dbConnect();
    // const userExists = await User.findById(decoded.userId).lean(); // .lean() for performance
    // if (!userExists) {
    //   return { error: 'User not found or account deactivated.', status: 401 };
    // }
    // If you add the DB check, ensure User model and dbConnect are imported.

    // Ensure the payload structure matches what you expect (e.g., userId from your token)
    if (!decoded.userId) {
        console.error("Token decoded but missing userId field:", decoded);
        return { error: 'Invalid token payload structure.', status: 401 };
    }

    return { user: { id: decoded.userId, roles: decoded.roles || [] } };
  } catch (error: any) {
    console.error('Authentication error:', error.name, error.message);
    if (error.name === 'TokenExpiredError') {
      return { error: 'Access denied. Token has expired.', status: 401 };
    }
    if (error.name === 'JsonWebTokenError') {
      return { error: 'Access denied. Invalid token.', status: 401 };
    }
    // For other errors, it might be a server-side issue with JWT processing
    return { error: 'Authentication failed due to an unexpected error.', status: 500 };
  }
}

export async function adminAuthMiddleware(req: NextRequest): Promise<{ user?: AuthenticatedUser; error?: string; status?: number }> {
  const authResult = await authenticateRequest(req);

  if (authResult.error || !authResult.user) {
    return authResult; // Return error or if user is somehow undefined
  }

  if (!authResult.user.roles.includes('admin')) {
    return { error: 'Access denied. Administrator privileges required.', status: 403 };
  }

  return authResult; // Contains user object if admin
}
