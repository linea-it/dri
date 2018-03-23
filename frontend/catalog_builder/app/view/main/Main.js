Ext.define('CatalogBuilder.view.main.Main', {
    extend: 'Ext.container.Container',
    xtype: 'app-main',

    requires: [
        'Ext.app.ViewModel',
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',
        'Ext.window.Toast',

        'CatalogBuilder.view.main.MainController',
        'CatalogBuilder.view.main.MainModel',

        'common.header.Toolbar',
        'common.footer.Footer'
    ],

    controller: 'main',
    viewModel: 'main',

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    bind: {
        hidden: '{!initialized}'
    },

    items: [
        //header bar
        {
            xtype: 'dri-header'
        },

        // toolbar
        {
            xtype: 'toolbar',
            region: 'north',
            items: [
                {
                    xtype: 'button',
                    tooltip: 'Clear Query',
                    handler: 'btnClear_onClick',
                    iconCls: 'x-fa fa-file-o'
                },
                {
                    xtype: 'button', // 'splitbutton',
                    tooltip: 'Save Query',
                    disabled: true,
                    reference: 'btnSave',
                    iconCls: 'x-fa fa-floppy-o',
                    handler: 'btnSave_onClick'
                },
                {
                    xtype: 'button',
                    tooltip: 'Execute Query',
                    reference: 'btnStartJob',
                    disabled: true,
                    handler: 'btnStartJob_onClick',
                    iconCls: 'x-fa fa-play'
                }
            ]
        },

        // client area
        {
            xtype: 'container',
            reference: 'ctnArea',
            flex: 1,
            bodyPadding: 15,
            layout: 'border',
            items: [
                // left panel
                {
                    xtype: 'panel',
                    reference: 'pnlRelease',
                    region: 'west',
                    split: true,
                    width: 300,
                    minWidth: 100,
                    header: {
                        xtype: 'header',
                        titlePosition: 0,
                        title: 'Release: ',
                        padding: '6',
                        items: [
                            {
                                xtype:'container',
                                layout:'hbox',
                                width: '100%',
                                items:[
                                    {
                                        xtype:'label',
                                        html:'<div style="padding-top:2px;">Release: </div>'
                                    },
                                    {
                                        xtype: 'combobox',  // or use Ext.create('class') instead of lazy instantiation
                                        reference: 'cmbReleases',
                                        flex:1,
                                        displayField: 'release_display_name',
                                        editable: false,
                                        queryMode: 'local',
                                        valueField: 'release_id',
                                        emptyText: 'Select Release',
                                        listeners:{
                                            select: 'cmbReleases_onSelect'
                                        }
                                    }
                                ]
                            }]
                    },
                    bind: {
                        //title: '{activeRelease.display}'
                    },
                    layout: 'border',
                    items: [
                        {
                            xtype: 'panel',
                            region: 'center',
                            layout: {
                                type: 'accordion',
                                titleCollapse: true,
                                animate: true
                            },
                            items:[
                                // tables of release
                                {
                                    title: 'Region Selection',
                                    layout: 'fit',
                                    listeners:{
                                        // collapse: 'accInputTable_onCollapse'
                                    },
                                    items: [{
                                        xtype: 'treepanel',
                                        reference: 'tvwInputTables',
                                        rootVisible: false,
                                        root: {
                                            text: 'Root',
                                            expanded: true,
                                            children: [
                                                {
                                                    text: 'Map Resolution', 
                                                    leaf: true,
                                                    properties:  [{
                                                        xtype: 'numberfield',
                                                        name: 'map_resolution',
                                                        fieldLabel: 'HEALPix Map Resolution',
                                                        value: 4096,
                                                        maxValue: 4096,
                                                        minValue: 10
                                                    }]
                                                },
                                                {
                                                    text: 'Mangle Detfrac Map',
                                                    leaf: true,
                                                    properties: [
                                                        {
                                                            xtype: 'numberfield',
                                                            name: 'g'
                                                        },
                                                        {
                                                            xtype: 'numberfield',
                                                            name: 'r'
                                                        },
                                                        {
                                                            xtype: 'numberfield',
                                                            name: 'i',
                                                            value: 0.8
                                                        },
                                                        {
                                                            xtype: 'numberfield',
                                                            name: 'z'
                                                        },
                                                        {
                                                            xtype: 'numberfield',
                                                            name: 'Y'
                                                        },
                                                        {
                                                            xtype: 'combobox',
                                                            name: 'reference_band',
                                                            fieldLabel: 'Reference band to report area',
                                                            value: 'i',
                                                            data: ['g', 'r', 'i', 'z', 'Y']
                                                        }
                                                    ]
                                                },
                                                {
                                                    text: 'Bad Regions Mask', leaf: true
                                                },
                                                {
                                                    text: 'Depth Map', leaf: true
                                                },
                                                {
                                                    text: 'Systematic Maps - Min,Max', leaf: true
                                                },
                                                {
                                                    text: 'Additional Mask', leaf: true
                                                }
                                            ]
                                        },
                                        listeners: {
                                            selectionchange: 'treeView_onSelectionChange',
                                            // itemexpand: 'tvwInputTables_onExpanded',
                                            itemcontextmenu: 'treeView_onContextMenu',
                                            custom_itemcontextmenu: 'treeView_onContextMenu'               
                                        },
                                        viewConfig: {
                                            plugins: {
                                                ptype: 'treeviewdragdrop',
                                                enableDrag: true,
                                                enableDrop: false,
                                                ddGroup: 'TreeDD'
                                            }
                                        },
                                        contextMenuItems: [
                                            {text: 'Content', itemId:'preview', handler:'tvwInputTables_onContextMenuClick'}
                                        ]
                                    }]
                                },

                                // tables of external catalog
                                {title: 'Object Selection', layout:'fit', reference:'accExternalCatalog',
                                    listeners:{
                                        // expand: 'accExternalCatalog_onExpand',
                                        // collapse: 'accExternalCatalog_onCollapse'
                                    },
                                    items:[
                                        {
                                            xtype: 'treepanel',
                                            reference: 'tvwExternalCatalog',
                                            rootVisible:false,
                                            root: {
                                                text: 'Root',
                                                expanded: true,
                                                children: [
                                                    {
                                                        text: 'Magnitude Type', leaf: true
                                                    },
                                                    {
                                                        text: 'Signal-to-noise cuts', leaf: true
                                                    },
                                                    {
                                                        text: 'Bright magnitude cuts', leaf: true
                                                    },
                                                    {
                                                        text: 'Magnitude limit cuts', leaf: true
                                                    },
                                                    {
                                                        text: 'Color cuts', leaf: true
                                                    },
                                                    {
                                                        text: 'Mangle Bitmask', leaf: true
                                                    },
                                                    {
                                                        text: 'Sextractor reference bands', leaf: true
                                                    },
                                                    {
                                                        text: 'Niter Model greater than zero', leaf: true
                                                    },
                                                    {
                                                        text: 'Photo z', leaf: true
                                                    }
                                                ]
                                            },
                                            viewConfig: {
                                                plugins: {
                                                    ptype: 'treeviewdragdrop',
                                                    enableDrag: true,
                                                    enableDrop: false,
                                                    ddGroup: 'TreeDD'
                                                }
                                            },
                                            contextMenuItems: [
                                                {text: 'Content', itemId:'preview', handler:'tvwExternalCatalog_onContextMenuClick'}
                                            ],
                                            listeners:{
                                                itemcontextmenu: 'treeView_onContextMenu',
                                                // itemexpand: 'tvwExternalCatalog_onExpanded'
                                            }
                                        }
                                    ]
                                },

                                // tables of user
                                {
                                    title: 'Columns Selection',
                                    layout: 'fit',
                                    reference: 'accMyTables',
                                    listeners:{
                                        // expand: 'accMyTables_onExpand',
                                        // collapse: 'accMyTables_onCollapse'
                                    },
                                    items: [{
                                        xtype: 'treepanel',
                                        reference: 'tvwMyTables',
                                        rootVisible: false,
                                        root: {
                                            text: 'Root',
                                            expanded: true,
                                            children: [
                                                {
                                                    text: 'System Default', leaf: true
                                                },
                                                {
                                                    text: 'Photometric correction', leaf: true
                                                },
                                                {
                                                    text: 'Depth Maps', leaf: true
                                                },
                                                {
                                                    text: 'Systematic Maps', leaf: true
                                                }
                                            ]
                                        },
                                        viewConfig: {
                                            plugins: {
                                                ptype: 'treeviewdragdrop',
                                                enableDrag: true,
                                                enableDrop: false,
                                                ddGroup: 'TreeDD'
                                            }
                                        },
                                        contextMenuItems: [
                                            {text: 'Rename',  itemId:'rename',  handler:'tvwMyTables_onContextMenuClick'},
                                            {text: 'Content', itemId:'preview', handler:'tvwMyTables_onContextMenuClick'},
                                            {text: 'Download',itemId:'download', handler:'tvwMyTables_onContextMenuClick'},
                                            '-',
                                            {text: 'Delete',  itemId:'delete',  handler:'tvwMyTables_onContextMenuClick'},
                                            '-',
                                            {text: 'View',  itemId:'target',  handler:'tvwMyTables_onContextMenuClick',
                                                config_item: function(item, record){ 
                                                    item.disabled = record.product_id ? false : true;
                                                }
                                            }
                                        ],
                                        listeners:{
                                            itemcontextmenu: 'treeView_onContextMenu',
                                            // itemexpand: 'tvwMyTables_onExpanded'
                                        }
                                    }]
                                }
                            ]
                        },
                        {
                            xtype: 'panel',
                            region: 'south',
                            split: true,
                            height: 200,
                            layout: {
                                type: 'accordion',
                                titleCollapse: true,
                                animate: true
                            },
                            items:[
                                // queries of user
                                {
                                    title: 'My Catalogs',
                                    layout: 'fit',
                                    reference: 'accMyQueries',
                                    items: [{
                                        xtype: 'treepanel',
                                        reference: 'tvwMyQueries',
                                        rootVisible: false,
                                        listeners: {
                                            beforeselect: 'tvwMyQueries_onBeforeSelect',
                                            select: 'tvwMyQueries_onSelect',
                                            itemcontextmenu: 'treeView_onContextMenu'
                                        },
                                        contextMenuItems: [
                                            {text: 'Rename',  itemId:'rename',  handler:'tvwMyQueries_onContextMenuClick'},
                                            {text: 'Delete',  itemId:'delete',  handler:'tvwMyQueries_onContextMenuClick'}
                                        ]
                                    }],
                                    listeners:{
                                        // expand: 'accMyQueries_onExpand'
                                    }
                                }                                
                            ]
                        }
                    ]
                },

                // center panel (form / tabs)
                {
                    xtype: 'panel',
                    region: 'center',
                    layout: 'border',
                    items: [
                        
                        {
                            xtype: 'panel',
                            region: 'center',
                            layout: 'border',
                            items: [
                                {
                                    xtype: 'panel',
                                    region: 'west',
                                    bind:{
                                        title: '{properties_title}',
                                    },
                                    width: 400,
                                    split: true,
                                    items: [
                                        {
                                            xtype: 'form',
                                            reference: 'frmProperties',
                                            region: 'center',
                                            layout: 'vbox',
                                            bodyPadding: 10,
                                            defaults: {
                                                listeners: {
                                                    change: 'form_onDataChange'
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    xtype: 'panel',
                                    region: 'center', //east
                                    title: 'Definition',
                                    layout: 'border',
                                    items: [
                                        {
                                            xtype:'form',
                                            region: 'center', // 'north',
                                            bodyPadding: 10,
                                            items:[
                                                {
                                                    xtype: 'textfield',
                                                    fieldLabel: 'Name',
                                                    name: 'name'
                                                },
                                                {
                                                    xtype: 'textfield',
                                                    fieldLabel: 'Description',
                                                    name: 'description',
                                                    width: '100%'
                                                },
                                                {
                                                    xtype     : 'checkboxfield',
                                                    boxLabel  : 'Query Builder',
                                                    name      : 'topping',
                                                    inputValue: '1'
                                                }, 
                                                {
                                                    xtype     : 'checkboxfield',
                                                    boxLabel  : 'Catalog Properties',
                                                    name      : 'topping',
                                                    inputValue: '2',
                                                    checked   : true
                                                }
                                            ]
                                        }
                                        // ,
                                        // {
                                        //     xtype: 'grid',
                                        //     store: Ext.create('Ext.data.Store'),
                                        //     reference: 'grdOperations',
                                        //     title: 'Defined Operations',
                                        //     region: 'center',
                                        //     columns: [
                                        //         { text: 'Group',  dataIndex: 'group', width: 200 },
                                        //         { text: 'Operation', dataIndex: 'operation', width: 250 }
                                        //     ],
                                        //     layout: 'fit'
                                        // }
                                    ]
                                }
                            ]

                        },
                        
                        // tabs panel
                        {
                            xtype: 'tabpanel',
                            region: 'south',
                            reference: 'tabBottom',
                            split: true,
                            height: 200,
                            fullScreen: 'fit',
                            cls: 'preview-tabs',
                            defaults:{
                                layout: 'fit',
                            },
                            items:[                               
                                {
                                    title: 'My JOBs',
                                    listeners:{
                                        // activate: 'tabMyJobs_onActivate'
                                    },
                                    items:[
                                        {
                                            xtype: 'grid',
                                            reference: 'grdJobs',
                                            store: Ext.create('Ext.data.Store'),
                                            viewConfig: { 
                                                //stripeRows: false, 
                                                getRowClass: function(record) { 
                                                    return record.get('row_cls') || 'row-cls'; 
                                                } 
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                    ]
                }
            ]
        },

        // footer bar
        {
            xtype: 'dri-footer'
        }
    ]
});