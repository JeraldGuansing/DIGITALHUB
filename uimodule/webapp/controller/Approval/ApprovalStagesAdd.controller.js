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
], function(jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast,Filter,FilterOperator,APPui5) {
"use strict";
  
	return Controller.extend("com.apptech.DLSL.controller.Approval.ApprovalStagesAdd", {
  
        onBeforeRendering: function(){   
        },
        onInit: function () {
            this.oModel=new JSONModel("model/approvalstages.json");
            this.getView().setModel(this.oModel,"oModel");  
            this.iSelectDialogIndex=0;       
            // this.onLoadDept();
            // this.router=this.getOwnerComponent().getRouter();
        },
        OnBack:async function(){
            var prompt = await APPui5.onPrompt("WARNING MESSAGE!", "Are you sure you want to go back without adding/updating the document?");
            if (prompt === 0) {
              return;
            }
            this.onClear();
            var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("ApprovalProcess");
        },
        onLoadUsers: function () {
          this.oModel.getData().Users = [];
          $.ajax({
            url: "http://13.229.195.111:4300/app-xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETUSERS",
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
                "Department":results[i].Department,
                "Name": results[i].Name
              });
            }
            this.oModel.refresh();
          });
        },
        onLoadDept: function(){
          this.oModel.getData().Department=[];
            $.ajax({
                url:"http://13.229.195.111:50000/b1s/v1/Departments",
                type:"GET",
                crossDomain:true,
                xhrFields:{
                    withCredentials:true
                },
                error:function(xhr,status,error){        
                    var Message = xhr.responseJSON["error"].message.value;			
					APPui5.APPMESSAGEBOX(Message);
                },
                success:function(json){        
                },
                context:this
            }).done(function(results){
              var i;
              for(i=0;i< results.value.length;i++){
                  this.oModel.getData().Department.push({
                      "Code":results.value[i].Code,
                      "Name":results.value[i].Name
                  })      
              }
              this.oModel.refresh();
            });
        },
        handleValueHelpUsers:function(oEvent){
            this.iSelectedRow = oEvent.getSource().getParent().getIndex();
            if (!this._oValueHelpDialogUsers) {
              Fragment.load({
                name: "com.apptech.DLSL.view.fragments.Approval.ApprovalStageUsers",
                controller: this
              }).then(function (oValueHelpDialogUsers) {
                this._oValueHelpDialogUsers = oValueHelpDialogUsers;
                this.getView().addDependent(this._oValueHelpDialogUsers);
                this._oValueHelpDialogUsers.open();
                this.onLoadUsers();
              }.bind(this));
            } else {
              this._oValueHelpDialogUsers.open();
              this.onLoadUsers();
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
                  oUsers.Name = oContext.getObject().Name;
                  return oUsers;
              });
            }
            oEvent.getSource().getBinding("items").filter([]);
            this.oModel.getData().ApprovalStages.Items[this.iSelectedRow].Authorizer = Users[0].UserCode;
            this.oModel.getData().ApprovalStages.Items[this.iSelectedRow].AuthorizerName = Users[0].UserName;
            this.oModel.getData().ApprovalStages.Items[this.iSelectedRow].Department = Users[0].Department;
            this.oModel.getData().ApprovalStages.Items[this.iSelectedRow].Name = Users[0].Name;
            this.oModel.refresh();

          },
          OnAddRow:function(){
            this.oModel.getData().ApprovalStages.Items.push({
                "Authorizer":"",
                "AuthorizerName": "",
                "Department":"",
                "Name": ""
            })    
            this.oModel.refresh();
          },
          OnDeleteRow:function(){
            this.tblItems= this.getView().byId("ApprovalStagesTBL");         
            this.oModel.getData().ApprovalStages.Items.splice(this.tblItems.getSelectedIndex(),1);
            this.oModel.refresh();
          },
          onClear:function(){
            this.oModel.getData().ApprovalStages.StageName="";
            this.oModel.getData().ApprovalStages.Description="";
            this.oModel.getData().ApprovalStages.Items=[];
            this.oModel.refresh();
          },
          onAddRecord:function(){
            var ApprovalStagesBody={};
            ApprovalStagesBody.Code=this.oModel.getData().ApprovalStages.StageName;
            ApprovalStagesBody.Name=this.oModel.getData().ApprovalStages.Description;
            ApprovalStagesBody.APP_APRSTGDETCollection=[];

            for(var i=0;i<this.oModel.getData().ApprovalStages.Items.length;i++){
             
              ApprovalStagesBody.APP_APRSTGDETCollection.push({
                "U_APP_Authorizer":this.oModel.getData().ApprovalStages.Items[i].Authorizer,
                "U_APP_Department":this.oModel.getData().ApprovalStages.Items[i].Department
              });
            }

            $.ajax({
              url: "http://13.229.195.111:50000/b1s/v1/APP_APRSTG",
              data: JSON.stringify(ApprovalStagesBody),
              type: "POST",
              crossDomain: true,
              xhrFields: {
                  withCredentials: true
              },
              error: function (xhr, status, error) {
                  var Message = xhr.responseJSON["error"].message.value;			
                  APPui5.APPMESSAGEBOX(Message);
              },
              context:this,
              success: function (json) {
                
                APPui5.APPMESSAGEBOX("Approval Stage " + this.oModel.getData().ApprovalStages.StageName + " Succesfully Added!")
              }
            }).done(function (results) {
              if (results) {
                this.onClear();
                var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("ApprovalProcess");
              }
           });
         
          }


	
	});
});
  