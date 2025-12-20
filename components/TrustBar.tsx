'use client';

import { FaShieldAlt, FaTruck, FaHeadset, FaAward } from 'react-icons/fa';

export default function TrustBar() {
    const features = [
        { icon: FaAward, text: 'Premium Quality' },
        { icon: FaShieldAlt, text: 'Secure Payment' },
        { icon: FaTruck, text: 'Fast Shipping' },
        {
            icon: FaHeadset,
            text: '24/7 Support',
            link: 'mailto:support@shopora.com',
            tooltip: 'Contact our support team'
        },
    ];

    return (
        <section className="py-12 md:py-16">
            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8 px-4">
                {features.map((item, idx) => {
                    const Wrapper = item.link ? 'a' : 'div';
                    const wrapperProps = item.link ? { href: item.link, title: item.tooltip } : {};

                    return (
                        <Wrapper
                            key={idx}
                            {...wrapperProps}
                            className={`w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-white rounded-full shadow-sm shadow-[#C08C6C]/5 border border-[#E5E0D8] group hover:shadow-lg hover:shadow-[#C08C6C]/10 hover:-translate-y-0.5 transition-all duration-300 ${item.link ? 'cursor-pointer' : 'cursor-default'}`}
                        >
                            <item.icon className="text-[#C08C6C] text-lg group-hover:scale-110 transition-transform duration-300" />
                            <div className="flex flex-col items-start">
                                <span className="text-[#5D5D5D] font-bold text-xs tracking-[0.2em] uppercase pt-0.5">
                                    {item.text}
                                </span>
                                {item.tooltip && (
                                    <span className="text-[10px] text-[#8D8D8D] font-medium opacity-0 group-hover:opacity-100 transition-opacity absolute mt-8">
                                        {item.tooltip}
                                    </span>
                                )}
                            </div>
                        </Wrapper>
                    );
                })}
            </div>
        </section>
    );
}
