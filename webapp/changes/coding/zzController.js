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

            _setReleaseButtonEnabled: function(bEnable) {
                this.getView().byId("BtnActivate").setEnabled(bEnable);
            },

            _setSettLockButtonEnabled: function(bEnable) {
                this.getView().byId("BtnLock").setEnabled(bEnable);
            },

            _setReqApprButtonEnabled: function(bEnable) {
                this.getView().byId(this.getView().getId() + 
                    '--customer.zespri.ci.settleman.cc.managesupls1.variant.btnZZRequestApproval'
                ).setEnabled(bEnable);
            },

            _setReqSettApprButtonEnabled: function(bEnable) {
                this.getView().byId(this.getView().getId() +
                    '--customer.zespri.ci.settleman.cc.managesupls1.variant.btnZZRequestSettlementApproval'
                ).setEnabled(bEnable);
            },
            
            _disableAllButtons: function() {
                this._setReleaseButtonEnabled(false);
                this._setSettLockButtonEnabled(false);
                this._setReqApprButtonEnabled(false);
                this._setReqSettApprButtonEnabled(false);
            },

            _updateAllButtons: function(oStatus) {
                this._setReleaseButtonEnabled(oStatus.Release);
                this._setSettLockButtonEnabled(oStatus.SettLock);
                this._setReqApprButtonEnabled(oStatus.ReqAppr);
                this._setReqSettApprButtonEnabled(oStatus.ReqSettAppr);
            },

            _selectionChangeEvent: function(oEvent) {
                this._disableAllButtons();
                const selectedContexts = oEvent.getSource().getSelectedContexts();
                if (selectedContexts.length > 0) {
                     this._getButtonEnablement(selectedContexts[0]);
                }
            },

            _getButtonEnablement: function(selectedContext) {
                const that = this;

                const conditionContract = selectedContext.getProperty("ConditionContract");
                const payload = {
                    ConditionContract: conditionContract
                };

                const promise = that.base.getView().getController().extensionAPI.securedExecution(function() {
                    return that.base.getView().getController().extensionAPI.invokeActions(
                        "LO_SETMAN_CCSUPL_MAN.LO_SETMAN_CCSUPL_MAN_Entities/CndnContrButtons", [], payload
                    );
                });

                promise.then(function(result) {
                    if (result.length > 0) {
                        that._updateAllButtons(result[0].response.data);
                    }
                });
            },


            onRequestApproval: function (oEvent) {
                this._performRequest("CndnContrRequestApproval","Approval Requested");
            },

            onRequestSettlementApproval: function (oEvent) {
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
                                that.base.getView().getController().extensionAPI.refresh();
                            }, 200);
                        }
                   });
                }

            },


            override: {
            // 	/**
            // 	 * Called when a controller is instantiated and its View controls (if available) are already created.
            // 	 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
            // 	 * @memberOf customer.zespri.ci.settleman.cc.managesupls1.variant.zzController
            // 	 */
             	onInit: function() {
                    console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: override: onInit()");
                    
                    this._disableAllButtons();

                    this.getView().byId(this.base.getView().sId + '--responsiveTable').attachSelectionChange(
                        function(oEvent){
                            console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: Selection Change");
                            this._selectionChangeEvent(oEvent);
                        }.bind(this)
                    );

                    this.getView().byId(this.base.getView().sId + '--responsiveTable').attachUpdateFinished(
                        function(oEvent){
                            console.log("customer.zespri.ci.settleman.cc.managesupls1.variant.zzController: Update Finished");
                            this._selectionChangeEvent(oEvent);
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
