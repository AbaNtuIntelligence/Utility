# apps/billing/models.py

class Bill(models.Model):
    municipal_account = models.ForeignKey('properties.MunicipalAccount', on_delete=models.CASCADE)
    uploaded_file = models.FileField(upload_to='bills/')
    raw_text = models.TextField(blank=True)
    parsed_data = models.JSONField(null=True, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True)
    billing_date = models.DateField(null=True)

class LineItem(models.Model):
    bill = models.ForeignKey(Bill, on_delete=models.CASCADE, related_name='line_items')
    service_type = models.CharField(max_length=50)  # water, electricity
    description = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)