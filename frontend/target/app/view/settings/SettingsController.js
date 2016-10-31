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

    onCloseSettingWindow: function () {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('settings'),
            refs = me.getReferences(),
            combo = refs.cmbSetting;

        store.load({
            callback: function () {
                // if (this.first()) {
                //     combo.select(this.first());
                // } else {
                combo.select(null);
                // }
            }
        });
    },

    onAddSetting: function () {
        var me = this,
            refs = me.getReferences(),
            combo = refs.cmbSetting,
            store = combo.getStore(),
            form = me.lookupReference('settingForm').getForm(),
            win = me.lookupReference('winSetting'),
            record;

        form.updateRecord();
        record = form.getRecord();
        store.add(record);

        store.sync({
            callback: function (model, operation, success) {
                // Recuperar o record que acabou de ser incluido é necessario pois a integracao com Django causou um bug no callback.
                me.addedSetting(record);

                win.close();
            }
        });
    },

    addedSetting: function (record) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('settings'),
            refs = me.getReferences(),
            combo = refs.cmbSetting;

        store.clearFilter(true);
        store.addFilter([
            {property: 'cst_product', value: record.get('cst_product')},
            {property: 'cst_display_name', value: record.get('cst_display_name')},
            {property: 'cst_description', value: record.get('cst_description')},
            {property: 'cst_is_public', value: record.get('cst_is_public')}
        ]);

        store.load({
            callback: function () {
                combo.select(this.first());
            }
        });

    },

    onCancelSetting: function () {
        var me = this;
        me.lookupReference('settingForm').getForm().reset();
        me.lookupReference('winSetting').close();
    },

    editSetting: function () {
        var me = this,
            vm = me.getViewModel(),
            setting = vm.get('selectedSetting'),
            win;

        win = Ext.create('Target.view.settings.SettingWindow',{
            listeners: {
                delete: 'onCloseSettingWindow'
            }
        });

        win.down('form').loadRecord(setting);

        win.setEdit(true);

        me.getView().add(win);

        win.show();

    },

    onDeleteSetting: function () {
        var me = this,
            win = me.lookupReference('winSetting'),
            vm = me.getViewModel(),
            store = vm.getStore('settings'),
            form = me.lookupReference('settingForm').getForm(),
            record = form.getRecord();

        if ((record) && (record.get('id') > 0)) {

            store.load({
                callback: function () {
                    store.remove(record);

                    store.sync({
                        callback: function () {
                            win.onDelete();
                        }
                    });
                }
            });
        }
    },

    onSelectSetting: function (combo, record) {
        var me = this;

        if (record.get('id') > 0) {

            me.onChooseSetting();

        }
    },

    onChooseSetting: function () {
        console.log('onChooseSetting');

        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            selected = vm.get('selectedSetting'),
            currentSetting = vm.get('currentSetting');

        // Verificar se existe uma currentSetting
        if (currentSetting.get('id') > 0) {
            // Verificar se e igual a selecionada
            if (currentSetting.get('cst_setting') == selected.get('id')) {
                // mesma currentSetting
                view.selectSetting(currentSetting);

            } else {
                // troca de currentSetting
                me.changeCurrentSetting();
            }

        } else {
            // Nao existe currentSetting
            me.addCurrentSetting();
        }

    },

    addCurrentSetting: function () {
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            store = vm.getStore('currentSettings'),
            selected = vm.get('selectedSetting'),
            product = vm.get('currentProduct'),
            cs;

        cs = Ext.create('Target.model.CurrentSetting', {
            cst_product: product,
            cst_setting: selected.get('id')
        });

        store.add(cs);
        store.sync({
            callback: function () {
                store.addFilter([
                    {
                        property: 'cst_product',
                        value: product
                    },
                    {
                        property: 'cst_setting',
                        value: selected.get('id')
                    }
                ]);
                store.load({
                    callback: function () {
                        view.selectSetting(this.first());
                    }
                });
            }
        });
    },

    changeCurrentSetting: function () {
        console.log('changeCurrentSetting');
        var me = this,
            view = me.getView(),
            vm = me.getViewModel(),
            store = vm.getStore('currentSettings'),
            selected = vm.get('selectedSetting'),
            product = vm.get('currentProduct'),
            currentSetting = vm.get('currentSetting');

        currentSetting.set('cst_setting', selected.get('id'));
        store.add(currentSetting);
        store.sync({
            callback: function () {
                store.addFilter([
                    {
                        property: 'cst_product',
                        value: product
                    },
                    {
                        property: 'cst_setting',
                        value: selected.get('id')
                    }
                ]);
                store.load({
                    callback: function () {
                        view.selectSetting(this.first());
                    }
                });
            }
        });

    }

});
