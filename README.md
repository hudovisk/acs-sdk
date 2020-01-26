# Unofficial Adobe Campaign Standard (ACS) API SDK

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

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

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/hudovisk"><img src="https://avatars2.githubusercontent.com/u/5161722?v=4" width="100px;" alt=""/><br /><sub><b>Hudo Assenco</b></sub></a><br /><a href="https://github.com/hudovisk/acs-sdk/commits?author=hudovisk" title="Code">💻</a> <a href="https://github.com/hudovisk/acs-sdk/commits?author=hudovisk" title="Documentation">📖</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
