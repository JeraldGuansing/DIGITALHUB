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
], function(jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast,APPui5,Filter,FilterOperator) {
"use strict";
  
	return Controller.extend("com.apptech.DLSL.controller.Approval.ApprovalProcess", {
    onInit: function(){
      this.oModel=new JSONModel("model/approvalprocess.json");
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
                // oView.getController().clearSelection();
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
      this.openLoadingFragment();
      this.oModel.refresh();
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
        OpenAddScreen:function(){
            var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("ApprovalStagesAdd");
        },
        OpenUpdateScreen:function(){
          this.oTable = this.getView().byId("approvalstages");
          var iIndex = this.oTable.getSelectedIndex();

          var oRowSelected = this.oTable.getBinding().getModel().getData().ApprovalStages[this.oTable.getBinding().aIndices[iIndex]];
          
           var StageCode= oRowSelected.StageName;
           localStorage.setItem("StageCode",StageCode);
           var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
           oRouter.navTo("ApprovalStagesUpdate");
        },
        OnDelete:function(){
          $.ajax({
            url: "http://13.229.195.111:50000/b1s/v1/APP_APRSTG('"+ this.oModel.getData().ApprovalStages[this.getView().byId("approvalstages").getSelectedIndex()].StageName +"')",
            type: "DELETE",
            crossDomain: true,
            xhrFields: {
              withCredentials: true
            },
            error: function (xhr, status, error) {
              var Message = xhr.responseJSON["error"].message.value;
              APPui5.APPMESSAGEBOX(Message);
              return
            },
            success:async function (json) {
              this.onLoadApprovalStagesRecords();
            },
            context: this
          }).done(function (results) {
          });
          this.closeLoadingFragment();
        },
        OpenAddTemplateScreen:function(){
          var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
           oRouter.navTo("ApprovalTemplateAdd");
        },
        
        OpenModifyTemplateScreen:function(oEvent){
          this.oTable = this.getView().byId("approvaltemplates");
          var iIndex = this.oTable.getSelectedIndex();
          var Name = this.oTable.getBinding().getModel().getData().ApprovalTemplates[this.oTable.getBinding().aIndices[iIndex]].Name;
          localStorage.setItem("TemplateName",Name);
          var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("ApprovalTemplateUpdate");
        },

        CreateReqTables:function(){
            APPui5.createTable("APP_APRSTG","Approval Stages","bott_MasterData");
            APPui5.createTable("APP_APRSTGDET","Approval Stages Details","bott_MasterDataLines");
            APPui5.createField("APP_Authorizer","Authorizer","@APP_APRSTGDET","db_Alpha",100);
            APPui5.createField("APP_Department","Department","@APP_APRSTGDET","db_Alpha",100);
            APPui5.createTable("APP_APRTEMP","Approval Template","bott_MasterData");
            APPui5.createField("APP_Status","Status","@APP_APRTEMP","db_Alpha",20);
            APPui5.createTable("APP_APRTEMPORIG","Originators","bott_MasterDataLines");
            APPui5.createField("APP_Originator","Originator","@APP_APRTEMPORIG","db_Alpha",50);
            APPui5.createField("APP_Department","Department","@APP_APRTEMPORIG","db_Alpha",50);
            APPui5.createTable("APP_APRTEMPDOC","Documents","bott_MasterDataLines");
            APPui5.createField("APP_Document","Document","@APP_APRTEMPDOC","db_Alpha",100);
            APPui5.createField("APP_Flag","Flag","@APP_APRTEMPDOC","db_Alpha",20);
            APPui5.createTable("APP_APRTEMPSTG","Stages","bott_MasterDataLines");
            APPui5.createField("APP_Level","Level","@APP_APRTEMPSTG","db_Alpha",50);
            APPui5.createField("APP_Stages","Stage","@APP_APRTEMPSTG","db_Alpha",50);
            APPui5.createField("APP_Description","Description","@APP_APRTEMPSTG","db_Alpha",100);
            APPui5.createTable("APP_APRTEMPTERM","Terms","bott_MasterDataLines");
            APPui5.createField("APP_Terms","Term","@APP_APRTEMPTERM","db_Alpha",50);
            APPui5.createField("APP_Ratio","Ratio","@APP_APRTEMPTERM","db_Alpha",50);
            APPui5.createField("APP_Value","Value","@APP_APRTEMPTERM","db_Alpha",50);
            APPui5.createField("APP_Value2","Value 2","@APP_APRTEMPTERM","db_Alpha",50);
        },

        onLoadApprovalStagesRecords: function(){
            this.oModel.getData().ApprovalStages = [];
            $.ajax({
              url: "http://13.229.195.111:4300/app-xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETRECORDS&VALUE1=APP_APRSTG",
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
                this.oModel.getData().ApprovalStages.push({
                 "StageName":results[i].Code,
                 "Description":results[i].Name

                });       
                this.oModel.refresh();
              }
            });
        },
        onLoadApprovalTemplateRecords: function(){
            this.getView().byId("TermsID").setValue("");
            this.oModel.getData().ApprovalTemplates = [];
            $.ajax({
              url: "http://13.229.195.111:4300/app-xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETRECORDS&VALUE1=APP_APRTEMP",
              type: "GET",
              async: false,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
              },
              error: function (xhr, status, error) {
                this.closeLoadingFragment(); 
                var Message = xhr.responseJSON["error"].message.value;
                APPui5.APPMESSAGEBOX(Message);
              },
              success: function (json) {
              },
              context: this
            }).done(function (results) {
              var i;
              this.oModel.getData().ApprovalTemplates = [];
              for (i = 0; i < results.length; i++) {
                this.oModel.getData().ApprovalTemplates.push({
                 "Name":results[i].Code,
                 "Description":results[i].Name,
                 "Status":results[i].U_APP_Status
                });
                this.oModel.refresh();
              }
            });
              this.closeLoadingFragment(); 
        },


        onSerachTerm: function(){
          if(this.getView().byId("TermsID").getValue() !== ""){
            this.onSearchApprovalTemplateRecords();
          }else{
            this.onLoadApprovalTemplateRecords();
          }
        },

        onSearchApprovalTemplateRecords: function(){
          try{
          this.oModel.getData().ApprovalTemplates = [];
          this.oModel.refresh();
          $.ajax({
            url: "http://13.229.195.111:4300/app-xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=spApp_SearchRecords&VALUE1=APP_APRTEMP&VALUE2=" +  this.getView().byId("TermsID").getValue(),
            type: "GET",
            async: false,
            beforeSend: function (xhr) {
              xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
            },
            error: function (xhr, status, error) {
              this.closeLoadingFragment(); 
              var Message = xhr.responseJSON["error"].message.value;
              APPui5.APPMESSAGEBOX(Message);
            },
            success: function (json) {
            },
            context: this
          }).done(function (results) {
            var i;
            this.oModel.getData().ApprovalTemplates = [];
            for (i = 0; i < results.length; i++) {
              this.oModel.getData().ApprovalTemplates.push({
               "Name":results[i].Code,
               "Description":results[i].Name,
               "Status":results[i].U_APP_Status
              });
              this.oModel.refresh();
            }
          });
            this.closeLoadingFragment(); 
          }catch (e) {
            console.log(e)
            APPui5.APPMESSAGEBOX(e,{duration: 500000});
          }
      },

        OnSearchAprStg:function(oEvent){
          var sQuery = oEvent.getParameter("query");
          this.AprStgFilter = null;
    
          if (sQuery) {
            this.AprStgFilter = new Filter([
              new Filter("StageName", FilterOperator.Contains, sQuery),
              new Filter("Description", FilterOperator.Contains, sQuery)
            ], false);
          }
    
          this._AprStgFilter();
        },
        _AprStgFilter : function() {
          var oFilter = null;
    
          if (this.AprStgFilter) {
            oFilter = this.AprStgFilter;
          }
    
          this.byId("approvalstages").getBinding("rows").filter(oFilter, "Application");
        },
        OnSearchAprTemp:function(oEvent){
          var sQuery = oEvent.getParameter("query");
          this.AprTempFilter = null;
    
          if (sQuery) {
            this.AprTempFilter = new Filter([
              new Filter("Name", FilterOperator.Contains, sQuery),
              new Filter("Description", FilterOperator.Contains, sQuery)
            ], false);
          }
    
          this._AprTempFilter();
        },
        _AprTempFilter : function() {
          var oFilter = null;
    
          if (this.AprTempFilter) {
            oFilter = this.AprTempFilter;
          }
          this.byId("approvaltemplates").getBinding("rows").filter(oFilter, "Application");
        },
        onSelectionChange: function(oEvent) {
          var oYourTable = this.getView().byId("approvaltemplates"),
          iSelectedIndex = oEvent.getSource().getSelectedIndex();
          oYourTable.setSelectedIndex(iSelectedIndex);
        },
        onSelectionChange1: function(oEvent) {
          var oYourTable = this.getView().byId("approvalstages"),
          iSelectedIndex = oEvent.getSource().getSelectedIndex();
          oYourTable.setSelectedIndex(iSelectedIndex);
         
        },

        handleClose: function (oEvent) {
          // reset the filter
          // var oBinding = oEvent.getSource().getBinding("items");
          // oBinding.filter([]);
          this.oModel.getData().ApprovalTemplates = [];
          var aContexts = oEvent.getParameter("selectedContexts");
      
          if (aContexts && aContexts.length) {
            var spat = aContexts[0].sPath;
            var splitITEM = spat.split("/");
            indx = splitITEM[2];
            
            // var podlist = this.oModel.getData().ProductionList;
            // docNUM = podlist[indx].DocEntry;
            console.log(splitITEM)
           
          }
      
        },
	});
});
  