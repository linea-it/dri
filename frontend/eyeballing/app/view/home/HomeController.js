Ext.define('Eyeballing.view.home.HomeController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.home',

    onRowDblClick: function (grid, record) {
        var me = this;

        me.onEyeballing(record.get('id'));

    },

    /**
     * @method onEyeballing [description]
     */
    onEyeballing: function (release) {
        console.log('onEyeballing()');
        var me = this,
            hash;

        hash = 'ebl/' + release;

        me.redirectTo(hash);

    }

});
