Ext.define('common.comment.CommentsObject',{
    extend: 'Ext.Panel',

    requires:[
        'Ext.grid.feature.Grouping',
        'Ext.form.field.HtmlEditor',
        'Ext.ux.PreviewPlugin',
        'Ext.window.Toast',
        'common.comment.CommentsObjectModel',
        'common.comment.CommentsObjectController'
    ],

    xtype: 'comments-object',
    padding: '19',
    frame: true,

    controller: 'comment-object',
    viewModel: 'comment-object',

    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },

    initComponent: function () {
        var me = this;

        me.rowEditing = new Ext.grid.plugin.RowEditing({
            listeners: {
                edit: function(editor, e){    
                    e.record.set('comments', e.newValues['comments']);
                    me.getController().onSaveComment();
                },
                canceledit: function(editor, e){    
                    
                }
            }
        });

        if (!me.contextMenu){
            me.contextMenu = new Ext.menu.Menu({
                items: [
                    {
                        text: 'Edit',
                        handler: function(item) {
                            var grid = me.down('grid'),
                                record = me.contextMenu.record,
                                index = grid.store.find('id', record.data.id);

                            me.rowEditing.startEdit(index, 0);
                        }
                    },
                    {
                        text: 'Delete',
                        handler: function(item) {
                            var grid = me.down('grid'),
                                record = me.contextMenu.record,
                                index = grid.store.find('id', record.data.id);
                            
                            grid.getSelectionModel().select(index);
                            me.getController().onDeleteComment(item);
                        }
                    }]
            });
        }

        Ext.apply(this, {
            items: [
                {
                    xtype: 'container',
                    layout: 'hbox',
                    align : 'fit',
                    items:[
                        {
                            xtype: 'textfield',
                            name: 'comments',
                            margin: '0 6 0 0',
                            flex: 1,
                            enableKeyEvents: true,
                            listeners:{
                                change: function(event, value){
                                    var store = me.down('grid').store;

                                    if (store.getNewRecords().length==0){
                                        
                                    }
                                },
                                specialkey: function(o, event){
                                    var ctrl = me.getController();
                                    
                                    if (event.keyCode==13 && this.value){
                                        ctrl.onNewComment( this.value );
                                        ctrl.onSaveComment();
                                        this.setValue('');
                                    }else if (event.keyCode==27){
                                        this.setValue('');
                                    }                                    
                                }
                            }
                            /*bind: {
                                value: '{currentcomment.comments}',
                                disabled: '{!currentcomment.is_owner}'
                            }*/
                        },
                        {
                            xtype: 'button',
                            text: 'Post',
                            itemId:'btnSaveComment',
                            align:'stretch',
                            handler: function(){
                                var ctrl = me.getController();
                                var txt = me.down('[name="comments"]');

                                if (txt.value){
                                    ctrl.onNewComment( txt.value );
                                    ctrl.onSaveComment();
                                    txt.setValue('');
                                }
                            }, 
                            iconCls:'x-fa fa-floppy-o',
                            /*bind: {
                                disabled: '{!currentcomment.is_owner}'
                            }*/
                        }
                    ]
                },
                {
                    xtype: 'grid',
                    flex:1,
                    frame: true,
                    split:true,
                    hideHeaders: true,
                    cls: 'comment-grid',
                    bind: {
                        store: '{comments}',
                        selection: '{currentcomment}'
                    },
                    plugins: [me.rowEditing],
                    /*plugins: [
                        {
                            ptype: 'preview',
                            bodyField: 'comments',
                            expanded: true
                        }
                    ],*/
                    columns: [
                        {
                            text: '',
                            dataIndex: 'comments',
                            renderer:this.formatUser,
                            flex:2,
                            menuDisabled: true,
                            editor : {
                                xtype: 'textfield',
                                allowBlank:false
                            }
                        },
                        {
                            xtype: 'datecolumn',
                            text: 'Date',
                            dataIndex: 'date',
                            hidden: true
                        }
                    ]
                }
            ],
            /*tbar: [
                {
                    xtype: 'button',
                    text: 'New',
                    itemId:'btnNewComment',
                    handler: 'onNewComment',
                    iconCls:'x-fa fa-plus'
                },
                {
                    xtype: 'button',
                    itemId:'btnDeleteComment',
                    text: 'Delete',
                    handler: 'onDeleteComment',
                    iconCls:'x-fa fa-minus',
                    bind: {
                        disabled: '{!currentcomment.is_owner}'
                    }
                }
            ],*/
            /*bbar: [
                '->',
                
            ]*/
        });

        me.callParent(arguments);
    },

    /**
     * Title renderer
     * @private
     */
    formatUser: function (value, p, record) {
        var me = this,
            id = Ext.id(),
            tpl = 
                '<div class="user">'+
                    '<b>{0}</b>'+
                    ' comments on '+
                    '<span class="date">{1}</span>'+
                    '<span id="{2}"></span>'+
                    '<div>{3}</div>'+
                '</div>';

        Ext.defer(function() {
        Ext.widget('button', {
            renderTo: id,
            iconCls: 'x-fa fa-caret-down',
            padding: '0',
            margin:  '0 0 0 20',
            handler: function(data, event) {                
                var xy = {x:event.event.clientX, y:event.event.clientY},
                    menu = me.up('comments-object').contextMenu;
                
                menu.record = record;
                menu.showAt(xy);
            }
        });
        }, 50);
        
        return Ext.String.format(tpl, 
            record.get('owner'),               //{0} owner
            record.get('date') || 'Unknown',   //{1} date
            id,                                //{2} button
            value                              //{3} comments
        );

        /*return Ext.String.format(
            '<div class="user">'+
                '<spam style="font-weight: bold;">{0}</spam>'+
                ' comments on '+
                '<span class="date">{1}</span>'+
            '</div>', value,

            record.get('date') || 'Unknown');*/
    },

    setObject: function(catalog, object) {
        // console.log('setObject(%o, %o)', catalog, object)

        var me = this,
            vm = me.getViewModel(),
            ctrl = me.getController();

        vm.set('catalog_id', catalog);
        vm.set('object_id', object);

        ctrl.loadComments(catalog, object);
    }
});
