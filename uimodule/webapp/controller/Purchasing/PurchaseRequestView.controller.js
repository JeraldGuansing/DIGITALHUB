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
    "sap/ui/model/FilterOperator"
  ], function (jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast, APPui5, Filter, FilterOperator) {
    "use strict";
    return Controller.extend("com.apptech.DLSL.controller.Purchasing.PurchaseRequestView", {
      onBeforeRendering: function () {
      },
      onInit: function (oModelDocNum) {
        this.oModel = new JSONModel("model/purchaserequest.json");
        this.getView().setModel(this.oModel, "oModel");
        this.router = this.getOwnerComponent().getRouter();
        
        this.iSelectedRow = 0;
        this.DocNum=0;
        this.DepartmenName="";
        this.UserName="";
        var Router=sap.ui.core.UIComponent.getRouterFor(this);
        Router.getRoute("PurchaseRequestView").attachMatched(this._onRouterMatched,this);
      },
      OnCancelScreen: async function () {
        this.onClearData();
        var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("ApprovalDecision");
      },
    
      onLoadPRRecord:function(){
        $.ajax({
          url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDOCENTRY&VALUE1="+ this.DocNum  +"&VALUE=APP_OPRQ",
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
          $.ajax({
            url: "https://13.215.36.201:50000/b1s/v1/APP_OPRQ("+ results[0].DocEntry +")",
            type: "GET",
            crossDomain: true,
            xhrFields: {
              withCredentials: true
            },
            error: function (xhr, status, error) {
              var Message = xhr.responseJSON["error"].message.value;
              sap.m.MessageToast.show(Message);
            },
            success: function (json) {
            },
            context: this
          }).done(function (results) {
            // console.log(results)
            this.getDepartment(results.U_APP_Department);
            this.getUser(results.U_APP_Requester); 
           
            this.oModel.getData().PurchaseRequest.No=results.DocNum;
            this.oModel.getData().PurchaseRequest.RequestDate=results.U_APP_RequestDate;
            this.oModel.getData().PurchaseRequest.RequiredDate=results.U_APP_RequiredDate;
            this.oModel.getData().PurchaseRequest.RequesterCode=results.U_APP_Requester;
            this.oModel.getData().PurchaseRequest.RequesterName=this.UserName
            this.oModel.getData().PurchaseRequest.DepartmentCode=results.U_APP_Department;
            this.oModel.getData().PurchaseRequest.DepartmentName=this.DepartmentName;
        
            this.oModel.getData().PurchaseRequest.PositionCode=results.U_APP_Position;
            this.oModel.getData().PurchaseRequest.Remarks=results.Remark;
            this.getView().byId("status").setSelectedKey(results.Status);
            this.oModel.getData().PurchaseRequest.StatusCode=results.status;

            if(results.U_APP_Attachment !== null || results.U_APP_Attachment !== ""){
              this.oModel.getData().PurchaseRequest.AttachmentEntry = results.U_APP_Attachment;
              this.getFromAttachment(results.U_APP_Attachment);
            }

            this.oModel.getData().PurchaseRequest.Items=[];
           
            for (var i=0;i<results.APP_PRQ1Collection.length;i++){
              this.oModel.getData().PurchaseRequest.Items.push({
                "ItemCode": results.APP_PRQ1Collection[i].U_APP_ItemCode,
                "Description": results.APP_PRQ1Collection[i].U_APP_Description,
                "SpecialistCode": results.APP_PRQ1Collection[i].U_APP_SpecialistCode,
                "Type": results.APP_PRQ1Collection[i].U_APP_Type,
                "GlAccount": results.APP_PRQ1Collection[i].U_APP_GlAccount,
                "FundType": results.APP_PRQ1Collection[i].U_APP_FundType,
                "Program": results.APP_PRQ1Collection[i].U_APP_Program,
                "Department": results.APP_PRQ1Collection[i].U_APP_Department,
                "Division": results.APP_PRQ1Collection[i].U_APP_Division,
                "Employee":results.APP_PRQ1Collection[i].U_APP_Employee,
                "Quantity": results.APP_PRQ1Collection[i].U_APP_Quantity,
                "UOM": results.APP_PRQ1Collection[i].U_APP_Uom,
                "EstUnitPrice": results.APP_PRQ1Collection[i].U_APP_EstPrice,
                "EstAmount": results.APP_PRQ1Collection[i].U_APP_EstAmt,
                "BudgetAvailable": "",
                "Vendor": results.APP_PRQ1Collection[i].U_APP_Vendor,
                "TaxCode": results.APP_PRQ1Collection[i].U_APP_TaxCode,
                "Warehouse": results.APP_PRQ1Collection[i].U_APP_Whse,
                "Notes": results.APP_PRQ1Collection[i].U_APP_Notes
              });
            }
            this.oModel.refresh();
           
          });
        });
  
      },
      getDepartment:function(Department){
        $.ajax({
          url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDEPT&VALUE1="+ Department +"",
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
          if (results){
            this.DepartmentName=results[0].Name;
          }
        });
      },
      getUser:function(User){
        $.ajax({
          url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETUSR&VALUE1="+ User +"",
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
          if (results){
            this.UserName=results[0].U_NAME;
          }
        });
      },
      _onRouterMatched:function(oEvent){
        var oModelDocNum=this.getView().getModel("oModelDocNum");
        this.DocNum=oModelDocNum.getData().DocNum;           
        this.onLoadPRRecord();
       },
      onClearData: function () {
        this.oModel.getData().PurchaseRequest.No = "";
        this.oModel.getData().PurchaseRequest.RequesterCode = "";
        this.oModel.getData().PurchaseRequest.RequesterName = "";
        this.oModel.getData().PurchaseRequest.PositionCode = "";
        this.oModel.getData().PurchaseRequest.PositionName = "";
        this.oModel.getData().PurchaseRequest.DepartmentCode = "";
        this.oModel.getData().PurchaseRequest.DepartmentName = "";
        this.oModel.getData().PurchaseRequest.RequestDate = "";
        this.oModel.getData().PurchaseRequest.RequiredDate = "";
        this.oModel.getData().PurchaseRequest.StatusCode = "";
        this.oModel.getData().PurchaseRequest.StatusName = "";
        this.oModel.getData().PurchaseRequest.Remarks = "";
        this.oModel.getData().PurchaseRequest.Items = [];
      },
  
      onBack: async function () {	
        this.onClearData();
        var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("ApprovalInquiry");
      },
  
      onNavBack: function(){
        if(localStorage.getItem("Transaction") === "FAQ"){
          this.onBack();
        }else if(localStorage.getItem("Transaction") === "FAD"){
          this.OnCancelScreen();
        }
  
        localStorage.setItem("Transaction","");
      },

      onViewAttachment: function(oEvent){
          this.iSelectedRow = oEvent.getSource().getParent().getIndex();    
          window.open("https://13.215.36.201:50000/b1s/v1/Attachments2(" + this.oModel.getData().PurchaseRequest.AttachmentEntry + ")/$value?filename='" + this.oModel.getData().Attachments[this.iSelectedRow].FileName + "." + this.oModel.getData().Attachments[this.iSelectedRow].FileExtension +  "'");  
      },
  
      getAttachmentPath(AttachmentEntry){
        $.ajax({
          url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETATTACHMENT&VALUE1="+ AttachmentEntry +"",
          type: "GET",
          async: false,
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
          },
          error: function (xhr, status, error) {
            // var Message = xhr.responseJSON["error"].message.value;
            // sap.m.MessageToast.show(Message);
            console.log("Message")
          },
          success: function (json) {
            console.log(json)
          },
          context: this
        }).done(function (results) {
          this.getView().byId("AttachID").setText(results[0].FileName);
        });
        this.oModel.refresh();
      },


      onPreview: function(){  
    
        if (!this.oReportViewer) {
          this.oReportViewer = sap.ui.xmlfragment("com.apptech.DLSL.view.fragments.ReportViewer",this);
          this.getView().addDependent(this.oReportViewer);
        }
        
        this.oReportViewer.open();
      
        var docentry = this.DocNum;
        var report = 'PRF';
        
        //**KOA 03282022 */
        // if(url="https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName='WEBAPP_TESTING'"){
        //   var sRedirectUrl = `http://digitalhub.dlsl.edu.ph/1DLSL-TRX_Forms/TRXForms-viewer.jsp?report=${report}&docentry=${docentry}`;
        // }else{
        //   var sRedirectUrl = `http://digitalhub.dlsl.edu.ph/DLSL-TRX_Forms/TRXForms-viewer.jsp?report=${report}&docentry=${docentry}`;
        // }
        var sRedirectUrl = `http://digitalhub.dlsl.edu.ph/DLSL-TRX_Forms/TRXForms-viewer.jsp?report=${report}&docentry=${docentry}`;
        $('#ReportViewerIframe').attr("src",sRedirectUrl);
        
      },

    onCloseReport: function(){
      this.oReportViewer.close();
      this.oReportViewer.destroy();
      this.oReportViewer=null;
    },
  

	  getFromAttachment(DocEntry){
      try{
        $.ajax({
          url: "https://13.215.36.201:50000/b1s/v1/Attachments2?$filter=AbsoluteEntry eq " +  DocEntry,
          type: "GET",
          async: "false",
          crossDomain: true,
          xhrFields: {
            withCredentials: true
          },
          error: function (xhr, status, error) {
            var Message = xhr.responseJSON["error"].message.value;
            // APPui5.APPMESSAGEBOX(Message);
            console.log(Message);
          },
          success: function (json) {
          },
          context: this
        }).done(function (results) {
          this.oModel.getData().Attachments = [];
          localStorage.setItem("AttcEntry",results.value[0].AbsoluteEntry);
          this.oModel.getData().Attachments = results.value[0].Attachments2_Lines;
          this.oModel.refresh();
        });
      }catch (e){
        console.log(e)
      }
    },


    });
  });
  
  