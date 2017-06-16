Ext.define('visiomatic.Interface', {

    makeToolbar: function () {
        return Ext.create('Ext.toolbar.Toolbar', {
            items: [ ]
        });
    },

    makeToolbarButtons: function () {
        var me = this,
            auxTools = me.getAuxTools(),
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

        if (auxTools.length > 0) {
            Ext.each(auxTools, function (tool) {
                tools.push(tool);

            });
        }

        return tools;
    }
});
