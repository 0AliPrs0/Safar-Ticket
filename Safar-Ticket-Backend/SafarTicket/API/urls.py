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
from .api_views.travel_detail import TravelDetailAPIView 
from .api_views.upload_profile_image import UploadProfileImageAPIView
from .api_views.charge_wallet import ChargeWalletAPIView
from .api_views.seat_list import SeatListAPIView
from .api_views.rebook_ticket import RebookTicketAPIView
from .api_views.booking_detail import BookingDetailAPIView
from .api_views.change_password import ChangePasswordAPIView
from .api_views.password_reset import ForgotPasswordAPIView, ResetPasswordAPIView
from .api_views.get_report_by_ticket import GetReportByTicketAPIView
from .api_views.settings_api import (
    ChangeEmailRequestAPIView, 
    ChangeEmailVerifyAPIView,
    ToggleRemindersAPIView,
    DeactivateAccountAPIView
)
from .api_views.admin_login import AdminLoginAPIView
from .api_views.admin_profile_update import AdminProfileUpdateAPIView
from .api_views.admin_password_reset import AdminForgotPasswordAPIView, AdminResetPasswordAPIView
from .api_views.admin_dashboard_api import AdminDashboardStatsAPIView, AdminSalesChartAPIView
from .api_views.admin_reports_api import AdminReportsListView
from .api_views.admin_cancellations_api import AdminCancellationsListView

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
    path('travel/<int:travel_id>/', TravelDetailAPIView.as_view()), 
    path('upload-profile-image/', UploadProfileImageAPIView.as_view()),
    path('charge-wallet/', ChargeWalletAPIView.as_view(), name='charge-wallet'),
    path('travel/<int:travel_id>/seats/', SeatListAPIView.as_view()),
    path('rebook-ticket/', RebookTicketAPIView.as_view(), name='rebook-ticket'), 
    path('booking/<int:reservation_id>/', BookingDetailAPIView.as_view(), name='booking-detail'),
    path('change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    path('forgot-password/', ForgotPasswordAPIView.as_view(), name='forgot-password'),
    path('reset-password/', ResetPasswordAPIView.as_view(), name='reset-password'),
    path('report/<int:ticket_id>/', GetReportByTicketAPIView.as_view(), name='get-report-by-ticket'),
    path('settings/change-email-request/', ChangeEmailRequestAPIView.as_view(), name='change-email-request'),
    path('settings/change-email-verify/', ChangeEmailVerifyAPIView.as_view(), name='change-email-verify'),
    path('settings/toggle-reminders/', ToggleRemindersAPIView.as_view(), name='toggle-reminders'),
    path('settings/deactivate-account/', DeactivateAccountAPIView.as_view(), name='deactivate-account'),
    path('admin/login/', AdminLoginAPIView.as_view(), name='admin-login'),
    path('admin/update-profile/', AdminProfileUpdateAPIView.as_view(), name='admin-update-profile'),
    path('admin/forgot-password/', AdminForgotPasswordAPIView.as_view(), name='admin-forgot-password'),
    path('admin/reset-password/', AdminResetPasswordAPIView.as_view(), name='admin-reset-password'),
    path('admin/stats/', AdminDashboardStatsAPIView.as_view(), name='admin-stats'),
    path('admin/stats/sales-chart/', AdminSalesChartAPIView.as_view(), name='admin-sales-chart'),
    path('admin/reports/', AdminReportsListView.as_view(), name='admin-reports-list'),
    path('admin/cancellations/', AdminCancellationsListView.as_view(), name='admin-cancellations-list'),
]
