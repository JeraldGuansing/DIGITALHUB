sap.ui.define([
    "com/apptech/DLSL/controller/BaseController",
    "sap/ui/model/json/JSONModel",
    "com/apptech/DLSL/controller/APPui5",
  ], function(Controller,JSONModel,APPui5) {
    "use strict";
  
    var oEmailExist;
    return Controller.extend("com.apptech.DLSL.controller.Login", {
      onBeforeRendering:function(){
        this.fGetAllRecords("getAllDB","");
        this.zoom();
        // this.getView().byId("selectDatabase").setSelectedKey(""+ jQuery.sap.storage.Storage.get("dataBase") +"");
      },
      onInit: function () {
        this.oMdlDatabase = new JSONModel();    
        this.User = "";
        // selectDatabase
        this.getView().byId("selectDatabase").setSelectedKey(localStorage.getItem("DLSLDB"));
        var month = new Date().getMonth() + 0;
        var currentMonth;
        oEmailExist = false;
     
        // var num = new Number(14);
        // console.log(num.toPrecision(4)); //outputs 14.12

        // localStorage.clear();

        if(month == 0){
          currentMonth = 5;
        }else if(month == 1){
          currentMonth = 6;
        }else if(month == 2){
          currentMonth = 7;
        }else if(month == 3){
          currentMonth = 8;
        }else if(month == 4){
          currentMonth = 9;
        }else if(month == 5){
          currentMonth = 10;
        }else if(month == 6){
          currentMonth = 11;
        }else if(month == 7){
          currentMonth = 12;
        }else if(month == 8){
          currentMonth = 1;
        }else if(month == 9){
          currentMonth = 2;
        }else if(month == 10){
          currentMonth = 3;
        }else if(month == 11){
          currentMonth = 4;
        }

        localStorage.setItem("Month",currentMonth);
      },
      
      action: function (oEvent) {
              var that = this;
              var actionParameters = JSON.parse(oEvent.getSource().data("wiring").replace(/'/g, "\""));
              var eventType = oEvent.getId();
              var aTargets = actionParameters[eventType].targets || [];
              aTargets.forEach(function (oTarget) {
                  var oControl = that.byId(oTarget.id);
                  if (oControl) {
                      var oParams = {};
                      for (var prop in oTarget.parameters) {
                          oParams[prop] = oEvent.getParameter(oTarget.parameters[prop]);
                      }
                      oControl[oTarget.action](oParams);
                  }
              });
              var oNavigation = actionParameters[eventType].navigation;
              if (oNavigation) {
                  var oParams = {};
                  (oNavigation.keys || []).forEach(function (prop) {
                      oParams[prop.name] = encodeURIComponent(JSON.stringify({
                          value: oEvent.getSource().getBindingContext(oNavigation.model).getProperty(prop.name),
                          type: prop.type
                      }));
                  });
                  if (Object.getOwnPropertyNames(oParams).length !== 0) {
                      this.getOwnerComponent().getRouter().navTo(oNavigation.routeName, oParams);
                  } else {
                      this.getOwnerComponent().getRouter().navTo(oNavigation.routeName);
                  }
              }
          },
    
          OnLoadUsers: function () {
            var that = this;
            var sDBCompany = that.getView().byId("selectDatabase");
            var sUserName = this.getView().byId("Username");
            $.ajax({
              url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ jQuery.sap.storage.Storage.get("dataBase") +"&procName=SPAPP_GETUSERINFO&VALUE1=" + that.getView().byId("Username").getValue(),
              type: "GET",
              async: false,
              beforeSend: function (xhr) {
                xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
              },
              error: function (xhr, status, error) {
                // var Message = xhr.responseJSON["error"].message.value;
                APPui5.APPMESSAGEBOX("Something went wrong");
                $( ".sapMMessageToast" ).addClass( "sapMMessageToastDanger");
                console.log("Error");
              },
              success: function (json) {
              },
              context: this
            }).done(function (results) {
              if(results[0].U_APP_Position == null || results[0].U_APP_Position == ''){
                APPui5.APPMESSAGEBOX("Please set the position for this user first:\n Users > View > User Defined Field >> Position");
                $( ".sapMMessageToast" ).addClass( "sapMMessageToastDanger");
              }else{
                localStorage.setItem("UserType",results[0].U_APP_Position);
                localStorage.setItem("DepartmentID",results[0].Name);
                localStorage.setItem("Email",results[0].E_Mail);
                localStorage.setItem("RequestorName",results[0].U_NAME);
                localStorage.setItem("DLSLDB",sDBCompany.getSelectedItem().getKey());
                localStorage.setItem("loginName",results[0].U_NAME);
                sap.m.MessageToast.show("Welcome : " + sUserName.getValue() + "!");
                sap.ui.core.UIComponent.getRouterFor(this).navTo("Dashboard"); 
              }
            
            });
          },      

          zoom: function() {
            document.body.style.zoom = "95%";
          },

          onLogin: function (oEvent) {
            //  sap_bluecrystal -->
            //    sap.ui.core.UIComponent.getRouterFor(this).navTo("Dashboard");
            //   AppUI5.fShowBusyIndicator(10000);
                    this.openLoadingFragment();
                    var sUserName = this.getView().byId("Username");
                    var sPassword = this.getView().byId("Password");
                    var sDBCompany = this.getView().byId("selectDatabase");
                    var oLoginCredentials = {};
                    oLoginCredentials.CompanyDB = sDBCompany.getSelectedItem().getKey();
                    oLoginCredentials.UserName = sUserName.getValue();//"manager";
                    oLoginCredentials.Password = sPassword.getValue();//"1234";
                    
                    $.ajax({
                        url: "https://13.215.36.201:50000/b1s/v1/Login",
                        data: JSON.stringify(oLoginCredentials),
                        type: "POST",
                        crossDomain: true,
                        xhrFields: {
                            withCredentials: true
                        },
                        error: function (xhr, status, error) {
                          this.closeLoadingFragment();
                            var Message = xhr.responseJSON["error"].message.value;			
                            APPui5.APPMESSAGEBOX(Message);
                            // AppUI5.fHideBusyIndicator();
                        },
                        context:this,
                        success: function (json) {
                        }
                    }).done(function (results) {
                        if (results) {
                            // AppUI5.fHideBusyIndicator();
                            localStorage.setItem("UserCode",this.getView().byId("Username").getValue());
                            jQuery.sap.storage.Storage.put("dataBaseName", sDBCompany.getSelectedItem().getText());
                            jQuery.sap.storage.Storage.put("dataBase",sDBCompany.getSelectedItem().getKey());
                            jQuery.sap.storage.Storage.put("userCode",sUserName.getValue());
                            jQuery.sap.storage.Storage.put("isLogin",true);
                            // this.onCreateUDF();
                            this.OnLoadUsers();
                        }
                    });
                    this.closeLoadingFragment();
          },
            
          fGetAllRecords: function(queryTag,v1){
              // var aReturnResult = [];
              $.ajax({
                  url: "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName=SBODEMOAU&procName=spAppUserAuth&QUERYTAG="+ queryTag +
                  "&VALUE1="+ v1 +"&VALUE2=&VALUE3=&VALUE4=",
                  type: "GET",
                  async: false,
                  dataType: "json",
                  crossDomain: true,
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
                  if (results) {
                      this.oMdlDatabase.setJSON("{\"Database\" : " + JSON.stringify(results) + "}");
                      this.getView().setModel(this.oMdlDatabase, "oMdlDatabase");
                  }
              });
             
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
  
          onGetDB:function(){
              this.fGetAllRecords("getAllDB","");
              this.oMdlDatabase.refresh();
          },

          onCreateUDF:function(){
        //     //Purchase Request
        //       APPui5.createTable("APP_PositionsTBL", "Positions", "bott_NoObject");
        //       APPui5.createField("APP_Position", "Position", "OUSR", "db_Alpha", "", 100);
        //       APPui5.createField("APP_Position","Position","OPRQ","db_Alpha","",100);
        //       APPui5.createField("APP_RefNum","Reference Number","OPRQ","db_Alpha","",50);
        //       APPui5.createField("APP_SpecialistCode","Specialist Code","PRQ1","db_Alpha","",50);
        //       APPui5.createField("APP_Type","Type","OITB","db_Alpha","",100);
        //       APPui5.createField("APP_Type","Type","PRQ1","db_Alpha","",100);
               
              
        //      APPui5.createTable("APP_OPRQ","Purchase Request","bott_Document");
        //      APPui5.createField("APP_Requester","Requester","@APP_OPRQ","db_Alpha","",50);
        //      APPui5.createField("APP_Position","Position","@APP_OPRQ","db_Alpha","",50);
        //      APPui5.createField("APP_Department","Department","@APP_OPRQ","db_Alpha","",50);
        //      APPui5.createField("APP_RequestDate","Request Date","@APP_OPRQ","db_Date","");
        //      APPui5.createField("APP_RequiredDate","Required Date","@APP_OPRQ","db_Date","");
        //      APPui5.createField("APP_IsDraft","Is Draft","@APP_OPRQ","db_Alpha","",50);
        //      APPui5.createField("APP_Attachment","Attachment","@APP_OPRQ","db_Alpha","",50);
        //      APPui5.createField("APP_Recommendation","Recommendation","@APP_OPRQ","db_Alpha","",100);
               
                
        //     APPui5.createTable("APP_PRQ1","Purchase Request Details","bott_DocumentLines");
        //     APPui5.createField("APP_ItemCode","Item Code","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_Description","Description","@APP_PRQ1","db_Alpha","",100);
        //     APPui5.createField("APP_SpecialistCode","Specialist Code","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_Type","Type","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_GlAccount","Gl Account","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_FundType","Fund Type","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_Program","Program","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_Department","Department","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_Division","Division","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_Employee","Employee","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_Quantity","Quantity","@APP_PRQ1","db_Numeric","",10);
        //     APPui5.createField("APP_Uom","Uom","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_EstPrice","Est Unit Price","@APP_PRQ1","db_Float","st_Price",10);
        //     APPui5.createField("APP_EstAmt","Est Amount","@APP_PRQ1","db_Float","st_Price",10);
        //     APPui5.createField("APP_Budget","Budget/ Fund Available","@APP_PRQ1","db_Float","st_Price",10);
        //     APPui5.createField("APP_Vendor","Vendor","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_TaxCode","Tax Code","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_Whse","Warehouse","@APP_PRQ1","db_Alpha","",50);
        //     APPui5.createField("APP_Notes","Notes","@APP_PRQ1","db_Alpha","",100);
        //     APPui5.createField("APP_Depository","Depository","@APP_PRQ1","db_Alpha","",50);
            
        //   //PaymentRequest
        //     APPui5.createField("APP_Position", "Position", "OPCH", "db_Alpha", "", 100);
        //     APPui5.createField("APP_Requester", "Requester", "OPCH", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Type", "Type", "PCH1", "db_Alpha", "", 100);
            
        //     APPui5.createTable("APP_ORFP", "Payment Request", "bott_Document");
        //     APPui5.createField("APP_Requester", "Requester", "@APP_ORFP", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Position", "Position", "@APP_ORFP", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Department", "Department", "@APP_ORFP", "db_Alpha", "", 50);
        //     APPui5.createField("APP_RequestDate", "Request Date", "@APP_ORFP", "db_Date", "");
        //     APPui5.createField("APP_RequiredDate", "Required Date", "@APP_ORFP", "db_Date", "");
        //     APPui5.createField("APP_Payee", "Payee", "@APP_ORFP", "db_Alpha", "", 50);
        //     APPui5.createField("APP_IsDraft","Is Draft","@APP_ORFP","db_Alpha","",50);
        //     APPui5.createField("APP_Attachment","Attachment","@APP_ORFP","db_Alpha","",50);
        //     APPui5.createField("App_LoanType","Loan Type","@APP_ORFP","db_Alpha","",30);
        //     APPui5.createField("WTCode","Tax Code","@APP_ORFP","db_Alpha","",50);
      
        //     APPui5.createTable("APP_RFP1", "Payment Request Details", "bott_DocumentLines");
        //     APPui5.createField("APP_ItemCode", "Item Code", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Description", "Description", "@APP_RFP1", "db_Alpha", "", 100);
        //     APPui5.createField("APP_Type", "Type", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_GlAccount", "Gl Account", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_FundType", "Fund Type", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Program", "Program", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Department", "Department", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Division", "Division", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Depository", "Depository", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Employee", "Employee", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Quantity", "Quantity", "@APP_RFP1", "db_Numeric", "", 10);
        //     APPui5.createField("APP_Uom", "Uom", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_EstPrice", "Est Unit Price", "@APP_RFP1", "db_Float", "st_Price", 10);
        //     APPui5.createField("APP_EstAmt", "Est Amount", "@APP_RFP1", "db_Float", "st_Price", 10);
        //     APPui5.createField("APP_Budget", "Budget/ Fund Available", "@APP_RFP1", "db_Float", "st_Price", 10);
        //     APPui5.createField("APP_TaxCode", "Tax Code", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_EmployeeType", "Employee Type", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Notes", "Note", "@APP_RFP1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_GLSap", "GL for posting to SAP", "@APP_RFP1", "db_Alpha", "", 30);
        //     APPui5.createField("APP_TaxLiable", "Tax Amount", "@APP_RFP1", "db_Alpha", "", 20);  
        //     APPui5.createField("WTLiable", "With Tax Liable", "@APP_RFP1", "db_Alpha", "", 50);
      
        //   //Inventory Request
          
        //     APPui5.createField("APP_Position", "Position", "OIGE", "db_Alpha", "", 100);
        //     APPui5.createField("APP_Type", "Type", "IGE1", "db_Alpha", "", 100);
        //     APPui5.createField("APP_Notes", "Notes", "IGE1", "db_Alpha", "", 100);
      
        //     APPui5.createTable("APP_OIVR", "Inventory Request", "bott_Document");
        //     APPui5.createField("APP_Requester", "Requester", "@APP_OIVR", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Position", "Position", "@APP_OIVR", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Department", "Department", "@APP_OIVR", "db_Alpha", "", 50);
        //     APPui5.createField("APP_RequestDate", "Request Date", "@APP_OIVR", "db_Date", "");
        //     APPui5.createField("APP_RequiredDate", "Required Date", "@APP_OIVR", "db_Date", "");
        //     APPui5.createField("APP_JONum", "JO Number", "@APP_OIVR", "db_Alpha", "", 50);			
        //     APPui5.createField("APP_IsDraft","Is Draft","@APP_OIVR","db_Alpha","",50);
        //     APPui5.createField("APP_Attachment","Attachment","@APP_OIVR","db_Alpha","",50);
            
        //     APPui5.createTable("APP_IVR1", "Inventory Request Details", "bott_DocumentLines");
        //     APPui5.createField("APP_ItemCode", "Item Code", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Description", "Description", "@APP_IVR1", "db_Alpha", "", 100);
        //     APPui5.createField("APP_Type", "Type", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_GlAccount", "Gl Account", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_FundType", "Fund Type", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Program", "Program", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Department", "Department", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Division", "Division", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Depository", "Depository", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Employee", "Employee", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Quantity", "Quantity", "@APP_IVR1", "db_Numeric", "", 10);
        //     APPui5.createField("APP_Uom", "Uom", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_EstPrice", "Est Unit Price", "@APP_IVR1", "db_Float", "st_Price", 10);
        //     APPui5.createField("APP_EstAmt", "Est Amount", "@APP_IVR1", "db_Float", "st_Price", 10);
        //     APPui5.createField("APP_Budget", "Budget/ Fund Available", "@APP_IVR1", "db_Float", "st_Price", 10);
        //     APPui5.createField("APP_TaxCode", "Tax Code", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Whse", "Warehouse", "@APP_IVR1", "db_Alpha", "", 50);
        //     APPui5.createField("APP_Notes", "Notes", "@APP_IVR1", "db_Alpha", "", 100);
        //     APPui5.createField("APP_SpecialistCode", "Specialist", "@APP_IVR1", "db_Alpha", "", 30);
            
        // //Approval Decision
        
        //     APPui5.createTable("APP_APRDEC", "Approval Decision", "bott_Document");
        //     APPui5.createField("APP_Status", "Status", "@APP_APRDEC", "db_Alpha", "", 100);
        //     APPui5.createField("APP_Level","Level","@APP_APRDEC","db_Alpha","",100);
        //     APPui5.createField("APP_Stage","Stage","@APP_APRDEC","db_Alpha","",100);
        //     APPui5.createField("APP_Template","Approval Template","@APP_APRDEC","db_Alpha","",100);
        //     APPui5.createField("APP_Authorizer", "Authorizer", "@APP_APRDEC", "db_Alpha", 100);
        //     APPui5.createField("APP_DocType", "Document Type", "@APP_APRDEC", "db_Alpha", "", 100);
        //     APPui5.createField("APP_DocNum", "Document Number", "@APP_APRDEC", "db_Alpha", "", 100);
        //     APPui5.createField("APP_DocDate", "Document Date", "@APP_APRDEC", "db_Date", "");
        //     APPui5.createField("APP_DueDate", "Due Date", "@APP_APRDEC", "db_Date", "");
        //     APPui5.createField("APP_Originator", "Originator", "@APP_APRDEC", "db_Alpha", "", 100);
        //     APPui5.createField("APP_Remarks", "Remarks", "@APP_APRDEC", "db_Alpha", "", 200);
        //     APPui5.createField("APP_Notes", "Notes", "@APP_APRDEC", "", 200);
        //     APPui5.createField("APP_Recommendation", "Recommendation", "@APP_APRDEC", "", 100);
            
            
        //     //Approval Stage
            
                  // APPui5.createTable("APP_APRSTG","Approval Stages","bott_MasterData");
                  // APPui5.createTable("APP_APRSTGDET","Approval Stages Details","bott_MasterDataLines");
                  // APPui5.createField("APP_Authorizer","Authorizer","@APP_APRSTGDET","db_Alpha",100);
                  // APPui5.createField("APP_Department","Department","@APP_APRSTGDET","db_Alpha",100);
                  // APPui5.createTable("APP_APRTEMP","Approval Template","bott_MasterData");
                  // APPui5.createField("APP_Status","Status","@APP_APRTEMP","db_Alpha",20);
                  
                  // APPui5.createTable("APP_APRTEMPORIG","Originators","bott_MasterDataLines");
                  // APPui5.createField("APP_Originator","Originator","@APP_APRTEMPORIG","db_Alpha",50);
                  // APPui5.createField("APP_Department","Department","@APP_APRTEMPORIG","db_Alpha",50);

                  // APPui5.createTable("APP_APRTEMPDOC","Documents","bott_MasterDataLines");
                  // APPui5.createField("APP_Document","Document","@APP_APRTEMPDOC","db_Alpha",100);
                  // APPui5.createField("APP_Flag","Flag","@APP_APRTEMPDOC","db_Alpha",20);
                  // APPui5.createTable("APP_APRTEMPSTG","Stages","bott_MasterDataLines");
                  // APPui5.createField("APP_Level","Level","@APP_APRTEMPSTG","db_Alpha",50);
                  // APPui5.createField("APP_Stages","Stage","@APP_APRTEMPSTG","db_Alpha",50);
                  // APPui5.createField("APP_Description","Description","@APP_APRTEMPSTG","db_Alpha",100);
                  
                  // APPui5.createTable("APP_APRTEMPTERM","Terms","bott_MasterDataLines");
                  // APPui5.createField("APP_Terms","Term","@APP_APRTEMPTERM","db_Alpha",50);
                  // APPui5.createField("APP_Ratio","Ratio","@APP_APRTEMPTERM","db_Alpha",50);
                  // APPui5.createField("APP_Value","Value","@APP_APRTEMPTERM","db_Alpha",50);
                  // APPui5.createField("APP_Value2","Value 2","@APP_APRTEMPTERM","db_Alpha",50);
      
      
              // //Create UDT
              //     APPui5.createTable("APP_ATCH", "Attachment Table Path", "bott_NoObject");
              //     APPui5.createField("AttachmentDate","Attachment Date","@APP_ATCH","db_Date","");
              //     APPui5.createField("FreeText","Free Text","@APP_ATCH","db_Alpha",254);
              //     APPui5.createField("ObjType","Object Type","@APP_ATCH","db_Alpha",10);
              //     APPui5.createField("FileName","File Name","@APP_ATCH","db_Alpha",254);
              //     APPui5.createField("DocEntry","Document","@APP_ATCH","db_Alpha",10);
                
              //     APPui5.createTable("APP_UPDT", "User Department", "bott_NoObject");
              //     APPui5.createField("UserCode","User Code","@APP_UPDT","db_Alpha",30);
              //     APPui5.createField("Department","Department/Depository","@APP_UPDT","db_Alpha",50);
              //     APPui5.createField("Dimension","Dimension","@APP_UPDT","db_Alpha",30);
              //     APPui5.createField("APP_Description","Department Name","@APP_UPDT","db_Alpha",100);
              //     APPui5.createField("APP_Group","Group","@APP_UPDT","db_Alpha",50);
              //     APPui5.createField("FundType","Fund Type","@APP_UPDT","db_Alpha",30);
          },

          onChangePassword: function(){
            if (!this.oFP) {
              this.oFP = sap.ui.xmlfragment("com.apptech.DLSL.view.fragments.OTP", this);
              this.getView().addDependent(this.oFP);
            }
            this.oFP.open();
            sap.ui.getCore().byId("UserEmailID").setVisible(true);
            sap.ui.getCore().byId("OTPR").setVisible(false);
            // sap.ui.getCore().byId("OldPassword").setVisible(false);
            sap.ui.getCore().byId("NPassword").setVisible(false);
            sap.ui.getCore().byId("CPassword").setVisible(false);
          
            sap.ui.getCore().byId("UserEmailID").setValue("");
            sap.ui.getCore().byId("OTPR").setValue("");
            // sap.ui.getCore().byId("OldPassword").setValue("");
            sap.ui.getCore().byId("NPassword").setValue("");
            sap.ui.getCore().byId("CPassword").setValue("");
            // sap.ui.getCore().byId("fButtonID").setText("Get OTP");
            // sap.ui.getCore().byId("fButtonID").setIcon("sap-icon://paper-plane");
            
            },
        
            onCloseFP: function(){
              if(this.oFP){
                this.oFP.close();
              }
            },


            onFunc: function(){
              if(sap.ui.getCore().byId("UserEmailID").getVisible() === true){
                if(sap.ui.getCore().byId("UserEmailID").getValue() === ""){
                  APPui5.APPMESSAGEBOX("Please Enter Email address");
                  return;
                }

                this.CheckEmailExist(sap.ui.getCore().byId("UserEmailID").getValue());

                if(oEmailExist !== true){
                  APPui5.APPMESSAGEBOX("Email Address not found, Please Check your input email");
                  return;
                }

                jQuery.sap.storage.Storage.put("isOTP",APPui5.generateOTP());
                this.onSendOTP();

                sap.ui.getCore().byId("UserEmailID").setVisible(false);
                sap.ui.getCore().byId("OTPR").setVisible(true);
                // sap.ui.getCore().byId("OldPassword").setVisible(false);
                sap.ui.getCore().byId("NPassword").setVisible(false);
                sap.ui.getCore().byId("CPassword").setVisible(false);

              }else if(sap.ui.getCore().byId("OTPR").getVisible() === true){
                if(sap.ui.getCore().byId("OTPR").getValue() === ""){
                  APPui5.APPMESSAGEBOX("Please Enter OTP Code");
                  return;
                }

                if(jQuery.sap.storage.Storage.get("isOTP") !== sap.ui.getCore().byId("OTPR").getValue()){
                  APPui5.APPMESSAGEBOX("Invalid OTP Code, Please check your email");
                  return;
                }

                sap.ui.getCore().byId("UserEmailID").setVisible(false);
                sap.ui.getCore().byId("OTPR").setVisible(false);
                // sap.ui.getCore().byId("OldPassword").setVisible(true);
                sap.ui.getCore().byId("NPassword").setVisible(true);
                sap.ui.getCore().byId("CPassword").setVisible(true);
              }else{

                if(sap.ui.getCore().byId("NPassword").getValue() === ""){
                  APPui5.APPMESSAGEBOX("Please enter your new password");
                  return;
                }

                if(sap.ui.getCore().byId("CPassword").getValue() === ""){
                  APPui5.APPMESSAGEBOX("Please enter the confirm Password");
                  return;
                }


          
                if(sap.ui.getCore().byId("CPassword").getValue() !== sap.ui.getCore().byId("NPassword").getValue()){
                  APPui5.APPMESSAGEBOX("Password not match, please try again");
                  return;
                }

                // if(sap.ui.getCore().byId("NPassword").getValue().length < 8){
                //   APPui5.APPMESSAGEBOX("Password should have atleast 8 characters");
                //   return;
                // }
                this.getUserEntry(sap.ui.getCore().byId("UserEmailID").getValue());
              }
            },

            onSendOTP: function(Email){
              try{
                var oEmail = [];
                oEmail.push({
                  "receiver": sap.ui.getCore().byId("UserEmailID").getValue(),
                  "OTPCode":  jQuery.sap.storage.Storage.get("isOTP")
                });
                
                var that = this;
                var settings = {
                  "url": "https://digitalhub.dlsl.edu.ph/OTPCode",
                  "method": "POST",
                  "timeout": 0,
                  "headers": {
                    "Content-Type": "application/json"
                  },
                  "data": JSON.stringify(oEmail),
                };
                
                $.ajax(settings).done(function (response) {
                  console.log(response);
                });
              }catch (e){
                console.log(e);
              }
            },

            getUserEntry: function(Email){
              var that = this;
              var sDBCompany = this.getView().byId("selectDatabase");
              var oUrls = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ sDBCompany.getSelectedItem().getKey() +"&procName=spApp_getUserID&value1=" + Email;
              $.ajax({
                url: oUrls,
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
                    that.onCheckCredential(json[0].USERID);
                  }
                },
                context: this
              });
            },


            CheckEmailExist: function(Email){
              var that = this;
              var sDBCompany = this.getView().byId("selectDatabase");
              var oUrls = "https://13.215.36.201:4300/app_xsjs/ExecQuery.xsjs?dbName="+ sDBCompany.getSelectedItem().getKey() +"&procName=spApp_getUserID&value1=" + Email;
              $.ajax({
                url: oUrls,
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
                    oEmailExist = true;
                  }else{
                    oEmailExist = false;
                  }
                },
                context: this
              });
            },



            ChangePassword: function(UserID){
              var oUser = {};
              oUser.UserPassword = sap.ui.getCore().byId("NPassword").getValue();

              $.ajax({
                url: "https://13.215.36.201:50000/b1s/v1/Users(" + UserID + ")",
                data: JSON.stringify(oUser),
                headers: { "B1S-ReplaceCollectionsOnPatch": true },
                type: "PATCH",
                crossDomain: true,
                context: this,
                xhrFields: {
                  withCredentials: true
                },
                error: function (xhr, status, error) {
                  var Message = xhr.responseJSON["error"].message.value;
                  APPui5.APPMESSAGEBOX(Message);;
                },
                success: async function (json) {
                    this.onLogout();
                    APPui5.APPMESSAGEBOX("Your password successfully changed");
                }
              });
           
            },


            onCheckCredential: function (UserID) {
                      var sDBCompany = this.getView().byId("selectDatabase");
                      var oLoginCredentials = {};
                      oLoginCredentials.CompanyDB = sDBCompany.getSelectedItem().getKey();
                      oLoginCredentials.UserName = "manager";
                      oLoginCredentials.Password = "P@ssw0rd";

                      $.ajax({
                          url: "https://13.215.36.201:50000/b1s/v1/Login",
                          data: JSON.stringify(oLoginCredentials),
                          type: "POST",
                          crossDomain: true,
                          xhrFields: {
                              withCredentials: true
                          },
                          error: function (xhr, status, error) {
                              this.closeLoadingFragment();
                              var Message = xhr.responseJSON["error"].message.value;
                              console.log(Message)
                              APPui5.APPMESSAGEBOX(Message);
                          },
                          context:this,
                          success: function (json) {
                            if(json.length !== 0){
                              this.ChangePassword(UserID);
                            }
                          }
                      });
              this.closeLoadingFragment();
            },

            onLogout: function (oEvent) {
              $.ajax({
                url: "https://13.215.36.201:50000/b1s/v1/Logout",
                type: "POST",
                error: function (xhr, status, error) {
                var Message = xhr.responseJSON["error"].message.value;			
                sap.m.MessageToast.show(Message);
                },
                context:this,
                success: function (json) {
                  jQuery.sap.storage.Storage.clear();	
                  // window.location.replace("/index.html");
                  this.onCloseFP();
                }
              });
          },

          onTestDelay: function(){

            var current = new Date();
            console.log(current.toLocaleString());
            jQuery.sap.delayedCall(5000, this, function() {
              var after = new Date();
              console.log(after.toLocaleString());
            });
          },

          callFragment: function(){
            if (!this.frg) {
              this.frg = sap.ui.xmlfragment("com.apptech.DLSL.view.sample", this);
              this.getView().addDependent(this.frg);
            }
            this.frg.open();
          },
      
          oncloseFragment: function(){
            if(this.frg){
                this.frg.close();
            }
          },



        });   
  });
  