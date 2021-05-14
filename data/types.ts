export type Response<T> = any;

export interface QueryResult {
  readonly ref: any,
  readonly data: MailItem,
  readonly ttl?: any
}

export interface Mailbox {
  readonly alias: string,
  readonly publicKey?: Array<number>,
  readonly sharedKey?: Array<number>,
};

export interface MailItem {
  readonly from: string,
  readonly to?: string,
  readonly date: Date,
  readonly subject: string,
  readonly body: string,
  readonly attachments: string[]
};

export interface ParsedMail {
  readonly attachments: string[],
  readonly headers: object,
  readonly headerLines: object[],
  readonly text: string,
  readonly textAsHtml: string,
  readonly subject: string,
  readonly date: string,
  readonly to: {
    value: string[],
    html: string,
    text: string,
  },
  readonly from: {
    value: string[],
    html: string,
    text: string,
  }
  readonly messageId: string,
  readonly html: boolean,
  readonly raw: Buffer
};
