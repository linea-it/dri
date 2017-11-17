Ext.define('UserQuery.view.service.Api', {
    extend: 'UserQuery.view.service.ApiBase',
    singleton: true,
    alternateClassName: 'Api',

    URL: {
        doLogin:     '/dri/api/api-auth/login/next=',
        queryCRUD:   '/dri/api/userquery_query/',
        getUser:     {method:'GET',  url:'/dri/api/logged/get_logged/?format=json'},
        getReleases: {method:'GET',  url:'/dri/api/releases/'},
        getTables:   {method:'GET',  url:'/dri/api/catalog/'},
        getMyTables: {method:'GET',  url:'/dri/api/userquery_properties/'},
        getFields:   {method:'GET',  url:'/dri/api/productcontent/'}, // ?pcn_product_id=25
        getQueries:  {method:'GET',  url:'/dri/api/userquery_query/'},
        getSamples:  {method:'GET',  url:'/dri/api/userquery_sample/'},
        getJobs:     {method:'GET',  url:'/dri/api/userquery_job/'},
        validate:    {method:'POST', url:'/dri/api/userquery_validate/'},
        preview:     {method:'POST', url:'/dri/api/userquery_preview/'},
        startJob:    {method:'POST', url:'/dri/api/userquery_create_table/'}
        // http://dri.com/dri/api/catalog/get_class_tree_by_group/?external_catalog=true&group__in=objects_catalog,targets,value_added_catalogs,external_catalogs&node=root

    },

    getUser: function(definition){
        return this.send(this.URL.getUser, definition);
    },

    getReleases: function(definition){
        return this.send(this.URL.getReleases, definition);
    },

    getRelease: function(definition){
        var responseCallback = definition.response;

        definition.params = definition.params || {};

        definition.response = function(error, result){
            var releaseData = error ? null : result.find(function(item){return item.id==definition.params.id})
            responseCallback (error, releaseData);
        }

        return this.send(this.URL.getReleases, definition);
    },

    getTables: function(definition){
        return this.send(this.URL.getTables, definition);
    },

    getMyTables: function(definition){
        return this.send(this.URL.getMyTables, definition);
    },

    getFields: function(definition){
        return this.send(this.URL.getFields, definition);
    },

    getQueries: function(definition){
        return this.send(this.URL.getQueries, definition);
    },

    getSamples: function(definition){
        return this.send(this.URL.getSamples, definition);
    },

    getJobs: function(definition){
        return this.send(this.URL.getJobs, definition);
    },

    save: function(definition){
        definition.params = definition.params || {};
        return this[definition.params.id ? 'update' : 'insert'](this.URL.queryCRUD, definition);
    },

    remove: function(definition){
        return this.delete(this.URL.queryCRUD, definition);
    },

    validate: function(definition){
        return this.send(this.URL.validate, definition);
    },

    preview: function(definition){
        return this.send(this.URL.preview, definition);
    },

    startJob: function(definition){
        return this.send(this.URL.startJob, definition);
    },

    doLogin: function(){
        var protocol = window.location.protocol;
        var pathname = window.location.pathname;
        var hostname = window.location.host;

        window.location.assign(`${protocol}//${hostname}${this.URL.doLogin}${pathname}`);
    }
});

function getQueriesTest(){
    return {
        my_queries: [
            { id:'query1', text: 'Query 01', releaseText:'NCSA Y3', name:'Query 01', description:'query 01 description', sql:'select * from table1'},
            { id:'query2', text: 'Query 02', releaseText:'NCSA Y1 Wide Survey',name:'Query 02', description:'query 02 description', sql:'select * from table2 order by 0'}
        ],
        samples: [
            { text: 'Sample 01', description:'sample 01 description', sql:'select * from table_of_sample_01'},
            { text: 'Sample 02', description:'sample 02 description', sql:'select field1, field2 from table_of_sample_02'}
        ]
    };
}

function getReleasesTest(){
    return [
         {text: 'Y3 DEEP'},
         {text: 'Y3'},
         {text: 'Y1 Supplemental D04'},
         {text: 'Y1 Supplemental D10'},
         {text: 'Y1 Supplemental DFULL'},
         {text: 'Y1 Wide Survey'},
    ];
}

function getJobsTest(){
    var jobs;

    try{
        jobs = JSON.parse(sessionStorage.getItem('jobs'));
    }catch(e){
        jobs = [];
    }
}


// limite de tempo de execução e limite de linhas

// http://dri.com/dri/api/productcontent/?pcn_product_id=25
//  [
//     {
//         "id": 1323,
//         "pcn_product_id": 25,
//         "pcn_column_name": "SEQNR" //nome da tabela
//     }
//  ]

// https://github.com/linea-it/dri/blob/develop/frontend/packages/local/common/src/store/MyStore.js
// https://github.com/linea-it/dri/blob/develop/frontend/target/app/view/settings/PermissionController.js#L127
// https://github.com/linea-it/dri/blob/develop/frontend/target/app/store/CutoutJobs.js

// var store = new GetUser();

// store.load(function(records, operation, success) {
//     console.log(records, operation, success);
// });
