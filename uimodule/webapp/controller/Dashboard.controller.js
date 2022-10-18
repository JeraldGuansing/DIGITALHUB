sap.ui.define([
      "sap/ui/core/mvc/Controller",
      "sap/ui/model/json/JSONModel",
      "sap/m/MessageToast",
      "sap/ui/core/Fragment",
      "sap/m/Popover",
      "sap/m/Button",
      "sap/m/library",
      "sap/ui/model/Filter",
      "sap/ui/model/FilterOperator",
      "com/apptech/DLSL/controller/APPui5"
  ], function(Controller, JSONModel, MessageToast,Fragment,Popover,Button,library,Filter,FilterOperator,APPui5) {
    "use strict";
  
    return Controller.extend("com.apptech.DLSL.controller.Main", {
        onInit: function(){
        this.oModel=new JSONModel("model/data.json");
        this.getView().setModel(this.oModel,"oModel");    
        var that = this;
        var oView = this.getView();
          oView.addEventDelegate({
              onAfterHide: function(evt) {
                  //This event is fired every time when the NavContainer has made this child control invisible.
              },
              onAfterShow: function(evt) {
                  //This event is fired every time when the NavContainer has made this child control visible.
                  oView.getController().onLoadApprovalStagesRecords();
                  oView.getController().onLoadApprovalTemplateRecords();
                  oView.getController().LoadForApproval();
                  oView.getController().OnLoadRecordsPR();
                  oView.getController().OnLoadRecordsPM();
                  oView.getController().OnLoadRecordsINV();
                  oView.getController().LoadDecision(localStorage.getItem("UserCode"));
                
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
        onSetMenu: function(){
          if(localStorage.getItem("UserType") == "Administrator"){
            this.getView().byId("AdminTab").setVisible(true);
            this.getView().byId("DASHAP").setVisible(true);
            this.getView().byId("DASHAI").setVisible(true);
            this.getView().byId("ProcTabID").setVisible(true);
            this.getView().byId("PayTabID").setVisible(true);
            this.getView().byId("InvTabID").setVisible(true);
          }else if(localStorage.getItem("UserType") == "Approver"){
            this.getView().byId("AdminTab").setVisible(true);
            this.getView().byId("DASHAI").setVisible(true);
            this.getView().byId("DASHAD").setVisible(true);
           
          }else if(localStorage.getItem("UserType") == "Maker"){
            this.getView().byId("AdminTab").setVisible(true);
            this.getView().byId("DASHAI").setVisible(true);
            this.getView().byId("ProcTabID").setVisible(true);
            this.getView().byId("PayTabID").setVisible(true);
            this.getView().byId("InvTabID").setVisible(true);
            
          }
        },
        initialize: function () {
          // this.openLoadingFragment();
          this.onSetMenu();
          this.oModel.refresh();
        },
        onApprovalProcess: function(){
          this.router = this.getOwnerComponent().getRouter();
          this.router.navTo("ApprovalProcess");
        },
        onApprovalDecion: function(){
          this.router = this.getOwnerComponent().getRouter();
          this.router.navTo("ApprovalDecision");
        },
        onApprovalInQuiry: function(){
          this.router = this.getOwnerComponent().getRouter();
          this.router.navTo("ApprovalInquiry");
        },
        onProcurement: function(){
          this.router = this.getOwnerComponent().getRouter();
          this.router.navTo("PurchaseRequest");
        },
        onPayment: function(){
          this.router = this.getOwnerComponent().getRouter();
          this.router.navTo("PaymentRequest");
        },
        onInventory: function(){
          this.router = this.getOwnerComponent().getRouter();
          this.router.navTo("InventoryRequest");
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

        onLoadApprovalStagesRecords: function(){
            this.oModel.getData().ApprovalStages = [];
            $.ajax({
              url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETRECORDS&VALUE1=APP_APRSTG",
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
              this.getView().byId("dashApprovalProcess").setValue(results.length);
            });
        },
        onLoadApprovalTemplateRecords: function(){
            this.oModel.getData().ApprovalTemplates = [];
            $.ajax({
              url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETRECORDS&VALUE1=APP_APRTEMP",
              type: "GET",
              async: false,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
              },
              error: function (xhr, status, error) {
                this.closeLoadingFragment(); 
                var Message = xhr.responseJSON["error"].message.value;
                sap.m.MessageToast.show(Message);
              },
              success: function (json) {
              },
              context: this
            }).done(function (results) {
              
            });
            
        },

        LoadDecision: function (UserCode) {
          $.ajax({
            url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETFORAPPROVAL&VALUE1=" + UserCode + "&VALUE2=Pending",
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
            this.getView().byId("dashApprovalDecision").setValue(results.length);
            this.oModel.refresh();
          });
        },


      LoadForApproval: function () {
        this.oModel.getData().ApprovalInquiryRecords = [];
        var ursStr = "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETFORAPPROVALINQUIRY&VALUE1=&VALUE2=All&VALUE3=Purchase Request";
        $.ajax({
          url: ursStr,
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
         
          var oINQ = [];
          for(let i = 0;i < results.length;i++){
        
          const sSRI = oINQ.filter(function(SSI){
          return SSI.DocEntry == results[i].DocEntry && SSI.U_APP_DocType == results[i].U_APP_DocType})
            
          if(results[i].U_APP_Originator == localStorage.getItem("UserCode") && sSRI.length == 0){
              oINQ.push({
                "DocEntry": results[i].DocEntry,
                "U_APP_DocType": results[i].U_APP_DocType
              });
            }
          }
          this.getView().byId("dashApprovalInquiry").setValue(oINQ.length);
          this.oModel.refresh();
        });
      },

      OnLoadRecordsPM: function () {
        this.oModel.getData().PaymentRequest = [];
        var urlStr = "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETRECORDS&VALUE1=APP_ORFP";
        
        $.ajax({
          url: urlStr,
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
          for(var i= 0;i < results.length;i++){
            var statueName = "Open";
            var statusState = "Information";
            if(results[i].U_APP_Requester == localStorage.getItem("UserCode")){
              if( results[i].Status == "C"){
                statueName = "Closed";
                statusState = "Success";
              }else{
                statueName = "Open";
                statusState = "Information";
              }

            this.oModel.getData().PaymentRequest.push({
              "DocNum": results[i].DocNum,
              "RequestDate": APPui5.getDateFormat(results[i].U_APP_RequestDate),
              "Status":  statueName,
              "InfoState": statusState
            });
            }
          }
          this.getView().byId("dashPayment").setValue(this.oModel.getData().PaymentRequest.length);
          this.oModel.refresh();
        });
        
      },
  
      OnLoadRecordsPR: function () {
        this.oModel.getData().PurchaseRequest = [];
        this.oModel.refresh();
        var urlStr = "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETRECORDS&VALUE1=APP_OPRQ";
        $.ajax({
          url: urlStr,
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
         
          for(var i= 0;i < results.length;i++){
            var statueName = "Open";
            var statusState = "Information";
            if(results[i].U_APP_Requester == localStorage.getItem("UserCode")){
              if( results[i].Status == "C"){
                statueName = "Closed";
                statusState = "Success";
              }else{
                statueName = "Open";
                statusState = "Information";
              }

            this.oModel.getData().PurchaseRequest.push({
              "DocNum": results[i].DocNum,
              "RequestDate": APPui5.getDateFormat(results[i].U_APP_RequestDate),
              "Status":  statueName,
              "InfoState": statusState
            });
            }
          }
          this.getView().byId("dashProcurement").setValue(this.oModel.getData().PurchaseRequest.length);
          this.oModel.refresh();
        });
      },

      OnLoadRecordsINV: function () {

        this.oModel.getData().InventoryRequest = [];
        var urlStr = "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETRECORDS&VALUE1=APP_OIVR";
        
        $.ajax({
          url: urlStr,
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
        
          for(var i= 0;i < results.length;i++){
            var statueName = "Open";
            var statusState = "Information";
            if(results[i].U_APP_Requester == localStorage.getItem("UserCode")){
              if( results[i].Status == "C"){
                statueName = "Closed";
                statusState = "Success";
              }else{
                statueName = "Open";
                statusState = "Information";
              }

            this.oModel.getData().InventoryRequest.push({
              "DocNum": results[i].DocNum,
              "RequestDate": APPui5.getDateFormat(results[i].U_APP_RequestDate),
              "Status":  statueName,
              "InfoState": statusState
            });
            }
          }
          this.getView().byId("dashInventory").setValue(this.oModel.getData().InventoryRequest.length);
          this.oModel.refresh();
        });      
      },


      handleValueHelpPurchaseRequest: function (oEvent) {
        if (!this._oValueHelpDialogDept) {
          Fragment.load({
            name: "com.apptech.DLSL.view.fragments.Dashboard.DashboardPR",
            controller: this
          }).then(function (oValueHelpDialogDept) {
            this._oValueHelpDialogDept = oValueHelpDialogDept;
            this.getView().addDependent(this._oValueHelpDialogDept);
            this._oValueHelpDialogDept.open();
          }.bind(this));
        } else {
          this._oValueHelpDialogDept.open();
        }
      },
      handleSearchPurchaseRequest: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilters = new Filter([
          new Filter("DocNum", FilterOperator.Contains, sValue),
          new Filter("RequestDate", FilterOperator.Contains, sValue)
        ], false);
        var oBinding = oEvent.getSource().getBinding("items");
        oBinding.filter(oFilters);
      },
      handleValueHelpClosePR: function (oEvent) {
        var aContexts = oEvent.getParameter("selectedContexts");
        var Departments = {};
        if (aContexts && aContexts.length) {
          Departments = aContexts.map(function (oContext) {
            var oDepartments = {};
            oDepartments.DocNum = oContext.getObject().DocNum;
            return oDepartments;
          });
        }

        console.log(Departments[0].DocNum)
        oEvent.getSource().getBinding("items").filter([]);
        var DocNum= Departments[0].DocNum;
        var ApprovalDecision={
          "DocNum":DocNum
        };

        
        var oModelDocNum=new JSONModel(ApprovalDecision);
        this.getOwnerComponent().setModel(oModelDocNum,"oModelDocNum");
        var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("PurchaseRequest");
        this.oModel.refresh();
      },


      handleValueHelpPM: function (oEvent) {
        if (!this._oValueHelpDialogPM) {
          Fragment.load({
            name: "com.apptech.DLSL.view.fragments.Dashboard.DashboardPM",
            controller: this
          }).then(function (oValueHelpDialogPM) {
            this._oValueHelpDialogPM = oValueHelpDialogPM;
            this.getView().addDependent(this._oValueHelpDialogPM);
            this._oValueHelpDialogPM.open();
          }.bind(this));
        } else {
          this._oValueHelpDialogPM.open();
        }
      },
      handleSearchPM: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilters = new Filter([
          new Filter("DocNum", FilterOperator.Contains, sValue),
          new Filter("RequestDate", FilterOperator.Contains, sValue)
        ], false);
        var oBinding = oEvent.getSource().getBinding("items");
        oBinding.filter(oFilters);
      },
      handleValueHelpClosePM: function (oEvent) {
        var aContexts = oEvent.getParameter("selectedContexts");
        var Departments = {};
        if (aContexts && aContexts.length) {
          Departments = aContexts.map(function (oContext) {
            var oDepartments = {};
            oDepartments.DocNum = oContext.getObject().DocNum;
            return oDepartments;
          });
        }

        console.log(Departments[0].DocNum)
        oEvent.getSource().getBinding("items").filter([]);
        var DocNum= Departments[0].DocNum;
        var ApprovalDecision={
          "DocNum":DocNum
        };

        
        var oModelDocNum=new JSONModel(ApprovalDecision);
        this.getOwnerComponent().setModel(oModelDocNum,"oModelDocNum");
        var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("PaymentRequest");
        this.oModel.refresh();
      },


      handleValueHelpINV: function (oEvent) {
        if (!this._oValueHelpDialogPM) {
          Fragment.load({
            name: "com.apptech.DLSL.view.fragments.Dashboard.DashboardINV",
            controller: this
          }).then(function (oValueHelpDialogPM) {
            this._oValueHelpDialogPM = oValueHelpDialogPM;
            this.getView().addDependent(this._oValueHelpDialogPM);
            this._oValueHelpDialogPM.open();
          }.bind(this));
        } else {
          this._oValueHelpDialogPM.open();
        }
      },
      handleSearchINV: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilters = new Filter([
          new Filter("DocNum", FilterOperator.Contains, sValue),
          new Filter("RequestDate", FilterOperator.Contains, sValue)
        ], false);
        var oBinding = oEvent.getSource().getBinding("items");
        oBinding.filter(oFilters);
      },
      handleValueHelpCloseINV: function (oEvent) {
        var aContexts = oEvent.getParameter("selectedContexts");
        var Departments = {};
        if (aContexts && aContexts.length) {
          Departments = aContexts.map(function (oContext) {
            var oDepartments = {};
            oDepartments.DocNum = oContext.getObject().DocNum;
            return oDepartments;
          });
        }

        console.log(Departments[0].DocNum)
        oEvent.getSource().getBinding("items").filter([]);
        var DocNum= Departments[0].DocNum;
        var ApprovalDecision={
          "DocNum":DocNum
        };

        
        var oModelDocNum=new JSONModel(ApprovalDecision);
        this.getOwnerComponent().setModel(oModelDocNum,"oModelDocNum");
        var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("InventoryRequest");
        this.oModel.refresh();
      },


    });
  });
  