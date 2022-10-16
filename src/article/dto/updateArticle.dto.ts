import { IsNotEmpty } from 'class-validator';

export class UpdateArticleDto {
  readonly title: string;
  readonly slug: string;

  readonly description: string;

  readonly body: string;

  readonly tagList?: string[];
}
