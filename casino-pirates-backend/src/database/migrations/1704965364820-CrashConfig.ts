import { MigrationInterface, QueryRunner } from 'typeorm';

export class CrashConfig1704965364820 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const currentTime = new Date();

    await queryRunner.query(`
    INSERT INTO config (option_key, option_value, option_type, "createdAt", "updatedAt")
    VALUES
      ('crash.MaxWin', '20', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
      ('crash.MaxBet', '1.5', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
      ('crash.MinBet', '0.001', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
      ('crash.allowBets', 'true', 'boolean', '${currentTime.toISOString()}', '${currentTime.toISOString()}')
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    DELETE FROM config
    WHERE option_key IN ('crash.MaxWin', 'crash.MaxBet', 'crash.MinBet', 'crash.allowBets');
  `);
  }
}
