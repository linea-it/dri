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
        'Target.view.catalog.SubmitCutout'
    ],

    listen: {
        component: {
            'targets-objects-panel': {
                beforeLoadPanel: 'onBeforeLoadPanel',
                beforeloadcatalog: 'onBeforeLoadCatalog'
            },
            'targets-objects-tabpanel': {
                select: 'onSelectObject'
            },
            'targets-objects-tiles': {
                select: 'onSelectGroupedTile'
            }
        },
        store: {
            '#catalogColumns': {
                load: 'onLoadCatalogColumns',
                clear: 'onLoadCatalogColumns'
            },
            '#catalogClassColumns': {
                load: 'onLoadCatalogClassColumns',
                clear: 'onLoadCatalogClassColumns'
            },
            '#objects': {
                update: 'onUpdateObject'
            }
        }
    },

    onBeforeLoadPanel: function (catalogId, objectsPanel) {
        var me = this,
            vm = objectsPanel.getViewModel(),
            currentCatalog = vm.get('currentCatalog');

        objectsPanel.setLoading(true);

        currentCatalog.set('id', catalogId);

        currentCatalog.load({
            callback: function (model) {
                objectsPanel.setLoading(false);

                me.onBeforeLoadCatalog(model);
            }
        });

    },

    onBeforeLoadCatalog: function (record) {
        console.log('onBeforeLoadCatalog(%o)', record);
        var me = this,
            vm = me.getViewModel(),
            storeCatalogCollumns = vm.getStore('catalogColumns'),
            storeCatalogClassCollumns = vm.getStore('catalogClassColumns'),
            storeCatalogTiles = vm.getStore('tiles');

        // filtrar as stores de colunas
        storeCatalogCollumns.filter([
            {
                property: 'pcl_product_id',
                value: record.get('id')
            }
        ]);

        // storeCatalogClassCollumns.filter([
        //     {
        //         property: 'catalog_id',
        //         value: record.get('catalog_id')
        //     }
        // ]);

        // Filtrar a lista de Tiles disponiveis no catalogo
        // storeCatalogTiles.filter([
        //     {
        //         property: 'catalog_id',
        //         value: record.get('catalog_id')
        //     }
        // ]);
    },

    // loadCatalog: function (record) {
    //     var me = this,
    //         vm = me.getViewModel(),
    //         refs = me.getReferences(),
    //         grids = refs.targetsGrid,
    //         tbars = grids.getDockedItems('toolbar[dock="top"]'),
    //         btns = tbars[0].items,
    //         catalog;

    //     if (record) {
    //         catalog = record;
    //         vm.set('currentCatalog', catalog);
    //     } else {
    //         catalog = vm.get('currentCatalog');
    //     }

    //     if (catalog.get('catalog_id')) {
    //         // Setar o currentCatalog no viewModel
    //         this.fireEvent('beforeloadcatalog', me, catalog);

    //         // Habilitar os botoes
    //         btns.each(function (button) {
    //             button.enable();
    //         }, this);

    //         // Desabilitar o botao de cutout TEMPORARIO
    //         // this.lookupReference('btnCutout').disable();
    //     }
    // }

    /**
     * Toda Vez que a store catalogColumns e carregada e passado a lista
     * com todas as colunas do catalogo para a grid que contem todas as colunas
     * do catalogo.
     * @param  {Target.store.CatalogColumns} catalogColumns store com todas
     * as colunas do catalog.
     */
    onLoadCatalogColumns: function (catalogColumns) {
        var me = this,
            refs = me.getReferences(),
            objectsTabPanel = refs.targetsObjectsTabpanel;

        objectsTabPanel.setCatalogColumns(catalogColumns);

    },

    onLoadCatalogClassColumns: function (catalogClassColumns) {
        var me = this,
            refs = me.getReferences(),
            objectsTabPanel = refs.targetsObjectsTabpanel,
            preview = refs.targetsPreviewPanel;

        objectsTabPanel.setCatalogClassColumns(catalogClassColumns);

        // Adiciona a store ao painel de preview que sera usada na propertygrid
        // class properties
        preview.setClassColumns(catalogClassColumns);
    },

    onObjectPanelReady: function () {
        // console.log('onObjectPanelReady')
        var me = this,
            vm = this.getViewModel(),
            catalog = vm.get('currentCatalog'),
            release = vm.get('tag_id'),
            field = vm.get('field_id');

        // Filtrar a Store de Objetos
        me.loadObjects(catalog.get('catalog_id'), release,  field);

    },

    loadObjects: function (catalog, release, field, tilename) {
        // console.log('loadObjects(%o, %o, %o, %o)', catalog, release, field, tilename)

        var vm = this.getViewModel(),
            objects = vm.getStore('objects'),
            filters;

        if (catalog) {
            filters = [
                {
                    property: 'catalog_id',
                    value: catalog
                }
            ];

            if ((release > 0) && (field > 0)) {
                filters.push({
                    property: 'tag_id',
                    value: release
                });

                filters.push({
                    property: 'field_id',
                    value: field
                });
            }

            if (tilename) {
                filters.push({
                    property: 'tilename',
                    value: tilename
                });
            }

            objects.filter(filters);
        }
    },

    clearObjects: function () {
        console.log('clearObjects()');

        var vm = this.getViewModel(),
            objects = vm.getStore('objects');

        objects.removeAll(true);
        objects.clearFilter(true);
    },

    reloadObjects: function () {
        var me = this,
            vm = me.getViewModel(),
            objects = vm.getStore('objects'),
            catalog = vm.get('catalog'),
            release = vm.get('tag_id'),
        field = vm.get('field_id');            ;

        me.clearObjects();

        me.loadObjects(catalog, release, field);
    },

    onGroupUngroupByTile: function (btn) {

        var me = this,
            refs = me.getReferences(),
            tabpanel = refs.targetsObjectsTabpanel,
            visible;

        visible = !btn.pressed;

        if (visible) {

            // Alterar o icone do botao
            btn.setIconCls('x-fa fa-indent');

            // reload da store de objetos
            me.reloadObjects();

        } else {
            // Exibicao por Tile

            btn.setIconCls('x-fa fa-dedent');

            // limpar a store de objetos
            me.clearObjects();

        }

        // Mostrar ocultar a coluna tilename na grid
        tabpanel.showHideTilename(visible);
    },

    onSelectGroupedTile: function (rowModel, record) {

        // Filtrar a lista de objetos pelo tilename
        var me = this,
            vm = this.getViewModel(),
            catalog = vm.get('catalog'),
            release = vm.get('tag_id'),
            field = vm.get('field_id'),
            tilename = record.get('tilename');

        me.loadObjects(catalog, release, field, tilename);

    },

    onSelectObject: function (record) {
        // console.log('onSelectObject(%o, %o)', record, panel);

        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            refs = me.getReferences(),
            preview = refs.targetsPreviewPanel;

        // Setar o Objeto Selecionado
        preview.setCurrentRecord(record);

    },

    onUpdateObject: function (store, record, operation, modifiedFieldNames) {
        if (modifiedFieldNames) {
            // Caso o campo alterado seja o reject
            if (modifiedFieldNames.indexOf('reject') >= 0) {
                this.onRejectTarget(record, store);
            }

            // Caso o campo alterado seja Rating
            if (modifiedFieldNames.indexOf('rating') >= 0) {
                this.onRatingTarget(record, store);
            }
        }
    },

    onRejectTarget: function (record, store) {
        // console.log('onRejectTarget(%o, %o)', record, store)

        Ext.Ajax.request({
            url: '/PRJSUB/TargetViewer/setTargetAcceptReject',
            scope: this,
            params: {
                'catalog_id' : record.get('_meta_catalog_id'),
                'reject': record.get('reject'),
                'id_auto': record.get('_meta_id')
            },
            success: function (response) {
                // Recuperar a resposta e fazer o decode no json.
                var obj = Ext.decode(response.responseText);

                if (obj.success !== true) {

                    store.rejectChanges();
                    // Se Model.py retornar alguma falha exibe a mensagem
                    Ext.Msg.alert('Status', obj.msg);
                } else {
                    store.commitChanges();

                    // Mensagem de sucesso
                    Ext.toast({
                        html: 'Changes saved.',
                        align: 't'
                    });
                }
            },
            failure: function (response) {
                //console.log('server-side failure ' + response.status);
                Ext.MessageBox.show({
                    title: 'Server Side Failure',
                    msg: response.status + ' ' + response.statusText,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING
                });
            }
        });
    },

    onRatingTarget: function (record, store) {
        // console.log('onRatingTarget(%o, %o)', record, store)

        Ext.Ajax.request({
            url: '/PRJSUB/TargetViewer/setTargetRating',
            scope: this,
            params: {
                'catalog_id' : record.get('_meta_catalog_id'),
                'rating': record.get('rating'),
                'id_auto': record.get('_meta_id')
            },
            success: function (response) {
                // Recuperar a resposta e fazer o decode no json.
                var obj = Ext.decode(response.responseText);

                if (obj.success !== true) {

                    store.rejectChanges();
                    // Se Model.py retornar alguma falha exibe a mensagem
                    Ext.Msg.alert('Status', obj.msg);
                } else {
                    store.commitChanges();

                    // Mensagem de sucesso
                    Ext.toast({
                        html: 'Changes saved.',
                        align: 't'
                    });
                }

            },
            failure: function (response) {
                //console.log('server-side failure ' + response.status);
                Ext.MessageBox.show({
                    title: 'Server Side Failure',
                    msg: response.status + ' ' + response.statusText,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING
                });
            }
        });
    },

    onClickColumnAssociation: function () {
        // console.log('onClickColumnAssociation(%o)', arguments);

        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            catalog = vm.get('currentCatalog'),
            host = window.location.host;

        // poderia ser feito de maneira mais elegante.
        if (catalog) {
            var url = window.location.protocol + '//' + host + '/PRJSUB/UPTOOL/column_association?id=' + catalog.get('catalog_id') + '&c=' + catalog.get('class_id');

            window.open(url);
        }
    },

    onClickExportCatalog: function () {
        // console.log('onClickExportCatalog()');

        var me = this,
            vm = me.getViewModel(),
            catalog = vm.get('currentCatalog'),
            exportPanel = null;

        this.winExport = Ext.create('Ext.window.Window', {
            title: 'Export Targets',
            layout: 'fit',
            closeAction: 'destroy',
            width: 500,
            height: 400,
            items: [{
                xtype: 'targets-catalog-export',
                record: catalog,
                listeners: {
                    scope: me,
                    submitexport: me.exportCatalog
                }
            }]
        });

        exportPanel = this.winExport.down('targets-catalog-export');
        exportPanel.setCatalog(catalog);

        this.winExport.show();
    },

    exportCatalog: function (catalog, params) {
        // console.log('exportCatalog()');

        this.winExport.close();

        Ext.Msg.alert(
            'Background process.',
            'The creation of the file will be made in background, when finished you will receive an email containing the link to download.'
        );

        Ext.Ajax.request({
            url: '/PRJSUB/TargetViewer/exportCatalogCSV',
            params: {
                // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
                catalog_id: catalog.get('catalog_id'),
                export_params: JSON.stringify(params)
                // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
            },
            success: function (response) {
                // Recuperar a resposta e fazer o decode no json.
                var obj = Ext.decode(response.responseText);

                if (obj.success === false) {
                    Ext.Msg.alert('', obj.msg);
                }
            },
            failure: function (response) {
                // console.log('server-side failure ' + response.status);
                if (response.status !== 0) {
                    Ext.MessageBox.show({
                        title: 'Server Side Failure',
                        msg: response.status + ' ' + response.statusText,
                        buttons: Ext.MessageBox.OK,
                        icon: Ext.MessageBox.WARNING
                    });
                }
            }
        });
    },

    onClickCreateCutout: function () {
        // console.log('onClickCreateCutout()');
        // jscs:disable requireCamelCaseOrUpperCaseIdentifiers
        var me = this,
            view = me.getView(),
            vm = view.getViewModel(),
            catalog = vm.get('currentCatalog'),
            process_id = ((catalog.get('process_id') > 0) ? catalog.get('process_id') : '---'),
            numberObjects = ((catalog.get('num_objects') > 0) ? catalog.get('num_objects') : '---'),
            baseParams = {};

        baseParams = {
            summary:{
                type:[{
                    name: 'Input target catalog',
                    value: catalog.get('catalog_name')
                },{
                    name: 'Parent Process',
                    value: process_id
                },{
                    name: 'Number of Objects',
                    value: '' + numberObjects
                },{
                    name: 'Colors used in RGB',
                    value: 'irg'
                }]
            },
            inputdata:{
                type:'table',
                schema:catalog.get('schema_name'),
                table:catalog.get('table_name')
            }
            // release:{
            //     tag_id: tag_id,
            //     field_id: field_id
            // }
        };
        // console.log('baseParams', '=', baseParams);

        var w = Ext.create('Target.view.catalog.SubmitCutout', {});

        w.on('submitcutout', function (customParams) {

            if (customParams.image.size > 0) {
                baseParams.summary.type.push({
                    name: 'Cutout size',
                    value: customParams.image.size
                });
            }

            var params = Ext.Object.merge(baseParams, customParams);

            me.submitCutoutPypeline(params);

        }, this);

        w.show();

        // jscs:enable requireCamelCaseOrUpperCaseIdentifiers
    },

    submitCutoutPypeline: function (params) {
        // console.log("TargetViewer - submitCutoutPypeline(%o)", params);

        Ext.Ajax.request({
            url: '/PRJSUB/TileViewer/submitCutoutPypeline',
            params: {
                data: JSON.stringify(params)
            },
            success: function (response) {
                // Recuperar a resposta e fazer o decode no json.
                var obj = Ext.decode(response.responseText);

                if (obj.success === true) {
                    msg = 'The cutout process is running in background. You will receive an e-mail  notification  when it is done.  If needed clean the browser cache to load the most recent images.';
                    Ext.Msg.alert('Process Id: ' + obj.process_id, msg);

                } else {
                    Ext.Msg.alert('Sorry!', obj.msg);
                }

            },
            failure: function (response, opts) {
                console.log('server-side failure ' + response.status);
                Ext.MessageBox.show({
                    title: 'Server Side Failure',
                    msg: response.status + ' ' + response.statusText,
                    buttons: Ext.MessageBox.OK,
                    icon: Ext.MessageBox.WARNING
                });
            }
        });
    },

    onChangeInObjects: function (argument) {

        console.log('TESTE');

        // toda vez que houver uma modificacao no objeto ex. comentarios
        // atualiza a store de objetos
        var me = this,
            vm = me.getViewModel(),
            store = vm.getStore('objects');

        console.log('store', '=', store);

        store.load({
            scope: this,
            callback: function (records, operation, success) {
                // Todo caso seja necessario selecionar o record que estava selecionado antes
            }
        });
    },

    onDbClickTarget: function (record) {
        console.log('onDbClickTarget(%o)', record);
        var me = this,
            host = window.location.hostname,
            route = 'ps';

        // sys = Explorer System (cluster objects)
        // ps = Explorer Point Source (single object)

        if (record.get('_meta_is_system') === true) {
            route = 'sys';
        }

        var url = Ext.String.format('http://{0}/static/ws/explorer/index.html#{1}/{2}/{3}',
                host, route, record.get('_meta_catalog_id'), record.get('_meta_id'));

        window.open(url);
    }

});
