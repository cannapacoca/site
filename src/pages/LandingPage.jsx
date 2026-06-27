import React, { useState, useEffect } from 'react';
import { landingPageService } from '../services/landingPageService';

export default function LandingPage() {
    const [texts, setTexts] = useState({
        headerTitle: "Paçocas Canaã",
        phone: "(12) 98156-0520",
        email: "canaa.ltda@outlook.com.br",
        purposeTitle: "Nosso Propósito",
        purposeText: "Manter viva a tradição da paçoca e os momentos em família",
        missionText: "Levar o sabor autêntico da paçoca artesanal com qualidade e carinho.",
        visionText: "Ser referência em produtos artesanais no Vale do Paraíba.",
        valuesText: "Qualidade, tradição, honestidade e respeito ao cliente",
        historyTitle: "Nossa História",
        // Fallbacks caso o banco ainda não tenha os dois campos separados
        historyTextLeft: "A Paçocas Canaã começou em uma pequena cozinha familiar há mais de 30 anos. O segredo da receita foi passado de avó para neta, e hoje levamos nosso produto para toda a região.",
        historyTextRight: "Cada paçoca é feita à mão, com amendoim selecionado e um toque especial que só a tradição pode dar. Zelamos pelo carinho em cada pedaço produzido.",
        footerText: "© 2026 Paçocas Canaã - Todos os direitos reservados.",
        addressText: "Rua Frei Jerônimo de São Brás, 202 - Taubaté - SP",
        cnpjText: "CNPJ: 21.520.975/0001-10"
    });

    useEffect(() => {
        async function init() {
            try {
                const data = await landingPageService.getTexts();
                if (data.historyText && !data.historyTextLeft) {
                    const meio = Math.floor(data.historyText.length / 2);
                    const quebra = data.historyText.indexOf(' ', meio);
                    data.historyTextLeft = data.historyText.substring(0, quebra);
                    data.historyTextRight = data.historyText.substring(quebra + 1);
                }
                setTexts(data);
            } catch (err) {
                console.error("Erro ao carregar textos da LandingPage:", err);
            }

            const viewed = sessionStorage.getItem('landing_viewed');
            if (!viewed) {
                const ok = await landingPageService.trackView('landing');
                if (ok) {
                    sessionStorage.setItem('landing_viewed', '1');
                }
            }
        }
        init();
    }, []);

    // Estilo base reutilizável para aplicar transição suave em interações
    const transitionEffect = { transition: 'all 0.3s ease-in-out' };

    return (
        <div style={{ fontFamily: 'Gotham, sans-serif', backgroundColor: '#f8f5ef', minHeight: '100vh', color: '#333' }}>
            
            {/* Header */}
            <header style={{ backgroundColor: '#351000', padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                <div style={{ color: '#eccb9a', fontSize: '1.9rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>{texts.headerTitle}</div>
                <div style={{ display: 'flex', gap: '24px' }}>
                    <a href={`tel:${texts.phone}`} style={{ color: '#eccb9a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', ...transitionEffect }}
                       onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                       onMouseLeave={(e) => e.currentTarget.style.color = '#eccb9a'}>
                       📞 {texts.phone}
                    </a>
                    <a href={`mailto:${texts.email}`} style={{ color: '#eccb9a', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', ...transitionEffect }}
                       onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
                       onMouseLeave={(e) => e.currentTarget.style.color = '#eccb9a'}>
                       ✉️ {texts.email}
                    </a>
                </div>
            </header>

            {/* Conteúdo principal */}
            <div style={{ maxWidth: '100%', margin: '0 auto', textAlign: 'center' }}>
                
                {/* Hero / Quem Somos */}
                <section
                    style={{
                        marginBottom: '80px',
                        background: 'linear-gradient(rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2)), url(/imagem-header.jpeg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '620px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        padding: '0 80px',
                    }}
                >
                    <div style={{
                        backgroundColor: '#eccb9aa6',
                        backdropFilter: 'blur(8px)', // Efeito fosco moderno de desfoque
                        WebkitBackdropFilter: 'blur(8px)',
                        maxWidth: '520px',
                        borderRadius: '24px',
                        padding: '35px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                        textAlign: 'left',
                        transform: 'translateY(0)',
                        ...transitionEffect
                    }}>
                        <h2 style={{ color: '#351000', fontSize: '2.4rem', marginBottom: '15px', fontWeight: '800' }}>
                            {texts.purposeTitle}
                        </h2>
                        <p style={{ color: '#260b00', fontSize: '1.15rem', lineHeight: '1.6', fontWeight: '500', margin: 0 }}>
                            {texts.purposeText}
                        </p>
                    </div>
                </section>

                {/* Missão, Visão, Valores */}
                <div style={{ display: 'grid', padding: '0 40px', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '30px', marginBottom: '80px' }}>
                    {[
                        { title: "Missão", text: texts.missionText },
                        { title: "Visão", text: texts.visionText },
                        { title: "Valores", text: texts.valuesText }
                    ].map((card, idx) => (
                        <div key={idx} 
                             style={{ 
                                 background: '#fff', 
                                 borderRadius: '24px', 
                                 padding: '35px 25px', 
                                 boxShadow: '0 4px 15px rgba(53, 16, 0, 0.04)', 
                                 border: '1px solid #eaddca', 
                                 transform: 'scale(1)',
                                 ...transitionEffect 
                             }}
                             onMouseEnter={(e) => {
                                 e.currentTarget.style.transform = 'translateY(-5px)';
                                 e.currentTarget.style.boxShadow = '0 12px 25px rgba(53, 16, 0, 0.08)';
                             }}
                             onMouseLeave={(e) => {
                                 e.currentTarget.style.transform = 'translateY(0)';
                                 e.currentTarget.style.boxShadow = '0 4px 15px rgba(53, 16, 0, 0.04)';
                             }}>
                            <h3 style={{ color: '#f4890f', fontSize: '1.4rem', marginBottom: '12px', fontWeight: 'bold' }}>{card.title}</h3>
                            <p style={{ color: '#555', lineHeight: '1.6', margin: 0 }}>{card.text}</p>
                        </div>
                    ))}
                </div>

                {/* História da Paçoca (Dois blocos de texto Lado a Lado) */}
                <section style={{ marginBottom: '80px', textAlign: 'center', padding: '0 40px', maxWidth: '1000px', margin: '0 auto 80px auto' }}>
                    <h2 style={{ color: '#351000', fontSize: '2.2rem', marginBottom: '30px', fontWeight: 'bold' }}>{texts.historyTitle}</h2>
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                        gap: '40px', 
                        textAlign: 'left',
                        color: '#4b342e',
                        fontSize: '1.05rem',
                        lineHeight: '1.7'
                    }}>
                        <div>
                            <p style={{ margin: 0 }}>{texts.historyTextLeft}</p>
                        </div>
                        <div>
                            <p style={{ margin: 0 }}>{texts.historyTextRight}</p>
                        </div>
                    </div>
                </section>

                {/* Catálogo PDF */}
                <section style={{ marginBottom: '80px', textAlign: 'center', padding: '0 20px' }}>
                    <h2 style={{ color: '#351000', fontSize: '2.2rem', marginBottom: '25px', fontWeight: 'bold' }}>Catálogo de Produtos</h2>
                    <a
                        href="/catalogo.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ 
                            backgroundColor: '#f4890f', 
                            color: '#fff', 
                            padding: '14px 40px', 
                            borderRadius: '40px', 
                            textDecoration: 'none', 
                            fontWeight: 'bold', 
                            display: 'inline-flex', 
                            alignItems: 'center', 
                            gap: '10px',
                            boxShadow: '0 4px 15px rgba(244, 137, 15, 0.3)',
                            fontSize: '1.05rem',
                            ...transitionEffect
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#d67a0c';
                            e.currentTarget.style.transform = 'scale(1.03)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(244, 137, 15, 0.4)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = '#f4890f';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 137, 15, 0.3)';
                        }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        Clique aqui para ver o Catálogo (PDF)
                    </a>
                    <p style={{ fontSize: '0.85rem', color: '#8e6b49', marginTop: '12px' }}>Clique para visualizar ou baixar nosso catálogo completo.</p>
                </section>

                {/* Contatos Sociais */}
                <section style={{ marginBottom: '100px', textAlign: 'center' }}>
                    <h2 style={{ color: '#351000', fontSize: '2.2rem', marginBottom: '30px', fontWeight: 'bold' }}>Redes e Contatos</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '35px', flexWrap: 'wrap' }}>
                        {[
                            { href: "https://www.instagram.com/pacocascanaa", src: "/instagram.svg", alt: "Instagram" },
                            { href: `https://wa.me/55${texts.phone.replace(/\D/g, '')}`, src: "/whatsapp.svg", alt: "WhatsApp" },
                            { href: `mailto:${texts.email}`, src: "/email.svg", alt: "E-mail" }
                        ].map((social, idx) => (
                            <a key={idx} href={social.href} target="_blank" rel="noopener noreferrer" 
                               style={{ display: 'flex', alignItems: 'center', transform: 'scale(1)', ...transitionEffect }}
                               onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15) rotate(4deg)'}
                               onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}>
                                <span><img style={{ width: '55px', height: '55px' }} src={social.src} alt={social.alt} /></span>
                            </a>
                        ))}
                    </div>
                </section>
            </div>

            {/* Footer */}
            <footer style={{ backgroundColor: '#351000', color: '#eccb9a', padding: '40px 20px', textAlign: 'center', fontSize: '0.9rem', borderTop: '2px solid #4a1a04', lineHeight: '1.6' }}>
                <p style={{ fontWeight: '600', margin: '0 0 8px 0' }}>{texts.footerText}</p>
                <p style={{ opacity: 0.85, margin: '0 0 4px 0' }}>{texts.addressText}</p>
                <p style={{ opacity: 0.7, fontSize: '0.8rem', margin: 0 }}>{texts.cnpjText}</p>
            </footer>
        </div>
    );
}