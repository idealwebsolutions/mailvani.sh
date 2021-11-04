export type Response<T> = any;

export class ExpiredMailboxError extends Error {
  constructor(message: string) {
    super(message); // (1)
    this.name = 'ExpiredMailboxError';
  }
};

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RateLimitError';
  }
};

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

interface TypedArray {
  type: string,
  data: Array<number>
}

export interface Attachment {
  readonly filename: string,
  readonly content: TypedArray,
  path?: string,
  href?: string,
  httpHeaders?: object[],
  contentType?: string,
  contentDisposition: string,
  cid?: string,
  encoding?: string,
  headers?: object[],
  raw: string | Buffer | unknown
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
  readonly attachments: Attachment[],
  readonly raw: string
};

export interface ParsedMail {
  readonly attachments: Attachment[],
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
  readonly raw: string
};
