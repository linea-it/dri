/**
 * This class is the controller for the main view for the application. It is specified as
 * the "controller" of the Main view class.
 *
 * TODO - Replace this content of this view to suite the needs of your application.
 */
Ext.define('Products.view.main.MainController', {
    extend: 'Ext.app.ViewController',

    alias: 'controller.main',

    onItemSelected: function (sender, record) {
        Ext.Msg.confirm('Confirm', 'Are you sure?', 'onConfirm', this);
    },

    onConfirm: function (choice) {
        if (choice === 'yes') {
            //
        }
    },
    productInfo: function (rec, index){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            source = gridcatalogs.getStore().getAt(index);
            
        source = source.data
        if(source.exp_date){
            exp_date = source.exp_date.substring(0, 10)
        }
        alert(exp_date)
        Ext.create('Ext.window.Window', {
            height: 500,
            title: 'Product Information',
            width: 400,
            modal: true,
            layout: 'fit',
            items: {  // Let's put an empty grid in just to illustrate fit layout
                xtype: 'propertygrid',
                sourceConfig: {                    
                    editor: {disabled: true}                    
                },
                source: {
                    //"id": source.id,
                    "Name": source.prd_name,
                    "Display name": source.prd_display_name,
                    //"prd_flag_removed": source.prd_flag_removed,
                    "Num Objects": source.ctl_num_objects,
                    "Num Rows": source.tbl_rows,
                    "Nside": source.mpa_nside,
                    "Ordering": source.mpa_ordering,
                    "Type": source.pgr_display_name,
                    "Class": source.pcl_display_name,
                    "Process ID": source.prd_process_id,
                    "Username": source.epr_username,
                    "Date": source.epr_end_date,
                    "Selected name": source.prd_user_display_name,
                    //"prd_release_id": source.prd_release_id,
                    "Tags": source.prd_tags,
                    "Original ID": source.epr_original_id,
                    "Band": source.prd_filter,
                    "Name of exporting user": source.exp_username,
                    "Tablename": source.prd_table_ptr,
                    "Export Date": exp_date
                }
            }
        }).show();
    },
    onSelectRelease: function(combo, record){
        var me = this,
            refs = this.getReferences(),
            gridfield = refs.catalogs,
            store = gridfield.getStore(),
            storedataset = refs.field.getStore();
        console.log(storedataset)
        id = record.getData().id
        value = record.getData().rls_display_name
        refs.field.clearValue()
        if (value == 'All'){
            me.ClearRelease()
            storedataset.removeFilter("tag_release", false)
            me.clearField()
            store.load()
        }else{
            storedataset.filter([
                {
                    property: "tag_release",
                    value: id
                }
            ])
            store.filter([
                {
                    property: "releases",
                    value: id
                }
            ])
        }
        
    },

    onSelectField: function(combo, record){
        var me = this,
            refs = this.getReferences(),
            gridfield = refs.catalogs,
            store = gridfield.getStore(),
            id = record.getData().id;
        value = record.getData().tag_display_name

        if (value == 'All'){
            me.clearField()
        }else{store.filter([
                {
                    property: "tags",
                    value: id
                }
            ])
        }
        
    },

    onSelectType: function(combo, record){
        var me = this,
            refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            bandcombo = refs.bands,
            store = gridcatalogs.getStore();
        store.removeFilter("band", false)
        bandcombo.clearValue()
        id = record.getData().id
        value = record.getData().pgr_display_name
        console.log(value)
        if (value == 'All'){
            me.clearType()
        }else{
            store.filter([
                {
                    property: "group_id",
                    value: id
                }
            ])
        }
        
    },
    ClearRelease: function(){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore();
        store.removeFilter("releases", false)

    },
    clearType: function(){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore();
        store.removeFilter("group_id", false)
    },
    clearField: function(){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore();
        store.removeFilter("tags", false)
    },
    clearBand: function(){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore();
        store.removeFilter("band", false)
    },
    clearFilters: function(){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            bandcombo = refs.bands,
            releasefield = refs.releasefield,
            type = refs.type,
            store = gridcatalogs.getStore();
        store.clearFilter()
        bandcombo.clearValue()
        releasefield.clearValue()
        type.clearValue()
        refs.field.clearValue()
    },
    onSelectBand: function(combo, record){
        var me = this,
            refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore();

        //console.log(release)
        filter = record.getData().filter
        value = record.getData().filter
        console.log(value)
        if (value == 'All'){
            me.clearBand()
        }else{
            store.filter([
                {
                    property: "band",
                    value: filter
                }
            ])
        }
    },
    loadProducts: function(){
        var refs = this.getReferences(),
            gridcatalogs = refs.catalogs,
            store = gridcatalogs.getStore();           
        // store.load()
    }
});
