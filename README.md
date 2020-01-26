# Unofficial Adobe Campaign Standard (ACS) API SDK

Adobe Campaing Standard API Docs: https://docs.adobe.com/content/help/en/campaign-standard/using/working-with-apis/about-campaign-standard-apis/about-campaign-standard-apis.html

Example:

```javascript
const { ACSHttpClient, JWTAuthorizer } = require("acs-sdk");

// authentication information https://www.adobe.io/authentication/auth-methods.html#!AdobeDocs/adobeio-auth/master/AuthenticationOverview/ServiceAccountIntegration.md
const authorizer = new JWTAuthorizer({
  adobeOrgId: "EF2D363--------CA@AdobeOrg",
  clientId: "bb11ebd6406a4f---------f705b26a",
  clientSecret: "8EDD3561-------5CDB@techacct.adobe.com",
  metascopes: ["ent_campaign_sdk"],
  privateKey: "-----BEGIN RSA PRIVATE KEY-----\n...",
  technicalAccountId: "8EDD3561-------5CDB@techacct.adobe.com"
});

// Organizational info: https://docs.adobe.com/content/help/en/campaign-standard/using/working-with-apis/about-campaign-standard-apis/setting-up-api-access.html
const client = new ACSHttpClient({ orgId: "acme", orgInstanceId: "acme-mkt-stage1" }, authorizer);
```

### Supported operations:

- sendTransactionalEvent
  Docs: https://docs.adobe.com/content/help/en/campaign-standard/using/working-with-apis/managing-transactional-messages.html
  ```javascript
  client.sendTransactionalEvent("EVTTest", {
    email: "email@email.com",
    customData: "customValue"
  });
  ```
