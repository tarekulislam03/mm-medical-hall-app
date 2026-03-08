import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    TouchableOpacity
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { useResponsive } from '../utils/responsive';
import api from '../services/api';
import { getInvoices } from '../services/billingService';
import { printReceipt58mm } from '../utils/printReceipt';

export default function AnalyticsScreen() {
    const r = useResponsive();
    const [todaySales, setTodaySales] = useState(0);
    const [monthlySales, setMonthlySales] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [recentSales, setRecentSales] = useState([]);

    const fetchAnalytics = async () => {
        try {
            // Make API calls for today and monthly sales
            // Modify these endpoints if your backend route names differ
            const [todayRes, monthRes, invoicesRes] = await Promise.all([
                api.get('/sales/today'),
                api.get('/sales/monthly'),
                getInvoices({ page: 1, limit: 10, sort: 'desc' })
            ]);

            // Safely extract the monetary value from the response
            const extractValue = (res) => {
                if (!res || !res.data) return 0;
                if (typeof res.data === 'number') return res.data;
                const body = res.data.data || res.data;
                return body?.total_sales;
            };

            setTodaySales(extractValue(todayRes));
            setMonthlySales(extractValue(monthRes));

            const list = invoicesRes?.invoices || invoicesRes?.data?.invoices || invoicesRes?.data || invoicesRes || [];
            setRecentSales(Array.isArray(list) ? list : []);
        } catch (error) {
            console.log('Failed to fetch analytics:', error?.message || error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAnalytics();
        setRefreshing(false);
    };

    const scrollPadding = r.pick({ small: SPACING.md, medium: SPACING.lg, large: SPACING.xxl, xlarge: SPACING.xxl });
    const statCardStyle = r.isSmall ? { width: '100%', marginBottom: SPACING.md } : { flex: 1 };

    return (
        <View style={styles.container}>
            <View style={[styles.header, { paddingHorizontal: scrollPadding }]}>
                <Text style={[styles.headerTitle, { fontSize: r.pick({ small: FONT_SIZES.xl, medium: FONT_SIZES.xxl, large: FONT_SIZES.xxl, xlarge: FONT_SIZES.xxl }) }]}>
                    Sales Analytics
                </Text>
                <Text style={styles.headerSub}>Overview of your business performance</Text>
            </View>

            <ScrollView
                contentContainerStyle={[styles.scroll, { padding: scrollPadding }]}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
                ) : (
                    <View style={[styles.statsRow, r.isSmall && { flexDirection: 'column' }]}>
                        {/* Today's Sale */}
                        <View style={[styles.statCard, statCardStyle]}>
                            <View style={styles.statHeader}>
                                <View style={[styles.iconBox, { backgroundColor: COLORS.primaryGhost }]}>
                                    <Ionicons name="today" size={24} color={COLORS.primary} />
                                </View>
                                <Text style={styles.statLabel}>Today's Sale</Text>

                            </View>

                            <Text style={styles.statValue}>
                                ₹{Number(todaySales).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                        </View>

                        {/* Monthly Sale */}
                        <View style={[styles.statCard, statCardStyle]}>
                            <View style={styles.statHeader}>
                                <View style={[styles.iconBox, { backgroundColor: COLORS.successLight }]}>
                                    <Ionicons name="calendar-outline" size={24} color={COLORS.success} />
                                </View>
                                <Text style={styles.statLabel}>Monthly Sale</Text>
                            </View>
                            <Text style={styles.statValue}>
                                ₹{Number(monthlySales).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </Text>
                        </View>
                    </View>
                )}

                {!loading && (
                    <View style={styles.historySection}>
                        <Text style={styles.sectionTitle}>Recent Sales History</Text>
                        {recentSales.length > 0 ? (
                            recentSales.map((sale, idx) => (
                                <View key={sale._id || idx} style={styles.saleRow}>
                                    <View style={styles.saleInfo}>
                                        <Text style={styles.saleId}>Invoice {sale.invoice_number ? `#${sale.invoice_number}` : sale._id.slice(-6).toUpperCase()}</Text>
                                        <Text style={styles.saleDetails}>
                                            ₹{Number(sale.grand_total || sale.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} • {String(sale.payment_method || 'CASH').toUpperCase()}
                                        </Text>
                                        <Text style={styles.saleTime}>
                                            {new Date(sale.date || sale.createdAt || new Date()).toLocaleString('en-IN', {
                                                day: '2-digit', month: 'short', year: 'numeric',
                                                hour: '2-digit', minute: '2-digit', hour12: true
                                            })}
                                        </Text>
                                    </View>
                                    <TouchableOpacity
                                        style={styles.printBtn}
                                        onPress={() => printReceipt58mm(sale)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="print-outline" size={18} color={COLORS.primary} />
                                        <Text style={styles.printBtnText}>Print</Text>
                                    </TouchableOpacity>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.emptyText}>No recent sales found.</Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.bgDark,
    },
    header: {
        paddingTop: SPACING.xl,
        paddingBottom: SPACING.lg,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    headerTitle: {
        fontWeight: '800',
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    headerSub: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    scroll: {
        paddingBottom: SPACING.xxxl,
    },
    statsRow: {
        flexDirection: 'row',
        gap: SPACING.lg,
    },
    statCard: {
        backgroundColor: COLORS.white,
        borderRadius: RADIUS.lg,
        padding: SPACING.xl,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statLabel: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    statValue: {
        fontSize: 32,
        fontWeight: '800',
        color: COLORS.textPrimary,
    },
    historySection: {
        marginTop: SPACING.xxl,
    },
    sectionTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
    },
    saleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.white,
        padding: SPACING.lg,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.sm,
    },
    saleInfo: {
        flex: 1,
    },
    saleId: {
        fontWeight: '800',
        fontSize: FONT_SIZES.md,
        color: COLORS.textPrimary,
        marginBottom: 4,
    },
    saleDetails: {
        fontWeight: '700',
        color: COLORS.success,
        fontSize: FONT_SIZES.sm,
        marginBottom: 4,
    },
    saleTime: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        fontWeight: '500',
    },
    printBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.xs,
        backgroundColor: COLORS.primaryGhost,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        borderRadius: RADIUS.sm,
    },
    printBtnText: {
        color: COLORS.primary,
        fontWeight: '800',
        fontSize: FONT_SIZES.sm,
    },
    emptyText: {
        color: COLORS.textMuted,
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: SPACING.xl,
    },
});
