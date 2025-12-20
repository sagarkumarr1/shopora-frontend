import axios from './axiosInstance';

// Get user addresses
const getAddresses = async () => {
    const response = await axios.get('address/');
    return response.data;
};

// Add user address
const addAddress = async (addressData: any) => {
    const response = await axios.post('address/', addressData);
    return response.data;
};

// Delete user address
const deleteAddress = async (addressId: string) => {
    const response = await axios.delete('address/' + addressId);
    return response.data;
};

const addressService = {
    getAddresses,
    addAddress,
    deleteAddress
};

export default addressService;
