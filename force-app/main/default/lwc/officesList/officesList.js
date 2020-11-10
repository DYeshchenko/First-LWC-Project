import { LightningElement, wire, track } from "lwc";
import { getListUi } from "lightning/uiListApi";
import { NavigationMixin } from "lightning/navigation";

import OFFICE_OBJECT from "@salesforce/schema/Office__c";
import OFFICE_ROOM_OBJECT from "@salesforce/schema/Office_Room__c";
import OFFICE_NAME_FIELD from "@salesforce/schema/Office__c.Name";

export default class OfficesList extends NavigationMixin(LightningElement) {
  pageToken = null;
  nextPageToken = null;
  previousPageToken = null;

  @track offices;
  officeRooms;

  errorOfficesList;
  errorRoomsList;

  @wire(getListUi, {
    objectApiName: OFFICE_OBJECT,
    listViewApiName: "All",
    sortBy: OFFICE_NAME_FIELD,
    pageSize: 10,
    pageToken: "$pageToken"
  })
  getOfficesList({ error, data }) {
    if (data) {
      this.offices = data.records.records.slice();
      this.errorOfficesList = undefined;
      this.nextPageToken = data.records.nextPageToken;
      this.previousPageToken = data.records.previousPageToken;

      if (this.officeRooms) {
        this.setTotalArea();
      } else {
        this.setTotalAreaInRoomsWire = true;
      }
    } else if (error) {
      this.offices = undefined;
      this.errorOfficesList = error;
    }
  }

  @wire(getListUi, { objectApiName: OFFICE_ROOM_OBJECT, listViewApiName: "All_Rooms_with_Area_and_Office" })
  getOfficeRooms({ error, data }) {
    if (data) {
      this.officeRooms = data.records.records;
      this.errorRoomsList = undefined;

      if (this.offices) {
        this.setTotalArea();
      }
    } else if (error) {
      this.officeRooms = undefined;
      this.errorRoomsList = error;
    }
  }

  setTotalArea() {
    for (let office in this.offices) {
      let totalArea = 0;

      for (let room in this.officeRooms) {
        if (
          this.officeRooms[room].fields.Office__r.value.id === this.offices[office].id &&
          this.officeRooms[room].fields.Area__c.value
        ) {
          totalArea += this.officeRooms[room].fields.Area__c.value;
        }
      }

      this.offices[office] = Object.assign({}, this.offices[office], {
        totalArea: `${totalArea}`
      });
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
