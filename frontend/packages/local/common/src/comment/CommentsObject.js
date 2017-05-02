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
                    xtype: 'grid',
                    flex:1,
                    split:true,
                    cls: 'comment-grid',
                    bind: {
                        store: '{comments}',
                        selection: '{currentcomment}'
                    },
                    plugins: [
                        {
                            ptype: 'preview',
                            bodyField: 'comments',
                            expanded: true
                        }
                    ],
                    columns: [
                        {
                            text: '',
                            dataIndex: 'owner',
                            renderer:this.formatUser,
                            flex:2,
                            menuDisabled: true
                        },
                        {
                            xtype: 'datecolumn',
                            text: 'Date',
                            dataIndex: 'date',
                            hidden: true
                        }
                    ]
                },
                {
                    xtype: 'form',
                    split:true,
                    frame: true,
                    border: true,
                    height: 150,
                    layout: 'fit',
                    items: {
                        xtype: 'htmleditor',
                        name: 'comments',
                        bind: {
                            value: '{currentcomment.comments}',
                            disabled: '{!currentcomment.is_owner}'
                        }
                    }
                }
            ],
            tbar: [
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
            ],
            bbar: [
                '->',
                {
                    xtype: 'button',
                    text: 'Save',
                    itemId:'btnSaveComment',
                    align:'stretch',
                    handler: 'onSaveComment',
                    iconCls:'x-fa fa-floppy-o',
                    bind: {
                        disabled: '{!currentcomment.is_owner}'
                    }
                }
            ]
        });

        me.callParent(arguments);
    },

    /**
     * Title renderer
     * @private
     */
    formatUser: function (value, p, record) {
        return Ext.String.format(
            '<div class="user"><spam style="font-weight: bold;">{0}</spam> comments on <span class="date">' +
            '{1}</span></div>', value,
             record.get('date') || 'Unknown');
    }
});
