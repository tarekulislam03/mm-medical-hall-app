import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../constants/theme';
import { useResponsive } from '../utils/responsive';
import api from '../services/api';

export default function AnalyticsScreen() {
    const r = useResponsive();
    const [todaySales, setTodaySales] = useState(0);
    const [monthlySales, setMonthlySales] = useState(0);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAnalytics = async () => {
        try {
            // Make API calls for today and monthly sales
            // Modify these endpoints if your backend route names differ
            const [todayRes, monthRes] = await Promise.all([
                api.get('/sales/today'),
                api.get('/sales/monthly')
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
});
