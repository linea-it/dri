Ext.define('common.statistics.Events', {
    extend : 'Ext.app.Controller',
    init: function () {
        var me = this;
        Ext.GlobalEvents.on('eventregister', me.onEventRegister);
    },

    onEventRegister: function (eventDescription) {
        Ext.Ajax.request({
            url: `/dri/api/statistics/`,
            method: 'POST',
            params: {
                event: eventDescription
            },
            success: function (response) {

            },
            failure: function (response, opts) {

            }
        });
    }
});
