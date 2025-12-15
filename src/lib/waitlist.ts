import { Client, Databases, ID, Query } from 'node-appwrite';

const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('cdn')
    .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

const DB_ID = 'wrappeddb';
const COLLECTION_ID = 'waitlist';

let isProcessing = false;

export async function addToWaitlist(
  userId: string,
  slackUserId: string,
  token: string,
  mode: 'default' | 'noprivates' = 'default',
  githubUsername?: string
): Promise<void> {
  try {
      const existing = await databases.listDocuments(
          DB_ID,
          COLLECTION_ID,
          [Query.equal('userId', userId)]
      );
      
      if (existing.total > 0) {
          return;
      }

      await databases.createDocument(
        DB_ID,
        COLLECTION_ID,
        ID.unique(),
        {
            userId,
            slackUserId,
            token,
            status: 'pending',
            addedAt: new Date().toISOString(),
            mode,
            githubUsername
        }
      );
  } catch (error) {
      console.error('Appwrite error adding to waitlist:', error);
  }
}

export async function removeUser(userId: string): Promise<void> {
    try {
        const res = await databases.listDocuments(
            DB_ID,
            COLLECTION_ID,
            [Query.equal('userId', userId)]
        );
        
        if (res.documents.length > 0) {
            await databases.deleteDocument(
                DB_ID,
                COLLECTION_ID,
                res.documents[0].$id
            );
        }
    } catch (e) {
        console.error('Error removing user', e);
    }
}

export async function getWaitlistSize(): Promise<number> {
    try {
        const res = await databases.listDocuments(
            DB_ID,
            COLLECTION_ID,
            [Query.equal('status', 'pending')]
        );
        return res.total;
    } catch (e) {
        console.error('Error getting waitlist size', e);
        return 0;
    }
}

export const getQueueSize = getWaitlistSize;

export async function resetStuckUsers(): Promise<void> {
    try {
        console.log('Checking for stuck users...');
        const stuckRes = await databases.listDocuments(
            DB_ID,
            COLLECTION_ID,
            [
                Query.equal('status', 'processing'),
                Query.limit(100)
            ]
        );

        console.log(`Found ${stuckRes.total} stuck users.`);

        for (const doc of stuckRes.documents) {
             console.log(`Resetting stuck user ${doc.userId} to pending.`);
             await databases.updateDocument(
                DB_ID,
                COLLECTION_ID,
                doc.$id,
                { status: 'pending' }
            );
        }
    } catch (e) {
        console.error('Error resetting stuck users', e);
    }
}

export async function getNextUserToProcess(mode?: 'default' | 'noprivates'): Promise<{
  userId: string;
  slackUserId: string;
  token: string;
  mode?: 'default' | 'noprivates';
} | null> {
    try {
        const queries = [
            Query.equal('status', 'pending'),
            Query.orderAsc('addedAt'),
            Query.limit(1)
        ];

        if (mode) {
            queries.push(Query.equal('mode', mode));
        }

        const res = await databases.listDocuments(
            DB_ID,
            COLLECTION_ID,
            queries
        );

        if (res.documents.length === 0) return null;

        const doc = res.documents[0];
        
        await databases.updateDocument(
            DB_ID,
            COLLECTION_ID,
            doc.$id,
            { status: 'processing' }
        );

        return {
            userId: doc.userId,
            slackUserId: doc.slackUserId,
            token: doc.token,
            mode: doc.mode || 'default',
        };
    } catch (e) {
        console.error('Error getting next user', e);
        return null;
    }
}

export async function markUserProcessed(userId: string, results?: any): Promise<void> {
    try {
        const res = await databases.listDocuments(
            DB_ID,
            COLLECTION_ID,
            [Query.equal('userId', userId)]
        );
        
        if (res.documents.length > 0) {
            const updateData: any = { status: 'completed', token: null };
            if (results) {
                updateData.results = JSON.stringify(results);
            }

            await databases.updateDocument(
                DB_ID,
                COLLECTION_ID,
                res.documents[0].$id,
                updateData
            );
        }
    } catch (e) {
        console.error('Error marking user processed', e);
    }
}

export async function getUserPosition(userId: string): Promise<{ position: number; status: string } | null> {
    try {
        const userRes = await databases.listDocuments(
            DB_ID,
            COLLECTION_ID,
            [Query.equal('userId', userId)]
        );

        if (userRes.documents.length === 0) return null;
        const userDoc = userRes.documents[0];

        if (userDoc.status === 'processing') {
            return { position: 0, status: 'processing' };
        }
        
        if (userDoc.status === 'completed') {
            return { position: 0, status: 'completed' };
        }

        if (userDoc.status === 'pending') {
            const mode = userDoc.mode || 'default';
            const aheadRes = await databases.listDocuments(
                DB_ID,
                COLLECTION_ID,
                [
                    Query.equal('status', 'pending'),
                    Query.equal('mode', mode),
                    Query.lessThan('addedAt', userDoc.addedAt)
                ]
            );
            return { position: aheadRes.total + 1, status: 'pending' };
        }

        return { position: -1, status: userDoc.status };
    } catch (e) {
        console.error('Error getting user position', e);
        return null;
    }
}

export async function getUserData(userId: string): Promise<any | null> {
    try {
        console.log(`[getUserData] Querying for userId: ${userId}`);
        const res = await databases.listDocuments(
            DB_ID,
            COLLECTION_ID,
            [Query.equal('userId', userId)]
        );
        
        console.log(`[getUserData] Found ${res.documents.length} documents`);

        if (res.documents.length > 0) {
            const doc = res.documents[0];
            console.log(`[getUserData] Document ID: ${doc.$id}, Status: ${doc.status}`);
            if (doc.status === 'completed' && doc.results) {
                return JSON.parse(doc.results);
            }
            return { status: doc.status };
        }
        return null;
    } catch (e) {
        console.error('Error getting user data', e);
        return null;
    }
}

export function isProcessingActive(): boolean {
  return isProcessing;
}

export function setProcessing(value: boolean): void {
  isProcessing = value;
}
