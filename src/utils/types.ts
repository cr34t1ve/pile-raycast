export interface PilePost {
  content: string;
  data: {
    title: string;
    createdAt: string;
    updatedAt: string;
    highlight: string | null;
    highlightColor: string | null;
    tags: string[];
    replies: string[];
    attachments: string[];
    isReply: boolean;
    isAI: boolean;
  };
}

export interface PileSettings {
  name: string;
  path: string;
  theme: "light" | "dark";
}
