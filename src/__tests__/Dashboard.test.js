/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import DashboardFormUI from "../views/DashboardFormUI.js";
import DashboardUI from "../views/DashboardUI.js";
import Dashboard, { filteredBills, cards } from "../containers/Dashboard.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills";

jest.mock("../app/store", () => mockStore);
jest.mock("jquery");
beforeEach(() => {
    const $ = require("jquery");
    jest.spyOn($.fn, "on");
    jest.spyOn($.fn, "off");
});
describe("Given I am connected as an Admin", () => {
    describe("When I am on Dashboard page, there are bills, and there is one pending", () => {
        test("Then, filteredBills by pending status should return 1 bill", () => {
            const filtered_bills = filteredBills(bills, "pending");
            expect(filtered_bills.length).toBe(1);
        });
    });
    describe("When I am on Dashboard page, there are bills, and there is one accepted", () => {
        test("Then, filteredBills by accepted status should return 1 bill", () => {
            const filtered_bills = filteredBills(bills, "accepted");
            expect(filtered_bills.length).toBe(1);
        });
    });
    describe("When I am on Dashboard page, there are bills, and there is two refused", () => {
        test("Then, filteredBills by accepted status should return 2 bills", () => {
            const filtered_bills = filteredBills(bills, "refused");
            expect(filtered_bills.length).toBe(2);
        });
    });
    describe("When I am on Dashboard page but it is loading", () => {
        test("Then, Loading page should be rendered", () => {
            document.body.innerHTML = DashboardUI({ loading: true });
            expect(screen.getAllByText("Loading...")).toBeTruthy();
        });
    });
    describe("When I am on Dashboard page but back-end send an error message", () => {
        test("Then, Error page should be rendered", () => {
            document.body.innerHTML = DashboardUI({
                error: "some error message",
            });
            expect(screen.getAllByText("Erreur")).toBeTruthy();
        });
    });

    describe("When I am on Dashboard page and I click on arrow", () => {
        test("Then, tickets list should be unfolding, and cards should appear", async () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Admin",
                })
            );

            const dashboard = new Dashboard({
                document,
                onNavigate,
                store: null,
                bills: bills,
                localStorage: window.localStorage,
            });
            document.body.innerHTML = DashboardUI({ data: { bills } });

            const handleShowTickets1 = jest.fn((e) =>
                dashboard.handleShowTickets(e, bills, 1)
            );
            const handleShowTickets2 = jest.fn((e) =>
                dashboard.handleShowTickets(e, bills, 2)
            );
            const handleShowTickets3 = jest.fn((e) =>
                dashboard.handleShowTickets(e, bills, 3)
            );

            const icon1 = screen.getByTestId("arrow-icon1");
            const icon2 = screen.getByTestId("arrow-icon2");
            const icon3 = screen.getByTestId("arrow-icon3");

            icon1.addEventListener("click", handleShowTickets1);
            userEvent.click(icon1);
            expect(handleShowTickets1).toHaveBeenCalled();
            await waitFor(() =>
                screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)
            );
            expect(
                screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)
            ).toBeTruthy();
            icon2.addEventListener("click", handleShowTickets2);
            userEvent.click(icon2);
            expect(handleShowTickets2).toHaveBeenCalled();
            await waitFor(() =>
                screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`)
            );
            expect(
                screen.getByTestId(`open-billUIUZtnPQvnbFnB0ozvJh`)
            ).toBeTruthy();

            icon3.addEventListener("click", handleShowTickets3);
            userEvent.click(icon3);
            expect(handleShowTickets3).toHaveBeenCalled();
            await waitFor(() =>
                screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`)
            );
            expect(
                screen.getByTestId(`open-billBeKy5Mo4jkmdfPGYpTxZ`)
            ).toBeTruthy();
        });
    });

    describe("When I am on Dashboard page and I click on edit icon of a card", () => {
        test("Then, right form should be filled", () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Admin",
                })
            );

            const dashboard = new Dashboard({
                document,
                onNavigate,
                store: null,
                bills: bills,
                localStorage: window.localStorage,
            });
            document.body.innerHTML = DashboardUI({ data: { bills } });
            const handleShowTickets1 = jest.fn((e) =>
                dashboard.handleShowTickets(e, bills, 1)
            );
            const icon1 = screen.getByTestId("arrow-icon1");
            icon1.addEventListener("click", handleShowTickets1);
            userEvent.click(icon1);
            expect(handleShowTickets1).toHaveBeenCalled();
            expect(
                screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)
            ).toBeTruthy();
            const iconEdit = screen.getByTestId(
                "open-bill47qAXb6fIm2zOKkLzMro"
            );
            userEvent.click(iconEdit);
            expect(screen.getByTestId(`dashboard-form`)).toBeTruthy();
        });
    });
    describe("When I call getBillsAllUsers", () => {
        test("Then, it should fetch and return bills from the store", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Admin",
                })
            );
            const onNavigate = jest.fn((pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            });

            const dashboard = new Dashboard({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            const listMock = jest.fn().mockResolvedValueOnce(bills);
            mockStore.bills = jest.fn(() => {
                return {
                    list: listMock,
                };
            });

            const fetchedBills = await dashboard.getBillsAllUsers();

            expect(listMock).toHaveBeenCalled();
            expect(fetchedBills).toEqual(bills);
        });
    });
    describe("When I am on Dashboard page and I click 2 times on edit icon of a card", () => {
        test("Then, big bill Icon should Appear", () => {
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Admin",
                })
            );

            const dashboard = new Dashboard({
                document,
                onNavigate,
                store: null,
                bills: bills,
                localStorage: window.localStorage,
            });
            document.body.innerHTML = DashboardUI({ data: { bills } });

            const handleShowTickets1 = jest.fn((e) =>
                dashboard.handleShowTickets(e, bills, 1)
            );
            const icon1 = screen.getByTestId("arrow-icon1");
            icon1.addEventListener("click", handleShowTickets1);
            userEvent.click(icon1);
            expect(handleShowTickets1).toHaveBeenCalled();
            expect(
                screen.getByTestId(`open-bill47qAXb6fIm2zOKkLzMro`)
            ).toBeTruthy();
            const iconEdit = screen.getByTestId(
                "open-bill47qAXb6fIm2zOKkLzMro"
            );
            userEvent.click(iconEdit);
            userEvent.click(iconEdit);
            const bigBilledIcon = screen.queryByTestId("big-billed-icon");
            expect(bigBilledIcon).toBeTruthy();
        });
    });

    describe("When I am on Dashboard and there are no bills", () => {
        test("Then, no cards should be shown", () => {
            document.body.innerHTML = cards([]);
            const iconEdit = screen.queryByTestId(
                "open-bill47qAXb6fIm2zOKkLzMro"
            );
            expect(iconEdit).toBeNull();
        });
    });
});

