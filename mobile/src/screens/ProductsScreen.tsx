import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import api from '../lib/axios';

export default function ProductsScreen() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/products')
           .then(res => {
               setProducts(res.data);
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
                data={products}
                keyExtractor={item => item.id.toString()}
                renderItem={({ item }) => (
                    <View style={styles.item}>
                        {item.image_path && (
                            <Image
                                source={{ uri: `${api.defaults.baseURL?.replace('/api', '')}/storage/${item.image_path}` }}
                                style={styles.image}
                            />
                        )}
                        <View style={styles.info}>
                            <Text style={styles.name}>{item.name}</Text>
                            <Text style={styles.price}>Sell: ${item.selling_price} | Buy: ${item.buying_price}</Text>
                        </View>
                    </View>
                )}
                ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 20}}>No products available.</Text>}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    item: { flexDirection: 'row', backgroundColor: '#fff', padding: 15, marginVertical: 5, marginHorizontal: 10, borderRadius: 8, elevation: 1 },
    image: { width: 50, height: 50, borderRadius: 5, marginRight: 15 },
    info: { justifyContent: 'center' },
    name: { fontSize: 16, fontWeight: 'bold' },
    price: { fontSize: 14, color: '#666' }
});
