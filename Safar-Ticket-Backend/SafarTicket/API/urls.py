from django.urls import path
from .api_views.city_list import CityListView
from .api_views.otp import VerifyOtpAPIView
from .api_views.signup_user import SignupUserAPIView
from .api_views.resend_otp import ResendOtpAPIView
from .api_views.ticket_detail import TicketDetailAPIView
from .api_views.profile_user_update import ProfileUserUpdateAPIView
from .api_views.profile_user_detail import ProfileUserDetailAPIView
from .api_views.search_tickets import SearchTicketsAPIView
from .api_views.ticket_payment import TicketPaymentAPIView
from .api_views.user_bookings import UserBookingsAPIView
from .api_views.ticket_cancel import TicketCancelAPIView
from .api_views.admin_manage_reservation import AdminManageReservationAPIView
from .api_views.ticket_report import TicketReportAPIView, AdminReviewReportAPIView
from .api_views.ticket_reservation import UserReservationsAPIView, ReserveTicketAPIView
from .api_views.penalty_check import PenaltyCheckAPIView
from .api_views.token_views import RefreshTokenAPIView
from .api_views.login_user import LoginAPIView
from .api_views.company_list import TransportCompanyListView
from .api_views.travel_options import TravelOptionsView


urlpatterns = [
    path('signup/', SignupUserAPIView.as_view()),
    path('verify-otp/', VerifyOtpAPIView.as_view()),
    path('resend-otp/', ResendOtpAPIView.as_view()),
    path('login/', LoginAPIView.as_view()),
    path('profile/', ProfileUserDetailAPIView.as_view()),
    path('cities/', CityListView.as_view()),
    path('ticket/<int:ticket_id>/', TicketDetailAPIView.as_view()),
    path('update-profile/', ProfileUserUpdateAPIView.as_view()),
    path('search-tickets/', SearchTicketsAPIView.as_view()), 
    path('payment-ticket/', TicketPaymentAPIView.as_view()),
    path('user-booking/', UserBookingsAPIView.as_view()),
    path('cancel-ticket/', TicketCancelAPIView.as_view()),
    path('ticket-management/', AdminManageReservationAPIView.as_view()),
    path('report-ticket/', TicketReportAPIView.as_view()),
    path('review-report/', AdminReviewReportAPIView.as_view()),
    path('reserve-ticket/', ReserveTicketAPIView.as_view()),
    path('reservation/', UserReservationsAPIView.as_view()),
    path('check-penalty/', PenaltyCheckAPIView.as_view()),
    path('refresh-token/', RefreshTokenAPIView.as_view()),
    path('companies/', TransportCompanyListView.as_view()),
    path('travel-options/', TravelOptionsView.as_view()),
]
