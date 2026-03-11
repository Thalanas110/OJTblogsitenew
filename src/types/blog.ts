export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  cover_image_url: string | null;
  youtube_url: string | null;
  is_pinned: boolean;
  is_published: boolean;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  view_count?: number;
  comment_count?: number;
  reaction_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  ip_address: string;
  is_approved: boolean;
  created_at: string;
}

export interface Reaction {
  id: string;
  post_id: string;
  reaction_type: string;
  ip_address: string;
  created_at: string;
}

export interface PostView {
  id: string;
  post_id: string;
  ip_address: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export interface PostWithStats extends Post {
  view_count: number;
  comment_count: number;
  reaction_count: number;
}
