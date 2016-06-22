Ext.define('Admin.Application', {
    extend: 'Ext.app.Application',

    name: 'Admin',

    stores: [
        'NavigationTree'
    ],

    defaultToken : 'dashboard',

    //controllers: [
    // TODO - Add Global View Controllers here
    //],

    onAppUpdate: function () {
        window.location.reload();
    }
});
