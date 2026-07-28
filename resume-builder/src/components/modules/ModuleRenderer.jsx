import HeadingModule from './HeadingModule'
import TextModule from './TextModule'
import DividerModule from './DividerModule'
import ImageModule from './ImageModule'
import ProfileModule from './ProfileModule'
import InfoListModule from './InfoListModule'
import TimelineModule from './TimelineModule'
import ProgressModule from './ProgressModule'
import TagsModule from './TagsModule'
import VideoTagsModule from './VideoTagsModule'
import RatingModule from './RatingModule'
import TierListModule from './TierListModule'
import GridModule from './GridModule'
import QuoteModule from './QuoteModule'
import SocialModule from './SocialModule'
import QrcodeModule from './QrcodeModule'
import MarkdownModule from './MarkdownModule'
import MusicModule from './MusicModule'
import BangumiModule from './BangumiModule'

const moduleComponents = {
  heading: HeadingModule,
  text: TextModule,
  divider: DividerModule,
  image: ImageModule,
  profile: ProfileModule,
  infoList: InfoListModule,
  timeline: TimelineModule,
  progress: ProgressModule,
  tags: TagsModule,
  videoTags: VideoTagsModule,
  rating: RatingModule,
  tierList: TierListModule,
  grid: GridModule,
  quote: QuoteModule,
  social: SocialModule,
  qrcode: QrcodeModule,
  markdown: MarkdownModule,
  music: MusicModule,
  bangumi: BangumiModule
}

export default function ModuleRenderer({ module, isEditing, onUpdate, theme }) {
  const Component = moduleComponents[module.type]

  if (!Component) {
    return <div className="p-4 text-red-500">未知模块类型: {module.type}</div>
  }

  return (
    <Component
      data={module.data}
      isEditing={isEditing}
      onUpdate={(newData) => onUpdate?.(newData)}
      theme={theme}
    />
  )
}
