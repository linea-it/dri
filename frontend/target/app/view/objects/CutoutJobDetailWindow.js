Ext.define('Target.view.objects.CutoutJobDetailWindow', {
    extend: 'Ext.window.Window',

    xtype: 'target-cutoutjob-detail',

    title: 'Mosaic',
    modal: true,
    autoShow: true,

    closeAction: 'destroy',

    bodyPadding: 20,

    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    config: {
        cutoutjob: null
    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
            items: [
                {
                    xtype: 'form',
                    layout: {
                        type: 'vbox',
                        align: 'stretch'
                    },
                    border: false,
                    fieldDefaults: {
//                        labelAlign: 'top',
                        labelWidth: 100,
                        readOnly: true
                    },
                    items: [
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Release TAG',
                            name: 'cjb_tag'
                        },
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Type',
                            name: 'cjb_type'
                        },
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Owner',
                            name: 'owner'
                        },
                        {
                            xtype: 'datefield',
                            fieldLabel: 'Date',
                            name: 'cjb_start_time'
                        },
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Execution Time',
                            name: 'execution_time'
                        },
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Files',
                            name: 'count_files'
                        },
                        {
                            xtype: 'textfield',
                            fieldLabel: 'Size',
                            name: 'file_sizes'
                        },
                        {
                            xtype: 'textarea',
                            labelAlign: 'top',
                            fieldLabel: 'Comment',
                            name: 'cjb_description',
                            maxLength: 1024
                        }
                    ]
                }
            ],
            buttons: [
                {
                    text: 'Delete',
                    tooltip: 'Delete this Mosaic and remove all files',
                    scope: me,
                    iconCls: 'x-fa fa-trash',
                    ui: 'soft-red',
                    handler: 'onDelete'
                },
                {
                    text: 'Cancel',
                    scope: me,
                    handler: 'onCancel'
                },
            ]
        });
        me.callParent(arguments);
    },

    setCutoutjob: function (cutoutjob) {
        var me = this,
            form = me.down('form').getForm();

        if ((cutoutjob) && (cutoutjob.get('id') > 0)) {
            me.cutoutjob = cutoutjob;

            form.loadRecord(me.cutoutjob)
        }
    },

    onDelete: function () {
        var me = this;

        Ext.MessageBox.confirm('',
            'The mosaic and all its files will be removed. Do you want continue?', me.deleteCutoutJob, this);
    },

    deleteCutoutJob: function (btn) {
        var me = this,
            record = me.getCutoutjob();

        if (btn === 'no') {
            return false;
        }

        me.fireEvent('deletecutoutjob', record, me);
    },

    onCancel: function () {
        this.close();

    }
});
