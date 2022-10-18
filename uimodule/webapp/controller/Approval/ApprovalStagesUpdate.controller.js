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
  
	return Controller.extend("com.apptech.DLSL.controller.Approval.ApprovalStagesUpdate", {
    onInit: function(){
      this.oModel=new JSONModel("model/approvalstages.json");
      this.getView().setModel(this.oModel,"oModel");
      this.iSelectDialogIndex=0;   
      this.StageCode="";   
      var that = this;
	    var oView = this.getView();
        oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                oView.getController().onLoadApprovalStageRecord();          
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
            url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETUSERS",
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
                "Name":results[i].Name
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
            // var oCardCode=this.oModel.getData().DataRecord.CardCode;
            // if(oCardCode==="" || oCardCode===null || oCardCode===undefined){
            //   APPui5.APPMESSAGEBOX("Please Select Vendor");
            //   return;
            // }
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
                  oUsers.Department = oContext.getObject().Department;
                  oUsers.Name = oContext.getObject().Name;
                  return oUsers;
              });
            }

         try{
            oEvent.getSource().getBinding("items").filter([]);
              this.oModel.getData().ApprovalStages.Items[this.iSelectedRow].Authorizer = Users[0].UserCode;
              this.oModel.getData().ApprovalStages.Items[this.iSelectedRow].AuthorizerName = Users[0].UserName;
              this.oModel.getData().ApprovalStages.Items[this.iSelectedRow].Department = Users[0].Department;
              this.oModel.getData().ApprovalStages.Items[this.iSelectedRow].Name = Users[0].Name;
              this.oModel.refresh();
          }catch{

          }
          },
          OnAddRow:function(){
            this.oModel.getData().ApprovalStages.Items.push({
                "Authorizer":"",
                "AuthorizerName": "",
                "Department":"",
                "Name": "",

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
            this.oModel.getData().Items=[];
          },
          _onRouterMatched: function(oEvent){
           var oModelStage=this.getView().getModel("oModelStage");
           this.StageCode=oModelStage.getData().StageName;           
           this.onLoadApprovalStageRecord();
          },
          onLoadApprovalStageRecord:function(){
            $.ajax({
              url: "http://13.229.195.111:50000/b1s/v1/APP_APRSTG('"+  localStorage.getItem("StageCode") +"')",
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
              this.oModel.getData().ApprovalStages.StageName=results.Code;
              this.oModel.getData().ApprovalStages.Description=results.Name;
              this.oModel.getData().ApprovalStages.Items=[];
              this.onLoadUsers();
              for(var i=0;i<results.APP_APRSTGDETCollection.length;i++){
               
                var autCode = results.APP_APRSTGDETCollection[i].U_APP_Authorizer;
                var storedUser = this.oModel.getData().Users;
                const sSRI = storedUser.filter(function(SSI){
                return SSI.UserCode == autCode})
            
                this.oModel.getData().ApprovalStages.Items.push({
                  "Authorizer":results.APP_APRSTGDETCollection[i].U_APP_Authorizer,
                  "AuthorizerName": sSRI[0].UserName,
                  "Department": sSRI[0].Department,
                  "Name": sSRI[0].Name
                });
              }

              this.oModel.refresh();
            
            });

          },
          onUpdateRecord:function(){
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
              url: "http://13.229.195.111:50000/b1s/v1/APP_APRSTG('"+ localStorage.getItem("StageCode") +"')",
              data: JSON.stringify(ApprovalStagesBody),           
              headers:{"B1S-ReplaceCollectionsOnPatch":true},
              type: "PATCH",
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
                APPui5.APPMESSAGEBOX("Approval Stage " + this.StageCode + " Succesfully Updated!")
              }
            }).done(function (results) {   
                this.onClear();    
                var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("ApprovalProcess");   
            });
          }


  
	});

});
  