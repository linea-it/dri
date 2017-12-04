Ext.define('UserQuery.view.main.Main', {
    extend: 'Ext.container.Container',
    xtype: 'app-main',

    requires: [
        'Ext.app.ViewModel',
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',
        'Ext.window.Toast',

        'UserQuery.view.main.MainController',
        'UserQuery.view.main.MainModel',

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
                // {
                //     xtype: 'button',
                //     tooltip: 'New',
                //     handler: 'btnNew_onClick',
                //     iconCls: 'x-fa fa-file-o',
                //     // menu: {xtype: 'menu', plain: true, items: {
                //     //     xtype: 'button',
                //     //     text: 'User options',
                //     //     handler: 'onBtnNew_Click'
                //     // }}
                // },
                {
                    xtype: 'button',
                    tooltip: 'Clear Query',
                    handler: 'btnClear_onClick',
                    iconCls: 'x-fa fa-file-o',
                    // menu: {xtype: 'menu', plain: true, items: {
                    //     xtype: 'button',
                    //     text: 'User options',
                    //     handler: 'onBtnNew_Click'
                    // }}
                },
                // {
                //     xtype: 'button',
                //     tooltip: 'Open',
                //     handler: 'btnOpen_onClick',
                //     iconCls: 'x-fa fa-folder-open'
                // },
                '-',
                {
                    xtype: 'button',
                    tooltip: 'Delete',
                    disabled: true,
                    bind: {
                        disabled: '{!activeQuery.exist}'
                    },
                    handler: 'btnDelete_onClick',
                    iconCls: 'x-fa fa-trash-o'
                },
                '-',
                {
                    xtype: 'splitbutton',
                    tooltip: 'Save',
                    disabled: true,
                    reference: 'btnSave',
                    iconCls: 'x-fa fa-floppy-o',
                    handler: 'btnSave_onClick',
                    menu: {xtype: 'menu', plain: true, items: {
                        text: 'Save As',
                        handler: 'mnuSaveAs_onClick'
                    }}
                },
                {
                    xtype: 'button',
                    tooltip: 'Start Job',
                    disabled: true,
                    bind: {
                        disabled: '{!activeQuery.exist}'
                    },
                    handler: 'btnStartJob_onClick',
                    iconCls: 'x-fa fa-play'
                },
                // '->',
                // {xtype: 'button', text:'My Jobs', tooltip:'My Jobs', iconCls: 'x-fa fa-info-circle'}
            ]
        },

        // client area
        {
            xtype: 'container',
            reference: 'ctnArea',
            flex: 1,
            bodyPadding: 15,
            style: {
                opacity: '0'
            },
            layout: 'border',
            items: [
                // accordion
                {
                    xtype: 'panel',
                    reference: 'pnlRelease',
                    region: 'west',
                    split: true,
                    width: 300,
                    minWidth: 100,
                    // tools: [{
                    //     type: 'down',
                    //     tooltip: 'Change Release',
                    //     handler: 'pnlLeftToolDown_onClick'
                    // }],
                    header: {
                        xtype: 'header',
                        titlePosition: 0,
                        padding: '6',
                        items: [{
                            xtype: 'combobox',  // or use Ext.create('class') instead of lazy instantiation
                            reference: 'cmbReleases',
                            width: '100%',
                            displayField: 'rls_display_name',
                            editable: false,
                            queryMode: 'local',
                            valueField: 'id',
                            emptyText: 'Select Release',
                            listeners:{
                                select: 'cmbReleases_onSelect'
                            }
                        }]
                    },
                    bind: {
                        //title: '{activeRelease.display}'
                    },
                    layout: {
                        type: 'accordion',
                        titleCollapse: false,
                        animate: true
                    },
                    items: [
                        // tables of release
                        {
                            title: 'Input Tables',
                            layout: 'fit',
                            items: [{
                                xtype: 'treepanel',
                                reference: 'tvwInputTables',
                                rootVisible: false,
                                listeners: {
                                    itemexpand: 'tvwInputTables_onExpanded',
                                    itemcontextmenu: 'treeView_onContextMenu'                                    
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
                                    {text: 'Preview', itemId:'preview', handler:'tvwInputTables_onContextMenuClick'}
                                ]
                            }]
                        },

                        // tables of external catalog
                        {title: 'External Tables', layout:'fit', reference:'accExternalCatalog',
                            listeners:{
                                expand: 'accExternalCatalog_onExpand'
                            },
                            items:[
                                {
                                    xtype: 'treepanel',
                                    reference: 'tvwExternalCatalog',
                                    rootVisible:false,
                                    viewConfig: {
                                        plugins: {
                                            ptype: 'treeviewdragdrop',
                                            enableDrag: true,
                                            enableDrop: false,
                                            ddGroup: 'TreeDD'
                                        }
                                    },
                                    contextMenuItems: [
                                        {text: 'Preview', itemId:'preview', handler:'tvwExternalCatalog_onContextMenuClick'}
                                    ],
                                    listeners:{
                                        itemcontextmenu: 'treeView_onContextMenu',
                                        itemexpand: 'tvwExternalCatalog_onExpanded'
                                    }
                                }
                            ]
                        },

                        // tables of user
                        {
                            title: 'My Tables',
                            layout: 'fit',
                            reference: 'accMyTables',
                            listeners:{
                                expand: 'accMyTables_onExpand'
                            },
                            items: [{
                                xtype: 'treepanel',
                                reference: 'tvwMyTables',
                                rootVisible: false,
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
                                    {text: 'Preview', itemId:'preview', handler:'tvwMyTables_onContextMenuClick'},
                                    {text: 'Delete',  itemId:'delete',  handler:'tvwMyTables_onContextMenuClick'},
                                    '-',
                                    {text: 'Target',  itemId:'target',  handler:'tvwMyTables_onContextMenuClick',
                                        config: function(item, record){ 
                                            item.disabled = record.get('data_product_id') ? false : true;
                                        }
                                    }
                                ],
                                listeners:{
                                    itemcontextmenu: 'treeView_onContextMenu',
                                    itemexpand: 'tvwMyTables_onExpanded'
                                }
                            }]
                        },

                        // outers tables
                        {title: 'Other Tables', layout:'fit', reference:'accOtherTables',
                            listeners:{
                                expand: 'accOtherTables_onExpand'
                            },
                            items:[
                                {
                                    xtype: 'treepanel',
                                    reference: 'tvwOtherTables',
                                    rootVisible:false,
                                    listeners:{
                                        itemexpand: 'tvwOtherTables_onExpanded',
                                        itemcontextmenu: 'treeView_onContextMenu'
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
                                        {text: 'Preview', itemId:'preview', handler:'tvwOtherTables_onContextMenuClick'}
                                    ]

                                }
                            ]
                        },

                        // queries of user
                        {
                            title: 'My Queries',
                            layout: 'fit',
                            reference: 'accMyQueries',
                            items: [{
                                xtype: 'treepanel',
                                reference: 'tvwMyQueries',
                                rootVisible: false,
                                listeners: {
                                    select: 'tvwMyQueries_onSelect',
                                    itemcontextmenu: 'treeView_onContextMenu'
                                },
                                contextMenuItems: [
                                    {text: 'Rename',  itemId:'rename',  handler:'tvwMyQueries_onContextMenuClick'},
                                    {text: 'Delete',  itemId:'delete',  handler:'tvwMyQueries_onContextMenuClick'}
                                ]
                            }],
                            listeners:{
                                expand: 'accMyQueries_onExpand'
                            }
                        },

                        // samples queries
                        {
                            title: 'Sample Queries',
                            layout: 'fit',
                            reference: 'accSampleQueries',
                            listeners:{
                                expand: 'accSampleQueries_onExpand'
                            },
                            items: [{
                                xtype: 'treepanel',
                                reference: 'tvwSampleQueries',
                                rootVisible: false,
                                // listeners: {
                                //     select: 'tvwSampleQueries_onSelect'
                                // }
                            }]
                        }
                    ]
                },

                // center panel (form / tabs)
                {
                    xtype: 'panel',
                    region: 'center',
                    bind: {
                        title: 'Query Definition' // '{activeQuery.name}'
                    },
                    layout: 'border',
                    items: [
                        // form
                        {
                            xtype: 'form',
                            reference: 'frmQuery',
                            region: 'center',
                            layout: 'vbox',
                            bodyPadding: 15,
                            defaults: {
                                listeners: {
                                    change: 'form_onDataChange'
                                }
                            },
                            items: [{
                                    xtype: 'textfield',
                                    fieldLabel: 'Name* ',
                                    name: 'name',
                                    reference: 'name',
                                    width: '100%'
                                },
                                {
                                    xtype: 'textfield',
                                    fieldLabel: 'Description',
                                    name: 'description',
                                    width: '100%'
                                },
                                {
                                    xtype: 'textareafield',
                                    fieldLabel: 'SQL Sentence* ',
                                    name: 'sql_sentence',
                                    reference: 'sql_sentence',
                                    width: '100%',
                                    flex: 1
                                },
                                {
                                    xtype: 'container',
                                    width: '100%',
                                    layout: {
                                        type: 'hbox',
                                        pack: 'end'
                                    },
                                    defaults: {
                                        margin: '0 0 0 10'
                                    },
                                    items: [{
                                            xtype: 'button',
                                            text: 'Check',
                                            reference: 'btnCheck',
                                            handler: 'btnCheck_onClick'
                                        },
                                        {
                                            xtype: 'button',
                                            text: 'Preview',
                                            reference: 'btnPreview',
                                            handler: 'btnPreview_onClick'
                                        }
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
                            defaults:{
                                layout: 'fit',
                            },
                            items:[
                                {
                                    title: 'Table Preview',
                                    items:[
                                        {
                                            xtype: 'grid',
                                            reference: 'grdTable',
                                            store: Ext.create('Ext.data.Store')
                                        }
                                    ]
                                },
                                {
                                    title: 'SQL Preview',
                                    items:[
                                        {
                                            xtype: 'grid',
                                            reference: 'grdPreview',
                                            store: Ext.create('Ext.data.Store'),
                                        }
                                    ]
                                },
                                {
                                    title: 'My JOBs',
                                    listeners:{
                                        activate: 'tabMyJobs_onActivate'
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