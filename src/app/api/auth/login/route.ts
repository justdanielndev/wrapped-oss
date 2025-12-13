import { NextResponse } from 'next/server';
import { SLACK_CLIENT_ID, SLACK_SCOPES, SLACK_TEAM_ID } from '@/lib/config';

const REDIRECT_URI = 'https://wrapped.isitzoe.dev/api/auth/callback/slack';

export async function GET() {
  const url = `https://hackclub.slack.com/oauth/v2/authorize?client_id=${SLACK_CLIENT_ID}&user_scope=${SLACK_SCOPES}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&team=${SLACK_TEAM_ID}`;
  return NextResponse.redirect(url);
}
