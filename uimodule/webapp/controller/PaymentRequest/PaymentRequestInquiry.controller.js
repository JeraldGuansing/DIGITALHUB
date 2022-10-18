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
  
    return Controller.extend("com.apptech.DLSL.controller.PaymentRequest.PaymentRequestInquiry", {
  
      onBeforeRendering: function () {
        this.LoadForApproval();   
       
      },
      onInit: function () {
        this.oModel = new JSONModel("model/paymentrequest.json");
        this.getView().setModel(this.oModel, "oModel");
        this.router = this.getOwnerComponent().getRouter();
        this.DocNum = -1;
        var Router=sap.ui.core.UIComponent.getRouterFor(this);
        Router.getRoute("PaymentRequestInquiry").attachMatched(this._onRouterMatched,this);
        // this.CreateReqTables();    
      },
      LoadForApproval: function () {
        this.oModel.getData().PaymentRequestInquiryRecords = [];
        this.oModel.refresh();
        $.ajax({
          url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_CHECKAPPROVAL&VALUE1=" + this.DocNum + "&VALUE2=Payment Request",
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
          for (var i = 0; i < results.length; i++) {
            this.oModel.getData().PaymentRequestInquiryRecords.push({
              "No": results[i].DocEntry,
              "Status": results[i].U_APP_Status,
              "Authorizer": results[i].U_APP_Authorizer,
              "DocumentType": results[i].U_APP_DocType,
              "DocumentNumber": results[i].U_APP_DocNum,
              "DocumentDate": APPui5.getDatePostingFormat(results[i].U_APP_DocDate),
              "DueDate": APPui5.getDatePostingFormat(results[i].U_APP_DueDate),
              "Originator": results[i].U_APP_Originator,
              "Remarks": results[i].U_APP_Remarks,
              "Notes": results[i].U_APP_Notes
            });
          }
          this.oModel.refresh();
        }); 
      },
      _onRouterMatched:function(oEvent){
        var oModelDocNum=this.getView().getModel("oModelDocNum");
        this.DocNum=oModelDocNum.getData().DocNum;           
        this.LoadForApproval();
       },
       OnCancelScreen:function(){
        this.router = this.getOwnerComponent().getRouter();
		this.router.navTo("PaymentRequest");
       }
  
  
  
    });
  });
  