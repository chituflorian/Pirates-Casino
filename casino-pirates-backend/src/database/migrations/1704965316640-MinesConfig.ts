import { MigrationInterface, QueryRunner } from 'typeorm';

export class MinesConfig1704965316640 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const currentTime = new Date();

    await queryRunner.query(`
      INSERT INTO config (option_key, option_value, option_type, "createdAt", "updatedAt")
      VALUES
        ('mines.MaxWin', '500', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('mines.MaxAmount', '50', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('mines.MinAmount', '1', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('mines.Status', '1', 'boolean', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('mines.LuckyMultiplier', '3', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the inserted records for the "mines" options during rollback
    await queryRunner.query(`
      DELETE FROM config
      WHERE option_key IN (
        'mines.MaxWin',
        'mines.MaxAmount',
        'mines.MinAmount',
        'mines.Status',
        'mines.LuckyMultiplier'
      );
    `);
  }
}
