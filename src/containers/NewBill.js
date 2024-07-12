import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
    constructor({ document, onNavigate, store, localStorage }) {
        this.document = document;
        this.onNavigate = onNavigate;
        this.store = store;
        const formNewBill = this.document.querySelector(
            `form[data-testid="form-new-bill"]`
        );
        formNewBill.addEventListener("submit", this.handleSubmit);
        const file = this.document.querySelector(`input[data-testid="file"]`);
        file.addEventListener("change", this.handleChangeFile);
        this.fileUrl = null;
        this.fileName = null;
        this.billId = null;
        new Logout({ document, localStorage, onNavigate });
    }
    handleChangeFile = (e) => {
        e.preventDefault();
        const file = this.document.querySelector(`input[data-testid="file"]`)
            .files[0];
        const filePath = e.target.value.split(/\\/g);
        // To-do : empèche la saisie d'un document qui a une extension différente de jpg, jpeg ou png
        const allowedExtensions = ["image/jpg", "image/jpeg", "image/png"];
        const submitButton = this.document.querySelector("#btn-send-bill");
        const fileNamed = this.document.querySelector("#fileName");
        if (allowedExtensions.includes(file.type)) {
            submitButton.removeAttribute("disabled");
            const fileName = filePath[filePath.length - 1];
            const formData = new FormData();
            const email = JSON.parse(localStorage.getItem("user")).email;
            formData.append("file", file);
            formData.append("email", email);

            this.store
                .bills()
                .create({
                    data: formData,
                    headers: {
                        noContentType: true,
                    },
                })
                .then(({ fileUrl, key }) => {
                    console.log(fileUrl);
                    this.billId = key;
                    this.fileUrl = fileUrl;
                    this.fileName = fileName;
                })
                // .catch((error) => console.error(error));
        } else {
            file.value = "";
            fileNamed.value = "";
            alert(
                "Invalid file type. Please upload a file with a .jpg, .jpeg, or .png extension."
            );
            submitButton.setAttribute("disabled", "true");
        }
    };

    handleSubmit = (e) => {
        e.preventDefault();
        const email = JSON.parse(localStorage.getItem("user")).email;
        const bill = {
            email,
            type: e.target.querySelector(`select[data-testid="expense-type"]`)
                .value,
            name: e.target.querySelector(`input[data-testid="expense-name"]`)
                .value,
            amount: parseInt(
                e.target.querySelector(`input[data-testid="amount"]`).value
            ),
            date: e.target.querySelector(`input[data-testid="datepicker"]`)
                .value,
            vat: e.target.querySelector(`input[data-testid="vat"]`).value,
            pct:
                parseInt(
                    e.target.querySelector(`input[data-testid="pct"]`).value
                ) || 20,
            commentary: e.target.querySelector(
                `textarea[data-testid="commentary"]`
            ).value,
            fileUrl: this.fileUrl,
            fileName: this.fileName,
            status: "pending",
        };
        this.updateBill(bill);
        this.onNavigate(ROUTES_PATH["Bills"]);
    };

    // not need to cover this function by tests
    updateBill = (bill) => {
        if (this.store) {
            this.store
                .bills()
                .update({ data: JSON.stringify(bill), selector: this.billId })
                .then(() => {
                    this.onNavigate(ROUTES_PATH["Bills"]);
                })
                .catch((error) => console.error(error));
        }
    };
}
