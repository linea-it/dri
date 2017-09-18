from .models import Activity
from .models import Visit
from datetime import datetime, date
from django.db.models import Count
from django.conf import settings
from django.core.mail import EmailMessage
from django.template.loader import render_to_string
from smtplib import SMTPException


class ActivityReports:
    def __init__(self):
        pass

    def unique_visits_by_date(self, year, month, day):
        users = list()
        uniqueVisits = list()
        activities = Activity.objects.filter(
            date__year=year,
            date__month=month,
            date__day=day).order_by('-date')

        for activity in activities:

            if activity.owner.pk not in users:
                users.append(activity.owner.pk)

                # Recuperar a visita
                visit = self.get_or_create_unique_visit(activity)

        # Recuperar os usuarios que visitaram neste dia + o total de visitas dele no mes
        visits_count = Visit.objects.filter(
            date__year=year,
            date__month=month,
            owner__pk__in=users).annotate(visits_in_month=Count('owner'))

        for a in visits_count:
            uniqueVisits.append(dict({
                "user": a.owner.username,
                "last_activity": a.date.strftime('%Y-%m-%d %H:%M'),
                "visits_in_month": a.visits_in_month
            }))

        return uniqueVisits

    def unique_visits_today(self):
        today = date.today()

        return self.unique_visits_by_date(today.year, today.month, today.day)

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
                date__day=activity.date.day)

            # se ja existir atualiza o date time para manter o registro mais recente
            if not created:
                visit.date = activity.date
                visit.save()

            return visit

        except VisitMultipleObjectsReturned as e:
            # A tabela de visitas unicas por dia so pode ter uma entrada do mesmo
            # usuario no mesmo dia.
            raise e

    def report_email_unique_visits_today(self):
        print("report_email_unique_visits_today")
        try:
            from_email = settings.EMAIL_NOTIFICATION
        except:
            raise Exception("The EMAIL_NOTIFICATION variable is not configured in settings.")

        try:
            email_admin = settings.EMAIL_ADMIN
        except:
            raise Exception("The EMAIL_ADMIN variable is not configured in settings.")

        # subject
        subject = "LIneA Science Server - Unique hits on the day"

        # Recuperar as visitas unicas do dia.
        visits = self.unique_visits_today()
        print(visits)
        visits = list()
        if len(visits) == 0:
            # nao houve visitas neste dia
            body = "There were no visits to the science server today."

        else:
            body = render_to_string("unique_hits_on_day.html", {
                # "visits": visits,
            })

        try:
            print('entrou no try')
            msg = EmailMessage(
                subject=subject,
                body=body,
                from_email=from_email,
                to=[email_admin],
            )
            print('tentando enviar a mensagem')
            # msg.content_subtype = "html"
            msg.send(fail_silently=False)

            print("Enviou Email")

        except SMTPException as e:
            raise (e)

        except Exception as e:
            raise (e)

            #     if user.email:
            #         self.logger.info("Sending mail notification START.")
            #
            #         try:
            #             from_email = settings.EMAIL_NOTIFICATION
            #         except:
            #             raise Exception("The EMAIL_NOTIFICATION variable is not configured in settings.")
            #
            #         subject = "LIneA Science Server - Download in Progress"
            #         body = render_to_string("export_notification_start.html", {
            #             "username": user.username,
            #             "target_display_name": product.prd_display_name
            #         })
            #
            #         msg = EmailMessage(
            #             subject=subject,
            #             body=body,
            #             from_email=from_email,
            #             to=[user.email],
            #         )
            #         msg.content_subtype = "html"
            #         msg.send(fail_silently=False)
            #
            #     else:
            #         self.logger.info("It was not possible to notify the user, for not having the email registered.")
            #
            # except SMTPException as e:
            #     self.logger.error(e)


            # TODO Codigo gerado pelo Felipe, que precisa ser alterado para o novo app.
            # def visits_and_recent_login(self):
            #     users = User.objects.all()
            #     results = []
            #     for user in users:
            #         statistics = Statistics.objects.filter(owner=user).order_by('-date')
            #         if len(statistics) != 0:
            #             results.append(dict({
            #                 "user": user.email,
            #                 "visits": len(statistics),
            #                 "last_visit": str(statistics[0].date.date())
            #             }))
            #     return results
            #
            # def total_visits(self):
            #     users = User.objects.all()
            #     visits = []
            #     for user in users:
            #         statistics = Statistics.objects.filter(owner=user).order_by('-date')
            #         if len(statistics) != 0:
            #             visits.append(dict({
            #                 "user": user.email,
            #                 "visits": len(statistics),
            #             }))
            #
            #     sorted_list = sorted(visits, key=lambda k: k['visits'])
            #     number_of_visits = 0
            #     result = dict()
            #     result[str(number_of_visits) + '-' + str(number_of_visits + 4)] = 0
            #     for visit in sorted_list:
            #         if visit['visits'] <= number_of_visits + 4:
            #             result[str(number_of_visits) + '-' + str(number_of_visits + 4)] += 1
            #         else:
            #             number_of_visits += 4
            #             result[str(number_of_visits) + '-' + str(number_of_visits + 4)] = 1
            #     total_visits = len(Statistics.objects.all())
            #     return {"Total of users grouped by number of visits": result, "Total Visits": total_visits}
            #
            # def visits_per_month(self):
            #     results = dict()
            #     statistics = Statistics.objects.all().order_by('-date')
            #     for statistic in statistics:
            #         if statistic.date.strftime("%Y-%m") not in results.keys():
            #             results[statistic.date.strftime("%Y-%m")] = 1
            #         else:
            #             results[statistic.date.strftime("%Y-%m")] += 1
            #     return {"Visits Per Month": results}
