import { MigrationInterface, QueryRunner } from 'typeorm';

export class ManytoManyArticleTag1665832124206 implements MigrationInterface {
  name = 'ManytoManyArticleTag1665832124206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "article_tags_tags" ("articleId" integer NOT NULL, "tagsId" integer NOT NULL, CONSTRAINT "PK_89870c729391c9aa800154e27a3" PRIMARY KEY ("articleId", "tagsId"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2d94b2196bce6f2faa14282709" ON "article_tags_tags" ("articleId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8fb2ff3d6e2f0ebc8ed660a761" ON "article_tags_tags" ("tagsId") `,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags_tags" ADD CONSTRAINT "FK_2d94b2196bce6f2faa142827099" FOREIGN KEY ("articleId") REFERENCES "article"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags_tags" ADD CONSTRAINT "FK_8fb2ff3d6e2f0ebc8ed660a761c" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article_tags_tags" DROP CONSTRAINT "FK_8fb2ff3d6e2f0ebc8ed660a761c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_tags_tags" DROP CONSTRAINT "FK_2d94b2196bce6f2faa142827099"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8fb2ff3d6e2f0ebc8ed660a761"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2d94b2196bce6f2faa14282709"`,
    );
    await queryRunner.query(`DROP TABLE "article_tags_tags"`);
  }
}
