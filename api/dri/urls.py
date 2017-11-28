"""dri URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from activity_statistic import views as statistics_views
from aladin import views as aladin_views
from catalog import views as catalog_views
from coadd import views as coadd_views
from comment import views as comment_views
from common import views as common_views
from django.conf import settings
from django.conf.urls import url, include
from django.contrib import admin
from interfaces import views as interfaces_views
from product import views as product_views
from product_classifier import views as product_classifier_views
from product_register import views as product_register_views
from rest_framework import routers
from validation import views as validation_views
from userquery import views as userquery_views

router = routers.DefaultRouter()

router.register(r'logged', common_views.LoggedUserViewSet, base_name='logged')
router.register(r'users_same_group', common_views.UsersInSameGroupViewSet, base_name='users_same_group')

router.register(r'releases', coadd_views.ReleaseViewSet)
router.register(r'tags', coadd_views.TagViewSet)
router.register(r'tiles', coadd_views.TileViewSet)
router.register(r'dataset', coadd_views.DatasetViewSet, base_name='dataset')
router.register(r'footprints', coadd_views.DatasetFootprintViewSet, base_name='footprints')
router.register(r'surveys', coadd_views.SurveyViewSet)

router.register(r'productclass', product_classifier_views.ProductClassViewSet, base_name='productclass')
router.register(r'productgroup', product_classifier_views.ProductGroupViewSet, base_name='productgroup')
router.register(r'productclasscontent', product_classifier_views.ProductClassContentViewSet)

router.register(r'product', product_views.ProductViewSet)
router.register(r'catalog', product_views.CatalogViewSet)
router.register(r'map', product_views.MapViewSet)
router.register(r'cutoutjob', product_views.CutoutJobViewSet)
router.register(r'cutouts', product_views.CutoutViewSet)
router.register(r'mask', product_views.MaskViewSet)
router.register(r'productrelated', product_views.ProductRelatedViewSet)
router.register(r'productcontent', product_views.ProductContentViewSet)
router.register(r'productassociation', product_views.ProductContentAssociationViewSet)
router.register(r'association', product_views.ProductAssociationViewSet)
router.register(r'AllProducts', product_views.AllProductViewSet, base_name='allproducts')
router.register(r'productsetting', product_views.ProductSettingViewSet)
router.register(r'currentsetting', product_views.CurrentSettingViewSet)
router.register(r'contentsetting', product_views.ProductContentSettingViewSet)
router.register(r'product_permission_user', product_views.PermissionUserViewSet)
router.register(r'product_permission_workgroup_user', product_views.PermissionWorkgroupUserViewSet)
router.register(r'product_permission', product_views.PermissionViewSet)
router.register(r'workgroup', product_views.WorkgroupViewSet)
router.register(r'workgroup_users', product_views.WorkgroupUserViewSet)
router.register(r'filterset', product_views.FiltersetViewSet)
router.register(r'filtercondition', product_views.FilterConditionViewSet)
router.register(r'bookmarked', product_views.BookmarkedViewSet)
router.register(r'productexport', product_views.ExportViewSet, base_name='export_product')
router.register(r'productsaveas', product_views.SaveAsViewSet, base_name='product_save_as')
router.register(r'import_target_list', product_views.ImportTargetListViewSet, base_name='import_target_list')

router.register(r'feature', validation_views.FeatureViewSet)
router.register(r'flagged', validation_views.FlaggedViewSet)
router.register(r'defect', validation_views.DefectViewSet)

router.register(r'filters', common_views.FilterViewSet)

router.register(r'site', product_register_views.SiteViewSet)
router.register(r'importexternalprocess', product_register_views.ExternalProcessImportViewSet,
                base_name='importprocess')
router.register(r'importauthorization', product_register_views.AuthorizationViewSet)

router.register(r'application', interfaces_views.ApplicationViewSet)
router.register(r'tutorial', interfaces_views.TutorialViewSet)

# API Relacionadas ao Banco de Dados de Catalogo
router.register(r'target', catalog_views.TargetViewSet, base_name='target')
router.register(r'objectsrating', catalog_views.RatingViewSet)
router.register(r'objectsreject', catalog_views.RejectViewSet)
router.register(r'objectscomments', catalog_views.CommentsViewSet)
router.register(r'catalogobjects', catalog_views.CatalogObjectsViewSet, base_name='catalog_objects')

# Comment API
router.register(r'comment/position', comment_views.PositionViewSet)

# UserQuery API
router.register(r'userquery_query', userquery_views.QueryViewSet)
router.register(r'userquery_sample', userquery_views.SampleViewSet)
router.register(r'userquery_job', userquery_views.JobViewSet)
router.register(r'userquery_table', userquery_views.TableViewSet)
router.register(r'userquery_validate', userquery_views.QueryValidate, base_name='validate_query')
router.register(r'userquery_preview', userquery_views.QueryPreview, base_name='preview_query')
router.register(r'userquery_create_table', userquery_views.CreateTable, base_name='create_table')
router.register(r'userquery_properties', userquery_views.TableProperties, base_name='table')
router.register(r'userquery_target', userquery_views.TargetViewerRegister, base_name='target_viewer_register')

# Aladin API
router.register(r'aladin/image', aladin_views.ImageViewSet)

# Statistics API
router.register(r'statistics', statistics_views.ActivityStatisticViewSet)

providers = common_views.get_providers()

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^admin', admin.site.urls),
    url(r'^', include(router.urls)),
    url(r'^contact/', common_views.contact_us),
    url(r'^get_fits_by_tilename', coadd_views.get_fits_by_tilename),
    url(r'^vizier/', product_views.vizier_cds),
    url(r'^teste/', common_views.teste),
    url(r'^get_token', common_views.get_token),
    url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'),
        {'extra_context': {'providers': providers}}),
]

if settings.USE_OAUTH:
    urlpatterns += (url(r'^accounts/', include('allauth.urls')),)
