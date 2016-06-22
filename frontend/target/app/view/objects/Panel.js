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
        'Target.view.objects.Tiles',
        'Target.view.objects.TabPanel',
        'Target.view.preview.Panel'
    ],

    // controller: 'objects',

    // viewModel: 'objects',

    // config: {
    //     release: null,
    //     field: null,
    //     catalog: null
    // },

    // layout: 'border',

    // items: [
    //     {
    //         region: 'center',
    //         layout: 'border',
    //         reference: 'targetsGrid',
    //         bind: {
    //             title: '{currentCatalog.catalog_name}'
    //         },
    //         items: [
    //             {
    //                 xtype: 'targets-objects-tiles',
    //                 title: 'Grouped by Tile',
    //                 region: 'west',
    //                 width: 250,
    //                 split: true,
    //                 collapsible: true,
    //                 bind: {
    //                     store: '{tiles}',
    //                     hidden: '{!isGrouped.pressed}'
    //                 }
    //             },
    //             {
    //                 xtype: 'targets-objects-tabpanel',
    //                 region: 'center',
    //                 reference: 'targetsObjectsTabpanel',
    //                 listeners: {
    //                     ready: 'onObjectPanelReady',
    //                     rowdblclick: 'onDbClickTarget'
    //                 }
    //             }
    //         ],
    //         tbar: [
    //             {
    //                 tooltip:'Group by tile / Ungroup.',
    //                 enableToggle: true,
    //                 iconCls:'x-fa fa-indent',
    //                 reference: 'isGrouped',
    //                 toggleHandler: 'onGroupUngroupByTile'
    //                 //hidden: true
    //             },
    //             {
    //                 iconCls: 'icon-columns-association',
    //                 tooltip: 'Columns Association',
    //                 handler: 'onClickColumnAssociation',
    //                 disabled: true
    //             },
    //             {
    //                 text: 'Export',
    //                 tooltip: 'Export',
    //                 iconCls: 'x-fa fa-share-square-o',
    //                 handler: 'onClickExportCatalog',
    //                 disabled: true
    //             },
    //             {
    //                 iconCls: 'x-fa fa-image',
    //                 text: 'Cutouts',
    //                 tooltip: 'Create Cutout',
    //                 handler: 'onClickCreateCutout',
    //                 disabled: true,
    //                 reference: 'btnCutout'
    //             }
    //         ]
    //     },
    //     {
    //         xtype: 'targets-preview-panel',
    //         region: 'east',
    //         // title: 'Selected Target',
    //         reference: 'targetsPreviewPanel',
    //         width: 400,
    //         split: true,
    //         // collapsible: true,
    //         resizable: true,
    //         bind: {
    //             release: '{tag_id}',
    //             field: '{field_id}'
    //         },
    //         listeners: {
    //             changeinobject: 'onChangeInObjects'
    //         }
    //     }
    // ],

    loadPanel: function (arguments) {
        console.log('loadPanel(%o)', arguments);

        // var me = this,
        //     vm = this.getViewModel(),
        //     release = me.getRelease(),
        //     field = me.getField(),
        //     catalog = arguments;

        // if (!catalog) {
        //     console.log('Necessario um catalog id.');
        //     return false;
        // }

        // if (catalog != me.getCatalog()) {

        //     // Limpar o painel e as stores antes de carregar um catalogo novo
        //     me.clearPanel();

        //     me.setCatalog(catalog);

        //     vm.set('catalog', catalog);

        //     me.fireEvent('beforeLoadPanel', catalog, me);

        // } else {
        //     console.log('mesmo catalogo');
        // }
    }

    // updatePanel: function (arguments) {

    //     this.loadPanel(arguments);

    // },

    // clearPanel: function () {
    //     // console.log('clearPanel');
    //     var me = this,
    //         vm = me.getViewModel(),
    //         refs = me.getReferences(),
    //         grids = refs.targetsGrid,
    //         preview = refs.targetsPreviewPanel,
    //         tbars = grids.getDockedItems('toolbar[dock="top"]'),
    //         btns = tbars[0].items;

    //     // TODO Limpar as Stores
    //     vm.getStore('objects').removeAll();
    //     // vm.getStore('objects').clearFilter(true);

    //     vm.getStore('tiles').removeAll();
    //     // vm.getStore('tiles').clearFilter(true);

    //     vm.getStore('catalogColumns').removeAll();
    //     // vm.getStore('catalogColumns').clearFilter(true);

    //     vm.getStore('catalogClassColumns').removeAll();
    //     // vm.getStore('catalogClassColumns').clearFilter(true);

    //     // Desabilitar os botoes
    //     btns.each(function (button) {
    //         button.disable();
    //     }, this);

    //     // Limpar o painel de preview
    //     preview.clearPanel();
    // },

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
});

