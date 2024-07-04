/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { formatStatus } from "../app/format.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { formatDate } from "../app/format.js";

import router from "../app/Router.js";

// Mock du store
const mockStore = {
    bills() {
        return {
            list: jest.fn().mockResolvedValue(bills),
        };
    },
};

describe("Given I am connected as an employee", () => {
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            // TO DO : add "expect" et vérifie si windowIcon est bien présent
            expect(windowIcon.classList.contains("active-icon")).toBe(true);
        });
        test("Then bills should be ordered from earliest to latest", () => {
            document.body.innerHTML = BillsUI({ data: bills });

            // Récupérer les dates depuis le DOM
            const dateElements = screen.getAllByText((content, element) => {
                const datePattern = /^\d{1,2} [A-Za-z]{3,}\. \d{2}$/;
                return (
                    datePattern.test(content) &&
                    element.tagName.toLowerCase() === "td"
                );
            });

            const dates = dateElements.map((el) => el.innerHTML);
            console.log(dates);

            // Convertir les dates pour les comparer
            const dateToComparable = (dateStr) => {
                const date = new Date(dateStr);
                return date;
            };

            const antiChrono = (a, b) =>
                dateToComparable(a) < dateToComparable(b) ? 1 : -1;

            const datesSorted = [...dates]
                .sort(antiChrono)
                .map((date) => formatDate(date));

            expect(dates).toEqual(datesSorted);
        });

        // Ajout de Tests Unitaires et d'Intégration pour containers/Bills

        test("Then clicking on New Bill button should navigate to NewBill page", () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const onNavigate = jest.fn();
            const store = null;
            const billsPage = new Bills({
                document,
                onNavigate: onNavigate,
                store,
                localStorage: window.localStorage,
            });
            document.body.innerHTML = BillsUI({ data: bills });

            const buttonNewBill = screen.getByTestId("btn-new-bill");
            const handleClickNewBill = jest.fn(billsPage.handleClickNewBill);
            buttonNewBill.addEventListener("click", handleClickNewBill);
            fireEvent.click(buttonNewBill);

            expect(handleClickNewBill).toHaveBeenCalled();
            expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);
        });

        test("Then clicking on icon eye should open modal", () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const onNavigate = jest.fn();
            const store = null;
            const billsPage = new Bills({
                document,
                onNavigate: onNavigate,
                store,
                localStorage: window.localStorage,
            });
            document.body.innerHTML = BillsUI({ data: bills });
            $.fn.modal = jest.fn(); // Mock jQuery function
            const handleClickIconEye = jest.fn(billsPage.handleClickIconEye);
            const iconEye = screen.getAllByTestId("icon-eye")[0];
            iconEye.addEventListener("click", () =>
                handleClickIconEye(iconEye)
            );
            fireEvent.click(iconEye);
            expect(handleClickIconEye).toHaveBeenCalled();
            expect($.fn.modal).toHaveBeenCalled();
        });

        test("Then getBills should return bills data", async () => {
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({
                    type: "Employee",
                })
            );
            const onNavigate = jest.fn();
            const billsPage = new Bills({
                document,
                onNavigate: onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByText("Nouvelle note de frais"));

            // Appel de getBills et vérification du résultat
            const billsData = await billsPage.getBills();
            expect(billsData.length).toEqual(4);
            billsData.forEach((bill, index) => {
                expect(bill.id).toEqual(bills[index].id);
                expect(bill.status).toEqual(formatStatus(bills[index].status));
                expect(bill.name).toEqual(bills[index].name);
                expect(bill.email).toEqual(bills[index].email);
                expect(bill.type).toEqual(bills[index].type);
                expect(bill.vat).toEqual(bills[index].vat);
                expect(bill.pct).toEqual(bills[index].pct);
                expect(bill.commentAdmin).toEqual(bills[index].commentAdmin);
                expect(bill.amount).toEqual(bills[index].amount);
                expect(bill.date).toEqual(bills[index].date);
                expect(bill.commentary).toEqual(bills[index].commentary);
                expect(bill.fileName).toEqual(bills[index].fileName);
                expect(bill.fileUrl).toEqual(bills[index].fileUrl);
            });
        });
    });
});
