/**
 *
 */
Ext.define('Target.view.objects.Panel', {
    extend: 'Ext.panel.Panel',

    xtype: 'targets-objects-panel',

    requires: [
        'Ext.layout.container.Border',
        'Ext.layout.container.Accordion',
        'Target.view.objects.ObjectsController',
        'Target.view.objects.ObjectsModel',
        'Target.view.objects.TabPanel',
        'Target.view.preview.Preview'
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
                    // reference: 'targetsGrid',
                    // border: true,
                    // frame: true,
                    // flex: 1,
                    // layout: 'border',
                    // items: [
                    // {
                    xtype: 'targets-objects-grid',
                    border: true,
                    frame: true,
                    flex: 1,
                    // region: 'center',
                    reference: 'targetsObjectsGrid',
                    bind: {
                        store: '{objects}'
                    },
                    listeners: {
                        ready: 'onGridObjectsReady',
                        select: 'onSelectObject'
                    },
                    tbar: [
                        {
                            xtype: 'tbtext',
                            reference: 'txtTargetTitle',
                            html: 'Sample Text Item',
                            cls: 'tb-text-target-title'
                        },
                        '->',
                        {
                            xtype: 'fieldcontainer',
                            layout: 'hbox',
                            defaults: {
                                flex: 1
                            },
                            items: [
                                {
                                    xtype: 'button',
                                    reference: 'btnFilterApply',
                                    iconCls: 'x-fa fa-bolt',
                                    tooltip: 'Apply or Disapply Filters',
                                    pressed: true,
                                    enableToggle: true,
                                    toggleHandler: 'applyDisapplyFilter',
                                    bind: {
                                        disabled: '{!filters}'
                                    }
                                },
                                {
                                    xtype: 'combobox',
                                    reference: 'cmbFilterSet',
                                    emptyText: 'No filter',
                                    displayField: 'fst_name',
                                    publishes: 'id',
                                    bind: {
                                        store: '{filterSets}',
                                        selection: '{filterSet}'
                                    },
                                    listeners: {
                                        select: 'onSelectFilterSet'
                                    },
                                    triggers: {
                                        clear: {
                                            cls: 'x-form-clear-trigger',
                                            handler: 'onClearCmbFilterSet',
                                            hidden: true
                                        }
                                    },
                                    minChars: 0,
                                    queryMode: 'local',
                                    editable: false
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
                        // Ext.create('Ext.PagingToolbar', {
                        //     reference: 'pagingtoolbar',
                        //     bind: {
                        //         store: '{objects}'
                        //     },
                        //     displayInfo: true,
                        //     displayMsg: 'Displaying {0} - {1} of {2}',
                        //     emptyMsg: 'No data to display'
                        // })
                    ]
                    // },
                    // ]
                },
        {
            xtype: 'targets-preview',
            reference: 'targetsPreviewPanel',
            flex: 1,
            border: true,
            frame: true,
            split: true,
            // width: 500,
            // resizable: true,
            listeners: {
                changeinobject: 'onChangeInObjects'
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
                if (currentSetting.get('cst_product') != currentCatalog.get('id')) {

                    vm.set('catalog', catalog_id);

                    me.fireEvent('beforeLoadPanel', catalog_id, me);
                }
            }
        }
    },

    setCurrentCatalog: function (catalog) {
        var me = this,
            // gridPanel = me.down('targets-objects-grid'),
            txtTargetTitle = me.lookup('txtTargetTitle'),
            title = '';

        if (catalog.get('id') > 0) {
            title = Ext.String.format('{0} - {1}', catalog.get('pcl_display_name'), catalog.get('prd_display_name'));

            // gridPanel.setTitle(title);
            txtTargetTitle.setHtml(title);

        }
    },

    clearPanel: function () {
        var me = this,
            vm = me.getViewModel(),
            gridPanel = me.down('targets-objects-grid');
        //         refs = me.getReferences(),
        //         grids = refs.targetsGrid,
        //         preview = refs.targetsPreviewPanel;

        gridPanel.setTitle('loading...');

        vm.getStore('catalogs').removeAll();
        vm.getStore('catalogs').clearFilter(true);

        vm.getStore('objects').removeAll();
        vm.getStore('objects').clearFilter(true);

        vm.getStore('currentSettings').removeAll();
        vm.getStore('currentSettings').clearFilter(true);

        vm.getStore('displayContents').removeAll();
        vm.getStore('displayContents').clearFilter(true);

        // // Desabilitar os botoes
        // btns.each(function (button) {
        //     button.disable();
        // }, this);

        //     // Limpar o painel de preview
        //     preview.clearPanel();
    }
});

