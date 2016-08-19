/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Sky.view.home.HomeController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.home',

    onRowDblClick: function (grid, record) {
        var me = this;

        me.onChooseRelease(record.get('id'));

    },

    onChooseRelease: function (release) {
        var me = this,
            hash;

        hash = 'sky/' + release;

        me.redirectTo(hash);

    }

});
