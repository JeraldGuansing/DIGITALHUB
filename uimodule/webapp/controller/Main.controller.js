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
  "com/apptech/DLSL/controller/APPui5"
], function(jQuery, Device, Fragment, Controller, JSONModel, Popover, Button, mobileLibrary, MessageToast,APPui5) {
"use strict";
	return Controller.extend("com.apptech.DLSL.controller.Main", {
        onInit: function () {
			this.sDataBase = jQuery.sap.storage.Storage.get("dataBase");
        	this.sUserCode = jQuery.sap.storage.Storage.get("userCode");
			this.sDataBaseName = jQuery.sap.storage.Storage.get("dataBaseName");
            var route = this.getOwnerComponent().getRouter().getRoute("Dashboard");
            route.attachPatternMatched(this.onRoutePatternMatched,this);
            
            this.oMdlMenu = new JSONModel("model/menu.json");
            this.getView().setModel(this.oMdlMenu);

			this.getView().byId("userName").setText(this.sUserCode);
            this.router = this.getOwnerComponent().getRouter();
          
            // this.onCreateUDF();
			this.getView().byId("ShellID").setTitle(this.sDataBaseName);
            this.onSetMenu();
            // this.zoom();
			
        },
        //-------------------------------------------
		

		onAfterShow: function (router) {
			router.navTo("Dasbhoard");
     		 this.closeLoadingFragment();
		},

		zoom: function() {
			document.body.style.zoom = "80%";
		},

 
		onSelect: function (event) {
			this.router = this.getOwnerComponent().getRouter();
			this.router.navTo(event.getParameter("key"));
		},

		//-------------------------------------------

		onMenuButtonPress: function () {
			var toolPage = this.byId("toolPage");
			toolPage.setSideExpanded(!toolPage.getSideExpanded());
		},

		onIconPress: function (oEvent) {
			this.router.navTo("Dashboard");
		},

		onRootItemSelect: function(oEvent) {
			var oMenuGroup = oEvent.getSource();
		
			if (oMenuGroup.getExpanded()) {
				oMenuGroup.collapse();
			} else {
				oMenuGroup.expand();
			}
		},
		onItemSelect: function (oEvent) {
			try {
				
			} catch (error) {
				
			}
			var sSelectedMenu = oEvent.getSource().getProperty("selectedKey");
			switch (sSelectedMenu) {
			case "dashboard":
       		this.openLoadingFragment();
				this.router.navTo("Dashboard");
        this.closeLoadingFragment();
				break;
			case "approvalprocess":
        this.openLoadingFragment();
				this.router.navTo("ApprovalProcess");
        this.closeLoadingFragment();
				break;	
			case "purchaserequest":
        this.openLoadingFragment();
				this.router.navTo("PurchaseRequest");
        this.closeLoadingFragment();
				break;
			case "paymentrequestitem":
        this.openLoadingFragment();
				this.router.navTo("PaymentRequest");
        this.closeLoadingFragment();
				break;
			case "inventoryrequest":
        this.openLoadingFragment();
				this.router.navTo("InventoryRequest");
        this.closeLoadingFragment();
				break;
			case "approvaldecision":
        this.openLoadingFragment();
				this.router.navTo("ApprovalDecision");
        this.closeLoadingFragment();
				break;
			case "approvalinquiry":
        this.openLoadingFragment();
				this.router.navTo("ApprovalInquiry");
        this.closeLoadingFragment();
        break;
      case "Tree":
        this.openLoadingFragment();
		this.router.navTo("ApprovalInquiryTree");
        this.closeLoadingFragment();
        break;
      case "Logout":
        document.body.style.zoom = "100%" 
        this.openLoadingFragment();
        this.onLogout();
        this.router.navTo("Login");
        this.closeLoadingFragment();
				break;
			default:
				//this.router.navTo("Dashboard");
			//	MessageToast.show(sSelectedMenu.toUpperCase() +" is not implemented yet.");
				break;
			
			}
		},
		//ACTION BUTTON---------------------------
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
    
    handleOpen: function (oEvent) {
			var oButton = oEvent.getSource();

			// create action sheet only once
			if (!this._actionSheet) {
				this._actionSheet = sap.ui.xmlfragment(
					"com.apptech.DLSL.view.fragments.UserActionFragment",
					this
				);

				this.getView().addDependent(this._actionSheet);
			}

			this._actionSheet.openBy(oButton);
	},

	onLogout: function (oEvent) {
			// this.router.navTo("Login");
			// sap.ui.core.UIComponent.getRouterFor(this).navTo("Login");
			$.ajax({
				url: "http://13.229.195.111:50000/b1s/v1/Logout",
				type: "POST",
				error: function (xhr, status, error) {
				var Message = xhr.responseJSON["error"].message.value;			
				sap.m.MessageToast.show(Message);
				},
				context:this,
				success: function (json) {
					sap.m.MessageToast.show("Session End"); 
					jQuery.sap.storage.Storage.clear();	
					//location.reload();
					//sap.ui.core.UIComponent.getRouterFor(this).navTo("Login", null, true);
					window.location.replace("/index.html");		
				}
			});
	},

    onApprovalProcess: function(){
      this.openLoadingFragment();
      this.router.navTo("ApprovalProcess");
      this.closeLoadingFragment();
    },

    onApprovalDecision: function(){
      this.openLoadingFragment();
      this.router.navTo("ApprovalDecision");
      this.closeLoadingFragment();
    },

    onapprovalinquiry: function(){
      this.openLoadingFragment();
      this.router.navTo("ApprovalInquiry");
      this.closeLoadingFragment();
    },

    onpurchaserequest: function(){
      this.openLoadingFragment();
      this.router.navTo("PurchaseRequest");
      this.closeLoadingFragment();
    },

    onpaymentrequestitem: function(){
      this.openLoadingFragment();
      this.router.navTo("PaymentRequest");
      this.closeLoadingFragment();
    },

    oninventoryrequest: function(){
      this.openLoadingFragment();
	  this.router.navTo("InventoryRequest");
      this.closeLoadingFragment();
    },

    onTransactionTree: function(){
      this.openLoadingFragment();
      this.router.navTo("ApprovalInquiryTree");
      this.closeLoadingFragment();
    },

    onApprovalSubstitute: function(){
      this.openLoadingFragment();
      this.router.navTo("ApprovalSubstitute");
      this.closeLoadingFragment();
    },

	Errorlogs: function(){
		this.openLoadingFragment();
		this.router.navTo("ErrorLog");
		this.closeLoadingFragment();
	  },
  

    onCreateUDF:function(){
      //Purchase Request
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
			
		//PaymentRequest
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

		//Inventory Request
		
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
			
	//Approval Decision
	
		  APPui5.createTable("APP_APRDEC", "Approval Decision", "bott_Document");
		  APPui5.createField("APP_Status", "Status", "@APP_APRDEC", "db_Alpha", "", 100);
		  APPui5.createField("APP_Level","Level","@APP_APRDEC","db_Alpha","",100);
		  APPui5.createField("APP_Stage","Stage","@APP_APRDEC","db_Alpha","",100);
		  APPui5.createField("APP_Template","Approval Template","@APP_APRDEC","db_Alpha","",100);
		  APPui5.createField("APP_Authorizer", "Authorizer", "@APP_APRDEC", "db_Alpha", 100);
		  APPui5.createField("APP_DocType", "Document Type", "@APP_APRDEC", "db_Alpha", "", 100);
		  APPui5.createField("APP_DocNum", "Document Number", "@APP_APRDEC", "db_Alpha", "", 100);
		  APPui5.createField("APP_DocDate", "Document Date", "@APP_APRDEC", "db_Date", "");
		  APPui5.createField("APP_DueDate", "Due Date", "@APP_APRDEC", "db_Date", "");
		  APPui5.createField("APP_Originator", "Originator", "@APP_APRDEC", "db_Alpha", "", 100);
		  APPui5.createField("APP_Remarks", "Remarks", "@APP_APRDEC", "db_Alpha", "", 200);
		  APPui5.createField("APP_Notes", "Notes", "@APP_APRDEC", "", 200);
		  APPui5.createField("APP_Recommendation", "Recommendation", "@APP_APRDEC", "", 100);
		  
		  
		  //Approval Stage
		  
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


        //Create UDT
            APPui5.createTable("APP_ATCH", "Attachment Table Path", "bott_NoObject");
            APPui5.createField("AttachmentDate","Attachment Date","@APP_ATCH","db_Date","");
            APPui5.createField("FreeText","Free Text","@APP_ATCH","db_Alpha",254);
            APPui5.createField("ObjType","Object Type","@APP_ATCH","db_Alpha",10);
            APPui5.createField("FileName","File Name","@APP_ATCH","db_Alpha",254);
            APPui5.createField("DocEntry","Document","@APP_ATCH","db_Alpha",10);
          
            APPui5.createTable("APP_UPDT", "User Department", "bott_NoObject");
            APPui5.createField("UserCode","User Code","@APP_UPDT","db_Alpha",30);
            APPui5.createField("Department","Department/Depository","@APP_UPDT","db_Alpha",50);
            APPui5.createField("Dimension","Dimension","@APP_UPDT","db_Alpha",30);
            APPui5.createField("APP_Description","Department Name","@APP_UPDT","db_Alpha",100);
            APPui5.createField("APP_Group","Group","@APP_UPDT","db_Alpha",50);
            APPui5.createField("FundType","Fund Type","@APP_UPDT","db_Alpha",30);




    },

	onSetMenu: function(){
    if(localStorage.getItem("UserType") == "Administrator"){
      this.getView().byId("AdminNav").setVisible(true);
      this.getView().byId("AP").setVisible(true);
      this.getView().byId("SA").setVisible(true);
      this.getView().byId("AD").setVisible(true);
      this.getView().byId("AI").setVisible(true);
      this.getView().byId("TI").setVisible(true);
      this.getView().byId("ProcurementNav").setVisible(true);
      this.getView().byId("PaymentNav").setVisible(true);
      this.getView().byId("InventoryNav").setVisible(true);
	  this.getView().byId("NavErrorLog").setVisible(true);
    }else if(localStorage.getItem("UserType") == "Approver"){
      this.getView().byId("AdminNav").setVisible(true);
      this.getView().byId("AD").setVisible(true);
      this.getView().byId("AI").setVisible(true);
      this.getView().byId("TI").setVisible(true);
	  this.getView().byId("NavErrorLog").setVisible(false);
    }else if(localStorage.getItem("UserType") == "Maker"){
      this.getView().byId("AdminNav").setVisible(true);
      this.getView().byId("AI").setVisible(true);
      this.getView().byId("TI").setVisible(true);
      this.getView().byId("ProcurementNav").setVisible(true);
      this.getView().byId("PaymentNav").setVisible(true);
      this.getView().byId("InventoryNav").setVisible(true);
	  this.getView().byId("NavErrorLog").setVisible(false);
    }
  	},

	
	  
  
	});
});
  