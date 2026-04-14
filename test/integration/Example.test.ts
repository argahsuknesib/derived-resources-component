import type { App } from '@solid/community-server';
import { AppRunner, joinFilePath } from '@solid/community-server';
// Test is here to make sure we didn't accidentally break something in the flow
describe('The server test setup', (): void => {
  let app: App;

  beforeAll(async(): Promise<void> => {
    app = await new AppRunner().create(
      {
        config: [
          joinFilePath(__dirname, '../../config/example.json'),
          joinFilePath(__dirname, '../../config/derived.json'),
          joinFilePath(__dirname, '../../config/main.json'),
        ],
        loaderProperties: {
          mainModulePath: joinFilePath(__dirname, '../../'),
          dumpErrorState: false,
        },
        shorthand: {
          port: 3456,
          loggingLevel: 'off',
        },
      },
    );

    await app.start();
  });

  afterAll(async(): Promise<void> => {
    await app.stop();
  });

  it('rejects unauthenticated access to a derived resource.', async(): Promise<void> => {
    const res = await fetch('http://localhost:3456/derived/test');
    expect(res.status).toBe(401);
  });

  it('rejects unauthenticated access to derived containers.', async(): Promise<void> => {
    const res = await fetch('http://localhost:3456/derived/');
    expect(res.status).toBe(401);
  });

  it('still enforces authorization when a WebID header is provided.', async(): Promise<void> => {
    const res = await fetch('http://localhost:3456/data/data', { headers: { Authorization: 'WebID http://example.com/alice' }});
    expect(res.status).toBe(403);
  });
});
