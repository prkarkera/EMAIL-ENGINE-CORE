import { Injectable } from '@nestjs/common';
import { Client } from '@elastic/elasticsearch';
import { INDEXES } from 'src/constants';
import { EmailDataDto } from 'src/email/dto/emailDataDto';
import { SearchTotalHits } from '@elastic/elasticsearch/lib/api/types';

@Injectable()
export class ElasticSearchService {
  private client: Client;

  constructor() {
    this.client = new Client({ node: 'http://elasticsearch:9200' });
  }

  async createIndex(indexName: string, mappings: any) {
    const exists = await this.client.indices.exists({ index: indexName });
    if (!exists) {
      await this.client.indices.create({
        index: indexName,
        body: { mappings },
      });
    }
  }

  async indexUserData(index: string, userId: string, email: string) {
    return this.client.update({
      index,
      id: userId,
      body: {
        doc: {
          email
        },
        doc_as_upsert: true,
      },
    });
  }

  async updateDeltaLink(userId: string, deltaLink: string): Promise<void> {
    await this.client.index({
      index: INDEXES.ELASTIC_SEARCH.DELTA_LINKS,
      id: userId,
      body: { deltaLink },
    });
  }

  async getDeltaLink(userId: string) {
    try {
      const result = await this.client.get({ index: INDEXES.ELASTIC_SEARCH.DELTA_LINKS, id: userId });
      return (result._source as any)?.deltaLink;
    } catch {
      return;
    }
  }

  async saveDeltaLink(userId: string, deltaLink: string) {
    await this.client.index({
      index: INDEXES.ELASTIC_SEARCH.DELTA_LINKS,
      id: userId,
      body: { deltaLink },
    });
  }

  async findUser(email: string) {
    return this.client.search({
      index: INDEXES.ELASTIC_SEARCH.USERS,
      body: {
        query: {
          term: { email }
        },
      },
    });
  }

  async findAllUsers() {
    return this.client.search({
      index: INDEXES.ELASTIC_SEARCH.USERS,
      body: {
        query: {
          match_all: {},
        },
      },
    });
  }

  async updateUserTokenData(email: string, accessToken: string, refreshToken: string) {
    return this.client.updateByQuery({
      index: INDEXES.ELASTIC_SEARCH.USERS,
      body: {
        query: {
          term: {
            email: email
          }
        },
        script: {
          source: `
            ctx._source.accessToken = params.accessToken;
            ctx._source.refreshToken = params.refreshToken;
            ctx._source.updatedAt = params.updatedAt;
          `,
          params: {
            accessToken: accessToken,
            refreshToken: refreshToken,
            updatedAt: Date.now()
          }
        }
      }
    });
  }

  async syncEmailToElasticsearch(userId: string, emailDetails: EmailDataDto) {
    try {

      await this.createIndex(INDEXES.ELASTIC_SEARCH.EMAILS, {
        properties: {
          emailData: {
            type: "nested",
            properties: {
              _id: { type: "keyword" },
              senderName: { type: "text" },
              senderAddress: { type: "keyword" },
              toRecipients: {
                "type": "object",
                properties: {
                  address: { "type": "keyword" },
                  name: { "type": "text" }
                }
              },
              ccRecipients: {
                type: "nested",
                properties: {
                  address: { "type": "keyword" },
                  name: { "type": "text" }
                }
              },
              bccRecipients: {
                type: "nested",
                properties: {
                  address: { "type": "keyword" },
                  name: { "type": "text" }
                }

              },
              isRead: { type: "boolean" },
              isDraft: { type: "boolean" },
              subject: { type: "text" },
              bodyPreview: { type: "text" },
              importance: { type: "keyword" },
              receivedDateTime: { type: "date" },
              sentDateTime: { type: "date" },
            },
          },
        },
      });


      const result = await this.client.search({
        index: INDEXES.ELASTIC_SEARCH.EMAILS,
        body: {
          query: {
            bool: {
              must: [
                { term: { _id: userId } },
                {
                  nested: {
                    path: "emailData",
                    query: {
                      term: { "emailData._id": emailDetails._id }
                    }
                  }
                }
              ]
            }
          }
        }
      });

      const emailExists = (result.hits.total as SearchTotalHits).value > 0;

      if (emailExists) {
        // Update existing email details
        await this.client.update({
          index: INDEXES.ELASTIC_SEARCH.EMAILS,
          id: userId,
          body: {
            script: {
              source: `
                          for (int i = 0; i < ctx._source.emailData.size(); i++) {
                            if (ctx._source.emailData[i]._id == params.emailDetails._id) {
                              ctx._source.emailData[i] = params.emailDetails; // Update matching email
                            }
                          }
                        `,
              params: {
                emailDetails,
              },
            },
          },
        });
      } else {
        // Add new email details
        await this.client.update({
          index: INDEXES.ELASTIC_SEARCH.EMAILS,
          id: userId,
          body: {
            script: {
              source: `
                          if (ctx._source.emailData == null) {
                            ctx._source.emailData = [];
                          }
                          ctx._source.emailData.add(params.emailDetails);
                        `,
              params: {
                emailDetails,
              },
            },
            upsert: {
              emailData: [emailDetails],
            },
          },
        });
      }
    } catch (error) {
      throw new Error(`Failed to sync email to Elasticsearch: ${error.message}`);
    }
  }


