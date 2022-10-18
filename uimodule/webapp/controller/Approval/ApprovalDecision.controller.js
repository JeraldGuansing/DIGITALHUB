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
  "sap/m/MessageBox",
], function (jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast, APPui5, Filter, FilterOperator,MessageBox) {
  "use strict";
  var oIsEmail = "true"; 
  var templateName;
  var oSubject = "";
  var oUomEntry = "";
  var dcsDepartment;
  var dscDepository;
  var dWTCode = "";
  var busyDialog = new sap.m.BusyDialog();
  return Controller.extend("com.apptech.DLSL.controller.Approval.ApprovalDecision", {
    onBeforeRendering:async function () {
      // await this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));   
    },
    onInit: function () {
      this.oModel = new JSONModel("model/approvaldecision.json");
      this.getView().setModel(this.oModel, "oModel");
      this.router = this.getOwnerComponent().getRouter();
      this.iSelectedRow = 0;
      this.DocEntry = -1;
      localStorage.setItem("Transaction","");
      // this.CreateReqTables();    
    },
    OnSearch: function (oEvent) {
      var sQuery = oEvent.getParameter("query");
      this.Filter = null;

      if (sQuery) {
        this.Filter = new Filter([
          new Filter("No", FilterOperator.EQ, sQuery),
          new Filter("Status", FilterOperator.EQ, this.oModel.getData().FilterCB),
          new Filter("Stages",FilterOperator.EQ,sQuery),
          new Filter("Level",FilterOperator.EQ,sQuery),
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

      this.byId("approvaldecision").getBinding("rows").filter(oFilter, "Application");
    },
    onFilter: function () {
      this.oModel.getData().ApprovalDecisionRecords = [];

      if(this.getView().byId("doctype").getSelectedKey() == "Payment Request"){
        this.getView().byId("ColPayee").setVisible(true);
      }else{
        this.getView().byId("ColPayee").setVisible(false);
      }

      if(this.getView().byId("doctype").getSelectedKey() === "Purchase Request"){
        this.getView().byId("colRec").setVisible(true);
      }else{
        this.getView().byId("colRec").setVisible(false);
      }

      
      if(this.getView().byId("filters").getSelectedKey() === "Approved"){
        this.getView().byId("ColApprovedDate").setVisible(true);
      }else{
        this.getView().byId("ColApprovedDate").setVisible(false);
      }


      var urlStr ="https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETFORAPPROVALINQUIRY3&VALUE1=&VALUE2="+ this.getView().byId("filters").getSelectedKey() +"&VALUE3="+ this.getView().byId("doctype").getSelectedKey() +""; 
      $.ajax({
        url: urlStr,
        type: "GET",
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
        },
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          APPui5.APPMESSAGEBOX(Message);
          APPui5.closeLoadingFragment();
          console.log(Message)
        },
        success: function (json) {
        },
        context: this
      }).done(function (results) {
        for (var i = 0; i < results.length; i++) {
          if(localStorage.getItem("UserCode") === "manager"){
              this.oModel.getData().ApprovalDecisionRecords.push({
                "No": results[i].DocEntry,
                "Status": results[i].U_APP_Status,
                "Stages":results[i].U_APP_Stage,
                "PayeeName": results[i].PayeeName,
                "Level":results[i].U_APP_Level,
                "Template":results[i].U_APP_Template,
                "Department": results[i].U_APP_Department,
                "Depository": results[i].U_APP_Depository,
                "Division": results[i].Division,
                "TotalAmount": APPui5.toCommas(results[i].TotalAmount),
                "Authorizer": results[i].U_APP_Authorizer,
                "AuthorizerName": results[i].AuthName,
                "OriginatorName": results[i].OrigName,
                "DocumentType": results[i].U_APP_DocType,
                "DocumentNumber": results[i].U_APP_DocNum,
                "DocumentDate": APPui5.getDatePostingFormat(results[i].U_APP_DocDate),
                "DueDate": APPui5.getDatePostingFormat(results[i].U_APP_DueDate),
                "Originator": results[i].U_APP_Originator,
                "Remarks": results[i].U_APP_Remarks,
                "Notes": results[i].U_APP_Notes,
                "Recommendation": results[i].U_APP_Recommendation
              });
          }else{
            if(results[i].U_APP_Originator == localStorage.getItem("UserCode") || results[i].U_APP_Authorizer == localStorage.getItem("UserCode")){
              this.oModel.getData().ApprovalDecisionRecords.push({
                "No": results[i].DocEntry,
                "Status": results[i].U_APP_Status,
                "Stages":results[i].U_APP_Stage,
                "PayeeName": results[i].PayeeName,
                "Level":results[i].U_APP_Level,
                "Template":results[i].U_APP_Template,
                "Department": results[i].U_APP_Department,
                "Depository": results[i].U_APP_Depository,
                "Division": results[i].Division,
                "TotalAmount": APPui5.toCommas(results[i].TotalAmount),
                "Authorizer": results[i].U_APP_Authorizer,
                "AuthorizerName": results[i].AuthName,
                "OriginatorName": results[i].OrigName,
                "DocumentType": results[i].U_APP_DocType,
                "DocumentNumber": results[i].U_APP_DocNum,
                "DocumentDate": APPui5.getDatePostingFormat(results[i].U_APP_DocDate),
                "DueDate": APPui5.getDatePostingFormat(results[i].U_APP_DueDate),
                "Originator": results[i].U_APP_Originator,
                "Remarks": results[i].U_APP_Remarks,
                "Notes": results[i].U_APP_Notes,
                "Recommendation": results[i].U_APP_Recommendation
              });
            }
          }
         }
        this.oModel.refresh();
      });
    },

    onSelectionChange: function(oEvent) {
      var oYourTable = this.getView().byId("approvaldecision"),
          iSelectedIndex = oEvent.getSource().getSelectedIndex();
  
      oYourTable.setSelectedIndex(iSelectedIndex);
    },
   
    CreateReqTables: function () {
      APPui5.createTable("APP_APRDEC", "Approval Decision", "bott_Document");
      APPui5.createField("APP_Status", "Status", "@APP_APRDEC", "db_Alpha", "", 100);
      APPui5.createField("APP_Level","Level","@APP_APRDEC","db_Alpha","",100);
      APPui5.createField("APP_Stage","Stage","@APP_APRDEC","db_Alpha","",100);
      APPui5.createField("APP_Template","Approval Template","@APP_APRDEC","db_Alpha","",100);
      APPui5.createField("APP_Authorizer", "Authorizer", "@APP_APRDEC", "db_Alpha", 100);
      APPui5.createField("APP_DocType", "Document Type", "@APP_APRDEC", "db_Alpha", "", 100);
      APPui5.createField("APP_DocNum", "Document Number", "@APP_APRDEC", "db_Alpha", "", 100);
      APPui5.createField("APP_DocDate", "Document Date", "@APP_APRDEC", "db_Date", "");
      APPui5.createField("APP_DueDate", "Due Date", "@APP_APRDEC", "db_Date", "");
      APPui5.createField("APP_Originator", "Originator", "@APP_APRDEC", "db_Alpha", "", 100);
      APPui5.createField("APP_Remarks", "Remarks", "@APP_APRDEC", "db_Alpha", "", 200);
      APPui5.createField("APP_Notes", "Notes", "@APP_APRDEC", "", 200);
      APPui5.createField("APP_Recommendation", "Recommendation", "@APP_APRDEC", "", 100);
    },

    onGetTempname: function (tempName, DocType) {
      var that = this;
      templateName = "";
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETTEMPNAME&VALUE1=" + tempName + "&VALUE1=" + DocType,
        type: "GET",
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
        },
        error: function (xhr, status, error) {
          console.log("Error");
          APPui5.closeLoadingFragment();
        },
        success: function (json) {
        },
        context: this
      }).done(function (results) {
        templateName = results[0].U_APP_Template;
      });
    },      

    
    LoadForApproval: function (UserCode) {
      if(this.getView().byId("doctype").getSelectedKey() == "Payment Request"){
        this.getView().byId("ColPayee").setVisible(true);
      }else{
        this.getView().byId("ColPayee").setVisible(false);
      }

      if(this.getView().byId("doctype").getSelectedKey() == "Purchase Request"){
        this.getView().byId("colRec").setVisible(true);
      }else{
        this.getView().byId("colRec").setVisible(false);
      }


      this.oModel.getData().ApprovalDecisionRecords = [];
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETFORAPPROVALINQUIRY3&VALUE1=&VALUE2="+ this.getView().byId("filters").getSelectedKey() +"&VALUE3="+ this.getView().byId("doctype").getSelectedKey() +"",
        type: "GET",
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
        },
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          APPui5.APPMESSAGEBOX(Message);
          APPui5.closeLoadingFragment();
          console.log(Message)
        },
        success: function (json) {
        },
        context: this
      }).done(function (results) {
        for (var i = 0; i < results.length; i++) {
        if(localStorage.getItem("UserCode") === "manager"){
          this.oModel.getData().ApprovalDecisionRecords.push({
            "No": results[i].DocEntry,
            "Status": results[i].U_APP_Status,
            "Stages":results[i].U_APP_Stage,
            "PayeeName": results[i].PayeeName,
            "TotalAmount": APPui5.toCommas(results[i].TotalAmount),
            "Department": results[i].U_APP_Department,
            "Depository": results[i].U_APP_Depository,
            "OriginatorName": results[i].OrigName,
            "AuthorizerName": results[i].AuthName,
            "Level":results[i].U_APP_Level,
            "Template": results[i].U_APP_Template,
            "Authorizer": results[i].U_APP_Authorizer,
            "DocumentType": results[i].U_APP_DocType,
            "DocumentNumber": results[i].U_APP_DocNum,
            "DocumentDate": APPui5.getDatePostingFormat(results[i].U_APP_DocDate),
            "DueDate": APPui5.getDatePostingFormat(results[i].U_APP_DueDate),
            "Originator": results[i].U_APP_Originator,
            "Remarks": results[i].U_APP_Remarks,
            "Notes": results[i].U_APP_Notes,
            "Recommendation": results[i].U_APP_Recommendation
          });
        }else{
          if(results[i].U_APP_Originator == localStorage.getItem("UserCode") || results[i].U_APP_Authorizer== localStorage.getItem("UserCode")){ 
            this.oModel.getData().ApprovalDecisionRecords.push({
              "No": results[i].DocEntry,
              "Status": results[i].U_APP_Status,
              "Stages":results[i].U_APP_Stage,
              "PayeeName": results[i].PayeeName,
              "TotalAmount": APPui5.toCommas(results[i].TotalAmount),
              "Department": results[i].U_APP_Department,
              "Depository": results[i].U_APP_Depository,
              "OriginatorName": results[i].OrigName,
              "AuthorizerName": results[i].AuthName,
              "Level":results[i].U_APP_Level,
              "Template": results[i].U_APP_Template,
              "Authorizer": results[i].U_APP_Authorizer,
              "DocumentType": results[i].U_APP_DocType,
              "DocumentNumber": results[i].U_APP_DocNum,
              "DocumentDate": APPui5.getDatePostingFormat(results[i].U_APP_DocDate),
              "DueDate": APPui5.getDatePostingFormat(results[i].U_APP_DueDate),
              "Originator": results[i].U_APP_Originator,
              "Remarks": results[i].U_APP_Remarks,
              "Notes": results[i].U_APP_Notes,
              "Recommendation": results[i].U_APP_Recommendation
            });
          }
        }
        }
        this.oModel.refresh();
      });
    },


    onApprove: function(oEvent){
      var that = this;
      MessageBox.information("Are you sure you want to approve this transaction?",{
				actions: [MessageBox.Action.YES,MessageBox.Action.NO],
				title: "Approval Decision",
				icon: MessageBox.Icon.QUESTION,
				styleClass:"sapUiSizeCompact",
				onClose: function (sButton) {
				  if(sButton === "NO"){
            console.log("No");
            return;
          }else{
            console.log("Yes");
            that.onApproveTransaction();
          }
        }
      })
    },

    onApproveTransaction: function () {
      this.iSelectedRow = this.getView().byId("approvaldecision").getSelectedIndex();
      this.oTable = this.getView().byId("approvaldecision");
      var iIndex = this.oTable.getSelectedIndex();
      var oRowSelected = this.oTable.getBinding().getModel().getData().ApprovalDecisionRecords[this.oTable.getBinding().aIndices[iIndex]];
    
      if(oRowSelected.Status == "Approved"){
        APPui5.APPMESSAGEBOX("This Document is already Approved.");
        APPui5.closeLoadingFragment();
        return;
      }

      var oPayee;
      var oTotal = "0";
      var oNotes = "";
      var oRemarks = "";
      var oDept = "";

          if(oRowSelected.Department !== ""){
            oDept = oRowSelected.Department;
          }else{
            oDept = oRowSelected.Depository;   
          }

          if(oRowSelected.DocumentType === "Purchase Request"){
            oSubject = "[PROCUREMENT REQUEST]";
            oPayee = oRowSelected.OriginatorName;
            oTotal = "";
          }else if(oRowSelected.DocumentType === "Payment Request"){
            oSubject = "[PAYMENT REQUEST]";
            oPayee = oRowSelected.PayeeName;
            oTotal =  oRowSelected.TotalAmount;
          }else if(oRowSelected.DocumentType === "Inventory Request"){
            oSubject = "[INVENTORY REQUEST]";
            oPayee = oRowSelected.OriginatorName;
            oTotal = "";
          }

          if(oRowSelected.Notes === null){
            oNotes = "";
          }else{
            oNotes = oRowSelected.Notes;
          }

          if(oRowSelected.Remarks === null){
            oRemarks = "";
          }else{
            oRemarks = oRowSelected.Remarks;
          }

       
          if(oRowSelected.Remarks.length > 254){
            APPui5.APPMESSAGEBOX("Remarks is too long, please make sure\nRemarks is below 254 characters");
            APPui5.closeLoadingFragment();
            return;
          }

          if(oNotes > 254){
            APPui5.APPMESSAGEBOX("Notes is too long, please make sure\nRemarks is below 254 characters");
            APPui5.closeLoadingFragment();
            return;
          }


          var str = oRowSelected.Remarks;
          var stremark = str.substring(0, 253);
          var stremarks = "";
          stremarks = stremark.replace(/[^a-zA-Z ]/g, "");
         
          var ApprovalPostingBody = {};
          ApprovalPostingBody.U_APP_Status = "Approved";
          ApprovalPostingBody.U_APP_Status2 = "Approved";
          ApprovalPostingBody.U_APP_Stage= oRowSelected.Stages;
          ApprovalPostingBody.U_APP_Level=oRowSelected.Level;
          ApprovalPostingBody.U_APP_Template=oRowSelected.Template;
          ApprovalPostingBody.U_APP_Authorizer = oRowSelected.Authorizer;
          ApprovalPostingBody.U_APP_DocType = oRowSelected.DocumentType;
          ApprovalPostingBody.U_APP_DocNum = oRowSelected.DocumentNumber;
          ApprovalPostingBody.U_APP_Originator = oRowSelected.Originator;
          ApprovalPostingBody.U_APP_Remarks = stremarks;
          ApprovalPostingBody.U_APP_DocDate = APPui5.getDateFormat(oRowSelected.DocumentDate);
          ApprovalPostingBody.U_APP_DueDate = APPui5.getDateFormat(oRowSelected.DueDate);
          ApprovalPostingBody.U_APP_Notes = oRowSelected.Notes;
          ApprovalPostingBody.U_APP_Recommendation = oRowSelected.Recommendation;
          ApprovalPostingBody.U_APP_Department =  oRowSelected.Department;
          ApprovalPostingBody.U_APP_Depository =  oRowSelected.Depository;
          ApprovalPostingBody.U_APP_ApprovedDate =  APPui5.updateDateFunc(new Date());
        
      $.ajax({
        url: "https://13.215.36.201:50000/b1s/v1/APP_APRDEC(" + oRowSelected.No + ")",
        data: JSON.stringify(ApprovalPostingBody),
        type: "PATCH",
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          APPui5.APPMESSAGEBOX(Message);
          APPui5.closeLoadingFragment();
          console.log(Message)
          busyDialog.close();
        },
        context: this,
        success: function (json) {
          APPui5.APPMESSAGEBOX("Transaction succefully approved!");
          var oLevel = parseInt(oRowSelected.Level) + 1;
          this.PostToSAP(oRowSelected.DocumentType, oRowSelected.DocumentNumber,oLevel,oRowSelected);
          busyDialog.close();
        jQuery.sap.delayedCall(20000, this, function() {
            this.oModel.getData().ApprovalDecisionNotif = [];
            this.ongetNextApprover(ApprovalPostingBody.U_APP_Template,oLevel);
            if(oIsEmail !== "false"){
              var oEmail = [];
              oEmail.push({
                "receiver": localStorage.getItem("ApproverEmail"),
                "DocumentNo": ApprovalPostingBody.U_APP_DocNum,
                "Department": oDept,
                "Payee": oPayee,
                "Amount": oTotal,
                "Subject": oSubject,
                "Date": APPui5.getDatePostingFormat(new Date()),
                "Remarks": oRemarks,
                "Notes": oNotes,
                "Approver": localStorage.getItem("ApproverName"),
                "Originator":  oRowSelected.OriginatorName,
                "Level": "Level " + oLevel,
                "URL": "RequestorToApprover"
              });
              this.onSendEmail(oEmail);
            }
            var oEmailreq = [];
            this.onGetReqEmail(ApprovalPostingBody.U_APP_Originator);
            oEmailreq.push({
              "receiver": localStorage.getItem("RequestorEmail"),
              "DocumentNo": ApprovalPostingBody.U_APP_DocNum,
              "Department": oDept,
              "Payee": oPayee,
              "Amount": oTotal,
              "Subject": oSubject,
              "Date": APPui5.getDatePostingFormat(new Date()),
              "Remarks": oRemarks,
              "Notes": oNotes,
              "Approver": localStorage.getItem("loginName"),
              "Originator":  oRowSelected.OriginatorName,
              "Level": "Level " + oLevel,
              "URL": "ApproverToRequestor"
            });
            this.onSendEmail2(oEmailreq);
        });
        }
      }).done(function (results) {
      });
   
    },

    onComposeMsg: function(){
      var msg = "";
      var oEmails = this.oModel.getData().ApprovalDecisionNotif;
      for(let e = 0;e < oEmails.length;e++){
          msg = msg + "Email Sent to: " + oEmails[e].Email + " - " +  oEmails[e].Level + "\n"; 
      }
      APPui5.APPMESSAGEBOX(msg);
    },

    onSendEmail: function(Content){
      var that = this;
      var settings = {
        "url": "https://13.215.36.201:4300/" + Content[0].URL,
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(Content),
      };
      
      $.ajax(settings).done(function (response) {
        for(let e = 0;e < Content.length; e++){
          that.oModel.getData().ApprovalDecisionNotif.push({
            "Email": Content[e].receiver,
            "Level": Content[e].Level + " Approver"
          });
        }

        // that.onComposeMsg();
      });
    },

    onSendEmail2: function(Content){
      var that = this;
      var settings = {
        "url": "https://13.215.36.201:4300/" + Content[0].URL,
        "method": "POST",
        "timeout": 0,
        "headers": {
          "Content-Type": "application/json"
        },
        "data": JSON.stringify(Content),
      };
      
      $.ajax(settings).done(function (response) {
        for(let e = 0;e < Content.length; e++){
          that.oModel.getData().ApprovalDecisionNotif.push({
            "Email": Content[e].receiver,
            "Level": "Maker"
          });
        }

        that.onComposeMsg();
        // console.log(that.oModel.getData().ApprovalDecisionNotif)
      });
    },

    onGetEmail: function (Approver) {
      var that = this;
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETUSERINFO&VALUE1=" + Approver,
        type: "GET",
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
        },
        error: function (xhr, status, error) {
          console.log("Error");
          APPui5.closeLoadingFragment();
        },
        success: function (json) {
        },
        context: this
      }).done(function (results) {
          localStorage.setItem("ApproverEmail",results[0].E_Mail);
          localStorage.setItem("ApproverName",results[0].U_NAME);             
      });
    },      

    onGetReqEmail: function (Requester) {
      var that = this;
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETUSERINFO&VALUE1=" + Requester,
        type: "GET",
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
        },
        error: function (xhr, status, error) {
          console.log("Error");
          APPui5.closeLoadingFragment();
        },
        success: function (json) {
        },
        context: this
      }).done(function (results) {
          localStorage.setItem("RequestorEmail",results[0].E_Mail);
          localStorage.setItem("RequestorName",results[0].U_NAME);             
      });
    },      

    ongetNextApprover: function (oTemp,oLevel) {
      var that = this;
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETNEXTAPPROVAL&VALUE1=" + oTemp + "&VALUE2=" + oLevel ,
        type: "GET",
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
        },
        error: function (xhr, status, error) {
          console.log("Error");
          APPui5.closeLoadingFragment();
        },
        success: function (json) {
        },
        context: this
      }).done(function (results) {
        console.log(results)
        if(results.length !== 0){
          that.onGetEmail(results[0].U_APP_Stages);
          oIsEmail = "true";
        }else{
          oIsEmail = "false";
          localStorage.setItem("ApproverEmail", "");
          localStorage.setItem("ApproverName", "");
        }
      });
    },      
    onPending:function(){
      APPui5.openLoadingFragment();
      this.iSelectedRow = this.getView().byId("approvaldecision").getSelectedIndex();
      var ApprovalPostingBody = {};
      ApprovalPostingBody.U_APP_Status = "Pending";
      ApprovalPostingBody.U_APP_Status2 = "Pending";
      ApprovalPostingBody.U_APP_Stage=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Stages;
      ApprovalPostingBody.U_APP_Level=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Level;
      ApprovalPostingBody.U_APP_Authorizer = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Authorizer;
      ApprovalPostingBody.U_APP_DocType = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentType;
      ApprovalPostingBody.U_APP_DocNum = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentNumber;
      ApprovalPostingBody.U_APP_Originator = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Originator;
      ApprovalPostingBody.U_APP_Remarks = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Remarks;
      ApprovalPostingBody.U_APP_DocDate = APPui5.getDateFormat(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentDate);
      ApprovalPostingBody.U_APP_DueDate = APPui5.getDateFormat(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DueDate);
      ApprovalPostingBody.U_APP_Notes = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Notes;
      ApprovalPostingBody.U_APP_Template=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Template;


      $.ajax({
        url: "https://13.215.36.201:50000/b1s/v1/APP_APRDEC(" + this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].No + ")",
        data: JSON.stringify(ApprovalPostingBody),
        type: "PATCH",
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          APPui5.APPMESSAGEBOX(Message);
          APPui5.closeLoadingFragment();
          console.log(Message)
        },
        context: this,
        success:async function (json) {
          APPui5.closeLoadingFragment();
          await this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));
      }
      }).done(function (results) {
      });
      APPui5.closeLoadingFragment();
    },
    onReject: function () {
      APPui5.openLoadingFragment();
      this.iSelectedRow = this.getView().byId("approvaldecision").getSelectedIndex();

      if(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Status == "Rejected"){
        APPui5.APPMESSAGEBOX("This Document is already rejected.");
        APPui5.closeLoadingFragment();
        return;
      }

      var payee = "";
      var totalA = ""
      var oNotes = "";
      var oRemarks = "";
      var oDept = "";

      if(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Department !== ""){
        oDept = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Department;
      }else{
        if(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Depository !== ""){
          oDept = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Depository;
        }else{
          oDept = "";
        }
      }

      if(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentType === "Purchase Request"){
        oSubject = "[PROCUREMENT REQUEST]";
        payee = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].OriginatorName;
        totalA = "";
      }else if(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentType === "Payment Request"){
        oSubject = "[PAYMENT REQUEST]";
        payee = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].PayeeName;
        totalA = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].TotalAmount;
      }else if(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentType === "Inventory Request"){
        payee = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].OriginatorName;
        oSubject = "[INVENTORY REQUEST]";
        totalA = "";
      }

      if(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Notes === null){
        oNotes = "";
      }else{
        oNotes = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Notes;
      }

      if(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Remarks === null){
        oRemarks = "";
      }else{
        oRemarks = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Remarks;
      }


      var ApprovalPostingBody = {};
      ApprovalPostingBody.U_APP_Status = "Rejected";
      ApprovalPostingBody.U_APP_Status2 = "Rejected";
      ApprovalPostingBody.U_APP_Stage=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Stages;
      ApprovalPostingBody.U_APP_Level=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Level;
      ApprovalPostingBody.U_APP_Authorizer = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Authorizer;
      ApprovalPostingBody.U_APP_DocType = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentType;
      ApprovalPostingBody.U_APP_DocNum = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentNumber;
      ApprovalPostingBody.U_APP_Originator = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Originator;
      ApprovalPostingBody.U_APP_Remarks = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Remarks;
      ApprovalPostingBody.U_APP_DocDate = APPui5.getDateFormat(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentDate);
      ApprovalPostingBody.U_APP_DueDate = APPui5.getDateFormat(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DueDate);
      ApprovalPostingBody.U_APP_Notes = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Notes;
      ApprovalPostingBody.U_APP_Template=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Template;
      $.ajax({
        url: "https://13.215.36.201:50000/b1s/v1/APP_APRDEC(" + this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].No + ")",
        data: JSON.stringify(ApprovalPostingBody),
        type: "PATCH",
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          APPui5.APPMESSAGEBOX(Message);
          APPui5.closeLoadingFragment();
          console.log(Message)
        },
        context: this,
        success: function (json) {
          var oLevel = parseInt(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Level);
          var OriginatorEmailName = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].OriginatorName;
          this.setReject(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentNumber,this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentType,this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Notes);
         

          this.oModel.getData().ApprovalDecisionNotif = [];
          jQuery.sap.delayedCall(10000, this, function() {
          for(let i=0;i < oLevel;i++){
            this.onRejectApproval(ApprovalPostingBody.U_APP_Template,oLevel);
            if(oIsEmail !== "false"){
              var oEmail = [];
              oEmail.push({
                "receiver": localStorage.getItem("ApproverEmail"),
                "DocumentNo": ApprovalPostingBody.U_APP_DocNum,
                "Department": oDept,
                "Amount": totalA,
                "Payee": payee,
                "Subject": oSubject,
                "Date": APPui5.getDateFormat(new Date()),
                "Remarks": oRemarks,
                "Notes": oNotes,
                "Approver":  localStorage.getItem("loginName"),
                "Originator":  OriginatorEmailName,
                "Level": "Level " + oLevel,
                "URL": "OriginatorEmailRejection"
              });
              this.oModel.getData().ApprovalDecisionNotif.push({
                "Email": localStorage.getItem("ApproverEmail"),
                "Level": "Level " + oLevel
              });
              this.onSendEmail(oEmail);
            }
            oLevel = parseInt(oLevel) - 1;
          }

          //email for requestor;
          var oEmailreq = [];
          this.onGetReqEmail(ApprovalPostingBody.U_APP_Originator);
          oEmailreq.push({
            "receiver": localStorage.getItem("RequestorEmail"),
            "DocumentNo": ApprovalPostingBody.U_APP_DocNum,
            "Department": oDept,
            "Amount": totalA,
            "Payee": payee,
            "Subject": oSubject,
            "Date": APPui5.getDateFormat(new Date()),
            "Remarks": oRemarks,
            "Notes": oNotes,
            "Approver": localStorage.getItem("ApproverName"),
            "Originator":  OriginatorEmailName,
            "Level": "Level " + oLevel,
            "URL": "OriginatorEmailRejection"
          });
          this.onSendEmail2(oEmailreq);
          this.oModel.getData().ApprovalDecisionNotif.push({
            "Email": localStorage.getItem("RequestorEmail"),
            "Level": "Maker"
          });
          APPui5.APPMESSAGEBOX("Transaction succefully rejected!");
          this.onComposeMsg();
          APPui5.closeLoadingFragment();
          });
        }
        
      }).done(function (results) {
      });

    },
    onRejectApproval: function(oTemp,oLevel){
      var that = this;
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETNEXTAPPROVAL&VALUE1=" + oTemp + "&VALUE2=" + oLevel ,
        type: "GET",
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
        },
        error: function (xhr, status, error) {
          APPui5.closeLoadingFragment();
          console.log("Error");
        },
        success: function (json) {
        },
        context: this
      }).done(function (results) {
     
        if(results.length !== 0){
          that.onGetEmail(results[0].U_APP_Stages);
          oIsEmail = "true";
        }else{
          oIsEmail = "false";
          localStorage.setItem("ApproverEmail", "");
          localStorage.setItem("ApproverName", "");
        }
      });
    },
    onGetUoMEntry: function (uom) {
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=spApp_getUoMEntry&Value1=" + uom,
        type: "GET",
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
        },
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          APPui5.APPMESSAGEBOX(Message);
          APPui5.closeLoadingFragment();
          console.log(Message)
        },
        success: function (json) {
        },
        context: this
      }).done(function (results) {
        if(results){
          oUomEntry = results[0].UomEntry;
        }
      });
    },
    PostToSAP: function (DocumentType, No,Level,rows) {
      if (DocumentType === "Purchase Request") {
        $.ajax({
          url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_CHECKAPPROVAL&VALUE1=" + No  + "&VALUE2=" + DocumentType +"",
          type: "GET",
          async: false,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
          },
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            APPui5.APPMESSAGEBOX(Message);
            APPui5.closeLoadingFragment();
            console.log(Message)
          },
          success: function (json) {
          },
          context: this
        }).done(function (results) {
          if (results.length===0){
            $.ajax({
              url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_APPROVALROUTE&VALUE1=" + DocumentType  + "&VALUE2=" + this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Originator + "&VALUE3="+ No +"&VALUE4="+ Level +"",
              type: "GET",
              async: false,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
              },
              error: function (xhr, status, error) {
                var Message = xhr.responseJSON["error"].message.value;
                APPui5.APPMESSAGEBOX(Message);
                APPui5.closeLoadingFragment();
                console.log(Message)
              },
              success: function (json) {
              },
              context: this
            }).done(function (results) {
            
              if (results.length === 0) {
                $.ajax({
                  url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_APPROVALROUTE&VALUE1=" + DocumentType  + "&VALUE2=" + this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Originator + "&VALUE3="+ No +"&VALUE4="+ Level +"",
                  type: "GET",
                  async: false,
                  beforeSend: function (xhr) {
                    xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
                  },
                  error: function (xhr, status, error) {
                    var Message = xhr.responseJSON["error"].message.value;
                    APPui5.APPMESSAGEBOX(Message);
                    APPui5.closeLoadingFragment();
                    console.log(Message)
                  },
                  success: function (json) {
                  },
                  context: this
                }).done(function (results) {
                  this.GetDocEntry(No, DocumentType);
                  $.ajax({
                    url: "https://13.215.36.201:50000/b1s/v1/APP_OPRQ(" + this.DocEntry + ")",
                    type: "GET",
                    crossDomain: true,
                    xhrFields: {
                      withCredentials: true
                    },
                    error: function (xhr, status, error) {
                      this.onPending();
                      var Message = xhr.responseJSON["error"].message.value;
                      APPui5.APPMESSAGEBOX(Message);
                      APPui5.closeLoadingFragment();
                      console.log(Message)
                      return
                    },
                    success: function (json) {
                    },
                    context: this
                  }).done(function (results) {
                    console.log(results)
                    var PurchaseRequest = {};
                    PurchaseRequest.U_APP_PRNo = results.DocNum;
                    PurchaseRequest.Requester = results.U_APP_Requester;
                    PurchaseRequest.U_APP_Position = results.U_APP_Position;
                    PurchaseRequest.RequesterDepartment = parseInt(results.U_APP_Department);
                    PurchaseRequest.DocDate = results.U_APP_RequestDate;
                    PurchaseRequest.RequriedDate = results.U_APP_RequiredDate;
                    PurchaseRequest.Comments = results.Remark;
                    PurchaseRequest.DocType = "dDocument_Items";
                    PurchaseRequest.U_APP_Recommendation = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Recommendation
                    if (results.U_APP_Attachment !==''){
                      PurchaseRequest.AttachmentEntry=results.U_APP_Attachment;
                    }
                    PurchaseRequest.DocumentLines = [];

                    for (var i = 0; i < results.APP_PRQ1Collection.length; i++) {

                      this.onGetUoMEntry(results.APP_PRQ1Collection[i].U_APP_Uom);
                      console.log(results.APP_PRQ1Collection)
                      PurchaseRequest.DocumentLines.push({
                        "ItemCode": results.APP_PRQ1Collection[i].U_APP_ItemCode,
                        "ItemDescription": results.APP_PRQ1Collection[i].U_APP_Description,
                        "U_APP_SpecialistCode": results.APP_PRQ1Collection[i].U_APP_SpecialistCode,
                        "U_APP_Type": results.APP_PRQ1Collection[i].U_APP_Type,
                        "AccountCode": results.APP_PRQ1Collection[i].U_APP_GlAccount,
                        "CostingCode": results.APP_PRQ1Collection[i].U_APP_FundType,
                        "CostingCode2": results.APP_PRQ1Collection[i].U_APP_Division,
                        "CostingCode3": results.APP_PRQ1Collection[i].U_APP_Program,
                        "CostingCode4": results.APP_PRQ1Collection[i].U_APP_Department,
                        "CostingCode5":results.APP_PRQ1Collection[i].U_APP_Employee,
                        "Quantity": results.APP_PRQ1Collection[i].U_APP_Quantity,
                        "UoMEntry": oUomEntry,
                        "UoMCode": results.APP_PRQ1Collection[i].U_APP_Uom,
                        "MeasureUnit": results.APP_PRQ1Collection[i].U_APP_Uom,
                        "UnitPrice": results.APP_PRQ1Collection[i].U_APP_EstPrice,
                        "LineTotal": results.APP_PRQ1Collection[i].U_APP_EstAmt,
                        "LineVendor": results.APP_PRQ1Collection[i].U_APP_Vendor,
                        "VatGroup": results.APP_PRQ1Collection[i].U_APP_TaxCode,
                        "WarehouseCode": results.APP_PRQ1Collection[i].U_APP_Whse,
                        "FreeText": results.APP_PRQ1Collection[i].U_APP_Notes
                      });
                    }
               
                    $.ajax({
                      url: "https://13.215.36.201:50000/b1s/v1/PurchaseRequests",
                      data: JSON.stringify(PurchaseRequest),
                      type: "POST",
                      crossDomain: true,
                      xhrFields: {
                        withCredentials: true
                      },
                      error: function (xhr, status, error) {
                        this.onPending();
                        var Message = xhr.responseJSON["error"].message.value;
                        APPui5.APPMESSAGEBOX(Message);
                        APPui5.closeLoadingFragment();
                        console.log(Message)
                        return
                      },
                      success: function (json) {  
                      //Patch Here;
                      $.ajax({
                        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_INQUIRYDETAILS2&VALUE1=" +  PurchaseRequest.U_APP_PRNo + "&VALUE2=Purchase Request",
                        type: "GET",
                        async: false,
                        beforeSend: function (xhr) {
                          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
                        },
                        error: function (xhr, status, error) {
                          var Message = xhr.responseJSON["error"].message.value;
                          APPui5.APPMESSAGEBOX(Message);
                          APPui5.closeLoadingFragment();
                          console.log(Message)
                        },
                        success: function (json) {
                          var docid = this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentNo;
                          var approvedDocs = {};
                          approvedDocs.U_APP_Status2 = "Approved";

                          for(let x = 0;x < json.length;x++){
                            $.ajax({
                              url: "https://13.215.36.201:50000/b1s/v1/APP_APRDEC(" + json[x].DocEntry + ")",
                              data: JSON.stringify(approvedDocs),
                              type: "PATCH",
                              crossDomain: true,
                              xhrFields: {
                                withCredentials: true
                              },
                              error: function (xhr, status, error) {
                                var Message = xhr.responseJSON["error"].message.value;
                                APPui5.APPMESSAGEBOX(Message);
                                APPui5.closeLoadingFragment();
                                console.log(Message)
                              },
                              success: function (json) {
                              },
                              context: this
                            })
                          }

                         
                        },
                        context: this
                      });

                        $.ajax({
                          url: "https://13.215.36.201:50000/b1s/v1/APP_OPRQ(" + this.DocEntry + ")/Close",
                          type: "POST",
                          crossDomain: true,
                          xhrFields: {
                            withCredentials: true
                          },
                          error: function (xhr, status, error) {
                            var Message = xhr.responseJSON["error"].message.value;
                            APPui5.APPMESSAGEBOX(Message);
                            APPui5.closeLoadingFragment();
                            console.log(Message)
                            return;
                          },
                          success:async function (json) {
                            await this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));
                          },
                          context: this
                        }).done(function (results) { });
                      },
                      context: this
                    }).done(function (results) {
                    });
                  });
                });
              }
              else
              {
                for(var i=0;i<results.length;i++){
                  var ApprovalPostingBody={};
                  ApprovalPostingBody.U_APP_Status="Pending";
                  ApprovalPostingBody.U_APP_Status2="Pending";
                  ApprovalPostingBody.U_APP_Stage=results[i].U_APP_Stages;
                  ApprovalPostingBody.U_APP_Level=results[i].U_APP_Level;
                  ApprovalPostingBody.U_APP_Template=results[i].Name;
                  ApprovalPostingBody.U_APP_Authorizer=results[i].U_APP_Authorizer;
                  ApprovalPostingBody.U_APP_DocType=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentType;
                  ApprovalPostingBody.U_APP_DocNum=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentNumber;
                  ApprovalPostingBody.U_APP_Originator=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Originator;
                  ApprovalPostingBody.U_APP_Remarks=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Remarks;
                  ApprovalPostingBody.U_APP_DocDate=APPui5.getDateFormat(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentDate);
                  ApprovalPostingBody.U_APP_DueDate=APPui5.getDateFormat(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DueDate);
                  ApprovalPostingBody.U_APP_Recommendation=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Recommendation;
                  ApprovalPostingBody.U_APP_Department= this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Department;
                  ApprovalPostingBody.U_APP_Depository= this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Depository;

                  $.ajax({
                    url: "https://13.215.36.201:50000/b1s/v1/APP_APRDEC",
                    data: JSON.stringify(ApprovalPostingBody),
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    error: function (xhr, status, error) {
                        this.onPending();
                        var Message = xhr.responseJSON["error"].message.value;			
                        APPui5.APPMESSAGEBOX(Message);
                        APPui5.closeLoadingFragment();
                        console.log(Message)
                        return
                    },
                    context:this,
                    success:async function (json) {
                      await this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));
                    }
                  }).done(function (results) {
                  });
                }
              }
            });
          }
          else
          {
            this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));
          }
        });
      }
      else if (DocumentType === "Payment Request") {
        $.ajax({
          url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_CHECKAPPROVAL&VALUE1=" + No  + "&VALUE2=" + DocumentType +"",
          type: "GET",
          async: false,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
          },
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            APPui5.APPMESSAGEBOX(Message);
            APPui5.closeLoadingFragment();
            console.log(Message)
          },
          success: function (json) {
          },
          context: this
        }).done(function (results) {
          if (results.length===0){
            var oURL = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_APPROVALROUTE&VALUE1=" + DocumentType  + "&VALUE2=" + this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Originator + "&VALUE3="+ No +"&VALUE4="+ Level +"";
            
            $.ajax({
              url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_APPROVALROUTE&VALUE1=" + DocumentType  + "&VALUE2=" + this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Originator + "&VALUE3="+ No +"&VALUE4="+ Level +"",
              type: "GET",
              async: false,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
              },
              error: function (xhr, status, error) {
                var Message = xhr.responseJSON["error"].message.value;
                APPui5.APPMESSAGEBOX(Message);
                APPui5.closeLoadingFragment();
                console.log(Message)
              },
              success: function (json) {
              },
              context: this
            }).done(function (results) {
              if (results.length === 0) {
                this.GetDocEntry(No, DocumentType);
                $.ajax({
                  url: "https://13.215.36.201:50000/b1s/v1/APP_ORFP(" + this.DocEntry + ")",
                  type: "GET",
                  crossDomain: true,
                  xhrFields: {
                    withCredentials: true
                  },
                  error: function (xhr, status, error) {
                    this.onPending();
                    var Message = xhr.responseJSON["error"].message.value;
                    APPui5.APPMESSAGEBOX(Message);
                    APPui5.closeLoadingFragment();
                    console.log(Message)
                    return
                  },
                  success: function (json) {
                  },
                  context: this
                }).done(function (results) {
                 console.log(results)
                  var PaymentRequest = {};
                  PaymentRequest.U_APP_CKRNO = results.DocNum;
                  PaymentRequest.NumAtCard = results.DocNum;
                  PaymentRequest.U_APP_Requester = results.U_APP_Requester;
                  PaymentRequest.DocDate = results.U_APP_RequestDate;
                  PaymentRequest.DocDueDate = results.U_APP_RequiredDate;
                  PaymentRequest.CardCode=results.U_APP_Payee;
                  PaymentRequest.Comments = results.Remark;
                  PaymentRequest.DocType = "dDocument_Items";
                  PaymentRequest.U_EmpLoanType = results.APP_RFP1Collection[0].U_APP_EmployeeType;
                  if (results.U_APP_Attachment !==''){
                    PaymentRequest.AttachmentEntry=results.U_APP_Attachment;
                  }

                  PaymentRequest.DocumentLines = [];
                  PaymentRequest.WithholdingTaxDataCollection = [];
                  var totalTax = new Number(0);
                  var totaloAmount = new Number(0);
                
                  var isTax = "tNO";


                  for (var i = 0; i < results.APP_RFP1Collection.length; i++) {
                    //get UoMEntry Here

                    
                    this.onGetUoMEntry(results.APP_RFP1Collection[i].U_APP_Uom);
                  
                    if(results.APP_RFP1Collection[i].U_WTLiable !== "No"){
                      isTax = "tYES";
                      this.onCheckWithHoldingTax(results.U_APP_Payee);
                      var resultAmountTax = new Number(0);
                      resultAmountTax = results.APP_RFP1Collection[i].U_APP_TaxLiable;
                      var resultAmountEst = new Number(0);
                      resultAmountEst = results.APP_RFP1Collection[i].U_APP_EstAmt;

                      totalTax = totalTax + resultAmountTax;
                      totaloAmount = totaloAmount + resultAmountEst;
                    }else{
                      isTax = "tNO";
                    }
                    
                    PaymentRequest.DocumentLines.push({
                      "ItemCode": results.APP_RFP1Collection[i].U_APP_ItemCode,
                      "ItemDescription": results.APP_RFP1Collection[i].U_APP_Description,
                      "U_APP_Type": results.APP_RFP1Collection[i].U_APP_Type,
                      "AccountCode": results.APP_RFP1Collection[i].U_APP_GLSap,
                      "CostingCode": results.APP_RFP1Collection[i].U_APP_FundType,
                      "CostingCode2": results.APP_RFP1Collection[i].U_APP_Division,
                      "CostingCode3": results.APP_RFP1Collection[i].U_APP_Program,
                      "CostingCode4": results.APP_RFP1Collection[i].U_APP_Department,
                      "CostingCode5":results.APP_RFP1Collection[i].U_APP_Employee,
                      "Quantity": results.APP_RFP1Collection[i].U_APP_Quantity,
                      "UoMCode": results.APP_RFP1Collection[i].U_APP_Uom,
                      "UoMEntry": oUomEntry,
                      "UnitPrice": results.APP_RFP1Collection[i].U_APP_EstPrice,
                      "LineTotal": results.APP_RFP1Collection[i].U_APP_EstAmt,
                      "VatGroup": results.APP_RFP1Collection[i].U_APP_TaxCode,
                      "FreeText": results.APP_RFP1Collection[i].U_APP_Notes,
                      "U_EmpLoanType": results.APP_RFP1Collection[i].U_APP_EmployeeType,
                      "TaxLiable": isTax,
                      "WTLiable": isTax
                    });
                  }

                  
                  if(isTax !== "tNO"){
                    PaymentRequest.WithholdingTaxDataCollection.push({
                      "WTCode": dWTCode,
                      "TaxableAmountinSys": totalTax,
                      "TaxableAmount": totalTax,
                    });
                  }
                
                  $.ajax({
                    url: "https://13.215.36.201:50000/b1s/v1/PurchaseInvoices",
                    data: JSON.stringify(PaymentRequest),
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {
                      withCredentials: true
                    },
                    error: function (xhr, status, error) {
                      this.onPending();
                      var Message = xhr.responseJSON["error"].message.value;
                      APPui5.APPMESSAGEBOX(Message);
                      APPui5.closeLoadingFragment();
                      console.log(Message)
                      return
                    },
                    success: function (json) {

                      $.ajax({
                        url: "https://13.215.36.201:50000/b1s/v1/APP_ORFP(" + this.DocEntry + ")/Close",
                        type: "POST",
                        crossDomain: true,
                        xhrFields: {
                          withCredentials: true
                        },
                        error: function (xhr, status, error) {
                          var Message = xhr.responseJSON["error"].message.value;
                          APPui5.APPMESSAGEBOX(Message);
                          APPui5.closeLoadingFragment();
                        },
                        success:async function (json) {
                        await this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));
                        },
                        context: this
                      }).done(function (results) { });
                    },
                    context: this
                  }).done(function (results) {
                  });
                });
              }
              else{
                for(var i=0;i<results.length;i++){
                  var ApprovalPostingBody={};
                  ApprovalPostingBody.U_APP_Status="Pending";
                  ApprovalPostingBody.U_APP_Status2="Pending";
                  ApprovalPostingBody.U_APP_Stage=results[i].U_APP_Stages;
                  ApprovalPostingBody.U_APP_Level=results[i].U_APP_Level;               
                  ApprovalPostingBody.U_APP_Template=results[i].Name;
                  ApprovalPostingBody.U_APP_Authorizer=results[i].U_APP_Authorizer;
                  ApprovalPostingBody.U_APP_DocType=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentType;
                  ApprovalPostingBody.U_APP_DocNum=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentNumber;
                  ApprovalPostingBody.U_APP_Originator=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Originator;
                  ApprovalPostingBody.U_APP_Remarks=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Remarks;
                  ApprovalPostingBody.U_APP_DocDate=APPui5.getDateFormat(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentDate);
                  ApprovalPostingBody.U_APP_DueDate=APPui5.getDateFormat(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DueDate);
                  ApprovalPostingBody.U_APP_Department= this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Department;
                  ApprovalPostingBody.U_APP_Depository= this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Depository;


                  $.ajax({
                    url: "https://13.215.36.201:50000/b1s/v1/APP_APRDEC",
                    data: JSON.stringify(ApprovalPostingBody),
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    error: function (xhr, status, error) {
                        this.onPending();
                        var Message = xhr.responseJSON["error"].message.value;			
                        APPui5.APPMESSAGEBOX(Message);
                        APPui5.closeLoadingFragment();
                        console.log(Message)
                        return
                    },
                    context:this,
                    success:async function (json) {
                      await this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));
                    }
                  }).done(function (results) {
                  });
                }
              }
            });
          }
          else
          {
            this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));
          }
        });
        APPui5.closeLoadingFragment();
      }
      else if (DocumentType === "Inventory Request") {
       try{
        $.ajax({
          url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_CHECKAPPROVAL&VALUE1=" + No  + "&VALUE2=" + DocumentType +"",
          type: "GET",
          async: false,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
          },
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            APPui5.APPMESSAGEBOX(Message);
            APPui5.closeLoadingFragment();
            console.log(Message)
          },
          success: function (json) {
          },
          context: this
        }).done(function (results) {
         
          if (results == 0){
            $.ajax({
              url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_APPROVALROUTE&VALUE1=" + DocumentType  + "&VALUE2=" + this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Originator + "&VALUE3="+ No +"&VALUE4="+ Level +"",
              type: "GET",
              async: false,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
              },
              error: function (xhr, status, error) {
                var Message = xhr.responseJSON["error"].message.value;
                APPui5.APPMESSAGEBOX(Message);
                APPui5.closeLoadingFragment();
                console.log(Message)
              },
              success: function (json) {
              },
              context: this
            }).done(function (results) {
            
              if (results.length == 0) {
                this.GetDocEntry(No, DocumentType);
                $.ajax({
                  url: "https://13.215.36.201:50000/b1s/v1/APP_OIVR(" + this.DocEntry + ")",
                  type: "GET",
                  crossDomain: true,
                  xhrFields: {
                    withCredentials: true
                  },
                  error: function (xhr, status, error) {
                    this.onPending();
                    var Message = xhr.responseJSON["error"].message.value;
                    APPui5.APPMESSAGEBOX(Message);
                    APPui5.closeLoadingFragment();
                    console.log(Message)
                    return
                  },
                  success: function (json) {
                  },
                  context: this
                }).done(function (results) {
                  var InventoryRequest = {};
                  InventoryRequest.DocObjectCode="oInventoryGenExit"
                  InventoryRequest.U_APP_MSQRNO = results.DocNum;
                  InventoryRequest.U_APP_Requester = results.U_APP_Requester;
                  InventoryRequest.U_APP_JONO=results.U_APP_JONum;
                  InventoryRequest.DocDate = results.U_APP_RequestDate;
                  InventoryRequest.DocDueDate = results.U_APP_RequiredDate;
                  InventoryRequest.Comments = results.Remark;
                  InventoryRequest.DocType = "dDocument_Items";
                  if (results.U_APP_Attachment !==''){
                    InventoryRequest.AttachmentEntry=results.U_APP_Attachment;
                  }
                  InventoryRequest.DocumentLines = [];

                  for (var i = 0; i < results.APP_IVR1Collection.length; i++) {
                    var Dimension2
                    if (results.APP_IVR1Collection[i].U_APP_Division != "") {
                      Dimension2 = results.APP_IVR1Collection[i].U_APP_Division;
                    }
                    else {
                      Dimension2 = results.APP_IVR1Collection[i].U_APP_Depository;
                    }

                    InventoryRequest.DocumentLines.push({
                      "ItemCode": results.APP_IVR1Collection[i].U_APP_ItemCode,
                      "ItemDescription": results.APP_IVR1Collection[i].U_APP_Description,
                      "U_APP_Type": results.APP_IVR1Collection[i].U_APP_Type,
                      "AccountCode": results.APP_IVR1Collection[i].U_APP_GlAccount,
                      "CostingCode": results.APP_IVR1Collection[i].U_APP_FundType,
                      "CostingCode2": Dimension2,
                      "CostingCode3": results.APP_IVR1Collection[i].U_APP_Program,
                      "CostingCode4": results.APP_IVR1Collection[i].U_APP_Department,
                      "CostingCode5":results.APP_IVR1Collection[i].U_APP_Employee,
                      "Quantity": results.APP_IVR1Collection[i].U_APP_Quantity,
                      "UoMCode": results.APP_IVR1Collection[i].U_APP_Uom,
                      "VatGroup": results.APP_IVR1Collection[i].U_APP_TaxCode,
                      "WarehouseCode":results.APP_IVR1Collection[i].U_APP_Whse,
                      "U_APP_Notes": results.APP_IVR1Collection[i].U_APP_Notes
                    });
                  }

                  $.ajax({
                    url: "https://13.215.36.201:50000/b1s/v1/Drafts",
                    data: JSON.stringify(InventoryRequest),
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {
                      withCredentials: true
                    },
                    error: function (xhr, status, error) {
                      this.onPending();
                      var Message = xhr.responseJSON["error"].message.value;
                      APPui5.APPMESSAGEBOX(Message);
                      APPui5.closeLoadingFragment();
                      console.log(Message)
                      return
                    },
                    success: function (json) {

                      $.ajax({
                        url: "https://13.215.36.201:50000/b1s/v1/APP_OIVR(" + this.DocEntry + ")/Close",
                        type: "POST",
                        crossDomain: true,
                        xhrFields: {
                          withCredentials: true
                        },
                        error: function (xhr, status, error) {
                          var Message = xhr.responseJSON["error"].message.value;
                          APPui5.APPMESSAGEBOX(Message);
                          APPui5.closeLoadingFragment();
                        },
                        success:async function (json) {
                          await this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));
                        },
                        context: this
                      }).done(function (results) { });
                    },
                    context: this
                  }).done(function (results) {
                  });
                });
              }
              else{
                for(var i=0;i<results.length;i++){
                  var ApprovalPostingBody={};
                  ApprovalPostingBody.U_APP_Status="Pending";
                  ApprovalPostingBody.U_APP_Status2="Pending";
                  ApprovalPostingBody.U_APP_Stage=results[i].U_APP_Stages;
                  ApprovalPostingBody.U_APP_Level=results[i].U_APP_Level;                 
                  ApprovalPostingBody.U_APP_Template=results[i].Name;
                  ApprovalPostingBody.U_APP_Authorizer=results[i].U_APP_Authorizer;
                  ApprovalPostingBody.U_APP_DocType=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentType;
                  ApprovalPostingBody.U_APP_DocNum=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentNumber;
                  ApprovalPostingBody.U_APP_Originator=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Originator;
                  ApprovalPostingBody.U_APP_Remarks=this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Remarks;
                  ApprovalPostingBody.U_APP_DocDate=APPui5.getDateFormat(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DocumentDate);
                  ApprovalPostingBody.U_APP_DueDate=APPui5.getDateFormat(this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].DueDate);
                  ApprovalPostingBody.U_APP_Department= this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Department;
                  ApprovalPostingBody.U_APP_Depository= this.oModel.getData().ApprovalDecisionRecords[this.iSelectedRow].Depository;


                  $.ajax({
                    url: "https://13.215.36.201:50000/b1s/v1/APP_APRDEC",
                    data: JSON.stringify(ApprovalPostingBody),
                    type: "POST",
                    crossDomain: true,
                    xhrFields: {
                        withCredentials: true
                    },
                    error: function (xhr, status, error) {
                        this.onPending();
                        var Message = xhr.responseJSON["error"].message.value;			
                        APPui5.APPMESSAGEBOX(Message);
                        APPui5.closeLoadingFragment();
                        console.log(Message)
                        return
                    },
                    context:this,
                    success:async function (json) {
                      await this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));
                    }
                  }).done(function (results) {
                  });
                }
              }
            });
          }
          else{
            this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));
          }
        });
      }catch (e) {
        console.log(e)
        APPui5.APPMESSAGEBOX(e,{duration: 5000});
      }
      }
    },

    onCheckWithHoldingTax: function(CustCode){
        dWTCode = ""
        $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETTAXLIABLE&VALUE1=" + CustCode,
        type: "GET",
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
        },
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          APPui5.APPMESSAGEBOX(Message);;
        },
        success: function (json) {
        },
        context: this
        }).done(function (results) {
        if (results.length !== 0) {  
          dWTCode = results[0].WTCode;
          this.oModel.refresh(); 
        }
        });
      },

    GetDocEntry: function (DocNum, DocType) {
      this.DocEntry=-1;
      if (DocType === "Purchase Request") {
        $.ajax({
          url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDOCENTRY&VALUE1=" + DocNum + "&VALUE2=APP_OPRQ",
          type: "GET",
          async: false,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
          },
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            APPui5.APPMESSAGEBOX(Message);
            APPui5.closeLoadingFragment();
            console.log(Message)
          },
          success: function (json) {
          },
          context: this
        }).done(function (results) {
          if (results) {
            this.DocEntry = results[0].DocEntry;
          }
        });
      }
      else if (DocType==="Payment Request")
      {
        $.ajax({
          url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDOCENTRY&VALUE1=" + DocNum + "&VALUE2=APP_ORFP",
          type: "GET",
          async: false,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
          },
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            APPui5.APPMESSAGEBOX(Message);
            APPui5.closeLoadingFragment();
            console.log(Message)
          },
          success: function (json) {
          },
          context: this
        }).done(function (results) {
          if (results) {
            this.DocEntry = results[0].DocEntry;
          }
        });

      }
      else if(DocType==="Inventory Request"){
        $.ajax({
          url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDOCENTRY&VALUE1=" + DocNum + "&VALUE2=APP_OIVR",
          type: "GET",
          async: false,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
          },
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            APPui5.APPMESSAGEBOX(Message);
            APPui5.closeLoadingFragment();
            console.log(Message)
          },
          success: function (json) {
          },
          context: this
        }).done(function (results) {
          if (results) {
            this.DocEntry = results[0].DocEntry;
          }
        });
      }
    },
    setReject:function(DocNum,DocType,Notes){

      if(Notes === null || Notes === ""){
        oNotes = "";
      }else{
        var oNotes = Notes.replace(/[^a-zA-Z ]/g, "")
      }
   
      var rURL = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_SETREJECT&VALUE1=" + DocNum + "&VALUE2=" + DocType + "&VALUE3=" + oNotes + "";
      $.ajax({
        url: rURL,
        type: "GET",
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
        },
        error: function (xhr, status, error) {
          this.onPending();
          var Message = xhr.responseJSON["error"].message.value;
          APPui5.APPMESSAGEBOX(Message);
          APPui5.closeLoadingFragment();
          console.log(Message)
          return
        },
        success:async function (json) {
         await this.LoadForApproval(jQuery.sap.storage.Storage.get("userCode"));
          await  this.ongetAllDocReject(DocNum,DocType);
          APPui5.APPMESSAGEBOX(DocType + "No . " + DocNum + " has been successfully rejected!");
        },
        context: this
      }).done(function (results) {
      });
    },
    ongetAllDocReject: function(DocNum,DocType){
      var rURL = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETREJECTDOC&VALUE1=" + DocNum + "&VALUE2=" + DocType;
      $.ajax({
        url: rURL,
        type: "GET",
        async: false,
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
        },
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          APPui5.closeLoadingFragment();
          console.log(Message)
          return;
        },
        success:async function (json) {
          var rejectedDoc = {};
          rejectedDoc.U_APP_Status2 = "Rejected";
          for(let i = 0;i < json.length;i++){
            $.ajax({
              url: "https://13.215.36.201:50000/b1s/v1/APP_APRDEC(" + json[i].DocEntry + ")",
              data: JSON.stringify(rejectedDoc),
              type: "PATCH",
              crossDomain: true,
              xhrFields: {
                withCredentials: true
              },
              error: function (xhr, status, error) {
                var Message = xhr.responseJSON["error"].message.value;
                APPui5.closeLoadingFragment();
                console.log(Message)
              },
              success: function (json) {
              },
              context: this
            })
          }
        },
        context: this
      });
    },
    ViewRecord:function(){
      localStorage.setItem("PreviousPath","");
      localStorage.setItem("Transaction","FAD");

      this.oTable = this.getView().byId("approvaldecision");
      var iIndex = this.oTable.getSelectedIndex();
      var oRowSelected = this.oTable.getBinding().getModel().getData().ApprovalDecisionRecords[this.oTable.getBinding().aIndices[iIndex]];
    

      if (oRowSelected.DocumentType==="Purchase Request"){
        var DocNum=oRowSelected.DocumentNumber;
        var ApprovalDecision={
          "DocNum":DocNum
        };

        var oModelDocNum=new JSONModel(ApprovalDecision);
        this.getOwnerComponent().setModel(oModelDocNum,"oModelDocNum");
        var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("PurchaseRequestView");
      }
      else if (oRowSelected.DocumentType==="Payment Request"){
          var DocNum= oRowSelected.DocumentNumber;
          var ApprovalDecision={
            "DocNum":DocNum
          };
          var oModelDocNum=new JSONModel(ApprovalDecision);
          this.getOwnerComponent().setModel(oModelDocNum,"oModelDocNum");
          var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("PaymentRequestView");
      }
      else if (oRowSelected.DocumentType==="Inventory Request"){
        var DocNum=oRowSelected.DocumentNumber;
        var ApprovalDecision={
          "DocNum":DocNum
        };
        var oModelDocNum=new JSONModel(ApprovalDecision);
        this.getOwnerComponent().setModel(oModelDocNum,"oModelDocNum");
        var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("InventoryRequestView");
      }
    },





  });
});
