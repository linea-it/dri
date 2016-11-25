Ext.define('Explorer.view.coadd.Coadd', {
    extend: 'Ext.panel.Panel',

    xtype: 'coadd-objects',

    requires: [
        'Explorer.view.coadd.CoaddController',
        'Explorer.view.coadd.CoaddModel'
    ],

    controller: 'coadd',

    viewModel: 'coadd',

    layout: 'fit',

    loadPanel: function (arguments) {
        console.log('arguments: ', arguments);
        var me = this,
            vm = me.getViewModel(),
            source = arguments[1],
            object_id = arguments[2];

        vm.set('source', source);

        vm.set('object_id', object_id);

        me.fireEvent('loadpanel', source, object_id, me);

    },

    updatePanel: function (arguments) {

    }

});
