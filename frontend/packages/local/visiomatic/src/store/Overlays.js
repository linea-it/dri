Ext.define('visiomatic.store.Overlays', {
    extend: 'Ext.data.ArrayStore',

    requires: [
        // 'visiomatic.model.Object'
    ],

    alias: 'store.overlays',

    remoteFilter: false,

    remoteSort: false,

    autoLoad: false,

    // model: 'visiomatic.model.Object',

    pageSize: 0
});
