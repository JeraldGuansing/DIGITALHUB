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
  var oInvStatus;
  var oDocNum;
  var OTCH = [];
  var oSelectedDept;
  var oSelectedDepo;
  var iKey; 
	return Controller.extend("com.apptech.DLSL.controller.Inventory.InventoryRequest", {
		onBeforeRendering: async function () {
			document.body.style.zoom = "90%" 
			await this.OnLoadDept();
			await this.OnLoadUsers();
			await this.onLoadPositions();
			await this.onLoadItems();
			await this.onLoadGL();
			await this.onLoadDimensions();
			await this.onLoadUOM();
			await this.onLoadTaxCodes();
			await this.onLoadWhse();
			await this.onLoadGIType();
      		await this.OnLoadUserDept();
			await this.OnLoadRecords();
			// await this.getFromAttachment();
		},
		onInit: function () {
			this.oModel = new JSONModel("model/inventoryrequest.json");
			this.getView().setModel(this.oModel, "oModel");
			this.router = this.getOwnerComponent().getRouter();
			//this.createTables(); //JPJ20210621 Add Tables
      
			this.iSelectedRow = 0;
			this.FileKey;
			this.onHideDetails();
			this._oPriceFilter = null;
			this.DocNum=0;
			var Router=sap.ui.core.UIComponent.getRouterFor(this);
			Router.getRoute("InventoryRequest").attachMatched(this._onRouterMatched,this);
      // this.getView().byId("position").setEditable(false);
		},
		OpenAddScreen: function () {
			this.onClearData();
			oSelectedDept = "";
			oSelectedDepo = "";

			this.oModel.getData().Controls.AddOrEdit = "Add Inventory Request";
      		this.onLoadItems();
			this.getView().byId("IVNo").setEditable(false);
			this.getView().byId("status").setEditable(false);
			this.getView().byId("CancelBtn").setEnabled(false);
			this.getView().byId("AddrowID").setEnabled(true);
			this.getView().byId("DelRowID").setEnabled(true);
			
			this.getView().byId("fileUploader1").setEnabled(true);
			this.getView().byId("status").setSelectedKey("O");
			// this.getNextNumber();
			this.oModel.getData().Attachments = "";
			localStorage.setItem("AttcEntry", "");
      		this.getView().byId("IVNo").setValue(this.oModel.getData().InventoryRequest.No);
			this.oModel.getData().InventoryRequest.RequestDate = APPui5.getDatePostingFormat(new Date());
			this.oModel.getData().InventoryRequest.RequesterCode = jQuery.sap.storage.Storage.get("userCode");
			this.onChangeUser(jQuery.sap.storage.Storage.get("userCode"));
			this.oModel.getData().isEnabled = true;

			this.oModel.getData().InventoryRequest.DepartmentCode1 = "";
			this.oModel.getData().InventoryRequest.DepartmentName1 = "";
			this.oModel.getData().InventoryRequest.Division = "";
			this.oModel.getData().InventoryRequest.DivisionName = "";
			this.oModel.getData().InventoryRequest.FundType = "";

			this.OnAddRow();
			this.oModel.refresh();
		},

    _onRouterMatched:function(oEvent){
      try{
        var oModelDocNum=this.getView().getModel("oModelDocNum");
        this.DocNum=oModelDocNum.getData().DocNum;
        this.getView().byId("IVNo").setValue(this.DocNum);
        this.oModel.getData().isEnabled=false;           
        this.onLoadIVRecord();
      }catch (e){
        console.log(e)
      } 
    },


    onFindData: function(){
      this.OnLoadRecords();
      if(this.getView().byId("IVNo").setEditable(true)){
        this.onClearData();
        this.getView().byId("status").setEditable(false);
        this.getView().byId("CancelBtn").setEnabled(true);
        this.oModel.getData().Controls.AddOrEdit = "Update Inventory Request";
          this.handleValueHelpINV();      
      }else{
        this.OpenAddScreen();
      }
    },

    onChangeNumber: function(){
      if(this.getView().byId("IVNo").getValue() !== ""){
        this.OpenUpdateScreen();
      }
    },

    onViewAttachment: function(oEvent){
		var myInputControl = oEvent.getSource(); // e.g. the first item
		var boundData = myInputControl.getBindingContext('oModel').getObject();
      	window.open("https://13.215.36.201:50000/b1s/v1/Attachments2(" + boundData.Code + ")/$value");
    },

	OpenUpdateScreen: function () {
     		oInvStatus = ""
			this.getView().byId("fileUploader1").setValue("");
			this.onLoadIVRecord(this.getView().byId("IVNo").getValue());
			this.oModel.getData().Controls.AddOrEdit = "Update Inventory Request";
			this.oModel.refresh();
			this.getView().byId("IVNo").setEditable(true);
			this.getView().byId("status").setEditable(false);
			this.getView().byId("CancelBtn").setEnabled(true);

			this.getFromAttachment(this.getView().byId("IVNo").getValue());
			// this.OnLoadUsers();
			// var storedUser = this.oModel.getData().Users;
			// const sSRI = storedUser.filter(function(SSI){
			// return SSI.UserCode == localStorage.getItem("UserCode")})

					if (oInvStatus == "C") {
						this.getView().byId("CancelBtn").setEnabled(false);
						this.getView().byId("status").setValue("Closed");
						this.oModel.getData().isEnabled = false;
						this.getView().byId("AddrowID").setEnabled(false);
						this.getView().byId("DelRowID").setEnabled(false);
						this.getView().byId("fileUploader1").setEnabled(false);
						this.oModel.refresh();
					}else{
						this.getView().byId("AddrowID").setEnabled(true);
						this.getView().byId("DelRowID").setEnabled(true);
						this.getView().byId("fileUploader1").setEnabled(true);

						var oUrl = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_CHECKAPPROVAL&VALUE1=" + this.getView().byId("IVNo").getValue() + "&VALUE2=Inventory Request";
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
							},
							success: function (json) {
							},
							context: this
						}).done(function (results) {
							if (results.length === 0) {

								this.getView().byId("CancelBtn").setEnabled(true);
								// this.getView().byId("ApprovalBtn").setEnabled(false);
								this.oModel.getData().isEnabled = true;
								this.oModel.refresh();
							}
							else {

								this.getView().byId("CancelBtn").setEnabled(false);
								// this.getView().byId("ApprovalBtn").setEnabled(true);
								this.oModel.getData().isEnabled = false;
							
							}
						});
					}
			this.getView().byId("status").setValue("Open");
			this.oModel.refresh();
		},

    handleValueHelpINV: function (oEvent) {
			if (!this._oValueHelpDialogDept) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryNo",
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

    handleSearchINV: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("No", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},

    handleValueCloseINV: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var PMRecords = {};
			if (aContexts && aContexts.length) {
				PMRecords = aContexts.map(function (oContext) {
					var oRecords = {};
					oRecords.No = oContext.getObject().No;
					return oRecords;
				});
			}

			oEvent.getSource().getBinding("items").filter([]);
			this.getView().byId("IVNo").setValue(PMRecords[0].No);
			this.OpenUpdateScreen();
			this.oModel.refresh();
		},

    _filterI : function() {
			var oFilter = null;

			if (this._oGlobalFilter && this._oPriceFilter) {
				oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
			} else if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			} else if (this._oPriceFilter) {
				oFilter = this._oPriceFilter;
			}

			this.byId("IVTable").getBinding().filter(oFilter, "Application");
		},

		filterHeaderINV : function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;

			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("No", FilterOperator.Contains, sQuery),
					new Filter("Requester", FilterOperator.Contains, sQuery),
					new Filter("Status", FilterOperator.Contains, sQuery),
					new Filter("RequiredDate", FilterOperator.Contains, sQuery),
					new Filter("RequestDate", FilterOperator.Contains, sQuery),
					new Filter("Draft", FilterOperator.Contains, sQuery),
					new Filter("Department", FilterOperator.Contains, sQuery)
				], false);
			}

			this._filterI();
		},
  
  

    onSelectionChange: function(oEvent) {
      var oYourTable = this.getView().byId("IVTable"),
          iSelectedIndex = oEvent.getSource().getSelectedIndex();
  
      oYourTable.setSelectedIndex(iSelectedIndex);
    },
    onSelectionChange1: function(oEvent) {
      var oYourTable = this.getView().byId("InventoryRequestItems"),
          iSelectedIndex = oEvent.getSource().getSelectedIndex();
      oYourTable.setSelectedIndex(iSelectedIndex);
    },
    onChangeView: function(){
      if(this.getView().byId("detailsview").getIcon() == "sap-icon://hide"){
        this.getView().byId("detailsview").setIcon("sap-icon://show");
        this.onShowDetails();
      }else{
        this.getView().byId("detailsview").setIcon("sap-icon://hide");
        this.onHideDetails();
      }
    },

    onHideDetails: function(){
      this.getView().byId("InventoryRequestItems").getColumns()[13].setVisible(false);
      this.getView().byId("InventoryRequestItems").getColumns()[14].setVisible(false);
      this.getView().byId("InventoryRequestItems").getColumns()[15].setVisible(false);
     },

    onShowDetails: function(){
      this.getView().byId("InventoryRequestItems").getColumns()[13].setVisible(true);
      this.getView().byId("InventoryRequestItems").getColumns()[14].setVisible(true);
      this.getView().byId("InventoryRequestItems").getColumns()[15].setVisible(true);
      },
    
	handleAttachment: function (oEvent) {
			var aFiles = oEvent.getParameters().files;
			this.currentFile = aFiles[0];
			var FileName = this.getView().byId("fileUploader1").getValue();
			var form = new FormData();
			form.append("", this.currentFile, FileName);
			console.log(form)
			//Postinf Attachment in SAP
			$.ajax({
				url: "https://13.215.36.201:50000/b1s/v1/Attachments2",
				data: form,
				type: "POST",
				processData: false,
				mimeType: "multipart/form-data",
				contentType: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					this.getView().byId("fileUploader1").getValue();
					var ErrorMassage = xhr.responseJSON["error"].message.value;
					APPui5.APPMESSAGEBOX(ErrorMassage);
					return
				},
				context: this,
				success: function (json) { }
			}).done(function (results) {
				if (results) {
					var oResult = JSON.parse(results);
					this.FileKey = oResult.AbsoluteEntry;
					this.oModel.getData().InventoryRequest.AttachmentEntry=this.FileKey;
					this.PostOnATCH(oResult.AbsoluteEntry,FileName);
				
					OTCH.push({
						"Code":  oResult.AbsoluteEntry,
						"Name": oResult.AbsoluteEntry,
						"U_AttachmentDate": APPui5.getDateFormat(new Date()),
						"U_FileName": FileName,
						"U_FreeText": "",
						"U_DocEntry": "",
					});
					this.oModel.getData().Attachments = OTCH;
					this.oModel.refresh();
				}

			});

			
		},

		getAttachmentPath(AttachmentEntry){
			try{
				$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETATTACHMENT&VALUE1="+ AttachmentEntry +"",
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
				this.getView().byId("fileUploader").setValue(results[0].FileName);
				});
			}catch (e){
				console.log(e)
			}
		},
		

		PostOnATCH: function(AbsoluteEntry,FileName){
			var that = this;
			var oBody = {};
			oBody.Code = AbsoluteEntry,
			oBody.Name = AbsoluteEntry,
			oBody.U_AttachmentDate = APPui5.getDateFormat(new Date()),
			oBody.U_ObjType = "APP_OIVR",
			oBody.U_FileName = FileName,
			oBody.U_FreeText = "",
			oBody.U_DocEntry = ""
		
			$.ajax({
				url: "https://13.215.36.201:50000/b1s/v1/U_APP_ATCH",
				data: JSON.stringify(oBody),
				type: "POST",
				crossDomain: true,
				xhrFields: {
					withCredentials: true
				},
			error: function (xhr, status, error) {
					that.getView().byId("fileUploader1").getValue();
					var ErrorMassage = xhr.statusText;
					APPui5.APPMESSAGEBOX(ErrorMassage);
					return
				},
				context: this,
				success: function (json) { }
			}).done(function (results) {
				// that.getFromAttachment();
			});
			that.getView().byId("fileUploader1").setValue("");
		},
		OnCancelScreen: async function () {
			var prompt = await APPui5.onPrompt("WARNING MESSAGE!", "Are you sure you want to go back without adding/updating the document?");
			if (prompt === 0) {
				return;
			}
			
		},
		OnAddRow: function () {
      		this.OnLoadUserDept();
			this.oModel.getData().InventoryRequest.Items.push({
				"ItemCode": "",
				"Description": "",
				"Type": "",
				"GlAccount": "",
				"FundType": "",
				"Program": "",
				"Depository": this.oModel.getData().InventoryRequest.Division,
				"Department":  this.oModel.getData().InventoryRequest.DepartmentCode1,
				"Division":  this.oModel.getData().InventoryRequest.Division,
				"Employee": "",
        		"JobOrder": this.getView().byId("jobOrder").getValue(),
				"Quantity": "",
				"UOM": "Manual",
				"EstUnitPrice": "",
				"EstAmount": "",
				"TaxCode": "",
				"Warehouse": "WHSE1",
				"Notes": ""
			});
      this.onLoadGIType();
			this.oModel.refresh();
		},

		OnDeleteRow: function () {
			this.tblItems = this.getView().byId("InventoryRequestItems");
			this.oModel.getData().InventoryRequest.Items.splice(this.tblItems.getSelectedIndex(), 1);
			this.oModel.refresh();
		},

		OnLoadRecords: function () {
			this.oModel.getData().InventoryRequestRecords = [];
			this.oModel.refresh();
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="  + jQuery.sap.storage.Storage.get("dataBase") + "&procName=spApp_GetTransaction&VALUE1=APP_OIVR&VALUE2=" + localStorage.getItem("UserCode"),
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
					var StatusName="";
          if(results[i].U_APP_Requester == localStorage.getItem("UserCode")){
          var infoStatate = "Information";

          if(results[i].Status == "C"){
            infoStatate = "Success";
            StatusName = "Closed";
          }else{
            infoStatate = "Information";
            StatusName = "Open";
          	}
					this.oModel.getData().InventoryRequestRecords.push({
						"No": results[i].DocNum,
						"Requester": results[i].U_APP_Requester,
            			"RequesterName": results[i].U_NAME,
						"Position": results[i].U_APP_Position,
						"Department": results[i].U_APP_Department,
            			"DepartmentName": "",
						"RequestDate": APPui5.getDatePostingFormat(results[i].U_APP_RequestDate),
						"RequiredDate": APPui5.getDatePostingFormat(results[i].U_APP_RequiredDate),
						"Status": StatusName,
            			"StatusCode": results[i].Status,
						"Remarks": results[i].Remark,
						"Draft":results[i].U_APP_IsDraft,
            			"infoState": infoStatate
					});
          		}
			}
				this.oModel.refresh();
			});
		},

    OnComputeAmount: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].EstAmount = APPui5.toCommas(this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].EstUnitPrice * this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].Quantity);
		},

		OnLoadUsers: function () {
			this.oModel.getData().Users = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETUSERS",
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
            "jobTitle": results[i].jobTitle
					});
				}
				this.oModel.refresh();
			});
		},

		OnLoadDept: function () {
			this.oModel.getData().Department = [];
			$.ajax({
				url: "https://13.215.36.201:50000/b1s/v1/Departments",
				type: "GET",
        		async: "false",
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
        //console.log(results)
				// this.oModel.getData().Department = results;
        var i;
				for (i = 0; i < results.value.length; i++) {
					this.oModel.getData().Department.push({
						"Code": results.value[i].Code,
						"Description": results.value[i].Description
					});
				}
				this.oModel.refresh();
			});
		},
		onLoadPositions: function () {
			this.oModel.getData().Positions = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETPOSITIONS",
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
					this.oModel.getData().Positions.push({
						"Code": results[i].Code,
						"Name": results[i].Name
					});
				}
				this.oModel.refresh();
			});
		},
		onLoadItems: function () {
			this.oModel.getData().Items = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETITEMS&VALUE1=Inventory Request",
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
					this.oModel.getData().Items.push({
						"ItemCode": results[i].ItemCode,
						"ItemName": results[i].ItemName,
            			"U_GLAccount": results[i].U_GLAccount
					});
				}
				this.oModel.refresh();
			});
		},
		onLoadGL: function () {
			this.oModel.getData().GL = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETGLACCOUNT",
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
				for (var i = 0; i < results.length; i++) {
					this.oModel.getData().GL.push({
						"AcctCode": results[i].AcctCode,
						"AcctName": results[i].AcctName
					});
				}
				this.oModel.refresh();
			});
		},
		OnLoadUserDept: function () {
			this.oModel.getData().Dept = [];
			this.oModel.getData().Div = [];
			$.ajax({
			  url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=GET_USERDEPT&VALUE1=" + localStorage.getItem("UserCode"),
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
					  for (var i = 0; i < results.length; i++) {
					if (results[i].U_Dimension == "4") {
					  this.oModel.getData().Dept.push({
						  "PrcCode": results[i].U_Department,
						  "PrcName": results[i].U_APP_Description,
						  "GrpCode": results[i].U_APP_Group,
					  	  "U_FundType": results[i].U_FundType,
						  "DepositoryName": results[i].DepositoryName
					  });
				  }
				  else if (results[i].U_Dimension == "2") {
					  this.oModel.getData().Div.push({
						  "PrcCode": results[i].U_Department,
						  "PrcName": results[i].U_APP_Description,
						  "GrpCode": results[i].U_APP_Group,
					  	  "U_FundType": results[i].U_FundType
					  })
				  }
					  }
					  this.oModel.refresh();
			});
		  },

		onLoadDimensions: function () {
			this.oModel.getData().FundType = [];
			this.oModel.getData().DivAll = [];
			this.oModel.getData().DeptAll = [];
			this.oModel.getData().Program = [];
			this.oModel.getData().Employee = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDIMENSIONS",
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
					if (results[i].DimCode === 1) {
						this.oModel.getData().FundType.push({
							"PrcCode": results[i].PrcCode,
							"PrcName": results[i].PrcName,
							"GrpCode": results[i].GrpCode
						});
					}
					else if (results[i].DimCode === 2) {
						this.oModel.getData().DivAll.push({
							"PrcCode": results[i].PrcCode,
							"PrcName": results[i].PrcName,
							"GrpCode": results[i].GrpCode
						});

					}
					else if (results[i].DimCode === 4) {
						this.oModel.getData().DeptAll.push({
							"PrcCode": results[i].PrcCode,
							"PrcName": results[i].PrcName,
							"GrpCode": results[i].GrpCode
						});
					}
					else if (results[i].DimCode === 3) {
						this.oModel.getData().Program.push({
							"PrcCode": results[i].PrcCode,
							"PrcName": results[i].PrcName,
							"GrpCode": results[i].GrpCode
						})
					}
					else if (results[i].DimCode === 5) {
						this.oModel.getData().Employee.push({
							"PrcCode": results[i].PrcCode,
							"PrcName": results[i].PrcName,
							"GrpCode": results[i].GrpCode
						})
					}
				}
				this.oModel.refresh();
			});
		},
		onLoadUOM: function () {
			this.oModel.getData().UOM = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETALLUOM",
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
					this.oModel.getData().UOM.push({
						"UomCode": results[i].UomCode,
						"UomName": results[i].UomName
					})
				}
				this.oModel.refresh();
			});
		},
		onLoadTaxCodes: function () {
			this.oModel.getData().TaxCode = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETTAXCODE",
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
					this.oModel.getData().TaxCode.push({
						"Code": results[i].Code,
						"Name": results[i].Name
					})
				}
				this.oModel.refresh();
			});
		},
		onLoadWhse: function () {
			this.oModel.getData().Warehouse = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETWHSE",
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
					this.oModel.getData().Warehouse.push({
						"WhsCode": results[i].WhsCode,
						"WhsName": results[i].WhsName
					})
				}
				this.oModel.refresh();
			});

		},
		onLoadGIType: function () {
			this.oModel.getData().Type = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETGITYPE",
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
				for (var i = 0; i < results.length; i++) {
					this.oModel.getData().Type.push({
						"Code": results[i].Code,
						"Name": results[i].Name,
						"GLAccount":results[i].U_APP_GLAccount
					})
				}
				this.oModel.refresh();
			});
		},
		onLoadIVRecord: function (RowIndex) {
			this.onClearData();
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDOCENTRY&VALUE1=" + this.getView().byId("IVNo").getValue() + "&VALUE=APP_OIVR",
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
				$.ajax({
					url: "https://13.215.36.201:50000/b1s/v1/APP_OIVR(" + this.getView().byId("IVNo").getValue() + ")",
					type: "GET",
					crossDomain: true,
          			async: false,
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
					var DepartmentName = "";
					var RequesterName = "";
					const result = this.oModel.getData().Department.find(({ Code }) => Code === parseInt(results.U_APP_Department));
					if (result != "") {
						DepartmentName = result.Description;
					}
					this.OnLoadUsers();
					const resultrequester = this.oModel.getData().Users.find(({ UserCode }) => UserCode === results.U_APP_Requester);
					if (resultrequester != "") {
						RequesterName = resultrequester.UserName;
					}
					this.oModel.getData().InventoryRequest.DocEntry=results.DocEntry;
					this.oModel.getData().InventoryRequest.No = results.DocNum;
					this.oModel.getData().InventoryRequest.RequestDate = results.U_APP_RequestDate;
					this.oModel.getData().InventoryRequest.RequiredDate = results.U_APP_RequiredDate;
					this.oModel.getData().InventoryRequest.RequesterCode = results.U_APP_Requester;
					this.oModel.getData().InventoryRequest.RequesterName = RequesterName
					this.oModel.getData().InventoryRequest.DepartmentCode = results.U_APP_Department;
					this.oModel.getData().InventoryRequest.DepartmentName = DepartmentName;
					// // this.getView().byId("position").setSelectedKey(results.U_APP_Position);
					
					this.oModel.getData().InventoryRequest.PositionCode = results.U_APP_Position;
					this.oModel.getData().InventoryRequest.Remarks = results.Remark;
					this.getView().byId("status").setSelectedKey(results.Status);
         
					oInvStatus = results.Status;
					this.oModel.getData().InventoryRequest.StatusCode = results.status;
					this.oModel.getData().InventoryRequest.JONum = results.U_APP_JONum;
					this.oModel.getData().InventoryRequest.Draft=results.U_APP_IsDraft;

					if(results.U_APP_Attachment === null || results.U_APP_Attachment === "" || results.U_APP_Attachment === undefined){
					}else{
						this.getFromAttachment(results.U_APP_Attachment);
					}


					this.oModel.getData().InventoryRequest.Items = [];
					this.oModel.getData().InventoryRequest.DepartmentCode1 = results.APP_IVR1Collection[0].U_APP_Department;
					this.oModel.getData().InventoryRequest.Division = results.APP_IVR1Collection[0].U_APP_Division;

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
		handleValueHelpDept: function (oEvent) {
			if (!this._oValueHelpDialogDept) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestDept",
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
		handleSearchDept: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("Code", FilterOperator.Contains, sValue),
				new Filter("Description", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseDept: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var Departments = {};
			if (aContexts && aContexts.length) {
				Departments = aContexts.map(function (oContext) {
					var oDepartments = {};
					oDepartments.Code = oContext.getObject().Code;
					oDepartments.Description = oContext.getObject().Description;
					return oDepartments;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().InventoryRequest.DepartmentCode = Departments[0].Code;
			this.oModel.getData().InventoryRequest.DepartmentName = Departments[0].Description;
			this.oModel.refresh();
		},
		handleValueHelpUsers: function (oEvent) {
			if (!this._oValueHelpDialogUser) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestUser",
					controller: this
				}).then(function (oValueHelpDialogUser) {
					this._oValueHelpDialogUser = oValueHelpDialogUser;
					this.getView().addDependent(this._oValueHelpDialogUser);
					this._oValueHelpDialogUser.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogUser.open();
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
					return oUsers;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().InventoryRequest.RequesterCode = Users[0].UserCode;
			this.oModel.getData().InventoryRequest.RequesterName = Users[0].UserName;
			this.oModel.refresh();
			this.onChangeUser(Users[0].UserCode);
		},
		handleValueHelpItems: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogItems) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestItems",
					controller: this
				}).then(function (oValueHelpDialogItems) {
					this._oValueHelpDialogItems = oValueHelpDialogItems;
					this.getView().addDependent(this._oValueHelpDialogItems);
					this._oValueHelpDialogItems.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogItems.open();
			}
		},
		handleSearchItems: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("ItemCode", FilterOperator.Contains, sValue),
				new Filter("ItemName", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseItems: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var Items = {};
			if (aContexts && aContexts.length) {
				Items = aContexts.map(function (oContext) {
					var oItems = {};
					oItems.ItemCode = oContext.getObject().ItemCode;
					oItems.ItemName = oContext.getObject().ItemName;
          oItems.U_GLAccount = oContext.getObject().U_GLAccount;
					return oItems;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].ItemCode = Items[0].ItemCode;
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].Description = Items[0].ItemName;
      this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].GlAccount = Items[0].U_GLAccount;
      this.oModel.refresh();
			this.onChangeItem(Items[0].ItemCode);

		},
		handleValueHelpGL: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogGL) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestGL",
					controller: this
				}).then(function (oValueHelpDialogGL) {
					this._oValueHelpDialogGL = oValueHelpDialogGL;
					this.getView().addDependent(this._oValueHelpDialogGL);
					this._oValueHelpDialogGL.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogGL.open();
			}
		},
		handleSearchGL: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("AcctCode", FilterOperator.Contains, sValue),
				new Filter("AcctName", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseGL: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var GL = {};
			if (aContexts && aContexts.length) {
				GL = aContexts.map(function (oContext) {
					var oGL = {};
					oGL.AcctCode = oContext.getObject().AcctCode;
					oGL.AcctName = oContext.getObject().AcctName;
					return oGL;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].GlAccount = GL[0].AcctCode;
			this.oModel.refresh();

		},
		handleValueHelpFundType: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogFundType) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestFundType",
					controller: this
				}).then(function (oValueHelpDialogFundType) {
					this._oValueHelpDialogFundType = oValueHelpDialogFundType;
					this.getView().addDependent(this._oValueHelpDialogFundType);
					this._oValueHelpDialogFundType.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogFundType.open();
			}
		},
		handleSearchFundType: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("PrcCode", FilterOperator.Contains, sValue),
				new Filter("PrcName", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseFundType: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var FundType = {};
			if (aContexts && aContexts.length) {
				FundType = aContexts.map(function (oContext) {
					var oFundType = {};
					oFundType.PrcCode = oContext.getObject().PrcCode;
					oFundType.PrcName = oContext.getObject().PrcName;
					return oFundType;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].FundType = FundType[0].PrcCode;
			this.oModel.refresh();

		},
		handleValueHelpProgram: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogProgram) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestProgram",
					controller: this
				}).then(function (oValueHelpDialogProgram) {
					this._oValueHelpDialogProgram = oValueHelpDialogProgram;
					this.getView().addDependent(this._oValueHelpDialogProgram);
					this._oValueHelpDialogProgram.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogProgram.open();
			}
		},
		handleSearchProgram: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("PrcCode", FilterOperator.Contains, sValue),
				new Filter("PrcName", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseProgram: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var Program = {};
			if (aContexts && aContexts.length) {
				Program = aContexts.map(function (oContext) {
					var oProgram = {};
					oProgram.PrcCode = oContext.getObject().PrcCode;
					oProgram.PrcName = oContext.getObject().PrcName;
					return oProgram;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].Program = Program[0].PrcCode;
			this.oModel.refresh();
			this.onChangeProgram(Program[0].PrcCode);
		},
		handleValueHelpDepartment: function (oEvent) {
			// this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogDepartment) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestDepartment",
					controller: this
				}).then(function (oValueHelpDialogDepartment) {
					this._oValueHelpDialogDepartment = oValueHelpDialogDepartment;
					this.getView().addDependent(this._oValueHelpDialogDepartment);
					this._oValueHelpDialogDepartment.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogDepartment.open();
			}
		},
		handleSearchDepartment: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("PrcCode", FilterOperator.Contains, sValue),
				new Filter("PrcName", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseDepartment: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var Department = {};
			if (aContexts && aContexts.length) {
				Department = aContexts.map(function (oContext) {
					var oDepartment = {};
					oDepartment.PrcCode = oContext.getObject().PrcCode;
					oDepartment.PrcName = oContext.getObject().PrcName;
					oDepartment.GrpCode = oContext.getObject().GrpCode;
					oDepartment.U_FundType = oContext.getObject().U_FundType;
					oDepartment.DepositoryName = oContext.getObject().DepositoryName;
					return oDepartment;
				});
			}


			oEvent.getSource().getBinding("items").filter([]);

			oSelectedDept = Department[0].PrcName;
			oSelectedDepo = Department[0].GrpCode;

			this.oModel.getData().InventoryRequest.DepartmentCode1 = Department[0].PrcCode;
			this.oModel.getData().InventoryRequest.DepartmentName1 = Department[0].PrcName;
			this.oModel.getData().InventoryRequest.Division = Department[0].GrpCode;
			this.oModel.getData().InventoryRequest.DivisionName = Department[0].DepositoryName;

			this.oModel.getData().InventoryRequest.FundType = Department[0].U_FundType;			   
			var omember = Department[0].PrcCode;
			var odirectorate = omember.slice(0,4) + "00";
			this.oModel.getData().InventoryRequest.Program = odirectorate;

			for(let i = 0;i < this.oModel.getData().InventoryRequest.Items.length;i++){
				this.oModel.getData().InventoryRequest.Items[i].Department = Department[0].PrcCode;
				this.oModel.getData().InventoryRequest.Items[i].DepartmentName = Department[0].PrcName;
				this.oModel.getData().InventoryRequest.Items[i].Division=Department[0].GrpCode;
				this.oModel.getData().InventoryRequest.Items[i].FundType = Department[0].U_FundType;
			   
				var member = Department[0].PrcCode;
				var directorate = member.slice(0,4) + "00";
				this.oModel.getData().InventoryRequest.Items[i].Program = directorate;
			}
		  
     		this.oModel.refresh();
			// this.onChangeDepartment(Department[0].PrcCode);

		},
		handleValueHelpDiv: function (oEvent) {
			// this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogDiv) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestDiv",
					controller: this
				}).then(function (oValueHelpDialogDiv) {
					this._oValueHelpDialogDiv = oValueHelpDialogDiv;
					this.getView().addDependent(this._oValueHelpDialogDiv);
					this._oValueHelpDialogDiv.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogDiv.open();
			}
		},
		handleSearchDiv: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("PrcCode", FilterOperator.Contains, sValue),
				new Filter("PrcName", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseDiv: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var Division = {};
			if (aContexts && aContexts.length) {
				Division = aContexts.map(function (oContext) {
					var oDivision = {};
					oDivision.PrcCode = oContext.getObject().PrcCode;
					oDivision.PrcName = oContext.getObject().PrcName;
					return oDivision;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);

				oSelectedDept = "";
				oSelectedDepo = Division[0].PrcCode;
				this.oModel.getData().InventoryRequest.Division = Division[0].PrcCode;
				this.oModel.getData().InventoryRequest.DepartmentName1 ="";
				this.oModel.getData().InventoryRequest.DepartmentCode1 = "";
			
				for(var i=0; i < this.oModel.getData().InventoryRequest.Items.length;i++){
					this.oModel.getData().InventoryRequest.Items[i].Division = Division[0].PrcCode;
					this.oModel.getData().InventoryRequest.Items[i].DivisionName = Division[0].PrcName;
					this.oModel.getData().InventoryRequest.Items[i].Department = "";
					this.oModel.getData().InventoryRequest.Items[i].Program = "";
				}
				this.oModel.refresh();
				this.onChangeDivision(Division[0].PrcCode);
		},

    onChangeJO: function(){
      for(let i = 0;i < this.oModel.getData().InventoryRequest.Items.length;i++){
        this.oModel.getData().InventoryRequest.Items[i].JobOrder = this.getView().byId("jobOrder").getValue();
      }
      this.oModel.refresh();
    },

		handleValueHelpEmployee: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogEmployee) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestEmployee",
					controller: this
				}).then(function (oValueHelpDialogEmployee) {
					this._oValueHelpDialogEmployee = oValueHelpDialogEmployee;
					this.getView().addDependent(this._oValueHelpDialogEmployee);
					this._oValueHelpDialogEmployee.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogEmployee.open();
			}
		},
		handleSearchEmployee: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("PrcCode", FilterOperator.Contains, sValue),
				new Filter("PrcName", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseEmployee: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var Employee = {};
			if (aContexts && aContexts.length) {
				Employee = aContexts.map(function (oContext) {
					var oEmployee = {};
					oEmployee.PrcCode = oContext.getObject().PrcCode;
					oEmployee.PrcName = oContext.getObject().PrcName;
					return oEmployee;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].Employee = Employee[0].PrcCode;
			this.oModel.refresh();

		},
		handleValueHelpUOM: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogUOM) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestUOM",
					controller: this
				}).then(function (oValueHelpDialogUOM) {
					this._oValueHelpDialogUOM = oValueHelpDialogUOM;
					this.getView().addDependent(this._oValueHelpDialogUOM);
					this._oValueHelpDialogUOM.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogUOM.open();
			}
		},
		handleSearchUOM: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("UomCode", FilterOperator.Contains, sValue),
				new Filter("UomName", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseUOM: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var UOM = {};
			if (aContexts && aContexts.length) {
				UOM = aContexts.map(function (oContext) {
					var oUOM = {};
					oUOM.UomCode = oContext.getObject().UomCode;
					oUOM.UomName = oContext.getObject().UomName;
					return oUOM;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].UOM = UOM[0].UomCode;
			this.oModel.refresh();

		},
		handleValueHelpTaxCode: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogTaxCode) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestTaxCode",
					controller: this
				}).then(function (oValueHelpDialogTaxCode) {
					this._oValueHelpDialogTaxCode = oValueHelpDialogTaxCode;
					this.getView().addDependent(this._oValueHelpDialogTaxCode);
					this._oValueHelpDialogTaxCode.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogTaxCode.open();
			}
		},
		handleSearchTaxCode: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("Code", FilterOperator.Contains, sValue),
				new Filter("Name", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseTaxCode: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var TaxCode = {};
			if (aContexts && aContexts.length) {
				TaxCode = aContexts.map(function (oContext) {
					var oTaxCode = {};
					oTaxCode.Code = oContext.getObject().Code;
					oTaxCode.Name = oContext.getObject().Name;
					return oTaxCode;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].TaxCode = TaxCode[0].Code;
			this.oModel.refresh();

		},
		handleValueHelpWhse: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogWhse) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestWhse",
					controller: this
				}).then(function (oValueHelpDialogWhse) {
					this._oValueHelpDialogWhse = oValueHelpDialogWhse;
					this.getView().addDependent(this._oValueHelpDialogWhse);
					this._oValueHelpDialogWhse.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogWhse.open();
			}
		},
		handleSearchWhse: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("WhsCode", FilterOperator.Contains, sValue),
				new Filter("WhsName", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseWhse: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var Whse = {};
			if (aContexts && aContexts.length) {
				Whse = aContexts.map(function (oContext) {
					var oWhse = {};
					oWhse.WhsCode = oContext.getObject().WhsCode;
					oWhse.WhsName = oContext.getObject().WhsName;
					return oWhse;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].Warehouse = Whse[0].WhsCode;
			this.oModel.refresh();

		},
		handleValueHelpType: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogType) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Inventory.InventoryRequestType",
					controller: this
				}).then(function (oValueHelpDialogType) {
					this._oValueHelpDialogType = oValueHelpDialogType;
					this.getView().addDependent(this._oValueHelpDialogType);
					this._oValueHelpDialogType.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogType.open();
			}
		},
		handleSearchType: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("Code", FilterOperator.Contains, sValue),
				new Filter("Name", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueCloseType: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var Type = {};
			if (aContexts && aContexts.length) {
				Type = aContexts.map(function (oContext) {
					var oType = {};
					oType.Code = oContext.getObject().Code;
					oType.Name = oContext.getObject().Name;
					return oType;
				});
			}

			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].Type = Type[0].Code;
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].GlAccount=this.oModel.getData().Type.find(({Code})=>Code===Type[0].Code).GLAccount;
			this.oModel.refresh();

		},
		getNextNumber: function () {
      	oDocNum = "";
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=GETNEXTDOCNUM&VALUE1=APP_OIVR",
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
					this.oModel.getData().InventoryRequest.No = results[i].NextNumber;
         			oDocNum = results[i].NextNumber;
				}
				this.oModel.refresh();
			});
		},
		createTables: function () {
			//Add Fields Creation
			APPui5.createField("APP_Position", "Position", "OIGE", "db_Alpha", "", 100);
			APPui5.createField("APP_Type", "Type", "IGE1", "db_Alpha", "", 100);
			APPui5.createField("APP_Notes", "Notes", "IGE1", "db_Alpha", "", 100);

			APPui5.createTable("APP_OIVR", "Inventory Request", "bott_Document");
			APPui5.createField("APP_Requester", "Requester", "@APP_OIVR", "db_Alpha", "", 50);
			APPui5.createField("APP_Position", "Position", "@APP_OIVR", "db_Alpha", "", 50);
			APPui5.createField("APP_Department", "Department", "@APP_OIVR", "db_Alpha", "", 50);
			APPui5.createField("APP_RequestDate", "Request Date", "@APP_OIVR", "db_Date", "");
			APPui5.createField("APP_RequiredDate", "Required Date", "@APP_OIVR", "db_Date", "");
			APPui5.createField("APP_JONum", "JO Number", "@APP_OIVR", "db_Alpha", "", 50);			
			APPui5.createField("APP_IsDraft","Is Draft","@APP_OIVR","db_Alpha","",50);
			APPui5.createField("APP_Attachment","Attachment","@APP_OIVR","db_Alpha","",50);
			
			APPui5.createTable("APP_IVR1", "Inventory Request Details", "bott_DocumentLines");
			APPui5.createField("APP_ItemCode", "Item Code", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_Description", "Description", "@APP_IVR1", "db_Alpha", "", 100);
			APPui5.createField("APP_Type", "Type", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_GlAccount", "Gl Account", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_FundType", "Fund Type", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_Program", "Program", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_Department", "Department", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_Division", "Division", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_Depository", "Depository", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_Employee", "Employee", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_Quantity", "Quantity", "@APP_IVR1", "db_Numeric", "", 10);
			APPui5.createField("APP_Uom", "Uom", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_EstPrice", "Est Unit Price", "@APP_IVR1", "db_Float", "st_Price", 10);
			APPui5.createField("APP_EstAmt", "Est Amount", "@APP_IVR1", "db_Float", "st_Price", 10);
			APPui5.createField("APP_Budget", "Budget/ Fund Available", "@APP_IVR1", "db_Float", "st_Price", 10);
			APPui5.createField("APP_TaxCode", "Tax Code", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_Whse", "Warehouse", "@APP_IVR1", "db_Alpha", "", 50);
			APPui5.createField("APP_Notes", "Notes", "@APP_IVR1", "db_Alpha", "", 100);
			APPui5.createField("APP_SpecialistCode", "Specialist", "@APP_IVR1", "db_Alpha", "", 30);

		},
		onChangeUser: function (UserCode) {
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETUSERINFO&VALUE1=" + UserCode + "",
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
				this.oModel.getData().InventoryRequest.DepartmentCode = results[0].Department;
				this.oModel.getData().InventoryRequest.DepartmentName = results[0].Remarks;
				this.oModel.getData().InventoryRequest.PositionCode = results[0].U_APP_Position;
				this.oModel.getData().InventoryRequest.PositionName = results[0].Name;
				this.oModel.getData().InventoryRequest.RequesterName = results[0].U_NAME;
				this.oModel.refresh();
			});
		},
		onChangeItem: function (ItemCode) {
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETITEMINFO&VALUE1=" + ItemCode + "",
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
				this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].UOM = results[0].UomCode;
				this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].TaxCode = results[0].VatGroupPu;
				this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].EstUnitPrice = APPui5.toCommas(results[0].AvgPrice);
        this.oModel.refresh();
			});
		},
		OnComputeAmount: function (oEvent) {   
		 this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      var value1 = APPui5.removeCommas(this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].EstUnitPrice);
			var value2 = APPui5.removeCommas(this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].Quantity);
      var totalPrice = (value1 * value2);
      var decimalPrice = APPui5.toDecimal(totalPrice);
      var withComma = APPui5.toCommas(decimalPrice);

      this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].EstAmount= withComma;
      this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].EstUnitPrice = APPui5.toCommas(this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].EstUnitPrice);
		},
		onChangeDivision: function (Division) {
			const resultDiv = this.oModel.getData().DivAll.find(({ PrcCode }) => PrcCode === Division);
			const FundTypeDiv = this.oModel.getData().FundType.find(({ PrcCode }) => PrcCode.match(new RegExp(resultDiv.GrpCode, "g")));
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].FundType = FundTypeDiv.PrcCode;
			this.oModel.refresh();
		},
		onChangeDepartment: function (Department) {
      try{
        const resultDept = this.oModel.getData().Div.find(({ PrcCode }) => PrcCode === Division.PrcCode);
        const FundTypeDept = this.oModel.getData().FundType.find(({ PrcCode }) => PrcCode.match(new RegExp(resultDept.GrpCode, "g")));
        this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].FundType = FundTypeDept.PrcCode;
      }catch (e){
        console.log(e)
      }
			this.oModel.refresh();
		},
		onChangeProgram: function (Program) {
			const result = this.oModel.getData().Program.find(({ PrcCode }) => PrcCode === Program);
			const Division = this.oModel.getData().Div.find(({ PrcCode }) => PrcCode === result.GrpCode);
			const Department = this.oModel.getData().Dept.find(({ PrcCode }) => PrcCode.match(result.PrcCode.toString().substring(0, 4), "g"));
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].Division = Division.PrcCode;
			this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].Department = Department.PrcCode;
			const FundTypeProgram = this.oModel.getData().FundType.find(({ PrcCode }) => PrcCode.match(new RegExp(Division.GrpCode, "g")));
			this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].FundType = FundTypeProgram.PrcCode;
			this.oModel.refresh();
		},
		getGLAccount: function (ItemCode, Year) {
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPGET_GLACCOUNT&VALUE1=" + ItemCode + "&VALUE2=" + Year + "",
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
				this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].GlAccount = results[0].APCMAct;
				this.oModel.refresh();
			});
		},
		getItemType: function (ItemCode) {
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETITEMTYPE&VALUE1=" + ItemCode + "",
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
				this.oModel.getData().InventoryRequest.Items[this.iSelectedRow].Type = results[0].U_APP_Type;
				this.oModel.refresh();
			});
		},
		onClearData: function () {
			for(let i = 0;i < this.oModel.getData().InventoryRequest.Items.length; i++){
				this.oModel.getData().InventoryRequest.Items.splice(i, 1);
			}
			this.oModel.getData().InventoryRequest.No = "";
			this.oModel.getData().InventoryRequest.RequesterCode = "";
			this.oModel.getData().InventoryRequest.RequesterName = "";
			this.oModel.getData().InventoryRequest.PositionCode = "";
			this.oModel.getData().InventoryRequest.PositionName = "";
			this.oModel.getData().InventoryRequest.DepartmentCode = "";
			this.oModel.getData().InventoryRequest.DepartmentName = "";
			this.oModel.getData().InventoryRequest.DepartmentCode1 = "";
			this.oModel.getData().InventoryRequest.Division ="";
			this.oModel.getData().InventoryRequest.RequestDate = "";
			this.oModel.getData().InventoryRequest.RequiredDate = "";
			this.oModel.getData().InventoryRequest.StatusCode = "";
			this.oModel.getData().InventoryRequest.StatusName = "";
			this.oModel.getData().InventoryRequest.Remarks = "";
			this.oModel.getData().InventoryRequest.Items = [];


			var tomorrow = new Date();
			var dd = String(tomorrow.getDate()).padStart(2, '0');
			var mm = String(tomorrow.getMonth() + 1).padStart(2, '0'); //January is 0!
			var yyyy = tomorrow.getFullYear();
			tomorrow =  yyyy + "-" + mm + "-" + dd;
			this.getView().byId("ReqDateINV").setValue(tomorrow);

		},
		onFunction: function () {
			var oInvent =this.oModel.getData().InventoryRequest.Items;

			var isZero = false;
			for(let q = 0;q < oInvent.length; q++){
			  if(oInvent[q].Quantity < 1 || oInvent[q].Quantity === "" || oInvent[q].Quantity === null ){
				isZero = true;
			  }
			}
	  
			if(isZero === true){
			   APPui5.APPMESSAGEBOX("Please Enter Quantity Greater than 0.");
			   return;
			}


			var dif = 0;
			var dep = 0;
			
			var DepoCode = oInvent[0].Division;
			for(let i=0;i<this.oModel.getData().InventoryRequest.Items.length;i++){
				if(oInvent[i].Division !== DepoCode){
				dif +=1;
				}
			}
			var DEPCode = oInvent[0].Department;
			for(let i=0;i<this.oModel.getData().InventoryRequest.Items.length;i++){
				if(oInvent[i].Department !== DEPCode){
				dep +=1;
				}
			}

			if(dif !== 0){
				APPui5.APPMESSAGEBOX("Mulitple Depository not allowed");
				return;  
			}else if(dep !== 0){
				APPui5.APPMESSAGEBOX("Mulitple Department not allowed");
				return;
			}else{

					if (this.oModel.getData().Controls.AddOrEdit === "Add Inventory Request") {
						this.onAdd();
					}
					else {
						this.onUpdate();
					}
      }
		},
		onDraftFunction: function () {
			if (this.oModel.getData().Controls.AddOrEdit === "Add Inventory Request") {
				this.onAddDraft();
			}
			else {
				this.onUpdateDraft();
			}
		},
		onAdd: function () {

			if(this.oModel.getData().InventoryRequest.RequiredDate == ""){
				APPui5.APPMESSAGEBOX("Please select required delivery date");
				return;
			}
			var InventoryRequestBody = {};
			InventoryRequestBody.U_APP_RequestDate = APPui5.getDateFormat(this.oModel.getData().InventoryRequest.RequestDate);
			InventoryRequestBody.U_APP_RequiredDate = this.oModel.getData().InventoryRequest.RequiredDate;
			InventoryRequestBody.U_APP_Requester = this.oModel.getData().InventoryRequest.RequesterCode;
			InventoryRequestBody.U_APP_Department = this.oModel.getData().InventoryRequest.DepartmentCode;
			// InventoryRequestBody.U_APP_Position = testPos;
			InventoryRequestBody.Remark = this.oModel.getData().InventoryRequest.Remarks;
			InventoryRequestBody.U_APP_JONum = this.oModel.getData().InventoryRequest.JONum;
			InventoryRequestBody.U_APP_IsDraft="No";
			if(localStorage.getItem("AttcEntry") !== ""){
				InventoryRequestBody.U_APP_Attachment = localStorage.getItem("AttcEntry");
			}else{
				InventoryRequestBody.U_APP_Attachment = "";
			}
			InventoryRequestBody.APP_IVR1Collection = [];
			var i;
			var totalAmount = 0;

			for (i = 0; i < this.oModel.getData().InventoryRequest.Items.length; i++) {
				var Amount = this.oModel.getData().InventoryRequest.Items[i].EstAmount;
				totalAmount = (totalAmount + Amount);

					InventoryRequestBody.APP_IVR1Collection.push({
					"U_APP_ItemCode": this.oModel.getData().InventoryRequest.Items[i].ItemCode,
					"U_APP_Description": this.oModel.getData().InventoryRequest.Items[i].Description,
					"U_APP_GlAccount": this.oModel.getData().InventoryRequest.Items[i].GlAccount,
					"U_APP_Uom": this.oModel.getData().InventoryRequest.Items[i].UOM,
					"U_APP_EstPrice": APPui5.removeCommas(this.oModel.getData().InventoryRequest.Items[i].EstUnitPrice),
					"U_APP_Quantity": this.oModel.getData().InventoryRequest.Items[i].Quantity,
					"U_APP_Type": this.oModel.getData().InventoryRequest.Items[i].Type,
					"U_APP_EstAmt": APPui5.removeCommas(this.oModel.getData().InventoryRequest.Items[i].EstAmount),
					"U_APP_Whse": this.oModel.getData().InventoryRequest.Items[i].Warehouse,
					"U_APP_TaxCode": this.oModel.getData().InventoryRequest.Items[i].TaxCode,
					"U_APP_FundType": this.oModel.getData().InventoryRequest.Items[i].FundType,
					"U_APP_Division": this.oModel.getData().InventoryRequest.Items[i].Division,
					"U_APP_Depository": this.oModel.getData().InventoryRequest.Items[i].Division,
					"U_APP_Employee": this.oModel.getData().InventoryRequest.Items[i].Employee,
					"U_APP_Department": this.oModel.getData().InventoryRequest.Items[i].Department,
					"U_APP_Program": this.oModel.getData().InventoryRequest.Items[i].Program,
					"U_APP_Notes": this.oModel.getData().InventoryRequest.Items[i].Notes
				});
			}
			this.getNextNumber();
			// this.onAttachmentDoc(this.oModel.getData().InventoryRequest.No);
			$.ajax({
				url: "https://13.215.36.201:50000/b1s/v1/APP_OIVR",
				data: JSON.stringify(InventoryRequestBody),
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
				success: async function (json) {
					if(localStorage.getItem("AttcEntry") !== ""){
						this.onUpdateAttachnent();
				   	}
					await this.ApprovalRoute('Inventory Request', jQuery.sap.storage.Storage.get("userCode"), oDocNum, this.oModel.getData().InventoryRequest.RequestDate, this.oModel.getData().InventoryRequest.RequiredDate, this.oModel.getData().InventoryRequest.Remarks,totalAmount,this.oModel.getData().InventoryRequest.DepartmentName1,this.oModel.getData().InventoryRequest.DivisionName);
					APPui5.APPMESSAGEBOX("Transaction Succesfully submitted for approval!\nTransaction No:" + oDocNum);
					this.getView().byId("AddrowID").setEnabled(false);
					this.getView().byId("DelRowID").setEnabled(false);
					this.getView().byId("fileUploader1").setEnabled(false);
				}
			}).done(function (results) {
				if (results) {
					this.onClearData();
				}
			});
			
			this.getView().byId("IVNo").setValue("");
			this.oModel.refresh();
		},
		onUpdate: function () {
			var InventoryRequestBody = {};
			InventoryRequestBody.U_APP_RequestDate = this.oModel.getData().InventoryRequest.RequestDate;
			InventoryRequestBody.U_APP_RequiredDate = this.oModel.getData().InventoryRequest.RequiredDate;
			InventoryRequestBody.U_APP_Requester = this.oModel.getData().InventoryRequest.RequesterCode;
			InventoryRequestBody.U_APP_Department = this.oModel.getData().InventoryRequest.DepartmentCode;
			// InventoryRequestBody.U_APP_Position = this.getView().byId("position").getValue();
			InventoryRequestBody.Remark = this.oModel.getData().InventoryRequest.Remarks;
			InventoryRequestBody.U_APP_JONum = this.oModel.getData().InventoryRequest.JONum;
			InventoryRequestBody.U_APP_IsDraft="No";
			// InventoryRequestBody.U_APP_Attachment=this.oModel.getData().InventoryRequest.AttachmentEntry;
			InventoryRequestBody.APP_IVR1Collection = [];
			
			var i;
			var totalAmount = 0;
			for (i = 0; i < this.oModel.getData().InventoryRequest.Items.length; i++) {
				var amount = this.oModel.getData().InventoryRequest.Items[i].EstUnitPrice;
				totalAmount = (totalAmount + amount);

				InventoryRequestBody.APP_IVR1Collection.push({
					"U_APP_ItemCode": this.oModel.getData().InventoryRequest.Items[i].ItemCode,
					"U_APP_Description": this.oModel.getData().InventoryRequest.Items[i].Description,
					"U_APP_GlAccount": this.oModel.getData().InventoryRequest.Items[i].GlAccount,
					"U_APP_Uom": this.oModel.getData().InventoryRequest.Items[i].UOM,
					"U_APP_EstPrice": APPui5.removeCommas(this.oModel.getData().InventoryRequest.Items[i].EstUnitPrice),
					"U_APP_Quantity": this.oModel.getData().InventoryRequest.Items[i].Quantity,
					"U_APP_Type": this.oModel.getData().InventoryRequest.Items[i].Type,
					"U_APP_EstAmt": APPui5.removeCommas(this.oModel.getData().InventoryRequest.Items[i].EstAmount),
					"U_APP_Whse": this.oModel.getData().InventoryRequest.Items[i].Warehouse,
					"U_APP_TaxCode": this.oModel.getData().InventoryRequest.Items[i].TaxCode,
					"U_APP_FundType": this.oModel.getData().InventoryRequest.Items[i].FundType,
					"U_APP_Division": this.oModel.getData().InventoryRequest.Items[i].Division,
					"U_APP_Depository": this.oModel.getData().InventoryRequest.Items[i].Division,
					"U_APP_Employee": this.oModel.getData().InventoryRequest.Items[i].Employee,
					"U_APP_Department": this.oModel.getData().InventoryRequest.Items[i].Department,
					"U_APP_Program": this.oModel.getData().InventoryRequest.Items[i].Program,
					"U_APP_Notes": this.oModel.getData().InventoryRequest.Items[i].Notes
				});
			}

			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDOCENTRY&VALUE1=" + this.oModel.getData().InventoryRequest.No + "&VALUE=APP_OIVR",
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
				$.ajax({
					url: "https://13.215.36.201:50000/b1s/v1/APP_OIVR(" + results[0].DocEntry + ")",
					data: JSON.stringify(InventoryRequestBody),
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
					success: async function (json) {
						await this.ApprovalRoute('Inventory Request', jQuery.sap.storage.Storage.get("userCode"), this.oModel.getData().InventoryRequest.No, this.oModel.getData().InventoryRequest.RequestDate, this.oModel.getData().InventoryRequest.RequiredDate, this.oModel.getData().InventoryRequest.Remarks,totalAmount,this.oModel.getData().InventoryRequest.DepartmentName1,this.oModel.getData().InventoryRequest.DivisionName);
						APPui5.APPMESSAGEBOX("Transaction updated!")
						this.getView().byId("AddrowID").setEnabled(false);
						this.getView().byId("DelRowID").setEnabled(false);
						this.getView().byId("fileUploader1").setEnabled(false);
						this.onAttachmentDocUpdate();
					}
				}).done(function (results) {
					this.onClearData();
				});
			});
		},
		onAddDraft: function () {
			var InventoryRequestBody = {};
			InventoryRequestBody.U_APP_RequestDate = APPui5.getDateFormat(this.oModel.getData().InventoryRequest.RequestDate);
			InventoryRequestBody.U_APP_RequiredDate = this.oModel.getData().InventoryRequest.RequiredDate;
			InventoryRequestBody.U_APP_Requester = this.oModel.getData().InventoryRequest.RequesterCode;
			InventoryRequestBody.U_APP_Department = this.oModel.getData().InventoryRequest.DepartmentCode;
			InventoryRequestBody.U_APP_Position = this.oModel.getData().InventoryRequest.PositionCode;
			InventoryRequestBody.Remark = this.oModel.getData().InventoryRequest.Remarks;
			InventoryRequestBody.U_APP_JONum = this.oModel.getData().InventoryRequest.JONum;
			InventoryRequestBody.U_APP_IsDraft="Yes";
			// InventoryRequestBody.U_APP_Attachment=this.oModel.getData().InventoryRequest.AttachmentEntry;
			InventoryRequestBody.APP_IVR1Collection = [];
			var i;
			for (i = 0; i < this.oModel.getData().InventoryRequest.Items.length; i++) {
				InventoryRequestBody.APP_IVR1Collection.push({
					"U_APP_ItemCode": this.oModel.getData().InventoryRequest.Items[i].ItemCode,
					"U_APP_Description": this.oModel.getData().InventoryRequest.Items[i].Description,
					"U_APP_GlAccount": this.oModel.getData().InventoryRequest.Items[i].GlAccount,
					"U_APP_Uom": this.oModel.getData().InventoryRequest.Items[i].UOM,
					"U_APP_EstPrice": APPui5.removeCommas(this.oModel.getData().InventoryRequest.Items[i].EstUnitPrice),
					"U_APP_Quantity": this.oModel.getData().InventoryRequest.Items[i].Quantity,
					"U_APP_Type": this.oModel.getData().InventoryRequest.Items[i].Type,
					"U_APP_EstAmt": APPui5.removeCommas(this.oModel.getData().InventoryRequest.Items[i].EstAmount),
					"U_APP_Whse": this.oModel.getData().InventoryRequest.Items[i].Warehouse,
					"U_APP_TaxCode": this.oModel.getData().InventoryRequest.Items[i].TaxCode,
					"U_APP_FundType": this.oModel.getData().InventoryRequest.Items[i].FundType,
					"U_APP_Division": this.oModel.getData().InventoryRequest.Items[i].Division,
					"U_APP_Depository": this.oModel.getData().InventoryRequest.Items[i].Division,
					"U_APP_Employee": this.oModel.getData().InventoryRequest.Items[i].Employee,
					"U_APP_Department": this.oModel.getData().InventoryRequest.Items[i].Department,
					"U_APP_Program": this.oModel.getData().InventoryRequest.Items[i].Program,
					"U_APP_Notes": this.oModel.getData().InventoryRequest.Items[i].Notes
				});

			}
			this.getNextNumber();
			this.onAttachmentDoc(this.oModel.getData().InventoryRequest.No);
			$.ajax({
				url: "https://13.215.36.201:50000/b1s/v1/APP_OIVR",
				data: JSON.stringify(InventoryRequestBody),
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
				success: async function (json) {
				APPui5.APPMESSAGEBOX("Transaction Succesfully save as draft!\nTransaction no:" + oDocNum);
				this.getView().byId("AddrowID").setEnabled(false);
				this.getView().byId("DelRowID").setEnabled(false);
				}
			}).done(function (results) {
				if (results) {
					this.onClearData();
				
				}
			});

		},
		onUpdateDraft: function () {
			var InventoryRequestBody = {};
			InventoryRequestBody.U_APP_RequestDate = this.oModel.getData().InventoryRequest.RequestDate;
			InventoryRequestBody.U_APP_RequiredDate = this.oModel.getData().InventoryRequest.RequiredDate;
			InventoryRequestBody.U_APP_Requester = this.oModel.getData().InventoryRequest.RequesterCode;
			InventoryRequestBody.U_APP_Department = this.oModel.getData().InventoryRequest.DepartmentCode;
			InventoryRequestBody.U_APP_Position = this.oModel.getData().InventoryRequest.PositionCode;
			InventoryRequestBody.Remark = this.oModel.getData().InventoryRequest.Remarks;
			InventoryRequestBody.U_APP_JONum = this.oModel.getData().InventoryRequest.JONum;
			InventoryRequestBody.U_APP_IsDraft="Yes";
			// InventoryRequestBody.U_APP_Attachment=this.oModel.getData().InventoryRequest.AttachmentEntry;
			InventoryRequestBody.APP_IVR1Collection = [];
			var i;
			for (i = 0; i < this.oModel.getData().InventoryRequest.Items.length; i++) {

				InventoryRequestBody.APP_IVR1Collection.push({
					"U_APP_ItemCode": this.oModel.getData().InventoryRequest.Items[i].ItemCode,
					"U_APP_Description": this.oModel.getData().InventoryRequest.Items[i].Description,
					"U_APP_GlAccount": this.oModel.getData().InventoryRequest.Items[i].GlAccount,
					"U_APP_Uom": this.oModel.getData().InventoryRequest.Items[i].UOM,
					"U_APP_EstPrice": APPui5.removeCommas(this.oModel.getData().InventoryRequest.Items[i].EstUnitPrice),
					"U_APP_Quantity": this.oModel.getData().InventoryRequest.Items[i].Quantity,
					"U_APP_Type": this.oModel.getData().InventoryRequest.Items[i].Type,
					"U_APP_EstAmt": APPui5.removeCommas(this.oModel.getData().InventoryRequest.Items[i].EstAmount),
					"U_APP_Whse": this.oModel.getData().InventoryRequest.Items[i].Warehouse,
					"U_APP_TaxCode": this.oModel.getData().InventoryRequest.Items[i].TaxCode,
					"U_APP_FundType": this.oModel.getData().InventoryRequest.Items[i].FundType,
					"U_APP_Division": this.oModel.getData().InventoryRequest.Items[i].Division,
					"U_APP_Depository": this.oModel.getData().InventoryRequest.Items[i].Division,
					"U_APP_Employee": this.oModel.getData().InventoryRequest.Items[i].Employee,
					"U_APP_Department": this.oModel.getData().InventoryRequest.Items[i].Department,
					"U_APP_Program": this.oModel.getData().InventoryRequest.Items[i].Program,
					"U_APP_Notes": this.oModel.getData().InventoryRequest.Items[i].Notes
				});
			}

			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDOCENTRY&VALUE1=" + this.oModel.getData().InventoryRequest.No + "&VALUE=APP_OIVR",
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
				$.ajax({
					url: "https://13.215.36.201:50000/b1s/v1/APP_OIVR(" + results[0].DocEntry + ")",
					data: JSON.stringify(InventoryRequestBody),
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
					success: async function (json) {
						APPui5.APPMESSAGEBOX("Transaction save as  Draft!")
					}
				}).done(function (results) {
					this.onClearData();
				
				});

			});
		},
		onCancel: function () {
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDOCENTRY&VALUE1=" + this.oModel.getData().InventoryRequest.No + "&VALUE=APP_OIVR",
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
				$.ajax({
					url: "https://13.215.36.201:50000/b1s/v1/APP_OIVR(" + results[0].DocEntry + ")/Cancel",
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
					success: function (json) {
						APPui5.APPMESSAGEBOX("Transaction Succesfully Canceled!")
					}
				}).done(function (results) {
					this.onClearData();
				
				});

			});
		},
		OnSearch: function (oEvent) {
			var sQuery = oEvent.getParameter("query");
			this.Filter = null;

			if (sQuery) {
				this.Filter = new Filter([
					new Filter("No", FilterOperator.EQ, sQuery),
					new Filter("Requester", FilterOperator.EQ, sQuery),
					new Filter("Position", FilterOperator.EQ, sQuery),
					new Filter("Department", FilterOperator.EQ, sQuery),
					new Filter("RequestDate", FilterOperator.EQ, sQuery),
					new Filter("RequiredDate", FilterOperator.EQ, sQuery),
					new Filter("Status", FilterOperator.EQ, sQuery)
				], false);
			}
			this._Filter();
		},
		_Filter: function () {
			var oFilter = null;

			if (this.Filter) {
				oFilter = this.Filter;
			}
			this.byId("IVTable").getBinding("rows").filter(oFilter, "Application");
		},
		ApprovalRoute: function (DocType, UserCode, DocNum, DocDate, DueDate, Remarks,totalAmount,oDept,oDepo) {
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_APPROVALROUTE&VALUE1=" + DocType + "&VALUE2=" + UserCode + "&VALUE3=" + DocNum + "&VALUE4=1",
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
				if (results.length != 0) {
					for (var i = 0; i < results.length; i++) {
						var ApprovalPostingBody = {};
						ApprovalPostingBody.U_APP_Status = "Pending";
						ApprovalPostingBody.U_APP_Stage = results[i].U_APP_Stages,
						ApprovalPostingBody.U_APP_Level = results[i].U_APP_Level,
						ApprovalPostingBody.U_APP_Template=results[i].Name,
						ApprovalPostingBody.U_APP_Authorizer = results[i].U_APP_Authorizer;
						ApprovalPostingBody.U_APP_DocType = DocType;
						ApprovalPostingBody.U_APP_DocNum = DocNum;
						ApprovalPostingBody.U_APP_Originator = UserCode;
						ApprovalPostingBody.U_APP_Remarks = Remarks;
						ApprovalPostingBody.U_APP_Department = oDept;
						ApprovalPostingBody.U_APP_Depository = oDepo;

						ApprovalPostingBody.U_APP_DocDate = APPui5.getDateFormat(DocDate);
						ApprovalPostingBody.U_APP_DueDate = APPui5.getDateFormat(DueDate);

						$.ajax({
							url: "https://13.215.36.201:50000/b1s/v1/APP_APRDEC",
							data: JSON.stringify(ApprovalPostingBody),
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
							success: function (json) {
								var oEmail = [];
								var that = this;
								that.onGetEmail(ApprovalPostingBody.U_APP_Authorizer);
								const strAmount = totalAmount;
								const replacedP = 'P' + strAmount.substring(1);
								
								var eDepartment = ""; 
								if(oSelectedDept !== ""){
								  eDepartment = oSelectedDept;
								}else{
								  eDepartment = oSelectedDepo;
								}
								
								oEmail.push({
								  "receiver": localStorage.getItem("ApproverEmail"),
								  "DocumentNo":  ApprovalPostingBody.U_APP_DocNum,
								  "Department": eDepartment,
								  "Payee":  localStorage.getItem("RequestorName"),
								  "Amount": replacedP,
								  "Subject": "[INVENTORY REQUEST]",
								  "Date": APPui5.getDatePostingFormat(DocDate),
								  "Remarks": ApprovalPostingBody.U_APP_Remarks,
								  "Approver": localStorage.getItem("ApproverName"),
								  "Originator": localStorage.getItem("RequestorName")
								});
								that.onSendEmail(oEmail);
							}
						}).done(function (results) {
						});
					}
				}
				else {
					// this.PostToSAP(this.oModel.getData().InventoryRequest.No);
					APPui5.APPMESSAGEBOX("No Approval path found for this transaction.");
				}

			});
		},

		onSendEmail: function(Content){
			console.log(Content)
			var settings = {
			  "url": "https://digitalhub.dlsl.edu.ph/RequestorToApprover",
			  "method": "POST",
			  "timeout": 0,
			  "headers": {
				"Content-Type": "application/json"
			  },
			  "data": JSON.stringify(Content),
			};
			
			$.ajax(settings).done(function (response) {
				APPui5.APPMESSAGEBOX("Email notification sent to:" + Content[0].receiver);
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
			  },
			  success: function (json) {
			  },
			  context: this
			}).done(function (results) {
				console.log(results)
				localStorage.setItem("ApproverEmail",results[0].E_Mail);
				localStorage.setItem("ApproverName",results[0].U_NAME);             
			});
		  },      
	  
		PostToSAP: function (DocNum) {
			var InventoryRequest = {};
			InventoryRequest.DocObjectCode = "oInventoryGenExit"
			InventoryRequest.U_APP_MSQRNO = this.oModel.getData().InventoryRequest.No;
			InventoryRequest.U_APP_Requester = this.oModel.getData().InventoryRequest.RequesterCode;
			InventoryRequest.DocDate = this.oModel.getData().InventoryRequest.RequestDate;
			InventoryRequest.DocDueDate = this.oModel.getData().InventoryRequest.RequiredDate;
			InventoryRequest.Comments = this.oModel.getData().InventoryRequest.Remarks;
			InventoryRequest.U_APP_JONO = this.oModel.getData().InventoryRequest.JONum;
			InventoryRequest.DocType = "dDocument_Items";
			// if (this.oModel.getData().InventoryRequest.AttachmentEntry !=='0'){
			// 	InventoryRequest.AttachmentEntry=this.oModel.getData().InventoryRequest.AttachmentEntry;
			// }
			InventoryRequest.DocumentLines = [];

			for (var i = 0; i < this.oModel.getData().InventoryRequest.Items.length; i++) {

				InventoryRequest.DocumentLines.push({
					"ItemCode": this.oModel.getData().InventoryRequest.Items[i].ItemCode,
					"ItemDescription": this.oModel.getData().InventoryRequest.Items[i].Description,
					"U_APP_Type": this.oModel.getData().InventoryRequest.Items[i].Type,
					"AccountCode": this.oModel.getData().InventoryRequest.Items[i].GlAccount,
					"CostingCode": this.oModel.getData().InventoryRequest.Items[i].FundType,
					"CostingCode2": this.oModel.getData().InventoryRequest.Items[i].Division,
					"CostingCode3": this.oModel.getData().InventoryRequest.Items[i].Program,
					"CostingCode4": this.oModel.getData().InventoryRequest.Items[i].Department,
					"CostingCode5": this.oModel.getData().InventoryRequest.Items[i].Employee,
					"Quantity": this.oModel.getData().InventoryRequest.Items[i].Quantity,
					"UoMCode": this.oModel.getData().InventoryRequest.Items[i].UOM,
					"VatGroup": this.oModel.getData().InventoryRequest.Items[i].TaxCode,
					"WarehouseCode": this.oModel.getData().InventoryRequest.Items[i].Warehouse,
					"U_APP_Notes": this.oModel.getData().InventoryRequest.Items[i].Notes
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
					var Message = xhr.responseJSON["error"].message.value;
					APPui5.APPMESSAGEBOX(Message);
				},
				context: this,
				success: function (json) {
					$.ajax({
						url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDOCENTRY&VALUE1=" + DocNum + "&VALUE=APP_OIVR",
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
						$.ajax({
							url: "https://13.215.36.201:50000/b1s/v1/APP_OIVR(" + results[0].DocEntry + ")/Close",
							type: "POST",
							crossDomain: true,
							xhrFields: {
								withCredentials: true
							},
							error: function (xhr, status, error) {
								var Message = xhr.responseJSON["error"].message.value;
								APPui5.APPMESSAGEBOX(Message);
								return
							},
							context: this,
							success: function (json) {
							}
						}).done(function (results) {
						});

					});
					APPui5.APPMESSAGEBOX("Transaction Succesfully Posted in SAP!");
          
				}
			}).done(function (results) {
			});
		},
		onInquiry: function () {
			var DocNum = this.oModel.getData().InventoryRequest.No;
			var ApprovalInquiryRecord = {
				"DocNum": DocNum
			};
			var oModelDocNum = new JSONModel(ApprovalInquiryRecord);
			this.getOwnerComponent().setModel(oModelDocNum, "oModelDocNum");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("InventoryRequestInquiry");

		},
		onPreview: function(){  
    
			if (!this.oReportViewer) {
			  this.oReportViewer = sap.ui.xmlfragment("com.apptech.DLSL.view.fragments.ReportViewer",this);
			  this.getView().addDependent(this.oReportViewer);
			}
			
			this.oReportViewer.open();
		  
			var docentry = this.oModel.getData().InventoryRequest.DocEntry;
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

		  onAttachmentDoc: function(Code){
			// try{
			// 	var attachmentDoc = {};
			// 	var ottachments =  this.oModel.getData().Attachments;
			// 	for(let i = 0;i < ottachments.length;i++){
			// 		attachmentDoc.U_FreeText = ottachments[i].U_FreeText;
			// 		attachmentDoc.U_DocEntry = Code;
					
			// 		$.ajax({
			// 			url: "https://13.215.36.201:50000/b1s/v1/U_APP_ATCH('" + ottachments[i].Code + "')",
			// 			data: JSON.stringify(attachmentDoc),
			// 			type: "PATCH",
			// 			crossDomain: true,
			// 			xhrFields: {
			// 				withCredentials: true
			// 			},
			// 			error: function (xhr, status, error) {
			// 				var Message = xhr.responseJSON["error"].message.value;
			// 				APPui5.APPMESSAGEBOX(Message);
			// 				console.log(Message)
			// 			},
			// 			success: function (json) {
			// 			},
			// 			context: this
			// 		}).done(function (results) {
					
			// 		});
			// 	}
			// }catch (e){
			// 	console.log(e)
			// }
		  },

		  onAttachmentDocUpdate: function(Code){
			try{
				var attachmentDoc = {};
				var oAttachments =  this.oModel.getData().Attachments;
				for(let i = 0;i < oAttachments.length;i++){
					attachmentDoc.U_FreeText = oAttachments[i].U_FreeText;
					
					$.ajax({
						url: "https://13.215.36.201:50000/b1s/v1/U_APP_ATCH('" + oAttachments[i].Code + "')",
						data: JSON.stringify(attachmentDoc),
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
						success: function (json) {
						},
						context: this
					}).done(function (results) {
					
					});
				}
			}catch (e){
				console.log(e)
			}
		  },

		  onAttachmentDelete: function(oEvent){
			try{
			var that = this;
			var oAttachments = that.oModel.getData().Attachments;
			var myInputControl = oEvent.getSource(); // e.g. the first item
			var opath = myInputControl.getBindingContext('oModel').getPath();
			var indexItem = opath.split("/");
			var ii =indexItem[2];
				MessageBox.information("Are you sure you want to delete this attachment??", {
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					title: "Delete Atatchment",
					icon: MessageBox.Icon.QUESTION,
					styleClass:"sapUiSizeCompact",
					onClose: function (sButton) {
					  if(sButton == "YES"){
							$.ajax({
								url: "https://13.215.36.201:50000/b1s/v1/U_APP_ATCH('" + oAttachments[ii].Code + "')",
								type: "DELETE",
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
								context: that
								}).done(function (results) {
									oAttachments.splice(ii,1);
									that.oModel.refresh();
							});
						}
					}
				  });
			}catch (e){
				console.log(e)
			}
		  },

		  onAttchFile: function(oEvent){
				var that = this;
				localStorage.setItem("AttcEntry","");
				that.oModel.getData().Attachments = [];
				var aFiles = oEvent.getParameters().files;
				that.oModel.getData().Attachments = [];
				var form = new FormData();
				for(let a=0; a < aFiles.length;a++){
				that.currentFile =  oEvent.getParameters().files[a];
				var FileName = aFiles[a].name;
				form.append("file", that.currentFile, FileName);
				}
	
			$.ajax({
				url:"https://13.215.36.201:50000/b1s/v1/Attachments2",
				data: form,
				headers: { "prefer": "return-no-content","B1S-ReplaceCollectionsOnPatch":true},
				type: "POST",
				processData: false,
				mimeType: "multipart/form-data",
				contentType: false,
				context: this,
				xhrFields: {
				withCredentials: true
				},
				error: function (xhr, status, error) {
				APPui5.APPMESSAGEBOX(error);
				return
				},
				success: function (json) {
				// that.DeleteAttachment();
				var oResult = JSON.parse(json);
				iKey = oResult.AbsoluteEntry;
				that.oModel.getData().Attachments = oResult.Attachments2_Lines;
				that.oModel.refresh()
				localStorage.setItem("AttcEntry",oResult.AbsoluteEntry);
				APPui5.APPMESSAGEBOX(that.oModel.getData().Attachments.length + " file uploaded.");
				}
			});
			that.getView().byId("fileUploader1").setValue("");
			that.oModel.refresh();
		},

		getFromAttachment: function(DocEntry){
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

		onUpdateAttachnent: function(){
			var that = this;
			var oTCH = that.oModel.getData().Attachments;
			var oBody = {};
			oBody.Attachments2_Lines = [];
			
			for(let i = 0;i < oTCH.length;i++){
			  oBody.Attachments2_Lines.push({
				"AbsoluteEntry": oTCH[i].AbsoluteEntry,
				"FileExtension": oTCH[i].FileExtension,
				"FileName": oTCH[i].FileName,
				"FreeText": oTCH[i].FreeText,
				"Override": "tYES",
				"SourcePath": oTCH[i].SourcePath,
			  });
			}
	  
			$.ajax({
			  url: "https://13.215.36.201:50000/b1s/v1/Attachments2("+ localStorage.getItem("AttcEntry") +")",
			  data: JSON.stringify(oBody),
			  headers: { "prefer": "return-no-content","B1S-ReplaceCollectionsOnPatch":true},
			  type: "PATCH",
			  crossDomain: true,
			  context:that,
			  xhrFields: {
				  withCredentials: true
			  },error: function (xhr, status, error) {
				  var Message = xhr.responseJSON["error"].message.value;
					console.log(Message)
				  return
			  },success:async function (json) {
				console.log("Success");
			  }
			});
		  },
	
		  DeleteAttachment: function(){
			var that = this;
			$.ajax({
			  url: "https://13.215.36.201:50000/b1s/v1/Attachments2('" + localStorage.getItem("AttcEntry") + "')",
			  type: "DELETE",
			  crossDomain: true,
			  context: that,
			  xhrFields: {
				withCredentials: true
			  },
			  error: function (xhr, status, error) {
				var Message = xhr.responseJSON["error"].message.value;
				console.log(Message)
			  },
			  success: function (json) {
				localStorage.setItem("AttcEntry", "");
			  }
			  });
		  },

		  

	});
});
