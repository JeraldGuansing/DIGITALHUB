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
], function (jQuery, Device, Fragment, Controller, JSONModel, Popover, 
  Button, mobileLibrary, MessageToast, APPui5, Filter, FilterOperator) {
	"use strict";

	return Controller.extend("com.apptech.DLSL.controller.PaymentRequest.PaymentRequestView", {
		onBeforeRendering: function () {
		},
		onInit: function () {
			this.oModel = new JSONModel("model/paymentrequest.json");
			this.getView().setModel(this.oModel, "oModel");
			this.router = this.getOwnerComponent().getRouter();
			//this.createTables(); //JPJ20210621 Add Tables


      // sap.ui.controller("Approval.ApprovalInquiry").function();
      this.oModel.getData().Attachments = [];
			this.iSelectedRow = 0;
            this.DocNum=0;
            this.DepartmentName="";
            this.UserName="";
            this.Payee="";
            var Router=sap.ui.core.UIComponent.getRouterFor(this);
            Router.getRoute("PaymentRequestView").attachMatched(this._onRouterMatched,this);
		},
	
    onInquiryNav:function(){
      this.router.navTo("InventoryRequest");
      localStorage.setItem("PreviousPath","");
    },
		onLoadPMTRecord: function (RowIndex) {
			$.ajax({
				url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName=" + jQuery.sap.storage.Storage.get("dataBase") + "&procName=SPAPP_GETDOCENTRY&VALUE1=" + this.DocNum + "&VALUE=APP_ORFP",
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
					url: "http://13.229.195.111:50000/b1s/v1/APP_ORFP(" + results[0].DocEntry + ")",
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
          this.getPayee(results.U_APP_Payee);

					this.oModel.getData().PaymentRequest.No = results.DocNum;
					this.oModel.getData().PaymentRequest.RequestDate = results.U_APP_RequestDate;
					this.oModel.getData().PaymentRequest.RequiredDate = results.U_APP_RequiredDate;
					this.oModel.getData().PaymentRequest.RequesterCode = results.U_APP_Requester;
					this.oModel.getData().PaymentRequest.RequesterName = this.UserName;
					this.oModel.getData().PaymentRequest.DepartmentCode = results.RequesterDepartment;
					this.oModel.getData().PaymentRequest.DepartmentName = this.DepartmentName;
					// this.getView().byId("position").setSelectedKey(results.U_APP_Position);
					this.oModel.getData().PaymentRequest.PositionCode = results.U_APP_Position;
					this.oModel.getData().PaymentRequest.Remarks = results.Remark;
					this.getView().byId("status").setSelectedKey(results.Status);
					this.oModel.getData().PaymentRequest.StatusCode = results.Status;
          // this.getFromAttachment(results.DocNum);


          if(results.U_APP_Attachment !== null || results.U_APP_Attachment !== "" || results.U_APP_Attachment !== undefined){
            this.oModel.getData().PaymentRequest.AttachmentEntry = results.U_APP_Attachment;
            this.getFromAttachment(results.U_APP_Attachment);
          }

          this.oModel.getData().PaymentRequest.Payee = results.U_APP_Payee;
					this.oModel.getData().PaymentRequest.PayeeName = this.Payee;
          this.oModel.getData().PaymentRequest.LoanType=results.U_App_LoanType
					this.oModel.getData().PaymentRequest.Items = [];

          
					var i;
          var taxableAmt = 0;
					for (i = 0; i < results.APP_RFP1Collection.length; i++) {

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
              "GLDetermination": results.APP_RFP1Collection[i].U_APP_GLSap,
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
          getPayee:function(Payee){
            $.ajax({
                url: "http://13.229.195.111:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETPAYEE&VALUE1="+ Payee +"",
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
                  this.Payee=results[0].CardName;
                }
              });
          },
        _onRouterMatched:function(oEvent){
            var oModelDocNum=this.getView().getModel("oModelDocNum");
            this.DocNum=oModelDocNum.getData().DocNum;           
            this.onLoadPMTRecord();
           },
		onClearData: function () {
			this.oModel.getData().PaymentRequest.No = "";
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
		},
		
    onNavBack: function(){
      if(localStorage.getItem("Transaction") === "FAQ"){
        this.onBack();
      }else if(localStorage.getItem("Transaction") === "FAD"){
        this.OnCancelScreen();
      }

      localStorage.setItem("Transaction","");
    },

    onViewAttachment: function(oEvent){
      this.iSelectedRow = oEvent.getSource().getParent().getIndex();    
      window.open("http://13.229.195.111:50000/b1s/v1/Attachments2(" + this.oModel.getData().PaymentRequest.AttachmentEntry + ")/$value?filename='" + this.oModel.getData().Attachments[this.iSelectedRow].FileName + "." + this.oModel.getData().Attachments[this.iSelectedRow].FileExtension +  "'");
    },

    OnCancelScreen: async function () {	
      this.onClearData();
      var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("ApprovalDecision");
    },

    onBack: async function () {	
      this.onClearData();
      // sap.ui.controller("com.apptech.DLSL.controller.Approval.ApprovalInquiry").onFilterback();
      var oRouter=sap.ui.core.UIComponent.getRouterFor(this);
      oRouter.navTo("ApprovalInquiry");
    },

    onPreview: function(){  
    
			if (!this.oReportViewer1) {
			  this.oReportViewer1 = sap.ui.xmlfragment("com.apptech.DLSL.view.fragments.ReportViewer",this);
			  this.getView().addDependent(this.oReportViewer1);
			}
			
			this.oReportViewer1.open();
		  
			var docentry = this.DocNum;
			// var objectId = "1470000113";
			var report = 'PR';
		  
			var sRedirectUrl = `http://digitalhub.dlsl.edu.ph/DLSL-TRX_Forms/TRXForms-viewer.jsp?report=${report}&docentry=${docentry}`;
			$('#ReportViewerIframe').attr("src",sRedirectUrl);
			
		  },

      onCloseReport: function(){
        this.oReportViewer1.close();
        this.oReportViewer1.destroy();
        this.oReportViewer1=null;
      },

      // onViewAttachment: function(oEvent){
      //   var myInputControl = oEvent.getSource(); // e.g. the first item
      //   var boundData = myInputControl.getBindingContext('oModel').getObject();
      //     window.open("http://13.229.195.111:50000/b1s/v1/Attachments2(" + boundData.Code + ")/$value");
      // },

      // onViewAttachment: function(){
      //   window.open("http://13.229.195.111:50000/b1s/v1/Attachments2(" + this.oModel.getData().PaymentRequest.AttachmentEntry + ")/$value");
      // },


      getFromAttachment(DocEntry){
        	try{
            $.ajax({
              url: "http://13.229.195.111:50000/b1s/v1/Attachments2?$filter=AbsoluteEntry eq " +  DocEntry,
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
              console.log(this.oModel.getData().Attachments)
              this.oModel.refresh();
            });
          }catch (e){
            console.log(e)
          }
        },


	});
});
