Ext.define('Target.view.settings.SettingsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.settings',

    addSetting: function () {
        // console.log('addSetting');
        var me = this,
            view = me.getView(),
            form = me.lookup('settingForm').getForm(),
            setting;

        if (form.isValid()) {
            form.updateRecord();

            setting = form.getRecord();

            setting.save({
                callback: function (record, operation, success) {
                    newRecord = JSON.parse(operation.getResponse().responseText);
                    setting.set(newRecord);
                    if (success) {
                        view.fireEvent('newsetting', setting, me);

                        view.close();
                    }
                }
            });
        }
    },

    deleteSetting: function () {
        // console.log('deleteSetting');
        var me = this,
            view = me.getView(),
            form = me.lookup('settingForm').getForm(),
            setting;

        setting = form.getRecord();

        setting.erase({
            callback: function (record, operation, success) {
                if (success) {
                    view.fireEvent('deletesetting', me);

                    view.close();
                }
            }
        });
    },

    cancelSetting: function () {
        // console.log('onCancelSetting');
        var me = this;

        me.lookupReference('settingForm').getForm().reset();
        me.getView().close();
    }

});
