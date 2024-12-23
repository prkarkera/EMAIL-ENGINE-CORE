import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { AuthModule } from 'src/auth/auth.module';
import { ElasticsearchModule } from 'src/elastic-search/elastic-search.module';

@Module({
  imports: [AuthModule, ElasticsearchModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule { }
