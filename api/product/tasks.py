from __future__ import absolute_import, unicode_literals
from celery import task
from celery.task.schedules import crontab
from celery.decorators import periodic_task
from celery import group
from product.descutoutservice import DesCutoutService
import math

descutout = DesCutoutService()

@task(name="start_des_cutout_job_by_id")
def start_des_cutout_job_by_id(id):
    """
        Esta Task vai instanciar a Classe DesCutoutService,
        executar o methodo start_job_by_id
        esse job vai enviar o job para o servico do des.

        :param id: Chave pk do model product.CutOutModel
    """
    print("start_des_cutout_job_by_id(%s)" % id)
    descutout.start_job_by_id(int(id))


# @periodic_task(
#     # run_every=(crontab(minute='*/1')),
#     run_every=10.0,
#     name="check_jobs_running",
#     ignore_result=True
# )
def check_jobs_running():
    """
        Recupera todos os cutoutjobs com status Running
        e verifica no servico DESCutout o status do job
        e os marca com status
    """
    descutout.check_jobs()


@periodic_task(
    run_every=(crontab(minute='*/1')),
    # run_every=10.0,
    name="check_jobs_to_be_downloaded",
    ignore_result=True
)
def check_jobs_to_be_downloaded():
    logger = descutout.logger

    number_task = 3

    # Recuperar todos os jobs com status Before Downloading
    cutoutjobs = descutout.get_cutoutjobs_by_status('bd')


    if cutoutjobs.count() > 0:

        logger.info("There are %s jobs waiting to start downloading" % cutoutjobs.count())

        for cutoutjob in cutoutjobs:

            # cutoutjob.cjb_status = 'dw'
            # cutoutjob.save()

            cutoutdir = descutout.get_cutout_dir(cutoutjob)

            allarqs = list()

            # Recuperar o arquivo de Results
            with open(cutoutjob.cjb_results_file, 'r') as result_file:
                lines = result_file.readlines()
                for url in lines:
                    arq = descutout.parse_result_url(url)

                    # TODO adicionar um parametro para decidir se baixa somente os arquivos pngs.
                    if arq.get('file_type') == 'png':
                        allarqs.append(arq)

            result_file.close()
            total_files = len(allarqs)

            arqs_per_tasks = math.ceil(total_files / number_task)

            group_id = 0
            tasks = list()
            while (group_id < number_task):
                # Criar grupos para a task download file
                arqs = list()
                while (len(arqs) < arqs_per_tasks):
                    try:
                        arqs.append(allarqs.pop())
                    except:
                        break


                logger.debug("Group: %s Arqs: %s" % (group_id, len(arqs)))


                task = download_files.s(arqs, cutoutdir, group_id)
                tasks.append(task)


                group_id = group_id + 1

            a = group(tasks)
            result = a.apply_async()
            result.then(test_callback())
            # for g in groups:
            #     g.apply_async()

            #     print(g.get('arqs'))
            #     arqs = g.get('arqs')
            #     jobs = group(download_files.s(arqs, cutoutdir, g.get('group_id')))
            #     jobs.apply_async()


@task(name="download_files")
def download_files(arqs, dir, group_id):
    logger = descutout.logger
    import time
    for arq in arqs:
        logger.debug("Download Group [ %s ] File: %s" % (group_id, arq.get('filename')))

        time.sleep(60)

        # descutout.download_file(
        #     arq.get('url'),
        #     dir,
        #     arq.get('filename')
        # )

@task(name="test_callback")
def test_callback():
    print("TESTE CALLBACK")