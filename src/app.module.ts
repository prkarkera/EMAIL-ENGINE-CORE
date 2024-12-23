import { Module } from '@nestjs/common';
import { EmailModule } from './email/email.module';
import { ElasticsearchModule } from './elastic-search/elastic-search.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [EmailModule, ElasticsearchModule, AuthModule, UserModule, SchedulerModule],
  providers: [],
})
export class AppModule { }
