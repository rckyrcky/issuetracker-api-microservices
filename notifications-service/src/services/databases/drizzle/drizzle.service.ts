import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DATABASE_URL } from 'src/common/constants';

@Injectable()
export class DrizzleService implements OnModuleInit, OnModuleDestroy {
  private database: ReturnType<typeof drizzle>;
  private pool: Pool;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.pool = new Pool({
      connectionString: this.configService.get(DATABASE_URL),
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });
    this.database = drizzle({ client: this.pool });
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  db() {
    return this.database;
  }
}
