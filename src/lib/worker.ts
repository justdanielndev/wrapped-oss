import { getNextUserToProcess, markUserProcessed, isProcessingActive, setProcessing, resetStuckUsers, removeUser, updateGlobalStats } from '@/lib/waitlist';
import { getAllSlackTokens } from '@/lib/slack-tokens';

async function slackFetch(endpoint: string, initialToken: string, params: Record<string, string> = {}, retries = 100) {
  const url = new URL(`https://slack.com/api/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const botTokens = getAllSlackTokens();
  const isUserToken = initialToken.startsWith('xoxp');
  const availableTokens = (isUserToken ? [initialToken] : [...botTokens, initialToken])
    .filter((t, i, self) => self.indexOf(t) === i && t);

  if (availableTokens.length === 0 && initialToken) {
    availableTokens.push(initialToken);
  }
  
  let currentTokenIndex = 0;

  for (let i = 0; i < retries; i++) {
    for (let j = 0; j < availableTokens.length; j++) {
        const tokenToUse = availableTokens[(currentTokenIndex + j) % availableTokens.length];
        
        try {
            const res = await fetch(url.toString(), {
                headers: {
                Authorization: `Bearer ${tokenToUse}`,
                },
            });

            const data = await res.json();

            if (!data.ok) {
                if (data.error === 'ratelimited') {
                    if (j === availableTokens.length - 1) {
                        const retryAfter = parseInt(res.headers.get('Retry-After') || '1', 10);
                        console.warn(`Rate limited on ${endpoint} with all tokens. Retrying after ${retryAfter}s... (Attempt ${i + 1}/${retries})`);
                        await new Promise(resolve => setTimeout(resolve, (retryAfter + 1) * 1000));
                    }
                    continue;
                }

                if (data.error === 'token_revoked' || data.error === 'account_inactive' || data.error === 'invalid_auth') {
                    throw new Error(data.error);
                }
                
                if (data.error === 'not_allowed_token_type') {
                    const indexToRemove = availableTokens.indexOf(tokenToUse);
                    if (indexToRemove > -1) {
                        availableTokens.splice(indexToRemove, 1);
                        j--;
                    }
                    if (availableTokens.length === 0) {
                        return { ok: false, error: 'no_valid_tokens_remaining' };
                    }
                    continue;
                }

                console.warn(`API error on ${endpoint} with token ending in ...${tokenToUse.slice(-4)}: ${data.error}`);
                continue;
            }

            return data;
        } catch (e: any) {
            if (e.message === 'token_revoked' || e.message === 'account_inactive' || e.message === 'invalid_auth') {
                throw e;
            }
            console.error(`Fetch error on ${endpoint}:`, e);
            if (i === retries - 1 && j === availableTokens.length - 1) throw e;
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
  }
  return { ok: false, error: 'max_retries_exceeded' };
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
  userToken: string,
  mode: 'default' | 'noprivates' = 'default'
): Promise<any> {
  try {
    const botTokens = getAllSlackTokens();
    const publicTokens = [...botTokens, userToken].filter(Boolean);
    const publicTokenIndex = { val: 0 };
    
    const types = mode === 'noprivates' ? 'public_channel' : 'public_channel,private_channel,im';
    
    const conversationsRes = await slackFetch('users.conversations', userToken, {
      types,
      limit: '200',
      exclude_archived: 'true',
    });

    const channels = conversationsRes.ok ? conversationsRes.channels : [];

    let nextCursor = conversationsRes.response_metadata?.next_cursor;
    while (nextCursor) {
        const nextRes = await slackFetch('users.conversations', userToken, {
            types,
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
              query: query + ' during:2025',
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
          } catch (e: any) {
            if (e.message === 'token_revoked' || e.message === 'account_inactive') {
                throw e;
            }
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
      .filter(dm => dm.userId !== slackUserId)
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
          } catch (e: any) {
              if (e.message === 'token_revoked' || e.message === 'account_inactive') {
                  throw e;
              }
              console.error(`Failed to fetch user info for ${dm.userId}`, e);
          }
          return { name: dm.userId, count: dm.count };
      }));

    const totalRes = await slackFetch('search.messages', userToken, { 
        query: `from:<@${slackUserId}> during:2025`, 
        count: '1' 
    });
    if (!totalRes.ok) console.error(`Total messages fetch failed for ${slackUserId}:`, totalRes.error);
    
    const confessionsRes = await slackFetch('search.messages', userToken, {
        query: `from:<@${slackUserId}> in:confessions during:2025`,
        count: '1'
    });
    if (!confessionsRes.ok) console.error(`Confessions fetch failed for ${slackUserId}:`, confessionsRes.error);

    const metaRes = await slackFetch('search.messages', userToken, {
        query: `from:<@${slackUserId}> in:meta during:2025`,
        count: '1'
    });
    if (!metaRes.ok) console.error(`Meta fetch failed for ${slackUserId}:`, metaRes.error);

    let prox2Messages = 0;
    if (mode !== 'noprivates') {
        const prox2Res = await slackFetch('search.messages', userToken, {
            query: `from:<@${slackUserId}> to:<@U023L3A4UKX> during:2025`,
            count: '1'
        });
        if (!prox2Res.ok) console.error(`Prox2 fetch failed for ${slackUserId}:`, prox2Res.error);
        prox2Messages = prox2Res.ok ? prox2Res.messages.total : 0;
    }

    const totalMessages = totalRes.ok ? totalRes.messages.total : 0;
    const confessionsMessages = confessionsRes.ok ? confessionsRes.messages.total : 0;
    const metaMessages = metaRes.ok ? metaRes.messages.total : 0;

    const dmSenderToken = botTokens.length > 0 ? botTokens[0] : userToken;
    
    const dmRes = await slackFetch('conversations.open', dmSenderToken, {
      users: slackUserId,
    });

    if (dmRes.ok) {
      const channelId = dmRes.channel.id;
      const message = `🎉 Your 2025 Wrapped is ready!\n\nVisit https://wrapped.isitzoe.dev/ to see it!`;

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

    return { 
        success: true, 
        channels: topChannels, 
        dms: topDms,
        totalMessages,
        confessionsMessages,
        metaMessages,
        prox2Messages
    };
  } catch (error: any) {
    if (error.message === 'token_revoked' || error.message === 'account_inactive' || error.message === 'invalid_auth') {
        await removeUser(userId);
        
        const botTokens = getAllSlackTokens();
        if (botTokens.length > 0) {
             const dmSenderToken = botTokens[0];
             try {
                const dmRes = await slackFetch('conversations.open', dmSenderToken, {
                    users: slackUserId,
                });
                if (dmRes.ok) {
                    await slackFetch('chat.postMessage', dmSenderToken, {
                        channel: dmRes.channel.id,
                        text: `Hi <@${slackUserId}>, just letting you know that your waitlist item failed to process because you revoked the token, so I had to delete it. If you want your Wrapped, you'll have to open the site again.\n\nJust FYI, Wrapped doesn't read message content and auto-deletes tokens after counting your messages, so no one can or will read your private data. Also, you removing the token has increased processing and waitlist time unnecessarily for other users who do want to see their Wrapped, as it has had to go through your account just to find your token not working.\n\nIf you still don't trust the site accessing that data, you can go to https://wrapped.isitzoe.dev/noprivates to auth a version of the app with no private data fetching. It's a worse experience (lacks private channels, DMs, meta, confessions, and Prox2 data), but it only accesses public channel data.`,
                    });
                }
             } catch (e) {
                 console.error('Failed to send revocation DM', e);
             }
        }
        
        return { success: false, error: 'token_revoked' };
    }
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
    await resetStuckUsers();

    const CONCURRENCY_DEFAULT = 2;
    const CONCURRENCY_NOPRIVATES = 2;
    const fetchLock = { locked: false };

    const worker = async (workerId: number, mode: 'default' | 'noprivates') => {
        while (true) {
            let user;
            
            while (fetchLock.locked) {
                await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            fetchLock.locked = true;
            try {
                user = await getNextUserToProcess(mode);
            } finally {
                fetchLock.locked = false;
            }

            if (!user) {
                break;
            }

            const result = await processUser(user.userId, user.slackUserId, user.token, user.mode);
            
            if (result.success) {
                await updateGlobalStats(user.userId, result.totalMessages);
            }

            await markUserProcessed(user.userId, result.success ? { 
                topChannels: result.channels,
                topDms: result.dms,
                totalMessages: result.totalMessages,
                confessionsMessages: result.confessionsMessages,
                metaMessages: result.metaMessages,
                prox2Messages: result.prox2Messages
            } : undefined);

            await new Promise((resolve) => setTimeout(resolve, 2000));
        }
    };

    await Promise.all([
        ...Array.from({ length: CONCURRENCY_DEFAULT }, (_, i) => worker(i + 1, 'default')),
        ...Array.from({ length: CONCURRENCY_NOPRIVATES }, (_, i) => worker(i + 1 + CONCURRENCY_DEFAULT, 'noprivates'))
    ]);
  } finally {
    setProcessing(false);
  }
}
