import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookDto, UpdateProgressDto } from '././dto/create-book.dto';

@Injectable()
export class BooksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.book.findMany({
      include: { sessions: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { sessions: { orderBy: { createdAt: 'asc' } } },
    });
    if (!book) throw new NotFoundException(`Book ${id} not found`);
    return book;
  }

  async create(dto: CreateBookDto) {
    return this.prisma.book.create({
      data: {
        title: dto.title,
        author: dto.author,
        pages: dto.pages ?? 0,
        year: dto.year,
        cover: dto.cover,
        status: 'unread',
        current: 0,
      },
    });
  }

  async logSession(id: number, dto: UpdateProgressDto) {
    const book = await this.findOne(id);

    const status =
      book.pages > 0 && dto.page >= book.pages
        ? 'finished'
        : dto.page > 0
        ? 'reading'
        : 'unread';

    const [session, updatedBook] = await this.prisma.$transaction([
      this.prisma.readingSession.create({
        data: { bookId: id, page: dto.page, date: dto.date },
      }),
      this.prisma.book.update({
        where: { id },
        data: { current: dto.page, status },
        include: { sessions: { orderBy: { createdAt: 'asc' } } },
      }),
    ]);

    return updatedBook;
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.readingSession.deleteMany({ where: { bookId: id } });
    return this.prisma.book.delete({ where: { id } });
  }
}