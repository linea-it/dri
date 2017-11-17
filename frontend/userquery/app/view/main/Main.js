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
                                    itemexpand: 'tvwInputTables_onExpanded'
                                },

                                viewConfig: {
                                    plugins: {
                                        ptype: 'treeviewdragdrop',
                                        enableDrag: true,
                                        enableDrop: false,
                                        ddGroup: 'TreeDD'
                                    }
                                }
                            }]
                        },

                        // tables of external catalog
                        {title: 'External Catalog', layout:'fit', reference:'accExternalCatalog',
                            listeners:{
                                expand: 'accExternalCatalog_onExpand'
                            },
                            items:[
                                {xtype: 'treepanel', reference:'tvwExternalCatalog', rootVisible:false}
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
                                }
                            }]
                        },

                        // queries of user
                        {
                            title: 'My Queries',
                            layout: 'fit',
                            reference: 'accMyQueries',
                            listeners:{
                                expand: 'accMyQueries_onExpand'
                            },
                            items: [{
                                xtype: 'treepanel',
                                reference: 'tvwMyQueries',
                                rootVisible: false,
                                listeners: {
                                    select: 'tvwMyQueries_onSelect'
                                }
                            }]
                        }
                    ]
                },

                // form panel
                {
                    xtype: 'panel',
                    region: 'center',
                    bind: {
                        title: 'Query Definition' // '{activeQuery.name}'
                    },
                    layout: 'border',
                    items: [{
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
                                    fieldLabel: 'Description* ',
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
                        {
                            xtype: 'grid',
                            region: 'south',
                            reference: 'grdPreview',
                            split: true,
                            height: 200,
                            store: Ext.create('Ext.data.Store')
                        }
                    ]
                },

                // jobs panel
                {
                    xtype: 'panel',
                    region: 'east',
                    width: 300,
                    layout: 'vbox',
                    split: true,
                    collapsible: true,
                    collapsed: true,
                    title: 'My Jobs',
                    bodyPadding: 15,
                    listeners:{
                        expand: 'pnlJobs_onExpand'
                    },
                    items: [
                        
                        {
                            xtype: 'treelist',
                            reference: 'tvwJobList',
                            flex: 1,
                            width: '100%',
                            rootVisible: false,
                            listeners: {
                                selectionchange: 'tvwJobList_onSelectionChange'
                            }
                        },
                        {
                            xtype: 'container',
                            width: '100%',
                            reference: 'ctnJobDetail',
                            html: 'JOB Detail'
                        }
                    ]
                },
            ]
        },

        // footer bar
        {
            xtype: 'dri-footer'
        }
    ]
});