import IntroSlide from '@/components/wrapped/slides/IntroSlide';
import TotalMessagesSlide from '@/components/wrapped/slides/TotalMessagesSlide';
import TopChannelsSlide from '@/components/wrapped/slides/TopChannelsSlide';
import PeopleDmsSlide from '@/components/wrapped/slides/PeopleDmsSlide';
import ConfessionsMetaSlide from '@/components/wrapped/slides/ConfessionsMetaSlide';
import Prox2Slide from '@/components/wrapped/slides/Prox2Slide';
import YSWSSlide from '@/components/wrapped/slides/YSWSSlide';
import HackatimeSlide from '@/components/wrapped/slides/HackatimeSlide';
import GroupSlide from '@/components/wrapped/slides/GroupSlide';
import SummarySlide from '@/components/wrapped/slides/SummarySlide';
import { SlideConfig } from '@/components/wrapped/WrappedContainer';

export const SLIDES: SlideConfig[] = [
  { id: 'intro', component: IntroSlide, theme: 'light' },
  { id: 'total-messages', component: TotalMessagesSlide, theme: 'dark' },
  { id: 'top-channels', component: TopChannelsSlide, theme: 'light' },
  { id: 'people-dms', component: PeopleDmsSlide, theme: 'dark' },
  { id: 'confessions', component: ConfessionsMetaSlide, theme: 'light' },
  { id: 'prox2', component: Prox2Slide, theme: 'dark' },
  { id: 'ysws', component: YSWSSlide, theme: 'light' },
  { id: 'hackatime', component: HackatimeSlide, theme: 'dark' },
  { id: 'group', component: GroupSlide, theme: 'light' },
  { id: 'summary', component: SummarySlide, theme: 'dark' }
];

export const PUBLIC_SLIDES: SlideConfig[] = [
  { id: 'intro', component: IntroSlide, theme: 'light' },
  { id: 'total-messages', component: TotalMessagesSlide, theme: 'dark' },
  { id: 'top-channels', component: TopChannelsSlide, theme: 'light' },
  { id: 'confessions', component: ConfessionsMetaSlide, theme: 'light' },
  { id: 'ysws', component: YSWSSlide, theme: 'light' },
  { id: 'hackatime', component: HackatimeSlide, theme: 'dark' },
  { id: 'group', component: GroupSlide, theme: 'light' },
  { id: 'summary', component: SummarySlide, theme: 'dark' }
];
