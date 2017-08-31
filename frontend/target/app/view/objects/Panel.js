/**
 *
 */
Ext.define('Target.view.objects.Panel', {
    extend: 'Ext.panel.Panel',

    xtype: 'targets-objects-panel',

    requires: [
        'Ext.layout.container.Border',
        'Target.view.objects.ObjectsController',
        'Target.view.objects.ObjectsModel',
        'Target.view.objects.TabPanel',
        'Target.view.preview.Preview',
        'Target.view.objects.Mosaic',
        'Ext.layout.container.Card'
    ],

    controller: 'objects',

    viewModel: 'objects',

    config: {
        catalog: null,
        currentCatalog: null
    },

    layout: {
        type: 'hbox',
        pack: 'start',
        align: 'stretch'
    },

    bind: {
        currentCatalog: '{currentCatalog}'
    },

    items: [
        {
            xtype: 'panel',
            layout: 'card',
            reference: 'ObjectCardPanel',
            flex: 1,
            border: true,
            frame: true,
            dockedItems: [{
                dock: 'top',
                xtype: 'toolbar',
                overflowHandler: 'scroller',
                items: [
                    {
                        xtype: 'tbtext',
                        reference: 'txtTargetTitle',
                        html: 'Sample Text Item',
                        cls: 'tb-text-target-title'

                    },
                    '->',
                    {
                        xtype: 'button',
                        iconCls: 'x-fa fa-floppy-o',
                        tooltip: 'Save As',
                        handler: 'onClickSaveAs',
                        bind: {
                            disabled: '{!haveResults}'
                        }
                    },
                    {
                        iconCls: 'x-fa fa-download',
                        tooltip: 'Download',
                        handler: 'onClickDownload',
                        bind: {
                            disabled: '{!haveResults}'
                        }
                    },
                    {
                        xtype: 'button',
                        iconCls: 'x-fa fa-commenting',
                        tooltip: 'Open Comments',
                        bind: {
                            disabled: '{!targetsObjectsGrid.selection}'
                        },
                        handler: 'onCommentButton'
                    },
                    {
                        iconCls: 'x-fa fa-picture-o',
                        tooltip: 'Create Mosaic',
                        handler: 'onClickCreateCutouts'
                    },
                    {
                        xtype: 'button',
                        reference: 'BtnSwitchMosaic',
                        iconCls: 'x-fa fa-th-large',
                        tooltip: 'Switching between Mosaic and Data Grid',
                        enableToggle: true,
                        toggleHandler: 'switchMosaicGrid',
                        bind: {
                            pressed: '{mosaic_is_visible}'
                        }
                    },
                    {
                        xtype: 'fieldcontainer',
                        layout: 'hbox',
                        defaults: {
                            flex: 1
                        },
                        items: [
                            {
                                xtype    : 'textfield',
                                reference: 'txtFilterSet',
                                emptyText: 'No filter',
                                editable : false
                            }
                        ]
                    },
                    {
                        xtype: 'button',
                        iconCls: 'x-fa fa-filter',
                        tooltip: 'Filters',
                        handler: 'onClickFilter'
                    },
                    {
                        xtype: 'button',
                        iconCls: 'x-fa fa-gear',
                        tooltip: 'Settings',
                        handler: 'onClickSettings'
                    }
                ]
            }],

            items: [
                {
                    xtype: 'targets-objects-grid',
                    reference: 'targetsObjectsGrid',
                    bind: {
                        store: '{objects}'
                    },
                    listeners: {
                        ready: 'onGridObjectsReady',
                        select: 'onSelectObject'
                    }
                },
                {
                    xtype: 'targets-objects-mosaic',
                    reference: 'TargetMosaic',
                    bind: {
                        store: '{objects}'
                    },
                    listeners: {
                        select: 'onSelectObject',
                        itemdblclick: 'onCutoutDblClick'
                    },
                    tbar: [
                        {
                            xtype: 'combobox',
                            reference: 'cmbCutoutJob',
                            emptyText: 'Choose Cutout',
                            displayField: 'cjb_display_name',
                            store: {
                                type: 'cutoutjobs'
                            },
                            listeners: {
                                select: 'onSelectCutoutJob'
                            },
                            editable: false
                        },
                        {
                            xtype: 'button',
                            iconCls: 'x-fa fa-info',
                            tooltip: 'Information about mosaic',
                            handler: 'onClickInfoCutoutJob',
                            bind: {
                                disabled: '{!cmbCutoutJob.selection}'
                            }
                        }
                    ]
                }
            ],
            bbar: [
                {
                    xtype: 'pagingtoolbar',
                    reference: 'pagingtoolbar',
                    bind: {
                        store: '{objects}'
                    },
                    displayInfo: true,
                    displayMsg: 'Displaying {0} - {1} of {2}',
                    emptyMsg: 'No data to display'

                }
            ]
        },
        {
            xtype: 'targets-preview',
            reference: 'targetsPreviewPanel',
            flex: 1,
            border: true,
            frame: true,
            split: true,
            listeners: {
                changeinobject: 'onChangeInObjects',
                loadobjects: 'onLoadObjects'
            }
        }
    ],

    loadPanel: function (arguments) {
        var me = this,
            vm = this.getViewModel(),
            catalog = me.getCatalog();

        if (!catalog) {
            console.log('Necessario um catalog id.');
            return false;
        }

        // Limpar o painel e as stores antes de carregar um catalogo novo
        me.clearPanel();

        vm.set('catalog', catalog);

        me.fireEvent('beforeLoadPanel', catalog, me);

    },

    updatePanel: function (arguments) {
        var me = this,
            vm = this.getViewModel(),
            // catalog = me.getCatalog(),
            catalog = vm.get('catalog'),
            currentSetting = vm.get('currentSetting'),
            currentCatalog = vm.get('currentCatalog'),
            catalog_id;

        if (arguments.length >= 2) {
            catalog_id = arguments[1];

            if (catalog != catalog_id) {
                // Limpar o painel e as stores antes de carregar um catalogo novo
                me.clearPanel();

                vm.set('catalog', catalog_id);

                me.fireEvent('beforeLoadPanel', catalog_id, me);

            } else {
                // O mesmo catalogo foi aberto
                // nao fazer nada deixar como estava,
                // mas verificar se tem alguma setting selecionada caso nao tenha tratar como um catalogo novo
                if ((currentSetting) && (currentSetting.get('id') > 0)) {
                    if (currentSetting.get('cst_product') != currentCatalog.get('id')) {
                        vm.set('catalog', catalog_id);

                        me.fireEvent('beforeLoadPanel', catalog_id, me);
                    }
                }
            }
        }
    },

    setCurrentCatalog: function (catalog) {
        var me = this,
            txtTargetTitle = me.lookup('txtTargetTitle'),
            title = '';

        if (catalog.get('id') > 0) {
            title = Ext.String.format('{0} - {1}', catalog.get('pcl_display_name'), catalog.get('prd_display_name'));

            if (title.length > 30) {
                title = catalog.get('prd_display_name');
            }

            txtTargetTitle.setHtml(title);

        }
    },

    clearPanel: function () {
        var me = this,
            vm = me.getViewModel(),
            gridPanel = me.down('targets-objects-grid'),
            cardPanel = me.lookup('ObjectCardPanel'),
            combo = me.lookup('cmbCutoutJob'),
            btn = me.lookup('BtnSwitchMosaic'),
            mosaic = me.lookup('TargetMosaic'),
            cutoutjobs = combo.getStore(),
            cutouts = vm.getStore('cutouts'),
            txtFilterSet = me.lookup('txtFilterSet'),
            displayContents = vm.getStore('displayContents'),
            filterset;

        // Limpar as Stores
        vm.getStore('catalogs').removeAll();
        vm.getStore('catalogs').clearFilter(true);

        vm.getStore('objects').removeAll();
        vm.getStore('objects').clearFilter(true);

        vm.getStore('currentSettings').removeAll();
        vm.getStore('currentSettings').clearFilter(true);

        // Limpar a Grid
        displayContents.removeAll();
        displayContents.clearFilter(true);
        gridPanel.reconfigureGrid(displayContents, true);

        // Mosaic / Cutouts
        cutoutjobs.removeAll();
        cutoutjobs.clearFilter(true);

        cutouts.removeAll();
        cutouts.clearFilter(true);
        mosaic.removeAll(true);

        if (combo.selection !== null) {
            combo.reset();
        }

        // Ativar o painel list como default
        btn.setPressed(false);

        // Filtros
        filterset = Ext.create('Target.model.FilterSet',{});
        vm.set('filterSet', filterset);
        vm.set('filters', null);

        vm.getStore('filterConditions').removeAll();
        vm.getStore('filterConditions').clearFilter(true);

        vm.getStore('filterSets').removeAll();
        vm.getStore('filterSets').clearFilter(true);

        txtFilterSet.reset();

        me.activeFilter = null;

    }
});
