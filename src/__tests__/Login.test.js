/**
 * @jest-environment jsdom
 */

import LoginUI from "../views/LoginUI";
import Login from "../containers/Login.js";
import { ROUTES } from "../constants/routes";
import { fireEvent, screen, waitFor } from "@testing-library/dom";

describe("Given that I am a user on login page", () => {
    describe("When I do not fill fields and I click on employee button Login In", () => {
        test("Then It should renders Login page", () => {
            document.body.innerHTML = LoginUI();

            const inputEmailUser = screen.getByTestId("employee-email-input");
            expect(inputEmailUser.value).toBe("");

            const inputPasswordUser = screen.getByTestId(
                "employee-password-input"
            );
            expect(inputPasswordUser.value).toBe("");

            const form = screen.getByTestId("form-employee");
            const handleSubmit = jest.fn((e) => e.preventDefault());

            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);
            expect(screen.getByTestId("form-employee")).toBeTruthy();
        });
    });

    describe("When I do fill fields in incorrect format and I click on employee button Login In", () => {
        test("Then It should renders Login page", () => {
            document.body.innerHTML = LoginUI();

            const inputEmailUser = screen.getByTestId("employee-email-input");
            fireEvent.change(inputEmailUser, {
                target: { value: "pasunemail" },
            });
            expect(inputEmailUser.value).toBe("pasunemail");

            const inputPasswordUser = screen.getByTestId(
                "employee-password-input"
            );
            fireEvent.change(inputPasswordUser, {
                target: { value: "azerty" },
            });
            expect(inputPasswordUser.value).toBe("azerty");

            const form = screen.getByTestId("form-employee");
            const handleSubmit = jest.fn((e) => e.preventDefault());

            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);
            expect(screen.getByTestId("form-employee")).toBeTruthy();
        });
    });
});

