export const useSettings = () => {
    return useState('site-settings', () => ({
        site_name: 'Khanza Repaint',
        logo_url: '',
        footer_text: 'Premium automotive painting and detailing services.'
    }));
};
