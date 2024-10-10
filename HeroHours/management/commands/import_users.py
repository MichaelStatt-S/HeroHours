import csv
from django.core.management.base import BaseCommand
from HeroHours.models import Users  # Replace 'yourapp' with your actual app name

class Command(BaseCommand):
    help = 'Import users from a CSV file'

    def add_arguments(self, parser):
       parser.add_argument('csv_file', type=str, help='The CSV file to import')

    def handle(self, *args, **options):
        csv_file = options["csv_file"]
        with open(csv_file, newline='') as file:
            reader = csv.DictReader(file)
            users = []
            for row in reader:
                # Create a user instance and append it to the list
                user = Users(
                    User_ID=row['User_ID'],
                    First_Name=row['First_Name'],
                    Last_Name=row['Last_Name'],
                    Total_Hours=row['Total_Hours'],
                    Checked_In=row['Checked_In'] == 'TRUE',  # Convert string to boolean
                    Total_Seconds=float(row['Total_Seconds'])
                )
                users.append(user)

            # Bulk create users in the database
            Users.objects.bulk_create(users)
            self.stdout.write(self.style.SUCCESS('Successfully imported users'))
