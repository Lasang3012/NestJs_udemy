import { UserEntity } from './../user/user.entity';
import { TagService } from './../tag/tag.service';
import { TagEntity } from './../tag/tag.entity';
import { ArticleEntity } from './article.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { Module } from '@nestjs/common';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, TagEntity, UserEntity])],
  controllers: [ArticleController],
  providers: [ArticleService, TagService],
})
export class ArticleModule {}
