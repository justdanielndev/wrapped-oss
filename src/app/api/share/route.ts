import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createShare, deleteShare, getShareByUserId } from '@/lib/share';
import { getUserData } from '@/lib/waitlist';

export async function GET() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('slack_user_id')?.value;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const publicId = await getShareByUserId(userId);
    return NextResponse.json({ publicId });
}

export async function POST() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('slack_user_id')?.value;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await getUserData(userId);
    
    if (!data || data.status !== 'completed') {
        return NextResponse.json({ error: 'Data not ready' }, { status: 400 });
    }
    
    const publicId = await createShare(userId, data);
    
    if (!publicId) {
        return NextResponse.json({ error: 'Failed to create share' }, { status: 500 });
    }

    return NextResponse.json({ publicId });
}

export async function DELETE() {
    const cookieStore = await cookies();
    const userId = cookieStore.get('slack_user_id')?.value;

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await deleteShare(userId);
    
    if (!success) {
        return NextResponse.json({ error: 'Failed to delete share' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
