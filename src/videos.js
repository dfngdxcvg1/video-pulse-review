export const site = {
  name: "Video Pulse Review",
  origin: "https://pingdou123.uk",
  description: "Curated English notes on remarkable public YouTube videos, with context, timestamps, and source links."
};

export const categories = [
  { slug: "restoration", name: "Restoration", intro: "Machines, tools, vehicles, and forgotten objects brought back through careful repair." },
  { slug: "animals", name: "Animals", intro: "Rescue stories, clever behavior, wildlife moments, and animal-human trust." },
  { slug: "inventions", name: "Inventions", intro: "Useful builds, factory processes, engineering experiments, and practical design ideas." },
  { slug: "nature", name: "Nature", intro: "Extreme weather, natural wonders, field footage, and explainable science moments." },
  { slug: "true-stories", name: "True Stories", intro: "Human moments with a clear story, emotional stakes, and useful background." },
  { slug: "funny", name: "Funny", intro: "Light, ad-safe clips with visual humor, surprising timing, and broad appeal." }
];

export const videos = [
  {
    id: "dQw4w9WgXcQ",
    slug: "classic-internet-music-video-case-study",
    category: "true-stories",
    title: "Why This Classic Internet Music Video Became a Search Culture Reference",
    sourceTitle: "Rick Astley - Never Gonna Give You Up",
    channel: "Rick Astley",
    publishedAt: "2009-10-25T06:57:33Z",
    viewsLabel: "Public YouTube example",
    summary: "This page is seeded with a famous public YouTube example so the site can be tested without pretending to have live API data. In production, replace this record with videos selected from your own YouTube Data API sync. The editorial angle should explain why a clip matters, what viewers should notice, and what search intent the page satisfies.",
    takeaways: ["Use original commentary instead of copying the YouTube title.", "Add context that helps a reader before and after watching.", "Keep one permanent URL for one video."],
    timestamps: ["00:00 Opening hook", "00:43 Chorus that became widely referenced", "02:10 Dance and visual style"],
    keyword: "classic internet video analysis"
  },
  {
    id: "aqz-KE-bpKQ",
    slug: "big-buck-bunny-animation-review",
    category: "funny",
    title: "Big Buck Bunny: A Safe Example of Visual Comedy and Short Film Timing",
    sourceTitle: "Big Buck Bunny",
    channel: "Blender Foundation",
    publishedAt: "2008-05-30T00:00:00Z",
    viewsLabel: "Open movie example",
    summary: "A good curated video page explains the premise quickly, then gives the viewer a reason to keep reading. This short film is useful as a sample because the visuals are clear, the story is easy to understand internationally, and the surrounding article can discuss animation timing without relying on copied text.",
    takeaways: ["Visual storytelling works well for global audiences.", "Comedy pages should remain brand-safe.", "Short films need source attribution and a clear embed."],
    timestamps: ["00:20 Setting and character introduction", "03:12 Conflict becomes visible", "07:40 Payoff sequence"],
    keyword: "family friendly animated short review"
  },
  {
    id: "ysz5S6PUM-U",
    slug: "elephants-dream-open-animation-context",
    category: "inventions",
    title: "Elephants Dream and the Early Open Animation Production Experiment",
    sourceTitle: "Elephants Dream",
    channel: "Blender Foundation",
    publishedAt: "2006-05-18T00:00:00Z",
    viewsLabel: "Open movie example",
    summary: "This sample page shows how a video can be framed around production context rather than simple entertainment. For an English traffic site, this style helps create unique value: explain what the viewer is seeing, why it was made, and what related terms people might search for later.",
    takeaways: ["Production background creates search-friendly context.", "Technical videos can support evergreen traffic.", "Related recommendations should stay in the same intent cluster."],
    timestamps: ["00:35 Industrial visual language", "04:00 Character contrast", "08:15 Abstract machine sequence"],
    keyword: "open source animation production"
  },
  {
    id: "ScMzIvxBSi4",
    slug: "sample-restoration-video-page-template",
    category: "restoration",
    title: "How to Write a Restoration Video Page That Google Can Understand",
    sourceTitle: "Sample Video",
    channel: "YouTube Creator",
    publishedAt: "2024-04-12T08:00:00Z",
    viewsLabel: "Replace with API data",
    summary: "Use this record as a template for your first restoration pages. The article should describe the object, the repair process, key moments, safety notes, and why the result is satisfying. Do not claim ownership of the video; point clearly to the YouTube source and add your own editorial value.",
    takeaways: ["Mention the object and result in the title.", "Add repair steps and background knowledge.", "Avoid unsafe or shocking content for ads."],
    timestamps: ["00:42 Disassembly begins", "03:16 Rust and damage inspection", "08:25 First restart attempt"],
    keyword: "old machine restoration video"
  },
  {
    id: "M7lc1UVf-VE",
    slug: "youtube-embed-api-official-sample",
    category: "inventions",
    title: "YouTube Embed Behavior: Official Player Sample for Testing Layouts",
    sourceTitle: "YouTube Developers Live: Embedded Web Player Customization",
    channel: "Google for Developers",
    publishedAt: "2012-06-20T00:00:00Z",
    viewsLabel: "Developer sample",
    summary: "A technical sample video is useful when testing layout, lazy loading, structured data, and player behavior. Your production site should check whether each chosen video allows embedding, then store the source id, channel, title, publish date, thumbnail, and editorial notes in the local content database.",
    takeaways: ["Load iframes only after a user clicks on listing pages.", "Use official embed URLs.", "Keep API keys on the server or build job."],
    timestamps: ["00:10 Player basics", "02:30 Embed customization", "05:00 Developer workflow"],
    keyword: "youtube embed player sample"
  },
  {
    id: "jNQXAC9IVRw",
    slug: "first-youtube-video-history-context",
    category: "true-stories",
    title: "The First YouTube Video: Why a Simple Clip Still Has Search Value",
    sourceTitle: "Me at the zoo",
    channel: "jawed",
    publishedAt: "2005-04-24T03:31:52Z",
    viewsLabel: "Historic YouTube example",
    summary: "Some videos rank because they are historically important rather than visually spectacular. A page like this should answer the reader's likely questions: what the clip is, why it matters, when it was uploaded, and how it connects to the growth of online video.",
    takeaways: ["Historic context can be evergreen.", "Short videos still need a real article.", "Answer the searcher's question quickly."],
    timestamps: ["00:00 Opening frame", "00:08 Main spoken moment", "00:16 End of clip"],
    keyword: "first youtube video history"
  }
];
