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
from coadd import views as coadd_views
from common import views as common_views
from product import views as product_views
from product_classifier import views as product_classifier_views
from product_register import views as product_register_views
from validation import views as validation_views

from catalog import views as catalog_views
from interfaces import views as interfaces_views
from django.conf.urls import url, include
from django.contrib import admin
from rest_framework import routers

router = routers.DefaultRouter()
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
router.register(r'productcontent', product_views.ProductContentViewSet)
router.register(r'productassociation', product_views.ProductContentAssociationViewSet)

router.register(r'feature', validation_views.FeatureViewSet)
router.register(r'flagged', validation_views.FlaggedViewSet)
router.register(r'defect', validation_views.DefectViewSet)

router.register(r'filters', common_views.FilterViewSet)

router.register(r'externalprocess', product_register_views.ExternalProcessViewSet)
router.register(r'application',interfaces_views.ApplicationViewSet)

# API Relacionadas ao Banco de Dados de Catalogo
router.register(r'target', catalog_views.TargetViewSet, base_name='target')
router.register(r'objectsrating', catalog_views.RatingViewSet)
router.register(r'objectsreject', catalog_views.RejectViewSet)

urlpatterns = [
    url(r'^admin/', admin.site.urls),
    url(r'^', include(router.urls)),
    url(r'^api-auth/', include(
        'rest_framework.urls', namespace='rest_framework'))
]
