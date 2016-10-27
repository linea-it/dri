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
        }
    },

    flag_multiple: false,

    onChangeSetting: function (currentSetting) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('displayContents'),
            storeContentSetting = vm.getStore('contentSettings');

        store.addFilter([
            {'property': 'pcn_product_id', value: currentSetting.get('cst_product')},
            {'property': 'pca_setting', value: currentSetting.get('cst_setting')}
        ]);

        store.load({
            callback: function () {

            }
        });

        storeContentSetting.filter([
            {'property': 'pcs_setting', value: currentSetting.get('cst_setting')}
        ]);

    },

    onChangeVisible: function () {
        var me = this,
            vm = me.getViewModel(),
            grid = me.lookupReference('gridColumns'),
            storeContentSetting = vm.getStore('contentSettings'),
            store = vm.getStore('displayContents'),
            selection = grid.getSelection();

        me.flag_multiple = true;

        grid.setLoading(true);

        Ext.each(selection, function (record) {
            record.set('is_visible', !record.get('is_visible'));

        },me);

        me.flag_multiple = false;

        storeContentSetting.sync({
            callback: function () {
                grid.setLoading(false);
                store.load();
            }
        });

    },

    onSingleChangeVisible: function (chb, val) {
        var me = this,
            vm = me.getViewModel(),
            storeContentSetting = vm.getStore('contentSettings'),
            rec = chb.getWidgetRecord(),
            contentSetting;

        rec.set('is_visible', val);
        rec.commit();

        contentSetting = storeContentSetting.getById(rec.get('content_setting'));

        if (contentSetting) {
            // Se ja exitir na contentSettings e um update mas so se o valor for diferente do que estava antes
            if (rec.get('is_visible') !== contentSetting.get('pcs_is_visible')) {
                contentSetting.set('pcs_is_visible', rec.get('is_visible'));
            }

        } else {
            // Criar um ContentSetting
            contentSetting = Ext.create('Target.model.ContentSetting', {
                'pcs_content': rec.get('id'),
                'pcs_setting': rec.get('setting_id'),
                'pcs_is_visible': rec.get('is_visible'),
                'pcs_order': rec.get('order')
            });

            storeContentSetting.add(contentSetting);
        }

        // So faz o sync se for operacao single.
        if (!me.flag_multiple) {
            storeContentSetting.sync();
        }

    },

    onDropGrid: function (node, data, dropRec, dropPosition) {
        var me = this,
            vm = me.getViewModel(),
            grid = me.lookupReference('gridColumns'),
            store = vm.getStore('displayContents'),
            storeContentSetting = vm.getStore('contentSettings'),
            contentSetting;

        grid.setLoading(true);

        store.each(function (item, key) {

            // console.log(item.get('display_name'), key, item.get('content_setting'));

            if (item.get('content_setting') > 0) {
                contentSetting = storeContentSetting.getById(item.get('content_setting'));

                contentSetting.set('pcs_order', key);
                contentSetting.set('pcs_is_visible', item.get('is_visible'));

            } else {
                contentSetting = Ext.create('Target.model.ContentSetting', {
                    'pcs_content': item.get('id'),
                    'pcs_setting': item.get('setting_id'),
                    'pcs_is_visible': item.get('is_visible'),
                    'pcs_order': key
                });
            }

            storeContentSetting.add(contentSetting);

        }, me);

        storeContentSetting.sync({
            callback: function () {
                storeContentSetting.load({
                    callback: function () {
                        grid.setLoading(false);
                        store.load({
                            callback: function () {

                            }
                        });
                    }
                });
            }
        });
    }

});
