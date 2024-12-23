import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PollingScheduler } from './polling.scheduler';
import { EmailModule } from 'src/email/email.module';
import { UserModule } from 'src/user/user.module';
import { ElasticsearchModule } from 'src/elastic-search/elastic-search.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [ScheduleModule.forRoot(), EmailModule, UserModule, ElasticsearchModule, AuthModule],
  providers: [PollingScheduler],
  exports: [PollingScheduler]
})
export class SchedulerModule { }
