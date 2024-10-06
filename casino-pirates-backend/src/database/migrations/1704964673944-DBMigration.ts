import { MigrationInterface, QueryRunner } from 'typeorm';

export class DBMigration1704964673944 implements MigrationInterface {
  name = 'DBMigration1704964673944';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "role" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "status" ("id" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_e12743a7086ec826733f54e1d95" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "file" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "path" character varying NOT NULL, CONSTRAINT "PK_36b46d232307066b3a2c9ea3a1d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."game-history_game_enum" AS ENUM('0', '1', '2', '3')`,
    );
    await queryRunner.query(
      `CREATE TABLE "game-history" ("id" SERIAL NOT NULL, "gameId" character varying NOT NULL, "game" "public"."game-history_game_enum" NOT NULL, "profit" numeric(18,9) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer NOT NULL, CONSTRAINT "PK_356d320c7392f43c172eb1ffee8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "message" character varying NOT NULL, "likedBy" integer array NOT NULL DEFAULT '{}', "repliedTo" uuid, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer NOT NULL, CONSTRAINT "PK_ba01f0a3e0123651915008bc578" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user_settings" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "hideStats" boolean NOT NULL DEFAULT false, "isAnonymous" boolean NOT NULL DEFAULT false, "soundEffects" boolean NOT NULL DEFAULT true, "notifications" boolean NOT NULL DEFAULT true, "userId" integer NOT NULL, CONSTRAINT "UQ_986a2b6d3c05eb4091bb8066f78" UNIQUE ("userId"), CONSTRAINT "REL_986a2b6d3c05eb4091bb8066f7" UNIQUE ("userId"), CONSTRAINT "PK_00f004f5922a0744d174530d639" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" SERIAL NOT NULL, "balance" numeric(18,9) NOT NULL DEFAULT '0', "bonus_balance" numeric(18,9) NOT NULL DEFAULT '0', "username" character varying, "roleId" integer NOT NULL, "statusId" integer NOT NULL, "referralCode" character varying, "referredById" integer, "level" integer NOT NULL DEFAULT '1', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "photoId" uuid, CONSTRAINT "UQ_bf0e513b5cd8b4e937fa0702311" UNIQUE ("referralCode"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_dc18daa696860586ba4667a9d3" ON "user" ("statusId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "wallet" ("id" SERIAL NOT NULL, "chainTypeId" integer NOT NULL, "address" character varying NOT NULL, "userId" integer NOT NULL, "isPrimary" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_66dbfd38c2af50c8763785917d" ON "wallet" ("chainTypeId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_35472b1fe48b6330cd34970956" ON "wallet" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TABLE "chain_type" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_82cfa5bb5b2f15c791faf2e109a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "currencies" ("id" SERIAL NOT NULL, "cmcId" integer NOT NULL, "priceUsd" numeric(18,9) NOT NULL, "price" numeric(18,9) NOT NULL, "imageUrl" character varying NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_d528c54860c4182db13548e08c4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chain_currencies" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "address" character varying NOT NULL, "currencyId" integer NOT NULL, CONSTRAINT "UQ_e62966da76b12245f7152fa719a" UNIQUE ("chainId", "currencyId", "address"), CONSTRAINT "PK_d4533acf2222eb0a8ea88a40c0b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "transactions" ("id" SERIAL NOT NULL, "chainId" integer NOT NULL, "currencyId" integer NOT NULL, "userId" integer NOT NULL, "status" character varying NOT NULL, "hash" character varying NOT NULL, "usdValue" numeric(18,9) NOT NULL, "blockNumber" bigint NOT NULL, "amount" numeric(18,9) NOT NULL, "blockTimestamp" integer NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_8ef2b243edbc9ace8a2eaaaa896" UNIQUE ("hash", "chainId"), CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "chains" ("id" SERIAL NOT NULL, "chainTypeId" integer NOT NULL, "depositAddress" character varying NOT NULL, "slug" character varying NOT NULL, "cronCheckDeposit" character varying NOT NULL, "rpc_url" character varying NOT NULL, "isActive" boolean NOT NULL DEFAULT false, "lastChecked" TIMESTAMP DEFAULT 'now()', CONSTRAINT "PK_f3c6ca7e7ad0f451e3b8f3dd378" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."crash_state_enum" AS ENUM('prepare', 'active', 'crashed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "crash" ("id" SERIAL NOT NULL, "gameId" character varying NOT NULL, "round_hash" character varying NOT NULL, "round_salt" character varying NOT NULL, "round_random" numeric(16,16) NOT NULL, "round_number" numeric(8,2) NOT NULL, "win_sum" numeric(18,9) NOT NULL, "bet_sum" numeric(18,9) NOT NULL, "state" "public"."crash_state_enum" NOT NULL, CONSTRAINT "PK_bcf9bc3a723122e8226e6a89759" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."crash-bet_state_enum" AS ENUM('active', 'cashout', 'crashed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "crash-bet" ("id" SERIAL NOT NULL, "betId" character varying NOT NULL, "multiplier" numeric(8,2), "amount" numeric(18,9) NOT NULL, "initialBet" numeric(18,9) NOT NULL, "winAmount" numeric(18,9) NOT NULL, "autoCashOut" numeric(8,2) DEFAULT '0', "state" "public"."crash-bet_state_enum" NOT NULL, "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "gameId" integer, "userId" integer, CONSTRAINT "PK_db68068216a651e6376ed80af8b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "referral" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "referrerId" integer, "referredId" integer, CONSTRAINT "PK_a2d3e935a6591168066defec5ad" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "session" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."mines_state_enum" AS ENUM('IN_PROGRESS', 'LOST', 'CASHED_OUT', 'FINISHED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "mines" ("id" SERIAL NOT NULL, "gameId" character varying NOT NULL, "generatedMap" jsonb NOT NULL, "userMap" jsonb NOT NULL, "profitSteps" jsonb NOT NULL, "mines" integer NOT NULL, "tilesOpened" integer NOT NULL, "initialBet" numeric(18,9) NOT NULL DEFAULT '0', "betAmount" numeric(18,9) NOT NULL DEFAULT '0', "profit" numeric(18,9) NOT NULL DEFAULT '0', "multiplier" numeric(18,9) NOT NULL DEFAULT '0', "state" "public"."mines_state_enum" NOT NULL DEFAULT 'IN_PROGRESS', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_92ece89c5f00ec1f5b3c697bd1f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."gems_state_enum" AS ENUM('WIN', 'LOSE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."gems_difficulty_enum" AS ENUM('EASY', 'MEDIUM', 'HARD')`,
    );
    await queryRunner.query(
      `CREATE TABLE "gems" ("id" SERIAL NOT NULL, "generatedGems" text, "prize" integer NOT NULL, "initialBet" numeric(18,9) NOT NULL DEFAULT '0', "betAmount" numeric(18,9) NOT NULL, "profit" numeric(18,9) NOT NULL, "multiplier" numeric(18,9) NOT NULL, "state" "public"."gems_state_enum" NOT NULL DEFAULT 'LOSE', "difficulty" "public"."gems_difficulty_enum" NOT NULL DEFAULT 'EASY', "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_98f44dd5aa13edd78a49e5e5b2a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "withdrawal" ("id" SERIAL NOT NULL, "amount" numeric NOT NULL, "status" character varying(45) NOT NULL, "verifiedByCronJob" boolean NOT NULL DEFAULT false, "requestedAt" TIMESTAMP NOT NULL DEFAULT now(), "processedAt" TIMESTAMP, "userId" integer, "chainId" integer, "currencyId" integer, CONSTRAINT "PK_840e247aaad3fbd4e18129122a2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tower_difficulty_enum" AS ENUM('EASY', 'MEDIUM', 'HARD', 'EXTREME', 'NIGHTMARE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."tower_state_enum" AS ENUM('IN_PROGRESS', 'LOST', 'CASHED_OUT', 'FINISHED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "tower" ("id" SERIAL NOT NULL, "gameId" character varying NOT NULL, "generatedMap" jsonb NOT NULL, "userMap" jsonb NOT NULL, "profitSteps" jsonb NOT NULL, "tilesOpened" integer, "activeRow" integer, "initialBet" numeric(18,9) NOT NULL DEFAULT '0', "betAmount" numeric(18,9) NOT NULL DEFAULT '0', "profit" numeric(18,9) NOT NULL DEFAULT '0', "multiplier" numeric(18,9) NOT NULL DEFAULT '0', "difficulty" "public"."tower_difficulty_enum" NOT NULL DEFAULT 'EASY', "state" "public"."tower_state_enum" NOT NULL DEFAULT 'IN_PROGRESS', "createdAt" TIMESTAMP DEFAULT now(), "updatedAt" TIMESTAMP DEFAULT now(), "deletedAt" TIMESTAMP, "userId" integer, CONSTRAINT "PK_22ea320536a371e2f7685b350e7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "config" ("id" SERIAL NOT NULL, "option_key" character varying(255) NOT NULL, "option_value" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "option_type" character varying NOT NULL, CONSTRAINT "PK_d0ee79a681413d50b0a4f98cf7b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "game-history" ADD CONSTRAINT "FK_69d78c5c23b418cffc2a4e987b5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" ADD CONSTRAINT "FK_446251f8ceb2132af01b68eb593" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" ADD CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f" FOREIGN KEY ("photoId") REFERENCES "file"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_c28e52f758e7bbc53828db92194" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_dc18daa696860586ba4667a9d31" FOREIGN KEY ("statusId") REFERENCES "status"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD CONSTRAINT "FK_adc492faf309ebf60ca6425e183" FOREIGN KEY ("referredById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ADD CONSTRAINT "FK_66dbfd38c2af50c8763785917da" FOREIGN KEY ("chainTypeId") REFERENCES "chain_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ADD CONSTRAINT "FK_35472b1fe48b6330cd349709564" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chain_currencies" ADD CONSTRAINT "FK_1a6d4fc3e4e7b241efa30b506ac" FOREIGN KEY ("chainId") REFERENCES "chains"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chain_currencies" ADD CONSTRAINT "FK_8e8e31dbe550545c4ca25d4102b" FOREIGN KEY ("currencyId") REFERENCES "currencies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_89de751d3265e411a089b8e407f" FOREIGN KEY ("currencyId") REFERENCES "chain_currencies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_80e16cc0688df0b39fd9a04ec8c" FOREIGN KEY ("chainId") REFERENCES "chains"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" ADD CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "chains" ADD CONSTRAINT "FK_621ab03be95a8a1baf93223bfa8" FOREIGN KEY ("chainTypeId") REFERENCES "chain_type"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crash-bet" ADD CONSTRAINT "FK_1739ce6c7992dd9dd3f939cd829" FOREIGN KEY ("gameId") REFERENCES "crash"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "crash-bet" ADD CONSTRAINT "FK_59d81869b2f56025ab1dbe07bb5" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral" ADD CONSTRAINT "FK_ec295d220eaab068ed5147e8582" FOREIGN KEY ("referrerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral" ADD CONSTRAINT "FK_3dc3412b37ffee2f890bf0792f8" FOREIGN KEY ("referredId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "mines" ADD CONSTRAINT "FK_a5be43bd3010b64255d15284c28" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "gems" ADD CONSTRAINT "FK_eb62f66c6d6b8ac268159347521" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "withdrawal" ADD CONSTRAINT "FK_6eb34227c6d10e54e2d0d3f575f" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "withdrawal" ADD CONSTRAINT "FK_5b8527d5a224b762225a12dc7f9" FOREIGN KEY ("chainId") REFERENCES "chains"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "withdrawal" ADD CONSTRAINT "FK_8c8b9a86fdea628ed17b1824485" FOREIGN KEY ("currencyId") REFERENCES "chain_currencies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "tower" ADD CONSTRAINT "FK_43f7ded15af75d755428ae45fd6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tower" DROP CONSTRAINT "FK_43f7ded15af75d755428ae45fd6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "withdrawal" DROP CONSTRAINT "FK_8c8b9a86fdea628ed17b1824485"`,
    );
    await queryRunner.query(
      `ALTER TABLE "withdrawal" DROP CONSTRAINT "FK_5b8527d5a224b762225a12dc7f9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "withdrawal" DROP CONSTRAINT "FK_6eb34227c6d10e54e2d0d3f575f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "gems" DROP CONSTRAINT "FK_eb62f66c6d6b8ac268159347521"`,
    );
    await queryRunner.query(
      `ALTER TABLE "mines" DROP CONSTRAINT "FK_a5be43bd3010b64255d15284c28"`,
    );
    await queryRunner.query(
      `ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral" DROP CONSTRAINT "FK_3dc3412b37ffee2f890bf0792f8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "referral" DROP CONSTRAINT "FK_ec295d220eaab068ed5147e8582"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crash-bet" DROP CONSTRAINT "FK_59d81869b2f56025ab1dbe07bb5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "crash-bet" DROP CONSTRAINT "FK_1739ce6c7992dd9dd3f939cd829"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chains" DROP CONSTRAINT "FK_621ab03be95a8a1baf93223bfa8"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_6bb58f2b6e30cb51a6504599f41"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_80e16cc0688df0b39fd9a04ec8c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "transactions" DROP CONSTRAINT "FK_89de751d3265e411a089b8e407f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chain_currencies" DROP CONSTRAINT "FK_8e8e31dbe550545c4ca25d4102b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "chain_currencies" DROP CONSTRAINT "FK_1a6d4fc3e4e7b241efa30b506ac"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" DROP CONSTRAINT "FK_35472b1fe48b6330cd349709564"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" DROP CONSTRAINT "FK_66dbfd38c2af50c8763785917da"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_adc492faf309ebf60ca6425e183"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_dc18daa696860586ba4667a9d31"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_c28e52f758e7bbc53828db92194"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" DROP CONSTRAINT "FK_75e2be4ce11d447ef43be0e374f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_settings" DROP CONSTRAINT "FK_986a2b6d3c05eb4091bb8066f78"`,
    );
    await queryRunner.query(
      `ALTER TABLE "message" DROP CONSTRAINT "FK_446251f8ceb2132af01b68eb593"`,
    );
    await queryRunner.query(
      `ALTER TABLE "game-history" DROP CONSTRAINT "FK_69d78c5c23b418cffc2a4e987b5"`,
    );
    await queryRunner.query(`DROP TABLE "config"`);
    await queryRunner.query(`DROP TABLE "tower"`);
    await queryRunner.query(`DROP TYPE "public"."tower_state_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tower_difficulty_enum"`);
    await queryRunner.query(`DROP TABLE "withdrawal"`);
    await queryRunner.query(`DROP TABLE "gems"`);
    await queryRunner.query(`DROP TYPE "public"."gems_difficulty_enum"`);
    await queryRunner.query(`DROP TYPE "public"."gems_state_enum"`);
    await queryRunner.query(`DROP TABLE "mines"`);
    await queryRunner.query(`DROP TYPE "public"."mines_state_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`,
    );
    await queryRunner.query(`DROP TABLE "session"`);
    await queryRunner.query(`DROP TABLE "referral"`);
    await queryRunner.query(`DROP TABLE "crash-bet"`);
    await queryRunner.query(`DROP TYPE "public"."crash-bet_state_enum"`);
    await queryRunner.query(`DROP TABLE "crash"`);
    await queryRunner.query(`DROP TYPE "public"."crash_state_enum"`);
    await queryRunner.query(`DROP TABLE "chains"`);
    await queryRunner.query(`DROP TABLE "transactions"`);
    await queryRunner.query(`DROP TABLE "chain_currencies"`);
    await queryRunner.query(`DROP TABLE "currencies"`);
    await queryRunner.query(`DROP TABLE "chain_type"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_35472b1fe48b6330cd34970956"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_35472b1fe48b6330cd34970956"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_66dbfd38c2af50c8763785917d"`,
    );
    await queryRunner.query(`DROP TABLE "wallet"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_dc18daa696860586ba4667a9d3"`,
    );
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TABLE "user_settings"`);
    await queryRunner.query(`DROP TABLE "message"`);
    await queryRunner.query(`DROP TABLE "game-history"`);
    await queryRunner.query(`DROP TYPE "public"."game-history_game_enum"`);
    await queryRunner.query(`DROP TABLE "file"`);
    await queryRunner.query(`DROP TABLE "status"`);
    await queryRunner.query(`DROP TABLE "role"`);
  }
}
