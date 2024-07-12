/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import mockStore from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { formatStatus, formatDate, verifyDate } from "../app/format.js";
import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

// Mock du store
const mockBills = {
    bills() {
        return {
            list: jest.fn().mockResolvedValue(bills),
        };
    },
};
describe("Given I am connected as an employee", () => {
    beforeEach(() => {
        Object.defineProperty(window, "localStorage", {
            value: localStorageMock,
        });
        window.localStorage.setItem(
            "user",
            JSON.stringify({ type: "Employee" })
        );
    });
    describe("When I am on Bills Page", () => {
        test("Then bill icon in vertical layout should be highlighted", async () => {
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByTestId("icon-window"));
            const windowIcon = screen.getByTestId("icon-window");
            //! TO DO : add "expect" et vérifie si windowIcon est bien présent
            expect(windowIcon.classList.contains("active-icon")).toBe(true);
        });

        test("Then bills should be ordered from earliest to latest", async () => {
            document.body.innerHTML = BillsUI({ data: bills });
            await waitFor(() => screen.getByText("Mes notes de frais"));
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

        //? Ajout de Tests Unitaires et d'Intégration pour containers/Bills

        test("Then clicking on New Bill button should navigate to NewBill page", () => {
            const onNavigate = jest.fn();
            const billsPage = new Bills({
                document,
                onNavigate: onNavigate,
                store: mockBills,
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

        test("Then getBills should return bills data", async () => {
            const onNavigate = jest.fn();
            const billsPage = new Bills({
                document,
                onNavigate: onNavigate,
                store: mockBills,
                localStorage: window.localStorage,
            });
            const root = document.createElement("div");
            root.setAttribute("id", "root");
            document.body.append(root);
            router();
            window.onNavigate(ROUTES_PATH.Bills);
            await waitFor(() => screen.getByText("Mes notes de frais"));

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
                expect(verifyDate(bill.date)).toEqual(
                    verifyDate(bills[index].date)
                );
                expect(bill.commentary).toEqual(bills[index].commentary);
                expect(bill.fileName).toEqual(bills[index].fileName);
                expect(bill.fileUrl).toEqual(bills[index].fileUrl);
            });
        });
        describe("When data data's corrupted", () => {
            beforeEach(() => {
                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                window.localStorage.setItem(
                    "user",
                    JSON.stringify({ type: "Employee" })
                );
            });
            test("Then getBills should handle the error and display a console.log", async () => {
                const onNavigate = jest.fn();
                const corruptedBill = { ...bills[0], date: "invalid-date" }; // Date invalide pour provoquer une erreur
                const mockStoreWithCorruptedData = {
                    bills() {
                        return {
                            list: jest.fn().mockResolvedValue([corruptedBill]),
                        };
                    },
                };
                const billsPage = new Bills({
                    document,
                    onNavigate,
                    store: mockStoreWithCorruptedData,
                    localStorage: window.localStorage,
                });
                const root = document.createElement("div");
                root.setAttribute("id", "root");
                document.body.append(root);
                router();
                window.onNavigate(ROUTES_PATH.Bills);
                await waitFor(() => screen.getByText("Nouvelle note de frais"));

                // Espionner sur console.log
                const consoleSpy = jest.spyOn(console, "log");
                // Appel de getBills et vérification du résultat
                const billsData = await billsPage.getBills();
                expect(billsData.length).toEqual(1);
                expect(billsData[0].date).toEqual("invalid-date"); // Vérifie que la date non formatée est retournée

                // Vérifie que console.log a été appelé avec les bons arguments
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.any(Error),
                    "for",
                    corruptedBill
                );

                // Nettoyer l'espion sur console.log
                consoleSpy.mockRestore();
            });
        });
        describe("When data are undefined", () => {
            beforeEach(() => {
                Object.defineProperty(window, "localStorage", {
                    value: localStorageMock,
                });
                window.localStorage.setItem(
                    "user",
                    JSON.stringify({ type: "Employee" })
                );
            });
            test("Then getBills should return no invoices if store is null", async () => {
                const onNavigate = jest.fn();
                const billsPage = new Bills({
                    document,
                    onNavigate,
                    store: null, // Pas de store
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
                expect(billsData).toBeUndefined();
            });
        });
    });
    describe("When I click on the eye icon", () => {
        let billsPage;

        beforeEach(() => {
            // Configuration initiale pour chaque test
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });

            // Mock de l'interface utilisateur des notes de frais
            document.body.innerHTML = BillsUI({ data: [...bills] });

            // Fonction de navigation factice
            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            // Initialisation de Bills avec les mocks nécessaires
            billsPage = new Bills({
                document,
                onNavigate,
                store: mockBills,
                localStorage: localStorageMock,
            });
        });

        test("Then clicking on icon eye should open modal", () => {
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

        test("Then a modal with the correct image is displayed.", () => {
            const iconEye = screen.getAllByTestId("icon-eye");
            const fakeHandleClickIconEye = jest.fn(() =>
                billsPage.handleClickIconEye(iconEye[0])
            );

            iconEye[0].addEventListener("click", fakeHandleClickIconEye);
            fireEvent.click(iconEye[0]);
            expect(fakeHandleClickIconEye).toHaveBeenCalled();
            expect(screen.getByText("Justificatif").innerHTML).toBe(
                "Justificatif"
            );
            expect(screen.getByAltText("Bill").src).toBe(
                "https://test.storage.tld/v0/b/billable-677b6.a%E2%80%A6f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"
            );
        });
    });

    describe("When the API is called", () => {
        beforeEach(() => {
            document.body.innerHTML = "";
        });

        it("should display a loading message while the API call is pending", async () => {
            // Mock de l'appel API qui est en attente
            mockStore.bills = jest.fn().mockImplementationOnce(() => {
                return {
                    list: jest.fn().mockReturnValue(new Promise(() => {})), // Never resolves
                };
            });

            // Définir le contenu HTML avant de lancer l'appel API
            document.body.innerHTML = BillsUI({
                data: [],
                loading: true,
                error: null,
            });

            // Simuler l'appel API et vérifier l'affichage du chargement
            await waitFor(() => {
                expect(screen.getByText("Loading...")).toBeTruthy();
            });
        });

        it("should display the bills when the API call resolves successfully", async () => {
            // Mock de l'appel API qui résout avec succès
            mockStore.bills = jest.fn().mockImplementationOnce(() => {
                return {
                    list: jest.fn().mockResolvedValue(bills),
                };
            });

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            const billsInstance = new Bills({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            // Définir le contenu HTML avant de lancer l'appel API
            document.body.innerHTML = BillsUI({
                data: [],
                loading: false,
                error: null,
            });

            // Simuler l'appel API et vérifier l'affichage des notes de frais
            const billsData = await billsInstance.getBills();
            document.body.innerHTML = BillsUI({
                data: billsData,
                loading: false,
                error: null,
            });

            await waitFor(() => {
                expect(screen.getByText(bills[0].name)).toBeTruthy();
            });
        });

        it("should display an Error 500 message when the API call fails", async () => {
            // Mock de l'appel API qui rejette une erreur
            mockStore.bills = jest.fn().mockImplementationOnce(() => {
                return {
                    list: jest.fn().mockRejectedValue(new Error("Error 500")),
                };
            });

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            const billsInstance = new Bills({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            // Définir le contenu HTML avant de lancer l'appel API
            document.body.innerHTML = BillsUI({
                data: [],
                loading: false,
                error: null,
            });

            // Simuler l'appel API et vérifier l'affichage de l'erreur
            try {
                await billsInstance.getBills();
            } catch (error) {
                document.body.innerHTML = BillsUI({
                    data: [],
                    loading: false,
                    error: "Error 500",
                });
                await waitFor(() => {
                    expect(screen.getByText("Error 500")).toBeTruthy();
                });
            }
        });
        it("should display an Error 404 message when the API call fails", async () => {
            // Mock de l'appel API qui rejette une erreur
            mockStore.bills = jest.fn().mockImplementationOnce(() => {
                return {
                    list: jest.fn().mockRejectedValue(new Error("Error 404")),
                };
            });

            const onNavigate = (pathname) => {
                document.body.innerHTML = ROUTES({ pathname });
            };

            const billsInstance = new Bills({
                document,
                onNavigate,
                store: mockStore,
                localStorage: window.localStorage,
            });

            // Définir le contenu HTML avant de lancer l'appel API
            document.body.innerHTML = BillsUI({
                data: [],
                loading: false,
                error: null,
            });

            // Simuler l'appel API et vérifier l'affichage de l'erreur
            try {
                await billsInstance.getBills();
            } catch (error) {
                document.body.innerHTML = BillsUI({
                    data: [],
                    loading: false,
                    error: "Error 404",
                });
                await waitFor(() => {
                    expect(screen.getByText("Error 404")).toBeTruthy();
                });
            }
        });
    });
});
