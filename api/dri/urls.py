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
from django.views.decorators.csrf import csrf_exempt
from interfaces import views as interfaces_views
from product import views as product_views
from product_classifier import views as product_classifier_views
from product_register import views as product_register_views
from rest_framework import routers
from rest_framework.authtoken.views import obtain_auth_token
from validation import views as validation_views

router = routers.DefaultRouter()

router.register(r"logged", common_views.LoggedUserViewSet, basename="logged")
router.register(
    r"users_same_group",
    common_views.UsersInSameGroupViewSet,
    basename="users_same_group",
)

router.register(r"releases", coadd_views.ReleaseViewSet, basename="releases")
router.register(r"tags", coadd_views.TagViewSet)
router.register(r"tiles", coadd_views.TileViewSet)
router.register(r"dataset", coadd_views.DatasetViewSet, basename="dataset")
router.register(
    r"footprints", coadd_views.DatasetFootprintViewSet, basename="footprints"
)
router.register(r"surveys", coadd_views.SurveyViewSet)

router.register(
    r"productclass",
    product_classifier_views.ProductClassViewSet,
    basename="productclass",
)
router.register(
    r"productgroup",
    product_classifier_views.ProductGroupViewSet,
    basename="productgroup",
)
router.register(
    r"productclasscontent", product_classifier_views.ProductClassContentViewSet
)

router.register(r"product", product_views.ProductViewSet)
router.register(r"catalog", product_views.CatalogViewSet)
router.register(r"map", product_views.MapViewSet)
router.register(r"cutoutjob", product_views.CutoutJobViewSet)
router.register(r"cutouts", product_views.CutoutViewSet)
router.register(r"mask", product_views.MaskViewSet)
router.register(r"productrelated", product_views.ProductRelatedViewSet)
router.register(r"productcontent", product_views.ProductContentViewSet)
router.register(r"productassociation", product_views.ProductContentAssociationViewSet, basename="product_content_association")
router.register(r"association", product_views.ProductAssociationViewSet, basename="product_association")
router.register(r"AllProducts", product_views.AllProductViewSet, basename="allproducts")
router.register(r"productsetting", product_views.ProductSettingViewSet)
router.register(r"currentsetting", product_views.CurrentSettingViewSet)
router.register(r"contentsetting", product_views.ProductContentSettingViewSet)
router.register(r"product_permission_user", product_views.PermissionUserViewSet, basename="product_permission_user")
router.register(
    r"product_permission_workgroup_user", product_views.PermissionWorkgroupUserViewSet, basename="product_permission_workgroup"
)
router.register(r"product_permission", product_views.PermissionViewSet, basename="product_permission")
router.register(r"workgroup", product_views.WorkgroupViewSet)
router.register(r"workgroup_users", product_views.WorkgroupUserViewSet)
router.register(r"filterset", product_views.FiltersetViewSet)
router.register(r"filtercondition", product_views.FilterConditionViewSet)
router.register(r"bookmarked", product_views.BookmarkedViewSet)
router.register(
    r"productexport", product_views.ExportViewSet, basename="export_product"
)
router.register(
    r"productsaveas", product_views.SaveAsViewSet, basename="product_save_as"
)
router.register(
    r"import_target_list",
    product_views.ImportTargetListViewSet,
    basename="import_target_list",
)

router.register(r"feature", validation_views.FeatureViewSet)
router.register(r"flagged", validation_views.FlaggedViewSet)
router.register(r"defect", validation_views.DefectViewSet)
router.register(r"inspect", validation_views.InspectViewSet)


router.register(r"filters", common_views.FilterViewSet)

router.register(r"site", product_register_views.SiteViewSet)
router.register(
    r"importexternalprocess",
    product_register_views.ExternalProcessImportViewSet,
    basename="importprocess",
)
router.register(r"importauthorization", product_register_views.AuthorizationViewSet)

router.register(r"application", interfaces_views.ApplicationViewSet)
router.register(r"tutorial", interfaces_views.TutorialViewSet)

# API Relacionadas ao Banco de Dados de Catalogo
router.register(r"target", catalog_views.TargetViewSet, basename="target")
router.register(r"objectsrating", catalog_views.RatingViewSet)
router.register(r"objectsreject", catalog_views.RejectViewSet)
router.register(r"objectscomments", catalog_views.CommentsViewSet)
router.register(
    r"catalogobjects", catalog_views.CatalogObjectsViewSet, basename="catalog_objects"
)

# Comment API
router.register(r"comment/position", comment_views.PositionViewSet)
router.register(r"comment/dataset", comment_views.CommentDatasetViewSet, basename="dataset_comment")

# Aladin API
router.register(r"aladin/image", aladin_views.ImageViewSet)

# Statistics API
router.register(r"statistics", statistics_views.ActivityStatisticViewSet)

providers = common_views.get_providers()

urlpatterns = [
    url(r"^admin/", admin.site.urls),
    url(r"^dri/api/", include(router.urls)),
    url(r"^dri/api/contact/", common_views.contact_us),
    url(r"^dri/api/get_fits_by_tilename", coadd_views.get_fits_by_tilename),
    url(r"^dri/api/vizier/", product_views.vizier_cds),
    url(r"^dri/api/send_statistic_email/", common_views.send_statistic_email),
    url(r"^dri/api/available_database/", common_views.available_database),
    url(r"^dri/api/get_ncsa_signup/", common_views.get_ncsa_signup),
    url(r"^dri/api/teste/", common_views.teste),
    # Plugin externos em docker ex: galaxy_cluster
    url(r"^plugin/galaxy_cluster", common_views.galaxy_cluster),
    url(r"^dri/api/obtain-auth-token/$", csrf_exempt(obtain_auth_token)),
    url(r"^dri/api/get_token", common_views.get_token),
    url(r"^dri/api/get_setting/$", common_views.get_setting),
    url(
        r"^dri/api/api-auth/",
        include("rest_framework.urls", namespace="rest_framework"),
        {"extra_context": {"providers": providers}},
    ),
]
