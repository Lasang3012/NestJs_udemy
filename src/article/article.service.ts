import { ArticlesResponseInterface } from './types/articlesResponse.interface';
import { TagService } from './../tag/tag.service';
import { UpdateArticleDto } from './dto/updateArticle.dto';
import { UserEntity } from '@app/user/user.entity';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository, DataSource, Entity, Any } from 'typeorm';
import slugify from 'slugify';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { FollowEntity } from '@app/profile/follow.entity';

@Injectable()
export class ArticleService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,

    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,

    @InjectRepository(FollowEntity)
    private readonly followRepository: Repository<FollowEntity>,

    private readonly tagService: TagService,
    private dataSource: DataSource,
  ) {}

  async findAll(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author');

    if (query.author) {
      const author = await this.userRepository.findOne({
        where: { username: query.author },
      });
      queryBuilder.andWhere('articles.authorId = :id', { id: author.id });
    }

    if (query.favorited) {
      const author = await this.userRepository.findOne({
        where: { username: query.favorited },
        relations: ['favorites'],
      });

      const ids = author.favorites.map((el) => el.id);
      if (ids.length > 0) {
        queryBuilder.andWhere('articles.id IN (:...ids)', { ids });
      } else {
        queryBuilder.andWhere('1=0');
      }
    }

    queryBuilder.orderBy('articles.createdAt', 'DESC');
    const articlesCount = await queryBuilder.getCount();
    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    let favoriteIds: number[] = [];
    if (currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: currentUserId },
        relations: ['favorites'],
      });
      favoriteIds = currentUser.favorites.map((favorite) => favorite.id);
    }

    const articles = await queryBuilder.getMany();
    const articlesWithFavorited = articles.map((article) => {
      const favorited = favoriteIds.includes(article.id);
      return { ...article, favorited };
    });

    return { articles: articlesWithFavorited, articlesCount };
  }

  async getFeed(
    currentUserId: number,
    query: any,
  ): Promise<ArticlesResponseInterface> {
    const follows = await this.followRepository.find({
      where: {
        followerId: currentUserId,
      },
    });

    if (follows.length === 0) {
      return { articles: [], articlesCount: 0 };
    }

    const followingUserIds = follows.map((follow) => follow.followingId);

    const queryBuilder = this.dataSource
      .getRepository(ArticleEntity)
      .createQueryBuilder('articles')
      .leftJoinAndSelect('articles.author', 'author')
      .where('articles.authorId IN(:...ids)', { ids: followingUserIds });

    queryBuilder.orderBy('articles.createdAt', 'DESC');

    const articlesCount = await queryBuilder.getCount();

    if (query.limit) {
      queryBuilder.limit(query.limit);
    }
    if (query.offset) {
      queryBuilder.offset(query.offset);
    }

    const articles = await queryBuilder.getMany();

    return { articles, articlesCount };
  }

  async createArticle(
    currentUser: UserEntity,
    createArticleDto: CreateArticleDto,
  ) {
    const article = new ArticleEntity();
    Object.assign(article, createArticleDto);

    if (!article.tagList) {
      article.tagList = [];
    }

    article.slug = this.getSlug(createArticleDto.title);

    article.author = currentUser;

    return await this.articleRepository.save(article);
  }

  async findBySlug(slug: string) {
    const result = await this.articleRepository.findOne({ where: { slug } });
    if (!slug) {
      const errors = { Slug: 'not found' };
      throw new HttpException({ errors }, 401);
    }

    // get Name of Tag
    // const getAbc = await Promise.all(
    //   result.tagList.map((el) => this.tagService.findTagById(parseInt(el))),
    // );
    // result.tagList = await Promise.all(getAbc.map((el) => el.name));

    return result;
  }

  async deleteArticle(
    slug: string,
    currentUserId: number,
  ): Promise<DeleteResult> {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== currentUserId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }
    return await this.articleRepository.delete({ slug });
  }

  async updateArticle(
    userId: number,
    slug: string,
    updateArticleDto: UpdateArticleDto,
  ) {
    const article = await this.findBySlug(slug);
    if (!article) {
      throw new HttpException('Article does not exist', HttpStatus.NOT_FOUND);
    }
    if (article.author.id !== userId) {
      throw new HttpException('You are not an author', HttpStatus.FORBIDDEN);
    }
    article.slug = this.getSlug(updateArticleDto.title);
    Object.assign(article, updateArticleDto);
    return await this.articleRepository.save(article);
  }

  async addArticleToFavorites(
    slug: string,
    currentUserId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    const user = await this.userRepository.findOne({
      where: { id: currentUserId },
      relations: ['favorites'],
    });

    const isNotFavorited =
      user.favorites.findIndex(
        (articleInFavorites) => articleInFavorites.id === article.id,
      ) === -1;

    if (isNotFavorited) {
      user.favorites.push(article);
      article.favoritesCount++;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  //deleteArticleFromFavorites
  async deleteArticleFromFavorites(
    slug: string,
    userId: number,
  ): Promise<ArticleEntity> {
    const article = await this.findBySlug(slug);
    console.log('ppppppppppp ', article);
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favorites'],
    });

    console.log('bbbbbbb');

    const articleIndex = user.favorites.findIndex(
      (articleFavorites) => articleFavorites.id === article.id,
    );

    console.log('aaaaaaaa', articleIndex);

    if (articleIndex >= 0) {
      user.favorites.splice(articleIndex, 1);
      article.favoritesCount--;
      await this.userRepository.save(user);
      await this.articleRepository.save(article);
    }

    return article;
  }

  buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
    return { article };
  }

  private getSlug(title: string): string {
    return (
      slugify(title, { lower: true }) +
      '-' +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36)
    );
  }
}
