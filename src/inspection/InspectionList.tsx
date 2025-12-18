import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    RefreshControl,
    StyleSheet,
    Alert,
    Animated
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { BackHandler } from "react-native";
import { Card, Button, Divider } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import apiClient from "../Service/apiInterceptors";

interface Inspection {
    id: string;
    inspectionno: string;
    inspectiondate: string;
    centername: string;
    centertargetid: string;
    farmername: string;
    relation: string;
    relativename: string;
    agreementid: string;
    crop: string;
    variety: string;
    cropcondition: string;
    approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const InspectionList = () => {
    const navigation = useNavigation<any>();
    const [inspections, setInspections] = useState<Inspection[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const fadeAnim = useState(new Animated.Value(0))[0];

    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                navigation.navigate("Dashboard" as never);
                return true;
            };

            const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
            return () => subscription.remove();
        }, [navigation])
    );

    const fetchInspections = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/api/inspection?ApprovalStatus=PENDING&ApprovalStatus=APPROVED&ApprovalStatus=REJECTED');
            setInspections(response.data);

            console.log('Fetched inspections:', response.data.id);
            
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }).start();
        } catch (error) {
            console.error('Error fetching inspections:', error);
            Alert.alert('Error', 'Failed to fetch inspection data');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchInspections();
    };

    useEffect(() => {
        fetchInspections();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return '#10B981';
            case 'REJECTED': return '#EF4444';
            case 'PENDING': return '#F59E0B';
            default: return '#6B7280';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'check-circle';
            case 'REJECTED': return 'close-circle';
            case 'PENDING': return 'clock-time-three';
            default: return 'help-circle';
        }
    };

    const handleApprove = (inspectionId: string) => {
        Alert.alert(
            'Approve Inspection', 
            'Are you sure you want to approve this inspection?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Approve', 
                    style: 'default',
                    onPress: () => console.log('Approved:', inspectionId)
                }
            ]
        );
    };

    const handleReject = (inspectionId: string) => {
        Alert.alert(
            'Reject Inspection', 
            'Are you sure you want to reject this inspection?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Reject', 
                    style: 'destructive',
                    onPress: () => console.log('Rejected:', inspectionId)
                }
            ]
        );
    };

  

    const InspectionCard = ({ inspection }: { inspection: Inspection }) => (
        <Animated.View style={{ opacity: fadeAnim }}>
            <Card style={styles.inspectionCard}>
                <View style={[styles.statusStrip, { backgroundColor: getStatusColor(inspection.approvalStatus) }]} />
                <Card.Content style={styles.cardContent}>
                    {/* Header */}
                    <View style={styles.cardHeader}>
                        <View style={styles.headerLeft}>
                            <View style={styles.inspectionNumberContainer}>
                                <MaterialCommunityIcons name="file-document" size={16} color="#4CAF50" />
                                <Text style={styles.inspectionNo}>#{inspection.inspectionno}</Text>
                            </View>
                            <Text style={styles.inspectionDate}>
                                <MaterialCommunityIcons name="calendar" size={12} color="#6B7280" />
                                {inspection.inspectiondate}
                            </Text>
                        </View>
                       
                    </View>

                    <Divider style={styles.divider} />

                    {/* Details */}
                    <View style={styles.detailsContainer}>
                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <MaterialCommunityIcons name="office-building" size={14} color="#6B7280" />
                                <Text style={styles.detailLabel}>Center:</Text>
                                <Text style={styles.detailText} numberOfLines={1}>{inspection.centername}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <MaterialCommunityIcons name="account" size={14} color="#6B7280" />
                                <Text style={styles.detailLabel}>Farmer:</Text>
                                <Text style={styles.detailText}>{inspection.farmername}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <MaterialCommunityIcons name="sprout" size={14} color="#6B7280" />
                                <Text style={styles.detailLabel}>Crop:</Text>
                                <Text style={styles.detailText}>{inspection.crop} - {inspection.variety}</Text>
                            </View>
                        </View>

                        <View style={styles.detailRow}>
                            <View style={styles.detailItem}>
                                <MaterialCommunityIcons name="weather-partly-cloudy" size={14} color="#6B7280" />
                                <Text style={styles.detailLabel}>Condition:</Text>
                                <Text style={[
                                    styles.conditionText, 
                                    { 
                                        color: inspection.cropcondition === 'Good' ? '#10B981' : 
                                               inspection.cropcondition === 'Average' ? '#F59E0B' : '#EF4444',
                                        backgroundColor: inspection.cropcondition === 'Good' ? '#10B98120' : 
                                                        inspection.cropcondition === 'Average' ? '#F59E0B20' : '#EF444420'
                                    }
                                ]}>
                                    {inspection.cropcondition}
                                </Text>
                            </View>
                        </View>

                        
                    </View>

                    {/* Actions */}
                    <View style={styles.actionContainer}>
                       
                        {inspection.approvalStatus === 'PENDING' && (
                            <View style={styles.pendingActions}>
                                <Button 
                                    mode="contained" 
                                    onPress={() => handleApprove(inspection.id)}
                                    style={styles.approveBtn}
                                    labelStyle={styles.actionButtonLabel}
                                    icon="check-circle-outline"
                                >
                                    Approve
                                </Button>
                                <Button 
                                    mode="outlined" 
                                    onPress={() => handleReject(inspection.id)}
                                    style={styles.rejectBtn}
                                    labelStyle={styles.rejectButtonLabel}
                                    icon="close-circle-outline"
                                >
                                    Reject
                                </Button>
                            </View>
                        )}
                    </View>
                     
                    {/* View Button */}
                    <Button 
                        mode="outlined" 
                        onPress={() => navigation.navigate('InspectionDetailScreen', { id: inspection.id })}
                        style={styles.viewButton}
                        labelStyle={styles.viewButtonLabel}
                        icon="eye-outline"
                    >
                        View
                    </Button>
                </Card.Content>
            </Card>
        </Animated.View>
    );

    if (loading && !refreshing) {
        return (
            <View style={styles.centerContainer}>
                <View style={styles.loadingContainer}>
                    <MaterialCommunityIcons name="loading" size={40} color="#4CAF50" />
                    <Text style={styles.loadingText}>Loading Inspections...</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView 
                style={styles.scrollContainer}
                refreshControl={
                    <RefreshControl 
                        refreshing={refreshing} 
                        onRefresh={onRefresh}
                        colors={['#4F46E5']}
                        tintColor="#4F46E5"
                    />
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {inspections.length === 0 ? (
                    <Card style={styles.emptyCard}>
                        <Card.Content style={styles.emptyContent}>
                            <MaterialCommunityIcons 
                                name="inbox-outline" 
                                size={64} 
                                color="#D1D5DB" 
                            />
                            <Text style={styles.emptyTitle}>
                                No inspections found
                            </Text>
                            <Text style={styles.emptySubtitle}>
                                All inspections will appear here once available
                            </Text>
                        </Card.Content>
                    </Card>
                ) : (
                    inspections.map((inspection) => (
                        <InspectionCard key={inspection.id} inspection={inspection} />
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#F8FAFC',
    },
    loadingContainer: {
        alignItems: 'center',
        padding: 32,
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
    },
    inspectionCard: {
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
    },
    statusStrip: {
        height: 4,
        width: '100%',
    },
    cardContent: {
        paddingVertical: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    headerLeft: {
        flex: 1,
    },
    inspectionNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    inspectionNo: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginLeft: 6,
    },
    inspectionDate: {
        fontSize: 12,
        color: '#6B7280',
        marginLeft: 2,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    divider: {
        marginVertical: 12,
        backgroundColor: '#F3F4F6',
        height: 1,
    },
    detailsContainer: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        flex: 1,
    },
    detailLabel: {
        fontSize: 13,
        color: '#6B7280',
        fontWeight: '500',
        minWidth: 60,
    },
    detailText: {
        fontSize: 13,
        color: '#374151',
        fontWeight: '400',
        flex: 1,
    },
    conditionText: {
        fontSize: 12,
        fontWeight: '600',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
        overflow: 'hidden',
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 16,
    },
    viewButton: {
        borderColor: '#6ba94bff',
        borderRadius: 8,
        borderWidth: 1.5,
    },
    viewButtonLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6ba94bff',
    },
    pendingActions: {
        flexDirection: 'row',
        gap: 8,
    },
    approveBtn: {
        backgroundColor: '#10B981',
        borderRadius: 8,
        elevation: 0,
    },
    rejectBtn: {
        borderColor: '#EF4444',
        borderWidth: 1.5,
        borderRadius: 8,
    },
    actionButtonLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: 'white',
    },
    rejectButtonLabel: {
        fontSize: 13,
        fontWeight: '600',
        color: '#EF4444',
    },
    emptyCard: {
        marginTop: 32,
        backgroundColor: 'white',
        borderStyle: 'dashed',
        borderWidth: 2,
        borderColor: '#E5E7EB',
        borderRadius: 16,
    },
    emptyContent: {
        alignItems: 'center',
        paddingVertical: 48,
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#374151',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 8,
        textAlign: 'center',
        lineHeight: 20,
    },
});

export default InspectionList;