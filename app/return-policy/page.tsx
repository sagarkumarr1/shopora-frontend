import Navbar from '@/components/Navbar';

export default function ReturnPolicyPage() {
    return (
        <main className="bg-[#FDFBF7] min-h-screen font-sans text-[#2D2D2D]">
            <Navbar />

            <div className="pt-24 md:pt-32 pb-16 max-w-4xl mx-auto px-6">

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-serif mb-4 text-[#2D2D2D]">Returns & Refunds</h1>
                    <p className="text-[#8D8D8D]">Simple, transparent, and hassle-free.</p>
                </div>

                <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-[#C08C6C]/5 border border-[#E5E0D8] space-y-10">

                    <section>
                        <h2 className="font-serif text-2xl mb-4 flex items-center gap-3">
                            <span className="bg-[#F9F9F5] w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#C08C6C]">1</span>
                            30-Day Easy Returns
                        </h2>
                        <p className="text-[#5D5D5D] leading-relaxed pl-11">
                            If you're not completely in love with your purchase, you can return it within 30 days of delivery. No questions asked. The item must be unused, in its original packaging, and with all tags attached.
                        </p>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl mb-4 flex items-center gap-3">
                            <span className="bg-[#F9F9F5] w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#C08C6C]">2</span>
                            How to Initiate a Return
                        </h2>
                        <div className="pl-11 text-[#5D5D5D] leading-relaxed space-y-2">
                            <p>1. Go to <strong>My Account Order History</strong>.</p>
                            <p>2. Select the order and click <strong>"Return Item"</strong>.</p>
                            <p>3. Choose a scheduled pickup time that works for you.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="font-serif text-2xl mb-4 flex items-center gap-3">
                            <span className="bg-[#F9F9F5] w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-[#C08C6C]">3</span>
                            Refund Process
                        </h2>
                        <p className="text-[#5D5D5D] leading-relaxed pl-11">
                            Once our courier partner picks up your item, the refund is initiated immediately.
                            <br /><br />
                            - <strong>Original Payment Source:</strong> 5-7 business days.<br />
                            - <strong>Shopora Wallet:</strong> Instant credit.
                        </p>
                    </section>

                    <div className="bg-[#FDFBF7] p-6 rounded-xl border border-[#E5E0D8] text-center mt-8">
                        <p className="text-sm font-bold text-[#5D5D5D] mb-2">Need help with a return?</p>
                        <a href="mailto:support@shopora.com" className="text-[#C08C6C] font-bold hover:underline">Contact Support</a>
                    </div>
                </div>
            </div>
        </main>
    );
}
