import { api, LightningElement, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { getObjectInfo } from "lightning/uiObjectInfoApi";
import { updateRecord } from "lightning/uiRecordApi";
import { refreshApex } from "@salesforce/apex";
import getOfficeRoomsByOffice from "@salesforce/apex/OfficeRoomController.getOfficeRoomsByOffice";

import OFFICE_ROOM_OBJECT from "@salesforce/schema/Office_Room__c";
import ID_FIELD from "@salesforce/schema/Office_Room__c.Id";
import IS_RESERVED_FIELD from "@salesforce/schema/Office_Room__c.Is_reserved__c";

import ROOMS_LIST_LABEL from "@salesforce/label/c.Rooms_List";
import NUMBER_LABEL from "@salesforce/label/c.Number";
import AREA_LABEL from "@salesforce/label/c.Area";
import CAPACITY_LABEL from "@salesforce/label/c.Capacity";
import RESERVED_LABEL from "@salesforce/label/c.Is_reserved";
import CHANGE_BOOKING_LABEL from "@salesforce/label/c.Change_booking";
import BOOKED_LABEL from "@salesforce/label/c.Booked";
import FREE_LABEL from "@salesforce/label/c.Free";
import BOOK_LABEL from "@salesforce/label/c.Book";
import VACATE_LABEL from "@salesforce/label/c.Vacate";
import BOOK_BUTTON_TITLE_LABEL from "@salesforce/label/c.Book_Room_Button_Title";
import UNBOOK_BUTTON_TITLE_LABEL from "@salesforce/label/c.Unbook_Room_Button_Title";
import ERROR_LABEL from "@salesforce/label/c.Error";

export default class RoomsList extends LightningElement {
  label = {
    ROOMS_LIST_LABEL,
    NUMBER_LABEL,
    AREA_LABEL,
    CAPACITY_LABEL,
    RESERVED_LABEL,
    CHANGE_BOOKING_LABEL,
    BOOKED_LABEL,
    FREE_LABEL,
    ERROR_LABEL,
    BOOK_BUTTON_TITLE_LABEL,
    UNBOOK_BUTTON_TITLE_LABEL
  }

  @api recordId;

  isManager;
  error;

  bookButtonLabel = BOOK_LABEL;
  vacateButtonLabel = VACATE_LABEL;

  @wire(getObjectInfo, { objectApiName: OFFICE_ROOM_OBJECT })
  getOfficeRoomObject({ error, data }) {
    if (data) {
      if (data.fields.Is_reserved__c && data.fields.Is_reserved__c.updateable) {
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
