import { getNextUserToProcess, markUserProcessed, isProcessingActive, setProcessing } from '@/lib/waitlist';
import { getAllSlackTokens } from '@/lib/slack-tokens';

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

function getNextTokenFromList(tokens: string[], currentIndex: { val: number }): string {
    if (tokens.length === 0) return '';
    const token = tokens[currentIndex.val];
    currentIndex.val = (currentIndex.val + 1) % tokens.length;
    return token;
}

interface ChannelStat {
    type: 'channel';
    name: string;
    count: number;
}

interface DmStat {
    type: 'dm';
    userId: string;
    count: number;
}

type SearchResult = ChannelStat | DmStat | { type: 'skip' | 'error' };

async function processUser(
  userId: string,
  slackUserId: string,
  userToken: string
): Promise<any> {
  try {
    console.log(`Processing user ${userId}...`);

    const botTokens = getAllSlackTokens();
    const publicTokens = [...botTokens, userToken].filter(Boolean);
    const publicTokenIndex = { val: 0 };
    const conversationsRes = await slackFetch('users.conversations', userToken, {
      types: 'public_channel,private_channel,im',
      limit: '200',
      exclude_archived: 'true',
    });

    const channels = conversationsRes.ok ? conversationsRes.channels : [];
    console.log(`User ${userId} is in ${channels.length} channels`);

    let nextCursor = conversationsRes.response_metadata?.next_cursor;
    while (nextCursor) {
        console.log(`Fetching more channels... cursor: ${nextCursor}`);
        const nextRes = await slackFetch('users.conversations', userToken, {
            types: 'public_channel,private_channel,im',
            limit: '200',
            exclude_archived: 'true',
            cursor: nextCursor
        });
        
        if (nextRes.ok) {
            channels.push(...nextRes.channels);
            nextCursor = nextRes.response_metadata?.next_cursor;
        } else {
            nextCursor = null;
        }
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log(`Total channels found: ${channels.length}`);

    const channelStats: ChannelStat[] = [];
    const dmStats: DmStat[] = [];

    const BATCH_SIZE = 3; 

    for (let i = 0; i < channels.length; i += BATCH_SIZE) {
      const batch = channels.slice(i, i + BATCH_SIZE);
      const results = await Promise.all(
        batch.map(async (channel: any): Promise<SearchResult> => {
          try {
            let searchToken;
            let query = '';
            
            if (channel.is_im) {
                searchToken = userToken;
                if (channel.user) {
                    query = `from:<@${slackUserId}> to:<@${channel.user}>`;
                } else {
                    return { type: 'skip' };
                }
            } else if (channel.is_private || channel.is_group) {
                searchToken = userToken;
                query = `from:<@${slackUserId}> in:${channel.name}`;
            } else {
                searchToken = getNextTokenFromList(publicTokens, publicTokenIndex);
                query = `from:<@${slackUserId}> in:${channel.name}`;
            }

            const res = await slackFetch('search.messages', searchToken, {
              query: query,
              count: '1',
            });
            
            if (!res.ok && res.error === 'ratelimited') {
                console.warn(`Rate limited on channel ${channel.name || channel.id}`);
            }

            const count = res.ok ? res.messages.total : 0;

            if (channel.is_im) {
                return {
                    type: 'dm',
                    userId: channel.user,
                    count: count
                };
            } else {
                return {
                    type: 'channel',
                    name: channel.name,
                    count: count
                };
            }
          } catch (e) {
            console.error(`Error searching in channel ${channel.name || channel.id}:`, e);
            return { type: 'error' };
          }
        })
      );
      
      results.forEach((r) => {
          if (r.type === 'channel') channelStats.push(r);
          if (r.type === 'dm') dmStats.push(r);
      });

      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    const topChannels = channelStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map((channel, index) => ({ name: channel.name, rank: index + 1 }));

    const topDms = await Promise.all(dmStats
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
      .map(async (dm) => {
          try {
              const userRes = await slackFetch('users.info', userToken, { user: dm.userId });
              if (userRes.ok && userRes.user) {
                  return {
                      name: userRes.user.real_name || userRes.user.name,
                      count: dm.count,
                      image: userRes.user.profile.image_192 || userRes.user.profile.image_512
                  };
              }
          } catch (e) {
              console.error(`Failed to fetch user info for ${dm.userId}`, e);
          }
          return { name: dm.userId, count: dm.count };
      }));

    console.log(`User ${userId} top channels:`, topChannels);
    console.log(`User ${userId} top DMs:`, topDms);

    const dmSenderToken = botTokens.length > 0 ? botTokens[0] : userToken;
    
    const dmRes = await slackFetch('conversations.open', dmSenderToken, {
      users: slackUserId,
    });

    if (dmRes.ok) {
      const channelId = dmRes.channel.id;
      const message = `🎉 Your 2025 Wrapped is ready!\n\nVisit wrapped.isitzoe.dev to see it!`;

      const postRes = await slackFetch('chat.postMessage', dmSenderToken, {
        channel: channelId,
        text: message,
      });
      
      if (!postRes.ok) {
          console.error('Failed to send DM:', postRes.error);
      }
    } else {
        console.error('Failed to open DM channel:', dmRes.error);
    }

    return { success: true, channels: topChannels, dms: topDms };
  } catch (error) {
    console.error(`Error processing user ${userId}:`, error);
    return { success: false, error: String(error) };
  }
}

export async function processWaitlist() {
  if (isProcessingActive()) {
    return;
  }

  setProcessing(true);

  try {
    let user;
    while ((user = await getNextUserToProcess())) {
      console.log(`Processing user: ${user.userId}`);
      const result = await processUser(user.userId, user.slackUserId, user.token);
      
      await markUserProcessed(user.userId, result.success ? { 
          topChannels: result.channels,
          topDms: result.dms 
      } : undefined);

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  } finally {
    setProcessing(false);
  }
}
