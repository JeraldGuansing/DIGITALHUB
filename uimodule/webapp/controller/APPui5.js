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
	"sap/ui/core/BusyIndicator",
	"sap/m/MessageBox",
], function (jQuery, Device, Fragment, Controller, JSONModel,
	Popover, Button, mobileLibrary, MessageToast, BusyIndicator, MessageBox) {
	"use strict";

	return ("com.apptech.DLSL.controller.APPui5", {

		createTable: function (sTableName, sDescription, sTableType) {
			var tableInfo = {};
			tableInfo.TableName = sTableName;
			tableInfo.TableDescription = sDescription;
			tableInfo.TableType = sTableType;

			var stringTableInfo = JSON.stringify(tableInfo);
			$.ajax({
				url: "https://13.215.36.201:50000/b1s/v1/UserTablesMD",
				data: stringTableInfo,
				type: "POST",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					return error;
				},
				success: function (json) {
					return 0;
				},
				context: this
			});
		},

		/*
		Generic function helper to create field.
		@@ params : Field Name
					Field Description
					Table Name - ex. "@APP_OAMS"
					Field Type - ("db_Alpha", "db_Date","db_Float","db_Memo","db_Numeric")
					Field SubType - ("st_Percentage", "st_Price", "st_Quantity", "st_Rate", "st_Sum", "st_Image")
					Character Size 
		*/
		createField: function (sFieldName, sDescription, sTableName, sType, sSubType, iSize) {
			var oFieldInfo = {};
			if (sFieldName === undefined || sDescription === undefined || sTableName === undefined) {
				return -1;
			}

			oFieldInfo.Description = sDescription;
			oFieldInfo.Name = sFieldName;
			oFieldInfo.TableName = sTableName;
			oFieldInfo.Type = sType;

			if (iSize === undefined || sType === "db_Numeric") {
				iSize = 11;
			}

			oFieldInfo.EditSize = iSize;
			oFieldInfo.Size = iSize;

			if (sType === "db_Float" || (!sSubType === undefined)) {
				oFieldInfo.SubType = sSubType;
			}

			var dataString = JSON.stringify(oFieldInfo);

			$.ajax({
				url: "https://13.215.36.201:50000/b1s/v1/UserFieldsMD",
				data: dataString,
				type: "POST",
				async: false,
				xhrFields: {
					withCredentials: true
				},
				error: function (xhr, status, error) {
					return error;
				},
				success: function (json) {

					return 0;
				},
				context: this
			});

			return -1;

		},
		onPrompt: function (title, message) {
			return new Promise(function (resolve, reject) {
				sap.m.MessageBox.confirm(message, {
					icon: MessageBox.Icon.CONFIRMATION,
					title: title,
					actions: [MessageBox.Action.YES, MessageBox.Action.NO],
					emphasizedAction: MessageBox.Action.YES,
					onClose: function (oAction) {
						if (oAction === 'YES') {
							resolve(1);
							//console.log('YES');
						} else {
							resolve(0);
						}
					}.bind(this)
				});
			});
		},
		getDatePostingFormat: function (sDate) {
			var year = new Date(sDate).getYear() + 1900;
			var month = new Date(sDate).getMonth() + 1;
			var date = new Date(sDate).getDate();
			return month + "/" + date + "/" + year;
		},

		updateDateFunc: function (sDate) {
			var year = new Date(sDate).getYear() + 1900;
			var month = new Date(sDate).getMonth() + 1;
			var date = new Date(sDate).getDate();
			return year + "-" + month + "-" + date;
		},

		getDateFormat: function (sDate) {
			var year = new Date(sDate).getYear() + 1900;
			var month = new Date(sDate).getMonth() + 1;
			if (month<10){
				month="0" + month;
			}
			var date = new Date(sDate).getDate();
			return year + "-" + month + "-" + date;
		},
		setUDFID: function (sDate) {
			var year = new Date(sDate).getYear() + 1900;
			var month = new Date(sDate).getMonth() + 1;
			var date = new Date(sDate).getDate();
			var hr = new Date(sDate).getHours();
			var min = new Date(sDate).getMinutes();
			var sec = new Date(sDate).getSeconds();
			return month + "" + date + "" + year + "" + hr + "" + min + "" + sec;
		},

    toCommas:function (value) {
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },

    removeCommas:function (str) {
      while (str.search(",") >= 0) {
          str = (str + "").replace(',', '');
      }
      return str;
    },

    toDecimal: function(num){
      let n = num.toFixed(2);
      return n;
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

        round:function (num, decimalPlaces = 2) {
          var p = Math.pow(10, decimalPlaces);
          var n = (num * p) * (1 + Number.EPSILON);
          return Math.round(n) / p;
      },

      onCheckFileType: function(type){
        if(type = "application/pdf"){
          return "pdf"
        }
        
        if(type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"){
          return "xls"
        }
        
        if(type = " image/jpeg"){
          return "jpg"
        }
        
        if(type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"){
          return "doc"
        }
        
        if(type = "text/plain"){
          return "txt"
        }
      },



	APPMESSAGEBOX: function(msg){
		MessageBox.information(msg, {
            actions: [MessageBox.Action.OK],
            title: "De La Salle Lipa Procurement and Finance Digital Service Hub",
            icon: MessageBox.Icon.INFORMATION,
            styleClass:"sapUiSizeCompact"
          });
	},


	getlength: function(number) {
		return number.toString().length;
	},

	zeroPad: function (num, places) {
		var zero = places - num.toString().length + 1;
		return Array(+(zero > 0 && zero)).join("0") + num;
	  },

	  generateOTP:function() {
		var length = 8,
			charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
			retVal = "";
		for (var i = 0, n = charset.length; i < length; ++i) {
			retVal += charset.charAt(Math.floor(Math.random() * n));
		}
		return retVal;
	  },
  
	  ContainsNumber:function (_string){
		let matchPattern =_string.match(/\d+/g);
		if (matchPattern != null) {
		  return true;
		}
		else{
		 return false;
		}
	  },


	  ExecQuery: function (sProcName, sQueryTag, sRootModel, sV1 = "", sV2 = "", sV3 = "", sV4 = "", isAsync = false) {
		var fetchValue = "";
		var isAsyncParam = isAsync;
		


		var myURL =  "https://digitalhub.dlsl.edu.ph/app-xsjs/ExecQuery?dbName=" + jQuery.sap.storage.Storage.get("dataBase") +"&spname=" + sProcName + "&querytag=" + sQueryTag + "&value1=" + sV1 + "&value2=" + sV2 + "&value3=" + sV3 + "&value4=" + sV4;
		$.ajax({
			url: myURL,
			type: "GET",
			contentType: "application/json",
			datatype: "json",
			async: isAsyncParam,
			beforeSend: function (xhr) {
				xhr.setRequestHeader("Authorization", "Basic " + btoa("SYSTEM:Qwerty0987"));
			},
			context: this,
			error: function (xhr, status, error) {
				console.error(JSON.stringify(Message));
				sap.m.MessageToast.show(Message);
			},
			success: function (results) {
				
			},
		}).done(function (results) {
			// console.log(results)
			if (results) {
				if (sRootModel === "") {
					fetchValue = JSON.parse(JSON.stringify(results).replace("[", "").replace("]", ""));
				} else {
					if (sRootModel === 'DataRecord') {
						fetchValue = JSON.parse(JSON.stringify(results).replace("[", "").replace("]", ""));
					} else {
						fetchValue = JSON.parse(JSON.stringify(results));
					}
				}
			}
		});
		return fetchValue;
	},


		TDate: function(UserDate,ToDate) {
			if (new Date(UserDate).getTime() <= ToDate.getTime()) {
				return false;
			}
			return true;
		},
	});

});
