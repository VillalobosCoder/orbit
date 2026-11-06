import { vi, type Mock } from "vitest";

type Method = (...args: never[]) => unknown;

type Stubbed<T> = {
  [K in keyof T]: T[K] extends Method ? Mock<T[K]> : T[K];
};

/**
 * Builds a test double of a port. Only the methods a test needs are given;
 * calling any other method fails loudly, so a use case cannot silently depend
 * on something the test did not expect.
 */
export function stub<T extends object>(
  implementations: { [K in keyof T]?: T[K] } = {},
): Stubbed<T> {
  const methods = new Map<PropertyKey, Mock>();

  for (const [name, implementation] of Object.entries(implementations)) {
    methods.set(name, vi.fn(implementation as Method));
  }

  return new Proxy({} as Stubbed<T>, {
    get(_target, property) {
      const method = methods.get(property);

      if (method) {
        return method;
      }

      if (typeof property === "symbol" || property === "then") {
        return undefined;
      }

      const unexpected = vi.fn(() => {
        throw new Error(`Unexpected call to ${String(property)}()`);
      });
      methods.set(property, unexpected);

      return unexpected;
    },
  });
}
