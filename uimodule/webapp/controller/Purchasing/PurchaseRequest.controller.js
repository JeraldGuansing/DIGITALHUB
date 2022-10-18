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
  "sap/ui/core/format/NumberFormat",
  "sap/m/MessageBox"
], function (jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast, APPui5, Filter, FilterOperator,NumberFormat,MessageBox) {
  "use strict";
  var PRStatus;
  var divResult;
  var oDocNum;
  var oFormAttach;
  var OTCH = [];
  var oDept;
  var iKey;
  var oFileExist;
  var postingState;
  var oSufix;
  var oSize;
  var oSelectedDept;
  var oSelectedDepo;
  var oFileExist;
  return Controller.extend("com.apptech.DLSL.controller.Purchasing.PurchaseRequest", {
    onInit: function(){
      this.oModel = new JSONModel("model/purchaserequest.json");
      this.getView().setModel(this.oModel, "oModel");
      this.router = this.getOwnerComponent().getRouter();
      this.iSelectedRow = 0;
      this.FileKey;
      this.DocNum=0;
      oFileExist = "0";
      postingState = 0;
      iKey = "";
      var Router=sap.ui.core.UIComponent.getRouterFor(this);
      Router.getRoute("PurchaseRequest").attachMatched(this._onRouterMatched,this);
      
      this.getView().byId("position").setVisible(false);
      this.onHideDetails();
      var that = this;
	    var oView = this.getView();
        oView.addEventDelegate({
            onAfterHide: function(evt) {
                //This event is fired every time when the NavContainer has made this child control invisible.
            },
            onAfterShow: function(evt) {
                //This event is fired every time when the NavContainer has made this child control visible.
                oView.getController().OnLoadDept();
                oView.getController().OnLoadUsers();
                oView.getController().onLoadPositions();
                oView.getController().onLoadItems();
                oView.getController().onLoadGL();
                oView.getController().onLoadDimensions();
                oView.getController().OnLoadUserDept();
                // oView.getController().onLoadUOM();
                oView.getController().onLoadVendor();
                oView.getController().getSeriesDetails();
                oView.getController().onLoadTaxCodes();
                oView.getController().onLoadWhse();
                oView.getController().onLoadSpecialist();
                oView.getController().OnLoadRecords();
                // oView.getController().OpenAddScreen();
                // oView.getController().onLoadUsers();
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
      try{
        this.oModel.getData().PurchaseRequest.RequestDate = APPui5.getDateFormat(new Date());
        this.oModel.getData().PurchaseRequest.RequiredDate = APPui5.getDateFormat(new Date());
      }catch (e){
        console.log(e); 
      }
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
      this.getView().byId("reqDate").setValue(tomorrow);

      var isToday = new Date();
      var oday  = String(isToday.getDate()).padStart(2, '0');
      var oMonth = String(isToday.getMonth() + 1).padStart(2, '0'); //January is 0!
      var oYear = isToday.getFullYear();


      isToday =  oYear + "-" + oMonth + "-" + oday;
      this.getView().byId("reqDate").setValue(isToday);
      
      this.oModel.getData().PurchaseRequest.RequiredDate = tomorrow;
      },



      
    _onRouterMatched:function(oEvent){
      try{
        var oModelDocNum=this.getView().getModel("oModelDocNum");
        this.DocNum=oModelDocNum.getData().DocNum;
        this.getView().byId("PRNo").setValue(this.DocNum);
        this.oModel.getData().isEnabled=false;           
        this.onLoadPRRecord();
      }catch (e){
        console.log(e)
      } 
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
    OpenAddScreen: function () {
      this.onClearData();
      this.oModel.getData().PurchaseRequest.DepartmentCode1 = "";
      this.oModel.getData().PurchaseRequest.Division = "";
      this.oModel.getData().PurchaseRequest.FundType = "";
      this.oModel.getData().PurchaseRequest.Program = "";

      oSelectedDept = "";
      oSelectedDepo = "";

      postingState = 0;
      this.oModel.getData().Controls.AddOrEdit = "Add Purchase Request";
      this.oModel.getData().PurchaseRequest.RequestDate = APPui5.getDateFormat(new Date());
      // this.oModel.getData().PurchaseRequest.RequiredDate = APPui5.getDateFormat(new Date());
      this.oModel.getData().PurchaseRequest.DepartmentCode = "";
      this.oModel.getData().PurchaseRequest.Division = "";
      this.getView().byId("HDept").setValue("");


      this.getView().byId("PRNo").setEditable(false);
      this.getView().byId("status").setEditable(false);
      this.getView().byId("CancelBtn").setEnabled(false);
      this.getView().byId("status").setSelectedKey("O");
      this.getView().byId("AddrowID").setEnabled(true);
      this.getView().byId("DelRowID").setEnabled(true);   

      this.getView().byId("fileUploader1").setEnabled(true);
			this.oModel.getData().Attachments = [];
      localStorage.setItem("AttcEntry", "");
      this.oModel.getData().PurchaseRequest.RequesterCode=jQuery.sap.storage.Storage.get("userCode");
      this.onChangeUser(jQuery.sap.storage.Storage.get("userCode"));
      // this.getNextNumber();
      this.oModel.getData().isEnabled=true;
      this.getView().byId("PRNo").setValue(this.oModel.getData().PurchaseRequest.No);
      this.OnLoadUsers();
      var storedUser = this.oModel.getData().Users;
      const sSRI = storedUser.filter(function(SSI){
      return SSI.UserCode == localStorage.getItem("UserCode")})
      this.getView().byId("position").setValue(sSRI[0].jobTitle);
      this.oModel.refresh();
      this.onThreeDays();
      this.OnAddRow();
  
    },
    onSelectionChange: function(oEvent) {
      var oYourTable = this.getView().byId("PurchaseRequestItems"),
          iSelectedIndex = oEvent.getSource().getSelectedIndex();
  
      oYourTable.setSelectedIndex(iSelectedIndex);
    },
    onSelectionChange1: function(oEvent) {
      var oYourTable = this.getView().byId("PRTable"),
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
      this.getView().byId("PurchaseRequestItems").getColumns()[7].setVisible(false);
      this.getView().byId("PurchaseRequestItems").getColumns()[8].setVisible(false);
      this.getView().byId("PurchaseRequestItems").getColumns()[11].setVisible(false);
      this.getView().byId("PurchaseRequestItems").getColumns()[12].setVisible(false);
      this.getView().byId("PurchaseRequestItems").getColumns()[13].setVisible(false);
      this.getView().byId("PurchaseRequestItems").getColumns()[14].setVisible(false);
      this.getView().byId("PurchaseRequestItems").getColumns()[15].setVisible(false);
      this.getView().byId("PurchaseRequestItems").getColumns()[16].setVisible(false);
      this.getView().byId("PurchaseRequestItems").getColumns()[17].setVisible(false);
      this.getView().byId("PurchaseRequestItems").getColumns()[18].setVisible(false);
    },

    onShowDetails: function(){
      this.getView().byId("PurchaseRequestItems").getColumns()[7].setVisible(true);
      this.getView().byId("PurchaseRequestItems").getColumns()[8].setVisible(true);
      this.getView().byId("PurchaseRequestItems").getColumns()[11].setVisible(true);
      this.getView().byId("PurchaseRequestItems").getColumns()[12].setVisible(true);
      this.getView().byId("PurchaseRequestItems").getColumns()[13].setVisible(true);
      this.getView().byId("PurchaseRequestItems").getColumns()[14].setVisible(true);
      this.getView().byId("PurchaseRequestItems").getColumns()[15].setVisible(true);
      this.getView().byId("PurchaseRequestItems").getColumns()[16].setVisible(true);
      this.getView().byId("PurchaseRequestItems").getColumns()[17].setVisible(true);
      this.getView().byId("PurchaseRequestItems").getColumns()[18].setVisible(true);
    },
    
    handleValueHelpPR: function (oEvent) {
			if (!this._oValueHelpDialogPR) {
				Fragment.load({
					name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseNo",
					controller: this
				}).then(function (oValueHelpDialogPR) {
					this._oValueHelpDialogPR = oValueHelpDialogPR;
					this.getView().addDependent(this._oValueHelpDialogPR);
					this._oValueHelpDialogPR.open();
				}.bind(this));
			} else {
				this._oValueHelpDialogPR.open();
			}
		},

    handleSearchPR: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilters = new Filter([
				new Filter("No", FilterOperator.Contains, sValue),
				new Filter("RequestDate", FilterOperator.Contains, sValue)
			], false);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(oFilters);
		},

    handleValueClosePR: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			var PMRecords = {};
			if (aContexts && aContexts.length) {
				PMRecords = aContexts.map(function (oContext) {
					var oRecords = {};
					oRecords.No = oContext.getObject().No;
          oRecords.Status = oContext.getObject().Status;
					return oRecords;
				});
			}

			oEvent.getSource().getBinding("items").filter([]);
      this.getView().byId("PRNo").setValue(PMRecords[0].No);
      this.getView().byId("status").setValue(PMRecords[0].Status);
      this.OpenUpdateScreen();
			this.oModel.refresh();
     
		},

    onFindData: function(){
      if(this.getView().byId("PRNo").setEditable(true)){
        this.onClearData();
        this.getView().byId("status").setEditable(false);
        this.getView().byId("CancelBtn").setEnabled(true);
        this.oModel.getData().Controls.AddOrEdit = "Update Purchase Request";
        this.handleValueHelpPR();
        postingState = 1;
      }else{
        this.OpenAddScreen();
      }
    },

    onChangeNumber: function(){
      if(this.getView().byId("PRNo").getValue() !== ""){
        this.OpenUpdateScreen();
      }
    },


    OpenUpdateScreen: function () {
      // this.onClearData();
      PRStatus = "";
      this.getView().byId("PRNo").setEditable(true);
      if(this.getView().byId("PRNo").getValue() !== ""){     
      this.onLoadPRRecord(this.getView().byId("PRNo").getValue());
      this.oModel.getData().Controls.AddOrEdit = "Update Purchase Request";
      this.oModel.refresh();
     
      this.getView().byId("status").setEditable(false);
      this.getView().byId("CancelBtn").setEnabled(true);
      this.oModel.getData().Attachments = [];

      this.OnLoadUsers();
      var storedUser = this.oModel.getData().Users;
      const sSRI = storedUser.filter(function(SSI){
      return SSI.UserCode == localStorage.getItem("UserCode")})
      this.getView().byId("position").setValue(sSRI[0].jobTitle);
      this.oModel.refresh();
    
      if (PRStatus =="C"){
        this.getView().byId("CancelBtn").setEnabled(false);
        // this.getView().byId("ApprovalBtn").setEnabled(false);
        this.oModel.getData().isEnabled=false;
        this.getView().byId("AddrowID").setEnabled(false);
        this.getView().byId("DelRowID").setEnabled(false);
        this.getView().byId("fileUploader1").setEnabled(false);
        this.oModel.refresh();
      }else{
        this.getView().byId("AddrowID").setEnabled(true);
        this.getView().byId("DelRowID").setEnabled(true);
        this.getView().byId("fileUploader1").setEnabled(true);
        var oUrl = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ localStorage.getItem("DLSLDB") +"&procName=SPAPP_CHECKAPPROVAL&VALUE1=" + this.getView().byId("PRNo").getValue() + "&VALUE2=Purchase Request";
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
          
          if(results.length===0){       
            this.getView().byId("CancelBtn").setEnabled(true);
            // this.getView().byId("ApprovalBtn").setEnabled(false);
            this.oModel.getData().isEnabled=true;
            this.oModel.refresh();
          }
          else
          {   
            this.getView().byId("CancelBtn").setEnabled(false);
            // this.getView().byId("ApprovalBtn").setEnabled(true);
            this.oModel.getData().isEnabled=false;
            this.oModel.refresh();
          }
        });
      }
      // tab.setSelectedKey("AddPRRecords");
      }else{
       
      }
    },
    OnCancelScreen: async function () {
      var prompt = await APPui5.onPrompt("WARNING MESSAGE!", "Are you sure you want to go back without adding/updating the document?");
      if (prompt === 0) {
        return;
      }
      this.getView().byId("idIconTabBarInlineMode").getItems()[1].setText("");
      var tab = this.getView().byId("idIconTabBarInlineMode");
      tab.setSelectedKey("PRRecords");
    },
    OnAddRow: function () {
      localStorage.setItem("AttcEntry", "");
      this.oModel.getData().PurchaseRequest.Items.push({
        "ItemCode": "",
        "Description": "",
        "SpecialistCode": "",
        "Type": "",
        "GlAccount": "",
        "FundType": this.oModel.getData().PurchaseRequest.FundType,
        "Program": this.oModel.getData().PurchaseRequest.Program,
        "Department":  this.oModel.getData().PurchaseRequest.DepartmentCode1,
        "Division":  this.oModel.getData().PurchaseRequest.Division,
        "Employee":"",
        "Quantity": "1",
        "UOM": "Manual",
        "UOMEntry": "-1",
        "EstUnitPrice": "0",
        "EstAmount": "",
        "BudgetAvailable": "",
        "Vendor": "",
        "TaxCode": "",
        "Warehouse": "WHSE1",
        "Notes": ""
      });
      this.oModel.refresh();
    },
    OnDeleteRow: function () {
      this.tblItems = this.getView().byId("PurchaseRequestItems");
      this.oModel.getData().PurchaseRequest.Items.splice(this.tblItems.getSelectedIndex(), 1);
      this.oModel.refresh();
    },

    onLoadUserRecords: function(){
      try{
        this.oModel.getData().PurchaseRequestRecords = [];
        this.oModel.refresh();
        var urlString = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=spApp_GetTransaction&VALUE1=APP_OPRQ&VALUE2=" + localStorage.getItem("UserCode");
        $.ajax({
          url: urlString,
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
            var StatusName;
            var infoStatate = "Information";
              if(results[i].U_APP_IsDraft == "No"){
                if(results[i].Canceled == "Y"){
                  infoStatate = "Error";
                  StatusName = "Cancelled";
                }else{
                  if(results[i].Status == "C"){
                    infoStatate = "Success";
                    StatusName = "Approved";
                  }else{
                    infoStatate = "Information";
                    StatusName = "Open";
                  }
                }
              }else{
                infoStatate = "Information";
                StatusName = "Draft";
              }
             
                this.oModel.getData().PurchaseRequestRecords.push({
                  "No": results[i].DocNum,
                  "Requester": results[i].U_APP_Requester,
                  "RequesterName": results[i].U_NAME,
                  "Position": results[i].U_APP_Position,
                  "Department": results[i].U_APP_Department,
                  "RequestDate": APPui5.getDatePostingFormat(results[i].U_APP_RequestDate),
                  "RequiredDate": APPui5.getDatePostingFormat(results[i].U_APP_RequiredDate),
                  "Status": StatusName,
                  "Remarks": results[i].Remark,
                  "Draft":results[i].U_APP_IsDraft,
                  "InfoState": infoStatate
                });
            
          }
          this.oModel.refresh();
        });
      }catch(e) {
        console.log(e)
      }
        this.closeLoadingFragment();
    }, 

    onLoadAdminRecords: function(){
      try{
        this.oModel.getData().PurchaseRequestRecords = [];
        this.oModel.refresh();
        var urlString = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=spApp_AdminTransaction&VALUE1=APP_OPRQ";
        $.ajax({
          url: urlString,
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
            var StatusName;
            var infoStatate = "Information";
              if(results[i].U_APP_IsDraft == "No"){
                if(results[i].Canceled == "Y"){
                  infoStatate = "Error";
                  StatusName = "Cancelled";
                }else{
                  if(results[i].Status == "C"){
                    infoStatate = "Success";
                    StatusName = "Approved";
                  }else{
                    infoStatate = "Information";
                    StatusName = "Open";
                  }
                }
              }else{
                infoStatate = "Information";
                StatusName = "Draft";
              }
             
                this.oModel.getData().PurchaseRequestRecords.push({
                  "No": results[i].DocNum,
                  "Requester": results[i].U_APP_Requester,
                  "RequesterName": results[i].U_NAME,
                  "Position": results[i].U_APP_Position,
                  "Department": results[i].U_APP_Department,
                  "RequestDate": APPui5.getDatePostingFormat(results[i].U_APP_RequestDate),
                  "RequiredDate": APPui5.getDatePostingFormat(results[i].U_APP_RequiredDate),
                  "Status": StatusName,
                  "Remarks": results[i].Remark,
                  "Draft":results[i].U_APP_IsDraft,
                  "InfoState": infoStatate
                });
            
          }
          this.oModel.refresh();
        });
      }catch(e) {
        console.log(e)
      }
        this.closeLoadingFragment();
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
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETUSERS",
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
    getSeriesDetails: function () {
      this.oModel.getData().Users = [];
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=spApp_Series&Value1=Purchase Request",
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
          if(json.length !== 0){
              oSufix = json[0].U_APP_Sufix;
              oSize = json[0].U_APP_Size;
          }
        },
        context: this
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
          APPui5.APPMESSAGEBOX(Message);
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
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETPOSITIONS",
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
      });
    },
    onLoadItems: function () {
      this.oModel.getData().Items = [];
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETITEMS&VALUE1=Purchase Request",
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
            "U_GLAccount": results[i].U_GLAccount,
            "UomName": results[i].UomName
          });
        }
      });
    },
    onLoadGL: function () {
      this.oModel.getData().GL = [];
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETGLACCOUNT",
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
      this.oModel.getData().Employee=[];
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDIMENSIONS",
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
          if (results[i].DimCode === 1) {
            this.oModel.getData().FundType.push({
              "PrcCode": results[i].PrcCode,
              "PrcName": results[i].PrcName,
              "GrpCode":results[i].GrpCode
            });
          }
          else if (results[i].DimCode === 2) {
              this.oModel.getData().DivAll.push({
                "PrcCode": results[i].PrcCode,
                "PrcName": results[i].PrcName,
                "GrpCode":results[i].GrpCode
              });
                     
          }
          else if (results[i].DimCode === 4) {
            this.oModel.getData().DeptAll.push({
              "PrcCode": results[i].PrcCode,
              "PrcName": results[i].PrcName,
              "GrpCode":results[i].GrpCode
            });
          }
          else if (results[i].DimCode === 3) {
            this.oModel.getData().Program.push({
              "PrcCode": results[i].PrcCode,
              "PrcName": results[i].PrcName,
              "GrpCode":results[i].GrpCode
            })
          }
          else if (results[i].DimCode===5){
            this.oModel.getData().Employee.push({
              "PrcCode":results[i].PrcCode,
              "PrcName":results[i].PrcName,
              "GrpCode":results[i].GrpCode
            })
          }
        }
      });
    
    },
    onLoadUOM: function (ItemCode) {
      this.oModel.getData().UOM = [];
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_UOMGRP&Value1=" + ItemCode,
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
            "UomEntry": results[i].UomEntry,
            "UomCode": results[i].UomCode,
            "UomName": results[i].UomName
          })
        }
      });
    },
    onLoadVendor: function () {
      this.oModel.getData().Vendor = [];
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETVENDOR",
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
          this.oModel.getData().Vendor.push({
            "CardCode": results[i].CardCode,
            "CardName": results[i].CardName
          })
        }
      });
    },
    onLoadTaxCodes: function () {
      this.oModel.getData().TaxCode = [];
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETTAXCODE",
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
      });
    },
    onLoadWhse: function () {
      this.oModel.getData().Warehouse = [];
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETWHSE",
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
          APPui5.APPMESSAGEBOX(Message);
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


    onLoadPRRecord:function(RowIndex){
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDOCENTRY&VALUE1="+ this.getView().byId("PRNo").getValue() +"&VALUE2=APP_OPRQ",
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
        var SURL =  "https://13.215.36.201:50000/b1s/v1/APP_OPRQ("+ results[0].DocEntry +")";
       
        $.ajax({
          url: SURL,
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
         
          var DepartmentName="";
          var RequesterName="";
          const result = this.oModel.getData().Department.find(({ Code }) => Code === parseInt(results.U_APP_Department));
          if (result!=undefined){
            DepartmentName = result.Description;
          }
        //   const resultrequester= this.oModel.getData().Users.find(({ UserCode })=> UserCode ===results.U_APP_Requester);
        //  if (resultrequester!=""){
        //   RequesterName=resultrequester.UserName;
        //  }
          this.oModel.getData().PurchaseRequest.DocEntry=results.DocEntry;
          this.oModel.getData().PurchaseRequest.No=results.DocNum;
          this.oModel.getData().PurchaseRequest.RequestDate=results.U_APP_RequestDate;
          this.oModel.getData().PurchaseRequest.RequiredDate=results.U_APP_RequiredDate;
          this.oModel.getData().PurchaseRequest.RequesterCode=results.U_APP_Requester;
          this.oModel.getData().PurchaseRequest.RequesterName=localStorage.getItem("loginName");
          this.oModel.getData().PurchaseRequest.DepartmentCode=results.U_APP_Department;
          this.oModel.getData().PurchaseRequest.DepartmentName=DepartmentName;
          this.getView().byId("position").setValue(results.U_APP_Position);
          this.oModel.getData().PurchaseRequest.PositionCode=results.U_APP_Position;
          this.oModel.getData().PurchaseRequest.Remarks=results.Remark;
          
          // this.getView().byId("status").setSelectedKey(results.Status);
          PRStatus = results.Status;
       
          this.oModel.getData().PurchaseRequest.StatusCode=results.status;
          this.oModel.getData().PurchaseRequest.Draft=results.U_APP_IsDraft;
          // this.oModel.getData().PurchaseRequest.AttachmentEntry=results.U_APP_Attachment;
          if(results.U_APP_Attachment !== null || results.U_APP_Attachment !== ""){
            this.getFromAttachment(results.U_APP_Attachment);
          }
         
          this.oModel.getData().PurchaseRequest.Items=[];

          
          this.oModel.getData().PurchaseRequest.DepartmentCode1 = results.APP_PRQ1Collection[0].U_APP_Department;
          this.oModel.getData().PurchaseRequest.Division = results.APP_PRQ1Collection[0].U_APP_Division;

          for(var i=0;i<results.APP_PRQ1Collection.length;i++){
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

    handleValueHelpDept: function (oEvent) {
      if (!this._oValueHelpDialogDept) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestDept",
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
      this.oModel.getData().PurchaseRequest.DepartmentCode = Departments[0].Code;
      this.oModel.getData().PurchaseRequest.DepartmentName = Departments[0].Description;
      this.oModel.refresh();

    },
    handleValueHelpUsers: function (oEvent) {
      if (!this._oValueHelpDialogUser) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestUser",
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
      this.oModel.getData().PurchaseRequest.RequesterCode = Users[0].UserCode;
      this.oModel.getData().PurchaseRequest.RequesterName = Users[0].UserName;
      this.oModel.refresh();
      // this.onChangeUser(Users[0].UserCode);
    },
    handleValueHelpItems: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogItems) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestItems",
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
          oItems.UomName = oContext.getObject().UomName;
          return oItems;
        });
      }
      oEvent.getSource().getBinding("items").filter([]);
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].ItemCode = Items[0].ItemCode;
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].Description = Items[0].ItemName;
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].GlAccount = Items[0].U_GLAccount;
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].UOM = "Manual";
      
      this.oModel.refresh();
      this.onLoadUOM(Items[0].ItemCode);
      this.onChangeItem(Items[0].ItemCode);
    },
    handleValueHelpGL: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogGL) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestGL",
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
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].GlAccount = GL[0].AcctCode;
      this.oModel.refresh();

    },
    handleValueHelpFundType: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogFundType) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestFundType",
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
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].FundType = FundType[0].PrcCode;
      this.oModel.refresh();

    },
    handleValueHelpProgram: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogProgram) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestProgram",
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

    handleSearchDepository: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilters = new Filter([
        new Filter("AcctCode", FilterOperator.Contains, sValue),
        new Filter("AcctName", FilterOperator.Contains, sValue)
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
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].Program = Program[0].PrcCode;
      this.oModel.refresh();
      // this.onChangeProgram(Program[0].PrcCode);
    },
    handleValueHelpDepartment: function (oEvent) {
      // this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogDepartment) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestDepartment",
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

      this.oModel.getData().PurchaseRequest.DepartmentName1 = Department[0].PrcName;
      this.oModel.getData().PurchaseRequest.Division = Department[0].GrpCode;
      this.oModel.getData().PurchaseRequest.DepartmentCode1=  Department[0].PrcCode;
      this.oModel.getData().PurchaseRequest.DevisionCode = Department[0].DepositoryName;
      this.oModel.getData().PurchaseRequest.FundType = Department[0].U_FundType;

        var omember = Department[0].PrcCode;
        var odirectorate = omember.slice(0,4) + "00";

      this.oModel.getData().PurchaseRequest.Program = odirectorate;
      

      for(let i = 0;i < this.oModel.getData().PurchaseRequest.Items.length;i++){
        this.oModel.getData().PurchaseRequest.Items[i].Department = Department[0].PrcCode;
        this.oModel.getData().PurchaseRequest.Items[i].DepartmentName = Department[0].PrcName;
        this.oModel.getData().PurchaseRequest.Items[i].Division = Department[0].GrpCode;
        this.oModel.getData().PurchaseRequest.Items[i].FundType = Department[0].U_FundType;
       
        var member = Department[0].PrcCode;
        var directorate = member.slice(0,4) + "00";
        this.oModel.getData().PurchaseRequest.Items[i].Program = directorate;
      }
  
      // this.onChangeDepartment(Department[0].PrcCode);
      this.oModel.refresh();
    },
    handleValueHelpDiv: function (oEvent) {
      // this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogDiv) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestDiv",
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
      this.oModel.getData().PurchaseRequest.Division = Division[0].PrcCode;
      this.oModel.getData().PurchaseRequest.DepartmentName1 ="";
      this.oModel.getData().PurchaseRequest.DepartmentCode1="";
      oSelectedDept = "";
      oSelectedDepo = Division[0].PrcCode;

      for(var i=0; i < this.oModel.getData().PurchaseRequest.Items.length;i++){
        this.oModel.getData().PurchaseRequest.Items[i].Division = Division[0].PrcCode;
        this.oModel.getData().PurchaseRequest.Items[i].DivisionName = Division[0].PrcName;
        this.oModel.getData().PurchaseRequest.Items[i].Department = "";
        this.oModel.getData().PurchaseRequest.Items[i].Program = "";
      }
      this.oModel.refresh();
      this.onChangeDivision(Division[0].PrcCode);
    },
    handleValueHelpEmployee: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogEmployee) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestEmployee",
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
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].Employee = Employee[0].PrcCode;
      this.oModel.refresh();
     
    },
    handleValueHelpUOM: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogUOM) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestUOM",
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
          oUOM.UomEntry = oContext.getObject().UomEntry;
          oUOM.UomCode = oContext.getObject().UomCode;
          oUOM.UomName = oContext.getObject().UomName;
          return oUOM;
        });
      }
      oEvent.getSource().getBinding("items").filter([]);
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].UOM = UOM[0].UomCode;
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].UOMEntry = UOM[0].UomEntry;
      this.oModel.refresh();

    },
    handleValueHelpVendor: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogVendor) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestVendor",
          controller: this
        }).then(function (oValueHelpDialogVendor) {
          this._oValueHelpDialogVendor = oValueHelpDialogVendor;
          this.getView().addDependent(this._oValueHelpDialogVendor);
          this._oValueHelpDialogVendor.open();
        }.bind(this));
      } else {
        this._oValueHelpDialogVendor.open();
      }
    },
    handleSearchVendor: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilters = new Filter([
        new Filter("CardCode", FilterOperator.Contains, sValue),
        new Filter("CardName", FilterOperator.Contains, sValue)
      ], false);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter(oFilters);
    },
    handleValueCloseVendor: function (oEvent) {
      var aContexts = oEvent.getParameter("selectedContexts");
      var Vendor = {};
      if (aContexts && aContexts.length) {
        Vendor = aContexts.map(function (oContext) {
          var oVendor = {};
          oVendor.CardCode = oContext.getObject().CardCode;
          oVendor.CardName = oContext.getObject().CardName;
          return oVendor;
        });
      }
      oEvent.getSource().getBinding("items").filter([]);
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].Vendor = Vendor[0].CardCode;
      this.oModel.refresh();

    },
    handleValueHelpTaxCode: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogTaxCode) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestTaxCode",
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
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].TaxCode = TaxCode[0].Code;
      this.oModel.refresh();

    },
    handleValueHelpWhse: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogWhse) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestWhse",
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
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].Warehouse = Whse[0].WhsCode;
      this.oModel.refresh();

    },
    handleValueHelpSpecialist: function (oEvent) {
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      if (!this._oValueHelpDialogSpecialist) {
        Fragment.load({
          name: "com.apptech.DLSL.view.fragments.Purchasing.PurchaseRequestSpecialist",
          controller: this
        }).then(function (oValueHelpDialogSpecialist) {
          this._oValueHelpDialogSpecialist = oValueHelpDialogSpecialist;
          this.getView().addDependent(this._oValueHelpDialogSpecialist);
          this._oValueHelpDialogSpecialist.open();
        }.bind(this));
      } else {
        this._oValueHelpDialogSpecialist.open();
      }
    },
    handleSearchSpecialist: function (oEvent) {
      var sValue = oEvent.getParameter("value");
      var oFilters = new Filter([
        new Filter("ItmsTypCod", FilterOperator.Contains, sValue),
        new Filter("ItmsGrpNam", FilterOperator.Contains, sValue)
      ], false);
      var oBinding = oEvent.getSource().getBinding("items");
      oBinding.filter(oFilters);
    },
    handleValueCloseSpecialist: function (oEvent) {
      var aContexts = oEvent.getParameter("selectedContexts");
      var Specialist = {};
      if (aContexts && aContexts.length) {
        Specialist = aContexts.map(function (oContext) {
          var oSpecialist = {};
          oSpecialist.ItmsTypCod = oContext.getObject().ItmsTypCod;
          oSpecialist.ItmsGrpNam = oContext.getObject().ItmsGrpNam;
          return oSpecialist;
        });
      }
      oEvent.getSource().getBinding("items").filter([]);
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].SpecialistCode = Specialist[0].ItmsTypCod;
      this.oModel.refresh();
    },
    getNextNumber: function () {
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=GETNEXTDOCNUM&VALUE1=APP_OPRQ",
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
          // var generateDoc = APPui5.zeroPad(results[i].NextNumber, oSize);
          // var DocumemtNum = oSufix + generateDoc;
          this.oModel.getData().PurchaseRequest.No = results[i].NextNumber;
          oDocNum = results[i].NextNumber;
        }
        this.oModel.refresh();
      });
    },

    createTables: function () {
      //Add Fields Creation
      APPui5.createTable("APP_PositionsTBL", "Positions", "bott_NoObject");
      APPui5.createField("APP_Position", "Position", "OUSR", "db_Alpha", "", 100);
      APPui5.createField("APP_Position","Position","OPRQ","db_Alpha","",100);
      APPui5.createField("APP_RefNum","Reference Number","OPRQ","db_Alpha","",50);
      APPui5.createField("APP_SpecialistCode","Specialist Code","PRQ1","db_Alpha","",50);
      APPui5.createField("APP_Type","Type","OITB","db_Alpha","",100);
      APPui5.createField("APP_Type","Type","PRQ1","db_Alpha","",100);
         
         APPui5.createTable("APP_OPRQ","Purchase Request","bott_Document");
         APPui5.createField("APP_Requester","Requester","@APP_OPRQ","db_Alpha","",50);
         APPui5.createField("APP_Position","Position","@APP_OPRQ","db_Alpha","",50);
         APPui5.createField("APP_Department","Department","@APP_OPRQ","db_Alpha","",50);
         APPui5.createField("APP_RequestDate","Request Date","@APP_OPRQ","db_Date","");
         APPui5.createField("APP_RequiredDate","Required Date","@APP_OPRQ","db_Date","");
         APPui5.createField("APP_IsDraft","Is Draft","@APP_OPRQ","db_Alpha","",50);
         APPui5.createField("APP_Attachment","Attachment","@APP_OPRQ","db_Alpha","",50);
         APPui5.createField("APP_Recommendation","Recommendation","@APP_OPRQ","db_Alpha","",100);

        APPui5.createTable("APP_PRQ1","Purchase Request Details","bott_DocumentLines");
        APPui5.createField("APP_ItemCode","Item Code","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_Description","Description","@APP_PRQ1","db_Alpha","",100);
        APPui5.createField("APP_SpecialistCode","Specialist Code","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_Type","Type","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_GlAccount","Gl Account","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_FundType","Fund Type","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_Program","Program","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_Department","Department","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_Division","Division","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_Employee","Employee","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_Quantity","Quantity","@APP_PRQ1","db_Numeric","",10);
        APPui5.createField("APP_Uom","Uom","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_EstPrice","Est Unit Price","@APP_PRQ1","db_Float","st_Price",10);
        APPui5.createField("APP_EstAmt","Est Amount","@APP_PRQ1","db_Float","st_Price",10);
        APPui5.createField("APP_Budget","Budget/ Fund Available","@APP_PRQ1","db_Float","st_Price",10);
        APPui5.createField("APP_Vendor","Vendor","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_TaxCode","Tax Code","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_Whse","Warehouse","@APP_PRQ1","db_Alpha","",50);
        APPui5.createField("APP_Notes","Notes","@APP_PRQ1","db_Alpha","",100);
        APPui5.createField("APP_Depository","Depository","@APP_PRQ1","db_Alpha","",50);
    },
    
    onChangeUser: function (UserCode) {
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETUSERINFO&VALUE1=" + UserCode + "",
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
        this.oModel.getData().PurchaseRequest.DepartmentCode = results[0].Department;
        this.oModel.getData().PurchaseRequest.DepartmentName = results[0].Remarks;
        this.oModel.getData().PurchaseRequest.PositionCode = results[0].U_APP_Position;
        this.oModel.getData().PurchaseRequest.PositionName = results[0].Name;
        this.oModel.getData().PurchaseRequest.RequesterName=results[0].U_NAME;
        this.oModel.refresh();
      });
    },
    onChangeItem: function (ItemCode) {
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETITEMINFO&VALUE1=" + ItemCode + "",
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
       
        this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].SpecialistCode = results[0].SpecialistCode;
        this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].Vendor = results[0].CardCode;
        this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].TaxCode = results[0].VatGroupPu;
        this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].Type=results[0].ItmsGrpCod;
        this.oModel.refresh();
      });
    },
    OnComputeAmount:function(oEvent)
    {   
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
      var value1 = this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].EstUnitPrice;
			var value2 = this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].Quantity;
      var totalPrice = (value1 * value2);
      var decimalPrice = totalPrice;
      var withComma = decimalPrice;

      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].EstAmount= withComma;
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].EstUnitPrice = this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].EstUnitPrice;
    },
    onChangeDivision:function(Division){
      try{
      const resultDiv = divResult;
      const FundTypeDiv=this.oModel.getData().FundType.find(({ PrcCode })=> PrcCode.match(new RegExp(resultDiv.GrpCode,"g")));
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].FundType=FundTypeDiv.PrcCode;
      }catch (e){
        console.log(e)
        this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].FundType="";
      }
        this.oModel.refresh();
    },
    onChangeDepartment:function(Department){
      try{
      const resultDept = this.oModel.getData().Div.find(({ PrcCode }) => PrcCode === Division.PrcCode);
      const FundTypeDept=this.oModel.getData().FundType.find(({ PrcCode })=> PrcCode.match(new RegExp(resultDept.GrpCode,"g")));
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].FundType=FundTypeDept.PrcCode;
    }catch (e){
      console.log(e);
    }
      this.oModel.refresh();
    },
    onChangeProgram:function(Program){
      const result=this.oModel.getData().Program.find(({PrcCode})=>PrcCode===Program);
      const Division=this.oModel.getData().Div.find(({PrcCode})=>PrcCode===result.GrpCode);
      const Department=this.oModel.getData().Dept.find(({PrcCode})=>PrcCode.match(result.PrcCode.toString().substring(0,4),"g"));
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].Division=Division.PrcCode;
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].Department=Department.PrcCode;
      const FundTypeProgram=this.oModel.getData().FundType.find(({ PrcCode })=> PrcCode.match(new RegExp(Division.GrpCode,"g")));
      this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].FundType=FundTypeProgram.PrcCode;
      this.oModel.refresh();
    },
    getGLAccount:function(ItemCode,Year){
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPGET_GLACCOUNT&VALUE1=" + ItemCode + "&VALUE2="+ Year +"",
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
        
        this.oModel.getData().PurchaseRequest.Items[this.iSelectedRow].GlAccount=results[0].APCMAct;
        this.oModel.refresh();
      });
    },
    onClearData: function () {
      for(let i = 0;i < this.oModel.getData().PurchaseRequest.Items.length; i++){
        this.oModel.getData().PurchaseRequest.Items.splice(i, 1);
      }
      
      this.oModel.getData().PurchaseRequest.No = "";
      this.oModel.getData().PurchaseRequest.RequesterCode = "";
      this.oModel.getData().PurchaseRequest.RequesterName = "";
      this.oModel.getData().PurchaseRequest.PositionCode = "";
      this.oModel.getData().PurchaseRequest.PositionName = "";
      this.oModel.getData().PurchaseRequest.DepartmentCode = "";
      this.oModel.getData().PurchaseRequest.DepartmentCode1 = "";
      this.oModel.getData().PurchaseRequest.DepartmentName = "";
      this.oModel.getData().PurchaseRequest.RequestDate = "";
      this.oModel.getData().PurchaseRequest.RequiredDate = "";
      this.oModel.getData().PurchaseRequest.StatusCode = "";
      this.oModel.getData().PurchaseRequest.StatusName = "";
      this.oModel.getData().PurchaseRequest.Remarks = "";
      this.oModel.getData().PurchaseRequest.DepartmentCode1 = "";
      this.oModel.getData().PurchaseRequest.Division = "";
      this.oModel.getData().PurchaseRequest.Items = [];
      this.getView().byId("fileUploader").setValue("");
     
      this.oModel.refresh();
    },
    onFunction:function(){
      if(this.oModel.getData().PurchaseRequest.Division === ""){
        APPui5.APPMESSAGEBOX("Please Select Department or Depository"); 
        return;
      }

      var dif = 0;
      var dep = 0;
      var gl = 0;
      
      var oPurch =this.oModel.getData().PurchaseRequest.Items;

      var isZero = false;
      var isNoAmount = false;
     

      var lineNum = 1;
      var msgerror = "";

      for(let a = 0;a < oPurch.length; a++){
        if(oPurch[a].EstUnitPrice < 1 || oPurch[a].EstUnitPrice === "" || oPurch[a].EstUnitPrice === null ){
          isNoAmount = true;
          msgerror = msgerror + "Please Enter amount that is Greater than 0 in line item " + lineNum + "\n";
        }
        lineNum +=1;
      }

      if(isNoAmount === true){
        APPui5.APPMESSAGEBOX(msgerror);
        return;
     }


      for(let q = 0;q < oPurch.length; q++){
        if(oPurch[q].Quantity < 1 || oPurch[q].Quantity === "" || oPurch[q].Quantity === null ){
          isZero = true;
        }
      }

      if(isZero === true){
         APPui5.APPMESSAGEBOX("Please Enter Quantity Greater than 0.");
         return;
      }

      var SPLCode = oPurch[0].SpecialistCode;
      for(let i=0;i<this.oModel.getData().PurchaseRequest.Items.length;i++){
        if(oPurch[i].SpecialistCode !== SPLCode){
          dif +=1;
        }
      }
      var DEPCode = oPurch[0].Department;
      for(let i=0;i<this.oModel.getData().PurchaseRequest.Items.length;i++){
        if(oPurch[i].Department !== DEPCode){
          dep +=1;
        }
      }

      var GLCode = oPurch[0].GlAccount;
      for(let g=0;g < this.oModel.getData().PurchaseRequest.Items.length;g++){
        if(oPurch[g].GlAccount !== GLCode){
          gl +=1;
        }
      }


    if(gl !== 0){
      APPui5.APPMESSAGEBOX("Mulitple GL Account not allowed");  
      return;  
    }

    if(dif !== 0){
      APPui5.APPMESSAGEBOX("Mulitple Specialist not allowed");
      return;  
    }else if(dep !== 0){
      APPui5.APPMESSAGEBOX("Mulitple Department not allowed");
      return;
    }else{
      var that = this;
      if(localStorage.getItem("AttcEntry") == ""){
        MessageBox.information("Are you sure you want to submit without attachment??", {
        actions: [MessageBox.Action.YES, MessageBox.Action.NO],
        title: "",
        icon: MessageBox.Icon.QUESTION,
        styleClass:"sapUiSizeCompact",
        onClose: function (sButton) {
            if(sButton === "YES"){
              if (that.oModel.getData().Controls.AddOrEdit === "Add Purchase Request") {
                  that.onAdd();
              }
              else {
                 that.onUpdate();
              }
            }
          }
        });
      }else{
        if (that.oModel.getData().Controls.AddOrEdit === "Add Purchase Request") {
          that.onAdd();
        }else{
          that.onUpdate();
        }
      }
    }
    },
    onDraftFunction:function(){
      if (this.oModel.getData().Controls.AddOrEdit==="Add Purchase Request"){
        this.onAddDraft();
      }
      else
      {
        this.onUpdateDraft();
      }
    },
    onAdd:function(){
      if (this.oModel.getData().PurchaseRequest.RequesterCode==="" || this.oModel.getData().PurchaseRequest.DepartmentCode==="" || this.oModel.getData().PurchaseRequest.RequestDate==="" || this.oModel.getData().PurchaseRequest.RequiredDate===""){
        APPui5.APPMESSAGEBOX("Must fill up all required fields!");
        return
      }
     
      var PurchaseRequestBody={}; 
      PurchaseRequestBody.U_APP_RequestDate= this.getView().byId("reqDate").getValue();
      PurchaseRequestBody.U_APP_RequiredDate= this.getView().byId("RequiredDateID").getValue();
      PurchaseRequestBody.U_APP_Requester=this.oModel.getData().PurchaseRequest.RequesterCode;
      PurchaseRequestBody.U_APP_Department=this.oModel.getData().PurchaseRequest.DepartmentCode;
      PurchaseRequestBody.U_APP_Position=this.getView().byId("position").getValue();
      PurchaseRequestBody.Remark=this.oModel.getData().PurchaseRequest.Remarks;
      PurchaseRequestBody.U_APP_IsDraft="No";
      if(localStorage.getItem("AttcEntry") !== ""){
        PurchaseRequestBody.U_APP_Attachment = localStorage.getItem("AttcEntry");
      }else{
        PurchaseRequestBody.U_APP_Attachment = "";
      }
      PurchaseRequestBody.APP_PRQ1Collection=[];
      var totalAmount = 0;

      for(var i=0;i<this.oModel.getData().PurchaseRequest.Items.length;i++){
        var Amount = this.oModel.getData().PurchaseRequest.Items[i].EstAmount;
        totalAmount =  (totalAmount + Amount);
        

        if(this.oModel.getData().PurchaseRequest.Items[0].DepartmentName !== ""){
					oDept = this.oModel.getData().PurchaseRequest.Items[0].DepartmentName;
				}else{
					oDept = this.oModel.getData().PurchaseRequest.Items[0].DivisionName;
				}

        PurchaseRequestBody.APP_PRQ1Collection.push({
          "U_APP_ItemCode":this.oModel.getData().PurchaseRequest.Items[i].ItemCode,
          "U_APP_Description":this.oModel.getData().PurchaseRequest.Items[i].Description,
          "U_APP_GlAccount":this.oModel.getData().PurchaseRequest.Items[i].GlAccount,
          "U_APP_EstPrice": this.oModel.getData().PurchaseRequest.Items[i].EstUnitPrice,
          "U_APP_Quantity":this.oModel.getData().PurchaseRequest.Items[i].Quantity,   
          "U_APP_Uom":this.oModel.getData().PurchaseRequest.Items[i].UOM,
          "U_APP_Type":this.oModel.getData().PurchaseRequest.Items[i].Type,    
          "U_APP_SpecialistCode":this.oModel.getData().PurchaseRequest.Items[i].SpecialistCode,   
          "U_APP_EstAmt": this.oModel.getData().PurchaseRequest.Items[i].EstAmount,
          "U_APP_Whse":this.oModel.getData().PurchaseRequest.Items[i].Warehouse,
          "U_APP_TaxCode":this.oModel.getData().PurchaseRequest.Items[i].TaxCode,    
          "U_APP_Vendor":this.oModel.getData().PurchaseRequest.Items[i].Vendor,
          "U_APP_FundType":this.oModel.getData().PurchaseRequest.Items[i].FundType,
          "U_APP_Division":this.oModel.getData().PurchaseRequest.Items[i].Division,
          "U_APP_Employee":this.oModel.getData().PurchaseRequest.Items[i].Employee,
          "U_APP_Department":this.oModel.getData().PurchaseRequest.Items[i].Department,
          "U_APP_Program":this.oModel.getData().PurchaseRequest.Items[i].Program,
          "U_APP_Notes":this.oModel.getData().PurchaseRequest.Items[i].Notes,
          "U_APP_Depository":this.oModel.getData().PurchaseRequest.Items[i].Division
        });

        
      }
      this.getNextNumber();
      // this.onAttachmentDoc(this.oModel.getData().PurchaseRequest.No);
        $.ajax({
          url: "https://13.215.36.201:50000/b1s/v1/APP_OPRQ",
          data: JSON.stringify(PurchaseRequestBody),
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
          context:this,
          success:async function (json) {       
            if(localStorage.getItem("AttcEntry") !== ""){
              this.onUpdateAttachnent();
             }
            await this.ApprovalRoute('Purchase Request',jQuery.sap.storage.Storage.get("userCode"),this.oModel.getData().PurchaseRequest.No,this.oModel.getData().PurchaseRequest.RequestDate,this.oModel.getData().PurchaseRequest.RequiredDate,this.oModel.getData().PurchaseRequest.Remarks,totalAmount,this.oModel.getData().PurchaseRequest.DepartmentName1,this.oModel.getData().PurchaseRequest.DevisionCode);
            this.getView().byId("AddrowID").setEnabled(false);
            this.getView().byId("DelRowID").setEnabled(false);   
          }
        }).done(function (results) {
          if (results) {
              this.onClearData();
              this.oModel.getData().PurchaseRequest.DepartmentCode = "";
              this.oModel.getData().PurchaseRequest.Division = "";
              this.OnLoadRecords();
          }
       });
      
    },
    onUpdate:function(){

      if (this.oModel.getData().PurchaseRequest.RequesterCode==="" || this.oModel.getData().PurchaseRequest.DepartmentCode==="" || this.oModel.getData().PurchaseRequest.RequestDate==="" || this.oModel.getData().PurchaseRequest.RequiredDate===""){
        APPui5.APPMESSAGEBOX("Must fill up all required fields!");
        return
      }

      var PurchaseRequestBody={}; 
      PurchaseRequestBody.U_APP_RequestDate= this.getView().byId("reqDate").getValue();
      PurchaseRequestBody.U_APP_RequiredDate= this.getView().byId("RequiredDateID").getValue();
      PurchaseRequestBody.U_APP_Requester=this.oModel.getData().PurchaseRequest.RequesterCode;
      PurchaseRequestBody.U_APP_Department=this.oModel.getData().PurchaseRequest.DepartmentCode;
      PurchaseRequestBody.U_APP_Position=this.getView().byId("position").getValue();
      PurchaseRequestBody.Remark=this.oModel.getData().PurchaseRequest.Remarks;  
      PurchaseRequestBody.U_APP_IsDraft="No";
      if(localStorage.getItem("AttcEntry") !== ""){
        PurchaseRequestBody.U_APP_Attachment = localStorage.getItem("AttcEntry");
      }
      PurchaseRequestBody.APP_PRQ1Collection=[];
      var totalAmount = 0;
      for(var i=0;i<this.oModel.getData().PurchaseRequest.Items.length;i++){
        var amount = this.oModel.getData().PurchaseRequest.Items[i].EstUnitPrice;
        totalAmount = (totalAmount + amount);
        if(this.oModel.getData().PurchaseRequest.Items[0].DepartmentName !== ""){
					oDept = this.oModel.getData().PurchaseRequest.Items[0].DepartmentName;
				}else{
					oDept = this.oModel.getData().PurchaseRequest.Items[0].DivisionName;
				} 
        PurchaseRequestBody.APP_PRQ1Collection.push({
          "U_APP_ItemCode":this.oModel.getData().PurchaseRequest.Items[i].ItemCode,
          "U_APP_Description":this.oModel.getData().PurchaseRequest.Items[i].Description,
          "U_APP_GlAccount":this.oModel.getData().PurchaseRequest.Items[i].GlAccount,
          "U_APP_EstPrice":this.oModel.getData().PurchaseRequest.Items[i].EstUnitPrice,
          "U_APP_Quantity":this.oModel.getData().PurchaseRequest.Items[i].Quantity,   
          "U_APP_Uom":this.oModel.getData().PurchaseRequest.Items[i].UOM,
          "U_APP_Type":this.oModel.getData().PurchaseRequest.Items[i].Type,    
          "U_APP_SpecialistCode":this.oModel.getData().PurchaseRequest.Items[i].SpecialistCode,   
          "U_APP_EstAmt": this.oModel.getData().PurchaseRequest.Items[i].EstAmount,
          "U_APP_Whse":this.oModel.getData().PurchaseRequest.Items[i].Warehouse,
          "U_APP_TaxCode":this.oModel.getData().PurchaseRequest.Items[i].TaxCode,    
          "U_APP_Vendor":this.oModel.getData().PurchaseRequest.Items[i].Vendor,
          "U_APP_FundType":this.oModel.getData().PurchaseRequest.Items[i].FundType,
          "U_APP_Division":this.oModel.getData().PurchaseRequest.Items[i].Division,
          "U_APP_Employee":this.oModel.getData().PurchaseRequest.Items[i].Employee,
          "U_APP_Department":this.oModel.getData().PurchaseRequest.Items[i].Department,
          "U_APP_Program":this.oModel.getData().PurchaseRequest.Items[i].Program,
          "U_APP_Notes":this.oModel.getData().PurchaseRequest.Items[i].Notes,
          "U_APP_Depository":this.oModel.getData().PurchaseRequest.Items[i].Division
        });
      }
        
          $.ajax({
            url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDOCENTRY&VALUE1="+ this.oModel.getData().PurchaseRequest.No +"&VALUE=APP_OPRQ",
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
              url: "https://13.215.36.201:50000/b1s/v1/APP_OPRQ("+ results[0].DocEntry +")",
              data: JSON.stringify(PurchaseRequestBody),
              headers:{"B1S-ReplaceCollectionsOnPatch":true},
              type: "PATCH",
              crossDomain: true,
              xhrFields: {
                  withCredentials: true
              },
              error: function (xhr, status, error) {
                  var Message = xhr.responseJSON["error"].message.value;
                  APPui5.APPMESSAGEBOX(Message);
                  return
              },
              context:this,
              success:async function (json) {
                // if(localStorage.getItem("AttcEntry") !== ""){
                //   this.onUpdateAttachnent();
                // }
              await this.ApprovalRoute('Purchase Request',jQuery.sap.storage.Storage.get("userCode"),this.oModel.getData().PurchaseRequest.No,this.oModel.getData().PurchaseRequest.RequestDate,this.oModel.getData().PurchaseRequest.RequiredDate,this.oModel.getData().PurchaseRequest.Remarks,totalAmount,this.oModel.getData().PurchaseRequest.DepartmentName1,this.oModel.getData().PurchaseRequest.DevisionCode);      
               APPui5.APPMESSAGEBOX("Transaction Succesfully Updated!");
               
               this.getView().byId("AddrowID").setEnabled(false);
               this.getView().byId("DelRowID").setEnabled(false);  
              }
            }).done( function (results) {    
              this.oModel.getData().PurchaseRequest.DepartmentCode = "";
              this.oModel.getData().PurchaseRequest.Division = "";
              this.onClearData();
            });
        });

    },
    onAddDraft:function(){
      if (this.oModel.getData().PurchaseRequest.RequesterCode==="" || this.oModel.getData().PurchaseRequest.DepartmentCode==="" || this.oModel.getData().PurchaseRequest.RequestDate==="" || this.oModel.getData().PurchaseRequest.RequiredDate===""){
        APPui5.APPMESSAGEBOX("Must fill up all required fields!");
        return
      }
    
      var PurchaseRequestBody={}; 
      PurchaseRequestBody.U_APP_RequestDate=this.oModel.getData().PurchaseRequest.RequestDate;
      PurchaseRequestBody.U_APP_RequiredDate=this.oModel.getData().PurchaseRequest.RequiredDate;
      PurchaseRequestBody.U_APP_Requester=this.oModel.getData().PurchaseRequest.RequesterCode;
      PurchaseRequestBody.U_APP_Department=this.oModel.getData().PurchaseRequest.DepartmentCode;
      PurchaseRequestBody.U_APP_Position=this.oModel.getData().PurchaseRequest.PositionCode;
      PurchaseRequestBody.U_APP_IsDraft="Yes";
      PurchaseRequestBody.Remark=this.oModel.getData().PurchaseRequest.Remarks;
      if(localStorage.getItem("AttcEntry") !== ""){
        PurchaseRequestBody.U_APP_Attachment = localStorage.getItem("AttcEntry");
      }
      PurchaseRequestBody.APP_PRQ1Collection=[];
      var i;
      for(i=0;i<this.oModel.getData().PurchaseRequest.Items.length;i++){
      
        PurchaseRequestBody.APP_PRQ1Collection.push({
          "U_APP_ItemCode":this.oModel.getData().PurchaseRequest.Items[i].ItemCode,
          "U_APP_Description":this.oModel.getData().PurchaseRequest.Items[i].Description,
          "U_APP_GlAccount":this.oModel.getData().PurchaseRequest.Items[i].GlAccount,
          "U_APP_EstPrice":this.oModel.getData().PurchaseRequest.Items[i].EstUnitPrice,
          "U_APP_Quantity":this.oModel.getData().PurchaseRequest.Items[i].Quantity,   
          "U_APP_Uom":this.oModel.getData().PurchaseRequest.Items[i].UOM,
          "U_APP_Type":this.oModel.getData().PurchaseRequest.Items[i].Type,    
          "U_APP_SpecialistCode":this.oModel.getData().PurchaseRequest.Items[i].SpecialistCode,   
          "U_APP_EstAmt": this.oModel.getData().PurchaseRequest.Items[i].EstAmount,
          "U_APP_Whse":this.oModel.getData().PurchaseRequest.Items[i].Warehouse,
          "U_APP_TaxCode":this.oModel.getData().PurchaseRequest.Items[i].TaxCode,    
          "U_APP_Vendor":this.oModel.getData().PurchaseRequest.Items[i].Vendor,
          "U_APP_FundType":this.oModel.getData().PurchaseRequest.Items[i].FundType,
          "U_APP_Division":this.oModel.getData().PurchaseRequest.Items[i].Division,
          "U_APP_Employee":this.oModel.getData().PurchaseRequest.Items[i].Employee,
          "U_APP_Department":this.oModel.getData().PurchaseRequest.Items[i].Department,
          "U_APP_Program":this.oModel.getData().PurchaseRequest.Items[i].Program,
          "U_APP_Notes":this.oModel.getData().PurchaseRequest.Items[i].Notes,
          "U_APP_Depository":this.oModel.getData().PurchaseRequest.Items[i].Division
        });
      }
      this.getNextNumber();
      this.onAttachmentDoc(this.oModel.getData().PurchaseRequest.No);
        $.ajax({
          url: "https://13.215.36.201:50000/b1s/v1/APP_OPRQ",
          data: JSON.stringify(PurchaseRequestBody),
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
          context:this,
          success:async function (json) {       
             APPui5.APPMESSAGEBOX("Transaction saved as Draft!\nTransaction No:" + oDocNum);
             if(localStorage.getItem("AttcEntry") !== ""){
              this.onUpdateAttachnent();
             }
             this.getView().byId("AddrowID").setEnabled(false);
             this.getView().byId("DelRowID").setEnabled(false);  
          }
        }).done(function (results) {
          if (results) {
            this.oModel.getData().PurchaseRequest.DepartmentCode = "";
            this.oModel.getData().PurchaseRequest.Division = "";
              this.onClearData();
              this.OnLoadRecords();
          }
       });
      
    },
    onUpdateDraft:function(){

      if (this.oModel.getData().PurchaseRequest.RequesterCode==="" || this.oModel.getData().PurchaseRequest.DepartmentCode==="" || this.oModel.getData().PurchaseRequest.RequestDate==="" || this.oModel.getData().PurchaseRequest.RequiredDate===""){
        APPui5.APPMESSAGEBOX("Must fill up all required fields!");
        return
      }

      var PurchaseRequestBody={}; 
      PurchaseRequestBody.U_APP_RequestDate=this.oModel.getData().PurchaseRequest.RequestDate;
      PurchaseRequestBody.U_APP_RequiredDate=this.oModel.getData().PurchaseRequest.RequiredDate;
      PurchaseRequestBody.U_APP_Requester=this.oModel.getData().PurchaseRequest.RequesterCode;
      PurchaseRequestBody.U_APP_Department=this.oModel.getData().PurchaseRequest.DepartmentCode;
      PurchaseRequestBody.U_APP_Position=this.oModel.getData().PurchaseRequest.PositionCode;
      PurchaseRequestBody.U_APP_IsDraft="Yes";
      PurchaseRequestBody.Remark=this.oModel.getData().PurchaseRequest.Remarks; 
      if(localStorage.getItem("AttcEntry") !== ""){
        PurchaseRequestBody.U_APP_Attachment = ocalStorage.getItem("AttcEntry");
      }
      PurchaseRequestBody.APP_PRQ1Collection=[];
      var i;
      for(i=0;i<this.oModel.getData().PurchaseRequest.Items.length;i++){

        PurchaseRequestBody.APP_PRQ1Collection.push({
          "U_APP_ItemCode":this.oModel.getData().PurchaseRequest.Items[i].ItemCode,
          "U_APP_Description":this.oModel.getData().PurchaseRequest.Items[i].Description,
          "U_APP_GlAccount":this.oModel.getData().PurchaseRequest.Items[i].GlAccount,
          "U_APP_EstPrice":this.oModel.getData().PurchaseRequest.Items[i].EstUnitPrice,
          "U_APP_Quantity":this.oModel.getData().PurchaseRequest.Items[i].Quantity,   
          "U_APP_Uom":this.oModel.getData().PurchaseRequest.Items[i].UOM,
          "U_APP_Type":this.oModel.getData().PurchaseRequest.Items[i].Type,    
          "U_APP_SpecialistCode":this.oModel.getData().PurchaseRequest.Items[i].SpecialistCode,   
          "U_APP_EstAmt": this.oModel.getData().PurchaseRequest.Items[i].EstAmount,
          "U_APP_Whse":this.oModel.getData().PurchaseRequest.Items[i].Warehouse,
          "U_APP_TaxCode":this.oModel.getData().PurchaseRequest.Items[i].TaxCode,    
          "U_APP_Vendor":this.oModel.getData().PurchaseRequest.Items[i].Vendor,
          "U_APP_FundType":this.oModel.getData().PurchaseRequest.Items[i].FundType,
          "U_APP_Division":this.oModel.getData().PurchaseRequest.Items[i].Division,
          "U_APP_Employee":this.oModel.getData().PurchaseRequest.Items[i].Employee,
          "U_APP_Department":this.oModel.getData().PurchaseRequest.Items[i].Department,
          "U_APP_Program":this.oModel.getData().PurchaseRequest.Items[i].Program,
          "U_APP_Notes":this.oModel.getData().PurchaseRequest.Items[i].Notes,  
          "U_APP_Depository":this.oModel.getData().PurchaseRequest.Items[i].Division
        });
      }
          $.ajax({
            url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDOCENTRY&VALUE1="+ this.oModel.getData().PurchaseRequest.No +"&VALUE=APP_OPRQ",
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
              url: "https://13.215.36.201:50000/b1s/v1/APP_OPRQ("+ results[0].DocEntry +")",
              data: JSON.stringify(PurchaseRequestBody),
              headers:{"B1S-ReplaceCollectionsOnPatch":true},
              type: "PATCH",
              crossDomain: true,
              xhrFields: {
                  withCredentials: true
              },
              error: function (xhr, status, error) {
                  var Message = xhr.responseJSON["error"].message.value;
                  APPui5.APPMESSAGEBOX(Message);
                  return
              },
              context:this,
              success:async function (json) {
                APPui5.APPMESSAGEBOX("Transaction save as Draft!\nTransaction No:" + oDocNum);
                if(localStorage.getItem("AttcEntry") !== ""){
                  this.onUpdateAttachnent();
                }
               
                this.getView().byId("AddrowID").setEnabled(false);
                this.getView().byId("DelRowID").setEnabled(false);
              }
            }).done( function (results) {    
              this.oModel.getData().PurchaseRequest.DepartmentCode = "";
              this.oModel.getData().PurchaseRequest.Division = "";
                  this.onClearData();
                  this.OnLoadRecords();
            });
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
            // var Message = xhr.responseJSON["error"].message.value;
            // APPui5.APPMESSAGEBOX(Message);
            console.log("Message")
          },
          success: function (json) {
            console.log(json)
          },
          context: this
        }).done(function (results) {
          this.getView().byId("fileUploader").setValue(results[0].FileName);
        });
    
    },
    onCancel:function(){
      $.ajax({
        url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDOCENTRY&VALUE1="+ this.oModel.getData().PurchaseRequest.No +"&VALUE=APP_OPRQ",
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
          url: "https://13.215.36.201:50000/b1s/v1/APP_OPRQ("+ results[0].DocEntry +")/Cancel",
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
            APPui5.APPMESSAGEBOX("Transaction Succesfully Canceled!")
          }
        }).done(function (results) {     
              this.onClearData();
              this.OnLoadRecords();
        });

    });
    },
    OnSearch:function(oEvent){
      var sQuery = oEvent.getParameter("query");
      this.Filter = null;

      if (sQuery) {
        this.Filter = new Filter([
          new Filter("No", FilterOperator.EQ, sQuery),
          new Filter("Requester", FilterOperator.EQ, sQuery),
          new Filter("Position",FilterOperator.EQ,sQuery),
          new Filter("Department",FilterOperator.EQ,sQuery),
          new Filter("RequestDate",FilterOperator.EQ,sQuery),
          new Filter("RequiredDate",FilterOperator.EQ,sQuery),
          new Filter("Status",FilterOperator.EQ,sQuery)
        ], false);
      }

      this._Filter();
    },
    _Filter : function() {
      var oFilter = null;

      if (this.Filter) {
        oFilter = this.Filter;
      }

      this.byId("PRTable").getBinding("rows").filter(oFilter, "Application");
    },
    ApprovalRoute:function(DocType,UserCode,DocNum,DocDate,DueDate,Remarks,totalAmount,oDepart,oDepos){
      var strURL = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_APPROVALROUTE&VALUE1=" + DocType + "&VALUE2="+ UserCode +"&VALUE3="+ DocNum +"&VALUE4=1";
      $.ajax({
        url:strURL,
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
      }).done( function (results) {
        if (results.length!=0){
          for(var i=0;i<results.length;i++){
            var ApprovalPostingBody={};
            ApprovalPostingBody.U_APP_Status="Pending";
            ApprovalPostingBody.U_APP_Status2="Pending";
            ApprovalPostingBody.U_APP_Stage=results[i].U_APP_Stages;
            ApprovalPostingBody.U_APP_Level=results[i].U_APP_Level;
            ApprovalPostingBody.U_APP_Template=results[i].Name;
            ApprovalPostingBody.U_APP_Authorizer=results[i].U_APP_Authorizer;
            ApprovalPostingBody.U_APP_DocType=DocType;
            ApprovalPostingBody.U_APP_DocNum=DocNum;
            ApprovalPostingBody.U_APP_Originator=UserCode;
            ApprovalPostingBody.U_APP_Remarks=Remarks;
            ApprovalPostingBody.U_APP_Department=oDepart;
            ApprovalPostingBody.U_APP_Depository=oDepos;
            ApprovalPostingBody.U_APP_DocDate=DocDate;
            ApprovalPostingBody.U_APP_DueDate=DueDate;
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
              context:this,
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
                  "Amount": replacedP,
                  "Payee": localStorage.getItem("RequestorName"),
                  "Subject": "[PROCUREMENT REQUEST]",
                  "Date": APPui5.getDatePostingFormat(ApprovalPostingBody.U_APP_DocDate),
                  "Remarks": ApprovalPostingBody.U_APP_Remarks,
                  "Notes": "",
                  "Approver": localStorage.getItem("ApproverName"),
                  "Originator": localStorage.getItem("RequestorName")
                });
                that.onSendEmail(oEmail);
                console.log(oEmail)
              }
            }).done(function (results) {
              APPui5.APPMESSAGEBOX("Transaction Succesfully submitted for approval!\nTransaction No:" + oDocNum)
            });
          }
        }
        else
        {
          APPui5.APPMESSAGEBOX("No approval route found for this transaction."); 
          return;
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
          localStorage.setItem("ApproverEmail",results[0].E_Mail);
          localStorage.setItem("ApproverName",results[0].U_NAME);             
      });
    },      

    PostToSAP:function(DocNum){
      var PurchaseRequest={};
      PurchaseRequest.U_APP_PRNo=this.oModel.getData().PurchaseRequest.No;
      PurchaseRequest.Requester=this.oModel.getData().PurchaseRequest.RequesterCode;
      PurchaseRequest.U_APP_Position=this.getView().byId("position").getValue();
      PurchaseRequest.RequesterDepartment=this.oModel.getData().PurchaseRequest.DepartmentCode;
      PurchaseRequest.DocDate=this.oModel.getData().PurchaseRequest.RequestDate;
      PurchaseRequest.RequriedDate=this.oModel.getData().PurchaseRequest.RequiredDate;
      PurchaseRequest.Comments=this.oModel.getData().PurchaseRequest.Remarks;
      if(localStorage.getItem("AttcEntry") !== ""){
        PurchaseRequest.AttachmentEntry = localStorage.getItem("AttcEntry");
      }
      PurchaseRequest.DocType="dDocument_Items";
      PurchaseRequest.DocumentLines=[];

      for(var i=0;i<this.oModel.getData().PurchaseRequest.Items.length;i++){
        PurchaseRequest.DocumentLines.push({
          "ItemCode":this.oModel.getData().PurchaseRequest.Items[i].ItemCode,
          "ItemDescription":this.oModel.getData().PurchaseRequest.Items[i].Description,
          "U_APP_SpecialistCode":this.oModel.getData().PurchaseRequest.Items[i].SpecialistCode,
          "U_APP_Type":this.oModel.getData().PurchaseRequest.Items[i].Type,
          "AccountCode":this.oModel.getData().PurchaseRequest.Items[i].GlAccount,
          "CostingCode":this.oModel.getData().PurchaseRequest.Items[i].FundType,
          "CostingCode2":this.oModel.getData().PurchaseRequest.Items[i].Division,
          "CostingCode3":this.oModel.getData().PurchaseRequest.Items[i].Program,
          "CostingCode4":this.oModel.getData().PurchaseRequest.Items[i].Department,
          "CostingCode5":this.oModel.getData().PurchaseRequest.Items[i].Employee,
          "Quantity":this.oModel.getData().PurchaseRequest.Items[i].Quantity,
          // "UoMCode":this.oModel.getData().PurchaseRequest.Items[i].UOM,
          "UoMEntry":this.oModel.getData().PurchaseRequest.Items[i].UOMEntry,
          "UnitPrice": this.oModel.getData().PurchaseRequest.Items[i].EstUnitPrice,
          "LineTotal":this.oModel.getData().PurchaseRequest.Items[i].EstAmount,
          "LineVendor":this.oModel.getData().PurchaseRequest.Items[i].Vendor,
          "VatGroup":this.oModel.getData().PurchaseRequest.Items[i].TaxCode,
          "WarehouseCode":this.oModel.getData().PurchaseRequest.Items[i].Warehouse,
          "FreeText":this.oModel.getData().PurchaseRequest.Items[i].Notes,
          "U_APP_Depository":this.oModel.getData().PurchaseRequest.Items[i].Department
        });
      }
    
      $.ajax({
        url: "https://13.215.36.201:50000/b1s/v1/PurchaseRequests",
        data: JSON.stringify(PurchaseRequest),
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
          $.ajax({
            url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETDOCENTRY&VALUE1="+ DocNum +"&VALUE=APP_OPRQ",
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
            var oUrl = "https://13.215.36.201:50000/b1s/v1/APP_OPRQ("+ results[0].DocEntry +")/Close"
            $.ajax({
              url: oUrl,
              type: "POST",
              crossDomain: true,
              xhrFields: {
                  withCredentials: true
              },
              error: function (xhr, status, error) {
                  console.log(error);
                  var Message = xhr.responseJSON["error"].message.value;
                  APPui5.APPMESSAGEBOX(Message);
                  return;
              },
              context:this,
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
    onInquiry:function(){
      var DocNum=this.oModel.getData().PurchaseRequest.No;
      var ApprovalInquiryRecord={
        "DocNum":DocNum
      };
      var oModelDocNum=new JSONModel(ApprovalInquiryRecord);
      this.getOwnerComponent().setModel(oModelDocNum,"oModelDocNum");
      var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("PurchaseRequestInquiry");

    },
    ///reports  
    onPreview: function(){  
    
      if (!this.oReportViewer) {
        this.oReportViewer = sap.ui.xmlfragment("com.apptech.DLSL.view.fragments.ReportViewer",this);
        this.getView().addDependent(this.oReportViewer);
      }
      
      this.oReportViewer.open();
    
      var docentry = this.oModel.getData().PurchaseRequest.DocEntry;
      // var objectId = "1470000113";
      var report = 'PRF';
    
      var sRedirectUrl = `http://digitalhub.dlsl.edu.ph/DLSL-TRX_Forms/TRXForms-viewer.jsp?report=${report}&docentry=${docentry}`;
      $('#ReportViewerIframe').attr("src",sRedirectUrl);
      
    },
  
    onCloseReport: function(){
      this.oReportViewer.close();
      this.oReportViewer.destroy();
      this.oReportViewer=null;
    },


    onViewAttachment: function(oEvent){
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();
          window.open("https://13.215.36.201:50000/b1s/v1/Attachments2(" + localStorage.getItem("AttcEntry") + ")/$value?filename='" + this.oModel.getData().Attachments[this.iSelectedRow].FileName + "." + this.oModel.getData().Attachments[this.iSelectedRow].FileExtension +  "'");
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
            console.log(Message)
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
							APPui5.APPMESSAGEBOX(Message);
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
  
      handleAttachment1: function (oEvent) {
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
              var ErrorMassage = error;
              APPui5.APPMESSAGEBOX(ErrorMassage);
              return;
            },
            context: this,
            success: function (json) { }
          }).done(function (results) {
            var OTCH = [];
            if (results) {
              var oResult = JSON.parse(results);
              this.FileKey = oResult.AbsoluteEntry;
              this.oModel.getData().PurchaseRequest.AttachmentEntry=this.FileKey;
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
              var ErrorMassage = error;
              APPui5.APPMESSAGEBOX(ErrorMassage);
              return;
            },
            context: this,
            success: function (json) {}
          }).done(function (results) {
            var OTCH = [];
            if (results) {
              var oResult = JSON.parse(results);
              this.FileKey = oResult.AbsoluteEntry;
              this.oModel.getData().PurchaseRequest.AttachmentEntry=this.FileKey;
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
      onAttchFile: function(oEvent){
          var that = this;
          oFileExist = 0;
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

      SendEmailNotif: function(Sender,Receiver,Documemt,Type){
        try{
          $.ajax({
            url: "",
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
            this.oModel.getData().Attachments = results.value;
            this.oModel.refresh();
          });
        }catch (e){
          console.log(e)
        }
      },
  });
});

