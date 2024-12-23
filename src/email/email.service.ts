import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AuthUtils } from 'src/auth/utils/authUtils';
import { ElasticSearchService } from 'src/elastic-search/elastic-search.service';
import { UserService } from 'src/user/user.service';
import { SyncInputDto } from './dto/sync-emails.input';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private readonly elasticsearchService: ElasticSearchService,
    private readonly httpService: HttpService
  ) { }


  async syncEmails(syncEmailsInputDto: SyncInputDto) {
    const { userId, accessToken, deltaLink } = syncEmailsInputDto;
    const maxRetries = 5; // Maximum retries for API requests
    const pageSize = 50; // Number of items per page
    const baseURL = deltaLink || 'https://graph.microsoft.com/v1.0/me/messages';

    let nextLink = baseURL;

    while (nextLink) {
      try {
        // Fetch data with retries
        const response = await this.fetchEmailsWithRetry(nextLink, accessToken, maxRetries, pageSize);

        const emails = response.data.value.map((email) => {
          return {
            _id: email.id,
            sender: email.sender?.emailAddress,
            from: email.sender?.emailAddress,
            toRecipients: email.toRecipients.length ? email.toRecipients.map((recipient) => recipient.emailAddress) : [],
            ccRecipients: email.ccRecipients.length ? email.ccRecipients.map((recipient) => recipient.emailAddress) : [],
            bccRecipients: email.bccRecipients.length ? email.bccRecipients.map((recipient) => recipient.emailAddress) : [],
            isRead: email.isRead,
            isDraft: email.isDraft,
            subject: email.subject,
            bodyPreview: email.bodyPreview,
            importance: email.importance,
            receivedDateTime: email.receivedDateTime?.toString(),
            sentDateTime: email.sentDateTime?.toString(),
          }
        });

        this.logger.log(`Fetched ${emails.length} emails for user ${userId}`);

        // Index emails in Elasticsearch
        for (const email of emails) {
          try {
            await this.elasticsearchService.syncEmailToElasticsearch(userId, email);
          } catch (error) {
            this.logger.error(`Failed to index email ${email.id} for user ${userId}`, error.stack);
            throw new Error(error.message)
          }
        }

        // Handle pagination and delta links
        nextLink = response.data['@odata.nextLink'];
        if (response.data['@odata.deltaLink']) {
          await this.elasticsearchService.saveDeltaLink(userId, response.data['@odata.deltaLink']);
        }
      } catch (err) {
        this.logger.error(`Failed to sync emails for user ${userId}: ${err.message}`, err.stack);
        break;
      }
    }

    this.logger.log(`Email synchronization completed for user ${userId}`);
  }


  private async fetchEmailsWithRetry(
    url: string,
    accessToken: string,
    maxRetries: number,
    pageSize: number,
  ) {
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        // Make the API request with pagination
        return await firstValueFrom(
          this.httpService.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { $top: pageSize }, // Ensures paginated requests
          }),
        );
      } catch (err) {
        attempts++;
        if (err.response && err.response.status === 429) {
          // Handle rate limiting
          const retryAfter = err.response.headers['Retry-After'] || 1;
          this.logger.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
          await this.delay(retryAfter * 1000);
        } else {
          this.logger.error(`Error fetching data: ${err.message}`, err.stack);
          if (attempts >= maxRetries) throw err; // Re-throw after max retries
        }
      }
    }

    throw new Error('Max retries reached while fetching data.');
  }

  async syncMailboxDetails(syncInputDto: SyncInputDto): Promise<void> {
    const { userId, accessToken, deltaLink } = syncInputDto;
    const maxRetries = 5; // Maximum retries for API requests
    const pageSize = 50; // Number of items per page
    const baseURL = deltaLink || 'https://graph.microsoft.com/v1.0/me/mailFolders';

    let nextLink = baseURL;

    while (nextLink) {
      try {
        // Fetch mailbox data with retries
        const response = await this.fetchMailboxDetailsWithRetry(nextLink, accessToken, maxRetries, pageSize);

        const mailboxes = response.data.value.map((folder) => {
          return {
            _id: folder.id,
            displayName: folder.displayName,
            parentFolderId: folder.parentFolderId,
            childFolderCount: folder.childFolderCount,
            totalItemCount: folder.totalItemCount,
            unreadItemCount: folder.unreadItemCount,
            wellKnownName: folder.wellKnownName,
          };
        });

        this.logger.log(`Fetched ${mailboxes.length} mailbox folders for user ${userId}`);

        // Index mailbox details in Elasticsearch
        for (const mailbox of mailboxes) {
          try {
            await this.elasticsearchService.syncMailboxToElasticsearch(userId, mailbox);
          } catch (error) {
            this.logger.error(`Failed to index mailbox folder ${mailbox._id} for user ${userId}`, error.stack);
            throw new Error(error.message);
          }
        }

        nextLink = response.data['@odata.nextLink'];
        if (response.data['@odata.deltaLink']) {
          await this.elasticsearchService.saveMailboxDeltaLink(userId, response.data['@odata.deltaLink']);
        }
      } catch (err) {
        this.logger.error(`Failed to sync mailbox details for user ${userId}: ${err.message}`, err.stack);
        break;
      }
    }

    this.logger.log(`Mailbox synchronization completed for user ${userId}`);
  }

  private async fetchMailboxDetailsWithRetry(
    url: string,
    accessToken: string,
    maxRetries: number,
    pageSize: number,
  ) {
    let attempts = 0;

    while (attempts < maxRetries) {
      try {
        // Make the API request with pagination
        return await firstValueFrom(
          this.httpService.get(url, {
            headers: { Authorization: `Bearer ${accessToken}` },
            params: { $top: pageSize }, // Ensures paginated requests
          }),
        );
      } catch (err) {
        attempts++;
        if (err.response && err.response.status === 429) {
          // Handle rate limiting
          const retryAfter = err.response.headers['Retry-After'] || 1;
          this.logger.warn(`Rate limited. Retrying after ${retryAfter} seconds...`);
          await this.delay(retryAfter * 1000);
        } else {
          this.logger.error(`Error fetching mailbox data: ${err.message}`, err.stack);
          if (attempts >= maxRetries) throw err; // Re-throw after max retries
        }
      }
    }

    throw new Error('Max retries reached while fetching mailbox data.');
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async fetchAllEmailsDataOfUser(userId: string, page: number = 1, pageSize: number = 10) {
    try {
      const response = await this.elasticsearchService.fetchAllEmailsDataOfUser(userId, page, pageSize);
      return {
        emails: response.emails,
        total: response.total,
        page,
        pageSize,
        totalPages: Math.ceil(response.total / pageSize), // Calculate total pages
      };
    } catch (error) {
      throw new Error(`Error fetching paginated emails: ${error.message}`);
    }
  }

  async fetchAllMailboxDataOfUser(userId: string, page: number = 1, pageSize: number = 10) {
    try {
      const response = await this.elasticsearchService.fetchAllMailboxDataOfUser(userId, page, pageSize);
      return {
        mailbox: response.mailbox,
        total: response.total,
        page,
        pageSize,
        totalPages: Math.ceil(response.total / pageSize),
      };
    } catch (error) {
      throw new Error(`Error fetching paginated mailbox: ${error.message}`);
    }
  }
}

