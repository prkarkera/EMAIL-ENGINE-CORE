import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ElasticSearchService } from 'src/elastic-search/elastic-search.service';
import { AuthUtils } from './utils/authUtils';
import { ENV_VARS, INDEXES } from 'src/constants';
import { Client } from '@elastic/elasticsearch';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  private client: Client;
  constructor(
    private readonly configService: ConfigService,
    private elasticSearchService: ElasticSearchService,
    private readonly authUtils: AuthUtils,
    private readonly emailService: EmailService
  ) { }

  /**
   * Method to handle callback url and generate tokens upon successful validation of user
   * @param code exchange code to get the tokens for validation purpose
   * @returns 
   */
  async handleOAuthCallback(code: string) {
    console.log(code);
    const tokenResponse = await fetch(
      'https://login.microsoftonline.com/common/oauth2/v2.0/token',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.configService.get(ENV_VARS.OUTLOOK.CLIENT_ID),
          client_secret: this.configService.get(ENV_VARS.OUTLOOK.CLIENT_SECRET),
          code,
          redirect_uri: this.configService.get(ENV_VARS.OUTLOOK.REDIRECT_URI),
          grant_type: 'authorization_code',
          scope: "openid profile email offline_access User.Read"
        }),
      },
    );
    const tokenData = await tokenResponse.json();

    const { access_token, id_token, refresh_token } = tokenData;

    if (!access_token || !id_token || !refresh_token) {
      return { message: 'Missing tokens' };
    }

    // Decode the id_token to extract email
    const userEmail = this.authUtils.decodeToken(id_token).email;

    await this.storeUserTokens(userEmail, access_token, refresh_token);

    const userDetails = await this.elasticSearchService.findUser(userEmail);

    // sync email data upon successful account link
    await this.emailService.syncEmails({ userId: userDetails.hits.hits[0]._id, accessToken: access_token })

    await this.emailService.syncMailboxDetails({ userId: userDetails.hits.hits[0]._id, accessToken: access_token })

    return {
      message: "User logged in successfully",
      statusCode: HttpStatus.OK,
      accessToken: access_token,
      email: userEmail,
      userId: userDetails.hits.hits[0]._id
    }
  }

  /**
   * Method to store the tokens once the successful account creation
   * @param email user email
   * @param accessToken
   * @param idToken 
   * @param refreshToken 
   */
  async storeUserTokens(email: string, accessToken: string, refreshToken: string) {
    const hashedAccessToken = this.authUtils.encryptData(accessToken);
    const hashedRefreshToken = this.authUtils.encryptData(refreshToken);

    return this.elasticSearchService.updateUserTokenData(email, hashedAccessToken, hashedRefreshToken);
  }
}
