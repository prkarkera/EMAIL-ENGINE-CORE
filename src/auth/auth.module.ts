import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { AuthUtils } from './utils/authUtils';
import { ElasticsearchModule } from 'src/elastic-search/elastic-search.module';
import { EmailModule } from 'src/email/email.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ElasticsearchModule,
    forwardRef(() => EmailModule)
  ],
  providers: [AuthService, AuthUtils],
  exports: [AuthService, AuthUtils],
  controllers: [AuthController]
})
export class AuthModule { }
