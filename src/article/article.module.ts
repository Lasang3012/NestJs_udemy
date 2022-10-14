import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { Module } from '@nestjs/common';

@Module({
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}