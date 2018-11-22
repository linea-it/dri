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

router.register(r'dri/api/logged', common_views.LoggedUserViewSet, base_name='logged')
router.register(r'dri/api/users_same_group', common_views.UsersInSameGroupViewSet, base_name='users_same_group')

router.register(r'dri/api/releases', coadd_views.ReleaseViewSet)
router.register(r'dri/api/tags', coadd_views.TagViewSet)
router.register(r'dri/api/tiles', coadd_views.TileViewSet)
router.register(r'dri/api/dataset', coadd_views.DatasetViewSet, base_name='dataset')
router.register(r'dri/api/footprints', coadd_views.DatasetFootprintViewSet, base_name='footprints')
router.register(r'dri/api/surveys', coadd_views.SurveyViewSet)

router.register(r'dri/api/productclass', product_classifier_views.ProductClassViewSet, base_name='productclass')
router.register(r'dri/api/productgroup', product_classifier_views.ProductGroupViewSet, base_name='productgroup')
router.register(r'dri/api/productclasscontent', product_classifier_views.ProductClassContentViewSet)

router.register(r'dri/api/product', product_views.ProductViewSet)
router.register(r'dri/api/catalog', product_views.CatalogViewSet)
router.register(r'dri/api/map', product_views.MapViewSet)
router.register(r'dri/api/cutoutjob', product_views.CutoutJobViewSet)
router.register(r'dri/api/cutouts', product_views.CutoutViewSet)
router.register(r'dri/api/mask', product_views.MaskViewSet)
router.register(r'dri/api/productrelated', product_views.ProductRelatedViewSet)
router.register(r'dri/api/productcontent', product_views.ProductContentViewSet)
router.register(r'dri/api/productassociation', product_views.ProductContentAssociationViewSet)
router.register(r'dri/api/association', product_views.ProductAssociationViewSet)
router.register(r'dri/api/AllProducts', product_views.AllProductViewSet, base_name='allproducts')
router.register(r'dri/api/productsetting', product_views.ProductSettingViewSet)
router.register(r'dri/api/currentsetting', product_views.CurrentSettingViewSet)
router.register(r'dri/api/contentsetting', product_views.ProductContentSettingViewSet)
router.register(r'dri/api/product_permission_user', product_views.PermissionUserViewSet)
router.register(r'dri/api/product_permission_workgroup_user', product_views.PermissionWorkgroupUserViewSet)
router.register(r'dri/api/product_permission', product_views.PermissionViewSet)
router.register(r'dri/api/workgroup', product_views.WorkgroupViewSet)
router.register(r'dri/api/workgroup_users', product_views.WorkgroupUserViewSet)
router.register(r'dri/api/filterset', product_views.FiltersetViewSet)
router.register(r'dri/api/filtercondition', product_views.FilterConditionViewSet)
router.register(r'dri/api/bookmarked', product_views.BookmarkedViewSet)
router.register(r'dri/api/productexport', product_views.ExportViewSet, base_name='export_product')
router.register(r'dri/api/productsaveas', product_views.SaveAsViewSet, base_name='product_save_as')
router.register(r'dri/api/import_target_list', product_views.ImportTargetListViewSet, base_name='import_target_list')

router.register(r'dri/api/feature', validation_views.FeatureViewSet)
router.register(r'dri/api/flagged', validation_views.FlaggedViewSet)
router.register(r'dri/api/defect', validation_views.DefectViewSet)

router.register(r'dri/api/filters', common_views.FilterViewSet)

router.register(r'dri/api/site', product_register_views.SiteViewSet)
router.register(r'dri/api/importexternalprocess', product_register_views.ExternalProcessImportViewSet,
                base_name='importprocess')
router.register(r'dri/api/importauthorization', product_register_views.AuthorizationViewSet)

router.register(r'dri/api/application', interfaces_views.ApplicationViewSet)
router.register(r'dri/api/tutorial', interfaces_views.TutorialViewSet)

# API Relacionadas ao Banco de Dados de Catalogo
router.register(r'dri/api/target', catalog_views.TargetViewSet, base_name='target')
router.register(r'dri/api/objectsrating', catalog_views.RatingViewSet)
router.register(r'dri/api/objectsreject', catalog_views.RejectViewSet)
router.register(r'dri/api/objectscomments', catalog_views.CommentsViewSet)
router.register(r'dri/api/catalogobjects', catalog_views.CatalogObjectsViewSet, base_name='catalog_objects')

# Comment API
router.register(r'dri/api/comment/position', comment_views.PositionViewSet)

# UserQuery API
router.register(r'dri/api/userquery_query', userquery_views.QueryViewSet)
router.register(r'dri/api/userquery_sample', userquery_views.SampleViewSet)
router.register(r'dri/api/userquery_job', userquery_views.JobViewSet)
router.register(r'dri/api/userquery_table', userquery_views.TableViewSet)
router.register(r'dri/api/userquery_validate', userquery_views.QueryValidate, base_name='validate_query')
router.register(r'dri/api/userquery_preview', userquery_views.QueryPreview, base_name='preview_query')
router.register(r'dri/api/userquery_property', userquery_views.TableProperties, base_name='table')
router.register(r'dri/api/userquery_target', userquery_views.TargetViewerRegister, base_name='target_viewer_register')
router.register(r'dri/api/userquery_download', userquery_views.TableDownload, base_name='table_download')

# Aladin API
router.register(r'dri/api/aladin/image', aladin_views.ImageViewSet)

# Statistics API
router.register(r'dri/api/statistics', statistics_views.ActivityStatisticViewSet)

providers = common_views.get_providers()

urlpatterns = [
    url(r'^dri/api/admin/', admin.site.urls),
    url(r'^dri/api/admin', admin.site.urls),
    url(r'^dri/api/', include(router.urls)),
    url(r'^dri/api/contact/', common_views.contact_us),
    url(r'^dri/api/get_fits_by_tilename', coadd_views.get_fits_by_tilename),
    url(r'^dri/api/vizier/', product_views.vizier_cds),
    url(r'^dri/api/send_statistic_email/', common_views.send_statistic_email),
    url(r'^dri/api/teste/', common_views.teste),


    # Plugin externos em docker ex: galaxy_cluster
    url(r'^dri/api/plugin/galaxy_cluster', common_views.galaxy_cluster),



    url(r'^dri/api/get_token', common_views.get_token),
    url(r'^dri/api/get_setting/$', common_views.get_setting),
    url(r'^dri/api/api-auth/', include('rest_framework.urls', namespace='rest_framework'),
        {'extra_context': {'providers': providers}}),
]

if settings.USE_OAUTH:
    urlpatterns += (url(r'^dri/api/accounts/', include('allauth.urls')),)
