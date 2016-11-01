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
            available = vm.getStore('availableContents'),
            auxAvailable = vm.getStore('auxAvailableContents'),
            auxContentSetting = vm.getStore('auxContentSettings'),
            storeContentSetting = vm.getStore('contentSettings');

        storeContentSetting.addFilter([
            {'property': 'pcs_setting', value: currentSetting.get('cst_setting')}
        ]);

        auxContentSetting.addFilter([
            {'property': 'pcs_setting', value: currentSetting.get('cst_setting')}
        ]);

        available.addFilter([
            {'property': 'pcn_product_id', value: currentSetting.get('cst_product')},
            {'property': 'pca_setting', value: currentSetting.get('cst_setting')}
        ]);

        auxAvailable.addFilter([
            {'property': 'pcn_product_id', value: currentSetting.get('cst_product')},
            {'property': 'pca_setting', value: currentSetting.get('cst_setting')}
        ]);

        storeContentSetting.load();

        auxContentSetting.load({
            callback: function () {
                available.load({
                    callback: function () {
                        me.checkAvailable();
                    }
                });

            }
        });

        auxAvailable.load();

    },

    checkAvailable: function () {
        console.log('checkAvailable()');

        var me = this,
            vm = me.getViewModel(),
            available = vm.getStore('availableContents'),
            auxContentSetting = vm.getStore('auxContentSettings'),
            removeds = [];

        // Remover da store as propriedades que ja estao na contentSettings

        available.each(function (item, key) {
            console.log('item:', item);

            if (auxContentSetting.find('display_name', item.get('display_name')) > -1) {
                console.log('esta na outra grid');
                removeds.push(item);
            }

        }, this);

        available.remove(removeds);
    },

    // onChangeVisible: function () {
    //     var me = this,
    //         vm = me.getViewModel(),
    //         grid = me.lookupReference('gridColumns'),
    //         storeContentSetting = vm.getStore('contentSettings'),
    //         store = vm.getStore('displayContents'),
    //         selection = grid.getSelection();

    //     me.flag_multiple = true;

    //     grid.setLoading(true);

    //     Ext.each(selection, function (record) {
    //         record.set('is_visible', !record.get('is_visible'));

    //     },me);

    //     me.flag_multiple = false;

    //     storeContentSetting.sync({
    //         callback: function () {
    //             grid.setLoading(false);
    //             store.load();
    //         }
    //     });

    // },

    // onSingleChangeVisible: function (chb, val) {
    //     var me = this,
    //         vm = me.getViewModel(),
    //         storeContentSetting = vm.getStore('contentSettings'),
    //         rec = chb.getWidgetRecord(),
    //         contentSetting;

    //     rec.set('is_visible', val);
    //     rec.commit();

    //     contentSetting = storeContentSetting.getById(rec.get('content_setting'));

    //     if (contentSetting) {
    //         // Se ja exitir na contentSettings e um update mas so se o valor for diferente do que estava antes
    //         if (rec.get('is_visible') !== contentSetting.get('pcs_is_visible')) {
    //             contentSetting.set('pcs_is_visible', rec.get('is_visible'));
    //         }

    //     } else {
    //         // Criar um ContentSetting
    //         contentSetting = Ext.create('Target.model.ContentSetting', {
    //             'pcs_content': rec.get('id'),
    //             'pcs_setting': rec.get('setting_id'),
    //             'pcs_is_visible': rec.get('is_visible'),
    //             'pcs_order': rec.get('order')
    //         });

    //         storeContentSetting.add(contentSetting);
    //     }

    //     // So faz o sync se for operacao single.
    //     if (!me.flag_multiple) {
    //         storeContentSetting.sync();
    //     }

    // },

    onDropGrid: function (node, data, dropRec, dropPosition) {
        // var me = this,
        //     vm = me.getViewModel(),
        //     grid = me.lookupReference('gridColumns'),
        //     store = vm.getStore('displayContents'),
        //     storeContentSetting = vm.getStore('contentSettings'),
        //     contentSetting;

        // grid.setLoading(true);

        // store.each(function (item, key) {

        //     // console.log(item.get('display_name'), key, item.get('content_setting'));

        //     if (item.get('content_setting') > 0) {
        //         contentSetting = storeContentSetting.getById(item.get('content_setting'));

        //         contentSetting.set('pcs_order', key);
        //         contentSetting.set('pcs_is_visible', item.get('is_visible'));

        //     } else {
        //         contentSetting = Ext.create('Target.model.ContentSetting', {
        //             'pcs_content': item.get('id'),
        //             'pcs_setting': item.get('setting_id'),
        //             'pcs_is_visible': item.get('is_visible'),
        //             'pcs_order': key
        //         });
        //     }

        //     storeContentSetting.add(contentSetting);

        // }, me);

        // storeContentSetting.sync({
        //     callback: function () {
        //         storeContentSetting.load({
        //             callback: function () {
        //                 grid.setLoading(false);
        //                 store.load({
        //                     callback: function () {

        //                     }
        //                 });
        //             }
        //         });
        //     }
        // });
    },

    onDropGrid2: function (node, data) {
        console.log('onDropGrid2(%o)', data);
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
                        storeContentSetting.load({
                            callback: function () {

                            }
                        });
                    }
                });
            }
        });
    }

});
