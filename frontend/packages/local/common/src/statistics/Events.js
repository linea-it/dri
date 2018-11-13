Ext.define('common.statistics.Events', {
    extend: 'Ext.app.Controller',
    init: function () {
        var me = this;
        Ext.GlobalEvents.on('eventregister', me.onEventRegister);
    },

    onEventRegister: function (eventDescription) {
        var csrf = Ext.util.Cookies.get('csrftoken');

        Ext.Ajax.request({
            url: `${window.location.origin}/dri/api/statistics/`,
            method: 'POST',
            params: {
                csrfmiddlewaretoken: csrf,
                event: eventDescription
            },
            success: function (response) {},
            failure: function (response, opts) {}
        });
    }
});
