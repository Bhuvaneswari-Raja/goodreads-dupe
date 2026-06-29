export interface ReadingSession {
  id: number;
  bookId: number;
  page: number;
  date: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  pages: number;
  year?: string;
  cover?: string;
  current: number;
  status: 'unread' | 'reading' | 'finished';
  sessions: ReadingSession[];
  createdAt: string;
}

export interface CreateBookPayload {
  title: string;
  author: string;
  pages?: number;
  year?: string;
  cover?: string;
}

export interface LogSessionPayload {
  page: number;
  date: string;
}