export interface Tag {
  id: string;
  name: string;
  slug: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  // TipTap JSON document — typed loosely until the editor is wired.
  content: unknown;
  excerpt?: string | null;
  coverImage?: string | null;
  published: boolean;
  readingTime?: number | null;
  tags: Tag[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string | null;
}

export interface NavLink {
  label: string;
  command: string;
  href: string;
}
