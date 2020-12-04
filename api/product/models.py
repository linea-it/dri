from operator import index
from django.db.models.signals import post_save, pre_delete
from coadd.models import Release, Tag
from django.db import models
from product_classifier.models import ProductClass
from product_classifier.models import ProductClassContent
from product_register.models import ExternalProcess
from current_user import get_current_user
from django.conf import settings


class Product(models.Model):
    """
        Este Model possui um Signal conectado a ele
        toda vez que este model disparar o evento pre_delete
        o metodo drop_product_table do arquivo .signals sera executado.
        este metodo ira remover a tabela de catalogo a qual se refere o produto

        OBS: este signal esta no final do arquivo. para evitar erros de import.
    """
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
        'common.Filter', verbose_name='Filter', on_delete=models.CASCADE, null=True, blank=True, default=None)
    prd_date = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Date', help_text='Date of registration.')
    prd_is_public = models.BooleanField(
        default=False, verbose_name='Is Public', help_text='Is Public default False')

    prd_is_permanent = models.BooleanField(
        default=False, verbose_name='Is Permanent', help_text='Is Permanent default False, True so this product is not removed by the garbage collector')

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
    tbl_rows = models.BigIntegerField(
        verbose_name='Num of rows', null=True, blank=True)
    tbl_num_columns = models.PositiveIntegerField(
        verbose_name='Num of columns', null=True, blank=True)
    tbl_size = models.BigIntegerField(
        verbose_name='Size in bytes', null=True, blank=True)

    def __str__(self):
        return self.tbl_name


class Catalog(Table):
    ctl_num_objects = models.PositiveIntegerField(
        verbose_name='Num of objects',
        null=True,
        blank=True)

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
        on_delete=models.CASCADE, null=True, blank=True, verbose_name='Owner')
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
        on_delete=models.CASCADE, null=True, blank=True, verbose_name='Owner')

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


class ProductRelated(models.Model):

    relation_types = (
        # join quando um produto esta ligado ao outro atraves de uma property com ucd meta.id.cross
        ('join', 'Join'),
        # input quando um produto foi usado como input na geracao do outro, o related representa o input.
        ('input', 'Input'),
    )

    prl_product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product'
    )
    prl_related = models.ForeignKey(
        Product, related_name="relateds", on_delete=models.CASCADE, verbose_name='Related Product'
    )
    prl_relation_type = models.CharField(
        max_length=10,
        choices=relation_types,
        default='join',
        verbose_name='Relation Type'
    )

    prl_cross_identification = models.ForeignKey(
        ProductContent, on_delete=models.CASCADE, verbose_name='Cross Identification', default=None,
        null=True, blank=True, help_text="Foreign key between the product and the related product",
    )

    def __str__(self):
        return str(self.pk)


