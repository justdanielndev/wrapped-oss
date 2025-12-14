import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { WrappedData } from '@/types/wrapped';
import { Client, Databases, Query } from 'node-appwrite';
import { getUserData, getUserPosition } from '@/lib/waitlist';
import { getUserClan } from '@/lib/clans';
import { processWaitlist } from '@/lib/worker';

async function slackFetch(endpoint: string, token: string, params: Record<string, string> = {}) {
  const url = new URL(`https://slack.com/api/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  
  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  
  return res.json();
}

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get('slack_token')?.value;
  const userId = cookieStore.get('slack_user_id')?.value;
  const isNoPrivates = cookieStore.get('slack_noprivates')?.value === 'true';

  const { searchParams } = new URL(request.url);
  const customHackatimeId = searchParams.get('customHackatime');

  if (!token || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  processWaitlist().catch(err => console.error('Background processing error:', err));

  try {
    const storedData = await getUserData(userId);
    let topChannels: { name: string; rank: number }[] = [];
    let topDms: { name: string; count: number; image?: string }[] = [];
    
    if (storedData && storedData.topChannels) {
        console.log('Using stored top channels data');
        topChannels = storedData.topChannels;
    }
    
    if (storedData && storedData.topDms) {
        console.log('Using stored top DMs data');
        topDms = storedData.topDms;
    }

    if (!storedData || !storedData.topChannels) {
        const positionData = await getUserPosition(userId);
        return NextResponse.json({ 
            error: 'Data not ready',
            waitlist: positionData
        }, { status: 404 });
    }

    const userRes = await slackFetch('users.info', token, { user: userId });
    if (!userRes.ok) throw new Error(`User fetch failed: ${userRes.error}`);
    const userName = userRes.user.real_name || userRes.user.name;

    let totalMessages = 0;
    if (storedData && storedData.totalMessages !== undefined) {
        totalMessages = storedData.totalMessages;
    } else {
        const searchRes = await slackFetch('search.messages', token, { 
          query: `from:<@${userId}>`, 
          count: '1' 
        });
        totalMessages = searchRes.ok ? searchRes.messages.total : 0;
    }

    if (topChannels.length === 0) {
      topChannels.push({ name: "general", rank: 1 });
    }

    let confessionsMessages = 0;
    if (storedData && storedData.confessionsMessages !== undefined) {
        confessionsMessages = storedData.confessionsMessages;
    } else {
        const confessionsRes = await slackFetch('search.messages', token, {
          query: `from:<@${userId}> in:confessions`,
          count: '1'
        });
        confessionsMessages = confessionsRes.ok ? confessionsRes.messages.total : 0;
    }

    let metaMessages = 0;
    if (storedData && storedData.metaMessages !== undefined) {
        metaMessages = storedData.metaMessages;
    } else {
        const metaRes = await slackFetch('search.messages', token, {
          query: `from:<@${userId}> in:meta`,
          count: '1'
        });
        metaMessages = metaRes.ok ? metaRes.messages.total : 0;
    }

    let prox2Messages = 0;
    if (storedData && storedData.prox2Messages !== undefined) {
        prox2Messages = storedData.prox2Messages;
    } else if (!isNoPrivates) {
        const prox2Res = await slackFetch('search.messages', token, {
          query: `from:<@${userId}> to:<@U023L3A4UKX>`,
          count: '1'
        });
        prox2Messages = prox2Res.ok ? prox2Res.messages.total : 0;
    }

    let hackatimeHours = 0;
    try {
      const hackatimeRes = await fetch(`https://hackatime.hackclub.com/api/v1/users/${customHackatimeId || userId}/stats?features=projects`);
      if (hackatimeRes.ok) {
        const hackatimeData = await hackatimeRes.json();
        if (hackatimeData.data && hackatimeData.data.total_seconds) {
           hackatimeHours = Math.round(hackatimeData.data.total_seconds / 3600);
        }
      }
    } catch (e) {
      console.error('Failed to fetch Hackatime stats', e);
    }

    let ySwsSubmissions = 0;
    let ySwsProjects: string[] = [];
    const githubUsername = cookieStore.get('github_username')?.value;
    let requiresGithub = false;

    if (githubUsername) {
      try {
        const client = new Client()
          .setEndpoint('https://cloud.appwrite.io/v1')
          .setProject('cdn');
        
        const databases = new Databases(client);
        
        const yswsRes = await databases.listDocuments(
          'wrappeddb',
          'ysws-projects',
          [
            Query.equal('githubUsername', githubUsername)
          ]
        );
        
        ySwsSubmissions = yswsRes.total;
        
        const rawProjects = yswsRes.documents.map((doc: any) => {
          let name = doc.yswsName;
          if (typeof name === 'string') {
            name = name.replace(/^\["|"\]$/g, '').replace(/"/g, '');
          }
          return name;
        });
        
        ySwsProjects = Array.from(new Set(rawProjects)).filter(Boolean);
      } catch (e) {
        console.error('Failed to fetch YSWS stats', e);
      }
    } else {
      requiresGithub = true;
    }

    const data: WrappedData = {
      userName,
      totalMessages: totalMessages || 0,
      topChannels,
      topDms: topDms.length > 0 ? topDms : [
        { name: "Unknown :(", count: 0 }
      ],
      confessionsMessages,
      metaMessages,
      prox2Messages,
      ySwsSubmissions,
      ySwsProjects,
      hackatimeHours,
      randomGroup: getUserClan(userId).name
    };

    return NextResponse.json({ ...data, requiresGithub });

  } catch (error) {
    console.error('Data fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
