from django.db import models

import uuid
from django.conf import settings


class Notification(models.Model):
    """
    Definition of a Notification.
    Attributes
    ----------
    id : UUID
        The unique UUID of the record.
    target_user_record : UserInNotificationTarget
        The UserInNotificationTarget associated with notification
    title : str
        The title for the notification. Exact representation depends on the target.
        For example, for an email notification this will be used as the subject of the email.
    body : str
        The main message of the notification to be sent.
    extra : dict
        A dictionary of extra data to be sent to the notification processor. Valid keys
        are determined by each processor.
    status : CharField
        The status of Notification. Options are: 'SCHEDULED', 'DELIVERED', 'DELIVERY_FAILURE', 'RETRY', 'INACTIVE_DEVICE'
    scheduled_delivery : DateTimeField
        Day and time Notification is to be sent.
    attempted_delivery : DateTImeField
        Day and time attempted to deliver Notification.
    retry_time_interval : PositiveIntegerField
        If a notification fails, this is the amount of time to wait until retrying to send it.
    retry_attempts : PositiveIntegerField
        The number of retries that have been attempted.
    max_retries : PositiveIntegerField
        The max number of allowed retries.
    """

    DELIVERED = "DELIVERED"
    DELIVERY_FAILURE = "DELIVERY FAILURE"
    INACTIVE_DEVICE = "INACTIVE DEVICE"
    OPTED_OUT = "OPTED OUT"
    RETRY = "RETRY"
    SCHEDULED = "SCHEDULED"

    STATUS_CHOICES = (
        (DELIVERED, "Delivered"),
        (DELIVERY_FAILURE, "Delivery Failure"),
        (INACTIVE_DEVICE, "Inactive Device"),
        (OPTED_OUT, "Opted Out"),
        (RETRY, "Retry"),
        (SCHEDULED, "Scheduled"),
    )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )
    target_user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name='Target User'
    )

    title = models.CharField(
        max_length=100
    )
    body = models.TextField(blank=True, null=True)
    extra = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES)
    scheduled_delivery = models.DateTimeField(null=True, blank=True)
    attempted_delivery = models.DateTimeField(null=True, blank=True)
    retry_time_interval = models.PositiveIntegerField(default=0)
    retry_attempts = models.PositiveIntegerField(default=0)
    max_retries = models.PositiveIntegerField(default=3)
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)

    class Meta:
        # db_table = "notification_system_notification"
        verbose_name_plural = "Notifications"
        unique_together = [
            "target_user",
            "scheduled_delivery",
            "title",
            "extra",
        ]