# ------------------------------ Cutouts ------------------------------
class CutOutJob(models.Model):
    """
        Este Model possui um Signal conectado a ele. 
    """
    status_job = (
        # Jobs que ainda nao foram enviados
        ('st', 'Start'),
        # Envio do job para API
        ('bs', 'Submit Job'),
        # Cutout Job enviado e aguardando termino na API
        ('rn', 'Running'),
        # Before Download o job terminou mais ainda nao comecou a ser baixado
        ('bd', 'Before Download'),
        # Downloading
        ('dw', 'Downloading'),
        # Cutout Job Concluido
        ('ok', 'Done'),
        # Erro no nosso lado
        ('er', 'Error'),
        # Erro com o job no lado da Api.
        ('je', 'Job Error'),
        # Marcado como Deletado
        ('dl', 'Delete'),
    )

    cjb_product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, null=True, blank=True, verbose_name='Owner')

    cjb_display_name = models.CharField(
        max_length=40, verbose_name='Name')

    cjb_tag = models.CharField(
        max_length=60, verbose_name='Release Tag', null=True, blank=True)

    cjb_xsize = models.CharField(
        max_length=5, verbose_name='Xsize', help_text='xsize in arcmin, default is 1.0', default='1.0')

    cjb_ysize = models.CharField(
        max_length=5, verbose_name='ysize', help_text='ysize in arcmin, default is 1.0', default='1.0')

    cjb_make_fits = models.BooleanField(
        verbose_name='Make Fits', default=False, help_text='Generate cutout data files in FITS format')

    cjb_fits_colors = models.CharField(
        max_length=10, verbose_name='Fits Colors', null=True, blank=True, default="grizy", help_text="Color bands to output (string value containing characters from the set 'grizy').")

    # OBS: A criação de imagens Stiff estão ligadas por default.
    cjb_make_stiff = models.BooleanField(
        verbose_name='Make Stiff', default=True, help_text='Generate cutout data files in RGB color using STIFF format')

    cjb_stiff_colors = models.CharField(
        max_length=20, verbose_name='Stiff Colors', null=True, blank=True, default="gri;rig;zgi",
        help_text="Sets of color band triplets, delineated by semi-colons, denoting by letter ordering the bands to use for Red, Green, Blue in the generated RGB images in STIFF format. Example: gri;zgi will produce two RGB images with Red/Green/Blue using bands G/R/I and Z/G/I, respectively.")

    cjb_make_lupton = models.BooleanField(
        verbose_name='Make Lupton', default=False, help_text='Generate cutout data files in RGB color using the Lupton method')

    cjb_lupton_colors = models.CharField(
        max_length=20, verbose_name='Lupton Colors', null=True, blank=True, default="gri;rig;zgi",
        help_text="Sets of color band triplets, delineated by semi-colons, denoting by letter ordering the bands to use for Red, Green, Blue in the generated RGB images in Lupton format. Example: gri;zgi will produce two RGB images with Red/Green/Blue using bands G/R/I and Z/G/I, respectively.")

    cjb_status = models.CharField(
        max_length=25,
        choices=status_job,
        default='st',
        verbose_name='Status'
    )

    # Fields Referentes as labels que serao aplicadas ao cutout
    cjb_label_position = models.CharField(
        max_length=10, verbose_name='Label Position', choices=(('inside', 'Inside'), ('outside', 'Outside')),
        null=True, blank=True, default='outside',
        help_text="This field determines the position of the labels, 'inside' for labels on the image and 'outside' for labels outside the image.")

    cjb_label_properties = models.CharField(
        max_length=1024, verbose_name='Label Properties', null=True, blank=True,
        help_text="A list with the ids of the properties that will be used as a label. (Id = ProductContent.pk)")

    cjb_label_colors = models.CharField(
        max_length=6, verbose_name='Label Font Colors', null=True, blank=True)

    cjb_label_font_size = models.PositiveIntegerField(
        verbose_name='Label Font Size', default=10, null=True, blank=True, help_text='Font size in px.')

    cjb_cutouts_path = models.TextField(
        max_length=4096, verbose_name='Cutout Paths',
        null=True, blank=True, default=None, help_text="Path of the directory where the cutouts of this job are.")

    cjb_start_time = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Start')

    cjb_finish_time = models.DateTimeField(
        auto_now_add=False, null=True, blank=True, verbose_name='Finish')

    cjb_description = models.CharField(
        max_length=1024, verbose_name='Description', null=True, blank=True)

    cjb_files = models.PositiveIntegerField(
        verbose_name='Files', null=True, blank=True, default=None, help_text='Total of files generated in this job')

    cjb_file_size = models.PositiveIntegerField(
        verbose_name='File Size', null=True, blank=True, default=None, help_text='Total size of files generated in this job')

    cjb_error = models.TextField(
        verbose_name='Error Message', null=True, blank=True)

    def __str__(self):
        return str(self.cjb_display_name)


class Desjob(models.Model):
    djb_cutout_job = models.ForeignKey(
        CutOutJob, on_delete=models.CASCADE, verbose_name='Cutout Job', default=None)

    djb_jobid = models.CharField(
        max_length=1024, verbose_name='DES Job ID', db_index=True, null=True, blank=True, help_text="Descut job id that generated the image.")

    djb_status = models.CharField(
        max_length=20, verbose_name='DES Job Status', null=True, blank=True)

    djb_message = models.TextField(
        verbose_name='DES Job Message', null=True, blank=True)

    djb_start_time = models.DateTimeField(
        auto_now_add=True, null=True, blank=True, verbose_name='Start')

    djb_finish_time = models.DateTimeField(
        auto_now_add=False, null=True, blank=True, verbose_name='Finish')

    class Meta:
        unique_together = ('djb_cutout_job', 'djb_jobid')

    def __str__(self):
        return str(self.pk)