  async isMailboxIndexed(userId: string): Promise<boolean> {
    const result = await this.client.exists({
      index: INDEXES.ELASTIC_SEARCH.MAIL_BOXES,
      id: userId,
    });
    return result;
  }

  async syncMailboxToElasticsearch(userId: string, mailboxDetails: any) {
    try {
      // Ensure the index is created if it doesn't exist
      await this.createIndex(INDEXES.ELASTIC_SEARCH.MAIL_BOXES, {
        properties: {
          mailboxData: {
            type: "nested",  // Make sure it's defined as a nested field
            properties: {
              _id: { type: "keyword" },
              displayName: { type: "text" },
              parentFolderId: { type: "keyword" },
              childFolderCount: { type: "integer" },  // Use integer instead of number for count
              totalItemCount: { type: "integer" },
              unreadItemCount: { type: "integer" },
            },
          },
        },
      });

      // Search to check if mailbox already exists for the user
      const result = await this.client.search({
        index: INDEXES.ELASTIC_SEARCH.MAIL_BOXES,
        body: {
          query: {
            bool: {
              must: [
                { term: { _id: userId } },
                {
                  nested: {
                    path: "mailboxData",
                    query: {
                      term: { "mailboxData._id": mailboxDetails._id },
                    },
                  },
                },
              ],
            },
          },
        },
      });

      const mailboxExists = (result.hits.total as SearchTotalHits).value > 0;

      if (mailboxExists) {
        // Update existing mailbox details
        await this.client.update({
          index: INDEXES.ELASTIC_SEARCH.MAIL_BOXES,
          id: userId,
          body: {
            script: {
              source: `
                for (int i = 0; i < ctx._source.mailboxData.size(); i++) {
                  if (ctx._source.mailboxData[i]._id == params.mailboxDetails._id) {
                    ctx._source.mailboxData[i] = params.mailboxDetails; // Update matching mailbox
                  }
                }
              `,
              params: {
                mailboxDetails,
              },
            },
          },
        });
      } else {
        // Add new mailbox details
        await this.client.update({
          index: INDEXES.ELASTIC_SEARCH.MAIL_BOXES,
          id: userId,
          body: {
            script: {
              source: `
                if (ctx._source.mailboxData == null) {
                  ctx._source.mailboxData = [];
                }
                ctx._source.mailboxData.add(params.mailboxDetails);
              `,
              params: {
                mailboxDetails,
              },
            },
            upsert: {
              mailboxData: [mailboxDetails],
            },
          },
        });
      }
    } catch (error) {
      throw new Error(`Failed to sync mailbox to Elasticsearch: ${error.message}`);
    }
  }

  async saveMailboxDeltaLink(userId: string, deltaLink: string): Promise<void> {
    try {
      await this.client.update({
        index: INDEXES.ELASTIC_SEARCH.MAIL_BOXES,
        id: userId,
        body: {
          script: {
            source: `
              ctx._source.deltaLink = params.deltaLink;
            `,
            params: {
              deltaLink,
            },
          },
          upsert: {
            deltaLink: deltaLink,
          },
        },
      });
    } catch (error) {
      throw new Error(`Failed to save mailbox delta link for user ${userId}: ${error.message}`);
    }
  }

  async fetchAllEmailsDataOfUser(userId: string, page: number = 1, pageSize: number = 10) {
    page = Math.max(page, 1);
    pageSize = Math.max(pageSize, 1);
    const from = (page - 1) * pageSize;

    try {
      // Fetch the total count of emailData
      const emails = await this.client.search({
        index: INDEXES.ELASTIC_SEARCH.EMAILS,
        body: {
          query: {
            term: {
              _id: userId,
            },
          },
          _source: ["emailData"],
        },
      });

      const emailData = (emails.hits.hits[0]?._source as any)?.emailData || [];
      const emailDataCount = emailData.length;

      // Paginate the emailData array manually
      const paginatedEmailData = emailData.slice(from, from + pageSize);

      // Return the paginated data and total count
      return {
        emails: paginatedEmailData,
        total: emailDataCount,
      };
    } catch (error) {
      throw new Error(`Failed to fetch emails for user ${userId}: ${error.message}`);
    }
  }

  async fetchAllMailboxDataOfUser(userId: string, page: number = 1, pageSize: number = 10) {
    page = Math.max(page, 1);
    pageSize = Math.max(pageSize, 1);
    const from = (page - 1) * pageSize;

    try {
      const mailbox = await this.client.search({
        index: INDEXES.ELASTIC_SEARCH.MAIL_BOXES,
        body: {
          query: {
            term: {
              _id: userId,
            },
          },
          _source: ["mailboxData"], // Replace this with the correct field name
        },
      });

      const mailboxData = (mailbox.hits.hits[0]?._source as any)?.mailboxData;

      const mailboxDataCount = mailboxData.length;

      // Paginate the mailboxData array manually
      const paginatedMailboxData = mailboxData.slice(from, from + pageSize);

      // Return the paginated data and total count
      return {
        mailbox: paginatedMailboxData,
        total: mailboxDataCount,
      };
    } catch (error) {
      throw new Error(`Failed to fetch mailbox for user ${userId}: ${error.message}`);
    }
  }
}
