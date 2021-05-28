export type Response<T> = any;

export interface QueryResult {
  readonly data: MailItem,
  readonly ref: any,
  readonly ttl?: any
}

export interface Mailbox {
  readonly alias: string,
  readonly publicKey?: Array<number>,
  readonly sharedKey?: Array<number>,
};

interface From {
  name: string,
  address: string
}

export interface MailItem {
  readonly from: Array<From>,
  readonly to: string,
  readonly date: Date,
  readonly subject: string,
  readonly body: {
    plain: string,
    html: string
  },
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
    value: From[],
    html: string,
    text: string,
  }
  readonly messageId: string,
  readonly html: boolean,
  readonly raw: Buffer
};
