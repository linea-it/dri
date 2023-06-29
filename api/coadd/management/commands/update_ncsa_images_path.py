from django.core.management.base import BaseCommand, CommandError
from optparse import make_option
from django.db import connection
from django.utils.six.moves import input

def boolean_input(question, default=None):
    result = input("%s " % question)
    if not result and default is not None:
        return default
    while len(result) < 1 or result[0].lower() not in "yn":
        result = input("Please answer yes or no: ")
    return result[0].lower() == "y"

class Command(BaseCommand):
    """
        Guarda uma copia dos paths originais das imagens no NCSA. 
        Copia o valor da coluna coadd_dataset.archive_path para coadd_dataset.ncsa_original_path
        apenas se está estiver vazia. 
        Comando previsto para ser utilizado apenas uma vez em cada ambiente. 
        É uma correção pontual apos as mudanças de path no NCSA e no LInea.
        Issue: #1418 - https://github.com/linea-it/dri/issues/1418
    """
    help = "Stores a copy of the original image paths in the NCSA. Copies the value of the archive_path column to ncsa_original_path only if it is empty. Command intended to be used only once in each environment. it's a one-off fix after the path changes in NCSA and LInea. SQL: UPDATE coadd_dataset cd SET ncsa_original_path = cd.archive_path WHERE cd.ncsa_original_path is null and cd.archive_path is not Null;"

    def handle(self, *args, **options):
        with connection.cursor() as cursor:

            cursor.execute("select count(*) from coadd_dataset cd where ncsa_original_path is null and cd.archive_path is not Null")
            count = cursor.fetchone()[0]
            if count == 0: 
                print("No changes need to be made.")
                return

            print("Command intended to be used only once in each environment.\nIt's a one-off fix after the path changes in NCSA and LInea.\n\n")
            confirm = boolean_input(f"This action will update {count} records in the coadd_dataset table.\nProceed with update yes or no?")

            if confirm == True:
                cursor.execute("UPDATE coadd_dataset cd \
                SET ncsa_original_path = cd.archive_path, \
                ncsa_src_ptif = cd.image_src_ptif \
                WHERE cd.ncsa_original_path is null \
                and cd.archive_path is not Null;")
                print(f"Updated Rows: {cursor.rowcount}")
            else:
                print("No changes were made.")

