import { MigrationInterface, QueryRunner } from 'typeorm';

export class GemsConfig1704965353178 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const currentTime = new Date();

    await queryRunner.query(`
      INSERT INTO config (option_key, option_value, option_type, "createdAt", "updatedAt")
      VALUES
        ('gems.MaxWin', '1000', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('gems.MaxAmount', '100', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('gems.MinAmount', '1', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('gems.Status', '1', 'boolean', '${currentTime.toISOString()}', '${currentTime.toISOString()}'),
        ('gems.LuckyMultiplier', '5', 'number', '${currentTime.toISOString()}', '${currentTime.toISOString()}');
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the inserted records for the "gems" options during rollback
    await queryRunner.query(`
      DELETE FROM config
      WHERE option_key IN (
        'gems.MaxWin',
        'gems.MaxAmount',
        'gems.MinAmount',
        'gems.Status',
        'gems.LuckyMultiplier'
      );
    `);
  }
}
