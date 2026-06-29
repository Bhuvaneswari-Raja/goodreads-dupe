import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../services/book.service';
import { Book, CreateBookPayload } from '../models/book.model';

interface GoogleBookResult {
  title: string;
  author: string;
  pages: number;
  year: string;
  cover: string;
}

@Component({
  selector: 'app-library',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="library">
      <header class="header">
        <h1>📚 My Books</h1>
        <button class="btn-primary" (click)="showSearch = !showSearch">
          {{ showSearch ? 'Cancel' : '+ Add book' }}
        </button>
      </header>

      <!-- Search panel -->
      <div class="search-panel" *ngIf="showSearch">
        <div class="search-row">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search by title or author..."
            (keydown.enter)="search()"
          />
          <button class="btn-primary" (click)="search()" [disabled]="searching()">
            {{ searching() ? 'Searching...' : 'Search' }}
          </button>
        </div>
        <p class="source-label" *ngIf="searchSource()">Results from {{ searchSource() }}</p>
        <p class="error" *ngIf="searchError()">{{ searchError() }}</p>

        <div class="results-list">
          <div class="result-item" *ngFor="let r of searchResults(); let i = index">
            <div class="result-thumb">
              <img *ngIf="r.cover" [src]="r.cover" alt="" />
              <span *ngIf="!r.cover">📖</span>
            </div>
            <div class="result-info">
              <div class="result-title">{{ r.title }}</div>
              <div class="result-meta">{{ r.author }}{{ r.year ? ' · ' + r.year : '' }}{{ r.pages ? ' · ' + r.pages + ' pp' : '' }}</div>
            </div>
            <button class="btn-add" (click)="addBook(i)">+ Add</button>
          </div>
        </div>
      </div>

      <!-- Currently reading -->
      <section *ngIf="reading().length">
        <h2 class="section-title">Currently reading</h2>
        <div class="cover-grid">
          <div class="cover-card" *ngFor="let b of reading()" (click)="openBook(b.id)">
            <div class="cover-img">
              <img *ngIf="b.cover" [src]="b.cover" [alt]="b.title" />
              <div *ngIf="!b.cover" class="cover-fallback" [style.background]="colorFor(b.id)">📖</div>
              <span class="pct-badge">{{ pct(b) }}%</span>
            </div>
            <div class="cover-info">
              <div class="book-title">{{ b.title }}</div>
              <div class="book-author">{{ b.author }}</div>
              <div class="mini-bar">
                <div class="mini-fill" [style.width.%]="pct(b)" [style.background]="colorFor(b.id)"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- All books -->
      <section *ngIf="others().length">
        <h2 class="section-title">{{ reading().length ? 'All books' : 'My books' }}</h2>
        <div class="book-list">
          <div class="book-row" *ngFor="let b of others()" (click)="openBook(b.id)">
            <div class="row-thumb">
              <img *ngIf="b.cover" [src]="b.cover" [alt]="b.title" />
              <div *ngIf="!b.cover" class="spine" [style.background]="colorFor(b.id)"></div>
            </div>
            <div class="row-info">
              <div class="book-title">{{ b.title }}</div>
              <div class="book-author">{{ b.author }}</div>
            </div>
            <span class="pill" [ngClass]="b.status">{{ statusLabel(b) }}</span>
          </div>
        </div>
      </section>

      <p class="empty" *ngIf="!books().length && !showSearch">
        No books yet — click "Add book" to search and add your first one.
      </p>
    </div>
  `,
  styles: [`
    .library { max-width: 680px; margin: 0 auto; padding: 24px 16px; }
    .header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    h1 { font-size: 22px; font-weight: 600; }
    .btn-primary { padding: 7px 16px; background: #378ADD; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
    .btn-primary:hover { background: #2a6db5; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .search-panel { background: #f5f5f4; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    .search-row { display: flex; gap: 8px; margin-bottom: 10px; }
    .search-row input { flex: 1; padding: 8px 12px; border: 1px solid #d4d2ce; border-radius: 8px; font-size: 13px; }
    .source-label { font-size: 11px; color: #a8a29e; margin-bottom: 8px; }
    .error { font-size: 13px; color: #c0392b; }
    .results-list { display: flex; flex-direction: column; gap: 8px; }
    .result-item { display: flex; gap: 12px; align-items: center; padding: 10px 12px; background: #fff; border: 1px solid #e7e5e4; border-radius: 10px; }
    .result-thumb { width: 36px; height: 50px; border-radius: 3px; background: #e7e5e4; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
    .result-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .result-info { flex: 1; min-width: 0; }
    .result-title { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .result-meta { font-size: 11px; color: #78716c; }
    .btn-add { font-size: 12px; padding: 4px 12px; border: 1px solid #d4d2ce; border-radius: 6px; background: #fff; cursor: pointer; }
    .btn-add:hover { background: #f5f5f4; }

    .section-title { font-size: 11px; font-weight: 600; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.07em; margin: 0 0 12px; }

    .cover-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; margin-bottom: 28px; }
    .cover-card { background: #fff; border: 1px solid #e7e5e4; border-radius: 12px; overflow: hidden; cursor: pointer; transition: transform 0.15s; }
    .cover-card:hover { transform: translateY(-2px); }
    .cover-img { width: 100%; aspect-ratio: 2/3; position: relative; overflow: hidden; background: #e7e5e4; display: flex; align-items: center; justify-content: center; }
    .cover-img img { width: 100%; height: 100%; object-fit: cover; }
    .cover-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 28px; }
    .pct-badge { position: absolute; bottom: 6px; right: 6px; background: rgba(0,0,0,0.6); color: #fff; font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 20px; }
    .cover-info { padding: 8px 10px 10px; }
    .mini-bar { height: 3px; background: #e7e5e4; border-radius: 2px; overflow: hidden; margin-top: 6px; }
    .mini-fill { height: 100%; border-radius: 2px; }

    .book-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 28px; }
    .book-row { display: flex; gap: 12px; align-items: center; padding: 10px 12px; background: #fff; border: 1px solid #e7e5e4; border-radius: 10px; cursor: pointer; transition: border-color 0.15s; }
    .book-row:hover { border-color: #a8a29e; }
    .row-thumb { width: 38px; height: 54px; border-radius: 3px; background: #e7e5e4; overflow: hidden; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .row-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .spine { width: 8px; height: 100%; border-radius: 2px; }
    .row-info { flex: 1; min-width: 0; }
    .book-title { font-size: 13px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .book-author { font-size: 12px; color: #78716c; }
    .pill { font-size: 11px; padding: 2px 9px; border-radius: 20px; flex-shrink: 0; }
    .pill.reading { background: #dbeafe; color: #1e40af; }
    .pill.finished { background: #dcfce7; color: #166534; }
    .pill.unread { background: #f5f5f4; color: #78716c; }
    .empty { font-size: 13px; color: #a8a29e; }
  `]
})
export class LibraryComponent implements OnInit {
  books = signal<Book[]>([]);
  searchResults = signal<GoogleBookResult[]>([]);
  searching = signal(false);
  searchError = signal('');
  searchSource = signal('');
  showSearch = false;
  searchQuery = '';

  private COLORS = ['#378ADD','#1D9E75','#D85A30','#7C3AED','#BA7517','#D4537E'];

  reading = computed(() => this.books().filter(b => b.status === 'reading'));
  others  = computed(() => this.books().filter(b => b.status !== 'reading'));

  constructor(private bookService: BookService, private router: Router) {}

  ngOnInit() {
    this.bookService.getAll().subscribe(books => this.books.set(books));
  }

  colorFor(id: number) { return this.COLORS[(id - 1) % this.COLORS.length]; }
  pct(b: Book) { return b.pages > 0 ? Math.round(b.current / b.pages * 100) : 0; }
  statusLabel(b: Book) { return { reading: 'Reading', finished: 'Finished', unread: 'Unread' }[b.status]; }

  openBook(id: number) { this.router.navigate(['/books', id]); }

  async search() {
    if (!this.searchQuery.trim()) return;
    this.searching.set(true);
    this.searchError.set('');
    this.searchSource.set('');
    this.searchResults.set([]);
    let results: GoogleBookResult[] = [];

    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(this.searchQuery)}&maxResults=8&printType=books`);
      const data = await res.json();
      if (data.items?.length) {
        this.searchSource.set('Google Books');
        results = data.items.map((item: any) => {
          const v = item.volumeInfo || {};
          const cover = v.imageLinks?.thumbnail || v.imageLinks?.smallThumbnail || '';
          return { title: v.title || 'Unknown', author: (v.authors || []).join(', ') || 'Unknown', pages: v.pageCount || 0, year: v.publishedDate?.slice(0, 4) || '', cover: cover.replace('http://', 'https://') };
        });
      }
    } catch {}

    if (!results.length) {
      try {
        const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(this.searchQuery)}&limit=8&fields=title,author_name,number_of_pages_median,first_publish_year,cover_i`);
        const data = await res.json();
        if (data.docs?.length) {
          this.searchSource.set('Open Library');
          results = data.docs.slice(0, 8).map((doc: any) => ({
            title: doc.title || 'Unknown', author: (doc.author_name || []).slice(0, 2).join(', ') || 'Unknown',
            pages: doc.number_of_pages_median || 0, year: doc.first_publish_year ? String(doc.first_publish_year) : '',
            cover: doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-S.jpg` : ''
          }));
        }
      } catch {}
    }

    if (!results.length) this.searchError.set('No results found. Try a different search term.');
    this.searchResults.set(results);
    this.searching.set(false);
  }

  addBook(index: number) {
    const r = this.searchResults()[index];
    const payload: CreateBookPayload = { title: r.title, author: r.author, pages: r.pages, year: r.year, cover: r.cover };
    this.bookService.create(payload).subscribe(book => {
      this.books.update(books => [book, ...books]);
      this.showSearch = false;
      this.searchResults.set([]);
      this.searchQuery = '';
    });
  }
}