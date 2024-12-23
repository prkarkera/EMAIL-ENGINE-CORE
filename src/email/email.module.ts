import { forwardRef, Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { ElasticsearchModule } from 'src/elastic-search/elastic-search.module';
import { HttpModule } from '@nestjs/axios';
import { EmailController } from './email.controller';
import { UserModule } from 'src/user/user.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    ElasticsearchModule,
    HttpModule,
    UserModule,
    forwardRef(() => AuthModule)
  ],
  providers: [EmailService],
  exports: [EmailService],
  controllers: [EmailController],
})
export class EmailModule { }
