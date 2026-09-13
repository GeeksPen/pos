import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, TouchableOpacity, Alert, Button } from 'react-native';
import { Picker } from '@react-native-picker/picker'; // You might need to install this if you want native picker
import api from '../lib/axios';

export default function POSScreen() {
    const [products, setProducts] = useState<any[]>([]);
    const [customers, setCustomers] = useState<any[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<string>('');
    const [cart, setCart] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([api.get('/products'), api.get('/customers')])
            .then(([p, c]) => {
                setProducts(p.data);
                setCustomers(c.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const addToCart = (product: any) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
    };

    const submitInvoice = async () => {
        if (cart.length === 0) return Alert.alert('Error', 'Cart is empty');
        try {
            await api.post('/invoices', {
                customer_id: selectedCustomer || null,
                type: 'sale',
                items: cart.map(i => ({ product_id: i.product.id, quantity: i.quantity, price: i.product.selling_price }))
            });
            Alert.alert('Success', 'Invoice created successfully!');
            setCart([]);
            setSelectedCustomer('');
        } catch (e) {
            Alert.alert('Error', 'Could not create invoice');
        }
    };

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.selling_price * item.quantity), 0);

    if (loading) return <View style={styles.centered}><ActivityIndicator size="large" /></View>;

    return (
        <View style={styles.container}>
            <View style={styles.productsSection}>
                <Text style={styles.header}>Products</Text>
                <FlatList
                    data={products}
                    keyExtractor={item => item.id.toString()}
                    numColumns={2}
                    renderItem={({ item }) => (
                        <TouchableOpacity style={styles.productCard} onPress={() => addToCart(item)}>
                            <Text style={styles.productName}>{item.name}</Text>
                            <Text style={styles.productPrice}>${item.selling_price}</Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            <View style={styles.cartSection}>
                <Text style={styles.header}>Cart</Text>

                <View style={{ marginBottom: 10 }}>
                    <Text>Customer:</Text>
                    <Picker
                        selectedValue={selectedCustomer}
                        onValueChange={(itemValue) => setSelectedCustomer(itemValue)}
                    >
                        <Picker.Item label="Walk-in Customer" value="" />
                        {customers.map((c) => (
                            <Picker.Item key={c.id} label={c.name} value={c.id} />
                        ))}
                    </Picker>
                </View>

                <FlatList
                    data={cart}
                    keyExtractor={item => item.product.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.cartItem}>
                            <Text>{item.product.name} x{item.quantity}</Text>
                            <Text>${(item.product.selling_price * item.quantity).toFixed(2)}</Text>
                        </View>
                    )}
                />
                <View style={styles.checkout}>
                    <Text style={styles.totalText}>Total: ${cartTotal.toFixed(2)}</Text>
                    <Button title="Submit Invoice" onPress={submitInvoice} />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    container: { flex: 1, flexDirection: 'row', backgroundColor: '#f5f5f5' },
    productsSection: { flex: 2, padding: 10 },
    cartSection: { flex: 1, backgroundColor: '#fff', padding: 10, borderLeftWidth: 1, borderColor: '#ddd' },
    header: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
    productCard: { flex: 1, backgroundColor: '#fff', padding: 15, margin: 5, borderRadius: 8, elevation: 1, alignItems: 'center' },
    productName: { fontWeight: 'bold', textAlign: 'center' },
    productPrice: { color: '#666', marginTop: 5 },
    cartItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    checkout: { borderTopWidth: 1, borderColor: '#ddd', paddingTop: 10, marginTop: 10 },
    totalText: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, textAlign: 'right' }
});
