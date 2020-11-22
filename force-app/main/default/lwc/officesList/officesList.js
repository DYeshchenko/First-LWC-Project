import { LightningElement, api, wire, track } from "lwc";
import { getListUi } from "lightning/uiListApi";
import { NavigationMixin } from "lightning/navigation";

import OFFICE_OBJECT from "@salesforce/schema/Office__c";
import OFFICE_NAME_FIELD from "@salesforce/schema/Office__c.Name";

import LIST_LABEL from "@salesforce/label/c.Offices_List";
import NAME_LABEL from "@salesforce/label/c.Name";
import ADDRESS_LABEL from "@salesforce/label/c.Address";
import TOTAL_AREA_LABEL from "@salesforce/label/c.Total_Area";
import PREVIOUS_LABEL from "@salesforce/label/c.Previous";
import NEXT_LABEL from "@salesforce/label/c.Next";
import ERROR_LABEL from "@salesforce/label/c.Error";

export default class OfficesList extends NavigationMixin(LightningElement) {
  label = {
    LIST_LABEL,
    NAME_LABEL,
    ADDRESS_LABEL,
    TOTAL_AREA_LABEL,
    PREVIOUS_LABEL,
    NEXT_LABEL,
    ERROR_LABEL
  };

  @api pageSize;
  pageToken = null;
  nextPageToken = null;
  previousPageToken = null;

  @track offices;
  error;

  @wire(getListUi, {
    objectApiName: OFFICE_OBJECT,
    listViewApiName: "All",
    sortBy: OFFICE_NAME_FIELD,
    pageSize: "$pageSize",
    pageToken: "$pageToken"
  })
  getOfficesList({ error, data }) {
    if (data) {
      this.offices = data.records.records.slice();
      this.error = undefined;
      this.nextPageToken = data.records.nextPageToken;
      this.previousPageToken = data.records.previousPageToken;
    } else if (error) {
      this.offices = undefined;
      this.error = error;
    }
  }

  get isOnePage() {
    return this.nextPageToken === null && this.previousPageToken === null;
  }

  handleNextPage(evt) {
    this.pageToken = this.nextPageToken;
  }

  handlePreviousPage(evt) {
    this.pageToken = this.previousPageToken;
  }

  navigateToRecordViewPage(evt) {
    evt.preventDefault();
    evt.stopPropagation();

    const officeRecordId = evt.target["outerHTML"]
      .match(/office_id=".+"/)[0]
      .slice(11, -1);

    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: officeRecordId,
        objectApiName: OFFICE_OBJECT,
        actionName: "view"
      }
    });
  }
}
