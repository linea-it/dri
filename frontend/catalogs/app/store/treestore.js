Ext.define('Catalogs.store.treestore', {
    extend: 'Ext.data.TreeStore',

    alias: 'store.treestore',

    fields: ['type_name'],
    root: {
        expanded: true,
        children: [
          { 
              text: "Catalog Server",
              expanded: true,
              children: [
                { 
                  text: " Value-added Catalogs",
                  expanded: true,
                  children: [
                    { 
                      text: "Science Portal",
                      leaf: true,
                      type_id: 1,
                      id: 1,
                      type_name: "teste1"
                    },
                    { 
                      text: "Upload", 
                      leaf: true,
                      type_id: 2, 
                      type_name: "teste2"
                    }
                  ]
                },
                { 
                  text: "Targets", 
                  expanded: true, 
                  children: [
                    { text: "Science Portal", 
                    leaf: true,
                    type_id: 3 
                  },{
                   text: "Upload", 
                   leaf: true,
                   type_id: 4
                 }
                ] },
                { text: "External Catalogs", leaf: true, type_id: 5},
                { text: "Simulations", leaf: true, type_id: 6 }
              ]}
        ]
    }
});
