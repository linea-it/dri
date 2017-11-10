Ext.define('UserQuery.view.main.Main', {
    extend: 'Ext.container.Container',
    xtype: 'app-main',

    requires: [
        'Ext.plugin.Viewport',
        'Ext.window.MessageBox',

        'UserQuery.view.main.MainController',

        'common.header.Toolbar',
        'common.footer.Footer'
    ],

    controller: 'main',
    viewModel: {},

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    bind:{
        hidden: '{!initialized}'
    },

    items: [
        // header bar
        {xtype: 'dri-header', viewModel:{ data: {name:'User Query'}}},

        // toolbar
        {xtype: 'toolbar', region:'north', items: [
            {xtype: 'button', tooltip:'New', handler:'btnNew_onClick', iconCls: 'x-fa fa-file-o', 
                // menu: {xtype: 'menu', plain: true, items: {
                //     xtype: 'button',
                //     text: 'User options',
                //     handler: 'onBtnNew_Click'
                // }}
            },
            {xtype: 'button', tooltip:'Open', handler:'btnOpen_onClick', iconCls: 'x-fa fa-folder-open'},
            '-',
            {xtype: 'button', tooltip:'Delete', bind:{disabled:'{!activeQuery.exist}'}, handler:'btnDelete_onClick', iconCls: 'x-fa fa-trash-o'},
            '-',
            {xtype: 'button', tooltip:'Save', reference:'btnSave', iconCls: 'x-fa fa-floppy-o', handler:'btnSave_onClick',
                // menu: {xtype: 'menu', plain: true, items: {
                //     text: 'Save As',
                //     handler: 'mnuSaveAs_onClick'
                // }}
            },
            {xtype: 'button', tooltip:'Start Job', bind:{disabled:'{!activeQuery.exist}'}, handler:'btnStartJob_onClick',  iconCls: 'x-fa fa-play'},
            // '->',
            // {xtype: 'button', text:'My Jobs', tooltip:'My Jobs', iconCls: 'x-fa fa-info-circle'}
        ]},

        // client area
        {xtype: 'container', reference:'ctnArea', flex:1, bodyPadding: 15, style:{opacity:'0'}, layout:'border', items:[
            // accordion
            {xtype: 'panel', region:'west', split:true, width:300, minWidth:100, bind:{title:'{activeRelease.display}'}, layout:{type:'accordion', titleCollapse:false, animate:true}, items:[
                // tables of release
                {title: 'Input Tables', layout:'fit', items:[
                    {xtype: 'treepanel', reference:'tvwInputTables', rootVisible:false, 
                        listeners: {
                            itemexpand: 'tvwInputTables_onExpanded',
                            drag: function(node, data, dropRec, dropPosition) {
                                //var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
                                //Ext.example.msg("Drag from right to left", 'Dropped ' + data.records[0].get('name') + dropOn);
                                console.log(111)
                            }
                        },

                        viewConfig: {
                            plugins: {
                                ptype: 'treeviewdragdrop',
                                enableDrag: true,
                                enableDrop: false,
                                ddGroup: 'TreeDD',
                                listeners: {
                                    drag: function(node, data, dropRec, dropPosition) {
                                        //var dropOn = dropRec ? ' ' + dropPosition + ' ' + dropRec.get('name') : ' on empty view';
                                        //Ext.example.msg("Drag from right to left", 'Dropped ' + data.records[0].get('name') + dropOn);
                                        console.log(node)
                                    }
                                }
                            }
                        }
                    }
                ]},
                
                // tables of external catalog
                /*{title: 'External Catalog', layout:'fit', reference:'accExternalCatalog',
                    listeners:{
                        expand: 'accExternalCatalog_onExpand'
                    },
                    items:[
                        {xtype: 'treepanel', reference:'tvwExternalCatalog', rootVisible:false}
                    ]
                },*/

                // tables of user
                {title: 'My Tables', layout:'fit', items:[
                    {xtype: 'treepanel', reference:'tvwMyTables', rootVisible:false}
                ]}
            ]},

            // form panel
            {xtype: 'panel', region:'center', bind:{title:'{activeQuery.name}'}, layout:'border', items:[
                {xtype: 'form', reference:'frmQuery', region:'center', layout:'vbox', bodyPadding: 15, 
                    defaults: {
                        listeners: {
                            change: 'form_onDataChange'
                        }
                    },
                    items: [
                        {xtype: 'textfield',     fieldLabel: 'Name',         name:'name', reference:'name', width:'100%'},
                        {xtype: 'textfield',     fieldLabel: 'Description',  name:'description', width:'100%'},
                        {xtype: 'textareafield', fieldLabel: 'SQL Sentence', name:'sql_sentence', reference:'sql_sentence', width:'100%', flex:1},
                        {xtype:'container', width:'100%', layout:{type:'hbox', pack:'end'}, defaults:{margin:'0 0 0 10'}, items:[
                            {xtype:'button', text:'Check', reference:'btnCheck', handler:'btnCheck_onClick'},
                            {xtype:'button', text:'Preview', reference:'btnPreview', handler:'btnPreview_onClick'}
                        ]}
                    ]
                },
                {xtype:'grid', region:'south', reference:'grdPreview', split:true, height:200, store: Ext.create('Ext.data.Store')} 
            ]},

            // jobs panel
            {xtype: 'panel', region:'east', width:300, layout:'vbox', split:true, collapsible:true, collapsed:true, title:'My Jobs', bodyPadding: 15, items:[
                {xtype:'treelist', reference:'tvwJobList', flex:1, width:'100%', rootVisible:false,
                    store: {
                        root: {
                        expanded: true,
                            children: [
                                {text:'My Job 01', leaf: true, iconCls: 'x-fa fa-hourglass-3'},
                                {text:'My Job 02', leaf: true, iconCls: 'x-fa fa-hourglass-3'},
                                {text:'My Job 03', leaf: true, iconCls: 'x-fa fa-frown-o', cls :'rednode'}
                            ]
                        }
                    },
                    listeners: {
                        selectionchange: 'tvwJobList_onSelectionChange'
                    }
                },
                {xtype:'container', reference:'ctnJobDetail', html:'JOB Detail'}
            ]},
        ]},
        
        // footer bar
        {xtype: 'dri-footer'}
    ]
});
