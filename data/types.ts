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

export interface NameAddressPair {
  name: string,
  address: string
}

export interface MailItem {
  readonly from: Array<NameAddressPair>,
  readonly to: string,
  readonly date: Date,
  readonly subject: string,
  readonly body: {
    readonly plain: string,
    readonly html: boolean | string,
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
    value: Array<NameAddressPair>,
    html: string,
    text: string,
  },
  readonly from: {
    value: Array<NameAddressPair>,
    html: string,
    text: string,
  }
  readonly messageId: string,
  readonly html: boolean | string,
  readonly raw: Buffer
};
