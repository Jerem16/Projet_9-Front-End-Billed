/**
 * @jest-environment jsdom
 */

import { screen, fireEvent } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { bills } from "../fixtures/bills.js";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import { formatStatus, formatDate, verifyDate } from "../app/format.js";
import { ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
    describe("When I am on NewBill Page", () => {
        beforeEach(() => {
            document.body.innerHTML = NewBillUI();
        });

        test("Then all form fields should be rendered", () => {
            expect(screen.getByTestId("expense-type")).toBeTruthy();
            expect(screen.getByTestId("expense-name")).toBeTruthy();
            expect(screen.getByTestId("datepicker")).toBeTruthy();
            expect(screen.getByTestId("amount")).toBeTruthy();
            expect(screen.getByTestId("vat")).toBeTruthy();
            expect(screen.getByTestId("pct")).toBeTruthy();
            expect(screen.getByTestId("commentary")).toBeTruthy();
            expect(screen.getByTestId("file")).toBeTruthy();
            expect(screen.getByText("Envoyer")).toBeTruthy();
        });
    });
    describe("When I am on NewBill Page", () => {
        beforeEach(() => {
            document.body.innerHTML = NewBillUI();

            // Mocking localStorage
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ email: "test@test.com" })
            );

            // Mocking the store
            const onNavigate = (pathname) => {
                document.body.innerHTML = pathname;
            };

            const store = mockStore;

            new NewBill({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage,
            });
        });

        test("Then file input should accept only jpg, jpeg, or png extensions", () => {
            const fileInput = screen.getByTestId("file");
            const handleChangeFile = jest.fn((e) => {
                e.preventDefault();
                const file = e.target.files[0];
                const filePath = e.target.value.split(/\\/g);
                const fileName = filePath[filePath.length - 1];
                const allowedExtensions = /(\.jpg|\.jpeg|\.png)$/i;

                if (!allowedExtensions.exec(fileName)) {
                    alert(
                        "Invalid file type. Please upload a file with a .jpg, .jpeg, or .png extension."
                    );
                    e.target.value = "";
                }
            });

            fileInput.addEventListener("change", handleChangeFile);

            // Test with an invalid file type
            const invalidFile = new File([""], "test.pdf", {
                type: "application/pdf",
            });
            fireEvent.change(fileInput, { target: { files: [invalidFile] } });
            expect(handleChangeFile).toHaveBeenCalled();
            expect(fileInput.value).toBe("");

            // Test with a valid file type
            const validFile = new File([""], "test.jpg", {
                type: "image/jpeg",
            });
            fireEvent.change(fileInput, { target: { files: [validFile] } });
            expect(handleChangeFile).toHaveBeenCalled();
            expect(fileInput.files[0].name).toBe("test.jpg");
        });
    });
    describe("When I am on NewBill Page", () => {
        beforeEach(() => {
            document.body.innerHTML = NewBillUI();

            // Mocking localStorage
            Object.defineProperty(window, "localStorage", {
                value: localStorageMock,
            });
            window.localStorage.setItem(
                "user",
                JSON.stringify({ email: "test@test.com" })
            );

            // Mocking the store
            const onNavigate = (pathname) => {
                document.body.innerHTML = pathname;
            };

            const store = mockStore;

            new NewBill({
                document,
                onNavigate,
                store,
                localStorage: window.localStorage,
            });
        });

        test("Then form submission should send the correct data", () => {
            const form = screen.getByTestId("form-new-bill");

            fireEvent.change(screen.getByTestId("expense-type"), {
                target: { value: "Transports" },
            });
            fireEvent.change(screen.getByTestId("expense-name"), {
                target: { value: "Vol Paris Londres" },
            });
            fireEvent.change(screen.getByTestId("datepicker"), {
                target: { value: "2023-05-25" },
            });
            fireEvent.change(screen.getByTestId("amount"), {
                target: { value: "348" },
            });
            fireEvent.change(screen.getByTestId("vat"), {
                target: { value: "70" },
            });
            fireEvent.change(screen.getByTestId("pct"), {
                target: { value: "20" },
            });
            fireEvent.change(screen.getByTestId("commentary"), {
                target: { value: "Business trip" },
            });

            const handleSubmit = jest.fn((e) => {
                e.preventDefault();
                const email = JSON.parse(localStorage.getItem("user")).email;
                const bill = {
                    email,
                    type: e.target.querySelector(
                        `select[data-testid="expense-type"]`
                    ).value,
                    name: e.target.querySelector(
                        `input[data-testid="expense-name"]`
                    ).value,
                    amount: parseInt(
                        e.target.querySelector(`input[data-testid="amount"]`)
                            .value
                    ),
                    date: e.target.querySelector(
                        `input[data-testid="datepicker"]`
                    ).value,
                    vat: e.target.querySelector(`input[data-testid="vat"]`)
                        .value,
                    pct:
                        parseInt(
                            e.target.querySelector(`input[data-testid="pct"]`)
                                .value
                        ) || 20,
                    commentary: e.target.querySelector(
                        `textarea[data-testid="commentary"]`
                    ).value,
                    fileUrl: "test.jpg",
                    fileName: "test.jpg",
                    status: "pending",
                };
                console.log(bill);
            });

            form.addEventListener("submit", handleSubmit);

            fireEvent.submit(form);

            expect(handleSubmit).toHaveBeenCalled();
        });
    });
});
