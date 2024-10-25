/* Copyright (C) 2017-2023 Tuumik Systems OÜ */

export const demoStartEmailHTML = reqData => {
  const str1 = `
  <!DOCTYPE html>
  <html>
  <head>
    <style type="text/css">
    .root-holder {
      background-color: #f7f7f7;
      padding: 2em 0;
      color: #444444;
    }
    .content-holder {
      margin: 0 auto;
      padding: 1em 2em 2em 2em;
      width: 40em;
      max-width: 70%;
      background-color: #ffffff;
      border-left: 1px solid #e3e3e3;
      border-right: 1px solid #e3e3e3;
    }
    .header-holder {
      margin: 0 auto;
      width: 40em;
      max-width: 70%;
      padding: 2em;
      background-color: #ffffff;
      border: 1px solid #e3e3e3;
      border-radius: 0.4em 0.4em 0 0;
      display: flex;
    }
    .header-logo {
      height: 3em;
      width: 3em;
      margin: 0 1em 0 0;
      background-image: url('https://assets.tuumik.com/logo/logo300.png');
      background-repeat: no-repeat;
      background-size: auto 99%;
      background-position: center center;
    }
    .header-name {
      height: 3em;
      line-height: 3em;
    }
    h1 {
      font-size: 1.6em;
      text-align: center;
      display: block;
      margin: 1em 0;
      padding: 0;
      color: #444444;
    }
    .top-text {
      margin: 1em 0;
      color: #444444;
      text-align: justify;
    }
    .users-holder {
      margin: 2em 0;
    }
    .user-holder {
      margin: 3px 0;
      padding: 0.4em 1em;
      background-color: #efefef;
    }
    .user-name {
      font-weight: 600;
    }
    .footer-holder {
      margin: 0 auto;
      width: 40em;
      max-width: 70%;
      padding: 2em;
      background-color: #ffffff;
      border: 1px solid #e3e3e3;
      border-radius: 0 0 0.4em 0.4em;
    }
    .footer-item {
      color: #9f9f9f;
      margin: 0.3em 1em 0.3em 0;
    }
    .footer-item a {
      color: #9f9f9f;
    }
    </style>
  </head>
  <body>
  <div class="root-holder">
  <div class="header-holder">
    <div class="header-logo"></div>
    <div class="header-name">Tuumik</div>
  </div>
  <div class="content-holder">
  <h1>Demo Accounts Created</h1>
  <div class="top-text">
    Thank you for trying out Tuumik.
    We have created a demo organization (a sample law firm) with the following accounts for you.
    The demo accounts are temporary and will be automatically deleted after a while.
  </div>
  <div class="users-holder">
  `;

  let str2 = '';
  reqData.users.forEach(user => {
    const row = `
    <div class="user-holder">
      <div class="user-name">${user.name}</div>
      <div>email: ${user.emails[0].address}</div>
      <div>password: demo</div>
    </div>
    `;
    str2 += row;
  });

  const str3 = `
  </div>
  </div>
  <div class="footer-holder">
    <div class="footer-item">Tuumik</div>
  </div>
  </div>
  </body>
  </html>
  `;
  return str1 + str2 + str3;
};

export const demoStartEmailText = reqData => {
  const str = reqData.to;
  return str;
};
