import { fetch } from "cross-fetch";

import { server } from "#mocks/server";

vi.stubGlobal("fetch", fetch);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
