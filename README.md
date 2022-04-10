# mailvani.sh
###
Disposable and encrypted inbox aimed at short term usage

![Screenshot 2021-11-18 at 15-39-53 mailvani sh - Disposable mailbox with encryption](https://user-images.githubusercontent.com/24352255/142745882-92b320a9-2b83-4c7b-b986-40094d035062.png)

## Use case
Currently each mailbox generated lasts about 30 mins, this is ideal if you just need a quick mailbox without the need for dedicating to a longer service or self-hosting (like SimpleLogin or Anonaddy). 

## Encryption
Under the hood, the client-side inbox uses [TweetNaCl](https://cure53.de/tweetnacl.pdf) to encrypt all emails within a mailbox using [public key authentication](https://github.com/dchest/tweetnacl-js#public-key-authenticated-encryption-box). This means that any server used to host your mailboxes only knows of your public key and _cannot_ decrypt your mail. The private key generated on the client-side lasts for only 30 mins and only lives in the current session, therefore if you refresh/close the browser tab for any reason you will have lost access to decrypting your mail. **It's important to note that all mailboxes are purged after 30 mins even if it's not used**. 
