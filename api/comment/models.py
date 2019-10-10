from django.conf import settings
from django.db import models

from coadd.models import Dataset as CoaddDataset
from common.models import Filter
from current_user import get_current_user


class Position(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name='Owner',
        on_delete=models.SET_NULL,
        null=True, blank=True, )
    pst_dataset = models.ForeignKey(
        CoaddDataset,
        on_delete=models.CASCADE, verbose_name='Dataset', default=None, null=True, blank=True)
    pst_ra = models.FloatField(
        verbose_name='RA (deg)')
    pst_dec = models.FloatField(
        verbose_name='Dec (deg)')
    pst_date = models.DateTimeField(
        auto_now_add=True, verbose_name='Date')
    pst_comment = models.TextField(
        max_length=2048, verbose_name='Comment')

    def __str__(self):
        return str(self.pk)


class Dataset(models.Model):
    """
    Comentario por Dataset.

    O Comentário pode ser de 3 tipos. 

    0 - User Comment: Um comentario simples feito pelos usuarios. pode ter qualquer conteudo. 
        este comentario pode estar associado a uma coordenada ou nao.
    1 - Validation History: Comentario automatico que indica o usuario e data de uma validacao.
        tem a funcao de guardar um historico de quais usuarios inspecionaram um dataset. 
        e relacionado a tabela validation.Inspect. a tabela inspect so tem o registro mais recente. 
        para este tipo as coordendas o valor deve ser null.
    2 - Reported Issue: Comentario representa um defeito identificado. um dataset pode ter um ou varios issues. 
        cada issue é um comentario automatico com a posicao e nome da issue (validation.Feature). 
        e esta relacionado a tabela validation.Defect

    """
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, null=True, blank=True,)
    dts_dataset = models.ForeignKey(
        CoaddDataset,
        on_delete=models.CASCADE,
        verbose_name='Dataset',
        related_name='comments')

    dts_type = models.CharField(
        max_length=1,
        verbose_name='Type',
        default='0',
        help_text='Differentiate user comments from automatic validation or defect comments.',
        choices=(
            ('0', 'User Comment'),
            ('1', 'Validation History'),
            ('2', 'Reported Issue'),
        )
    )
    dts_date = models.DateTimeField(
        auto_now_add=True, verbose_name='Date')
    dts_comment = models.TextField(
        max_length=2048, verbose_name='Comment')

    dts_ra = models.FloatField(
        verbose_name='RA (deg)',
        default=None,
        null=True, blank=True
    )
    dts_dec = models.FloatField(
        verbose_name='Dec (deg)',
        default=None,
        null=True, blank=True
    )

    def __str__(self):
        return str(self.pk)
