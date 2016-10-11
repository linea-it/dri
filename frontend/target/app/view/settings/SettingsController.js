Ext.define('Target.view.settings.SettingsController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'Target.view.settings.SettingWindow'
    ],

    alias: 'controller.settings',

    listen: {
        component: {
            'targets-settings': {
                changeproduct: 'onChangeProduct'
            }
        }
    },
    //     store: {
    //         '#Catalogs': {
    //             load: 'onLoadCatalogs'
    //         },
    //         '#ClassContent': {
    //             load: 'onLoadClassContent'
    //         },
    //         '#ProductContent': {
    //             load: 'onLoadProductContent'
    //         },
    //         '#ProductAssociation': {
    //             load: 'onLoadProductAssociation'
    //         }
    //     }

    // },
    onChangeProduct: function (product) {
        var me = this,
            vm = me.getViewModel(),
            refs = me.getReferences(),
            combo = refs.cmbSetting,
            store = combo.getStore();

        vm.set('currentProduct', product);

        store.filter([
            {
                property: 'cst_product',
                value: product
            }
        ]);
    },

    newSetting: function () {
        var me = this,
            vm = me.getViewModel(),
            product = vm.get('currentProduct'),
            win, model;

        win = Ext.create('Target.view.settings.SettingWindow',{});

        model = Ext.create('Target.model.Setting', {
            cst_product: product
        });

        win.down('form').loadRecord(model);

        me.getView().add(win);

        win.show();

    },

    onAddSetting: function () {
        var me = this,
            refs = me.getReferences(),
            combo = refs.cmbSetting,
            store = combo.getStore(),
            form = me.lookupReference('settingForm').getForm(),
            record = form.getRecord(),
            values = form.getValues(),
            win = me.lookupReference('winSetting');

        record.set(values);
        console.log(record);

        store.add(record);
        store.sync({
            callback: function (model, operation, success) {
                console.log(operation);
                console.log(success);
                win.close();

            }
        });
    },

    onCancelSetting: function () {
        var me = this;
        me.lookupReference('settingForm').getForm().reset();
        me.lookupReference('winSetting').close();
    }

});
