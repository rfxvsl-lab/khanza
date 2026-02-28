export interface Service {
    id: number;
    title: string;
    description: string;
    price: string;
    icon_name: string;
}

export interface Car {
    id: number;
    car_model: string;
    year: number;
    price: string;
    description: string;
    images: string;
    status: string;
}

export interface Booking {
    id: number;
    user_id?: number;
    name?: string;
    email?: string;
    phone?: string;
    vehicle_info: string;
    service_id: number;
    scheduled_at: string;
    status: string;
    service_title?: string;
    voucher_code?: string;
    created_at?: string;
}

export interface Testimonial {
    id: number;
    name: string;
    review: string;
    rating: number;
    is_approved?: boolean;
    profile_photo?: string;
    service_ordered?: string;
}

export interface FaqItem {
    id: number;
    question: string;
    answer: string;
    display_order?: number;
}

export interface ContentHome {
    id: number;
    title: string;
    description: string;
    hero_image: string;
}

export interface Settings {
    site_name: string;
    logo_url: string;
    footer_text: string;
}

export interface ApiResponse<T = any> {
    success?: boolean;
    error?: string;
    data?: T;
}
