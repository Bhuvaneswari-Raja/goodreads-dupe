import { Routes } from '@angular/router';
import { LibraryComponent } from './library/library.component';
import { BookDetailComponent } from '././book-detail/book-detail.component';

export const routes: Routes = [
  { path: '', redirectTo: 'books', pathMatch: 'full' },
  { path: 'books', component: LibraryComponent },
  { path: 'books/:id', component: BookDetailComponent },
];