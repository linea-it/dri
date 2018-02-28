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
        // {
        //     xtype: 'toolbar',
        //     region: 'north',
        //     items: [
        //         {
        //             xtype: 'button',
        //             tooltip: 'Execute',
        //             reference: 'btnStartJob',
        //             disabled: true,
        //             handler: 'btnStartJob_onClick',
        //             iconCls: 'x-fa fa-play'
        //         }
        //     ]
        // },

        // client area
        {
            xtype: 'container',
            reference: 'ctnArea',
            flex: 1,
            bodyPadding: 0,
            style: {
                opacity: '0'
            },
            layout: 'border',
            items: [
                // left panel
                {
                    xtype: 'panel',
                    reference: 'pnlRelease',
                    region: 'center',                    
                    header: {
                        xtype: 'header',
                        titlePosition: 1,
                        padding: '6',
                        items: [
                            {
                                xtype:'container',
                                layout:'hbox',
                                width: '200',
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
                    layout: 'border',
                    items: [
                        {
                            reference: 'panels',
                            xtype: 'container',
                            region: 'center',
                            style: {
                                background: '#fff'
                            },
                            bodyPadding: 15
                        }
                    ]
                },

                // center panel (form / tabs)
                {
                    xtype: 'panel',
                    region: 'east',
                    split: true,
                    width: 350,
                    minWidth: 100,
                    title: 'Object Inspector',
                    layout: 'border',
                    style: {
                        background: 'red'
                    },
                    items: [
                        {
                            reference: 'propertiesInspector',
                            xtype: 'container',
                            region: 'center',
                            style: {
                                background: '#fff'
                            },
                            bodyPadding: 15
                        },
                        {
                            xtype: 'panel',
                            region: 'south',
                            title: 'Run process',
                            height: 300,
                            split: true,
                            style: {
                                background: '#fff'
                            },
                            items: [
                                {
                                    xtype: 'form',
                                    region: 'center',
                                    layout: 'vbox',
                                    bodyPadding: 10,
                                    items: [
                                        {
                                            xtype: 'textfield',
                                            fieldLabel: 'Name ',
                                            name: 'name',
                                            width: '100%'
                                        },
                                        {
                                            xtype: 'textfield',
                                            fieldLabel: 'Description ',
                                            name: 'description',
                                            width: '100%'
                                        },
                                        {
                                            xtype: 'container',
                                            width: '100%',
                                            reference: 'processesInspector'
                                        },
                                        {
                                            xtype: 'button',
                                            text: 'Start'
                                        }
                                    ]
                                }

                            ]
                        }
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