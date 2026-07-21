# apps/disputes/models.py

class Dispute(models.Model):
    bill = models.ForeignKey('billing.Bill', on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default='pending')
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)