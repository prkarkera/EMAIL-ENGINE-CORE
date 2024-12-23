import { Controller, Post, Body, Get, Param, Query } from '@nestjs/common';
import { EmailService } from './email.service';
import { SyncInputDto } from './dto/sync-emails.input';

@Controller()
export class EmailController {
  constructor(private readonly emailService: EmailService) { }

  @Post('emails/sync')
  async syncEmails(@Body() syncEmailsInputDto: SyncInputDto) {
    const emails =
      await this.emailService.syncEmails(syncEmailsInputDto);
    return emails;
  }

  @Post('mailbox/sync')
  async syncMailBoxes(@Body() syncInputDto: SyncInputDto) {
    const emails =
      await this.emailService.syncMailboxDetails(syncInputDto);
    return emails;
  }

  @Get('emails/fetch/:userId')
  async fetchAllUserEmails(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const emails = await this.emailService.fetchAllEmailsDataOfUser(userId, page, pageSize);
    return emails;
  }

  @Get('mailbox/fetch/:userId')
  async fetchAllUserMailbox(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    const mailbox = await this.emailService.fetchAllMailboxDataOfUser(userId, page, pageSize);
    return mailbox;
  }

}
