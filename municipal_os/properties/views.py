from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
def test_api(request):
    """Test endpoint to check if API is working"""
    return Response({
        'system': 'Municipal Utilities Backend',
        'status': 'running',
        'message': 'API is working correctly',
        'endpoints': {
            'test': '/api/properties/test/',
            'admin': '/admin/',
        }
    })

@api_view(['GET'])
def properties_list(request):
    """Return list of properties"""
    return Response({
        'properties': [
            {
                'id': 1,
                'address': '123 Main Street, Johannesburg',
                'municipal_account': 'JHB-12345',
                'municipality': 'City of Johannesburg',
                'property_type': 'residential'
            }
        ]
    })

@api_view(['POST'])
def upload_statement(request):
    """Handle PDF upload"""
    if 'pdf' not in request.FILES:
        return Response(
            {'error': 'No PDF file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    pdf_file = request.FILES['pdf']
    
    return Response({
        'message': 'Statement uploaded successfully',
        'statement_id': 1,
        'preview': f'File {pdf_file.name} received. Audit feature coming soon!'
    })