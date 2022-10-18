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
    var DocNum;
    return Controller.extend("com.apptech.DLSL.controller.Approval.ApprovalInquiry", {
      onInit: function(){
        this.oModel = new JSONModel("model/approvalinquiry.json");
        this.getView().setModel(this.oModel, "oModel");
        this.iSelectedRow = 0;
        this.DocEntry = -1;
        localStorage.setItem("Transaction","");
        this.Status="";

        this.UserCode = jQuery.sap.storage.Storage.get("userCode");

        this.oModel.getData().ApprovalInquiryRecords = [];
        var that = this;
        var oView = this.getView();
          oView.addEventDelegate({
              onAfterHide: function(evt) {
                  //This event is fired every time when the NavContainer has made this child control invisible.
              },
              onAfterShow: function(evt) {
                  // This event is fired every time when the NavContainer has made this child control visible.
                  // if(localStorage.getItem("UserType") !== "Administrator"){
                  //   oView.getController().LoadForApproval();
                  // }else{  
                  //   oView.getController().onLoadForAdmin();
                  // }
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
       
      },

      onViewInventoryRequest: function(){
        var ApprovalInquiryRecord = {
          "DocNum": DocNum
        };
        var oModelDocNum = new JSONModel(ApprovalInquiryRecord);
        this.getOwnerComponent().setModel(oModelDocNum, "oModelDocNum");
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("InventoryRequestInquiry");
        
      },

      onViewPurchaseRequest: function(){
        var ApprovalInquiryRecord={
          "DocNum":DocNum
        };
        var oModelDocNum=new JSONModel(ApprovalInquiryRecord);
        this.getOwnerComponent().setModel(oModelDocNum,"oModelDocNum");
        var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("PurchaseRequestInquiry");
      },

      onViewPaymentRequest: function(){
        var ApprovalInquiryRecord = {
          "DocNum": DocNum
        };
        var oModelDocNum = new JSONModel(ApprovalInquiryRecord);
        this.getOwnerComponent().setModel(oModelDocNum, "oModelDocNum");
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("PaymentRequestInquiry");
      },

      onPressLink: function(oEvent){
        var myInputControl = oEvent.getSource(); // e.g. the first item
        var boundData = myInputControl.getBindingContext('oModel').getObject();
        // var listpath = myInputControl.getBindingContext('oModel').getPath();
        DocNum = boundData.No;
        console.log(DocNum)
        localStorage.setItem("PreviousPath","Inquiry");
        if(boundData.DocumentType == "Purchase Request"){
          this.onViewPurchaseRequest();
        }else if(boundData.DocumentType == "Payment Request"){
          this.onViewPaymentRequest();
        }else if(boundData.DocumentType == "Inventory Request"){
          this.onViewInventoryRequest();
        }

       },

      OnSearch: function (oEvent) {
        var sQuery = oEvent.getParameter("query");
        this.Filter = null;
  
        if (sQuery) {
          this.Filter = new Filter([
            new Filter("No", FilterOperator.EQ, sQuery),
            new Filter("Status", FilterOperator.EQ, this.oModel.getData().FilterCB),
            new Filter("DocumentType", FilterOperator.EQ, sQuery),
            new Filter("DocumentNumber", FilterOperator.EQ, sQuery),
            new Filter("DocumentDate", FilterOperator.EQ, sQuery),
            new Filter("DueDate", FilterOperator.EQ, sQuery),
            new Filter("Originator", FilterOperator.EQ, sQuery),
          ], false);
        }
        else
        {
          this.Filter = new Filter("Status",FilterOperator.EQ,this.oModel.getData().FilterCB) 
        }
  
        this._Filter();
      },
      _Filter: function () {
        var oFilter = null;
  
        if (this.Filter) {
          oFilter = this.Filter;
        }
  
        this.byId("approvalinquiry").getBinding("rows").filter(oFilter, "Application");
      },
      OnDateRange: function (oEvent) {

        this.FilterDT = null;
  
        if (this.oModel.getData().DateFrom!="" && this.oModel.getData().DateTo!="" ) {
          this.FilterDT = new Filter("DocumentDate", FilterOperator.BT, APPui5.getDatePostingFormat(this.oModel.getData().DateFrom),APPui5.getDatePostingFormat(this.oModel.getData().DateTo));
        }
  
        this._FilterDT();
      },
      _FilterDT: function () {
        var oFilter = null;
  
        if (this.FilterDT) {
          oFilter = this.FilterDT;
        }
  
        this.byId("approvalinquiry").getBinding("rows").filter(oFilter, "Application");
      },
      cleardate:function(){
        this.oModel.getData().DateFrom="";
        this.oModel.getData().DateTo="";
        this.oModel.refresh();
        this.OnDateRange();

      },

      _filterH : function() {
        var oFilter = null;
  
        if (this._oGlobalFilter && this._oPriceFilter) {
          oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
        } else if (this._oGlobalFilter) {
          oFilter = this._oGlobalFilter;
        } else if (this._oPriceFilter) {
          oFilter = this._oPriceFilter;
        }
  
        this.byId("approvalinquiry").getBinding().filter(oFilter, "Application");
      },
  
      filterInquiry : function(oEvent) {
        var sQuery = oEvent.getParameter("query");
        this._oGlobalFilter = null;
  
        if (sQuery) {
          this._oGlobalFilter = new Filter([
            new Filter("Remarks", FilterOperator.Contains, sQuery),
            new Filter("OriginatorName", FilterOperator.Contains, sQuery),
            new Filter("DueDate", FilterOperator.Contains, sQuery),
            new Filter("DocumentDate", FilterOperator.Contains, sQuery),
            new Filter("DocumentNumber", FilterOperator.Contains, sQuery),
            new Filter("DocumentType", FilterOperator.Contains, sQuery),
            new Filter("DocumentStatus", FilterOperator.Contains, sQuery),
            new Filter("AuthorizerName", FilterOperator.Contains, sQuery),
            new Filter("Level", FilterOperator.Contains, sQuery),
            new Filter("Template", FilterOperator.Contains, sQuery),
            new Filter("Notes", FilterOperator.Contains, sQuery)
          ], false);
        }
  
        this._filterH();
      },
      onSelectionChange: function(oEvent) {
        var oYourTable = this.getView().byId("approvalinquiry"),
            iSelectedIndex = oEvent.getSource().getSelectedIndex();
    
        oYourTable.setSelectedIndex(iSelectedIndex);
      },
      
      onFilterNow: function(Status,Type,DateFrom,DateTo){
        this.oModel.getData().ApprovalInquiryRecords = [];
        this.openLoadingFragment();
        if(this.getView().byId("doctype").getSelectedKey() == "Payment Request"){
          this.getView().byId("ColPayee").setVisible(true);
        }else{
          this.getView().byId("ColPayee").setVisible(false);
        }

        var oUrl = "http://13.229.195.111:4300/getInquiryRecord?database=" + jQuery.sap.storage.Storage.get("dataBase") +"&value1=" + Status + "&value2=" + Type + "&value3=" + DateFrom + "&value4=" + DateTo;
         $.ajax({
          url: oUrl,
          type: "GET",
          async: false,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
          },
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            APPui5.APPMESSAGEBOX(Message);
            this.closeLoadingFragment();
          },
          success: function (json) {
            this.oModel.getData().ApprovalInquiryRecords = json[0];
            this.oModel.refresh();
            this.closeLoadingFragment();
          },
          context: this
        });
        this.closeLoadingFragment();
      },
      onFilterUserNow: function(Status,Type,User,DateFrom,DateTo){
        this.oModel.getData().ApprovalInquiryRecords = [];
        this.openLoadingFragment();
        if(this.getView().byId("doctype").getSelectedKey() == "Payment Request"){
          this.getView().byId("ColPayee").setVisible(true);
        }else{
          this.getView().byId("ColPayee").setVisible(false);
        }

        var oUrl = "http://13.229.195.111:4300/getUserInquiryRecord?database=" + jQuery.sap.storage.Storage.get("dataBase") +"&value1=" + Status + "&value2=" + Type + "&value3=" + User + "&value4=" + DateFrom + "&value5=" + DateTo;
         $.ajax({
          url: oUrl,
          type: "GET",
          async: false,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
          },
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            APPui5.APPMESSAGEBOX(Message);
            this.closeLoadingFragment();
          },
          success: function (json) {
            this.oModel.getData().ApprovalInquiryRecords = json[0];
            this.oModel.refresh();
            this.closeLoadingFragment();
          },
          context: this
        });
        this.closeLoadingFragment();
      },
      GetStatus:function(DocType,DocNum){
        $.ajax({
          url: "http://13.229.195.111:4300/app-xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETSTATUS&VALUE1="+ DocType +"&VALUE2="+ DocNum +"",
          type: "GET",
          async: false,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
          },
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            APPui5.APPMESSAGEBOX(Message);
          },
          success: function (json) {
          },
          context: this
        }).done(function (results) {
            if (results.length>0){
              this.Status=results[0].ApprovalStatus;
            }
            else
            {
              this.Status="";
            }
        });
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
      ViewRecord:function(oEvent){
            var myInputControl = oEvent.getSource(); // e.g. the first item
            var boundData = myInputControl.getBindingContext('oModel').getObject();
            localStorage.setItem("Transaction","FAQ");
            localStorage.setItem("ApprovalType", this.getView().byId("doctype").getSelectedKey());
            localStorage.setItem("ApprovalStatus", this.getView().byId("filters").getSelectedKey());
          
            try{
                if (boundData.DocumentType=="Purchase Request"){
                var ApprovalInquiry={
                    "DocNum":boundData.DocumentNumber
                  };
          
                  var oModelDocNum=new JSONModel(ApprovalInquiry);
                  this.getOwnerComponent().setModel(oModelDocNum,"oModelDocNum");
                  var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
                  oRouter.navTo("PurchaseRequestView");
                }
                else if (boundData.DocumentType=="Payment Request"){
                    var ApprovalInquiry={
                      "DocNum":boundData.DocumentNumber
                    };
                    var oModelDocNum=new JSONModel(ApprovalInquiry);
                    this.getOwnerComponent().setModel(oModelDocNum,"oModelDocNum");
                    var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("PaymentRequestView");
                }
                else if (boundData.DocumentType=="Inventory Request"){
                  var ApprovalInquiry={
                    "DocNum":boundData.DocumentNumber
                  };
                  var oModelDocNum=new JSONModel(ApprovalInquiry);
                  this.getOwnerComponent().setModel(oModelDocNum,"oModelDocNum");
                  var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
                  oRouter.navTo("InventoryRequestView");
              }
            }catch (e){
              console.log(e);
            }
      },
      onFilter: function(){
        localStorage.setItem("ApprovalType", this.getView().byId("doctype").getSelectedKey());
        localStorage.setItem("ApprovalStatus", this.getView().byId("filters").getSelectedKey());

        var DocType = this.getView().byId("doctype").getSelectedKey();
        var StatusType = this.getView().byId("filters").getSelectedKey();
        
        var fromDate = this.getView().byId("datefrom").getValue();
        var toDate = this.getView().byId("dateto").getValue();

        if(DocType === ""){
          APPui5.APPMESSAGEBOX("Please Select Document Type");
          return;
        }
        if(StatusType === ""){
          APPui5.APPMESSAGEBOX("Please Select Document Status");
          return;
        }
        
        if(fromDate === ""){
          APPui5.APPMESSAGEBOX("Please Select Date From");
          return;
        }
        
        if(toDate === ""){
          APPui5.APPMESSAGEBOX("Please Select Date To");
          return;
        }


        // APPui5.updateDateFunc(
          
        // console.log(fromDate)
        // console.log(toDate)
        
        // console.log()

        // console.log(APPui5.TDate(fromDate,toDate))



        if(localStorage.getItem("UserType") !== "Administrator"){
          this.onFilterUserNow(StatusType, DocType, this.UserCode, fromDate,toDate);
        }else{
          this.onFilterNow(StatusType,DocType ,fromDate,toDate);
        }
      },
    });
  });
  