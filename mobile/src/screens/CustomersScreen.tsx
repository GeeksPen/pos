import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import api from '../lib/axios';

export default function CustomersScreen() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/customers')
           .then(res => {
               setCustomers(res.data);
               setLoading(false);
           })
           .catch(err => {
               console.error(err);
               setLoading(false);
           });
    }, []);

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

    return (
        <View style={styles.container}>
            <FlatList
                data={customers}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        {item.image_path && (
                            <Image
                                source={{ uri: `${api.defaults.baseURL?.replace('/api', '')}/storage/${item.image_path}` }}
                                style={styles.image}
                            />
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={[styles.balance, { color: item.balance < 0 ? 'red' : 'green' }]}>
                                Balance: ${item.balance}
                            </Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No customers available.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    item: { backgroundColor: '#fff', padding: 15, marginVertical: 5, marginHorizontal: 10, borderRadius: 8, elevation: 1, flexDirection: 'row', alignItems: 'center' },
    image: { width: 40, height: 40, borderRadius: 20, marginRight: 15 },
    name: { fontSize: 16, fontWeight: 'bold' },
    balance: { fontSize: 14, fontWeight: 'bold', marginTop: 4 }
});
