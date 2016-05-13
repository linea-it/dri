Ext.define('Tile.store.Releases', {
    extend: 'common.store.Releases',

    requires: [
        'common.store.Releases'
    ],

    sorters: [
        {
            property: 'rls_date',
            direction: 'DESC'
        },
        {
            property: 'rls_display_name',
            direction: 'ASC'
        }
    ]
});
