from django.db import models


# Create your models here.
class Users(models.Model):
    User_ID = models.IntegerField(primary_key=True)
    First_Name = models.CharField(max_length=50)
    Last_Name = models.CharField(max_length=50)
    Total_Hours = models.TimeField()
    Checked_In = models.BooleanField(default=False)
    Total_Seconds = models.FloatField(default=0)
    Last_In = models.DateTimeField(null=True)
    Last_Out = models.DateTimeField(null=True)

    def get_total_hours(self):
        #print(f"Total Seconds: {self.Total_Seconds}")
        hours, remainder = divmod(int(self.Total_Seconds), 3600)
        minutes, seconds = divmod(remainder, 60)
        return f"{hours}h {minutes}m {seconds}s"

    class Meta:
        # Specify the table name
        db_table = 'Users'
        verbose_name = "Members"
        verbose_name_plural = "Members"

        def __str__(self):
            return f"{self.First_Name} {self.Last_Name}: {self.User_ID} - {self.Total_Hours}"


class ActivityLog(models.Model):
    OPERATION_CHOICES = [
        ('checkIn', 'Check In'),
        ('checkOut', 'Check Out'),
        ('none', "None"),
    ]

    STATUS_CHOICES = [
        ('success', 'Success'),
        ('error', 'Error'),
        ('user not found', 'User Not Found'),
    ]

    userID = models.CharField(max_length=255)  # Assuming userID is a string; adjust type as necessary
    operation = models.CharField(max_length=10, choices=OPERATION_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    message = models.TextField(default='')  # Optional message field
    timestamp = models.DateTimeField(auto_now_add=True)  # Automatically set the timestamp when creating

    def __str__(self):
        return f"{self.userID} - {self.operation} - {self.status} - {self.timestamp}"

    class Meta:
        ordering = ['-id']  # Order by most recent logs first