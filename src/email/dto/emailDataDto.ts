export class EmailDataDto {
    _id: string;
    sender: string;
    from: string;
    toRecipients: string;
    ccRecipients: string;
    bccRecipients: string;
    isRead: string;
    isDraft: string;
    subject: string;
    bodyPreview: string;
    importance: string;
    receivedDateTime: string;
    sentDateTime: string;
}