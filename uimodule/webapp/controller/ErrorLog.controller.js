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
	return Controller.extend("com.apptech.DLSL.controller.Approval.ErrorLog", {
		onInit: function(){
			this.oModel = new JSONModel("model/data.json");
			this.getView().setModel(this.oModel, "oModel");
			
			var that = this;
			var oView = this.getView();
			  oView.addEventDelegate({
				  onAfterHide: function(evt) {
					  //This event is fired every time when the NavContainer has made this child control invisible.
				  },
				  onAfterShow: function(evt) {
					  //This event is fired every time when the NavContainer has made this child control visible.
					//   oView.getController().onLoadRecord();
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
			// APPui5.openLoadingFragment();
		  },
	});
});
