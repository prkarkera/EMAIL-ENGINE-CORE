import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AuthUtils } from 'src/auth/utils/authUtils';
import { INDEXES } from 'src/constants';
import { ElasticSearchService } from 'src/elastic-search/elastic-search.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UserService {
  constructor(
    private readonly elasticSearchService: ElasticSearchService,
    private readonly authUtils: AuthUtils
  ) { }

  /**
   * Method to create user account
   * @param email
   * @returns userId and url to login into outlook
   */
  async createUserAccount(email: string) {
    try {
      const index = INDEXES.ELASTIC_SEARCH.USERS;

      // create index if not exist
      await this.elasticSearchService.createIndex(index, {
        properties: {
          email: { type: 'keyword' },
          userId: { type: 'keyword' },
        },
      })

      // Check if the email already exists
      const user = await this.elasticSearchService.findUser(email)

      let userId: string;
      if (user.hits.hits.length) {
        // Email already exists, use the existing userId
        userId = user.hits.hits[0]._id;
      } else {
        // Generate a new userId for the new email
        userId = uuidv4();
      }

      const oauthUrl = this.authUtils.generateOAuthUrl();

      // Save or update user data in Elasticsearch
      await this.elasticSearchService.indexUserData(index, userId, email);

      return {
        email,
        userId,
        oauthUrl,
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }



  /**
   * Method to get user account by email
   * @param email
   * @returns
   */
  async findUserByEmail(email: string) {
    try {
      const result = await this.elasticSearchService.findUser(email);

      return result.hits.hits.length ? result.hits.hits[0] : null;
    } catch (error) {
      throw new Error(error.message)
    }
  }

  async getAllUsers() {
    try {
      const response = await this.elasticSearchService.findAllUsers()
      // Map Elasticsearch hits to user objects
      return response.hits.hits.map((hit) => ({
        id: hit._id,
        accessToken: (hit._source as Record<string, any>).accessToken,
      }));
    } catch (error) {
      throw new Error(error.message);
    }
  }
}