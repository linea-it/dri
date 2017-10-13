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

        Ext.apply(this, {
            items: [
                {
                    xtype: 'container',
                    layout: 'hbox',
                    align : 'fit',
                    items:[
                        {
                            xtype: 'textfield',
                            reference: 'txtComment',
                            name: 'comments',
                            margin: '0 6 0 0',
                            flex: 1,
                            enableKeyEvents: true,
                            listeners:{
                                specialkey: 'onTxtCommentPressKey'
                            }
                        },
                        {
                            xtype: 'button',
                            text: 'Post',
                            itemId:'btnSaveComment',
                            align:'stretch',
                            handler: 'onNewComment',
                            iconCls:'x-fa fa-floppy-o',
                        }
                    ]
                },
                {
                    xtype: 'grid',
                    reference: 'GridComments',
                    flex:1,
                    frame: true,
                    split:true,
                    hideHeaders: true,
                    bind: {
                        store: '{comments}',
                        selection: '{currentcomment}'
                    },
                    plugins: [{
                        ptype: 'rowediting',
                        autoCancel: false,
                        listeners: {
                            edit: 'updateComment'
                        }
                    }],
                    columns: [
                        {
                            text: '',
                            dataIndex: 'comments',
                            renderer:me.formatUser,
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
                        },
                        {
                            text: 'Button',
                            width: 50,
                            xtype: 'widgetcolumn',
                            widget: {
                                xtype: 'button',
                                iconCls: 'x-fa fa-caret-down',
                                arrowVisible: false,
                                menu: [
                                    {
                                        text:'Edit',
                                        iconCls: 'x-fa fa-pencil',
                                        handler: 'onClickUpdateComment'
                                    },
                                    {
                                        text:'Delete',
                                        iconCls: 'x-fa fa-trash',
                                        handler: 'onClickDeleteComment'
                                    }
                                ]
                            },
                            onWidgetAttach: function (column, widget) {
                                // Desabilita o botao se o user logado nao e
                                // o dono do comentario.
                                if (widget.getWidgetRecord().get('is_owner')) {
                                    widget.setDisabled(false)
                                } else {
                                    widget.setDisabled(true)
                                }
                            }
                        }
                    ]
                }
            ],
        });

        me.callParent(arguments);
    },

    /**
     * Title renderer
     * @private
     */
    formatUser: function (value, p, record) {
        var me = this,
            tpl =
                '<div class="user">'+
                    '<b>{0}</b>'+
                    ' comments on '+
                    '<span class="date">{1}</span>'+
                    '<div>{2}</div>'+
                '</div>';

        return Ext.String.format(tpl,
            record.get('owner'),               //{0} owner
            record.get('date') || 'Unknown',   //{1} date
            value                              //{2} comments
        );
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
