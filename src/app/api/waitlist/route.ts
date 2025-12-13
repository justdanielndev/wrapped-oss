import { NextResponse } from 'next/server';
import { addToWaitlist } from '@/lib/waitlist';
import { processWaitlist } from '@/lib/worker';
import { cookies } from 'next/headers';

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get('slack_token')?.value;
  const userId = cookieStore.get('slack_user_id')?.value;

  if (!token || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const isNoPrivates = cookieStore.get('slack_noprivates')?.value === 'true';
    await addToWaitlist(userId, userId, token, isNoPrivates ? 'noprivates' : 'default');

    processWaitlist().catch(err => console.error('Background processing error:', err));

    return NextResponse.json({
      success: true,
      message: "We'll get your wrapped ready and DM you in Slack once it's done!",
    });
  } catch (error) {
    console.error('Error adding to waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to add to waitlist' },
      { status: 500 }
    );
  }
}
