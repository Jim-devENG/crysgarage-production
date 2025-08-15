export interface User {
  id: number;
  name: string;
  avatar?: string;
  username?: string;
  role?: 'member' | 'moderator' | 'admin' | 'premium';
  joinDate?: string;
  posts?: number;
  followers?: number;
  following?: number;
  badges?: string[];
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  timestamp: string;
  likes: number;
  replies: Comment[];
  isLiked: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  category: 'general' | 'music' | 'production' | 'gear' | 'collaboration' | 'showcase';
  tags: string[];
  media?: {
    type: 'image' | 'video' | 'audio';
    url: string;
    thumbnail?: string;
  };
  isLiked: boolean;
  isBookmarked: boolean;
  isPinned?: boolean;
  isFeatured?: boolean;
}
