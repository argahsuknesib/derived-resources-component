import type { App } from '@solid/community-server';
import { AppRunner, joinFilePath, joinUrl } from '@solid/community-server';

const port = 3457;
const baseUrl = `http://localhost:${port}/`;

// Test is here to make sure we didn't accidentally break something in the flow
describe('The server auth test setup', (): void => {
  let app: App;

  beforeAll(async(): Promise<void> => {
    app = await new AppRunner().create(
      {
        config: [
          joinFilePath(__dirname, '../../config/example.json'),
          joinFilePath(__dirname, '../../config/derived-auth.json'),
          joinFilePath(__dirname, '../../config/main.json'),
        ],
        loaderProperties: {
          mainModulePath: joinFilePath(__dirname, '../../'),
          dumpErrorState: false,
        },
        shorthand: {
          port,
          loggingLevel: 'off',
        },
      },
    );

    await app.start();
  });

  afterAll(async(): Promise<void> => {
    await app.stop();
  });

  it('returns the derived index resource.', async(): Promise<void> => {
    const res = await fetch(joinUrl(baseUrl, 'index/type'));
    expect(res.status).toBe(401);
  });

  it('still rejects access with a WebID authorization header.', async(): Promise<void> => {
    const res = await fetch(joinUrl(baseUrl, 'index/type'), { headers: { Authorization: 'WebID http://example.com/alice' }});
    expect(res.status).toBe(403);
  });

  it('rejects QPF index access without supported authentication.', async(): Promise<void> => {
    const res = await fetch(joinUrl(baseUrl, 'index/qpf'), { headers: { Authorization: 'WebID http://example.com/alice' }});
    expect(res.status).toBe(403);
  });
});
