Ext.define('visiomatic.Interface', {

    makeToolbar: function () {
        return Ext.create('Ext.toolbar.Toolbar', {
            items: [ ]
        });
    },

    makeToolbarButtons: function () {
        var me = this,
            auxTools,
            tools = [];

        // Shift Aladin/Visiomatic
        if (me.getEnableShift()) {
            tools.push({
                xtype: 'button',
                tooltip: 'Switch between Visiomatic / Aladdin.',
                iconCls: 'x-fa fa-exchange',
                scope: me,
                handler: me.onShift
            });
        }

        // Get Link
        if (me.getEnableLink()) {
            tools.push({
                xtype: 'button',
                tooltip: 'Get link',
                iconCls: 'x-fa fa-link',
                scope: me,
                handler: me.getLinkToPosition
            });
        }

        return tools;
    }
});
