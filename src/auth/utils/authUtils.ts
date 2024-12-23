import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from "@nestjs/config";
import { Injectable } from '@nestjs/common';
import { ENV_VARS, URLS } from 'src/constants';

@Injectable()
export class AuthUtils {
    private readonly ENCRYPTION_KEY: Buffer;
    constructor(private readonly configService: ConfigService) {
        const secretKey = this.configService.get<string>(ENV_VARS.ENCRYPTION.SECRET);
        if (!secretKey || secretKey.length < 32) {
            throw new Error('Invalid ENCRYPTION_SECRET: Must be at least 32 characters long.');
        }
        this.ENCRYPTION_KEY = Buffer.from(secretKey.slice(0, 32));

    }

    /**
     * Method to generate outlook oauth url
     * @returns oauth url
     */
    public generateOAuthUrl() {
        const state = uuidv4();
        const clientId = this.configService.get(ENV_VARS.OUTLOOK.CLIENT_ID);
        const redirectUri = this.configService.get(ENV_VARS.OUTLOOK.REDIRECT_URI);
        const scope = 'openid profile email offline_access User.Read';
        return `${URLS.OUTLOOK.AUTH.LOGIN}?client_id=${clientId}&response_type=code&redirect_uri=${redirectUri}&scope=${scope}&state=${state}&prompt=consent`;
    }

    /**
     * Method to decode the id token to get user information
     * @param IdToken 
     * @returns 
     */
    public decodeToken(IdToken: string) {
        try {
            return jwt.decode(IdToken);
        } catch (error) {
            throw new Error('Invalid ID Token');
        }
    }

    /**
     * Encrypt data using AES-256 encryption.
     * @param {string} data - The data to encrypt.
     * @returns {string} Encrypted data in the format IV:EncryptedString.
     */
    public encryptData(data: string): string {
        try {
            const iv = crypto.randomBytes(16)
            const cipher = crypto.createCipheriv('aes-256-cbc', this.ENCRYPTION_KEY, iv);
            let encrypted = cipher.update(data, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return `${iv.toString('hex')}:${encrypted}`;
        } catch (error) {
            throw new Error('Error encrypting data: ' + error.message);
        }
    }


    /**
     * Decrypt data encrypted with AES-256.
     * @param {string} encryptedData - The encrypted data in the format IV:EncryptedString.
     * @returns {string} The original decrypted data.
     */
    public decryptData(encryptedData: string): string {
        try {
            const [ivHex, encryptedText] = encryptedData.split(':');
            if (!ivHex || !encryptedText) {
                throw new Error('Invalid encrypted data format.');
            }
            const iv = Buffer.from(ivHex, 'hex');
            const decipher = crypto.createDecipheriv('aes-256-cbc', this.ENCRYPTION_KEY, iv);
            let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
            decrypted += decipher.final('utf8');
            return decrypted;
        } catch (error) {
            throw new Error('Error decrypting data: ' + error.message);
        }
    }
}
