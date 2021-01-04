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
        'common.footer.Footer',

        'codemirror.Codemirror',
        'common.statistics.Events',
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
                // {
                //     xtype: 'button',
                //     tooltip: 'Delete Query',
                //     disabled: true,
                //     bind: {
                //         disabled: '{!activeQuery.exist}'
                //     },
                //     handler: 'btnDelete_onClick',
                //     iconCls: 'x-fa fa-trash-o'
                // },
                // '-',
                {
                    xtype: 'button', // 'splitbutton',
                    tooltip: 'Save Query',
                    disabled: true,
                    reference: 'btnSave',
                    iconCls: 'x-fa fa-floppy-o',
                    handler: 'btnSave_onClick',
                    // menu: {xtype: 'menu', plain: true, items: {
                    //     text: 'Save As',
                    //     handler: 'mnuSaveAs_onClick'
                    // }}
                },
                {
                    xtype: 'button',
                    tooltip: 'Execute Query',
                    reference: 'btnStartJob',
                    disabled: true,
                    // bind: {
                    //     disabled: '{!activeQuery.exist}'
                    // },
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
                // left panel
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
                        title: 'Release: ',
                        padding: '6',
                        items: [
                            {
                                xtype: 'container',
                                layout: 'hbox',
                                width: '100%',
                                items: [
                                    {
                                        xtype: 'label',
                                        html: '<div style="padding-top:2px;">Release: </div>'
                                    },
                                    {
                                        xtype: 'combobox',  // or use Ext.create('class') instead of lazy instantiation
                                        reference: 'cmbReleases',
                                        flex: 1,
                                        displayField: 'release_display_name',
                                        editable: false,
                                        queryMode: 'local',
                                        valueField: 'release_id',
                                        emptyText: 'Select Release',
                                        listeners: {
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
                    // layout: {
                    //     type: 'accordion',
                    //     titleCollapse: true,
                    //     animate: true
                    // },
                    items: [
                        {
                            xtype: 'panel',
                            region: 'center',
                            layout: {
                                type: 'accordion',
                                titleCollapse: true,
                                animate: true
                            },
                            items: [
                                // tables of release
                                {
                                    title: 'Input Tables',
                                    layout: 'fit',
                                    listeners: {
                                        collapse: 'accInputTable_onCollapse'
                                    },
                                    items: [{
                                        xtype: 'treepanel',
                                        reference: 'tvwInputTables',
                                        rootVisible: false,
                                        listeners: {
                                            itemexpand: 'tvwInputTables_onExpanded',
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
                                            { text: 'Content', itemId: 'preview', handler: 'tvwInputTables_onContextMenuClick' }
                                        ]
                                    }]
                                },
                                // tables of external catalog
                                {
                                    title: 'External Tables', layout: 'fit', reference: 'accExternalCatalog',
                                    // listeners: {
                                    //     expand: 'accExternalCatalog_onExpand',
                                    //     collapse: 'accExternalCatalog_onCollapse'
                                    // },
                                    items: [
                                        {
                                            xtype: 'treepanel',
                                            reference: 'tvwExternalCatalog',
                                            rootVisible: false,
                                            viewConfig: {
                                                plugins: {
                                                    ptype: 'treeviewdragdrop',
                                                    enableDrag: true,
                                                    enableDrop: false,
                                                    ddGroup: 'TreeDD'
                                                }
                                            },
                                            // contextMenuItems: [
                                            //     { text: 'Content', itemId: 'preview', handler: 'tvwExternalCatalog_onContextMenuClick' }
                                            // ],
                                            // listeners: {
                                            //     itemcontextmenu: 'treeView_onContextMenu',
                                            //     itemexpand: 'tvwExternalCatalog_onExpanded'
                                            // }
                                        }
                                    ]
                                },
                                // tables of user
                                {
                                    title: 'My Tables',
                                    layout: 'fit',
                                    reference: 'accMyTables',
                                    listeners: {
                                        expand: 'accMyTables_onExpand',
                                        collapse: 'accMyTables_onCollapse'
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
                                            { text: 'Rename', itemId: 'rename', handler: 'tvwMyTables_onContextMenuClick' },
                                            { text: 'Content', itemId: 'preview', handler: 'tvwMyTables_onContextMenuClick' },
                                            { text: 'Download', itemId: 'download', handler: 'tvwMyTables_onContextMenuClick' },
                                            '-',
                                            { text: 'Delete', itemId: 'delete', handler: 'tvwMyTables_onContextMenuClick' },
                                            '-',
                                            {
                                                text: 'View', itemId: 'target', handler: 'tvwMyTables_onContextMenuClick',
                                                config_item: function (item, record) {
                                                    item.disabled = record.product_id ? false : true;
                                                }
                                            }
                                        ],
                                        listeners: {
                                            itemcontextmenu: 'treeView_onContextMenu',
                                            itemexpand: 'tvwMyTables_onExpanded'
                                        }
                                    }]
                                },

                                // outers tables
                                {
                                    title: 'Shared Tables', layout: 'fit', reference: 'accOtherTables',
                                    listeners: {
                                        expand: 'accOtherTables_onExpand',
                                        collapse: 'accOtherTables_onCollapse'
                                    },
                                    items: [
                                        {
                                            xtype: 'treepanel',
                                            reference: 'tvwOtherTables',
                                            rootVisible: false,
                                            listeners: {
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
                                                { text: 'Content', itemId: 'preview', handler: 'tvwOtherTables_onContextMenuClick' }
                                            ]

                                        }
                                    ]
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
                            items: [
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
                                            beforeselect: 'tvwMyQueries_onBeforeSelect',
                                            select: 'tvwMyQueries_onSelect',
                                            itemcontextmenu: 'treeView_onContextMenu'
                                        },
                                        contextMenuItems: [
                                            { text: 'Rename', itemId: 'rename', handler: 'tvwMyQueries_onContextMenuClick' },
                                            { text: 'Delete', itemId: 'delete', handler: 'tvwMyQueries_onContextMenuClick' }
                                        ]
                                    }],
                                    listeners: {
                                        expand: 'accMyQueries_onExpand'
                                    }
                                },

                                // samples queries
                                {
                                    title: 'Sample Queries',
                                    layout: 'fit',
                                    reference: 'accSampleQueries',
                                    listeners: {
                                        expand: 'accSampleQueries_onExpand'
                                    },
                                    items: [{
                                        xtype: 'treepanel',
                                        reference: 'tvwSampleQueries',
                                        rootVisible: false,
                                        listeners: {
                                            select: 'tvwSampleQueries_onSelect'
                                        }
                                    }]
                                }
                            ]
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
                                xtype: 'codemirror',
                                fieldLabel: 'SQL Sentence* ',
                                name: 'sql_sentence',
                                reference: 'sql_sentence',
                                width: '100%',
                                flex: 1
                            },
                            // {
                            //     xtype: 'textareafield',
                            //     fieldLabel: 'SQL Sentence* ',
                            //     name: 'sql_sentence',
                            //     reference: 'sql_sentence',
                            //     width: '100%',
                            //     flex: 1
                            // },
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
                                items: [
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
                            cls: 'preview-tabs',
                            defaults: {
                                layout: 'fit',
                            },
                            items: [
                                {
                                    title: 'Table Content',
                                    items: [
                                        {
                                            xtype: 'grid',
                                            reference: 'grdPreview',
                                            store: Ext.create('Ext.data.Store'),
                                        }
                                    ]
                                },
                                // {
                                //     title: 'Table Content',
                                //     items:[
                                //         {
                                //             xtype: 'grid',
                                //             reference: 'grdTable',
                                //             store: Ext.create('Ext.data.Store')
                                //         }
                                //     ]
                                // },
                                {
                                    title: 'My JOBs',
                                    listeners: {
                                        activate: 'tabMyJobs_onActivate'
                                    },
                                    items: [
                                        {
                                            xtype: 'grid',
                                            reference: 'grdJobs',
                                            store: Ext.create('Ext.data.Store'),
                                            viewConfig: {
                                                //stripeRows: false,
                                                getRowClass: function (record) {
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