/**
 * @jest-environment jsdom
 */

import {  screen, waitFor } from "@testing-library/dom";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router";

jest.mock("../app/store", () => mockStore);


// test d'intégration GET
describe("Given I am a user connected as Admin", () => {
    describe("When I navigate to Dashboard", () => {
        beforeEach(() => {
            const onNavigate = jest.fn((pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            });
        });

        test("fetches bills from mock API GET", async () => {
            localStorage.setItem(
                "user",
                JSON.stringify({ type: "Admin", email: "a@a" })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Dashboard);
            await waitFor(() => screen.getByText("Validations"));
            const contentPending = await screen.getByText("En attente (1)");
            expect(contentPending).toBeTruthy();
            const contentRefused = await screen.getByText("Refusé (2)");
            expect(contentRefused).toBeTruthy();
            expect(screen.getByTestId("big-billed-icon")).toBeTruthy();
        });
        describe("When an error occurs on API", () => {
            beforeEach(() => {
                jest.spyOn(mockStore, "bills");
                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                window.localStorage.setItem(
                    "user",
                    JSON.stringify({
                        type: "Admin",
                        email: "a@a",
                    })
                );
                const root = document.createElement("div");
                root.setAttribute("id", "root");
                document.body.appendChild(root);
                router();
            });
            test("fetches bills from an API and fails with 404 message error", async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 404"));
                        },
                    };
                });
                window.onNavigate(ROUTES_PATH.Dashboard);
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 404/);
                expect(message).toBeTruthy();
            });

            test("fetches messages from an API and fails with 500 message error", async () => {
                mockStore.bills.mockImplementationOnce(() => {
                    return {
                        list: () => {
                            return Promise.reject(new Error("Erreur 500"));
                        },
                    };
                });

                window.onNavigate(ROUTES_PATH.Dashboard);
                await new Promise(process.nextTick);
                const message = await screen.getByText(/Erreur 500/);
                expect(message).toBeTruthy();
            });
        });
    });
});
