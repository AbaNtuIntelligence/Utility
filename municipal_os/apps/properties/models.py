# apps/properties/models.py

class Property(models.Model):
    owner = models.ForeignKey('accounts.User', on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    address = models.TextField()
    municipality = models.CharField(max_length=255)

class MunicipalAccount(models.Model):
    property = models.ForeignKey(Property, on_delete=models.CASCADE)
    account_number = models.CharField(max_length=100)