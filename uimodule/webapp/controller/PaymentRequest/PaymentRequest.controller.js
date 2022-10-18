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
  var payeeCode;
  var opayeeName;
  var CustCode;
  var PRMStatus;
  var GLforSAP;
  var GLforWeb;
  var divResult;
  var oDocNum;
  var OTCH = [];
  var WHTax = "No";
  var WithCompute;
  var WTCode;
  var ABudget;
  var oBudget;
  var oMonthly;
  var getMonthly;
  var oDept;
  var iKey;
  var oSelectedDept;
  var oSelectedDepo;
  var oFileExistContainer = [];
  var oFileExist = 0;
	return Controller.extend("com.apptech.DLSL.controller.PaymentRequest.PaymentRequest", {
    onInit: function(){
			this.onHideDetails();
			document.body.style.zoom = "90%" 
      		this.oModel = new JSONModel("model/paymentrequest.json");
			this.getView().setModel(this.oModel, "oModel");
			this.router = this.getOwnerComponent().getRouter();
			this.iSelectedRow = 0;
			this.FileKey;
			payeeCode = "";
			opayeeName = "";
			localStorage.setItem("AttcEntry", "");
			this.onThreeDays();
		
			oBudget = 0;
			ABudget = 0;
			this.DocNum=0;
			var Router=sap.ui.core.UIComponent.getRouterFor(this);
			Router.getRoute("PaymentRequest").attachMatched(this._onRouterMatched,this);
			this.getView().byId("position").setVisible(false);

        var oView = this.getView();
        oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: async function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                await oView.getController().OnLoadUsers();
                await oView.getController().onLoadPositions();
                await oView.getController().OnLoadUserDept();
                await oView.getController().onLoadItems();
                await oView.getController().onLoadGL();
                await oView.getController().onLoadDimensions();
                await oView.getController().onLoadUOM();
                await oView.getController().onLoadPayee();
                await oView.getController().onLoadTaxCodes();		
                await oView.getController().OnLoadRecords();
                await oView.getController().OnLoadDept();
                await oView.getController().onLoadSpecialist();
                await oView.getController().onLoadLoanType();
                // this.getView().byId("RequestDateID").setValue(APPui5.getDateFormat(new Date()));
              },
            onBeforeFirstShow: function(evt) {
                //This event is fired before the NavContainer shows this child control for the first time.
              },
            onBeforeHide: function(evt) {

            },
            onBeforeShow: function(evt) {
                //This event is fired every time before the NavContainer shows this child control.
                // that.initialize(evt.data);
            }
        });
      },
	
	  onThreeDays: function(){
		var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
		var today  = new Date();
		var getDay = today.toLocaleDateString("en-US", options);
		getDay = getDay.split(",");
		var currentDay = getDay[0];
		var tomorrow = new Date();

		var dayplus = 0;
		if(currentDay == "Thursday"){
			dayplus = 4;
		}else if(currentDay == "Friday"){
			dayplus = 4;
		}else if(currentDay == "Saturday"){
			dayplus = 5;
		}else if(currentDay == "Sunday"){
			dayplus = 4;
		}else{
			dayplus = 3;
		}
	
		tomorrow.setDate(today.getDate()+dayplus);
		var dd = String(tomorrow.getDate()).padStart(2, '0');
        var mm = String(tomorrow.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = tomorrow.getFullYear();
		tomorrow =  yyyy + "-" + mm + "-" + dd;
		this.getView().byId("RequiredDateID").setValue(tomorrow);
	  },
	  onCheckWithHoldingTax: function(CustCode){
		WTCode = "";
		WHTax = "No";
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
            if (results.length == 0) {
				WHTax = "No";
				// this.getView().byId("TaxAmount").setVisible(false);
				this.getView().byId("WTCode").setVisible(true);
             	this.oModel.refresh();
            }else {
				
				WTCode = results[0].WTCode;

				if(results[0].WTCode.charAt(0) == "C"){
					WithCompute = "true";
				}else{
					WithCompute = "false";
				}
				WHTax = "Yes";
				this.getView().byId("TaxAmount").setVisible(true);
				this.getView().byId("WTCode").setVisible(true);
				this.oModel.refresh();
			}
          });
	  },

      _onRouterMatched:function(oEvent){
        try{
          var oModelDocNum=this.getView().getModel("oModelDocNum");
          this.DocNum=oModelDocNum.getData().DocNum;
          this.getView().byId("PMTNo").setValue(this.DocNum);
          this.oModel.getData().isEnabled=false;           
          this.onLoadPMTRecord();
        }catch (e){
          console.log(e)
        } 
      },

      
      onViewAttachment: function(oEvent){
		this.iSelectedRow = oEvent.getSource().getParent().getIndex();
        window.open("https://13.215.36.201:50000/b1s/v1/Attachments2(" + localStorage.getItem("AttcEntry") + ")/$value?filename='" + this.oModel.getData().Attachments[this.iSelectedRow].FileName + "." + this.oModel.getData().Attachments[this.iSelectedRow].FileExtension +  "'");
      },

      OpenUpdateScreen: function () {
        this.onClearData();
        PRMStatus = "";
        this.getView().byId("PMTNo").setEditable(true);
        if(this.getView().byId("PMTNo").getValue() !== ""){
        this.onLoadPMTRecord(this.getView().byId("PMTNo").getValue());
		this.oModel.getData().PaymentRequest.No = this.getView().byId("PMTNo").getValue();
        this.oModel.getData().Attachments = [];
        
        this.oModel.getData().Controls.AddOrEdit = "Update Payment Request";
        this.oModel.refresh();
        this.getView().byId("status").setEditable(false);
        this.getView().byId("CancelBtn").setEnabled(true);      

        this.OnLoadUsers();
        var storedUser = this.oModel.getData().Users;
        const sSRI = storedUser.filter(function(SSI){
        return SSI.UserCode == localStorage.getItem("UserCode")})
        this.getView().byId("position").setValue(sSRI[0].jobTitle);
        this.getView().byId("position").setEnabled(false);	

		this.oModel.getData().Attachments = [];
		
        if (PRMStatus === "C") {
          this.getView().byId("CancelBtn").setEnabled(false);
          this.oModel.getData().isEnabled = false;
          this.getView().byId("AddrowID").setEnabled(false);
          this.getView().byId("DelRowID").setEnabled(false);
		 
		   this.getView().byId("fileUploader1").setEnabled(false);
          this.oModel.refresh();
        }else {
          this.getView().byId("AddrowID").setEnabled(true);
          this.getView().byId("DelRowID").setEnabled(true);
		  this.getView().byId("fileUploader1").setEnabled(true);
          $.ajax({
            url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_CHECKAPPROVAL&VALUE1=" + this.getView().byId("PMTNo").getValue() + "&VALUE2=Payment Request",
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
              this.oModel.getData().isEnabled = true;
              this.oModel.refresh();
            }
            else {
              this.getView().byId("CancelBtn").setEnabled(false);
              this.oModel.getData().isEnabled = false;
              this.oModel.refresh();
            }
          });
        }
      }
      }, 

		OpenAddScreen: function () {
      		this.onClearData();
			oSelectedDept = "";
			oSelectedDepo = "";
			this.oModel.getData().Controls.AddOrEdit = "Add Payment Request";
			this.oModel.refresh();
			this.getView().byId("PMTNo").setEditable(false);
      		this.getView().byId("PMTNo").setValue("");
			this.getView().byId("status").setEditable(false);
			this.getView().byId("CancelBtn").setEnabled(false);
      		this.getView().byId("AddrowID").setEnabled(true);
      		this.getView().byId("DelRowID").setEnabled(true);
			this.getView().byId("fileUploader1").setEnabled(true);
			this.oModel.getData().Attachments = [];
			this.getView().byId("status").setSelectedKey("O");
			// this.getNextNumber();
      		this.getView().byId("PMTNo").setValue(this.oModel.getData().PaymentRequest.No);

			this.oModel.getData().PaymentRequest.RequestDate = APPui5.getDateFormat(new Date());
     
			this.oModel.getData().PaymentRequest.RequesterCode = localStorage.getItem("UserCode");
			this.onChangeUser(localStorage.getItem("UserCode"));
			this.oModel.getData().isEnabled = true;
      
			this.OnLoadUsers();
			var storedUser = this.oModel.getData().Users;
			const sSRI = storedUser.filter(function(SSI){
			return SSI.UserCode == localStorage.getItem("UserCode")})
			this.getView().byId("position").setValue(sSRI[0].jobTitle);
			this.getView().byId("position").setEnabled(false);	
			this.oModel.refresh();
			this.onThreeDays();
			localStorage.setItem("AttcEntry", "");
			this.oModel.getData().PaymentRequest.FundType = ""; 
			this.oModel.getData().PaymentRequest.Program = "";
			this.oModel.getData().PaymentRequest.Division = "";
			this.oModel.getData().PaymentRequest.DepartmentCode1 = ""; 
			this.oModel.getData().PaymentRequest.Division = "";
			payeeCode = "";
			this.oModel.getData().PaymentRequest.employeeType = ""; 
			this.OnAddRow();
		},

    onChangeView: function(){
      if(this.getView().byId("detailsview").getIcon() == "sap-icon://hide"){
        this.onShowDetails();
      }else{
        this.onHideDetails();
      }
    },
    
    onHideDetails: function(){
	  this.getView().byId("detailsview").setIcon("sap-icon://hide");
	  this.getView().byId("PaymentRequestItems").getColumns()[3].setVisible(false);
	  this.getView().byId("PaymentRequestItems").getColumns()[9].setVisible(false);
	  this.getView().byId("PaymentRequestItems").getColumns()[11].setVisible(false);
	  this.getView().byId("PaymentRequestItems").getColumns()[12].setVisible(false);
	  this.getView().byId("PaymentRequestItems").getColumns()[13].setVisible(false);

	  this.getView().byId("PaymentRequestItems").getColumns()[15].setVisible(false);
      this.getView().byId("PaymentRequestItems").getColumns()[16].setVisible(false);
      this.getView().byId("PaymentRequestItems").getColumns()[17].setVisible(false);
      this.getView().byId("PaymentRequestItems").getColumns()[18].setVisible(false);
      this.getView().byId("PaymentRequestItems").getColumns()[19].setVisible(false);
      this.getView().byId("PaymentRequestItems").getColumns()[20].setVisible(false);
	  this.getView().byId("PaymentRequestItems").getColumns()[21].setVisible(false);
	  this.getView().byId("PaymentRequestItems").getColumns()[22].setVisible(false);
    },

    onShowDetails: function(){
	  this.getView().byId("detailsview").setIcon("sap-icon://show");
	  this.getView().byId("PaymentRequestItems").getColumns()[3].setVisible(true);
	  this.getView().byId("PaymentRequestItems").getColumns()[9].setVisible(true);
	  this.getView().byId("PaymentRequestItems").getColumns()[11].setVisible(true);
	  this.getView().byId("PaymentRequestItems").getColumns()[12].setVisible(true);
	  this.getView().byId("PaymentRequestItems").getColumns()[13].setVisible(true);
	
      this.getView().byId("PaymentRequestItems").getColumns()[15].setVisible(true);
      this.getView().byId("PaymentRequestItems").getColumns()[15].setVisible(true);
      this.getView().byId("PaymentRequestItems").getColumns()[16].setVisible(true);
      this.getView().byId("PaymentRequestItems").getColumns()[17].setVisible(true);
      this.getView().byId("PaymentRequestItems").getColumns()[18].setVisible(true);
      this.getView().byId("PaymentRequestItems").getColumns()[19].setVisible(true);
	  this.getView().byId("PaymentRequestItems").getColumns()[20].setVisible(true);
	  this.getView().byId("PaymentRequestItems").getColumns()[21].setVisible(true);
	  this.getView().byId("PaymentRequestItems").getColumns()[22].setVisible(true);
    },
    onSelectionChange: function(oEvent) {
      var oYourTable = this.getView().byId("PMTTable"),
          iSelectedIndex = oEvent.getSource().getSelectedIndex();
  
      oYourTable.setSelectedIndex(iSelectedIndex);
    },
    onSelectionChange1: function(oEvent) {
      var oYourTable = this.getView().byId("PaymentRequestItems"),
          iSelectedIndex = oEvent.getSource().getSelectedIndex();
      oYourTable.setSelectedIndex(iSelectedIndex);
    },

    onFindData: function(){
      if(this.getView().byId("PMTNo").setEditable(true)){
        this.OnLoadRecords();
        this.getView().byId("status").setEditable(false);
        this.getView().byId("CancelBtn").setEnabled(true);
        this.oModel.getData().Controls.AddOrEdit = "Update Payment Request";
        this.handleValueHelpPM();
      }else{
        this.OpenAddScreen();
      }
    },

    onChangeNumber: function(){
      if(this.getView().byId("PMTNo").getValue() !== ""){
        this.OpenUpdateScreen();
      }
    },

		OnCancelScreen: async function () {
			var prompt = await APPui5.onPrompt("WARNING MESSAGE!", "Are you sure you want to go back without adding/updating the document?");
			if (prompt === 0) {
				return;
			}
			this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("");
			var tab = this.getView().byId("idIconTabBarInlineMode");
			tab.setSelectedKey("PMTRecords");
		},
		OnAddRow: function () {

			if(WHTax !== "No"){
				this.getView().byId("TaxAmount").setVisible(true);
			}else{
				// this.getView().byId("TaxAmount").setVisible(false);
			}

			this.oModel.getData().PaymentRequest.Items.push({
				"ItemCode": "",
				"Description": "",
				"Type": "",
				"GlAccount": "",
				"FundType": this.oModel.getData().PaymentRequest.FundType,
				"Program": this.oModel.getData().PaymentRequest.Program,
        		"Depository": this.oModel.getData().PaymentRequest.Division,
				"Department":  this.oModel.getData().PaymentRequest.DepartmentCode1,
				"Division": this.oModel.getData().PaymentRequest.Division,
				"Employee": payeeCode,
        		"EmployeeType": this.oModel.getData().PaymentRequest.employeeType,
				"Quantity": "1",
				"UOM": "Manual",
				"EstUnitPrice": "0",
				"EstAmount": "0.00",
				"BudgetAvailable": "0",
				"TaxCode": "",
				"Notes": "",
				"SpecialistCode": "",
				"Warehouse": "WHSE1",
				"SAPGL": "",
				"TaxLiable": WHTax,
				"TaxAmount": 0,
				"WTCode": WTCode
			});
			// this.oModel.getData().PaymentRequest.employeeType = "";
			// this.oModel.getData().PaymentRequest.Division = "";
			// this.oModel.getData().PaymentRequest.DepartmentCode1 = ""; 
			this.oModel.refresh();
		},
		OnDeleteRow: function () {
			this.tblItems = this.getView().byId("PaymentRequestItems");
			this.oModel.getData().PaymentRequest.Items.splice(this.tblItems.getSelectedIndex(), 1);
			this.oModel.refresh();
		},


		onLoadUserRecords: function(){
			try{
				this.oModel.getData().PaymentRequestRecords = [];
				this.oModel.refresh();
				var urlStr = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=spApp_GetTransaction&VALUE1=APP_ORFP&VALUE2=" + localStorage.getItem("UserCode");
				$.ajax({
				url: urlStr,
				type: "GET",
				async: false,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
				},
				error: function (xhr, status, error) {
					// var Message = xhr.responseJSON["error"].message.value;
					// APPui5.APPMESSAGEBOX(Message);;
				},
				success: function (json) {
				  },
			context: this
			}).done(function (results) {
				for (let i = 0; i < results.length; i++) {   
					var StatusName="";
					var infoStatate = "Information";
		
				if(results[i].Status == "C"){
					infoStatate = "Success";
					StatusName = "Close";
				}else{
					infoStatate = "Information";
					StatusName = "Open";
				}
					this.oModel.getData().PaymentRequestRecords.push({
						"No": results[i].DocNum,
						"RequesterName": results[i].U_NAME,
						"Requester": results[i].U_APP_Requester,
						"Position": results[i].U_APP_Position,
						"Department": results[i].U_APP_Department,
						"RequestDate": APPui5.getDatePostingFormat(results[i].U_APP_RequestDate),
						"RequiredDate": APPui5.getDatePostingFormat(results[i].U_APP_RequiredDate),
						"Payee": results[i].U_APP_Payee,
						"PayeeName": results[i].CardName,
						"Status": StatusName,
						"Remarks": results[i].Remark,
						"Draft":results[i].U_APP_IsDraft
					});
				}
						this.oModel.refresh();
					});
			}catch (e) {
				console.log(e)
			}
		},

		onLoadAdminRecords: function(){
			try{
				this.oModel.getData().PaymentRequestRecords = [];
				this.oModel.refresh();
				var urlStr = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=spApp_AdminTransaction&VALUE1=APP_ORFP";
				$.ajax({
				url: urlStr,
				type: "GET",
				async: false,
				beforeSend: function (xhr) {
					xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
				},
				error: function (xhr, status, error) {
					// var Message = xhr.responseJSON["error"].message.value;
					// APPui5.APPMESSAGEBOX(Message);;
				},
				success: function (json) {
				  },
			context: this
			}).done(function (results) {
				for (let i = 0; i < results.length; i++) {   
					var StatusName="";
					var infoStatate = "Information";
		
				if(results[i].Status == "C"){
					infoStatate = "Success";
					StatusName = "Close";
				}else{
					infoStatate = "Information";
					StatusName = "Open";
				}
					this.oModel.getData().PaymentRequestRecords.push({
						"No": results[i].DocNum,
						"RequesterName": results[i].U_NAME,
						"Requester": results[i].U_APP_Requester,
						"Position": results[i].U_APP_Position,
						"Department": results[i].U_APP_Department,
						"RequestDate": APPui5.getDatePostingFormat(results[i].U_APP_RequestDate),
						"RequiredDate": APPui5.getDatePostingFormat(results[i].U_APP_RequiredDate),
						"Payee": results[i].U_APP_Payee,
						"PayeeName": results[i].CardName,
						"Status": StatusName,
						"Remarks": results[i].Remark,
						"Draft":results[i].U_APP_IsDraft
					});
				}
						this.oModel.refresh();
					});
			}catch (e) {
				console.log(e)
			}
		},
		
		OnLoadRecords: function () {
			if(localStorage.getItem("UserType") !== "Administrator"){
				this.onLoadUserRecords();
			  }else{  
				this.onLoadAdminRecords();
			  }
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
					APPui5.APPMESSAGEBOX(Message);;
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
				crossDomain: true,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;
					APPui5.APPMESSAGEBOX(Message);;
				},
				success: function (json) {
				},
				context: this
			}).done(function (results) {
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
					APPui5.APPMESSAGEBOX(Message);;
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
			});
		},
		onLoadItems: function () {
			this.oModel.getData().Items = [];
			var oURL = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETUSERITEMS&VALUE1=Payment Request&VALUE2=" + localStorage.getItem("DepartmentID");

			$.ajax({
				url: oURL,
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
				var i;
				for (i = 0; i < results.length; i++) {
					this.oModel.getData().Items.push({
						"ItemCode": results[i].U_ItemCode,
						"ItemName": results[i].ItemName,
            			"U_GLAccount": results[i].U_GLAccount
					});
				}
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
					APPui5.APPMESSAGEBOX(Message);;
				},
				success: function (json) {
				},
				context: this
			}).done(function (results) {
				var i;
				for (i = 0; i < results.length; i++) {
					this.oModel.getData().GL.push({
						"AcctCode": results[i].AcctCode,
						"AcctName": results[i].AcctName
					});
				}
			});
		},

        OnLoadUserDept: function () {
			this.oModel.getData().Dept = [];
			this.oModel.getData().Div = [];
			var oUrl = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=GET_USERDEPT&VALUE1=" + localStorage.getItem("UserCode");
			$.ajax({
			  url: oUrl,
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
					  	  "U_FundType": results[i].U_FundType,
					  })
				  }
					  }
					  this.oModel.refresh();
			});
		  },

		  onAccumulateBudget: function(Department, GlAccount){
			getMonthly = 0;
			var oMonths = [
				{"value": 0},
				{"value": 1},
				{"value":2},
				{"value": 3},
				{"value": 4},
				{"value":  5},
				{"value": 6},
				{"value": 7},
				{"value": 8},
				{"value": 9},
				{"value": 10},
				{"value": 11}
			  ];
	
			  for(let i =0; i < oMonths.length;i++){
				var ovalue = oMonths[i].value;
				if(parseInt(localStorage.getItem("Month")) >= parseInt(ovalue)){
					this.onMonthlyBudget(Department, GlAccount,ovalue);
					getMonthly = getMonthly + oMonthly;
				}
			  }
		  },

		  onMonthlyBudget: function(Department, GlAccount,Code){
			var oUrl = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_AccmBudget&VALUE1=" + Department +"&VALUE2=" + GlAccount + "&VALUE3=" + Code;
			$.ajax({
			  url: oUrl,
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
				if(json.length !== 0){
					oMonthly = json[0].MONTHLY;
				} 
			  },
			  context: this
			}).done(function (results){
				
			});
		  },

		  onGetAvailableBudget: function (Department, GlAccount, SAPGL) {
			var oUrl = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GetBudget&VALUE1=" + Department +"&VALUE2=" + GlAccount + "&VALUE3=" + SAPGL;
			$.ajax({
			  url: oUrl,
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
			}).done(function (results){
				oBudget = 0;
				ABudget = 0;
				var onbudget = 0;
				if(results.length !== 0){
					this.onAccumulateBudget(Department, GlAccount);				
					onbudget = 	parseFloat(getMonthly).toFixed(2) - parseFloat(results[0].GOODSISSUE).toFixed(2) - parseFloat(results[0].GRPO).toFixed(2) - 	parseFloat(results[0].GRPODRAFT).toFixed(2) - 	parseFloat(results[0].GRPOJV).toFixed(2) - 	parseFloat(results[0].PODRAFT).toFixed(2) - 	parseFloat(results[0].POJV).toFixed(2) - 	parseFloat(results[0].PRDRAFT).toFixed(2) - 	parseFloat(results[0].PRJV).toFixed(2) - 	parseFloat(results[0].PURCHASEORDER).toFixed(2) - 	parseFloat(results[0].PURCHASEREQUEST).toFixed(2) - 	parseFloat(results[0].WEBINVENTORY).toFixed(2) - parseFloat(results[0].WEBPAYMENT).toFixed(2) - parseFloat(results[0].WEBPURCHASE).toFixed(2);
					onbudget = parseFloat(onbudget).toFixed(2) + parseFloat(results[0].GRPOCM).toFixed(2) + parseFloat(results[0].POCM).toFixed(2) + parseFloat(results[0].PRCM).toFixed(2);
					oBudget = onbudget;
					ABudget = onbudget;
				}
				// console.log(getMonthly);
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
					APPui5.APPMESSAGEBOX(Message);;
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
					APPui5.APPMESSAGEBOX(Message);;
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
			});
		},
		onLoadPayee: function () {
			this.oModel.getData().Payee = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETVENDOR",
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
				var i;
				for (i = 0; i < results.length; i++) {
					this.oModel.getData().Payee.push({
						"CardCode": results[i].CardCode,
						"CardName": results[i].CardName,
            			"U_EmployeeCode": results[i].U_EmployeeCode
					})
				}
				this.oModel.refresh();
			});
		},
    	onLoadLoanType: function () {
			this.oModel.getData().LoanType = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETEMPLOYEETYPE",
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
				var i;
				for (i = 0; i < results.length; i++) {
					this.oModel.getData().LoanType.push({
						"Code": results[i].Code,
						"Name": results[i].Name
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
					APPui5.APPMESSAGEBOX(Message);;
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
			});
		},
		loadUpdateDepartment: function(DeptCode,DType){
			$.ajax({
			  url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDIMDESCRIPTION&Value1=" + DeptCode,
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
				console.log(results)
				if(DType !== "Depository"){
					for(let i = 0; i < results.length; i++) {
						this.oModel.getData().PaymentRequest.DepartmentName1 = results[i].PrcName;
					}
				}else{
					for(let i = 0; i < results.length; i++) {
						this.oModel.getData().PaymentRequest.DivisionName = results[i].PrcName;
					}
				}
			  this.oModel.refresh();
			});
		},

		onLoadPMTRecord: function (RowIndex) {
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDOCENTRY&VALUE1=" + this.getView().byId("PMTNo").getValue() + "&VALUE2=APP_ORFP",
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
				$.ajax({
					url: "https://13.215.36.201:50000/b1s/v1/APP_ORFP(" + results[0].DocEntry + ")",
					type: "GET",
					crossDomain: true,
         			 async: false,
					xhrFields: {
						withCredentials: true
					},
					error: function (xhr, status, error) {
						var Message = xhr.responseJSON["error"].message.value;
						APPui5.APPMESSAGEBOX(Message);;
					},
					success: function (json) {
					},
					context: this
				}).done(function (results) {
					var DepartmentName = "";
					var RequesterName = "";
					var PayeeName = "";
					console.log(results);
					const result = this.oModel.getData().Department.find(({ Code }) => Code === parseInt(results.U_APP_Department));
					if (result != undefined) {
						DepartmentName = result.Description;
					}
					const resultrequester = this.oModel.getData().Users.find(({ UserCode }) => UserCode === results.U_APP_Requester)
					if (resultrequester != undefined) {
						RequesterName = resultrequester.UserName;
					}
							
					this.onLoadPayee();
					var payeecode = results.U_APP_Payee;
					var stroredPayee = this.oModel.getData().Payee;
					const sSRI = stroredPayee.filter(function(SSI){
					return SSI.CardCode == payeecode})

					if(sSRI.length !== 0){
						PayeeName = sSRI[0].CardName;
					}else{
						PayeeName = "";
					}
					
					this.onCheckWithHoldingTax(payeecode);
					this.oModel.getData().PaymentRequest.DocEntry=results.DocEntry;
					this.oModel.getData().PaymentRequest.No = results.DocNum;
					this.oModel.getData().PaymentRequest.RequestDate = results.U_APP_RequestDate;
					this.oModel.getData().PaymentRequest.RequiredDate = results.U_APP_RequiredDate;
					this.oModel.getData().PaymentRequest.RequesterCode = results.U_APP_Requester;
					this.oModel.getData().PaymentRequest.RequesterName = localStorage.getItem("loginName");
					this.oModel.getData().PaymentRequest.DepartmentCode = results.RequesterDepartment;
					this.oModel.getData().PaymentRequest.DepartmentName = DepartmentName;
					this.getView().byId("position").setSelectedKey(results.U_APP_Position);
					this.oModel.getData().PaymentRequest.PositionCode = results.U_APP_Position;
					this.oModel.getData().PaymentRequest.Remarks = results.Remark;
					this.getView().byId("status").setSelectedKey(results.Status);
   
          			PRMStatus = results.Status;
					this.oModel.getData().PaymentRequest.StatusCode = results.Status;
					this.oModel.getData().PaymentRequest.Payee = results.U_APP_Payee;
					this.oModel.getData().PaymentRequest.PayeeName = PayeeName;
					this.oModel.getData().PaymentRequest.Draft=results.U_APP_IsDraft;
         			 this.oModel.getData().PaymentRequest.LoanType=results.U_App_LoanType;
				
					  if(results.U_APP_Attachment !== null || results.U_APP_Attachment !== "" || results.U_APP_Attachment !== undefined){
						this.getFromAttachment(results.U_APP_Attachment);
					  }else{
						this.oModel.getData().Attachments = [];
						localStorage.setItem("AttcEntry","");
					  }
					this.oModel.getData().PaymentRequest.Items = [];

					this.loadUpdateDepartment(results.APP_RFP1Collection[0].U_APP_Department, "Department");
					this.loadUpdateDepartment(results.APP_RFP1Collection[0].U_APP_Division, "Depository");
					
					this.oModel.getData().PaymentRequest.employeeType =results.APP_RFP1Collection[0].U_APP_EmployeeType;
					this.oModel.getData().PaymentRequest.Division = results.APP_RFP1Collection[0].U_APP_Division;
					this.oModel.getData().PaymentRequest.DepartmentCode1 = results.APP_RFP1Collection[0].U_APP_Department; 
					this.oModel.getData().PaymentRequest.FundType = results.APP_RFP1Collection[0].U_APP_FundType;
					payeeCode = results.APP_RFP1Collection[0].U_APP_Employee;
	

					var taxableAmt = 0;
					for (var i = 0; i < results.APP_RFP1Collection.length; i++) {

						if(results.APP_RFP1Collection[i].U_WTLiable === "No"){
							taxableAmt = 0;
						  }else{
							taxableAmt = results.APP_RFP1Collection[i].U_APP_TaxLiable;
						  }


						this.oModel.getData().PaymentRequest.Items.push({
							"ItemCode": results.APP_RFP1Collection[i].U_APP_ItemCode,
							"Description": results.APP_RFP1Collection[i].U_APP_Description,
							"Type": results.APP_RFP1Collection[i].U_APP_Type,
							"GlAccount": results.APP_RFP1Collection[i].U_APP_GlAccount,
							"FundType": results.APP_RFP1Collection[i].U_APP_FundType,
							"Program": results.APP_RFP1Collection[i].U_APP_Program,
							"Department": results.APP_RFP1Collection[i].U_APP_Department,
							"Division": results.APP_RFP1Collection[i].U_APP_Division,
							"Employee": results.APP_RFP1Collection[i].U_APP_Employee,
							"Quantity": results.APP_RFP1Collection[i].U_APP_Quantity,
							"UOM": results.APP_RFP1Collection[i].U_APP_Uom,
							"EstUnitPrice": results.APP_RFP1Collection[i].U_APP_EstPrice,
							"EstAmount": results.APP_RFP1Collection[i].U_APP_EstAmt,
							"BudgetAvailable": results.APP_RFP1Collection[i].U_APP_Budget,
							"TaxCode": results.APP_RFP1Collection[i].U_APP_TaxCode,
							"Notes": results.APP_RFP1Collection[i].U_APP_Notes,
							"EmployeeType": results.APP_RFP1Collection[i].U_APP_EmployeeType,
							"SpecialistCode":  results.APP_RFP1Collection[i].U_APP_SpecialistCode,
							"SAPGL": results.APP_RFP1Collection[i].U_APP_GLSap,
							"Warehouse": "WHSE1",
							"TaxAmount": taxableAmt,
							"TaxLiable": results.APP_RFP1Collection[i].U_WTLiable,
							"WTCode": results.U_WTCode
						});
					}
					this.oModel.refresh();
				});
			});

		},
		handleValueHelpPM: function (oEvent) {
		this.OnLoadRecords();
				if (!this._oValueHelpDialogPMFind) {
					Fragment.load({
						name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestNo",
						controller: this
					}).then(function (oValueHelpDialogPMFind) {
						this._oValueHelpDialogPMFind = oValueHelpDialogPMFind;
						this.getView().addDependent(this._oValueHelpDialogPMFind);
						this._oValueHelpDialogPMFind.open();
					}.bind(this));
				} else {
					this._oValueHelpDialogPMFind.open();
				}
		},
		handleSearchPM: function (oEvent) {
				var sValue = oEvent.getParameter("value");
				var oFilters = new Filter([
					new Filter("No", FilterOperator.Contains, sValue),
					new Filter("RequesterName", FilterOperator.Contains, sValue)
				], false);
				var oBinding = oEvent.getSource().getBinding("items");
				oBinding.filter(oFilters);
		},
		handleValueClosePM: function (oEvent) {
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
			this.getView().byId("PMTNo").setValue(PMRecords[0].No);
			this.OpenUpdateScreen();
			this.oModel.refresh();
		},
		handleValueHelpDept: function (oEvent) {
			if (!this._oValueHelpDialogDept) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestDept",
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
			this.oModel.getData().PaymentRequest.DepartmentCode = Departments[0].Code;
			this.oModel.getData().PaymentRequest.DepartmentName = Departments[0].Description;
			this.oModel.refresh();
		},
		handleValueHelpUsers: function (oEvent) {
			if (!this._oValueHelpDialogUser) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestUser",
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
			this.oModel.getData().PaymentRequest.RequesterCode = Users[0].UserCode;
			this.oModel.getData().PaymentRequest.RequesterName = Users[0].UserName;
			this.oModel.refresh();
			this.onChangeUser(Users[0].UserCode);
		},
		handleValueHelpItems: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogItems) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestItems",
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
      		GLforWeb = Items[0].U_GLAccount;
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].ItemCode = Items[0].ItemCode;
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].Description = Items[0].ItemName;
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].GlAccount = Items[0].U_GLAccount;
			this.oModel.refresh();
			this.onChangeItem(Items[0].ItemCode);
		},
		handleValueHelpGL: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogGL) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestGL",
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
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].GlAccount = GL[0].AcctCode;

			if(GLforSAP == "" || GLforSAP == null){
				GLforSAP = GL[0].AcctCode;
				this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].SAPGL = GLforSAP;
			}
			this.oModel.refresh();
		},
		handleValueHelpFundType: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogFundType) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestFundType",
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
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].FundType = FundType[0].PrcCode;
			this.oModel.refresh();
		},
		handleValueHelpProgram: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogProgram) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestProgram",
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
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].Program = Program[0].PrcCode;
			this.oModel.refresh();
		},
		handleValueHelpDepartment: function (oEvent) {
			// this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogDepartment) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestDepartment",
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

			this.oModel.getData().PaymentRequest.DepartmentCode1 = Department[0].PrcCode;
			this.oModel.getData().PaymentRequest.DepartmentName1 = Department[0].PrcName;
			this.oModel.getData().PaymentRequest.Division = Department[0].GrpCode;
			this.oModel.getData().PaymentRequest.DivisionName = Department[0].DepositoryName;


				var omember = Department[0].PrcCode;
				var odirectorate = omember.slice(0,4) + "00";
			
				this.oModel.getData().PaymentRequest.Program = odirectorate;
				this.oModel.getData().PaymentRequest.FundType = Department[0].U_FundType;


			var oItems = this.oModel.getData().PaymentRequest.Items;
			//--Budget--//

			for(let x = 0;x < oItems.length;x++){
				this.oModel.getData().PaymentRequest.Items[x].Department = Department[0].PrcCode;
				this.onGetAvailableBudget(Department[0].PrcCode, this.oModel.getData().PaymentRequest.Items[x].GlAccount, this.oModel.getData().PaymentRequest.Items[x].SAPGL);
				var obBudget;
				var acctcode = this.oModel.getData().PaymentRequest.Items[x].GlAccount;
				
				if(acctcode == oItems[x].GlAccount && Department[0].PrcCode == oItems[x].Department){
					if(oItems[x].EstAmount !== ""){
						var ostprice = oItems[x].EstAmount;
						var estprice = ostprice;
						var estbudget = ABudget;
						obBudget = estbudget- estprice;
						ABudget = obBudget;
						var decimalbudget = obBudget;
						this.oModel.getData().PaymentRequest.Items[x].BudgetAvailable = decimalbudget;
					}else{
						this.oModel.getData().PaymentRequest.Items[x].BudgetAvailable = decimalbudget;
					}
				 }
				

				var member = Department[0].PrcCode;
				var directorate = member.slice(0,4) + "00";
			
				this.oModel.getData().PaymentRequest.Items[x].Program = directorate;
				this.oModel.getData().PaymentRequest.Items[x].Division = Department[0].GrpCode;
				this.oModel.getData().PaymentRequest.Items[x].FundType = Department[0].U_FundType;
			}			
			this.oModel.refresh();
    	},
		handleValueHelpDiv: function (oEvent) {
			// this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogDiv) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestDiv",
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
					oDivision.U_FundType = oContext.getObject().U_FundType;
					return oDivision;
				});
			}
			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().PaymentRequest.DivisionName =  Division[0].PrcName;
			this.oModel.getData().PaymentRequest.Division =  Division[0].PrcCode;
			this.oModel.getData().PaymentRequest.FundType = Division[0].U_FundType;
			oSelectedDept = "";
			oSelectedDepo = Division[0].PrcCode;
			for(var y= 0;y < this.oModel.getData().PaymentRequest.Items.length; y++){
				this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].Division = Division[0].PrcCode;
				this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].DivisionName = Division[0].PrcName;
				this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].FundType = Division[0].U_FundType;
				this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].Department = "";
				this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].DepartmentCode1 = "";
				this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].Program = "";
			}
		
			this.oModel.refresh();
			// this.onChangeDivision(Division[0].PrcCode);
		},
		handleValueHelpEmployee: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogEmployee) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestEmployee",
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
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].EmployeeType = Employee[0].PrcCode;
			this.oModel.refresh();
		},
		handleValueHelpUOM: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogUOM) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestUOM",
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
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].UOM = UOM[0].UomCode;
			this.oModel.refresh();

		},
		handleValueHelpPayee: function (oEvent) {
			if (!this._oValueHelpDialogPayee) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestPayee",
					controller: this
				}).then(function (oValueHelpDialogPayee) {
					this._oValueHelpDialogPayee = oValueHelpDialogPayee;
					this.getView().addDependent(this._oValueHelpDialogPayee);
					this._oValueHelpDialogPayee.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogPayee.open();
			}
		},
		handleSearchPayee: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("CardCode", FilterOperator.Contains, sValue),
				new Filter("CardName", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueClosePayee: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var Vendor = {};
			if (aContexts && aContexts.length) {
				Vendor = aContexts.map(function (oContext) {
					var oVendor = {};
					oVendor.CardCode = oContext.getObject().CardCode;
					oVendor.CardName = oContext.getObject().CardName;
         			oVendor.U_EmployeeCode = oContext.getObject().U_EmployeeCode;
					return oVendor;
				});
			}

			oEvent.getSource().getBinding("items").filter([]);
			payeeCode = Vendor[0].U_EmployeeCode;
			CustCode = Vendor[0].CardCode;
			opayeeName = Vendor[0].CardName;
			this.oModel.getData().PaymentRequest.Payee = Vendor[0].CardCode;
			this.oModel.getData().PaymentRequest.PayeeName = Vendor[0].CardName;
			this.oModel.getData().PaymentRequest.LoanType = Vendor[0].U_EmployeeCode;

			this.onCheckWithHoldingTax(CustCode);
			var rowdetails = this.oModel.getData().PaymentRequest.Items;
			for(let r = 0; r < rowdetails.length;r++){
				rowdetails[r].Employee = payeeCode;
				rowdetails[r].TaxLiable = WHTax;
				rowdetails[r].WTCode = WTCode;
			}
      		this.oModel.refresh();
		},
  	  	handleValueHelpLoanType: function (oEvent) {
			// this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogLoanType) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequesLoanType",
					controller: this
				}).then(function (oValueHelpDialogLoanType) {
					this._oValueHelpDialogLoanType = oValueHelpDialogLoanType;
					this.getView().addDependent(this._oValueHelpDialogLoanType);
					this._oValueHelpDialogLoanType.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogLoanType.open();
			}
		},
   		handleValueCloseLoanType: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var EmpType = {};
			if (aContexts && aContexts.length) {
				EmpType = aContexts.map(function (oContext) {
					var oEmp = {};
					oEmp.Code = oContext.getObject().Code;
					return oEmp;
				});
			}

			oEvent.getSource().getBinding("items").filter([]);
			this.oModel.getData().PaymentRequest.employeeType = EmpType[0].Code;
			for(let x = 0;x < this.oModel.getData().PaymentRequest.Items.length;x++){
				this.oModel.getData().PaymentRequest.Items[x].EmployeeType = EmpType[0].Code;
			}
      		
			this.oModel.refresh();
		},
    	handleSearchLoanType: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("Code", FilterOperator.Contains, sValue),
				new Filter("Name", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},
		handleValueHelpTaxCode: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			if (!this._oValueHelpDialogTaxCode) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.PaymentRequest.PaymentRequestTaxCode",
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
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].TaxCode = TaxCode[0].Code;
			this.oModel.refresh();

		},
		getNextNumber: function () {
      		oDocNum = "";
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=GETNEXTDOCNUM&VALUE1=APP_ORFP",
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
				var i;
				for (i = 0; i < results.length; i++) {
					this.oModel.getData().PaymentRequest.No = results[i].NextNumber;
          			oDocNum = results[i].NextNumber;
				}
				this.oModel.refresh();
			});
		},
		createTables: function () {
			//Add Fields Creation
			APPui5.createField("APP_Position", "Position", "OPCH", "db_Alpha", "", 100);
			APPui5.createField("APP_Requester", "Requester", "OPCH", "db_Alpha", "", 50);
			APPui5.createField("APP_Type", "Type", "PCH1", "db_Alpha", "", 100);
			
			APPui5.createTable("APP_ORFP", "Payment Request", "bott_Document");
			APPui5.createField("APP_Requester", "Requester", "@APP_ORFP", "db_Alpha", "", 50);
			APPui5.createField("APP_Position", "Position", "@APP_ORFP", "db_Alpha", "", 50);
			APPui5.createField("APP_Department", "Department", "@APP_ORFP", "db_Alpha", "", 50);
			APPui5.createField("APP_RequestDate", "Request Date", "@APP_ORFP", "db_Date", "");
			APPui5.createField("APP_RequiredDate", "Required Date", "@APP_ORFP", "db_Date", "");
			APPui5.createField("APP_Payee", "Payee", "@APP_ORFP", "db_Alpha", "", 50);
			APPui5.createField("APP_IsDraft","Is Draft","@APP_ORFP","db_Alpha","",50);
			APPui5.createField("APP_Attachment","Attachment","@APP_ORFP","db_Alpha","",50);
			APPui5.createField("App_LoanType","Loan Type","@APP_ORFP","db_Alpha","",30);
			APPui5.createField("WTCode","Tax Code","@APP_ORFP","db_Alpha","",50);

			APPui5.createTable("APP_RFP1", "Payment Request Details", "bott_DocumentLines");
			APPui5.createField("APP_ItemCode", "Item Code", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_Description", "Description", "@APP_RFP1", "db_Alpha", "", 100);
			APPui5.createField("APP_Type", "Type", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_GlAccount", "Gl Account", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_FundType", "Fund Type", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_Program", "Program", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_Department", "Department", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_Division", "Division", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_Depository", "Depository", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_Employee", "Employee", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_Quantity", "Quantity", "@APP_RFP1", "db_Numeric", "", 10);
			APPui5.createField("APP_Uom", "Uom", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_EstPrice", "Est Unit Price", "@APP_RFP1", "db_Float", "st_Price", 10);
			APPui5.createField("APP_EstAmt", "Est Amount", "@APP_RFP1", "db_Float", "st_Price", 10);
			APPui5.createField("APP_Budget", "Budget/ Fund Available", "@APP_RFP1", "db_Float", "st_Price", 10);
			APPui5.createField("APP_TaxCode", "Tax Code", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_EmployeeType", "Employee Type", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_Notes", "Note", "@APP_RFP1", "db_Alpha", "", 50);
			APPui5.createField("APP_GLSap", "GL for posting to SAP", "@APP_RFP1", "db_Alpha", "", 30);
			APPui5.createField("APP_TaxLiable", "Tax Amount", "@APP_RFP1", "db_Alpha", "", 20);  
			APPui5.createField("WTLiable", "With Tax Liable", "@APP_RFP1", "db_Alpha", "", 50);

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
					APPui5.APPMESSAGEBOX(Message);;
				},
				success: function (json) {
				},
				context: this
			}).done(function (results) {
				this.oModel.getData().PaymentRequest.DepartmentCode = results[0].Department;
				this.oModel.getData().PaymentRequest.DepartmentName = results[0].Remarks;
				this.oModel.getData().PaymentRequest.PositionCode = results[0].U_APP_Position;
				this.oModel.getData().PaymentRequest.PositionName = results[0].Name;
				this.oModel.getData().PaymentRequest.RequesterName = results[0].U_NAME;
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
					APPui5.APPMESSAGEBOX(Message);;
				},
				success: function (json) {
				},
				context: this
			}).done(function (results) {
       
				this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].TaxCode = results[0].VatGroupPu;
				// this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].SpecialistCode = results[0].SpecialistCode;
				this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].Type=results[0].ItmsGrpCod;
				this.getGLAccount(ItemCode, this.oModel.getData().PaymentRequest.RequestDate);
        		this.oModel.refresh();
				//
			});
		},
		OnComputeAmount: function (oEvent) {
			this.iSelectedRow = oEvent.getSource().getParent().getIndex();
			var value1 = this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].EstUnitPrice;
			var value2 = this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].Quantity;
			var totalPrice = (value1 * value2);
			var decimalPrice = totalPrice;
			var withComma = decimalPrice;
			var withTaxComma;
			var decimalTax;
			var totalTax;
			if(WithCompute == "true"){
				withTaxComma = totalPrice / 1.12;
				decimalTax = withTaxComma;
				totalTax = decimalTax;
			}else{
				totalTax = this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].EstUnitPrice;
			}

			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].TaxAmount = totalTax;
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].EstAmount= withComma;
		
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].BudgetAvailable = 0;
			this.onGetAvailableBudget(this.oModel.getData().PaymentRequest.DepartmentCode1, this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].GlAccount, this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].SAPGL);
			var obBudget;
			var oItems = this.oModel.getData().PaymentRequest.Items;
				if(oItems[this.iSelectedRow].EstAmount !== ""){
					var ostprice = oItems[this.iSelectedRow].EstAmount;
					var estprice = ostprice;
					var estbudget = ABudget;
					obBudget = estbudget- estprice;
					ABudget = obBudget;
					var decimalbudget = obBudget;
					this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].BudgetAvailable = decimalbudget;
				}else{
					this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].BudgetAvailable = decimalbudget;
				}
				this.oModel.refresh();
		},
		onChangeDivision: function (Division) {
			try{
					const resultDiv = this.oModel.getData().Div.find(({ PrcCode }) => PrcCode === Division);
					const FundTypeDiv = this.oModel.getData().FundType.find(({ PrcCode }) => PrcCode.match(new RegExp(resultDiv.GrpCode, "g")));
					this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].FundType = FundTypeDiv.PrcCode;
			}catch (e) {
				console.log(e);
				// APPui5.APPMESSAGEBOX(e,{duration: 500000});
				// 
			}
			this.oModel.refresh();
			
			this.oModel.refresh();
		},
		onChangeDepartment: function (Department) {
      // try{ 
      const resultDept = divResult;
			const FundTypeDept = this.oModel.getData().FundType.find(({ PrcCode }) => PrcCode.match(new RegExp(resultDept.PrcCode, "g")));
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].FundType = FundTypeDept.PrcCode;
      // }catch (e) {
      //   console.log(e);
      // }
      this.oModel.refresh();
		},
		onChangeProgram: function (Program) {
      try{
			const result = this.oModel.getData().Program.find(({ PrcCode }) => PrcCode === Program);
			const Division = this.oModel.getData().Div.find(({ PrcCode }) => PrcCode === result.GrpCode);
			const Department = this.oModel.getData().Dept.find(({ PrcCode }) => PrcCode.match(result.PrcCode.toString().substring(0, 4), "g"));
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].Division = Division.PrcCode;
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].Department = Department.PrcCode;
			const FundTypeProgram = this.oModel.getData().FundType.find(({ PrcCode }) => PrcCode.match(new RegExp(Division.GrpCode, "g")));
			this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].FundType = FundTypeProgram.PrcCode;
      }catch (e) {
        // APPui5.APPMESSAGEBOX(e,{duration: 500000});
        // 
      }
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
				// console.log(results)
				if(results.length !== 0){
					GLforSAP = results[0].APCMAct;
				}else{
					GLforSAP = GLforWeb;
				}
				this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].SAPGL = GLforSAP;
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
					APPui5.APPMESSAGEBOX(Message);;
				},
				success: function (json) {
				},
				context: this
			}).done(function (results) {
				this.oModel.getData().PaymentRequest.Items[this.iSelectedRow].Type = results[0].U_APP_Type;
				this.oModel.refresh();
			});
		},
		onClearData: function () {
      //for(let i = 0;i < this.oModel.getData().PaymentRequest.Items.length; i++){
      //   this.oModel.getData().PaymentRequest.Items.splice(i, 1);
      // }
			// this.oModel.getData().PaymentRequest.No = "";
			this.oModel.getData().PaymentRequest.RequesterCode = "";
			this.oModel.getData().PaymentRequest.RequesterName = "";
			this.oModel.getData().PaymentRequest.PositionCode = "";
			this.oModel.getData().PaymentRequest.PositionName = "";
			this.oModel.getData().PaymentRequest.DepartmentCode = "";
			this.oModel.getData().PaymentRequest.DepartmentName = "";
			this.oModel.getData().PaymentRequest.RequestDate = "";
			this.oModel.getData().PaymentRequest.RequiredDate = "";
			this.oModel.getData().PaymentRequest.Payee = "";
			this.oModel.getData().PaymentRequest.StatusCode = "";
			this.oModel.getData().PaymentRequest.StatusName = "";
			this.oModel.getData().PaymentRequest.Remarks = "";
			this.oModel.getData().PaymentRequest.Items = [];
			this.oModel.getData().Attachments = [];
      
      		this.getView().byId("payeeID").setValue("");
		},
		onFunction: function () {
			var that = this;
			var isTaxable = true;
			var gl = 0;
			var gla = 0;
			var oPayment =this.oModel.getData().PaymentRequest.Items;
			for(let x = 0;x < oPayment.length;x++){
				if(oPayment[x].TaxLiable === "Yes" && oPayment[x].WTCode === ""){
					isTaxable = false;
				}
			}

			for(let i=0;i<this.oModel.getData().PaymentRequest.Items.length;i++){
					if(oPayment[i].GlAccount == '' || oPayment[i].GlAccount == null){
						if(oPayment[i].SAPGL == null || oPayment[i].SAPGL == ''){
						gl +=1;
					}
				}
			}

			if(isTaxable === false){
				APPui5.APPMESSAGEBOX("No Default Wtax Code in BP Master Data");
				return;
			}

			var dif = 0;
			var dep = 0;
			
			var DepoCode = oPayment[0].Division;
			for(let i=0;i<this.oModel.getData().PaymentRequest.Items.length;i++){
				if(oPayment[i].Division !== DepoCode){
					dif +=1;
				}
			}
			var DEPCode = oPayment[0].Department;
			for(let i=0;i<this.oModel.getData().PaymentRequest.Items.length;i++){
				if(oPayment[i].Department !== DEPCode){
					dep +=1;
				}
			}

			var GLCode = oPayment[0].GlAccount;
			for(let g=0;g < this.oModel.getData().PaymentRequest.Items.length;g++){
			  if(oPayment[g].GlAccount !== GLCode){
				gla +=1;
			  }
			}
	  
		  if(gla !== 0){
			APPui5.APPMESSAGEBOX("Mulitple GL Account not allowed");  
			return;  
		  }
		  
			if(gl !== 0){
				APPui5.APPMESSAGEBOX("Please Select the GL Account");
				return;
			}else if(dif !== 0){
				APPui5.APPMESSAGEBOX("Mulitple Depository not allowed");
				return;  
			}else if(dep !== 0){
				APPui5.APPMESSAGEBOX("Mulitple Department not allowed");
				return;
			}else{
				if(localStorage.getItem("AttcEntry") == ""){
					MessageBox.information("Are you sure you want to submit without attachment??", {
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					title: "",
					icon: MessageBox.Icon.QUESTION,
					styleClass:"sapUiSizeCompact",
					onClose: function (sButton) {
							if(sButton === "YES"){
								if (that.oModel.getData().Controls.AddOrEdit === "Add Payment Request") {
									  that.onAdd();
								}
								else {
									 that.onUpdate();
								}
							}
						}
					});
				}else{
					if (that.oModel.getData().Controls.AddOrEdit === "Add Payment Request") {
						that.onAdd();
					}else{
						that.onUpdate();
					}
				}
			}
		},
		onDraftFunction: function () {
			if (this.oModel.getData().Controls.AddOrEdit === "Add Payment Request") {
				this.onAddDraft();
			}
			else {
				this.onUpdateDraft();
			}
		},
		onAdd: function () {
			if (this.oModel.getData().PaymentRequest.RequesterCode === "" || this.oModel.getData().PaymentRequest.DepartmentCode === "" || this.oModel.getData().PaymentRequest.RequestDate === "" || this.oModel.getData().PaymentRequest.RequiredDate === "" || this.oModel.getData().PaymentRequest.Payee === "") {
				APPui5.APPMESSAGEBOX("Must fill up all required fields!");
				return
			}

			var PaymentRequestBody = {};
			PaymentRequestBody.U_APP_RequestDate = this.oModel.getData().PaymentRequest.RequestDate;
			PaymentRequestBody.U_APP_RequiredDate = this.oModel.getData().PaymentRequest.RequiredDate;
			PaymentRequestBody.U_APP_Requester = this.oModel.getData().PaymentRequest.RequesterCode;
			PaymentRequestBody.U_APP_Department = this.oModel.getData().PaymentRequest.DepartmentCode;
			PaymentRequestBody.U_APP_Position = this.getView().byId("position").getValue();
			PaymentRequestBody.U_APP_Payee = this.oModel.getData().PaymentRequest.Payee;
			PaymentRequestBody.Remark = this.oModel.getData().PaymentRequest.Remarks;
      		PaymentRequestBody.U_App_LoanType = this.oModel.getData().PaymentRequest.LoanType;
			PaymentRequestBody.U_WTCode = WTCode;
			if(localStorage.getItem("AttcEntry") !== ""){
				PaymentRequestBody.U_APP_Attachment = localStorage.getItem("AttcEntry");
			}else{
				PaymentRequestBody.U_APP_Attachment = "";
			}
			PaymentRequestBody.U_APP_IsDraft="No";
			PaymentRequestBody.APP_RFP1Collection = [];
			var totalAmount = 0;

			for (var i = 0; i < this.oModel.getData().PaymentRequest.Items.length; i++) {
				var Amount = this.oModel.getData().PaymentRequest.Items[i].EstAmount;
				totalAmount = (totalAmount + Amount);
				if(this.oModel.getData().PaymentRequest.Items[0].DepartmentName !== ""){
					oDept = this.oModel.getData().PaymentRequest.Items[0].DepartmentName;
				}else{
					oDept = this.oModel.getData().PaymentRequest.Items[0].DivisionName;
				}

				PaymentRequestBody.APP_RFP1Collection.push({
					"U_APP_ItemCode": this.oModel.getData().PaymentRequest.Items[i].ItemCode,
					"U_APP_Description": this.oModel.getData().PaymentRequest.Items[i].Description,
					"U_APP_GlAccount": this.oModel.getData().PaymentRequest.Items[i].GlAccount,
					"U_APP_Uom": this.oModel.getData().PaymentRequest.Items[i].UOM,
					"U_APP_Type": this.oModel.getData().PaymentRequest.Items[i].Type,
					"U_APP_EstPrice": this.oModel.getData().PaymentRequest.Items[i].EstUnitPrice,
					"U_APP_Quantity": this.oModel.getData().PaymentRequest.Items[i].Quantity,
					"U_APP_EstAmt": this.oModel.getData().PaymentRequest.Items[i].EstAmount,
					"U_APP_TaxCode": this.oModel.getData().PaymentRequest.Items[i].TaxCode,
					"U_APP_FundType": this.oModel.getData().PaymentRequest.Items[i].FundType,
					"U_APP_Division": this.oModel.getData().PaymentRequest.Items[i].Division,
					"U_APP_Employee": this.oModel.getData().PaymentRequest.Items[i].Employee,
					"U_APP_Department": this.oModel.getData().PaymentRequest.Items[i].Department,
					"U_APP_Program": this.oModel.getData().PaymentRequest.Items[i].Program,
					"U_APP_Notes": this.oModel.getData().PaymentRequest.Items[i].Notes,
					"U_APP_Depository": this.oModel.getData().PaymentRequest.Items[i].Division,
					"U_APP_EmployeeType": this.oModel.getData().PaymentRequest.Items[i].EmployeeType,
					"U_APP_SpecialistCode": this.oModel.getData().PaymentRequest.Items[i].SpecialistCode,
					"U_APP_GLSap": this.oModel.getData().PaymentRequest.Items[i].SAPGL,
					"U_APP_Budget": this.oModel.getData().PaymentRequest.Items[i].BudgetAvailable,
					"U_APP_TaxLiable": this.oModel.getData().PaymentRequest.Items[i].TaxAmount,
					"U_WTLiable": this.oModel.getData().PaymentRequest.Items[i].TaxLiable
        		});
				}
				this.getNextNumber();
			$.ajax({
				url: "https://13.215.36.201:50000/b1s/v1/APP_ORFP",
				data: JSON.stringify(PaymentRequestBody),
				type: "POST",
				crossDomain: true,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;
					APPui5.APPMESSAGEBOX(Message);;
				},
				context: this,
			success: async function (json) {
					if(localStorage.getItem("AttcEntry") !== ""){
						this.onUpdateAttachnent();
				   	}
					await this.ApprovalRoute('Payment Request', jQuery.sap.storage.Storage.get("userCode"), this.oModel.getData().PaymentRequest.No, this.oModel.getData().PaymentRequest.RequestDate, this.oModel.getData().PaymentRequest.RequiredDate, this.oModel.getData().PaymentRequest.Remarks,totalAmount,this.oModel.getData().PaymentRequest.DepartmentName1,this.oModel.getData().PaymentRequest.DivisionName);
					this.getView().byId("AddrowID").setEnabled(false);
					this.getView().byId("DelRowID").setEnabled(false);
				}
			}).done(function (results) {
				if (results) {
					this.onClearData();
				}
			});
		},
		onUpdate: function () {
			if (this.oModel.getData().PaymentRequest.RequesterCode === "" || this.oModel.getData().PaymentRequest.DepartmentCode === "" || this.oModel.getData().PaymentRequest.RequestDate === "" || this.oModel.getData().PaymentRequest.RequiredDate === "" || this.oModel.getData().PaymentRequest.Payee === "") {
				APPui5.APPMESSAGEBOX("Must fill up all required fields!");
				return;
			}
			
			var PaymentRequestBody = {};
			PaymentRequestBody.U_APP_RequestDate = this.oModel.getData().PaymentRequest.RequestDate;
			PaymentRequestBody.U_APP_RequiredDate = this.oModel.getData().PaymentRequest.RequiredDate;
			PaymentRequestBody.U_APP_Requester = this.oModel.getData().PaymentRequest.RequesterCode;
			PaymentRequestBody.U_APP_Department = this.oModel.getData().PaymentRequest.DepartmentCode;
			PaymentRequestBody.U_APP_Position = this.oModel.getData().PaymentRequest.PositionCode;
			PaymentRequestBody.U_APP_Payee = this.oModel.getData().PaymentRequest.Payee;
			PaymentRequestBody.Remark = this.oModel.getData().PaymentRequest.Remarks;	
      		PaymentRequestBody.U_App_LoanType = this.oModel.getData().PaymentRequest.Items[0].EmployeeType;		
			PaymentRequestBody.U_APP_IsDraft="No";
			PaymentRequestBody.U_WTCode="";
			if(localStorage.getItem("AttcEntry") !== ""){
				PaymentRequestBody.U_APP_Attachment = localStorage.getItem("AttcEntry");
			}else{
				PaymentRequestBody.U_APP_Attachment = "";
			}
			PaymentRequestBody.APP_RFP1Collection = [];
			var i;
			var totalAmount = 0;
			for (i = 0; i < this.oModel.getData().PaymentRequest.Items.length; i++) {
				var amount = this.oModel.getData().PaymentRequest.Items[i].EstUnitPrice;
				totalAmount = (totalAmount + amount);

				if(this.oModel.getData().PaymentRequest.Items[i].DepartmentName !== ""){
					oDept = this.oModel.getData().PaymentRequest.Items[0].DepartmentName;
				}else{
					oDept = this.oModel.getData().PaymentRequest.Items[0].DivisionName;
				}
		
				PaymentRequestBody.APP_RFP1Collection.push({
					"U_APP_ItemCode": this.oModel.getData().PaymentRequest.Items[i].ItemCode,
					"U_APP_Description": this.oModel.getData().PaymentRequest.Items[i].Description,
					"U_APP_GlAccount": this.oModel.getData().PaymentRequest.Items[i].GlAccount,
					"U_APP_Uom": this.oModel.getData().PaymentRequest.Items[i].UOM,
					"U_APP_Type": this.oModel.getData().PaymentRequest.Items[i].Type,
					"U_APP_EstPrice": this.oModel.getData().PaymentRequest.Items[i].EstUnitPrice,
					"U_APP_Quantity": this.oModel.getData().PaymentRequest.Items[i].Quantity,
					"U_APP_EstAmt": this.oModel.getData().PaymentRequest.Items[i].EstAmount,
					"U_APP_TaxCode": this.oModel.getData().PaymentRequest.Items[i].TaxCode,
					"U_APP_FundType": this.oModel.getData().PaymentRequest.Items[i].FundType,
					"U_APP_Division": this.oModel.getData().PaymentRequest.Items[i].Division,
					"U_APP_Employee": this.oModel.getData().PaymentRequest.Items[i].Employee,
					"U_APP_Department": this.oModel.getData().PaymentRequest.Items[i].Department,
					"U_APP_Program": this.oModel.getData().PaymentRequest.Items[i].Program,
					"U_APP_Notes": this.oModel.getData().PaymentRequest.Items[i].Notes,
					"U_APP_Budget": this.oModel.getData().PaymentRequest.Items[i].BudgetAvailable,
					"U_APP_Depository": this.oModel.getData().PaymentRequest.Items[i].Division,
					"U_APP_EmployeeType": this.oModel.getData().PaymentRequest.Items[i].EmployeeType,
					"U_APP_SpecialistCode": this.oModel.getData().PaymentRequest.Items[i].SpecialistCode,
					"U_APP_GLSap": this.oModel.getData().PaymentRequest.Items[i].SAPGL,
					"U_APP_TaxLiable": this.oModel.getData().PaymentRequest.Items[i].TaxAmount,
					"U_WTLiable": this.oModel.getData().PaymentRequest.Items[i].TaxLiable
				});
			}
		
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDOCENTRY&VALUE1=" + this.oModel.getData().PaymentRequest.No + "&VALUE=APP_ORFP",
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
				$.ajax({
					url: "https://13.215.36.201:50000/b1s/v1/APP_ORFP(" + results[0].DocEntry + ")",
					data: JSON.stringify(PaymentRequestBody),
					headers: { "B1S-ReplaceCollectionsOnPatch": true },
					type: "PATCH",
					crossDomain: true,
					xhrFields: {
						withCredentials: true
					},
					error: function (xhr, status, error) {
						var Message = xhr.responseJSON["error"].message.value;
						APPui5.APPMESSAGEBOX(Message);;
					},
					context: this,
					success: async function (json) {
						await this.ApprovalRoute('Payment Request', jQuery.sap.storage.Storage.get("userCode"), this.oModel.getData().PaymentRequest.No, this.oModel.getData().PaymentRequest.RequestDate, this.oModel.getData().PaymentRequest.RequiredDate, this.oModel.getData().PaymentRequest.Remarks,totalAmount,this.oModel.getData().PaymentRequest.DepartmentName1,this.oModel.getData().PaymentRequest.DivisionName);
						// if(localStorage.getItem("AttcEntry") !== ""){
						// 	this.onUpdateAttachnent();
						// }
						APPui5.APPMESSAGEBOX("Transaction updated!")
						this.getView().byId("AddrowID").setEnabled(false);
						this.getView().byId("DelRowID").setEnabled(false);
					}
				}).done(function (results) {
					this.onClearData();
				});

			});
		},
		onAddDraft: function () {
			if (this.oModel.getData().PaymentRequest.RequesterCode === "" || this.oModel.getData().PaymentRequest.DepartmentCode === "" || this.oModel.getData().PaymentRequest.RequestDate === "" || this.oModel.getData().PaymentRequest.RequiredDate === "" || this.oModel.getData().PaymentRequest.Payee === "") {
				APPui5.APPMESSAGEBOX("Must fill up all required fields!");
				return
			}

			var PaymentRequestBody = {};
			PaymentRequestBody.U_APP_RequestDate = this.oModel.getData().PaymentRequest.RequestDate;
			PaymentRequestBody.U_APP_RequiredDate = this.oModel.getData().PaymentRequest.RequiredDate;
			PaymentRequestBody.U_APP_Requester = this.oModel.getData().PaymentRequest.RequesterCode;
			PaymentRequestBody.U_APP_Department = this.oModel.getData().PaymentRequest.DepartmentCode;
			PaymentRequestBody.U_APP_Position = this.oModel.getData().PaymentRequest.PositionCode;
			PaymentRequestBody.U_APP_Payee = this.oModel.getData().PaymentRequest.Payee;
			PaymentRequestBody.Remark = this.oModel.getData().PaymentRequest.Remarks;
      		PaymentRequestBody.U_App_LoanType = this.oModel.getData().PaymentRequest.LoanType;		
			PaymentRequestBody.U_APP_IsDraft="Yes";
			if(localStorage.getItem("AttcEntry") !== ""){
				PaymentRequestBody.U_APP_Attachment = localStorage.getItem("AttcEntry");
			}
			PaymentRequestBody.APP_RFP1Collection = [];
		
			for (var i = 0; i < this.oModel.getData().PaymentRequest.Items.length; i++) {
				PaymentRequestBody.APP_RFP1Collection.push({
					"U_APP_ItemCode": this.oModel.getData().PaymentRequest.Items[i].ItemCode,
					"U_APP_Description": this.oModel.getData().PaymentRequest.Items[i].Description,
					"U_APP_GlAccount": this.oModel.getData().PaymentRequest.Items[i].GlAccount,
					"U_APP_Uom": this.oModel.getData().PaymentRequest.Items[i].UOM,
					"U_APP_Type": this.oModel.getData().PaymentRequest.Items[i].Type,
					"U_APP_EstPrice": this.oModel.getData().PaymentRequest.Items[i].EstUnitPrice,
					"U_APP_Quantity": this.oModel.getData().PaymentRequest.Items[i].Quantity,
					"U_APP_EstAmt": this.oModel.getData().PaymentRequest.Items[i].EstAmount,
					"U_APP_TaxCode": this.oModel.getData().PaymentRequest.Items[i].TaxCode,
					"U_APP_FundType": this.oModel.getData().PaymentRequest.Items[i].FundType,
					"U_APP_Division": this.oModel.getData().PaymentRequest.Items[i].Division,
					"U_APP_Employee": this.oModel.getData().PaymentRequest.Items[i].Employee,
					"U_APP_Budget": this.oModel.getData().PaymentRequest.Items[i].BudgetAvailable,
					"U_APP_Department": this.oModel.getData().PaymentRequest.Items[i].Department,
					"U_APP_Program": this.oModel.getData().PaymentRequest.Items[i].Program,
					"U_APP_Notes": this.oModel.getData().PaymentRequest.Items[i].Notes,
					"U_APP_Depository": this.oModel.getData().PaymentRequest.Items[i].Division,
					"U_APP_EmployeeType": this.oModel.getData().PaymentRequest.Items[i].EmployeeType,
					"U_APP_SpecialistCode": this.oModel.getData().PaymentRequest.Items[i].SpecialistCode,
					"U_APP_GLSap": this.oModel.getData().PaymentRequest.Items[i].SAPGL,
					"U_APP_TaxLiable": this.oModel.getData().PaymentRequest.Items[i].TaxAmount,
					"U_WTLiable": this.oModel.getData().PaymentRequest.Items[i].TaxLiable
        });
			}

      this.getNextNumber();
			$.ajax({
				url: "https://13.215.36.201:50000/b1s/v1/APP_ORFP",
				data: JSON.stringify(PaymentRequestBody),
				type: "POST",
				crossDomain: true,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					var Message = xhr.responseJSON["error"].message.value;
					APPui5.APPMESSAGEBOX(Message);;
				},
				context: this,
				success: async function (json) {
					if(localStorage.getItem("AttcEntry") !== ""){
						this.onUpdateAttachnent();
					   }
					APPui5.APPMESSAGEBOX("Transaction Succesfully save as draft!\nTransaction no:" + oDocNum)
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
			if (this.oModel.getData().PaymentRequest.RequesterCode === "" || this.oModel.getData().PaymentRequest.DepartmentCode === "" || this.oModel.getData().PaymentRequest.RequestDate === "" || this.oModel.getData().PaymentRequest.RequiredDate === "" || this.oModel.getData().PaymentRequest.Payee === "") {
				APPui5.APPMESSAGEBOX("Must fill up all required fields!");
				return
			}

			var PaymentRequestBody = {};
			PaymentRequestBody.U_APP_RequestDate = this.oModel.getData().PaymentRequest.RequestDate;
			PaymentRequestBody.U_APP_RequiredDate = this.oModel.getData().PaymentRequest.RequiredDate;
			PaymentRequestBody.U_APP_Requester = this.oModel.getData().PaymentRequest.RequesterCode;
			PaymentRequestBody.U_APP_Department = this.oModel.getData().PaymentRequest.DepartmentCode;
			PaymentRequestBody.U_APP_Position = this.oModel.getData().PaymentRequest.PositionCode;
			PaymentRequestBody.U_APP_Payee = this.oModel.getData().PaymentRequest.Payee;
			PaymentRequestBody.Remark = this.oModel.getData().PaymentRequest.Remarks;	
     		PaymentRequestBody.U_App_LoanType = this.oModel.getData().PaymentRequest.LoanType;	
			PaymentRequestBody.U_APP_IsDraft="Yes";
			if(localStorage.getItem("AttcEntry") !== ""){
				PaymentRequestBody.U_APP_Attachment = localStorage.getItem("AttcEntry");
			}
			PaymentRequestBody.APP_RFP1Collection = [];
			var i;
			for (i = 0; i < this.oModel.getData().PaymentRequest.Items.length; i++) {

				PaymentRequestBody.APP_RFP1Collection.push({
					"U_APP_ItemCode": this.oModel.getData().PaymentRequest.Items[i].ItemCode,
					"U_APP_Description": this.oModel.getData().PaymentRequest.Items[i].Description,
					"U_APP_GlAccount": this.oModel.getData().PaymentRequest.Items[i].GlAccount,
					"U_APP_Uom": this.oModel.getData().PaymentRequest.Items[i].UOM,
					"U_APP_Type": this.oModel.getData().PaymentRequest.Items[i].Type,
					"U_APP_EstPrice": this.oModel.getData().PaymentRequest.Items[i].EstUnitPrice,
					"U_APP_Quantity": this.oModel.getData().PaymentRequest.Items[i].Quantity,
					"U_APP_EstAmt": this.oModel.getData().PaymentRequest.Items[i].EstAmount,
					"U_APP_TaxCode": this.oModel.getData().PaymentRequest.Items[i].TaxCode,
					"U_APP_FundType": this.oModel.getData().PaymentRequest.Items[i].FundType,
					"U_APP_Division": this.oModel.getData().PaymentRequest.Items[i].Division,
					"U_APP_Employee": this.oModel.getData().PaymentRequest.Items[i].Employee,
					"U_APP_Department": this.oModel.getData().PaymentRequest.Items[i].Department,
					"U_APP_Program": this.oModel.getData().PaymentRequest.Items[i].Program,
					"U_APP_Budget": this.oModel.getData().PaymentRequest.Items[i].BudgetAvailable,
					"U_APP_Notes": this.oModel.getData().PaymentRequest.Items[i].Notes,
					"U_APP_Depository": this.oModel.getData().PaymentRequest.Items[i].Division,
					"U_APP_EmployeeType": this.oModel.getData().PaymentRequest.Items[i].EmployeeType,
					"U_APP_SpecialistCode": this.oModel.getData().PaymentRequest.Items[i].SpecialistCode,
					"U_APP_GLSap": this.oModel.getData().PaymentRequest.Items[i].SAPGL,
					"U_APP_TaxLiable": this.oModel.getData().PaymentRequest.Items[i].TaxAmount,
					"U_WTLiable": this.oModel.getData().PaymentRequest.Items[i].TaxLiable
        });
			}
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDOCENTRY&VALUE1=" + this.oModel.getData().PaymentRequest.No + "&VALUE=APP_ORFP",
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
				$.ajax({
					url: "https://13.215.36.201:50000/b1s/v1/APP_ORFP(" + results[0].DocEntry + ")",
					data: JSON.stringify(PaymentRequestBody),
					headers: { "B1S-ReplaceCollectionsOnPatch": true },
					type: "PATCH",
					crossDomain: true,
					xhrFields: {
						withCredentials: true
					},
					error: function (xhr, status, error) {
						var Message = xhr.responseJSON["error"].message.value;
						APPui5.APPMESSAGEBOX(Message);;
					},
					context: this,
					success: async function (json) {
						if(localStorage.getItem("AttcEntry") !== ""){
							this.onUpdateAttachnent();
						   }
						APPui5.APPMESSAGEBOX("Transaction save as Draft!");
						this.getView().byId("AddrowID").setEnabled(false);
						this.getView().byId("DelRowID").setEnabled(false);
					}
				}).done(function (results) {
					this.onClearData();
			
				});

			});
		},
		onLoadSpecialist: function () {
		this.oModel.getData().Specialist = [];
		$.ajax({
			url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETSPECIALIST",
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
			var i;
			for (i = 0; i < results.length; i++) {
			this.oModel.getData().Specialist.push({
				"ItmsTypCod": results[i].ItmsTypCod,
				"ItmsGrpNam": results[i].ItmsGrpNam
			})
			}
		});
		},
		handleAttachment: function (oEvent) {
			var aFiles = oEvent.getParameters().files;
			this.currentFile = aFiles[0];
			var FileName = this.getView().byId("fileUploader1").getValue();
			var form = new FormData();
			form.append("", this.currentFile, FileName);
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
						this.getView().byId("fileUploader1").setValue("");
						var ErrorMassage = xhr.responseJSON["error"].message.value;
						APPui5.APPMESSAGEBOX(ErrorMassage);;
						return;
					},
					context: this,
					success: function (json) { }
				}).done(function (results) {
					console.log(results)
					if (results) {
						var oResult = JSON.parse(results);
						this.FileKey = oResult.AbsoluteEntry;
						this.oModel.getData().PaymentRequest.AttachmentEntry=this.FileKey;
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
						this.getView().byId("fileUploader1").setValue("");
						this.oModel.refresh();
					}
				});
				
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
				var Message = xhr.responseJSON["error"].message.value;
				APPui5.APPMESSAGEBOX(Message);;
			  },
			  success: function (json) {
			  },
			  context: this
			}).done(function (results) {
			  this.getView().byId("fileUploader").setValue(results[0].FileName);
			});
		},
		onCancel: function () {
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDOCENTRY&VALUE1=" + this.oModel.getData().PaymentRequest.No + "&VALUE=APP_ORFP",
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
				$.ajax({
					url: "https://13.215.36.201:50000/b1s/v1/APP_ORFP(" + results[0].DocEntry + ")/Cancel",
					type: "POST",
					crossDomain: true,
					xhrFields: {
						withCredentials: true
					},
					error: function (xhr, status, error) {
						var Message = xhr.responseJSON["error"].message.value;
						APPui5.APPMESSAGEBOX(Message);;
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
					new Filter("Payee", FilterOperator.EQ, sQuery),
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

			this.byId("PMTTable").getBinding("rows").filter(oFilter, "Application");
		},
		ApprovalRoute: function (DocType, UserCode, DocNum, DocDate, DueDate, Remarks, totalAmount, isDepartment, isDepository) {
			var oUrls = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_APPROVALROUTE&VALUE1=" + DocType + "&VALUE2=" + UserCode + "&VALUE3=" + DocNum + "&VALUE4=1";
			$.ajax({
				url: oUrls,
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
						ApprovalPostingBody.U_APP_Status2 = "Pending";
						ApprovalPostingBody.U_APP_Stage = results[i].U_APP_Stages,
						ApprovalPostingBody.U_APP_Level = results[i].U_APP_Level,
						ApprovalPostingBody.U_APP_Template= results[i].Name,
						ApprovalPostingBody.U_APP_Authorizer = results[i].U_APP_Authorizer;
						ApprovalPostingBody.U_APP_DocType = DocType;
						ApprovalPostingBody.U_APP_DocNum = DocNum;
						ApprovalPostingBody.U_APP_Originator = UserCode;
						ApprovalPostingBody.U_APP_Department = isDepartment;
						ApprovalPostingBody.U_APP_Depository = isDepository;
						ApprovalPostingBody.U_APP_Remarks = Remarks;
						ApprovalPostingBody.U_APP_DocDate = DocDate;
						ApprovalPostingBody.U_APP_DueDate = DueDate;
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
								const replacedP = 'P' + strAmount;
							
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
									"Payee": opayeeName,
								   	"Amount": replacedP,
									"Subject": "[PAYMENT REQUEST]",
									"Date": APPui5.getDatePostingFormat(ApprovalPostingBody.U_APP_DocDate),
									"Remarks": ApprovalPostingBody.U_APP_Remarks,
									"Approver": localStorage.getItem("ApproverName"),
									"Originator": localStorage.getItem("RequestorName")
								});
								that.onSendEmail(oEmail);
							}
						}).done(function (results) {
							APPui5.APPMESSAGEBOX("Transaction Succesfully submitted for approval!\nTransaction No:" + DocNum);
						});
					}
				}
				else {
					// this.PostToSAP(this.oModel.getData().PaymentRequest.No);
					//--As Discussed Removed Direct Posting in SAP--//
					APPui5.APPMESSAGEBOX("No approval path found for this transaction.");
					return;
				}

			});
		},
		onSendEmail: function(Content){
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
				localStorage.setItem("ApproverEmail",results[0].E_Mail);
				localStorage.setItem("ApproverName",results[0].U_NAME);             
			});
		  },      
	  

		PostToSAP: function (DocNum) {
			var PaymentRequest = {};
			PaymentRequest.U_APP_CKRNO = this.oModel.getData().PaymentRequest.No;
			PaymentRequest.NumAtCard = this.oModel.getData().PaymentRequest.No;
			PaymentRequest.U_APP_Requester = this.oModel.getData().PaymentRequest.RequesterCode;
			PaymentRequest.DocDate = this.oModel.getData().PaymentRequest.RequestDate;
			PaymentRequest.DocDueDate = this.oModel.getData().PaymentRequest.RequiredDate;
			PaymentRequest.CardCode = this.oModel.getData().PaymentRequest.Payee;
			PaymentRequest.Comments = this.oModel.getData().PaymentRequest.Remarks;
     		PaymentRequest.U_EmpLoanType = this.oModel.getData().PaymentRequest.LoanType;
			PaymentRequest.DocType = "dDocument_Items";
			// if (this.oModel.getData().PaymentRequest.AttachmentEntry!=='0'){
			// 	PaymentRequest.AttachmentEntry=this.oModel.getData().PaymentRequest.AttachmentEntry;
			// }
			PaymentRequest.DocumentLines = [];

			for (var i = 0; i < this.oModel.getData().PaymentRequest.Items.length; i++) {
				var Dimension2
				if (this.oModel.getData().PaymentRequest.Items[i].Division != "") {

					Dimension2 = this.oModel.getData().PaymentRequest.Items[i].Division;
				}
				else {
					Dimension2 = this.oModel.getData().PaymentRequest.Items[i].Depository;
				}

					
					PaymentRequest.DocumentLines.push({
						"ItemCode": this.oModel.getData().PaymentRequest.Items[i].ItemCode,
						"ItemDescription": this.oModel.getData().PaymentRequest.Items[i].Description,
						"U_APP_Type": this.oModel.getData().PaymentRequest.Items[i].Type,
						"AccountCode": this.oModel.getData().PaymentRequest.Items[i].SAPGL,
						"CostingCode": this.oModel.getData().PaymentRequest.Items[i].FundType,
						"CostingCode2": this.oModel.getData().PaymentRequest.Items[i].Division,
						"CostingCode3": this.oModel.getData().PaymentRequest.Items[i].Program,
						"CostingCode4": this.oModel.getData().PaymentRequest.Items[i].Department,
						"CostingCode5": this.oModel.getData().PaymentRequest.Items[i].Employee,
						"Quantity": this.oModel.getData().PaymentRequest.Items[i].Quantity,
						"UoMCode": this.oModel.getData().PaymentRequest.Items[i].UOM,
						"UnitPrice": this.oModel.getData().PaymentRequest.Items[i].EstUnitPrice,
						"LineTotal": this.oModel.getData().PaymentRequest.Items[i].EstAmount,
						"VatGroup": this.oModel.getData().PaymentRequest.Items[i].TaxCode,
						"FreeText": this.oModel.getData().PaymentRequest.Items[i].Notes,
						"WarehouseCode": this.oModel.getData().PaymentRequest.Items[i].Warehouse,
						"U_APP_TaxLiable": this.oModel.getData().PaymentRequest.Items[i].TaxAmount,
						"U_WTLiable": this.oModel.getData().PaymentRequest.Items[i].TaxLiable,
						"TotalDiscountFC": 0,
						"TotalDiscountSC": 0,
						"DiscountPercent": 0,
						"TotalDiscount": 0
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
					var Message = xhr.responseJSON["error"].message.value;
					APPui5.APPMESSAGEBOX(Message);
				},
				context: this,
				success: function (json) {
					$.ajax({
						url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDOCENTRY&VALUE1=" + DocNum + "&VALUE=APP_ORFP",
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
						$.ajax({
							url: "https://13.215.36.201:50000/b1s/v1/APP_ORFP(" + results[0].DocEntry + ")/Close",
							type: "POST",
							crossDomain: true,
							xhrFields: {
								withCredentials: true
							},
							error: function (xhr, status, error) {
								var Message = xhr.responseJSON["error"].message.value;
								APPui5.APPMESSAGEBOX(Message);;
								return
							},
							context: this,
							success: function (json) {
							}
						}).done(function (results) {
						});

					});
					APPui5.APPMESSAGEBOX("Transaction Succesfully Posted in SAP!")
				}
			}).done(function (results) {
			});
		},
		onInquiry: function () {
			var DocNum = this.oModel.getData().PaymentRequest.No;
			var ApprovalInquiryRecord = {
				"DocNum": DocNum
			};
			var oModelDocNum = new JSONModel(ApprovalInquiryRecord);
			this.getOwnerComponent().setModel(oModelDocNum, "oModelDocNum");
			var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			oRouter.navTo("PaymentRequestInquiry");
		},
		onPreview: function(){  
    
			if (!this.oReportViewer) {
			  this.oReportViewer = sap.ui.xmlfragment("com.apptech.DLSL.view.fragments.ReportViewer",this);
			  this.getView().addDependent(this.oReportViewer);
			}
			
			this.oReportViewer.open();
		  
			var docentry = this.oModel.getData().PaymentRequest.DocEntry;
			// var objectId = "1470000113";
			var report = 'PR';
		  
			var sRedirectUrl = `http://digitalhub.dlsl.edu.ph/DLSL-TRX_Forms/TRXForms-viewer.jsp?report=${report}&docentry=${docentry}`;
			$('#ReportViewerIframe').attr("src",sRedirectUrl);
			
		  },
		
		  onCloseReport: function(){
			this.oReportViewer.close();
			this.oReportViewer.destroy();
			this.oReportViewer=null;
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

		PostOnATCH: function(AbsoluteEntry,FileName){
			var that = this;
			var oBody = {};
			oBody.Code = AbsoluteEntry,
			oBody.Name = AbsoluteEntry,
			oBody.U_AttachmentDate = APPui5.getDateFormat(new Date()),
			oBody.U_ObjType = "APP_ORFP",
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

		onAttachmentDoc: function(Code){
			try{
				var attachmentDoc = {};
				var ottachments =  this.oModel.getData().Attachments;
				for(let i = 0;i < ottachments.length;i++){
					attachmentDoc.U_FreeText = ottachments[i].U_FreeText;
					attachmentDoc.U_DocEntry = Code;
					
					$.ajax({
						url: "https://13.215.36.201:50000/b1s/v1/U_APP_ATCH('" + ottachments[i].Code + "')",
						data: JSON.stringify(attachmentDoc),
						type: "PATCH",
						crossDomain: true,
						xhrFields: {
							withCredentials: true
						},
						error: function (xhr, status, error) {
							var Message = xhr.responseJSON["error"].message.value;
							APPui5.APPMESSAGEBOX(Message);;
							console.log(Message)
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
				  APPui5.APPMESSAGEBOX(Message);
				  return
			  },success:async function (json) {
				console.log("Success");
			  }
			});
		  },
	
		  DeleteAttachment: function(){
				var that = this;
				MessageBox.information("Are you sure you want to remove this?\nAll the attachment will be lost.", {
				actions: [MessageBox.Action.YES, MessageBox.Action.NO],
				title: "Delete Attachment",
				icon: MessageBox.Icon.QUESTION,
				styleClass:"sapUiSizeCompact",
				onClose: function (sButton) {
				 if(sButton === "YES"){
					localStorage.setItem("AttcEntry", "");
					that.oModel.getData().Attachments = [];
					that.oModel.refresh();
				 }
				}
				});
		  },

		  onAttchFile: function(oEvent){
			var that = this;
			oFileExist = 0;
			var oDupMessage = "";
			localStorage.setItem("AttcEntry","");
			var canUpload = true;
			that.oModel.getData().Attachments = [];
			var aFiles = oEvent.getParameters().files;
			that.oModel.getData().Attachments = [];
			var form = new FormData();
			for(let a=0; a < aFiles.length;a++){
				that.currentFile =  oEvent.getParameters().files[a];
				var FileName = aFiles[a].name;
				var cFileName = FileName.split('.').slice(0, -1).join('.');
				that.ongetAttachmentExist(cFileName);
				if(oFileExistContainer.length !== 0){
				  oFileExist = oFileExistContainer.length;
				}else{
				  oFileExist = 0;
				}
			   
				if(oFileExist !== 0){
				  canUpload = false;
				  oDupMessage = oDupMessage + FileName + " Already exist in path\n";
				}else{
				  form.append("file", that.currentFile, FileName);
				}
			  }
				
		

		 if(canUpload !== true){
			AppUI5.APPMESSAGEBOX(oDupMessage);
			that.oModel.getData().Attachments = [];
		 }else{
			$.ajax({
				url:"https://13.215.36.201:50000/b1s/v1/Attachments2",
				data: form,
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
				success: async function (json) {
				//   await that.DeleteAttachment();
				  var oResult = JSON.parse(json);
				  iKey = oResult.AbsoluteEntry;
				  that.oModel.getData().Attachments = oResult.Attachments2_Lines;
				  that.oModel.refresh()
				  localStorage.setItem("AttcEntry",oResult.AbsoluteEntry);
				  APPui5.APPMESSAGEBOX(that.oModel.getData().Attachments.length + " file uploaded.");
				}
			  });
		 }
		  
		  that.getView().byId("fileUploader1").setValue("");
		  that.oModel.refresh();
		},


		ongetAttachmentExist: function(fileName){
			oFileExistContainer = [];
			$.ajax({
				url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=spApp_checkAttachmnts&VALUE1=" + fileName,
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
				if(results.length !== 0){
					oFileExistContainer = results;
				}
			});
		},


	});
});
