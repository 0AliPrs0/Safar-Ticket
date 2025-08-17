import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';

function Footer() {
    const { t } = useTranslation();

    return (
        <footer className="bg-gray-800 text-white dark:bg-gray-900">
            <div className="container mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    
                    <div>
                        <h2 className="text-xl font-bold mb-4">SafarTicket</h2>
                        <p className="text-gray-400">
                            {t('footer_description')}
                        </p>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">{t('quick_links')}</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="text-gray-400 hover:text-white">{t('home')}</Link></li>
                            <li><Link to="/bookings" className="text-gray-400 hover:text-white">{t('my_bookings')}</Link></li>
                            <li><Link to="/settings" className="text-gray-400 hover:text-white">{t('settings')}</Link></li>
                            <li><Link to="#" className="text-gray-400 hover:text-white">{t('about_us')}</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">{t('contact_us')}</h3>
                        <address className="not-italic text-gray-400 space-y-3">
                            <p>{t('university_address')}</p>
                            <p><strong>{t('email_address_label')}:</strong> safarticket00@gmail.com</p>
                            <p><strong>{t('phone_label')}:</strong> ۰۲۱-۱۲۳۴۵۶۷۸</p>
                        </address>
                    </div>

                    <div>
                        <h3 className="text-lg font-semibold mb-4">{t('social_media')}</h3>
                        <div className="flex space-x-4 rtl:space-x-reverse">
                            <a href="#" className="text-gray-400 hover:text-white text-2xl"><FaTwitter /></a>
                            <a href="#" className="text-gray-400 hover:text-white text-2xl"><FaInstagram /></a>
                            <a href="#" className="text-gray-400 hover:text-white text-2xl"><FaLinkedin /></a>
                        </div>
                    </div>

                </div>

                <div className="mt-12 border-t border-gray-700 pt-8 text-center text-gray-500">
                    <p>{t('copyright_notice', { year: new Date().getFullYear() })}</p>
                </div>
            </div>
        </footer>
    );
}

export default Footer;