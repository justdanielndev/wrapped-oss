import { NextResponse } from 'next/server';
import { SLACK_CLIENT_ID, SLACK_CLIENT_SECRET } from '@/lib/config';

const REDIRECT_URI = 'https://wrapped.isitzoe.dev/api/auth/callback/slack';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'No code provided' }, { status: 400 });
  }

  try {
    const response = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: SLACK_CLIENT_ID,
        client_secret: SLACK_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (!data.ok) {
      return NextResponse.json({ error: data.error }, { status: 400 });
    }

    const authedUser = data.authed_user;
    const token = authedUser?.access_token;
    const userId = authedUser?.id;

    if (!token) {
      return NextResponse.json({ error: 'No access token received' }, { status: 400 });
    }

    const res = NextResponse.redirect(new URL('/', 'https://wrapped.isitzoe.dev'));

    res.cookies.set('slack_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set('slack_user_id', userId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;

  } catch (error) {
    console.error('OAuth error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
