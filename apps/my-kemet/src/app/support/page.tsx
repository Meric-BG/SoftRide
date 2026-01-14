"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Headphones, BookOpen, Search } from 'lucide-react';
import styles from './Support.module.css';

const FAQ = [
    { q: "Comment réinitialiser mon mot de passe ?", a: "Allez dans Réglages > Sécurité et cliquez sur 'Changer le mot de passe'." },
    { q: "Où trouver ma clé numérique ?", a: "La clé est stockée dans Profile > Clé numérique." },
    { q: "Comment activer le mode Sentinelle ?", a: "Assurez-vous d'avoir l'abonnement actif, puis activez-le via le Dashboard." },
];

export default function SupportPage() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Support & Assistance</h1>
                <p>Nous sommes là pour vous aider à profiter au mieux de votre Kemet.</p>
            </header>

            <div className={styles.mainGrid}>
                {/* Help Center */}
                <div className={`glass-panel ${styles.helpCenter}`}>
                    <h2>
                        <BookOpen size={20} color="var(--accent-primary)" />
                        Centre d'aide
                    </h2>
                    <div className={styles.searchWrapper}>
                        <Search className={styles.searchIcon} size={16} />
                        <input
                            type="text"
                            placeholder="Rechercher une solution..."
                            className={styles.searchInput}
                        />
                    </div>
                    <div className={styles.faqList}>
                        {FAQ.map((item, i) => (
                            <div key={i} className={styles.faqItem}>
                                <div className={styles.question}>{item.q}</div>
                                <div className={styles.answer}>{item.a}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Section */}
                <div className={`glass-panel ${styles.contactCard}`}>
                    <Headphones size={48} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
                    <h3>Assistance Téléphonique</h3>
                    <p>Disponible 24h/24 pour les urgences routières.</p>
                    <div className={styles.phoneNumber}>+221 33 800 00 00</div>
                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid var(--glass-border)', fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Notre équipe est également disponible par email à support@kemet.sn
                    </div>
                </div>
            </div>
        </div>
    );
}
