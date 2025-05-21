from .models import Activity
from .models import Visit
from datetime import datetime, date
from django.db.models import Count
from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from smtplib import SMTPException
from common.notify import Notify
import logging


class ActivityReports:
    def __init__(self):
        pass

    def unique_visits_by_date(self, year, month, day):

        log = logging.getLogger("send_email")
        log.info("Unique Visits by date %s/%s/%s." % (year, month, day))

        users = list()
        uniqueVisits = list()

        activities = Activity.objects.filter(
            date__year=year, date__month=month, date__day=day
        ).order_by("-date")

        for activity in activities:

            if activity.owner.pk not in users:
                users.append(activity.owner.pk)

                # Recuperar a visita
                visit = self.get_or_create_unique_visit(activity)

        # Recuperar os usuarios que visitaram neste dia + o total de visitas dele no mes
        visits_count = Visit.objects.filter(
            date__year=year, date__month=month, date__day=day, owner__pk__in=users
        ).order_by("-date")

        for a in visits_count:
            try:

                # Recupera as visitas unicas por neste mes por cada usuario.
                visits_month = self.get_visits_in_month_by_user(
                    user=a.owner, year=year, month=month
                )

                all_visits = self.get_all_visits_by_user(user=a.owner)

                try:
                    display_name = a.owner.profile.display_name
                    if display_name is None:
                        display_name = a.owner.username
                except:
                    display_name = a.owner.username

                uniqueVisits.append(
                    dict(
                        {
                            "user": display_name,
                            "last_activity": a.date.strftime("%d-%m-%Y %H:%M"),
                            "visits_in_month": visits_month,
                            "all_visits": all_visits,
                        }
                    )
                )
            except:
                log.warning("Skiped visit missing data.")

        return uniqueVisits

    def unique_visits_today(self):
        today = date.today()

        return self.unique_visits_by_date(today.year, today.month, today.day)

    def get_all_distinct_visits(self):
        """
            Retorna todas uma lista com todos os usuarios e o total de suas visitas.
        :return:
        """
        users = list()
        result = list()

        # Recuperar os usuarios que visitaram neste dia + o total de visitas dele no mes
        all_visits = Visit.objects.filter().order_by("-date")

        for visit in all_visits:
            try:
                if visit.owner.username not in users:

                    users.append(visit.owner.username)

                    all_visits = self.get_all_visits_by_user(user=visit.owner)

                    try:
                        display_name = visit.owner.profile.display_name
                        if display_name is None:
                            display_name = visit.owner.username
                    except:
                        display_name = visit.owner.username

                    result.append(
                        dict(
                            {
                                "user": display_name,
                                "last_activity": visit.date.strftime("%d-%m-%Y %H:%M"),
                                "all_visits": all_visits,
                            }
                        )
                    )
            except:
                pass

        return result

    def get_visits_in_month_by_user(self, user, year, month):
        """
            Retorna o total de acessos de um usuario em um mes.
            OBS: e sempre considerado um unico acesso por dia.
        :param user:
        :param year:
        :param month:
        :return:
        """

        return Visit.objects.filter(
            date__year=year, date__month=month, owner=user
        ).count()

    def get_all_visits_by_user(self, user):
        """
            Retorna o total de visitas de um usuario
        :param user:
        :return:
        """

        return Visit.objects.filter(owner=user).count()

    def get_all_visits_consolidate_by_month(self):
        """
            Retorna uma lista com todos os meses que tiveram pelo menos 1 acesso.
            e para cada mes o total de visitas.
        :return: [{'date': '2017-09', 'visits': 31}, {'date': '2017-10', 'visits': 14}]
        """

        consolidates = list()

        # All Distinct
        months = Visit.objects.filter().order_by("-date").datetimes("date", "month")

        for month in months:
            visits = Visit.objects.filter(
                date__year=month.year,
                date__month=month.month,
            ).count()

            consolidates.append(
                dict({"date": month.strftime("%Y-%m"), "visits": visits})
            )

        return consolidates

    def get_or_create_unique_visit(self, activity):
        """
            Verifica se o ja existe uma registro de visita para
            este usuario neste dia, se nao existir cria um entrada na tabela Visit

        :param self:
        :param activity:
        :return: Model Visit
        """
        try:
            visit, created = Visit.objects.get_or_create(
                owner=activity.owner,
                date__year=activity.date.year,
                date__month=activity.date.month,
                date__day=activity.date.day,
            )

            # atualiza o date time para manter o registro de last activity
            visit.date = activity.date
            visit.save()

            return visit

        except VisitMultipleObjectsReturned as e:
            # A tabela de visitas unicas por dia so pode ter uma entrada do mesmo
            # usuario no mesmo dia.
            raise e

    def report_email_unique_visits(self, report_date, to=None):

        log = logging.getLogger("send_email")

        log.info("Generating daily access e-mail.")
        try:
            from_email = settings.EMAIL_NOTIFICATION
        except:
            raise Exception(
                "The EMAIL_NOTIFICATION variable is not configured in settings."
            )

        try:
            email_admin = settings.EMAIL_ADMIN
        except:
            raise Exception("The EMAIL_ADMIN variable is not configured in settings.")

        try:
            send_daily_email = settings.SEND_DAILY_STATISTICS_EMAIL
        except:
            raise Exception(
                "The SEND_DAILY_STATISTICS_EMAIL variable is not configured in settings."
            )

        # Se a variavel de configuracao SEND_DAILY_STATISTICS_EMAIL for False nao envia a notificacao.
        if not send_daily_email:
            log.warning("Skipping send daily email. SEND_DAILY_STATISTICS_EMAIL environment variable is False.")
            return

        # subject
        subject = "Status %s-%s-%s" % (
            report_date.year,
            report_date.month,
            report_date.day,
        )

        log.info("Retrieving unique accesses by date.")

        # Recuperar as visitas unicas do dia.
        visits = self.unique_visits_by_date(
            year=report_date.year, month=report_date.month, day=report_date.day
        )

        log.info("Retrieving all unique accesses.")
        all_visits = self.get_all_distinct_visits()

        sum_visits = 0
        sum_users = len(all_visits)

        for a in all_visits:
            sum_visits = sum_visits + a.get("all_visits")

        log.info("Retrieving Visits consolidate by month.")
        consolidate_by_month = self.get_all_visits_consolidate_by_month()

        if len(visits) == 0:
            visits = False

        log.info("Rendering email template.")
        body = render_to_string(
            "unique_hits_on_day.html",
            {
                "host": settings.BASE_HOST,
                "today": report_date.strftime("%d/%m/%Y"),
                "visits": visits,
                "consolidate": consolidate_by_month,
                "total_visits": all_visits,
                "sum_visits": sum_visits,
                "sum_users": sum_users,
            },
        )

        log.info("Sending Daily Statistics e-mail.")

        recipients = [email_admin]
        if to:
            recipients.append(to)

        Notify().send_email(
            subject=subject,
            body=body,
            to=recipients,
        )
