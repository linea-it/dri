Ext.define('Target.view.settings.ColumnsController', {
    extend: 'Ext.app.ViewController',

    requires: [

    ],

    alias: 'controller.columns',

    listen: {
        component: {
            'targets-columns': {
                changesetting: 'onChangeSetting'
            }
        },
        store: {
            '#Available': {
                load: 'checkAvailable'
            }
        }
    },

    onChangeSetting: function (currentSetting) {
        var me = this,
            vm = me.getViewModel(),
            auxAvailable = vm.getStore('auxAvailableContents'),
            auxContentSetting = vm.getStore('auxContentSettings');

        auxContentSetting.addFilter([
            {'property': 'pcs_setting', value: currentSetting.get('cst_setting')}
        ]);

        auxAvailable.addFilter([
            {'property': 'pcn_product_id', value: currentSetting.get('cst_product')},
            {'property': 'pca_setting', value: currentSetting.get('cst_setting')}
        ]);
        auxAvailable.load();

        auxContentSetting.load({
            callback: function () {
                me.loadAvailable();

            }
        });

        me.loadContentSettings();

    },

    loadAvailable: function () {
        var me = this,
            vm = me.getViewModel(),
            available = vm.getStore('availableContents'),
            currentSetting = vm.get('currentSetting');

        available.clearFilter();

        available.addFilter([
            {'property': 'pcn_product_id', value: currentSetting.get('cst_product')},
            {'property': 'pca_setting', value: currentSetting.get('cst_setting')}
        ]);

        available.load();
    },

    loadContentSettings: function () {
        var me = this,
            vm = me.getViewModel(),
            currentSetting = vm.get('currentSetting'),
            storeContentSetting = vm.getStore('contentSettings');

        storeContentSetting.addFilter([
            {'property': 'pcs_setting', value: currentSetting.get('cst_setting')}
        ]);

        storeContentSetting.load();
    },

    checkAvailable: function () {
        var me = this,
            vm = me.getViewModel(),
            available = vm.getStore('availableContents'),
            auxContentSetting = vm.getStore('auxContentSettings'),
            removeds = [];

        // Remover da store as propriedades que ja estao na contentSettings
        available.each(function (item) {
            if (auxContentSetting.find('display_name', item.get('display_name')) > -1) {
                removeds.push(item);

            }

        }, this);

        available.remove(removeds);
    },

    onDropGrid1: function (node, data) {
        var me = this,
            vm = me.getViewModel(),
            grid = me.lookupReference('grid1'),
            auxStore = vm.getStore('auxContentSettings');

        grid.setLoading(true);

        Ext.each(data.records, function (record) {
            auxStore.remove(record);

        }, me);

        auxStore.sync({
            callback: function () {
                grid.setLoading(false);
                me.loadContentSettings();
                me.loadAvailable();
            }
        });

    },

    onDropGrid2: function (node, data) {
        var me = this,
            vm = me.getViewModel(),
            grid = me.lookupReference('grid2'),
            auxStore = vm.getStore('auxContentSettings'),
            storeContentSetting = vm.getStore('contentSettings'),
            contentSetting, index;

        grid.setLoading(true);

        storeContentSetting.each(function (item, key) {

            index = auxStore.find('display_name', item.get('display_name'));

            if (index > -1) {
                contentSetting = auxStore.getAt(index);

                // Update da posicao.
                contentSetting.set('pcs_order', key);

            } else {
                // Cria um model.
                contentSetting = Ext.create('Target.model.ContentSetting', {
                    'display_name': item.get('display_name'),
                    'pcs_content': item.get('id'),
                    'pcs_setting': item.get('setting_id'),
                    'pcs_is_visible': true,
                    'pcs_order': key
                });
            }

            auxStore.add(contentSetting);

        });

        auxStore.sync({
            callback: function () {
                grid.setLoading(false);
                auxStore.load({
                    callback: function () {
                        me.loadContentSettings();
                    }
                });
            }
        });
    },

    onSearch: function (value) {
        var me = this,
            vm = me.getViewModel(),
            available = vm.getStore('availableContents');

        if (value !== '') {
            available.filter([
                {
                    property: 'display_name',
                    value: value
                }
            ]);

        } else {
            me.onSearchCancel();
        }

    },

    onSearchCancel: function () {
        this.loadAvailable();

    },

    onSearchDisplayed: function (value) {
        var me = this,
            vm = me.getViewModel(),
            storeContentSetting = vm.getStore('contentSettings'),
            removeds = [],
            display_name;

        storeContentSetting.load({
            callback: function () {

                storeContentSetting.each(function (record) {
                    display_name = record.get('display_name').toLowerCase();

                    if (display_name.indexOf(value.toLowerCase()) === -1) {
                        removeds.push(record);
                    }

                }, me);

                storeContentSetting.remove(removeds);

            }
        });

    },

    onSearchCancelDisplayed: function () {
        this.loadContentSettings();

    }

});
