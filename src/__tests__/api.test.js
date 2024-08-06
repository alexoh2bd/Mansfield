/**
 * @jest-environment node
 *
 * Use Node environment for server-side tests to avoid loading browser libraries.
 * This needs to be the top comment in the file
 */

/* eslint-disable no-return-assign, no-param-reassign */

import { getServerSession } from "next-auth/next";
import { testApiHandler } from "next-test-api-route-handler";
import { firebaseConfig } from "@/firebase-config";
import { initializeApp, deleteApp } from "firebase/app";
import userEndpoint from "../pages/api/[id]/index";
import activeEndpoint from "../pages/api/[id]/active";
import historyEndpoint from "../pages/api/[id]/history";
import oddsEndpoint from "../pages/api/odds/[league]";
import scoresEndpoint from "../pages/api/scores/[league]";

jest.mock("next-auth/next");

const mockAuthenticated = {
  user: {
    id: "testId",
    name: "Mocked Name",
    email: "test@test.test",
  },
};

const mockUnauthenticated = undefined;

let firebase;

describe("Api testing", () => {
  beforeAll(() => {
    firebase = initializeApp(firebaseConfig);
  });
  beforeEach(() => {
    getServerSession.mockResolvedValue(mockAuthenticated);
  });

  afterEach(() => {
    getServerSession.mockReset();
  });

  afterAll(() => {
    deleteApp(firebase);
  });

  test("POST /api/test should return something", async () => {
    await testApiHandler({
      rejectOnHandlerError: false,
      handler: userEndpoint,
      paramsPatcher: (params) => (params.id = mockAuthenticated.user.id),
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "POST",
          body: JSON.stringify({
            username: mockAuthenticated.user.name,
            email: mockAuthenticated.user.email,
          }),
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        expect(res.ok).toBe(true);
        expect(res.status).toBe(200);
      },
    });
  });

  test("Fetch [id]/active returns an active bet", async () => {
    await testApiHandler({
      rejectOnHandlerError: false,
      handler: activeEndpoint,
      paramsPatcher: (params) => (params.id = mockAuthenticated.user.id),
      test: async ({ fetch }) => {
        const res = await fetch({
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });
        expect(res.ok).toBe(true);
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toMatchObject({
          testActiveId: "test bet for test suite",
        });
      },
    });
  });

  describe("Calls to data of other users are rejected", () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue(mockAuthenticated);
    });

    test("Unauthorized [id]/active", async () => {
      await testApiHandler({
        rejectOnHandlerError: false,
        handler: activeEndpoint,
        paramsPatcher: (params) => (params.id = "notTestId"),
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.ok).toBe(false);
          expect(res.status).toBe(401);
          await expect(res.json()).resolves.toMatchObject({
            message: "You cannot access information of other users.",
          });
        },
      });
    });

    test("Unauthorized [id]/history", async () => {
      await testApiHandler({
        rejectOnHandlerError: false,
        handler: historyEndpoint,
        paramsPatcher: (params) => (params.id = "notTestId"),
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.ok).toBe(false);
          expect(res.status).toBe(401);
          await expect(res.json()).resolves.toMatchObject({
            message: "You cannot access information of other users.",
          });
        },
      });
    });
  });

  describe("Unauthenticated calls are rejected", () => {
    beforeEach(() => {
      getServerSession.mockResolvedValue(mockUnauthenticated);
    });

    test("Unauthenticated [id]/active", async () => {
      await testApiHandler({
        rejectOnHandlerError: false,
        handler: activeEndpoint,
        paramsPatcher: (params) => (params.id = "testId"),
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.ok).toBe(false);
          expect(res.status).toBe(401);
          await expect(res.json()).resolves.toMatchObject({
            message: "You must be logged in.",
          });
        },
      });
    });

    test("Unauthenticated [id]/history", async () => {
      await testApiHandler({
        rejectOnHandlerError: false,
        handler: historyEndpoint,
        paramsPatcher: (params) => (params.id = "testId"),
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.ok).toBe(false);
          expect(res.status).toBe(401);
          await expect(res.json()).resolves.toMatchObject({
            message: "You must be logged in.",
          });
        },
      });
    });

    test("Unauthenticated GET odds", async () => {
      await testApiHandler({
        rejectOnHandlerError: false,
        handler: oddsEndpoint,
        paramsPatcher: (params) => (params.league = "testLeague"),
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.ok).toBe(false);
          expect(res.status).toBe(401);
          await expect(res.json()).resolves.toMatchObject({
            message: "You must be signed in to access this endpoint.",
          });
        },
      });
    });

    test("Unauthenticated GET scores", async () => {
      await testApiHandler({
        rejectOnHandlerError: false,
        handler: scoresEndpoint,
        paramsPatcher: (params) => (params.league = "testLeague"),
        test: async ({ fetch }) => {
          const res = await fetch();
          expect(res.ok).toBe(false);
          expect(res.status).toBe(401);
          await expect(res.json()).resolves.toMatchObject({
            message: "You must be signed in to access this endpoint.",
          });
        },
      });
    });
  });
});