describe("Given I am connected as Admin, and I am on Dashboard page, and I clicked on a pending bill", () => {
    describe("When I click on accept button", () => {
        test("I should be sent on Dashboard with big billed icon instead of form", () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Admin",
                })
            );
            document.body.innerHTML = DashboardFormUI(bills[0]);

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const store = null;
            const dashboard = new Dashboard({
                document,
                onNavigate,
                store,
                bills,
                localStorage: window.localStorage,
            });

            const acceptButton = screen.getByTestId("btn-accept-bill-d");
            const handleAcceptSubmit = jest.fn((e) =>
                dashboard.handleAcceptSubmit(e, bills[0])
            );
            acceptButton.addEventListener("click", handleAcceptSubmit);
            fireEvent.click(acceptButton);
            expect(handleAcceptSubmit).toHaveBeenCalled();
            const bigBilledIcon = screen.queryByTestId("big-billed-icon");
            expect(bigBilledIcon).toBeTruthy();
        });

        test("Then, the bill should be updated with accepted status and navigate to Dashboard", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Admin",
                })
            );
            document.body.innerHTML = DashboardFormUI(bills[0]);

            const onNavigate = jest.fn((pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            });

            const dashboard = new Dashboard({
                document,
                onNavigate,
                store: mockStore,
                bills: bills,
                localStorage: window.localStorage,
            });

            const bill = bills[0];
            bill.status = "pending";
            dashboard.updateBill = jest.fn();

            const acceptButton = screen.getByTestId("btn-accept-bill-d");
            const handleAcceptSubmit = jest.fn((e) =>
                dashboard.handleAcceptSubmit(e, bills[0])
            );
            acceptButton.addEventListener("click", handleAcceptSubmit);
            fireEvent.click(acceptButton);
            expect(handleAcceptSubmit).toHaveBeenCalled();
            expect(dashboard.updateBill).toHaveBeenCalledWith({
                ...bill,
                status: "accepted",
                commentAdmin: "",
            });
            await waitFor(() =>
                expect(onNavigate).toHaveBeenCalledWith(
                    ROUTES_PATH["Dashboard"]
                )
            );
        });
    });
    describe("When I click on refuse button", () => {
        test("I should be sent on Dashboard with big billed icon instead of form", () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Admin",
                })
            );
            document.body.innerHTML = DashboardFormUI(bills[0]);

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const store = null;
            const dashboard = new Dashboard({
                document,
                onNavigate,
                store,
                bills,
                localStorage: window.localStorage,
            });
            const refuseButton = screen.getByTestId("btn-refuse-bill-d");
            const handleRefuseSubmit = jest.fn((e) =>
                dashboard.handleRefuseSubmit(e, bills[0])
            );
            refuseButton.addEventListener("click", handleRefuseSubmit);
            fireEvent.click(refuseButton);
            expect(handleRefuseSubmit).toHaveBeenCalled();
            const bigBilledIcon = screen.queryByTestId("big-billed-icon");
            expect(bigBilledIcon).toBeTruthy();
        });

        test("Then, the bill should be updated with refused status and navigate to Dashboard", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Admin",
                })
            );
            document.body.innerHTML = DashboardFormUI(bills[0]);

            const onNavigate = jest.fn((pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            });

            const dashboard = new Dashboard({
                document,
                onNavigate,
                store: mockStore,
                bills: bills,
                localStorage: window.localStorage,
            });

            const bill = bills[0];
            bill.status = "pending";
            dashboard.updateBill = jest.fn();

            const e = { preventDefault: jest.fn() };

            dashboard.handleRefuseSubmit(e, bill);

            expect(dashboard.updateBill).toHaveBeenCalledWith({
                ...bill,
                status: "refused",
                commentAdmin: "",
            });
            await waitFor(() =>
                expect(onNavigate).toHaveBeenCalledWith(
                    ROUTES_PATH["Dashboard"]
                )
            );
        });
    });
});

