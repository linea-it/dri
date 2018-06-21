Ext.define('visiomatic.comment.CommentsPosition',{
    extend: 'Ext.Panel',

    requires:[
        'Ext.grid.feature.Grouping',
        'Ext.form.field.HtmlEditor',
        'Ext.ux.PreviewPlugin',
        'Ext.window.Toast',
        'visiomatic.comment.CommentsPositionModel',
        'visiomatic.comment.CommentsPositionController'
    ],

    xtype: 'comments-position',
    padding: '19',
    frame: true,

    controller: 'comment-position',
    viewModel: 'comment-position',

    layout: {
        type: 'vbox',
        pack: 'start',
        align: 'stretch'
    },

    config: {
        radec: null,
        datasetId: null
    },

    initComponent: function () {
        let me = this;
        
        me.rowEditing = new Ext.grid.plugin.RowEditing({
            listeners: {
                edit: function(editor, e){    
                    e.record.set('pst_comment', e.newValues['pst_comment']);
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
                            iconCls:'x-fa fa-floppy-o'
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
                    columns: [
                        {
                            text: '',
                            dataIndex: 'pst_comment',
                            renderer: this.formatUser,
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
            ]
        });

        me.callParent(arguments)
    },

    afterRender(){
        let radec = this.getRadec()
        let datasetId = this.getDatasetId()
        let ctrl = this.getController()
        
        ctrl.loadComments(datasetId, radec)
        
        this.callParent(arguments)
    },

    /**
     * Title renderer
     * @private
     */
    formatUser: function (value, p, record) {
        var me = this,
            tm, tmq = 5,
            id = Ext.id(),
            tpl = 
                '<div class="user">'+
                    '<b>{0}</b>'+
                    ' comments on '+
                    '<span class="date">{1}</span>'+
                    '<span id="{2}"></span>'+
                    '<div>{3}</div>'+
                '</div>';

        function renderButton(){
            if (document.getElementById(id)){
                return Ext.widget('button', {
                    renderTo: id,
                    iconCls: 'x-fa fa-caret-down',
                    style: 'padding:0;margin-left:20px',
                    handler: function(data, event) {                
                        var xy = {x:event.event.clientX, y:event.event.clientY},
                            menu = me.up('comments-position').contextMenu;
                        
                        menu.record = record;
                        menu.showAt(xy);
                    }
                })
            }

            tmq--
            if (tmq>0){
                setTimeout(renderButton, 100)
            }

        }

        setTimeout(renderButton, 100)

        return Ext.String.format(tpl, 
            record.get('owner'),               //{0} owner
            record.get('date') || 'Unknown',   //{1} date
            id,                                //{2} button
            value                              //{3} pst_comment
        );
    }
});
