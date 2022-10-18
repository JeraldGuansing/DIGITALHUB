sap.ui.define([
  "jquery.sap.global",
  "sap/ui/Device",
  "sap/ui/core/Fragment",
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/Popover",
  "sap/m/Button",
  "sap/m/library",
  "sap/m/MessageToast",
  "com/apptech/DLSL/controller/APPui5",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
], function (jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast, APPui5, Filter, FilterOperator) {
  "use strict";

  return Controller.extend("com.apptech.DLSL.controller.TransactionInquiry.ApprovalInquiryTree", {
    onInit: function(){
      this.oModel = new JSONModel("model/approvalinquiry.json");
      this.getView().setModel(this.oModel, "oModel");
      this.iSelectedRow = 0;
      this.DocEntry = -1;
      this.Status="";
      this.oModel.getData().ApprovalInquiryRecords = [];
      var that = this;
      var oView = this.getView();
        oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                oView.getController().LoadForApproval();
            },
            onBeforeFirstShow: function(evt) {
                //This event is fired before the NavContainer shows this child control for the first time.

              },
            onBeforeHide: function(evt) {

            },
            onBeforeShow: function(evt) {
                //This event is fired every time before the NavContainer shows this child control.
                that.initialize(evt.data);
            }
        });
      },

    initialize: function () {
      this.getView().byId("doctype").setSelectedKey('APP_OPRQ');
      // this.openLoadingFragment();
    },

     openLoadingFragment: function(){
      if (! this.oDialog) {
            this.oDialog = sap.ui.xmlfragment("busyLogin","com.apptech.DLSL.view.fragments.BusyDialog", this);
       }
       this.oDialog.open();
    },

    closeLoadingFragment : function(){
      if(this.oDialog){
        this.oDialog.close();
      }
    },

        LoadForApproval: function () {
          this.oModel.getData().PurchaseRequestRecords = [];
          this.getView().byId("doctype").setSelectedKey("APP_OPRQ");
          this.getView().byId("doctype").setValue("Purchase Request");
          this.oModel.refresh();

          var urlString = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETRECORDS2&VALUE1=" + this.getView().byId("doctype").getSelectedKey();
          $.ajax({
            url: urlString,
            type: "GET",
            async: false,
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
            },
            error: function (xhr, status, error) {
              var Message = xhr.responseJSON["error"].message.value;
              sap.m.MessageToast.show(Message);
            },
            success: function (json) {
            },
            context: this
          }).done(function (results) {
            for (let i = 0; i < results.length; i++) {
              var StatusName;
              var infoStatate = "Information";
              if(results[i].U_APP_Requester == localStorage.getItem("UserCode")){
                  if(results[i].Status == "C"){
                    infoStatate = "Success";
                    StatusName = "Closed"
                  }else{
                    infoStatate = "Information";
                    StatusName = "Open"
                  }
    
                  var objType = "";
                  if(results[i].Object == "APP_OPRQ") {
                    objType = "Purchase Request"
                  }

                  var oDetails = [];
                  $.ajax({
                    url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=spApp_GetRecords_Details&VALUE1=" + this.getView().byId("doctype").getSelectedKey() + "&VALUE2="+ results[i].DocNum +"",
                    type: "GET",
                    async: false,
                    beforeSend: function (xhr) {
                      xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
                    },
                    error: function (xhr, status, error) {
                      var Message = xhr.responseJSON["error"].message.value;
                      sap.m.MessageToast.show(Message);
                    },
                    success: function (json) {
                    
                    },
                    context: this
                  }).done(function (resulta) {

                    for(let x = 0;x < resulta.length;x++){
                      var docType = "";
                      var oStatusDetails = "";
                      if(resulta[x].ObjType == "22"){
                        docType = "Purchase Order";
                        oStatusDetails = "Ordered";
                      }else if(resulta[x].ObjType == "20"){
                        docType = "Goods Receipt PO";
                        oStatusDetails = "GRPO";
                      }else if(resulta[x].ObjType == "18" && resulta[x].ObjType == "N"){
                        docType = "Invoiced";
                        oStatusDetails = "A/P Invoice";
                      }else{
                        docType = resulta[x].ObjTyp;
                      }

                     
                      oDetails.push({
                        "SAP": resulta[x].DocNum,
                        "DocumentType":  docType,
                        "RequestDate":  APPui5.getDatePostingFormat(resulta[x].DocDate),
                        "RequiredDate":  APPui5.getDatePostingFormat(resulta[x].DocDueDate),
                        "Status":  oStatusDetails,
                        "RequesterName": resulta[x].U_NAME,
                        "Remarks":  resulta[x].Comments,
                      });
                    }
                  
                    this.oModel.refresh();
                  });
                  this.closeLoadingFragment();

                  this.oModel.getData().PurchaseRequestRecords.push({
                    "No": results[i].DocNum,
                    "Requester": results[i].U_APP_Requester,
                    "RequesterName": results[i].U_NAME,
                    "RequestDate": APPui5.getDatePostingFormat(results[i].U_APP_RequestDate),
                    "RequiredDate": APPui5.getDatePostingFormat(results[i].U_APP_RequiredDate),
                    "Status": StatusName,
                    "DocumentType": objType,
                    "Remarks": results[i].Remark,
                    "DocLine": oDetails,
                    "InfoState": infoStatate
                  });
              }
            }

            console.log(this.oModel.getData().PurchaseRequestRecords)
            this.oModel.refresh();
          });
          this.closeLoadingFragment();
        
        },
    
        LoadForApprovalDetails: function () {
       
          this.getView().byId("filters").setSelectedKey("All");
          this.getView().byId("doctype").setSelectedKey("Purchase Request")
  
          this.oModel.getData().ApprovalInquiryRecords = [];
          $.ajax({
            url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=spApp_GetRecords_Details&VALUE1=&VALUE2="+ this.getView().byId("filters").getSelectedKey() +"&VALUE3="+ this.getView().byId("doctype").getSelectedKey() +"",
            type: "GET",
            async: false,
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
            },
            error: function (xhr, status, error) {
              var Message = xhr.responseJSON["error"].message.value;
              sap.m.MessageToast.show(Message);
            },
            success: function (json) {
              console.log(json)
            },
            context: this
          }).done(function (results) {
          
            this.oModel.refresh();
          });
          this.closeLoadingFragment();
        },

        onRelationShipMap: function(){
          this.openLoadingFragment();
          this.router = this.getOwnerComponent().getRouter();
		      this.router.navTo("RelationshipMap");
          this.closeLoadingFragment();
        },


        onFilter: function(){
          this.oModel.getData().PurchaseRequestRecords = [];
          this.oModel.refresh();
          var urlString = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETRECORDS2&VALUE1=" + this.getView().byId("doctype").getSelectedKey();
          $.ajax({
           url: urlString,
           type: "GET",
           async: false,
           beforeSend: function (xhr) {
             xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
           },
           error: function (xhr, status, error) {
             var Message = xhr.responseJSON["error"].message.value;
             sap.m.MessageToast.show(Message);
           },
           success: function (json) {
           },
           context: this
         }).done(function (results) {
          console.log(results)
           for (let i = 0; i < results.length; i++) {
             var StatusName;
             var infoStatate = "Information";
             if(results[i].U_APP_Requester == localStorage.getItem("UserCode")){
                 if(results[i].Status == "C"){
                   infoStatate = "Success";
                   StatusName = "Closed"
                 }else{
                   infoStatate = "Information";
                   StatusName = "Open"
                 }
   
                 var objType = "";
                 if(results[i].Object == "APP_OPRQ") {
                   objType = "Purchase Request"
                 }else if(results[i].Object == "APP_ORFP"){
                  objType = "Payment Request"
                 }else{
                  objType = "Inventory Request"
                }

                 var oDetails = [];
                 $.ajax({
                   url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=spApp_GetRecords_Details&VALUE1=" + this.getView().byId("doctype").getSelectedKey() + "&VALUE2="+ results[i].DocNum +"",
                   type: "GET",
                   async: false,
                   beforeSend: function (xhr) {
                     xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
                   },
                   error: function (xhr, status, error) {
                     var Message = xhr.responseJSON["error"].message.value;
                     sap.m.MessageToast.show(Message);
                   },
                   success: function (json) {
                   
                   },
                   context: this
                 }).done(function (resulta) {
                  console.log(resulta)
                   for(let x = 0;x < resulta.length;x++){
                     var docType = "";
                     var oStatusDetails = "";
                     var oState = "";
                     if(resulta[x].ObjType == "22"){
                       docType = "Purchase Order";
                       oStatusDetails = "Ordered";
                       oState = "Warning";
                     }else if(resulta[x].ObjType == "20"){
                        docType = "Goods Receipt PO";
                        oStatusDetails = "GRPO";
                        oState = "Warning";
                      }else if(resulta[x].ObjType == "18"){
                        docType = "A/P Invoiced";
                        oStatusDetails = "Invoiced";
                        oState = "Warning";
                      }else if(resulta[x].ObjType == "46"){
                        docType = "Outgoing Payment";
                        oStatusDetails = "Paid";
                        oState = "Success";
                     }else{
                       docType = "Undefined"
                     }

                    
                     oDetails.push({
                       "SAP": resulta[x].DocNum,
                       "DocumentType":  docType,
                       "RequestDate":  APPui5.getDatePostingFormat(resulta[x].DocDate),
                       "RequiredDate":  APPui5.getDatePostingFormat(resulta[x].DocDueDate),
                       "Status":  oStatusDetails,
                       "State": oState,
                       "RequesterName": resulta[x].U_NAME,
                       "Remarks":  resulta[x].Comments,
                     });
                   }
                 
                   this.oModel.refresh();
                 });
                 this.closeLoadingFragment();

                 this.oModel.getData().PurchaseRequestRecords.push({
                   "No": results[i].DocNum,
                   "Requester": results[i].U_APP_Requester,
                   "RequesterName": results[i].U_NAME,
                   "RequestDate": APPui5.getDatePostingFormat(results[i].U_APP_RequestDate),
                   "RequiredDate": APPui5.getDatePostingFormat(results[i].U_APP_RequiredDate),
                   "Status": StatusName,
                   "DocumentType": objType,
                   "State": "Information",
                   "Remarks": results[i].Remark,
                   "DocLine": oDetails,
                   "InfoState": infoStatate
                 });
             }
           }

          
           this.oModel.refresh();
         });
         this.closeLoadingFragment();
       
        },

  });
});