describe("Given I am connected as Admin and I am on Dashboard page and I clicked on a bill", () => {
    describe("When I click on the icon eye", () => {
        test("A modal should open", () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Admin",
                })
            );
            document.body.innerHTML = DashboardFormUI(bills[0]);
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const store = null;
            const dashboard = new Dashboard({
                document,
                onNavigate,
                store,
                bills,
                localStorage: window.localStorage,
            });

            const handleClickIconEye = jest.fn(dashboard.handleClickIconEye);
            const eye = screen.getByTestId("icon-eye-d");
            eye.addEventListener("click", handleClickIconEye);
            userEvent.click(eye);
            expect(handleClickIconEye).toHaveBeenCalled();

            const modale = screen.getByTestId("modaleFileAdmin");
            expect(modale).toBeTruthy();
        });

        test("Then, it should open the modal with the bill image", () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Admin",
                })
            );
            document.body.innerHTML = DashboardFormUI(bills[0]);
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };
            const dashboard = new Dashboard({
                document,
                onNavigate,
                store: null,
                bills: bills,
                localStorage: window.localStorage,
            });

            $.fn.modal = jest.fn(); // Mock jQuery modal function

            dashboard.handleClickIconEye();

            expect($.fn.modal).toHaveBeenCalled();
            expect(screen.getByAltText("Bill")).toBeTruthy();
        });
    });
});

