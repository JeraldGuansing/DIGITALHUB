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
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "com/apptech/DLSL/controller/APPui5"
], function (jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast, Filter, FilterOperator, APPui5) {
  "use strict";
  var oTerm;
  var oValueTerms;
  var oIndex;
  return Controller.extend("com.apptech.DLSL.controller.Approval.ApprovalTemplateUpdate", {
    onInit: function(){
      this.oModel = new JSONModel("model/approvaltemplates.json");
      this.oModel.setSizeLimit(100000);
      this.getView().setModel(this.oModel, "oModel");
      this.iSelectDialogIndex = 0;
      this.Name = "";
   
     
      var that = this;
	    var oView = this.getView();
        oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                // oView.getController().ongetContrlNum();
                // that.onbackToScan();
                oView.getController().onLoadUsers();
     
                oView.getController().OnLoadStages();
                oView.getController().OnLoadDept();
                oView.getController().onLoadGL();
                oView.getController().onLoadSpecialist();
                oView.getController().OnRefundTerm();
                oView.getController().onLoadApprovalTemplateRecord();
          
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
      this.oModel.refresh();
    },
    OnBack: async function () {
      var prompt = await APPui5.onPrompt("WARNING MESSAGE!", "Are you sure you want to go back without adding/updating the document?");
      if (prompt === 0) {
        return;
      }
      this.onClearData();
      var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("ApprovalProcess");
    },
    onLoadUsers: function () {
      this.oModel.getData().Users = [];
      $.ajax({
        url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETUSERS",
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
        var i;
        for (i = 0; i < results.length; i++) {
          this.oModel.getData().Users.push({
            "UserCode": results[i].USER_CODE,
            "UserName": results[i].U_NAME,
            "Department": results[i].Department,
            "Name": results[i].Name
          });
        }
        this.oModel.refresh();
      });
    },
    OnRefundTerm: function () {
      this.oModel.getData().refund = [];
      $.ajax({
        url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDIMENSIONS",
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
        for (let i = 0; i < results.length; i++) {
          if (results[i].DimCode === 2) {  
          this.oModel.getData().refund.push({
              "PrcCode": results[i].PrcCode,
              "PrcName": results[i].PrcName,
              "GrpCode":results[i].GrpCode
            });
          }
        }
        this.oModel.refresh();
      });
    },
    OnLoadDept: function () {
      this.oModel.getData().Dept = [];
      $.ajax({
        url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDIMENSIONS",
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
        for (let i = 0; i < results.length; i++) {
          if (results[i].DimCode === 4) {  
          this.oModel.getData().Dept.push({
              "PrcCode": results[i].PrcCode,
              "PrcName": results[i].PrcName,
              "GrpCode":results[i].GrpCode
            });
          }
        }
        this.oModel.refresh();
      });
    },
    OnLoadStages: function () {
      this.oModel.getData().Stages = [];
      $.ajax({
        url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETSTAGES",
        type: "GET",
        async: true,
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
        var i;
        for (i=0; i < results.length; i++) {
          this.oModel.getData().Stages.push({
            "StageName": results[i].Code,
            "Description": results[i].Name
          });
        }
        this.oModel.refresh();
      });
    },
    handleValueHelpUsers: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      // var oCardCode=this.oModel.getData().DataRecord.CardCode;
      // if(oCardCode==="" || oCardCode===null || oCardCode===undefined){
      //   APPui5.APPMESSAGEBOX("Please Select Vendor");
      //   return;
      // }
      if (!this._oValueHelpDialogUsers) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTemplateUsers",
          controller: this
        }).then(function (oValueHelpDialogUsers) {
          this._oValueHelpDialogUsers = oValueHelpDialogUsers;
          this.getView().addDependent(this._oValueHelpDialogUsers);
          this._oValueHelpDialogUsers.open();
        }.bind(this));
      } else {
        this._oValueHelpDialogUsers.open();
      }
    },
    handleSearchUsers: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilters = new Filter([
        new Filter("UserCode", FilterOperator.Contains, sValue),
        new Filter("UserName", FilterOperator.Contains, sValue)
      ], false);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter(oFilters);
    },
    handleValueCloseUsers: function (oEvent) {
      var aContexts = oEvent.getParameter("selectedContexts");
      var Users = {};
      if (aContexts && aContexts.length) {
        Users = aContexts.map(function (oContext) {
          var oUsers = {};
          oUsers.UserCode = oContext.getObject().UserCode;
          oUsers.UserName = oContext.getObject().UserName;
          oUsers.Department = oContext.getObject().Department;
          oUsers.Name = oContext.getObject().Name;
          return oUsers;
        });
      }

    
      oEvent.getSource().getBinding("items").filter([]);
      this.oModel.getData().ApprovalTemplates.Originator[this.iSelectedRow].Originator = Users[0].UserCode;
      this.oModel.getData().ApprovalTemplates.Originator[this.iSelectedRow].Department = Users[0].Department;
      this.oModel.getData().ApprovalTemplates.Originator[this.iSelectedRow].Name = Users[0].Name;
      this.oModel.refresh();
    },
    OnAddRowOriginator: function () {
      this.oModel.getData().ApprovalTemplates.Originator.push({
        "Originator": "",
        "Department": "",
        "Name": ""
      })
      this.oModel.refresh();
    },
    OnDeleteRowOriginator: function () {
      this.tblItems = this.getView().byId("Originator");
      this.oModel.getData().ApprovalTemplates.Originator.splice(this.tblItems.getSelectedIndex(), 1);
      this.oModel.refresh();
    },
    handleSearchDept: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilters = new Filter([
        new Filter("PrcCode", FilterOperator.Contains, sValue),
        new Filter("PrcName", FilterOperator.Contains, sValue)
      ], false);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter(oFilters);
    },
    handleSearchGL: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilters = new Filter([
        new Filter("PrcCode", FilterOperator.Contains, sValue),
        new Filter("PrcName", FilterOperator.Contains, sValue)
      ], false);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter(oFilters);
    },
    handleSearchSLP: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilters = new Filter([
        new Filter("PrcCode", FilterOperator.Contains, sValue),
        new Filter("PrcName", FilterOperator.Contains, sValue)
      ], false);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter(oFilters);
    },
    OnAddRowStages: function () {
      var LevelNo=0;
      if (this.oModel.getData().ApprovalTemplates.Stages.length===0){
        LevelNo=1;
      }
      else
      {
        
        for(var i=0;i<this.oModel.getData().ApprovalTemplates.Stages.length;i++){
          if (i===this.oModel.getData().ApprovalTemplates.Stages.length-1){
            LevelNo=parseInt(this.oModel.getData().ApprovalTemplates.Stages[i].Level) + 1;
          }
        } 
      }
      this.oModel.getData().ApprovalTemplates.Stages.push({
        "Level":LevelNo,
        "Stages": "",
        "Description": ""
      })
      this.oModel.refresh();
    },
    OnDeleteRowStages: function () {
      this.tblItems = this.getView().byId("Stages");
      this.oModel.getData().ApprovalTemplates.Stages.splice(this.tblItems.getSelectedIndex(), 1);
      this.oModel.refresh();
    },
    OnAddRowDocuments: function () {
      this.oModel.getData().ApprovalTemplates.Documents.push({
        "Document": "",
        "Flag": true
      })
      this.oModel.refresh();
    },
    OnDeleteRowDocuments: function () {
      this.tblItems = this.getView().byId("Documents");
      this.oModel.getData().ApprovalTemplates.Documents.splice(this.tblItems.getSelectedIndex(), 1);
      this.oModel.refresh();
    },
    OnAddRowTerms: function () {
      this.oModel.getData().ApprovalTemplates.Terms.push({
        "Terms": "",
        "Ratio": "",
        "Value": "",
        "Value2":""
      })
      this.oModel.refresh();
    },
    OnDeleteRowTerms: function () {
      this.tblItems = this.getView().byId("Terms");
      this.oModel.getData().ApprovalTemplates.Terms.splice(this.tblItems.getSelectedIndex(), 1);
      this.oModel.refresh();
    },
    _onRouterMatched: function (oEvent) {
      // var oModelTemplate = this.getView().getModel("oModelTemplate");
      // this.Name = localStorage.getItem("TemplateName");
      this.onLoadApprovalTemplateRecord();
    },
    handleValueHelpStages: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      // var oCardCode=this.oModel.getData().DataRecord.CardCode;
      // if(oCardCode==="" || oCardCode===null || oCardCode===undefined){
      //   APPui5.APPMESSAGEBOX("Please Select Vendor");
      //   return;
      // }
      if (!this._oValueHelpDialogStages) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTemplateStages",
          controller: this
        }).then(function (oValueHelpDialogStages) {
          this._oValueHelpDialogStages = oValueHelpDialogStages;
          this.getView().addDependent(this._oValueHelpDialogStages);
          this._oValueHelpDialogStages.open();
        }.bind(this));
      } else {
        this._oValueHelpDialogStages.open();
      }
    },
    handleSearchStages: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilters = new Filter([
        new Filter("StageName", FilterOperator.Contains, sValue),
        new Filter("Description", FilterOperator.Contains, sValue)
      ], false);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter(oFilters);
    },
    handleValueCloseStages: function (oEvent) {
      var aContexts = oEvent.getParameter("selectedContexts");
      var Stages = {};
      if (aContexts && aContexts.length) {
        Stages = aContexts.map(function (oContext) {
          var oStages = {};
          oStages.StageName = oContext.getObject().StageName;
          oStages.Description = oContext.getObject().Description;
          return oStages;
        });
      }
      oEvent.getSource().getBinding("items").filter([]);
      this.oModel.getData().ApprovalTemplates.Stages[this.iSelectedRow].Stages = Stages[0].StageName;
      this.oModel.getData().ApprovalTemplates.Stages[this.iSelectedRow].Description = Stages[0].Description;
      this.oModel.refresh();

    },
    handleValueHelpDocuments: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      // var oCardCode=this.oModel.getData().DataRecord.CardCode;
      // if(oCardCode==="" || oCardCode===null || oCardCode===undefined){
      //   APPui5.APPMESSAGEBOX("Please Select Vendor");
      //   return;
      // }
      if (!this._oValueHelpDialogDocuments) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTemplateDocuments",
          controller: this
        }).then(function (oValueHelpDialogDocuments) {
          this._oValueHelpDialogDocuments = oValueHelpDialogDocuments;
          this.getView().addDependent(this._oValueHelpDialogDocuments);
          this._oValueHelpDialogDocuments.open();
        }.bind(this));
      } else {
        this._oValueHelpDialogDocuments.open();
      }
    },
    handleSearchDocuments: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilters = new Filter([
        new Filter("Document", FilterOperator.Contains, sValue)
      ], false);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter(oFilters);
    },
    handleValueCloseDocuments: function (oEvent) {
      var aContexts = oEvent.getParameter("selectedContexts");
      var Documents = {};
      if (aContexts && aContexts.length) {
        Documents = aContexts.map(function (oContext) {
          var oDocuments = {};
          oDocuments.Document = oContext.getObject().Document;
          return oDocuments;
        });
      }
      oEvent.getSource().getBinding("items").filter([]);
      this.oModel.getData().ApprovalTemplates.Documents[this.iSelectedRow].Document = Documents[0].Document;
      this.oModel.refresh();

    },
    handleValueHelpTerms: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogTerms) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTemplateTerms",
          controller: this
        }).then(function (oValueHelpDialogTerms) {
          this._oValueHelpDialogTerms = oValueHelpDialogTerms;
          this.getView().addDependent(this._oValueHelpDialogTerms);
          this._oValueHelpDialogTerms.open();
        }.bind(this));
      } else {
        this._oValueHelpDialogTerms.open();
      }
    },
   
   
    
    handleSearchTerms: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilters = new Filter([
        new Filter("Term", FilterOperator.Contains, sValue)
      ], false);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter(oFilters);
    },
    handleValueCloseTerms: function (oEvent) {
      var aContexts = oEvent.getParameter("selectedContexts");
      var Terms = {};
      if (aContexts && aContexts.length) {
        Terms = aContexts.map(function (oContext) {
          var oTerms = {};
          oTerms.Term = oContext.getObject().Term;
          return oTerms;
        });
      }
      oEvent.getSource().getBinding("items").filter([]);
      this.oModel.getData().ApprovalTemplates.Terms[this.iSelectedRow].Terms = Terms[0].Term;
      this.oModel.refresh();

      oTerm = Terms[0].Term
    },
    onClearData: function () {
      this.oModel.getData().ApprovalTemplates.Name = "";
      this.oModel.getData().ApprovalTemplates.Description = "";
      this.oModel.getData().ApprovalTemplates.Status = "";
      this.oModel.getData().ApprovalTemplates.Originator = [];
      this.oModel.getData().ApprovalTemplates.Documents = [];
      this.oModel.getData().ApprovalTemplates.Stages = [];
      this.oModel.getData().ApprovalTemplates.Terms = [];
    },
    onLoadGL: function () {
      this.oModel.getData().GL = [];
      $.ajax({
        url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETGLACCOUNT",
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
        this.oModel.getData().GL = [];
        var i;
        for (i = 0; i < results.length; i++) {
          this.oModel.getData().GL.push({
            "AcctCode": results[i].AcctCode,
            "AcctName": results[i].AcctName
          });
        }
        this.oModel.refresh();
      });
    },
    onLoadSpecialist: function () {
      this.oModel.getData().Specialist = [];
      $.ajax({
        url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETSPECIALIST",
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
        var i;
        this.oModel.getData().Specialist = [];
        for (i = 0; i < results.length; i++) {
          this.oModel.getData().Specialist.push({
            "ItmsTypCod": results[i].ItmsTypCod,
            "ItmsGrpNam": results[i].ItmsGrpNam
          })
        }
        this.oModel.refresh();
      });
    },
    onLoadApprovalTemplateRecord: function () {
      this.openLoadingFragment();
      var sURL = "http://13.229.195.111:50000/b1s/v1/APP_APRTEMP('" + localStorage.getItem("TemplateName") + "')"
      $.ajax({
        url: sURL,
        type: "GET",
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          APPui5.APPMESSAGEBOX(Message);
        
        },
        success: function (json) {
         
        },
        context: this
      }).done(function (results) {
        this.oModel.getData().ApprovalTemplates.Name = results.Code;
        this.oModel.getData().ApprovalTemplates.Description = results.Name;
        this.oModel.getData().ApprovalTemplates.Status = results.U_APP_Status;
        this.getView().byId("status").setSelectedKey(results.U_APP_Status);

        this.onLoadUsers();
        for (var i = 0; i < results.APP_APRTEMPORIGCollection.length; i++) {
    
          var OriginName = results.APP_APRTEMPORIGCollection[i].U_APP_Originator;
          var storedUser = this.oModel.getData().Users;
          const sSRI = storedUser.filter(function(SSI){
          return SSI.UserCode == OriginName})
        
          this.oModel.getData().ApprovalTemplates.Originator.push({
            "Originator": results.APP_APRTEMPORIGCollection[i].U_APP_Originator,
            "Department": results.APP_APRTEMPORIGCollection[i].U_APP_Department,
            "Name": sSRI[0].Name
          });
        }

        for (var i = 0; i < results.APP_APRTEMPDOCCollection.length; i++) {
          var isFlag;
          if (results.APP_APRTEMPDOCCollection[i].U_APP_Flag === "true") {
            isFlag = true;
          }
          else {
            isFlag = false;
          }
          this.oModel.getData().ApprovalTemplates.Documents.push({
            "Document": results.APP_APRTEMPDOCCollection[i].U_APP_Document,
            "Flag": isFlag
          });
        }

        for (var i = 0; i < results.APP_APRTEMPSTGCollection.length; i++) {
          this.oModel.getData().ApprovalTemplates.Stages.push({
            "Level":results.APP_APRTEMPSTGCollection[i].U_APP_Level,
            "Stages": results.APP_APRTEMPSTGCollection[i].U_APP_Stages,
            "Description": results.APP_APRTEMPSTGCollection[i].U_APP_Description
          });

        }

        for (var i = 0; i < results.APP_APRTEMPTERMCollection.length; i++) {
          var oRatios = "";
          var termRatio = this.oModel.getData().Ratios;
          for(let r = 0;r < termRatio.length; r++){
            if(termRatio[r].Code === results.APP_APRTEMPTERMCollection[i].U_APP_Ratio){
              oRatios = termRatio[r].Name;
            }
          }
         
          this.oModel.getData().ApprovalTemplates.Terms.push({
            "Terms": results.APP_APRTEMPTERMCollection[i].U_APP_Terms,
            "Ratio": oRatios,
            "Value": results.APP_APRTEMPTERMCollection[i].U_APP_Value,
            "Value2":results.APP_APRTEMPTERMCollection[i].U_APP_Value2
          });
        }

        this.oModel.refresh();
      });
      this.closeLoadingFragment();
    },
    onUpdateRecord: function () {

      var ApprovalTemplateBody = {};
      ApprovalTemplateBody.Code = this.oModel.getData().ApprovalTemplates.Name;
      ApprovalTemplateBody.Name = this.oModel.getData().ApprovalTemplates.Description;
      ApprovalTemplateBody.U_APP_Status = this.oModel.getData().ApprovalTemplates.Status;
      ApprovalTemplateBody.APP_APRTEMPORIGCollection = [];
      ApprovalTemplateBody.APP_APRTEMPDOCCollection = [];
      ApprovalTemplateBody.APP_APRTEMPSTGCollection = [];
      ApprovalTemplateBody.APP_APRTEMPTERMCollection = [];

      for (var i = 0; i < this.oModel.getData().ApprovalTemplates.Originator.length; i++) {
        ApprovalTemplateBody.APP_APRTEMPORIGCollection.push({
          "U_APP_Originator": this.oModel.getData().ApprovalTemplates.Originator[i].Originator,
          "U_APP_Department":  this.oModel.getData().ApprovalTemplates.Originator[i].Department
        });
      }

      for (var i = 0; i < this.oModel.getData().ApprovalTemplates.Documents.length; i++) {
        ApprovalTemplateBody.APP_APRTEMPDOCCollection.push({
          "U_APP_Document": this.oModel.getData().ApprovalTemplates.Documents[i].Document,
          "U_APP_Flag": this.oModel.getData().ApprovalTemplates.Documents[i].Flag
        });
      }

      for (var i = 0; i < this.oModel.getData().ApprovalTemplates.Stages.length; i++) {
        ApprovalTemplateBody.APP_APRTEMPSTGCollection.push({
          "U_APP_Level":this.oModel.getData().ApprovalTemplates.Stages[i].Level,
          "U_APP_Stages": this.oModel.getData().ApprovalTemplates.Stages[i].Stages,
          "U_APP_Description": this.oModel.getData().ApprovalTemplates.Stages[i].Description
        })
      }

      for (var i = 0; i < this.oModel.getData().ApprovalTemplates.Terms.length; i++) {
        var oRatios = "";
        const result = this.oModel.getData().Ratios.find(({ Name }) => Name === this.oModel.getData().ApprovalTemplates.Terms[i].Ratio);
        oRatios = result.Code;

        if (oRatios==="BT"){
          if (this.oModel.getData().ApprovalTemplates.Terms[i].Value==="" || this.oModel.getData().ApprovalTemplates.Terms[i].Value2===""){
            APPui5.APPMESSAGEBOX("Must Fill both Value and Value2 in Line " + (i + 1) + "");
            return;
          }
        }
        else
        {
          if (this.oModel.getData().ApprovalTemplates.Terms[i].Terms==="Total Document"){

            if (this.oModel.getData().ApprovalTemplates.Terms[i].Value==="")
            {
              this.oModel.getData().ApprovalTemplates.Terms[i].Value=0;
            }

            if (this.oModel.getData().ApprovalTemplates.Terms[i].Value2==="")
            {
              this.oModel.getData().ApprovalTemplates.Terms[i].Value2=0;
            }
            
          }
        }

        ApprovalTemplateBody.APP_APRTEMPTERMCollection.push({
          "U_APP_Terms": this.oModel.getData().ApprovalTemplates.Terms[i].Terms,
          "U_APP_Ratio": oRatios,
          "U_APP_Value": this.oModel.getData().ApprovalTemplates.Terms[i].Value,
          "U_APP_Value2":this.oModel.getData().ApprovalTemplates.Terms[i].Value2
        })
      }



      $.ajax({
        url: "http://13.229.195.111:50000/b1s/v1/APP_APRTEMP('" + localStorage.getItem("TemplateName") + "')",
        data: JSON.stringify(ApprovalTemplateBody),
        headers: { "B1S-ReplaceCollectionsOnPatch": true },
        type: "PATCH",
        crossDomain: true,
        xhrFields: {
          withCredentials: true
        },
        error: function (xhr, status, error) {
          var Message = xhr.responseJSON["error"].message.value;
          APPui5.APPMESSAGEBOX(Message);
        },
        context: this,
        success: function (json) {
          APPui5.APPMESSAGEBOX("Approval Template " + this.oModel.getData().ApprovalTemplates.Name + " Succesfully Updated!")
          $( ".sapMMessageToast" ).addClass( "sapMMessageToastSuccess");
        }
      }).done(function (results) {
        this.onClearData();
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("ApprovalProcess");
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
        handleValueConditional: function(oEvent){
          var myInputControl = oEvent.getSource(); // e.g. the first item
          var boundData = myInputControl.getBindingContext('oModel').getObject();
          oTerm = boundData.Terms;
          var listpath = myInputControl.getBindingContext('oModel').getPath();
          var indexItem = listpath.split("/");
         
          oIndex =indexItem[3];
          oValueTerms = 1;
          if(oTerm == "Department"){
            if (!this._oValueHelpDialogDept) {
              Fragment.load({
                name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTermDepart",
                controller: this
              }).then(function (oValueHelpDialogDept) {
                this._oValueHelpDialogDept = oValueHelpDialogDept;
                this.getView().addDependent(this._oValueHelpDialogDept);
                this._oValueHelpDialogDept.open();
              }.bind(this));
            } else {
              this._oValueHelpDialogDept.open();
            }
          }else if(oTerm == "Specialist"){
            if (!this._oValueHelpDialogSpl) {
              Fragment.load({
                name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTermSpl",
                controller: this
              }).then(function (oValueHelpDialogSpl) {
                this._oValueHelpDialogSpl = oValueHelpDialogSpl;
                this.getView().addDependent(this._oValueHelpDialogSpl);
                this._oValueHelpDialogSpl.open();
                this.onLoadSpecialist();
              }.bind(this));
            } else {
              this._oValueHelpDialogSpl.open();
              this.onLoadSpecialist();
            }
          }else if(oTerm == "GL Account"){
            if (!this._oValueHelpDialogGL) {
              Fragment.load({
                name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTermGL",
                controller: this
              }).then(function (oValueHelpDialogGL) {
                this._oValueHelpDialogGL = oValueHelpDialogGL;
                this.getView().addDependent(this._oValueHelpDialogGL);
                this._oValueHelpDialogGL.open();
                this.onLoadGL();
              }.bind(this));
            } else {
              this._oValueHelpDialogGL.open();
              this.onLoadGL();
            }       
          }else if(oTerm == "Depository"){
            if (!this._oValueHelpDialogFund) {
              Fragment.load({
                name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTermDim",
                controller: this
              }).then(function (oValueHelpDialogFund) {
                this._oValueHelpDialogFund = oValueHelpDialogFund;
                this.getView().addDependent(this._oValueHelpDialogFund);
                this._oValueHelpDialogFund.open();
                this.OnRefundTerm();
              }.bind(this));
            } else {
              this._oValueHelpDialogFund.open();
              this.OnRefundTerm();
            }       
          }
        },
    
        handleValueConditional2: function(oEvent){
          var myInputControl = oEvent.getSource(); // e.g. the first item
          var boundData = myInputControl.getBindingContext('oModel').getObject();
          oTerm = boundData.Terms;
          var listpath = myInputControl.getBindingContext('oModel').getPath();
          var indexItem = listpath.split("/");
         
          oIndex =indexItem[3];
          oValueTerms = 2;
          if(oTerm == "Department"){
            if (!this._oValueHelpDialogDept) {
              Fragment.load({
                name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTermDepart",
                controller: this
              }).then(function (oValueHelpDialogDept) {
                this._oValueHelpDialogDept = oValueHelpDialogDept;
                this.getView().addDependent(this._oValueHelpDialogDept);
                this._oValueHelpDialogDept.open();
              }.bind(this));
            } else {
              this._oValueHelpDialogDept.open();
            }
          }else if(oTerm == "Specialist"){
            if (!this._oValueHelpDialogSpl) {
              Fragment.load({
                name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTermSpl",
                controller: this
              }).then(function (oValueHelpDialogSpl) {
                this._oValueHelpDialogSpl = oValueHelpDialogSpl;
                this.getView().addDependent(this._oValueHelpDialogSpl);
                this._oValueHelpDialogSpl.open();
                this.onLoadSpecialist();
              }.bind(this));
            } else {
              this._oValueHelpDialogSpl.open();
              this.onLoadSpecialist();
            }
          }else if(oTerm == "GL Account"){
            if (!this._oValueHelpDialogGL) {
              Fragment.load({
                name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTermGL",
                controller: this
              }).then(function (oValueHelpDialogGL) {
                this._oValueHelpDialogGL = oValueHelpDialogGL;
                this.getView().addDependent(this._oValueHelpDialogGL);
                this._oValueHelpDialogGL.open();
                this.onLoadGL();
              }.bind(this));
            } else {
              this._oValueHelpDialogGL.open();
              this.onLoadGL();
            }       
          }else if(oTerm == "Depository"){
            if (!this._oValueHelpDialogFund) {
              Fragment.load({
                name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTermDim",
                controller: this
              }).then(function (oValueHelpDialogFund) {
                this._oValueHelpDialogFund = oValueHelpDialogFund;
                this.getView().addDependent(this._oValueHelpDialogFund);
                this._oValueHelpDialogFund.open();
                this.OnRefundTerm();
              }.bind(this));
            } else {
              this._oValueHelpDialogFund.open();
              this.OnRefundTerm();
            }       
          }
        },
    
        handleValueCloseCondition: function (oEvent) {
          var aContexts = oEvent.getParameter("selectedContexts");
         
          var Terms = {};
          if (aContexts && aContexts.length) {
            Terms = aContexts.map(function (oContext) {
              var oTerms = {};
              if(oTerm == "Department"){
                oTerms.Term = oContext.getObject().PrcCode;
              }else if(oTerm == "Specialist"){
                oTerms.Term = oContext.getObject().ItmsGrpNam;
              }else if(oTerm == "GL Account"){
                oTerms.Term = oContext.getObject().AcctCode;
              }else if(oTerm == "Depository"){
                oTerms.Term = oContext.getObject().PrcCode;
              }
              return oTerms;
            });
          }

          oEvent.getSource().getBinding("items").filter([]);
          if(oValueTerms === 1){
            this.oModel.getData().ApprovalTemplates.Terms[oIndex].Value = Terms[0].Term;
          }else{
            this.oModel.getData().ApprovalTemplates.Terms[oIndex].Value2 = Terms[0].Term;
          }
          this.oModel.refresh();
        },

        onDialogClose: function (oEvent) {
          var aContexts = oEvent.getParameter("selectedContexts");
          if (aContexts && aContexts.length) {
            // MessageToast.show("You have chosen " + 
            if(oValueTerms === 1){
              this.oModel.getData().ApprovalTemplates.Terms[oIndex].Value = aContexts.map(function (oContext) { return "'" + oContext.getObject().PrcCode + "'"; }).join(", ");
            }else{
              this.oModel.getData().ApprovalTemplates.Terms[oIndex].Value2 = aContexts.map(function (oContext) { return oContext.getObject().PrcCode; }).join(", ");
            }
          } else {
            MessageToast.show("No new item was selected.");
          }
          oEvent.getSource().getBinding("items").filter([]);
          this.oModel.refresh();
        },
  });
});
