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
	"sap/m/MessageBox"	
], function (jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast, APPui5, Filter, FilterOperator,MessageBox) {
	"use strict";
	var sType;
	return Controller.extend("com.apptech.DLSL.controller.Approval.ApprovalSubstitute", {
		onInit: function(){
			this.oModel = new JSONModel("model/data.json");
			this.getView().setModel(this.oModel, "oModel");
			// this.openLoadingFragment();
			this.iSelectedRow = 0;
			this.DocEntry = -1;
			this.Status="";
			this.oModel.getData().ApprovalSubstutute = [];
			var that = this;
			var oView = this.getView();
			  oView.addEventDelegate({
				  onAfterHide: function(evt) {
					  //This event is fired every time when the NavContainer has made this child control invisible.
				  },
				  onAfterShow: function(evt) {
					  //This event is fired every time when the NavContainer has made this child control visible.
					  oView.getController().onLoadRecord();
					  oView.getController().onLoadAuthorizer();
					  oView.getController().onLoadApprovalTemplateRecords();
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
			APPui5.openLoadingFragment();
		  },

		  OnAddRow: function () {
			this.oModel.getData().ApprovalSubstutute.push({
				"Code":  APPui5.setUDFID(new Date()),
				"Authorizer": "",
				"AuthorizerName": "",
				"SubAuthorizer": "",
				"SubAuthorizerName": "",
				"DateFrom": APPui5.getDateFormat(new Date()),
				"DateTo": APPui5.getDateFormat(new Date()),
        		"TemplateName": "",
				"TempDescription": "",
				"Flag": true,
				"Action": "No",
				"Status": "O"
			});
    // }
			this.oModel.refresh();
		},


		onLoadRecord:function(){
			APPui5.openLoadingFragment();
			this.oModel.getData().ApprovalSubstutute = [];
			$.ajax({
			  url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_SUBSTITUTE",
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
			  for (var i=0; i < results.length; i++) {
				this.oModel.getData().ApprovalSubstutute.push({
					"Authorizer": results[i].U_Authorizer,
					"AuthorizerName": results[i].AuthorizerName,
					"SubAuthorizer": results[i].U_SubAuthorizer,
					"SubAuthorizerName": results[i].SubAuthorizerName,
					"DateFrom": APPui5.getDateFormat(results[i].U_DateFrom),
					"DateTo": APPui5.getDateFormat(results[i].U_DateTo),
					"TemplateName": results[i].U_TemplateName,
					"TempDescription": results[i].TempDescription,
					"Flag": results[i].U_Active,
					"Status": "C"
				});
			  }
			 
			});
			this.oModel.refresh();
			APPui5.closeLoadingFragment();
		},

		onLoadAuthorizer: function(){
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
			  for (var i=0; i < results.length; i++) {
				this.oModel.getData().Users.push({
				  "UserName": results[i].Code,
				  "UserCode": results[i].Name
				});
			  }
			  this.oModel.refresh();
			});
		},

		handleAuthorizer: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			sType = "false";
			if (!this._oValueHelpDialogUsers) {
			  Fragment.load({
				name: "com.apptech.DLSL.view.fragments.Approval.Authorizer",
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

		  handleSubAuthorizer: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			sType = "true";
			if (!this._oValueHelpDialogUsers) {
			  Fragment.load({
				name: "com.apptech.DLSL.view.fragments.Approval.Authorizer",
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
 
		handleSearchAuthorizer: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
			  new Filter("UserCode", FilterOperator.Contains, sValue),
			  new Filter("UserName", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		  },

		handleValueCloseAuthorizer: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var Users = {};
			if (aContexts && aContexts.length) {
			  Users = aContexts.map(function (oContext) {
				var oUsers = {};
				oUsers.UserCode = oContext.getObject().UserCode;
				oUsers.UserName = oContext.getObject().UserName;
				return oUsers;
			  });
			}
	  
			oEvent.getSource().getBinding("items").filter([]);
			
			if(sType !== "true"){
				this.oModel.getData().ApprovalSubstutute[this.iSelectedRow].Authorizer = Users[0].UserName;
				this.oModel.getData().ApprovalSubstutute[this.iSelectedRow].AuthorizerName = Users[0].UserCode;
			}else{
				this.oModel.getData().ApprovalSubstutute[this.iSelectedRow].SubAuthorizer = Users[0].UserName;
				this.oModel.getData().ApprovalSubstutute[this.iSelectedRow].SubAuthorizerName = Users[0].UserCode;	
			}
			
			this.oModel.refresh();
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
                APPui5.APPMESSAGEBOX(Message);
              },
              success: function (json) {
              },
              context: this
            }).done(function (results) {
              this.oModel.getData().ApprovalTemplates = [];

			  this.oModel.getData().ApprovalTemplates.push({
				"Name":"All",
				"Description":"All"
			  })

              for (var i = 0; i < results.length; i++) {
				if(results[i].U_APP_Status == "Active"){
					this.oModel.getData().ApprovalTemplates.push({
						"Name":results[i].Code,
						"Description":results[i].Name
					   });
				}
              }
			  this.oModel.refresh();
            });
              APPui5.closeLoadingFragment(); 
        },
		
		handleTemplate: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
		
			if (!this._oValueHelpDialogTemp) {
			  Fragment.load({
				name: "com.apptech.DLSL.view.fragments.Approval.ApprovalTemplate",
				controller: this
			  }).then(function (oValueHelpDialogTemp) {
				this._oValueHelpDialogTemp = oValueHelpDialogTemp;
				this.getView().addDependent(this._oValueHelpDialogTemp);
				this._oValueHelpDialogTemp.open();
			  }.bind(this));
			} else {
			  this._oValueHelpDialogTemp.open();
			}
		  },

		handleSearchTemplate: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
			  new Filter("Name", FilterOperator.Contains, sValue),
			  new Filter("Description", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		  },

		handleValueCloseTemplate: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var Temp = {};
			if (aContexts && aContexts.length) {
				Temp = aContexts.map(function (oContext) {
				var oTemps = {};
				oTemps.Description = oContext.getObject().Description;
				oTemps.Name = oContext.getObject().Name;
				return oTemps;
			  });
			}
	
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().ApprovalSubstutute[this.iSelectedRow].TemplateName = Temp[0].Name;
			this.oModel.getData().ApprovalSubstutute[this.iSelectedRow].TempDescription = Temp[0].Description;
			this.oModel.refresh();
		  },

		onAdd: function(){

			var NewRecord = this.oModel.getData().ApprovalSubstutute;
			const OAPS = NewRecord.filter(function(APS){
			return APS.Status == "O"})

			var oBody = {};
			if(OAPS.length != 0){
				for(var i = 0;i < OAPS.length;i++){
					oBody.Code = OAPS[i].Code;
					oBody.Name = OAPS[i].Code;
					oBody.U_Authorizer= OAPS[i].Authorizer;
					oBody.U_SubAuthorizer= OAPS[i].SubAuthorizer;
					oBody.U_DateFrom= OAPS[i].DateFrom;
					oBody.U_DateTo= OAPS[i].DateTo;
					oBody.U_TemplateName= OAPS[i].TemplateName;
					oBody.U_Active= OAPS[i].Action;
					
				console.log(oBody)			
				$.ajax({
				url: "http://13.229.195.111:50000/b1s/v1/U_APP_OAST",
				data: JSON.stringify(oBody),
				type: "POST",
				crossDomain: true,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;
					APPui5.APPMESSAGEBOX(Message);
				},
				context: this,
				success: async function (json) {}
				}).done(function (results) {
				
				});
			}
			}
		},
	});
});
