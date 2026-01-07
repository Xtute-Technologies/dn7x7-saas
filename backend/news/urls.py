from django.urls import path
from .views import PartnerNewsListView, PartnerNewsDetailView

app_name = 'news'

urlpatterns = [
    path('', PartnerNewsListView.as_view(), name='partner-news-list'),
    path('<int:post_id>/', PartnerNewsDetailView.as_view(), name='partner-news-detail'),
]
