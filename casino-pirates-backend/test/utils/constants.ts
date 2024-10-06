export const APP_URL = `http://localhost:${process.env.APP_PORT}`;
export const TESTER_EMAIL = 'john.doe@example.com';
export const TESTER_PASSWORD = 'secret';
export const ADMIN_EMAIL = 'admin@example.com';
export const ADMIN_PASSWORD = 'secret';
export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_PORT = process.env.MAIL_CLIENT_PORT;
export const PRIVATE_KEYS = [
  {
    privateKey:
      '1f61af720cc0e6ec41e25dbdcf87313edbfe5f84d77de4f0ce778c6942ff3ad2',
    alreadyRegistered: true,
    publicKey: '0x6b2CfD590E283bD0f4721bC349FdE84B9957F416',
    scope: 'login',
  },
  {
    privateKey:
      '03307166dd711809a359c8223db20bff59d48e31b6830e73d2a1835dcaed800d',
    alreadyRegistered: false,
    publicKey: '0xAee5A4925EE2fdaA6c529e7A7cFCeA9b82b587A5',
    scope: 'register',
  },
  {
    privateKey:
      '962b01d9a7755d1725ae17704a9d0c25067cacf63a0ad813d0bd3995c1bf5bf5',
    alreadyRegistered: false,
    publicKey: '0x8d4D93e3b75923747043A3594F8acbdb9B28Ecb5',
    scope: 'link wallet',
  },
];
