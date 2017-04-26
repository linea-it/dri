from coadd.models import Release, Tag
from django.db import models
from product_classifier.models import ProductClass
from product_classifier.models import ProductClassContent
from product_register.models import ExternalProcess
from current_user import get_current_user
from django.conf import settings


class Product(models.Model):
    prd_owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        verbose_name='Owner', default=None)
    prd_process_id = models.ForeignKey(
        ExternalProcess, on_delete=models.CASCADE, verbose_name='External Process', null=True, blank=True, default=None)
    prd_class = models.ForeignKey(
        ProductClass, on_delete=models.CASCADE, verbose_name='Product class')
    prd_name = models.CharField(
        max_length=128, verbose_name='Internal Name')
    prd_display_name = models.CharField(
        max_length=128, verbose_name='Display Name')
    prd_user_display_name = models.CharField(
        max_length=128, null=True, blank=True, verbose_name='User Display Name')
    prd_product_id = models.CharField(
        max_length=128, null=True, blank=True, verbose_name='Product Id', help_text='Original Product Id')
    prd_version = models.CharField(
        max_length=128, null=True, blank=True, verbose_name='Version')
    prd_description = models.CharField(
        max_length=1024, null=True, blank=True, verbose_name='Description')
    prd_filter = models.ForeignKey(
        'common.Filter', verbose_name='Filter', null=True, blank=True, default=None)
    prd_date = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Date', help_text='Date of registration.')
    prd_is_public = models.BooleanField(
        default=True, verbose_name='Is Public', help_text='Is Public default True')

    releases = models.ManyToManyField(
        Release,
        through='ProductRelease',
        default=None,
        verbose_name='Releases'
    )

    tags = models.ManyToManyField(
        Tag,
        through='ProductTag',
        default=None,
        verbose_name='Tags'
    )

    def __str__(self):
        return self.prd_display_name


class ProductRelease(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE)
    release = models.ForeignKey(
        Release, on_delete=models.CASCADE)


class ProductTag(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE)
    tag = models.ForeignKey(
        Tag, on_delete=models.CASCADE)


class File(Product):
    fli_base_path = models.CharField(
        max_length=256, verbose_name='Base path')
    fli_name = models.CharField(
        max_length=128, verbose_name='Filename with extension')

    def __str__(self):
        return self.fli_name


class Table(Product):
    tbl_database = models.CharField(
        max_length=128, verbose_name='Database', null=True, blank=True, help_text='Database identifier in settings')
    tbl_schema = models.CharField(
        max_length=128, verbose_name='Schema name', null=True, blank=True)
    tbl_name = models.CharField(
        max_length=128, verbose_name='Tablename', help_text='Tablename without schema')
    tbl_rows = models.PositiveIntegerField(
        verbose_name='Num of rows', null=True, blank=True)
    tbl_num_columns = models.PositiveIntegerField(
        verbose_name='Num of columns', null=True, blank=True)
    tbl_size = models.PositiveIntegerField(
        verbose_name='Size in bytes', null=True, blank=True)

    def __str__(self):
        return self.tbl_name


class Catalog(Table):
    ctl_num_objects = models.PositiveIntegerField(
        verbose_name='Num of objects', null=True, blank=True)

    def __str__(self):
        return self.prd_display_name


class Map(Table):
    mpa_nside = models.PositiveSmallIntegerField(
        verbose_name='Nside')
    mpa_ordering = models.CharField(
        max_length=8, verbose_name='Ordering')


class Mask(Table):
    msk_filter = models.CharField(
        max_length=1, verbose_name='Filter')


class ProductContent(models.Model):
    pcn_product_id = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')
    pcn_column_name = models.CharField(
        max_length=256, verbose_name='Column Name')
    pcn_ucd = models.CharField(
        max_length=128, verbose_name='UCD', help_text='The standard unified content descriptor.', null=True, blank=True
    )

    def __str__(self):
        return self.pcn_column_name


class ProductSetting(models.Model):
    cst_product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=get_current_user, verbose_name='Owner')
    cst_display_name = models.CharField(
        max_length=128, verbose_name='Name')
    cst_description = models.CharField(
        max_length=1024, null=True, blank=True, verbose_name='Description')
    cst_is_editable = models.BooleanField(
        default=False, verbose_name='Is Editable')
    cst_is_public = models.BooleanField(
        default=False, verbose_name='Is Public')

    def __str__(self):
        return self.cst_display_name


class CurrentSetting(models.Model):
    cst_product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')
    cst_setting = models.ForeignKey(
        ProductSetting, on_delete=models.CASCADE, verbose_name='Setting')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=get_current_user, verbose_name='Owner')

    def __str__(self):
        return str(self.pk)


