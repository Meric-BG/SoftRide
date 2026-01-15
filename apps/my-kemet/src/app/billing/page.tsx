"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Download, Plus, Trash2, CheckCircle2 } from 'lucide-react';

import styles from './Billing.module.css';

const INVOICES = [
    { id: 'INV-2024-001', date: '10 Jan. 2024', amount: '5.000 FCFA', status: 'Payé', product: 'Mode Sentinelle' },
    { id: 'INV-2023-142', date: '25 Déc. 2023', amount: '1.500.000 FCFA', status: 'Payé', product: 'Boost Accélération' },
    { id: 'INV-2023-128', date: '01 Déc. 2023', amount: '2.500 FCFA', status: 'Payé', product: 'Connectivité Premium' },
];

const CARDS = [
    { id: '1', brand: 'Visa', last4: '4242', expiry: '05/26', isDefault: true },
    { id: '2', brand: 'Mastercard', last4: '8812', expiry: '12/25', isDefault: false },
];
export default function BillingPage() {
    const [cards, setCards] = useState(CARDS);

    const deleteCard = (id: string) => {
        setCards(cards.filter(c => c.id !== id));
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1>Facturation</h1>
                <p>Gérez vos modes de paiement et historique de facturation.</p>
            </header>

            <div className={styles.mainGrid}>

                {/* Payment Methods */}
                <section>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>Modes de paiement</h2>
                        <button className={styles.addButton}>
                            <Plus size={14} /> Ajouter
                        </button>
                    </div>

                    <div className={styles.cardList}>
                        {cards.map((card) => (
                            <motion.div
                                key={card.id}
                                layout
                                className={`glass-panel ${styles.cardItem}`}
                            >
                                <div className={styles.cardInfo}>
                                    <div className={styles.cardIconWrapper}>
                                        <CreditCard size={24} color="var(--accent-primary)" />
                                    </div>
                                    <div className={styles.cardDetails}>
                                        <div className={styles.cardMain}>
                                            {card.brand} •••• {card.last4}
                                            {card.isDefault && <span className={styles.defaultBadge}>Défaut</span>}
                                        </div>
                                        <div className={styles.cardExpiry}>Expire le {card.expiry}</div>
                                    </div>
                                </div>
                                {!card.isDefault && (
                                    <button
                                        onClick={() => deleteCard(card.id)}
                                        className={styles.deleteButton}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>


                </section>

                {/* Subscription Status */}
                <section>
                    <h2 className={styles.sectionTitle} style={{ marginBottom: '20px' }}>Résumé du compte</h2>
                    <div className={`glass-panel ${styles.subscriptionCard}`}>
                        <div className={styles.statusWrapper}>
                            <div className={styles.statusIcon}>
                                <CheckCircle2 size={24} color="#10B981" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 600 }}>Statut du compte : Actif</div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Prochain prélèvement le 01 Fév. 2024</div>
                            </div>
                        </div>

                        <div className={styles.summaryList}>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Sous-total</span>
                                <span>7.500 FCFA</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Taxes (18% TVA)</span>
                                <span>1.350 FCFA</span>
                            </div>
                            <div className={styles.divider}></div>
                            <div className={styles.totalRow}>
                                <span>Total Mensuel</span>
                                <span className={styles.totalAmount}>8.850 FCFA</span>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* History Table */}
            <section className={styles.historySection}>
                <h2 className={styles.sectionTitle} style={{ marginBottom: '20px' }}>Historique des factures</h2>

                {/* Desktop View */}
                <div className={`glass-panel ${styles.tableWrapper}`}>
                    <table className={styles.historyTable}>
                        <thead>
                            <tr>
                                <th>Référence</th>
                                <th>Produit</th>
                                <th>Date</th>
                                <th>Montant</th>
                                <th>Statut</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {INVOICES.map((inv) => (
                                <tr key={inv.id}>
                                    <td style={{ fontWeight: 500 }}>{inv.id}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{inv.product}</td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{inv.date}</td>
                                    <td style={{ fontWeight: 600 }}>{inv.amount}</td>
                                    <td>
                                        <span className={styles.statusBadge}>{inv.status}</span>
                                    </td>
                                    <td>
                                        <button className={styles.downloadButton}>
                                            <Download size={14} /> PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile View */}
                <div className={styles.mobileInvoices}>
                    {INVOICES.map((inv) => (
                        <div key={inv.id} className={`glass-panel ${styles.invoiceCard}`}>
                            <div className={styles.invoiceHeader}>
                                <div className={styles.invoiceTitle}>{inv.product}</div>
                                <span className={styles.statusBadge}>{inv.status}</span>
                            </div>
                            <div className={styles.invoiceMeta}>
                                <span>{inv.id}</span>
                                <span>{inv.date}</span>
                            </div>
                            <div className={styles.invoiceFooter}>
                                <div style={{ fontWeight: 600 }}>{inv.amount}</div>
                                <button className={styles.downloadButton}>
                                    <Download size={14} /> PDF
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