// test d'intégration GET

describe("When I filter bills in production environment", () => {
    test("Then, it should exclude bills from test users and match the status", () => {
        const data = [
            { email: "user@test.com", status: "pending" },
            { email: "cedric.hiely@billed.com", status: "pending" },
            { email: "user2@test.com", status: "accepted" },
        ];

        global.localStorage.setItem(
            "user",
            JSON.stringify({ email: "user@test.com" })
        );
        const pending_bills = filteredBills(data, "pending");
        expect(pending_bills.length).toBe(2);
        expect(pending_bills[0].email).toBe("user@test.com");
        expect(pending_bills[1].email).toBe("cedric.hiely@billed.com");
        const accepted_bills = filteredBills(data, "accepted");
        expect(accepted_bills.length).toBe(1);
        expect(accepted_bills[0].email).toBe("user2@test.com");
    });
});

describe("When I click on the arrow icon", () => {
    test("Then, it should toggle the display of tickets and rotate the arrow icon", async () => {
        jest.mock("jquery", () => {
            const m$ = jest.fn().mockReturnValue({
                on: jest.fn(),
                off: jest.fn(),
                show: jest.fn(),
                hide: jest.fn(),
                toggle: jest.fn(),
                modal: jest.fn(),
            });
            m$.fn = m$;
            return m$;
        });
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        window.localStorage.setItem(
            "user",
            JSON.stringify({
                type: "Admin",
            })
        );
        document.body.innerHTML = DashboardUI({ data: { bills } });

        const onNavigate = jest.fn((pathname) => {
            document.body.innerHTML = ROUTES({ pathname });
        });

        const dashboard = new Dashboard({
            document,
            onNavigate,
            store: mockStore,
            bills: bills,
            localStorage: window.localStorage,
        });

        // ? Appel de render pour ajouter les écouteurs d'événements

        // ! "arrow-icon1"
        // Attendre que l'icône de flèche soit disponible dans le DOM

        await waitFor(() => screen.getByTestId("arrow-icon1"));
        const icon = screen.getByTestId("arrow-icon1");

        expect(screen.getByTestId("status-bills-container1")).toBeTruthy();

        // Cliquer sur l'icône pour afficher les billets
        fireEvent.click(icon);
        expect(screen.getByTestId("status-bills-container1")).toBeTruthy();
        expect(icon).toHaveStyle("transform: rotate(0deg)");

        // Re-cliquer sur l'icône pour cacher les billets
        fireEvent.click(icon);

        expect(icon).toHaveStyle("transform: rotate(90deg)");

        // ! "arrow-icon2"
        await waitFor(() => screen.getByTestId("arrow-icon2"));
        const icon2 = screen.getByTestId("arrow-icon2");

        expect(screen.getByTestId("status-bills-container2")).toBeTruthy();

        // Cliquer sur l'icône pour afficher les billets
        fireEvent.click(icon2);
        expect(screen.getByTestId("status-bills-container2")).toBeTruthy();
        expect(icon2).toHaveStyle("transform: rotate(0deg)");

        // Re-cliquer sur l'icône pour cacher les billets
        fireEvent.click(icon2);

        expect(icon2).toHaveStyle("transform: rotate(90deg)");

        // ! "arrow-icon3"
        await waitFor(() => screen.getByTestId("arrow-icon3"));
        const icon3 = screen.getByTestId("arrow-icon3");

        expect(screen.getByTestId("status-bills-container3")).toBeTruthy();

        // Cliquer sur l'icône pour afficher les billets
        fireEvent.click(icon3);
        expect(screen.getByTestId("status-bills-container3")).toBeTruthy();
        expect(icon3).toHaveStyle("transform: rotate(0deg)");

        // Re-cliquer sur l'icône pour cacher les billets
        fireEvent.click(icon3);

        expect(icon3).toHaveStyle("transform: rotate(90deg)");
    });
});
