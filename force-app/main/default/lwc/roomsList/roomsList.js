import { api, LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { updateRecord } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import getOfficeRoomsByOffice from "@salesforce/apex/OfficeRoomController.getOfficeRoomsByOffice";

import OFFICE_ROOM_OBJECT from "@salesforce/schema/Office_Room__c";
import ID_FIELD from "@salesforce/schema/Office_Room__c.Id";
import IS_RESERVED_FIELD from "@salesforce/schema/Office_Room__c.Is_reserved__c";

export default class RoomsList extends LightningElement {
  @api recordId;

  isManager;
  error;

  bookButtonLabel = "Book";
  vacateButtonLabel = "Vacate";

  @wire(getObjectInfo, { objectApiName: OFFICE_ROOM_OBJECT })
  getOfficeRoomObject({ error, data }) {
    if (data) {
      if (data.fields.Is_reserved__c.updateable) {
        this.isManager = true;
      } else {
        this.isManager = false;
      }
    } else if (error) {
      this.error = error;
    }
  }

  @wire(getOfficeRoomsByOffice, {
    officeId: "$recordId",
    isManager: "$isManager"
  })
  officeRooms;

  get columnClass() {
    return this.isManager
      ? "slds-col slds-size_1-of-5"
      : "slds-col slds-size_1-of-3";
  }

  handleClick(evt) {
    if (!this.isManager) return;

    const roomId = evt.target.value;
    const butLabel = evt.target.label;
    let isReserved;

    if (butLabel === this.bookButtonLabel) {
      isReserved = true;
    } else if (butLabel === this.vacateButtonLabel) {
      isReserved = false;
    } else return;

    const fields = {};
    fields[ID_FIELD.fieldApiName] = roomId;
    fields[IS_RESERVED_FIELD.fieldApiName] = isReserved;
    const recordInput = { fields };

    updateRecord(recordInput)
      .then(() => {
        const message = "Room " + (isReserved ? "booked" : "vacated");

        this.dispatchEvent(
          new ShowToastEvent({
            title: "Success",
            message: message,
            variant: "success"
          })
        );

        return refreshApex(this.officeRooms);
      })
      .catch((error) => {
        this.dispatchEvent(
          new ShowToastEvent({
            title: "Error updating record",
            message: error.body.message,
            variant: "error"
          })
        );
      });
  }
}
