sap.ui.define(
    [
        'sap/ui/core/mvc/ControllerExtension',
        'sap/ui/core/mvc/OverrideExecution'
    ],
    function (
        ControllerExtension,
        OverrideExecution
    ) {
        'use strict';
        return ControllerExtension.extend("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController", {
            // metadata: {
            // 	// extension can declare the public methods
            // 	// in general methods that start with "_" are private
            // 	methods: {
            // 		publicMethod: {
            // 			public: true /*default*/ ,
            // 			final: false /*default*/ ,
            // 			overrideExecution: OverrideExecution.Instead /*default*/
            // 		},
            // 		finalPublicMethod: {
            // 			final: true
            // 		},
            // 		onMyHook: {
            // 			public: true /*default*/ ,
            // 			final: false /*default*/ ,
            // 			overrideExecution: OverrideExecution.After
            // 		},
            // 		couldBePrivate: {
            // 			public: false
            // 		}
            // 	}
            // },
            // // adding a private method, only accessible from this controller extension
            // _privateMethod: function() {},
            // // adding a public method, might be called from or overridden by other controller extensions as well
            // publicMethod: function() {},
            // // adding final public method, might be called from, but not overridden by other controller extensions as well
            // finalPublicMethod: function() {},
            // // adding a hook method, might be called by or overridden from other controller extensions
            // // override these method does not replace the implementation, but executes after the original method
            // onMyHook: function() {},
            // // method public per default, but made private via metadata
            // couldBePrivate: function() {},
            // // this section allows to extend lifecycle hooks or override public methods of the base controller

            _buttons: [],

            onRequestApproval: function (oEvent) {
                console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: Request Approval"); 
                this._performRequest("CndnContrRequestApproval","Approval Requested");
            },

            onRequestSettlementApproval: function (oEvent) {
                console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: Request Settlement Approval"); 
                this._performRequest("CndnContrRequestSettAppr","Settlement Approval Requested");
            },

            _performRequest: function (sFunction, sMessage) {
                const that = this;
                //this.base.templateBaseExtension.getExtensionAPI() <-- this works too
                const selectedContexts = this.base.getView().getController().extensionAPI.getSelectedContexts();
                if (selectedContexts.length > 0 ) {
                    const conditionContract = selectedContexts[0].getProperty("ConditionContract");
                    const payload = {
                        ConditionContract: conditionContract
                    };
                    const promise = this.base.getView().getController().extensionAPI.securedExecution(function() {
                        return that.base.getView().getController().extensionAPI.invokeActions(
                            "LO_SETMAN_CCSUPL_MAN.LO_SETMAN_CCSUPL_MAN_Entities/" + sFunction, [], payload
                        );
                    });
                    promise.then(function(result) {
                        if (result.length > 0 && result[0].response.data.Success) {
                            sap.m.MessageToast.show(sMessage + "\n Contract Number: " + payload.ConditionContract);
                            setTimeout(() => {
                                //that.base.getView().getController().extensionAPI.rebindTable();
                                that.base.getView().getController().extensionAPI.refresh();
                            }, 200);
                        }
                   });
                }

            },

            _clearButtons: function() {
                this._buttons = [];
            },

            _getButtons: function() {
                if (this._buttons.length <= 0) {
                    const baseId = this.getView().getId();
                    const buttonRequestApproval = this.getView().byId(baseId 
                        + '--customer.zespri.ci.settleman.cc.managesupls1.variant.btnZZRequestApproval');
                    const buttonRequestSettlementApproval = this.getView().byId(baseId 
                        + '--customer.zespri.ci.settleman.cc.managesupls1.variant.btnZZRequestSettlementApproval');
                    this._buttons.push(buttonRequestApproval);
                    this._buttons.push(buttonRequestSettlementApproval);
                }
                return this._buttons;
            },

            _setButtonsEnabled: function(bEnable) {
                for (const button of this._getButtons()) {
                    button.setEnabled(bEnable);
                }
            },

            _setReleaseButtonEnabled: function(bEnable) {
                this.getView().byId("BtnActivate").setEnabled(bEnable);
            },

            _updateButtons: function(oEvent) {
                this._setButtonsEnabled(false);
                this._setReleaseButtonEnabled(false);

                const selectedContexts = oEvent.getSource().getSelectedContexts();
                this._setButtonsEnabled((selectedContexts.length > 0));

                if (selectedContexts.length > 0) {
                    this._getAuthorisedToRelease(selectedContexts[0]);
                }
            },

            _getAuthorisedToRelease: function(selectedContext) {
                const that = this;
                console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: Get Authorised to Release"); 

                const conditionContract = selectedContext.getProperty("ConditionContract");
                const payload = {
                    ConditionContract: conditionContract
                };

                const promise = that.base.getView().getController().extensionAPI.securedExecution(function() {
                    return that.base.getView().getController().extensionAPI.invokeActions(
                        "LO_SETMAN_CCSUPL_MAN.LO_SETMAN_CCSUPL_MAN_Entities/CndnContrAuthChckRelease", [], payload
                    );
                });

                promise.then(function(result) {
                    that._setReleaseButtonEnabled(result.length > 0 && result[0].response.data.Success);
                });
            },

            override: {
            // 	/**
            // 	 * Called when a controller is instantiated and its View controls (if available) are already created.
            // 	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
            // 	 * @memberOf customer.zespri.ci.settleman.cc.managesupls1.variant.zzController
            // 	 */
             	onInit: function() {
                    console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: override: onInit()");
                    
                    this._clearButtons();

                    this.getView().byId(this.base.getView().sId + '--responsiveTable').attachSelectionChange(
                        function(oEvent){
                            console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: Selection Change");
                            this._updateButtons(oEvent);
                        }.bind(this)
                    );

                    this.getView().byId(this.base.getView().sId + '--responsiveTable').attachUpdateFinished(
                        function(oEvent){
                            console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: Update Finished");
                            this._updateButtons(oEvent);
                        }.bind(this)   
                    );                         
             	}
            // 	/**
            // 	 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
            // 	 * (NOT before the first rendering! onInit() is used for that one!).
            // 	 * @memberOf customer.zespri.ci.settleman.cc.managesupls1.variant.zzController
            // 	 */
            // 	onBeforeRendering: function() {
            //       console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: override: onBeforeRendering()");
            // 	},
            // 	/**
            // 	 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
            // 	 * This hook is the same one that SAPUI5 controls get after being rendered.
            // 	 * @memberOf customer.zespri.ci.settleman.cc.managesupls1.variant.zzController
            // 	 */
            // 	onAfterRendering: function() {
            //        console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: override: onAfterRendering()");
            // 	},
            // 	/**
            // 	 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
            // 	 * @memberOf customer.zespri.ci.settleman.cc.managesupls1.variant.zzController
            // 	 */
            // 	onExit: function() {
            //        console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: override: onExit()");
            // 	}
            // 	// override public method of the base controller
            // 	basePublicMethod: function() {
            // 	}
            }
        });
    }
);
