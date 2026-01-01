/**
 * Forum Interface Definitions
 */

export interface ForumResponse {
  id: number;
  title: string;
  content: string;
  status: "OPEN" | "ANSWERED" | "CLOSED";
  attachmentUrl: string | null;
  attachmentName: string | null;
  createdById: string;
  createdBy: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    comments: number;
  };
}

export interface ForumDetailResponse extends ForumResponse {
  comments: ForumCommentResponse[];
}

export interface ForumCommentResponse {
  id: number;
  content: string;
  forumId: number;
  userId: string;
  user: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateForumInput {
  title: string;
  content: string;
  attachmentUrl?: string;
  attachmentName?: string;
}

export interface UpdateForumInput {
  title?: string;
  content?: string;
  status?: "OPEN" | "ANSWERED" | "CLOSED";
}

export interface CreateCommentInput {
  content: string;
}
