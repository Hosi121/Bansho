import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from 'jwt-decode';

export function middleware(request: NextRequest) {
    // 公開ルートのチェック
    if (request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/register')) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token');

    // 認証が必要なルートでトークンがない場合
    if (!token) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // ユーザー固有のルートの場合の追加チェック
    if (request.nextUrl.pathname.startsWith('/users/')) {
        const userId = request.nextUrl.pathname.split('/')[2];
        try {
            const decoded = jwtDecode(token.value);
            if (decoded.sub !== userId) {
                return NextResponse.redirect(new URL('/', request.url));
            }
        } catch {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/users/:path*',
        '/workspace',
        '/settings',
    ]
};