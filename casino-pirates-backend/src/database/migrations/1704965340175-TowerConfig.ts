import { MigrationInterface, QueryRunner } from 'typeorm';

export class TowerConfig1704965340175 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const currentTime = new Date();

    await queryRunner.query(`
      INSERT INTO config (option_key, option_value, option_type, "createdAt", "updatedAt")
      VALUES
        ('tower.MaxWin', '500', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('tower.MaxAmount', '50', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('tower.MinAmount', '1', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('tower.Status', '1', 'boolean', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('tower.LuckyMultiplier', '3', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the inserted records for the "tower" options during rollback
    await queryRunner.query(`
      DELETE FROM config
      WHERE option_key IN (
        'tower.MaxWin',
        'tower.MaxAmount',
        'tower.MinAmount',
        'tower.Status',
        'tower.LuckyMultiplier'
      );
    `);
  }
}
