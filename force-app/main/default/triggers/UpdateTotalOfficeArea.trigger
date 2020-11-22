trigger UpdateTotalOfficeArea on Office_Room__c (before update, before delete, after insert, after update, after undelete) {
    List<Office_Room__c> roomsList = Trigger.isAfter ? Trigger.New : Trigger.Old;

    List<Office__c> officesList = [SELECT Total_Area__c, (SELECT Area__c FROM Office_Rooms__r WHERE Id IN :roomsList)
                                   FROM Office__c
                                   WHERE Id IN (SELECT Office__c FROM Office_Room__c WHERE Id IN :roomsList)];

    
    for (Office__c office : officesList) {
        for (Office_Room__c room : office.Office_Rooms__r) {
            if (room.Area__c == null) {
                room.Area__c = 0;
            }

            if (Trigger.isBefore) {
                office.Total_Area__c -= room.Area__c;
            } else if (Trigger.isAfter) {
                office.Total_Area__c += room.Area__c;
            }
        }
    }

    update officesList;
}