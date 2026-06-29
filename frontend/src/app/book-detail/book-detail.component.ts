import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookService } from '../services/book.service';
import { Book } from '../models/book.model';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="detail" *ngIf="book(); else loading">
      <button class="back-btn" (click)="back()">← Back</button>

      <div class="detail-header">
        <div class="cover-wrap">
          <img *ngIf="book()!.cover" [src]="book()!.cover" [alt]="book()!.title" />
          <div *ngIf="!book()!.cover" class="cover-placeholder">📖</div>
        </div>
        <div class="detail-meta">
          <h1>{{ book()!.title }}</h1>
          <p class="author">{{ book()!.author }}</p>
          <div class="chips">
            <span class="chip">{{ book()!.pages ? book()!.pages + ' pages' : 'Unknown length' }}</span>
            <span class="chip" *ngIf="book()!.year">{{ book()!.year }}</span>
            <span class="chip pill" [ngClass]="book()!.status">{{ statusLabel() }}</span>
          </div>
        </div>
      </div>

      <!-- Progress -->
      <section class="section">
        <h2 class="sec-label">Progress</h2>
        <div class="big-bar-wrap">
          <div class="big-bar" [style.width.%]="pct()" [style.background]="'#378ADD'"></div>
        </div>
        <div class="prog-labels">
          <span>Page {{ book()!.current }} of {{ book()!.pages || '?' }}</span>
          <span>{{ pct() }}%</span>
        </div>
        <div class="log-row">
          <input
            type="number"
            [(ngModel)]="pageInput"
            [placeholder]="'Current page (max ' + (book()!.pages || '?') + ')'"
            min="0"
            [max]="book()!.pages"
          />
          <button class="btn-primary" (click)="logSession()" [disabled]="saving()">
            {{ saving() ? 'Saving...' : 'Log session' }}
          </button>
        </div>
        <p class="success" *ngIf="successMsg()">{{ successMsg() }}</p>
        <p class="error" *ngIf="errorMsg()">{{ errorMsg() }}</p>
      </section>

      <!-- Sessions -->
      <section class="section">
        <h2 class="sec-label">Sessions</h2>
        <p class="empty" *ngIf="!book()!.sessions.length">No sessions yet.</p>
        <div class="session-list">
          <div class="session-row" *ngFor="let s of reversedSessions(); let i = index">
            <div>
              <span class="pages-delta">+{{ delta(i) }} pages</span>
              <span class="pages-sub">up to p. {{ s.page }}</span>
            </div>
            <span class="session-date">{{ s.date }}</span>
          </div>
        </div>
      </section>

      <!-- Delete -->
      <section class="section">
        <button class="btn-danger" (click)="removeBook()">Remove from library</button>
      </section>
    </div>

    <ng-template #loading>
      <div class="detail"><p class="empty">Loading...</p></div>
    </ng-template>
  `,
  styles: [`
    .detail { max-width: 680px; margin: 0 auto; padding: 24px 16px; }
    .back-btn { background: none; border: none; font-size: 13px; color: #78716c; cursor: pointer; padding: 0; margin-bottom: 20px; display: flex; align-items: center; gap: 6px; }
    .back-btn:hover { color: #1c1917; }

    .detail-header { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 28px; }
    .cover-wrap { width: 80px; height: 112px; border-radius: 6px; overflow: hidden; background: #e7e5e4; flex-shrink: 0; box-shadow: 0 4px 16px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; }
    .cover-wrap img { width: 100%; height: 100%; object-fit: cover; }
    .cover-placeholder { font-size: 28px; }
    h1 { font-size: 18px; font-weight: 600; margin: 0 0 4px; line-height: 1.3; }
    .author { font-size: 13px; color: #78716c; margin: 0 0 10px; }
    .chips { display: flex; gap: 6px; flex-wrap: wrap; }
    .chip { font-size: 11px; padding: 3px 9px; border-radius: 8px; background: #f5f5f4; color: #78716c; border: 1px solid #e7e5e4; }
    .pill.reading { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
    .pill.finished { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
    .pill.unread { background: #f5f5f4; color: #78716c; }

    .section { margin-bottom: 28px; }
    .sec-label { font-size: 11px; font-weight: 600; color: #a8a29e; text-transform: uppercase; letter-spacing: 0.07em; margin: 0 0 10px; }
    .big-bar-wrap { height: 6px; background: #e7e5e4; border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
    .big-bar { height: 100%; border-radius: 3px; transition: width 0.4s; }
    .prog-labels { display: flex; justify-content: space-between; font-size: 12px; color: #a8a29e; margin-bottom: 14px; }
    .log-row { display: flex; gap: 8px; align-items: center; }
    .log-row input { padding: 7px 12px; border: 1px solid #d4d2ce; border-radius: 8px; font-size: 13px; width: 200px; }
    .btn-primary { padding: 7px 16px; background: #378ADD; color: #fff; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .btn-danger { padding: 7px 16px; background: none; color: #c0392b; border: 1px solid #fca5a5; border-radius: 8px; cursor: pointer; font-size: 13px; }
    .btn-danger:hover { background: #fef2f2; }
    .success { font-size: 13px; color: #166534; margin-top: 6px; }
    .error { font-size: 13px; color: #c0392b; margin-top: 6px; }

    .session-list { display: flex; flex-direction: column; gap: 6px; }
    .session-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: #f5f5f4; border-radius: 8px; font-size: 13px; }
    .pages-delta { font-weight: 500; }
    .pages-sub { font-size: 12px; color: #a8a29e; margin-left: 8px; }
    .session-date { font-size: 12px; color: #a8a29e; }
    .empty { font-size: 13px; color: #a8a29e; }
  `]
})
export class BookDetailComponent implements OnInit {
  book = signal<Book | null>(null);
  saving = signal(false);
  successMsg = signal('');
  errorMsg = signal('');
  pageInput: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookService: BookService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.bookService.getOne(id).subscribe(book => this.book.set(book));
  }

  back() { this.router.navigate(['/books']); }

  pct() {
    const b = this.book();
    return b && b.pages > 0 ? Math.round(b.current / b.pages * 100) : 0;
  }

  statusLabel() {
    return { reading: 'Reading', finished: 'Finished', unread: 'Unread' }[this.book()!.status];
  }

  reversedSessions() {
    return [...(this.book()?.sessions ?? [])].reverse();
  }

  delta(index: number) {
    const sessions = this.reversedSessions();
    const prev = sessions[index + 1]?.page ?? 0;
    return sessions[index].page - prev;
  }

  logSession() {
    const b = this.book();
    if (!b || this.pageInput === null) return;
    const page = Number(this.pageInput);
    if (isNaN(page) || page < 0 || (b.pages > 0 && page > b.pages)) {
      this.errorMsg.set(`Enter a page between 0 and ${b.pages || 'total'}.`);
      return;
    }
    this.saving.set(true);
    this.errorMsg.set('');
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    this.bookService.logSession(b.id, { page, date }).subscribe({
      next: updated => {
        this.book.set(updated);
        this.pageInput = null;
        this.saving.set(false);
        this.successMsg.set('Session logged!');
        setTimeout(() => this.successMsg.set(''), 2000);
      },
      error: () => {
        this.saving.set(false);
        this.errorMsg.set('Failed to save. Please try again.');
      }
    });
  }

  removeBook() {
    if (!confirm('Remove this book from your library?')) return;
    this.bookService.remove(this.book()!.id).subscribe(() => this.router.navigate(['/books']));
  }
}