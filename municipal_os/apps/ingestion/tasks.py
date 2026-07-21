# apps/ingestion/tasks.py

from celery import shared_task
from .services.ocr import extract_text
from apps.billing.models import Bill

@shared_task
def process_bill(bill_id):
    bill = Bill.objects.get(id=bill_id)
    
    text = extract_text(bill.uploaded_file.path)
    bill.raw_text = text
    bill.save()

    # next: parsing step