class Cutout(models.Model):
    cjb_cutout_job = models.ForeignKey(
        CutOutJob, on_delete=models.CASCADE, verbose_name='Cutout Job', default=None)
    cjb_des_job = models.ForeignKey(
        Desjob, on_delete=models.CASCADE, verbose_name='Des Job', default=None)
    ctt_object_id = models.CharField(
        max_length=5, verbose_name='Object ID', null=True, blank=True,
        help_text='The association is used to know which column will be considered as id.')
    ctt_object_ra = models.CharField(
        max_length=10, verbose_name='RA', null=True, blank=True,
        help_text='RA in degrees, the association will be used to identify the column')
    ctt_object_dec = models.CharField(
        max_length=10, verbose_name='Dec', null=True, blank=True,
        help_text='Dec in degrees, the association will be used to identify the column')
    ctt_img_format = models.TextField(
        max_length=10, verbose_name='Image Format', null=True, blank=True, default=None, help_text="Image file format can be fits, stiff, or lupton.")
    ctt_filter = models.ForeignKey(
        'common.Filter', verbose_name='Filter', on_delete=models.CASCADE, null=True, blank=True, default=None)
    ctt_file_path = models.TextField(
        max_length=4096, verbose_name='File Path', null=True, blank=True, default=None)
    ctt_file_name = models.CharField(
        max_length=255, verbose_name='Filename ', null=True, blank=True, default=None)
    ctt_file_type = models.CharField(
        max_length=5, verbose_name='File Extension', null=True, blank=True, default=None)
    ctt_file_size = models.PositiveIntegerField(
        verbose_name='File Size', null=True, blank=True, default=None, help_text='File Size in bytes')
    ctt_jobid = models.CharField(
        max_length=1024, verbose_name='DES Job ID', null=True, blank=True, help_text="Descut job id that generated the image.")

    class Meta:
        unique_together = ('cjb_cutout_job', 'ctt_file_name')

        index_together = [
            ["cjb_cutout_job", "ctt_object_id"],
        ]

    def __str__(self):
        return "{} - {}".format(str(self.pk), self.ctt_file_name)


# ------------------------------ Permissoes por Produtos ------------------------------
class Workgroup(models.Model):
    wgp_workgroup = models.CharField(
        max_length=60, verbose_name='Workgroup', help_text='group\'s name')
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, null=True, blank=True, verbose_name='Owner')

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


# ---------------------------------- Filtros ----------------------------------
# Filtros que podem ser aplicados a um produto

class Filterset(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, null=True, blank=True, verbose_name='Owner')

    fst_name = models.CharField(
        max_length=60, verbose_name='Filterset', help_text='Filterset Display Name')

    def __str__(self):
        return str(self.fst_name)


class FilterCondition(models.Model):
    filterset = models.ForeignKey(
        Filterset, on_delete=models.CASCADE, verbose_name='Filterset')

    fcd_property = models.ForeignKey(
        ProductContent, on_delete=models.CASCADE, verbose_name='Property', null=True, blank=True, default=None
    )

    fcd_property_name = models.CharField(
        max_length=60, verbose_name='Operator', null=True, blank=True, default=None,
        help_text='Name of the property like this in the database'
    )

    fcd_operation = models.CharField(
        max_length=10, verbose_name='Operator')

    fcd_value = models.CharField(
        max_length=10, verbose_name='Value')

    def __str__(self):
        return str("%s %s %s" % (self.fcd_property, self.fcd_operation, self.fcd_value))


# ---------------------------------- Bookmark ----------------------------------

class BookmarkProduct(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, verbose_name='Product')

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, null=True, blank=True, verbose_name='Owner')

    is_starred = models.BooleanField(
        default=False, verbose_name='Is Starred')

    class Meta:
        unique_together = ('product', 'owner')

    def __str__(self):
        return str(self.pk)


# -------------------------------- Signals --------------------------------------
# Esses signals connect devem ficar no final do arquivo para nao dar problema de import.
# pylint: disable = E402
# from .signals import start_des_cutout_job, drop_product_table
# post_save.connect(start_des_cutout_job, sender=CutOutJob)
# pre_delete.connect(drop_product_table, sender=Product)
