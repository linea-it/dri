Ext.define('Target.view.settings.ColumnsController', {
    extend: 'Ext.app.ViewController',

    requires: [
        'Target.model.Setting',
        'Target.view.settings.SettingWindow'
    ],

    alias: 'controller.columns',

    listen: {
        component: {
            'targets-columns': {
                changecatalog: 'onChangeCatalog'
                //changesetting: 'onChangeSetting'
            }
        },
        store: {
            '#Available': {
                load: 'checkAvailable'
            },
            '#Settings': {
                load: 'onLoadSettings'
            }
        }
    },

    winSetting: null,

    onChangeCatalog: function (currentCatalog) {
        // console.log('onChangeCatalog');

        var me = this,
            vm = me.getViewModel(),
            settings = vm.get('settings');

        settings.addFilter([
            {
                property: 'cst_product',
                value: currentCatalog.get('id')
            }
        ]);

        settings.load();
    },

    onLoadSettings: function (settings) {
        // console.log('onLoadSettings');
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            currentSettings = vm.getStore('currentSettings'),
            btnEditSetting = me.lookup('btnEditSetting');

        // Verificar se tem alguma settings atualmente ativa para esse produto.
        if (settings.count() > 0) {
            btnEditSetting.enable();

            // Carregar a Store de currentSettings
            currentSettings.addFilter([
                {
                    property: 'cst_product',
                    value: currentCatalog.get('id')
                }
            ]);
            currentSettings.load({
                scope: me,
                callback: me.onLoadCurrentSettings
            });
        } else {
            // caso nao tenha nenhum desativa o botao edit. deixando destacado so o botao new

            btnEditSetting.disable();
        }

    },

    onLoadCurrentSettings: function () {
        // console.log('onLoadCurrentSettings');
        var me = this,
            vm = me.getViewModel(),
            settings = vm.getStore('settings'),
            currentSettings = vm.getStore('currentSettings'),
            cmbSetting = me.lookup('cmbSetting'),
            currentSetting, setting;

        if (currentSettings.count() > 0) {
            // ja possui uma current Setting basta apenas seleciona-la
            currentSetting = currentSettings.first();

            vm.set('currentSetting', currentSetting);

            setting = settings.getById(currentSetting.get('cst_setting'));

            vm.set('selectedSetting', setting);

        }

    },

    onSelectSetting: function (cmbSetting, selectedSetting) {
        var me = this,
            vm = me.getViewModel(),
            currentSetting = vm.get('currentSetting');

        if (selectedSetting.get('id') > 0) {
            // console.log('onSelectSetting(%o)', selectedSetting);

            // se tiver algum currentSetting deletar para criar um novo
            // currentSetting so deve ter um por produto e usuario
            if ((currentSetting) && (currentSetting.get('id') > 0)) {

                // Verificar se a setting atual e diferente da que foi selecionada
                if (selectedSetting.get('id') != currentSetting.get('cst_setting')) {
                    // Se for diferente apaga para criar uma nova
                    currentSetting.erase({
                        callback: function (record, operation, success) {
                            if (success) {
                                me.setNewCurrentSetting();
                            }
                        }
                    });
                } else {
                    me.loadGrids();
                }
            } else {
                // se nao tiver nenhum current Setting para este produto criar um novo baseado no setting selecionado
                me.setNewCurrentSetting();
            }
        }
    },

    setNewCurrentSetting: function () {
        // console.log('setNewCurrentSetting()');
        var me = this,
            vm = me.getViewModel(),
            selectedSetting = vm.get('selectedSetting'),
            currentCatalog = vm.get('currentCatalog'),
            currentSetting;

        currentSetting = Ext.create('Target.model.CurrentSetting',{
            cst_product: currentCatalog.get('id'),
            cst_setting: selectedSetting.get('id')
        });

        currentSetting.save({
            callback: function (record, operation, success) {
                newRecord = JSON.parse(operation.getResponse().responseText);
                record.set(newRecord);

                vm.set('currentSetting', record);
                me.loadGrids();
            }
        });
    },

    loadGrids: function () {
        // console.log('loadGrids');
        var me = this,
            vm = me.getViewModel(),
            selectedSetting = vm.get('selectedSetting'),
            currentCatalog = vm.get('currentCatalog'),
            auxAvailable = vm.getStore('auxAvailableContents'),
            auxContentSetting = vm.getStore('auxContentSettings');

        auxContentSetting.addFilter([
            {'property': 'pcs_setting', value: selectedSetting.get('id')}
        ]);

        auxAvailable.addFilter([
            {'property': 'pcn_product_id', value: currentCatalog.get('id')},
            {'property': 'pca_setting', value: selectedSetting.get('id')}
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
        // console.log('loadAvailable');
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
        // console.log('loadContentSettings');
        var me = this,
            vm = me.getViewModel(),
            selectedSetting = vm.get('selectedSetting'),
            storeContentSetting = vm.getStore('contentSettings');

        storeContentSetting.addFilter([
            {'property': 'pcs_setting', value: selectedSetting.get('id')}
        ]);

        storeContentSetting.load();
    },

    checkAvailable: function () {
        // console.log('checkAvailable');
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
        // console.log('onDropGrid2');
        var me = this,
            vm = me.getViewModel(),
            currentSetting = vm.get('currentSetting');

        // Checar se ja tem uma current setting se nao tiver tem que ser criada antes.
        if ((currentSetting) && (currentSetting.get('id') > 0)) {
            // Se ja tiver current setting apenas adicioan a nova coluna
            me.addColumnToCurrentSetting();
        }
    },

    addColumnToCurrentSetting: function () {
        // console.log('addColumnToCurrentSetting');
        var me = this,
            vm = me.getViewModel(),
            currentSetting = vm.get('currentSetting'),
            grid = me.lookupReference('grid2'),
            auxStore = vm.getStore('auxContentSettings'),
            storeContentSetting = vm.getStore('contentSettings'),
            contentSetting, index, settingId;

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
                    'pcs_setting': currentSetting.get('cst_setting'),
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
            displayName;

        storeContentSetting.load({
            callback: function () {

                storeContentSetting.each(function (record) {
                    displayName = record.get('display_name').toLowerCase();

                    if (displayName.indexOf(value.toLowerCase()) === -1) {
                        removeds.push(record);
                    }

                }, me);

                storeContentSetting.remove(removeds);

            }
        });

    },

    onSearchCancelDisplayed: function () {
        this.loadContentSettings();

    },

    // ----------------------- Settings -------------------------------
    newSetting: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            model;

        model = Ext.create('Target.model.Setting', {
            cst_product: currentCatalog.get('id')
        });

        me.showSettingWindow(model);
    },

    editSetting: function () {
        // console.log('editSetting()');
        var me = this,
            vm = me.getViewModel(),
            selectedSetting = vm.get('selectedSetting');

        me.showSettingWindow(selectedSetting);
    },

    showSettingWindow: function (selectedSetting) {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            win, model;

        if (me.winSetting) {
            me.winSetting.close();
            me.winSetting = null;
        }

        me.winSetting = Ext.create('Target.view.settings.SettingWindow',{
            listeners: {
                scope: me,
                'newsetting': 'onAddSetting',
                'deletesetting': 'onDeleteSetting'
            }
        });

        me.winSetting.setRecord(selectedSetting);

        me.winSetting.show();

    },

    onAddSetting: function (newSetting) {
        // console.log('onAddSetting(%o)', newSetting);

        var me = this,
            vm = me.getViewModel(),
            settings = vm.getStore('settings');

        vm.set('selectedSetting', newSetting);
        settings.load();
    },

    onDeleteSetting: function () {
        // console.log('onDeleteSetting');

        var me = this,
            vm = me.getViewModel(),
            settings = vm.getStore('settings'),
            currentCatalog = vm.get('currentCatalog');

        model = Ext.create('Target.model.Setting', {
            cst_product: currentCatalog.get('id')
        });

        vm.set('selectedSetting', model);

        vm.set('currentSetting', null);

        settings.load();
    }

});
