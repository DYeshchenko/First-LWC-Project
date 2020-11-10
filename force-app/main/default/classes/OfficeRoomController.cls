public with sharing class OfficeRoomController {
    @AuraEnabled(cacheable=true)
    public static List<Office_Room__c> getOfficeRoomsByOffice(String officeId, Boolean isManager) {
        if (isManager) {
            return [
                SELECT Name, Area__c, Capacity__c, Is_reserved__c
                FROM Office_Room__c
                WHERE Office__c = :officeId
                WITH SECURITY_ENFORCED
                ORDER BY Name
            ];
        } else {
            return [
                SELECT Name, Area__c, Capacity__c
                FROM Office_Room__c
                WHERE Office__c = :officeId AND Is_reserved__c = FALSE 
                WITH SECURITY_ENFORCED
                ORDER BY Name
            ];
        }
    }
}
