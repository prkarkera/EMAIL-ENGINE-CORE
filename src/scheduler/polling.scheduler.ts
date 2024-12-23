import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthUtils } from 'src/auth/utils/authUtils';
import { ElasticSearchService } from 'src/elastic-search/elastic-search.service';
import { EmailService } from 'src/email/email.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class PollingScheduler {
    private readonly logger = new Logger(PollingScheduler.name);
    constructor(
        private readonly emailsService: EmailService,
        private readonly usersService: UserService,
        private readonly elasticsearchService: ElasticSearchService,
        private readonly authUtils: AuthUtils
    ) { }


    @Cron(CronExpression.EVERY_30_MINUTES)
    async handleEmailSync() {
        const users = await this.usersService.getAllUsers();
        if (users.length) {
            for (const user of users) {
                try {
                    const accessToken = this.authUtils.decryptData(user.accessToken)
                    const deltaLink = await this.elasticsearchService.getDeltaLink(user.id);
                    await this.emailsService.syncEmails({ userId: user.id, accessToken, deltaLink });
                    await this.emailsService.syncMailboxDetails({ userId: user.id, accessToken, deltaLink });

                } catch (err) {
                    this.logger.error(`Failed to sync emails for user ${user.id}`, err.stack);
                }
            }
        }
    }
}


