import { Clan } from '@/lib/clans';

export interface WrappedData {
  userName: string;
  totalMessages: number;
  topChannels: { name: string; rank: number }[];
  topDms: { name: string; count: number; image?: string }[];
  confessionsMessages: number;
  metaMessages: number;
  prox2Messages: number;
  ySwsSubmissions: number;
  ySwsProjects: string[];
  hackatimeHours: number;
  randomGroup: Clan['name'];
  shareOptions?: {
    hideDms?: boolean;
    hideTopChannels?: boolean;
    hideBestie?: boolean;
  };
}

export interface SlideProps {
  data: WrappedData;
  onNext?: () => void;
  onPrev?: () => void;
  isActive: boolean;
}
