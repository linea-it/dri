/**
 *
 */
Ext.define('Target.view.objects.ObjectsController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.objects',

    /**
     * @requires Target.view.catalog.Export
     */
    requires: [
        'Target.view.catalog.Export',
        'Target.view.catalog.SubmitCutout',
        'Target.view.association.Panel',
        'Target.model.Rating',
        'Target.model.Reject',
        'Target.view.wizard.Wizard'
    ],

    listen: {
        component: {
            'targets-objects-panel': {
                beforeLoadPanel: 'onBeforeLoadPanel',
                beforeloadcatalog: 'loadCurrentSetting',
                beforedeactivate: 'onBeforeDeactivate'
            }
        },
        store: {
            '#Catalogs': {
                load: 'onLoadCatalogs'
            },
            '#objects': {
                update: 'onUpdateObject'
            }
        }
    },

    winAlertSetting: null,

    wizard: null,

    onBeforeLoadPanel: function (catalogId, objectsPanel) {
        var me = this,
            vm = objectsPanel.getViewModel(),
            catalogs = vm.getStore('catalogs'),
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid;

        objectsGrid.setLoading(true);

        catalogs.removeAll();
        catalogs.clearFilter(true);
        catalogs.filter([
            {
                property: 'id',
                value: catalogId
            }
        ]);
    },

    onLoadCatalogs: function (store) {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog,
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid;

        if (store.count() === 1) {
            currentCatalog = store.first();

            vm.set('currentCatalog', currentCatalog);

            objectsGrid.setLoading(false);

            me.loadCurrentSetting();
        }
    },

    loadCurrentSetting: function () {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('currentSettings'),
            product = vm.get('currentCatalog'),
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid;

        objectsGrid.setLoading(true);

        store.addFilter([
            {
                property: 'cst_product',
                value: product.get('id')
            }
        ]);

        store.load({
            callback: function (records, operations, success) {

                objectsGrid.setLoading(false);

                if ((success) && (records.length == 1)) {
                    vm.set('currentSetting', records[0]);

                    me.configurePanelBySettings();

                } else if (((success) && (records.length > 1))) {
                    console.log('Mais de uma setting');
                    console.log('TODO ISSO NAO PODE ACONTECER');

                    vm.set('currentSetting', records[records.length - 1]);
                    me.configurePanelBySettings();

                } else {
                    me.configurePanelWithoutSettings();

                }
            }
        });
    },

    configurePanelBySettings: function () {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('displayContents'),
            currentSetting = vm.get('currentSetting');

        store.addFilter([
            {'property': 'pcn_product_id', value: currentSetting.get('cst_product')},
            {'property': 'pca_setting', value: currentSetting.get('cst_setting')}
        ]);

        store.load({
            callback: function () {
                me.onLoadProductContent(store);

            }
        });
    },

    configurePanelWithoutSettings: function () {
        var me = this,
            vm = me.getViewModel(),
            currentCatalog = vm.get('currentCatalog'),
            store = vm.getStore('displayContents');

        store.addFilter([
            {'property': 'pcn_product_id', value: currentCatalog.get('id')}
        ]);

        store.load({
            callback: function () {
                me.onLoadProductContent(store);

            }
        });
    },

    onLoadProductContent: function (productContent) {
        var me = this,
            vm = me.getViewModel(),
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid,
            currentSetting = vm.get('currentSetting');

        // Checar se tem as associacoes obrigatorias
        if (productContent.check_ucds()) {
            objectsGrid.reconfigureGrid(productContent);

        } else {
            if (!productContent.check_ucds()) {
                Ext.MessageBox.show({
                    header: false,
                    closable: false,
                    msg: 'It is necessary to make association for property ID, RA and Dec.',
                    buttons: Ext.MessageBox.OKCANCEL ,
                    fn: function (btn) {
                        if (btn === 'ok') {
                            me.showAssociation();
                        } else {
                            me.redirectTo('home');
                        }
                    }
                });
            }
        }
    },

    reloadAssociation: function () {
        var me = this;

        me.loadCurrentSetting();
    },

    onLoadAssociation: function (productAssociation) {
        var me = this,
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid;

        if (productAssociation.count() > 0) {

            objectsGrid.setCatalogClassColumns(productAssociation);
        } else {
            if (!this.winAssociation) {
                me.showAssociation();
            }
        }
    },

    onGridObjectsReady: function () {
        var me = this,
            vm = this.getViewModel(),
            catalog = vm.get('currentCatalog');

        // Filtrar a Store de Objetos
        me.loadObjects(catalog.get('id'));

    },

    loadObjects: function (catalog) {
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('objects'),
            refs = me.getReferences(),
            objectsGrid = refs.targetsObjectsGrid;

        if (catalog) {

            store.getProxy().setExtraParam('product', catalog);

            store.load({
                callback: function (records, operation, success) {

                    // remover a mensagem de load do painel
                    objectsGrid.setLoading(false);

                },
                scope: this
            });
        }
    },

    clearObjects: function () {
        var vm = this.getViewModel(),
            objects = vm.getStore('objects');

        objects.removeAll(true);
        objects.clearFilter(true);
    },

    reloadObjects: function () {
        var me = this,
            vm = me.getViewModel(),
            objects = vm.getStore('objects'),
            catalog = vm.get('catalog');

        me.clearObjects();

        me.loadObjects(catalog);
    },

    onSelectObject: function (selModel, record) {
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            refs = me.getReferences(),
            preview = refs.targetsPreviewPanel,
            catalog = vm.get('currentCatalog');

        // Setar o Objeto Selecionado
        preview.setCurrentRecord(record, catalog);

    },

    onUpdateObject: function (store, record, operation, modifiedFieldNames, details) {
        if (modifiedFieldNames) {
            // Caso o campo alterado seja o reject
            if (modifiedFieldNames.indexOf('_meta_reject') >= 0) {
                this.onRejectTarget(record, store);
            }

            // Caso o campo alterado seja Rating
            if (modifiedFieldNames.indexOf('_meta_rating') >= 0) {
                this.onRatingTarget(record, store);
            }
        }
    },

    onRejectTarget: function (record, store) {
        var me = this,
            view = me.getView().down('targets-objects-grid'),
            reject;

        view.setLoading('Saving...');

        if (!record.get('_meta_reject_id')) {
            // Criar um novo registro de Reject sem ID
            reject = Ext.create('Target.model.Reject', {
                'catalog_id': record.get('_meta_catalog_id'),
                'object_id': record.get('_meta_id'),
                'reject': true
            });

            reject.save({
                callback: function (savedReject, operation, success) {
                    if (success) {
                        // recupera o objeto inserido no banco de dados
                        var obj = Ext.decode(operation.getResponse().responseText);

                        // seta no record da grid o atributo reject_id para que nao seja necessario
                        // o reload da grid
                        record.set('_meta_reject_id', obj.id);

                        store.commitChanges();

                        view.setLoading(false);
                    }
                }
            });

        } else {
            // Se ja tiver o registro de Reject deleta
            reject = Ext.create('Target.model.Reject', {
                'id': record.get('_meta_reject_id')
            });

            reject.erase({
                callback: function (savedReject, operation, success) {
                    if (success) {
                        record.set('_meta_reject_id', null);

                        store.commitChanges();

                        view.setLoading(false);
                    }
                }
            });
        }
    },

    onRatingTarget: function (record, store) {
        var me = this,
            view = me.getView().down('targets-objects-grid'),
            rating;

        view.setLoading('Saving...');

        if (record.get('_meta_rating_id') > 0) {

            // Cria um model com o id que ja existe no banco de dados
            rating = Ext.create('Target.model.Rating', {
                'id': record.get('_meta_rating_id')
            });

            // faz o set no atributo que vai ser feito update
            if (record.get('_meta_rating') > 0) {
                rating.set('rating', record.get('_meta_rating'));

                rating.save({
                    callback: function (savedRating, operation, success) {
                        if (success) {
                            var obj = Ext.decode(operation.getResponse().responseText);

                            record.set('_meta_rating_id', obj.id);

                            store.commitChanges();

                            view.setLoading(false);
                        }
                    }
                });

            } else {
                rating.erase({
                    callback: function (savedRating, operation, success) {
                        if (success) {
                            record.set('_meta_rating_id', null);

                            store.commitChanges();

                            view.setLoading(false);
                        }
                    }
                });

            }

        } else {
            // Criar um novo registro de Rating sem ID
            rating = Ext.create('Target.model.Rating', {
                'catalog_id': record.get('_meta_catalog_id'),
                'object_id': record.get('_meta_id'),
                'rating': record.get('_meta_rating')
            });

            rating.save({
                callback: function (savedRating, operation, success) {
                    if (success) {
                        // recupera o objeto inserido no banco de dados
                        var obj = Ext.decode(operation.getResponse().responseText);

                        // seta no record da grid o atributo rating_id para que nao seja necessario
                        // o reload da grid
                        record.set('_meta_rating_id', obj.id);

                        store.commitChanges();

                        view.setLoading(false);
                    }
                }
            });
        }
    },

    onClickSettings: function () {
        var me = this;

        me.showWizard();
    },

    onChangeInObjects: function (argument) {
        // toda vez que houver uma modificacao no objeto ex. comentarios
        // atualiza a store de objetos
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('objects');

        store.load({
            scope: this,
            callback: function (records, operation, success) {
                // Todo caso seja necessario selecionar o record que estava selecionado antes
            }
        });
    },

    showWizard: function () {
        var me = this,
            vm = me.getViewModel(),
            catalog = vm.get('catalog'),
            currentCatalog = vm.get('currentCatalog'),
            currentSetting = vm.get('currentSetting');

        me.wizard = Ext.create('Ext.window.Window', {
            title: 'Settings',
            layout: 'fit',
            closable: true,
            closeAction: 'destroy',
            width: 880,
            height: 620,
            modal:true,
            items: [{
                xtype: 'targets-wizard',
                product: catalog,
                listeners: {
                    scope: me,
                    finish: 'onFinishWizard',
                    close: 'onFinishWizard'
                }
            }]
        });

        if (currentSetting.get('id') > 0) {
            me.wizard.down('targets-wizard').setCurrentSetting(currentSetting);
        }

        me.wizard.down('targets-wizard').setCurrentCatalog(currentCatalog);

        me.wizard.show();

    },

    onFinishWizard: function () {
        this.wizard.close();

        this.loadCurrentSetting();

    },

    showAssociation: function () {
        var me = this,
            currentCatalog = me.getViewModel().get('currentCatalog');

        me.winAssociation = Ext.create('Ext.window.Window', {
            title: 'Association',
            layout: 'fit',
            closable: true,
            closeAction: 'destroy',
            width: 800,
            height: 620,
            modal:true,
            items: [{
                xtype: 'targets-association',
                listeners: {
                    scope: me,
                    finish: 'onFinishAssociation',
                    close: 'onFinishAssociation',
                    cancel: 'onFinishAssociation'

                }
            }]
        });

        me.winAssociation.down('targets-association').setCatalog(currentCatalog);

        me.winAssociation.show();

    },

    onFinishAssociation: function () {
        var me = this;

        me.onCloseAssociation();

        me.loadCurrentSetting();
    },

    onCloseAssociation: function () {
        var me = this;

        if (me.winAssociation) {
            me.winAssociation.close();
        }
    },

    onBeforeDeactivate: function () {
        var me = this;
        // Fix AlertSetting quando usa funcao voltar do navegador
        if (me.winAlertSetting !== null) {
            me.winAlertSetting.close();
            me.winAlertSetting = null;
        }

        if (me.wizard !== null) {
            me.wizard.close();
            me.wizard = null;
        }
    }

});
