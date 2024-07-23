from django.contrib import admin
from django.urls import path, include, re_path
from django.conf.urls.i18n import i18n_patterns
from . import views
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from api import consumers as consumers
from game import consumers as game_consumers
from two_factor.urls import urlpatterns as tf_urls



urlpatterns = [
    path('', include(tf_urls)),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('game/', include('game.urls')),
    path('set-language/<str:language_code>/', views.set_language, name='set_language'),
]

urlpatterns += i18n_patterns(
    path('', include('users.urls')),
)

urlpatterns += i18n_patterns(
    path('', include('leaderboard.urls')),
)

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

handler404 = 'transcendence.views.custom_404_view'