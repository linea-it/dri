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
            reference: 'targetsGrid',
            flex: 1,
            layout: 'border',
            items: [
               {
                    xtype: 'targets-objects-grid',
                    region: 'center',
                    reference: 'targetsObjectsGrid',
                    bind: {
                        store: '{objects}'
                    },
                    listeners: {
                        ready: 'onGridObjectsReady',
                        select: 'onSelectObject'
                    },
                    tools:[
                        {
                            type: 'gear',
                            tooltip: 'Settings',
                            callback: 'onClickSettings'
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
                }
            ]
        },
        {
            xtype: 'targets-preview',
            reference: 'targetsPreviewPanel',
            flex: 1,
            // width: 500,
            split: true,
            resizable: true,
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
            gridPanel = me.down('targets-objects-grid'),
            title = '';

        if (catalog.get('id') > 0) {
            title = Ext.String.format('{0} - {1}', catalog.get('pcl_display_name'), catalog.get('prd_display_name'));

            gridPanel.setTitle(title);

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

