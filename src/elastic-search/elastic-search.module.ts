import { Module } from '@nestjs/common';
import { ElasticSearchService } from './elastic-search.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  providers: [ElasticSearchService],
  exports: [ElasticSearchService],
})
export class ElasticsearchModule { }
