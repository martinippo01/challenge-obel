import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedUsers1713817300000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Insert sample users with UUID and timestamps
    await queryRunner.query(
      `INSERT INTO "users" ("id", "email", "firstName", "lastName", "password", "isActive", "createdAt", "updatedAt") VALUES
        ('550e8400-e29b-41d4-a716-446655440001', 'john.doe@example.com', 'John', 'Doe', 'hashed_password_1', true, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440002', 'jane.smith@example.com', 'Jane', 'Smith', 'hashed_password_2', true, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440003', 'bob.johnson@example.com', 'Bob', 'Johnson', 'hashed_password_3', true, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440004', 'alice.williams@example.com', 'Alice', 'Williams', 'hashed_password_4', true, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440005', 'charlie.brown@example.com', 'Charlie', 'Brown', 'hashed_password_5', false, NOW(), NOW())`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete seeded users (optional - you can also just clear all users)
    await queryRunner.query(
      `DELETE FROM "users" WHERE "email" IN (
        'john.doe@example.com',
        'jane.smith@example.com',
        'bob.johnson@example.com',
        'alice.williams@example.com',
        'charlie.brown@example.com'
      )`,
    );
  }
}
