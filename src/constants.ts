export const ENV_VARS = {
    OUTLOOK: {
        CLIENT_SECRET: "CLIENT_SECRET",
        CLIENT_ID: "CLIENT_ID",
        REDIRECT_URI: "REDIRECT_URI"
    },
    DATABASE: {
        URL: "DATABASE_URL"
    },
    ENCRYPTION: {
        SECRET: "ENCRYPTION_SECRET"
    }
};

export const INDEXES = {
    ELASTIC_SEARCH: {
        EMAILS: "emails",
        USERS: "users",
        MAIL_BOXES: "mailboxes",
        DELTA_LINKS: "deltalinks"
    }
}

export const URLS = {
    OUTLOOK: {
        AUTH: {
            LOGIN: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
        },
        EMAIL: {
            DATA: "https://graph.microsoft.com/v1.0/me/messages",
        },
        MAIL_BOX: {
            DATA: "https://graph.microsoft.com/v1.0/me/mailFolders"
        }
    }
}