describe("Given that I am a user on login page", () => {
    describe("When I do not fill fields and I click on admin button Login In", () => {
        test("Then It should renders Login page", () => {
            document.body.innerHTML = LoginUI();

            const inputEmailUser = screen.getByTestId("admin-email-input");
            expect(inputEmailUser.value).toBe("");

            const inputPasswordUser = screen.getByTestId(
                "admin-password-input"
            );
            expect(inputPasswordUser.value).toBe("");

            const form = screen.getByTestId("form-admin");
            const handleSubmit = jest.fn((e) => e.preventDefault());

            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);
            expect(screen.getByTestId("form-admin")).toBeTruthy();
        });
    });

    describe("When I do fill fields in incorrect format and I click on admin button Login In", () => {
        test("Then it should renders Login page", () => {
            document.body.innerHTML = LoginUI();

            const inputEmailUser = screen.getByTestId("admin-email-input");
            fireEvent.change(inputEmailUser, {
                target: { value: "pasunemail" },
            });
            expect(inputEmailUser.value).toBe("pasunemail");

            const inputPasswordUser = screen.getByTestId(
                "admin-password-input"
            );
            fireEvent.change(inputPasswordUser, {
                target: { value: "azerty" },
            });
            expect(inputPasswordUser.value).toBe("azerty");

            const form = screen.getByTestId("form-admin");
            const handleSubmit = jest.fn((e) => e.preventDefault());

            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);
            expect(screen.getByTestId("form-admin")).toBeTruthy();
        });
    });
});
describe("Given that I am a user on login page", () => {
    beforeEach(() => {
        document.body.innerHTML = LoginUI();
        Object.defineProperty(window, "localStorage", {
            value: {
                getItem: jest.fn(() => null),
                setItem: jest.fn(() => null),
            },
            writable: true,
        });
    });

    const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
    };

    let PREVIOUS_LOCATION = "";

    const storeMock = {
        login: jest.fn().mockResolvedValue({ jwt: "some_jwt_token" }),
        users: jest.fn().mockReturnThis(),
        create: jest.fn().mockResolvedValue({}),
    };

    describe("When I submit the employee form with correct data", () => {
        test("Then I should be logged in as an employee", async () => {
            const login = new Login({
                document,
                localStorage: window.localStorage,
                onNavigate,
                PREVIOUS_LOCATION,
                store: storeMock,
            });

            const form = screen.getByTestId("form-employee");
            const inputEmail = screen.getByTestId("employee-email-input");
            const inputPassword = screen.getByTestId("employee-password-input");

            fireEvent.change(inputEmail, {
                target: { value: "employee@test.tld" },
            });
            fireEvent.change(inputPassword, { target: { value: "employee" } });

            const handleSubmit = jest.fn(login.handleSubmitEmployee);
            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalled();
            await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for promise to resolve

            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                "user",
                JSON.stringify({
                    type: "Employee",
                    email: "employee@test.tld",
                    password: "employee",
                    status: "connected",
                })
            );
            expect(storeMock.login).toHaveBeenCalledWith(
                JSON.stringify({
                    email: "employee@test.tld",
                    password: "employee",
                })
            );
            expect(screen.getByTestId("Bills-employee")).toBeTruthy();
        });
    });

    describe("When I submit the admin form with correct data", () => {
        test("Then I should be logged in as an admin", async () => {
            const login = new Login({
                document,
                localStorage: window.localStorage,
                onNavigate,
                PREVIOUS_LOCATION,
                store: storeMock,
            });

            // Ensure that the LoginUI includes the admin form
            document.body.innerHTML = LoginUI();

            const form = screen.getByTestId("form-admin");
            const inputEmail = screen.getByTestId("admin-email-input");
            const inputPassword = screen.getByTestId("admin-password-input");

            fireEvent.change(inputEmail, {
                target: { value: "admin@test.tld" },
            });
            fireEvent.change(inputPassword, { target: { value: "admin" } });

            const handleSubmit = jest.fn(login.handleSubmitAdmin);
            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalled();
            await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for promise to resolve

            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                "user",
                JSON.stringify({
                    type: "Admin",
                    email: "admin@test.tld",
                    password: "admin",
                    status: "connected",
                })
            );
            expect(storeMock.login).toHaveBeenCalledWith(
                JSON.stringify({
                    email: "admin@test.tld",
                    password: "admin",
                })
            );
            expect(screen.getByTestId("Dashboard")).toBeTruthy();
        });
    });

    describe("When store is not defined", () => {
        test("Then login should return null", () => {
            const login = new Login({
                document,
                localStorage: window.localStorage,
                onNavigate,
                PREVIOUS_LOCATION,
                store: null,
            });

            const result = login.login({
                email: "test@test.com",
                password: "password",
            });
            expect(result).toBeNull();
        });

        test("Then createUser should return null", () => {
            const login = new Login({
                document,
                localStorage: window.localStorage,
                onNavigate,
                PREVIOUS_LOCATION,
                store: null,
            });

            const result = login.createUser({
                email: "test@test.com",
                password: "password",
            });
            expect(result).toBeNull();
        });
    });

    describe("When login fails", () => {
        test("Then it should Employee call createUser", async () => {
            storeMock.login.mockRejectedValueOnce(new Error("login error"));
            const spyError = jest.spyOn(console, "error");
            const login = new Login({
                document,
                localStorage: window.localStorage,
                onNavigate,
                PREVIOUS_LOCATION,
                store: storeMock,
            });

            const form = screen.getByTestId("form-employee");
            const inputEmail = screen.getByTestId("employee-email-input");
            const inputPassword = screen.getByTestId("employee-password-input");

            fireEvent.change(inputEmail, {
                target: { value: "employee@test.com" },
            });
            fireEvent.change(inputPassword, { target: { value: "password" } });

            const handleSubmit = jest.fn(login.handleSubmitEmployee);
            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalled();
            await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for promise to resolve

            expect(storeMock.create).toHaveBeenCalledWith({
                data: JSON.stringify({
                    type: "Employee",
                    name: "employee",
                    email: "employee@test.com",
                    password: "password",
                }),
            });
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                "user",
                JSON.stringify({
                    type: "Employee",
                    email: "employee@test.com",
                    password: "password",
                    status: "connected",
                })
            );
        });
        test("Then it should Admin call createUser", async () => {
            storeMock.login.mockRejectedValueOnce(new Error("login error"));
            const spyError = jest.spyOn(console, "error");
            const login = new Login({
                document,
                localStorage: window.localStorage,
                onNavigate,
                PREVIOUS_LOCATION,
                store: storeMock,
            });
            const form = screen.getByTestId("form-admin");
            const inputEmail = screen.getByTestId("admin-email-input");
            const inputPassword = screen.getByTestId("admin-password-input");

            fireEvent.change(inputEmail, {
                target: { value: "employee@test.com" },
            });
            fireEvent.change(inputPassword, { target: { value: "password" } });

            const handleSubmit = jest.fn(login.handleSubmitAdmin);
            form.addEventListener("submit", handleSubmit);
            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalled();
            await new Promise((resolve) => setTimeout(resolve, 0)); // Wait for promise to resolve

            expect(storeMock.create).toHaveBeenCalledWith({
                data: JSON.stringify({
                    type: "Admin",
                    name: "employee",
                    email: "employee@test.com",
                    password: "password",
                }),
            });
            expect(window.localStorage.setItem).toHaveBeenCalledWith(
                "user",
                JSON.stringify({
                    type: "Admin",

                    email: "employee@test.com",
                    password: "password",
                    status: "connected",
                })
            );
        });
    });
});
