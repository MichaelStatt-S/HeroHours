from django import forms
import django.contrib.auth.models as authModels


class CustomActionForm(forms.Form):
    print("running form")
    username = forms.CharField(label='Username', max_length=100)
    password = forms.CharField(label='Password', widget=forms.PasswordInput)
    # Get group choices and set the default option as "Group"
    group_choices = [(group.name, group.name) for group in authModels.Group.objects.all()]
    group_choices.insert(0, ('', 'Group'))  # Add the default option at the beginning

    group_name = forms.ChoiceField(
        label='Group Name',
        choices=group_choices,
        initial='',  # Make sure the default option is selected
        required=True,# Optional: Set to False if you want the user to skip this field
    )
    hidden_data = forms.CharField(widget=forms.HiddenInput(), required=False)