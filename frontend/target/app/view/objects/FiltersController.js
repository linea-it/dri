Ext.define('Target.view.objects.FiltersController', {
    extend: 'Ext.app.ViewController',

    requires: [

    ],

    alias: 'controller.filters',

    listen: {
        // component: {
        //     'targets-columns': {
        //         changesetting: 'onChangeSetting'
        //     }
        // },
        // store: {
        //     '#Available': {
        //         load: 'checkAvailable'
        //     }
        // }
    },

    onCancelFilter: function () {
        console.log('onCancelFilter');
    },

    onApplyFilter: function () {
        console.log('onApplyFilter');

    }

});
