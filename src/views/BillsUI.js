import VerticalLayout from "./VerticalLayout.js";
import ErrorPage from "./ErrorPage.js";
import LoadingPage from "./LoadingPage.js";
import { formatDate } from "../app/format.js";

import Actions from "./Actions.js";

const row = (bill) => {
    return `
  <tr>
    <td data-testid="bills-type">${bill.type}</td>
    <td data-testid="bills-name">${bill.name}</td>
    <td data-testid="bills-date">${formatDate(
        bill.date
    )}</td>
    <td data-testid="bills-amount">${bill.amount} €</td>
    <td data-testid="bills-status">${bill.status}</td>
    <td>
      ${Actions(bill.fileUrl)}
    </td>
</tr>
    `;
};

//mise en place fonction de tri par date
const sortByDate = (data) => {
    return data.sort((a, b) => (new Date(a.date) < new Date(b.date) ? 1 : -1));
};

//ajout des données
const rows = (data) => {
    //tri
    return data && data.length
        ? sortByDate(data)
              .map((bill) => row(bill))
              .join("")
        : "";
};

export default ({ data: bills, loading, error }) => {
    const modal = () => `
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5>
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div class="modal-body">
          </div>
        </div>
      </div>
    </div>
  `;

    if (loading) {
        return LoadingPage();
    } else if (error) {
        return ErrorPage(error);
    }

    return `
    <div class='layout'>
      ${VerticalLayout(120)}
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div>
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button>
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%">
          <thead>
              <tr data-testid="table_bills">
                <th data-testid="element-table_bills-type">Type</th>
                <th data-testid="element-table_bills-name">Nom</th>
                <th data-testid="element-table_bills-date">Date</th>
                <th data-testid="element-table_bills-amount">Montant</th>
                <th data-testid="element-table_bills-status">Statut</th>
                <th data-testid="element-table_bills-actions">Actions</th>
              </tr>
          </thead>
          <tbody data-testid="tbody">
            ${rows(bills)}
          </tbody>
          </table>
        </div>
      </div>
      ${modal()}
    </div>`;
};
