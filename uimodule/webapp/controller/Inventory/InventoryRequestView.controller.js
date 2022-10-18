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
], function (jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast, APPui5,Filter,FilterOperator) {
	"use strict";
	return Controller.extend("com.apptech.DLSL.controller.Inventory.InventoryRequestView", {
		onBeforeRendering: function () {
			console.log('Sample')
		},
		onInit: function () {
			this.oModel = new JSONModel("model/inventoryrequest.json");
			this.getView().setModel(this.oModel, "oModel");
			this.router = this.getOwnerComponent().getRouter();
			//this.createTables(); //JPJ20210621 Add Tables
			this.iSelectedRow = 0;
            this.DocNum=0;
            this.DepartmenName="";
            this.UserName="";
            var Router=sap.ui.core.UIComponent.getRouterFor(this);
            Router.getRoute("InventoryRequestView").attachMatched(this._onRouterMatched,this);
		},
	
    onInquiryNav:function(){
      this.router.navTo("InventoryRequest");
      localStorage.setItem("PreviousPath","");
    },

		onLoadIVRecord: function () {
			$.ajax({
				url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDOCENTRY&VALUE1=" + this.DocNum + "&VALUE=APP_OIVR",
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
					url: "http://13.229.195.111:50000/b1s/v1/APP_OIVR(" + results[0].DocEntry + ")",
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
                    this.getDepartment(results.U_APP_Department);
                    this.getUser(results.U_APP_Requester);
				
					this.oModel.getData().InventoryRequest.No = results.DocNum;
					this.oModel.getData().InventoryRequest.RequestDate = results.U_APP_RequestDate;
					this.oModel.getData().InventoryRequest.RequiredDate = results.U_APP_RequiredDate;
					this.oModel.getData().InventoryRequest.RequesterCode = results.U_APP_Requester;
					this.oModel.getData().InventoryRequest.RequesterName = this.UserName;
					this.oModel.getData().InventoryRequest.DepartmentCode = results.U_APP_Department;
					this.oModel.getData().InventoryRequest.DepartmentName = this.DepartmentName;
					// this.getView().byId("position").setSelectedKey(results.U_APP_Position);
					this.oModel.getData().InventoryRequest.PositionCode = results.U_APP_Position;
					this.oModel.getData().InventoryRequest.Remarks = results.Remark;
					this.getView().byId("status").setSelectedKey(results.Status);
					this.oModel.getData().InventoryRequest.StatusCode = results.status;
					this.oModel.getData().InventoryRequest.JONum=results.U_APP_JONum;
					this.getFromAttachment(results.DocNum);
          			this.oModel.getData().InventoryRequest.Items = [];

					var i;
					for (i = 0; i < results.APP_IVR1Collection.length; i++) {
						this.oModel.getData().InventoryRequest.Items.push({
							"ItemCode": results.APP_IVR1Collection[i].U_APP_ItemCode,
							"Description": results.APP_IVR1Collection[i].U_APP_Description,
							"Type": results.APP_IVR1Collection[i].U_APP_Type,
							"GlAccount": results.APP_IVR1Collection[i].U_APP_GlAccount,
							"FundType": results.APP_IVR1Collection[i].U_APP_FundType,
							"Program": results.APP_IVR1Collection[i].U_APP_Program,
							"Department": results.APP_IVR1Collection[i].U_APP_Department,
							"Division": results.APP_IVR1Collection[i].U_APP_Division,
							"Employee": results.APP_IVR1Collection[i].U_APP_Employee,
							"Quantity": results.APP_IVR1Collection[i].U_APP_Quantity,
							"UOM": results.APP_IVR1Collection[i].U_APP_Uom,
							"EstUnitPrice": APPui5.toCommas(results.APP_IVR1Collection[i].U_APP_EstPrice),
							"EstAmount": APPui5.toCommas(results.APP_IVR1Collection[i].U_APP_EstAmt),
							"TaxCode": results.APP_IVR1Collection[i].U_APP_TaxCode,
							"Warehouse": results.APP_IVR1Collection[i].U_APP_Whse,
							"Notes": results.APP_IVR1Collection[i].U_APP_Notes
						});
					}
					this.oModel.refresh();

				});
			});

		},
        getDepartment:function(Department){
            $.ajax({
              url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDEPT&VALUE1="+ Department +"",
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
              url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETUSR&VALUE1="+ User +"",
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
            this.onLoadIVRecord();
        },
		onClearData: function () {
			this.oModel.getData().InventoryRequest.No = "";
			this.oModel.getData().InventoryRequest.RequesterCode = "";
			this.oModel.getData().InventoryRequest.RequesterName = "";
			this.oModel.getData().InventoryRequest.PositionCode = "";
			this.oModel.getData().InventoryRequest.PositionName = "";
			this.oModel.getData().InventoryRequest.DepartmentCode = "";
			this.oModel.getData().InventoryRequest.DepartmentName = "";
			this.oModel.getData().InventoryRequest.RequestDate = "";
			this.oModel.getData().InventoryRequest.RequiredDate = "";
			this.oModel.getData().InventoryRequest.StatusCode = "";
			this.oModel.getData().InventoryRequest.StatusName = "";
			this.oModel.getData().InventoryRequest.Remarks = "";
			this.oModel.getData().InventoryRequest.Items = [];
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

    OnCancelScreen: async function () {
      this.onClearData();
      var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("ApprovalDecision");
    },

    onViewAttachment: function(oEvent){
		this.iSelectedRow = oEvent.getSource().getParent().getIndex();
        window.open("http://13.229.195.111:50000/b1s/v1/Attachments2(" + this.oModel.getData().InventoryRequest.AttachmentEntry + ")/$value?filename='" + this.oModel.getData().Attachments[this.iSelectedRow].FileName + "." + this.oModel.getData().Attachments[this.iSelectedRow].FileExtension +  "'"); 
    },


    onPreview: function(){
			if (!this.oReportViewer) {
			  this.oReportViewer = sap.ui.xmlfragment("com.apptech.DLSL.view.fragments.ReportViewer",this);
			  this.getView().addDependent(this.oReportViewer);
			}
			
			this.oReportViewer.open();
		  
			var docentry = this.DocNum;
			// var objectId = "1470000113";
			var report = 'IR';
		  
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
				url: "http://13.229.195.111:50000/b1s/v1/U_APP_ATCH?$filter=U_DocEntry eq '" +  DocEntry + "'",
				type: "GET",
				async: "false",
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
				this.oModel.getData().Attachments = results.value;
				this.oModel.refresh();
			});
		}catch (e){
			console.log(e)
		}
	},


	});
});
