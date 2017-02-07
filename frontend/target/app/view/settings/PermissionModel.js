Ext.define('Target.view.settings.PermissionModel', {
    extend: 'Ext.app.ViewModel',

    alias: 'viewmodel.permission',

    requires: [
        'Target.model.Catalog',
        'Target.model.PermissionUser',
        'Target.model.PermissionWorkgroup',
        'Target.model.Permission',
        'Target.store.PermissionUsers',
        'Target.store.PermissionWorkgroups',
        'Target.store.Permissions',
        'common.store.UsersSameGroup'
    ],

    links: {
        currentCatalog: {
            type: 'Target.model.Catalog',
            create: true
        }
    },

    stores: {
        permissions: {
            type: 'permissions'
        },
        permissionUsers: {
            type: 'permission_users'
        },
        permissionWorkgroups: {
            type: 'permission_workgroups'
        },
        users: {
            type: 'users_same_group',
            autoLoad: true,
            storeId: 'Users'
        }
    }
});
