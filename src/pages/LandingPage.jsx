// src/pages/LandingPage.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function LandingPage() {
    return (
        <div style={{ fontFamily: 'Gotham, sans-serif', backgroundColor: '#f8f5ef', minHeight: '100vh' }}>
            {/* Header */}
            <header style={{ backgroundColor: '#351000', padding: '15px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ color: '#eccb9a', fontSize: '1.8rem', fontWeight: 'bold' }}>Paçocas Canaã</div>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <a href="tel:+5512981560520" style={{ color: '#eccb9a', textDecoration: 'none' }}>📞 (12) 98156-0520</a>
                    <a href="mailto:contato@pacocascanaa.com.br" style={{ color: '#eccb9a', textDecoration: 'none' }}>✉️ canaa.ltda@outlook.com.br</a>
                </div>
            </header>

            {/* Conteúdo principal */}
            <div style={{ maxWidth: '100%', margin: '0 auto', textAlign: 'center' }}>
                {/* Quem Somos */}
                <section
                    style={{
                        marginBottom: '60px',
                        background: 'url(/imagem-header.jpeg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        minHeight: '600px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'flex-start',
                        padding: '0 60px',
                    }}
                >
                    <div style={{
                        backgroundColor: '#eccb9a',
                        maxWidth: '500px',
                        borderRadius:'20px',
                        padding: '20px',
                        opacity: '80%'
                    }}>
                        <h2
                            style={{
                                color: '#351000',
                                fontSize: '2rem',
                                marginBottom: '20px',
                                textAlign: 'left',

                            }}
                        >
                            Nosso Proposito
                        </h2>

                        <p
                            style={{
                                color: '#351000',
                                maxWidth: '800px',
                                lineHeight: '1.6',
                                textAlign: 'left',
                                margin: 0,

                            }}
                        >
                            Manter viva a tradição da paçoca e os momentos em família
                        </p>
                    </div>
                </section>

                {/* Missão, Visão, Valores */}
                <div style={{ display: 'grid', padding: '0 20px', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginBottom: '60px' }}>
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2d5c0' }}>
                        <h3 style={{ color: '#f4890f' }}>Missão</h3>
                        <p>Levar o sabor autêntico da paçoca artesanal com qualidade e carinho.</p>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2d5c0' }}>
                        <h3 style={{ color: '#f4890f' }}>Visão</h3>
                        <p>Ser referência em produtos artesanais no Vale do Paraíba.</p>
                    </div>
                    <div style={{ background: '#fff', borderRadius: '20px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2d5c0' }}>
                        <h3 style={{ color: '#f4890f' }}>Valores</h3>
                        <p>Qualidade, tradição, honestidade e respeito ao cliente</p>
                    </div>
                </div>

                {/* História da Paçoca */}
                <section style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <h2 style={{ color: '#351000', fontSize: '2rem', marginBottom: '20px' }}>Nossa História</h2>
                    <p style={{ color: '#4b342e', maxWidth: '800px', margin: '0 auto', lineHeight: '1.6' }}>
                        A Paçocas Canaã começou em uma pequena cozinha familiar há mais de 30 anos. O segredo da receita foi passado de avó para neta, e hoje levamos nosso produto para toda a região. Cada paçoca é feita à mão, com amendoim selecionado e um toque especial que só a tradição pode dar.
                    </p>
                </section>

                {/* Catálogo PDF */}
                <section style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <h2 style={{ color: '#351000', fontSize: '2rem', marginBottom: '20px' }}>Catálogo de Produtos</h2>
                    <a
                        href="/catalogo.pdf"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ backgroundColor: '#f4890f', color: '#fff', padding: '12px 32px', borderRadius: '40px', textDecoration: 'none', fontWeight: 'bold', display: 'inline-block' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#d67a0c'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f4890f'}
                    >
                        📄 Baixar Catálogo (PDF)
                    </a>
                    <p style={{ fontSize: '0.8rem', color: '#8e6b49', marginTop: '10px' }}>Clique para visualizar ou baixar nosso catálogo completo.</p>
                </section>

                {/* Contatos Sociais */}
                <section style={{ marginBottom: '60px', textAlign: 'center' }}>
                    <h2 style={{ color: '#351000', fontSize: '2rem', marginBottom: '20px' }}>Redes e Contatos</h2>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
                        <a href="https://www.instagram.com/pacocascanaa" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6a2402', textDecoration: 'none' }}>
                            <span style={{ fontSize: '1.5rem' }}><img style={{ width: '50px' }} src='/instagram.svg' /></span>
                        </a>
                        <a href="https://wa.me/5512981560520" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6a2402', textDecoration: 'none' }}>
                            <span style={{ fontSize: '1.5rem' }}><img style={{ width: '50px' }} src='/whatsapp.svg' /></span>
                        </a>
                        <a href="mailto:canaa.ltda@outlook.com.br" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6a2402', textDecoration: 'none' }}>
                            <span style={{ fontSize: '1.5rem' }}><img style={{ width: '50px' }} src='/email.svg' /></span>
                        </a>
                    </div>
                </section>


            </div>

            {/* Footer */}
            <footer style={{ backgroundColor: '#351000', color: '#eccb9a', padding: '30px 20px', textAlign: 'center', fontSize: '0.85rem' }}>
                <p>© 2024 Paçocas Canáá - Todos os direitos reservados.</p>
                <p style={{ marginTop: '8px' }}>Rua Frei Jerônimo de São Brás, 202 - Taubaté - SP</p>
                <p>CNPJ: 21.520.975/0001-10</p>
            </footer>
        </div>
    );
}