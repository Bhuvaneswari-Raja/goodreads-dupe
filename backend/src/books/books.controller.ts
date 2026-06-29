import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { BooksService } from '././books.service';
import { CreateBookDto, UpdateProgressDto } from '././dto/create-book.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  // GET /api/books
  @Get()
  findAll() {
    return this.booksService.findAll();
  }

  // GET /api/books/:id
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.findOne(id);
  }

  // POST /api/books
  @Post()
  create(@Body() dto: CreateBookDto) {
    return this.booksService.create(dto);
  }

  // POST /api/books/:id/sessions
  @Post(':id/sessions')
  logSession(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateProgressDto,
  ) {
    return this.booksService.logSession(id, dto);
  }

  // DELETE /api/books/:id
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.booksService.remove(id);
  }
}
