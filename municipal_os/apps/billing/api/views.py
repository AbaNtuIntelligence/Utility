from rest_framework.viewsets import ModelViewSet
from apps.billing.models import Bill
from .serializers import BillSerializer




def perform_create(self, serializer):
    bill = serializer.save()
    from apps.ingestion.tasks import process_bill
    process_bill.delay(bill.id)

class BillViewSet(ModelViewSet):
    queryset = Bill.objects.all()
    serializer_class = BillSerializer