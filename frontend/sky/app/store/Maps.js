Ext.define('Sky.store.Maps', {
    extend: 'Ext.data.ArrayStore',

    alias: 'store.maps',

    fields: [
        {name:'id', type:'int'},
        {name:'srv_release', type:'int'},
        {name:'srv_filter', type:'int'},
        {name:'filter', type:'string'},
        {name:'srv_project', type:'string'},
        {name:'srv_display_name', type:'string'},
        {name:'srv_url', type:'string'},
        {name:'srv_target', type:'string'},
        {name:'srv_fov', type:'string'}
    ],

    autoLoad: true,

    data: [
        {
            'id':1,
            'filter':'g',
            'srv_release':2,
            'srv_filter':2,
            'srv_project':'DES',
            'srv_display_name':'Map 1',
            'srv_url':'http://desportal.cosmology.illinois.edu/data/releases/y1_supplemental_d04/images/aladin/g',
            'srv_target':'',
            'srv_fov':null
        }
    ]

});
