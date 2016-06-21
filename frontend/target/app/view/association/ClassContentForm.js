Ext.define('Target.view.association.ClassContentForm', {
    extend: 'Ext.form.Panel',

    xtype: 'targets-association-class-content-form',

    layout: 'anchor',

    bodyPadding: 5,

    items: [
        {
            xtype: 'fieldset',
            defaultType: 'textfield',
            defaults: {
                anchor: '100%',
                readyOnly: true
            },
            items: [
                {
                    fieldLabel: 'Name',
                    bind: '{classcontentgrid.selection.pcc_display_name}'
                },
                {
                    fieldLabel: 'Unit',
                    bind: '{classcontentgrid.selection.pcc_unit}'
                },
                {
                    fieldLabel: 'Reference',
                    bind: '{classcontentgrid.selection.pcc_reference}'
                },
                {
                    fieldLabel: 'UCD',
                    bind: '{classcontentgrid.selection.pcc_ucd}'
                }
            ]
        }
    ],

    setRecord: function (record) {
        this.getForm().setRecord(record);

    },

    initComponent: function () {
        var me = this;

        Ext.apply(this, {
        });

        me.callParent(arguments);
    }

});
