import { Module } from '@nestjs/common';
import { PrismaService } from '././prisma/prisma.service';
import { BooksModule } from '././books/books.module';

@Module({
  imports: [BooksModule],
  providers: [PrismaService],
})
export class AppModule {}