class ProductContentAssociation(models.Model):
    pca_product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product', default=None
    )
    pca_class_content = models.ForeignKey(
        ProductClassContent, on_delete=models.CASCADE, verbose_name='Class Content', default=None
    )
    pca_product_content = models.ForeignKey(
        ProductContent, on_delete=models.CASCADE, verbose_name='Product Content', default=None
    )


class ProductContentSetting(models.Model):
    pcs_content = models.ForeignKey(
        ProductContent, on_delete=models.CASCADE, verbose_name='Content', default=None
    )
    pcs_setting = models.ForeignKey(
        ProductSetting, on_delete=models.CASCADE, verbose_name='Setting', default=None, null=True, blank=True
    )
    pcs_is_visible = models.BooleanField(
        default=False, verbose_name='Is Visible'
    )
    pcs_order = models.PositiveIntegerField(
        null=True, blank=True, verbose_name='Order'
    )


# ------------------------------ Cutouts ------------------------------
class CutOutJob(models.Model):
    status_job = (
        # Jobs que ainda nao foram enviados
        ('st', 'Start'),
        # Envio do job para API
        ('bs', 'Submit Job'),
        # Cutout Job enviado e aguardando termino na API
        ('rn', 'Running'),
        # Cutout Job Concluido
        ('ok', 'Done'),
        # Erro no nosso lado
        ('er', 'Error'),
        # Erro com o job no lado da Api.
        ('job_error', 'Job Error'),
    )

    cjb_product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=get_current_user, verbose_name='Owner')

    cjb_display_name = models.CharField(
        max_length=20, verbose_name='Name')

    cjb_xsize = models.CharField(
        max_length=5, verbose_name='Xsize')

    cjb_ysize = models.CharField(
        max_length=5, verbose_name='ysize')

    cjb_job_type = models.CharField(
        max_length=10, verbose_name='JobType')

    cjb_band = models.CharField(
        max_length=10, verbose_name='band', null=True, blank=True)

    cjb_Blacklist = models.CharField(
        max_length=10, verbose_name='Blacklist', null=True, blank=True)

    cjb_status = models.CharField(
        max_length=2,
        choices=status_job,
        default='st',
        verbose_name='Status'
    )

    cjb_job_id = models.CharField(
        max_length=1024, verbose_name='Job ID')

    def __str__(self):
        return str(self.cjb_display_name)


class Cutout(models.Model):
    cjb_cutout_job = models.ForeignKey(
        CutOutJob, on_delete=models.CASCADE, verbose_name='Cutout Job', default=None)
    ctt_object_id = models.CharField(
        max_length=5, verbose_name='Object ID', null=True, blank=True,
        help_text='The association is used to know which column will be considered as id.')
    ctt_object_ra = models.CharField(
        max_length=5, verbose_name='RA', null=True, blank=True,
        help_text='RA in degrees, the association will be used to identify the column')
    ctt_object_dec = models.CharField(
        max_length=5, verbose_name='Dec', null=True, blank=True,
        help_text='Dec in degrees, the association will be used to identify the column')
    ctt_filter = models.ForeignKey(
        'common.Filter', verbose_name='Filter', null=True, blank=True, default=None)
    ctt_thumbname = models.CharField(
        max_length=255, verbose_name='Thumbname', null=True, blank=True, default=None)
    ctt_file_path = models.CharField(
        max_length=4096, verbose_name='File Path', null=True, blank=True, default=None)
    ctt_file_name = models.CharField(
        max_length=255, verbose_name='Filename ', null=True, blank=True, default=None)
    ctt_file_type = models.CharField(
        max_length=5, verbose_name='File Extension', null=True, blank=True, default=None)
    ctt_file_size = models.PositiveIntegerField(
        verbose_name='File Size', null=True, blank=True, default=None, help_text='File Size in bytes')
    ctt_download_start_time = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Download Start')
    ctt_download_finish_time = models.DateTimeField(
        auto_now_add=False, null=True, blank=True, verbose_name='Download finish')

    class Meta:
        unique_together = ('cjb_cutout_job', 'ctt_file_name')

    def __str__(self):
        return str(self.pk)

        # ctt_original_url = models.CharField(
        #     max_length=5, verbose_name='Url to download the file on the cutouts server')


# ------------------------------ Permissoes por Produtos ------------------------------
class Workgroup(models.Model):
    wgp_workgroup = models.CharField(
        max_length=60, verbose_name='Workgroup', help_text='group\'s name')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, default=get_current_user, verbose_name='Owner')

    def __str__(self):
        return str(self.wgp_workgroup)


class WorkgroupUser(models.Model):
    wgu_workgroup = models.ForeignKey(
        Workgroup, on_delete=models.CASCADE, verbose_name='Workgroup')
    wgu_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, verbose_name='User')


class Permission(models.Model):
    prm_product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')
    prm_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, verbose_name='User', null=True, blank=True)
    prm_workgroup = models.ForeignKey(
        Workgroup,
        on_delete=models.CASCADE, verbose_name='Workgroup', null=True, blank=True)
